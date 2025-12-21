
import React, { useState, useMemo, useRef, useEffect, useCallback, memo } from 'react';
import { Post, ViewState } from './types';
import MarkdownRenderer from './MarkdownRenderer';

const stripFrontmatter = (text: string) => {
  const regex = /^\uFEFF?(?:\s*\r?\n)*---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*(?:[\r\n]+|$)/;
  const match = text.match(regex);
  if (!match) return { frontmatter: '', body: text.trim() };
  return { frontmatter: match[1], body: text.slice(match[0].length).trim() };
};

const parseFrontmatter = (content: string) => {
  const { frontmatter, body } = stripFrontmatter(content);
  
  if (frontmatter) {
    const yaml = frontmatter;
    const metadata: any = {};
    const lines = yaml.split(/\r?\n/);
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const firstColon = line.indexOf(':');
      
      if (firstColon !== -1) {
        const key = line.slice(0, firstColon).trim();
        let value = line.slice(firstColon + 1).trim();
        
        // Handle multi-line values (indented lines following the key)
        if (value === '') {
          const multiLineValue: string[] = [];
          i++;
          // Collect all following indented lines until we hit a new key or empty line
          while (i < lines.length) {
            const nextLine = lines[i];
            // Stop if we hit an empty line
            if (nextLine.trim() === '') {
              break;
            }
            // Check if this is a new key (has colon and starts at beginning of line or has minimal indent)
            const nextColon = nextLine.indexOf(':');
            if (nextColon !== -1 && !nextLine.match(/^\s{4,}/)) {
              // This might be a new key, but check if it's actually indented (part of value)
              const indent = nextLine.match(/^(\s*)/)?.[1]?.length || 0;
              if (indent === 0 || indent < 2) {
                // New key, stop collecting
                break;
              }
            }
            // Collect this line (remove leading whitespace)
            if (nextLine.match(/^\s+/)) {
              multiLineValue.push(nextLine.replace(/^\s+/, ''));
            } else {
              // Not indented => treat as new key/value; stop.
              break;
            }
            i++;
          }
          if (multiLineValue.length > 0) {
            value = multiLineValue.join(' ').trim();
          }
          i--; // Adjust for the outer loop increment
        }
        
        value = value.replace(/^['"](.*)['"]$/, '$1');
        
        if (value.startsWith('[') && value.endsWith(']')) {
          metadata[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^['"](.*)['"]$/, '$1'));
        } else if (value === 'true' || value === 'True') {
          metadata[key] = true;
        } else if (value === 'false' || value === 'False') {
          metadata[key] = false;
        } else {
          metadata[key] = value;
        }
      }
      i++;
    }
    return { metadata, body };
  }
  return { metadata: {}, body: content.trim() };
};

// Isolated component for ScrollToTop to prevent parent re-renders on scroll state changes
const ScrollToTopButton = memo(({ scrollContainerRef }: { scrollContainerRef: React.RefObject<HTMLDivElement | null> }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const shown = scrollContainerRef.current.scrollTop > 400;
      if (shown !== visible) setVisible(shown);
    };
    const container = scrollContainerRef.current;
    container?.addEventListener('scroll', handleScroll, { passive: true });
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [visible]);

  if (!visible) return null;

  return (
    <button 
      onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-10 right-10 p-5 bg-red-600 text-white rounded-3xl shadow-2xl hover:bg-red-500 hover:-translate-y-2 transition-all z-50 animate-slide-up active:scale-95"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
});

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [view, setView] = useState<ViewState>('feed');
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const mainContentRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        // Dynamically discover all markdown files in posts directory using Vite's glob
        const postModules = import.meta.glob('/posts/**/*.md', { as: 'raw', eager: false });
        
        const loadedPosts: Post[] = [];
        const loadPromises = Object.entries(postModules).map(async ([path, moduleLoader]) => {
          try {
            // moduleLoader is a function that returns a promise when eager: false
            const text = typeof moduleLoader === 'function' ? await moduleLoader() : moduleLoader;
            const { metadata, body } = parseFrontmatter(text);
            if (metadata.published === false) return null;
            
            const h1Match = body.match(/^#\s+(.*)/m);
            const cleanTitle = metadata.title ? String(metadata.title).trim() : '';
            const postTitle = cleanTitle || (h1Match ? h1Match[1].trim() : '') || 'Untitled Post';
            const fileName = path.split('/').pop() || 'file.md';
            
            // Extract category from folder path: posts/category/file.md -> category
            // Path format from glob: /posts/category/file.md
            const pathParts = path.replace(/^\//, '').split('/');
            let derivedCategory = 'GENERAL';
            if (pathParts.length > 2 && pathParts[0] === 'posts') {
              // Get the folder name (category) from posts/category/file.md
              derivedCategory = pathParts[1].toUpperCase();
            }

            const finalTags = Array.isArray(metadata.tags) ? metadata.tags.map(String) : (metadata.tags ? [String(metadata.tags)] : []);

            const cleanDescription = metadata.description ? String(metadata.description).trim() : '';
            const fallbackExcerpt = stripFrontmatter(body).body
              .slice(0, 180)
              .replace(/[#*`]/g, '')
              .replace(/\s+/g, ' ')
              .trim();
            const excerpt = (cleanDescription || fallbackExcerpt) + (cleanDescription || fallbackExcerpt ? '...' : '');

            return {
              id: Math.random().toString(36).substr(2, 9),
              title: postTitle,
              slug: (cleanTitle || fileName).toLowerCase().replace(/\s+/g, '-'),
              excerpt,
              content: text, // Keep full text with frontmatter for MarkdownRenderer (it strips frontmatter itself)
              publishedAt: String(metadata.date || '2024-01-01'),
              tags: finalTags,
              author: {
                name: metadata.author || 'DevFlow Red',
                avatar: `https://ui-avatars.com/api/?name=${metadata.author || 'User'}&background=random`,
                role: 'Engineer'
              },
              coverImage: metadata.optimized_image || metadata.image || `https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000`,
              readingTime: `${Math.ceil(body.split(/\s+/).length / 200)} min read`,
              category: metadata.category?.toUpperCase() || derivedCategory,
              fileName: fileName
            } as Post;
          } catch (e) {
            console.warn(`Could not load ${path}`, e);
            return null;
          }
        });

        const results = await Promise.all(loadPromises);
        const validPosts = results.filter((p): p is Post => p !== null);
        validPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        setPosts(validPosts);
      } catch (err) {
        console.error('Error loading posts:', err);
      }
    };
    loadPosts();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Performance Optimization: Direct DOM update for scroll bar to avoid React loop stutter
  useEffect(() => {
    const handleScroll = () => {
      const container = mainContentRef.current;
      if (!container || !progressBarRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
      progressBarRef.current.style.width = `${scrolled || 0}%`;
    };
    const ref = mainContentRef.current;
    ref?.addEventListener('scroll', handleScroll, { passive: true });
    return () => ref?.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    posts.forEach(p => cats.add(p.category || 'GENERAL'));
    return Array.from(cats).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => 
    posts.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                           p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    }), [posts, search, selectedCategory]
  );

  const featuredPost = useMemo(() => filteredPosts[0] || null, [filteredPosts]);

  const scrollToTop = useCallback(() => {
    mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);


  const borderColor = isDarkMode ? 'border-slate-800' : 'border-slate-200';

  return (
    <div className={`flex h-screen overflow-hidden theme-transition ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <main className="flex-grow flex flex-col h-screen overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-red-600/10 z-50">
          <div ref={progressBarRef} className="h-full bg-red-600 transition-all duration-75" style={{ width: '0%' }} />
        </div>
        
        <header className={`h-20 ${isDarkMode ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur-md border-b ${borderColor} flex items-center justify-between px-8 z-30`}>
          <div className="flex items-center space-x-10">
            <div onClick={() => {setView('feed'); setCurrentPost(null); setSelectedCategory(null); scrollToTop();}} className="flex items-center space-x-3 cursor-pointer group">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="font-black text-sm uppercase tracking-[0.2em] hidden sm:block">DevFlow</span>
            </div>

            <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-2">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => {setSelectedCategory(cat); setView('feed'); setCurrentPost(null); scrollToTop();}}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-red-500 hover:bg-red-500/5'}`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative group hidden lg:block">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Explore knowledge..." className={`${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} border ${borderColor} rounded-2xl pl-10 pr-4 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-red-500/50 w-48 xl:w-64 transition-all`} />
              <svg className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2.5 rounded-xl border ${borderColor} ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-800'} transition-all`}>
              {isDarkMode ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg> : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>}
            </button>
          </div>
        </header>

        <div ref={mainContentRef} className="flex-grow overflow-y-auto custom-scrollbar scroll-smooth">
          {view === 'feed' && (
            <div className="max-w-6xl mx-auto px-10 py-20">
              <div className="mb-20 animate-fade-in text-center">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-none">
                  Databook <span className="text-red-600">Red.</span>
                </h1>
                <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">System logs, architectural pattern research, and modern engineering paradigms curated for the elite developer.</p>
              </div>

              {featuredPost && !selectedCategory && !search && (
                <div className="mb-20 animate-slide-up">
                  <div className={`p-10 md:p-16 rounded-[4rem] border ${borderColor} ${isDarkMode ? 'bg-slate-900/40' : 'bg-white shadow-2xl shadow-slate-200/50'} relative overflow-hidden group`}>
                    <div className="flex flex-col md:flex-row gap-12">
                      <div className="flex-grow">
                        <span className="text-red-600 font-black uppercase text-[10px] tracking-[0.3em] mb-4 block">Featured Publication</span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 hover:text-red-600 cursor-pointer transition-all leading-tight" onClick={() => {setCurrentPost(featuredPost); setView('post'); scrollToTop();}}>
                          {featuredPost.title}
                        </h2>
                        <div className="prose dark:prose-invert max-w-none line-clamp-4 opacity-70 mb-8 font-medium">
                          {featuredPost.excerpt}
                        </div>
                        <button onClick={() => {setCurrentPost(featuredPost); setView('post'); scrollToTop();}} className="px-10 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-red-500 transition-all shadow-xl shadow-red-900/20 active:scale-95">Read Full Entry</button>
                      </div>
                      <div className="md:w-1/3 flex-shrink-0">
                        <img src={featuredPost.coverImage} className="w-full h-80 object-cover rounded-[3rem] border border-red-500/10 shadow-2xl transition-transform duration-700 group-hover:scale-105" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {(featuredPost && !selectedCategory && !search ? filteredPosts.slice(1) : filteredPosts).map(p => (
                  <article key={p.id} onClick={() => {setCurrentPost(p); setView('post'); scrollToTop();}} className={`group flex flex-col ${isDarkMode ? 'bg-slate-900/40' : 'bg-white shadow-xl'} border ${borderColor} rounded-[2.5rem] overflow-hidden hover:border-red-500/30 transition-all duration-500 cursor-pointer h-full`}>
                    <div className="aspect-[16/10] relative overflow-hidden"><img src={p.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80" /></div>
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="flex space-x-2 mb-4">
                        <span className="text-[9px] font-black uppercase tracking-widest text-red-600 bg-red-600/10 px-3 py-1 rounded-lg">{p.category}</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-4 group-hover:text-red-600 transition-colors leading-tight">{p.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 line-clamp-3 leading-relaxed flex-grow">{p.excerpt}</p>
                      <div className={`pt-6 border-t ${borderColor} flex justify-between items-center text-[9px] font-black uppercase text-slate-500 tracking-widest`}>
                        <span>{p.publishedAt}</span>
                        <span>{p.readingTime}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              
              {filteredPosts.length === 0 && (
                <div className="text-center py-40 border border-dashed border-slate-300 dark:border-slate-800 rounded-[3rem]">
                  <p className="text-slate-500 font-bold uppercase tracking-[0.3em]">Nothing found in the archives</p>
                </div>
              )}
            </div>
          )}

          {view === 'post' && currentPost && (
            <div className="animate-fade-in">
              <div className="h-[42vh] sm:h-[50vh] relative overflow-hidden">
                <img src={currentPost.coverImage} className="w-full h-full object-cover opacity-50 scale-105" />
                <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-slate-950 via-slate-950/40' : 'from-slate-50 via-slate-50/40'} to-transparent`} />
                <div className={`absolute inset-0 flex items-end sm:items-center justify-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <div className="max-w-4xl px-4 sm:px-8 w-full text-center pb-6 sm:pb-0">
                    <span className={`inline-block px-3 py-1 ${isDarkMode ? 'bg-red-600/20 border-red-500/30 text-red-100' : 'bg-red-600/10 border-red-500/20 text-red-700'} border rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4`}>
                      {currentPost.category}
                    </span>
                    <h1 className="text-2xl sm:text-4xl md:text-6xl font-black leading-tight tracking-tighter mb-5 drop-shadow-sm break-words">
                      {currentPost.title}
                    </h1>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                      <img src={currentPost.author.avatar} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 ${isDarkMode ? 'border-red-600/30' : 'border-red-600/20'} shadow-2xl`} />
                      <div className="text-center sm:text-left">
                        <p className="text-sm sm:text-base font-bold">{currentPost.author.name}</p>
                        <p className={`text-[10px] ${isDarkMode ? 'text-red-100' : 'text-red-700'} uppercase font-black tracking-widest opacity-90`}>
                          {currentPost.publishedAt} • {currentPost.readingTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="max-w-6xl mx-auto px-6 md:px-10 pb-32 flex flex-col lg:flex-row gap-16">
                <div className="flex-grow">
                  <div className={`${isDarkMode ? 'bg-slate-900/40' : 'bg-white'} backdrop-blur-md p-6 md:p-10 rounded-2xl border ${borderColor} shadow-2xl relative -mt-16 sm:-mt-24`}>
                    <MarkdownRenderer content={currentPost.content} />
                  </div>
                  <div className="flex justify-center mt-20">
                    <button onClick={() => {setView('feed'); setCurrentPost(null); scrollToTop();}} className="px-12 py-5 bg-black dark:bg-white dark:text-black text-white rounded-3xl font-black uppercase text-[12px] tracking-widest hover:scale-105 transition-all shadow-2xl active:scale-95">Return to Library</button>
                  </div>
                </div>
                
                <aside className="lg:w-80 h-fit lg:sticky lg:top-32 hidden lg:block -mt-10">
                   <div className={`p-6 rounded-2xl border ${borderColor} ${isDarkMode ? 'bg-slate-900/40' : 'bg-white shadow-xl'}`}>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-8 border-b border-red-500/10 pb-4">Metadata</h4>
                      <div className="space-y-6">
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-500 mb-2">Category</p>
                          <p className="font-bold text-sm">{currentPost.category}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-500 mb-2">Tags</p>
                          <div className="flex flex-wrap gap-2">
                            {currentPost.tags.map(t => (
                              <span key={t} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold">{t}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-500 mb-2">Internal Index</p>
                          <p className="font-mono text-[10px] text-slate-400 break-all">{currentPost.fileName || 'buffer.md'}</p>
                        </div>
                      </div>
                   </div>
                </aside>
              </div>
            </div>
          )}

        </div>
      </main>

      <ScrollToTopButton scrollContainerRef={mainContentRef} />
    </div>
  );
};

export default App;
