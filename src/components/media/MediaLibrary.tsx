import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { MediaItem } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  Image as ImageIcon, 
  Upload, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  ExternalLink, 
  Eye, 
  Film, 
  FileArchive, 
  Sparkles,
  Smartphone,
  ShieldCheck,
  X
} from 'lucide-react';

export const MediaLibrary: React.FC = () => {
  const { media, uploadMedia, deleteMedia } = useData();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | MediaItem['category']>('All');
  const [selectedCategoryForUpload, setSelectedCategoryForUpload] = useState<MediaItem['category']>('image');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [media, search, categoryFilter]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadPercent(0);
    setUploadError(null);

    try {
      await uploadMedia(file, selectedCategoryForUpload, (percent) => {
        setUploadPercent(percent);
      });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadPercent(0);
      e.target.value = '';
    }
  };

  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId) {
      await deleteMedia(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-indigo-400" />
            Media Library (Firebase Storage)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Store and manage images, APK icons, screenshots, preview videos, and template zip archives
          </p>
        </div>
      </div>

      {/* Upload Zone Card */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-400" />
              Upload New Media Asset
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Supports JPEG, PNG, WebP, MP4, and ZIP. Max file size: 25MB. Executables blocked.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Target Type:</span>
              <select
                value={selectedCategoryForUpload}
                onChange={(e) => setSelectedCategoryForUpload(e.target.value as any)}
                className="bg-[#070a12] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="image">Generative Photo Preview</option>
                <option value="icon">APK Icon (512x512)</option>
                <option value="screenshot">Screenshot / Banner</option>
                <option value="video">Preview Video (MP4)</option>
                <option value="archive">Permitted Template Archive (ZIP)</option>
              </select>
            </div>

            <label className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/25 flex items-center gap-2 cursor-pointer transition-all">
              <Upload className="w-4 h-4" />
              <span>{isUploading ? `Uploading ${uploadPercent}%...` : 'Choose File to Upload'}</span>
              <input
                type="file"
                disabled={isUploading}
                accept="image/*,video/mp4,application/zip,application/x-zip-compressed"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-indigo-300 mb-1.5 font-medium">
              <span>Transferring asset to Firebase Storage...</span>
              <span>{uploadPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-200"
                style={{ width: `${uploadPercent}%` }}
              />
            </div>
          </div>
        )}

        {uploadError && (
          <div className="mt-3 p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {uploadError}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media by filename..."
            className="w-full bg-[#070a12] border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none cursor-pointer"
          >
            <option value="All">All Media Types</option>
            <option value="image">Photo Previews</option>
            <option value="icon">APK Icons</option>
            <option value="screenshot">Screenshots</option>
            <option value="video">Videos</option>
            <option value="archive">Archives / ZIPs</option>
          </select>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.length === 0 ? (
          <div className="col-span-full bg-[#0f172a] border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            No media files match your search criteria.
          </div>
        ) : (
          filteredMedia.map((item) => (
            <div
              key={item.id}
              className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition-all group flex flex-col"
            >
              {/* Thumbnail Container */}
              <div 
                onClick={() => setPreviewMedia(item)}
                className="w-full h-40 bg-[#070a12] relative flex items-center justify-center overflow-hidden cursor-pointer"
              >
                {item.type.startsWith('image/') || item.category === 'image' || item.category === 'icon' || item.category === 'screenshot' ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : item.type.startsWith('video/') || item.category === 'video' ? (
                  <div className="flex flex-col items-center gap-2 text-cyan-400">
                    <Film className="w-10 h-10" />
                    <span className="text-[11px] font-semibold text-slate-300">Video Asset</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-amber-400">
                    <FileArchive className="w-10 h-10" />
                    <span className="text-[11px] font-semibold text-slate-300">ZIP Archive</span>
                  </div>
                )}

                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white border border-white/10 uppercase tracking-wider">
                  {item.category}
                </div>
              </div>

              {/* Info & Actions */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white truncate" title={item.name}>
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {formatFileSize(item.size)} · {new Date(item.uploadedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleCopyUrl(item)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Copy Public URL"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === item.id ? 'Copied' : 'Copy URL'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewMedia(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Inspect Media"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                      title="Delete Media"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        title="Delete Media Asset"
        message="Are you sure you want to delete this media item from Firebase Storage? Content referencing this URL will no longer be able to display it."
        confirmLabel="Delete Media"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {/* Full Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-2xl bg-[#0b0f19] border border-slate-800 rounded-3xl p-5 shadow-2xl relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-white truncate max-w-md">{previewMedia.name}</h3>
            <p className="text-xs text-slate-400">{formatFileSize(previewMedia.size)} · {previewMedia.type}</p>

            <div className="mt-4 rounded-xl overflow-hidden bg-black max-h-96 flex items-center justify-center">
              {previewMedia.type.startsWith('video/') ? (
                <video src={previewMedia.url} controls className="max-h-96 w-full object-contain" />
              ) : (
                <img src={previewMedia.url} alt="" className="max-h-96 w-full object-contain" />
              )}
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs font-mono text-indigo-300 truncate max-w-sm">{previewMedia.url}</span>
              <a
                href={previewMedia.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open in Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
