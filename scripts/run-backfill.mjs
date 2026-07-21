/**
 * Runner — finds unprocessed PDFs and processes them one at a time
 * Usage: node scripts/run-backfill.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { spawn } from 'child_process';

const supabase = createClient(
  'https://ppyyqrvirjqmfpqaqnxy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweXlxcnZpcmpxbWZwcWFxbnh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5MDMwNSwiZXhwIjoyMDkxNzY2MzA1fQ.g3NSsIO2Y6qGTtfvBQciTfTWyQIW0ev2tuUjY5QcYLM',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data: files } = await supabase.from('repositorio')
  .select('id, nombre_archivo').eq('processed', false).eq('tipo_documento', 'pdf');

if (!files || files.length === 0) { console.log('✅ No PDFs to process'); process.exit(0); }

console.log(`Processing ${files.length} PDFs...\n`);
let ok = 0, fail = 0;

function processOne(fileId, fileName) {
  return new Promise(resolve => {
    const child = spawn('node', ['--max-old-space-size=6144', '--expose-gc', 'scripts/process-pdf.mjs', fileId, fileName], { stdio: 'inherit' });
    child.on('close', code => {
      if (code === 0) ok++; else fail++;
      resolve();
    });
  });
}

for (const f of files) {
  await processOne(f.id, f.nombre_archivo);
}

console.log(`\n✅ ${ok} processed, ❌ ${fail} failed`);
