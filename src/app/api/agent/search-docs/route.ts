import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: Request) {
  try {
    const { query, max_results = 10, categoria } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query es requerido' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Generate keywords from query for text search
    const keywords = query
      .toLowerCase()
      .replace(/[?:,;.!¡¿]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 10);

    if (keywords.length === 0) {
      return NextResponse.json({ error: 'Query muy corta' }, { status: 400 });
    }

    // Build search conditions
    const searchConditions = keywords.map(kw => `content.ilike.%${kw}%`).join(',');

    // Query with join to get file info
    let dbQuery = supabase
      .from('doc_chunks')
      .select(
        `
        id,
        content,
        chunk_index,
        metadata,
        repositorio!inner (
          id,
          nombre_archivo,
          categoria
        )
      `
      )
      .or(searchConditions)
      .limit(max_results);

    // Add category filter if provided
    if (categoria) {
      dbQuery = dbQuery.eq('repositorio.categoria', categoria);
    }

    const { data: chunks, error } = await dbQuery;

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ error: `Error en búsqueda: ${error.message}` }, { status: 500 });
    }

    // Format results
    const results = (chunks || []).map((chunk: any) => ({
      content: chunk.content,
      source:
        chunk.repositorio?.nombre_archivo || chunk.metadata?.fileName || 'Documento desconocido',
      similarity: 1, // Text search doesn't have similarity score
      chunk_index: chunk.chunk_index,
      metadata: chunk.metadata,
    }));

    return NextResponse.json({
      results,
      total: results.length,
      query,
      search_type: 'text',
    });
  } catch (err) {
    console.error('Search docs error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
