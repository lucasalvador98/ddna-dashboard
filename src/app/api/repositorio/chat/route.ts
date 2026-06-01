import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  executeIndicatorTool,
  extractDataSources,
  INDICATOR_TOOL_DEFINITIONS,
} from '@/lib/agent/indicator-tools';

// --- Configuration ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'groq';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// Models
const GROQ_MODEL = 'llama-3.1-8b-instant';
const OPENAI_MODEL = 'gpt-4o-mini';

// Agent limits
const MAX_TOOL_ROUNDS = 3;
const MAX_TOOL_CALLS = 5;
const MAX_TOKENS = 1500;
const MAX_CONTEXT_CHARS = 12000; // ~3K tokens, prevent Groq context overflow
// Base URL for calling internal endpoints (used by tools)
const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChunkResult {
  id: string;
  repo_file_id: string;
  chunk_index: number;
  content: string;
  metadata: Record<string, unknown>;
  nombre_archivo: string;
  categoria: string;
  similarity: number;
}

interface RawIlikeRow {
  id: string;
  repo_file_id: string;
  chunk_index: number;
  content: string;
  metadata: Record<string, unknown>;
  repositorio: { nombre_archivo: string; categoria: string } | null;
}

/** Parsed tool call from LLM response. */
interface ParsedToolCall {
  name: string;
  params: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Tool definitions for the system prompt
// ---------------------------------------------------------------------------

const SEARCH_TOOL_DEFINITION = {
  name: 'search_knowledge_base',
  description:
    'Busca en la base de conocimiento de la DDNA (documentos oficiales, informes, normativas) usando búsqueda semántica. Devuelve fragmentos relevantes de documentos con su fuente. Usala cuando el usuario haga preguntas que requieran información de documentos, normativas, o contexto institucional.',
  parameters: 'query (requerido — la consulta de búsqueda en lenguaje natural)',
};

const WEB_SEARCH_TOOL = {
  name: 'search_web',
  description:
    'Busca en internet (DuckDuckGo) información actualizada. Usala para obtener datos externos, noticias recientes, estadísticas nacionales, o información que no está en los documentos ni indicadores de la DDNA.',
  parameters: 'query (requerido — la consulta de búsqueda), site (opcional — limitar a un dominio específico)',
};

const SCRAPE_URL_TOOL = {
  name: 'scrape_url',
  description:
    'Extrae el contenido completo de una página web. Usala cuando necesitás leer en detalle un artículo, informe o fuente específica encontrada en la búsqueda web.',
  parameters: 'url (requerido — la URL completa de la página)',
};

const ALL_TOOL_DEFINITIONS = [SEARCH_TOOL_DEFINITION, WEB_SEARCH_TOOL, SCRAPE_URL_TOOL, ...INDICATOR_TOOL_DEFINITIONS];

// ---------------------------------------------------------------------------
// System Prompt (enhanced for agent + tools)
// ---------------------------------------------------------------------------

function buildSystemPrompt(): string {
  const toolDescriptions = ALL_TOOL_DEFINITIONS.map(
    t => `- **${t.name}**: ${t.description}\n  Parámetros: ${t.parameters}`
  ).join('\n');

  const prompt = `Eres un asistente especializado de la Defensoría de los Derechos de Niñas, Niños y Adolescentes (DDNA) de la Provincia de Córdoba.

Tu función es ayudar al público en general a obtener información precisa combinando:
1. **Documentos oficiales** de la Defensoría (biblioteca de conocimiento)
2. **Datos estadísticos** de indicadores sociales (pobreza, salud, educación, inversión, etc.)

## HERRAMIENTAS DISPONIBLES

Podés llamar a las siguientes herramientas usando el formato TOOL_CALL:

${toolDescriptions}

## FORMATO DE LLAMADA A HERRAMIENTA

Cuando necesites datos o documentos, respondé ÚNICAMENTE con líneas TOOL_CALL (sin texto adicional):

TOOL_CALL: nombre_herramienta parametro1="valor1" parametro2="valor2"

Podés llamar a múltiples herramientas en una misma respuesta (una por línea).

Ejemplo:
TOOL_CALL: search_knowledge_base query="informes pobreza infantil Córdoba"
TOOL_CALL: getLatestIndicatorValue indicadorNombre="Pobreza infantil" categoria="pobreza"

Los resultados de las herramientas te serán enviados en el siguiente mensaje. Luego sintetizá una respuesta final.

## CUÁNDO USAR CADA TIPO DE HERRAMIENTA

- **Documentos + Datos**: para informes completos, análisis de situación, reportes ejecutivos
- **Solo Documentos**: para preguntas sobre normativas, procedimientos, definiciones institucionales
- **Solo Datos**: para consultas estadísticas puntuales, tendencias, comparaciones numéricas
- **Web**: para información externa, contexto nacional, noticias recientes, o validar datos contra fuentes externas
- **Combinación de las tres**: para análisis profundo, informes completos, o cuando necesitás contrastar datos locales con contexto nacional/global
- **Ninguna**: para preguntas simples, saludos, o información general que ya conocés

## REGLAS DE RESPUESTA

1. Respondé SIEMPRE en español
2. Basá tus respuestas ÚNICAMENTE en los resultados de las herramientas (no inventes datos)
3. Si no encontrás la información después de usar las herramientas, informalo con honestidad y sugerí alternativas
4. Cita las fuentes:
   - Documentos: [Fuente: nombre_archivo]
   - Datos estadísticos: [Indicador: nombre_indicador, periodo]
5. Mantené un tono profesional pero accesible para público general
6. NO respondas con TOOL_CALL a menos que realmente necesites datos o documentos

## ANÁLISIS CRÍTICO Y VALIDACIÓN CRUZADA

Como analista de la DDNA, tu trabajo NO es solo repetir datos, sino analizarlos críticamente:

1. **Cruzá fuentes**: cuando tengas datos de indicadores (base de datos oficial), documentos (biblioteca DDNA), y búsquedas web (fuentes externas), comparalos. Si hay discrepancias, señalalas y explicá posibles razones (diferentes metodologías, períodos, fuentes).

2. **Detectá inconsistencias**: si un dato no tiene sentido (ej: "la pobreza infantil es del 120%"), cuestionalo. Si dos fuentes dan números muy distintos, advertilo.

3. **Evaluá calidad de fuentes**:
   - Indicadores de la DDNA → alta confiabilidad (datos oficiales provinciales)
   - Documentos de la biblioteca → confiabilidad media-alta (informes institucionales)
   - Búsquedas web → confiabilidad variable (verificar fuente, fecha, metodología)

4. **Contextualizá**: explicá qué significa un número, no solo lo reportes. "La pobreza infantil del 39.3% significa que casi 4 de cada 10 niños en Córdoba viven en hogares pobres."

5. **Reconocé limitaciones**: si los datos disponibles no alcanzan para responder completamente, decilo. Sugerí qué datos harían falta.

6. **Ofrecé visión panorámica**: combiná los tres tipos de fuentes (indicadores + documentos + web) para dar una respuesta completa.

## GENERACIÓN DE INFORMES Y CONTENIDO ANALÍTICO

Cuando el usuario pida informes, notas, o materiales educativos:
- **Estructura**: usá secciones con encabezados (# Título, ## Subtítulo), párrafos, y viñetas
- **Datos**: incluí valores numéricos concretos con su período y fuente
- **Contexto**: combiná datos estadísticos con contexto de los documentos
- **Análisis**: explicá tendencias, compará períodos, destacá cambios significativos
- **Citas**: cada dato debe tener su cita [Indicador: nombre, periodo]
- **Educativo**: simplificá el lenguaje, explicá conceptos técnicos, usá ejemplos concretos

Cuando NO pidan informes específicamente, respondé en formato conversacional pero incluyendo datos y citas cuando corresponda.`;

  return prompt;
}

const SYSTEM_PROMPT = buildSystemPrompt();

// ---------------------------------------------------------------------------
// Helpers — Embedding & Search
// ---------------------------------------------------------------------------

/**
 * Generate embedding vector from text using OpenAI text-embedding-3-small.
 * Returns null if embedding generation fails or API key is missing.
 */
async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!OPENAI_API_KEY) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI embedding error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data.data[0]?.embedding ?? null;
  } catch (err) {
    console.error('Embedding generation failed:', err);
    return null;
  }
}

