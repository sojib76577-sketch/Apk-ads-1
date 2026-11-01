import React from 'react';
import { useData } from '../../context/DataContext';
import { ActiveNav, ContentStatus } from '../../types';
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
  Flame,
  ArrowUpRight
} from 'lucide-react';

interface DashboardOverviewProps {
  onNavigate: (nav: ActiveNav) => void;
  onQuickAdd: (type: 'apk' | 'prompt' | 'template' | 'category') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate, onQuickAdd }) => {
  const { apks, prompts, templates, generalSettings } = useData();

  // 1. Live statistics from Firestore (computed from real data collections)
  const totalApkApps = apks.filter(a => a.category === 'MOD Apps').length;
  const totalApkGames = apks.filter(a => a.category === 'MOD Games').length;
  const totalPhotoPrompts = prompts.length;
  const totalVideoTemplates = templates.length;

  const allItems = [
    ...apks.map(a => ({ ...a, itemType: 'APK' as const })),
    ...prompts.map(p => ({ ...p, itemType: 'Photo Prompt' as const })),
    ...templates.map(t => ({ ...t, itemType: 'Video Template' as const })),
  ];

  const totalPublished = allItems.filter(item => item.status === 'published').length;
  const totalDraft = allItems.filter(item => item.status === 'draft').length;
  const totalUnpublished = allItems.filter(item => item.status === 'unpublished').length;

  const totalPromptLoves = prompts.reduce((sum, p) => sum + (p.lovesCount || 0), 0) +
                           apks.reduce((sum, a) => sum + (a.lovesCount || 0), 0);

  // Recently added (sorted by createdAt descending)
  const recentlyAdded = [...allItems]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Recently updated (sorted by updatedAt descending)
  const recentlyUpdated = [...allItems]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Recent publishing activity
  const recentPublished = allItems
    .filter(i => i.status === 'published')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'published':
        return <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Published</span>;
      case 'draft':
        return <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Draft</span>;
      case 'unpublished':
        return <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">Unpublished</span>;
    }
  };

  const statCards = [
    {
      label: 'Total APK Apps',
      value: totalApkApps,
      icon: Smartphone,
      gradient: 'from-blue-600 to-cyan-500',
      action: () => onNavigate('apk-manager'),
      subtext: 'Android utilities & mod apps',
    },
    {
      label: 'Total APK Games',
      value: totalApkGames,
      icon: Gamepad2,
      gradient: 'from-indigo-600 to-purple-600',
      action: () => onNavigate('apk-manager'),
      subtext: 'High-FPS modded mobile games',
    },
    {
      label: 'Photo Editing Prompts',
      value: totalPhotoPrompts,
      icon: Sparkles,
      gradient: 'from-purple-600 to-pink-500',
      action: () => onNavigate('photo-prompt-manager'),
      subtext: 'Midjourney, Flux, SDXL formulas',
    },
    {
      label: 'Video Templates',
      value: totalVideoTemplates,
      icon: Film,
      gradient: 'from-cyan-600 to-blue-500',
      action: () => onNavigate('video-template-manager'),
      subtext: 'CapCut, Premiere, XML templates',
    },
    {
      label: 'Published Items',
      value: totalPublished,
      icon: CheckCircle2,
      gradient: 'from-emerald-600 to-teal-500',
      action: () => onNavigate('apk-manager'),
      subtext: 'Live & visible on public site',
    },
    {
      label: 'Draft Items',
      value: totalDraft,
      icon: FileText,
      gradient: 'from-amber-600 to-orange-500',
      action: () => onNavigate('apk-manager'),
      subtext: 'Under admin review',
    },
    {
      label: 'Unpublished Items',
      value: totalUnpublished,
      icon: EyeOff,
      gradient: 'from-rose-600 to-red-500',
      action: () => onNavigate('apk-manager'),
      subtext: 'Hidden from public visitors',
    },
    {
      label: 'Total Prompt Loves',
      value: totalPromptLoves.toLocaleString(),
      icon: Heart,
      gradient: 'from-pink-600 to-rose-500',
      action: () => onNavigate('engagement'),
      subtext: 'Real public engagement hearts',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#0f172a] border border-slate-800/80 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              PromptXHubl Live Cloud
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white mt-1">
            System Overview &amp; Control
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Managing public content catalog for {generalSettings.siteName}. All counts and actions are synced directly with your Firebase Firestore instance.
          </p>
        </div>

        {/* Quick Add Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => onQuickAdd('apk')}
            className="px-3.5 py-2 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New APK
          </button>
          <button
            onClick={() => onQuickAdd('prompt')}
            className="px-3.5 py-2 bg-purple-600/90 hover:bg-purple-600 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            New Prompt
          </button>
          <button
            onClick={() => onQuickAdd('template')}
            className="px-3.5 py-2 bg-cyan-600/90 hover:bg-cyan-600 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Film className="w-3.5 h-3.5" />
            New Template
          </button>
        </div>
      </div>

      {/* 8 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.action}
              className="bg-[#0f172a]/90 hover:bg-[#131d36] border border-slate-800/80 rounded-2xl p-5 shadow-lg transition-all duration-200 group cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 group-hover:text-slate-300">
                    {card.label}
                  </p>
                  <h3 className="text-2xl font-extrabold text-white mt-1.5 tracking-tight">
                    {card.value}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {card.subtext}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${card.gradient} text-white shadow-md shadow-indigo-950`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Status Overview Bar */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Flame className="w-4 h-4 text-indigo-400" />
            Publishing Status Distribution
          </h3>
          <span className="text-xs font-medium text-slate-400">
            Total Content: {allItems.length}
          </span>
        </div>

        {allItems.length > 0 ? (
          <div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${(totalPublished / allItems.length) * 100}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`Published: ${totalPublished}`}
              />
              <div
                style={{ width: `${(totalDraft / allItems.length) * 100}%` }}
                className="bg-amber-500 h-full transition-all duration-500"
                title={`Draft: ${totalDraft}`}
              />
              <div
                style={{ width: `${(totalUnpublished / allItems.length) * 100}%` }}
                className="bg-rose-500 h-full transition-all duration-500"
                title={`Unpublished: ${totalUnpublished}`}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Published ({totalPublished})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Draft ({totalDraft})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Unpublished ({totalUnpublished})
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">No content items recorded yet.</p>
        )}
      </div>

      {/* Two Column Layout: Recently Added & Recently Updated */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Added Content */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Recently Added Content
            </h3>
            <span className="text-[11px] text-slate-400">Latest Created</span>
          </div>

          <div className="divide-y divide-slate-800/80 flex-1">
            {recentlyAdded.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {'appIcon' in item && item.appIcon ? (
                      <img src={item.appIcon} alt="" className="w-full h-full object-cover" />
                    ) : 'previewImage' in item && item.previewImage ? (
                      <img src={item.previewImage} alt="" className="w-full h-full object-cover" />
                    ) : 'thumbnail' in item && item.thumbnail ? (
                      <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {item.itemType} · {item.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {getStatusBadge(item.status)}
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Updated & Publishing Activity */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Recent Publishing &amp; Updates
            </h3>
            <span className="text-[11px] text-slate-400">Live Changes</span>
          </div>

          <div className="divide-y divide-slate-800/80 flex-1">
            {recentlyUpdated.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                  <p className="text-[11px] text-slate-400">
                    Modified: {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' · '}
                    {item.itemType}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {getStatusBadge(item.status)}
                  {item.featured && (
                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      Featured
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
