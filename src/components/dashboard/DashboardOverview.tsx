import React from 'react';
import { useData } from '../../context/DataContext';
import { ActiveNav, ContentStatus, ApkItem } from '../../types';
import { 
  Smartphone, 
  Gamepad2, 
  Sparkles, 
  Film, 
  CheckCircle2, 
  FileText, 
  EyeOff, 
  Heart, 
  Plus, 
  Clock, 
  ExternalLink,
  Star,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Download
} from 'lucide-react';

interface DashboardOverviewProps {
  onNavigate: (nav: ActiveNav) => void;
  onQuickAdd: (type: 'apk' | 'prompt' | 'template' | 'category') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate, onQuickAdd }) => {
  const { apks, prompts, templates, togglePinApk } = useData();

  // 1. Live statistics calculated directly from Firestore state
  const totalApks = apks.length;
  const publishedApks = apks.filter(a => a.status === 'published').length;
  const draftApks = apks.filter(a => a.status === 'draft').length;
  const modAppsCount = apks.filter(a => a.category === 'MOD Apps').length;
  const modGamesCount = apks.filter(a => a.category === 'MOD Games').length;
  const featuredApksCount = apks.filter(a => a.featured).length;

  // Additional content statistics
  const totalPhotoPrompts = prompts.length;
  const totalVideoTemplates = templates.length;

  // Recent APK Uploads (sorted by createdAt or updatedAt descending)
  const recentApkUploads = [...apks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Top Pinned APKs (Homepage Featured Order)
  const topPinnedApks = [...apks]
    .filter(a => a.featured)
    .sort((a, b) => {
      const orderA = a.featuredOrder || a.pinOrder || 999;
      const orderB = b.featuredOrder || b.pinOrder || 999;
      return orderA - orderB;
    })
    .slice(0, 4);

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            Draft
          </span>
        );
      case 'unpublished':
        return (
          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            Unpublished
          </span>
        );
    }
  };

  // Primary 6 Required APK Statistics Cards
  const apkStatCards = [
    {
      label: 'Total APKs',
      value: totalApks,
      icon: Smartphone,
      gradient: 'from-indigo-600 via-purple-600 to-blue-600',
      borderGlow: 'border-indigo-500/30',
      textGlow: 'text-indigo-400',
      action: () => onNavigate('apk-manager'),
      subtext: 'Catalog repository in /apkApps',
    },
    {
      label: 'Published APKs',
      value: publishedApks,
      icon: CheckCircle2,
      gradient: 'from-emerald-600 to-teal-500',
      borderGlow: 'border-emerald-500/30',
      textGlow: 'text-emerald-400',
      action: () => onNavigate('apk-manager'),
      subtext: 'Live on PromptXHubl website',
    },
    {
      label: 'Draft APKs',
      value: draftApks,
      icon: FileText,
      gradient: 'from-amber-600 to-orange-500',
      borderGlow: 'border-amber-500/30',
      textGlow: 'text-amber-400',
      action: () => onNavigate('apk-manager'),
      subtext: 'Pending admin review or test',
    },
    {
      label: 'MOD Apps',
      value: modAppsCount,
      icon: Smartphone,
      gradient: 'from-blue-600 to-cyan-500',
      borderGlow: 'border-blue-500/30',
      textGlow: 'text-cyan-400',
      action: () => onNavigate('apk-manager'),
      subtext: 'Unlocked Android utilities',
    },
    {
      label: 'MOD Games',
      value: modGamesCount,
      icon: Gamepad2,
      gradient: 'from-emerald-500 via-teal-600 to-green-600',
      borderGlow: 'border-emerald-500/40',
      textGlow: 'text-emerald-300',
      action: () => onNavigate('apk-manager'),
      subtext: 'High-FPS modded mobile games',
      highlightBadge: 'Green Accent',
    },
    {
      label: 'Featured / Pinned',
      value: featuredApksCount,
      icon: Star,
      gradient: 'from-amber-500 to-yellow-600',
      borderGlow: 'border-amber-500/40',
      textGlow: 'text-amber-300',
      action: () => onNavigate('apk-manager'),
      subtext: 'Pinned to Homepage Top',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-[#0b0f19] via-[#101728] to-[#0b0f19] border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              PromptXHubl CMS
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              MOD APK Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Admin Dashboard Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live statistics and control center for PromptXHubl Android MOD APKs, Games, and AI Prompts.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onQuickAdd('apk')}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New APK</span>
          </button>
          <button
            onClick={() => onNavigate('apk-manager')}
            className="px-3.5 py-2.5 bg-[#070a12] hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Manage APKs</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 6 Core Statistics Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Real-time MOD APK Statistics (Firebase)</span>
          </h2>
          <span className="text-[11px] text-slate-500">Live synchronized</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {apkStatCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                onClick={card.action}
                className={`bg-[#0f172a] hover:bg-[#131d35] border ${card.borderGlow} rounded-2xl p-4 shadow-lg transition-all cursor-pointer group hover:scale-[1.02] flex flex-col justify-between`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {card.label}
                  </span>
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-md`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="my-2">
                  <div className={`text-2xl sm:text-3xl font-black ${card.textGlow}`}>
                    {card.value}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 truncate">
                  {card.subtext}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secondary Quick Metrics: Prompts & Video Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div 
          onClick={() => onNavigate('photo-prompt-manager')}
          className="p-4 bg-[#0f172a] hover:bg-[#131d35] border border-purple-500/20 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Photo Editing Prompts</p>
              <p className="text-[11px] text-slate-400">Midjourney, Flux, SDXL copyable prompts</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-purple-300">{totalPhotoPrompts}</span>
            <p className="text-[10px] text-slate-400">Prompts</p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('video-template-manager')}
          className="p-4 bg-[#0f172a] hover:bg-[#131d35] border border-cyan-500/20 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Video Templates</p>
              <p className="text-[11px] text-slate-400">CapCut, Premiere XML presets</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-cyan-300">{totalVideoTemplates}</span>
            <p className="text-[10px] text-slate-400">Templates</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent APK Uploads + Homepage Pinned Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Uploads */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Recent APK Uploads</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Recently saved documents in Firebase collection <code>/apkApps</code>
              </p>
            </div>

            <button
              onClick={() => onNavigate('apk-manager')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentApkUploads.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No APK uploads found in Firestore. Click &quot;Add New APK&quot; to create your first item.
              </div>
            ) : (
              recentApkUploads.map((apk) => {
                const isGame = apk.category === 'MOD Games';
                const isPinned = apk.featured;

                return (
                  <div
                    key={apk.id}
                    className="p-3 bg-[#070a12] hover:bg-[#0b0f19] border border-slate-800/80 rounded-2xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={apk.appIcon || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&auto=format&fit=crop&q=80'}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white truncate">{apk.title}</p>
                          {isPinned && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold uppercase shrink-0">
                              Pinned
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {apk.version} · {apk.fileSize} {apk.developerName ? `· ${apk.developerName}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isGame 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                      }`}>
                        {apk.category}
                      </span>

                      {getStatusBadge(apk.status)}

                      <button
                        type="button"
                        onClick={() => togglePinApk(apk.id)}
                        className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                          isPinned
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-amber-400'
                        }`}
                        title={isPinned ? 'Unpin from Top' : 'Pin to Homepage Top'}
                      >
                        <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Pinned to Homepage Top Spotlight */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Homepage Top Pinned
                  </h3>
                  <span className="text-[10px] text-slate-400">Rendered before regular cards</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('apk-manager')}
                className="text-[11px] text-amber-400 hover:underline font-bold cursor-pointer"
              >
                Reorder
              </button>
            </div>

            {topPinnedApks.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No APKs pinned yet. Pin items to feature them at the top of the Homepage.
              </div>
            ) : (
              <div className="space-y-2">
                {topPinnedApks.map((pinned, i) => {
                  const isGame = pinned.category === 'MOD Games';
                  return (
                    <div
                      key={pinned.id}
                      className="p-2.5 bg-[#070a12] border border-amber-500/30 rounded-2xl flex items-center gap-2.5"
                    >
                      <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold text-[11px] flex items-center justify-center shrink-0">
                        #{i + 1}
                      </span>
                      <img
                        src={pinned.appIcon || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&auto=format&fit=crop&q=80'}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover border border-slate-800 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{pinned.title}</p>
                        <p className="text-[10px] text-slate-400">{pinned.category} · {pinned.version}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={() => onNavigate('apk-manager')}
              className="w-full py-2.5 bg-gradient-to-r from-amber-600/30 to-indigo-600/30 hover:from-amber-600/40 hover:to-indigo-600/40 text-amber-200 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5" />
              <span>Manage &amp; Reorder Pinned APKs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
