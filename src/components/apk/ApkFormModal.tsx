import React, { useState, useEffect } from 'react';
import { ApkItem, ApkCategory, ContentStatus } from '../../types';
import { useData } from '../../context/DataContext';
import { 
  X, 
  Smartphone, 
  Gamepad2,
  Upload, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  ExternalLink, 
  AlertTriangle, 
  Check, 
  Star,
  FileCode2,
  Sparkles,
  Link,
  Calendar,
  Layers,
  History
} from 'lucide-react';

interface ApkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ApkItem | null;
}

export const ApkFormModal: React.FC<ApkFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { saveApk, uploadMedia } = useData();

  // Core fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [appIcon, setAppIcon] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [newScreenshotUrl, setNewScreenshotUrl] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [category, setCategory] = useState<ApkCategory>('MOD Apps');
  const [version, setVersion] = useState('v1.0.0');
  const [fileSize, setFileSize] = useState('');
  const [androidRequirements, setAndroidRequirements] = useState('Android 9.0+');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [officialSourceUrl, setOfficialSourceUrl] = useState('');
  const [developerName, setDeveloperName] = useState('');
  const [packageName, setPackageName] = useState('');
  const [changelog, setChangelog] = useState('');
  const [licenseInfo, setLicenseInfo] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoTags, setSeoTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Featured / Pin to Homepage Top
  const [featured, setFeatured] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState<number>(0);
  
  // Status & Submit state
  const [status, setStatus] = useState<ContentStatus>('draft');
  const [legalConfirmation, setLegalConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || initialData.name || '');
      setSlug(initialData.slug || '');
      setAppIcon(initialData.appIcon || initialData.iconUrl || '');
      setCoverImage(initialData.coverImage || initialData.coverImageUrl || '');
      setScreenshots(initialData.screenshots || []);
      setShortDescription(initialData.shortDescription || initialData.description || '');
      setFullDescription(initialData.fullDescription || '');
      setCategory(initialData.category || 'MOD Apps');
      setVersion(initialData.version || '');
      setFileSize(initialData.fileSize || '');
      setAndroidRequirements(initialData.androidRequirements || 'Android 9.0+');
      setDownloadUrl(initialData.downloadUrl || '');
      setOfficialSourceUrl(initialData.officialSourceUrl || initialData.sourceUrl || '');
      setDeveloperName(initialData.developerName || '');
      setPackageName(initialData.packageName || '');
      setChangelog(initialData.changelog || '');
      setLicenseInfo(initialData.licenseInfo || '');
      setSeoTitle(initialData.seoTitle || '');
      setSeoDescription(initialData.seoDescription || '');
      setSeoTags(initialData.seoTags || []);
      setFeatured(Boolean(initialData.featured));
      setFeaturedOrder(initialData.featuredOrder || initialData.pinOrder || 0);
      setStatus(initialData.status || 'draft');
      setLegalConfirmation(true);
    } else {
      setTitle('');
      setSlug('');
      setAppIcon('');
      setCoverImage('');
      setScreenshots([]);
      setShortDescription('');
      setFullDescription('');
      setCategory('MOD Apps');
      setVersion('v1.0.0');
      setFileSize('');
      setAndroidRequirements('Android 9.0+');
      setDownloadUrl('');
      setOfficialSourceUrl('');
      setDeveloperName('');
      setPackageName('');
      setChangelog('');
      setLicenseInfo('Authorized distribution with developer permission.');
      setSeoTitle('');
      setSeoDescription('');
      setSeoTags(['android mod', 'free apk', 'mod apk']);
      setFeatured(false);
      setFeaturedOrder(0);
      setStatus('draft');
      setLegalConfirmation(false);
    }
    setSubmitError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!initialData) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
      setSeoTitle(`${val} APK Download for Android - PromptXHubl`);
    }
  };

  const handleAddScreenshot = () => {
    if (newScreenshotUrl.trim() && !screenshots.includes(newScreenshotUrl.trim())) {
      setScreenshots([...screenshots, newScreenshotUrl.trim()]);
      setNewScreenshotUrl('');
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !seoTags.includes(tagInput.trim().toLowerCase())) {
      setSeoTags([...seoTags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSeoTags(seoTags.filter(t => t !== tag));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'icon' | 'cover' | 'screenshot') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const mediaItem = await uploadMedia(file, target === 'icon' ? 'icon' : 'screenshot');
      if (target === 'icon') {
        setAppIcon(mediaItem.url);
      } else if (target === 'cover') {
        setCoverImage(mediaItem.url);
      } else {
        setScreenshots(prev => [...prev, mediaItem.url]);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const validateUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const executeSave = async (targetStatus: ContentStatus) => {
    // 1. Validation
    if (!title.trim()) {
      setSubmitError('APK Name is required.');
      return;
    }

    if (!category) {
      setSubmitError('Category is required (MOD Apps or MOD Games).');
      return;
    }

    if (!version.trim()) {
      setSubmitError('Version is required (e.g. v1.2.0).');
      return;
    }

    if (!downloadUrl.trim()) {
      setSubmitError('APK Download URL is required.');
      return;
    }

    if (!validateUrl(downloadUrl.trim())) {
      setSubmitError('Invalid Download URL format. Must start with http:// or https://');
      return;
    }

    if (officialSourceUrl.trim() && !validateUrl(officialSourceUrl.trim())) {
      setSubmitError('Invalid Official Source URL. Must start with http:// or https://');
      return;
    }

    if (targetStatus === 'published' && !legalConfirmation) {
      setSubmitError('Admin legal confirmation checkbox must be checked before publishing to ensure authorized distribution.');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await saveApk({
        id: initialData?.id,
        title: title.trim(),
        name: title.trim(),
        slug: (slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')),
        appIcon: appIcon.trim() || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&auto=format&fit=crop&q=80',
        coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1000&auto=format&fit=crop&q=80',
        screenshots,
        shortDescription: shortDescription.trim() || 'Unlocked features with enhanced Android performance.',
        fullDescription: fullDescription.trim(),
        category,
        version: version.trim(),
        fileSize: fileSize.trim() || '45 MB',
        androidRequirements: androidRequirements.trim() || 'Android 9.0+',
        downloadUrl: downloadUrl.trim(),
        officialSourceUrl: officialSourceUrl.trim(),
        developerName: developerName.trim() || 'Verified MOD Developer',
        packageName: packageName.trim(),
        changelog: changelog.trim(),
        licenseInfo: licenseInfo.trim() || 'Authorized distribution build with publisher consent.',
        seoTitle: (seoTitle || title).trim(),
        seoDescription: (seoDescription || shortDescription).trim(),
        seoTags,
        featured,
        featuredOrder: featured ? (featuredOrder > 0 ? featuredOrder : undefined) : 0,
        pinOrder: featured ? (featuredOrder > 0 ? featuredOrder : undefined) : 0,
        status: targetStatus,
        lovesCount: initialData?.lovesCount || 0,
        viewsCount: initialData?.viewsCount || 0,
      });

      onClose();
    } catch (err: unknown) {
      console.error('Failed to save APK:', err);
      const errMsg = err instanceof Error ? err.message : 'Unknown Firestore error occurred';
      setSubmitError(`Firebase Save Failed: ${errMsg}. Please verify your connection or rules and try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isModGame = category === 'MOD Games';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-[#0b0f19] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative my-6 text-left max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border transition-colors ${
              isModGame 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-lg shadow-indigo-500/10'
            }`}>
              {isModGame ? <Gamepad2 className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {initialData ? 'Edit APK Item' : 'Add New APK / Game'}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  isModGame 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                }`}>
                  {category}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Synchronized with PromptXHubl Main Website Firestore collection: <code className="text-indigo-300">/apkApps</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            executeSave(status);
          }} 
          className="flex-1 overflow-y-auto pr-1 py-4 space-y-5"
        >
          {/* Error Banner */}
          {submitError && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-xs text-rose-200 flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Validation / Error Notice:</span> {submitError}
              </div>
            </div>
          )}

          {/* Section 1: Essential Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                APK Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. PixelCam Ultra HDR Studio"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ApkCategory)}
                className={`w-full bg-[#070a12] border rounded-xl px-3.5 py-2 text-xs font-semibold outline-none cursor-pointer transition-colors ${
                  category === 'MOD Games' 
                    ? 'border-emerald-500/50 text-emerald-300' 
                    : 'border-indigo-500/50 text-indigo-300'
                }`}
              >
                <option value="MOD Apps" className="bg-[#0b0f19] text-white">MOD Apps</option>
                <option value="MOD Games" className="bg-[#0b0f19] text-white">MOD Games</option>
              </select>
            </div>
          </div>

          {/* URL Slug & Package Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                URL Slug <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="pixelcam-ultra-hdr-studio"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Android Package Name (Optional)</span>
                <span className="text-[10px] text-slate-500 font-normal">e.g. com.example.app</span>
              </label>
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="com.nexus.pixelcam"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Download URL Section (Highlighted) */}
          <div className="p-4 bg-gradient-to-r from-indigo-950/20 via-purple-950/20 to-blue-950/20 border border-indigo-500/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Link className="w-4 h-4 text-indigo-400" />
                APK Download URL <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-indigo-300/80">Direct or cloud link served to visitors</span>
            </div>
            <input
              type="url"
              required
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              placeholder="https://promptxhubl.com/downloads/pixelcam-v4.8.2.apk"
              className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Version, File Size, Android Requirements, Developer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Version <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v4.8.2"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                File Size <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="68.4 MB"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Android OS
              </label>
              <input
                type="text"
                value={androidRequirements}
                onChange={(e) => setAndroidRequirements(e.target.value)}
                placeholder="Android 9.0+"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Developer Name
              </label>
              <input
                type="text"
                value={developerName}
                onChange={(e) => setDeveloperName(e.target.value)}
                placeholder="Nexus Labs"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Featured / Pin to Homepage Top */}
          <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Star className={`w-5 h-5 ${featured ? 'fill-amber-400' : ''}`} />
              </div>
              <div>
                <label className="text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Pin APK to Homepage Top (Featured APK)</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pinned APKs appear before regular cards in the Homepage Featured showcase
                </p>
              </div>
            </div>

            {featured && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-amber-300 font-semibold whitespace-nowrap">Priority Order:</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={featuredOrder || 1}
                  onChange={(e) => setFeaturedOrder(parseInt(e.target.value) || 1)}
                  className="w-20 bg-[#070a12] border border-amber-500/40 rounded-xl px-2.5 py-1 text-xs text-amber-300 text-center font-bold outline-none"
                  title="Position order on homepage (1 is top priority)"
                />
              </div>
            )}
          </div>

          {/* Icons & Media */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* App Icon */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                APK Icon URL / Upload
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="url"
                    value={appIcon}
                    onChange={(e) => setAppIcon(e.target.value)}
                    placeholder="https://.../icon.png"
                    className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
                <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'icon')}
                  />
                </label>
              </div>
              {appIcon && (
                <div className="mt-2 flex items-center gap-2.5">
                  <img src={appIcon} alt="Preview" className="w-8 h-8 rounded-lg object-cover border border-slate-800" />
                  <span className="text-[10px] text-slate-400">Icon loaded successfully</span>
                </div>
              )}
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Cover / Banner Image (Optional)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://.../cover.jpg"
                    className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
                <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'cover')}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Short Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief summary of unlocked features and benefits..."
              className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Full Description &amp; MOD Features
            </label>
            <textarea
              rows={3}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Detailed mod breakdown, instructions, and gameplay notes..."
              className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Changelog (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>Changelog / What&apos;s New (Optional)</span>
            </label>
            <textarea
              rows={2}
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              placeholder="e.g. Added 120 FPS high refresh rate support, unlocked all premium skins..."
              className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          {/* Keywords / Search Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Keywords &amp; Search Tags
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type tag and press Add (e.g. android mod, unlimited gems)..."
                className="flex-1 bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Add Tag
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {seoTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#070a12] border border-slate-800 text-slate-300 text-xs"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-500 hover:text-white cursor-pointer ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Legal confirmation before publishing */}
          <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-start gap-2.5">
            <input
              type="checkbox"
              id="legalConfirmation"
              checked={legalConfirmation}
              onChange={(e) => setLegalConfirmation(e.target.checked)}
              className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 mt-0.5 cursor-pointer"
            />
            <label htmlFor="legalConfirmation" className="text-xs text-slate-400 cursor-pointer">
              <strong>Authorized Distribution:</strong> I confirm that I have legal authorization, freeware permission, or developer partnership to distribute this APK file on PromptXHubl.
            </label>
          </div>

          {/* Form Actions Footer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {initialData ? `Last updated: ${new Date(initialData.updatedAt).toLocaleDateString()}` : 'Will sync to Firestore immediately upon saving'}
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => executeSave('draft')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                Save as Draft
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => executeSave('published')}
                className={`px-5 py-2.5 text-white rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 ${
                  isModGame
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving to Firebase...' : 'Publish APK'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
