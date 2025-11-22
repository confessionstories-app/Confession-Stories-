import React from 'react';
import { Flame, Clock, User, Plus } from 'lucide-react';
import { TabView } from '../types';

interface NavbarProps {
  activeTab: TabView;
  onTabChange: (tab: TabView) => void;
  onPostClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onPostClick }) => {
  const navItemClass = (tab: TabView) => 
    `relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
      activeTab === tab 
        ? 'text-black bg-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
    }`;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-6 pointer-events-none">
      <div className="max-w-xs mx-auto bg-zinc-900/90 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 rounded-full p-2 pointer-events-auto flex items-center justify-between">
        <button onClick={() => onTabChange('trending')} className={navItemClass('trending')}>
          <Flame size={22} strokeWidth={activeTab === 'trending' ? 2.5 : 2} />
        </button>
        <button onClick={() => onTabChange('new')} className={navItemClass('new')}>
          <Clock size={22} strokeWidth={activeTab === 'new' ? 2.5 : 2} />
        </button>
        <div className="mx-2">
            <button onClick={onPostClick} className="w-14 h-14 bg-gradient-to-br from-amber-200 to-amber-500 text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition-transform">
                <Plus size={26} strokeWidth={2.5} />
            </button>
        </div>
        <button onClick={() => onTabChange('mine')} className={navItemClass('mine')}>
          <User size={22} strokeWidth={activeTab === 'mine' ? 2.5 : 2} />
        </button>
      </div>
    </div>
  );
};
