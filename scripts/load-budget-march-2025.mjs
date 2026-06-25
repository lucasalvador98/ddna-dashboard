/**
 * load-budget-march-2025.mjs — Carga datos de ejecución presupuestaria marzo 2025
 * con ponderación NNyA (metodología DNPPE/UNICEF).
 *
 * Fuente: Datos Abiertos - Ejecución Presupuestaria Marzo 2025
 *   "Gastos Administración Central - Acumulado Marzo 2025.xlsx"
 *
 * Uso: node scripts/load-budget-march-2025.mjs
 *
 * Requisitos:
 *   - SUPABASE_SERVICE_ROLE_KEY en .env.local
 *   - xlsx (npm package)
 */

import { supabase } from './config.mjs';
import XLSX from 'xlsx';

// ─── Excel Path ────────────────────────────────────────────────────────────────

const EXCEL_PATH =
  'E:/Backup Luca/DDNA/Inversion/Datos Abiertos - Ejecución Presupuestaria Marzo 2025/Gastos Administración Central - Acumulado Marzo 2025.xlsx';

// ─── NNyA Weighting Methodology ──────────────────────────────────────────────

/**
 * DNPPE/UNICEF ponderadores para Córdoba.
 *
 * Categoría A (gasto puro NNyA): Educación, Niñez → 100%
 * Categoría B (gasto ampliado con criterio NIÑEZ): Salud, Vivienda → variable %
 * Categoría C (gasto mixto/general): Infraestructura, Admin → 30.8%
 */
const AREA_WEIGHTS = {
  'Educación': 1.0,
  'Salud': 0.3,
  'Desarrollo Social': 0.308,
  'Niñez y Adolescencia': 1.0,
  'Otros': 0.308,
};

// ─── Keyword detection for child-focused programs ────────────────────────────

const NINEZ_KEYWORDS = ['niñez', 'niño', 'niña', 'infancia', 'adolescen'];

function isNinezProgram(programa) {
  if (!programa) return false;
  const lower = String(programa).toLowerCase();
  return NINEZ_KEYWORDS.some(kw => lower.includes(kw));
}

// ─── Area & Ponderador from FINALIDAD / FUNCION ─────────────────────────────

/**
 * Classify each budget row into a high-level area based on FUNCION code.
 * Niñez keyword check overrides the function-based classification.
 */
function classifyRow(programa, funcion) {
  // 1. Niñez override — child/adolescent-focused programs
  if (isNinezProgram(programa)) {
    return { area: 'Niñez y Adolescencia', weight: AREA_WEIGHTS['Niñez y Adolescencia'] };
  }

  const func = String(funcion || '').trim();

  // 2. Educación: FUNCION 304xx
  if (func.startsWith('304')) {
    return { area: 'Educación', weight: AREA_WEIGHTS['Educación'] };
  }

  // 3. Salud: FUNCION 301xx
  if (func.startsWith('301')) {
    return { area: 'Salud', weight: AREA_WEIGHTS['Salud'] };
  }

  // 4. Desarrollo Social: FUNCION 302xx
  if (func.startsWith('302')) {
    return { area: 'Desarrollo Social', weight: AREA_WEIGHTS['Desarrollo Social'] };
  }

  // 5. Otros
  return { area: 'Otros', weight: AREA_WEIGHTS['Otros'] };
}

// ─── Formatting ──────────────────────────────────────────────────────────────

