import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { GeneralSettings } from '../../types';
import { 
  Sliders, 
  Save, 
  Mail, 
  Upload, 
  AlertTriangle, 
  Globe, 
  Info, 
  Database, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const SiteSettings: React.FC = () => {
  const { generalSettings, saveGeneralSettings, uploadMedia, seedInitialDataToFirestore, isLoading } = useData();
  const { isConfigured, firebaseConfig, isDemoMode } = useAuth();

  const [siteName, setSiteName] = useState(generalSettings.siteName || 'PromptXHubl');
  const [contactEmail, setContactEmail] = useState(generalSettings.contactEmail || 'sojib76577@gmail.com');
  const [logoUrl, setLogoUrl] = useState(generalSettings.logoUrl || '');
  const [faviconUrl, setFaviconUrl] = useState(generalSettings.faviconUrl || '');
  const [aboutText, setAboutText] = useState(generalSettings.aboutText || '');
  const [footerText, setFooterText] = useState(generalSettings.footerText || '');
  const [publicWebsiteUrl, setPublicWebsiteUrl] = useState(generalSettings.publicWebsiteUrl || 'https://promptxhubl.com');
  const [maintenanceMode, setMaintenanceMode] = useState(generalSettings.maintenanceMode || false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(generalSettings.maintenanceMessage || '');

  // Social Links
  const [twitter, setTwitter] = useState(generalSettings.socialLinks?.twitter || '');
  const [telegram, setTelegram] = useState(generalSettings.socialLinks?.telegram || '');
  const [youtube, setYoutube] = useState(generalSettings.socialLinks?.youtube || '');
  const [instagram, setInstagram] = useState(generalSettings.socialLinks?.instagram || '');
  const [discord, setDiscord] = useState(generalSettings.socialLinks?.discord || '');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSiteName(generalSettings.siteName || 'PromptXHubl');
    setContactEmail(generalSettings.contactEmail || 'sojib76577@gmail.com');
    setLogoUrl(generalSettings.logoUrl || '');
    setFaviconUrl(generalSettings.faviconUrl || '');
    setAboutText(generalSettings.aboutText || '');
    setFooterText(generalSettings.footerText || '');
    setPublicWebsiteUrl(generalSettings.publicWebsiteUrl || 'https://promptxhubl.com');
    setMaintenanceMode(generalSettings.maintenanceMode || false);
    setMaintenanceMessage(generalSettings.maintenanceMessage || '');
    setTwitter(generalSettings.socialLinks?.twitter || '');
    setTelegram(generalSettings.socialLinks?.telegram || '');
    setYoutube(generalSettings.socialLinks?.youtube || '');
    setInstagram(generalSettings.socialLinks?.instagram || '');
    setDiscord(generalSettings.socialLinks?.discord || '');
  }, [generalSettings]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const mediaItem = await uploadMedia(file, 'icon');
      if (target === 'logo') {
        setLogoUrl(mediaItem.url);
      } else {
        setFaviconUrl(mediaItem.url);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await saveGeneralSettings({
        siteName: siteName.trim() || 'PromptXHubl',
        contactEmail: contactEmail.trim() || 'sojib76577@gmail.com',
        logoUrl: logoUrl.trim(),
        faviconUrl: faviconUrl.trim(),
        aboutText: aboutText.trim(),
        footerText: footerText.trim(),
        publicWebsiteUrl: publicWebsiteUrl.trim(),
        maintenanceMode,
        maintenanceMessage: maintenanceMessage.trim(),
        socialLinks: {
          twitter: twitter.trim(),
          telegram: telegram.trim(),
          youtube: youtube.trim(),
          instagram: instagram.trim(),
          discord: discord.trim(),
        },
        adminNotes: 'Configured for PromptXHubl Netlify standalone deployment',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to save settings:', err);
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
            <Sliders className="w-5 h-5 text-indigo-400" />
            Site Preferences &amp; General Settings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure default site identity, contact information, social profiles, and maintenance status
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Site Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Identity */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
            1. Brand &amp; Identity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Website Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="PromptXHubl"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Contact Email <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="sojib76577@gmail.com"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Specified in requirements: <code>sojib76577@gmail.com</code>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Public Website URL <span className="text-rose-400">*</span>
              </label>
              <input
                type="url"
                required
                value={publicWebsiteUrl}
                onChange={(e) => setPublicWebsiteUrl(e.target.value)}
                placeholder="https://promptxhubl.com"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Logo Image URL or Upload
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://.../logo.svg"
                  className="flex-1 bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                />
                <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium cursor-pointer flex items-center gap-1 shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'logo')}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Favicon URL or Upload
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  placeholder="https://.../favicon.ico"
                  className="flex-1 bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                />
                <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium cursor-pointer flex items-center gap-1 shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'favicon')}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                About Text (Homepage / Footer Blurb)
              </label>
              <textarea
                rows={3}
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                placeholder="PromptXHubl provides verified resources..."
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Footer Copyright Text
              </label>
              <textarea
                rows={3}
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="© 2026 PromptXHubl. All rights reserved."
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                2. Maintenance Mode Controls
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Displays a friendly maintenance notice on the public website without breaking admin access
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-[#070a12] px-3.5 py-2 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
              />
              <span className={`text-xs font-bold ${maintenanceMode ? 'text-amber-400' : 'text-slate-400'}`}>
                {maintenanceMode ? 'MAINTENANCE ACTIVE' : 'ONLINE / NORMAL'}
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Public Maintenance Notice Message
            </label>
            <textarea
              rows={2}
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="PromptXHubl is undergoing scheduled upgrades..."
              className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 outline-none"
            />
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
            3. Official Social Media Profiles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Twitter / X</label>
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://x.com/promptxhubl"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Telegram Community</label>
              <input
                type="url"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="https://t.me/promptxhubl"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">YouTube Channel</label>
              <input
                type="url"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://youtube.com/@promptxhubl"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Instagram</label>
              <input
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/promptxhubl"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Discord Server</label>
              <input
                type="url"
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                placeholder="https://discord.gg/promptxhubl"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Database & Deployment Information Card */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            4. Architecture &amp; Database State
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#070a12] rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Target Platform</span>
              <p className="text-xs font-semibold text-white mt-0.5">Netlify SPA (Independent)</p>
            </div>

            <div className="p-3 bg-[#070a12] rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Firebase Firestore</span>
              <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                {isConfigured ? `Project: ${firebaseConfig?.projectId}` : isDemoMode ? 'Sandbox Preview' : 'Not Connected'}
              </p>
            </div>

            <div className="p-3 bg-[#070a12] rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Firestore Collections</span>
              <p className="text-xs font-semibold text-slate-200 mt-0.5">
                /apkApps, /photoPrompts, /videoTemplates, /categories
              </p>
            </div>
          </div>

          {/* Firestore Seeding Action */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Seed Initial Sample Content to Firestore</p>
              <p className="text-[11px] text-slate-400">
                Quickly populates your connected Firestore database with initial PromptXHubl categories, APKs, and prompts.
              </p>
            </div>
            <button
              type="button"
              onClick={seedInitialDataToFirestore}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              Seed Database Now
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
