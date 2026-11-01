import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { SeoSettings } from '../../types';
import { 
  SearchCheck, 
  Save, 
  FileCode2, 
  Copy, 
  Check, 
  Download, 
  ShieldAlert, 
  Globe, 
  Share2 
} from 'lucide-react';

export const SeoManager: React.FC = () => {
  const { seoSettings, saveSeoSettings, apks, prompts, templates, categories } = useData();

  const [siteTitle, setSiteTitle] = useState(seoSettings.siteTitle);
  const [siteDescription, setSiteDescription] = useState(seoSettings.siteDescription);
  const [defaultKeywords, setDefaultKeywords] = useState<string[]>(seoSettings.defaultKeywords || []);
  const [keywordInput, setKeywordInput] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState(seoSettings.ogImageUrl);
  const [canonicalDomain, setCanonicalDomain] = useState(seoSettings.canonicalDomain);
  const [organizationName, setOrganizationName] = useState(seoSettings.organizationName);
  const [twitterHandle, setTwitterHandle] = useState(seoSettings.twitterHandle);
  const [enableSitemap, setEnableSitemap] = useState(seoSettings.enableSitemap);
  const [enableRobotsTxt, setEnableRobotsTxt] = useState(seoSettings.enableRobotsTxt);
  const [customRobotsRules, setCustomRobotsRules] = useState(seoSettings.customRobotsRules);

  const [isSaving, setIsSaving] = useState(false);
  const [copiedSitemap, setCopiedSitemap] = useState(false);
  const [copiedRobots, setCopiedRobots] = useState(false);

  useEffect(() => {
    setSiteTitle(seoSettings.siteTitle);
    setSiteDescription(seoSettings.siteDescription);
    setDefaultKeywords(seoSettings.defaultKeywords || []);
    setOgImageUrl(seoSettings.ogImageUrl);
    setCanonicalDomain(seoSettings.canonicalDomain);
    setOrganizationName(seoSettings.organizationName);
    setTwitterHandle(seoSettings.twitterHandle);
    setEnableSitemap(seoSettings.enableSitemap);
    setEnableRobotsTxt(seoSettings.enableRobotsTxt);
    setCustomRobotsRules(seoSettings.customRobotsRules);
  }, [seoSettings]);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !defaultKeywords.includes(keywordInput.trim().toLowerCase())) {
      setDefaultKeywords([...defaultKeywords, keywordInput.trim().toLowerCase()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setDefaultKeywords(defaultKeywords.filter(k => k !== kw));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveSeoSettings({
        siteTitle,
        siteDescription,
        defaultKeywords,
        ogImageUrl,
        canonicalDomain,
        organizationName,
        twitterHandle,
        enableSitemap,
        enableRobotsTxt,
        customRobotsRules,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to save SEO settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate live sitemap.xml adhering to section 12:
  // "Only published public pages should be included in the sitemap. Do not index admin pages, login pages, draft pages, private pages, empty pages."
  const generatedSitemap = useMemo(() => {
    const domain = (canonicalDomain || 'https://promptxhubl.com').replace(/\/$/, '');
    const publishedApks = apks.filter(a => a.status === 'published');
    const publishedPrompts = prompts.filter(p => p.status === 'published');
    const publishedTemplates = templates.filter(t => t.status === 'published');
    const activeCategories = categories.filter(c => c.status === 'active');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static public routes
    xml += `  <url>\n    <loc>${domain}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${domain}/apks</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${domain}/prompts</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${domain}/templates</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;

    // Published Categories
    for (const cat of activeCategories) {
      xml += `  <url>\n    <loc>${domain}/category/${cat.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    // Published APKs
    for (const apk of publishedApks) {
      xml += `  <url>\n    <loc>${domain}/apk/${apk.slug}</loc>\n    <lastmod>${apk.updatedAt.slice(0, 10)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    // Published Photo Prompts
    for (const p of publishedPrompts) {
      xml += `  <url>\n    <loc>${domain}/prompt/${p.slug}</loc>\n    <lastmod>${p.updatedAt.slice(0, 10)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    // Published Video Templates
    for (const t of publishedTemplates) {
      xml += `  <url>\n    <loc>${domain}/template/${t.slug}</loc>\n    <lastmod>${t.updatedAt.slice(0, 10)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
  }, [canonicalDomain, apks, prompts, templates, categories]);

  // Generate robots.txt
  const generatedRobotsTxt = useMemo(() => {
    const domain = (canonicalDomain || 'https://promptxhubl.com').replace(/\/$/, '');
    return `# Robots.txt for PromptXHubl
User-agent: *
Disallow: /admin/
Disallow: /login
Disallow: /draft/
Disallow: /api/
Allow: /

Sitemap: ${domain}/sitemap.xml
`;
  }, [canonicalDomain]);

  const copySitemap = () => {
    navigator.clipboard.writeText(generatedSitemap);
    setCopiedSitemap(true);
    setTimeout(() => setCopiedSitemap(false), 2000);
  };

  const copyRobots = () => {
    navigator.clipboard.writeText(generatedRobotsTxt);
    setCopiedRobots(true);
    setTimeout(() => setCopiedRobots(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <SearchCheck className="w-5 h-5 text-indigo-400" />
            Global SEO &amp; Sitemap Settings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure metadata, OpenGraph tags, canonical URLs, and dynamic sitemap generation
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save SEO Configuration'}</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            Core Meta Tags &amp; Canonical URL
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Website Meta Title
              </label>
              <input
                type="text"
                required
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Canonical Domain URL
              </label>
              <input
                type="url"
                required
                value={canonicalDomain}
                onChange={(e) => setCanonicalDomain(e.target.value)}
                placeholder="https://promptxhubl.com"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Website Meta Description
            </label>
            <textarea
              rows={2}
              required
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Social Sharing Cover (OG Image URL)
              </label>
              <input
                type="url"
                value={ogImageUrl}
                onChange={(e) => setOgImageUrl(e.target.value)}
                placeholder="https://.../og-cover.jpg"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="PromptXHubl Network"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Twitter/X Publisher Handle
              </label>
              <input
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                placeholder="@promptxhubl"
                className="w-full bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Default Keywords */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Default SEO Keywords (Meta Keywords)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddKeyword(); } }}
                placeholder="Add default keyword tag..."
                className="flex-1 bg-[#070a12] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {defaultKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs border border-slate-700/80"
                >
                  #{kw}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Sitemap.xml Generator & Preview */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-emerald-400" />
                Live Generated sitemap.xml
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically indexes all currently published APKs, Prompts, and Video Templates. Draft and admin pages are excluded.
              </p>
            </div>

            <button
              type="button"
              onClick={copySitemap}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              {copiedSitemap ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSitemap ? 'Copied XML!' : 'Copy Sitemap'}</span>
            </button>
          </div>

          <div className="bg-[#070a12] border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 max-h-56 overflow-y-auto leading-relaxed">
            <pre>{generatedSitemap}</pre>
          </div>
        </div>

        {/* Dynamic robots.txt Generator & Preview */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Live Generated robots.txt
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Restricts crawler access to private /admin, /login, and /draft endpoints
              </p>
            </div>

            <button
              type="button"
              onClick={copyRobots}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              {copiedRobots ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRobots ? 'Copied robots.txt!' : 'Copy Rules'}</span>
            </button>
          </div>

          <div className="bg-[#070a12] border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 leading-relaxed">
            <pre>{generatedRobotsTxt}</pre>
          </div>
        </div>
      </form>
    </div>
  );
};
