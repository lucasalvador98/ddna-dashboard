#!/usr/bin/env node
/**
 * load-senaf-data.mjs
 * Descarga y carga datos de SENAF (Secretaría Nacional de Niñez, Adolescencia y Familia)
 * desde datosabiertos.desarrollosocial.gob.ar a Supabase.
 *
 * Datasets:
 *   1. Programa Nacional Primeros Años — actividades por provincia (2020-2023)
 *   2. Dispositivos de aprehensión para adolescentes infractores (2021-2023)
 *   3. Línea 102 — llamadas por violencia/intervenciones (2022-2023)
 *
 * Encoding: los CSVs originales están en Latin-1/Windows-1252 (sin BOM),
 *            o UTF-8 con BOM. Se auto-detecta.
 *
 * Uso: node scripts/load-senaf-data.mjs
 * Requiere: SUPABASE_SERVICE_ROLE_KEY en .env.local
 */

import { supabase } from './config.mjs';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = resolve(__dirname, '..', '.senaf-cache');

// ─── CSV sources ──────────────────────────────────────────────────────────────

const DATASETS = [
  {
    id: 'primeros_anos',
    nombre: 'Primeros Años',
    url: 'https://web.archive.org/web/20231213221726id_/https://datosabiertos.desarrollosocial.gob.ar/dataset/a6fd5090-cb0d-4c6a-bc26-104506cd68c3/resource/91d28545-3ed3-4917-be9c-4cfd39ecffd5/download/03-senaf_primeros-anos-2020t1-2023t3.csv',
    categoria: 'senaf',
    fuente: 'SENAF — datosabiertos.desarrollosocial.gob.ar (vía Wayback Machine)',
  },
  {
    id: 'dispositivos_adolescentes',
    nombre: 'Dispositivos de aprehensión',
    url: 'https://web.archive.org/web/20231213221731id_/https://datosabiertos.desarrollosocial.gob.ar/dataset/f64aa566-35a7-4371-b18e-9c1e383ace7f/resource/d2e93ad6-d321-4d63-9256-205c4c640b99/download/dispositivos-de-aprehension-dinai-2021-2022-y-2023.csv',
    categoria: 'senaf',
    fuente: 'SENAF — datosabiertos.desarrollosocial.gob.ar (vía Wayback Machine)',
  },
  {
    id: 'linea102',
    nombre: 'Línea 102',
    url: 'https://web.archive.org/web/20231213221726id_/https://datosabiertos.desarrollosocial.gob.ar/dataset/37f77651-3061-4290-8726-223674d14040/resource/9ae57621-956f-491a-b16f-0c2eecb84c33/download/senaf_linea102-2022-202306.csv',
    categoria: 'senaf',
    fuente: 'SENAF — datosabiertos.desarrollosocial.gob.ar (vía Wayback Machine)',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

async function downloadCSV(dataset) {
  const cachePath = resolve(CACHE_DIR, `${dataset.id}.csv`);

  if (existsSync(cachePath)) {
    console.log(`  📦 Usando caché: ${cachePath}`);
    return readFileSync(cachePath);
  }

  console.log(`  🌐 Descargando: ${dataset.url}`);
  const res = await fetch(dataset.url);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} al descargar ${dataset.id}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(cachePath, buf);
  console.log(`  ✅ Descargado (${(buf.length / 1024).toFixed(0)} KB)`);
  return buf;
}

/**
 * Decode a CSV buffer auto-detecting encoding.
 * - Tries UTF-8 first.
 * - If the result has replacement chars (U+FFFD), falls back to Latin-1.
 * - Strips UTF-8 BOM if present.
 * - Normalizes \r\n → \n.
 */
function decodeCSV(buf) {
  let text;

  // Try UTF-8 first
  const utf8 = buf.toString('utf8');
  if (!utf8.includes('\uFFFD')) {
    text = utf8;
    console.log('  🔤 Encoding: UTF-8');
  } else {
    // Fallback to Latin-1 / Windows-1252
    text = new TextDecoder('latin1').decode(buf);
    console.log('  🔤 Encoding: Latin-1/Windows-1252');
  }

  // Strip UTF-8 BOM (EF BB BF → U+FEFF)
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
    console.log('  🧹 BOM eliminado');
  }

  // Normalize \r\n → \n
  if (text.includes('\r\n')) {
    text = text.replace(/\r\n/g, '\n');
    console.log('  🧹 Normalizados saltos de línea');
  }

  return text;
}

