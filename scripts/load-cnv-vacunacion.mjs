#!/usr/bin/env node
/**
 * ETL: cobertura vacunal por jurisdicción desde los PDFs del Calendario
 * Nacional de Vacunación (Ministerio de Salud de la Nación).
 *
 * Fuente (PDF, no hay API):
 *   https://www.argentina.gob.ar/sites/default/files/2019/05/nacion_-_cnv_<AÑO>_-_publicacion_final_02_09_2026.pdf
 *
 * Cada vacuna es una sección; cada fila es:
 *   Jurisdicción | Población objetivo | Dosis aplicadas | Cobertura %
 *
 * Requiere `pdftotext` (poppler) en el PATH. Usa `-enc UTF-8` porque sin eso
 * los acentos se rompen ("Córboda" -> "CM-srdoba").
 *
 * Dry-run por defecto; `--apply` escribe.
 */
import { spawnSync } from 'child_process';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { insertIfMissing } from './etl-runner.mjs';

const APPLY = process.argv.includes('--apply');
const YEARS = [2025, 2024];

const URLS = {
  2025: 'https://www.argentina.gob.ar/sites/default/files/2019/05/nacion_-_cnv_2025_-_publicacion_final_02_09_2026.pdf',
  2024: 'https://www.argentina.gob.ar/sites/default/files/2019/05/nacion_-_cnv_2024_-_publicacion_final_02_09_2026.pdf',
};

const JURISDICCIONES = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
  'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
  'Santiago del Estero', 'Tierra del Fuego', 'Tucumán', 'Total',
];

// ── Helpers ─────────────────────────────────────────────────────────

async function descargarPdf(url, destino) {
  const res = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} al bajar ${url}`);
  writeFileSync(destino, Buffer.from(await res.arrayBuffer()));
}

function extraerTexto(pdfPath) {
  const r = spawnSync('pdftotext', ['-enc', 'UTF-8', '-layout', pdfPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.error || typeof r.stdout !== 'string' || !r.stdout.length) {
    throw new Error('pdftotext falló (¿está poppler instalado?)');
  }
  return r.stdout;
}

/**
 * Parsea el texto del PDF -> [{ vacuna, region, poblacion, dosis, cobertura }]
 */
function parsear(texto) {
  const filas = [];
  let vacuna = null;
  const reSeccion = /^Cobertura\s+(.+?)\s*$/;
  // El nombre de la jurisdicción se ancla a la lista conocida (más robusto que
  // un comodín), y NO se exige fin de línea: después de la cobertura el PDF
  // trae basura de los gráficos ("35 mil", etc.).
  const reFila = new RegExp(
    `^(${JURISDICCIONES.map((j) => j.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\s+([\\d.]+)\\s+([\\d.]+)\\s+(\\d+(?:,\\d+)?)\\b`
  );

  for (const linea of texto.split('\n')) {
    const s = reSeccion.exec(linea.trim());
    // Solo son secciones de vacuna las que tienen " - " separando la vacuna de
    // la dosis ("Cobertura Hepatitis B - Dosis Neonatal < 12 hs"). Las otras
    // (rótulos de gráficos, "Cobertura por provincia y departamento") resetean
    // `vacuna` a null: si no, sus filas se atribuyen a la vacuna anterior.
    if (s) {
      vacuna = s[1].includes(' - ') ? s[1].trim() : null;
      continue;
    }
    if (!vacuna) continue;

    const m = reFila.exec(linea.trimEnd());
    if (!m) continue;

    const region = m[1].trim();
    const pob = Number(m[2].replace(/\./g, ''));
    const dosis = Number(m[3].replace(/\./g, ''));
    const cob = Number(m[4].replace(',', '.'));
    if (!Number.isFinite(pob) || !Number.isFinite(dosis) || !Number.isFinite(cob)) continue;

    filas.push({ vacuna, region, poblacion: pob, dosis, cobertura: cob });
  }
  return filas;
}

// ── Main ────────────────────────────────────────────────────────────

const tmp = mkdtempSync(join(tmpdir(), 'cnv-'));
const todas = [];

for (const anio of YEARS) {
  process.stdout.write(`\n📄 CNV ${anio}: bajando... `);
  const pdf = join(tmp, `cnv-${anio}.pdf`);
  await descargarPdf(URLS[anio], pdf);
  const texto = extraerTexto(pdf);
  const filas = parsear(texto);
  const vacunas = new Set(filas.map((f) => f.vacuna));
  console.log(`${filas.length} filas · ${vacunas.size} vacunas`);
  for (const f of filas) todas.push({ ...f, anio });
}

// Normaliza a filas de `indicadores`
const rows = todas.map((f) => ({
  indicador_nombre: `Cobertura ${f.vacuna} (CNV)`,
  categoria: 'salud',
  valor: f.cobertura,
  unidad: '%',
  periodo: f.anio,
  region: f.region,
  fuente: `Min. Salud — CNV ${f.anio}`,
  desglose: {
    vacuna: f.vacuna,
    poblacion_objetivo: f.poblacion,
    dosis_aplicadas: f.dosis,
    anio_cnv: f.anio,
  },
}));

console.log(`\n📊 Total de filas a considerar: ${rows.length}`);

// Chequeo de seguridad: claves duplicadas dentro de lo parseado (no debería haber).
const claves = rows.map((r) => `${r.periodo}|${r.region}|${r.indicador_nombre}`);
const dups = claves.length - new Set(claves).size;
const covs = rows.map((r) => r.valor);
console.log(
  `   claves únicas ${new Set(claves).size} · duplicados ${dups} · cobertura min ${Math.min(...covs)}% max ${Math.max(...covs)}%`
);
if (dups > 0) {
  console.error('❌ Hay claves duplicadas en el parseo; aborto para no ensuciar la base.');
  process.exit(1);
}

const muestra = rows.slice(0, 3);
for (const r of muestra) {
  console.log(`   ${r.region.padEnd(20)} ${r.periodo}  ${String(r.valor).padStart(6)}%  ${r.indicador_nombre.slice(0, 46)}`);
}
console.log(`   … y ${rows.length - muestra.length} más`);

const res = await insertIfMissing(rows, { apply: APPLY });
if (res.error) {
  console.error('❌ Error:', res.error.message ?? res.error);
  process.exit(1);
}
console.log(
  `\n${APPLY ? '✅' : '🏜️  DRY-RUN'} filas ${rows.length} · ya existentes ${res.existing} · ${APPLY ? `insertadas ${res.inserted}` : `a insertar ${res.missing.length}`}` +
    (APPLY ? '' : '  (usá --apply para escribir)')
);
