import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { FeaturedBannerConfig } from '../../types';
import { 
  Star, 
  Upload, 
  Save, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Smartphone, 
  Sparkles, 
  Film,
  ExternalLink
} from 'lucide-react';

export const FeaturedContentManager: React.FC = () => {
  const { 
    featuredConfig, 
    saveFeaturedConfig, 
    reorderFeaturedApks,
    apks, 
    prompts, 
    templates, 
    uploadMedia 
  } = useData();

  const [bannerTitle, setBannerTitle] = useState(featuredConfig.bannerTitle);
  const [bannerDescription, setBannerDescription] = useState(featuredConfig.bannerDescription);
  const [bannerImage, setBannerImage] = useState(featuredConfig.bannerImage);
  const [buttonLabel, setButtonLabel] = useState(featuredConfig.buttonLabel);
  const [destinationUrl, setDestinationUrl] = useState(featuredConfig.destinationUrl);
  const [isVisible, setIsVisible] = useState(featuredConfig.isVisible);
  const [order, setOrder] = useState(featuredConfig.order);

  const [selectedApkIds, setSelectedApkIds] = useState<string[]>(featuredConfig.featuredApkIds || []);
  const [selectedPromptIds, setSelectedPromptIds] = useState<string[]>(featuredConfig.featuredPromptIds || []);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>(featuredConfig.featuredTemplateIds || []);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setBannerTitle(featuredConfig.bannerTitle);
    setBannerDescription(featuredConfig.bannerDescription);
    setBannerImage(featuredConfig.bannerImage);
    setButtonLabel(featuredConfig.buttonLabel);
    setDestinationUrl(featuredConfig.destinationUrl);
    setIsVisible(featuredConfig.isVisible);
    setOrder(featuredConfig.order);
    setSelectedApkIds(featuredConfig.featuredApkIds || []);
    setSelectedPromptIds(featuredConfig.featuredPromptIds || []);
    setSelectedTemplateIds(featuredConfig.featuredTemplateIds || []);
  }, [featuredConfig]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const mediaItem = await uploadMedia(file, 'screenshot');
      setBannerImage(mediaItem.url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Banner upload failed');
    }
  };

  const toggleApkSelection = (id: string) => {
    setSelectedApkIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const togglePromptSelection = (id: string) => {
    setSelectedPromptIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleTemplateSelection = (id: string) => {
    setSelectedTemplateIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveFeaturedConfig({
        bannerTitle,
        bannerDescription,
        bannerImage,
        buttonLabel,
        destinationUrl,
        isVisible,
        order,
        featuredApkIds: selectedApkIds,
        featuredPromptIds: selectedPromptIds,
        featuredTemplateIds: selectedTemplateIds,
        updatedAt: new Date().toISOString(),
      });
      await reorderFeaturedApks(selectedApkIds);
    } catch (err) {
      console.error('Failed to save featured config:', err);
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
            <Star className="w-5 h-5 text-amber-400" />
            Homepage Featured Content Manager
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure hero banner and spotlight items that render instantly on the public PromptXHubl website
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-600/20 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save Homepage Config'}</span>
        </button>
      </div>

      {/* Main Hero Banner Editor */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Hero Spotlight Banner
            </h2>
            <p className="text-xs text-slate-400">
              Top showcase banner displayed on the public homepage header
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-[#070a12] px-3 py-1.5 rounded-xl border border-slate-800">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-200">
              {isVisible ? 'Banner Visible' : 'Banner Hidden'}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Banner Title
            </label>
            <input
              type="text"
              required
              value={bannerTitle}
              onChange={(e) => setBannerTitle(e.target.value)}
              placeholder="e.g. Exclusive 2026 MOD APKs &amp; Prompts"
              className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Banner Display Order
            </label>
            <input
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Banner Sub-Description
          </label>
          <textarea
            rows={2}
            value={bannerDescription}
            onChange={(e) => setBannerDescription(e.target.value)}
            placeholder="Crisp copy highlighting latest app releases, prompt formulas, or viral video presets..."
            className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Button CTA Label
            </label>
            <input
              type="text"
              value={buttonLabel}
              onChange={(e) => setButtonLabel(e.target.value)}
              placeholder="e.g. Explore Trending Prompts"
              className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Button Destination URL
            </label>
            <input
              type="url"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              placeholder="https://promptxhubl.com/prompts"
              className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 outline-none font-mono"
            />
          </div>
        </div>

        {/* Banner Image */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Banner Background Image URL or Upload
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              placeholder="https://.../banner.jpg"
              className="flex-1 bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none font-mono"
            />
            <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium cursor-pointer flex items-center gap-1.5 shrink-0">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Live Banner Preview Card */}
          {bannerImage && (
            <div className="mt-4 relative rounded-2xl overflow-hidden border border-slate-800 h-48 bg-black">
              <img src={bannerImage} alt="" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-6 flex flex-col justify-end">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  Live Public Banner Preview
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{bannerTitle || 'Banner Title'}</h3>
                <p className="text-xs text-slate-300 max-w-lg mt-0.5">{bannerDescription || 'Description'}</p>
                <div className="mt-3">
                  <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1">
                    {buttonLabel || 'Explore'} <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Featured Items Selection (APKs, Prompts, Video Templates) */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="pb-4 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            2. Featured Spotlight Grid Selection
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select items from your catalog to pin to the public homepage showcase
          </p>
        </div>

        {/* 1. Featured APKs */}
        <div>
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5 mb-3 uppercase tracking-wider">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            Featured APKs &amp; Games ({selectedApkIds.length} Selected)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {apks.filter(a => a.status === 'published').map((apk) => {
              const isSelected = selectedApkIds.includes(apk.id);
              return (
                <div
                  key={apk.id}
                  onClick={() => toggleApkSelection(apk.id)}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md'
                      : 'bg-[#070a12] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img src={apk.appIcon} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-800" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{apk.title}</p>
                    <p className="text-[11px] text-slate-400">{apk.category} · {apk.version}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Featured Photo Prompts */}
        <div>
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5 mb-3 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Featured Photo Prompts ({selectedPromptIds.length} Selected)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {prompts.filter(p => p.status === 'published').map((prompt) => {
              const isSelected = selectedPromptIds.includes(prompt.id);
              return (
                <div
                  key={prompt.id}
                  onClick={() => togglePromptSelection(prompt.id)}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500/60 shadow-md'
                      : 'bg-[#070a12] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img src={prompt.previewImage} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-800" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{prompt.title}</p>
                    <p className="text-[11px] text-slate-400">{prompt.aiPlatform}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Featured Video Templates */}
        <div>
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5 mb-3 uppercase tracking-wider">
            <Film className="w-4 h-4 text-cyan-400" />
            Featured Video Templates ({selectedTemplateIds.length} Selected)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {templates.filter(t => t.status === 'published').map((tpl) => {
              const isSelected = selectedTemplateIds.includes(tpl.id);
              return (
                <div
                  key={tpl.id}
                  onClick={() => toggleTemplateSelection(tpl.id)}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md'
                      : 'bg-[#070a12] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img src={tpl.thumbnail} alt="" className="w-12 h-8 rounded-xl object-cover shrink-0 border border-slate-800" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{tpl.title}</p>
                    <p className="text-[11px] text-slate-400">{tpl.editingPlatform}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
