import React from 'react';

export const AdBanner: React.FC = () => {
  return (
    <div className="w-full py-4 flex justify-center">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 border-dashed rounded-lg h-16 flex items-center justify-center flex-col space-y-1 overflow-hidden relative">
        <span className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase">Advertisement</span>
        <div className="text-xs text-zinc-500">AdMob Banner Space</div>
      </div>
    </div>
  );
};
