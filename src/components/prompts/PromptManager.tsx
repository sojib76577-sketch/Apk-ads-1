import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { PhotoPrompt, ContentStatus } from '../../types';
import { PromptFormModal } from './PromptFormModal';
import { PromptPreviewModal } from './PromptPreviewModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Heart, 
  Copy, 
  Check, 
  Star 
} from 'lucide-react';

export const PromptManager: React.FC = () => {
  const { prompts, deletePrompt, setPromptStatus, categories } = useData();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ContentStatus>('All');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'title' | 'loves'>('latest');

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PhotoPrompt | null>(null);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewingItem, setPreviewingItem] = useState<PhotoPrompt | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const promptCategories = categories.filter(c => c.contentType === 'Photo Editing Prompts');

  const filteredPrompts = useMemo(() => {
    return prompts
      .filter((item) => {
        const matchesSearch = 
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.promptText.toLowerCase().includes(search.toLowerCase()) ||
          item.slug.toLowerCase().includes(search.toLowerCase()) ||
          (item.seoTags && item.seoTags.some(t => t.toLowerCase().includes(search.toLowerCase())));

        const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
        const matchesPlatform = platformFilter === 'All' || item.aiPlatform === platformFilter;
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

        return matchesSearch && matchesCat && matchesPlatform && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'loves') return (b.lovesCount || 0) - (a.lovesCount || 0);
        return 0;
      });
  }, [prompts, search, categoryFilter, platformFilter, statusFilter, sortBy]);

  const handleEdit = (item: PhotoPrompt) => {
    setEditingItem(item);
    setFormModalOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormModalOpen(true);
  };

  const handlePreview = (item: PhotoPrompt) => {
    setPreviewingItem(item);
    setPreviewModalOpen(true);
  };

  const handleQuickCopyPrompt = (item: PhotoPrompt) => {
    navigator.clipboard.writeText(item.promptText);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId) {
      await deletePrompt(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Photo Editing Prompt CMS
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage AI generator prompt formulas, Midjourney &amp; Flux parameters, and AI-assisted SEO tags
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/25 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Prompt</span>
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
            placeholder="Search prompt formula, title, tags..."
            className="w-full bg-[#070a12] border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-purple-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-purple-500 outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {promptCategories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-purple-500 outline-none cursor-pointer"
          >
            <option value="All">All AI Platforms</option>
            <option value="Midjourney">Midjourney</option>
            <option value="Flux.1">Flux.1</option>
            <option value="Stable Diffusion XL">Stable Diffusion XL</option>
            <option value="ChatGPT / DALL-E 3">ChatGPT / DALL-E 3</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | ContentStatus)}
            className="bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-purple-500 outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="unpublished">Unpublished</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-purple-500 outline-none cursor-pointer"
          >
            <option value="latest">Sort: Latest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="title">Sort: Title</option>
            <option value="loves">Sort: Most Loved</option>
          </select>
        </div>
      </div>

      {/* Prompts Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070a12] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4">Preview &amp; Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">AI Platform</th>
                <th className="py-3 px-4">Prompt Formula</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredPrompts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No photo editing prompts found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredPrompts.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.previewImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate max-w-xs">{item.title}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1 text-pink-400">
                              <Heart className="w-3 h-3 fill-pink-400" /> {item.lovesCount}
                            </span>
                            {item.featured && (
                              <span className="text-amber-400 font-medium">· Featured</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-medium">{item.category}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {item.aiPlatform}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 max-w-xs">
                        <span className="font-mono text-[11px] text-slate-300 truncate">
                          {item.promptText}
                        </span>
                        <button
                          onClick={() => handleQuickCopyPrompt(item)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                          title="Copy Full Prompt"
                        >
                          {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={item.status}
                        onChange={(e) => setPromptStatus(item.id, e.target.value as ContentStatus)}
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
                          title="Preview Prompt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Prompt"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                          title="Delete Prompt"
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
          <span>Showing {filteredPrompts.length} of {prompts.length} total prompts</span>
          <span className="text-[11px]">Firestore collection: <code>/photoPrompts</code></span>
        </div>
      </div>

      <PromptFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        initialData={editingItem}
      />

      <PromptPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        prompt={previewingItem}
        onEdit={(item) => handleEdit(item)}
      />

      <ConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        title="Delete Photo Prompt"
        message="Are you sure you want to permanently delete this photo prompt from the database? This action cannot be undone."
        confirmLabel="Delete Permanently"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};
