# PromptXHubl Admin Website

A production-ready, secure, high-performance dark-themed content management system (CMS) and administration dashboard for **PromptXHubl**.

Built with React 19, TypeScript, Tailwind CSS, Motion, and Firebase (Authentication, Cloud Firestore, and Cloud Storage).

---

## 🚀 Key Features

1. **Secure Admin Authentication**: Firebase Auth with email/password, session persistence, password reset flow, and Zero-Trust database authorization via `/admins/{uid}` in Firestore.
2. **Dashboard Overview**: Live dynamic metric cards for APK Apps, APK Games, Photo Prompts, Video Templates, Published vs Draft vs Unpublished items, Prompt Loves, and real-time publishing activity.
3. **APK Manager**:
   - Strictly organized into `MOD Apps` and `MOD Games`.
   - Comprehensive metadata: version, file size, Android requirements, verified download URLs, developer info, distribution license, screenshots, and SEO tags.
   - Safe download URL validation with live destination test preview and publishing confirmation modal.
4. **Photo Editing Prompt CMS**:
   - Stored prompt text is isolated from descriptions with 1-click clipboard copy for public visitors.
   - Categorized by AI generator platforms (Midjourney, ChatGPT/DALL-E 3, Flux, Stable Diffusion XL, Leonardo AI, etc.).
   - **AI-Assisted SEO Tag Generator**: Powered by Gemini API to generate natural, high-ranking, unique keyword tags.
5. **Video Template CMS**:
   - Supports both **Direct Template URL** (e.g. CapCut web template) and **Downloadable File URL** (e.g. project ZIP/assets). Enforces at least one valid link before publishing.
   - Multi-platform categorization: CapCut, Premiere Pro, After Effects, VN, DaVinci Resolve, Alight Motion, etc.
6. **Category Manager**:
   - Manage categories for all 4 content types with custom SEO titles and descriptions.
   - **Delete Protection**: Prevents deleting categories that currently have published items until content is reassigned or removed.
7. **Unified Content Management Tables**:
   - Dedicated views for APK Apps, APK Games, Photo Prompts, and Video Templates.
   - Real-time search, category/status filtering, multi-field sorting, pagination, quick publish/unpublish, and deletion confirmation dialogs.
8. **Media Library**:
   - Connected to Firebase Storage with local preview and direct URL support.
   - Filter by images, icons, screenshots, videos, and zip files with size and MIME type guards.
9. **Homepage Featured Content Manager**:
   - Configure the hero spotlight banner (title, description, image, CTA label, destination link, toggle visibility, display order).
   - Real-time Firestore sync with the public website (`/siteSettings/featured`).
10. **Engagement Analytics**:
    - Monitor prompt love counts and view counts across content without allowing artificial number inflation.
11. **Global SEO Manager**:
    - Manage canonical domain, meta descriptions, OpenGraph sharing image, social profiles, and generate live `sitemap.xml` and `robots.txt` previews.
12. **AdSense Settings**:
    - Integrated with publisher ID `pub-8520963162864667`.
    - One-click ads.txt generator, placement toggles, and strict compliance checklist.
13. **Site Settings**:
    - General website configuration, logo, favicon, maintenance mode toggle, and official contact `sojib76577@gmail.com`.

---

## 🔒 1. Firebase Configuration Instructions

This admin dashboard connects to your existing PromptXHubl Firebase project.

### Method A: In-App Connection Manager (Recommended)
You do not need to recompile or touch code to set up Firebase!
1. Launch the admin app.
2. In the login screen or header, click **"Firebase Settings"** (or the Cloud connection badge).
3. Paste your Firebase Web configuration JSON or individual keys:
   ```json
   {
     "apiKey": "AIzaSy...",
     "authDomain": "promptxhubl.firebaseapp.com",
     "projectId": "promptxhubl",
     "storageBucket": "promptxhubl.appspot.com",
     "messagingSenderId": "1234567890",
     "appId": "1:1234567890:web:abcdef..."
   }
   ```
4. Click **Save and Initialize**. The application will instantly connect to your live Firebase project!

### Method B: Environment Variables
Create a `.env` file in the project root:
```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="promptxhubl.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="promptxhubl"
VITE_FIREBASE_STORAGE_BUCKET="promptxhubl.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
```

---

## 🔑 2. Admin Account Authorization Instructions

