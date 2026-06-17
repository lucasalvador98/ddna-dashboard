/**
 * load-uca-dimensions.mjs
 * Extract UCA-ODSA dimension data from EDSA CSVs and load to Supabase.
 * Source: Power BI ODSA — CSVs exported from https://app.powerbi.com
 *
 * Run: node scripts/load-uca-dimensions.mjs
 * Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { supabase } from './config.mjs';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EDSA_DIR = resolve('C:/Users/20409409009/Desktop/01. Monitoreo/EDSA');

// ─── Dimension mapping ──────────────────────────────────────────
// Maps EDSA indicator names to UCA-ODSA dimensions
const DIMENSION_MAP = {
  // Alimentación
  'Inseguridad alimentaria total (personas)': 'alimentacion',
  'Inseguridad alimentaria severa (personas)': 'alimentacion',
  'Inseguridad alimentaria total (hogares)': 'alimentacion',
  'Inseguridad alimentaria severa (hogares)': 'alimentacion',
  'Inseguridad alimentaria total (I)': 'alimentacion',
  'Inseguridad alimentaria severa (I)': 'alimentacion',

  // Crianza
  'No festejó el ultimo cumpleaños': 'crianza',
  'No suele compartir cuentos y lecturas en familia': 'crianza',
  'Déficit de acceso a actividades artísticas extra-escolares': 'crianza',
  'Déficit de acceso a actividades deportivas extra-escolares': 'crianza',
  'Propensión al trabajo doméstico intensivo': 'crianza',

  // Información
  'No suele usar internet': 'informacion',
  'No suele leer textos impresos': 'informacion',
  'Déficit en el acceso a la enseñanza computación': 'informacion',
  'Déficit en el acceso a la enseñanza de un idioma extranjero': 'informacion',

  // Empleo
  Desempleo: 'empleo',
  'Desempleo en período ampliado': 'empleo',
  'Empleo pleno de derechos': 'empleo',
  'Empleo precario': 'empleo',
  'Trabajo no registrado en la Seguridad Social': 'empleo',
  'Subempleo inestable': 'empleo',
  'Trabajadores/as pobres': 'empleo',

  // Hábitat
  Hacinamiento: 'habitat',
  'Hacinamiento (I)': 'habitat',
  'Calles sin pavimentar': 'habitat',
  'Con basurales cerca de la vivienda': 'habitat',
  'Sin acceso a agua corriente': 'habitat',
  'Sin conexión a red cloacal': 'habitat',
  'Tenencia irregular de la vivienda': 'habitat',
  'Vivienda precaria': 'habitat',
  'Déficit de saneamiento': 'habitat',

  // Multidimensional (pobreza como proxy)
  'Situación de pobreza (personas)': 'multidimensional',
  'Situación de pobreza (hogares)': 'multidimensional',
  'Situación de indigencia (personas)': 'multidimensional',
  'Situación de indigencia (hogares)': 'multidimensional',
  'Insuficiencia de ingresos (auto-percibido)': 'multidimensional',
};

// ─── CSV parsing helpers ────────────────────────────────────────

function parseCSVLine(line, delimiter = ';') {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseDecimal(str) {
  if (!str || str.trim() === '' || str.trim() === ' ') return null;
  // EDSA uses comma as decimal separator
  const cleaned = str.replace(/"/g, '').replace(',', '.').trim();
  const val = parseFloat(cleaned);
  return isNaN(val) ? null : val;
}

function readCSV(filename) {
  const filepath = resolve(EDSA_DIR, filename);
  const content = readFileSync(filepath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());

  // Detect delimiter from first line
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';

  const header = parseCSVLine(lines[0], delimiter);
  const years = header
    .slice(4)
    .map(h => parseInt(h))
    .filter(y => !isNaN(y));

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i], delimiter);
    if (fields.length < 5) continue;

    const indicator = fields[0];
    const unit = fields[1];
    const cut = fields[2];
    const category = fields[3];

    const dimension = DIMENSION_MAP[indicator];
    if (!dimension) continue; // Skip unmapped indicators

    // Parse year values
    for (let j = 0; j < years.length; j++) {
      const valor = parseDecimal(fields[j + 4]);
      if (valor === null) continue;

      rows.push({
        indicador_nombre: indicator,
        valor,
        unidad: unit,
        periodo: years[j],
        region: 'Argentina',
        desglose: {
          dimension,
          corte: cut,
          categoria: category,
          fuente: 'UCA-ODSA (EDSA)',
        },
        fuente: 'UCA-ODSA (EDSA)',
        categoria: 'pobreza',
        activo: true,
      });
    }
  }

  return rows;
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
  console.log('\n📊 Loading UCA-ODSA dimension data from EDSA CSVs...\n');

  // Read all CSVs
  const csvFiles = [
    'EDSA _HISTORICA_BASE_TOTAL_2004-2024.csv',
    'EDSA_HISTORICA_CONDICIONES_DE_VIDA_2004-2024.csv',
    'EDSA_HISTORICA_DESARROLLO_INFANTIL_2004-2024.csv',
    'EDSA_HISTORICA_CAPITAL_HUMANO_Y_SOCIAL_2004-2024.csv',
  ];

  let allRows = [];
  for (const file of csvFiles) {
    try {
      const rows = readCSV(file);
      console.log(`  ✅ ${file}: ${rows.length} records`);
      allRows.push(...rows);
    } catch (err) {
      console.error(`  ❌ ${file}: ${err.message}`);
    }
  }

  console.log(`\n📦 Total records extracted: ${allRows.length}`);

  // Summary by dimension
  const byDimension = {};
  for (const row of allRows) {
    const dim = row.desglose.dimension;
    if (!byDimension[dim]) byDimension[dim] = { count: 0, indicators: new Set(), years: new Set() };
    byDimension[dim].count++;
    byDimension[dim].indicators.add(row.indicador_nombre);
    byDimension[dim].years.add(row.periodo);
  }

  console.log('\n📊 By dimension:');
  for (const [dim, info] of Object.entries(byDimension)) {
    const years = [...info.years].sort();
    console.log(
      `  ${dim}: ${info.count} records, ${info.indicators.size} indicators (${years[0]}-${years[years.length - 1]})`
    );
  }

  // Delete existing UCA dimension data to avoid duplicates
  console.log('\n🗑️  Deleting existing UCA-ODSA data...');
  const { error: delError } = await supabase
    .from('indicadores')
    .delete()
    .eq('categoria', 'pobreza')
    .eq('fuente', 'UCA-ODSA (EDSA)');

  if (delError) {
    console.error('  ❌ Delete error:', delError.message);
  } else {
    console.log('  ✅ Deleted existing records');
  }

  // Insert in batches of 500
  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < allRows.length; i += BATCH_SIZE) {
    const batch = allRows.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase.from('indicadores').insert(batch).select();

    if (error) {
      console.error(`  ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error.message);
      console.error('  Details:', error.details);
    } else {
      inserted += data.length;
      console.log(`  ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${data.length} records`);
    }
  }

  console.log(`\n🎉 Done! Inserted ${inserted} UCA-ODSA dimension records.`);

  // Final summary
  const { count } = await supabase
    .from('indicadores')
    .select('*', { count: 'exact', head: true })
    .eq('categoria', 'pobreza')
    .eq('fuente', 'UCA-ODSA (EDSA)');

  console.log(`📊 Total UCA-ODSA records in DB: ${count}`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
