import React, { useRef, useState, useEffect } from 'react';
import { Confession } from '../types';
import { Heart, Laugh, AlertCircle, Flame, Share2, Moon, Sun, Trophy, Download, X, ExternalLink, Link as LinkIcon, Check } from 'lucide-react';
import { toBlob } from 'html-to-image';

interface ConfessionCardProps {
  data: Confession;
  onReact: (id: string, type: keyof Confession['reactions']) => void;
  isMine: boolean;
  onView?: (id: string) => void;
  variant?: 'default' | 'featured';
  onShareSuccess?: () => void;
}

const MASKS = [
    { icon: '👻', label: 'Ghost' },
    { icon: '🦊', label: 'Fox' },
    { icon: '🤖', label: 'Bot' },
    { icon: '👽', label: 'Alien' },
    { icon: '🦁', label: 'Lion' },
    { icon: '🦄', label: 'Unicorn' },
    { icon: '🐨', label: 'Koala' },
    { icon: '🐱', label: 'Cat' },
    { icon: '🦇', label: 'Bat' },
    { icon: '🕶️', label: 'Agent' },
];

export const ConfessionCard: React.FC<ConfessionCardProps> = ({ data, onReact, isMine, onView, variant = 'default', onShareSuccess }) => {
  const [loadingShare, setLoadingShare] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const cardRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';
  const isFeatured = variant === 'featured';
  const mask = MASKS[data.maskId || 0] || MASKS[0];

  const appUrl = window.location.origin;
  const appDomain = window.location.host;

  const shareCaption = `⚠️ Disclaimer: This is NOT my personal story!\n\nI found this on Confession Stories. 🤫\n\nRead more here:\n${appUrl}`;

  useEffect(() => {
    if (onView) onView(data.id);
  }, []);

  useEffect(() => {
    if (!showPreview) {
        setPreviewBlob(null);
        setCopiedLink(false);
    }
  }, [showPreview]);

  const handleReaction = (type: keyof Confession['reactions']) => onReact(data.id, type);
  
  const formatNumber = (num: number) => num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString();

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  const handleCopyLink = () => {
      navigator.clipboard.writeText(appUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
  };

  const generatePreview = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cardRef.current === null) return;
    setLoadingShare(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const bgColor = isFeatured 
        ? (isDark ? '#2a1a00' : '#fffbef') 
        : (isDark ? '#000000' : '#fafafa');

      const blob = await toBlob(cardRef.current, {
        cacheBust: true,
        backgroundColor: bgColor, 
        pixelRatio: 3, 
        style: { boxShadow: 'none', border: 'none', borderRadius: '0', transform: 'scale(1)' },
        filter: (node) => {
          if (node.classList && (node.classList.contains('share-btn-container') || node.classList.contains('theme-toggle-btn'))) return false;
          return true;
        },
        onClone: (clonedDoc) => {
          const watermark = clonedDoc.querySelector('.watermark-text') as HTMLElement;
          if (watermark) { watermark.style.opacity = '1'; watermark.style.display = 'block'; watermark.classList.remove('hidden', 'opacity-0'); }
          const branding = clonedDoc.querySelector('.export-branding') as HTMLElement;
          if (branding) { branding.style.display = 'block'; branding.classList.remove('hidden'); }
          const container = clonedDoc.querySelector('.card-container') as HTMLElement;
          if (container) { container.style.boxShadow = 'none'; }
        }
      });

      if (!blob) throw new Error('Failed to generate image');
      setPreviewBlob(blob);
      setShowPreview(true);
    } catch (err) {
      console.error('Share failed', err);
      alert('Could not generate image. Please try taking a screenshot.');
    } finally {
      setLoadingShare(false);
    }
  };

  const handleConfirmShare = async () => {
      if (!previewBlob) return;
      try {
        const file = new File([previewBlob], `confession-${data.id}.png`, { type: 'image/png' });
        if (onShareSuccess) onShareSuccess();

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
            files: [file],
            title: 'Confession Stories',
            text: shareCaption,
            url: appUrl,
            });
        } else {
            const url = URL.createObjectURL(previewBlob);
            const link = document.createElement('a');
            link.download = `confession-${data.id}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            alert("Image saved! Post this to your Status with the link: " + appUrl);
        }
        setShowPreview(false);
      } catch (e) {
          console.error("Share error:", e);
      }
  };

  const reactions = data.reactions || { love: 0, laugh: 0, shock: 0, fire: 0 };

  return (
    <>
    <div className="w-full max-w-md mx-auto mb-8 px-2">
      {isFeatured && (
        <div className="flex items-center justify-center gap-2 mb-3 animate-pulse">
            <Trophy size={16} className="text-amber-500" fill="currentColor" />
            <span className="text-xs font-black tracking-[0.2em] text-amber-500 uppercase">Daily Viral Pick</span>
        </div>
      )}
      <div ref={cardRef} className={`card-container relative overflow-hidden rounded-[32px] transition-all duration-500 ${isFeatured ? (isDark ? 'bg-gradient-to-br from-amber-950/40 to-black border border-amber-500/30 shadow-[0_0_50px_-15px_rgba(245,158,11,0.3)]' : 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-[0_20px_40px_-15px_rgba(251,191,36,0.3)]') : (isDark ? 'bg-zinc-900 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] border border-white/10' : 'bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white')} ${isDark ? 'text-white' : 'text-zinc-900'}`}>
        <div className="flex justify-between items-center p-6 pb-0">
             <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm bg-gradient-to-br shadow-inner ${isFeatured ? 'from-amber-300 to-orange-400 text-white' : (isDark ? 'from-zinc-800 to-zinc-700' : 'from-zinc-100 to-zinc-200')}`}>{mask.icon}</div>
                <div className="flex flex-col">
                    <span className={`text-xs font-bold tracking-wide ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Anonymous {mask.label}</span>
                    <span className={`text-[10px] font-medium tracking-wider uppercase opacity-40 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{new Date(data.createdAt).toLocaleDateString()}</span>
                </div>
             </div>
            <div className={`watermark-text opacity-0 text-[10px] font-black tracking-[0.2em] uppercase absolute right-6 top-6 ${isDark ? 'text-zinc-500' : 'text-zinc-300'}`}>Confession Stories</div>
            <div className="theme-toggle-btn relative z-20">
                <button onClick={toggleTheme} className={`p-2 rounded-full transition-all duration-300 backdrop-blur-md ${isDark ? 'bg-white/5 text-yellow-300 hover:bg-white/20' : 'bg-black/5 text-zinc-400 hover:bg-black/10 hover:text-zinc-800'}`}>{isDark ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.5} />}</button>
            </div>
        </div>
        <div className="px-8 py-6 relative">
          <div className={`absolute -top-2 -left-2 text-6xl font-serif leading-none opacity-20 pointer-events-none select-none ${isDark ? 'text-zinc-700' : 'text-zinc-200'}`}>“</div>
          <p className={`serif text-2xl font-medium leading-relaxed relative z-10 break-words ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>{data.text}</p>
          <div className={`absolute -bottom-8 -right-2 text-6xl font-serif leading-none opacity-20 pointer-events-none select-none transform rotate-180 ${isDark ? 'text-zinc-700' : 'text-zinc-200'}`}>“</div>
        </div>
        <div className="px-6 pb-6 pt-4 mt-2">
          <div className={`flex items-center justify-between p-1.5 rounded-2xl ${isDark ? 'bg-black/30 border border-white/5' : 'bg-zinc-50'} ${isFeatured ? (isDark ? 'bg-amber-900/20 border-amber-500/10' : 'bg-amber-100/50') : ''}`}>
            <div className="flex gap-1 w-full justify-between px-1">
              <ReactionBtn icon={<Heart size={20} className={reactions.love > 0 ? "fill-current" : ""} />} count={reactions.love} onClick={() => handleReaction('love')} activeColor="text-rose-500" isDark={isDark} />
              <ReactionBtn icon={<Laugh size={20} className={reactions.laugh > 0 ? "fill-current" : ""} />} count={reactions.laugh} onClick={() => handleReaction('laugh')} activeColor="text-amber-500" isDark={isDark} />
              <ReactionBtn icon={<AlertCircle size={20} className={reactions.shock > 0 ? "fill-current" : ""} />} count={reactions.shock} onClick={() => handleReaction('shock')} activeColor="text-blue-500" isDark={isDark} />
              <ReactionBtn icon={<Flame size={20} className={reactions.fire > 0 ? "fill-current" : ""} />} count={reactions.fire} onClick={() => handleReaction('fire')} activeColor="text-orange-500" isDark={isDark} />
            </div>
          </div>
          <div className="share-btn-container mt-6">
             <button onClick={generatePreview} disabled={loadingShare} className={`w-full relative overflow-hidden group flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-[0.98] ${isFeatured ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]' : (isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800')}`}>
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
               {loadingShare ? (<span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Generating...</span>) : (<>{isFeatured ? <Trophy size={18} className="fill-current" /> : <Share2 size={18} />}{isFeatured ? 'SHARE DAILY STORY' : 'SHARE TO STATUS'}</>)}
             </button>
             <div className="text-center mt-3"><span className={`text-[10px] font-semibold uppercase tracking-widest opacity-40 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{formatNumber(data.views || 0)} Views • {formatNumber(data.shares || 0)} Shares</span></div>
          </div>
          <div className={`export-branding hidden pt-6 mt-4 border-t border-dashed ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-500'}`}>
              <div className="flex items-center justify-between opacity-80">
                  <div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-widest">Found on Confession Stories</span><span className="text-[8px] font-bold tracking-wide mt-0.5">{appDomain} • Anonymous</span></div>
                  <div className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider border flex items-center gap-1 ${isDark ? 'border-zinc-700 bg-zinc-800' : 'border-zinc-300 bg-zinc-100'}`}><Download size={8} />Get App</div>
              </div>
          </div>
        </div>
      </div>
    </div>
    {showPreview && previewBlob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowPreview(false)} />
            <div className="relative w-full max-w-sm bg-zinc-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md">
                    <h3 className="font-bold text-white">Share Preview</h3>
                    <button onClick={() => setShowPreview(false)} className="p-1.5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-6 overflow-y-auto no-scrollbar flex-1 flex flex-col items-center">
                    <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 w-full mb-6"><img src={URL.createObjectURL(previewBlob)} alt="Share Preview" className="w-full h-auto block" /></div>
                    <div className="w-full bg-black/50 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase font-bold tracking-wider"><ExternalLink size={12} /><span>Attached Caption</span></div>
                             <button onClick={handleCopyLink} className="text-xs font-bold text-amber-500 flex items-center gap-1 hover:text-amber-400">{copiedLink ? <Check size={12} /> : <LinkIcon size={12} />}{copiedLink ? 'COPIED' : 'COPY LINK'}</button>
                        </div>
                        <p className="text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed opacity-80">{shareCaption}</p>
                    </div>
                </div>
                <div className="p-6 border-t border-white/5 bg-zinc-900">
                    <button onClick={handleConfirmShare} className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"><Share2 size={20} />POST TO STATUS</button>
                    <p className="text-center text-[10px] text-zinc-500 mt-3">Clicking this will open your social apps</p>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

const ReactionBtn = ({ icon, count, onClick, activeColor, isDark }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all active:scale-90 ${count > 0 ? activeColor : (isDark ? 'text-zinc-600 hover:bg-white/10 hover:text-zinc-400' : 'text-zinc-300 hover:bg-white hover:text-zinc-400 hover:shadow-sm')}`}>
    <div className="mb-0.5">{icon}</div>
    <span className="text-[10px] font-bold opacity-90">{count > 0 ? count : ''}</span>
  </button>
);
