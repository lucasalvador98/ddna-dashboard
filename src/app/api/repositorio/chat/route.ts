/** 
 * POST /api/repositorio/chat — Agent con Function Calling Nativo + SSE Streaming
 *
 * Usa OpenAI function calling API en vez de parsear TOOL_CALL textual.
 * El LLM decide CUÁNDO y CON QUÉ PARÁMETROS llamar cada tool.
 *
 * Tools disponibles:
 *   - Indicadores: listAvailableIndicators, getLatestIndicatorValue,
 *                  getIndicatorTimeSeries, getCategoryOverview, getIndicatorBreakdown,
 *                  searchIndicators
 *   - Documentos:  searchKnowledgeBase, listAllDocuments
 *   - Web:         searchWeb, scrapeUrl
 *
 * Modelo: configurable via OPENAI_CHAT_MODEL (default gpt-6-luna)
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  executeIndicatorTool,
  extractDataSources,
  INDICATOR_OPENAPI_TOOLS,
  listAvailableIndicators,
} from '@/lib/agent/indicator-tools';
import { searchWeb } from '@/lib/agent/web-search';
import { scrapeUrl } from '@/lib/agent/scrape-url';
import { withRateLimit } from '@/lib/agent/rate-limit';
import { checkAdminAuth } from '@/lib/auth-guard';
import { trackLLMUsage } from '@/lib/usage-tracker';
import {
  CHAT_API_KEY,
  CHAT_MODEL,
  CHAT_TIMEOUT_MS,
  chatProviderBody,
  EMBEDDING_API_KEY,
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL,
  EMBEDDING_TIMEOUT_MS,
  FALLBACK_MODEL,
  FALLBACK_REASONING_EFFORT,
  FALLBACK_TIMEOUT_MS,
  embeddingsUrl,
} from '@/lib/ai-config';
import { fetchChatCompletion } from '@/lib/ai/chat-client';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const OPENAI_MODEL = CHAT_MODEL;

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

interface SearchOptions {
  categoria?: string;
  maxChunks?: number;
  maxTokens?: number;
}

// ---------------------------------------------------------------------------
// Tool display names for SSE progress events
// ---------------------------------------------------------------------------

const TOOL_DISPLAY_NAMES: Record<string, string> = {
  searchKnowledgeBase: 'Buscando documentos...',
  listAllDocuments: 'Listando documentos disponibles...',
  searchWeb: 'Buscando en la web...',
  scrapeUrl: 'Extrayendo contenido web...',
};

function getToolDisplayName(name: string): string {
  if (INDICATOR_OPENAPI_TOOLS.some(t => t.function.name === name)) {
    return 'Consultando indicadores...';
  }
  return TOOL_DISPLAY_NAMES[name] || `Ejecutando ${name}...`;
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
      name: 'searchKnowledgeBase',
      description:
        'Búsqueda SEMÁNTICA en documentos oficiales, informes, normativas, PDFs y encuestas de la DDNA. Usá ESTA para preguntas sobre documentos específicos, archivos subidos, informes, o "buscar en documentos". NO la uses para datos de indicadores — usá searchIndicators o las herramientas de indicadores.',
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
          categoria: {
            type: 'string',
            description:
              'Filtrar por categoría (opcional). Ej: "salud", "educacion", "pobreza", "inversion", "seguridad".',
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
        'Lista TODOS los documentos/archivos subidos al repositorio de la DDNA. Devuelve nombre, tipo, categoría y estado de procesamiento. Usala ÚNICAMENTE cuando el usuario pregunte "¿qué documentos tenés?", "mostrame los archivos disponibles", o quiera saber qué PDFs/informes hay cargados.',
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
          limit: {
            type: 'number',
            description:
              'Cantidad máxima de documentos a listar (default: 100, máximo: 500).',
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
      name: 'searchWeb',
      description:
        'Busca en INTERNET (DuckDuckGo) información ACTUALIZADA en tiempo real. Usala SOLO cuando necesites información actual/noticias que NO está en indicadores (getLatestIndicatorValue, etc) ni en documentos del repositorio (searchKnowledgeBase). También cuando el usuario pida explícitamente "noticias" o "información actual". Limitación: puede no funcionar desde entornos serverless.',
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
      name: 'scrapeUrl',
      description:
        'Extrae el contenido completo de una URL específica. Usala DESPUÉS de searchWeb para leer en detalle un artículo, informe o fuente que encontraste. También cuando el usuario provea una URL directamente. Solo HTTP/HTTPS públicos; no acepta hosts locales o privados.',
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

const SYSTEM_PROMPT = `Sos el asistente de investigación de la Defensoría de Niños, Niñas y Adolescentes de Córdoba (DDNA). Respondés combinando datos estadísticos, documentos oficiales y, como último recurso, búsqueda web.

## FUENTES DE DATOS (en orden de prioridad)

1. **INDICADORES** (tabla \`indicadores\`): datos numéricos por periodo. El catálogo de categorías con datos cargados se inyecta automáticamente en tu contexto.
2. **DOCUMENTOS** (\`doc_chunks\`): PDFs, informes, normativas y encuestas del repositorio.
3. **WEB**: información actual externa. Solo cuando las dos fuentes anteriores no alcancen.

## WORKFLOW

**Preguntas sobre datos o indicadores:**
1. Identificá la categoría del tema.
2. Si no sabés qué indicadores existen, usá \`listAvailableIndicators\` o \`searchIndicators\` con el tema.
3. Consultá con \`getLatestIndicatorValue\` (valor actual), \`getIndicatorTimeSeries\` (evolución), \`getCategoryOverview\` (panorama de una categoría) o \`getIndicatorBreakdown\` (desglose por grupo/región).
4. Si no hay indicadores relevantes, pasá a documentos con \`searchKnowledgeBase\`.
5. Solo si ambas fuentes fallan, usá \`searchWeb\`.

**Preguntas sobre documentos o archivos:**
- "¿Qué documentos tenés?" / "mostrame los archivos" → \`listAllDocuments\` directamente, SIN consultar indicadores.
- Preguntas sobre el contenido de un informe, normativa o encuesta → \`searchKnowledgeBase\` directamente, SIN pasar por indicadores.
- Si el usuario provee una URL → \`scrapeUrl\` directo.

**Desambiguación de prioridad:**
- Si la pregunta menciona sustancias, drogas o consumo problemático → consultá primero las categorías \`consumo\` y \`encuestas_2024\` de indicadores.
- Si menciona "consumo" en sentido económico (hogares, canastas, IPC) → usá \`precios\` o \`canastas\`, NO \`consumo\`.
- Si la pregunta es conceptual o de definiciones (ej: "¿qué es el INDEC?") y las fuentes no la cubren, respondé con conocimiento general y aclaralo explícitamente. NO inventes cifras.

## LÍMITES DE BÚSQUEDA

- Máximo 2 intentos por fuente. Si una búsqueda no devuelve resultados útiles, refiná la consulta UNA vez o cambiá de fuente. Nunca repitas la misma consulta con los mismos parámetros.
- No consultes indicadores para preguntas documentales ni documentos para preguntas de indicadores.

## CITAS

- Documentos: [Fuente: nombre_archivo]
- Indicadores (valor único): [Indicador: nombre, periodo: valor]
- Indicadores (serie temporal): [Indicador: nombre, periodos: AAAA–AAAA] y detallá los valores en el texto
- Web: [Web: url]
- Si combinás fuentes, citá cada dato con su fuente en la misma respuesta.

## REGLAS DE RESPUESTA

1. Respondé siempre en español, tono profesional pero accesible.
2. Basate en los datos recibidos de las herramientas. No inventes cifras ni fuentes.
3. Si tras agotar el workflow no encontrás la información, decilo con honestidad y listá qué datos o categorías sí tenés disponibles.
4. Si encontraste información en múltiples fuentes, contextualizá y explicá qué significa cada una.
5. No uses herramientas para charla o aclaraciones que no requieran datos.`;

// ---------------------------------------------------------------------------
// Helpers — Embedding & Search
// ---------------------------------------------------------------------------

async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!EMBEDDING_API_KEY) return null;
  try {
    const response = await fetch(embeddingsUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${EMBEDDING_API_KEY}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: text,
        ...(EMBEDDING_DIMENSIONS ? { dimensions: EMBEDDING_DIMENSIONS } : {}),
      }),
      signal: AbortSignal.timeout(EMBEDDING_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error('OpenAI embedding error:', response.status, await response.text());
      return null;
    }
    const data = await response.json();

    const usage = data.usage;
    if (usage) {
      trackLLMUsage({
        tool: 'embeddings',
        model: EMBEDDING_MODEL,
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: 0,
      });
    }

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
    downloadUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ddna-repositorio/${encodeURIComponent(chunk.nombre_archivo || '')}`,
  }));
}

// ---------------------------------------------------------------------------
// Tools — Document Search
// ---------------------------------------------------------------------------

async function searchKnowledgeBase(
  query: string,
  options?: SearchOptions
): Promise<{
  chunks: ChunkResult[];
  searchMethod: 'vector' | 'text' | 'hybrid';
  warning?: string;
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseClient: any = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const categoria = options?.categoria;
  const maxChunks = options?.maxChunks ?? 10;
  const maxTokens = options?.maxTokens ?? 4000;

  let vectorChunks: ChunkResult[] = [];
  let ftsChunks: ChunkResult[] = [];
  let ftsFailed = false;
  let warning: string | undefined;

  const keywords = query
    .toLowerCase()
    .replace(/[?:,;.!¡¿]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 5);

  // Step 1 & 2: Vector + FTS in parallel
  const embeddingPromise = generateEmbedding(query);

  const ftsPromise = (async () => {
    if (keywords.length === 0) return [];
    try {
      // Use websearch syntax with OR so chunks matching ANY keyword are found,
      // not just those matching ALL keywords (which are often split across chunks)
      const ftsQueryStr = keywords.join(' OR ');
      let ftsQuery = supabaseClient
        .from('doc_chunks')
        .select('id, content, chunk_index, metadata, repo_file_id, repositorio!inner(nombre_archivo, categoria)')
        .textSearch('search_vector', ftsQueryStr, { config: 'spanish', type: 'websearch' })
        .limit(20);
      if (categoria) {
        ftsQuery = ftsQuery.eq('repositorio.categoria', categoria);
      }
      const { data: ftsData } = await ftsQuery;
      if (!ftsData || ftsData.length === 0) return [];
      return (ftsData as RawIlikeRow[]).map(row => ({
        id: row.id,
        repo_file_id: row.repo_file_id,
        chunk_index: row.chunk_index,
        content: row.content,
        metadata: row.metadata || {},
        nombre_archivo: row.repositorio?.nombre_archivo || 'Documento desconocido',
        categoria: row.repositorio?.categoria || 'Sin categoría',
        similarity: 0,
      })) as ChunkResult[];
    } catch (err) {
      console.error('FTS search failed:', err);
      ftsFailed = true;
      return [];
    }
  })();

  const embedding = await embeddingPromise;

  if (embedding) {
    const { data: rpcChunks, error: rpcError } = (await supabaseClient.rpc('search_doc_chunks', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 30,
      category_filter: categoria || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any;

    if (!rpcError && rpcChunks) {
      vectorChunks = rpcChunks as ChunkResult[];
    } else if (rpcError) {
      console.error('RPC search_doc_chunks error:', rpcError);
    }
  }

  ftsChunks = await ftsPromise;

  // FTS fallback to ILIKE
  if (ftsChunks.length === 0 && keywords.length > 0 && ftsFailed) {
    if (!embedding) {
      warning =
        'OPENAI_EMBEDDING_API_KEY / OPENAI_API_KEY no configurada. Usando búsqueda por texto (ILIKE).';
    }

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
        .limit(20);
    } else {
      ilikeResult = await supabaseClient
        .from('doc_chunks')
        .select(
          'id, content, chunk_index, metadata, repo_file_id, repositorio!inner(nombre_archivo, categoria)'
        )
        .or(searchConditions)
        .limit(20);
    }

    ftsChunks = ((ilikeResult?.data as RawIlikeRow[]) || []).map(row => ({
      id: row.id,
      repo_file_id: row.repo_file_id,
      chunk_index: row.chunk_index,
      content: row.content,
      metadata: row.metadata || {},
      nombre_archivo: row.repositorio?.nombre_archivo || 'Documento desconocido',
      categoria: row.repositorio?.categoria || 'Sin categoría',
      similarity: 0,
    })) as ChunkResult[];
  }

  // Step 3: Hybrid combination
  let chunks: ChunkResult[];
  let searchMethod: 'vector' | 'text' | 'hybrid';

  if (vectorChunks.length > 0 && ftsChunks.length > 0) {
    const chunkMap = new Map<string, { chunk: ChunkResult; vectorScore: number; ftsRank: number }>();

    for (const chunk of vectorChunks) {
      const key = `${chunk.repo_file_id}-${chunk.chunk_index}`;
      chunkMap.set(key, { chunk, vectorScore: chunk.similarity, ftsRank: 0 });
    }

    for (let i = 0; i < ftsChunks.length; i++) {
      const chunk = ftsChunks[i];
      const key = `${chunk.repo_file_id}-${chunk.chunk_index}`;
      const ftsRank = ftsChunks.length > 1 ? 1.0 - (i / (ftsChunks.length - 1)) : 1.0;
      if (chunkMap.has(key)) {
        chunkMap.get(key)!.ftsRank = ftsRank;
      } else {
        chunkMap.set(key, { chunk, vectorScore: 0, ftsRank });
      }
    }

    const maxVectorScore = Math.max(...Array.from(chunkMap.values()).map(e => e.vectorScore), 0.01);

    const scored = Array.from(chunkMap.values()).map(entry => ({
      chunk: entry.chunk,
      combinedScore: (entry.vectorScore / maxVectorScore) * 0.6 + entry.ftsRank * 0.4,
    }));

    scored.sort((a, b) => b.combinedScore - a.combinedScore);
    chunks = scored.map(s => s.chunk);
    searchMethod = 'hybrid';
  } else if (vectorChunks.length > 0) {
    chunks = vectorChunks;
    searchMethod = 'vector';
  } else if (ftsChunks.length > 0) {
    chunks = ftsChunks;
    searchMethod = 'text';
  } else {
    chunks = [];
    searchMethod = 'text';
  }

  // Step 4: Smart chunk selection (diversity)
  if (chunks.length > 1) {
    const selected: ChunkResult[] = [chunks[0]];
    let tokenCount = chunks[0].content.length / 4;

    for (let i = 1; i < chunks.length && selected.length < maxChunks && tokenCount < maxTokens; i++) {
      const candidate = chunks[i];
      let isRedundant = false;

      for (const existing of selected) {
        if (contentSimilarity(candidate.content, existing.content) > 0.6) {
          isRedundant = true;
          break;
        }
      }

      if (!isRedundant) {
        selected.push(candidate);
        tokenCount += candidate.content.length / 4;
      }
    }

    chunks = selected;
  }

  return { chunks, searchMethod, warning };
}

function contentSimilarity(a: string, b: string): number {
  const aWords = new Set(a.toLowerCase().split(/\s+/));
  const bWords = new Set(b.toLowerCase().split(/\s+/));

  if (aWords.size === 0 || bWords.size === 0) return 0;

  let intersection = 0;
  for (const word of aWords) {
    if (bWords.has(word)) intersection++;
  }

  const union = aWords.size + bWords.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// ---------------------------------------------------------------------------
// Tools — listAllDocuments
// ---------------------------------------------------------------------------

async function listAllDocuments(
  categoria?: string,
  processed?: boolean,
  limit = 100
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
  truncated: boolean;
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseClient: any = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const safeLimit = Math.min(Math.max(Math.trunc(limit) || 100, 1), 500);

  let query = supabaseClient
    .from('repositorio')
    .select(
      'id, nombre_archivo, tipo_documento, categoria, processed, total_chunks, fecha_subida, tamano_bytes',
      { count: 'exact' }
    )
    .order('fecha_subida', { ascending: false })
    .limit(safeLimit);

  if (categoria) {
    query = query.eq('categoria', categoria);
  }
  if (processed !== undefined) {
    query = query.eq('processed', processed);
  }

  const { data, error, count } = await query;

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

  const total = typeof count === 'number' ? count : docs.length;

  return {
    documentos: docs,
    total,
    truncated: total > docs.length,
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
  searchMethod?: 'vector' | 'text' | 'hybrid';
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
  if (name === 'searchKnowledgeBase') {
    const query = String(args.query || '');
    const categoria = args.categoria ? String(args.categoria) : undefined;
    const maxResults = args.max_results ? Number(args.max_results) : undefined;
    const { chunks, searchMethod, warning } = await searchKnowledgeBase(query, {
      categoria,
      maxChunks: maxResults,
    });

    let formattedResult: string;
    if (chunks.length === 0) {
      // Offer to list available documents so the LLM can retry with a better query
      formattedResult = 'No se encontraron documentos relevantes en la base de conocimiento con esa búsqueda. Podés usar listAllDocuments para ver qué documentos están disponibles y luego buscar con otros términos. IMPORTANTE: También tenés datos de INDICADORES (listAvailableIndicators, getCategoryOverview, getLatestIndicatorValue) — no te rindas después de solo buscar en documentos.';
    } else {
      const context = buildContext(chunks, 600);
      formattedResult =
        `[Búsqueda en documentos — método: ${searchMethod}]\n\n` +
        `Fragmentos encontrados (${chunks.length}):\n\n${context}`;
    }
    if (warning) {
      formattedResult += `\n\nAdvertencia: ${warning}`;
    }

    return { formattedResult, sourceType: 'documents', chunks, searchMethod };
  }

  if (name === 'listAllDocuments') {
    const categoria = args.categoria ? String(args.categoria) : undefined;
    const processed = args.processed !== undefined ? Boolean(args.processed) : undefined;
    const limit = args.limit !== undefined ? Number(args.limit) : undefined;
    const result = await listAllDocuments(categoria, processed, limit);

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
    const truncation = result.truncated
      ? `\n\n_Mostrando ${result.documentos.length} de ${result.total}. Pedí más con el parámetro limit (máx. 500)._`
      : '';

    return {
      formattedResult: header + lines.join('\n') + stats + truncation,
      sourceType: 'documents',
    };
  }

  // --- Web ---
  if (name === 'searchWeb') {
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

  if (name === 'scrapeUrl') {
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
// LLM call helper (with function calling + SSE streaming support)
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

type ToolDefinition = {
  type: 'function';
  function: { name: string; description: string; parameters: Record<string, unknown> };
};

async function callLLM(
  messages: LLMMessage[],
  tools?: ToolDefinition[],
  onToken?: (text: string) => void
): Promise<{
  content: string | null;
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  modelUsed: string;
}> {
  const isStreaming = !!onToken;

  const { response, modelUsed } = await fetchChatCompletion({
    primaryModel: OPENAI_MODEL,
    fallbackModel: FALLBACK_MODEL,
    buildBody: (model) => {
      const body: Record<string, unknown> = {
        ...chatProviderBody(
          model,
          model === FALLBACK_MODEL ? FALLBACK_REASONING_EFFORT : undefined,
        ),
        model,
        messages,
        temperature: 0.3,
        max_completion_tokens: MAX_TOKENS,
      };

      if (tools && tools.length > 0) {
        body.tools = tools;
        body.tool_choice = 'auto';
      }

      if (isStreaming) {
        body.stream = true;
        body.stream_options = { include_usage: true };
      }

      return body;
    },
    timeoutMs: CHAT_TIMEOUT_MS,
    fallbackTimeoutMs: FALLBACK_TIMEOUT_MS,
  });

  if (isStreaming) {
    const result = await readStreamingResponse(response, onToken);
    return { ...result, modelUsed };
  }

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
    usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
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
    usage: data?.usage,
    modelUsed,
  };
}

/**
 * Read an OpenAI streaming response, emitting tokens via onToken.
 * Handles both text-only and tool-call responses.
 */
