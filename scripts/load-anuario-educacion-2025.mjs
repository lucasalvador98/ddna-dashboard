#!/usr/bin/env node
/**
 * load-anuario-educacion-2025.mjs — Anuario Estadístico Educativo 2025 (RA 2025)
 * Ministerio de Educación de Córdoba → tabla `indicadores`.
 *
 * Fuente: https://www.cba.gov.ar/wp-content/uploads/2026/04/Estadisticas-educativas-Anuario-2025.pdf
 * (convertido a texto en `.tmp-censo/anuario2025.txt`; curl directo da 403, funciona
 * con headers completos de browser: User-Agent Chrome + Accept + Referer).
 *
 * Estructura del texto extraído: cada cuadro tiene su TÍTULO y el bloque de datos
 * 'Region n n ...' adjacente (algunos con el título ARRIBA del bloque y otros con el
 * título ABAJO — depende del layout de la página del PDF). El parser ubica el título
 * de cada cuadro y camina en la dirección configurada recolectando las 27 filas
 * (Total Córdoba + 26 departamentos, los depts en orden alfabético y con cantidades
 * variables de columnas: los departamentos sin sector privado traen 3 o 6 números
 * en vez de 9), saltando el ruido de paginación y notas al pie.
 *
 * Nombres multi-token: 'Pte. Roque Sáenz Peña', 'Cruz del Eje', etc. se matchean
 * por prefijo más largo primero. 'Total Córdoba' → region 'Córdoba';
 * 'Pte. Roque Sáenz Peña' → 'Presidente Roque Sáenz Peña' (convención DB).
 *
 * Filas generadas (misma convención que la carga 2024 de la DB):
 *   'Unidades educativas - <nivel>'  desglose {sector: Total|Estatal|Privado}  grupo unidades_educativas
 *   'Alumnos - <nivel>'              desglose {sector} / {genero} / {grado}    grupo alumnos
 *   'Personal docente - <nivel>'     desglose {sector}                          grupo personal_docente_anuario
 *   'Docentes - <nivel>'             desglose {genero: Mujeres|Varones}         grupo docentes_anuario
 *   'Repitentes - <nivel>'           desglose {}                                grupo repitentes
 *   'Sobreedad - <nivel>'            desglose {}                                grupo sobreedad
 *   'Tasa de repitencia - <nivel>'   desglose {} unidad '%'                     grupo tasa_repitencia
 *   'Tasa de sobreedad - <nivel>'    desglose {} unidad '%'                     grupo tasa_sobreedad
 * Todas con categoria 'anuario_educacion', periodo 2025, orden 0, unidad 'casos'
 * (salvo tasas) y fuente 'Ministerio de Educación - Anuario Estadístico'.
 *
 * ⚠️ Pre-check propio: a diferencia de insertIfMissing (cuya clave natural solo usa
 * desglose.mes/fuente_api), acá se compara el desglose COMPLETO canónico — 'Alumnos -
 * Primario' con sector Total/Estatal/Privado son filas distintas que comparten nombre.
 *
 * Uso:
 *   node scripts/load-anuario-educacion-2025.mjs           # dry-run (no escribe)
 *   node scripts/load-anuario-educacion-2025.mjs --apply   # inserta lo faltante
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { supabase } from './config.mjs';

const APPLY = process.argv.includes('--apply');
const VERIFY = !process.argv.includes('--no-verify');

const TXT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.tmp-censo', 'anuario2025.txt');

const CATEGORIA = 'anuario_educacion';
const PERIODO = 2025;
const FUENTE = 'Ministerio de Educación - Anuario Estadístico';

// Orden alfabético exacto de los cuadros del anuario.
const DEPTS = [
  'Calamuchita', 'Capital', 'Colón', 'Cruz del Eje', 'General Roca', 'General San Martín',
  'Ischilín', 'Juárez Celman', 'Marcos Juárez', 'Minas', 'Pocho', 'Pte. Roque Sáenz Peña',
  'Punilla', 'Río Cuarto', 'Río Primero', 'Río Seco', 'Río Segundo', 'San Alberto',
  'San Javier', 'San Justo', 'Santa María', 'Sobremonte', 'Tercero Arriba', 'Totoral',
  'Tulumba', 'Unión',
];
const REGION_MAP = { 'Total Córdoba': 'Córdoba', 'Pte. Roque Sáenz Peña': 'Presidente Roque Sáenz Peña' };

// ── Parser ──────────────────────────────────────────────────────────

// '-' en el PDF = sin dato / cero (p. ej. departamento sin sector privado).
const parseNum = (s) => {
  const t = String(s).trim();
  if (t === '-') return 0;
  const v = Number(t.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(v) ? v : null;
};

// Nombres candidatos ordenados por largo: los departamentos son multi-token.
const NAME_CANDIDATES = ['Total Córdoba', ...DEPTS].sort((a, b) => b.length - a.length);

// Índice de línea del TÍTULO de cada cuadro + dirección del bloque de datos + cols.
const BLOCKS = {
  inicial: {
    oferta:   { title: 108,  cols: 9, dir: 'back' }, // CUADRO 2.2 — título abajo del bloque
    sexo:     { title: 188,  cols: 3, dir: 'back' }, // CUADRO 2.4
    docentes: { title: 538,  cols: 4, dir: 'fwd',  lenient: true }, // CUADRO 2.10 — título arriba del bloque
  },
  primario: {
    oferta:   { title: 707,  cols: 9, dir: 'back' }, // CUADRO 3.2
    sexo:     { title: 785,  cols: 3, dir: 'back' }, // CUADRO 3.4
    grado:    { title: 894,  cols: 7, dir: 'back' }, // CUADRO 3.5
    repit:    { title: 976,  cols: 5, dir: 'back', lenient: true }, // CUADRO 3.7
    docentes: { title: 1123, cols: 4, dir: 'fwd',  lenient: true }, // CUADRO 3.12 — título arriba del bloque
  },
  secundario: {
    oferta:   { title: 1289, cols: 9, dir: 'back' }, // CUADRO 4.2
    sexo:     { title: 1365, cols: 3, dir: 'back' }, // CUADRO 4.4
    repit:    { title: 1593, cols: 5, dir: 'back', lenient: true }, // CUADRO 4.6
    docentes: { title: 2118, cols: 3, dir: 'back', lenient: true }, // CUADRO 4.20
  },
};

// Verificación Ischilín (valores chequeados a mano contra el PDF).
const ISCHILIN_ESPERADO = {
  inicial:    { oferta: [33, 1349, 96, 32, 1296, 86, 1, 53, 10], sexo: [1349, 679, 670], docentes: [96, 69, 17, 10] },
  primario:   { oferta: [41, 3612, 406, 40, 3394, 387, 1, 218, 19], sexo: [3612, 1712, 1900], grado: [3612, 617, 602, 596, 543, 628, 626], repit: [3612, 5, 0.1, 40, 1.1], docentes: [406, 288, 99, 19] },
  secundario: { oferta: [7, 3606, 611, 5, 2804, 485, 2, 802, 126], sexo: [3606, 1750, 1856], repit: [3606, 323, 9, 796, 22.1], docentes: [611, 401, 210] },
};

function extractBlock(lines, titleLine, cols, label, dir, lenient = false) {
  const step = dir === 'fwd' ? 1 : -1;
  let i = dir === 'fwd' ? titleLine + 1 : titleLine - 1;
  const seen = new Set();
  const byRegion = new Map();
  let cordoba = null;
  let walked = 0;
  const guard = 400;
  while (seen.size < DEPTS.length && walked < guard) {
    const t = (lines[i] || '').trim();
    // ruido de paginación/pie/notas: se ignora
    if (
      /^(-- \d+ of \d+ --|\d+|2025\.|2026\.|Anual \(RA\) 2025\.|Relevamiento Anual \(RA\) 2025\.)$/.test(t) ||
      /^(Fuente:|Dirección General|Integral de Información|En el departamento|Cuarto|y nacionales|además de las provinciales|razón, se cuentan|como ofertas|el departamento|Nivel |Urbano |Departamento |Total \(\*\)|Estatal |Privado |Porcentaje |Año de estudio|Grado |Ciclo |Orientación|Título |Personal designado|Personal que proviene|personal docente.|nivel. Por esta razón|\(\*\)|\(\*\*\))/.test(t) ||
      t === ''
    ) {
      i += step;
      walked++;
      continue;
    }
    let matched = null;
    for (const name of NAME_CANDIDATES) {
      if (t.startsWith(name + ' ')) {
        const nums = t.slice(name.length + 1).split(/\s+/).map(parseNum);
        if (nums.some((v) => v === null)) {
          throw new Error(`Bloque ${label}: fila no numérica en ${i}: ${t.slice(0, 90)}`);
        }
        matched = { name, nums };
        break;
      }
    }
    if (!matched) {
      throw new Error(`Bloque ${label}: línea no reconocida en ${i}: ${t.slice(0, 90)}`);
    }
    const region = REGION_MAP[matched.name] ?? matched.name;
    if (region === 'Córdoba') {
      // El total provincial: en bloques back aparece DESPUÉS de los 26 depts
      // (al llegar al tope de la tabla); en fwd, antes. Se guarda si es la fila
      // con la cantidad de columnas del bloque.
      if (matched.nums.length === cols) cordoba = matched.nums;
      i += step;
      walked++;
      continue;
    }
    if (seen.has(region)) {
      throw new Error(`Bloque ${label}: región duplicada ${region} en línea ${i}`);
    }
    seen.add(region);
    byRegion.set(region, matched.nums);
    i += step;
    walked++;
  }
  if (seen.size < DEPTS.length) {
    const faltan = DEPTS.filter((d) => !seen.has(d));
    throw new Error(`Bloque ${label}: solo ${seen.size} departamentos tras ${walked} líneas. Faltan: ${faltan.join(', ')}`);
  }

  // Fila provincial opcional: en back-mode el 'Total Córdoba' está justo encima
  // del primer departamento encontrado (en dirección de caminata). Hasta 6 pasos extra.
  for (let e = 0; e < 6; e++) {
    const t = (lines[i] || '').trim();
    if (t === '') { i += step; continue; }
    if (/^(-- \d+ of \d+ --|\d+|2025\.|2026\.|Anual \(RA\) 2025\.|Relevamiento Anual \(RA\) 2025\.)$/.test(t) || /^(Fuente:|Dirección General|Integral de Información)/.test(t)) { i += step; continue; }
    if (t.startsWith('Total Córdoba ')) {
      const nums = t.slice('Total Córdoba '.length).split(/\s+/).map(parseNum);
      if (!nums.some((v) => v === null) && nums.length === cols) cordoba = nums;
      break;
    }
    break; // otra cosa: fin del bloque
  }

  // Adaptar al ancho del bloque: los depts sin sector privado traen 3 o 6 números.
  const rows = DEPTS.map((d) => {
    const region = REGION_MAP[d] ?? d;
    let nums = byRegion.get(region);
    if (cols === 9 && nums.length === 3) {
      const [ue, alu, doc] = nums;
      nums = [ue, alu, doc, ue, alu, doc, 0, 0, 0];
    } else if (cols === 9 && nums.length === 6) {
      const [ue, alu, doc, ueE, aluE, docE] = nums;
      nums = [ue, alu, doc, ueE, aluE, docE, 0, 0, 0];
    } else if (cols === 4 && nums.length <= 3) {
      nums = [...nums, 0]; // la 4ª columna del cuadro es la categoría X/otro
    }
    if (nums.length !== cols) {
      if (lenient) {
        console.warn(`  ⚠️  ${label}: ${region} saltada (${nums.length} números, esperaba ${cols})`);
        return { region, nums: null };
      }
      throw new Error(`Bloque ${label}: ${d} con ${nums.length} números, esperaba ${cols}`);
    }
    return { region, nums };
  });
  const valid = rows.filter((r) => r.nums !== null);
  if (valid.length < rows.length) {
    console.warn(`  ⚠️  ${label}: ${rows.length - valid.length} departamentos sin dato de docentes por sexo (fila de ancho atípico)`);
  }
  if (label === 'inicial.oferta') console.log('DEBUG inicial.oferta rows:', JSON.stringify(rows.slice(0,3)), 'valid:', valid.length, 'cordoba:', JSON.stringify(cordoba));
  if (cordoba && cordoba.length === cols) valid.unshift({ region: 'Córdoba', nums: cordoba });
  return new Map(valid.map((r) => [r.region, r.nums]));
}

// ── Armado de filas ─────────────────────────────────────────────────

function buildRows(blocks) {
  const rows = [];
  const push = (nivelLabel, nombre, region, desglose, valor, unidad, grupo) => {
    rows.push({
      indicador_nombre: `${nombre} - ${nivelLabel}`,
      categoria: CATEGORIA,
      valor,
      unidad,
      periodo: PERIODO,
      region,
      desglose,
      fuente: FUENTE,
      grupo_id: grupo,
      orden: 0,
      activo: true,
    });
  };

  for (const [nivelKey, nivelLabel] of [['inicial', 'Inicial'], ['primario', 'Primario'], ['secundario', 'Secundario']]) {
    const b = blocks[nivelKey];
    for (const [region, nums] of b.oferta.entries()) {
      if (!nums) { console.error('NULL oferta:', nivelLabel, region); continue; }
      const [ueT, aluT, docT, ueE, aluE, docE, ueP, aluP, docP] = nums;
      push(nivelLabel, 'Unidades educativas', region, { sector: 'Total' }, ueT, 'casos', 'unidades_educativas');
      push(nivelLabel, 'Unidades educativas', region, { sector: 'Estatal' }, ueE, 'casos', 'unidades_educativas');
      push(nivelLabel, 'Unidades educativas', region, { sector: 'Privado' }, ueP, 'casos', 'unidades_educativas');
      push(nivelLabel, 'Alumnos', region, { sector: 'Total' }, aluT, 'casos', 'alumnos');
      push(nivelLabel, 'Alumnos', region, { sector: 'Estatal' }, aluE, 'casos', 'alumnos');
      push(nivelLabel, 'Alumnos', region, { sector: 'Privado' }, aluP, 'casos', 'alumnos');
      push(nivelLabel, 'Personal docente', region, { sector: 'Total' }, docT, 'casos', 'personal_docente_anuario');
      push(nivelLabel, 'Personal docente', region, { sector: 'Estatal' }, docE, 'casos', 'personal_docente_anuario');
      push(nivelLabel, 'Personal docente', region, { sector: 'Privado' }, docP, 'casos', 'personal_docente_anuario');
    }
    for (const [region, nums] of b.sexo.entries()) {
      const [, mujeres, varones] = nums;
      push(nivelLabel, 'Alumnos', region, { genero: 'Mujeres' }, mujeres, 'casos', 'alumnos');
      push(nivelLabel, 'Alumnos', region, { genero: 'Varones' }, varones, 'casos', 'alumnos');
    }
    for (const [region, nums] of (b.docentes?.entries() ?? [])) {
      const [, mujeres, varones] = nums; // columna extra "X/otro" (inicial/primario): no se carga
      push(nivelLabel, 'Docentes', region, { genero: 'Mujeres' }, mujeres, 'casos', 'docentes_anuario');
      push(nivelLabel, 'Docentes', region, { genero: 'Varones' }, varones, 'casos', 'docentes_anuario');
    }
    for (const [region, nums] of (b.grado?.entries() ?? [])) {
      const [, ...grados] = nums;
      grados.forEach((v, gi) => push(nivelLabel, 'Alumnos', region, { grado: `${gi + 1}°` }, v, 'casos', 'alumnos'));
    }
    for (const [region, nums] of (b.repit?.entries() ?? [])) {
      const [total, repit, pctRepit, sobre, pctSobre] = nums;
      if (total > 0 && Math.abs(pctRepit - (repit / total) * 100) > 0.15) {
        console.warn(`  ⚠️  ${region} ${nivelLabel}: tasa repitencia ${pctRepit} ≠ ${((repit / total) * 100).toFixed(1)} calculada`);
      }
      push(nivelLabel, 'Repitentes', region, {}, repit, 'casos', 'repitentes');
      push(nivelLabel, 'Sobreedad', region, {}, sobre, 'casos', 'sobreedad');
      push(nivelLabel, 'Tasa de repitencia', region, {}, pctRepit, '%', 'tasa_repitencia');
      push(nivelLabel, 'Tasa de sobreedad', region, {}, pctSobre, '%', 'tasa_sobreedad');
    }
  }
  return rows;
}

// ── Main ────────────────────────────────────────────────────────────

const lines = readFileSync(TXT, 'utf8').split(/\r?\n/);

const blocks = {};
for (const [nivelKey, cuadros] of Object.entries(BLOCKS)) {
  blocks[nivelKey] = {};
  for (const [cuadro, { title, cols, dir, lenient }] of Object.entries(cuadros)) {
    blocks[nivelKey][cuadro] = extractBlock(lines, title, cols, `${nivelKey}.${cuadro}`, dir, lenient);
  }
}

if (VERIFY) {
  const isch = 'Ischilín';
  let fails = 0;
  for (const [nivelKey, checks] of Object.entries(ISCHILIN_ESPERADO)) {
    for (const [cuadro, esperado] of Object.entries(checks)) {
      const got = blocks[nivelKey][cuadro].get(isch);
      if (!got) { console.error(`❌ ${nivelKey}.${cuadro}: sin fila Ischilín`); fails++; continue; }
      const ok = esperado.length === got.length && esperado.every((v, i) => Math.abs(v - got[i]) < 1e-9);
      if (!ok) {
        console.error(`❌ ${nivelKey}.${cuadro} Ischilín: esperado [${esperado}] ≠ obtenido [${got}]`);
        fails++;
      }
    }
  }
  if (fails > 0) {
    console.error(`\n❌ Verificación fallida (${fails} discrepancias). NO se escribe nada.`);
    process.exit(1);
  }
  console.log('✅ Verificación Ischilín OK (todos los cuadros coinciden con el PDF)');
}

const rows = buildRows(blocks);

// sanity: ninguna fila con valor null/undefined
const bad = rows.filter((r) => !Number.isFinite(r.valor));
if (bad.length) {
  console.error(`❌ ${bad.length} filas con valor no numérico`);
  process.exit(1);
}

console.log(`📦 ${rows.length} filas generadas para periodo ${PERIODO}`);

// Resumen por indicador
const byName = new Map();
for (const r of rows) {
  const key = r.indicador_nombre + '|' + JSON.stringify(r.desglose);
  byName.set(key, (byName.get(key) ?? 0) + 1);
}
console.log('\n— Filas por indicador —');
for (const [k, n] of [...byName.entries()].sort()) console.log(`  ${n}× ${k}`);

// Muestra Ischilín para inspección humana
console.log('\n— Muestra Ischilín —');
for (const r of rows.filter((r) => r.region === 'Ischilín').slice(0, 14)) {
  console.log(`  ${r.indicador_nombre} ${JSON.stringify(r.desglose)} = ${r.valor} ${r.unidad} [${r.grupo_id}]`);
}

// ── Pre-check con desglose completo ─────────────────────────────────

const canonDesglose = (d) => JSON.stringify(Object.fromEntries(Object.entries(d || {}).sort(([a], [b]) => a.localeCompare(b))));

const existing = new Set();
let offset = 0;
while (true) {
  const { data, error } = await supabase
    .from('indicadores')
    .select('indicador_nombre, periodo, region, fuente, desglose')
    .eq('categoria', CATEGORIA)
    .eq('periodo', PERIODO)
    .range(offset, offset + 999);
  if (error) throw new Error(`pre-check: ${error.message}`);
  if (!data || data.length === 0) break;
  for (const r of data) {
    if (r.fuente === FUENTE) existing.add(`${r.indicador_nombre}|${r.region}|${canonDesglose(r.desglose)}`);
  }
  if (data.length < 1000) break;
  offset += 1000;
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
  console.log(`  insertado ${inserted}/${missing.length}`);
}
console.log(`✅ ${inserted} filas insertadas en indicadores (periodo ${PERIODO})`);
