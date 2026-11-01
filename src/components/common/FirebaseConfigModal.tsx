import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FirebaseCustomConfig } from '../../services/firebase';
import { Database, ShieldCheck, CheckCircle2, AlertCircle, Copy, Key, X } from 'lucide-react';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { firebaseConfig, updateFirebaseConfig, resetFirebaseConfig, isConfigured } = useAuth();

  const [rawJson, setRawJson] = useState('');
  const [apiKey, setApiKey] = useState(firebaseConfig?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(firebaseConfig?.authDomain || '');
  const [projectId, setProjectId] = useState(firebaseConfig?.projectId || '');
  const [storageBucket, setStorageBucket] = useState(firebaseConfig?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(firebaseConfig?.messagingSenderId || '');
  const [appId, setAppId] = useState(firebaseConfig?.appId || '');
  const [copiedSample, setCopiedSample] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleJsonPaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawJson(val);
    setParseError(null);

    if (!val.trim()) return;

    try {
      // Support raw JSON or JS object format
      let jsonString = val.trim();
      if (jsonString.startsWith('const firebaseConfig =')) {
        jsonString = jsonString.replace('const firebaseConfig =', '').replace(/;$/, '').trim();
      }
      // If object keys are not quoted, quote them
      const normalized = jsonString.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
      const parsed = JSON.parse(normalized);

      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
      if (parsed.appId) setAppId(parsed.appId);
    } catch {
      setParseError('Could not auto-parse JSON snippet. You can fill the fields manually below.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId.trim() || !apiKey.trim()) {
      setParseError('Project ID and API Key are required.');
      return;
    }

    const newConfig: FirebaseCustomConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    };

    updateFirebaseConfig(newConfig);
    onClose();
  };

  const copySampleConfig = () => {
    const sample = `{
  "apiKey": "AIzaSyDUgVpz2j424Zm7Ig3KjWKPVG1N7lK4o00",
  "authDomain": "promptxhub-4e329.firebaseapp.com",
  "projectId": "promptxhub-4e329",
  "storageBucket": "promptxhub-4e329.firebasestorage.app",
  "messagingSenderId": "868593809230",
  "appId": "1:868593809230:web:c46ff181c88faf5c55901f",
  "measurementId": "G-F1XY2D0WTL"
}`;
    navigator.clipboard.writeText(sample);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-2xl relative my-8 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Firebase Project Connection
              {isConfigured ? (
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                </span>
              ) : (
                <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Not Configured
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Reuse your existing PromptXHubl Firebase project credentials. Never committed to source code.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Paste Firebase Web Config (Optional Quick-Fill)
              </label>
              <button
                type="button"
                onClick={copySampleConfig}
                className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedSample ? 'Sample Copied!' : 'Copy Sample Format'}
              </button>
            </div>
            <textarea
              rows={3}
              value={rawJson}
              onChange={handleJsonPaste}
              placeholder="Paste the { apiKey, projectId, ... } config object from Firebase Console > Project settings > General"
              className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
            {parseError && (
              <p className="text-xs text-amber-400 mt-1">{parseError}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Project ID <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="e.g. promptxhubl"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                API Key <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Auth Domain
              </label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="e.g. promptxhubl.firebaseapp.com"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Storage Bucket
              </label>
              <input
                type="text"
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                placeholder="e.g. promptxhubl.appspot.com"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Messaging Sender ID
              </label>
              <input
                type="text"
                value={messagingSenderId}
                onChange={(e) => setMessagingSenderId(e.target.value)}
                placeholder="e.g. 123456789012"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                App ID
              </label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="e.g. 1:1234567890:web:abcdef..."
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
            <Key className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              Configuration is safely held in your browser's local encrypted sandbox. The Admin Website connects directly to Firestore and Firebase Storage using Firebase Web SDK v13.
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {isConfigured ? (
              <button
                type="button"
                onClick={resetFirebaseConfig}
                className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Clear Saved Config
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-xs font-semibold text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Save & Initialize Firebase
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
