import React, { useState, useEffect } from 'react';
import { ApkItem, ApkCategory, ContentStatus } from '../../types';
import { useData } from '../../context/DataContext';
import { 
  X, 
  Smartphone, 
  Upload, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  ExternalLink, 
  AlertTriangle, 
  Check, 
  Sparkles,
  Link
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
  const [licenseInfo, setLicenseInfo] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoTags, setSeoTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<ContentStatus>('draft');
  const [legalConfirmation, setLegalConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlValidationError, setUrlValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSlug(initialData.slug || '');
      setAppIcon(initialData.appIcon || '');
      setCoverImage(initialData.coverImage || '');
      setScreenshots(initialData.screenshots || []);
      setShortDescription(initialData.shortDescription || '');
      setFullDescription(initialData.fullDescription || '');
      setCategory(initialData.category || 'MOD Apps');
      setVersion(initialData.version || '');
      setFileSize(initialData.fileSize || '');
      setAndroidRequirements(initialData.androidRequirements || 'Android 9.0+');
      setDownloadUrl(initialData.downloadUrl || '');
      setOfficialSourceUrl(initialData.officialSourceUrl || '');
      setDeveloperName(initialData.developerName || '');
      setLicenseInfo(initialData.licenseInfo || '');
      setSeoTitle(initialData.seoTitle || '');
      setSeoDescription(initialData.seoDescription || '');
      setSeoTags(initialData.seoTags || []);
      setFeatured(Boolean(initialData.featured));
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
      setLicenseInfo('Authorized distribution with developer permission.');
      setSeoTitle('');
      setSeoDescription('');
      setSeoTags(['android mod', 'free apk']);
      setFeatured(false);
      setStatus('draft');
      setLegalConfirmation(false);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate download URL
    if (!validateUrl(downloadUrl)) {
      setUrlValidationError('Please enter a valid HTTP/HTTPS download URL.');
      return;
    }

    if (officialSourceUrl && !validateUrl(officialSourceUrl)) {
      setUrlValidationError('Please enter a valid official source URL.');
      return;
    }

    if (status === 'published' && !legalConfirmation) {
      setUrlValidationError('Admin confirmation is strictly required before publishing an APK to ensure legal distributability.');
      return;
    }

    setUrlValidationError(null);
    setIsSubmitting(true);

    try {
      await saveApk({
        id: initialData?.id,
        title,
        slug,
        appIcon: appIcon || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&auto=format&fit=crop&q=80',
        coverImage: coverImage || 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1000&auto=format&fit=crop&q=80',
        screenshots,
        shortDescription,
        fullDescription,
        category,
        version,
        fileSize,
        androidRequirements,
        downloadUrl,
        officialSourceUrl,
        developerName,
        licenseInfo,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || shortDescription,
        seoTags,
        featured,
        status,
        lovesCount: initialData?.lovesCount || 0,
        viewsCount: initialData?.viewsCount || 0,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save APK:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 shadow-2xl relative my-8 text-left max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialData ? 'Edit APK Item' : 'Add New APK / Game'}
              </h2>
              <p className="text-xs text-slate-400">
                Categories restricted strictly to <strong>MOD Apps</strong> or <strong>MOD Games</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 py-4 space-y-6">
          {urlValidationError && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{urlValidationError}</span>
            </div>
          )}

          {/* Core Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                App / Game Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. PixelCam Ultra HDR"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                URL Slug <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. pixelcam-ultra-hdr"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ApkCategory)}
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="MOD Apps">MOD Apps</option>
                <option value="MOD Games">MOD Games</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Publishing Status <span className="text-rose-400">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentStatus)}
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="draft">Save as Draft</option>
                <option value="published">Published (Public)</option>
                <option value="unpublished">Unpublished (Hidden)</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-200">Featured On Homepage</span>
              </label>
            </div>
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Version <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v2.4.1"
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
                placeholder="e.g. 52.4 MB"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Android Requirements <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={androidRequirements}
                onChange={(e) => setAndroidRequirements(e.target.value)}
                placeholder="e.g. Android 9.0+"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Developer Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={developerName}
                onChange={(e) => setDeveloperName(e.target.value)}
                placeholder="e.g. Studio Pixel"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Download & Source URL with Destination Preview */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Link className="w-3.5 h-3.5 text-indigo-400" />
              Verified Download Destination
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Download URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  placeholder="https://promptxhubl.com/downloads/app.apk"
                  className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Official Source / Play Store URL
                </label>
                <input
                  type="url"
                  value={officialSourceUrl}
                  onChange={(e) => setOfficialSourceUrl(e.target.value)}
                  placeholder="https://play.google.com/store/apps/details?id=..."
                  className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
                />
              </div>
            </div>

            {/* Destination Preview */}
            {downloadUrl && validateUrl(downloadUrl) && (
              <div className="p-3 bg-[#070a12] rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-400">Destination:</span>
                  <span className="text-indigo-300 font-mono truncate">{downloadUrl}</span>
                </div>
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 shrink-0 inline-flex items-center gap-1 cursor-pointer"
                >
                  Test Link <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* License & Policy Guard */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                License / Distribution Rights Info <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={licenseInfo}
                onChange={(e) => setLicenseInfo(e.target.value)}
                placeholder="Authorized redistribution build under license terms"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Legal Confirmation Checkbox */}
            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required={status === 'published'}
                  checked={legalConfirmation}
                  onChange={(e) => setLegalConfirmation(e.target.checked)}
                  className="mt-0.5 rounded border-indigo-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-indigo-200 leading-relaxed">
                  <strong>Legal Compliance Confirmation:</strong> I confirm this APK is legally distributable with verified permissions. No malware, cracked premium exploits, or unauthorized cheating tools are permitted on PromptXHubl.
                </span>
              </label>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Short Description (Card Summary) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={250}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Crisp 1-2 sentence overview of key unlocked capabilities"
              className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Full Description &amp; Feature List <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Detailed explanation of features, version changes, and installation notes..."
              className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Media & Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                App Icon URL or Upload
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={appIcon}
                  onChange={(e) => setAppIcon(e.target.value)}
                  placeholder="https://.../icon.png"
                  className="flex-1 bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                />
                <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium cursor-pointer flex items-center gap-1 shrink-0">
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
                <div className="mt-2 flex items-center gap-2">
                  <img src={appIcon} alt="Icon preview" className="w-10 h-10 rounded-xl object-cover border border-slate-800" />
                  <span className="text-[11px] text-slate-400">Icon preview</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cover Image URL or Upload
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://.../cover.jpg"
                  className="flex-1 bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                />
                <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium cursor-pointer flex items-center gap-1 shrink-0">
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
              {coverImage && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={coverImage} alt="Cover preview" className="w-16 h-9 rounded-lg object-cover border border-slate-800" />
                  <span className="text-[11px] text-slate-400">Cover preview</span>
                </div>
              )}
            </div>
          </div>

          {/* Screenshots List */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              App Screenshots
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={newScreenshotUrl}
                onChange={(e) => setNewScreenshotUrl(e.target.value)}
                placeholder="Paste image URL and click Add"
                className="flex-1 bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddScreenshot}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium cursor-pointer"
              >
                Add URL
              </button>
              <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium cursor-pointer flex items-center gap-1 shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'screenshot')}
                />
              </label>
            </div>

            {screenshots.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {screenshots.map((url, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-800 w-24 h-16">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveScreenshot(i)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEO Metadata */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Search Engine Optimization (SEO)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">SEO Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Meta title for Google"
                  className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">SEO Description</label>
                <input
                  type="text"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Meta description (under 160 characters)"
                  className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* SEO Tags */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">SEO Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                  placeholder="Type tag and press enter"
                  className="flex-1 bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium cursor-pointer"
                >
                  Add Tag
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {seoTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs border border-slate-700/80"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update APK Item' : 'Create APK Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
