import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { ContentStatus, ApkItem, PhotoPrompt, VideoTemplate } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { ApkDetailModal } from '../apk/ApkDetailModal';
import { ApkFormModal } from '../apk/ApkFormModal';
import { PromptPreviewModal } from '../prompts/PromptPreviewModal';
import { PromptFormModal } from '../prompts/PromptFormModal';
import { TemplatePreviewModal } from '../templates/TemplatePreviewModal';
import { TemplateFormModal } from '../templates/TemplateFormModal';
import { 
  Table, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  EyeOff, 
  Star, 
  Smartphone, 
  Gamepad2, 
  Sparkles, 
  Film 
} from 'lucide-react';

type TableTab = 'apk-apps' | 'apk-games' | 'photo-prompts' | 'video-templates';

export const ContentManagementTable: React.FC = () => {
  const { 
    apks, 
    prompts, 
    templates, 
    deleteApk, 
    setApkStatus, 
    deletePrompt, 
    setPromptStatus, 
    deleteTemplate, 
    setTemplateStatus 
  } = useData();

  const [activeTab, setActiveTab] = useState<TableTab>('apk-apps');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ContentStatus>('All');
  const [sortField, setSortField] = useState<'created' | 'updated' | 'title'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; type: TableTab; title: string } | null>(null);

  const [selectedApk, setSelectedApk] = useState<ApkItem | null>(null);
  const [apkViewOpen, setApkViewOpen] = useState(false);
  const [apkEditOpen, setApkEditOpen] = useState(false);

  const [selectedPrompt, setSelectedPrompt] = useState<PhotoPrompt | null>(null);
  const [promptViewOpen, setPromptViewOpen] = useState(false);
  const [promptEditOpen, setPromptEditOpen] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);
  const [templateViewOpen, setTemplateViewOpen] = useState(false);
  const [templateEditOpen, setTemplateEditOpen] = useState(false);

  // Normalize current table items
  const currentItems = useMemo(() => {
    let list: any[] = [];
    if (activeTab === 'apk-apps') {
      list = apks.filter(a => a.category === 'MOD Apps');
    } else if (activeTab === 'apk-games') {
      list = apks.filter(a => a.category === 'MOD Games');
    } else if (activeTab === 'photo-prompts') {
      list = prompts;
    } else if (activeTab === 'video-templates') {
      list = templates;
    }

    return list
      .filter((item) => {
        const matchesSearch = 
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          (item.category && item.category.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let valA: any = a.createdAt;
        let valB: any = b.createdAt;

        if (sortField === 'updated') {
          valA = a.updatedAt;
          valB = b.updatedAt;
        } else if (sortField === 'title') {
          valA = a.title.toLowerCase();
          valB = b.title.toLowerCase();
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        const timeA = new Date(valA).getTime();
        const timeB = new Date(valB).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      });
  }, [activeTab, apks, prompts, templates, search, statusFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(currentItems.length / itemsPerPage) || 1;
  const paginatedItems = currentItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTabChange = (tab: TableTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleStatusChange = async (id: string, newStatus: ContentStatus) => {
    if (activeTab === 'apk-apps' || activeTab === 'apk-games') {
      await setApkStatus(id, newStatus);
    } else if (activeTab === 'photo-prompts') {
      await setPromptStatus(id, newStatus);
    } else {
      await setTemplateStatus(id, newStatus);
    }
  };

  const handleView = (item: any) => {
    if (activeTab === 'apk-apps' || activeTab === 'apk-games') {
      setSelectedApk(item);
      setApkViewOpen(true);
    } else if (activeTab === 'photo-prompts') {
      setSelectedPrompt(item);
      setPromptViewOpen(true);
    } else {
      setSelectedTemplate(item);
      setTemplateViewOpen(true);
    }
  };

  const handleEdit = (item: any) => {
    if (activeTab === 'apk-apps' || activeTab === 'apk-games') {
      setSelectedApk(item);
      setApkEditOpen(true);
    } else if (activeTab === 'photo-prompts') {
      setSelectedPrompt(item);
      setPromptEditOpen(true);
    } else {
      setSelectedTemplate(item);
      setTemplateEditOpen(true);
    }
  };

  const handleDeleteExecute = async () => {
    if (!confirmDelete) return;
    const { id, type } = confirmDelete;
    if (type === 'apk-apps' || type === 'apk-games') {
      await deleteApk(id);
    } else if (type === 'photo-prompts') {
      await deletePrompt(id);
    } else {
      await deleteTemplate(id);
    }
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Table className="w-5 h-5 text-indigo-400" />
          Content Management Tables
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Unified high-throughput CRUD table view with sorting, filtering, and pagination
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#0f172a] rounded-2xl border border-slate-800 overflow-x-auto">
        <button
          onClick={() => handleTabChange('apk-apps')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeTab === 'apk-apps' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>APK Apps ({apks.filter(a => a.category === 'MOD Apps').length})</span>
        </button>

        <button
          onClick={() => handleTabChange('apk-games')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeTab === 'apk-games' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>APK Games ({apks.filter(a => a.category === 'MOD Games').length})</span>
        </button>

        <button
          onClick={() => handleTabChange('photo-prompts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeTab === 'photo-prompts' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Photo Prompts ({prompts.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('video-templates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeTab === 'video-templates' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Video Templates ({templates.length})</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search records by title or category..."
            className="w-full bg-[#070a12] border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
            className="bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="unpublished">Unpublished</option>
          </select>

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as any)}
            className="bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none cursor-pointer"
          >
            <option value="created">Sort: Created Date</option>
            <option value="updated">Sort: Updated Date</option>
            <option value="title">Sort: Title</option>
          </select>

          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070a12] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4">Thumbnail</th>
                <th className="py-3 px-4">Title &amp; Meta</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Updated Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Featured</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No records found matching filters.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const thumb = item.appIcon || item.previewImage || item.thumbnail || '';
                  return (
                    <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4">
                        <img
                          src={thumb || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-slate-800"
                        />
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-semibold text-white truncate">{item.title}</p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">/{item.slug}</p>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-300 font-medium">{item.category}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as ContentStatus)}
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-transparent cursor-pointer outline-none ${
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

                      <td className="py-3 px-4">
                        {item.featured ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400" /> Yes
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleView(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title="View Record"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete({ id: item.id, type: activeTab, title: item.title })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                            title="Delete Record"
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

        {/* Pagination footer */}
        <div className="p-3 bg-[#070a12] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page {currentPage} of {totalPages} ({currentItems.length} items total)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={Boolean(confirmDelete)}
        title="Delete Content Record"
        message={`Are you sure you want to delete "${confirmDelete?.title}"? This will permanently remove the record from Firestore.`}
        confirmLabel="Confirm Delete"
        onConfirm={handleDeleteExecute}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Sub modals */}
      <ApkDetailModal
        isOpen={apkViewOpen}
        onClose={() => setApkViewOpen(false)}
        item={selectedApk}
        onEdit={(item) => { setSelectedApk(item); setApkEditOpen(true); }}
      />
      <ApkFormModal
        isOpen={apkEditOpen}
        onClose={() => setApkEditOpen(false)}
        initialData={selectedApk}
      />

      <PromptPreviewModal
        isOpen={promptViewOpen}
        onClose={() => setPromptViewOpen(false)}
        prompt={selectedPrompt}
        onEdit={(item) => { setSelectedPrompt(item); setPromptEditOpen(true); }}
      />
      <PromptFormModal
        isOpen={promptEditOpen}
        onClose={() => setPromptEditOpen(false)}
        initialData={selectedPrompt}
      />

      <TemplatePreviewModal
        isOpen={templateViewOpen}
        onClose={() => setTemplateViewOpen(false)}
        template={selectedTemplate}
        onEdit={(item) => { setSelectedTemplate(item); setTemplateEditOpen(true); }}
      />
      <TemplateFormModal
        isOpen={templateEditOpen}
        onClose={() => setTemplateEditOpen(false)}
        initialData={selectedTemplate}
      />
    </div>
  );
};