To ensure zero unauthorized access:
1. Open the [Firebase Console](https://console.firebase.google.com/) for your project.
2. Go to **Build > Authentication > Users**.
3. Click **Add User** and create the admin email and password (e.g. `sojib76577@gmail.com`).
4. Copy the newly created user's **User UID** (e.g. `d7K3pL90QwEr1...`).
5. Go to **Build > Firestore Database**.
6. In the `/admins` collection, add a document where the **Document ID** is the exact UID you just copied:
   - Collection: `admins`
   - Document ID: `<ADMIN_UID>`
   - Fields:
     - `uid`: string (the same UID)
     - `email`: string (`sojib76577@gmail.com`)
     - `role`: string (`"superadmin"` or `"admin"`)
     - `displayName`: string (`"PromptXHubl Admin"`)
     - `createdAt`: timestamp
7. Now log in at the Admin Website with this email and password. The system will verify the document in `/admins/{uid}` and grant full administrative access!

---

## 🗄️ 3. Firestore Collection Structure

Both the public website and this Admin Website use the exact same collection names and schemas:

| Collection Path | Purpose | Key Fields |
|---|---|---|
| `/admins/{uid}` | Authorized admin registry | `uid`, `email`, `role`, `displayName`, `createdAt` |
| `/apkApps/{itemId}` | MOD Apps & MOD Games | `title`, `slug`, `category` ("MOD Apps" or "MOD Games"), `version`, `fileSize`, `androidRequirements`, `downloadUrl`, `officialSourceUrl`, `developerName`, `licenseInfo`, `appIcon`, `coverImage`, `screenshots`, `status` ("published" \| "draft" \| "unpublished"), `featured`, `seoTitle`, `seoDescription`, `seoTags`, `createdAt`, `updatedAt`, `viewsCount`, `lovesCount` |
| `/photoPrompts/{promptId}` | AI Photo Prompts | `title`, `slug`, `previewImage`, `promptText`, `category`, `aiPlatform`, `shortDescription`, `fullDescription`, `instructions`, `status`, `featured`, `seoTags`, `lovesCount`, `createdAt` |
| `/videoTemplates/{templateId}` | Video Editing Templates | `title`, `slug`, `thumbnail`, `previewVideoUrl`, `editingPlatform`, `category`, `directTemplateUrl`, `downloadableFileUrl`, `fileFormat`, `fileSize`, `usageInstructions`, `status`, `featured`, `createdAt` |
| `/categories/{categoryId}` | Taxonomies | `name`, `slug`, `contentType`, `description`, `imageUrl`, `seoTitle`, `status` ("active" \| "inactive") |
| `/siteSettings/general` | General Website Info | `siteName`, `contactEmail`, `aboutText`, `footerText`, `logoUrl`, `faviconUrl`, `maintenanceMode`, `publicUrl` |
| `/siteSettings/seo` | Global SEO Settings | `siteTitle`, `siteDescription`, `defaultKeywords`, `ogImageUrl`, `canonicalDomain`, `socialLinks` |
| `/siteSettings/adsense` | Google AdSense Config | `publisherId` (`pub-8520963162864667`), `enabled`, `adsTxtContent`, `adSlots` |
| `/siteSettings/featured` | Homepage Hero Spotlight | `bannerTitle`, `bannerDescription`, `bannerImage`, `buttonLabel`, `destinationUrl`, `isVisible`, `order`, `featuredItemIds` |
| `/loveCounts/{itemId}` | Public Love Trackers | `itemId`, `count`, `lastUpdated` |

---

## 📦 4. Firebase Storage Setup

1. In Firebase Console, go to **Build > Storage**.
2. Click **Get Started** and select your preferred region.
3. Replace the default storage rules with the contents of the provided `storage.rules` file:
   - Validates upload file sizes ($\le 25\text{MB}$).
   - Validates MIME types (images, videos, zip archives).
   - Requires verified admin authorization for write/delete operations.
   - Allows public read access for served media.

---

## 🌐 5. Netlify Deployment Instructions

This Admin Website is engineered to deploy cleanly as an independent site on Netlify.

1. Push this repository to GitHub or GitLab.
2. In Netlify, click **"Add new site" > "Import an existing project"**.
3. Select your repository.
4. Configure Build settings:
   - **Base directory**: (leave blank / root)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Under **Environment variables**, optionally add:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `GEMINI_API_KEY` (optional, for server-side AI SEO tags)
6. The included `public/_redirects` file automatically handles single-page application (SPA) routing so direct navigation and refreshes will not 404!
7. Click **Deploy Site**.

---

## 🔗 6. How to Connect with the Public PromptXHubl Website

Because both websites are separate Netlify deployments:
- Configure both the Public Website and this Admin Website with the **same Firebase project ID and credentials**.
- Any item marked as `"published"` in this Admin CMS is immediately accessible by the public website queries:
  ```javascript
  const q = query(collection(db, "apkApps"), where("status", "==", "published"), orderBy("createdAt", "desc"));
  ```
- Any item marked as `"draft"` or `"unpublished"` will be completely invisible to public queries due to Firestore Security Rules (`resource.data.status == 'published'`).
- Changes made in **Homepage Featured Content**, **Categories**, or **Site Settings** are fetched by the public website in real time via Firestore `onSnapshot` without needing any code re-deployment!