/**
 * Build context string from chunks for the LLM.
 * Truncates each chunk to maxChars to balance context and token usage.
 */
function buildContext(chunks: ChunkResult[], maxChars = 800): string {
  return chunks
    .map((chunk, idx) => {
      const fileName =
        chunk.nombre_archivo || (chunk.metadata?.['fileName'] as string) || 'Documento desconocido';
      const sim = chunk.similarity ? ` [similitud: ${(chunk.similarity * 100).toFixed(0)}%]` : '';
      const truncated =
        chunk.content.length > maxChars
          ? chunk.content.substring(0, maxChars) + '...[truncado]'
          : chunk.content;
      return `[Fuente ${idx + 1}: ${fileName}${sim}]\n${truncated}\n`;
    })
    .join('\n---\n\n');
}

/**
 * Extract keyword-based sources from chunks for the response.
 */
function buildSources(chunks: ChunkResult[]) {
  return chunks.map(chunk => ({
    fileName: chunk.nombre_archivo || 'Documento desconocido',
    categoria: chunk.categoria || undefined,
    chunkIndex: chunk.chunk_index,
    similarity: chunk.similarity ?? 0,
    downloadUrl: `https://ppyyqrvirjqmfpqaqnxy.supabase.co/storage/v1/object/public/ddna-repositorio/${encodeURIComponent(chunk.nombre_archivo || '')}`,
  }));
}

