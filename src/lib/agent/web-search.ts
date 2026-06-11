/**
 * web-search — DuckDuckGo HTML search utility.
 *
 * Extracted from /api/agent/web-search for direct import.
 * No HTTP overhead, no auth exposure.
 */

import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface WebSearchResponse {
  results: WebSearchResult[];
  total: number;
  query: string;
  search_type: 'web';
}

/**
 * Search DuckDuckGo via HTML scrape.
 * Returns up to `numResults` results (default 10).
 * Optionally restrict to a `site` domain.
 */
export async function searchWeb(
  query: string,
  numResults = 10,
  site?: string,
): Promise<WebSearchResponse> {
  let searchQuery = query;
  if (site) {
    searchQuery = `${query} site:${site}`;
  }

  const encodedQuery = encodeURIComponent(searchQuery);

  const response = await fetch(
    `https://html.duckduckgo.com/html/?q=${encodedQuery}`,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`DuckDuckGo returned HTTP ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const results: WebSearchResult[] = [];

  $('.result').each((_i: number, el: Element) => {
    if (results.length >= numResults) return;

    const titleEl = $(el).find('.result__title');
    const title = titleEl.text().trim();
    const urlEl = titleEl.find('a');
    const url = urlEl.attr('href') || '';
    const snippetEl = $(el).find('.result__snippet');
    const snippet = snippetEl.text().trim();

    if (title && url) {
      let source = '';
      try {
        source = new URL(url).hostname.replace('www.', '');
      } catch {
        source = 'unknown';
      }
      results.push({ title, url, snippet, source });
    }
  });

  return {
    results,
    total: results.length,
    query,
    search_type: 'web',
  };
}
