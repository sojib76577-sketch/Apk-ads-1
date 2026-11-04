import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { ApkItem, ApkCategory, ContentStatus } from '../../types';
import { ApkFormModal } from './ApkFormModal';
import { ApkDetailModal } from './ApkDetailModal';
import { ReorderFeaturedModal } from './ReorderFeaturedModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  Smartphone, 
  Gamepad2,
  Plus, 
  Search, 
  Filter, 
  Star, 
  Edit3, 
  Trash2, 
  Eye, 
  ExternalLink,
  Download,
  ArrowUpDown,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

export const ApkManager: React.FC = () => {
  const { apks, deleteApk, setApkStatus, togglePinApk } = useData();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ApkCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ContentStatus>('All');
  const [featuredFilter, setFeaturedFilter] = useState<'All' | 'Featured' | 'Standard'>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'latest' | 'oldest' | 'title' | 'loves'>('featured');

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ApkItem | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<ApkItem | null>(null);

  const [reorderModalOpen, setReorderModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const pinnedApkCount = useMemo(() => apks.filter(a => a.featured).length, [apks]);

  const filteredApks = useMemo(() => {
    return apks
      .filter((item) => {
        const matchesSearch = 
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          (item.name && item.name.toLowerCase().includes(search.toLowerCase())) ||
          item.developerName.toLowerCase().includes(search.toLowerCase()) ||
          (item.packageName && item.packageName.toLowerCase().includes(search.toLowerCase())) ||
          item.slug.toLowerCase().includes(search.toLowerCase()) ||
          (item.seoTags && item.seoTags.some(t => t.toLowerCase().includes(search.toLowerCase())));

        const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        const matchesFeatured = 
          featuredFilter === 'All' ? true :
          featuredFilter === 'Featured' ? item.featured :
          !item.featured;

        return matchesSearch && matchesCat && matchesStatus && matchesFeatured;
      })
      .sort((a, b) => {
        if (sortBy === 'featured') {
          // Pinned first, ordered by featuredOrder ascending, then regular by latest
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          if (a.featured && b.featured) {
            const orderA = a.featuredOrder || a.pinOrder || 999;
            const orderB = b.featuredOrder || b.pinOrder || 999;
            return orderA - orderB;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
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
  }, [apks, search, categoryFilter, statusFilter, featuredFilter, sortBy]);

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
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            <span>MOD Apps &amp; Games Manager</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage uploads, modify download links, pin featured APKs, and sync live with Main Website
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setReorderModalOpen(true)}
            className="px-3.5 py-2 bg-[#0f172a] hover:bg-slate-800 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 transition-all cursor-pointer"
            title="Reorder Homepage Top Pinned APKs"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Reorder Pinned ({pinnedApkCount})</span>
          </button>

          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New APK</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, developer, package name (com.*), slug, tags..."
              className="w-full bg-[#070a12] border border-slate-800 rounded-2xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Quick Filter Selects */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'All' | ApkCategory)}
              className="bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="MOD Apps">MOD Apps</option>
              <option value="MOD Games">MOD Games (Green)</option>
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

            {/* Featured Filter */}
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value as 'All' | 'Featured' | 'Standard')}
              className="bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="All">All Pinned States</option>
              <option value="Featured">Pinned to Top Only</option>
              <option value="Standard">Not Pinned</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="featured">Sort: Featured First</option>
              <option value="latest">Sort: Latest Added</option>
              <option value="oldest">Sort: Oldest Added</option>
              <option value="title">Sort: Title (A-Z)</option>
              <option value="loves">Sort: Most Loved</option>
            </select>
          </div>
        </div>
      </div>

      {/* DESKTOP TABLE VIEW (hidden on small mobile screens) */}
      <div className="hidden md:block bg-[#0f172a] border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070a12] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4">Pin to Top</th>
                <th className="py-3 px-4">Item &amp; Package</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Version &amp; Size</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredApks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No APK records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredApks.map((item) => {
                  const isGame = item.category === 'MOD Games';
                  const isPinned = item.featured;
                  const pinOrderNum = item.featuredOrder || item.pinOrder || 0;

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-900/50 transition-colors ${
                        isPinned ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      {/* Pin to Top Button */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => togglePinApk(item.id)}
                          className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                            isPinned
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10'
                              : 'bg-[#070a12] border-slate-800 text-slate-500 hover:text-amber-400 hover:border-slate-700'
                          }`}
                          title={isPinned ? 'Unpin from Homepage Top' : 'Pin to Homepage Top'}
                        >
                          <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400 text-amber-400' : ''}`} />
                          {isPinned ? (
                            <span className="text-[10px] font-extrabold text-amber-300">
                              #{pinOrderNum > 0 ? pinOrderNum : 'Top'}
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium hidden lg:inline">Pin</span>
                          )}
                        </button>
                      </td>

                      {/* Item Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.appIcon || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&auto=format&fit=crop&q=80'}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-white truncate flex items-center gap-1.5">
                              <span>{item.title}</span>
                              {isPinned && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[9px] font-extrabold uppercase">
                                  Pinned
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono truncate">
                              {item.packageName ? `${item.packageName} · ` : ''}By {item.developerName || 'Developer'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          isGame
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                        }`}>
                          {item.category}
                        </span>
                      </td>

                      {/* Version & Size */}
                      <td className="py-3.5 px-4">
                        <p className="text-slate-200 font-semibold">{item.version}</p>
                        <p className="text-[11px] text-slate-400">{item.fileSize}</p>
                      </td>

                      {/* Status Selector */}
                      <td className="py-3.5 px-4">
                        <select
                          value={item.status}
                          onChange={(e) => setApkStatus(item.id, e.target.value as ContentStatus)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border bg-transparent cursor-pointer outline-none ${
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

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={item.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Test Download URL"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleView(item)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Preview Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit APK"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(item.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                            title="Delete APK"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#070a12] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredApks.length} of {apks.length} total APK records ({pinnedApkCount} Pinned to Top)</span>
          <span className="text-[11px] font-mono">Collection: <code>/apkApps</code></span>
        </div>
      </div>

      {/* MOBILE RESPONSIVE CARDS VIEW (Optimized for Android phone screens) */}
      <div className="md:hidden space-y-3">
        {filteredApks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-[#0f172a] rounded-3xl border border-slate-800">
            No APK records found matching your filters.
          </div>
        ) : (
          filteredApks.map((item) => {
            const isGame = item.category === 'MOD Games';
            const isPinned = item.featured;
            const pinOrderNum = item.featuredOrder || item.pinOrder || 0;

            return (
              <div 
                key={item.id}
                className={`p-4 bg-[#0f172a] border rounded-3xl space-y-3.5 shadow-lg transition-all ${
                  isPinned ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800'
                }`}
              >
                {/* Top Row: Icon + Title + Category */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.appIcon || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-white truncate">{item.title}</h3>
                      <p className="text-xs text-slate-400 truncate">
                        {item.version} · {item.fileSize}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border shrink-0 ${
                    isGame
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                  }`}>
                    {item.category}
                  </span>
                </div>

                {/* Sub info */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => togglePinApk(item.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                        isPinned
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-[#070a12] border-slate-800 text-slate-400 hover:text-amber-400'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400 text-amber-400' : ''}`} />
                      <span>{isPinned ? `Pinned #${pinOrderNum > 0 ? pinOrderNum : 'Top'}` : 'Pin to Top'}</span>
                    </button>
                  </div>

                  <select
                    value={item.status}
                    onChange={(e) => setApkStatus(item.id, e.target.value as ContentStatus)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border bg-[#070a12] cursor-pointer outline-none ${
                      item.status === 'published'
                        ? 'text-emerald-400 border-emerald-500/30'
                        : item.status === 'draft'
                        ? 'text-amber-400 border-amber-500/30'
                        : 'text-rose-400 border-rose-500/30'
                    }`}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="unpublished">Unpublished</option>
                  </select>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                  <a
                    href={item.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[#070a12] border border-slate-800 text-slate-300 hover:text-cyan-300 rounded-xl text-xs flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                  <button
                    onClick={() => handleView(item)}
                    className="px-3 py-1.5 bg-[#070a12] border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(item.id)}
                    className="p-1.5 bg-rose-950/20 border border-rose-500/30 text-rose-400 hover:bg-rose-900/30 rounded-xl text-xs cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
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

      <ReorderFeaturedModal
        isOpen={reorderModalOpen}
        onClose={() => setReorderModalOpen(false)}
      />

      <ConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        title="Delete APK Item"
        message="Are you sure you want to permanently delete this APK item from Firebase Firestore? This action cannot be undone."
        confirmLabel="Delete Permanently"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};
