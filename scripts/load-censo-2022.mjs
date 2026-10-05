#!/usr/bin/env node
/**
 * load-censo-2022.mjs — Población de Córdoba por departamento, sexo y edad (Censo 2022).
 *
 * Fuente: Censo Nacional de Población, Hogares y Viviendas 2022 (INDEC) — datos.gob.ar,
 * dataset 48 / distribución 48.4 (agregado provincial):
 *   https://infra.datos.gob.ar/catalog/indec/dataset/48/distribution/48.4/download/14-cordoba-2022.zip
 *
 * El ZIP (16,7 MB) trae 3 CSVs; solo se usa `14-cordoba-2022-persona.csv` (144 MB).
 *
 * ⚠️ NO es microdata cruda: es una tabla YA AGREGADA, con esquema
 *   codigo, cod_prov, provincia, cod_dep, departamento, fraccion, radio,
 *   cod_variable, cod_categoria, categoria, cantidad
 * donde cada fila es (geografía × variable × categoría) → cantidad, al nivel de
 * fracción/radio. Por eso acá se AGREGA (SUM(cantidad)) por departamento.
 * Ojo: la columna `departamento` trae el CÓDIGO (p. ej. "014"), no el nombre.
 *
 * Variables usadas (verificadas contra el CSV y contra el diccionario oficial de
 * variables/categorías del mismo dataset, distribuciones 48.26 y 48.25):
 *   PERSONA_P02      "Sexo registrado al nacer"
 *                    categorías: 1 = "Mujer / Femenino", 2 = "Varón / Masculino"
 *   PERSONA_EDADGRU  "Edad en grandes grupos"
 *                    categorías: 1 = "HASTA 14 AÑOS", 2 = "15 A 64 AÑOS", 3 = "65 AÑOS Y MÁS"
 *   PERSONA_EDAD     "Edad" (año a año)
 *                    el diccionario define 111 categorías (0..110) donde la etiqueta
 *                    ES el número, salvo 0 = "edad" y 110 = "valido hasta"
 *                    (etiquetas raras pero oficiales, no corrupción del CSV).
 *                    Por eso el nombre del indicador se arma con cod_categoria y el
 *                    cod 110 se interpreta como "110 y más" (ver MAPEO_EDAD abajo).
 *
 * Salidas (todas categoria='poblacion', fuente='Censo 2022 — INDEC', periodo=2022,
 * unidad='personas'), por departamento y para el agregado provincial region='Córdoba':
 *   1. Población total
 *   2. Población — <sexo>        (PERSONA_P02)
 *   3. Población — <grupo>       (PERSONA_EDADGRU, etiquetas crudas de la fuente)
 *   4. Población — edad <n>      (PERSONA_EDAD, año a año)
 *
 * ⚠️ ANOMALÍA DOCUMENTADA: PERSONA_EDADGRU solo tiene 3 grupos (HASTA 14 / 15 A 64 /
 * 65 Y MÁS), así que NO alcanza para calcular NNyA (0 a 17 años). Por eso se carga
 * además PERSONA_EDAD (edad año a año), que sí cubre 0..17 y permite el cálculo.
 *
 * El CSV de 144 MB se descomprime con `unzip` a un temporal y se parsea EN
 * STREAMING (createReadStream + readline); nunca se retiene el array de filas
 * crudas, solo acumuladores agregados (~3k entradas).
 *
 * Dry-run por defecto; `--apply` escribe (vía insertIfMissing de etl-runner.mjs).
 *
 * Uso:
 *   node scripts/load-censo-2022.mjs           # dry-run (no escribe)
 *   node scripts/load-censo-2022.mjs --apply   # inserta lo faltante
 */

import { createReadStream, createWriteStream, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createInterface } from 'node:readline';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { getCACertificates, setDefaultCACertificates } from 'node:tls';
import { insertIfMissing } from './etl-runner.mjs';

const execFileAsync = promisify(execFile);

// ── Configuración ───────────────────────────────────────────────────

const APPLY = process.argv.includes('--apply');

// La DB tiene una CHECK constraint sobre `categoria`; `demografia` ya existe y
// ya guarda población ("Población por edad"), así que consolidamos ahí en vez de
// agregar una categoría nueva (que exigiría migración de schema).
const CATEGORIA = 'demografia';
const FUENTE = 'Censo 2022 — INDEC';
const UNIDAD = 'personas';
const PERIODO = 2022;
const PROVINCIA = 'Córdoba';
const REGION_PROVINCIA = 'Córdoba';

const ZIP_URL =
  'https://infra.datos.gob.ar/catalog/indec/dataset/48/distribution/48.4/download/14-cordoba-2022.zip';
const ZIP_NAME = '14-cordoba-2022.zip';
const CSV_NAME = '14-cordoba-2022-persona.csv';

