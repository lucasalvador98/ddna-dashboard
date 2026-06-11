/** 
 * POST /api/repositorio/chat — Agent con Function Calling Nativo
 *
 * Usa OpenAI function calling API en vez de parsear TOOL_CALL: textual.
 * El LLM decide CUÁNDO y CON QUÉ PARÁMETROS llamar cada tool.
 *
 * Tools disponibles:
 *   - Indicadores: listAvailableIndicators, getLatestIndicatorValue,
 *                  getIndicatorTimeSeries, getCategoryOverview, getIndicatorBreakdown
 *   - Documentos:  search_knowledge_base, listAllDocuments
 *   - Web:         search_web, scrape_url
 *
 * Modelo: gpt-4o-mini
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  executeIndicatorTool,
  extractDataSources,
  INDICATOR_OPENAPI_TOOLS,
} from '@/lib/agent/indicator-tools';
import { searchWeb } from '@/lib/agent/web-search';
import { scrapeUrl } from '@/lib/agent/scrape-url';
import { withRateLimit } from '@/lib/agent/rate-limit';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = 'gpt-4o-mini';

const MAX_TOOL_ROUNDS = 4;
const MAX_TOOL_CALLS = 8;
const MAX_TOKENS = 2000;
const MAX_CONTEXT_CHARS = 20000;


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

// ---------------------------------------------------------------------------
// OpenAI-compatible tool definitions (documentos + web)
// ---------------------------------------------------------------------------

const DOCUMENT_TOOLS: Array<{
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}> = [
  {
    type: 'function',
    function: {
      name: 'search_knowledge_base',
      description:
        'Busca en la base de conocimiento de la DDNA (documentos oficiales, informes, normativas, PDFs, encuestas) usando búsqueda semántica. Devuelve fragmentos relevantes con su fuente. Usala para preguntas que requieran información de documentos o contexto institucional.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'La consulta de búsqueda en lenguaje natural. Cuanto más específica, mejores resultados.',
          },
          max_results: {
            type: 'number',
            description:
              'Cantidad máxima de fragmentos a retornar (default: 10, máximo: 20).',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'listAllDocuments',
      description:
        'Lista todos los documentos disponibles en el repositorio de la DDNA. Devuelve nombre, tipo, categoría, y estado de procesamiento. Usala cuando el usuario pregunte "¿qué documentos tenés?", "mostrame los archivos disponibles", o "qué información hay cargada?".',
      parameters: {
        type: 'object',
        properties: {
          categoria: {
            type: 'string',
            description:
              'Filtrar por categoría (opcional). Ej: "salud", "educacion", "pobreza", "inversion", "seguridad".',
          },
          processed: {
            type: 'boolean',
            description:
              'Filtrar solo documentos procesados (true) o solo pendientes (false). Default: todos.',
          },
        },
        required: [],
      },
    },
  },
];

const WEB_TOOLS: Array<{
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}> = [
  {
    type: 'function',
    function: {
      name: 'search_web',
      description:
        'Busca en internet (DuckDuckGo) información actualizada. Usala para obtener datos externos, noticias recientes, estadísticas nacionales, o información que no está en los documentos ni indicadores de la DDNA. Importante: NO funciona desde Vercel (DuckDuckGo bloquea).',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'La consulta de búsqueda.',
          },
          site: {
            type: 'string',
            description:
              'Limitar a un dominio específico (opcional). Ej: "indec.gob.ar", "unicef.org".',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'scrape_url',
      description:
        'Extrae el contenido completo de una página web. Usala cuando necesites leer en detalle un artículo, informe o fuente específica encontrada en la búsqueda web.',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'La URL completa de la página a extraer.',
          },
        },
        required: ['url'],
      },
    },
  },
];

// Tool combinado para pasar a la API
const ALL_TOOLS = [
  ...INDICATOR_OPENAPI_TOOLS,
  ...DOCUMENT_TOOLS,
  ...WEB_TOOLS,
];

// ---------------------------------------------------------------------------
// System Prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `Sos un asistente de la Defensoría de Niños, Niñas y Adolescentes de Córdoba (DDNA). Ayudás combinando datos estadísticos y documentos oficiales.

## Reglas
1. Respondé SIEMPRE en español, tono profesional pero accesible.
2. Basate SOLO en los datos recibidos de las herramientas — NO inventes cifras ni fuentes.
3. Citá las fuentes de donde sacaste la información: [Fuente: nombre_archivo] para documentos, [Indicador: nombre, periodo] para datos.
4. Si encontraste información en múltiples fuentes, contextualizala y explicá qué significa. No te limites a repetir datos.
5. Si los datos no alcanzan para responder, decilo con honestidad y sugerí cómo obtener mejor información.
6. Cuando te pregunten "¿qué documentos tenés?" o similares, usá listAllDocuments.
7. SIEMPRE que necesites datos actuales o históricos de indicadores, usá las herramientas disponibles. No intentes responder de memoria.`;

// ---------------------------------------------------------------------------
// Helpers — Embedding & Search
// ---------------------------------------------------------------------------

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
// Tools — Document Search
// ---------------------------------------------------------------------------

async function searchKnowledgeBase(query: string): Promise<{
  chunks: ChunkResult[];
  searchMethod: 'vector' | 'text';
  warning?: string;
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseClient: any = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  let chunks: ChunkResult[] = [];
  let searchMethod: 'vector' | 'text' = 'text';
  let warning: string | undefined;

  // Step 1: Vector semantic search
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

  // Step 2: Fallback to ILIKE text search
  if (chunks.length === 0) {
    if (!embedding) {
      warning = 'OPENAI_API_KEY no configurada. Usando búsqueda por texto (ILIKE).';
    }

    const keywords = query
      .toLowerCase()
      .replace(/[?:,;.!¡¿]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 5);

    if (keywords.length > 0) {
      const searchConditions = keywords.map(kw => `content.ilike.%${kw}%`).join(',');

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
// Tools — listAllDocuments
// ---------------------------------------------------------------------------

async function listAllDocuments(
  categoria?: string,
  processed?: boolean
): Promise<{
  documentos: Array<{
    id: string;
    nombre: string;
    tipo: string;
    categoria: string;
    procesado: boolean;
    chunks: number;
    fecha: string;
    tamano: number | null;
  }>;
  total: number;
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseClient: any = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  let query = supabaseClient
    .from('repositorio')
    .select('id, nombre_archivo, tipo_documento, categoria, processed, total_chunks, fecha_subida, tamano_bytes')
    .order('fecha_subida', { ascending: false });

  if (categoria) {
    query = query.eq('categoria', categoria);
  }
  if (processed !== undefined) {
    query = query.eq('processed', processed);
  }

  const { data, error } = await query;

  if (error) {
    console.error('listAllDocuments error:', error);
    throw new Error('Error al listar documentos.');
  }

  const docs = (data || []).map((d: Record<string, unknown>) => ({
    id: d.id as string,
    nombre: d.nombre_archivo as string,
    tipo: (d.tipo_documento as string) || 'desconocido',
    categoria: (d.categoria as string) || 'sin categoría',
    procesado: (d.processed as boolean) || false,
    chunks: (d.total_chunks as number) || 0,
    fecha: (d.fecha_subida as string) || '',
    tamano: d.tamano_bytes as number | null,
  }));

  return {
    documentos: docs,
    total: docs.length,
  };
}

// ---------------------------------------------------------------------------
// Tool dispatcher
// ---------------------------------------------------------------------------

/**
 * Ejecuta un tool call y devuelve resultado formateado + metadatos.
 */