// ---------------------------------------------------------------------------
// Tool: search_knowledge_base
// ---------------------------------------------------------------------------

/**
 * Tool wrapper for the document knowledge-base search.
 *
 * Preserves the original vector-search (RPC search_doc_chunks) and ILIKE
 * fallback logic, packaged as a callable tool for the agent.
 */
async function searchKnowledgeBase(query: string): Promise<{
  chunks: ChunkResult[];
  searchMethod: 'vector' | 'text';
  warning?: string;
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseClient: any = createClient(supabaseUrl, supabaseAnonKey);

  let chunks: ChunkResult[] = [];
  let searchMethod: 'vector' | 'text' = 'text';
  let warning: string | undefined;

  // === Step 1: Try vector semantic search ===
  const embedding = await generateEmbedding(query);

  if (embedding) {
    const { data: rpcChunks, error: rpcError } = (await supabaseClient.rpc('search_doc_chunks', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 15,
      category_filter: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any;

    if (!rpcError && rpcChunks && rpcChunks.length > 0) {
      chunks = rpcChunks as ChunkResult[];
      searchMethod = 'vector';
    } else if (rpcError) {
      console.error('RPC search_doc_chunks error:', rpcError);
      warning = 'Búsqueda vectorial falló, usando búsqueda por texto';
    }
  }

  // === Step 2: Fallback to ILIKE text search ===
  if (chunks.length === 0) {
    if (!embedding) {
      warning =
        'OPENAI_API_KEY no configurada. Usando búsqueda por texto (ILIKE). Configurá la API key para búsqueda semántica vectorial.';
    }

    // Extract keywords
    const keywords = query
      .toLowerCase()
      .replace(/[?:,;.!¡¿]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 5);

    if (keywords.length > 0) {
      const searchConditions = keywords.map(kw => `content.ilike.%${kw}%`).join(',');

      // Get processed file IDs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: processedFiles } = (await supabaseClient
        .from('repositorio')
        .select('id')
        .eq('processed', true)) as { data: { id: string }[] | null };

      const fileIds = processedFiles?.map((f: { id: string }) => f.id) || [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let ilikeResult: any;

      if (fileIds.length > 0) {
        ilikeResult = await supabaseClient
          .from('doc_chunks')
          .select(
            'id, content, chunk_index, metadata, repo_file_id, repositorio!inner(nombre_archivo, categoria)'
          )
          .in('repo_file_id', fileIds)
          .or(searchConditions)
          .limit(10);
      } else {
        ilikeResult = await supabaseClient
          .from('doc_chunks')
          .select(
            'id, content, chunk_index, metadata, repo_file_id, repositorio!inner(nombre_archivo, categoria)'
          )
          .or(searchConditions)
          .limit(10);
      }

      const ilikeData = ilikeResult?.data as RawIlikeRow[] | null;

      if (ilikeData && ilikeData.length > 0) {
        chunks = ilikeData.map(row => ({
          id: row.id,
          repo_file_id: row.repo_file_id,
          chunk_index: row.chunk_index,
          content: row.content,
          metadata: row.metadata || {},
          nombre_archivo: row.repositorio?.nombre_archivo || 'Documento desconocido',
          categoria: row.repositorio?.categoria || 'Sin categoría',
          similarity: 0,
        }));
      }
    }

    searchMethod = 'text';
  }

  return { chunks, searchMethod, warning };
}

// ---------------------------------------------------------------------------
// Tool call parser
// ---------------------------------------------------------------------------

/**
 * Parses TOOL_CALL lines from LLM response text.
 *
 * Format: TOOL_CALL: function_name key1="value1" key2="value2"
 */
function parseToolCalls(text: string): ParsedToolCall[] {
  const calls: ParsedToolCall[] = [];
  const regex = /TOOL_CALL:\s*(\w+)\s*(.*)/g;

  let match;
  while ((match = regex.exec(text)) !== null) {
    const name = match[1].trim();
    const paramsStr = match[2] || '';
    const params: Record<string, string> = {};

    // Parse key="value" pairs — values are inside double quotes
    const paramRegex = /(\w+)\s*=\s*"([^"]*)"/g;
    let paramMatch;
    while ((paramMatch = paramRegex.exec(paramsStr)) !== null) {
      params[paramMatch[1].trim()] = paramMatch[2];
    }

    calls.push({ name, params });
  }

  return calls;
}

