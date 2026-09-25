/**
 * Runner — finds unprocessed PDFs and processes them one at a time
 * Usage: node scripts/run-backfill.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { spawn } from 'child_process';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.CLOUD_SUPABASE_URL;
const SERVICE_KEY = process.env.CLOUD_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ CLOUD_SUPABASE_URL and CLOUD_SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

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
