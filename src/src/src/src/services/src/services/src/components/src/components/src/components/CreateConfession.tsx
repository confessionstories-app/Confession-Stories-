import React, { useState, useEffect } from 'react';
import { X, Send, ShieldCheck, Loader2, Sparkles } from 'lucide-react';
import { moderateContent } from '../services/gemini';
import { Category } from '../types';

interface CreateConfessionProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, category: Category) => Promise<boolean>;
}

export const CreateConfession: React.FC<CreateConfessionProps> = ({ isOpen, onClose, onSubmit }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<Category>('confession');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [randomMask, setRandomMask] = useState('👻');

  useEffect(() => {
    const icons = ['👻', '🦊', '🤖', '👽', '🦁', '🦄', '🐱'];
    setRandomMask(icons[Math.floor(Math.random() * icons.length)]);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) { setIsVisible(true); document.body.style.overflow = 'hidden'; } 
    else { const timer = setTimeout(() => setIsVisible(false), 300); document.body.style.overflow = 'unset'; return () => clearTimeout(timer); }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const handleSubmit = async () => {
    if (text.trim().length < 10) { setError("Too short!"); return; }
    setIsAnalyzing(true); setError(null);
    try {
      const moderation = await moderateContent(text);
      if (!moderation.allowed) { setError(moderation.reason); setIsAnalyzing(false); return; }
      const success = await onSubmit(text, category);
      if (success) { setText(''); onClose(); } else { setError("Failed to post."); }
    } catch (e) { setError("Error."); } finally { setIsAnalyzing(false); }
  };

  const CategoryBtn = ({ type, label }: { type: Category, label: string }) => (
    <button onClick={() => setCategory(type)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${category === type ? 'bg-white text-black border-white' : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}>{label}</button>
  );

  return (
    <div className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className={`relative w-full sm:max-w-lg bg-zinc-900 border border-white/10 rounded-t-[32px] sm:rounded-[32px] shadow-2xl transform transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${isOpen ? 'translate-y-0' : 'translate-y-full sm:translate-y-10'}`}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="serif text-2xl font-bold text-white flex items-center gap-2">Confess Secretly <Sparkles size={18} className="text-amber-400 fill-amber-400" /></h2>
            <button onClick={onClose} className="p-2 -mr-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"><X size={24} /></button>
          </div>
          <div className="mb-6 p-4 bg-black/40 rounded-2xl border border-white/5">
             <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 shadow-sm flex items-center justify-center text-lg flex-shrink-0 border border-white/10">{randomMask}</div>
                <div>
                    <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wide mb-1">Posting as "Anonymous"</h3>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">Your real name is 100% hidden. Sharing to social media makes it visible to your contacts.</p>
                </div>
             </div>
          </div>
          <div className="mb-4"><span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block px-1">Select Category</span><div className="flex gap-2 overflow-x-auto no-scrollbar"><CategoryBtn type="confession" label="Confession" /><CategoryBtn type="life-lesson" label="Life Lesson" /><CategoryBtn type="other" label="Other" /></div></div>
          <div className="relative">
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={category === 'life-lesson' ? "I learned..." : "I confess..."} className="w-full h-32 p-6 bg-zinc-900 border border-white/5 rounded-3xl text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none text-lg leading-relaxed serif" maxLength={500} />
            <div className="absolute bottom-4 right-4 text-[10px] font-bold text-zinc-500 bg-black px-2 py-1 rounded-full border border-white/10">{text.length}/500</div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-zinc-500 px-2"><ShieldCheck size={14} className="text-green-500/80" /><span>AI Moderation Active</span></div>
          {error && <div className="mt-4 p-4 bg-red-950/30 border border-red-500/20 text-red-400 text-sm font-medium rounded-2xl flex items-start gap-3 animate-pulse"><div className="mt-0.5">⚠️</div><span>{error}</span></div>}
          <button onClick={handleSubmit} disabled={isAnalyzing || text.length === 0} className="mt-6 w-full bg-white text-black font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-white/5">{isAnalyzing ? (<><Loader2 size={24} className="animate-spin" /><span className="tracking-wide">POSTING...</span></>) : (<><Send size={20} /><span className="tracking-wide">POST ANONYMOUSLY</span></>)}</button>
        </div>
      </div>
    </div>
  );
};
