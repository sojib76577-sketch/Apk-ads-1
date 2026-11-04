export type ContentStatus = 'published' | 'draft' | 'unpublished';

export type ApkCategory = 'MOD Apps' | 'MOD Games';

export type ContentType = 
  | 'MOD Apps' 
  | 'MOD Games' 
  | 'Photo Editing Prompts' 
  | 'Video Templates';

export interface ApkItem {
  id: string;
  title: string;
  name?: string; // Main website compatibility alias
  slug: string;
  appIcon: string;
  iconUrl?: string; // Main website compatibility alias
  coverImage: string;
  coverImageUrl?: string; // Main website compatibility alias
  screenshots: string[];
  shortDescription: string;
  description?: string; // Main website compatibility alias
  fullDescription: string;
  category: ApkCategory;
  version: string;
  fileSize: string;
  androidRequirements: string;
  downloadUrl: string;
  officialSourceUrl: string;
  sourceUrl?: string; // Main website compatibility alias
  developerName: string;
  packageName?: string;
  changelog?: string;
  licenseInfo: string;
  seoTitle: string;
  seoDescription: string;
  seoTags: string[];
  featured: boolean;
  featuredOrder?: number;
  pinOrder?: number;
  status: ContentStatus;
  lovesCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoPrompt {
  id: string;
  title: string;
  slug: string;
  previewImage: string;
  imageUrl?: string; // Main website compatibility alias
  shortDescription: string;
  description?: string; // Main website compatibility alias
  fullDescription: string;
  promptText: string;
  category: string;
  aiPlatform: string;
  instructions: string;
  seoTitle: string;
  seoDescription: string;
  seoTags: string[];
  featured: boolean;
  status: ContentStatus;
  lovesCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VideoTemplate {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  thumbnailUrl?: string; // Main website compatibility alias
  previewVideoUrl?: string;
  shortDescription: string;
  description?: string; // Main website compatibility alias
  fullDescription: string;
  editingPlatform: string;
  platform?: string; // Main website compatibility alias
  category: string;
  directTemplateUrl?: string;
  downloadableFileUrl?: string;
  downloadFileUrl?: string; // Main website compatibility alias
  fileFormat: string;
  fileSize: string;
  usageInstructions: string;
  copyrightInfo: string;
  licenseInfo?: string; // Main website compatibility alias
  seoTitle: string;
  seoDescription: string;
  seoTags: string[];
  featured: boolean;
  status: ContentStatus;
  lovesCount?: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  contentType: ContentType;
  description: string;
  imageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  category: 'image' | 'icon' | 'screenshot' | 'video' | 'archive' | 'other';
  uploadedAt: string;
  storagePath: string;
}

export interface FeaturedBannerConfig {
  bannerTitle: string;
  bannerDescription: string;
  bannerImage: string;
  buttonLabel: string;
  destinationUrl: string;
  isVisible: boolean;
  order: number;
  featuredApkIds: string[];
  featuredPromptIds: string[];
  featuredTemplateIds: string[];
  updatedAt: string;
}

export interface GeneralSettings {
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  aboutText: string;
  footerText: string;
  socialLinks: {
    twitter?: string;
    telegram?: string;
    youtube?: string;
    instagram?: string;
    facebook?: string;
    discord?: string;
  };
  maintenanceMode: boolean;
  maintenanceMessage: string;
  publicWebsiteUrl: string;
  adminNotes: string;
  updatedAt: string;
}

export interface SeoSettings {
  siteTitle: string;
  siteDescription: string;
  defaultKeywords: string[];
  ogImageUrl: string;
  canonicalDomain: string;
  organizationName: string;
  twitterHandle: string;
  enableSitemap: boolean;
  enableRobotsTxt: boolean;
  customRobotsRules: string;
  updatedAt: string;
}

export interface AdSenseSettings {
  publisherId: string;
  enabled: boolean;
  adsTxtVerified: boolean;
  autoAds: boolean;
  slots: {
    headerBanner: boolean;
    inContentBanner: boolean;
    sidebarRectangle: boolean;
    footerBanner: boolean;
  };
  updatedAt: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'superadmin' | 'admin' | 'editor';
  createdAt?: string;
}

export type ActiveNav = 
  | 'dashboard'
  | 'apk-manager'
  | 'photo-prompt-manager'
  | 'video-template-manager'
  | 'category-manager'
  | 'media-library'
  | 'featured-content'
  | 'engagement'
  | 'seo-manager'
  | 'adsense-settings'
  | 'site-settings';
