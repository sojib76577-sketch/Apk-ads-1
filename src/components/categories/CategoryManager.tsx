import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { CategoryItem, ContentType } from '../../types';
import { CategoryFormModal } from './CategoryFormModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  FolderTree, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  ShieldAlert, 
  Smartphone, 
  Sparkles, 
  Film,
  Layers
} from 'lucide-react';

export const CategoryManager: React.FC = () => {
  const { categories, apks, prompts, templates, deleteCategory } = useData();

  const [search, setSearch] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<'All' | ContentType>('All');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Compute published items count for each category to enforce delete protection rule
  const categoryStats = useMemo(() => {
    const map = new Map<string, { total: number; published: number }>();

    for (const cat of categories) {
      const relatedApks = apks.filter(a => a.category === cat.name);
      const relatedPrompts = prompts.filter(p => p.category === cat.name);
      const relatedTemplates = templates.filter(t => t.category === cat.name);

      const all = [...relatedApks, ...relatedPrompts, ...relatedTemplates];
      const published = all.filter(i => i.status === 'published').length;

      map.set(cat.id, { total: all.length, published });
    }

    return map;
  }, [categories, apks, prompts, templates]);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch = 
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        cat.slug.toLowerCase().includes(search.toLowerCase()) ||
        cat.description.toLowerCase().includes(search.toLowerCase());

      const matchesType = contentTypeFilter === 'All' || cat.contentType === contentTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [categories, search, contentTypeFilter]);

  const handleEdit = (cat: CategoryItem) => {
    setEditingItem(cat);
    setFormModalOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormModalOpen(true);
  };

  const handleDeleteRequest = (cat: CategoryItem) => {
    const stats = categoryStats.get(cat.id) || { total: 0, published: 0 };
    if (stats.published > 0) {
      alert(
        `Action Blocked by System Rule: "${cat.name}" still contains ${stats.published} published items. You must reassign or unpublish those items before this category can be removed.`
      );
      return;
    }
    setConfirmDeleteId(cat.id);
  };

  const handleConfirmDelete = async () => {
    if (confirmDeleteId) {
      await deleteCategory(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'MOD Apps':
      case 'MOD Games':
        return <Smartphone className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Photo Editing Prompts':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      case 'Video Templates':
        return <Film className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-indigo-400" />
            Category Manager
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize content across MOD Apps, MOD Games, Photo Prompts, and Video Templates
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Safety Policy Notice */}
      <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-start gap-3 text-xs text-slate-300">
        <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Deletion Safety Constraint:</strong> A category cannot be deleted if it currently contains published public items. This prevents broken taxonomy references on the public website.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name, slug, description..."
            className="w-full bg-[#070a12] border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={contentTypeFilter}
            onChange={(e) => setContentTypeFilter(e.target.value as any)}
            className="bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none cursor-pointer"
          >
            <option value="All">All Content Types</option>
            <option value="MOD Apps">MOD Apps</option>
            <option value="MOD Games">MOD Games</option>
            <option value="Photo Editing Prompts">Photo Editing Prompts</option>
            <option value="Video Templates">Video Templates</option>
          </select>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070a12] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Content Type</th>
                <th className="py-3 px-4">Attached Items</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const stats = categoryStats.get(cat.id) || { total: 0, published: 0 };
                  const isProtectedFromDelete = stats.published > 0;

                  return (
                    <tr key={cat.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {cat.imageUrl ? (
                            <img
                              src={cat.imageUrl}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                              <FolderTree className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate max-w-xs">{cat.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono truncate">/{cat.slug}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                          {getTypeIcon(cat.contentType)}
                          {cat.contentType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-[11px]">
                          <span className="text-white font-medium">{stats.total} total</span>
                          <span className="text-slate-400"> ({stats.published} published)</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                            cat.status === 'active'
                              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20'
                              : 'text-slate-400 border-slate-700 bg-slate-900'
                          }`}
                        >
                          {cat.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(cat)}
                            disabled={isProtectedFromDelete}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isProtectedFromDelete
                                ? 'text-slate-600 cursor-not-allowed'
                                : 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/20'
                            }`}
                            title={isProtectedFromDelete ? 'Cannot delete: contains published content' : 'Delete Category'}
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

        <div className="p-3 bg-[#070a12] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>{filteredCategories.length} categories configured</span>
          <span className="text-[11px]">Firestore collection: <code>/categories</code></span>
        </div>
      </div>

      <CategoryFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        initialData={editingItem}
      />

      <ConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        title="Delete Category"
        message="Are you sure you want to delete this category? There are no published items currently attached to it."
        confirmLabel="Delete Category"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};
