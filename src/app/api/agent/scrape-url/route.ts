import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const { url, extract_type = 'text' } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL es requerida' }, { status: 400 });
    }

    // Validate URL
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Error al obtener la página: ${response.status}` },
        { status: response.status }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let result: any = {};

    if (extract_type === 'text') {
      // Extract main content
      $('script, style, nav, header, footer, .ad, .advertisement, .sidebar').remove();

      // Get title
      result.title = $('title').text().trim() || $('h1').first().text().trim();

      // Get main content (try common content selectors)
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

      // Fallback to body if no content found
      if (!content) {
        content = $('body').text().trim();
      }

      // Clean up whitespace
      result.content = content.replace(/\s+/g, ' ').substring(0, 10000); // Limit to 10k chars
    } else if (extract_type === 'links') {
      const links: { text: string; href: string }[] = [];
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        if (href && text) {
          // Resolve relative URLs
          try {
            const absoluteUrl = new URL(href, url).toString();
            links.push({ text, href: absoluteUrl });
          } catch {
            // Skip invalid URLs
          }
        }
      });
      result.links = links.slice(0, 50); // Limit to 50 links
    } else if (extract_type === 'metadata') {
      result.metadata = {
        title: $('title').text().trim(),
        description: $('meta[name="description"]').attr('content'),
        keywords: $('meta[name="keywords"]').attr('content'),
        author: $('meta[name="author"]').attr('content'),
        og_title: $('meta[property="og:title"]').attr('content'),
        og_description: $('meta[property="og:description"]').attr('content'),
      };
    }

    return NextResponse.json({
      url,
      extract_type,
      ...result,
      fetched_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Scrape error:', err);
    return NextResponse.json({ error: `Error al hacer scraping: ${err}` }, { status: 500 });
  }
}
