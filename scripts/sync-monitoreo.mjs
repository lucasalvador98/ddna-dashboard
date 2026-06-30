#!/usr/bin/env node
/**
 * sync-monitoreo.mjs
 * ────────────────────────────────────────────────────────────────────────────────
 * Incremental sync: reads the latest CSV and inserts only NEW records
 * (by spreadsheet row ID) into monitoreo_registros + monitoreo_actores.
 *
 * Usage: node scripts/sync-monitoreo.mjs
 * Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { supabase } from './config.mjs';
import { readFileSync } from 'fs';

// ─── Config ────────────────────────────────────────────────────────────────────

const CSV_PATH =
  'C:/Users/20409409009/.local/share/opencode/tool-output/tool_f19177f950013lcOIWBnT7viEw';

const REGISTRO_BATCH = 50;
const ACTOR_BATCH = 200;
const LOG_INTERVAL = 200;

// ─── CSV Parser (RFC-4180) ────────────────────────────────────────────────────

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

// ─── Transformers ──────────────────────────────────────────────────────────────

function parseDate(value) {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;
  const dmy = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return null;
}

function parseBoolean(value) {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v === 'sí' || v === 'si';
}

function emptyToNull(value) {
  if (!value) return null;
  const v = value.trim().replace(/\s{2,}/g, ' ');
  return v || null;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

console.log('\n═══ MONITOREO INCREMENTAL SYNC ═══\n');

// 1. Get existing spreadsheet row IDs from DB ───────────────────────────────────

console.log('Fetching existing records from DB...');
const existingIds = new Set();
let page = 0;
const PAGE_SIZE = 1000;

while (true) {
  const { data, error } = await supabase
    .from('monitoreo_registros')
    .select('id')
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (error) {
    console.error(`❌ Error fetching existing records: ${error.message}`);
    process.exit(1);
  }

  if (!data || data.length === 0) break;

  // We use the sequential `id` from the DB as the reference.
  // The CSV `id` column (field[0]) is the spreadsheet row number.
  // We need to match by title + fecha_noticia + medio to find duplicates.
  page++;
  if (data.length < PAGE_SIZE) break;
}

// Better approach: fetch existing titles + dates to detect duplicates
console.log('Fetching title/date/medio fingerprints for dedup...');
const existingFingerprints = new Set();
let dedupPage = 0;

while (true) {
  const { data, error } = await supabase
    .from('monitoreo_registros')
    .select('titulo, fecha_noticia, medio')
    .range(dedupPage * PAGE_SIZE, (dedupPage + 1) * PAGE_SIZE - 1);

  if (error) {
    console.error(`❌ Error fetching fingerprints: ${error.message}`);
    process.exit(1);
  }

  if (!data || data.length === 0) break;

  for (const row of data) {
    existingFingerprints.add(`${row.titulo}|||${row.fecha_noticia}|||${row.medio}`);
  }

  if (data.length < PAGE_SIZE) break;
  dedupPage++;
}

console.log(`  Found ${existingFingerprints.size} existing records in DB\n`);

// 2. Read CSV ───────────────────────────────────────────────────────────────────

console.log(`Reading: ${CSV_PATH}`);
const csvContent = readFileSync(CSV_PATH, 'utf-8');
const lines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0);
const dataLines = lines.slice(2); // skip 2 header rows

console.log(`  Data rows in CSV: ${dataLines.length}`);

// 3. Parse & filter ─────────────────────────────────────────────────────────────

const newRegistros = [];
let skippedEmpty = 0;
let skippedDuplicate = 0;
let parseErrors = 0;

for (let i = 0; i < dataLines.length; i++) {
  try {
    const fields = parseCSVLine(dataLines[i]);

    if (fields.length < 36) {
      parseErrors++;
      continue;
    }

    const titulo = (fields[7] || '').trim();
    const medio = (fields[6] || '').trim();

    if (!titulo && !medio) {
      skippedEmpty++;
      continue;
    }

    const fechaNoticia = parseDate(fields[5]);
    const fingerprint = `${titulo}|||${fechaNoticia}|||${medio}`;

    if (existingFingerprints.has(fingerprint)) {
      skippedDuplicate++;
      continue;
    }

    const registro = {
      fecha_sincronizacion: parseDate(fields[1]),
      planilla: emptyToNull(fields[2]),
      quien_carga: emptyToNull(fields[3]),
      estado: emptyToNull(fields[4]) || 'PENDIENTE',
      fecha_noticia: fechaNoticia,
      medio,
      titulo,
      genero_periodistico: emptyToNull(fields[8]),
      seccion: emptyToNull(fields[9]),
      topico_principal: emptyToNull(fields[10]),
      caso: parseBoolean(fields[11]),
      provincia: emptyToNull(fields[12]),
      ciudad_cordoba: emptyToNull(fields[13]),
      uso_estadisticas: parseBoolean(fields[14]),
      fuente_citada_1: emptyToNull(fields[15]),
      fuente_citada_2: emptyToNull(fields[16]),
      uso_fuentes: emptyToNull(fields[35]),
    };

    const actorIndices = [
      { desc: 17, gen: 18, fe: 19, vv: 20, rol: 21, iden: 22, orden: 1 },
      { desc: 23, gen: 24, fe: 25, vv: 26, rol: 27, iden: 28, orden: 2 },
      { desc: 29, gen: 30, fe: 31, vv: 32, rol: 33, iden: 34, orden: 3 },
    ];

    const actors = [];
    for (const g of actorIndices) {
      const desc = (fields[g.desc] || '').trim();
      if (desc) {
        actors.push({
          orden: g.orden,
          actor_descripcion: desc,
          genero: emptyToNull(fields[g.gen]),
          franja_etaria: emptyToNull(fields[g.fe]),
          victimario_victima: emptyToNull(fields[g.vv]),
          rol: emptyToNull(fields[g.rol]),
          identificabilidad: parseBoolean(fields[g.iden]),
        });
      }
    }

    newRegistros.push({ registro, actors });
  } catch (err) {
    parseErrors++;
    console.error(`  ⚠️  Parse error row ${i + 3}: ${err.message}`);
  }
}

console.log(`\nParse summary:`);
console.log(`  Skipped (empty):      ${skippedEmpty}`);
console.log(`  Skipped (duplicate):  ${skippedDuplicate}`);
console.log(`  Parse errors:         ${parseErrors}`);
console.log(`  NEW registros:        ${newRegistros.length}`);
const totalNewActors = newRegistros.reduce((s, r) => s + r.actors.length, 0);
console.log(`  NEW actors:           ${totalNewActors}`);

if (newRegistros.length === 0) {
  console.log('\n✅ No new records to insert. DB is up to date.');
  process.exit(0);
}

// 4. Insert ─────────────────────────────────────────────────────────────────────

console.log('\n═══ Inserting New Records ═══\n');

let insertedRegistros = 0;
let insertedActores = 0;
let errorRows = 0;

for (let offset = 0; offset < newRegistros.length; offset += REGISTRO_BATCH) {
  const chunk = newRegistros.slice(offset, offset + REGISTRO_BATCH);
  const registroRows = chunk.map(r => r.registro);

  const { data, error } = await supabase
    .from('monitoreo_registros')
    .insert(registroRows)
    .select('id');

  let ids;

  if (error) {
    console.error(`  ⚠️  Batch failed (${error.message}), trying row-by-row...`);
    ids = [];
    for (let ri = 0; ri < chunk.length; ri++) {
      const { data: rd, error: re } = await supabase
        .from('monitoreo_registros')
        .insert(chunk[ri].registro)
        .select('id');

      if (re) {
        console.error(`    ✗ "${(chunk[ri].registro.titulo || '').slice(0, 50)}" → ${re.message}`);
        ids.push(null);
        errorRows++;
      } else {
        ids.push(rd[0].id);
      }
    }
  } else {
    ids = (data || []).map(d => d.id);
  }

  // Insert actors
  const allActors = [];
  for (let ri = 0; ri < ids.length; ri++) {
    if (ids[ri] === null) continue;
    for (const actor of chunk[ri].actors) {
      allActors.push({ registro_id: ids[ri], ...actor });
    }
  }

  if (allActors.length > 0) {
    for (let ao = 0; ao < allActors.length; ao += ACTOR_BATCH) {
      const actorChunk = allActors.slice(ao, ao + ACTOR_BATCH);
      const { error: ae } = await supabase.from('monitoreo_actores').insert(actorChunk);
      if (ae) {
        console.error(`  ⚠️  Actor batch error: ${ae.message}`);
      }
    }
  }

  insertedRegistros += ids.filter(id => id !== null).length;
  insertedActores += allActors.length;

  if (
    insertedRegistros % LOG_INTERVAL < REGISTRO_BATCH ||
    offset + REGISTRO_BATCH >= newRegistros.length
  ) {
    const pct = ((insertedRegistros / newRegistros.length) * 100).toFixed(1);
    console.log(
      `  ${insertedRegistros}/${newRegistros.length} (${pct}%) — ${insertedActores} actores`
    );
  }
}

console.log('\n═══ Sync Complete ═══');
console.log(`\n✅ New registros inserted: ${insertedRegistros}`);
console.log(`✅ New actors inserted:   ${insertedActores}`);
if (errorRows > 0) {
  console.log(`⚠️  Failed rows:           ${errorRows}`);
}
console.log('');
