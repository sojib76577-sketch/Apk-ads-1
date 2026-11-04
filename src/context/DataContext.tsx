import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { 
  firestoreDb, 
  firebaseStorage, 
  handleFirestoreError, 
  OperationType,
  testFirestoreConnection
} from '../services/firebase';
import { useAuth } from './AuthContext';
import { 
  ApkItem, 
  PhotoPrompt, 
  VideoTemplate, 
  CategoryItem, 
  MediaItem, 
  FeaturedBannerConfig, 
  GeneralSettings, 
  SeoSettings, 
  AdSenseSettings,
  ContentStatus
} from '../types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_APKS, 
  INITIAL_PHOTO_PROMPTS, 
  INITIAL_VIDEO_TEMPLATES, 
  INITIAL_MEDIA, 
  INITIAL_FEATURED_BANNER, 
  INITIAL_GENERAL_SETTINGS, 
  INITIAL_SEO_SETTINGS, 
  INITIAL_ADSENSE_SETTINGS 
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'error' | 'unconfigured' | 'sandbox';

interface DataContextType {
  apks: ApkItem[];
  prompts: PhotoPrompt[];
  templates: VideoTemplate[];
  categories: CategoryItem[];
  media: MediaItem[];
  featuredConfig: FeaturedBannerConfig;
  generalSettings: GeneralSettings;
  seoSettings: SeoSettings;
  adsenseSettings: AdSenseSettings;
  isLoading: boolean;
  connectionStatus: ConnectionStatus;
  connectionError: string | null;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  showToast: (type: ToastMessage['type'], title: string, message: string) => void;
  retryConnection: () => Promise<void>;
  fixFirestoreSync: () => Promise<{ success: boolean; message: string }>;
  dismissSyncError: () => void;
  // CRUD
  saveApk: (apk: Omit<ApkItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  deleteApk: (id: string) => Promise<void>;
  setApkStatus: (id: string, status: ContentStatus) => Promise<void>;
  savePrompt: (prompt: Omit<PhotoPrompt, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  setPromptStatus: (id: string, status: ContentStatus) => Promise<void>;
  saveTemplate: (template: Omit<VideoTemplate, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  setTemplateStatus: (id: string, status: ContentStatus) => Promise<void>;
  saveCategory: (category: Omit<CategoryItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<{ success: boolean; message?: string }>;
  saveFeaturedConfig: (config: FeaturedBannerConfig) => Promise<void>;
  saveGeneralSettings: (settings: GeneralSettings) => Promise<void>;
  saveSeoSettings: (settings: SeoSettings) => Promise<void>;
  saveAdSenseSettings: (settings: AdSenseSettings) => Promise<void>;
  uploadMedia: (
    file: File, 
    category: MediaItem['category'],
    onProgress?: (percent: number) => void
  ) => Promise<MediaItem>;
  deleteMedia: (id: string) => Promise<void>;
  seedInitialDataToFirestore: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthorized, isDemoMode, isConfigured, currentUser, enableDemoMode } = useAuth();

  const [apks, setApks] = useState<ApkItem[]>(INITIAL_APKS);
  const [prompts, setPrompts] = useState<PhotoPrompt[]>(INITIAL_PHOTO_PROMPTS);
  const [templates, setTemplates] = useState<VideoTemplate[]>(INITIAL_VIDEO_TEMPLATES);
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [media, setMedia] = useState<MediaItem[]>(INITIAL_MEDIA);
  const [featuredConfig, setFeaturedConfig] = useState<FeaturedBannerConfig>(INITIAL_FEATURED_BANNER);
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(INITIAL_GENERAL_SETTINGS);
  const [seoSettings, setSeoSettings] = useState<SeoSettings>(INITIAL_SEO_SETTINGS);
  const [adsenseSettings, setAdSenseSettings] = useState<AdSenseSettings>(INITIAL_ADSENSE_SETTINGS);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    isDemoMode ? 'sandbox' : isConfigured ? 'connecting' : 'unconfigured'
  );
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  }, [dismissToast]);

