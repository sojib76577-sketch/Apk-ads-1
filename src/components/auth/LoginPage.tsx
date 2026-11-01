import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { FirebaseConfigModal } from '../common/FirebaseConfigModal';
import { SecurityRulesModal } from '../common/SecurityRulesModal';
import { 
  Lock, 
  Mail, 
  ShieldAlert, 
  Database, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  FileCode2,
  ExternalLink,
  LogOut,
  UserCheck,
  ShieldCheck
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { 
    loginWithEmail, 
    logout,
    authError, 
    isPermissionError,
    clearError, 
    isConfigured, 
    enableDemoMode, 
    currentUser,
    retryVerification,
    initializeAdminDoc,
    continueWithBypass,
    firebaseConfig
  } = useAuth();

  const [email, setEmail] = useState('sojib76577@gmail.com');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [bootstrapFeedback, setBootstrapFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [firebaseModalOpen, setFirebaseModalOpen] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setBootstrapFeedback(null);
    clearError();
    try {
      await loginWithEmail(email, password);
    } catch {
      // Error is caught & handled in auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleRetryVerification = async () => {
    setIsRetrying(true);
    setBootstrapFeedback(null);
    try {
      await retryVerification();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleBootstrapAdminDoc = async () => {
    setIsBootstrapping(true);
    setBootstrapFeedback(null);
    try {
      const res = await initializeAdminDoc();
      if (res.success) {
        setBootstrapFeedback({
          success: true,
          message: 'Admin document successfully registered in Firestore!',
        });
      } else {
        setBootstrapFeedback({
          success: false,
          message: res.error || 'Failed to create document in /admins/{uid}.',
        });
      }
    } finally {
      setIsBootstrapping(false);
    }
  };

  const projectId = firebaseConfig?.projectId || 'promptxhub-4e329';
  const firebaseRulesUrl = `https://console.firebase.google.com/project/${projectId}/firestore/rules`;

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main container */}
      <div className="w-full max-w-lg relative z-10">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 shadow-xl shadow-indigo-600/30 text-white font-black text-2xl mb-4">
            PX
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            PromptXHubl Admin Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Authorized administrator management for APKs, photo prompts, and video templates
          </p>
        </div>

        {/* Configuration Notice if missing */}
        {!isConfigured && (
          <div className="mb-5 p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-xs text-amber-300 flex items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-2.5">
              <Database className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Firebase Not Configured</p>
                <p className="text-slate-300 mt-0.5">
                  Connect your existing PromptXHubl Firebase project, or launch in Sandbox mode.
                </p>
              </div>
            </div>
            <button
              onClick={() => setFirebaseModalOpen(true)}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 rounded-lg text-[11px] font-semibold shrink-0 cursor-pointer"
            >
              Configure
            </button>
          </div>
        )}

        {/* Actionable Permission/Authorization Alert */}
        {(authError || currentUser) && (
          <div className="mb-5 p-4 bg-[#111625] border border-indigo-500/30 rounded-2xl text-xs text-slate-200 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                {isPermissionError ? (
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-white text-sm">
                    {isPermissionError
                      ? 'Firestore Security Rules Configuration Required'
                      : 'Admin Authorization Notice'}
                  </p>
                  {currentUser && (
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="text-slate-400 hover:text-rose-400 flex items-center gap-1 text-[11px] font-medium cursor-pointer transition-colors"
                      title="Sign Out"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>

                <p className="mt-1.5 leading-relaxed text-slate-300">
                  {authError || 'Authenticated user is awaiting Firestore admin verification.'}
                </p>

                {/* Authenticated UID Display */}
                {currentUser && (
                  <div className="mt-3 p-3 bg-[#070a12]/90 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Authenticated Account:</span>
                      <span className="text-slate-200 font-medium font-mono">{currentUser.email || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 bg-slate-900/90 p-1.5 px-2 rounded-lg font-mono text-[10px] text-indigo-300">
                      <span className="truncate">UID: {currentUser.uid}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyUid(currentUser.uid)}
                        className="text-slate-400 hover:text-white p-1 rounded cursor-pointer shrink-0"
                        title="Copy UID"
                      >
                        {copiedUid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Step-by-step guidance */}
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                      <p className="text-slate-300 font-medium">To activate full Firestore syncing:</p>
                      <p>
                        1. Deploy the provided rules in <a href={firebaseRulesUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-0.5">Firebase Console Rules <ExternalLink className="w-2.5 h-2.5" /></a>
                      </p>
                      <p>
                        2. Click <strong>Auto-Create /admins Document</strong> or create document <code className="text-indigo-300 font-mono">/admins/{currentUser.uid}</code>.
                      </p>
                    </div>

                    {/* Bootstrap feedback message */}
                    {bootstrapFeedback && (
                      <div className={`p-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 ${
                        bootstrapFeedback.success 
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                      }`}>
                        {bootstrapFeedback.success ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                        <span>{bootstrapFeedback.message}</span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRulesModalOpen(true)}
                        className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <FileCode2 className="w-3.5 h-3.5" />
                        <span>View firestore.rules</span>
                      </button>

                      <button
                        type="button"
                        disabled={isBootstrapping}
                        onClick={handleBootstrapAdminDoc}
                        className="px-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        {isBootstrapping ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        <span>Auto-Create Admin Doc</span>
                      </button>

                      <button
                        type="button"
                        disabled={isRetrying}
                        onClick={handleRetryVerification}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                        <span>Re-Verify</span>
                      </button>

                      <button
                        type="button"
                        onClick={continueWithBypass}
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-[11px] font-bold shadow-md shadow-emerald-900/30 flex items-center gap-1.5 cursor-pointer ml-auto transition-all"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Continue into Dashboard</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Login Form Box */}
        <div className="bg-[#0f172a]/90 border border-slate-800/90 rounded-3xl p-6 lg:p-7 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sojib76577@gmail.com"
                  className="w-full bg-[#070a12] border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#070a12] border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sandbox mode button for quick review */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-400 mb-2.5">
              Testing before connecting live Firebase?
            </p>
            <button
              type="button"
              onClick={() => enableDemoMode(true)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Launch Sandbox Mode (Full Feature Preview)</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-[11px] text-slate-400 flex items-center justify-center gap-4">
          <button
            onClick={() => setFirebaseModalOpen(true)}
            className="hover:text-slate-300 underline flex items-center gap-1 cursor-pointer"
          >
            <Database className="w-3 h-3" />
            Firebase Settings
          </button>
          <span>·</span>
          <button
            onClick={() => setRulesModalOpen(true)}
            className="hover:text-slate-300 underline flex items-center gap-1 cursor-pointer"
          >
            <FileCode2 className="w-3 h-3" />
            Security Rules
          </button>
          <span>·</span>
          <span>Contact: sojib76577@gmail.com</span>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
      />

      <FirebaseConfigModal
        isOpen={firebaseModalOpen}
        onClose={() => setFirebaseModalOpen(false)}
      />

      <SecurityRulesModal
        isOpen={rulesModalOpen}
        onClose={() => setRulesModalOpen(false)}
      />
    </div>
  );
};
