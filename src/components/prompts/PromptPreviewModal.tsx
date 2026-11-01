import React, { useState } from 'react';
import { PhotoPrompt } from '../../types';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  Heart, 
  Eye, 
  Layers, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface PromptPreviewModalProps {
  prompt: PhotoPrompt | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (prompt: PhotoPrompt) => void;
}

export const PromptPreviewModal: React.FC<PromptPreviewModalProps> = ({
  prompt,
  isOpen,
  onClose,
  onEdit,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !prompt) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {prompt.aiPlatform}
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                {prompt.category}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">{prompt.title}</h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 pr-1">
          {/* Preview Image */}
          <div className="rounded-2xl overflow-hidden border border-slate-800 relative max-h-72">
            <img
              src={prompt.previewImage}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-semibold text-white border border-white/10">
              <span className="flex items-center gap-1 text-pink-400">
                <Heart className="w-3.5 h-3.5 fill-pink-400" /> {prompt.lovesCount}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-cyan-400">
                <Eye className="w-3.5 h-3.5" /> {prompt.viewsCount}
              </span>
            </div>
          </div>

          {/* Copyable Prompt Box */}
          <div className="bg-[#070a12] border border-purple-900/40 rounded-2xl p-4 relative group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Prompt Formula
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/30 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Prompt'}</span>
              </button>
            </div>
            <p className="text-xs text-purple-100 font-mono leading-relaxed select-all whitespace-pre-wrap">
              {prompt.promptText}
            </p>
          </div>

          {/* Instructions */}
          {prompt.instructions && (
            <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-2xl flex items-start gap-2.5 text-xs">
              <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-200">How to Use:</p>
                <p className="text-slate-300 mt-0.5 leading-relaxed">{prompt.instructions}</p>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Description</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{prompt.shortDescription}</p>
            {prompt.fullDescription && (
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{prompt.fullDescription}</p>
            )}
          </div>

          {/* Tags */}
          {prompt.seoTags && prompt.seoTags.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Keywords</h4>
              <div className="flex flex-wrap gap-1.5">
                {prompt.seoTags.map(tag => (
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
            Slug: /prompt/{prompt.slug}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => { onClose(); onEdit(prompt); }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              Edit Prompt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