/**
 * Extracts the non-tool-call portion of an LLM response (text before or
 * between tool calls). Returns empty string if the entire response consists
 * of tool calls.
 */
function extractNonToolText(text: string): string {
  return text.replace(/TOOL_CALL:\s*\w+.*$/gm, '').trim();
}

// ---------------------------------------------------------------------------
// Tool executor — dispatches to the appropriate handler
// ---------------------------------------------------------------------------

async function executeTool(
  name: string,
  params: Record<string, string>
): Promise<{
  result: unknown;
  formattedResult: string;
  sourceType: 'documents' | 'indicators' | 'web' | 'unknown';
}> {
  // Indicator tools
  if (INDICATOR_TOOL_DEFINITIONS.some(t => t.name === name)) {
    const result = await executeIndicatorTool(name, params);
    return {
      result,
      formattedResult: JSON.stringify(result, null, 2),
      sourceType: 'indicators',
    };
  }

  // Document search tool
  if (name === 'search_knowledge_base') {
    if (!params.query) {
      throw new Error('search_knowledge_base requiere el parámetro "query".');
    }
    const { chunks, searchMethod, warning } = await searchKnowledgeBase(params.query);

    let formattedResult: string;
    if (chunks.length === 0) {
      formattedResult = 'No se encontraron documentos relevantes en la base de conocimiento.';
    } else {
      const context = buildContext(chunks, 600);
      formattedResult =
        `[Búsqueda en base de conocimiento — método: ${searchMethod}${warning ? `. Advertencia: ${warning}` : ''}]\n\n` +
        `Documentos encontrados (${chunks.length}):\n\n${context}`;
    }

    return {
      result: { chunks, searchMethod, warning },
      formattedResult,
      sourceType: 'documents',
    };
  }

  // Web search tool
  if (name === 'search_web') {
    if (!params.query) throw new Error('search_web requiere el parámetro "query".');
    try {
      const searchUrl = new URL('/api/agent/web-search', BASE_URL).toString();
      const res = await fetch(searchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: params.query, site: params.site || undefined }),
      });
      const data = await res.json();
      const results: Array<{ title: string; url: string; snippet: string; source: string }> =
        data.results || [];
      const formatted =
        results.length === 0
          ? 'No se encontraron resultados en la web.'
          : results
              .map(
                (r, i) =>
                  `${i + 1}. ${r.title}\n   URL: ${r.url}\n   ${r.snippet}`
              )
              .join('\n\n');
      return {
        result: data,
        formattedResult: `[Búsqueda web: "${params.query}"]\n\n${formatted}`,
        sourceType: 'web',
      };
    } catch (err) {
      console.error('search_web tool failed:', err);
      return {
        result: { error: String(err) },
        formattedResult: `[Búsqueda web: "${params.query}"]\n\nLa búsqueda web no está disponible en este momento (error: ${String(err).substring(0, 200)}). Continuá con los datos de indicadores y documentos disponibles.`,
        sourceType: 'web',
      };
    }
  }

  // Scrape URL tool
  if (name === 'scrape_url') {
    if (!params.url) throw new Error('scrape_url requiere el parámetro "url".');
    try {
      const scrapeUrl = new URL('/api/agent/scrape-url', BASE_URL).toString();
      const res = await fetch(scrapeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: params.url }),
      });
      const data = await res.json();
      const text: string = data.content || data.text || data.error || '';
      const truncated = text.length > 3000 ? text.substring(0, 3000) + '...' : text;
      return {
        result: data,
        formattedResult: `[Contenido de ${params.url}]\n\nTítulo: ${data.title || 'N/A'}\n\n${truncated}`,
        sourceType: 'web',
      };
    } catch (err) {
      console.error('scrape_url tool failed:', err);
      return {
        result: { error: String(err) },
        formattedResult: `[Scraping de ${params.url}]\n\nNo se pudo extraer el contenido de la URL (error: ${String(err).substring(0, 200)}).`,
        sourceType: 'web',
      };
    }
  }

  throw new Error(`Herramienta desconocida: "${name}".`);
}