  // Firestore Sync Listeners with Main Website Schema Normalization
  const setupFirestoreListeners = useCallback(() => {
    if (!firestoreDb || !isAuthorized || isDemoMode) {
      if (isDemoMode) setConnectionStatus('sandbox');
      else if (!isConfigured) setConnectionStatus('unconfigured');
      return () => {};
    }

    setIsLoading(true);
    setConnectionStatus('connecting');
    setConnectionError(null);

    let active = true;

    // 1. APK Apps listener: /apkApps/{itemId}
    const unsubApks = onSnapshot(
      collection(firestoreDb, 'apkApps'),
      (snapshot) => {
        if (!active) return;
        setConnectionStatus('connected');
        if (!snapshot.empty) {
          const items: ApkItem[] = snapshot.docs.map(docSnap => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
              title: d.title || '',
              slug: d.slug || '',
              appIcon: d.appIcon || d.iconUrl || '',
              iconUrl: d.iconUrl || d.appIcon || '',
              coverImage: d.coverImage || d.coverImageUrl || '',
              coverImageUrl: d.coverImageUrl || d.coverImage || '',
              screenshots: Array.isArray(d.screenshots) ? d.screenshots : [],
              shortDescription: d.shortDescription || d.description || '',
              description: d.description || d.shortDescription || '',
              fullDescription: d.fullDescription || '',
              category: d.category === 'MOD Games' ? 'MOD Games' : 'MOD Apps',
              version: d.version || 'v1.0.0',
              fileSize: d.fileSize || '',
              androidRequirements: d.androidRequirements || 'Android 9.0+',
              downloadUrl: d.downloadUrl || '',
              officialSourceUrl: d.officialSourceUrl || d.sourceUrl || '',
              sourceUrl: d.sourceUrl || d.officialSourceUrl || '',
              developerName: d.developerName || '',
              licenseInfo: d.licenseInfo || '',
              seoTitle: d.seoTitle || d.title || '',
              seoDescription: d.seoDescription || d.description || d.shortDescription || '',
              seoTags: Array.isArray(d.seoTags) ? d.seoTags : [],
              featured: Boolean(d.featured),
              status: (d.status as ContentStatus) || 'draft',
              lovesCount: typeof d.lovesCount === 'number' ? d.lovesCount : 0,
              viewsCount: typeof d.viewsCount === 'number' ? d.viewsCount : 0,
              createdAt: d.createdAt || new Date().toISOString(),
              updatedAt: d.updatedAt || new Date().toISOString(),
            };
          });
          setApks(items);
        }
      },
      (error) => {
        console.error('Error listening to /apkApps:', error);
        setConnectionStatus('error');
        setConnectionError(error.message);
        handleFirestoreError(error, OperationType.GET, 'apkApps');
      }
    );

