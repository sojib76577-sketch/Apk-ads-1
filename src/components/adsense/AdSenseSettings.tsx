import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { AdSenseSettings as AdSenseSettingsType } from '../../types';
import { 
  DollarSign, 
  Save, 
  ShieldCheck, 
  Copy, 
  Check, 
  Download, 
  AlertTriangle, 
  FileText,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export const AdSenseSettings: React.FC = () => {
  const { adsenseSettings, saveAdSenseSettings } = useData();

  const [publisherId, setPublisherId] = useState(adsenseSettings.publisherId || 'pub-8520963162864667');
  const [enabled, setEnabled] = useState(adsenseSettings.enabled);
  const [autoAds, setAutoAds] = useState(adsenseSettings.autoAds);
  const [headerBanner, setHeaderBanner] = useState(adsenseSettings.slots?.headerBanner || false);
  const [inContentBanner, setInContentBanner] = useState(adsenseSettings.slots?.inContentBanner || false);
  const [sidebarRectangle, setSidebarRectangle] = useState(adsenseSettings.slots?.sidebarRectangle || false);
  const [footerBanner, setFooterBanner] = useState(adsenseSettings.slots?.footerBanner || false);

  const [isSaving, setIsSaving] = useState(false);
  const [copiedAdsTxt, setCopiedAdsTxt] = useState(false);

  useEffect(() => {
    setPublisherId(adsenseSettings.publisherId || 'pub-8520963162864667');
    setEnabled(adsenseSettings.enabled);
    setAutoAds(adsenseSettings.autoAds);
    setHeaderBanner(adsenseSettings.slots?.headerBanner || false);
    setInContentBanner(adsenseSettings.slots?.inContentBanner || false);
    setSidebarRectangle(adsenseSettings.slots?.sidebarRectangle || false);
    setFooterBanner(adsenseSettings.slots?.footerBanner || false);
  }, [adsenseSettings]);

  const adsTxtString = `google.com, ${publisherId || 'pub-8520963162864667'}, DIRECT, f08c47fec0942fa0`;

  const handleCopyAdsTxt = () => {
    navigator.clipboard.writeText(adsTxtString);
    setCopiedAdsTxt(true);
    setTimeout(() => setCopiedAdsTxt(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveAdSenseSettings({
        publisherId: publisherId.trim() || 'pub-8520963162864667',
        enabled,
        adsTxtVerified: true,
        autoAds,
        slots: {
          headerBanner,
          inContentBanner,
          sidebarRectangle,
          footerBanner,
        },
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to save AdSense settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Google AdSense Settings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure publisher ID, ad placements, and automated ads.txt compliance
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save AdSense Settings'}</span>
        </button>
      </div>

      {/* Compliance Policy Banner */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-start gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">Google AdSense Policy Guardrails</p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px]">
            <li>Keep ads disabled until your site receives official AdSense domain approval.</li>
            <li>AdSense code is never placed deceptively close to Download, Copy Prompt, or Navigation links.</li>
            <li>Never claim or guarantee AdSense approval in public copy.</li>
          </ul>
        </div>
      </div>

      {/* Core AdSense Settings */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                1. Publisher ID &amp; Master Switch
              </h2>
              <p className="text-xs text-slate-400">
                Supplied by website owner: pub-8520963162864667
              </p>
            </div>

            {/* Master Activation Toggle */}
            <div className="flex items-center gap-3 bg-[#070a12] px-3.5 py-2 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-white">AdSense Integration:</span>
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`text-xs font-bold px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {enabled ? 'ACTIVATED' : 'DISABLED'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Publisher ID <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={publisherId}
                onChange={(e) => setPublisherId(e.target.value)}
                placeholder="pub-8520963162864667"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-emerald-300 font-mono focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Auto-Ads Optimization
              </label>
              <select
                value={autoAds ? 'true' : 'false'}
                onChange={(e) => setAutoAds(e.target.value === 'true')}
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 outline-none cursor-pointer"
              >
                <option value="false">Manual Ad Placements Only (Recommended for Clean UX)</option>
                <option value="true">Enable Google Auto-Ads Engine</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ad Placements Management */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              2. Allowed Ad Slot Placements
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Control which sections of the public website are permitted to render ads
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="p-3.5 bg-[#070a12] rounded-2xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors">
              <div>
                <p className="text-xs font-semibold text-white">Header Leaderboard Banner</p>
                <p className="text-[11px] text-slate-400">Top of catalog pages (728x90 / responsive)</p>
              </div>
              <input
                type="checkbox"
                checked={headerBanner}
                onChange={(e) => setHeaderBanner(e.target.checked)}
                className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="p-3.5 bg-[#070a12] rounded-2xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors">
              <div>
                <p className="text-xs font-semibold text-white">In-Content Article Banner</p>
                <p className="text-[11px] text-slate-400">Inside long APK/Prompt guide articles</p>
              </div>
              <input
                type="checkbox"
                checked={inContentBanner}
                onChange={(e) => setInContentBanner(e.target.checked)}
                className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="p-3.5 bg-[#070a12] rounded-2xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors">
              <div>
                <p className="text-xs font-semibold text-white">Sidebar Rectangle</p>
                <p className="text-[11px] text-slate-400">Desktop sidebar widget (300x250)</p>
              </div>
              <input
                type="checkbox"
                checked={sidebarRectangle}
                onChange={(e) => setSidebarRectangle(e.target.checked)}
                className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="p-3.5 bg-[#070a12] rounded-2xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors">
              <div>
                <p className="text-xs font-semibold text-white">Footer Banner</p>
                <p className="text-[11px] text-slate-400">Above site footer copyright section</p>
              </div>
              <input
                type="checkbox"
                checked={footerBanner}
                onChange={(e) => setFooterBanner(e.target.checked)}
                className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* ads.txt Configuration Generator */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                ads.txt File Configuration
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Place this snippet in your public website root /ads.txt for verification
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyAdsTxt}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              {copiedAdsTxt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAdsTxt ? 'Copied ads.txt!' : 'Copy Line'}</span>
            </button>
          </div>

          <div className="p-3 bg-[#070a12] rounded-xl border border-slate-800 font-mono text-xs text-emerald-300">
            <code>{adsTxtString}</code>
          </div>
        </div>
      </form>
    </div>
  );
};
