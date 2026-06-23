/**
 * analyze-budget.mjs — Quick script to analyze the structure of the new budget Excel
 * Usage: node scripts/analyze-budget.mjs
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

console.log('\n═══ BUDGET EXCEL ANALYZER ═══\n');
console.log(`Reading: ${EXCEL_PATH}`);

const workbook = XLSX.readFile(EXCEL_PATH);

console.log(`\nAvailable sheets: ${workbook.SheetNames.join(', ')}`);

// Analyze each sheet
for (const sheetName of workbook.SheetNames) {
  console.log(`\n═══ Sheet: "${sheetName}" ═══`);

  const ws = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  console.log(`Total rows: ${rawRows.length}`);

  // Show first 5 rows to understand structure
  console.log('\nFirst 5 rows:');
  for (let i = 0; i < Math.min(5, rawRows.length); i++) {
    const row = rawRows[i];
    console.log(`  Row ${i}: ${JSON.stringify(row).substring(0, 200)}`);
  }

  // Show column headers if first row looks like headers
  if (rawRows.length > 0) {
    const headers = rawRows[0];
    console.log(`\nColumns (${headers.length}):`);
    headers.forEach((h, i) => console.log(`  ${i}: ${h}`));
  }
}
