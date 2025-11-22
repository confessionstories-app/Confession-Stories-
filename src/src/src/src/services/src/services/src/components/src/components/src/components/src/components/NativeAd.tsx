import React from 'react';
import { ExternalLink, MoreHorizontal, Star } from 'lucide-react';

export const NativeAd: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto mb-8 px-2">
      <div className="relative overflow-hidden rounded-[32px] bg-zinc-900 border border-zinc-800 shadow-xl">
        <div className="flex justify-between items-center p-6 pb-2">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg"><Star size={20} fill="currentColor" /></div>
                <div className="flex flex-col"><span className="text-sm font-bold text-white tracking-wide">Recommended App</span><div className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-black uppercase">Ad</span><span className="text-[10px] text-zinc-500">• Sponsored</span></div></div>
             </div>
             <button className="text-zinc-600"><MoreHorizontal size={20} /></button>
        </div>
        <div className="px-6 py-4">
          <h3 className="text-lg font-bold text-zinc-100 mb-2 leading-tight">Download the best new strategy game of 2025!</h3>
          <div className="relative w-full h-48 bg-zinc-800 rounded-2xl overflow-hidden mb-4 border border-white/5 group">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900"><span className="text-4xl">🎮</span></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-end"><button className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors">Install</button></div>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">Join millions of players. Build your world.</p>
        </div>
        <div className="px-6 pb-6 pt-2"><button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"><ExternalLink size={16} />Play Now</button></div>
      </div>
    </div>
  );
};
