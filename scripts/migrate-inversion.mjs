/**
 * migrate-inversion.mjs — Data pipeline to fix "inversion social en infancia" in Supabase.
 *
 * Parses the Excel file with child-weighted budget execution data,
 * aggregates by area + year + program, cleans existing DB rows,
 * and inserts properly structured data.
 *
 * Usage: node --max-old-space-size=4096 scripts/migrate-inversion.mjs
 */

import { createClient } from '@supabase/supabase-js';
import XLSX from 'xlsx';

// ─── Config ───────────────────────────────────────────────────────────────────

const EXCEL_PATH =
  'E:/Backup Luca/DDNA/Inversion/BASE DE DATOS VISUALIZADOR al PTO 2025.xlsx';

const SUPABASE_URL = 'https://ppyyqrvirjqmfpqaqnxy.supabase.co';
const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweXlxcnZpcmpxbWZwcWFxbnh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5MDMwNSwiZXhwIjoyMDkxNzY2MzA1fQ.g3NSsIO2Y6qGTtfvBQciTfTWyQIW0ev2tuUjY5QcYLM';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Category Mapping ─────────────────────────────────────────────────────────

/**
 * Map raw Excel categories → 6 high-level areas for display.
 * Grouping rationale:
 *   - Educación: all education programs (escuelas, becas, BEG)
 *   - Salud: health programs, hospitals, obras sociales
 *   - Desarrollo Social: social assistance, food, housing, income support
 *   - Niñez y Adolescencia: child/adolescent-specific agencies and programs
 *   - Seguridad: security/justice with child relevance (if present)
 *   - Otros: deportes, ciencia, urban services, etc.
 */
const CATEGORY_AREA_MAP = {
  Educación: 'Educación',
  Salud: 'Salud',
  'Obras sociales': 'Salud',
  'Nutrición y alimentación': 'Desarrollo Social',
  'Ayuda directa': 'Desarrollo Social',
  'Condiciones de vida': 'Desarrollo Social',
  'Desarrollo e integración': 'Desarrollo Social',
  'Protección del niño y adolescente': 'Niñez y Adolescencia',
  'Deportes , recreación y cultura': 'Otros',
  'Ciencia y técnica': 'Otros',
  'Otros Servicios Urbanos': 'Otros',
};

