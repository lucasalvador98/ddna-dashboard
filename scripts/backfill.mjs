/**
 * Backfill script — procesa todos los PDFs pendientes
 * Ejecutar: node --max-old-space-size=4096 scripts/backfill.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const SUPABASE_URL = 'https://ppyyqrvirjqmfpqaqnxy.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweXlxcnZpcmpxbWZwcWFxbnh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5MDMwNSwiZXhwIjoyMDkxNzY2MzA1fQ.g3NSsIO2Y6qGTtfvBQciTfTWyQIW0ev2tuUjY5QcYLM';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

async function extractPdfText(buffer) {
  const buf = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const parser = new PDFParse(buf);
  await parser.load(0);
  const { text, total } = await parser.getText();
  // total seems to be total chars or pages count
  const pages = parser.getInfo()?.numPages || 1;
  return { text: text || '', pages };
}

function chunkText(text, maxChars = 2000, overlap = 400) {
  const chunks = [];
  let start = 0, i = 0;
  while (start < text.length) {
    let end = Math.min(start + maxChars, text.length);
    if (end < text.length) {
      const w = text.slice(start, end);
      const p = w.lastIndexOf('\n\n'), s = w.lastIndexOf('. ');
      if (p > maxChars * 0.4) end = start + p;
      else if (s > maxChars * 0.4) end = start + s + 1;
    }
    const ct = text.slice(start, end).trim();
    if (ct.length > 30) { chunks.push({ content: ct, index: i }); i++; }
    start = end - overlap;
    if (start >= text.length - 10) break;
  }
  return chunks;
}

async function processFile(fileId, fileName) {
  console.log(`\n📄 ${fileName}`);

  // 1. Download
  const { data: fileData, error: dlError } = await supabase.storage
    .from('ddna-repositorio').download(fileName);
  if (dlError) { console.log(`  ❌ Download: ${dlError.message}`); return false; }

  // 2. Extract
  const buf = Buffer.from(await fileData.arrayBuffer());
  let result;
  try {
    result = await extractPdfText(buf);
  } catch(e) {
    console.log(`  ❌ Extraction: ${e.message}`);
    return false;
  }
  console.log(`  📝 ${result.pages} pages, ${result.text.length} chars`);

  if (!result.text || result.text.length < 50) {
    console.log('  ❌ Too little text');
    return false;
  }

  // 3. Chunk
  const chunks = chunkText(result.text);
  console.log(`  ✂️ ${chunks.length} chunks`);

  // 4. Insert chunks & mark processed (embeddings optional)
  for (let i = 0; i < chunks.length; i += 50) {
    const batch = chunks.slice(i, i + 50).map(c => ({
      repo_file_id: fileId,
      chunk_index: c.index,
      content: c.content,
      metadata: { source: fileName, type: 'pdf' },
    }));
    const { error } = await supabase.from('doc_chunks').insert(batch);
    if (error) {
      console.log(`  ❌ Insert batch ${i}: ${error.message}`);
      return false;
    }
  }

  // 5. Mark processed
  await supabase.from('repositorio').update({
    processed: true, total_chunks: chunks.length,
    last_processed_at: new Date().toISOString(),
  }).eq('id', fileId);

  console.log(`  ✅ ${chunks.length} chunks saved`);
  return true;
}

async function main() {
  const { data: files } = await supabase.from('repositorio')
    .select('id, nombre_archivo').eq('processed', false).eq('tipo_documento', 'pdf');

  if (!files || files.length === 0) { console.log('No PDFs to process'); return; }

  console.log(`Found ${files.length} unprocessed PDFs\n`);
  let ok = 0, fail = 0;

  for (const f of files) {
    const success = await processFile(f.id, f.nombre_archivo);
    if (success) ok++; else fail++;
  }

  console.log(`\n✅ ${ok} processed, ❌ ${fail} failed`);
}

main().catch(console.error);
