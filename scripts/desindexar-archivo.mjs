/**
 * Desindexa un archivo del conocimiento del agente RAG.
 *
 * Borra las filas de `doc_chunks` de ese archivo, que es lo que el agente lee.
 * El archivo en Storage y su fila en `repositorio` no se tocan salvo --con-archivo.
 *
 * DRY-RUN por defecto. Para ejecutar de verdad: --apply
 * Para borrar también la fila en `repositorio`: --con-archivo
 *
 * Uso:
 *   node scripts/desindexar-archivo.mjs "Medios Base de datos"          (dry-run)
 *   node scripts/desindexar-archivo.mjs "Medios Base de datos" --apply
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env.local') });

const patron = process.argv[2];
const APLICAR = process.argv.includes('--apply');
const CON_ARCHIVO = process.argv.includes('--con-archivo');

if (!patron) {
  console.error('Uso: node scripts/desindexar-archivo.mjs "<texto del nombre>" [--apply] [--con-archivo]');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// 1) Encontrar el archivo por nombre
const { data: archivos, error: errArch } = await supabase
  .from('repositorio')
  .select('id, nombre_archivo, categoria')
  .ilike('nombre_archivo', `%${patron}%`);

if (errArch) throw new Error('repositorio: ' + errArch.message);
if (!archivos?.length) {
  console.log(`Ningún archivo coincide con "${patron}".`);
  process.exit(0);
}

console.log(`\nArchivos que coinciden con "${patron}":`);
for (const a of archivos) console.log(`  ${a.id}  [${a.categoria}]  ${a.nombre_archivo}`);

// 2) Contar los fragmentos de cada uno (para no borrar a ciegas)
const objetivos = archivos.filter(a => a.nombre_archivo.toLowerCase().includes('medios base de datos'));
const seleccion = objetivos.length ? objetivos : archivos;

console.log(`\n${APLICAR ? 'APLICANDO' : 'DRY RUN'} — fragmentos a desindexar:\n`);
let total = 0;
for (const a of seleccion) {
  const { count } = await supabase
    .from('doc_chunks')
    .select('id', { count: 'exact', head: true })
    .eq('repo_file_id', a.id);
  total += count || 0;
  console.log(`  ${String(count).padStart(5)} fragmentos  ${a.nombre_archivo}`);
}
console.log(`  ${'-'.repeat(40)}`);
console.log(`  ${String(total).padStart(5)} en total\n`);

if (!APLICAR) {
  console.log('Dry run: no se borró nada. Para ejecutar: --apply');
  console.log('Para borrar también la fila del archivo: --con-archivo\n');
  process.exit(0);
}

// 3) Borrar
for (const a of seleccion) {
  const { error, count } = await supabase
    .from('doc_chunks')
    .delete({ count: 'exact' })
    .eq('repo_file_id', a.id);
  if (error) {
    console.error(`ERROR borrando ${a.nombre_archivo}: ${error.message}`);
    process.exit(1);
  }
  console.log(`  borrados ${count} fragmentos de ${a.nombre_archivo}`);
}

if (CON_ARCHIVO) {
  for (const a of seleccion) {
    const { error } = await supabase.from('repositorio').delete().eq('id', a.id);
    console.log(error ? `  ERROR borrando fila: ${error.message}` : `  borrada la fila de ${a.nombre_archivo}`);
  }
} else {
  console.log('\nLa fila en `repositorio` se conservó (usá --con-archivo si también la querés fuera).');
}

// 4) Verificar
const { count: restan } = await supabase
  .from('doc_chunks')
  .select('id', { count: 'exact', head: true });
console.log(`\nFragmentos restantes en doc_chunks: ${restan}`);
