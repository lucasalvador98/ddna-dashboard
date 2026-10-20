#!/usr/bin/env node
/**
 * load-vulnerabilidad-sanitaria.mjs — Índice de Vulnerabilidad Sanitaria (VS)
 * por radio censal 2022-2025 → tabla `indicadores`, agregado por departamento
 * para TODA la provincia de Córdoba.
 *
 * FUENTE (recurso que pidió integrar el usuario):
 *   https://poblaciones.org/@319801
 *   https://n2t.net/ark:/26680/319801
 *   Metadata: https://mapa.poblaciones.org/services/metadata/GetWorkMetadataPdf?m=297301&d=528001&w=319801
 *   Índice 0 (mínima vulnerabilidad) a 1 (máxima). Metodología: distancia de
 *   caminata al effector de salud pública más cercano + nivel socioeconómico del
 *   Censo 2022 (ACP), a nivel radio censal. Autores: Vazquez Brust, H. Antonio —
 *   Fundación Bunge y Born. Publicado 19/03/2026.
 *
 * API (probada): https://datos-poblaciones.conicet.gov.ar/services/frontend/metrics/
 *   GetTileData?l=40201&v=742601&a=750601&u=N&x=X&y=Y&w=319801&z=Z
 * → { Data: [{ Lat, Lon, FID, VID, Value, Total, LID }] } — tiles Web Mercator.
 *
 * ASIGNACIÓN DEPARTAMENTO: la API devuelve centros de radio (Lat/Lon), el dataset
 * no trae departamento. Se hace correspondencia espacial contra los polígonos
 * oficiales de radios censales del INDEC (Censo 2022):
 *   https://infra.datos.gob.ar/catalog/modernizacion/dataset/7/distribucion/7.39/...
 *   (radios-censales-2022.csv: codigo, cod_prov, cod_dep, fraccion, radio,
 *    POB_TOT_P, VIV_TOT_P, wkt) — el CSV completo (~131 MB, 66.503 radios de todo
 *   el país) ya está descargado en `.tmp-censo/radios-censales-2022.csv`.
 * Point-in-polygon (ray casting) de cada punto de poblaciones.org contra los
 * polígonos de radios de Córdoba (prefiltrados por bbox). Respaldo: si un punto
 * cae fuera de todo polígono se descarta con conteo al final.
 *
 * FILAS generadas (checkbox única: periodo 2026, releasing año de última actualización):
 *   categoria 'salud' (CHECK constraint existente en la DB),
 *   fuente 'Fundación Bunge y Born — poblaciones.org (VS 2022-2025)',
 *   grupo_id 'vulnerabilidad_sanitaria', unidad 'índice VS (0-1)' ('radios' para el conteo):
 *   'VS promedio'          desglose {}  por departamento y provincia (region)
 *   'VS mediana'           desglose {}  por departamento y provincia
 *   'Radios censales'      desglose {}  unidad 'radios' (cantidad de radios del agregado)
 * Solo se cargan departamentos con >= 5 radios (el resto se salta con warning).
 *
 * Dry-run por defecto; `--apply` escribe.
 *
 * Uso:
 *   node scripts/load-vulnerabilidad-sanitaria.mjs           # dry-run
 *   node scripts/load-vulnerabilidad-sanitaria.mjs --apply   # inserta
 */

import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { createReadStream } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';
import { supabase } from './config.mjs';
import { fetchWithRetry } from './etl-runner.mjs';

const APPLY = process.argv.includes('--apply');

const RADIOS_CSV = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.tmp-censo', 'radios-censales-2022.csv');
const GEOCACHE = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.tmp-censo', 'vs-cordoba-radios.json');

const CATEGORIA = 'salud';
const PERIODO = 2026;
const FUENTE = 'Fundación Bunge y Born — poblaciones.org (VS 2022-2025)';
const GRUPO = 'vulnerabilidad_sanitaria';
const MIN_RADIOS = 5;

const TILE_API = 'https://datos-poblaciones.conicet.gov.ar/services/frontend/metrics/GetTileData';
const METRIC_ID = 'l=40201&v=742601&a=750601&u=N';
const WORK_ID = 319801;
const Z = 10; // tile size del barrido provincial (~0.35°)
const PROV_BBOX = { lonMin: -65.79, lonMax: -61.74, latMin: -35.01, latMax: -29.6 };

// ── Utilidades geo ───────────────────────────────────────────────────

