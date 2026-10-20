/**
 * scrape-url — Scrape a URL and extract text content.
 *
 * Extracted from /api/agent/scrape-url for direct import.
 * Supports text extraction, link extraction, and metadata.
 */

import * as cheerio from 'cheerio';

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

const FETCH_TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 3;

/** Block obvious local/internal hostnames. */
function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === 'localhost' || host === '0.0.0.0') return true;
  if (host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    return true;
  }

  // IPv4 literals
  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    return false;
  }

  // IPv6 literals (URL.hostname keeps the brackets)
  const v6 = host.replace(/^\[|\]$/g, '');
  if (v6 === '::1' || v6 === '::' || v6.startsWith('fc') || v6.startsWith('fd')) return true;
  if (v6.startsWith('fe8') || v6.startsWith('fe9') || v6.startsWith('fea') || v6.startsWith('feb')) {
    return true;
  }

  return false;
}

/** Reject non-HTTP(S) and private/local destinations (SSRF protection). */
function assertSafeUrl(parsedUrl: URL): void {
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Solo se permiten URLs HTTP/HTTPS');
  }
  if (isPrivateHostname(parsedUrl.hostname)) {
    throw new Error('No se permiten URLs a hosts locales o privados');
  }
}

/** Fetch following redirects manually so each hop is validated against SSRF. */
async function safeFetch(url: string): Promise<Response> {
  let current = new URL(url);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    assertSafeUrl(current);

    const response = await fetch(current.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) {
        throw new Error(`Redirección sin destino: HTTP ${response.status}`);
      }
      current = new URL(location, current);
      continue;
    }

    return response;
  }

  throw new Error('Demasiadas redirecciones');
}

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

  assertSafeUrl(parsedUrl);

  const response = await safeFetch(url);

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