async function executeToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<{
  formattedResult: string;
  sourceType: 'documents' | 'indicators' | 'web' | 'unknown';
  chunks?: ChunkResult[];
  indicatorResult?: unknown;
}> {
  // --- Indicadores ---
  if (INDICATOR_OPENAPI_TOOLS.some(t => t.function.name === name)) {
    const stringParams: Record<string, string> = {};
    for (const [k, v] of Object.entries(args)) {
      stringParams[k] = String(v);
    }
    const result = await executeIndicatorTool(name, stringParams);
    return {
      formattedResult: JSON.stringify(result, null, 2),
      sourceType: 'indicators',
      indicatorResult: result,
    };
  }

  // --- Documentos ---
  if (name === 'search_knowledge_base') {
    const query = String(args.query || '');
    const { chunks, searchMethod, warning } = await searchKnowledgeBase(query);

    let formattedResult: string;
    if (chunks.length === 0) {
      formattedResult = 'No se encontraron documentos relevantes en la base de conocimiento.';
    } else {
      const context = buildContext(chunks, 600);
      formattedResult =
        `[Búsqueda en documentos — método: ${searchMethod}]\n\n` +
        `Fragmentos encontrados (${chunks.length}):\n\n${context}`;
    }
    if (warning) {
      formattedResult += `\n\nAdvertencia: ${warning}`;
    }

    return { formattedResult, sourceType: 'documents', chunks };
  }

  if (name === 'listAllDocuments') {
    const categoria = args.categoria ? String(args.categoria) : undefined;
    const processed = args.processed !== undefined ? Boolean(args.processed) : undefined;
    const result = await listAllDocuments(categoria, processed);

    if (result.total === 0) {
      return {
        formattedResult: 'No hay documentos disponibles' + (categoria ? ` en la categoría "${categoria}".` : '.'),
        sourceType: 'documents',
      };
    }

    const header = `📚 Documentos disponibles (${result.total}):\n\n`;
    const lines = result.documentos.map(d => {
      const proc = d.procesado ? '✅ Indexado' : '⏳ Pendiente';
      const chunks = d.chunks > 0 ? `, ${d.chunks} chunks` : '';
      return `- **${d.nombre}** (${d.tipo}) — ${d.categoria} — ${proc}${chunks}`;
    });
    const stats = `\n\n**Procesados**: ${result.documentos.filter(d => d.procesado).length} | **Pendientes**: ${result.documentos.filter(d => !d.procesado).length}`;

    return {
      formattedResult: header + lines.join('\n') + stats,
      sourceType: 'documents',
    };
  }

  // --- Web ---
  if (name === 'search_web') {
    const query = String(args.query || '');
    const site = args.site ? String(args.site) : undefined;
    try {
      const data = await searchWeb(query, 10, site);
      const results = data.results ?? [];
      const formatted =
        results.length === 0
          ? 'No se encontraron resultados en la web.'
          : results
              .map(
                (r, i) => `${i + 1}. ${r.title}\n   URL: ${r.url}\n   ${r.snippet}`
              )
              .join('\n\n');
      return {
        formattedResult: `[Búsqueda web: "${query}"]\n\n${formatted}`,
        sourceType: 'web',
      };
    } catch (err) {
      return {
        formattedResult: `[Búsqueda web: "${query}"]\n\nLa búsqueda web no está disponible en este momento (error: ${String(err).substring(0, 200)}).`,
        sourceType: 'web',
      };
    }
  }

  if (name === 'scrape_url') {
    const url = String(args.url || '');
    try {
      const data = await scrapeUrl(url, 'text', 3000);
      const text: string = data.content || '';
      const truncated = text.length > 3000 ? text.substring(0, 3000) + '...' : text;
      return {
        formattedResult: `[Contenido de ${url}]\n\nTítulo: ${data.title || 'N/A'}\n\n${truncated}`,
        sourceType: 'web',
      };
    } catch (err) {
      return {
        formattedResult: `[Scraping de ${url}]\n\nNo se pudo extraer el contenido (error: ${String(err).substring(0, 200)}).`,
        sourceType: 'web',
      };
    }
  }

  throw new Error(`Tool desconocida: "${name}".`);
}