function formatBillions(n) {
  if (n >= 1e12) {
    return `$${(n / 1e12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} billones`;
  }
  if (n >= 1e9) {
    return `$${(n / 1e9).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} mil millones`;
  }
  if (n >= 1e6) {
    return `$${(n / 1e6).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} millones`;
  }
  return `$${n.toLocaleString('en-US')}`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

console.log('\n═══ CARGA PRESUPUESTO MARZO 2025 — PONDERADO NNyA ═══\n');
console.log(`Excel: ${EXCEL_PATH}`);

// ── 1. Read Excel ───────────────────────────────────────────────────────────

const workbook = XLSX.readFile(EXCEL_PATH);
const ws = workbook.Sheets['Gastos AC'];

if (!ws) {
  console.error('❌ Sheet "Gastos AC" not found. Available:', workbook.SheetNames);
  process.exit(1);
}

const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
console.log(`Raw rows (incl. header): ${rawRows.length}`);

// ── 2. Process rows ─────────────────────────────────────────────────────────
//
// Column indices (0-based) from header:
//   0: AÑO, 1: MES, 2: JURISDICCION, 3: UNIDAD ADMINISTRATIVA,
//   4: PROGRAMA, 5: PARTIDA PRINCIPAL, 6: FINALIDAD, 7: FUNCION,
//   8: PRESUPUESTO VIGENTE, 9: COMPROMISO, 10: DEVENGADO, 11: PAGADO

const aggregateMap = new Map();
let totalCrudo = 0;
let totalPonderado = 0;
let skippedNoDevengado = 0;
let skippedInvalid = 0;

for (let i = 1; i < rawRows.length; i++) {
  const row = rawRows[i];
  if (!row || row.length < 12) {
    skippedInvalid++;
    continue;
  }

  const devengado = Number(row[10] || 0);
  if (devengado <= 0) {
    skippedNoDevengado++;
    continue;
  }

  const programa = String(row[4] || '').trim();
  const funcion = String(row[7] || '').trim();
  const finalidad = String(row[6] || '').trim();
  const jurisdiccion = String(row[2] || '').trim();
  const mes = Number(row[1] || 0);

  const { area, weight } = classifyRow(programa, funcion);
  const devengadoPonderado = devengado * weight;

  totalCrudo += devengado;
  totalPonderado += devengadoPonderado;

  // Aggregate key: (area, programa)
  const key = `${area}|${programa || 'Sin programa'}`;

  if (!aggregateMap.has(key)) {
    aggregateMap.set(key, {
      area,
      programa: programa || 'Sin programa',
      jurisdiccion,
      finalidad,
      funcion,
      mes,
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

console.log(`\nProcessing summary:`);
console.log(`  Data rows processed:  ${rawRows.length - 1}`);
console.log(`  Skipped — no devengado: ${skippedNoDevengado}`);
console.log(`  Skipped — invalid row:  ${skippedInvalid}`);
console.log(`  Aggregated rows:       ${aggregated.length}`);

// ── 3. Print summary ────────────────────────────────────────────────────────

console.log('\n═══ Resumen ═══');
console.log(`Total crudo:     ${formatBillions(totalCrudo)}`);
console.log(`Total ponderado: ${formatBillions(totalPonderado)}`);
console.log(`% Ponderado/Crudo: ${((totalPonderado / totalCrudo) * 100).toFixed(1)}%`);

console.log('\n═══ Por Área ═══');
const byArea = new Map();
for (const agg of aggregated) {
  if (!byArea.has(agg.area)) {
    byArea.set(agg.area, { crudo: 0, ponderado: 0, count: 0 });
  }
  const a = byArea.get(agg.area);
  a.crudo += agg.devengadoCrudo;
  a.ponderado += agg.devengadoPonderado;
  a.count++;
}

for (const [area, data] of [...byArea.entries()].sort(
  (a, b) => b[1].ponderado - a[1].ponderado
)) {
  const pct = ((data.ponderado / data.crudo) * 100).toFixed(1);
  console.log(`\n${area}:`);
  console.log(`  Crudo:     ${formatBillions(data.crudo)}`);
  console.log(`  Ponderado: ${formatBillions(data.ponderado)}`);
  console.log(`  %:         ${pct}%`);
  console.log(`  Programas: ${data.count}`);
}

// ── 4. Database Operations ──────────────────────────────────────────────────

console.log('\n═══ Operaciones DB ═══');

// 4a. DELETE existing 2025 inversion data
console.log('\nEliminando datos 2025 existentes...');
const { error: delError, count: delCount } = await supabase
  .from('indicadores')
  .delete({ count: 'exact' })
  .eq('categoria', 'inversion')
  .eq('periodo', 2025);

if (delError) {
  console.error(`❌ Delete failed: ${delError.message}`);
  process.exit(1);
}
console.log(`✅ ${delCount ?? '?'} filas eliminadas`);

// 4b. INSERT new data in batches
console.log('\nInsertando nuevos datos...');

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
    fuente: 'Ministerio de Finanzas Córdoba / Datos Abiertos',
    activo: true,
    desglose: {
      area: row.area,
      programa: row.programa,
      ponderador_promedio: row.weight,
      jurisdiccion: row.jurisdiccion,
      finalidad: row.finalidad,
      funcion: row.funcion,
      mes: row.mes,
      valor_crudo: Math.round(row.devengadoCrudo * 100) / 100,
      metodologia:
        'Ponderado según proporción de NNyA en población objetivo — metodología DNPPE/UNICEF',
    },
    ultima_actualizacion: now,
  }));

  const { data, error: insError } = await supabase.from('indicadores').insert(rows).select('id');

  if (insError) {
    console.error(`\n❌ Insert batch ${batch / BATCH_SIZE + 1} failed: ${insError.message}`);
    console.error('   Row count:', rows.length);
    if (insError.details) console.error('   Details:', insError.details);
    if (insError.hint) console.error('   Hint:', insError.hint);
    process.exit(1);
  }

  insertedCount += data?.length || rows.length;
  process.stdout.write(
    `\r  Lote ${batch / BATCH_SIZE + 1}/${Math.ceil(aggregated.length / BATCH_SIZE)} — ${insertedCount} filas insertadas`
  );
}

console.log('\n');

// ── 5. Verify ───────────────────────────────────────────────────────────────

console.log('═══ Verificación ═══');
const { data: verify, error: vError } = await supabase
  .from('indicadores')
  .select('periodo, valor, desglose')
  .eq('categoria', 'inversion')
  .eq('periodo', 2025);

if (vError) {
  console.error('❌ Verify query failed:', vError.message);
} else {
  const dbTotal = verify.reduce((sum, r) => sum + Number(r.valor || 0), 0);
  console.log(`DB total ponderado: ${formatBillions(dbTotal)}`);
  console.log(`DB rows for 2025:   ${verify.length}`);

  // By area from DB
  const dbByArea = new Map();
  for (const r of verify) {
    const area = r.desglose?.area || 'Otros';
    dbByArea.set(area, (dbByArea.get(area) || 0) + Number(r.valor || 0));
  }
  console.log('\nDB por área:');
  for (const [area, val] of [...dbByArea.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${area}: ${formatBillions(val)}`);
  }
}

console.log('\n═══ Carga Completa ═══');
console.log(`✅ Total filas insertadas: ${insertedCount}`);
console.log('✅ Refrescá la página de inversión para ver los datos.\n');
