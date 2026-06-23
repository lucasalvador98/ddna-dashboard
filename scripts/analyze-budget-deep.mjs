/**
 * analyze-budget-deep.mjs — Deep analysis of budget Excel structure
 * Usage: node scripts/analyze-budget-deep.mjs
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

console.log('\n═══ DEEP BUDGET ANALYSIS ═══\n');

const workbook = XLSX.readFile(EXCEL_PATH);
const ws = workbook.Sheets['Gastos AC'];
const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

// Skip header row
const dataRows = rawRows.slice(1).filter(row => row && row.length >= 11);

console.log(`Total data rows: ${dataRows.length}`);

// Extract unique values for key columns
const years = new Set();
const jurisdictions = new Set();
const programs = new Set();
const partidas = new Set();
const finalidades = new Set();
const funciones = new Set();

let totalPresupuesto = 0;
let totalDevengado = 0;

for (const row of dataRows) {
  years.add(row[0]);
  jurisdictions.add(row[2]);
  programs.add(row[4]);
  partidas.add(row[5]);
  finalidades.add(row[6]);
  funciones.add(row[7]);

  totalPresupuesto += Number(row[8] || 0);
  totalDevengado += Number(row[10] || 0);
}

console.log('\n═══ Summary ═══');
console.log(`Years: ${[...years].sort().join(', ')}`);
console.log(`\nTotal Presupuesto Vigente: $${(totalPresupuesto / 1e12).toFixed(2)} billones`);
console.log(`Total Devengado: $${(totalDevengado / 1e12).toFixed(2)} billones`);

console.log('\n═══ Jurisdicciones (first 20) ═══');
const sortedJurisdictions = [...jurisdictions].sort();
for (const j of sortedJurisdictions.slice(0, 20)) {
  console.log(`  - ${j}`);
}
console.log(`  ... and ${sortedJurisdictions.length - 20} more`);

console.log('\n═══ Programas (first 30) ═══');
const sortedPrograms = [...programs].sort();
for (const p of sortedPrograms.slice(0, 30)) {
  console.log(`  - ${p}`);
}
console.log(`  ... and ${sortedPrograms.length - 30} more`);

console.log('\n═══ Partidas Principales ═══');
const sortedPartidas = [...partidas].sort();
for (const p of sortedPartidas) {
  console.log(`  - ${p}`);
}

console.log('\n═══ Finalidades ═══');
const sortedFinalidades = [...finalidades].sort();
for (const f of sortedFinalidades) {
  console.log(`  - ${f}`);
}

console.log('\n═══ Funciones ═══');
const sortedFunciones = [...funciones].sort();
for (const f of sortedFunciones) {
  console.log(`  - ${f}`);
}

// Look for child-relevant programs
console.log('\n═══ Programs potentially relevant to childhood/adolescence ═══');
const childKeywords = [
  'educación',
  'salud',
  'niño',
  'adolescente',
  'social',
  'comedor',
  'beca',
  'transferencia',
  'materno',
  'infantil',
];
const relevantPrograms = sortedPrograms.filter(p => {
  if (!p) return false;
  return childKeywords.some(kw => p.toLowerCase().includes(kw));
});
for (const p of relevantPrograms) {
  console.log(`  - ${p}`);
}
