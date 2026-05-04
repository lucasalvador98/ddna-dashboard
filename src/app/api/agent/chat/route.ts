import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = 'llama-3.1-8b-instant';

const SYSTEM_PROMPT = `Sos el asistente de investigación de la Defensoría de los Derechos de Niñas, Niños y Adolescentes (DDNA) de Córdoba, Argentina.

## Reglas:
- Respondé de forma breve y concreta
- Incluí datos específicos con año y fuente cuando existan
- NO uses frases genéricas
- Si no hallás info, decilo claramente

## Format:
[Tu respuesta]

Fuentes:
• [Nombre de la fuente]`;

// Clean DuckDuckGo URLs
function cleanUrl(url: string): string {
  if (url.includes('duckduckgo.com/l/')) {
    try {
      const decoded = decodeURIComponent(url);
      const match = decoded.match(/uddg=([^&]+)/);
      if (match) return decodeURIComponent(match[1]);
    } catch {
      return url;
    }
  }
  return url;
}

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question requerida' }, { status: 400 });
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY no configurada' }, { status: 500 });
    }

    const baseUrl = request.headers.get('origin') || 'http://localhost:3000';

    // Step 1: Try to find in already processed chunks
    const docsRes = await fetch(`${baseUrl}/api/agent/search-docs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: question, max_results: 8 }),
    });
    const docsData = await docsRes.json();
    const docs = docsData?.results || [];

    // Step 2: Also try to get recent files from bucket
    const bucketRes = await fetch(`${baseUrl}/api/agent/list-bucket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const bucketData = await bucketRes.json();
    const bucketFiles = bucketData?.files || [];

    // Build context
    let context = '';
    const sources: { source: string; type: string }[] = [];

    // Add docs if relevant
    if (docs.length > 0) {
      const relevantDocs = docs.filter((d: any) => d.content && d.content.length > 50);
      if (relevantDocs.length > 0) {
        context += '## Documentos Procesados:\n';
        relevantDocs.slice(0, 4).forEach((d: any, i: number) => {
          context += `${i + 1}. ${d.content?.substring(0, 600)}\n\n`;
          sources.push({ source: d.source, type: 'documento' });
        });
      }
    }

    // Add bucket files info
    if (bucketFiles.length > 0) {
      context += '\n## Archivos Disponibles en el Repositorio:\n';
      bucketFiles.slice(0, 10).forEach((f: any, i: number) => {
        context += `${i + 1}. ${f.name} (${f.type})\n`;
      });
    }

    // Step 3: Always search web for data questions
    const isDataQuestion =
      /\b(tasa|porcentaje|cifras|stats|datos|número|cuántos|cuántas|ipc|inflación|empleo|desempleo|pobreza|mortalidad)\b/i.test(
        question
      );
    const needsWeb = isDataQuestion || docs.length === 0;

    if (needsWeb) {
      const searchQuery =
        isDataQuestion && !question.toLowerCase().includes('argentina')
          ? `${question} Argentina`
          : question;

      const webRes = await fetch(`${baseUrl}/api/agent/web-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, num_results: 5 }),
      });
      const webData = await webRes.json();
      const web = webData?.results || [];

      if (web.length > 0) {
        context += '\n## Búsqueda Web:\n';
        web.slice(0, 4).forEach((w: any, i: number) => {
          context += `${context.split('\n').length}. ${w.title}: ${w.snippet}\n`;
          sources.push({ source: cleanUrl(w.url), type: 'web' });
        });
      }
    }

    if (!context) {
      context = 'No se encontró información.';
    }

    // Generate response
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Pregunta: "${question}"\n\nInfo disponible:\n${context}\n\nRespondé de forma concisa.`,
      },
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: `Groq error: ${error.error?.message || error}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const answer = data.choices[0]?.message?.content || 'No pude generar respuesta';

    return NextResponse.json({
      answer,
      sources: sources.length > 0 ? sources : undefined,
      tools_used: needsWeb
        ? ['list-bucket', 'search_knowledge_base', 'web_search']
        : ['list-bucket', 'search_knowledge_base'],
    });
  } catch (err) {
    console.error('Agent chat error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