function mapArea(rawCategory) {
  const trimmed = (rawCategory || '').trim();
  return CATEGORY_AREA_MAP[trimmed] || 'Otros';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Clean a program string: strip leading numbers and dashes, trim. */
function cleanProgramName(raw) {
  if (!raw) return 'Sin programa';
  return String(raw)
    .replace(/^\d{3,4}\s*-\s*/, '') // Remove "356 - " prefix
    .replace(/\(\s*C\.E\.?\s*\)/gi, '') // Remove "(C.E.)"
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

/** Format a number in billions with 2 decimals. */
function formatBillions(n) {
  return `$${(n / 1e9).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} B`;
}

// ─── Excel Parsing ────────────────────────────────────────────────────────────

console.log('\n═══ INVERSION DATA MIGRATION ═══\n');
console.log(`Reading: ${EXCEL_PATH}`);

const workbook = XLSX.readFile(EXCEL_PATH);
const sheetName = 'Base de datos en valores';
const ws = workbook.Sheets[sheetName];

if (!ws) {
  console.error(`❌ Sheet "${sheetName}" not found.`);
  console.log('Available sheets:', workbook.SheetNames);
  process.exit(1);
}

const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
console.log(`Raw rows: ${rawRows.length} (including header)`);

// ─── Extract & Filter ─────────────────────────────────────────────────────────

/**
 * Column indices (0-based) in "Base de datos en valores":
 *  0: AÑO
 *  3: JURISDICCION
 *  5: PROGRAMA
 * 15: Aplica (Si/No/X)
 * 16: Categoria
 * 21: Ponderador
 * 27: DEVENGADO PONDERADO
 */

const SKIP_YEARS = new Set([
  'Presupuesto 2024',
  'Presupuesto 2025',
  // We DO include "2024" (actual) but skip budget projections
  // To include 2025 projections, comment out the line below:
  //'Presupuesto 2025',
]);

const validAplica = new Set(['Si', 'SI']);

const extracted = []; // { year, jurisdiccion, programa, categoria, ponderador, devengadoPond }
let skippedEmpty = 0;
let skippedAplica = 0;
let skippedPond = 0;
let skippedYear = 0;

for (let i = 1; i < rawRows.length; i++) {
  const row = rawRows[i];
  if (!row || row.length < 28) {
    skippedEmpty++;
    continue;
  }

  const rawYear = String(row[0] || '').trim();
  if (!rawYear || SKIP_YEARS.has(rawYear)) {
    skippedYear++;
    continue;
  }

  const aplica = String(row[15] || '').trim();
  if (!validAplica.has(aplica)) {
    skippedAplica++;
    continue;
  }

  const pond = Number(row[27] || 0);
  if (pond <= 0) {
    skippedPond++;
    continue;
  }

  // Normalize year: remove "Presupuesto " prefix for 2025
  const year = rawYear.replace('Presupuesto ', '');

  extracted.push({
    year,
    jurisdiccion: String(row[3] || '').trim() || 'Sin jurisdicción',
    programa: String(row[5] || '').trim(),
    categoria: String(row[16] || '').trim(),
    ponderador: Number(row[21] || 0),
    devengadoPond: pond,
  });
}

console.log(`\nFiltering summary:`);
console.log(`  Skipped — empty/null rows:    ${skippedEmpty}`);
console.log(`  Skipped — year (projection):  ${skippedYear}`);
console.log(`  Skipped — Aplica != Si:       ${skippedAplica}`);
console.log(`  Skipped — pond <= 0:          ${skippedPond}`);
console.log(`  Extracted rows:               ${extracted.length}`);
console.log(`  Unique years:                 ${[...new Set(extracted.map(r => r.year))].sort().join(', ')}`);

// ─── Aggregate by (year, area, programa) ──────────────────────────────────────

/**
 * Aggregate key: (year, area, programa)
 * We sum DEVENGADO PONDERADO within each group.
 * Jurisdiccion is collected for the desglose (first unique value).
 */
const aggregateMap = new Map();

for (const row of extracted) {
  const area = mapArea(row.categoria);
  const progClean = cleanProgramName(row.programa);
  const key = `${row.year}|${area}|${progClean}`;

  if (!aggregateMap.has(key)) {
    aggregateMap.set(key, {
      year: row.year,
      area,
      programa: progClean,
      jurisdicciones: new Set(),
      categorias: new Set(),
      ponderadorAvg: 0,
      ponderadorCount: 0,
      devengadoPond: 0,
    });
  }

  const agg = aggregateMap.get(key);
  agg.devengadoPond += row.devengadoPond;
  agg.jurisdicciones.add(row.jurisdiccion);
  agg.categorias.add(row.categoria);
  agg.ponderadorAvg += row.ponderador;
  agg.ponderadorCount++;
}

// Convert Map to array, finalize averages
const aggregated = [];
for (const [, agg] of aggregateMap) {
  aggregated.push({
    year: agg.year,
    area: agg.area,
    programa: agg.programa,
    jurisdiccion: [...agg.jurisdicciones].slice(0, 5).join('; '),
    categoriaRaw: [...agg.categorias].slice(0, 3).join('; '),
    ponderadorAvg: agg.ponderadorCount > 0 ? agg.ponderadorAvg / agg.ponderadorCount : 0,
    devengadoPond: agg.devengadoPond,
  });
}

console.log(`\nAggregated rows: ${aggregated.length}`);

// ─── Summary by year and area ─────────────────────────────────────────────────

const areaSummary = {};
const yearSummary = {};
for (const row of aggregated) {
  if (!areaSummary[row.area]) areaSummary[row.area] = {};
  if (!areaSummary[row.area][row.year]) areaSummary[row.area][row.year] = 0;
  areaSummary[row.area][row.year] += row.devengadoPond;

  if (!yearSummary[row.year]) yearSummary[row.year] = 0;
  yearSummary[row.year] += row.devengadoPond;
}

console.log('\n═══ Data Summary ═══');
console.log(`\nTotals by year:`);
for (const year of Object.keys(yearSummary).sort()) {
  console.log(`  ${year}:  ${formatBillions(yearSummary[year])}  (${aggregated.filter(r => r.year === year).length} rows)`);
}

console.log(`\nBy area × year:`);
const areas = Object.keys(areaSummary).sort();
const years = Object.keys(yearSummary).sort();
// Header
const header = ['Area'.padEnd(22), ...years.map(y => y.padStart(12))].join('');
console.log(header);
console.log('─'.repeat(header.length));
for (const area of areas) {
  const parts = [area.padEnd(22)];
  for (const year of years) {
    const val = areaSummary[area][year];
    parts.push(val ? formatBillions(val).padStart(12) : '         —'.padStart(12));
  }
  console.log(parts.join(''));
}

// ─── DB Operations ────────────────────────────────────────────────────────────

console.log('\n═══ Database Operations ═══');

// 1. DELETE existing data
console.log('\nCleaning existing inversion data...');
const { error: delError, count: delCount } = await supabase
  .from('indicadores')
  .delete({ count: 'exact' })
  .eq('categoria', 'inversion')
  .eq('fuente', 'Ministerio de Finanzas Córdoba');

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
const insertedByYear = {};
const insertedByArea = {};

for (let batch = 0; batch < aggregated.length; batch += BATCH_SIZE) {
  const chunk = aggregated.slice(batch, batch + BATCH_SIZE);
  const rows = chunk.map(row => ({
    indicador_nombre: 'Presupuesto provincial ponderado NNyA',
    categoria: 'inversion',
    valor: Math.round(row.devengadoPond * 100) / 100, // Round to centavos
    unidad: 'pesos',
    periodo: row.year,
    region: 'Córdoba',
    fuente: 'Ministerio de Finanzas Córdoba / Visualizador PTO',
    activo: true,
    desglose: {
      area: row.area,
      programa: row.programa,
      ponderador_promedio: Math.round(row.ponderadorAvg * 10000) / 10000,
      jurisdiccion: row.jurisdiccion,
      categoria_raw: row.categoriaRaw,
      metodologia: 'Ponderado según proporción de NNyA en población objetivo de cada programa — metodología DNPPE/UNICEF',
    },
    ultima_actualizacion: now,
  }));

  const { data, error: insError } = await supabase
    .from('indicadores')
    .insert(rows)
    .select('id');

  if (insError) {
    console.error(`❌ Insert batch ${batch / BATCH_SIZE + 1} failed: ${insError.message}`);
    console.error('   Row count:', rows.length);
    process.exit(1);
  }

  insertedCount += (data?.length || rows.length);

  // Track by year and area
  for (const row of chunk) {
    insertedByYear[row.year] = (insertedByYear[row.year] || 0) + 1;
    const yearAreaKey = `${row.year}|${row.area}`;
    insertedByArea[yearAreaKey] = (insertedByArea[yearAreaKey] || 0) + 1;
  }

  process.stdout.write(`\r  Batch ${batch / BATCH_SIZE + 1}/${Math.ceil(aggregated.length / BATCH_SIZE)} — ${insertedCount} rows inserted`);
}

console.log('\n');

// ─── Final Summary ────────────────────────────────────────────────────────────

console.log('═══ Migration Complete ═══');
console.log(`\n✅ Total rows inserted: ${insertedCount}`);

console.log('\nBy year:');
for (const year of Object.keys(insertedByYear).sort()) {
  console.log(`  ${year}: ${insertedByYear[year]} rows — ${formatBillions(yearSummary[year])}`);
}

console.log('\nBy area:');
for (const area of areas) {
  const areaTotal = Object.values(areaSummary[area]).reduce((a, b) => a + b, 0);
  console.log(`  ${area}: ${formatBillions(areaTotal)} total`);
}

console.log('\n✅ Done. Refresh the inversion page to see the new data.');
