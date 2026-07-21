/**
 * load-budget-2026-estimate.mjs — Load 2026 budget estimate based on Ley 11.088
 *
 * This script creates estimated 2026 budget data based on:
 * - Ley 11.088 (Presupuesto Provincial 2026)
 * - Historical proportions from 2024-2025 data
 * - Investment social percentage (34.7%)
 *
 * Usage: node scripts/load-budget-2026-estimate.mjs
 *
 * NOTE: This is an ESTIMATE based on the approved budget law.
 *       Actual executed data should replace this when available.
 */
import { supabase } from './config.mjs';

// ─── Ley 11.088 Constants ─────────────────────────────────────────────────────

const TOTAL_GASTOS_2026 = 11_442_371_759_000; // $11.442 billones
const INVERSION_SOCIAL_PCT = 0.347; // 34.7% del gasto total

// Historical proportions (from 2024 actual data)
const AREA_PROPORTIONS = {
  Educación: 0.684, // 68.4% de inversión social NNyA
  Salud: 0.195, // 19.5%
  'Desarrollo Social': 0.082, // 8.2%
  'Niñez y Adolescencia': 0.026, // 2.6%
  Otros: 0.013, // 1.3%
};

// Average weights by area (from 2024 actual data)
const AREA_WEIGHTS = {
  Educación: 0.963,
  Salud: 0.404,
  'Desarrollo Social': 0.425,
  'Niñez y Adolescencia': 1.0,
  Otros: 0.308,
};

