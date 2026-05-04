import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const { query, num_results = 10, site } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query es requerido' }, { status: 400 });
    }

    // Build search query
    let searchQuery = query;
    if (site) {
      searchQuery = `${query} site:${site}`;
    }

    // Encode for URL
    const encodedQuery = encodeURIComponent(searchQuery);

    // Fetch DuckDuckGo HTML results
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodedQuery}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Error al buscar: ${response.status}` }, { status: 500 });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const results: { title: string; url: string; snippet: string; source: string }[] = [];

    // Extract results from DuckDuckGo HTML format
    $('.result').each((_, el) => {
      if (results.length >= num_results) return;

      const titleEl = $(el).find('.result__title');
      const title = titleEl.text().trim();

      const urlEl = titleEl.find('a');
      const url = urlEl.attr('href') || '';

      const snippetEl = $(el).find('.result__snippet');
      const snippet = snippetEl.text().trim();

      if (title && url) {
        // Extract source from URL
        let source = '';
        try {
          source = new URL(url).hostname.replace('www.', '');
        } catch {
          source = 'unknown';
        }

        results.push({ title, url, snippet, source });
      }
    });

    return NextResponse.json({
      results,
      total: results.length,
      query,
      search_type: 'web',
    });
  } catch (err) {
    console.error('Web search error:', err);
    return NextResponse.json({ error: `Error en búsqueda web: ${err}` }, { status: 500 });
  }
}
