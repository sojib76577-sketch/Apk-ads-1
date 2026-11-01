import React, { useState, useEffect } from 'react';
import { PhotoPrompt, ContentStatus } from '../../types';
import { useData } from '../../context/DataContext';
import { generateSeoTagsWithGemini } from '../../services/gemini';
import { 
  X, 
  Sparkles, 
  Upload, 
  Wand2, 
  Copy, 
  Check, 
  AlertTriangle, 
  Image as ImageIcon,
  Tag
} from 'lucide-react';

interface PromptFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: PhotoPrompt | null;
}

const AI_PLATFORMS = [
  'Midjourney',
  'ChatGPT / DALL-E 3',
  'Flux.1 (Dev / Schnell)',
  'Stable Diffusion XL (SDXL)',
  'Leonardo AI',
  'Adobe Firefly',
  'Bing Image Creator',
  'Other AI Model',
];

export const PromptFormModal: React.FC<PromptFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { categories, savePrompt, uploadMedia } = useData();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [promptText, setPromptText] = useState('');
  const [category, setCategory] = useState('');
  const [aiPlatform, setAiPlatform] = useState('Midjourney');
  const [instructions, setInstructions] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoTags, setSeoTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<ContentStatus>('draft');

  // AI SEO Tag Generation states
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [generatedTagSuggestions, setGeneratedTagSuggestions] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter categories for prompts
  const promptCategories = categories.filter(c => c.contentType === 'Photo Editing Prompts');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSlug(initialData.slug || '');
      setPreviewImage(initialData.previewImage || '');
      setShortDescription(initialData.shortDescription || '');
      setFullDescription(initialData.fullDescription || '');
      setPromptText(initialData.promptText || '');
      setCategory(initialData.category || (promptCategories[0]?.name || 'Cinematic Portraits'));
      setAiPlatform(initialData.aiPlatform || 'Midjourney');
      setInstructions(initialData.instructions || '');
      setSeoTitle(initialData.seoTitle || '');
      setSeoDescription(initialData.seoDescription || '');
      setSeoTags(initialData.seoTags || []);
      setFeatured(Boolean(initialData.featured));
      setStatus(initialData.status || 'draft');
    } else {
      setTitle('');
      setSlug('');
      setPreviewImage('');
      setShortDescription('');
      setFullDescription('');
      setPromptText('');
      setCategory(promptCategories[0]?.name || 'Cinematic Portraits');
      setAiPlatform('Midjourney');
      setInstructions('Replace any bracketed tokens [like this] with your desired subjects.');
      setSeoTitle('');
      setSeoDescription('');
      setSeoTags(['ai prompt', 'photo editing']);
      setFeatured(false);
      setStatus('draft');
    }
    setGeneratedTagSuggestions([]);
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
      setSeoTitle(`${val} AI Prompt - PromptXHubl`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const mediaItem = await uploadMedia(file, 'image');
      setPreviewImage(mediaItem.url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Image upload failed');
    }
  };

  const handleAddTag = (tagToAdd?: string) => {
    const tag = (tagToAdd || tagInput).trim().toLowerCase();
    if (tag && !seoTags.includes(tag)) {
      setSeoTags([...seoTags, tag]);
      if (!tagToAdd) setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSeoTags(seoTags.filter(t => t !== tagToRemove));
  };

  // AI-Assisted SEO Tag Generator
  const handleGenerateTags = async () => {
    if (!title.trim() && !shortDescription.trim()) {
      alert('Please enter a title or description first to generate relevant SEO tags.');
      return;
    }

    setIsGeneratingTags(true);
    try {
      const tags = await generateSeoTagsWithGemini(
        title,
        `${shortDescription} ${fullDescription}`,
        category,
        promptText
      );
      setGeneratedTagSuggestions(tags);
    } catch (err) {
      console.error('Failed to generate SEO tags:', err);
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !promptText || !slug) return;

    setIsSubmitting(true);
    try {
      await savePrompt({
        id: initialData?.id,
        title,
        slug,
        previewImage: previewImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
        shortDescription,
        fullDescription,
        promptText,
        category: category || (promptCategories[0]?.name || 'Cinematic Portraits'),
        aiPlatform,
        instructions,
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
      console.error('Failed to save prompt:', err);
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
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialData ? 'Edit Photo Prompt' : 'Create Photo Editing Prompt'}
              </h2>
              <p className="text-xs text-slate-400">
                Prompt formulas are stored separately from descriptions for 1-click visitor copying
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
          {/* Core Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Prompt Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. Luminescent Neon Cyber Studio Portrait"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-purple-500 outline-none"
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
                placeholder="e.g. luminescent-neon-cyber-portrait"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-purple-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* Category, Platform, and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 outline-none cursor-pointer"
              >
                {promptCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
                {promptCategories.length === 0 && (
                  <option value="Cinematic Portraits">Cinematic Portraits</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                AI Platform / Model <span className="text-rose-400">*</span>
              </label>
              <select
                value={aiPlatform}
                onChange={(e) => setAiPlatform(e.target.value)}
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 outline-none cursor-pointer"
              >
                {AI_PLATFORMS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status <span className="text-rose-400">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentStatus)}
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 outline-none cursor-pointer"
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
                  className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-200">Featured</span>
              </label>
            </div>
          </div>

          {/* CRITICAL: Complete Prompt Text (Stored Separately from description) */}
          <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Complete Prompt Text (Copyable by Visitors) <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-purple-300/80 font-mono">
                {promptText.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              rows={4}
              required
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. Cinematic studio portrait of [subject], dual neon rim lighting, Hasselblad 85mm f/1.4, microscopic skin pores, 8k --ar 16:9 --v 6.1"
              className="w-full bg-[#070a12] border border-purple-900/50 rounded-xl p-3 text-xs text-white placeholder-slate-500 font-mono focus:border-purple-500 outline-none leading-relaxed"
            />
          </div>

          {/* Instructions for using prompt */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Instructions for Using the Prompt <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Replace [subject] with desired character, best used with --style raw"
              className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-purple-500 outline-none"
            />
          </div>

          {/* Short & Full Description */}
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
                placeholder="Card summary describing the visual aesthetic"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Article &amp; Breakdown
              </label>
              <textarea
                rows={3}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="Detailed tips, camera settings breakdown, and rendering samples..."
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-purple-500 outline-none"
              />
            </div>
          </div>

          {/* Preview Image Upload / URL with live preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Preview Result Image <span className="text-rose-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={previewImage}
                onChange={(e) => setPreviewImage(e.target.value)}
                placeholder="https://.../preview.jpg"
                className="flex-1 bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 outline-none font-mono"
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
            {previewImage && (
              <div className="mt-3 flex items-center gap-3 p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                <img
                  src={previewImage}
                  alt="Prompt preview"
                  className="w-20 h-20 rounded-lg object-cover border border-slate-700/80"
                />
                <div className="text-xs text-slate-400">
                  <p className="font-semibold text-slate-200">Image Preview Verified</p>
                  <p className="text-[11px] truncate max-w-sm mt-0.5">{previewImage}</p>
                </div>
              </div>
            )}
          </div>

          {/* AI-Assisted SEO Tag Generator Section */}
          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-purple-400" />
                  AI-Assisted SEO Tag Generator
                </h4>
                <p className="text-[11px] text-slate-400">
                  Admin enters prompt title and description, then clicks Generate SEO Tags
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateTags}
                disabled={isGeneratingTags}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5" />
                {isGeneratingTags ? 'Generating...' : 'Generate SEO Tags'}
              </button>
            </div>

            {/* Generated Suggestions Chips */}
            {generatedTagSuggestions.length > 0 && (
              <div className="p-3 bg-[#070a12] rounded-xl border border-purple-900/40">
                <p className="text-[11px] font-semibold text-purple-300 mb-2">
                  Click a suggested tag to add to your list:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {generatedTagSuggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      className="text-xs px-2.5 py-1 bg-purple-950/60 hover:bg-purple-900/70 text-purple-200 border border-purple-800/60 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>+{tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Current Active Tags */}
            <div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                  placeholder="Add custom SEO tag"
                  className="flex-1 bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag()}
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

            {/* SEO Title & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">SEO Meta Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Meta title"
                  className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">SEO Meta Description</label>
                <input
                  type="text"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Meta description"
                  className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-purple-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
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
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Prompt' : 'Create Prompt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
