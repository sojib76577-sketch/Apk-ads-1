import React from 'react';
import { ActiveNav } from '../../types';
import { useData } from '../../context/DataContext';
import { 
  LayoutDashboard, 
  Smartphone, 
  Sparkles, 
  Film, 
  PlusCircle,
  Menu
} from 'lucide-react';

interface MobileBottomNavProps {
  activeNav: ActiveNav;
  setActiveNav: (nav: ActiveNav) => void;
  onOpenMobileSidebar: () => void;
  onQuickAddApk: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeNav,
  setActiveNav,
  onOpenMobileSidebar,
  onQuickAddApk,
}) => {
  const { apks } = useData();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#090d16]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {/* Dashboard */}
        <button
          onClick={() => setActiveNav('dashboard')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'dashboard'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Overview</span>
        </button>

        {/* APK Manager */}
        <button
          onClick={() => setActiveNav('apk-manager')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl relative transition-all cursor-pointer ${
            activeNav === 'apk-manager'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">APKs</span>
          {apks.length > 0 && (
            <span className="absolute top-0.5 right-1 w-4 h-4 bg-indigo-600 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center">
              {apks.length > 99 ? '99+' : apks.length}
            </span>
          )}
        </button>

        {/* Center Quick Add Button */}
        <button
          onClick={onQuickAddApk}
          className="flex flex-col items-center -mt-4 p-2.5 bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 text-white rounded-2xl shadow-xl shadow-indigo-600/40 active:scale-95 transition-all cursor-pointer border border-indigo-400/30"
          title="Add New APK"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        {/* Prompts */}
        <button
          onClick={() => setActiveNav('photo-prompt-manager')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'photo-prompt-manager'
              ? 'text-purple-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Prompts</span>
        </button>

        {/* More Menu */}
        <button
          onClick={onOpenMobileSidebar}
          className="flex flex-col items-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Menu</span>
        </button>
      </div>
    </nav>
  );
};