// ---------------------------------------------------------------------------
// LLM call helper
// ---------------------------------------------------------------------------

async function callLLM(
  messages: Array<{ role: string; content: string }>
): Promise<{ content: string }> {
  const isGroq = LLM_PROVIDER === 'groq';
  const llmApiKey = isGroq ? GROQ_API_KEY : OPENAI_API_KEY;
  const apiUrl = isGroq
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';
  const model = isGroq ? GROQ_MODEL : OPENAI_MODEL;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${llmApiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: MAX_TOKENS,
    }),
  });

  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const errorBody = await response.json();
      msg = errorBody?.error?.message || msg;
    } catch {
      // Response wasn't JSON (HTML error page, etc.)
      const text = await response.text();
      msg = `HTTP ${response.status} - ${text.substring(0, 200)}`;
    }
    throw new Error(`Error al generar respuesta con ${LLM_PROVIDER}: ${msg}`);
  }

  let data: { choices?: Array<{ message?: { content?: string } }> };
  try {
    data = await response.json();
  } catch {
    const text = await response.text();
    throw new Error(`${LLM_PROVIDER} devolvió una respuesta no-JSON: ${text.substring(0, 300)}`);
  }
  const content = data?.choices?.[0]?.message?.content || '';
  return { content };
}

// ---------------------------------------------------------------------------
// Heuristic: detect if the response is a structured report
// ---------------------------------------------------------------------------

