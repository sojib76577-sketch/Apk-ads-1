import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ActiveNav } from '../../types';
import { 
  LayoutDashboard, 
  Smartphone, 
  Sparkles, 
  Film, 
  FolderTree, 
  Image as ImageIcon, 
  Star, 
  HeartHandshake, 
  SearchCheck, 
  DollarSign, 
  Sliders, 
  LogOut, 
  ShieldCheck, 
  X
} from 'lucide-react';

interface SidebarProps {
  activeNav: ActiveNav;
  setActiveNav: (nav: ActiveNav) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenFirebaseModal: () => void;
  onOpenRulesModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  setActiveNav,
  isOpenMobile,
  onCloseMobile,
  onOpenFirebaseModal,
  onOpenRulesModal,
}) => {
  const { adminProfile, logout, isDemoMode } = useAuth();
  const { apks, prompts, templates, categories } = useData();

  const navItems = [
    { id: 'dashboard' as ActiveNav, label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'apk-manager' as ActiveNav, 
      label: 'APK Manager', 
      icon: Smartphone, 
      badge: apks.length 
    },
    { 
      id: 'photo-prompt-manager' as ActiveNav, 
      label: 'Photo Prompt Manager', 
      icon: Sparkles, 
      badge: prompts.length 
    },
    { 
      id: 'video-template-manager' as ActiveNav, 
      label: 'Video Template Manager', 
      icon: Film, 
      badge: templates.length 
    },
    { 
      id: 'category-manager' as ActiveNav, 
      label: 'Category Manager', 
      icon: FolderTree, 
      badge: categories.length 
    },
    { id: 'media-library' as ActiveNav, label: 'Media Library', icon: ImageIcon },
    { id: 'featured-content' as ActiveNav, label: 'Featured Content', icon: Star },
    { id: 'engagement' as ActiveNav, label: 'Engagement', icon: HeartHandshake },
    { id: 'seo-manager' as ActiveNav, label: 'SEO Manager', icon: SearchCheck },
    { id: 'adsense-settings' as ActiveNav, label: 'AdSense Settings', icon: DollarSign },
    { id: 'site-settings' as ActiveNav, label: 'Site Settings', icon: Sliders },
  ];

  const handleNavClick = (id: ActiveNav) => {
    setActiveNav(id);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-[#0b0f19] border-r border-slate-800/80 text-slate-300">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-600/20 text-white font-extrabold text-lg">
            PX
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              PromptXHubl
              <span className="text-[10px] font-semibold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                Admin
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Content Management</p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Demo Sandbox Alert Pill */}
      {isDemoMode && (
        <div className="mx-4 mt-3 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-[11px] text-amber-300">
          <span>Sandbox Mode Active</span>
          <button
            onClick={onOpenFirebaseModal}
            className="underline hover:text-amber-100 font-medium cursor-pointer"
          >
            Connect DB
          </button>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {typeof item.badge === 'number' && item.badge > 0 && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800/90 text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Security & Rules Shortcut */}
        <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Security & Setup
        </div>
        <button
          onClick={onOpenRulesModal}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-purple-300 hover:bg-purple-950/20 transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Security Rules</span>
        </button>

        {/* Logout Item */}
        <div className="pt-2">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* User Card */}
      <div className="p-3 border-t border-slate-800/80 bg-[#090d16]">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
            {adminProfile?.displayName ? adminProfile.displayName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-semibold text-white truncate">
              {adminProfile?.displayName || 'Administrator'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {adminProfile?.email || 'sojib76577@gmail.com'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed inset-y-0 left-0 z-30">
        {content}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
