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
 *   4. Trocea en 2000 chars con 400 de overlap. El chunker del runtime usa 200
 *      de overlap, así que los límites difieren levemente.
 *   5. Genera los embeddings con el mismo modelo y endpoint que el runtime.
 *      Sin embeddings los chunks quedan invisibles para search_doc_chunks, que
 *      filtra `embedding IS NOT NULL`. Se generan ANTES de borrar nada.
 *   6. Inserta los chunks nuevos y reemplaza los viejos de ese archivo.
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

// Mismos valores que src/lib/ai-config.ts, para que los vectores sean
// comparables con los que genera el runtime al subir un archivo nuevo.
const EMBEDDING_BASE_URL = (
  process.env.OPENAI_EMBEDDING_BASE_URL ||
  process.env.OPENAI_BASE_URL ||
  'https://api.openai.com/v1'
).replace(/\/+$/, '');
const EMBEDDING_API_KEY =
  process.env.OPENAI_EMBEDDING_API_KEY || process.env.OPENAI_API_KEY || '';
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = process.env.OPENAI_EMBEDDING_DIMENSIONS
  ? Number(process.env.OPENAI_EMBEDDING_DIMENSIONS)
  : undefined;
const EMBEDDING_TIMEOUT_MS = Number(process.env.OPENAI_EMBEDDING_TIMEOUT_MS) || 30_000;

/**
 * Embeddings en lotes de 100, igual que generateEmbeddingsBatch del runtime.
 * Lanza si algo falla: el llamador aborta antes de tocar la base.
 */
async function generarEmbeddings(textos) {
  if (!EMBEDDING_API_KEY) {
    throw new Error(
      'OPENAI_EMBEDDING_API_KEY (u OPENAI_API_KEY) no está configurada'
    );
  }

  const BATCH = 100;
  const salida = [];

  for (let i = 0; i < textos.length; i += BATCH) {
    const lote = textos.slice(i, i + BATCH).map(t => t.replace(/\n/g, ' '));

    const res = await fetch(`${EMBEDDING_BASE_URL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${EMBEDDING_API_KEY}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: lote,
        ...(EMBEDDING_DIMENSIONS ? { dimensions: EMBEDDING_DIMENSIONS } : {}),
      }),
      signal: AbortSignal.timeout(EMBEDDING_TIMEOUT_MS),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`embeddings HTTP ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    if (!Array.isArray(data?.data) || data.data.length !== lote.length) {
      throw new Error(
        `respuesta de embeddings incompleta (${data?.data?.length ?? 0}/${lote.length})`
      );
    }

    salida.push(...data.data.map(d => d.embedding));
    log(`embeddings ${Math.min(i + BATCH, textos.length)}/${textos.length}`);
  }

  return salida;
}

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
  let vueltas = 0;
  while (start < texto.length) {
    // Guarda contra bucles que no avanzan: antes, cuando quedaban <= OVERLAP
    // caracteres, start volvía al mismo valor y el proceso moría por OOM.
    if (++vueltas > 100000) throw new Error(`trozar: bucle infinito en start=${start}`);
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
    // Corte final: si ya llegamos al final del texto, no hay siguiente vuelta.
    // Sin esto, `end - OVERLAP` devuelve el mismo start y el bucle no avanza.
    if (end >= texto.length) break;
    start = end - OVERLAP;
  }
  return chunks;
}

async function extraerTexto(buf, extension) {
  const ext = extension.toLowerCase();
  if (ext === '.pdf') {
    const { PDFParse } = require('pdf-parse');
    // Misma forma que src/lib/rag/extractors/pdf.ts: `{ data }` y destroy()
    // siempre esperado.
    const parser = new PDFParse({ data: new Uint8Array(buf) });
    try {
      const { text } = await parser.getText();
      return text || '';
    } finally {
      await parser.destroy();
    }
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

  // Postgres rechaza U+0000 y PostgREST lo reporta como "unsupported Unicode
  // escape sequence". La extracción de PDF lo emite donde no pudo decodificar
  // una ligadura ("signi\u0000cativa"): un solo byte tumba el insert completo.
  texto = texto.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\uFFFE\uFFFF]/g, '');

  const valido = esTextoReal(texto);
  log(`validación: ${valido.ok ? 'ok' : valido.motivo}`);
  if (!valido.ok) {
    console.log(`  ❌ texto NO válido (${valido.motivo}) — no se toca la base`);
    return;
  }

  const chunks = trozar(texto);
  log(`trozado: ${chunks.length} chunks`);
  const palabras = (texto.match(/[a-záéíóúñA-ZÁÉÍÓÚÑ]{4,}/g) || []).length;
  console.log(
    `  ✅ texto real: ${texto.length} chars, ${palabras} palabras → ${chunks.length} chunks` +
      ` (antes ${chunksActuales ?? 0})`
  );

  if (!APLICAR) {
    console.log(
      `  (dry run) embeddings: ${EMBEDDING_API_KEY ? 'key presente' : 'FALTA la key — --apply fallaría'}`
    );
    return;
  }

  // Embeddings ANTES de borrar: si el proveedor falla, la base queda intacta.
  log(`generando embeddings de ${chunks.length} chunks`);
  let embeddings;
  try {
    embeddings = await generarEmbeddings(chunks.map(c => c.content));
  } catch (e) {
    console.log(`  ❌ embeddings fallaron: ${e.message.slice(0, 140)}`);
    console.log('  No se tocó la base.');
    return;
  }
  if (embeddings.length !== chunks.length || embeddings.some(v => !Array.isArray(v) || v.length === 0)) {
    console.log(`  ❌ embeddings incompletos (${embeddings.length}/${chunks.length}) — no se toca la base`);
    return;
  }

  const { error: delErr } = await supabase.from('doc_chunks').delete().eq('repo_file_id', arch.id);
  if (delErr) {
    console.log(`  ❌ error borrando viejos: ${delErr.message}`);
    return;
  }

  let falloInsercion = false;
  for (let j = 0; j < chunks.length; j += 50) {
    const lote = chunks.slice(j, j + 50).map((c, k) => ({
      repo_file_id: arch.id,
      chunk_index: c.index,
      content: c.content,
      embedding: embeddings[j + k],
      metadata: { source: arch.nombre_archivo, type: 'pdf' },
    }));
    const { error: insErr } = await supabase.from('doc_chunks').insert(lote);
    if (insErr) {
      console.log(`  ❌ error insertando: ${insErr.message}`);
      falloInsercion = true;
      break;
    }
  }

  if (falloInsercion) {
    // Los chunks viejos ya se borraron. Si el archivo queda marcado como
    // procesado con cero chunks, ni el runtime ni un reintento lo recuperan.
    await supabase.from('repositorio').update({ processed: false }).eq('id', arch.id);
    console.log('  ⚠️  inserción incompleta: quedó marcado como NO procesado.');
    console.log('  Volvé a correr el mismo comando: empieza borrando.');
    return;
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