const VAR_SEXO = 'PERSONA_P02';
const VAR_EDAD_GRU = 'PERSONA_EDADGRU';
const VAR_EDAD = 'PERSONA_EDAD';

/** Columnas reales del CSV (11 en total). */
const COL = {
  codigo: 'codigo',
  codProv: 'cod_prov',
  provincia: 'provincia',
  codDep: 'cod_dep',
  departamento: 'departamento',
  codVariable: 'cod_variable',
  codCategoria: 'cod_categoria',
  categoria: 'categoria',
  cantidad: 'cantidad',
};

/**
 * cod_dep → departamento. El CSV NO trae el nombre del departamento (la columna
 * `departamento` repite el código), así que este mapa es una INFERENCIA validada
 * contra dos fuentes oficiales:
 *   · INDEC — "Nombres y códigos de departamentos" (Códigos geográficos del INDEC 2022)
 *     https://www.indec.gob.ar/ftp/cuadros/geoestadistica/c2022_codigos_departamentos.xlsx
 *     → los 26 departamentos de Córdoba coinciden 26/26 (código y nombre).
 *   · Georef / datos.gob.ar — https://apis.datos.gob.ar/georef/api/departamentos?provincia=Córdoba
 * Además la población observada en el CSV es coherente con cada nombre
 * (014 = Capital con 1.498.060; 154 = Sobremonte con 4.381; 070 = Minas con 4.855).
 */
const DEPARTAMENTOS = new Map([
  ['007', 'Calamuchita'],
  ['014', 'Capital'],
  ['021', 'Colón'],
  ['028', 'Cruz del Eje'],
  ['035', 'General Roca'],
  ['042', 'General San Martín'],
  ['049', 'Ischilín'],
  ['056', 'Juárez Celman'],
  ['063', 'Marcos Juárez'],
  ['070', 'Minas'],
  ['077', 'Pocho'],
  ['084', 'Presidente Roque Sáenz Peña'],
  ['091', 'Punilla'],
  ['098', 'Río Cuarto'],
  ['105', 'Río Primero'],
  ['112', 'Río Seco'],
  ['119', 'Río Segundo'],
  ['126', 'San Alberto'],
  ['133', 'San Javier'],
  ['140', 'San Justo'],
  ['147', 'Santa María'],
  ['154', 'Sobremonte'],
  ['161', 'Tercero Arriba'],
  ['168', 'Totoral'],
  ['175', 'Tulumba'],
  ['182', 'Unión'],
]);

/**
 * Mapeo inferido para PERSONA_EDAD: `categoria` NO trae etiquetas usables
 * (1..109 repiten el número, 0 viene etiquetado "edad" y 110 "valido hasta",
 * igual que en el diccionario oficial 48.25), así que el nombre del indicador se
 * arma con el cod_categoria, que ES la edad.
 * El 110 se interpreta como "110 y más" porque:
 *   · es el último código de la variable;
 *   · su etiqueta oficial es "valido hasta" (techo abierto, no un año puntual);
 *   · su conteo provincial (11) es MAYOR que el del código 109 (6), cuando en
 *     edades exactas la serie decrece — comportamiento típico de un último
 *     grupo abierto. Aun así queda el `edad_codigo: 110` en el desglose para
 *     que el consumidor pueda reinterpretarlo.
 */
const EDAD_SENTINEL = '110';
const EDAD_SENTINEL_LABEL = '110 y más';

/** Rango NNyA (niñas, niños y adolescentes) que se informa en el reporte. */
const NNYA_DESDE = 0;
const NNYA_HASTA = 17;

// ── Helpers ─────────────────────────────────────────────────────────

const fmt = (n) => n.toLocaleString('es-AR');

/** Suma los valores de un Map<clave, número>. */
function sumaMapa(m) {
  let s = 0;
  for (const v of m.values()) s += v;
  return s;
}

/**
 * Parser de UNA línea CSV que respeta comillas dobles ("a,b") y "" escapadas.
 * Devuelve `completo: false` si el registro queda abierto (campo con salto de
 * línea interno): en ese caso el llamador debe seguir acumulando líneas.
 */
function parsearRegistro(texto, delim) {
  const campos = [];
  let actual = '';
  let enComillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (enComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') {
          actual += '"';
          i++;
        } else {
          enComillas = false;
        }
      } else {
        actual += c;
      }
    } else if (c === '"') {
      enComillas = true;
    } else if (c === delim) {
      campos.push(actual);
      actual = '';
    } else {
      actual += c;
    }
  }
  campos.push(actual);
  return { campos, completo: !enComillas };
}

