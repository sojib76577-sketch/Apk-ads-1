import React from 'react';
import { ApkItem } from '../../types';
import { 
  X, 
  Smartphone, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Calendar, 
  HardDrive, 
  Tag, 
  Heart, 
  Eye, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface ApkDetailModalProps {
  item: ApkItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: ApkItem) => void;
}

export const ApkDetailModal: React.FC<ApkDetailModalProps> = ({ item, isOpen, onClose, onEdit }) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 shadow-2xl relative my-8 text-left max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Hero */}
        <div className="flex items-start gap-4 pb-5 border-b border-slate-800 shrink-0">
          <img
            src={item.appIcon || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&auto=format&fit=crop&q=80'}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover border border-slate-700/80 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {item.category}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                item.status === 'published' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : item.status === 'draft'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {item.status.toUpperCase()}
              </span>
              {item.featured && (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                  PINNED #{item.featuredOrder || item.pinOrder || 1}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-white mt-1.5 truncate">{item.title}</h2>
            <p className="text-xs text-slate-400">
              {item.packageName ? `${item.packageName} · ` : ''}By {item.developerName || 'Developer'} · Version {item.version}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">File Size</span>
              <p className="text-xs font-semibold text-white mt-0.5">{item.fileSize}</p>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Requirements</span>
              <p className="text-xs font-semibold text-white mt-0.5">{item.androidRequirements}</p>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Loves / Hearts</span>
              <p className="text-xs font-semibold text-pink-400 mt-0.5 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-pink-400" /> {item.lovesCount}
              </p>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Views</span>
              <p className="text-xs font-semibold text-cyan-400 mt-0.5 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {item.viewsCount}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Overview</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{item.shortDescription}</p>
            <div className="mt-3 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {item.fullDescription}
            </div>
            {item.changelog && (
              <div className="mt-3 p-3.5 bg-indigo-950/20 rounded-xl border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed">
                <span className="font-bold text-indigo-300 block mb-1">Changelog &amp; What&apos;s New:</span>
                <p className="whitespace-pre-wrap">{item.changelog}</p>
              </div>
            )}
          </div>

          {/* Download & Source Destination Verification */}
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-4 h-4 text-indigo-400" />
              Download Destination Verification
            </h4>
            <div className="flex items-center justify-between p-2.5 bg-[#070a12] rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 truncate mr-2">Link: <code className="text-indigo-300">{item.downloadUrl}</code></span>
              <a
                href={item.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                Test Link <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {item.officialSourceUrl && (
              <div className="flex items-center justify-between p-2.5 bg-[#070a12] rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 truncate mr-2">Official Store: <code className="text-slate-300">{item.officialSourceUrl}</code></span>
                <a
                  href={item.officialSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  Visit <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>License: {item.licenseInfo}</span>
            </div>
          </div>

          {/* Screenshots Gallery */}
          {item.screenshots && item.screenshots.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Screenshots</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {item.screenshots.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-full h-32 object-cover rounded-xl border border-slate-800"
                  />
                ))}
              </div>
            </div>
          )}

          {/* SEO Tags */}
          {item.seoTags && item.seoTags.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">SEO Keywords</h4>
              <div className="flex flex-wrap gap-1.5">
                {item.seoTags.map(tag => (
                  <span key={tag} className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/60">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 font-mono">
            Slug: /apk/{item.slug}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => { onClose(); onEdit(item); }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Edit APK Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
