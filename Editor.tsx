import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import MarkdownRenderer from './MarkdownRenderer';
import { Post } from './types';

interface EditorProps {
  onSave: (post: Partial<Post>) => void;
  onCancel: () => void;
  initialPost?: Post;
}

const Editor: React.FC<EditorProps> = ({ onSave, onCancel, initialPost }) => {
  const [title, setTitle] = useState(initialPost?.title || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [tags, setTags] = useState(initialPost?.tags.join(', ') || '');
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const handleAiDraft = async () => {
    if (!title) return alert('Enter a title/topic first for the AI to work with.');
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Write a professional, deep technical blog post in Markdown format about "${title}". 
        Include:
        - A high-level introduction
        - Sub-sections with headers (##)
        - Relevant code examples if applicable
        - A summary conclusion
        Focus on architectural clarity and best practices.`,
      });
      if (response.text) setContent(response.text);
    } catch (err) {
      console.error(err);
      alert('AI Generation failed. Check your API key or connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiRefine = async () => {
    if (!content) return alert('Write some content first to refine.');
    setIsRefining(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `As a senior technical editor, refine the following technical content to be more precise, grammatically correct, and engaging, while preserving its Markdown structure. CONTENT:\n\n${content}`,
      });
      if (response.text) setContent(response.text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerateCover = async () => {
    if (!title) return alert('Enter a title first for the AI image generator.');
    setIsGeneratingImage(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `A cinematic, abstract, high-tech background image for a blog post titled "${title}". Use deep obsidian, slate, and vibrant red accents. Futuristic architectural style, clean lines, no text.`,
            },
          ],
        },
        config: {
          imageConfig: { aspectRatio: "16:9" }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setCoverImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) {
      console.error(err);
      alert('Image generation failed.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSave = () => {
    if (!title || !content) return alert('Title and Content are required.');
    onSave({
      title,
      content,
      coverImage: coverImage || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      publishedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      readingTime: `${Math.ceil(content.split(/\s+/).length / 200)} min read`
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter">
            {initialPost ? 'Update Entry' : 'New Publication'}
          </h2>
          <p className="text-red-600/80 font-black uppercase tracking-[0.3em] text-[10px] mt-2 flex items-center">
            <span className="w-2 h-2 rounded-full bg-red-600 mr-2 shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse"></span>
            DevFlow Engineering Studio
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onCancel} className="px-6 py-3 rounded-2xl bg-black/5 dark:bg-white/5 text-slate-500 hover:text-red-600 transition font-black uppercase text-[11px] tracking-widest">Discard</button>
          <button onClick={handleSave} className="px-10 py-3 rounded-2xl bg-red-600 text-white font-black uppercase text-[11px] tracking-widest hover:bg-red-500 shadow-xl shadow-red-900/20 transition active:scale-95">Publish</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent border-b-2 border-red-500/10 px-0 py-6 text-4xl font-black focus:outline-none focus:border-red-600 transition placeholder:opacity-20 tracking-tight"
            placeholder="Document Title..."
          />

          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
            <div className="flex space-x-8">
              <button 
                onClick={() => setActiveTab('write')}
                className={`text-[10px] font-black uppercase tracking-[0.3em] pb-2 transition border-b-2 ${activeTab === 'write' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-400'}`}
              >
                Source
              </button>
              <button 
                onClick={() => setActiveTab('preview')}
                className={`text-[10px] font-black uppercase tracking-[0.3em] pb-2 transition border-b-2 ${activeTab === 'preview' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-400'}`}
              >
                Visual
              </button>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handleAiRefine}
                disabled={isRefining || !content}
                className="flex items-center space-x-2 bg-slate-800/10 hover:bg-slate-800/20 dark:bg-white/5 dark:hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition disabled:opacity-30"
              >
                <svg className={`w-3.5 h-3.5 ${isRefining ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 00.547 1.022l1.318 1.318a2 2 0 001.414.586h1.121a2 2 0 001.414-.586l1.318-1.318a2 2 0 00.547-1.022l-.477-2.387a2 2 0 00-1.414-1.96l-2.387-.477z" /></svg>
                <span>{isRefining ? 'Refining...' : 'Refine'}</span>
              </button>
              <button 
                onClick={handleAiDraft}
                disabled={isGenerating}
                className="flex items-center space-x-2 bg-red-600/10 hover:bg-red-600/20 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition border border-red-600/20 disabled:opacity-30"
              >
                <svg className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <span>{isGenerating ? 'Drafting...' : 'Gemini Draft'}</span>
              </button>
            </div>
          </div>

          {activeTab === 'write' ? (
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[600px] bg-slate-900/5 dark:bg-white/5 rounded-[2.5rem] px-10 py-10 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-600/10 transition resize-none leading-relaxed border border-black/5 dark:border-white/5 custom-scrollbar"
              placeholder="System ready for markdown injection..."
            />
          ) : (
            <div className="min-h-[600px] bg-slate-900/5 dark:bg-white/5 rounded-[2.5rem] p-12 lg:p-20 overflow-y-auto border border-black/5 dark:border-white/5 custom-scrollbar">
              <MarkdownRenderer content={content} />
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900/5 dark:bg-white/5 p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-6">
              <label className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em]">Identity Art</label>
              <button 
                onClick={handleGenerateCover}
                disabled={isGeneratingImage}
                className="p-2 hover:bg-red-600/10 rounded-lg text-red-600 transition disabled:opacity-30"
              >
                <svg className={`w-5 h-5 ${isGeneratingImage ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </button>
            </div>
            
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-black/5 dark:border-white/10 relative group">
              {coverImage ? (
                <img src={coverImage} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-20">
                   <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              {isGeneratingImage && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center">
                   <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <input 
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full mt-4 bg-transparent border-b border-black/10 dark:border-white/10 px-0 py-2 text-[10px] font-mono focus:outline-none focus:border-red-600 transition truncate opacity-50"
              placeholder="Asset URL (or autogen)..."
            />
          </div>

          <div className="bg-slate-900/5 dark:bg-white/5 p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5">
            <label className="block text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-4">Metadata Tags</label>
            <input 
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-transparent border-b border-black/10 dark:border-white/10 px-0 py-2 text-sm font-bold focus:outline-none focus:border-red-600 transition placeholder-slate-600"
              placeholder="SQL, React, Python..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;