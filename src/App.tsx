import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { ApkManager } from './components/apk/ApkManager';
import { ApkFormModal } from './components/apk/ApkFormModal';
import { PromptManager } from './components/prompts/PromptManager';
import { PromptFormModal } from './components/prompts/PromptFormModal';
import { TemplateManager } from './components/templates/TemplateManager';
import { TemplateFormModal } from './components/templates/TemplateFormModal';
import { CategoryManager } from './components/categories/CategoryManager';
import { CategoryFormModal } from './components/categories/CategoryFormModal';
import { MediaLibrary } from './components/media/MediaLibrary';
import { FeaturedContentManager } from './components/featured/FeaturedContentManager';
import { EngagementManager } from './components/engagement/EngagementManager';
import { SeoManager } from './components/seo/SeoManager';
import { AdSenseSettings } from './components/adsense/AdSenseSettings';
import { SiteSettings } from './components/settings/SiteSettings';
import { FirebaseConfigModal } from './components/common/FirebaseConfigModal';
import { SecurityRulesModal } from './components/common/SecurityRulesModal';
import { ToastContainer } from './components/common/ToastContainer';
import { ActiveNav } from './types';
import { AlertCircle, RefreshCw, ShieldCheck, FileCode2, Sparkles, X } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { isAuthorized, loading: authLoading, isBypassMode, adminProfile, enableDemoMode } = useAuth();
  const { connectionStatus, connectionError, retryConnection, fixFirestoreSync, dismissSyncError } = useData();

  const [activeNav, setActiveNav] = useState<ActiveNav>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [firebaseModalOpen, setFirebaseModalOpen] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  // Quick-Add Modals
  const [quickAddType, setQuickAddType] = useState<'apk' | 'prompt' | 'template' | 'category' | null>(null);

  const handleAutoFix = async () => {
    setIsFixing(true);
    try {
      await fixFirestoreSync();
    } finally {
      setIsFixing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070a12] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-xl shadow-xl shadow-indigo-600/30 animate-pulse mb-4">
          PX
        </div>
        <p className="text-xs text-slate-400 font-medium">Loading PromptXHubl Admin...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return <LoginPage />;
  }

  const handleQuickAdd = (type: 'apk' | 'prompt' | 'template' | 'category') => {
    setQuickAddType(type);
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenFirebaseModal={() => setFirebaseModalOpen(true)}
        onOpenRulesModal={() => setRulesModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
        <Header
          activeNav={activeNav}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenFirebaseModal={() => setFirebaseModalOpen(true)}
          onQuickAdd={handleQuickAdd}
        />

        {/* Direct Admin Session / Rule Setup Banner */}
        {isBypassMode && (
          <div className="bg-amber-950/70 border-b border-amber-500/40 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Admin Session:</strong> Signed in as {adminProfile?.email || 'admin'}. Remember to publish <code className="text-amber-100 font-mono">firestore.rules</code> in your Firebase Console to enable persistent live database sync.
              </span>
            </div>
            <button
              onClick={() => setRulesModalOpen(true)}
              className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 rounded-lg text-[11px] font-semibold border border-amber-500/30 cursor-pointer shrink-0"
            >
              View Rules
            </button>
          </div>
        )}

        {/* Global Connection Error Banner if Firestore throws error */}
        {connectionStatus === 'error' && connectionError && (
          <div className="bg-[#180e18] border-b border-rose-500/40 px-4 py-3 text-xs text-rose-200 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Firestore Sync Notice:</span>{' '}
                  <span className="text-rose-200/90">{connectionError}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={handleAutoFix}
                  disabled={isFixing}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-bold shadow-md shadow-purple-900/30 transition-all cursor-pointer disabled:opacity-50"
                  title="Auto-register your admin credentials in Firestore /admins collection"
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${isFixing ? 'animate-spin' : ''}`} />
                  <span>{isFixing ? 'Registering Admin...' : 'Auto-Fix Permissions'}</span>
                </button>

                <button
                  onClick={() => setRulesModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                  title="View and copy the required firestore.rules"
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span>View Rules</span>
                </button>

                <button
                  onClick={() => enableDemoMode(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
                  title="Switch to Sandbox mode to edit and view without waiting for rules"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sandbox Mode</span>
                </button>

                <button
                  onClick={retryConnection}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg text-[11px] font-semibold cursor-pointer"
                  title="Retry Firestore connection"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>

                <button
                  onClick={dismissSyncError}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer ml-1"
                  title="Dismiss notice"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 pb-24 lg:p-8 max-w-7xl w-full mx-auto">
          {activeNav === 'dashboard' && (
            <DashboardOverview 
              onNavigate={setActiveNav} 
              onQuickAdd={handleQuickAdd} 
            />
          )}
          {activeNav === 'apk-manager' && <ApkManager />}
          {activeNav === 'photo-prompt-manager' && <PromptManager />}
          {activeNav === 'video-template-manager' && <TemplateManager />}
          {activeNav === 'category-manager' && <CategoryManager />}
          {activeNav === 'media-library' && <MediaLibrary />}
          {activeNav === 'featured-content' && <FeaturedContentManager />}
          {activeNav === 'engagement' && <EngagementManager />}
          {activeNav === 'seo-manager' && <SeoManager />}
          {activeNav === 'adsense-settings' && <AdSenseSettings />}
          {activeNav === 'site-settings' && <SiteSettings />}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Android phone friendly) */}
      <MobileBottomNav
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        onQuickAddApk={() => handleQuickAdd('apk')}
      />

      {/* Global Modals */}
      <FirebaseConfigModal
        isOpen={firebaseModalOpen}
        onClose={() => setFirebaseModalOpen(false)}
      />

      <SecurityRulesModal
        isOpen={rulesModalOpen}
        onClose={() => setRulesModalOpen(false)}
      />

      {/* Quick Add Modals */}
      <ApkFormModal
        isOpen={quickAddType === 'apk'}
        onClose={() => setQuickAddType(null)}
      />

      <PromptFormModal
        isOpen={quickAddType === 'prompt'}
        onClose={() => setQuickAddType(null)}
      />

      <TemplateFormModal
        isOpen={quickAddType === 'template'}
        onClose={() => setQuickAddType(null)}
      />

      <CategoryFormModal
        isOpen={quickAddType === 'category'}
        onClose={() => setQuickAddType(null)}
      />

      {/* Toast System */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AdminDashboard />
      </DataProvider>
    </AuthProvider>
  );
}
