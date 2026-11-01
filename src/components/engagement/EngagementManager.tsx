import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { 
  HeartHandshake, 
  Heart, 
  Eye, 
  Flame, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  Smartphone, 
  Film,
  Lock
} from 'lucide-react';

export const EngagementManager: React.FC = () => {
  const { prompts, apks, templates } = useData();

  // Prompt love counts & rankings
  const mostLovedPrompts = useMemo(() => {
    return [...prompts]
      .sort((a, b) => (b.lovesCount || 0) - (a.lovesCount || 0))
      .slice(0, 5);
  }, [prompts]);

  // Most viewed across all content
  const mostViewedContent = useMemo(() => {
    const list = [
      ...prompts.map(p => ({ ...p, type: 'Prompt' })),
      ...apks.map(a => ({ ...a, type: 'APK' })),
      ...templates.map(t => ({ ...t, type: 'Video Template' })),
    ];
    return list
      .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
      .slice(0, 6);
  }, [prompts, apks, templates]);

  const totalHearts = prompts.reduce((acc, p) => acc + (p.lovesCount || 0), 0) +
                      apks.reduce((acc, a) => acc + (a.lovesCount || 0), 0);

  const totalViews = prompts.reduce((acc, p) => acc + (p.viewsCount || 0), 0) +
                     apks.reduce((acc, a) => acc + (a.viewsCount || 0), 0) +
                     templates.reduce((acc, t) => acc + (t.viewsCount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-pink-400" />
            Love &amp; Popular Content Engagement
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real public community love hearts, verified page views, and popular trending resources
          </p>
        </div>
      </div>

      {/* Strict Anti-Manipulation Notice */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-start gap-3 text-xs">
        <Lock className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
        <div className="text-slate-300 leading-relaxed">
          <p className="font-semibold text-white">Zero-Manipulation Policy Enforced</p>
          <p className="mt-0.5">
            Per system security guidelines: Administrators cannot artificially increment or falsify engagement numbers. Hearts and views are read-only metrics fed directly by genuine public visitor actions in Firestore (rate-limited via client IP/fingerprinting to prevent spam).
          </p>
        </div>
      </div>

      {/* Top Engagement Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Community Loves</p>
            <h3 className="text-2xl font-extrabold text-pink-400 mt-1 flex items-center gap-1.5">
              <Heart className="w-5 h-5 fill-pink-400" />
              {totalHearts.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Genuine hearts recorded</p>
          </div>
          <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Verified Views</p>
            <h3 className="text-2xl font-extrabold text-cyan-400 mt-1 flex items-center gap-1.5">
              <Eye className="w-5 h-5" />
              {totalViews.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Tracked content impressions</p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Community Engagement Ratio</p>
            <h3 className="text-2xl font-extrabold text-indigo-400 mt-1">
              {totalViews > 0 ? ((totalHearts / totalViews) * 100).toFixed(1) : 0}%
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Loves per 100 views</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Column Ranking Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Loved Prompts */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
              Most Loved Prompts
            </h3>
            <span className="text-[11px] text-slate-400">Top 5</span>
          </div>

          <div className="divide-y divide-slate-800/80 mt-1">
            {mostLovedPrompts.map((p, idx) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-center font-bold text-slate-400 text-xs shrink-0">
                    #{idx + 1}
                  </span>
                  <img
                    src={p.previewImage}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{p.title}</p>
                    <p className="text-[11px] text-slate-400">{p.aiPlatform} · {p.category}</p>
                  </div>
                </div>

                <div className="px-3 py-1 bg-pink-950/40 border border-pink-500/30 rounded-xl text-pink-300 font-bold text-xs flex items-center gap-1.5 shrink-0">
                  <Heart className="w-3.5 h-3.5 fill-pink-400" />
                  <span>{p.lovesCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Viewed Content Overall */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Most Viewed Content Overall
            </h3>
            <span className="text-[11px] text-slate-400">All Content Types</span>
          </div>

          <div className="divide-y divide-slate-800/80 mt-1">
            {mostViewedContent.map((item, idx) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-center font-bold text-slate-400 text-xs shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400">{item.type} · {item.category}</p>
                  </div>
                </div>

                <div className="px-3 py-1 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-cyan-300 font-bold text-xs flex items-center gap-1.5 shrink-0">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{item.viewsCount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
