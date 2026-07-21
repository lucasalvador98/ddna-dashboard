/**
 * load-budget-2025.mjs — Pipeline to load 2025 budget data with NNyA weighting
 *
 * This script processes the "Gastos Administración Central" Excel from
 * Datos Abiertos de Ejecución Presupuestaria and applies NNyA weighting
 * based on the DNPPE/UNICEF methodology.
 *
 * Usage: node scripts/load-budget-2025.mjs
 *
 * Requirements:
 * - SUPABASE_SERVICE_ROLE_KEY in .env.local
 * - Excel file in scripts/data/Gastos Administración Central - Acumulado Marzo 2025.xlsx
 */
import { supabase } from './config.mjs';
import XLSX from 'xlsx';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXCEL_PATH = resolve(
  __dirname,
  'data',
  'Gastos Administración Central - Acumulado Marzo 2025.xlsx'
);

// ─── NNyA Weighting Methodology ──────────────────────────────────────────────

/**
 * Default NNyA weights by functional area.
 * Based on DNPPE/UNICEF methodology for Córdoba province.
 *
 * These weights represent the proportion of each budget area that
 * benefits children and adolescents (0-17 years).
 */
const NNYA_WEIGHTS = {
  // Education: 100% - pure child expenditure
  '30400 - Educación Y Cultura': 1.0,

  // Health: ~30-40% - mixed expenditure (adults + children)
  '30100 - Salud': 0.3,

  // Social development: ~30% - mixed expenditure
  '30200 - Promoción Y Asistencia Social': 0.308,

  // Security: ~30% - mixed expenditure
  '20100 - Seguridad Interior': 0.3,
  '20200 - Sistema Penal': 0.3,
  '20300 - Administración De La Seguridad': 0.3,

  // Default for other areas
  default: 0.308,
};

/**
 * Map jurisdiction names to high-level areas for display.
 */
const JURISDICTION_TO_AREA = {
  '135 - Ministerio De Educación': 'Educación',
  '145 - Ministerio De Salud': 'Salud',
  '165 - Ministerio De Desarrollo Social Y Promoción Del Empleo': 'Desarrollo Social',
  '160 - Ministerio De Desarrollo Humano': 'Desarrollo Social',
  '450 - Defensoría De Los Derechos De Niñas, Niños Y Adolescentes': 'Niñez y Adolescencia',
};

/**
 * Programs that are 100% child-focused (override jurisdiction-based mapping).
 */