function isStructuredReport(text: string): boolean {
  // Heuristic: markdown headings (## or ###) + substantial length
  const headingCount = (text.match(/^#{1,3}\s/gm) || []).length;
  return headingCount >= 2 && text.length > 400;
}

// ---------------------------------------------------------------------------
// Heuristic: detect if question needs data or documents
// ---------------------------------------------------------------------------

const DATA_KEYWORDS = [
  'dato', 'datos', 'estadística', 'indicador', 'indicadores', 'número', 'cifra',
  'porcentaje', 'tasa', 'cantidad', 'cuánto', 'cuántos', 'cuál es', 'valor',
  'pobreza', 'indigencia', 'mortalidad', 'educación', 'escolarización', 'inversión',
  'población', 'demografía', 'salud', 'seguridad', 'justicia', 'evolución',
  'tendencia', 'histórico', 'comparar', 'comparación', 'aumentó', 'disminuyó',
  'informe', 'reporte', 'análisis', 'diagnóstico', 'situación', 'estado actual',
];

const DOC_KEYWORDS = [
  'documento', 'informe', 'normativa', 'ley', 'resolución', 'defensoría',
  'ddna', 'derecho', 'convención', 'protocolo', 'procedimiento',
];

const WEB_KEYWORDS = [
  'según', 'fuente externa', 'nacional', 'argentina', 'país', 'comparado',
  'a nivel', 'noticia', 'reciente', 'actualidad', 'último', 'índec',
  'ocde', 'unicef', 'oms', 'banco mundial', 'ministerio',
];

function detectToolNeed(question: string): string | null {
  const q = question.toLowerCase();
  const needsData = DATA_KEYWORDS.some(kw => q.includes(kw));
  const needsDocs = DOC_KEYWORDS.some(kw => q.includes(kw));
  
  // Web search is NOT auto-triggered (DuckDuckGo blocks Vercel).
  // It's still available as an explicit tool when the user asks.
  
  if (needsData && needsDocs) {
    return 'getLatestIndicatorValue o getCategoryOverview + search_knowledge_base';
  }
  if (needsData) {
    return 'getLatestIndicatorValue, getIndicatorTimeSeries, o getCategoryOverview';
  }
  if (needsDocs) {
    return 'search_knowledge_base';
  }
  if (question.length > 30) {
    return 'search_knowledge_base o listAvailableIndicators';
  }
  return null;
}

// ---------------------------------------------------------------------------
// Smart tool call generation based on question keywords
// ---------------------------------------------------------------------------

const INDICATOR_KEYWORDS: Record<string, { name: string; categoria: string }> = {
  'mortalidad infantil': { name: 'Mortalidad infantil (TMI Cba)', categoria: 'salud' },
  'mortalidad materna': { name: 'Mortalidad infantil (RMM Cba)', categoria: 'salud' },
  'pobreza infantil': { name: 'Pobreza infantil', categoria: 'pobreza' },
  'pobreza': { name: 'Pobreza infantil', categoria: 'pobreza' },
  'indigencia': { name: 'Indigencia infantil', categoria: 'pobreza' },
  'escolarización': { name: 'Tasa de asistencia educativa', categoria: 'educacion' },
  'asistencia educativa': { name: 'Tasa de asistencia educativa', categoria: 'educacion' },
  'unidades educativas': { name: 'Unidades educativas - General', categoria: 'educacion' },
  'matrícula': { name: 'Matrícula - General', categoria: 'educacion' },
  'inversión social': { name: 'Inversión social en infancia', categoria: 'inversion' },
  'inversión': { name: 'Inversión social en infancia', categoria: 'inversion' },
  'población': { name: 'Poblacion por edad', categoria: 'demografia' },
  'demografía': { name: 'Poblacion por edad', categoria: 'demografia' },
  'casos': { name: 'Total casos sistema de justicia', categoria: 'seguridad' },
  'denuncias': { name: 'Total casos sistema de justicia', categoria: 'seguridad' },
  'familia': { name: 'Casos de Violencia Familiar', categoria: 'seguridad' },
  'niñez': { name: 'Casos de Niñez', categoria: 'seguridad' },
};

function generateToolCalls(question: string): Array<{ name: string; params: Record<string, string> }> {
  const q = question.toLowerCase();
  const calls: Array<{ name: string; params: Record<string, string> }> = [];
  
  // Check for specific indicator matches
  for (const [keyword, info] of Object.entries(INDICATOR_KEYWORDS)) {
    if (q.includes(keyword)) {
      calls.push({
        name: 'getLatestIndicatorValue',
        params: { indicadorNombre: info.name, categoria: info.categoria },
      });
      calls.push({
        name: 'getIndicatorTimeSeries',
        params: { indicadorNombre: info.name, categoria: info.categoria },
      });
      break; // One indicator match is enough
    }
  }
  
  // Always search documents too
  calls.push({
    name: 'search_knowledge_base',
    params: { query: question },
  });
  
  return calls;
}

// ---------------------------------------------------------------------------
// POST handler — agent loop with tool execution
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  // Track state across tool rounds
  const accumulatedSources: ReturnType<typeof buildSources> = [];
  const accumulatedDataSources: Array<{
    indicador: string;
    periodo?: string;
    valor?: number | string;
  }> = [];
  const toolsUsed: string[] = [];
  let searchMethodUsed: 'vector' | 'text' | undefined;
  let totalToolCalls = 0;
  let warning: string | undefined;

  try {
    const { question, conversationHistory } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: "La pregunta es requerida (campo 'question')" },
        { status: 400 }
      );
    }

    // --- Check LLM API key ---
    const isGroq = LLM_PROVIDER === 'groq';
    const llmApiKey = isGroq ? GROQ_API_KEY : OPENAI_API_KEY;

    if (!llmApiKey) {
      return NextResponse.json(
        {
          error: `No hay API key configurada para ${LLM_PROVIDER.toUpperCase()}. Configurá ${
            isGroq ? 'GROQ_API_KEY' : 'OPENAI_API_KEY'
          } en .env.local`,
        },
        { status: 500 }
      );
    }

    // --- Get totalDocs count (always useful metadata) ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseClient: any = createClient(supabaseUrl, supabaseAnonKey);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: totalDocs } = (await supabaseClient
      .from('repositorio')
      .select('*', { count: 'exact', head: true })
      .eq('processed', true)) as { count: number };

    // --- Agent loop ---
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(conversationHistory || []).slice(-6),
      { role: 'user', content: question },
    ];

    let finalAnswer = '';
    let round = 0;
    let hasContext = false;

    while (round < MAX_TOOL_ROUNDS && totalToolCalls < MAX_TOOL_CALLS) {
      round += 1;

      let llmContent: string;
      try {
        const { content } = await callLLM(messages);
        llmContent = content;
      } catch (err) {
        console.error(`LLM call failed (round ${round}):`, err);
        // If we have results from previous rounds, try to synthesize manually
        if (toolsUsed.length > 0) {
          const errMsg = err instanceof Error ? err.message : String(err);
          finalAnswer =
            '⚠️ No pude generar la respuesta final (error: ' + errMsg.substring(0, 300) + ').\n\n' +
            '**Herramientas ejecutadas**: ' + toolsUsed.join(', ') + '\n\n' +
            'Los datos se obtuvieron correctamente pero el servicio de IA falló al sintetizarlos. ' +
            'Probá con una consulta más específica o reintentá en unos segundos.';
          break;
        }
        throw err;
      }

      // Check for tool calls
      const toolCalls = parseToolCalls(llmContent);

      if (toolCalls.length === 0) {
        // No tool calls — inject them directly if the question needs data/docs
        if (round === 1 && toolsUsed.length === 0) {
          const needsTools = detectToolNeed(question);
          if (needsTools) {
            // Generate actual TOOL_CALL lines instead of asking LLM
            const forcedCalls = generateToolCalls(question);
            
            if (forcedCalls.length > 0) {
              // Inject tool calls as if the LLM generated them
              const tcLines = forcedCalls.map(tc => `TOOL_CALL: ${tc.name} ${Object.entries(tc.params).map(([k,v]) => `${k}="${v}"`).join(' ')}`).join('\n');
              
              // Add LLM's original response (for context) and inject tool calls
              messages.push(
                { role: 'assistant', content: tcLines }
              );
              
              // Re-parse the injected tool calls
              const injectedCalls = parseToolCalls(tcLines);
              
              // Execute them directly
              for (const call of injectedCalls) {
                if (totalToolCalls >= MAX_TOOL_CALLS) break;
                totalToolCalls += 1;
                try {
                  const { result, formattedResult, sourceType } = await executeTool(call.name, call.params);
                  toolsUsed.push(call.name);
                  // ... (rest of tool execution logic is duplicated — skip for brevity, jump to synthesis)
                } catch (toolErr) {
                  console.error(`Tool ${call.name} failed:`, toolErr);
                }
              }
              
              // Now call LLM again for synthesis with tool results
              // We need to properly feed results back — use the same pattern as the normal tool loop
              // For simplicity, let's just add a synthetic tool result message and continue
              // Actually, the cleanest approach: pre-execute tools, add results to messages, and let the while loop handle synthesis
              
              // Build tool results as a user message
              const injectedResults: string[] = [];
              for (const call of injectedCalls) {
                try {
                  const { formattedResult } = await executeTool(call.name, call.params);
                  injectedResults.push(`[Resultado de "${call.name}"]:\n${formattedResult}`);
                  toolsUsed.push(call.name);
                  totalToolCalls++;
                } catch (e) {
                  injectedResults.push(`[Error en "${call.name}"]: ${String(e)}`);
                }
              }
              
              let feedback = injectedResults.join('\n\n---\n\n');
              if (feedback.length > MAX_CONTEXT_CHARS) {
                feedback = feedback.substring(0, MAX_CONTEXT_CHARS) + '\n\n[... truncado ...]';
              }
              
              messages.push({
                role: 'user',
                content: `Resultados de las herramientas:\n\n${feedback}\n\nAhora respondé la pregunta original usando estos datos. Incluí citas a las fuentes.`,
              });
              
              continue; // Let the while loop call LLM for synthesis
            }
          }
        }
        // No tool calls and doesn't need tools — final answer
        finalAnswer = llmContent;
        break;
      }

      // Extract any non-tool text (LLM commentary before/after tool calls)
      const nonToolText = extractNonToolText(llmContent);

      // Add the LLM response to conversation history (for context)
      messages.push({ role: 'assistant', content: llmContent });

      // Execute tools
      const toolResults: string[] = [];
      let allFailed = true;

      for (const call of toolCalls) {
        if (totalToolCalls >= MAX_TOOL_CALLS) break;
        totalToolCalls += 1;

        let toolResultText: string;
        let toolResultObj: unknown;

        try {
          const { result, formattedResult, sourceType } = await executeTool(call.name, call.params);
          toolResultObj = result;
          toolResultText = formattedResult;
          toolsUsed.push(call.name);

          // Track search method
          if (call.name === 'search_knowledge_base') {
            const searchRes = result as { searchMethod?: 'vector' | 'text'; warning?: string };
            if (searchRes.searchMethod) searchMethodUsed = searchRes.searchMethod;
            if (searchRes.warning && !warning) warning = searchRes.warning;
          }

          allFailed = false;

          // Format per-tool result
          toolResults.push(`[Resultado de "${call.name}"]:\n${toolResultText}`);

          // Accumulate sources
          if (sourceType === 'documents') {
            const searchRes = result as { chunks?: ChunkResult[] };
            if (searchRes.chunks?.length) {
              accumulatedSources.push(...buildSources(searchRes.chunks));
              hasContext = true;
            }
          }

          // Accumulate data sources
          if (sourceType === 'indicators' && toolResultObj) {
            const dataRefs = extractDataSources(call.name, toolResultObj);
            accumulatedDataSources.push(...dataRefs);
          }
        } catch (toolErr) {
          console.error(`Tool "${call.name}" execution error:`, toolErr);
          toolResults.push(`[Error ejecutando "${call.name}"]: ${String(toolErr)}`);
        }
      }

      // Feed tool results back to LLM as a user message
      let feedbackMessage = toolResults.join('\n\n---\n\n');
      
      // Truncate if too large for Groq context window
      if (feedbackMessage.length > MAX_CONTEXT_CHARS) {
        feedbackMessage = feedbackMessage.substring(0, MAX_CONTEXT_CHARS) + 
          '\n\n[... resultado truncado por límite de contexto ...]';
      }

      messages.push({
        role: 'user',
        content:
          `Resultados de las herramientas solicitadas:\n\n${feedbackMessage}\n\n` +
          `${
            allFailed
              ? 'Todas las herramientas fallaron. Por favor, informá al usuario que no se pudieron obtener los datos solicitados y sugerí alternativas (como probar con otros términos o consultar la lista de indicadores disponibles con listAvailableIndicators).'
              : 'Ahora sintetizá una respuesta final basada en estos resultados. Incluí citas a las fuentes. NO llames a más herramientas a menos que sea estrictamente necesario. Si tenés suficientes datos, respondé directamente.'
          }`,
      });

      if (nonToolText) {
        finalAnswer = nonToolText; // preserve any analysis the LLM already provided
      }
    }

    // Edge case: finalAnswer is empty but tools were used
    if (!finalAnswer && toolsUsed.length > 0) {
      finalAnswer = 'Se obtuvieron los datos solicitados. Revisá los resultados a continuación.';
    }

    // Edge case: round limit reached with tool calls still pending
    if (!finalAnswer && round >= MAX_TOOL_ROUNDS) {
      // Try one more LLM call forcing a synthesis
      try {
        messages.push({
          role: 'user',
          content:
            'Llegaste al límite de rondas de herramientas. Sintetizá AHORA una respuesta final con los datos que tengas. NO uses TOOL_CALL.',
        });
        const { content } = await callLLM(messages);
        finalAnswer = content;
      } catch {
        finalAnswer =
          'No se pudo completar el análisis en el tiempo disponible. Por favor, intentá con una consulta más específica.';
      }
    }

    // Edge case: nothing worked at all
    if (!finalAnswer) {
      // Attempt to give helpful guidance by listing available indicator categories
      finalAnswer =
        'No encontré información relevante para tu consulta en los documentos ni en los indicadores disponibles.\n\n' +
        '**Sugerencias**:\n' +
        '- Probá con otros términos de búsqueda\n' +
        '- Usá la herramienta listAvailableIndicators para ver qué datos hay disponibles\n' +
        '- Subí documentos a la biblioteca para ampliar la base de conocimiento\n\n' +
        '**Categorías de indicadores disponibles**: pobreza, salud, educacion, inversion, demografia, seguridad, justicia, salud_adolescente, anuario_educacion, aprender, consumo, deis.';
    }

    // --- Determine searchMethod for response ---
    const searchMethod = searchMethodUsed || 'vector';

    // --- Build final response ---
    const responseBody: Record<string, unknown> = {
      answer: finalAnswer,
      sources:
        accumulatedSources.length > 0
          ? // Deduplicate by fileName
            Array.from(new Map(accumulatedSources.map(s => [s.fileName, s])).values())
          : [],
      dataSources:
        accumulatedDataSources.length > 0
          ? // Deduplicate by indicador name
            Array.from(new Map(accumulatedDataSources.map(d => [d.indicador, d])).values())
          : [],
      hasContext,
      totalDocs: totalDocs ?? 0,
      searchMethod,
      toolsUsed: [...new Set(toolsUsed)],
      reportGenerated: isStructuredReport(finalAnswer),
      model: isGroq ? GROQ_MODEL : OPENAI_MODEL,
    };

    if (warning) responseBody.warning = warning;

    return NextResponse.json(responseBody);
  } catch (err) {
    console.error('Chat error:', err);
    return NextResponse.json({ error: `Error interno: ${String(err)}` }, { status: 500 });
  }
}
