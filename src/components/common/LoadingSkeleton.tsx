import React from 'react';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 animate-pulse space-y-3"
        >
          <div className="w-full h-44 bg-slate-800/80 rounded-2xl" />
          <div className="h-4 bg-slate-800/80 rounded w-3/4" />
          <div className="h-3 bg-slate-800/60 rounded w-1/2" />
          <div className="pt-2 flex justify-between items-center">
            <div className="h-8 bg-slate-800/80 rounded-xl w-24" />
            <div className="h-8 bg-slate-800/80 rounded-xl w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ApkRowSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 animate-pulse flex items-center gap-3.5">
          <div className="w-16 h-16 bg-slate-800/80 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-800/80 rounded w-3/4" />
            <div className="h-3 bg-slate-800/60 rounded w-1/2" />
            <div className="h-3 bg-slate-800/40 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

interface EmptyStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, message, onRetry }) => {
  return (
    <div className="bg-[#0f172a]/80 border border-slate-800/80 rounded-3xl p-10 text-center max-w-md mx-auto my-8">
      <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 mx-auto mb-3">
        🔍
      </div>
      <h3 className="text-base font-bold text-white">{title}</h3>
      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          Refresh &amp; Retry
        </button>
      )}
    </div>
  );
};
