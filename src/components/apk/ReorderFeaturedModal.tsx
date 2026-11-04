import React, { useState, useEffect } from 'react';
import { ApkItem } from '../../types';
import { useData } from '../../context/DataContext';
import { 
  X, 
  Star, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  AlertCircle, 
  GripVertical,
  Trash2,
  ExternalLink,
  Smartphone,
  Gamepad2
} from 'lucide-react';

interface ReorderFeaturedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReorderFeaturedModal: React.FC<ReorderFeaturedModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { apks, reorderFeaturedApks, togglePinApk } = useData();
  const [pinnedList, setPinnedList] = useState<ApkItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Sort pinned APKs by featuredOrder ascending (or fallback to createdAt)
      const pinned = apks
        .filter(a => a.featured)
        .sort((a, b) => {
          const orderA = a.featuredOrder || a.pinOrder || 999;
          const orderB = b.featuredOrder || b.pinOrder || 999;
          return orderA - orderB;
        });
      setPinnedList(pinned);
      setHasChanges(false);
    }
  }, [isOpen, apks]);

  if (!isOpen) return null;

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pinnedList.length) return;

    const updated = [...pinnedList];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    setPinnedList(updated);
    setHasChanges(true);
  };

  const handleUnpin = async (id: string) => {
    try {
      await togglePinApk(id, false);
      setPinnedList(prev => prev.filter(x => x.id !== id));
      setHasChanges(true);
    } catch (err) {
      console.error('Failed to unpin:', err);
    }
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    try {
      const orderedIds = pinnedList.map(item => item.id);
      await reorderFeaturedApks(orderedIds);
      setHasChanges(false);
      onClose();
    } catch (err) {
      console.error('Failed to save reordered APKs:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#0b0f19] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative my-6 text-left max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-500/10">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Featured APKs · Homepage Top Order
              </h2>
              <p className="text-xs text-slate-400">
                Control the exact order pinned APKs appear before regular cards on the Main Website
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="my-4 p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-indigo-300">
          <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            Position <strong>#1</strong> renders first at the top of the Homepage Featured section.
          </span>
        </div>

        {/* Pinned List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 py-1">
          {pinnedList.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800">
              <Star className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No APKs currently pinned</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You can pin any MOD App or MOD Game to the Homepage top using the star button in the APK Manager table.
              </p>
            </div>
          ) : (
            pinnedList.map((item, index) => {
              const isFirst = index === 0;
              const isLast = index === pinnedList.length - 1;
              const isGame = item.category === 'MOD Games';

              return (
                <div
                  key={item.id}
                  className="p-3 bg-[#0f172a] hover:bg-[#131d35] border border-slate-800 rounded-2xl flex items-center gap-3 transition-all group"
                >
                  {/* Position Badge */}
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs flex items-center justify-center shrink-0">
                    #{index + 1}
                  </div>

                  {/* App Icon */}
                  <img
                    src={item.appIcon || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&auto=format&fit=crop&q=80'}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0"
                  />

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white truncate">{item.title}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isGame 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                      }`}>
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {item.version} · {item.fileSize} {item.developerName ? `· by ${item.developerName}` : ''}
                    </p>
                  </div>

                  {/* Move Up / Down Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveItem(index, 'up')}
                      disabled={isFirst}
                      title="Move Up"
                      className="p-1.5 rounded-xl bg-[#070a12] border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, 'down')}
                      disabled={isLast}
                      title="Move Down"
                      className="p-1.5 rounded-xl bg-[#070a12] border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnpin(item.id)}
                      title="Unpin APK"
                      className="p-1.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-400 hover:bg-rose-900/30 transition-all cursor-pointer ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400 font-medium">
            {pinnedList.length} {pinnedList.length === 1 ? 'APK' : 'APKs'} pinned to top
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveOrder}
              disabled={isSaving || pinnedList.length === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-600/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving Order...' : 'Save Featured Order'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
