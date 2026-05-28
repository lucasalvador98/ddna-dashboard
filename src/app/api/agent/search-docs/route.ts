import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

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
 * Run ILIKE text search as fallback when vector search is unavailable.
 * Returns null if no results found.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ilikeSearch(
  supabase: any,
  query: string,
  maxResults: number,
  categoria?: string
): Promise<ChunkResult[] | null> {
  const keywords = query
    .toLowerCase()
    .replace(/[?:,;.!¡¿]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 10);

  if (keywords.length === 0) return null;

  const searchConditions = keywords.map(kw => `content.ilike.%${kw}%`).join(',');

  let ilikeRows: RawIlikeRow[] | null = null;

  // Use raw query result to avoid Supabase v2 excessive type depth on nested joins
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rawResult: any;

  if (categoria) {
    rawResult = await supabase
      .from('doc_chunks')
      .select(
        'id, content, chunk_index, metadata, repo_file_id, repositorio!inner(nombre_archivo, categoria)'
      )
      .or(searchConditions)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq('repositorio.categoria' as any, categoria)
      .limit(maxResults);
  } else {
    rawResult = await supabase
      .from('doc_chunks')
      .select(
        'id, content, chunk_index, metadata, repo_file_id, repositorio!inner(nombre_archivo, categoria)'
      )
      .or(searchConditions)
      .limit(maxResults);
  }

  ilikeRows = rawResult?.data as RawIlikeRow[] | null;

  if (!ilikeRows || ilikeRows.length === 0) return null;

  return ilikeRows.map(row => ({
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

export async function POST(request: Request) {
  try {
    const { query, max_results = 10, categoria } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query es requerido' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase: any = createClient(supabaseUrl, supabaseAnonKey);
    let chunks: ChunkResult[] = [];
    let searchMethod: 'vector' | 'text' = 'text';
    let warning: string | undefined;

    // --- Vector search (primary) ---
    const embedding = await generateEmbedding(query);

    if (embedding) {
      const { data: rpcChunks, error: rpcError } = (await supabase.rpc('search_doc_chunks', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: max_results,
        category_filter: categoria || null,
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

    // --- Fallback to ILIKE text search ---
    if (chunks.length === 0) {
      if (!embedding) {
        warning =
          'OPENAI_API_KEY no configurada. Usando búsqueda por texto. Configurá la API key para búsqueda semántica.';
      }

      const ilikeResult = await ilikeSearch(supabase, query, max_results, categoria);
      if (ilikeResult) chunks = ilikeResult;
      searchMethod = 'text';
    }

    // --- Format results ---
    const results = chunks.map(chunk => ({
      content: chunk.content,
      source: chunk.nombre_archivo || 'Documento desconocido',
      similarity: chunk.similarity ?? 0,
      chunk_index: chunk.chunk_index,
      metadata: chunk.metadata,
      categoria: chunk.categoria,
    }));

    const response: Record<string, unknown> = {
      results,
      total: results.length,
      query,
      search_type: searchMethod === 'vector' ? 'vector' : 'text',
    };

    if (warning) response.warning = warning;

    return NextResponse.json(response);
  } catch (err) {
    console.error('Search docs error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