/** Detecta el delimitador contando separadores fuera de comillas. */
function detectarDelimitador(linea) {
  let coma = 0;
  let puntoYComa = 0;
  let enComillas = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (c === '"') enComillas = !enComillas;
    else if (!enComillas && c === ',') coma++;
    else if (!enComillas && c === ';') puntoYComa++;
  }
  return puntoYComa > coma ? ';' : ',';
}

/** Header → índices por nombre de columna. */
function mapearColumnas(header) {
  const idx = {};
  for (const [clave, nombre] of Object.entries(COL)) {
    const i = header.indexOf(nombre);
    if (i === -1) {
      throw new Error(`falta la columna "${nombre}". Header: ${JSON.stringify(header)}`);
    }
    idx[clave] = i;
  }
  return idx;
}

/**
 * Normaliza el sexo registrado al nacer. La fuente trae etiquetas legibles
 * ("Mujer / Femenino", "Varón / Masculino"); el código (1/2) se usa solo como
 * respaldo si la etiqueta viniera vacía.
 */
function normalizarSexo(codigo, etiqueta) {
  const s = String(etiqueta ?? '').trim();
  if (/femenino|mujer/i.test(s)) return 'mujeres';
  if (/masculino|var[oó]n/i.test(s)) return 'varones';
  if (codigo === '1') return 'mujeres';
  if (codigo === '2') return 'varones';
  return null;
}

