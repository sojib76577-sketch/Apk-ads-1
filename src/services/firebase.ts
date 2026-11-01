import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  firestoreDatabaseId?: string;
}

export const DEFAULT_FIREBASE_CONFIG: FirebaseCustomConfig = {
  apiKey: "AIzaSyDUgVpz2j424Zm7Ig3KjWKPVG1N7lK4o00",
  authDomain: "promptxhub-4e329.firebaseapp.com",
  projectId: "promptxhub-4e329",
  storageBucket: "promptxhub-4e329.firebasestorage.app",
  messagingSenderId: "868593809230",
  appId: "1:868593809230:web:c46ff181c88faf5c55901f",
  measurementId: "G-F1XY2D0WTL",
};

const CONFIG_STORAGE_KEY = 'promptxhubl_firebase_config';

export function getSavedFirebaseConfig(): FirebaseCustomConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.projectId && parsed.apiKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading saved Firebase config:', e);
  }

  // Check Vite environment variables
  const envConfig: Partial<FirebaseCustomConfig> = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  };

  if (envConfig.projectId && envConfig.apiKey) {
    return envConfig as FirebaseCustomConfig;
  }

  // Default to the user's provided PromptXHub project configuration
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config: FirebaseCustomConfig): void {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}

export function clearFirebaseConfig(): void {
  localStorage.removeItem(CONFIG_STORAGE_KEY);
}

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

export function initializeFirebaseServices(customConfig?: FirebaseCustomConfig | null) {
  const config = customConfig || getSavedFirebaseConfig();

  if (!config || !config.apiKey || !config.projectId) {
    return {
      app: null,
      auth: null,
      db: null,
      storage: null,
      isConfigured: false,
    };
  }

  try {
    const apps = getApps();
    if (apps.length > 0) {
      appInstance = getApp();
    } else {
      appInstance = initializeApp(config);
    }

    authInstance = getAuth(appInstance);
    dbInstance = config.firestoreDatabaseId 
      ? getFirestore(appInstance, config.firestoreDatabaseId)
      : getFirestore(appInstance);
    storageInstance = getStorage(appInstance);

    return {
      app: appInstance,
      auth: authInstance,
      db: dbInstance,
      storage: storageInstance,
      isConfigured: true,
    };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return {
      app: null,
      auth: null,
      db: null,
      storage: null,
      isConfigured: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Initial initialization attempt
const initialServices = initializeFirebaseServices();
export const firebaseApp = initialServices.app;
export const firebaseAuth = initialServices.auth;
export const firestoreDb = initialServices.db;
export const firebaseStorage = initialServices.storage;

// Standard export aliases for Firebase SDK
export const auth = firebaseAuth;
export const db = firestoreDb;
export const storage = firebaseStorage;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(
  error: unknown, 
  operationType: OperationType, 
  path: string | null,
  shouldThrow = false
): string {
  const currentAuth = authInstance || firebaseAuth;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.currentUser?.uid || null,
      email: currentAuth?.currentUser?.email || null,
      emailVerified: currentAuth?.currentUser?.emailVerified || null,
      isAnonymous: currentAuth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  if (shouldThrow) {
    throw new Error(JSON.stringify(errInfo));
  }
  return errInfo.error;
}

export async function testFirestoreConnection(db: Firestore | null): Promise<boolean> {
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline. Please check your configuration.');
    }
    // Any response from server (even permission denied or document not found) indicates connectivity to Firestore endpoint
    return true;
  }
}
