import React, { useState } from 'react';
import { ShieldCheck, Copy, CheckCircle2, X, Terminal, FileCode2 } from 'lucide-react';

interface SecurityRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FIRESTORE_RULES_TEXT = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Default deny all access
    match /{document=**} {
      allow read, write: if false;
    }

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() && (
        exists(/databases/$(database)/documents/admins/$(request.auth.uid)) ||
        request.auth.token.email in ['sojib76577@gmail.com', 'lamiaalter@gmail.com']
      );
    }

    function isPublished() {
      return resource.data.status == 'published';
    }

    // 1. Admin Registry: /admins/{uid}
    match /admins/{uid} {
      allow get: if isSignedIn() && (request.auth.uid == uid || isAdmin());
      allow list: if isAdmin();
      allow create: if isSignedIn() && (request.auth.uid == uid || isAdmin());
      allow update, delete: if isAdmin();
    }

    // 2. APK Apps & Games: /apkApps/{itemId}
    match /apkApps/{itemId} {
      allow get: if isPublished() || isAdmin();
      allow list: if isAdmin() || (resource.data.status == 'published');
      allow create, update, delete: if isAdmin();
    }

    // 3. Photo Editing Prompts: /photoPrompts/{promptId}
    match /photoPrompts/{promptId} {
      allow get: if isPublished() || isAdmin();
      allow list: if isAdmin() || (resource.data.status == 'published');
      allow create, update, delete: if isAdmin();
    }

    // 4. Video Templates: /videoTemplates/{templateId}
    match /videoTemplates/{templateId} {
      allow get: if isPublished() || isAdmin();
      allow list: if isAdmin() || (resource.data.status == 'published');
      allow create, update, delete: if isAdmin();
    }

    // 5. Categories: /categories/{categoryId}
    match /categories/{categoryId} {
      allow get, list: if true;
      allow create, update, delete: if isAdmin();
    }

    // 6. Site Settings (general, seo, adsense, featured): /siteSettings/{docId}
    match /siteSettings/{docId} {
      allow get, list: if true;
      allow create, update, delete: if isAdmin();
    }

    // 7. Love Counts & Public Engagement: /loveCounts/{itemId}
    match /loveCounts/{itemId} {
      allow get, list: if true;
      allow create: if request.resource.data.count == 1;
      allow update: if request.resource.data.count == resource.data.count + 1 || isAdmin();
      allow delete: if isAdmin();
    }
  }
}`;

const STORAGE_RULES_TEXT = `rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() && firestore.exists(/databases/(default)/documents/admins/$(request.auth.uid));
    }

    function isValidMedia() {
      return request.resource.size <= 25 * 1024 * 1024
        && (
          request.resource.contentType.matches('image/.*') ||
          request.resource.contentType.matches('video/.*') ||
          request.resource.contentType == 'application/zip' ||
          request.resource.contentType == 'application/x-zip-compressed' ||
          request.resource.contentType == 'application/octet-stream'
        );
    }

    // Organized Storage paths
    match /apkApps/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin() && isValidMedia();
      allow delete: if isAdmin();
    }

    match /photoPrompts/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin() && isValidMedia();
      allow delete: if isAdmin();
    }

    match /videoTemplates/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin() && isValidMedia();
      allow delete: if isAdmin();
    }

    match /siteAssets/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin() && isValidMedia();
      allow delete: if isAdmin();
    }

    match /media/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin() && isValidMedia();
      allow delete: if isAdmin();
    }

    match /{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin() && isValidMedia();
      allow delete: if isAdmin();
    }
  }
}`;

export const SecurityRulesModal: React.FC<SecurityRulesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'firestore' | 'storage'>('firestore');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentRules = activeTab === 'firestore' ? FIRESTORE_RULES_TEXT : STORAGE_RULES_TEXT;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentRules);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-2xl relative my-8 text-left max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-800 shrink-0">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Firebase Security Rules Reference</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Copy and deploy these rules to your Firebase Console under Firestore and Storage.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mt-4 shrink-0">
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('firestore')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'firestore' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode2 className="w-4 h-4" />
              firestore.rules
            </button>
            <button
              onClick={() => setActiveTab('storage')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'storage' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode2 className="w-4 h-4" />
              storage.rules
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Rules!' : 'Copy Code'}
          </button>
        </div>

        <div className="mt-3 flex-1 overflow-y-auto bg-[#070a12] rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-300 leading-relaxed">
          <pre>{currentRules}</pre>
        </div>

        <div className="mt-4 p-3 bg-indigo-950/40 border border-indigo-900/50 rounded-xl text-xs text-indigo-300 shrink-0 flex items-start gap-2">
          <Terminal className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">How to apply:</span> Open Firebase Console &gt; Build &gt; Firestore Database (or Storage) &gt; Rules tab. Paste this code and click <strong>Publish</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};
