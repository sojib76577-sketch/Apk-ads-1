export async function generateSeoTagsWithGemini(
  title: string,
  description: string,
  category?: string,
  promptText?: string
): Promise<string[]> {
  try {
    const response = await fetch('/api/generate-seo-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, category, promptText }),
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.tags) && data.tags.length > 0) {
        return data.tags;
      }
    }
  } catch {
    // Fall back to client-side natural extraction
  }

  // High-fidelity natural SEO keyword extractor fallback
  return generateLocalFallbackTags(title, description, category, promptText);
}

function generateLocalFallbackTags(
  title: string,
  description: string,
  category?: string,
  promptText?: string
): string[] {
  const text = `${title} ${description} ${category || ''} ${promptText || ''}`.toLowerCase();
  
  // Clean tokens
  const words = text
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);

  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'your', 'have', 'more',
    'will', 'can', 'are', 'not', 'all', 'any', 'best', 'free', 'click', 'here',
    'just', 'make', 'into', 'over', 'some', 'such', 'than', 'them', 'then'
  ]);

  const wordCounts = new Map<string, number>();
  for (const w of words) {
    if (!stopWords.has(w)) {
      wordCounts.set(w, (wordCounts.get(w) || 0) + 1);
    }
  }

  // Base suggestions
  const tags: string[] = [];

  // Key phrase from title
  const cleanTitle = title.trim().toLowerCase();
  if (cleanTitle) {
    tags.push(cleanTitle);
    const titleParts = cleanTitle.split(' ');
    if (titleParts.length >= 2) {
      tags.push(titleParts.slice(0, 2).join(' '));
    }
  }

  if (category) {
    tags.push(category.toLowerCase());
  }

  // Top frequency words
  const sorted = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(entry => entry[0]);

  for (const word of sorted) {
    if (!tags.includes(word) && tags.length < 10) {
      tags.push(word);
    }
  }

  // Add specialized tags based on context
  if (text.includes('midjourney')) tags.push('midjourney prompt');
  if (text.includes('flux')) tags.push('flux ai prompt');
  if (text.includes('portrait')) tags.push('portrait editing');
  if (text.includes('cinematic')) tags.push('cinematic lighting');
  if (text.includes('capcut')) tags.push('capcut template');
  if (text.includes('apk') || text.includes('mod')) tags.push('android mod apk');

  return Array.from(new Set(tags)).slice(0, 10);
}
