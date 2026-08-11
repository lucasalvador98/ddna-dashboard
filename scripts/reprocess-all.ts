/**
 * Reprocess all documents — regenerate missing embeddings + process new files.
 * Usage: npx tsx scripts/reprocess-all.ts
 * Requires env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
 */
import { createClient } from '@supabase/supabase-js';
import { generateEmbeddingsBatch } from '../src/lib/rag/embedder';
import { processDocument } from '../src/lib/rag/process-document';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function main() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Missing OPENAI_API_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // ── Step 1: Regenerate embeddings (with pagination) ────────────
  console.log('\n🔍 Buscando chunks sin embedding...');
  const allChunks: Array<{ id: string; repo_file_id: string; content: string }> = [];
  let page = 0;
  const PAGE_SIZE = 1000;

  while (true) {
    const { data: pageChunks, error } = await supabase
      .from('doc_chunks')
      .select('id, repo_file_id, content')
      .is('embedding', null)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
    if (!pageChunks || pageChunks.length === 0) break;
    allChunks.push(...pageChunks);
    console.log(`  Página ${page + 1}: ${pageChunks.length} chunks`);
    page++;
  }

  console.log(`📊 Total: ${allChunks.length} chunks sin embedding`);

  if (allChunks.length > 0) {
    const byFile = new Map<string, typeof allChunks>();
    for (const c of allChunks) {
      const arr = byFile.get(c.repo_file_id) || [];
      arr.push(c);
      byFile.set(c.repo_file_id, arr);
    }
    console.log(`📁 ${byFile.size} documentos afectados`);

    let totalDone = 0;
    const BATCH = 20;

    for (const [fileId, chunks] of byFile) {
      const { data: file } = await supabase
        .from('repositorio')
        .select('nombre_archivo')
        .eq('id', fileId)
        .single();
      const fileName = (file as { nombre_archivo?: string })?.nombre_archivo || fileId;
      console.log(`\n📄 ${fileName} — ${chunks.length} chunks`);

      let fileDone = 0;
      for (let i = 0; i < chunks.length; i += BATCH) {
        const batch = chunks.slice(i, i + BATCH);
        try {
          const embeddings = await generateEmbeddingsBatch(batch.map(c => c.content));
          for (let j = 0; j < batch.length; j++) {
            if (embeddings[j]) {
              await supabase.from('doc_chunks').update({ embedding: embeddings[j] }).eq('id', batch[j].id);
              fileDone++;
              totalDone++;
              process.stdout.write('✅');
            }
          }
        } catch (err) {
          process.stdout.write('❌');
          console.error(`\n  Error en batch: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
      console.log(` — ${fileDone}/${chunks.length} ✅`);
    }
    console.log(`\n✅ Embeddings regenerados: ${totalDone}/${allChunks.length}`);
  }

  // ── Step 2: Process new documents ────────────────────────────────
  console.log('\n🔍 Buscando documentos sin procesar...');
  const { data: unprocessed } = await supabase
    .from('repositorio')
    .select('id, nombre_archivo, tipo_documento')
    .eq('processed', false);

  if (!unprocessed || unprocessed.length === 0) {
    console.log('✅ No hay documentos pendientes');
  } else {
    console.log(`📊 ${unprocessed.length} documentos`);
    for (const doc of unprocessed) {
      console.log(`\n📄 ${doc.nombre_archivo} (${doc.tipo_documento})`);
      try {
        const result = await processDocument(supabase, doc.id);
        console.log(`   ${result.success ? `✅ ${result.totalChunks} chunks` : `❌ ${result.error}`}`);
      } catch (err) {
        console.log(`   ❌ ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  console.log('\n🎉 Proceso completo');
  console.log(`\n📊 Resumen final:`);
  const { count: total } = await supabase
    .from('doc_chunks')
    .select('*', { count: 'exact', head: true });
  const { count: withEmb } = await supabase
    .from('doc_chunks')
    .select('*', { count: 'exact', head: true })
    .not('embedding', 'is', null);
  console.log(`   Total chunks: ${total}`);
  console.log(`   Con embedding: ${withEmb}`);
  console.log(`   Sin embedding: ${(total || 0) - (withEmb || 0)}`);
}

main().catch(console.error);
