/**
 * Diagnóstico read-only: con qué material cuenta realmente el agente RAG.
 * Responde: ¿hay documentos indexados? ¿cuántos? ¿de qué? ¿qué tan largos
 * son los fragmentos que se le pasan al modelo?
 *
 * Uso: node scripts/audit-rag.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function fetchAll(table, select) {
  const rows = [];
  const PAGE = 1000;
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .order('id', { ascending: true })
      .range(offset, offset + PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

const chunkSelect = process.argv[2] || 'id, repo_file_id, chunk_index, content, metadata';
console.log('--- doc_chunks ---');
let chunks = [];
try {
  chunks = await fetchAll('doc_chunks', chunkSelect);
  console.log(`fragmentos indexados: ${chunks.length}`);
} catch (e) {
  console.log('no se pudo leer doc_chunks:', e.message);
}

const byFile = new Map();
for (const c of chunks) {
  const key = c.repo_file_id;
  if (!byFile.has(key)) byFile.set(key, { n: 0, lens: [] });
  const agg = byFile.get(key);
  agg.n += 1;
  agg.lens.push((c.content || '').length);
}

console.log(`archivos distintos: ${byFile.size}`);
const allLens = chunks.map(c => (c.content || '').length).sort((a, b) => a - b);
if (allLens.length) {
  const pct = p => allLens[Math.min(allLens.length - 1, Math.floor((allLens.length - 1) * p))];
  console.log(
    `largo de fragmento: min=${allLens[0]} p50=${pct(0.5)} p90=${pct(0.9)} max=${allLens[allLens.length - 1]}`
  );
  // Lo que el agente ve realmente: buildContext recorta a 800 chars por chunk.
  const seen = allLens.filter(l => l > 800).length;
  console.log(`fragmentos que el modelo vería RECORTADOS a 800 chars: ${seen} de ${allLens.length} (${((seen / allLens.length) * 100).toFixed(0)}%)`);
}

console.log('\n--- repositorio (archivos) ---');
try {
  const files = await fetchAll('repositorio', 'id, nombre_archivo, categoria, estado');
  const byCat = new Map();
  for (const f of files) {
    const k = f.categoria || 'sin categoría';
    byCat.set(k, (byCat.get(k) || 0) + 1);
  }
  console.log(`archivos subidos: ${files.length}`);
  for (const [cat, n] of [...byCat.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`   ${cat}: ${n}`);
  }
  const pendientes = files.filter(f => f.estado && f.estado !== 'procesado');
  console.log(`archivos NO procesados: ${pendientes.length}`);
} catch (e) {
  console.log('no se pudo leer repositorio:', e.message);
}

console.log('\n--- tamaño del conocimiento en indicadores ---');
try {
  const ind = await fetchAll('indicadores', 'categoria');
  const byCat = new Map();
  for (const r of ind) byCat.set(r.categoria || 'sin categoría', (byCat.get(r.categoria || 'sin categoría') || 0) + 1);
  console.log(`filas de indicadores: ${ind.length} en ${byCat.size} categorías`);
  for (const [cat, n] of [...byCat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    console.log(`   ${cat}: ${n}`);
  }
} catch (e) {
  console.log('no se pudo leer indicadores:', e.message);
}
