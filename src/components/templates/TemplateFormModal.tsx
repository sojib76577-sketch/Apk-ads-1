import React, { useState, useEffect } from 'react';
import { VideoTemplate, ContentStatus } from '../../types';
import { useData } from '../../context/DataContext';
import { 
  X, 
  Film, 
  Upload, 
  ExternalLink, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Link as LinkIcon 
} from 'lucide-react';

interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: VideoTemplate | null;
}

const EDITING_PLATFORMS = [
  'CapCut',
  'Adobe Premiere Pro',
  'After Effects',
  'VN Video Editor',
  'DaVinci Resolve',
  'Alight Motion',
  'Final Cut Pro',
  'Canva',
  'Other Platform',
];

export const TemplateFormModal: React.FC<TemplateFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { categories, saveTemplate, uploadMedia } = useData();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [previewVideoUrl, setPreviewVideoUrl] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [editingPlatform, setEditingPlatform] = useState('CapCut');
  const [category, setCategory] = useState('');
  const [directTemplateUrl, setDirectTemplateUrl] = useState('');
  const [downloadableFileUrl, setDownloadableFileUrl] = useState('');
  const [fileFormat, setFileFormat] = useState('ZIP & Link');
  const [fileSize, setFileSize] = useState('45 MB');
  const [usageInstructions, setUsageInstructions] = useState('');
  const [copyrightInfo, setCopyrightInfo] = useState('Free for creator and commercial use with attribution.');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoTags, setSeoTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<ContentStatus>('draft');

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const templateCategories = categories.filter(c => c.contentType === 'Video Templates');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSlug(initialData.slug || '');
      setThumbnail(initialData.thumbnail || '');
      setPreviewVideoUrl(initialData.previewVideoUrl || '');
      setShortDescription(initialData.shortDescription || '');
      setFullDescription(initialData.fullDescription || '');
      setEditingPlatform(initialData.editingPlatform || 'CapCut');
      setCategory(initialData.category || (templateCategories[0]?.name || 'Trending TikTok & Reels'));
      setDirectTemplateUrl(initialData.directTemplateUrl || '');
      setDownloadableFileUrl(initialData.downloadableFileUrl || '');
      setFileFormat(initialData.fileFormat || 'ZIP');
      setFileSize(initialData.fileSize || '');
      setUsageInstructions(initialData.usageInstructions || '');
      setCopyrightInfo(initialData.copyrightInfo || 'Free for creator and commercial use with attribution.');
      setSeoTitle(initialData.seoTitle || '');
      setSeoDescription(initialData.seoDescription || '');
      setSeoTags(initialData.seoTags || []);
      setFeatured(Boolean(initialData.featured));
      setStatus(initialData.status || 'draft');
    } else {
      setTitle('');
      setSlug('');
      setThumbnail('');
      setPreviewVideoUrl('');
      setShortDescription('');
      setFullDescription('');
      setEditingPlatform('CapCut');
      setCategory(templateCategories[0]?.name || 'Trending TikTok & Reels');
      setDirectTemplateUrl('');
      setDownloadableFileUrl('');
      setFileFormat('ZIP / Web Link');
      setFileSize('');
      setUsageInstructions('Open link in editing app or import XML/MOGRT project file.');
      setCopyrightInfo('Free for creator and commercial use with attribution.');
      setSeoTitle('');
      setSeoDescription('');
      setSeoTags(['capcut template', 'video editing']);
      setFeatured(false);
      setStatus('draft');
    }
    setValidationError(null);
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
      setSeoTitle(`${val} Video Template - PromptXHubl`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const mediaItem = await uploadMedia(file, 'screenshot');
      setThumbnail(mediaItem.url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Thumbnail upload failed');
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Critical Requirement Section 7:
    // Support both link types: A. Direct Template Link B. Downloadable File Link.
    // Both are optional individually, but at least ONE valid link must be provided before publishing!
    const hasDirect = Boolean(directTemplateUrl && directTemplateUrl.trim());
    const hasDownload = Boolean(downloadableFileUrl && downloadableFileUrl.trim());

    if (status === 'published' && !hasDirect && !hasDownload) {
      setValidationError(
        'Validation Rule: To publish a Video Template, you MUST provide at least ONE valid link (either a Direct Template URL or a Downloadable File URL).'
      );
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    try {
      await saveTemplate({
        id: initialData?.id,
        title,
        slug,
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80',
        previewVideoUrl: previewVideoUrl.trim() || undefined,
        shortDescription,
        fullDescription,
        editingPlatform,
        category: category || (templateCategories[0]?.name || 'Trending TikTok & Reels'),
        directTemplateUrl: directTemplateUrl.trim() || undefined,
        downloadableFileUrl: downloadableFileUrl.trim() || undefined,
        fileFormat,
        fileSize,
        usageInstructions,
        copyrightInfo,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || shortDescription,
        seoTags,
        featured,
        status,
        viewsCount: initialData?.viewsCount || 0,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save template:', err);
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
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialData ? 'Edit Video Template' : 'Add Video Template'}
              </h2>
              <p className="text-xs text-slate-400">
                Supports Direct Template Link (e.g. CapCut) and Downloadable Project Files
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
          {validationError && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Core Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Template Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. Velocity Beat Sync 3D Flash Cut"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-500 outline-none"
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
                placeholder="e.g. velocity-beat-sync-3d"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* Platform, Category, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Editing Platform <span className="text-rose-400">*</span>
              </label>
              <select
                value={editingPlatform}
                onChange={(e) => setEditingPlatform(e.target.value)}
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none cursor-pointer"
              >
                {EDITING_PLATFORMS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none cursor-pointer"
              >
                {templateCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
                {templateCategories.length === 0 && (
                  <option value="Trending TikTok & Reels">Trending TikTok & Reels</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status <span className="text-rose-400">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentStatus)}
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none cursor-pointer"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-200">Featured</span>
              </label>
            </div>
          </div>

          {/* CRITICAL: Dual Link Support (Direct Template Link & Downloadable File Link) */}
          <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-cyan-400" />
                Template Link Configuration
              </h4>
              <span className="text-[11px] text-cyan-300/80">
                At least one link required before publishing
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">
                  A. Direct Template Link (e.g. CapCut Web Link)
                </label>
                <input
                  type="url"
                  value={directTemplateUrl}
                  onChange={(e) => setDirectTemplateUrl(e.target.value)}
                  placeholder="https://www.capcut.com/t/..."
                  className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Public button: &quot;Use Template&quot; (Opens directly in CapCut/editor)
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">
                  B. Downloadable File Link (e.g. ZIP / Project Assets)
                </label>
                <input
                  type="url"
                  value={downloadableFileUrl}
                  onChange={(e) => setDownloadableFileUrl(e.target.value)}
                  placeholder="https://promptxhubl.com/templates/pack.zip"
                  className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Public button: &quot;Download File&quot; (Serves ZIP, XML, or MOGRT package)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {directTemplateUrl || downloadableFileUrl ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Valid link configured for publishing requirements</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-amber-400">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Missing links (Required before changing status to Published)</span>
                </div>
              )}
            </div>
          </div>

          {/* Format & File Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                File Format (ZIP, MP4, MOGRT, etc.) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={fileFormat}
                onChange={(e) => setFileFormat(e.target.value)}
                placeholder="e.g. ZIP, MOGRT, XML"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
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
                placeholder="e.g. 48.2 MB"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Preview Video URL (Optional)
              </label>
              <input
                type="url"
                value={previewVideoUrl}
                onChange={(e) => setPreviewVideoUrl(e.target.value)}
                placeholder="https://.../preview.mp4"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Short Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief summary of transitions, music rhythm, and style..."
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Description &amp; Requirements
              </label>
              <textarea
                rows={3}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="Required plugins, font recommendations, and rendering tips..."
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          {/* Usage Instructions & Copyright */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Usage Instructions <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={usageInstructions}
                onChange={(e) => setUsageInstructions(e.target.value)}
                placeholder="Click link to apply in CapCut or unzip files into Premiere project"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Copyright / License Information <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={copyrightInfo}
                onChange={(e) => setCopyrightInfo(e.target.value)}
                placeholder="Free for commercial YouTube and social media creators"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          {/* Thumbnail Image */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Thumbnail Cover Image <span className="text-rose-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://.../thumbnail.jpg"
                className="flex-1 bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none font-mono"
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
            {thumbnail && (
              <div className="mt-3 flex items-center gap-3 p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                <img
                  src={thumbnail}
                  alt="Thumbnail preview"
                  className="w-24 h-14 rounded-lg object-cover border border-slate-700/80"
                />
                <span className="text-xs text-slate-400 truncate max-w-sm">{thumbnail}</span>
              </div>
            )}
          </div>

          {/* SEO Metadata */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">SEO Metadata</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">SEO Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Meta title"
                  className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">SEO Description</label>
                <input
                  type="text"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Meta description"
                  className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                  placeholder="Add SEO tag"
                  className="flex-1 bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {seoTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs border border-slate-700/80"
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
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
