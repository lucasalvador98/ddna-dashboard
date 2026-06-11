/**
 * scrape-url — Scrape a URL and extract text content.
 *
 * Extracted from /api/agent/scrape-url for direct import.
 * Supports text extraction, link extraction, and metadata.
 */

import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';

export interface ScrapeTextResult {
  url: string;
  title: string;
  content: string;
  extract_type: 'text';
  fetched_at: string;
}

export interface ScrapeLinksResult {
  url: string;
  links: Array<{ text: string; href: string }>;
  extract_type: 'links';
  fetched_at: string;
}

export interface ScrapeMetadataResult {
  url: string;
  metadata: Record<string, string | undefined>;
  extract_type: 'metadata';
  fetched_at: string;
}

export type ScrapeResult = ScrapeTextResult | ScrapeLinksResult | ScrapeMetadataResult;

/**
 * Scrape a URL and extract content.
 *
 * @param url - The URL to scrape
 * @param extractType - 'text' (default), 'links', or 'metadata'
 * @param maxChars - Max characters for text extraction (default 10000)
 */
export async function scrapeUrl(
  url: string,
  extractType: 'text',
  maxChars?: number,
): Promise<ScrapeTextResult>;
export async function scrapeUrl(
  url: string,
  extractType: 'links',
  maxChars?: number,
): Promise<ScrapeLinksResult>;
export async function scrapeUrl(
  url: string,
  extractType: 'metadata',
  maxChars?: number,
): Promise<ScrapeMetadataResult>;
export async function scrapeUrl(
  url: string,
  extractType: 'text' | 'links' | 'metadata' = 'text',
  maxChars = 10000,
): Promise<ScrapeResult> {
  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error('URL inválida');
  }

  // Only allow http/https
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Solo se permiten URLs HTTP/HTTPS');
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener la página: HTTP ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const fetchedAt = new Date().toISOString();

  if (extractType === 'text') {
    // Remove non-content elements
    $('script, style, nav, header, footer, .ad, .advertisement, .sidebar').remove();

    const title = $('title').text().trim() || $('h1').first().text().trim();

    const contentSelectors = [
      'article',
      'main',
      '.content',
      '.post-content',
      '.article-content',
      '#content',
      '.entry-content',
      '.body-content',
    ];

    let content = '';
    for (const selector of contentSelectors) {
      const el = $(selector).first();
      if (el.length) {
        content = el.text().trim();
        break;
      }
    }

    // Fallback to body
    if (!content) {
      content = $('body').text().trim();
    }

    content = content.replace(/\s+/g, ' ').substring(0, maxChars);

    return { url, title, content, extract_type: 'text', fetched_at: fetchedAt };
  }

  if (extractType === 'links') {
    const links: Array<{ text: string; href: string }> = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href && text) {
        try {
          const absoluteUrl = new URL(href, url).toString();
          links.push({ text, href: absoluteUrl });
        } catch {
          // Skip invalid URLs
        }
      }
    });
    return {
      url,
      links: links.slice(0, 50),
      extract_type: 'links',
      fetched_at: fetchedAt,
    };
  }

  // metadata
  const metadata: Record<string, string | undefined> = {
    title: $('title').text().trim() || undefined,
    description: $('meta[name="description"]').attr('content') || undefined,
    keywords: $('meta[name="keywords"]').attr('content') || undefined,
    author: $('meta[name="author"]').attr('content') || undefined,
    og_title: $('meta[property="og:title"]').attr('content') || undefined,
    og_description: $('meta[property="og:description"]').attr('content') || undefined,
  };

  return { url, metadata, extract_type: 'metadata', fetched_at: fetchedAt };
}
