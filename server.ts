import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Route: AI SEO Tag Generator with Gemini 3.8 Flash
  app.post('/api/generate-seo-tags', async (req, res) => {
    try {
      const { title, description, category, promptText } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(200).json({
          tags: [],
          note: 'GEMINI_API_KEY not configured, using local generator',
        });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const prompt = `You are a search engine optimization (SEO) specialist for PromptXHubl, a platform for Android MOD APKs, AI photo editing prompts, and video templates.
Generate 6 to 10 highly relevant, natural, non-misleading, unique SEO keyword tags for the following item:

Title: ${title || 'N/A'}
Category: ${category || 'N/A'}
Short/Full Description: ${description || 'N/A'}
Prompt / Notes: ${promptText || 'N/A'}

Requirements:
- Each tag must be concise (1-3 words).
- All lowercase.
- Natural search phrases people actually search for.
- No hashtags, no symbols, no duplicate tags.
- Return ONLY a valid JSON array of strings, for example: ["photo editing prompt", "cyberpunk portrait", "midjourney style"]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text?.trim() || '[]';
      let tags: string[] = [];
      try {
        tags = JSON.parse(responseText);
      } catch {
        const matches = responseText.match(/"([^"]+)"/g);
        if (matches) {
          tags = matches.map(m => m.replace(/"/g, ''));
        }
      }

      return res.json({ tags });
    } catch (error) {
      console.error('Error generating SEO tags with Gemini:', error);
      return res.status(500).json({ error: 'Failed to generate SEO tags' });
    }
  });

  // Vite development middleware or static production serving
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`PromptXHubl Admin Server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
