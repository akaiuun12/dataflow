
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Post, ViewState } from './types';
import Editor from './Editor';
import MarkdownRenderer from './MarkdownRenderer';

// Enhanced Frontmatter Parser
const parseFrontmatter = (content: string) => {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    const yaml = fmMatch[1];
    const body = content.slice(fmMatch[0].length).trim();
    const metadata: any = {};
    
    yaml.split('\n').forEach(line => {
      const firstColon = line.indexOf(':');
      if (firstColon !== -1) {
        const key = line.slice(0, firstColon).trim();
        let value = line.slice(firstColon + 1).trim();
        
        // Clean up quotes and brackets
        value = value.replace(/^['"](.*)['"]$/, '$1');
        if (value.startsWith('[') && value.endsWith(']')) {
          metadata[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^['"](.*)['"]$/, '$1'));
        } else {
          metadata[key] = value;
        }
      }
    });
    return { metadata, body };
  }
  return { metadata: {}, body: content };
};

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [view, setView] = useState<ViewState>('feed');
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [search, setSearch] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync theme with body for global background
  useEffect(() => {
    document.body.className = isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  }, [isDarkMode]);

  // Sync Document Title with Post Title
  useEffect(() => {
    if (view === 'post' && currentPost) {
      document.title = `${currentPost.title} — DevFlow Red`;
    } else if (view === 'editor') {
      document.title = 'Editing Post — DevFlow Red';
    } else {
      document.title = 'DevFlow Red — Tech Explorer';
    }
  }, [view, currentPost]);

  // Grouping posts into virtual folder tree
  const folderTree = useMemo(() => {
    const tree: Record<string, Post[]> = {};
    posts.forEach(p => {
      const category = p.category || 'uncategorized';
      if (!tree[category]) tree[category] = [];
      tree[category].push(p);
    });
    return tree;
  }, [posts]);

  const filteredPosts = useMemo(() => 
    posts.filter(p => 
      p.title.toLowerCase().includes(search.toLowerCase()) || 
      (p.tags && p.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
    ), [posts, search]
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawContent = event.target?.result as string;
        const { metadata, body } = parseFrontmatter(rawContent);

        const postTitle = metadata.title || file.name.replace('.md', '').split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        const newPost: Post = {
          id: Math.random().toString(36).substr(2, 9),
          title: postTitle,
          slug: (metadata.title || file.name).toLowerCase().replace(/\s+/g, '-'),
          excerpt: metadata.description || body.slice(0, 150).replace(/[#*`]/g, '') + '...',
          content: body,
          publishedAt: metadata.date || new Date().toISOString().split('T')[0],
          tags: Array.isArray(metadata.tags) ? metadata.tags : (metadata.tags ? [metadata.tags] : []),
          author: {
            name: metadata.author || 'DevFlow User',
            avatar: `https://ui-avatars.com/api/?name=${metadata.author || 'User'}&background=random`,
            role: 'Contributor'
          },
          coverImage: metadata.optimized_image || metadata.image || `https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000`,
          readingTime: `${Math.ceil(body.split(/\s+/).length / 200)} min read`,
          category: metadata.category || 'posts',
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
    const isNew = !currentPost;
    const newPost: Post = {
      id: currentPost?.id || Math.random().toString(36).substr(2, 9),
      slug: data.title?.toLowerCase().replace(/\s+/g, '-') || 'untitled',
      content: data.content || '',
      title: data.title || 'Untitled',
      excerpt: data.excerpt || data.content?.slice(0, 150) + '...' || '',
      tags: data.tags || [],
      publishedAt: data.publishedAt || new Date().toISOString().split('T')[0],
      readingTime: data.readingTime || '1 min read',
      author: currentPost?.author || {
        name: 'DevFlow User',
        avatar: 'https://ui-avatars.com/api/?name=User',
        role: 'Tech Enthusiast'
      },
      coverImage: currentPost?.coverImage || `https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=1000`,
      category: currentPost?.category || 'posts',
      fileName: currentPost?.fileName || `${data.title?.toLowerCase().replace(/\s+/g, '-')}.md`
    };

    if (isNew) {
      setPosts([newPost, ...posts]);
    } else {
      setPosts(posts.map(p => p.id === currentPost.id ? newPost : p));
    }
    setView('post');
    setCurrentPost(newPost);
  };

  const deletePost = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this file permanently?')) {
      setPosts(prev => prev.filter(p => p.id !== id));
      if (currentPost?.id === id) {
        setView('feed');
        setCurrentPost(null);
      }
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Dynamic colors
  const bgColor = isDarkMode ? 'bg-[#020617]' : 'bg-slate-50';
  const sidebarColor = isDarkMode ? 'bg-[#0f172a]/40' : 'bg-white shadow-xl';
  const borderColor = isDarkMode ? 'border-white/5' : 'border-slate-200';
  const textColor = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const mutedTextColor = isDarkMode ? 'text-slate-500' : 'text-slate-400';
  const headerColor = isDarkMode ? 'bg-[#020617]' : 'bg-white shadow-sm';

  return (
    <div className={`flex h-screen ${bgColor} ${textColor} overflow-hidden font-sans theme-transition`}>
      <input 
        type="file" 
        accept=".md" 
        multiple
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
      />

      {/* Explorer Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-0'} flex-shrink-0 ${sidebarColor} backdrop-blur-3xl border-r ${borderColor} flex flex-col transition-all duration-300 overflow-hidden`}>
        <div className={`p-6 border-b ${borderColor} flex items-center justify-between`}>
          <div 
            onClick={() => { setView('feed'); setCurrentPost(null); }}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20 active:scale-95 transition">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className={`font-bold tracking-tight text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>EXPLORER</span>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 hover:bg-red-500/10 rounded-md text-slate-500 hover:text-red-500 transition"
            title="Upload Markdown Files"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
          {Object.entries(folderTree).sort(([a], [b]) => a.localeCompare(b)).map(([category, folderPosts]) => (
            <div key={category} className="mb-4">
              <div className={`flex items-center px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] ${mutedTextColor} group cursor-default`}>
                <svg className="w-4 h-4 mr-2 text-red-500/50" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
                {category}
              </div>
              <ul className="space-y-1">
                {folderPosts.map(post => (
                  <li 
                    key={post.id}
                    onClick={() => { setCurrentPost(post); setView('post'); }}
                    className={`group relative flex items-center px-4 py-2.5 rounded-xl cursor-pointer text-sm transition-all border ${
                      currentPost?.id === post.id 
                      ? 'bg-red-600/10 text-red-600 border-red-500/20 shadow-[0_0_15px_rgba(220,38,38,0.05)]' 
                      : `${isDarkMode ? 'text-slate-400 hover:text-slate-100 hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-red-50'} border-transparent`
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md overflow-hidden flex-shrink-0 mr-3 border border-red-500/10 shadow-sm">
                      <img src={post.coverImage} className="w-full h-full object-cover" alt="" />
                    </div>
                    <span className="truncate flex-grow font-medium text-[13px]">{post.title}</span>
                    <button 
                      onClick={(e) => deletePost(e, post.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition ml-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className={`w-16 h-16 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'} rounded-full flex items-center justify-center mb-4 border ${borderColor}`}>
                 <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className={`${mutedTextColor} text-xs font-medium uppercase tracking-widest leading-relaxed`}>
                Virtual Library Empty.<br/>Upload Markdown to start.
              </p>
            </div>
          )}
        </div>

        <div className={`p-4 border-t ${borderColor} ${isDarkMode ? 'bg-[#0f172a]/40' : 'bg-slate-50'}`}>
           <button 
            onClick={() => { setView('editor'); setCurrentPost(null); }}
            className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-red-500 transition active:scale-[0.98] shadow-lg shadow-red-900/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            <span>NEW ARTICLE</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        <header className={`h-16 ${headerColor} border-b ${borderColor} flex items-center justify-between px-8 flex-shrink-0 z-10 theme-transition`}>
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className={`p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <nav className={`flex items-center space-x-3 text-[11px] font-bold uppercase tracking-[0.2em] ${mutedTextColor}`}>
              <span className="hover:text-red-500 cursor-pointer transition" onClick={() => {setView('feed'); setCurrentPost(null);}}>DevFlow Red</span>
              <span className="opacity-30">/</span>
              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-700'}>
                {view === 'feed' ? 'posts' : (view === 'editor' ? 'editor' : (currentPost?.category || 'posts'))}
              </span>
              {currentPost && (
                <>
                  <span className="opacity-30">/</span>
                  <span className="text-red-500 truncate max-w-[200px]">{currentPost.title}</span>
                </>
              )}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative group hidden lg:block">
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Global Search..."
                className={`${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-100'} border ${borderColor} rounded-xl pl-10 pr-4 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-red-500/50 w-64 transition-all placeholder-slate-600`}
              />
              <svg className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <button 
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border ${borderColor} ${isDarkMode ? 'bg-slate-900 text-yellow-400' : 'bg-slate-100 text-slate-800'} hover:scale-105 active:scale-95 transition shadow-sm`}
            >
              {isDarkMode ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              )}
            </button>
          </div>
        </header>

        <div className={`flex-grow overflow-y-auto custom-scrollbar ${isDarkMode ? 'bg-slate-950/20' : 'bg-slate-50'}`}>
          {view === 'feed' && (
            <div className="max-w-6xl mx-auto px-10 py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="mb-20 text-center lg:text-left">
                <h1 className={`text-6xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-6 leading-none`}>
                  Technical <span className="text-red-600">Red.</span>
                </h1>
                <p className={`text-xl ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} max-w-2xl leading-relaxed`}>
                  A curated workspace for engineering notes, research, and technical walkthroughs.
                </p>
              </div>

              {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {filteredPosts.map(post => (
                    <article 
                      key={post.id}
                      onClick={() => { setCurrentPost(post); setView('post'); }}
                      className={`group flex flex-col ${isDarkMode ? 'bg-slate-900/20' : 'bg-white shadow-xl'} border ${borderColor} rounded-[2rem] overflow-hidden hover:border-red-500/30 transition-all duration-500 cursor-pointer shadow-2xl shadow-black/40`}
                    >
                      <div className="aspect-[16/9] relative overflow-hidden">
                        <img src={post.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-60 group-hover:opacity-100" alt={post.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
                        <div className="absolute top-6 left-6">
                           <span className="px-4 py-1.5 bg-red-600/20 backdrop-blur-xl border border-red-500/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                            {post.category || 'Post'}
                          </span>
                        </div>
                      </div>
                      <div className="p-10">
                        <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4 group-hover:text-red-600 transition-colors leading-tight tracking-tight`}>
                          {post.title}
                        </h3>
                        <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-sm leading-relaxed mb-8 line-clamp-2 font-medium`}>{post.excerpt}</p>
                        <div className={`flex items-center justify-between pt-8 border-t ${borderColor}`}>
                           <div className="flex items-center space-x-3">
                            <img src={post.author.avatar} className="w-10 h-10 rounded-xl border border-red-500/10" alt={post.author.name} />
                            <div>
                                <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{post.author.name}</p>
                                <p className="text-[10px] text-red-500/70 uppercase font-black tracking-widest">{post.publishedAt}</p>
                            </div>
                          </div>
                          <div className={`text-[10px] font-black uppercase tracking-widest ${mutedTextColor}`}>{post.readingTime}</div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-40 ${isDarkMode ? 'bg-slate-900/10' : 'bg-white'} border border-dashed ${borderColor} rounded-[3rem]`}>
                   <p className={`${mutedTextColor} font-bold uppercase tracking-[0.3em] mb-4`}>Workspace Empty</p>
                   <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-600'} text-sm`}>Drag and drop Markdown files into the explorer to begin.</p>
                </div>
              )}
            </div>
          )}

          {view === 'post' && currentPost && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div className="h-[45vh] relative">
                <img src={currentPost.coverImage} className="w-full h-full object-cover opacity-25" alt="" />
                <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-[#020617] via-[#020617]/40' : 'from-slate-50 via-slate-50/40'} to-transparent`} />
                <div className="absolute inset-0 flex items-end justify-center pb-20">
                   <div className="max-w-4xl px-10 w-full">
                      <div className="flex space-x-3 mb-8">
                        {currentPost.tags.map(t => <span key={t} className={`px-4 py-1.5 ${isDarkMode ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100'} border text-red-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em]`}>{t}</span>)}
                      </div>
                      <h1 className={`text-5xl md:text-7xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} leading-none tracking-tighter mb-10`}>
                        {currentPost.title}
                      </h1>
                      <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-4">
                          <img src={currentPost.author.avatar} className="w-14 h-14 rounded-2xl border-2 border-red-500/20 shadow-2xl" alt={currentPost.author.name} />
                          <div>
                            <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} leading-tight`}>{currentPost.author.name}</p>
                            <p className="text-[11px] text-red-600 uppercase font-black tracking-widest mt-0.5">{currentPost.author.role}</p>
                          </div>
                        </div>
                        <div className="h-10 w-px bg-red-500/20" />
                        <div className={`text-[12px] font-bold ${mutedTextColor} uppercase tracking-widest leading-loose`}>
                          {currentPost.publishedAt} <br/> {currentPost.readingTime}
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              <div className="max-w-4xl mx-auto px-10 pb-32">
                <div className={`${isDarkMode ? 'bg-slate-900/20' : 'bg-white'} backdrop-blur-md p-10 md:p-20 rounded-[3rem] border ${borderColor} shadow-2xl relative -mt-10 overflow-hidden`}>
                  <div className="absolute top-0 right-0 p-8">
                    <button onClick={() => setView('editor')} className={`p-3 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'} hover:bg-red-600 rounded-2xl text-slate-400 hover:text-white transition group border ${borderColor} shadow-xl`}>
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                  </div>
                  <MarkdownRenderer content={currentPost.content} />
                </div>
                
                <div className={`mt-20 flex flex-col md:flex-row justify-between items-center ${isDarkMode ? 'bg-slate-900/10' : 'bg-white'} p-10 rounded-[2.5rem] border ${borderColor} gap-8 shadow-sm`}>
                  <div className="text-center md:text-left">
                    <p className="text-red-600 font-bold uppercase tracking-[0.3em] text-[10px] mb-2">VIRTUAL FILE LOCATION</p>
                    <p className={`font-mono text-sm ${isDarkMode ? 'text-slate-300 bg-slate-950' : 'text-slate-800 bg-slate-100'} px-4 py-2 rounded-lg border ${borderColor}`}>/posts/{currentPost.category}/{currentPost.fileName || 'internal_storage'}</p>
                  </div>
                  <button onClick={() => setView('feed')} className="px-10 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-500 transition shadow-xl active:scale-[0.98] tracking-tight">Return to Project Feed</button>
                </div>
              </div>
            </div>
          )}

          {view === 'editor' && (
            <Editor 
              initialPost={currentPost || undefined}
              onCancel={() => { setView('feed'); setCurrentPost(null); }}
              onSave={handleSavePost}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