// ---------------------------------------------------------------------------
// LLM call helper (with function calling support)
// ---------------------------------------------------------------------------

type LLMMessage = {
  role: string;
  content?: string | null;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
};

async function callLLM(
  messages: LLMMessage[],
  tools?: Array<{
    type: 'function';
    function: { name: string; description: string; parameters: Record<string, unknown> };
  }>
): Promise<{
  content: string | null;
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
}> {
  const llmApiKey = OPENAI_API_KEY;
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const model = OPENAI_MODEL;

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0.3,
    max_tokens: MAX_TOKENS,
  };

  // Solo pasar tools si hay definidas
  if (tools && tools.length > 0) {
    body.tools = tools;
    body.tool_choice = 'auto';
  }

  // Retry logic for rate limits (up to 3 attempts with exponential backoff)
  let lastError: Error | null = null;
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      // Esperar antes de reintentar: 1s, 3s, 7s
      const delay = Math.pow(2, attempt + 1) * 1000 - 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${llmApiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        // Success — parse and return
        let data: {
          choices?: Array<{
            message?: {
              content?: string | null;
              tool_calls?: Array<{
                id: string;
                type: 'function';
                function: { name: string; arguments: string };
              }>;
            };
          }>;
        };
        try {
          data = await response.json();
        } catch {
          const text = await response.text();
          throw new Error(`OpenAI devolvió una respuesta no-JSON: ${text.substring(0, 300)}`);
        }

        const message = data?.choices?.[0]?.message;
        return {
          content: message?.content ?? null,
          toolCalls: message?.tool_calls,
        };
      }

      // Try to extract error message
      let msg = `HTTP ${response.status}`;
      try {
        const errorBody = await response.json();
        msg = errorBody?.error?.message || msg;
      } catch {
        const text = await response.text();
        msg = `HTTP ${response.status} - ${text.substring(0, 200)}`;
      }

      // If it's a rate limit error, retry; otherwise throw immediately
      const isRateLimit =
        response.status === 429 ||
        msg.toLowerCase().includes('rate limit') ||
        msg.toLowerCase().includes('rate_limit') ||
        msg.toLowerCase().includes('tokens per minute');

      if (!isRateLimit) {
        throw new Error(`Error al generar respuesta con OpenAI: ${msg}`);
      }

      lastError = new Error(`Error al generar respuesta con OpenAI: ${msg}`);
      console.warn(
        `Rate limit (attempt ${attempt + 1}/${maxRetries}): ${msg}`
      );
      // Continue to next attempt
    } catch (err) {
      if (err instanceof Error && (
        err.message.includes('Rate limit') ||
        err.message.includes('rate limit') ||
        err.message.includes('rate_limit')
      )) {
        lastError = err;
        console.warn(`Rate limit (attempt ${attempt + 1}/${maxRetries})`);
        continue;
      }
      throw err; // Non-rate-limit errors propagate immediately
    }
  }

  throw lastError || new Error(`Error al generar respuesta con OpenAI: max retries exceeded`);
}