// Top programs by area (representative for estimates)
const TOP_PROGRAMS = {
  Educación: [
    'Aportes Educación Secundaria, Especial Y Superior Privada',
    'Educación Secundaria',
    'Aportes Educación Inicial Y Primaria Privada',
    'Educación Técnica Y Formación Profesional',
    'Fondo Para El Financiamiento Del Sistema Educativo',
  ],
  Salud: [
    'Programa Prestacional Y Administrativo',
    'Actividades Centrales Del Ministerio De Salud',
    'Actividades Comunes De La Secretaría De Salud',
    'Actividades Comunes De La Secretaría De Prevención Y Promoción De La Salud',
  ],
  'Desarrollo Social': [
    '(P.A.I.Cor.) Programa Asistencia Integral Córdoba',
    'Asistencia Al Transporte Público',
    'Recursos Hídricos',
    'Programa De Lucha Contra El Vih-Sida',
  ],
  'Niñez y Adolescencia': [
    '(C.E.) Políticas De Asistencia A Niños Y Adolescentes',
    'Defensoría De Los Derechos De Niñas, Niños Y Adolescentes',
    'Sistema Integral De Monitoreo De Los Derechos',
  ],
  Otros: ['Infraestructura Social', 'Boleto Social Cordobes', 'Programas Nacionales Varios'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBillions(n) {
  return `$${(n / 1e12).toFixed(2)} billones`;
}

function formatMillions(n) {
  return `$${(n / 1e9).toFixed(2)} mil millones`;
}

// ─── Main Script ──────────────────────────────────────────────────────────────

console.log('\n═══ BUDGET 2026 ESTIMATE - LEY 11.088 ═══\n');

// Calculate total investment social
const inversionSocial = TOTAL_GASTOS_2026 * INVERSION_SOCIAL_PCT;
console.log(`Total gastos 2026: ${formatBillions(TOTAL_GASTOS_2026)}`);
console.log(
  `Inversión social (${INVERSION_SOCIAL_PCT * 100}%): ${formatBillions(inversionSocial)}`
);

// Calculate by area
const areaData = [];
let totalPonderado = 0;

for (const [area, proportion] of Object.entries(AREA_PROPORTIONS)) {
  const inversionArea = inversionSocial * proportion;
  const weight = AREA_WEIGHTS[area];
  const ponderado = inversionArea * weight;

  areaData.push({
    area,
    inversionCrudo: inversionArea,
    ponderador: weight,
    ponderado,
  });

  totalPonderado += ponderado;

  console.log(`\n${area}:`);
  console.log(`  Inversión área: ${formatMillions(inversionArea)}`);
  console.log(`  Ponderador: ${(weight * 100).toFixed(1)}%`);
  console.log(`  Ponderado: ${formatMillions(ponderado)}`);
}

console.log(`\n═══ Total Estimado 2026 ═══`);
console.log(`Ponderado NNyA: ${formatMillions(totalPonderado)}`);

// ── Create rows for database ──────────────────────────────────────────────────

const rows = [];
const now = new Date().toISOString();

for (const areaInfo of areaData) {
  const programs = TOP_PROGRAMS[areaInfo.area] || [];
  const programsCount = programs.length;
  const valuePerProgram = areaInfo.ponderado / programsCount;

  for (const programa of programs) {
    rows.push({
      indicador_nombre: 'Presupuesto provincial ponderado NNyA (estimado Ley 11.088)',
      categoria: 'inversion',
      valor: Math.round(valuePerProgram * 100) / 100,
      unidad: 'pesos',
      periodo: 2026,
      region: 'Córdoba',
      fuente: 'Ley 11.088 - Presupuesto Provincial 2026 / Estimación DNPPE-UNICEF',
      activo: true,
      desglose: {
        area: areaInfo.area,
        programa: programa,
        ponderador_promedio: areaInfo.ponderador,
        jurisdiccion: 'Estimación basada en Ley 11.088',
        categoria_raw: 'Estimación presupuestaria',
        es_estimacion: true,
        fuente_ley:
          'Ley N° 11.088 - Presupuesto General de la Administración Pública Provincial para el Año 2026',
        total_gastos_ley: TOTAL_GASTOS_2026,
        inversion_social_pct: INVERSION_SOCIAL_PCT,
        metodologia:
          'Estimación basada en Ley 11.088 y proporciones históricas 2024 — metodología DNPPE/UNICEF',
      },
      ultima_actualizacion: now,
    });
  }
}

console.log(`\n═══ Database Operations ═══`);
console.log(`Rows to insert: ${rows.length}`);

// 1. DELETE existing 2026 estimate data
console.log('\nCleaning existing 2026 estimate data...');
const { error: delError, count: delCount } = await supabase
  .from('indicadores')
  .delete({ count: 'exact' })
  .eq('categoria', 'inversion')
  .eq('periodo', 2026)
  .eq('indicador_nombre', 'Presupuesto provincial ponderado NNyA (estimado Ley 11.088)');

if (delError) {
  console.error(`❌ Delete failed: ${delError.message}`);
  process.exit(1);
}
console.log(`✅ Deleted ${delCount ?? '?'} existing rows`);

// 2. INSERT new data
console.log('\nInserting 2026 estimate data...');

const BATCH_SIZE = 100;
let insertedCount = 0;

for (let batch = 0; batch < rows.length; batch += BATCH_SIZE) {
  const chunk = rows.slice(batch, batch + BATCH_SIZE);

  const { data, error: insError } = await supabase.from('indicadores').insert(chunk).select('id');

  if (insError) {
    console.error(`❌ Insert batch ${batch / BATCH_SIZE + 1} failed: ${insError.message}`);
    process.exit(1);
  }

  insertedCount += data?.length || chunk.length;
  process.stdout.write(
    `\r  Batch ${batch / BATCH_SIZE + 1}/${Math.ceil(rows.length / BATCH_SIZE)} — ${insertedCount} rows inserted`
  );
}

console.log('\n');
console.log('═══ Load Complete ═══');
console.log(`✅ Total rows inserted: ${insertedCount}`);
console.log('\nNote: This is an ESTIMATE based on Ley 11.088.');
console.log('Actual executed data should replace this when available from the Visualizador PTO.');
console.log('\nRefresh the presupuesto-nnya page to see the new data.');
