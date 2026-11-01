import React from 'react';
import { VideoTemplate } from '../../types';
import { 
  X, 
  Film, 
  ExternalLink, 
  Download, 
  Layers, 
  Eye, 
  HelpCircle, 
  ShieldCheck,
  CheckCircle2 
} from 'lucide-react';

interface TemplatePreviewModalProps {
  template: VideoTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (template: VideoTemplate) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 shadow-2xl relative my-8 text-left max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800 shrink-0">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {template.editingPlatform}
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                {template.category}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">{template.title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 pr-1">
          {/* Media / Video preview */}
          <div className="rounded-2xl overflow-hidden border border-slate-800 relative bg-black max-h-72 flex items-center justify-center">
            {template.previewVideoUrl ? (
              <video
                src={template.previewVideoUrl}
                controls
                className="w-full max-h-72 object-contain"
              />
            ) : (
              <img
                src={template.thumbnail}
                alt=""
                className="w-full h-full object-cover max-h-72"
              />
            )}
          </div>

          {/* Action Link Buttons Showcase (as seen by public visitors) */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Public Visitor Action Buttons
            </h4>
            <div className="flex flex-wrap gap-3">
              {template.directTemplateUrl && (
                <a
                  href={template.directTemplateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Use Template ({template.editingPlatform})</span>
                </a>
              )}

              {template.downloadableFileUrl && (
                <a
                  href={template.downloadableFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download File ({template.fileFormat} · {template.fileSize})</span>
                </a>
              )}
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Format</span>
              <p className="font-semibold text-white mt-0.5">{template.fileFormat}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">File Size</span>
              <p className="font-semibold text-white mt-0.5">{template.fileSize}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Views</span>
              <p className="font-semibold text-cyan-400 mt-0.5">{template.viewsCount}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
              <p className="font-semibold text-emerald-400 mt-0.5 capitalize">{template.status}</p>
            </div>
          </div>

          {/* Instructions */}
          {template.usageInstructions && (
            <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-2xl flex items-start gap-2.5 text-xs">
              <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-200">How to Import &amp; Use:</p>
                <p className="text-slate-300 mt-0.5 leading-relaxed">{template.usageInstructions}</p>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Overview</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{template.shortDescription}</p>
            {template.fullDescription && (
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{template.fullDescription}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 font-mono">
            Slug: /template/{template.slug}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => { onClose(); onEdit(template); }}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
            >
              Edit Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
