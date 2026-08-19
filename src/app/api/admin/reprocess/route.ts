import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateEmbeddingsBatch } from '@/lib/rag/embedder';
import { processDocument } from '@/lib/rag/process-document';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Vercel timeout

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const results: string[] = [];

  // ── Step 1: Regenerate embeddings ─────────────────────────────────
  results.push('🔍 Buscando chunks sin embedding...');
  const { data: nullChunks } = await supabase
    .from('doc_chunks')
    .select('id, repo_file_id, content')
    .is('embedding', null);

  if (!nullChunks || nullChunks.length === 0) {
    results.push('✅ Todos los chunks tienen embedding');
  } else {
    results.push(`📊 ${nullChunks.length} chunks sin embedding`);

    // Group by file
    const byFile = new Map<string, typeof nullChunks>();
    for (const c of nullChunks) {
      const arr = byFile.get(c.repo_file_id) || [];
      arr.push(c);
      byFile.set(c.repo_file_id, arr);
    }

    results.push(`📁 ${byFile.size} documentos afectados`);
    let totalDone = 0;
    const BATCH = 20;

    for (const [fileId, chunks] of byFile) {
      const { data: file } = await supabase
        .from('repositorio')
        .select('nombre_archivo')
        .eq('id', fileId)
        .single();
      const fname = (file as { nombre_archivo?: string })?.nombre_archivo || fileId;

      let fileDone = 0;
      for (let i = 0; i < chunks.length; i += BATCH) {
        const batch = chunks.slice(i, i + BATCH);
        try {
          const embeddings = await generateEmbeddingsBatch(
            batch.map(c => c.content)
          );

          for (let j = 0; j < batch.length; j++) {
            if (embeddings[j]) {
              await supabase
                .from('doc_chunks')
                .update({ embedding: embeddings[j] })
                .eq('id', batch[j].id);
              fileDone++;
              totalDone++;
            }
          }
        } catch (err) {
          results.push(`  ⚠️ Error en batch ${i}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
      results.push(`  ${fname}: ${fileDone}/${chunks.length} ✅`);
    }
    results.push(`✅ Embeddings regenerados: ${totalDone}/${nullChunks.length}`);
  }

  // ── Step 2: Process new documents ──────────────────────────────────
  results.push('\n🔍 Buscando documentos sin procesar...');
  const { data: unprocessed } = await supabase
    .from('repositorio')
    .select('id, nombre_archivo, tipo_documento')
    .eq('processed', false);

  if (!unprocessed || unprocessed.length === 0) {
    results.push('✅ No hay documentos pendientes');
  } else {
    results.push(`📊 ${unprocessed.length} documentos para procesar`);
    for (const doc of unprocessed) {
      try {
        const result = await processDocument(supabase, doc.id);
        if (result.success) {
          results.push(`  ✅ ${doc.nombre_archivo}: ${result.totalChunks} chunks`);
        } else {
          results.push(`  ❌ ${doc.nombre_archivo}: ${result.error}`);
        }
      } catch (err) {
        results.push(`  ❌ ${doc.nombre_archivo}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  return NextResponse.json({ results });
}