/** Entero de personas: el CSV trae enteros planos, sin separador de miles. */
function parseCantidad(raw) {
  const s = String(raw ?? '').trim();
  if (s === '') return null;
  if (/^\d+$/.test(s)) return Number(s);
  if (/^\d{1,3}(\.\d{3})+$/.test(s)) return Number(s.replace(/\./g, ''));
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** Códigos normalizados: "007" se conserva con ceros a la izquierda. */
const codigo3 = (raw) => String(raw ?? '').trim().padStart(3, '0');

// ── Estado de la corrida ────────────────────────────────────────────

const stats = {
  registros: 0,
  descartadas: 0,
  muestrasDescartadas: [],
  /** variable -> Map(cod_categoria -> { etiquetas: Set, filas, suma }) */
  categorias: new Map([
    [VAR_SEXO, new Map()],
    [VAR_EDAD_GRU, new Map()],
    [VAR_EDAD, new Map()],
  ]),
  /** variable -> registros crudos leídos (para el reporte) */
  porVariable: new Map(),
  /** variable -> total de personas (para el cross-check entre variables) */
  sumaPorVariable: new Map(),
  codProvs: new Set(),
  provincias: new Set(),
};

/**
 * cod_dep -> { codDep, total, sexo: Map<sexo, n>, edadGru: Map<cod, n>, edad: Map<edad, n> }
 * `total` se acumula con PERSONA_P02 (el total de personas es el mismo en las 3
 * variables; se verifica en el chequeo de consistencia).
 */
const porDepartamento = new Map();

function acumular(mapa, clave, valor) {
  mapa.set(clave, (mapa.get(clave) ?? 0) + valor);
}

function registrarCategoria(variable, codigo, etiqueta, cantidad) {
  const mapa = stats.categorias.get(variable);
  if (!mapa) return;
  const entry = mapa.get(codigo) ?? { etiquetas: new Set(), filas: 0, suma: 0 };
  if (etiqueta !== '') entry.etiquetas.add(etiqueta);
  entry.filas++;
  entry.suma += cantidad;
  mapa.set(codigo, entry);
}

function descartar(motivo, lineaNro, linea) {
  stats.descartadas++;
  if (stats.muestrasDescartadas.length < 5) {
    stats.muestrasDescartadas.push(`L${lineaNro} ${motivo} :: ${linea.slice(0, 160)}`);
  }
}

// ── Descarga + descompresión ────────────────────────────────────────

/**
 * infra.datos.gob.ar suele servirse detrás de una cadena TLS incompleta; el
 * bundle Mozilla de Node puede no tener el intermedio. Se FUSIONA el store del
 * sistema con el default (nunca se desactiva la verificación del certificado).
 */
function habilitarCAsDelSistema() {
  try {
    if (typeof getCACertificates !== 'function' || typeof setDefaultCACertificates !== 'function') {
      return false;
    }
    const fusion = [...new Set([...getCACertificates('default'), ...getCACertificates('system')])];
    setDefaultCACertificates(fusion);
    return true;
  } catch {
    return false;
  }
}

async function descargar(url, destino) {
  const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(600000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} al bajar ${url}`);
  if (!res.body) throw new Error(`respuesta sin body para ${url}`);
  // Stream a disco: el ZIP (16 MB) no se bufferiza en memoria.
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destino));
}

async function descomprimirZip(zipPath, nombreInterno, destinoDir) {
  try {
    await execFileAsync('unzip', ['-o', '-q', '-d', destinoDir, zipPath, nombreInterno], {
      maxBuffer: 1024 * 1024,
    });
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(
        'no se encontró el ejecutable `unzip` en el PATH (este ETL lo necesita para descomprimir el ZIP)'
      );
    }
    throw new Error(`unzip falló: ${err.stderr || err.message}`);
  }
}

// ── Parseo en streaming + agregación ────────────────────────────────

async function agregarCsv(path) {
  const rl = createInterface({
    input: createReadStream(path, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  let idx = null;
  let delim = ',';
  let esperados = 0;
  let lineaNro = 0;
  let pendiente = '';

  for await (const linea of rl) {
    lineaNro++;

    // Header (puede venir con BOM UTF-8).
    if (idx === null) {
      const header = linea.replace(/^\uFEFF/, '');
      delim = detectarDelimitador(header);
      const camposHeader = parsearRegistro(header, delim).campos;
      idx = mapearColumnas(camposHeader);
      esperados = camposHeader.length;
      continue;
    }

    // Un registro puede abarcar varias líneas físicas (comillas con \n adentro).
    if (pendiente !== '') pendiente += '\n' + linea;
    else pendiente = linea;

    const { campos, completo } = parsearRegistro(pendiente, delim);
    if (!completo) continue; // el campo entrecomillado sigue abierto
    pendiente = '';

    if (campos.length === 1 && campos[0].trim() === '') continue; // línea vacía

    if (campos.length !== esperados) {
      descartar(`se esperaban ${esperados} columnas y vinieron ${campos.length}`, lineaNro, campos.join(','));
      continue;
    }

    const codProv = String(campos[idx.codProv] ?? '').trim();
    if (codProv) stats.codProvs.add(codProv);
    const provincia = String(campos[idx.provincia] ?? '').trim();
    if (provincia) stats.provincias.add(provincia);

    const variable = String(campos[idx.codVariable] ?? '').trim();
    if (variable !== VAR_SEXO && variable !== VAR_EDAD_GRU && variable !== VAR_EDAD) continue;

    const codDep = codigo3(campos[idx.codDep]);
    const etiqueta = String(campos[idx.categoria] ?? '').trim();
    const codCategoriaRaw = String(campos[idx.codCategoria] ?? '').trim();
    const cantidad = parseCantidad(campos[idx.cantidad]);

    if (cantidad === null || cantidad < 0) {
      descartar(`cantidad no numérica "${campos[idx.cantidad]}"`, lineaNro, campos.join(','));
      continue;
    }

    stats.registros++;
    stats.porVariable.set(variable, (stats.porVariable.get(variable) ?? 0) + 1);
    stats.sumaPorVariable.set(variable, (stats.sumaPorVariable.get(variable) ?? 0) + cantidad);
    registrarCategoria(variable, codCategoriaRaw, etiqueta, cantidad);

    const dep =
      porDepartamento.get(codDep) ??
      { codDep, total: 0, sexo: new Map(), edadGru: new Map(), edad: new Map() };

    if (variable === VAR_SEXO) {
      const sexo = normalizarSexo(codCategoriaRaw, etiqueta);
      if (sexo) acumular(dep.sexo, sexo, cantidad);
      else descartar(`sexo desconocido cod=${codCategoriaRaw} label="${etiqueta}"`, lineaNro, campos.join(','));
      dep.total += cantidad;
    } else if (variable === VAR_EDAD_GRU) {
      acumular(dep.edadGru, etiqueta === '' ? `cod ${codCategoriaRaw}` : etiqueta, cantidad);
    } else {
      const edad = Number(codCategoriaRaw);
      if (Number.isInteger(edad) && edad >= 0) acumular(dep.edad, String(edad), cantidad);
      else descartar(`edad no numérica "${codCategoriaRaw}"`, lineaNro, campos.join(','));
    }

    porDepartamento.set(codDep, dep);
  }

  return { delim, esperados };
}

// ── Construcción de filas para `indicadores` ────────────────────────

/** Filas de un scope geográfico (departamento o provincia) para los 4 cortes. */
function filasDeScope({ region, codDep, total, sexo, edadGru, edad }) {
  const base = { provincia: PROVINCIA, anio: PERIODO, ...(codDep ? { cod_dep: codDep } : {}) };
  const filas = [];

  const push = (indicador_nombre, valor, extra) => {
    filas.push({
      indicador_nombre,
      categoria: CATEGORIA,
      valor,
      unidad: UNIDAD,
      periodo: PERIODO,
      region,
      desglose: { ...base, ...extra },
      fuente: FUENTE,
      activo: true,
    });
  };

  push('Población total', total, { variable: VAR_SEXO });

  // NNyA (0 a 17): se deriva de PERSONA_EDAD año a año, porque los grandes
  // grupos de EDADGRU (0-14 / 15-64 / 65+) no permiten recortar en 17.
  const nnya = [...edad.entries()]
    .filter(([e]) => Number(e) >= NNYA_DESDE && Number(e) <= NNYA_HASTA)
    .reduce((acc, [, v]) => acc + v, 0);
  push(`Población — NNyA (${NNYA_DESDE} a ${NNYA_HASTA})`, nnya, {
    variable: VAR_EDAD,
    edad_desde: NNYA_DESDE,
    edad_hasta: NNYA_HASTA,
  });

  for (const [s, v] of [...sexo.entries()].sort((a, b) => a[0].localeCompare(b[0], 'es'))) {
    push(`Población — ${s}`, v, { variable: VAR_SEXO, sexo_codigo: SEXO_CODIGO.get(s) ?? null });
  }

  for (const [g, v] of [...edadGru.entries()].sort((a, b) => a[0].localeCompare(b[0], 'es', { numeric: true }))) {
    push(`Población — ${g}`, v, { variable: VAR_EDAD_GRU, edad_codigo: codigoGrupoEdad(g) });
  }

  for (const [e, v] of [...edad.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))) {
    const nombre = e === EDAD_SENTINEL ? `Población — edad ${EDAD_SENTINEL_LABEL}` : `Población — edad ${e}`;
    push(nombre, v, { variable: VAR_EDAD, edad_codigo: Number(e) });
  }

  return filas;
}

/** Sexo normalizado → cod_categoria de PERSONA_P02, según el CSV. */
const SEXO_CODIGO = new Map([
  ['mujeres', 1],
  ['varones', 2],
]);

/** Etiqueta de grupo → cod_categoria de PERSONA_EDADGRU (1/2/3), según el CSV. */
const GRUPOS_EDAD_CSV = new Map([
  ['HASTA 14 AÑOS', 1],
  ['15 A 64 AÑOS', 2],
  ['65 AÑOS Y MÁS', 3],
]);

function codigoGrupoEdad(etiqueta) {
  return GRUPOS_EDAD_CSV.get(etiqueta) ?? null;
}

/** Suma departamento a departamento para armar el acumulador provincial. */
function acumuladorProvincial() {
  const prov = { total: 0, sexo: new Map(), edadGru: new Map(), edad: new Map() };
  for (const d of porDepartamento.values()) {
    prov.total += d.total;
    for (const [k, v] of d.sexo) acumular(prov.sexo, k, v);
    for (const [k, v] of d.edadGru) acumular(prov.edadGru, k, v);
    for (const [k, v] of d.edad) acumular(prov.edad, k, v);
  }
  return prov;
}

function construirFilas(prov) {
  const filas = [];

  // Agregado provincial primero.
  filas.push(...filasDeScope({ region: REGION_PROVINCIA, codDep: null, ...prov }));

  const codigos = [...porDepartamento.keys()].sort();
  for (const codDep of codigos) {
    const d = porDepartamento.get(codDep);
    const region = DEPARTAMENTOS.get(codDep);
    if (!region) {
      // Nunca visto en esta fuente; se aborta para no escribir con nombre inventado.
      throw new Error(
        `cod_dep ${codDep} no está en el mapa de departamentos. Agregalo a DEPARTAMENTOS antes de seguir.`
      );
    }
    filas.push(...filasDeScope({ region, codDep, ...d }));
  }

  return filas;
}

// ── Reporte ─────────────────────────────────────────────────────────

function reportarCategorias() {
  const titulos = new Map([
    [VAR_SEXO, 'PERSONA_P02 — Sexo registrado al nacer'],
    [VAR_EDAD_GRU, 'PERSONA_EDADGRU — Edad en grandes grupos'],
    [VAR_EDAD, 'PERSONA_EDAD — Edad (año a año)'],
  ]);

  for (const variable of [VAR_SEXO, VAR_EDAD_GRU, VAR_EDAD]) {
    const mapa = stats.categorias.get(variable);
    console.log(`\n🔤 ${titulos.get(variable)}: ${mapa.size} categorías`);
    const entradas = [...mapa.entries()].sort((a, b) => Number(a[0]) - Number(b[0]));
    const mostrar = variable === VAR_EDAD ? entradas.filter(([c]) => Number(c) <= 2 || c === EDAD_SENTINEL) : entradas;
    for (const [cod, e] of mostrar) {
      const etiqueta = e.etiquetas.size ? [...e.etiquetas].join(' | ') : '(sin etiqueta)';
      console.log(
        `   cod ${cod.padStart(3)}  "${etiqueta}"  ${fmt(e.filas).padStart(7)} filas  Σ ${fmt(e.suma).padStart(12)}`
      );
    }
    if (variable === VAR_EDAD) {
      console.log(`   … (0..109 con etiqueta = el propio número; se muestran 0,1,2 y el sentinel)`);
    }
  }

  console.log('\n🗺️  Mapeo aplicado a nombre de indicador:');
  console.log('   PERSONA_P02     : etiqueta legible de la fuente → "Mujer / Femenino" → mujeres, "Varón / Masculino" → varones');
  console.log('   PERSONA_EDADGRU : etiqueta legible cruda de la fuente (HASTA 14 AÑOS / 15 A 64 AÑOS / 65 AÑOS Y MÁS)');
  console.log(`   PERSONA_EDAD    : sin etiquetas usables → edad = cod_categoria; cod 110 ("valido hasta") → "${EDAD_SENTINEL_LABEL}"`);
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const inicio = Date.now();
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  ETL CENSO 2022 · CÓRDOBA · POBLACIÓN ${APPLY ? '· APPLY' : '· DRY-RUN'}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log(
    `🔐 CAs del sistema fusionadas con las de Node: ${habilitarCAsDelSistema() ? 'sí' : 'no (fallback)'}`
  );

  const tmp = mkdtempSync(join(tmpdir(), 'censo2022-'));
  const zipPath = join(tmp, ZIP_NAME);
  const csvPath = join(tmp, CSV_NAME);
  console.log(`📂 Temporal: ${tmp}`);

  process.stdout.write(`📥 Bajando ${ZIP_NAME} (16,7 MB)… `);
  const tDescarga = Date.now();
  await descargar(ZIP_URL, zipPath);
  console.log(`ok (${((Date.now() - tDescarga) / 1000).toFixed(1)}s)`);

  process.stdout.write(`📦 Descomprimiendo ${CSV_NAME} (144 MB)… `);
  const tUnzip = Date.now();
  await descomprimirZip(zipPath, CSV_NAME, tmp);
  console.log(`ok (${((Date.now() - tUnzip) / 1000).toFixed(1)}s)`);

  process.stdout.write('🔎 Parseando en streaming… ');
  const tParseo = Date.now();
  const { delim, esperados } = await agregarCsv(csvPath);
  console.log(`ok (${((Date.now() - tParseo) / 1000).toFixed(1)}s)`);

  console.log(
    `\n📄 CSV: ${esperados} columnas, delimitador "${delim}" · registros leídos: ${fmt(stats.registros)} ` +
      `(descartados ${fmt(stats.descartadas)})`
  );
  if (stats.descartadas > 0) {
    console.log('   Muestras descartadas:');
    for (const m of stats.muestrasDescartadas) console.log(`   ${m}`);
  }

  for (const [v, n] of [...stats.porVariable.entries()].sort()) {
    console.log(
      `   · ${v.padEnd(16)} ${fmt(n).padStart(9)} registros  Σ ${fmt(stats.sumaPorVariable.get(v) ?? 0).padStart(12)} personas`
    );
  }

  // Cross-check: las 3 variables son particiones de la MISMA población; sus
  // totales deben coincidir exactamente entre sí.
  const totalesVar = [...stats.sumaPorVariable.entries()].sort();
  const totalUnico = new Set(totalesVar.map(([, v]) => v)).size === 1;
  console.log(
    `\n🧮 SUM(cantidad) por variable: ${totalesVar.map(([v, s]) => `${v}=${fmt(s)}`).join('  ')} ` +
      (totalUnico ? '✅ coinciden' : '❌ NO coinciden')
  );

  console.log(
    `\n🌎 cod_prov en la fuente: ${[...stats.codProvs].join(', ') || '(ninguno)'} · provincias: ${[...stats.provincias].join(', ') || '(ninguna)'}`
  );

  reportarCategorias();

  // ── Departamentos detectados ──
  const prov = acumuladorProvincial();
  const depOrdenados = [...porDepartamento.entries()].sort((a, b) => b[1].total - a[1].total);
  console.log(`\n🗺️  Departamentos detectados: ${depOrdenados.length}`);
  let sumaDepartamentos = 0;
  for (const [cod, d] of depOrdenados) {
    sumaDepartamentos += d.total;
    const nombre = DEPARTAMENTOS.get(cod) ?? '⚠️ NO MAPEADO';
    console.log(`   ${cod}  ${nombre.padEnd(28)} ${fmt(d.total).padStart(12)} personas`);
  }
  console.log(`   ${''.padEnd(36)}${'─'.repeat(12)}`);
  console.log(`   ${'TOTAL DEPARTAMENTOS'.padEnd(33)} ${fmt(sumaDepartamentos).padStart(12)} personas`);
  console.log(`   ${'AGREGADO PROVINCIAL'.padEnd(33)} ${fmt(prov.total).padStart(12)} personas`);

  const noMapeados = [...porDepartamento.keys()].filter((c) => !DEPARTAMENTOS.has(c));
  if (noMapeados.length) {
    console.error(`❌ cod_dep sin nombre en DEPARTAMENTOS: ${noMapeados.join(', ')}`);
    console.error('   Aborto antes de escribir para no cargar regiones con nombre inventado.');
    process.exit(1);
  }

  // ── Consistencia: los desgloses cierran con el total por departamento ──
  console.log('\n🧮 Consistencia (SUM desglose vs Población total por departamento):');
  const inconsistencias = [];
  for (const [cod, d] of porDepartamento) {
    for (const [corte, mapa] of [['sexo', d.sexo], [VAR_EDAD_GRU, d.edadGru], [VAR_EDAD, d.edad]]) {
      const s = sumaMapa(mapa);
      if (s !== d.total) {
        inconsistencias.push(
          `${cod} ${DEPARTAMENTOS.get(cod) ?? '?'} · ${corte}: desglose=${fmt(s)} total=${fmt(d.total)} (Δ ${fmt(s - d.total)})`
        );
      }
    }
  }
  for (const [corte, mapa] of [['sexo', prov.sexo], [VAR_EDAD_GRU, prov.edadGru], [VAR_EDAD, prov.edad]]) {
    const s = sumaMapa(mapa);
    if (s !== prov.total) {
      inconsistencias.push(`Córdoba (provincia) · ${corte}: desglose=${fmt(s)} total=${fmt(prov.total)} (Δ ${fmt(s - prov.total)})`);
    }
  }
  if (inconsistencias.length === 0) {
    console.log('   ✅ SUM(PERSONA_P02 por sexo) = SUM(PERSONA_EDADGRU) = SUM(PERSONA_EDAD) = Población total en los 26 departamentos y en la provincia');
  } else {
    console.log(`   ❌ ${inconsistencias.length} diferencias:`);
    for (const i of inconsistencias.slice(0, 10)) console.log(`   ${i}`);
    if (inconsistencias.length > 10) console.log(`   … y ${inconsistencias.length - 10} más`);
  }

  // ── NNyA 0-17 (solo posible con PERSONA_EDAD año a año) ──
  console.log(`\n👶 NNyA ${NNYA_DESDE}-${NNYA_HASTA} (derivado de PERSONA_EDAD; los grupos de EDADGRU no alcanzan):`);
  let nnayProv = 0;
  for (const [cod, d] of depOrdenados) {
    let nnay = 0;
    for (const [e, v] of d.edad) {
      const n = Number(e);
      if (n >= NNYA_DESDE && n <= NNYA_HASTA) nnay += v;
    }
    nnayProv += nnay;
    const pct = d.total ? ((nnay / d.total) * 100).toFixed(1) : '0.0';
    console.log(`   ${cod}  ${(DEPARTAMENTOS.get(cod) ?? '?').padEnd(28)} ${fmt(nnay).padStart(9)}  (${pct}% de ${fmt(d.total)})`);
  }
  console.log(`   ${'TOTAL PROVINCIA'.padEnd(33)} ${fmt(nnayProv).padStart(9)}  (${((nnayProv / prov.total) * 100).toFixed(1)}% de ${fmt(prov.total)})`);

  // ── Filas a escribir ──
  const rows = construirFilas(prov);
  const nDept = porDepartamento.size;
  const nTotal = rows.filter((r) => r.indicador_nombre === 'Población total').length;
  const nSexo = rows.filter((r) => r.desglose.variable === VAR_SEXO).length - nTotal;
  const nEdadGru = rows.filter((r) => r.desglose.variable === VAR_EDAD_GRU).length;
  const nEdad = rows.filter((r) => r.desglose.variable === VAR_EDAD).length;
  console.log(`\n📊 Filas generadas: ${fmt(rows.length)}  (${nDept} departamentos + 1 agregado provincial)`);
  console.log(`   · Población total                ${String(nTotal).padStart(5)}  (periodo|region|indicador_nombre únicos)`);
  console.log(`   · Población — <sexo>             ${String(nSexo).padStart(5)}  (${prov.sexo.size} categorías × ${nDept + 1})`);
  console.log(`   · Población — <grupo de edad>    ${String(nEdadGru).padStart(5)}  (${prov.edadGru.size} categorías × ${nDept + 1})`);
  console.log(
    `   · Población — edad <n>           ${String(nEdad).padStart(5)}  (${prov.edad.size} categorías presentes; no todas están en todos los departamentos)`
  );

  // Cobertura de edades: las edades altas (100..110) no aparecen en todos los
  // radios y por lo tanto faltan en algunos departamentos; 0..17 (NNyA) sí debe
  // estar en todos.
  const faltantesEdad = [];
  const faltantesPorEdad = new Map();
  const faltantesNnya = [];
  for (const [cod, d] of porDepartamento) {
    for (let e = 0; e <= Number(EDAD_SENTINEL); e++) {
      if (d.edad.has(String(e))) continue;
      const nombre = DEPARTAMENTOS.get(cod) ?? cod;
      faltantesEdad.push(`${nombre}/edad ${e}`);
      faltantesPorEdad.set(e, (faltantesPorEdad.get(e) ?? 0) + 1);
      if (e >= NNYA_DESDE && e <= NNYA_HASTA) faltantesNnya.push(`${nombre}/edad ${e}`);
    }
  }
  if (faltantesEdad.length === 0) {
    console.log('   ✅ Cobertura de edades: 0..110 presente en los 26 departamentos');
  } else {
    const detalleEdades = [...faltantesPorEdad.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([e, c]) => `edad ${e}: ${c}/26 deptos`)
      .join(', ');
    console.log(
      `   ⚠️  Cobertura de edades: faltan ${faltantesEdad.length} combinaciones (departamento/edad) de 0..110 → ${detalleEdades}`
    );
    console.log(
      faltantesNnya.length === 0
        ? `   ✅ Cobertura NNyA ${NNYA_DESDE}-${NNYA_HASTA}: completa en los 26 departamentos (lo que falta es solo la cola alta de edad)`
        : `   ❌ Cobertura NNyA ${NNYA_DESDE}-${NNYA_HASTA} incompleta: ${faltantesNnya.slice(0, 10).join(', ')}`
    );
  }

  // ── Chequeo OBLIGATORIO de claves duplicadas (periodo|region|indicador_nombre) ──
  const conteo = new Map();
  for (const r of rows) {
    const k = `${r.periodo}|${r.region}|${r.indicador_nombre}`;
    conteo.set(k, (conteo.get(k) ?? 0) + 1);
  }
  const dups = [...conteo.entries()].filter(([, c]) => c > 1);
  console.log(
    `\n🔐 Duplicados en (periodo|region|indicador_nombre): ${dups.length}${dups.length === 0 ? ' ✅' : ' ❌'}`
  );
  if (dups.length > 0) {
    console.error('❌ Hay claves duplicadas; aborto ANTES de escribir para no ensuciar la base.');
    for (const [k, c] of dups.slice(0, 10)) console.error(`   ${c}×  ${k}`);
    if (dups.length > 10) console.error(`   … y ${dups.length - 10} claves más`);
    process.exit(1);
  }

  // ── Muestra de Capital ──
  const capital = rows.filter((r) => r.region === 'Capital');
  console.log(`\n🔬 Muestra de Capital (cod_dep 014) — ${capital.length} filas:`);
  const buscar = (nombre) => capital.find((r) => r.indicador_nombre === nombre);
  const nombresDestacados = [
    'Población total',
    'Población — varones',
    'Población — mujeres',
    'Población — HASTA 14 AÑOS',
    'Población — 15 A 64 AÑOS',
    'Población — 65 AÑOS Y MÁS',
    'Población — edad 0',
    'Población — edad 1',
    'Población — edad 17',
    'Población — edad 18',
    `Población — edad ${EDAD_SENTINEL_LABEL}`,
  ];
  for (const nombre of nombresDestacados) {
    const r = buscar(nombre);
    if (r) console.log(`   ${nombre.padEnd(34)} ${fmt(r.valor).padStart(9)}  ${r.unidad}  ${JSON.stringify(r.desglose)}`);
  }

  // ── Escritura (o plan) ──
  console.log('\n' + '─'.repeat(59));
  let res = null;
  try {
    res = await insertIfMissing(rows, { apply: APPLY });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (APPLY) {
      console.error(`❌ Error consultando/insertando en indicadores: ${msg}`);
      process.exit(1);
    }
    console.log(`⚠️  No se pudo calcular el plan contra la base (${msg}).`);
    console.log('   El dry-run de parseo/agregación/duplicados de arriba SÍ se completó.');
  }
  if (res?.error) {
    console.error(`❌ Error: ${res.error.message ?? res.error}`);
    process.exit(1);
  }

  const elapsed = ((Date.now() - inicio) / 1000).toFixed(1);
  console.log(
    res
      ? `${APPLY ? '✅ insertadas' : '🏜️  DRY-RUN · a insertar'}: ${fmt(APPLY ? res.inserted : res.missing.length)} · ya existentes: ${fmt(res.existing)} · total: ${fmt(rows.length)}` +
          (APPLY ? '' : '   (usá --apply para escribir)')
      : `🏜️  DRY-RUN sin plan de escritura · total de filas generadas: ${fmt(rows.length)}`
  );
  console.log(`⏱️  ${elapsed}s`);
  console.log('═══════════════════════════════════════════════════════════');
}

main().catch((err) => {
  console.error('❌ ETL falló:', err instanceof Error ? err.message : err);
  process.exit(1);
});