async function readStreamingResponse(
  response: Response,
  onToken: (text: string) => void
): Promise<{
  content: string | null;
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  let toolCalls: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }> | undefined;
  let hasToolCalls = false;
  let streamUsage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | undefined;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;

      const payload = trimmed.slice(6);
      if (payload === '[DONE]') continue;

      try {
        const parsed = JSON.parse(payload);

        if (parsed.usage) {
          streamUsage = parsed.usage;
        }

        const choice = parsed.choices?.[0];
        if (!choice) continue;

        const delta = choice.delta || {};

        if (delta.tool_calls) {
          hasToolCalls = true;
          if (!toolCalls) toolCalls = [];
          for (const tc of delta.tool_calls) {
            const idx: number = tc.index;
            if (!toolCalls[idx]) {
              toolCalls[idx] = { id: '', type: 'function' as const, function: { name: '', arguments: '' } };
            }
            if (tc.id) toolCalls[idx].id = tc.id;
            if (tc.function) {
              if (tc.function.name) toolCalls[idx].function.name += tc.function.name;
              if (tc.function.arguments) toolCalls[idx].function.arguments += tc.function.arguments;
            }
          }
        }

        if (delta.content) {
          content += delta.content;
          if (!hasToolCalls) {
            onToken(delta.content);
          }
        }
      } catch {
        // skip malformed JSON lines
      }
    }
  }

  return {
    content: hasToolCalls ? null : content,
    toolCalls,
    usage: streamUsage,
  };
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
// SSE helpers
// ---------------------------------------------------------------------------

