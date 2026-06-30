#!/usr/bin/env node
/**
 * migrate-monitoreo.mjs
 * ────────────────────────────────────────────────────────────────────────────────
 * Reads the monitoreo CSV and inserts data into `monitoreo_registros` and
 * `monitoreo_actores` tables in Supabase.
 *
 * Usage: node scripts/migrate-monitoreo.mjs
 * Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * CSV structure (37 columns, 2 header rows, then data):
 *   Row 1 = group headers (ignored)
 *   Row 2 = actual field names
 *   Row 3+ = data
 *
 * Transformations:
 *   - Dates (DD/MM/YYYY → YYYY-MM-DD)
 *   - Sí/No → true/false
 *   - Empty actor rows are skipped
 *   - Empty registro rows (sin titulo y medio) are skipped
 */

import { supabase } from './config.mjs';
import { readFileSync } from 'fs';

// ─── Config ────────────────────────────────────────────────────────────────────

const CSV_PATH =
  'C:/Users/20409409009/.local/share/opencode/tool-output/tool_f19077392001mtYvFL1utSjs5w';

const REGISTRO_BATCH = 50; // insert 50 registros at a time
const ACTOR_BATCH = 200; // insert 200 actores at a time
const LOG_INTERVAL = 500; // log progress every N registros

// ─── CSV Parser ────────────────────────────────────────────────────────────────

/**
 * Parse a single CSV line respecting RFC‑4180 quoting.
 * Handles: quoted fields with commas, escaped double-quotes ("" → ").
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        // Check for escaped quote ""
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip the second "
        } else {
          inQuotes = false; // end of quoted field
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

  result.push(current); // last field
  return result;
}

// ─── Data Transformers ─────────────────────────────────────────────────────────

/**
 * Convert DD/MM/YYYY → YYYY-MM-DD. Returns null if unparseable.
 */
function parseDate(value) {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;

  const dmy = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

  return null;
}

/**
 * "Sí" / "Si" → true, anything else → false.
 */
function parseBoolean(value) {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v === 'sí' || v === 'si';
}

/**
 * Empty string → null. Normalizes whitespace (collapse 2+ spaces into 1)
 * to avoid check-constraint mismatches like "a  la" vs "a la".
 */
function emptyToNull(value) {
  if (!value) return null;
  const v = value.trim().replace(/\s{2,}/g, ' ');
  return v || null;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

console.log('\n═══ MONITOREO DATA MIGRATION ═══\n');

// 1. Read CSV ───────────────────────────────────────────────────────────────────

console.log(`Reading: ${CSV_PATH}`);
const csvContent = readFileSync(CSV_PATH, 'utf-8');
const lines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0);
const dataLines = lines.slice(2); // skip 2 header rows

console.log(`Total lines in file:    ${lines.length}`);
console.log(`Data rows (after skip): ${dataLines.length}`);

// 2. Parse & transform ──────────────────────────────────────────────────────────

const registros = []; // { registro: {}, actors: [] }
let skippedEmpty = 0;
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

    // Skip rows without a title AND medium
    if (!titulo && !medio) {
      skippedEmpty++;
      continue;
    }

    // ── registro row ────────────────────────────────────────────────────────
    const registro = {
      fecha_sincronizacion: parseDate(fields[1]),
      planilla: emptyToNull(fields[2]),
      quien_carga: emptyToNull(fields[3]),
      estado: emptyToNull(fields[4]) || 'PENDIENTE',
      fecha_noticia: parseDate(fields[5]),
      medio: emptyToNull(fields[6]),
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

    // ── actors ──────────────────────────────────────────────────────────────
    //  0-indexed CSV column positions for each actor group:
    //    Actor 1: desc=17, gen=18, fe=19, vv=20, rol=21, iden=22
    //    Actor 2: desc=23, gen=24, fe=25, vv=26, rol=27, iden=28
    //    Actor 3: desc=29, gen=30, fe=31, vv=32, rol=33, iden=34
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

    registros.push({ registro, actors });
  } catch (err) {
    parseErrors++;
    console.error(`  ⚠️  Parse error row ${i + 3}: ${err.message}`);
  }
}

console.log(`\nParsing summary:`);
console.log(`  Skipped (empty rows):   ${skippedEmpty}`);
console.log(`  Parse errors:           ${parseErrors}`);
console.log(`  Valid registros:        ${registros.length}`);
const totalActors = registros.reduce((s, r) => s + r.actors.length, 0);
console.log(`  Total actors:           ${totalActors}`);

