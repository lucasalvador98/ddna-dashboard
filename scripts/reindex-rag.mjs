/**
 * Reindexa documentos del repositorio RAG extrayendo el texto correctamente.
 *
 * Problema que arregla: el índice tiene chunks con bytes crudos del PDF
 * ("0 0 0 0 ... /Subtype /Type1 /Name /F8") en lugar del texto extraído. Los
 * archivos originales en Storage están sanos — se verificó extrayendo los 7 PDF
 * con pdf-parse v2 y dando texto real (Analisis-situacional: 3.912 palabras).
 *
 * Qué hace:
 *   1. Descarga el archivo desde Storage (bucket ddna-repositorio).
 *   2. Extrae el texto con pdf-parse v2 (`PDFParse`).
 *   3. Verifica que el texto sea REAL: letras latinas, sin marcadores de PDF.
 *      Si no lo es, NO toca la base: avisa y sigue con el resto.
 *   4. Trocea en 2000 chars con 400 de overlap (igual que el indexador original).
 *   5. Inserta los chunks nuevos y reemplaza los viejos de ese archivo.
 *
 * DRY-RUN por defecto. Para ejecutar de verdad: --apply
 *
 * Procesa UN archivo por ejecución (mismo patrón que process-pdf.mjs):
 * reindexar en bucle revienta por memoria acumulada al mantener Blobs vivos.
 *
 * Uso:
 *   node scripts/reindex-rag.mjs --todos                    (lista, dry-run)
 *   node scripts/reindex-rag.mjs --todos --apply            (bucle, un proceso por archivo)
 *   node scripts/reindex-rag.mjs --archivo "Analisis-situacional" --apply
 */
import { createRequire } from 'module';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env.local') });

const APLICAR = process.argv.includes('--apply');
const TODOS = process.argv.includes('--todos');
const argArchivo = process.argv.includes('--archivo')
  ? process.argv[process.argv.indexOf('--archivo') + 1]
  : null;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const BUCKET = 'ddna-repositorio';
const MAX_CHARS = 2000;
const OVERLAP = 400;

// ¿Esto es texto real o basura binaria del PDF?
function esTextoReal(texto) {
  if (!texto || texto.length < 100) return { ok: false, motivo: 'texto demasiado corto' };
  const muestra = texto.slice(0, 600);
  if (/%PDF-|FlateDecode|endobj|startxref|xref|\/BaseFont|\/FontDescriptor/.test(muestra)) {
    return { ok: false, motivo: 'contiene marcadores binarios del PDF' };
  }
  const letras = (texto.match(/[a-záéíóúñA-ZÁÉÍÓÚÑ]/g) || []).length;
  const proporcion = letras / texto.length;
  if (proporcion < 0.45) {
    return { ok: false, motivo: `solo ${(proporcion * 100).toFixed(0)}% de letras — parece binario` };
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
    start = end - OVERLAP;
    if (start >= texto.length - 10) break;
  }
  return chunks;
}

async function extraerTexto(buf, extension) {
  const ext = extension.toLowerCase();
  if (ext === '.pdf') {
    const { PDFParse } = require('pdf-parse');
    const parser = new PDFParse(new Uint8Array(buf));
    await parser.load(0);
    const { text } = await parser.getText();
    parser.destroy();
    if (global.gc) global.gc();
    return text || '';
  }
  return null; // xlsx/docx requieren otro extractor; se informan
}

// Log a stderr con heap: un FATAL ERROR mata el proceso sin vaciar el
// buffer de stdout, así que console.log pierde todo lo posterior. stderr
// se vacía siempre y deja ver exactamente en qué paso se fue la memoria.
const MB = () => `${(process.memoryUsage().heapUsed / 1048576).toFixed(0)}MB`;
function log(paso, extra = '') {
  console.error(`  [${MB()}] ${paso}${extra}`);
}

// ─── Un archivo ────────────────────────────────────────────────────────────
async function reindexar(arch, APLICAR) {
  const ext = (arch.nombre_archivo.match(/\.\w+$/) || [''])[0];
  const { count: chunksActuales } = await supabase
    .from('doc_chunks')
    .select('id', { count: 'exact', head: true })
    .eq('repo_file_id', arch.id);

  log(`inicio ${arch.nombre_archivo} (chunks actuales: ${chunksActuales ?? 0})`);

  const path = arch.url_storage?.split(`/storage/v1/object/public/${BUCKET}/`)[1];
  if (!path) {
    log('sin url_storage, salteado');
    return;
  }

  const { data: blob, error: dlErr } = await supabase.storage.from(BUCKET).download(path);
  if (dlErr || !blob) {
    log(`no se pudo bajar: ${dlErr?.message}`);
    return;
  }
  log(`download OK — ${blob.size} bytes`);

  const buf = Buffer.from(await blob.arrayBuffer());
  log(`Buffer.from OK — ${buf.length} bytes`);

  let texto;
  try {
    texto = await extraerTexto(buf, ext);
  } catch (e) {
    console.log(`  ❌ error extrayendo: ${e.message.slice(0, 90)}`);
    return;
  }

  if (texto === null) {
    console.log(`  ⏭️  ${ext || 'sin extensión'} no soportado (xlsx/docx), salteado`);
    return;
  }

  const valido = esTextoReal(texto);
  if (!valido.ok) {
    console.log(`  ❌ texto NO válido (${valido.motivo}) — no se toca la base`);
    return;
  }

  const chunks = trozar(texto);
  const palabras = (texto.match(/[a-záéíóúñA-ZÁÉÍÓÚÑ]{4,}/g) || []).length;
  console.log(
    `  ✅ texto real: ${texto.length} chars, ${palabras} palabras → ${chunks.length} chunks` +
      ` (antes ${chunksActuales ?? 0})`
  );

  if (!APLICAR) return;

  const { error: delErr } = await supabase.from('doc_chunks').delete().eq('repo_file_id', arch.id);
  if (delErr) {
    console.log(`  ❌ error borrando viejos: ${delErr.message}`);
    return;
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
}

async function main() {
  let query = supabase.from('repositorio').select('id, nombre_archivo, url_storage, total_chunks');
  if (argArchivo) query = query.ilike('nombre_archivo', `%${argArchivo}%`);
  const { data: archivos, error } = await query.limit(30);
  if (error) throw new Error('repositorio: ' + error.message);
  if (!archivos?.length) {
    console.log('Ningún archivo coincide.');
    return;
  }

  // Un archivo por invocación: el bucle en un solo proceso acumula memoria
  // con PDFs grandes y revienta (mismo OOM que documenta process-pdf.mjs).
  const uno = argArchivo ? archivos : archivos.slice(0, 1);
  console.log(`\n${APLICAR ? 'APLICANDO' : 'DRY RUN'} — reindexado RAG\n${'─'.repeat(70)}`);

  for (const arch of uno) {
    await reindexar(arch, APLICAR);
  }

  if (!argArchivo && archivos.length > 1) {
    console.log(`\n  Reindexado uno por invocación. Procesá los demás pasando --archivo.`);
  }

  console.log(`\n${'─'.repeat(70)}`);
  console.log(APLICAR ? 'Listo.\n' : 'Dry run: no se modificó nada. Usá --apply para ejecutar.\n');
}

main().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