function lonToTileX(lon, z) { return Math.floor(((lon + 180) / 360) * Math.pow(2, z)); }
function latToTileY(lat, z) {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * Math.pow(2, z));
}

/** Parsea una fila CSV respetando comillas (el WKT trae comas). */
function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; } else inQuotes = false;
      } else cur += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

/** Ray casting: punto (lon, lat) dentro de un anillo de coordenadas [lon, lat]. */
function pointInRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function pointInPolygon(lon, lat, polys) {
  for (const [outer, holes, bbox] of polys) {
    if (lon < bbox[0] || lon > bbox[2] || lat < bbox[1] || lat > bbox[3]) continue;
    if (!pointInRing(lon, lat, outer)) continue;
    let inHole = false;
    for (const hole of holes) if (pointInRing(lon, lat, hole)) { inHole = true; break; }
    if (!inHole) return true;
  }
  return false;
}

/** WKT 'POLYGON ((lon lat, ...))' o 'MULTIPOLYGON' → [[outer, holes[], bbox]] */
function parseWkt(wkt) {
  const polys = [];
  const polyMatches = wkt.matchAll(/\(\((.*?)\)\)/gs);
  let outer = null;
  const holes = [];
  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
  const track = (lon, lat) => {
    if (lon < minLon) minLon = lon;
    if (lat < minLat) minLat = lat;
    if (lon > maxLon) maxLon = lon;
    if (lat > maxLat) maxLat = lat;
  };
  // parse por anillos '[ ((..)), ((..)) ... ]'. En datos censales los radios
  // multiparte (MULTIPOLYGON) son partes independientes del mismo radio: TODOS
  // los anillos se tratan como polígonos contenedores (sin agujeros).
  const ringRe = /\(\((.*?)\)\)/gs;
  for (const rm of wkt.matchAll(ringRe)) {
    const pts = [];
    const coordRe = /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g;
    let m;
    while ((m = coordRe.exec(rm[1])) !== null) {
      const lon = Number(m[1]), lat = Number(m[2]);
      pts.push([lon, lat]);
      track(lon, lat);
    }
    if (!pts.length) continue;
    polys.push([pts, [], [minLon, minLat, maxLon, maxLat]]);
  }
  if (!polys.length) return null;
  return polys;
}

// ── 1. Polígonos de radios de Córdoba desde el CSV del INDEC ────────

async function loadRadiosPoligonos() {
  if (!existsSync(RADIOS_CSV)) throw new Error(`No existe ${RADIOS_CSV} — descargar radios-censales-2022.csv del INDEC`);
  const radios = new Map(); // codigo → { depCode, polys }
  const rl = createInterface({ input: createReadStream(RADIOS_CSV, 'utf8'), crlfDelay: Infinity });
  let first = true;
  let count = 0;
  for await (const line of rl) {
    if (first) { first = false; continue; } // header
    if (!line.trim()) continue;
    const parts = splitCsvLine(line);
    // codigo,cod_prov,cod_dep,fraccion,radio,POB_TOT_P,VIV_TOT_P,wkt
    if (parts.length < 8) continue;
    const codProv = parts[1].trim();
    if (codProv !== '14') continue; // solo Córdoba
    const codigo = parts[0].trim();
    const depCode = parts[2].trim();
    const wkt = parts[7];
    const parsed = parseWkt(wkt);
    if (!parsed) continue;
    radios.set(codigo, { depCode, polys: parsed });
    count++;
  }
  console.log(`🗺️  Radios censales de Córdoba (INDEC): ${count} (polígonos con sanitario bbox precalculado)`);
  return radios;
}

// ── 2. VS por radio desde la API de poblaciones.org ─────────────────

