/**
 * Reindexa los PDF del RAG leyendo desde archivos YA DESCARGADOS en disco.
 *
 * Por qué desde disco y no desde Storage: toda ejecución que baja el archivo
 * con `supabase.storage.download()` muere con OOM a ~2GB — incluido el script
 * del repo (process-pdf.mjs) — mientras que leer el mismo archivo del disco
 * mide 25MB de heap y extrae el texto completo. La extracción no es el
 * problema; el camino de descarga sí. Los archivos se bajan aparte.
 *
 * DRY-RUN por defecto. Para ejecutar: --apply
 *
 * Uso:
 *   node scripts/reindex-local.mjs                       (lista, dry-run)
 *   node scripts/reindex-local.mjs --id <repo_file_id>   (uno, dry-run)
 *   node scripts/reindex-local.mjs --todos --apply       (todos)
 */
import { createRequire } from 'module';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env.local') });

const APLICAR = process.argv.includes('--apply');
const TODOS = process.argv.includes('--todos');
const SOLO_ID = process.argv.includes('--id')
  ? process.argv[process.argv.indexOf('--id') + 1]
  : null;
const DIR_LOCAL = process.argv.includes('--dir')
  ? process.argv[process.argv.indexOf('--dir') + 1]
  : join(tmpdir(), 'rag-pdfs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const MAX_CHARS = 2000;
const OVERLAP = 400;

const MB = () => `${(process.memoryUsage().heapUsed / 1048576).toFixed(0)}MB`;
function log(msg) {
  console.error(`  [${MB()}] ${msg}`);
}

function esTextoReal(texto) {
  if (!texto || texto.length < 100) return { ok: false, motivo: 'texto demasiado corto' };
  const muestra = texto.slice(0, 600);
  if (/%PDF-|FlateDecode|endobj|startxref|xref|\/BaseFont|\/FontDescriptor/.test(muestra)) {
    return { ok: false, motivo: 'contiene marcadores binarios del PDF' };
  }
  const letras = (texto.match(/[a-záéíóúñA-ZÁÉÍÓÚÑ]/g) || []).length;
  if (letras / texto.length < 0.45) {
    return { ok: false, motivo: `solo ${((letras / texto.length) * 100).toFixed(0)}% de letras` };
  }
  const palabras = (texto.match(/[a-záéíóúñA-ZÁÉÍÓÚÑ]{4,}/g) || []).length;
  if (palabras < 200) return { ok: false, motivo: `solo ${palabras} palabras` };
  return { ok: true };
}

function trozar(texto) {
  const chunks = [];
  let start = 0;
  let i = 0;
  while (start < texto.length) {
    // Tope duro: el bug original era que con `start = end - OVERLAP` y
    // `end == texto.length`, start queda en (len - 400) y el break pedía
    // (len - 10): nunca avanzaba y empujaba chunks hasta OOM (~2GB).
    if (chunks.length > 5000) {
      throw new Error(`trozar: ciclo sin fin en ${texto.length} chars (start=${start})`);
    }
    let end = Math.min(start + MAX_CHARS, texto.length);
    if (end < texto.length) {
      const w = texto.slice(start, end);
      const p = w.lastIndexOf('\n\n');
      const s = w.lastIndexOf('. ');
      if (p > MAX_CHARS * 0.4) end = start + p;
      else if (s > MAX_CHARS * 0.4) end = start + s + 1;
    }
    const ct = texto.slice(start, end).trim();
    if (ct.length > 30) {
      chunks.push({ index: i, content: ct });
      i++;
    }
    // Guaranteed: si end tocó el final, no queda texto que solapar.
    if (end >= texto.length) break;
    start = Math.max(end - OVERLAP, start + 1);
  }
  return chunks;
}

// El archivo local se guardó como "<id>_<nombre_sanitizado>"
function archivoLocal(id) {
  if (!existsSync(DIR_LOCAL)) return null;
  const hit = readdirSync(DIR_LOCAL).find(f => f.startsWith(`${id}_`));
  return hit ? join(DIR_LOCAL, hit) : null;
}

async function procesar(arch) {
  log(`${arch.nombre_archivo}`);
  const ruta = archivoLocal(arch.id);
  if (!ruta) {
    console.log(`  ⚠️  no está en ${DIR_LOCAL} — salteado`);
    return null;
  }

  const { count: actuales } = await supabase
    .from('doc_chunks')
    .select('id', { count: 'exact', head: true })
    .eq('repo_file_id', arch.id);

  const buf = readFileSync(ruta);
  log(`leído ${buf.length} bytes | chunks actuales: ${actuales ?? 0}`);

  const parser = new PDFParse(new Uint8Array(buf));
  await parser.load(0);
  const { text } = await parser.getText();
  const paginas = parser.getInfo()?.numPages || 0;
  parser.destroy();
  log(`extraído: ${(text || '').length} chars, ${paginas} pags`);

  const valido = esTextoReal(text);
  if (!valido.ok) {
    console.log(`  ❌ texto NO válido (${valido.motivo}) — no se toca la base`);
    return { id: arch.id, nombre: arch.nombre_archivo, ok: false };
  }

  const chunks = trozar(text);
  console.log(
    `  ✅ ${(text || '').length} chars → ${chunks.length} chunks (antes ${actuales ?? 0})`
  );

  if (!APLICAR) return { id: arch.id, nombre: arch.nombre_archivo, ok: true, chunks: chunks.length };

  const { error: delErr } = await supabase.from('doc_chunks').delete().eq('repo_file_id', arch.id);
  if (delErr) {
    console.log(`  ❌ error borrando: ${delErr.message}`);
    return { id: arch.id, nombre: arch.nombre_archivo, ok: false };
  }

  for (let j = 0; j < chunks.length; j += 50) {
    const lote = chunks.slice(j, j + 50).map(c => ({
      repo_file_id: arch.id,
      chunk_index: c.index,
      content: c.content,
      metadata: { source: arch.nombre_archivo, type: 'pdf' },
    }));
    const { error: insErr } = await supabase.from('doc_chunks').insert(lote);
    if (insErr) {
      console.log(`  ❌ error insertando: ${insErr.message}`);
      break;
    }
  }

  await supabase
    .from('repositorio')
    .update({
      processed: true,
      total_chunks: chunks.length,
      last_processed_at: new Date().toISOString(),
    })
    .eq('id', arch.id);

  console.log(`  💾 reindexado`);
  if (global.gc) global.gc();
  return { id: arch.id, nombre: arch.nombre_archivo, ok: true, chunks: chunks.length };
}

async function main() {
  let query = supabase.from('repositorio').select('id, nombre_archivo, total_chunks');
  if (SOLO_ID) query = query.eq('id', SOLO_ID);
  else query = query.order('nombre_archivo');
  const { data: archivos, error } = await query.limit(30);
  if (error) throw new Error('repositorio: ' + error.message);

  console.log(`\n${APLICAR ? 'APLICANDO' : 'DRY RUN'} — reindex desde ${DIR_LOCAL}\n${'─'.repeat(66)}`);
  if (!existsSync(DIR_LOCAL)) {
    console.log(`No existe el directorio local. Bajá los archivos primero.\n`);
    return;
  }

  const locales = readdirSync(DIR_LOCAL);
  console.log(`archivos locales: ${locales.length}`);

  const objetivos = SOLO_ID
    ? archivos.filter(a => a.id === SOLO_ID)
    : archivos.filter(a => locales.some(l => l.startsWith(`${a.id}_`)));

  console.log(`a procesar: ${objetivos.length}\n`);

  let ok = 0;
  for (const arch of objetivos) {
    const r = await procesar(arch);
    if (r?.ok) ok++;
    console.log('');
  }

  console.log('─'.repeat(66));
  console.log(`${ok}/${objetivos.length} ok\n`);
  if (!APLICAR) console.log('Dry run: no se modificó nada. Usá --apply para ejecutar.\n');
}

main().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
