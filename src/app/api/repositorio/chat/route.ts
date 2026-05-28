import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// --- Configuration ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'groq';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// Models
const GROQ_MODEL = 'llama-3.1-8b-instant';
const OPENAI_MODEL = 'gpt-4o-mini';

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

// --- System Prompt ---
const SYSTEM_PROMPT = `Eres un asistente especializado de la Defensoría de los Derechos de Niñas, Niños y Adolescentes (DDNA) de la Provincia de Córdoba.

Tu función es ayudar al público en general a obtener información precisa basada en los documentos oficiales de la Defensoría.

Reglas importantes:
1. Responde SIEMPRE en español
2. Basa tus respuestas ÚNICAMENTE en el contexto proporcionado
3. Si la información no está en el contexto, di "No encuentro esa información en los documentos disponibles"
4. Cita las fuentes mencionando el nombre del archivo y, cuando esté disponible, la similitud (qué tan relacionado está el fragmento con la pregunta)
5. Mantén un tono profesional pero accesible
6. Si hay datos estadísticos, preséntalos de forma clara (usa tablas si es necesario)
7. No inventes información
8. Los fragmentos están ordenados por relevancia semántica: los primeros son los más relevantes a la pregunta`;

// --- Helpers ---

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
  }));
}

export async function POST(request: Request) {
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

    // --- Search for relevant chunks ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase: any = createClient(supabaseUrl, supabaseAnonKey);

    let relevantChunks: ChunkResult[] = [];
    let searchMethod: 'vector' | 'text' = 'text';
    let warning: string | undefined;

    // === Step 1: Try vector semantic search ===
    const embedding = await generateEmbedding(question);

    if (embedding) {
      const { data: rpcChunks, error: rpcError } = (await supabase.rpc('search_doc_chunks', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 15,
        category_filter: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })) as any;

      if (!rpcError && rpcChunks && rpcChunks.length > 0) {
        relevantChunks = rpcChunks as ChunkResult[];
        searchMethod = 'vector';
      } else if (rpcError) {
        console.error('RPC search_doc_chunks error:', rpcError);
        warning = 'Búsqueda vectorial falló, usando búsqueda por texto';
      }
    }

    // === Step 2: Fallback to ILIKE text search ===
    if (relevantChunks.length === 0) {
      if (!embedding) {
        warning =
          'OPENAI_API_KEY no configurada. Usando búsqueda por texto (ILIKE). Configurá la API key para búsqueda semántica vectorial.';
      }

      // Extract keywords from question
      const keywords = question
        .toLowerCase()
        .replace(/[?:,;.!¡¿]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .slice(0, 5);

      if (keywords.length > 0) {
        const searchConditions = keywords.map(kw => `content.ilike.%${kw}%`).join(',');

        // Get processed file IDs
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: processedFiles } = (await supabase
          .from('repositorio')
          .select('id')
          .eq('processed', true)) as { data: { id: string }[] | null };

        const fileIds = processedFiles?.map((f: { id: string }) => f.id) || [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let ilikeResult: any;

        if (fileIds.length > 0) {
          ilikeResult = await supabase
            .from('doc_chunks')
            .select(
              'id, content, chunk_index, metadata, repo_file_id, repositorio!inner(nombre_archivo, categoria)'
            )
            .in('repo_file_id', fileIds)
            .or(searchConditions)
            .limit(10);
        } else {
          ilikeResult = await supabase
            .from('doc_chunks')
            .select(
              'id, content, chunk_index, metadata, repo_file_id, repositorio!inner(nombre_archivo, categoria)'
            )
            .or(searchConditions)
            .limit(10);
        }

        const ilikeData = ilikeResult?.data as RawIlikeRow[] | null;

        if (ilikeData && ilikeData.length > 0) {
          relevantChunks = ilikeData.map(row => ({
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

    // --- Get total processed docs count ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: totalDocs } = (await supabase
      .from('repositorio')
      .select('*', { count: 'exact', head: true })
      .eq('processed', true)) as { count: number };

    // --- Build context for LLM ---
    const context = relevantChunks.length > 0 ? buildContext(relevantChunks) : '';
    const sources = buildSources(relevantChunks);

    // --- Build messages array ---
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(conversationHistory || []).slice(-6),
      {
        role: 'user',
        content: context
          ? `Contexto disponible de la bibliografía de la DDNA:\n\n${context}\n\nPregunta: ${question}`
          : `No hay documentos procesados en la bibliografía. Pregunta: ${question}`,
      },
    ];

    // --- Call LLM ---
    const apiUrl = isGroq
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';

    const model = isGroq ? GROQ_MODEL : OPENAI_MODEL;

    const llmResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${llmApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!llmResponse.ok) {
      const errorBody = await llmResponse.json();
      console.error(`${LLM_PROVIDER} API error:`, errorBody);
      return NextResponse.json(
        {
          error: `Error al generar respuesta con ${LLM_PROVIDER}. ${errorBody?.error?.message || ''}`,
        },
        { status: 500 }
      );
    }

    const llmData = await llmResponse.json();
    const answer = llmData.choices[0]?.message?.content || 'No pude generar una respuesta';

    // --- Build response ---
    const responseBody: Record<string, unknown> = {
      answer,
      sources: sources.length > 0 ? sources : [],
      hasContext: context.length > 0,
      totalDocs: totalDocs ?? 0,
      searchMethod: searchMethod === 'vector' ? 'vector' : 'text',
      model,
    };

    if (warning) responseBody.warning = warning;

    return NextResponse.json(responseBody);
  } catch (err) {
    console.error('Chat error:', err);
    return NextResponse.json({ error: `Error interno: ${String(err)}` }, { status: 500 });
  }
}