// ---------------------------------------------------------------------------
// Cached doc count (avoids SELECT count(*) on every chat request)
// ---------------------------------------------------------------------------

interface DocCountCache {
  count: number;
  expiresAt: number;
}

let docCountCache: DocCountCache | null = null;
const DOC_COUNT_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getCachedDocCount(supabaseClient: unknown): Promise<number> {
  const now = Date.now();
  if (docCountCache && now < docCountCache.expiresAt) {
    return docCountCache.count;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = (await (supabaseClient as any)
      .from('repositorio')
      .select('*', { count: 'exact', head: true })
      .eq('processed', true)) as { count: number };
    docCountCache = { count: count ?? 0, expiresAt: now + DOC_COUNT_TTL_MS };
    return docCountCache.count;
  } catch {
    return docCountCache?.count ?? 0;
  }
}

// ---------------------------------------------------------------------------
// POST handler — function calling loop
// ---------------------------------------------------------------------------

async function handleChatPOST(request: Request) {
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
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: 'No hay API key configurada para OPENAI. Configurá OPENAI_API_KEY en .env.local',
        },
        { status: 500 }
      );
    }

    // --- Agent loop with function calling ---
    // Los mensajes de tool results se agregan dinámicamente
    const messages: LLMMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(conversationHistory || []).slice(-6),
      { role: 'user', content: question },
    ];

    let finalAnswer = '';
    let round = 0;

    while (round < MAX_TOOL_ROUNDS && totalToolCalls < MAX_TOOL_CALLS) {
      round += 1;

      let response;
      try {
        response = await callLLM(messages, ALL_TOOLS);
      } catch (err) {
        console.error(`LLM call failed (round ${round}):`, err);
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

      // Si el LLM devolvió texto (no tool calls), es la respuesta final
      if (!response.toolCalls || response.toolCalls.length === 0) {
        finalAnswer = response.content || '';
        break;
      }

      // --- El LLM pidió ejecutar tools ---
      // OpenAI requiere que los mensajes 'tool' respondan a un mensaje 'assistant' con tool_calls.
      // Agregamos el mensaje del assistant ANTES de los resultados de las tools.
      messages.push({
        role: 'assistant',
        content: response.content ?? null,
        tool_calls: response.toolCalls.map(tc => ({
          id: tc.id,
          type: 'function' as const,
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments,
          },
        })),
      });

      const toolResults: string[] = [];
      let allFailed = true;

      for (const toolCall of response.toolCalls) {
        if (totalToolCalls >= MAX_TOOL_CALLS) break;
        totalToolCalls += 1;

        const toolName = toolCall.function.name;
        let toolArgs: Record<string, unknown> = {};

        try {
          toolArgs = JSON.parse(toolCall.function.arguments);
        } catch {
          toolArgs = {};
        }

        try {
          const { formattedResult, sourceType, chunks, indicatorResult } = await executeToolCall(
            toolName,
            toolArgs
          );

          toolsUsed.push(toolName);
          allFailed = false;

          // Truncar si excede el límite de contexto
          let truncatedResult = formattedResult;
          if (truncatedResult.length > MAX_CONTEXT_CHARS) {
            truncatedResult = truncatedResult.substring(0, MAX_CONTEXT_CHARS) +
              '\n\n[... resultado truncado por límite de contexto ...]';
          }

          toolResults.push(`[Resultado de "${toolName}"]:\n${truncatedResult}`);

          // Agregar resultado como mensaje tool (function calling nativo)
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: truncatedResult,
          });

          // Acumular fuentes
          if (sourceType === 'documents' && chunks) {
            accumulatedSources.push(...buildSources(chunks));
          }

          // Acumular fuentes de indicadores
          if (sourceType === 'indicators' && indicatorResult) {
            const dataRefs = extractDataSources(toolName, indicatorResult);
            accumulatedDataSources.push(...dataRefs);
          }

          // Track search method
          if (toolName === 'search_knowledge_base' && chunks) {
            // El search method se infiere de los chunks (no tenemos el flag directo aquí)
            // Se puede mejorar si searchKnowledgeBase devuelve el método
          }
        } catch (toolErr) {
          console.error(`Tool "${toolName}" execution error:`, toolErr);
          const errorMsg = `[Error ejecutando "${toolName}"]: ${String(toolErr)}`;
          toolResults.push(errorMsg);

          // Aún así agregamos el resultado para que el LLM sepa que falló
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: `Error: ${String(toolErr).substring(0, 500)}`,
          });
        }
      }

      // Si todas las tools fallaron, damos una instrucción clara
      if (allFailed) {
        messages.push({
          role: 'user',
          content:
            'Todas las herramientas fallaron. Informá al usuario que no se pudieron obtener los datos y sugerí alternativas. NO intentes llamar herramientas de nuevo.',
        });
      } else {
        // Instrucción suave para que el LLM intente sintetizar
        // (no forzamos, el LLM puede decidir llamar más tools si lo necesita)
        if (totalToolCalls < MAX_TOOL_CALLS) {
          messages.push({
            role: 'user',
            content:
              'Si ya tenés suficiente información con estos resultados, sintetizá la respuesta final. Si necesitás más datos, podés llamar otras herramientas.',
          });
        }
      }

      // Si tenemos tool results en el último round, no vamos a tener otra oportunidad
      if (toolResults.length > 0 && round >= MAX_TOOL_ROUNDS - 1) {
        messages.push({
          role: 'user',
          content:
            'Llegaste al límite de rondas. Sintetizá AHORA una respuesta final con los datos que tengas. NO uses herramientas.',
        });
      }
    }

    // --- Edge cases ---
    if (!finalAnswer && toolsUsed.length > 0) {
      // Último intento: forzar síntesis sin tools
      try {
        messages.push({
          role: 'user',
          content:
            'Sintetizá AHORA una respuesta final con todos los datos disponibles. NO uses herramientas.',
        });
        const { content } = await callLLM(messages);
        finalAnswer = content || '';
      } catch {
        finalAnswer =
          'No se pudo completar el análisis en el tiempo disponible. Por favor, intentá con una consulta más específica.';
      }
    }

    if (!finalAnswer) {
      finalAnswer =
        'No encontré información relevante para tu consulta en los documentos ni en los indicadores disponibles.\n\n' +
        '**Sugerencias**:\n' +
        '- Probá con otros términos de búsqueda\n' +
        '- Usá la herramienta listAvailableIndicators para ver qué datos hay disponibles\n' +
        '- Subí documentos a la biblioteca para ampliar la base de conocimiento\n\n' +
        '**Categorías de indicadores disponibles**: pobreza, salud, educacion, inversion, demografia, seguridad, justicia, salud_adolescente, anuario_educacion, aprender, consumo, deis.';
    }

    // --- Contar documentos procesados (cacheado 5 min) ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseClient: any = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const totalDocs = await getCachedDocCount(supabaseClient);

    // --- Build final response ---
    const responseBody: Record<string, unknown> = {
      answer: finalAnswer,
      sources:
        accumulatedSources.length > 0
          ? Array.from(new Map(accumulatedSources.map(s => [s.fileName, s])).values())
          : [],
      dataSources:
        accumulatedDataSources.length > 0
          ? Array.from(new Map(accumulatedDataSources.map(d => [d.indicador, d])).values())
          : [],
      hasContext: accumulatedSources.length > 0,
      totalDocs: totalDocs ?? 0,
      searchMethod: searchMethodUsed || 'vector',
      toolsUsed: [...new Set(toolsUsed)],
      reportGenerated: (finalAnswer.match(/^#{1,3}\s/gm) || []).length >= 2 && finalAnswer.length > 400,
      model: OPENAI_MODEL,
      functionCalling: true,
    };

    if (warning) responseBody.warning = warning;

    return NextResponse.json(responseBody);
  } catch (err) {
    console.error('Chat error:', err);
    return NextResponse.json({ error: `Error interno: ${String(err)}` }, { status: 500 });
  }
}

// Exported with rate limiting (30 requests/min per IP)
export const POST = withRateLimit(handleChatPOST, {
  maxRequests: 30,
  windowMs: 60_000,
  keyPrefix: 'repositorio-chat',
});