function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) return { headers: [], rows: [] };

  // Detect delimiter by counting ; vs , in header
  const firstLine = lines[0];
  const semiCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const delimiter = semiCount >= commaCount ? ';' : ',';

  const rawHeaders = parseCSVLine(firstLine, delimiter);
  // Clean headers: trim whitespace and trailing \r, normalize known quirks
  const headerMap = rawHeaders.map((h, idx) => {
    let clean = h.trim();
    // Fix: en-dash (U+2013, 0x96 in Latin-1) → ñ in header "ni–os/as"
    clean = clean.replace(/\u2013/g, 'ñ');
    // Remove any stray \r
    clean = clean.replace(/\r/g, '');
    return { raw: rawHeaders[idx], clean, index: idx };
  });

  const rows = lines.slice(1).map(line => {
    const fields = parseCSVLine(line, delimiter);
    const row = {};
    headerMap.forEach((h, i) => {
      let val = (fields[i] || '').trim().replace(/\r$/, '');
      row[h.clean] = val;
    });
    return row;
  });

  return {
    headers: headerMap.map(h => h.clean),
    rawHeaders: headerMap.map(h => h.raw),
    rows,
  };
}

function parseCSVLine(line, delimiter) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

// ─── Transformers per dataset ──────────────────────────────────────────────────

function transformPrimerosAnos(rows) {
  // Columns: provincia_nombre, provincia_id, trimestre, familias,
  //          niños/as, facilitadores_capacitados, zonas_de_crianza_nuevas
  return rows.map(r => {
    const trimestreRaw = (r.trimestre || '').trim();
    // Extract the year from "2020 Trim 1" format
    const anio = parseInt(trimestreRaw) || 0;
    const trimestreNum = anio > 0 ? anio : 0;
    const anio_ = anio > 0 ? anio : 0;

    let ninios = parseInt(r['niños/as'] || r['niños'] || r.niños || 0);
    if (isNaN(ninios)) ninios = 0;

    return {
      indicador_nombre: 'SENAF — Familias en Primeros Años',
      categoria: 'senaf',
      valor: parseFloat(r.familias) || 0,
      unidad: 'familias',
      periodo: anio_,
      region: (r.provincia_nombre || r.Provincia_ || r.provincia || '').trim(),
      desglose: {
        dataset: 'primeros_anos',
        trimestre: trimestreNum,
        ninios: ninios,
        facilitadores: parseInt(r.facilitadores_capacitados || 0),
        zonas_crianza: parseInt(r.zonas_de_crianza_nuevas || 0),
      },
      fuente: 'SENAF — datosabiertos.desarrollosocial.gob.ar',
      activo: true,
    };
  });
}

function transformDispositivos(rows) {
  // Individual-level records, NOT aggregates.
  // Columns: FECHA RELEVAMIENTO, PROVINCIA, NOMBRE DEL DISPOSITIVO,
  //          TIPO DE DISPOSITIVO, LOCALIDAD, GÉNERO, PAIS DE NACIMIENTO,
  //          EDAD, MOTIVO APREHENSION, DESTINO AL EGRESO, TIEMPO DE PERMANENCIA
  //
  // We aggregate by (provincia, año) to create standardized indicators.
  const byProvAnio = {}; // key: "prov|anio"

  for (const r of rows) {
    const fechaRaw = (r['FECHA RELEVAMIENTO'] || '').trim();
    const partes = fechaRaw.split('/');
    const anio = parseInt(partes[2] || '0');
    if (!anio) continue;

    const provincia = (r.PROVINCIA || r.provincia || '').trim() || 'Sin especificar';
    const key = `${provincia}|${anio}`;

    if (!byProvAnio[key]) {
      byProvAnio[key] = { provincia, anio, ingresos: 0, egresos: 0 };
    }

    // Each row represents one ingresos event;
    // "DESTINO AL EGRESO" non-empty means they exited.
    byProvAnio[key].ingresos += 1;
    if ((r['DESTINO AL EGRESO'] || '').trim()) {
      byProvAnio[key].egresos += 1;
    }
  }

  const result = [];
  for (const { provincia, anio, ingresos, egresos } of Object.values(byProvAnio)) {
    result.push({
      indicador_nombre: 'SENAF — Ingresos a dispositivos adolescentes',
      categoria: 'senaf',
      valor: ingresos,
      unidad: 'ingresos',
      periodo: anio,
      region: provincia,
      desglose: { dataset: 'dispositivos_adolescentes', egresos },
      fuente: 'SENAF — datosabiertos.desarrollosocial.gob.ar',
      activo: true,
    });
  }

  return result;
}

