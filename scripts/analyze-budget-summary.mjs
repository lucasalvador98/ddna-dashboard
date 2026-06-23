/**
 * analyze-budget-summary.mjs — Summary of budget by function and child-relevant programs
 * Usage: node scripts/analyze-budget-summary.mjs
 */
import XLSX from 'xlsx';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXCEL_PATH = resolve(
  __dirname,
  'data',
  'Gastos Administración Central - Acumulado Marzo 2025.xlsx'
);

console.log('\n═══ BUDGET SUMMARY 2025 ═══\n');

const workbook = XLSX.readFile(EXCEL_PATH);
const ws = workbook.Sheets['Gastos AC'];
const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

// Skip header row
const dataRows = rawRows.slice(1).filter(row => row && row.length >= 11);

// Aggregate by function
const byFunction = new Map();
const byJurisdiction = new Map();
const byFinalidad = new Map();

for (const row of dataRows) {
  const year = row[0];
  const jurisdiction = row[2];
  const programa = row[4];
  const finalidad = row[6];
  const funcion = row[7];
  const presupuesto = Number(row[8] || 0);
  const devengado = Number(row[10] || 0);

  // By function
  if (funcion) {
    if (!byFunction.has(funcion)) {
      byFunction.set(funcion, { presupuesto: 0, devengado: 0, count: 0 });
    }
    const fn = byFunction.get(funcion);
    fn.presupuesto += presupuesto;
    fn.devengado += devengado;
    fn.count++;
  }

  // By jurisdiction
  if (jurisdiction) {
    if (!byJurisdiction.has(jurisdiction)) {
      byJurisdiction.set(jurisdiction, { presupuesto: 0, devengado: 0, count: 0 });
    }
    const j = byJurisdiction.get(jurisdiction);
    j.presupuesto += presupuesto;
    j.devengado += devengado;
    j.count++;
  }

  // By finalidad
  if (finalidad) {
    if (!byFinalidad.has(finalidad)) {
      byFinalidad.set(finalidad, { presupuesto: 0, devengado: 0, count: 0 });
    }
    const f = byFinalidad.get(finalidad);
    f.presupuesto += presupuesto;
    f.devengado += devengado;
    f.count++;
  }
}

function formatBillions(n) {
  return `$${(n / 1e9).toFixed(2)} mil millones`;
}

function formatTrillions(n) {
  return `$${(n / 1e12).toFixed(2)} billones`;
}

// Print summary by finalidad
console.log('═══ Por Finalidad ═══');
const sortedFinalidades = [...byFinalidad.entries()].sort(
  (a, b) => b[1].devengado - a[1].devengado
);
for (const [name, data] of sortedFinalidades) {
  console.log(`\n${name}`);
  console.log(`  Presupuesto: ${formatTrillions(data.presupuesto)}`);
  console.log(`  Devengado:   ${formatTrillions(data.devengado)}`);
  console.log(`  Ejecución:   ${((data.devengado / data.presupuesto) * 100).toFixed(1)}%`);
}

// Print summary by function (top 15)
console.log('\n\n═══ Por Función (top 15 por devengado) ═══');
const sortedFunctions = [...byFunction.entries()].sort((a, b) => b[1].devengado - a[1].devengado);
for (const [name, data] of sortedFunctions.slice(0, 15)) {
  console.log(`\n${name}`);
  console.log(`  Presupuesto: ${formatBillions(data.presupuesto)}`);
  console.log(`  Devengado:   ${formatBillions(data.devengado)}`);
  console.log(`  Ejecución:   ${((data.devengado / data.presupuesto) * 100).toFixed(1)}%`);
}

// Print summary by jurisdiction (top 15)
console.log('\n\n═══ Por Jurisdicción (top 15 por devengado) ═══');
const sortedJurisdictions = [...byJurisdiction.entries()].sort(
  (a, b) => b[1].devengado - a[1].devengado
);
for (const [name, data] of sortedJurisdictions.slice(0, 15)) {
  console.log(`\n${name}`);
  console.log(`  Presupuesto: ${formatBillions(data.presupuesto)}`);
  console.log(`  Devengado:   ${formatBillions(data.devengado)}`);
  console.log(`  Ejecución:   ${((data.devengado / data.presupuesto) * 100).toFixed(1)}%`);
}

// Total
let totalPresupuesto = 0;
let totalDevengado = 0;
for (const row of dataRows) {
  totalPresupuesto += Number(row[8] || 0);
  totalDevengado += Number(row[10] || 0);
}

console.log('\n\n═══ TOTAL ═══');
console.log(`Presupuesto total: ${formatTrillions(totalPresupuesto)}`);
console.log(`Devengado total:   ${formatTrillions(totalDevengado)}`);
console.log(`Ejecución:         ${((totalDevengado / totalPresupuesto) * 100).toFixed(1)}%`);