type SSEWriter = (event: string, data: Record<string, unknown>) => void;

function createSSEWriter(controller: ReadableStreamDefaultController, encoder: TextEncoder): SSEWriter {
  return (event: string, data: Record<string, unknown>) => {
    try {
      controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
    } catch {
      // Stream may have been closed by the client
    }
  };
}

// ---------------------------------------------------------------------------
// POST handler — function calling loop with SSE streaming
// ---------------------------------------------------------------------------

async function handleChatPOST(request: Request) {
  // ── Auth: admin only ──────────────────────────────────────────────────────
  const guard = await checkAdminAuth();
  if (!guard.authorized) return guard.response!;

  let question: string;
  let conversationHistory: Array<{ role: string; content: string }> | undefined;

  try {
    const body = await request.json();
    question = body.question;
    conversationHistory = body.conversationHistory;
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de la solicitud inválido. Se esperaba JSON con campo 'question'." },
      { status: 400 }
    );
  }

  if (!question || typeof question !== 'string' || !question.trim()) {
    return NextResponse.json(
      { error: "La pregunta es requerida (campo 'question')" },
      { status: 400 }
    );
  }

  if (!CHAT_API_KEY) {
    return NextResponse.json(
      {
        error:
          'No hay API key configurada para el chat. Configurá OPENAI_CHAT_API_KEY u OPENAI_API_KEY en .env.local',
      },
      { status: 500 }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = createSSEWriter(controller, encoder);

      const accumulatedSources: ReturnType<typeof buildSources> = [];
      const accumulatedDataSources: Array<{
        indicador: string;
        periodo?: string;
        valor?: number | string;
      }> = [];
      const toolsUsed: string[] = [];
      let searchMethodUsed: 'vector' | 'text' | 'hybrid' | undefined;

      // Auto-discover available indicator categories and inject into context
      let catalogContext = '';
      try {
        const { listAvailableIndicators } = await import('@/lib/agent/indicator-tools');
        const catalog = await listAvailableIndicators();
        if (catalog.categorias.length > 0) {
          const lines = catalog.categorias.map(c => {
            // Show indicators whose name matches the category keyword first
            const sorted = [...c.indicadores].sort((a, b) => {
              const aMatch = a.nombre.toLowerCase().includes(c.nombre.toLowerCase()) ? 0 : 1;
              const bMatch = b.nombre.toLowerCase().includes(c.nombre.toLowerCase()) ? 0 : 1;
              return aMatch - bMatch;
            });
            return `  - "${c.nombre}" (${c.indicadores.length} indicadores, ej: ${sorted.slice(0, 5).map(i => i.nombre).join(', ')}${c.indicadores.length > 5 ? '...' : ''})`;
          });
          catalogContext = `\n\n## CATÁLOGO DE DATOS DISPONIBLES\n\nEstas son las categorías de indicadores con datos cargados. TODAS tienen datos disponibles — no necesitás buscarlas en documentos:\n${lines.join('\n')}\n\nINSTRUCCIÓN: SIEMPRE que te pregunten sobre un tema que coincida con alguna categoría, usá las herramientas de indicadores. NO uses searchKnowledgeBase para buscar datos de indicadores.`;
        }
      } catch {
        // Non-critical — continue without catalog
      }

      try {
        const messages: LLMMessage[] = [
          { role: 'system', content: SYSTEM_PROMPT + catalogContext },
          ...(conversationHistory || []).slice(-6),
          { role: 'user', content: question },
        ];

        let finalAnswer = '';
        let round = 0;
        let totalToolCalls = 0;
        let modelUsed = OPENAI_MODEL;

        while (round < MAX_TOOL_ROUNDS && totalToolCalls < MAX_TOOL_CALLS) {
          round += 1;

          let response;
          try {
            response = await callLLM(messages, ALL_TOOLS, (text) => {
              send('token', { text });
            });
            modelUsed = response.modelUsed;
            if (response.usage) {
              trackLLMUsage({
                tool: 'chat',
                model: response.modelUsed,
                promptTokens: response.usage.prompt_tokens,
                completionTokens: response.usage.completion_tokens,
              });
            }
          } catch (err) {
            console.error(`LLM call failed (round ${round}):`, err);
            if (toolsUsed.length > 0) {
              const errMsg = err instanceof Error ? err.message : String(err);
              finalAnswer =
                '⚠️ No pude generar la respuesta final (error: ' + errMsg.substring(0, 300) + ').\n\n' +
                '**Herramientas ejecutadas**: ' + toolsUsed.join(', ') + '\n\n' +
                'Los datos se obtuvieron correctamente pero el servicio de IA falló al sintetizarlos. ' +
                'Probá con una consulta más específica o reintentá en unos segundos.';
              // Emit the fallback answer as tokens
              for (const chunk of splitIntoChunks(finalAnswer)) {
                send('token', { text: chunk });
              }
              break;
            }
            throw err;
          }

          if (!response.toolCalls || response.toolCalls.length === 0) {
            finalAnswer = response.content || '';
            break;
          }

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

            send('tool', { tool: toolName, status: 'start', label: getToolDisplayName(toolName) });

            try {
              const { formattedResult, sourceType, chunks, indicatorResult, searchMethod } = await executeToolCall(
                toolName,
                toolArgs
              );

              if (searchMethod) searchMethodUsed = searchMethod;
              toolsUsed.push(toolName);
              allFailed = false;

              let truncatedResult = formattedResult;
              if (truncatedResult.length > MAX_CONTEXT_CHARS) {
                truncatedResult = truncatedResult.substring(0, MAX_CONTEXT_CHARS) +
                  '\n\n[... resultado truncado por límite de contexto ...]';
              }

              toolResults.push(`[Resultado de "${toolName}"]:\n${truncatedResult}`);

              messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: truncatedResult,
              });

              if (sourceType === 'documents' && chunks) {
                accumulatedSources.push(...buildSources(chunks));
              }

              if (sourceType === 'indicators' && indicatorResult) {
                const dataRefs = extractDataSources(toolName, indicatorResult);
                accumulatedDataSources.push(...dataRefs);
              }
            } catch (toolErr) {
              console.error(`Tool "${toolName}" execution error:`, toolErr);
              const errorMsg = `[Error ejecutando "${toolName}"]: ${String(toolErr)}`;
              toolResults.push(errorMsg);

              messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: `Error: ${String(toolErr).substring(0, 500)}`,
              });
            }

            send('tool', { tool: toolName, status: 'end' });
          }

          if (allFailed) {
            messages.push({
              role: 'user',
              content:
                'Todas las herramientas fallaron. Probá con herramientas DIFERENTES a las que ya intentaste. Por ejemplo, si falló searchKnowledgeBase, probá listAvailableIndicators o searchIndicators. O si fallaron indicadores, buscá en documentos o web. Usá al menos 2-3 herramientas diferentes antes de rendirte.',
            });
          } else {
            // If only searchKnowledgeBase was used and found nothing, force other tools
            const onlySearchedDocs = toolsUsed.length === 1 && toolsUsed[0] === 'searchKnowledgeBase';
            if (onlySearchedDocs) {
              messages.push({
                role: 'user',
                content:
                  'Los documentos no tenían la información. NO te rindas. Ahora usá las herramientas de INDICADORES (listAvailableIndicators, getCategoryOverview, getLatestIndicatorValue, searchIndicators). Buscá en los indicadores antes de responder.',
              });
            } else if (totalToolCalls < MAX_TOOL_CALLS) {
              messages.push({
                role: 'user',
                content:
                  'Si ya tenés suficiente información con estos resultados, sintetizá la respuesta final. Si necesitás más datos, podés llamar otras herramientas.',
              });
            }
          }

          if (toolResults.length > 0 && round >= MAX_TOOL_ROUNDS - 1) {
            messages.push({
              role: 'user',
              content:
                'Llegaste al límite de rondas. Sintetizá AHORA una respuesta final con los datos que tengas. NO uses herramientas.',
            });
          }
        }

        if (!finalAnswer && toolsUsed.length > 0) {
          try {
            messages.push({
              role: 'user',
              content:
                'Sintetizá AHORA una respuesta final con todos los datos disponibles. NO uses herramientas.',
            });
            const { content, usage, modelUsed: synthesisModel } = await callLLM(messages, undefined, (text) => {
              send('token', { text });
            });
            modelUsed = synthesisModel;
            if (usage) {
              trackLLMUsage({
                tool: 'chat',
                model: synthesisModel,
                promptTokens: usage.prompt_tokens,
                completionTokens: usage.completion_tokens,
              });
            }
            finalAnswer = content || '';
          } catch {
            finalAnswer =
              'No se pudo completar el análisis en el tiempo disponible. Por favor, intentá con una consulta más específica.';
            for (const chunk of splitIntoChunks(finalAnswer)) {
              send('token', { text: chunk });
            }
          }
        }

        if (!finalAnswer) {
          let availableData = '';
          try {
            const indicators = await listAvailableIndicators();
            if (indicators.categorias.length > 0) {
              availableData = '\n\n**Datos disponibles en el sistema**:\n';
              for (const cat of indicators.categorias) {
                const names = cat.indicadores.map(i => `\`${i.nombre}\``).join(', ');
                availableData += `\n- *${cat.nombre}* (${cat.indicadores.length} indicadores): ${names}`;
              }
            }
          } catch {
            availableData = '\n\n*No se pudieron consultar los indicadores disponibles.*';
          }

          finalAnswer =
            'No encontré información específica para tu consulta en las fuentes disponibles.' +
            availableData +
            '\n\n**Sugerencias**:\n' +
            '- Probá con otros términos de búsqueda\n' +
            '- Subí documentos a la biblioteca para ampliar la base de conocimiento\n' +
            '- Consultá a la Defensoría para obtener información más específica';
          for (const chunk of splitIntoChunks(finalAnswer)) {
            send('token', { text: chunk });
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabaseClient: any = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const totalDocs = await getCachedDocCount(supabaseClient);

        const dedupedSources = accumulatedSources.length > 0
          ? Array.from(new Map(accumulatedSources.map(s => [s.fileName, s])).values())
          : [];

        const dedupedDataSources = accumulatedDataSources.length > 0
          ? Array.from(new Map(accumulatedDataSources.map(d => [d.indicador, d])).values())
          : [];

        send('done', {
          sources: dedupedSources,
          dataSources: dedupedDataSources,
          hasContext: dedupedSources.length > 0,
          totalDocs: totalDocs ?? 0,
          searchMethod: searchMethodUsed || 'vector',
          toolsUsed: [...new Set(toolsUsed)],
          reportGenerated: (finalAnswer.match(/^#{1,3}\s/gm) || []).length >= 2 && finalAnswer.length > 400,
          model: modelUsed,
          fallback: modelUsed !== OPENAI_MODEL,
          functionCalling: true,
        });
      } catch (err) {
        console.error('Chat error:', err);
        send('error', { error: `Error interno: ${String(err)}` });
      } finally {
        try {
          controller.close();
        } catch {
          // Stream already closed
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

function splitIntoChunks(text: string, size = 80): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

// Exported with rate limiting (30 requests/min per IP)
export const POST = withRateLimit(handleChatPOST, {
  maxRequests: 30,
  windowMs: 60_000,
  keyPrefix: 'repositorio-chat',
});