if (registros.length === 0) {
  console.log('\n⚠️  No data to insert. Exiting.');
  process.exit(0);
}

// 3. DB Operations ──────────────────────────────────────────────────────────────

console.log('\n═══ Database Operations ═══\n');

// 3a. Delete existing data (for idempotency) — delete actores first (FK)
console.log('Cleaning existing data...');

const { error: delActErr } = await supabase
  .from('monitoreo_actores')
  .delete({ count: 'exact' })
  .neq('id', 0);

if (delActErr) {
  console.error(`❌ Delete actores failed: ${delActErr.message}`);
  process.exit(1);
}
console.log('✅ Existing actores deleted');

const { error: delRegErr, count: delCount } = await supabase
  .from('monitoreo_registros')
  .delete({ count: 'exact' })
  .neq('id', 0);

if (delRegErr) {
  console.error(`❌ Delete registros failed: ${delRegErr.message}`);
  process.exit(1);
}
console.log(`✅ ${delCount ?? '?'} existing registros deleted\n`);

// 3b. Insert in batches ─────────────────────────────────────────────────────────

console.log('Inserting data...');

let insertedRegistros = 0;
let insertedActores = 0;
let errorBatches = 0;
let errorRows = 0;

for (let offset = 0; offset < registros.length; offset += REGISTRO_BATCH) {
  const chunk = registros.slice(offset, offset + REGISTRO_BATCH);
  const registroRows = chunk.map(r => r.registro);

  // ── Try batch insert ──────────────────────────────────────────────────────
  const { data, error } = await supabase
    .from('monitoreo_registros')
    .insert(registroRows)
    .select('id');

  let ids;

  if (error) {
    // Batch failed → fall back to individual inserts to save what we can
    console.error(
      `  ⚠️  Batch ${Math.ceil(offset / REGISTRO_BATCH) + 1} failed (${error.message}), trying row-by-row...`
    );
    ids = [];
    for (let ri = 0; ri < chunk.length; ri++) {
      const { data: rd, error: re } = await supabase
        .from('monitoreo_registros')
        .insert(chunk[ri].registro)
        .select('id');

      if (re) {
        console.error(
          `    ✗ Row error: "${(chunk[ri].registro.titulo || '').slice(0, 60)}" → ${re.message}`
        );
        ids.push(null);
        errorRows++;
      } else {
        ids.push(rd[0].id);
      }
    }
    errorBatches++;
  } else {
    ids = (data || []).map(d => d.id);
  }

  // ── Insert actors for successfully inserted registros ─────────────────────
  const allActors = [];
  for (let ri = 0; ri < ids.length; ri++) {
    if (ids[ri] === null) continue; // registro failed, skip its actors
    for (const actor of chunk[ri].actors) {
      allActors.push({
        registro_id: ids[ri],
        ...actor,
      });
    }
  }

  if (allActors.length > 0) {
    for (let ao = 0; ao < allActors.length; ao += ACTOR_BATCH) {
      const actorChunk = allActors.slice(ao, ao + ACTOR_BATCH);
      const { error: ae } = await supabase.from('monitoreo_actores').insert(actorChunk);

      if (ae) {
        console.error(`  ⚠️  Actor sub-batch failed (registros offset ${offset}): ${ae.message}`);
      }
    }
  }

  insertedRegistros += ids.filter(id => id !== null).length;
  insertedActores += allActors.length;

  // ── Progress log ──────────────────────────────────────────────────────────
  if (
    insertedRegistros % LOG_INTERVAL < REGISTRO_BATCH ||
    offset + REGISTRO_BATCH >= registros.length
  ) {
    const pct = ((insertedRegistros / registros.length) * 100).toFixed(1);
    console.log(
      `  ${insertedRegistros}/${registros.length} registros (${pct}%) — ${insertedActores} actores`
    );
  }
}

// 4. Final Summary ──────────────────────────────────────────────────────────────

console.log('\n═══ Migration Complete ═══');
console.log(`\n✅ Registros insertados: ${insertedRegistros}`);
console.log(`✅ Actores insertados:   ${insertedActores}`);
if (errorBatches > 0) {
  console.log(`⚠️  Batches with fallback: ${errorBatches}`);
}
if (errorRows > 0) {
  console.log(`⚠️  Registros fallidos:    ${errorRows}`);
}
console.log('');
