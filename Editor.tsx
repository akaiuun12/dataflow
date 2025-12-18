
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const handleAiDraft = async () => {
    if (!title) return alert('Enter a title/topic first for the AI to work with.');
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Write a high-quality technical blog post in Markdown about "${title}". Include code examples.`,
      });
      if (response.text) setContent(response.text);
    } catch (err) {
      console.error(err);
      alert('AI generation failed. Check your API key or network.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!title || !content) return alert('Title and Content are required.');
    onSave({
      title,
      content,
      tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      publishedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      readingTime: `${Math.ceil(content.split(' ').length / 200)} min read`
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-black text-current">
            {initialPost ? 'Edit Entry' : 'New Publication'}
          </h2>
          <p className="text-red-500/60 font-bold uppercase tracking-widest text-xs mt-2">Technical Content Studio</p>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onCancel} className="px-6 py-3 rounded-2xl bg-slate-800/10 text-slate-500 hover:text-slate-800 transition font-bold text-sm">Cancel</button>
          <button onClick={handleSave} className="px-10 py-3 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-500 shadow-xl shadow-red-900/20 transition active:scale-95">Publish to Feed</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-8">
          <div className="relative group">
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900/10 border-b-2 border-red-500/20 px-0 py-6 text-4xl font-black text-current focus:outline-none focus:border-red-600 transition placeholder:opacity-20"
              placeholder="Article Heading..."
            />
          </div>

          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex space-x-10">
              <button 
                onClick={() => setActiveTab('write')}
                className={`text-xs font-black uppercase tracking-[0.2em] pb-2 transition border-b-2 ${activeTab === 'write' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-400'}`}
              >
                Draft Editor
              </button>
              <button 
                onClick={() => setActiveTab('preview')}
                className={`text-xs font-black uppercase tracking-[0.2em] pb-2 transition border-b-2 ${activeTab === 'preview' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-400'}`}
              >
                Live Preview
              </button>
            </div>
            <button 
              onClick={handleAiDraft}
              disabled={isGenerating}
              className="flex items-center space-x-3 bg-red-600/10 hover:bg-red-600/20 text-red-600 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-600/20 disabled:opacity-50 transition"
            >
              <svg className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{isGenerating ? 'Synthesizing...' : 'Gemini AI Draft'}</span>
            </button>
          </div>

          {activeTab === 'write' ? (
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[600px] bg-slate-900/5 rounded-[2.5rem] px-10 py-10 text-current font-mono text-base focus:outline-none focus:ring-2 focus:ring-red-600/20 transition resize-none leading-relaxed border border-white/5"
              placeholder="Start your technical story with Markdown..."
            />
          ) : (
            <div className="min-h-[600px] bg-slate-900/5 rounded-[2.5rem] p-16 overflow-y-auto border border-white/5">
              {content ? <MarkdownRenderer content={content} /> : <div className="text-center py-40 text-slate-500 italic font-medium">Article content is empty.</div>}
            </div>
          )}

          <div className="bg-slate-900/5 p-10 rounded-[2.5rem] border border-white/5">
            <label className="block text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-4">Metadata Tags</label>
            <input 
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-slate-950/20 border-b border-white/10 px-0 py-4 text-current focus:outline-none focus:border-red-600 transition placeholder-slate-600"
              placeholder="React, AI, Engineering (comma separated)"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
