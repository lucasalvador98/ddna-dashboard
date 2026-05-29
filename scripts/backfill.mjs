/**
 * Backfill script — procesa todos los PDFs pendientes localmente
 * Ejecutar: node scripts/backfill.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ppyyqrvirjqmfpqaqnxy.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweXlxcnZpcmpxbWZwcWFxbnh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5MDMwNSwiZXhwIjoyMDkxNzY2MzA1fQ.g3NSsIO2Y6qGTtfvBQciTfTWyQIW0ev2tuUjY5QcYLM';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

async function extractPdfText(buffer) {
  // Try multiple import methods for pdf-parse
  try {
    const mod = await import('pdf-parse');
    const fn = mod.default || mod;
    if (typeof fn === 'function') return fn(buffer);
    if (fn && typeof fn.default === 'function') return fn.default(buffer);
  } catch(e) {}
  
  try {
    const { default: fn } = await import('pdf-parse');
    if (typeof fn === 'function') return fn(buffer);
  } catch(e) {}
  
  // Fallback: use raw text extraction
  console.warn('pdf-parse not available, using raw extraction');
  return { text: buffer.toString('utf-8').replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, ' '), numpages: 1 };
}

async function chunkText(text, maxChars = 2000, overlap = 400) {
  const chunks = [];
  let start = 0;
  let i = 0;
  while (start < text.length) {
    let end = Math.min(start + maxChars, text.length);
    if (end < text.length) {
      const w = text.slice(start, end);
      const p = w.lastIndexOf('\n\n');
      const s = w.lastIndexOf('. ');
      if (p > maxChars * 0.4) end = start + p;
      else if (s > maxChars * 0.4) end = start + s + 1;
    }
    const ct = text.slice(start, end).trim();
    if (ct.length > 30) {
      chunks.push({ content: ct, index: i });
      i++;
    }
    start = end - overlap;
    if (start >= text.length - 10) break;
  }
  return chunks;
}

async function generateEmbeddings(texts) {
  if (!OPENAI_KEY) { console.log('No OPENAI_API_KEY - skipping embeddings'); return null; }
  const all = [];
  for (let i = 0; i < texts.length; i += 20) {
    const batch = texts.slice(i, i + 20);
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: batch }),
    });
    const data = await res.json();
    all.push(...data.data.map(d => d.embedding));
  }
  return all;
}

async function processFile(fileId, fileName) {
  console.log(`\n📄 ${fileName}`);
  
  // 1. Download
  const { data: fileData, error: dlError } = await supabase.storage
    .from('ddna-repositorio').download(fileName);
  if (dlError) { console.log(`  ❌ Download: ${dlError.message}`); return false; }
  
  // 2. Extract text
  const buf = Buffer.from(await fileData.arrayBuffer());
  const result = await extractPdfText(buf);
  const text = result.text || '';
  console.log(`  📝 ${result.numpages} pages, ${text.length} chars`);
  
  if (text.length < 50) { console.log('  ❌ Too little text extracted'); return false; }
  
  // 3. Chunk
  const chunks = chunkText(text);
  console.log(`  ✂️ ${chunks.length} chunks`);
  
  // 4. Embeddings
  const texts = chunks.map(c => c.content);
  const embeddings = await generateEmbeddings(texts);
  if (embeddings) console.log(`  🧠 ${embeddings.length} embeddings`);
  
  // 5. Insert chunks
  const rows = chunks.map((c, i) => ({
    repo_file_id: fileId,
    chunk_index: c.index,
    content: c.content,
    embedding: embeddings ? embeddings[i] : null,
    metadata: { source: fileName, type: 'pdf' },
  }));
  
  const { error: insError } = await supabase.from('doc_chunks').insert(rows);
  if (insError) { console.log(`  ❌ Insert: ${insError.message}`); return false; }
  
  // 6. Mark as processed
  const { error: updError } = await supabase.from('repositorio')
    .update({ processed: true, total_chunks: chunks.length, last_processed_at: new Date().toISOString() })
    .eq('id', fileId);
  if (updError) { console.log(`  ❌ Update: ${updError.message}`); return false; }
  
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
