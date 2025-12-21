
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Post, ViewState } from './types';
import Editor from './Editor';
import MarkdownRenderer from './MarkdownRenderer';

const parseFrontmatter = (content: string) => {
  const regex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*/;
  const match = content.match(regex);
  
  if (match) {
    const yaml = match[1];
    const body = content.slice(match[0].length).trim();
    const metadata: any = {};
    
    yaml.split(/\r?\n/).forEach(line => {
      const firstColon = line.indexOf(':');
      if (firstColon !== -1) {
        const key = line.slice(0, firstColon).trim();
        let value = line.slice(firstColon + 1).trim();
        value = value.replace(/^['"](.*)['"]$/, '$1');
        
        // Fix: Avoid assigning boolean to the string-typed variable 'value'
        if (value.startsWith('[') && value.endsWith(']')) {
          metadata[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^['"](.*)['"]$/, '$1'));
        } else if (value === 'true') {
          metadata[key] = true;
        } else if (value === 'false') {
          metadata[key] = false;
        } else {
          metadata[key] = value;
        }
      }
    });
    return { metadata, body };
  }
  return { metadata: {}, body: content.trim() };
};

const BUNDLED_POST_PATHS = [
  'posts/2024-07-16-ensemble.md',
  'posts/2024-08-15-svm.md',
  'posts/sql/2023-07-10-SQL2_ddl_dml_dcl.md',
  'posts/sql/2023-07-17-SQL3_select_where_operators.md',
  'posts/sql/2023-09-18-SQL4_agg_group.md',
  'posts/sql/2023-10-02-SQL5_sort.md',
  'posts/sql/2023-10-04-SQL6_null.md',
  'posts/sql/2024-06-28-SQL201_style_guide.md',
  'posts/sql/2024-08-23-SQL201_impala.md',
  'posts/sql/2025-01-23-SQL201_join.md',
  'posts/sql/2025-02-02-SQL201_set.md',
  'posts/sql/2025-02-09-SQL201_cte.md',
  'posts/sql/2025-02-09-SQL201_window_function.md'
];

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [view, setView] = useState<ViewState>('feed');
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [search, setSearch] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadBundledPosts = async () => {
      const loadedPosts: Post[] = [];
      for (const path of BUNDLED_POST_PATHS) {
        try {
          const response = await fetch(`/${path}`);
          if (!response.ok) continue;
          const text = await response.text();
          const { metadata, body } = parseFrontmatter(text);
          if (metadata.published === false) continue;
          const h1Match = body.match(/^#\s+(.*)/m);
          const postTitle = metadata.title || (h1Match ? h1Match[1] : null) || 'Untitled Post';
          const fileName = path.split('/').pop() || 'file.md';
          const finalTags = Array.isArray(metadata.tags) ? metadata.tags.map(String) : (metadata.tags ? [String(metadata.tags)] : []);

          loadedPosts.push({
            id: Math.random().toString(36).substr(2, 9),
            title: postTitle,
            slug: (metadata.title || fileName).toLowerCase().replace(/\s+/g, '-'),
            excerpt: metadata.description || body.slice(0, 150).replace(/[#*`]/g, '').trim() + '...',
            content: text,
            publishedAt: String(metadata.date || '2024-01-01'),
            tags: finalTags,
            author: {
              name: metadata.author || 'DevFlow Red',
              avatar: `https://ui-avatars.com/api/?name=${metadata.author || 'User'}&background=random`,
              role: 'Engineer'
            },
            coverImage: metadata.optimized_image || metadata.image || `https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000`,
            readingTime: `${Math.ceil(body.split(/\s+/).length / 200)} min read`,
            category: metadata.category || (path.includes('/sql/') ? 'SQL' : 'ML'),
            fileName: fileName
          });
        } catch (e) {
          console.warn(`Could not load ${path}`);
        }
      }
      loadedPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      setPosts(loadedPosts);
    };
    loadBundledPosts();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const handleScroll = () => {
      if (!mainContentRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = mainContentRef.current;
      const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(scrolled || 0);
      setShowScrollTop(scrollTop > 400);
    };
    const ref = mainContentRef.current;
    ref?.addEventListener('scroll', handleScroll);
    return () => ref?.removeEventListener('scroll', handleScroll);
  }, [view, currentPost]);

  const folderTree = useMemo(() => {
    const tree: Record<string, Post[]> = {};
    posts.forEach(p => {
      const cat = p.category || 'General';
      if (!tree[cat]) tree[cat] = [];
      tree[cat].push(p);
    });
    return tree;
  }, [posts]);

  const filteredPosts = useMemo(() => 
    posts.filter(p => 
      p.title.toLowerCase().includes(search.toLowerCase()) || 
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    ), [posts, search]
  );

  const toc = useMemo(() => {
    if (!currentPost) return [];
    const { body } = parseFrontmatter(currentPost.content);
    return body.split('\n').filter(l => l.match(/^(#{1,3})\s+(.*)/)).map(line => {
      const match = line.match(/^(#{1,3})\s+(.*)/)!;
      const text = match[2].trim();
      return {
        level: match[1].length,
        text,
        id: text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
      };
    });
  }, [currentPost]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const { metadata, body } = parseFrontmatter(text);
        const h1 = body.match(/^#\s+(.*)/m);
        const newPost: Post = {
          id: Math.random().toString(36).substr(2, 9),
          title: metadata.title || (h1 ? h1[1] : 'Untitled'),
          slug: file.name,
          excerpt: body.slice(0, 150) + '...',
          content: text,
          publishedAt: metadata.date || new Date().toISOString().split('T')[0],
          tags: metadata.tags || [],
          author: { name: 'User', avatar: 'https://ui-avatars.com/api/?name=User', role: 'Contributor' },
          coverImage: metadata.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
          readingTime: '5 min read',
          category: 'Uploaded',
          fileName: file.name
        };
        setPosts(prev => [newPost, ...prev]);
        setCurrentPost(newPost);
        setView('post');
      };
      reader.readAsText(file);
    });
  };

  const handleSavePost = (data: Partial<Post>) => {
    const p: Post = {
      id: currentPost?.id || Math.random().toString(36).substr(2, 9),
      title: data.title || 'Untitled',
      slug: data.title?.toLowerCase().replace(/\s+/g, '-') || 'post',
      excerpt: data.content?.slice(0, 150) + '...',
      content: data.content || '',
      publishedAt: data.publishedAt || new Date().toISOString().split('T')[0],
      tags: data.tags || [],
      author: currentPost?.author || { name: 'DevFlow User', avatar: 'https://ui-avatars.com/api/?name=User', role: 'Engineer' },
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
      readingTime: data.readingTime || '1 min read',
      category: 'Studio',
      fileName: 'studio.md'
    };
    if (currentPost) setPosts(posts.map(x => x.id === p.id ? p : x));
    else setPosts([p, ...posts]);
    setCurrentPost(p);
    setView('post');
  };

  // Fix: Added missing scrollToTop function
  const scrollToTop = () => {
    mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const borderColor = isDarkMode ? 'border-slate-800' : 'border-slate-200';

  return (
    <div className={`flex h-screen overflow-hidden theme-transition ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <input type="file" accept=".md" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} />

      <aside className={`${isSidebarOpen ? 'w-80' : 'w-0'} flex-shrink-0 ${isDarkMode ? 'bg-slate-900' : 'bg-white shadow-xl'} border-r ${borderColor} flex flex-col transition-all duration-300 overflow-hidden z-20`}>
        <div className={`p-6 border-b ${borderColor} flex items-center justify-between`}>
          <div onClick={() => {setView('feed'); setCurrentPost(null);}} className="flex items-center space-x-3 cursor-pointer group">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20 active:scale-95 transition">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="font-black text-[11px] uppercase tracking-[0.2em]">Repository</span>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="p-1.5 hover:bg-red-500/10 rounded-md text-slate-500 hover:text-red-500 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
        <div className="flex-grow overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
          {Object.entries(folderTree).map(([cat, ps]) => (
            <div key={cat} className="mb-4">
              <div className="flex items-center px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 opacity-60">
                <svg className="w-4 h-4 mr-2 text-red-500/40" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                {cat}
              </div>
              <ul className="space-y-1">
                {ps.map(p => (
                  <li key={p.id} onClick={() => {setCurrentPost(p); setView('post');}} className={`group flex items-center px-4 py-2.5 rounded-xl cursor-pointer text-sm transition-all border ${currentPost?.id === p.id ? 'bg-red-600/10 text-red-600 border-red-500/20' : 'hover:bg-red-500/5 border-transparent'}`}>
                    <div className="w-6 h-6 rounded-md overflow-hidden flex-shrink-0 mr-3 border border-red-500/10"><img src={p.coverImage} className="w-full h-full object-cover" /></div>
                    <span className="truncate flex-grow font-semibold text-[13px] tracking-tight">{p.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={`p-4 border-t ${borderColor}`}>
          <button onClick={() => {setView('editor'); setCurrentPost(null);}} className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 transition shadow-lg shadow-red-900/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            <span>Draft Article</span>
          </button>
        </div>
      </aside>

      <main className="flex-grow flex flex-col h-screen overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-red-600/10 z-50">
          <div className="h-full bg-red-600 transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
        </div>
        <header className={`h-16 ${isDarkMode ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur-md border-b ${borderColor} flex items-center justify-between px-8 z-10`}>
          <div className="flex items-center space-x-6">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            <nav className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <span className="hover:text-red-500 cursor-pointer" onClick={() => setView('feed')}>Archive</span>
              <span className="opacity-30">/</span>
              <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{view === 'feed' ? 'Overview' : (view === 'editor' ? 'Studio' : 'Post')}</span>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative group hidden lg:block">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search index..." className={`${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} border ${borderColor} rounded-xl pl-10 pr-4 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-red-500/50 w-64 transition-all`} />
              <svg className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2.5 rounded-xl border ${borderColor} ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-800'} transition-all`}>
              {isDarkMode ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg> : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>}
            </button>
          </div>
        </header>

        <div ref={mainContentRef} className="flex-grow overflow-y-auto custom-scrollbar scroll-smooth">
          {view === 'feed' && (
            <div className="max-w-6xl mx-auto px-10 py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-6xl font-black tracking-tighter mb-6">Technical <span className="text-red-600">Journal.</span></h1>
              <p className="text-xl text-slate-500 max-w-2xl leading-relaxed mb-20">Deep architectural insights and technical documentation.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {filteredPosts.map(p => (
                  <article key={p.id} onClick={() => {setCurrentPost(p); setView('post');}} className={`group flex flex-col ${isDarkMode ? 'bg-slate-900/40' : 'bg-white shadow-xl'} border ${borderColor} rounded-[2rem] overflow-hidden hover:border-red-500/30 transition-all duration-500 cursor-pointer`}>
                    <div className="aspect-[16/9] relative overflow-hidden"><img src={p.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-80" /></div>
                    <div className="p-10"><h3 className="text-3xl font-bold mb-4 group-hover:text-red-600 transition-colors">{p.title}</h3><p className="text-slate-500 text-sm mb-8 line-clamp-2">{p.excerpt}</p><div className={`pt-8 border-t ${borderColor} flex justify-between items-center text-[10px] font-black uppercase text-slate-500`}><span>{p.publishedAt}</span><span>{p.readingTime}</span></div></div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {view === 'post' && currentPost && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div className="h-[45vh] relative">
                <img src={currentPost.coverImage} className="w-full h-full object-cover opacity-30" />
                <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-slate-950' : 'from-slate-50'} to-transparent`} />
                <div className="absolute inset-0 flex items-end justify-center pb-20">
                  <div className="max-w-4xl px-10 w-full">
                    <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tighter mb-10">{currentPost.title}</h1>
                    <div className="flex items-center space-x-6">
                      <img src={currentPost.author.avatar} className="w-14 h-14 rounded-2xl shadow-xl" />
                      <div><p className="text-lg font-bold">{currentPost.author.name}</p><p className="text-[11px] text-red-600 uppercase font-black tracking-widest">{currentPost.publishedAt} • {currentPost.readingTime}</p></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="max-w-7xl mx-auto px-10 pb-32 flex flex-col lg:flex-row gap-12 relative">
                <div className="flex-grow max-w-4xl">
                  <div className={`${isDarkMode ? 'bg-slate-900/40' : 'bg-white'} backdrop-blur-md p-10 md:p-20 rounded-[3rem] border ${borderColor} shadow-2xl relative -mt-10`}><MarkdownRenderer content={currentPost.content} /></div>
                  <button onClick={() => setView('feed')} className="mt-12 px-10 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-red-500 transition shadow-xl">Back to Feed</button>
                </div>
                {toc.length > 0 && (
                  <aside className="lg:w-72 lg:sticky lg:top-24 h-fit hidden lg:block">
                    <div className={`p-8 rounded-[2.5rem] border ${borderColor} ${isDarkMode ? 'bg-slate-900/40' : 'bg-white shadow-xl'}`}>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-6">Contents</h4>
                      <nav className="space-y-4">
                        {toc.map((it, i) => (
                          <a key={i} href={`#${it.id}`} className={`block text-[13px] font-bold transition-all hover:text-red-600 ${it.level === 1 ? '' : 'pl-4 opacity-70'}`}>{it.text}</a>
                        ))}
                      </nav>
                    </div>
                  </aside>
                )}
              </div>
            </div>
          )}

          {view === 'editor' && <Editor initialPost={currentPost || undefined} onCancel={() => setView('feed')} onSave={handleSavePost} />}
        </div>
      </main>

      {showScrollTop && (
        <button onClick={scrollToTop} className="fixed bottom-8 right-8 p-4 bg-red-600 text-white rounded-2xl shadow-2xl hover:bg-red-500 hover:-translate-y-1 transition-all z-50">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
        </button>
      )}
    </div>
  );
};

export default App;
