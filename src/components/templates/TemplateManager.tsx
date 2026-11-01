import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { VideoTemplate, ContentStatus } from '../../types';
import { TemplateFormModal } from './TemplateFormModal';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  Film, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  ExternalLink, 
  Download, 
  Star 
} from 'lucide-react';

export const TemplateManager: React.FC = () => {
  const { templates, deleteTemplate, setTemplateStatus, categories } = useData();

  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ContentStatus>('All');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'title' | 'views'>('latest');

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VideoTemplate | null>(null);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewingItem, setPreviewingItem] = useState<VideoTemplate | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const templateCategories = categories.filter(c => c.contentType === 'Video Templates');

  const filteredTemplates = useMemo(() => {
    return templates
      .filter((item) => {
        const matchesSearch = 
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.editingPlatform.toLowerCase().includes(search.toLowerCase()) ||
          item.slug.toLowerCase().includes(search.toLowerCase()) ||
          (item.seoTags && item.seoTags.some(t => t.toLowerCase().includes(search.toLowerCase())));

        const matchesPlatform = platformFilter === 'All' || item.editingPlatform === platformFilter;
        const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

        return matchesSearch && matchesPlatform && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'views') return (b.viewsCount || 0) - (a.viewsCount || 0);
        return 0;
      });
  }, [templates, search, platformFilter, categoryFilter, statusFilter, sortBy]);

  const handleEdit = (item: VideoTemplate) => {
    setEditingItem(item);
    setFormModalOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormModalOpen(true);
  };

  const handlePreview = (item: VideoTemplate) => {
    setPreviewingItem(item);
    setPreviewModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId) {
      await deleteTemplate(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Film className="w-5 h-5 text-cyan-400" />
            Video Templates CMS
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage CapCut web templates, Adobe Premiere presets, and downloadable video packages
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-600/25 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Video Template</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates by title, platform, slug..."
            className="w-full bg-[#070a12] border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 outline-none cursor-pointer"
          >
            <option value="All">All Platforms</option>
            <option value="CapCut">CapCut</option>
            <option value="Adobe Premiere Pro">Premiere Pro</option>
            <option value="After Effects">After Effects</option>
            <option value="VN Video Editor">VN Editor</option>
            <option value="DaVinci Resolve">DaVinci Resolve</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {templateCategories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | ContentStatus)}
            className="bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="unpublished">Unpublished</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 outline-none cursor-pointer"
          >
            <option value="latest">Sort: Latest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="title">Sort: Title</option>
            <option value="views">Sort: Most Views</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070a12] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4">Template</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Available Links</th>
                <th className="py-3 px-4">Format &amp; Size</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No video templates found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.thumbnail || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=100&auto=format&fit=crop&q=80'}
                          alt=""
                          className="w-14 h-9 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate max-w-xs">{item.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {item.category} {item.featured && <span className="text-amber-400 font-medium">· Featured</span>}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {item.editingPlatform}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 text-[11px]">
                        {item.directTemplateUrl && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700/60" title="Direct Web Link">
                            Direct Link
                          </span>
                        )}
                        {item.downloadableFileUrl && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60" title="Download File">
                            File Download
                          </span>
                        )}
                        {!item.directTemplateUrl && !item.downloadableFileUrl && (
                          <span className="text-rose-400 font-semibold">No link added</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-slate-200 font-medium">{item.fileFormat}</p>
                      <p className="text-[11px] text-slate-400">{item.fileSize}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={item.status}
                        onChange={(e) => setTemplateStatus(item.id, e.target.value as ContentStatus)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-transparent cursor-pointer outline-none ${
                          item.status === 'published'
                            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20'
                            : item.status === 'draft'
                            ? 'text-amber-400 border-amber-500/30 bg-amber-950/20'
                            : 'text-rose-400 border-rose-500/30 bg-rose-950/20'
                        }`}
                      >
                        <option value="published" className="bg-[#0f172a] text-white">Published</option>
                        <option value="draft" className="bg-[#0f172a] text-white">Draft</option>
                        <option value="unpublished" className="bg-[#0f172a] text-white">Unpublished</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handlePreview(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Preview Template"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Template"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#070a12] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredTemplates.length} of {templates.length} total templates</span>
          <span className="text-[11px]">Firestore collection: <code>/videoTemplates</code></span>
        </div>
      </div>

      <TemplateFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        initialData={editingItem}
      />

      <TemplatePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        template={previewingItem}
        onEdit={(item) => handleEdit(item)}
      />

      <ConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        title="Delete Video Template"
        message="Are you sure you want to permanently delete this video template? This action cannot be undone."
        confirmLabel="Delete Permanently"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};
