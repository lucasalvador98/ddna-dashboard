/**
 * Diagnóstico read-only: magnitudes reales de los indicadores de Seguridad.
 * Objetivo: confirmar si el gráfico "Evolución de Delitos" mezcla unidades
 * (conteos absolutos vs. tasas) en un mismo eje Y.
 * Uso: node scripts/tmp-seguridad-diag.mjs
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

// Paginación: PostgREST corta en 1000 filas.
async function fetchAll() {
  const rows = [];
  const PAGE = 1000;
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await supabase
      .from('indicadores')
      .select('indicador_nombre, valor, periodo, unidad, region')
      .eq('categoria', 'seguridad')
      .order('id', { ascending: true })
      .range(offset, offset + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

const rows = await fetchAll();
console.log(`Total filas categoria=seguridad: ${rows.length}`);

const byName = new Map();
for (const r of rows) {
  const key = r.indicador_nombre;
  if (!byName.has(key)) {
    byName.set(key, { count: 0, min: Infinity, max: -Infinity, unidades: new Set(), periodos: new Set() });
  }
  const agg = byName.get(key);
  agg.count += 1;
  const v = Number(r.valor);
  if (Number.isFinite(v)) {
    agg.min = Math.min(agg.min, v);
    agg.max = Math.max(agg.max, v);
  }
  if (r.unidad) agg.unidades.add(r.unidad);
  agg.periodos.add(String(r.periodo));
}

console.log('\nIndicador | filas | min | max | unidad | periodos');
console.log('─'.repeat(100));
for (const [name, agg] of [...byName.entries()].sort((a, b) => b[1].count - a[1].count)) {
  const periodos = [...agg.periodos].sort();
  console.log(
    `${name}\n   filas=${agg.count} min=${agg.min === Infinity ? '—' : agg.min} max=${agg.max === -Infinity ? '—' : agg.max}` +
      ` unidad=${[...agg.unidades].join(',') || '—'} n_periodos=${periodos.length} [${periodos[0]}…${periodos[periodos.length - 1]}]`
  );
}