async function fetchVSRadios() {
  if (existsSync(GEOCACHE)) {
    console.log('♻️  Cache de radios poblaciones.org encontrado:', GEOCACHE);
    return JSON.parse(readFileSync(GEOCACHE, 'utf8'));
  }
  const x0 = lonToTileX(PROV_BBOX.lonMin, Z), x1 = lonToTileX(PROV_BBOX.lonMax, Z);
  const y0 = latToTileY(PROV_BBOX.latMax, Z), y1 = latToTileY(PROV_BBOX.latMin, Z);
  const tiles = [];
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) tiles.push({ x, y });
  console.log(`🌐 Barrido de ${tiles.length} tiles z${Z} de la provincia…`);

  const all = new Map(); // FID → { Lat, Lon, Value }
  const CONCURRENCY = 6;
  let done = 0;
  const queue = [...tiles];
  async function worker() {
    while (queue.length) {
      const { x, y } = queue.shift();
      // LIMIT EXPERIMENTAL: probamos el endpoint que ya validamos
      const url = `${TILE_API}?${METRIC_ID}&x=${x}&y=${y}&w=${WORK_ID}&z=${Z}`;
      try {
        await fetchWithRetry(url, { retries: 2, timeoutMs: 20000 });
        const res = await fetch(url);
        if (res.ok) {
          const j = await res.json();
          for (const r of j.Data ?? []) {
            if (!all.has(r.FID)) all.set(r.FID, { lat: r.Lat, lon: r.Lon, value: r.Value });
          }
        } else {
          console.warn(`  ⚠️  tile ${x}/${y}: HTTP ${res.status}`);
        }
      } catch (err) {
        console.warn(`  ⚠️  tile ${x}/${y}: ${err.message}`);
      }
      done++;
      if (done % 25 === 0) console.log(`   ${done}/${tiles.length} tiles, ${all.size} radios`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  const arr = [...all.values()];
  console.log(`🌐 Radios censales de poblaciones.org: ${arr.length}`);
  return arr;
}

// ── 3. Código de departamento → nombre de departamento (georef.ar) ──

async function loadDeptNames() {
  const url = 'https://apis.datos.gob.ar/georef/api/departamentos?provincia=14&max=100&campos=nombre,centroide,id';
  const res = await fetchWithRetry(url, { retries: 2 });
  const j = await res.json();
  // georef id: '14007' → cod_dep '007'
  const m = new Map();
  for (const d of j.departamentos ?? []) {
    if (!d.id?.startsWith('14')) continue;
    const suf = d.id.slice(2);
    m.set(suf, d.nombre);
  }
  console.log(`🏛️  ${m.size} departamentos de Córdoba (georef.ar)`);
  return m;
}

// ── Main ────────────────────────────────────────────────────────────

const [radiosPolys, vsRadios, deptNames] = await Promise.all([loadRadiosPoligonos(), fetchVSRadios(), loadDeptNames()]);

if (!existsSync(GEOCACHE)) {
  try { writeFileSync(GEOCACHE, JSON.stringify(vsRadios)); } catch (e) { console.warn('Cache no writable:', e.message); }
}

// ── Asignación espacial radio-censal → departamento ─────────────────

// índice por bbox para acelerar: solo Kyoto polygons de Córdoba con bbox;
// fallback por distancia al anillo más cercano (puntos-centroide que caen fuera
// por geometrías cóncavas): margen ~11 km
const MARGIN = 0.02; // ~2 km: solo borde cercano, evita tomar radios de provincias vecinas
function nearestRingDep(lon, lat) {
  let best = null, bestD = Infinity;
  for (const [, info] of radiosPolys) {
    for (const [outer, , bbox] of info.polys) {
      if (lon < bbox[0] - MARGIN || lon > bbox[2] + MARGIN || lat < bbox[1] - MARGIN || lat > bbox[3] + MARGIN) continue;
      let d = Infinity;
      for (let k = 0; k < outer.length; k++) {
        const dhere = Math.hypot(outer[k][0] - lon, outer[k][1] - lat);
        if (dhere < d) d = dhere;
      }
      if (d < bestD) { bestD = d; best = info; }
    }
  }
  return bestD <= MARGIN ? best : null;
}

const byDep = new Map(); // depCode → [{lat, lon, value}]
let unassigned = 0;
let fallbackUsed = 0;
for (const r of vsRadios) {
  let assigned = null;
  for (const [, info] of radiosPolys) {
    if (pointInPolygon(r.lon, r.lat, info.polys)) { assigned = info.depCode; break; }
  }
  if (!assigned) {
    const near = nearestRingDep(r.lon, r.lat);
    if (!near) { unassigned++; continue; }
    fallbackUsed++;
    assigned = near.depCode;
  }
  const depName = deptNames.get(assigned);
  if (!depName) { unassigned++; continue; }
  if (!byDep.has(depName)) byDep.set(depName, []);
  byDep.get(depName).push(r.value);
}
console.log(`📍 Asignados ${vsRadios.length - unassigned}/${vsRadios.length} (${unassigned} sin polígono/departamento; ${fallbackUsed} por radio más cercano)`);
console.log(`   (${unassigned} radios descartados: fuera de todo polígono censal de Córdoba — provincias vecinas dentro del bbox de barrido)`);

const mediana = (v) => {
  const s = [...v].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

const byRegionRows = [];
for (const [depName, values] of [...byDep.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  if (values.length < MIN_RADIOS) {
    console.warn(`  ⚠️  ${depName}: ${values.length} radios < ${MIN_RADIOS} — sin carga`);
    continue;
  }
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  byRegionRows.push(
    { region: depName, promedio: +avg.toFixed(4), mediana: +mediana(values).toFixed(4), radios: values.length },
  );
}
{
  // Agregado provincial consistente con los departamentos: solo radios asignados.
  const all = [...byDep.values()].flat();
  byRegionRows.push({ region: 'Córdoba', promedio: +(all.reduce((a, b) => a + b, 0) / all.length).toFixed(4), mediana: +mediana(all).toFixed(4), radios: all.length });
}

const rows = [];
for (const { region, promedio, mediana, radios } of byRegionRows) {
  rows.push(
    {
      indicador_nombre: 'VS promedio',
      categoria: CATEGORIA, valor: promedio, unidad: 'índice VS (0-1)',
      periodo: PERIODO, region, desglose: {}, fuente: FUENTE,
      grupo_id: GRUPO, orden: 0, activo: true,
    },
    {
      indicador_nombre: 'VS mediana',
      categoria: CATEGORIA, valor: mediana, unidad: 'índice VS (0-1)',
      periodo: PERIODO, region, desglose: {}, fuente: FUENTE,
      grupo_id: GRUPO, orden: 0, activo: true,
    },
    {
      indicador_nombre: 'Radios censales',
      categoria: CATEGORIA, valor: radios, unidad: 'radios',
      periodo: PERIODO, region, desglose: {}, fuente: FUENTE,
      grupo_id: GRUPO, orden: 0, activo: true,
    },
  );
}

console.log(`\n📦 ${rows.length} filas para periodo ${PERIODO} (${rows.length / 3} regiones)`);
console.log('\n— Resumen por departamento —');
for (const r of byRegionRows.sort((a, b) => a.promedio - b.promedio)) {
  console.log(`  ${r.promedio.toFixed(3)}  (${r.radios} radios)  ${r.region}`);
}

// Muestra también los radios de Deán Funes directamente (chequeo conocido)
const dfCenter = { lat: -30.4244, lon: -64.3546 };
const d2 = (la, lo) => Math.sqrt(((la - dfCenter.lat) * 111) ** 2 + ((lo - dfCenter.lon) * 111 * Math.cos(dfCenter.lat * Math.PI / 180)) ** 2);
const dfVals = vsRadios.filter((r) => d2(r.lat, r.lon) < 6).map((r) => r.value);
if (dfVals.length) console.log(`  [check Deán Funes: ${dfVals.length} radios, promedio ${(dfVals.reduce((a, b) => a + b, 0) / dfVals.length).toFixed(3)} — esperado ≈ 0,51]`);

// Pre-check con desglose completo (periodo 2026)
const canonDesglose = (d) => JSON.stringify(Object.fromEntries(Object.entries(d || {}).sort(([a], [b]) => a.localeCompare(b))));
const existing = new Set();
let offset = 0;
while (true) {
  const { data, error } = await supabase
    .from('indicadores')
    .select('indicador_nombre, periodo, region, fuente, desglose')
    .eq('categoria', CATEGORIA)
    .eq('periodo', PERIODO);
  if (error) throw new Error(`pre-check: ${error.message}`);
  if (!data || data.length === 0) break;
  for (const r of data) existing.add(`${r.indicador_nombre}|${r.region}|${canonDesglose(r.desglose)}`);
  break; // un periodo con کم filas no necesita paginación
}
const missing = rows.filter((r) => !existing.has(`${r.indicador_nombre}|${r.region}|${canonDesglose(r.desglose)}`));
console.log(`\n🧮 Pre-check: ${rows.length - missing.length} ya existen, ${missing.length} faltantes`);

if (!APPLY) {
  console.log('🏜️  Dry-run: nada escrito. Corré con --apply para insertar.');
  process.exit(0);
}

let inserted = 0;
for (let i = 0; i < missing.length; i += 500) {
  const batch = missing.slice(i, i + 500);
  const { error } = await supabase.from('indicadores').insert(batch);
  if (error) {
    console.error(`❌ Error insertando lote ${i}: ${error.message}`);
    process.exit(1);
  }
  inserted += batch.length;
}
console.log(`✅ ${inserted} filas insertadas en indicadores (periodo ${PERIODO})`);