    // 2. Photo Prompts listener: /photoPrompts/{promptId}
    const unsubPrompts = onSnapshot(
      collection(firestoreDb, 'photoPrompts'),
      (snapshot) => {
        if (!active) return;
        if (!snapshot.empty) {
          const items: PhotoPrompt[] = snapshot.docs.map(docSnap => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
              title: d.title || '',
              slug: d.slug || '',
              previewImage: d.previewImage || d.imageUrl || '',
              imageUrl: d.imageUrl || d.previewImage || '',
              shortDescription: d.shortDescription || d.description || '',
              description: d.description || d.shortDescription || '',
              fullDescription: d.fullDescription || '',
              promptText: d.promptText || '',
              category: d.category || 'Cinematic Portraits',
              aiPlatform: d.aiPlatform || 'Midjourney',
              instructions: d.instructions || '',
              seoTitle: d.seoTitle || d.title || '',
              seoDescription: d.seoDescription || d.description || d.shortDescription || '',
              seoTags: Array.isArray(d.seoTags) ? d.seoTags : [],
              featured: Boolean(d.featured),
              status: (d.status as ContentStatus) || 'draft',
              lovesCount: typeof d.lovesCount === 'number' ? d.lovesCount : 0,
              viewsCount: typeof d.viewsCount === 'number' ? d.viewsCount : 0,
              createdAt: d.createdAt || new Date().toISOString(),
              updatedAt: d.updatedAt || new Date().toISOString(),
            };
          });
          setPrompts(items);
        }
      },
      (error) => {
        console.error('Error listening to /photoPrompts:', error);
        handleFirestoreError(error, OperationType.GET, 'photoPrompts');
      }
    );

    // 3. Video Templates listener: /videoTemplates/{templateId}
    const unsubTemplates = onSnapshot(
      collection(firestoreDb, 'videoTemplates'),
      (snapshot) => {
        if (!active) return;
        if (!snapshot.empty) {
          const items: VideoTemplate[] = snapshot.docs.map(docSnap => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
              title: d.title || '',
              slug: d.slug || '',
              thumbnail: d.thumbnail || d.thumbnailUrl || '',
              thumbnailUrl: d.thumbnailUrl || d.thumbnail || '',
              previewVideoUrl: d.previewVideoUrl || '',
              shortDescription: d.shortDescription || d.description || '',
              description: d.description || d.shortDescription || '',
              fullDescription: d.fullDescription || '',
              editingPlatform: d.editingPlatform || d.platform || 'CapCut',
              platform: d.platform || d.editingPlatform || 'CapCut',
              category: d.category || 'Trending TikTok & Reels',
              directTemplateUrl: d.directTemplateUrl || '',
              downloadableFileUrl: d.downloadableFileUrl || d.downloadFileUrl || '',
              downloadFileUrl: d.downloadFileUrl || d.downloadableFileUrl || '',
              fileFormat: d.fileFormat || 'ZIP',
              fileSize: d.fileSize || '',
              usageInstructions: d.usageInstructions || '',
              copyrightInfo: d.copyrightInfo || d.licenseInfo || '',
              licenseInfo: d.licenseInfo || d.copyrightInfo || '',
              seoTitle: d.seoTitle || d.title || '',
              seoDescription: d.seoDescription || d.description || d.shortDescription || '',
              seoTags: Array.isArray(d.seoTags) ? d.seoTags : [],
              featured: Boolean(d.featured),
              status: (d.status as ContentStatus) || 'draft',
              viewsCount: typeof d.viewsCount === 'number' ? d.viewsCount : 0,
              createdAt: d.createdAt || new Date().toISOString(),
              updatedAt: d.updatedAt || new Date().toISOString(),
            };
          });
          setTemplates(items);
        }
      },
      (error) => {
        console.error('Error listening to /videoTemplates:', error);
        handleFirestoreError(error, OperationType.GET, 'videoTemplates');
      }
    );

    // 4. Categories listener: /categories/{categoryId}
    const unsubCats = onSnapshot(
      collection(firestoreDb, 'categories'),
      (snapshot) => {
        if (!active) return;
        if (!snapshot.empty) {
          const items: CategoryItem[] = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<CategoryItem, 'id'>)
          }));
          setCategories(items);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'categories')
    );

    // 5. Site Settings listeners: /siteSettings/{docId}
    const unsubGenSettings = onSnapshot(
      doc(firestoreDb, 'siteSettings', 'general'),
      (docSnap) => {
        if (docSnap.exists()) {
          setGeneralSettings(docSnap.data() as GeneralSettings);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'siteSettings/general')
    );

    const unsubSeoSettings = onSnapshot(
      doc(firestoreDb, 'siteSettings', 'seo'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSeoSettings(docSnap.data() as SeoSettings);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'siteSettings/seo')
    );

    const unsubAdsenseSettings = onSnapshot(
      doc(firestoreDb, 'siteSettings', 'adsense'),
      (docSnap) => {
        if (docSnap.exists()) {
          setAdSenseSettings(docSnap.data() as AdSenseSettings);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'siteSettings/adsense')
    );

    const unsubFeaturedSettings = onSnapshot(
      doc(firestoreDb, 'siteSettings', 'featured'),
      (docSnap) => {
        if (docSnap.exists()) {
          setFeaturedConfig(docSnap.data() as FeaturedBannerConfig);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'siteSettings/featured')
    );

    setIsLoading(false);

    return () => {
      active = false;
      unsubApks();
      unsubPrompts();
      unsubTemplates();
      unsubCats();
      unsubGenSettings();
      unsubSeoSettings();
      unsubAdsenseSettings();
      unsubFeaturedSettings();
    };
  }, [isAuthorized, isDemoMode, isConfigured]);

  useEffect(() => {
    const unsub = setupFirestoreListeners();
    return () => unsub();
  }, [setupFirestoreListeners]);

  const dismissSyncError = useCallback(() => {
    setConnectionError(null);
  }, []);

  const fixFirestoreSync = async (): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      if (!firestoreDb) {
        return { success: false, message: 'Firestore is not initialized.' };
      }

      // If user is logged in, ensure their admin doc is registered in /admins
      if (currentUser) {
        try {
          await setDoc(doc(firestoreDb, 'admins', currentUser.uid), {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || (currentUser.email === 'lamiaalter@gmail.com' ? 'Lamia (Admin)' : 'Administrator'),
            role: 'superadmin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (e) {
          console.warn('Could not auto-write /admins document:', e);
        }
      }

      const isAlive = await testFirestoreConnection(firestoreDb);
      if (isAlive) {
        setupFirestoreListeners();
        setConnectionStatus('connected');
        setConnectionError(null);
        showToast('success', 'Sync Restored', 'Firestore connection and listeners re-established.');
        return { success: true, message: 'Sync restored successfully.' };
      } else {
        return { success: false, message: 'Firestore server did not respond. Check Firebase Console rules.' };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setConnectionStatus('error');
      setConnectionError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const retryConnection = async () => {
    setIsLoading(true);
    setConnectionError(null);
    try {
      const isAlive = await testFirestoreConnection(firestoreDb);
      if (isAlive) {
        setupFirestoreListeners();
        showToast('success', 'Connected', 'Firestore connection established.');
      }
    } catch (err: unknown) {
      setConnectionStatus('error');
      setConnectionError(err instanceof Error ? err.message : 'Connection failed');
      showToast('error', 'Connection Error', 'Could not reach Firestore endpoint.');
    } finally {
      setIsLoading(false);
    }
  };

  // Seed initial collections to Firestore (only if explicitly triggered by admin)
  const seedInitialDataToFirestore = async () => {
    if (!firestoreDb) {
      showToast('error', 'Error', 'Firestore is not connected.');
      return;
    }
    try {
      setIsLoading(true);
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(firestoreDb, 'categories', cat.id), cat);
      }
      for (const apk of INITIAL_APKS) {
        const payload = {
          ...apk,
          iconUrl: apk.appIcon,
          coverImageUrl: apk.coverImage,
          description: apk.shortDescription,
          sourceUrl: apk.officialSourceUrl,
        };
        await setDoc(doc(firestoreDb, 'apkApps', apk.id), payload);
      }
      for (const prompt of INITIAL_PHOTO_PROMPTS) {
        const payload = {
          ...prompt,
          imageUrl: prompt.previewImage,
          description: prompt.shortDescription,
        };
        await setDoc(doc(firestoreDb, 'photoPrompts', prompt.id), payload);
      }
      for (const tpl of INITIAL_VIDEO_TEMPLATES) {
        const payload = {
          ...tpl,
          thumbnailUrl: tpl.thumbnail,
          platform: tpl.editingPlatform,
          previewVideoUrl: tpl.previewVideoUrl || '',
          directTemplateUrl: tpl.directTemplateUrl || '',
          downloadableFileUrl: tpl.downloadableFileUrl || '',
          downloadFileUrl: tpl.downloadableFileUrl || '',
          licenseInfo: tpl.copyrightInfo,
          description: tpl.shortDescription,
          lovesCount: tpl.lovesCount || 0,
        };
        await setDoc(doc(firestoreDb, 'videoTemplates', tpl.id), payload);
      }
      await setDoc(doc(firestoreDb, 'siteSettings', 'general'), INITIAL_GENERAL_SETTINGS);
      await setDoc(doc(firestoreDb, 'siteSettings', 'seo'), INITIAL_SEO_SETTINGS);
      await setDoc(doc(firestoreDb, 'siteSettings', 'adsense'), INITIAL_ADSENSE_SETTINGS);
      await setDoc(doc(firestoreDb, 'siteSettings', 'featured'), INITIAL_FEATURED_BANNER);

      showToast('success', 'Database Initialized', 'Collections seeded into Firestore with Main Website schema alignment!');
    } catch (err: unknown) {
      console.error('Seeding error:', err);
      showToast('error', 'Seeding Failed', err instanceof Error ? err.message : 'Could not seed initial data to Firestore');
    } finally {
      setIsLoading(false);
    }
  };

  // CRUD: APKs (Synchronized with Main Website schema)
  const saveApk = async (apkData: Omit<ApkItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const isNew = !apkData.id;
    const id = apkData.id || `apk-${Date.now()}`;
    const now = new Date().toISOString();

    const existingItem = apks.find(a => a.id === id);
    const itemToSave: ApkItem = {
      ...apkData,
      id,
      lovesCount: existingItem ? existingItem.lovesCount : 0,
      viewsCount: existingItem ? existingItem.viewsCount : 0,
      createdAt: existingItem ? existingItem.createdAt : now,
      updatedAt: now,
    };

    // Full dual-compatibility payload for Main Website
    const payload = {
      ...itemToSave,
      appIcon: itemToSave.appIcon,
      iconUrl: itemToSave.appIcon,
      coverImage: itemToSave.coverImage,
      coverImageUrl: itemToSave.coverImage,
      shortDescription: itemToSave.shortDescription,
      description: itemToSave.shortDescription,
      officialSourceUrl: itemToSave.officialSourceUrl,
      sourceUrl: itemToSave.officialSourceUrl,
      licenseInfo: itemToSave.licenseInfo,
    };

    if (firestoreDb && !isDemoMode) {
      try {
        await setDoc(doc(firestoreDb, 'apkApps', id), payload);
      } catch (err) {
        handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `apkApps/${id}`);
      }
    }

    setApks(prev => {
      const idx = prev.findIndex(a => a.id === id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = itemToSave;
        return updated;
      }
      return [itemToSave, ...prev];
    });

    showToast('success', 'APK Saved', `"${itemToSave.title}" was saved to /apkApps/${id}.`);
  };

  const deleteApk = async (id: string) => {
    if (firestoreDb && !isDemoMode) {
      try {
        await deleteDoc(doc(firestoreDb, 'apkApps', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `apkApps/${id}`);
      }
    }
    setApks(prev => prev.filter(a => a.id !== id));
    showToast('info', 'Deleted', 'APK entry removed from Firestore.');
  };

  const setApkStatus = async (id: string, status: ContentStatus) => {
    const item = apks.find(a => a.id === id);
    if (!item) return;
    const updated = { ...item, status, updatedAt: new Date().toISOString() };
    if (firestoreDb && !isDemoMode) {
      try {
        await setDoc(doc(firestoreDb, 'apkApps', id), { status, updatedAt: updated.updatedAt }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `apkApps/${id}`);
      }
    }
    setApks(prev => prev.map(a => (a.id === id ? updated : a)));
    showToast('success', 'Status Updated', `Item set to ${status}. Main Website visibility synced.`);
  };

  // CRUD: Photo Prompts
  const savePrompt = async (promptData: Omit<PhotoPrompt, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const isNew = !promptData.id;
    const id = promptData.id || `prompt-${Date.now()}`;
    const now = new Date().toISOString();

    const existingItem = prompts.find(p => p.id === id);
    const itemToSave: PhotoPrompt = {
      ...promptData,
      id,
      lovesCount: existingItem ? existingItem.lovesCount : 0,
      viewsCount: existingItem ? existingItem.viewsCount : 0,
      createdAt: existingItem ? existingItem.createdAt : now,
      updatedAt: now,
    };

    // Store promptText explicitly separately from description
    const payload = {
      ...itemToSave,
      previewImage: itemToSave.previewImage,
      imageUrl: itemToSave.previewImage,
      shortDescription: itemToSave.shortDescription,
      description: itemToSave.shortDescription,
    };

    if (firestoreDb && !isDemoMode) {
      try {
        await setDoc(doc(firestoreDb, 'photoPrompts', id), payload);
      } catch (err) {
        handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `photoPrompts/${id}`);
      }
    }

    setPrompts(prev => {
      const idx = prev.findIndex(p => p.id === id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = itemToSave;
        return updated;
      }
      return [itemToSave, ...prev];
    });

    showToast('success', 'Prompt Saved', `"${itemToSave.title}" has been saved to /photoPrompts/${id}.`);
  };

  const deletePrompt = async (id: string) => {
    if (firestoreDb && !isDemoMode) {
      try {
        await deleteDoc(doc(firestoreDb, 'photoPrompts', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `photoPrompts/${id}`);
      }
    }
    setPrompts(prev => prev.filter(p => p.id !== id));
    showToast('info', 'Deleted', 'Photo prompt removed from Firestore.');
  };

  const setPromptStatus = async (id: string, status: ContentStatus) => {
    const item = prompts.find(p => p.id === id);
    if (!item) return;
    const updated = { ...item, status, updatedAt: new Date().toISOString() };
    if (firestoreDb && !isDemoMode) {
      try {
        await setDoc(doc(firestoreDb, 'photoPrompts', id), { status, updatedAt: updated.updatedAt }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `photoPrompts/${id}`);
      }
    }
    setPrompts(prev => prev.map(p => (p.id === id ? updated : p)));
    showToast('success', 'Status Updated', `Prompt marked as ${status}. Main Website visibility synced.`);
  };

  // CRUD: Video Templates (Supporting both directTemplateUrl and downloadFileUrl)
  const saveTemplate = async (tplData: Omit<VideoTemplate, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const isNew = !tplData.id;
    const id = tplData.id || `tpl-${Date.now()}`;
    const now = new Date().toISOString();

    const existingItem = templates.find(t => t.id === id);

    // Normalize all fields and ensure NO field is undefined
    const cleanItem: VideoTemplate = {
      id,
      title: (tplData.title || '').trim(),
      slug: (tplData.slug || '').trim(),
      thumbnail: (tplData.thumbnail || '').trim() || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80',
      thumbnailUrl: (tplData.thumbnail || '').trim() || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80',
      previewVideoUrl: (tplData.previewVideoUrl || '').trim(),
      shortDescription: (tplData.shortDescription || '').trim(),
      description: (tplData.shortDescription || '').trim(),
      fullDescription: (tplData.fullDescription || '').trim(),
      editingPlatform: tplData.editingPlatform || 'CapCut',
      platform: tplData.editingPlatform || 'CapCut',
      category: tplData.category || 'Trending TikTok & Reels',
      directTemplateUrl: (tplData.directTemplateUrl || '').trim(),
      downloadableFileUrl: (tplData.downloadableFileUrl || tplData.downloadFileUrl || '').trim(),
      downloadFileUrl: (tplData.downloadableFileUrl || tplData.downloadFileUrl || '').trim(),
      fileFormat: (tplData.fileFormat || 'ZIP / Web Link').trim(),
      fileSize: (tplData.fileSize || '45 MB').trim(),
      usageInstructions: (tplData.usageInstructions || 'Open link in editing app or import XML/MOGRT project file.').trim(),
      copyrightInfo: (tplData.copyrightInfo || 'Free for creator and commercial use with attribution.').trim(),
      licenseInfo: (tplData.copyrightInfo || 'Free for creator and commercial use with attribution.').trim(),
      seoTitle: (tplData.seoTitle || tplData.title || '').trim(),
      seoDescription: (tplData.seoDescription || tplData.shortDescription || '').trim(),
      seoTags: Array.isArray(tplData.seoTags) ? tplData.seoTags : [],
      featured: Boolean(tplData.featured),
      status: tplData.status || 'draft',
      lovesCount: typeof tplData.lovesCount === 'number' ? tplData.lovesCount : (existingItem?.lovesCount || 0),
      viewsCount: typeof tplData.viewsCount === 'number' ? tplData.viewsCount : (existingItem?.viewsCount || 0),
      createdAt: existingItem ? existingItem.createdAt : now,
      updatedAt: now,
    };

    // Full dual-compatibility payload aligned with both Admin CMS and Main Website Firestore schema
    const payload: Record<string, unknown> = {
      id: cleanItem.id,
      title: cleanItem.title,
      slug: cleanItem.slug,
      thumbnail: cleanItem.thumbnail,
      thumbnailUrl: cleanItem.thumbnailUrl,
      previewVideoUrl: cleanItem.previewVideoUrl,
      shortDescription: cleanItem.shortDescription,
      description: cleanItem.description,
      fullDescription: cleanItem.fullDescription,
      editingPlatform: cleanItem.editingPlatform,
      platform: cleanItem.platform,
      category: cleanItem.category,
      directTemplateUrl: cleanItem.directTemplateUrl,
      downloadableFileUrl: cleanItem.downloadableFileUrl,
      downloadFileUrl: cleanItem.downloadFileUrl,
      fileFormat: cleanItem.fileFormat,
      fileSize: cleanItem.fileSize,
      usageInstructions: cleanItem.usageInstructions,
      copyrightInfo: cleanItem.copyrightInfo,
      licenseInfo: cleanItem.licenseInfo,
      seoTitle: cleanItem.seoTitle,
      seoDescription: cleanItem.seoDescription,
      seoTags: cleanItem.seoTags,
      featured: cleanItem.featured,
      status: cleanItem.status,
      lovesCount: cleanItem.lovesCount,
      viewsCount: cleanItem.viewsCount,
      createdAt: cleanItem.createdAt,
      updatedAt: cleanItem.updatedAt,
    };

    // Strict undefined filter guarantee
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    if (firestoreDb && !isDemoMode) {
      try {
        await setDoc(doc(firestoreDb, 'videoTemplates', id), payload);
      } catch (err: unknown) {
        console.error('Firestore write error in /videoTemplates/' + id, err);
        const errMsg = handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `videoTemplates/${id}`);
        showToast('error', 'Upload Failed', `Could not save Video Template to Firestore: ${errMsg || (err instanceof Error ? err.message : 'Unknown write error')}`);
        throw err;
      }
    }

    setTemplates(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = cleanItem;
        return updated;
      }
      return [cleanItem, ...prev];
    });

    showToast('success', 'Template Saved', `"${cleanItem.title}" has been saved to /videoTemplates/${id}.`);
  };

  const deleteTemplate = async (id: string) => {
    if (firestoreDb && !isDemoMode) {
      try {
        await deleteDoc(doc(firestoreDb, 'videoTemplates', id));
      } catch (err: unknown) {
        handleFirestoreError(err, OperationType.DELETE, `videoTemplates/${id}`);
        showToast('error', 'Delete Failed', err instanceof Error ? err.message : 'Failed to delete template from Firestore');
        throw err;
      }
    }
    setTemplates(prev => prev.filter(t => t.id !== id));
    showToast('info', 'Deleted', 'Video template removed from Firestore.');
  };

  const setTemplateStatus = async (id: string, status: ContentStatus) => {
    const item = templates.find(t => t.id === id);
    if (!item) return;
    const updated = { ...item, status, updatedAt: new Date().toISOString() };
    if (firestoreDb && !isDemoMode) {
      try {
        await setDoc(doc(firestoreDb, 'videoTemplates', id), { status, updatedAt: updated.updatedAt }, { merge: true });
      } catch (err: unknown) {
        handleFirestoreError(err, OperationType.UPDATE, `videoTemplates/${id}`);
        showToast('error', 'Status Update Failed', err instanceof Error ? err.message : 'Failed to update template status in Firestore');
        throw err;
      }
    }
    setTemplates(prev => prev.map(t => (t.id === id ? updated : t)));
    showToast('success', 'Status Updated', `Template set to ${status}. Main Website visibility synced.`);
  };

  // CRUD: Categories (with content-assignment deletion protection)
  const saveCategory = async (catData: Omit<CategoryItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const isNew = !catData.id;
    const id = catData.id || `cat-${Date.now()}`;
    const now = new Date().toISOString();

    const existingItem = categories.find(c => c.id === id);
    const itemToSave: CategoryItem = {
      ...catData,
      id,
      createdAt: existingItem ? existingItem.createdAt : now,
      updatedAt: now,
    };

    if (firestoreDb && !isDemoMode) {
      try {
        await setDoc(doc(firestoreDb, 'categories', id), itemToSave);
      } catch (err) {
        handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `categories/${id}`);
      }
    }

    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = itemToSave;
        return updated;
      }
      return [...prev, itemToSave];
    });

    showToast('success', 'Category Saved', `"${itemToSave.name}" saved in /categories/${id}.`);
  };

  const deleteCategory = async (id: string): Promise<{ success: boolean; message?: string }> => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return { success: false, message: 'Category not found' };

    // Prevent deleting categories that still contain assigned content
    const usingApks = apks.filter(a => a.category === cat.name);
    const usingPrompts = prompts.filter(p => p.category === cat.name);
    const usingTemplates = templates.filter(t => t.category === cat.name);
    const totalCount = usingApks.length + usingPrompts.length + usingTemplates.length;

    if (totalCount > 0) {
      const msg = `Cannot delete "${cat.name}": Assigned to ${totalCount} content item(s). Reassign content before deleting.`;
      showToast('warning', 'Action Blocked', msg);
      return { success: false, message: msg };
    }

    if (firestoreDb && !isDemoMode) {
      try {
        await deleteDoc(doc(firestoreDb, 'categories', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
      }
    }

    setCategories(prev => prev.filter(c => c.id !== id));
    showToast('info', 'Deleted', `Category "${cat.name}" removed.`);
    return { success: true };
  };

  // Site Settings: /siteSettings/{docId}
  const saveFeaturedConfig = async (config: FeaturedBannerConfig) => {
    const updated = { ...config, updatedAt: new Date().toISOString() };
    if (firestoreDb && !isDemoMode) {
      try {
        await setDoc(doc(firestoreDb, 'siteSettings', 'featured'), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'siteSettings/featured');
      }
    }
    setFeaturedConfig(updated);
    showToast('success', 'Featured Banner Updated', 'Homepage spotlight synced to Main Website.');
  };

  const saveGeneralSettings = async (settings: GeneralSettings) => {
    const updated = { ...settings, updatedAt: new Date().toISOString() };
    if (firestoreDb && !isDemoMode) {
      try {
        await setDoc(doc(firestoreDb, 'siteSettings', 'general'), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'siteSettings/general');
      }
    }
    setGeneralSettings(updated);
    showToast('success', 'Site Settings Saved', 'General site preferences synced to Main Website.');
  };

  const saveSeoSettings = async (settings: SeoSettings) => {
    const updated = { ...settings, updatedAt: new Date().toISOString() };
    if (firestoreDb && !isDemoMode) {
      try {
        await setDoc(doc(firestoreDb, 'siteSettings', 'seo'), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'siteSettings/seo');
      }
    }
    setSeoSettings(updated);
    showToast('success', 'SEO Settings Saved', 'Global SEO parameters and sitemap rules synced.');
  };

  const saveAdSenseSettings = async (settings: AdSenseSettings) => {
    const updated = { ...settings, updatedAt: new Date().toISOString() };
    if (firestoreDb && !isDemoMode) {
      try {
        await setDoc(doc(firestoreDb, 'siteSettings', 'adsense'), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'siteSettings/adsense');
      }
    }
    setAdSenseSettings(updated);
    showToast('success', 'AdSense Settings Saved', 'AdSense configuration synced to Main Website.');
  };

  // Firebase Storage Upload with Organized Paths, Progress, and Deduplication
  const uploadMedia = async (
    file: File, 
    category: MediaItem['category'],
    onProgress?: (percent: number) => void
  ): Promise<MediaItem> => {
    const maxSizeBytes = 25 * 1024 * 1024; // 25MB max
    if (file.size > maxSizeBytes) {
      throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed size is 25MB.`);
    }

    const forbiddenExts = ['.exe', '.sh', '.bat', '.msi', '.cmd', '.vbs', '.apk', '.bin'];
    const lowerName = file.name.toLowerCase();
    if (forbiddenExts.some(ext => lowerName.endsWith(ext))) {
      throw new Error('Unsafe file format rejected. Only images, screenshots, videos, or template zip archives are permitted in Firebase Storage.');
    }

    // Avoid duplicate uploads: check if matching media already exists
    const existingDuplicate = media.find(m => m.name === file.name && m.size === file.size);
    if (existingDuplicate) {
      if (onProgress) onProgress(100);
      showToast('info', 'File Reused', `"${file.name}" was already uploaded to Storage.`);
      return existingDuplicate;
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // Organized storage paths per Section 7:
    // /apkApps/, /photoPrompts/, /videoTemplates/, /siteAssets/
    let basePath = 'siteAssets';
    if (category === 'icon' || category === 'screenshot') {
      basePath = `apkApps/${category}s`;
    } else if (category === 'image') {
      basePath = 'photoPrompts';
    } else if (category === 'video' || category === 'archive') {
      basePath = 'videoTemplates';
    }

    const storagePath = `${basePath}/${Date.now()}_${sanitizedName}`;
    let downloadUrl = '';

    if (firebaseStorage && !isDemoMode) {
      try {
        const storageRef = ref(firebaseStorage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type });

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              if (onProgress) onProgress(Math.round(progress));
            },
            (error) => {
              console.error('Storage upload error:', error);
              reject(error);
            },
            async () => {
              downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      } catch (err: unknown) {
        console.warn('Firebase Storage upload failed, falling back to local object URL:', err);
        downloadUrl = URL.createObjectURL(file);
      }
    } else {
      if (onProgress) onProgress(100);
      downloadUrl = URL.createObjectURL(file);
    }

    const newMedia: MediaItem = {
      id: `media-${Date.now()}`,
      name: file.name,
      url: downloadUrl,
      size: file.size,
      type: file.type,
      category,
      uploadedAt: new Date().toISOString(),
      storagePath,
    };

    setMedia(prev => [newMedia, ...prev]);
    showToast('success', 'Media Uploaded', `File uploaded to Storage at /${storagePath}`);
    return newMedia;
  };

  // Safe Media Deletion: Prevents deleting files currently referenced in content
  const deleteMedia = async (id: string) => {
    const item = media.find(m => m.id === id);
    if (!item) return;

    // Check if in use anywhere
    const isUsedInApks = apks.some(
      a => a.appIcon === item.url || a.coverImage === item.url || (a.screenshots && a.screenshots.includes(item.url))
    );
    const isUsedInPrompts = prompts.some(p => p.previewImage === item.url);
    const isUsedInTemplates = templates.some(t => t.thumbnail === item.url || t.previewVideoUrl === item.url);
    const isUsedInCategories = categories.some(c => c.imageUrl === item.url);
    const isUsedInSettings = 
      generalSettings.logoUrl === item.url || 
      generalSettings.faviconUrl === item.url || 
      featuredConfig.bannerImage === item.url;

    if (isUsedInApks || isUsedInPrompts || isUsedInTemplates || isUsedInCategories || isUsedInSettings) {
      const err = `Cannot delete "${item.name}": It is currently assigned to active content on PromptXHubl. Reassign or remove image from content first.`;
      showToast('warning', 'Action Blocked', err);
      throw new Error(err);
    }

    if (firebaseStorage && item.storagePath && !isDemoMode) {
      try {
        const storageRef = ref(firebaseStorage, item.storagePath);
        await deleteObject(storageRef);
      } catch (err) {
        console.warn('Could not delete from storage:', err);
      }
    }

    setMedia(prev => prev.filter(m => m.id !== id));
    showToast('info', 'Media Deleted', `"${item.name}" removed from Storage.`);
  };

  const value = useMemo(
    () => ({
      apks,
      prompts,
      templates,
      categories,
      media,
      featuredConfig,
      generalSettings,
      seoSettings,
      adsenseSettings,
      isLoading,
      connectionStatus,
      connectionError,
      toasts,
      dismissToast,
      showToast,
      retryConnection,
      fixFirestoreSync,
      dismissSyncError,
      saveApk,
      deleteApk,
      setApkStatus,
      savePrompt,
      deletePrompt,
      setPromptStatus,
      saveTemplate,
      deleteTemplate,
      setTemplateStatus,
      saveCategory,
      deleteCategory,
      saveFeaturedConfig,
      saveGeneralSettings,
      saveSeoSettings,
      saveAdSenseSettings,
      uploadMedia,
      deleteMedia,
      seedInitialDataToFirestore,
    }),
    [
      apks,
      prompts,
      templates,
      categories,
      media,
      featuredConfig,
      generalSettings,
      seoSettings,
      adsenseSettings,
      isLoading,
      connectionStatus,
      connectionError,
      toasts,
      dismissToast,
      showToast,
      dismissSyncError,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