const CHILD_FOCUSED_PROGRAMS = [
  '383 - Infancias Primero: Educación Inicial',
  '384 - Infancias Primero: Educación Primaria',
  '427 - (C.E.) Promoción Y Protección De Niños, Niños Y Adolescentes',
  '671 - (C.E.) Políticas De Asistencia A Niños Y Adolescentes',
  '960 - (C.E.) Defensoría De Los Derechos De Niñas, Niños Y Adolescentes',
  '961 - (C.E.) Espacios Participativos De Niños, Niños Y Adolescentes',
  '966 - Sistema Integral De Monitoreo De Los Derechos De Niñas, Niños Y Adolescentes',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getArea(jurisdiction, programa) {
  // Check if it's a child-focused program
  if (programa && CHILD_FOCUSED_PROGRAMS.some(p => programa.includes(p.split(' - ')[0]))) {
    return 'Niñez y Adolescencia';
  }

  // Map from jurisdiction
  if (jurisdiction && JURISDICTION_TO_AREA[jurisdiction]) {
    return JURISDICTION_TO_AREA[jurisdiction];
  }

  // Default
  return 'Otros';
}

function getWeight(funcion) {
  if (!funcion) return NNYA_WEIGHTS['default'];

  // Match by function code
  for (const [key, weight] of Object.entries(NNYA_WEIGHTS)) {
    if (funcion.includes(key.split(' - ')[0])) {
      return weight;
    }
  }

  return NNYA_WEIGHTS['default'];
}

function formatBillions(n) {
  return `$${(n / 1e9).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} mil millones`;
}

// ─── Main Script ──────────────────────────────────────────────────────────────

console.log('\n═══ BUDGET 2025 LOAD - NNyA WEIGHTED ═══\n');
console.log(`Reading: ${EXCEL_PATH}`);

const workbook = XLSX.readFile(EXCEL_PATH);
const ws = workbook.Sheets['Gastos AC'];

if (!ws) {
  console.error('❌ Sheet "Gastos AC" not found');
  process.exit(1);
}

const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
console.log(`Raw rows: ${rawRows.length}`);

// Skip header row
const dataRows = rawRows.slice(1).filter(row => row && row.length >= 11);
console.log(`Data rows: ${dataRows.length}`);

// ── Process and aggregate ──────────────────────────────────────────────────────

const aggregateMap = new Map();
let totalCrudo = 0;
let totalPonderado = 0;

for (const row of dataRows) {
  const year = row[0];
  const jurisdiction = row[2];
  const programa = row[4];
  const funcion = row[7];
  const devengado = Number(row[10] || 0);

  if (devengado <= 0) continue;

  const area = getArea(jurisdiction, programa);
  const weight = getWeight(funcion);
  const devengadoPonderado = devengado * weight;

  totalCrudo += devengado;
  totalPonderado += devengadoPonderado;

  // Aggregate by (area, programa)
  const key = `${area}|${programa}`;
  if (!aggregateMap.has(key)) {
    aggregateMap.set(key, {
      area,
      programa: programa || 'Sin programa',
      jurisdiccion: jurisdiction || 'Sin jurisdicción',
      funcion: funcion || 'Sin función',
      weight,
      devengadoCrudo: 0,
      devengadoPonderado: 0,
    });
  }

  const agg = aggregateMap.get(key);
  agg.devengadoCrudo += devengado;
  agg.devengadoPonderado += devengadoPonderado;
}

const aggregated = Array.from(aggregateMap.values());

console.log('\n═══ Summary ═══');
console.log(`Total crudo:     ${formatBillions(totalCrudo)}`);
console.log(`Total ponderado: ${formatBillions(totalPonderado)}`);
console.log(`% Ponderado:     ${((totalPonderado / totalCrudo) * 100).toFixed(1)}%`);
console.log(`\nAggregated rows: ${aggregated.length}`);

// ── Summary by area ───────────────────────────────────────────────────────────

console.log('\n═══ By Area ═══');
const byArea = new Map();
for (const agg of aggregated) {
  if (!byArea.has(agg.area)) {
    byArea.set(agg.area, { crudo: 0, ponderado: 0, count: 0 });
  }
  const area = byArea.get(agg.area);
  area.crudo += agg.devengadoCrudo;
  area.ponderado += agg.devengadoPonderado;
  area.count++;
}

for (const [area, data] of [...byArea.entries()].sort((a, b) => b[1].ponderado - a[1].ponderado)) {
  console.log(`\n${area}:`);
  console.log(`  Crudo:     ${formatBillions(data.crudo)}`);
  console.log(`  Ponderado: ${formatBillions(data.ponderado)}`);
  console.log(`  Programs:  ${data.count}`);
}

// ── Database Operations ───────────────────────────────────────────────────────

console.log('\n═══ Database Operations ═══');

// 1. DELETE existing 2025 data
console.log('\nCleaning existing 2025 inversion data...');
const { error: delError, count: delCount } = await supabase
  .from('indicadores')
  .delete({ count: 'exact' })
  .eq('categoria', 'inversion')
  .eq('periodo', 2025);

if (delError) {
  console.error(`❌ Delete failed: ${delError.message}`);
  process.exit(1);
}
console.log(`✅ Deleted ${delCount ?? '?'} existing rows`);

// 2. INSERT new data in batches
console.log('\nInserting new data...');

const now = new Date().toISOString();
const BATCH_SIZE = 200;
let insertedCount = 0;

for (let batch = 0; batch < aggregated.length; batch += BATCH_SIZE) {
  const chunk = aggregated.slice(batch, batch + BATCH_SIZE);
  const rows = chunk.map(row => ({
    indicador_nombre: 'Presupuesto provincial ponderado NNyA',
    categoria: 'inversion',
    valor: Math.round(row.devengadoPonderado * 100) / 100,
    unidad: 'pesos',
    periodo: 2025,
    region: 'Córdoba',
    fuente: 'Datos Abiertos Ejecución Presupuestaria Córdoba / Metodología DNPPE-UNICEF',
    activo: true,
    desglose: {
      area: row.area,
      programa: row.programa,
      ponderador_promedio: row.weight,
      jurisdiccion: row.jurisdiccion,
      funcion: row.funcion,
      valor_crudo: Math.round(row.devengadoCrudo * 100) / 100,
      metodologia:
        'Ponderado según proporción de NNyA en población objetivo — metodología DNPPE/UNICEF',
    },
    ultima_actualizacion: now,
  }));

  const { data, error: insError } = await supabase.from('indicadores').insert(rows).select('id');

  if (insError) {
    console.error(`❌ Insert batch ${batch / BATCH_SIZE + 1} failed: ${insError.message}`);
    console.error('   Row count:', rows.length);
    process.exit(1);
  }

  insertedCount += data?.length || rows.length;
  process.stdout.write(
    `\r  Batch ${batch / BATCH_SIZE + 1}/${Math.ceil(aggregated.length / BATCH_SIZE)} — ${insertedCount} rows inserted`
  );
}

console.log('\n');
console.log('═══ Load Complete ═══');
console.log(`✅ Total rows inserted: ${insertedCount}`);
console.log('\nRefresh the presupuesto-nnya page to see the new data.');
