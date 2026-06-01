/**
 * ETL: Actualizar indicadores desde APIs de datos.gob.ar
 * Ejecutar: node scripts/update-indicators.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ppyyqrvirjqmfpqaqnxy.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweXlxcnZpcmpxbWZwcWFxbnh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5MDMwNSwiZXhwIjoyMDkxNzY2MzA1fQ.g3NSsIO2Y6qGTtfvBQciTfTWyQIW0ev2tuUjY5QcYLM';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const BASE_URL = 'https://apis.datos.gob.ar/series/api/series/';

const SERIES = [
  { id: '64.2_POBLACION_NUA_0_0_41_96', nombre: 'Pobreza personas', categoria: 'pobreza', unidad: '%', fuente: 'EPH-INDEC / datos.gob.ar' },
  { id: '63.2_HOGARES_PONUA_0_0_40_49', nombre: 'Pobreza hogares', categoria: 'pobreza', unidad: '%', fuente: 'EPH-INDEC / datos.gob.ar' },
  { id: 'tmi_14', nombre: 'Mortalidad infantil (TMI Cba)', categoria: 'salud', unidad: '‰', fuente: 'DEIS / datos.gob.ar' },
  { id: 'tmi_arg', nombre: 'Mortalidad infantil (TMI)', categoria: 'salud', unidad: '‰', fuente: 'DEIS / datos.gob.ar' },
];

async function fetchSeries(id) {
  const url = `${BASE_URL}?ids=${id}&format=json&sort=desc&collapse=semester`;
  const res = await fetch(url, { redirect: 'follow' });
  const json = await res.json();
  return json.data || [];
}

async function deleteOld(nombre, categoria) {
  await supabase.from('indicadores').delete()
    .eq('indicador_nombre', nombre)
    .eq('categoria', categoria)
    .eq('fuente', 'EPH-INDEC / datos.gob.ar');
}

async function main() {
  console.log('🔄 Actualizando indicadores desde datos.gob.ar...\n');

  for (const s of SERIES) {
    console.log(`📊 ${s.nombre}`);
    const data = await fetchSeries(s.id);
    if (!data || data.length === 0) { console.log('  ⚠️ No data'); continue; }

    await deleteOld(s.nombre, s.categoria);

    const rows = data.map(([periodo, valor]) => {
      const d = new Date(periodo);
      return {
        indicador_nombre: s.nombre,
        categoria: s.categoria,
        valor: Number((Number(valor) * 100).toFixed(1)),  // API returns 0-1 proportion, convert to percentage
        unidad: s.unidad,
        periodo: d.getFullYear(),
        region: 'Córdoba',
        desglose: JSON.stringify({ semestre: Math.ceil((d.getMonth() + 1) / 6) }),
        fuente: s.fuente,
        ultima_actualizacion: new Date().toISOString(),
        activo: true,
      };
    });

    for (let i = 0; i < rows.length; i += 100) {
      const batch = rows.slice(i, i + 100);
      const { error } = await supabase.from('indicadores').insert(batch);
      if (error) { console.error(`  ❌ ${error.message}`); continue; }
    }
    console.log(`  ✅ ${rows.length} rows (${rows[0].periodo} - ${rows[rows.length - 1].periodo})`);
  }

  console.log('\n✅ Done!');
}

main().catch(console.error);
