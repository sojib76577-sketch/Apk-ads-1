import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { ApkItem, ApkCategory, ContentStatus } from '../../types';
import { ApkFormModal } from './ApkFormModal';
import { ApkDetailModal } from './ApkDetailModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  Smartphone, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  MoreVertical, 
  CheckCircle2, 
  EyeOff, 
  FileText, 
  Edit3, 
  Trash2, 
  Eye, 
  ExternalLink,
  Star,
  Download
} from 'lucide-react';

export const ApkManager: React.FC = () => {
  const { apks, deleteApk, setApkStatus } = useData();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ApkCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ContentStatus>('All');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'title' | 'loves'>('latest');

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ApkItem | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<ApkItem | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredApks = useMemo(() => {
    return apks
      .filter((item) => {
        const matchesSearch = 
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.developerName.toLowerCase().includes(search.toLowerCase()) ||
          item.slug.toLowerCase().includes(search.toLowerCase()) ||
          (item.seoTags && item.seoTags.some(t => t.toLowerCase().includes(search.toLowerCase())));

        const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'latest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'loves') {
          return (b.lovesCount || 0) - (a.lovesCount || 0);
        }
        return 0;
      });
  }, [apks, search, categoryFilter, statusFilter, sortBy]);

  const handleEdit = (item: ApkItem) => {
    setEditingItem(item);
    setFormModalOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormModalOpen(true);
  };

  const handleView = (item: ApkItem) => {
    setViewingItem(item);
    setDetailModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId) {
      await deleteApk(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            APK &amp; MOD Games Manager
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage verified Android MOD Apps and MOD Games distribution catalog
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New APK</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, developer, slug, tags..."
            className="w-full bg-[#070a12] border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as 'All' | ApkCategory)}
            className="bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="MOD Apps">MOD Apps</option>
            <option value="MOD Games">MOD Games</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | ContentStatus)}
            className="bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="unpublished">Unpublished</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none cursor-pointer"
          >
            <option value="latest">Sort: Latest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="title">Sort: Title (A-Z)</option>
            <option value="loves">Sort: Most Loved</option>
          </select>
        </div>
      </div>

      {/* APK Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070a12] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Version &amp; Size</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Featured</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredApks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No APK records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredApks.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.appIcon || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&auto=format&fit=crop&q=80'}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate max-w-xs">{item.title}</p>
                          <p className="text-[11px] text-slate-400 font-mono truncate">
                            By {item.developerName} · /{item.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-slate-200 font-medium">{item.version}</p>
                      <p className="text-[11px] text-slate-400">{item.fileSize}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={item.status}
                        onChange={(e) => setApkStatus(item.id, e.target.value as ContentStatus)}
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

                    <td className="py-3.5 px-4">
                      {item.featured ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> Yes
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleView(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          title="View Details & Download"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit APK"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                          title="Delete APK"
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

        {/* Footer row */}
        <div className="p-3 bg-[#070a12] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredApks.length} of {apks.length} total APK records</span>
          <span className="text-[11px]">Firestore collection: <code>/apkApps</code></span>
        </div>
      </div>

      {/* Modals */}
      <ApkFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        initialData={editingItem}
      />

      <ApkDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        item={viewingItem}
        onEdit={(item) => handleEdit(item)}
      />

      <ConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        title="Delete APK Item"
        message="Are you sure you want to permanently delete this APK item from the database? This action cannot be undone."
        confirmLabel="Delete Permanently"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};
