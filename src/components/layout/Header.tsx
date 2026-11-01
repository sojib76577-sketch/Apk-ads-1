import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ActiveNav } from '../../types';
import { 
  Menu, 
  ExternalLink, 
  Database, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  DownloadCloud
} from 'lucide-react';

interface HeaderProps {
  activeNav: ActiveNav;
  onOpenMobileSidebar: () => void;
  onOpenFirebaseModal: () => void;
  onQuickAdd: (type: 'apk' | 'prompt' | 'template' | 'category') => void;
}

const TITLE_MAP: Record<ActiveNav, string> = {
  'dashboard': 'Dashboard Overview',
  'apk-manager': 'APK & MOD Games Manager',
  'photo-prompt-manager': 'Photo Editing Prompts CMS',
  'video-template-manager': 'Video Templates CMS',
  'category-manager': 'Category Management',
  'media-library': 'Media Library (Storage)',
  'featured-content': 'Homepage Featured Content',
  'engagement': 'Love & Popular Content Engagement',
  'seo-manager': 'Global SEO & Sitemap Manager',
  'adsense-settings': 'Google AdSense Settings',
  'site-settings': 'Site Preferences & Contact Settings',
};

export const Header: React.FC<HeaderProps> = ({
  activeNav,
  onOpenMobileSidebar,
  onOpenFirebaseModal,
  onQuickAdd,
}) => {
  const { isConfigured, isDemoMode, firebaseConfig } = useAuth();
  const { generalSettings, seedInitialDataToFirestore, isLoading } = useData();
  const [quickAddOpen, setQuickAddOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 flex items-center justify-between">
      {/* Left section: Hamburger and Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            {TITLE_MAP[activeNav] || 'Admin Portal'}
          </h2>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span>PromptXHubl</span>
            <span>/</span>
            <span className="text-slate-200 capitalize">{activeNav.replace(/-/g, ' ')}</span>
          </div>
        </div>
      </div>

      {/* Right section: Firebase status badge, Quick Add, Public link */}
      <div className="flex items-center gap-2.5">
        {/* Firebase Connection Indicator */}
        <button
          onClick={onOpenFirebaseModal}
          className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
            isConfigured
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/30'
              : isDemoMode
              ? 'bg-amber-950/30 border-amber-500/30 text-amber-400 hover:bg-amber-900/30'
              : 'bg-rose-950/30 border-rose-500/30 text-rose-400 hover:bg-rose-900/30'
          }`}
          title="Click to view or edit Firebase configuration"
        >
          <Database className="w-3.5 h-3.5" />
          <span className="hidden md:inline">
            {isConfigured ? `Firebase: ${firebaseConfig?.projectId || 'Connected'}` : isDemoMode ? 'Sandbox Mode' : 'Connect Firebase'}
          </span>
          {isConfigured ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Quick Add Dropdown */}
        <div className="relative">
          <button
            onClick={() => setQuickAddOpen(!quickAddOpen)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Add</span>
          </button>

          {quickAddOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setQuickAddOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-52 bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => { onQuickAdd('apk'); setQuickAddOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  New APK App / Game
                </button>
                <button
                  onClick={() => { onQuickAdd('prompt'); setQuickAddOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  New Photo Prompt
                </button>
                <button
                  onClick={() => { onQuickAdd('template'); setQuickAddOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  New Video Template
                </button>
                <button
                  onClick={() => { onQuickAdd('category'); setQuickAddOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  New Category
                </button>
              </div>
            </>
          )}
        </div>

        {/* Public Website Link */}
        <a
          href={generalSettings.publicWebsiteUrl || 'https://promptxhubl.com'}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium"
          title="Visit Public Website"
        >
          <span>Public Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
};
