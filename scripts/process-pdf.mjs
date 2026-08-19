/**
 * Process a single PDF — designed for one-file-at-a-time invocation
 * Usage: node scripts/process-pdf.mjs <fileId> <fileName>
 */
const [,, fileId, fileName] = process.argv;
if (!fileId || !fileName) { console.error('Usage: node process-pdf.mjs <fileId> <fileName>'); process.exit(1); }

import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const supabase = createClient(
  'https://ppyyqrvirjqmfpqaqnxy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweXlxcnZpcmpxbWZwcWFxbnh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5MDMwNSwiZXhwIjoyMDkxNzY2MzA1fQ.g3NSsIO2Y6qGTtfvBQciTfTWyQIW0ev2tuUjY5QcYLM',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

console.log(`📄 ${fileName}`);
const { data, error } = await supabase.storage.from('ddna-repositorio').download(fileName);
if (error) { console.error(`❌ Download: ${error.message}`); process.exit(1); }

const buf = new Uint8Array(await data.arrayBuffer());
const parser = new PDFParse(buf);
await parser.load(0);
const { text } = await parser.getText();
const pages = parser.getInfo()?.numPages || 1;
parser.destroy();
if (global.gc) global.gc();

if (!text || text.length < 50) { console.error('❌ Too little text'); process.exit(1); }
console.log(`📝 ${pages} pages, ${text.length} chars`);

// Chunk
const MAX_CHARS = 2000, OVERLAP = 400;
const chunks = [];
let start = 0, i = 0;
while (start < text.length) {
  let end = Math.min(start + MAX_CHARS, text.length);
  if (end < text.length) {
    const w = text.slice(start, end);
    const p = w.lastIndexOf('\n\n'), s = w.lastIndexOf('. ');
    if (p > MAX_CHARS * 0.4) end = start + p;
    else if (s > MAX_CHARS * 0.4) end = start + s + 1;
  }
  const ct = text.slice(start, end).trim();
  if (ct.length > 30) { chunks.push({ index: i, content: ct }); i++; }
  start = end - OVERLAP;
  if (start >= text.length - 10) break;
}
console.log(`✂️ ${chunks.length} chunks`);

// Insert in batches
for (let j = 0; j < chunks.length; j += 50) {
  const batch = chunks.slice(j, j + 50).map(c => ({
    repo_file_id: fileId, chunk_index: c.index,
    content: c.content,
    metadata: { source: fileName, type: 'pdf' },
  }));
  const { error: insErr } = await supabase.from('doc_chunks').insert(batch);
  if (insErr) { console.error(`❌ Insert: ${insErr.message}`); process.exit(1); }
}

// Mark processed
await supabase.from('repositorio').update({
  processed: true, total_chunks: chunks.length,
  last_processed_at: new Date().toISOString(),
}).eq('id', fileId);

console.log(`✅ ${chunks.length} chunks saved`);