function transformLinea102(rows) {
  // Columns: provincia_nombre, provincia_id, año, mes,
  //          total_pertinentes, para_intervenciones, por_violencias
  const byYear = {};

  for (const r of rows) {
    const anio = parseInt(r.año || r.anio || r['a\xF1o'] || 0);
    if (!anio) continue;

    if (!byYear[anio]) {
      byYear[anio] = { pertinentes: 0, intervenciones: 0, violencias: 0 };
    }

    byYear[anio].pertinentes += parseInt(r.total_pertinentes || 0);
    byYear[anio].intervenciones += parseInt(r.para_intervenciones || 0);
    byYear[anio].violencias += parseInt(r.por_violencias || 0);
  }

  const result = [];
  for (const [anio, data] of Object.entries(byYear)) {
    result.push({
      indicador_nombre: 'SENAF — Llamadas pertinentes Línea 102',
      categoria: 'senaf',
      valor: data.pertinentes,
      unidad: 'llamadas',
      periodo: parseInt(anio),
      region: 'Nacional',
      desglose: {
        dataset: 'linea102',
        intervenciones: data.intervenciones,
        violencias: data.violencias,
      },
      fuente: 'SENAF — datosabiertos.desarrollosocial.gob.ar',
      activo: true,
    });
  }

  return result;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  CARGA DE DATOS SENAF');
  console.log('═══════════════════════════════════════════════════\n');

  ensureCacheDir();

  let totalInserted = 0;

  for (const dataset of DATASETS) {
    console.log(`\n📊 ${dataset.nombre} (${dataset.id})`);
    console.log('─'.repeat(50));

    try {
      // 1. Download raw bytes
      const buf = await downloadCSV(dataset);

      // 2. Decode (auto-detect UTF-8 vs Latin-1)
      const text = decodeCSV(buf);

      // 3. Parse
      const { headers, rows } = parseCSV(text);
      console.log(`  📋 Columnas (${headers.length}): ${headers.join(' · ')}`);
      console.log(`  📝 Filas: ${rows.length}`);

      // 4. Transform
      let transformed = [];
      if (dataset.id === 'primeros_anos') {
        transformed = transformPrimerosAnos(rows);
      } else if (dataset.id === 'dispositivos_adolescentes') {
        transformed = transformDispositivos(rows);
      } else if (dataset.id === 'linea102') {
        transformed = transformLinea102(rows);
      }

      if (transformed.length === 0) {
        console.log('  ⚠️  Sin datos para insertar después de transformar');
        continue;
      }

      console.log(`  🔄 Transformados: ${transformed.length} indicadores`);

      // Show sample
      console.log(`  📄 Muestra: ${JSON.stringify(transformed[0], null, 2)}`);

      // 5. Delete old data from this dataset
      console.log('  🗑️  Eliminando datos anteriores...');
      const { error: delError, count: delCount } = await supabase
        .from('indicadores')
        .delete({ count: 'exact' })
        .eq('categoria', 'senaf')
        .filter('desglose->>dataset', 'eq', dataset.id);

      if (delError) {
        console.log(`  ⚠️  Error al eliminar: ${delError.message}`);
      } else {
        console.log(`  ✅ Datos anteriores eliminados (${delCount || 0} registros)`);
      }

      // 6. Insert in batches
      const BATCH_SIZE = 500;
      let batchInserted = 0;

      for (let i = 0; i < transformed.length; i += BATCH_SIZE) {
        const batch = transformed.slice(i, i + BATCH_SIZE);
        const { data, error } = await supabase.from('indicadores').insert(batch).select();

        if (error) {
          console.error(`  ❌ Batch error (lote ${i / BATCH_SIZE + 1}): ${error.message}`);
        } else {
          batchInserted += data.length;
        }
      }

      totalInserted += batchInserted;
      console.log(`  ✅ Insertados: ${batchInserted}`);

    } catch (err) {
      console.error(`  ❌ Error en dataset ${dataset.id}: ${err.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log(`  TOTAL: ${totalInserted} registros insertados`);
  console.log('═══════════════════════════════════════════════════');

  console.log(`\n📦 Caché CSV en: ${CACHE_DIR}`);
}

main().catch(console.error);
