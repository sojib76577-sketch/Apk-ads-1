import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  firebaseAuth, 
  firestoreDb, 
  getSavedFirebaseConfig, 
  saveFirebaseConfig, 
  clearFirebaseConfig,
  FirebaseCustomConfig,
  initializeFirebaseServices
} from '../services/firebase';
import { AdminUser } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  adminProfile: AdminUser | null;
  loading: boolean;
  isAuthorized: boolean;
  authError: string | null;
  isPermissionError: boolean;
  isBypassMode: boolean;
  isConfigured: boolean;
  isDemoMode: boolean;
  firebaseConfig: FirebaseCustomConfig | null;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateFirebaseConfig: (config: FirebaseCustomConfig) => void;
  resetFirebaseConfig: () => void;
  enableDemoMode: (enable: boolean) => void;
  retryVerification: () => Promise<void>;
  initializeAdminDoc: () => Promise<{ success: boolean; error?: string }>;
  continueWithBypass: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseCustomConfig | null>(() => getSavedFirebaseConfig());
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isPermissionError, setIsPermissionError] = useState<boolean>(false);
  const [isBypassMode, setIsBypassMode] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Is Firebase config present?
  const isConfigured = Boolean(firebaseConfig?.projectId && firebaseConfig?.apiKey);

  const checkAdminPrivileges = async (user: FirebaseUser) => {
    if (!firestoreDb) {
      setAuthError('Firestore database is not connected. Please verify your Firebase configuration.');
      setIsAuthorized(false);
      setIsPermissionError(false);
      return;
    }

    const isMasterAdminEmail = Boolean(
      user.email && ['sojib76577@gmail.com', 'lamiaalter@gmail.com'].includes(user.email.toLowerCase())
    );

    try {
      // Per specification Section 2 & 15:
      // Verify admin permissions using /admins/{uid}
      const adminDocRef = doc(firestoreDb, 'admins', user.uid);
      const docSnap = await getDoc(adminDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setAdminProfile({
          uid: user.uid,
          email: user.email || '',
          displayName: data.displayName || user.displayName || 'Administrator',
          role: data.role || 'superadmin',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
        });
        setIsAuthorized(true);
        setIsPermissionError(false);
        setAuthError(null);
      } else if (isMasterAdminEmail) {
        // Designated master admin automatically registered
        const newProfile: AdminUser = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || (user.email === 'lamiaalter@gmail.com' ? 'Lamia (Admin)' : 'PromptXHubl Master Admin'),
          role: 'superadmin',
          createdAt: new Date().toISOString(),
        };
        setAdminProfile(newProfile);
        setIsAuthorized(true);
        setIsPermissionError(false);
        setAuthError(null);

        // Persist admin document to Firestore
        setDoc(adminDocRef, {
          ...newProfile,
          updatedAt: new Date().toISOString(),
        }, { merge: true }).catch(err => {
          console.warn('Auto-registering admin doc in Firestore deferred:', err);
        });
      } else {
        // Not in authorized list
        setIsAuthorized(false);
        setAdminProfile(null);
        setIsPermissionError(false);
        setAuthError(
          `Unauthorized Access: UID "${user.uid}" is not found in the /admins/{uid} collection. Only authorized admin UIDs can access this dashboard.`
        );
      }
    } catch (err: unknown) {
      console.warn('Admin authorization verification notice:', err);

      if (isMasterAdminEmail) {
        // Master admin email authenticated via Firebase Auth -> allow direct access
        setAdminProfile({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Administrator',
          role: 'superadmin',
          createdAt: new Date().toISOString(),
        });
        setIsAuthorized(true);
        setIsPermissionError(false);
        setAuthError(null);

        // Attempt writing the doc
        try {
          const adminDocRef = doc(firestoreDb, 'admins', user.uid);
          setDoc(adminDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Administrator',
            role: 'superadmin',
            createdAt: new Date().toISOString(),
          }, { merge: true }).catch(() => {});
        } catch {
          // ignore
        }
        return;
      }

      setIsAuthorized(false);
      setAdminProfile(null);

      const rawMsg = err instanceof Error ? err.message : String(err);
      const isPerm = rawMsg.toLowerCase().includes('permission') || 
                     rawMsg.toLowerCase().includes('missing or insufficient') ||
                     (err as { code?: string })?.code === 'permission-denied';

      if (isPerm) {
        setIsPermissionError(true);
        setAuthError(
          `Firestore Permission Denied: Your Firebase project ("${firebaseConfig?.projectId || 'promptxhub-4e329'}") is currently rejecting read access to "/admins/${user.uid}". Please publish the required firestore.rules in your Firebase Console.`
        );
      } else {
        setIsPermissionError(false);
        setAuthError(rawMsg || 'Error validating administrative authorization from Firestore.');
      }
    }
  };

  const retryVerification = async () => {
    if (!currentUser) return;
    setLoading(true);
    await checkAdminPrivileges(currentUser);
    setLoading(false);
  };

  const initializeAdminDoc = async (): Promise<{ success: boolean; error?: string }> => {
    if (!firestoreDb || !currentUser) {
      return { success: false, error: 'User is not authenticated or Firestore is not ready.' };
    }

    try {
      const adminDocRef = doc(firestoreDb, 'admins', currentUser.uid);
      await setDoc(adminDocRef, {
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || 'Administrator',
        role: 'superadmin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Re-verify after successful creation
      await checkAdminPrivileges(currentUser);
      return { success: true };
    } catch (err: unknown) {
      console.error('Failed to initialize admin doc:', err);
      const rawMsg = err instanceof Error ? err.message : String(err);
      const isPerm = rawMsg.toLowerCase().includes('permission') || 
                     rawMsg.toLowerCase().includes('insufficient');
      return { 
        success: false, 
        error: isPerm
          ? 'Firestore Security Rules in Firebase Console are currently blocking creates on /admins/{uid}. Please update firestore.rules in Firebase Console first.' 
          : rawMsg 
      };
    }
  };

  const continueWithBypass = () => {
    if (!currentUser) return;
    setAdminProfile({
      uid: currentUser.uid,
      email: currentUser.email || 'sojib76577@gmail.com',
      displayName: currentUser.displayName || 'Authorized Administrator',
      role: 'superadmin',
      createdAt: new Date().toISOString(),
    });
    setIsAuthorized(true);
    setIsBypassMode(true);
    setAuthError(null);
  };

  useEffect(() => {
    if (isDemoMode) {
      setAdminProfile({
        uid: 'demo-admin-uid-1001',
        email: 'sojib76577@gmail.com',
        displayName: 'PromptXHubl Master Admin',
        role: 'superadmin',
        createdAt: new Date().toISOString(),
      });
      setIsAuthorized(true);
      setLoading(false);
      return;
    }

    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      setLoading(true);
      setCurrentUser(user);
      if (user) {
        await checkAdminPrivileges(user);
      } else {
        setAdminProfile(null);
        setIsAuthorized(false);
        setIsBypassMode(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseConfig, isDemoMode]);

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    setAuthError(null);

    if (isDemoMode) {
      setTimeout(() => {
        setIsAuthorized(true);
        setLoading(false);
      }, 500);
      return;
    }

    if (!firebaseAuth) {
      setLoading(false);
      throw new Error('Firebase Authentication is not configured yet. Please configure Firebase settings.');
    }

    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, pass);
      await checkAdminPrivileges(cred.user);
    } catch (err: unknown) {
      console.error('Login error:', err);
      const msg = err instanceof Error ? err.message : 'Login failed. Please check credentials.';
      setAuthError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    if (isDemoMode) {
      setIsDemoMode(false);
      setIsAuthorized(false);
      setAdminProfile(null);
      setLoading(false);
      return;
    }

    if (firebaseAuth) {
      try {
        await signOut(firebaseAuth);
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    setCurrentUser(null);
    setAdminProfile(null);
    setIsAuthorized(false);
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    if (!firebaseAuth) {
      throw new Error('Firebase Authentication is not configured.');
    }
    await sendPasswordResetEmail(firebaseAuth, email);
  };

  const updateFirebaseConfig = (newConfig: FirebaseCustomConfig) => {
    saveFirebaseConfig(newConfig);
    setFirebaseConfig(newConfig);
    initializeFirebaseServices(newConfig);
    // Reload state
    window.location.reload();
  };

  const resetFirebaseConfig = () => {
    clearFirebaseConfig();
    setFirebaseConfig(null);
    window.location.reload();
  };

  const enableDemoMode = (enable: boolean) => {
    setIsDemoMode(enable);
    if (!enable) {
      setIsAuthorized(false);
      setAdminProfile(null);
    }
  };

  const clearError = () => setAuthError(null);

  const value = useMemo(
    () => ({
      currentUser,
      adminProfile,
      loading,
      isAuthorized,
      authError,
      isPermissionError,
      isBypassMode,
      isConfigured,
      isDemoMode,
      firebaseConfig,
      loginWithEmail,
      logout,
      resetPassword,
      updateFirebaseConfig,
      resetFirebaseConfig,
      enableDemoMode,
      retryVerification,
      initializeAdminDoc,
      continueWithBypass,
      clearError,
    }),
    [
      currentUser,
      adminProfile,
      loading,
      isAuthorized,
      authError,
      isPermissionError,
      isBypassMode,
      isConfigured,
      isDemoMode,
      firebaseConfig,
      retryVerification,
      initializeAdminDoc,
      continueWithBypass,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
