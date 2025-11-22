import React, { useState, useEffect } from 'react';
import { X, Download, Star } from 'lucide-react';

interface InterstitialAdProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InterstitialAd: React.FC<InterstitialAdProps> = ({ isOpen, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(5); setCanClose(false);
      const timer = setInterval(() => { setTimeLeft(p => { if(p<=1){ clearInterval(timer); setCanClose(true); return 0; } return p-1; }); }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="absolute top-4 right-4 z-10">
        {canClose ? (<button onClick={onClose} className="bg-white/10 backdrop-blur-md border border-white/20 text-white p-2 rounded-full hover:bg-white/20 transition-all"><X size={24} /></button>) : (<div className="bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">Reward in {timeLeft}s</div>)}
      </div>
      <div className="w-full max-w-sm bg-zinc-900 rounded-[32px] overflow-hidden border border-zinc-800 shadow-2xl relative">
        <div className="h-80 bg-gradient-to-b from-emerald-500 to-teal-800 relative flex items-center justify-center"><div className="text-9xl animate-bounce">💸</div></div>
        <div className="p-8 pt-0 text-center relative z-10">
           <div className="w-16 h-16 mx-auto bg-white rounded-2xl -mt-8 shadow-xl flex items-center justify-center mb-4"><span className="text-3xl">🏦</span></div>
           <h2 className="text-2xl font-black text-white mb-2 uppercase italic">Trading App</h2>
           <p className="text-zinc-400 text-sm leading-relaxed mb-6">Get $50 free bonus.</p>
           <button className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg uppercase rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"><Download size={24} />Install App</button>
        </div>
        <div className="bg-black/30 p-2 text-center"><span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Advertisement</span></div>
      </div>
    </div>
  );
};
