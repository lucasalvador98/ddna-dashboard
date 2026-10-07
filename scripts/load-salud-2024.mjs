#!/usr/bin/env node
/**
 * ETL: salud 2024 — defunciones (sexo / edad / capítulo CIE-10 / causas),
 * mortalidad materna, fecundidad adolescente e histórico de defunciones.
 *
 * ── Fuentes ────────────────────────────────────────────────────────────────
 *   1. `defuncion2024.csv` — datos abiertos del DEIS (47.526 filas, delimitador
 *      ";"). Una fila por jurisdicción × causa CIE-10 × sexo × grupo de edad,
 *      con la columna `cantidad` y el flag `muerte_materna_id` (M/T/NA).
 *      Si no está en la caché se baja a `~/.cache/deis/defuncion2024.csv`
 *      (la misma carpeta que usa `scripts/extract-deis-2024.py`).
 *   2. `scripts/data/deis-vitales-2024.json` — series que sólo existen en
 *      PDF/XLSX, extraídas y validadas por `scripts/extract-deis-2024.py`:
 *      fecundidad adolescente (boletín 175, cuadro 5), razón de mortalidad
 *      materna (anuario, cuadro 44) y defunciones históricas 1914-2024 (XLSX).
 *      El `_meta` NO se carga: se usa para construir/verificar la procedencia.
 *
 * ── Qué carga (todo 2024 salvo las series) ─────────────────────────────────
 *   CSV  (`categoria='salud'`, unidad `defunciones`):
 *     · Defunciones totales                        (26 jurisdicciones del CSV + Nacional)
 *     · Defunciones — <sexo>                       (masculino/femenino/indeterminado/desconocido)
 *     · Defunciones — <grupo de edad>              (6 grupos, prefijo numérico quitado)
 *     · Defunciones por capítulo CIE-10 — <cap.>   (los 22 capítulos, ambos sexos)
 *     · Defunciones por causa — <texto CIE-10>     (top-10 por jurisdicción, ambos sexos)
 *   JSON:
 *     · Tasa fecundidad adolescente, 2013-2024 × 25 regiones (`salud_adolescente`)
 *     · Razón de mortalidad materna, 2000-2024 × 25 regiones (`salud`)
 *     · Defunciones (histórico Córdoba) 2024 — SÓLO la fila nueva; 2000-2023 no se toca
 *
 * ── Decisiones que conviene leer antes de tocar ────────────────────────────
 *   · El CSV NO trae fila `Nacional`: las jurisdicciones de id 98 (`NA`) y 99
 *     (`Sin Información`) no son provincias. Se cargan igual (si se descartaran
 *     los totales no cerrarían, mismo criterio que `load-nacimientos.mjs`) y la
 *     fila `Nacional` se CONSTRUYE como la suma de las 26 jurisdicciones del
 *     CSV. Validado: esa suma = 376.405 = `defunciones_historicas.Nacional.2024`.
 *   · El numerador de la razón de mortalidad materna es `muerte_materna_id='M'`
 *     SOLO (no `M+T`): con `M` se reproduce el cuadro 44 en las 22
 *     jurisdicciones comparables (desvío máximo 3,6%), con `M+T` el desvío
 *     llega a +211%. La RMM oficial excluye la muerte materna tardía. Igual se
 *     imprime la tabla con `M+T` como diagnóstico.
 *   · La familia `Tasa fecundidad adolescente` YA EXISTE en la base (Córdoba
 *     2015-2022, `fuente='DEIS / datos.gob.ar'`) y la pantalla
 *     /salud-adolescente la lee por nombre EXACTO. Por eso se reutilizan ese
 *     nombre y esa fuente (con otra fuente, las 8 filas existentes se
 *     reinsertarían como duplicados); la procedencia del boletín 175 viaja en
 *     `desglose`. Si la familia no existiera se usa FUENTE_FECUNDIDAD_NUEVA.
 *   · La fila 2024 de `Defunciones (histórico Córdoba)` reutiliza la fuente y la
 *     forma del `desglose` de las 24 filas 2000-2023, leídas de la base.
 *   · Los 22 capítulos CIE-10 y los 6 grupos de edad se cargan para TODAS las
 *     jurisdicciones, con 0 cuando no hubo defunciones en esa celda, para que
 *     SUM(desgloses) = Defunciones totales en cada jurisdicción.
 *   · Las causas NO se filtran por "mal definidas": son datos válidos (capítulo
 *     XVIII) y la decisión de presentación es de la pantalla.
 *
 * Dry-run por defecto; `--apply` escribe (vía insertIfMissing de etl-runner).
 * El CSV se parsea EN STREAMING (createReadStream + readline): nunca se retiene
 * el array de filas crudas, sólo los acumuladores agregados.
 *
 * Uso:
 *   node scripts/load-salud-2024.mjs           # dry-run
 *   node scripts/load-salud-2024.mjs --apply   # inserta lo faltante
 */

import { createReadStream, createWriteStream, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createInterface } from 'node:readline';
import { getCACertificates, setDefaultCACertificates } from 'node:tls';
import { buildNaturalKey, insertIfMissing } from './etl-runner.mjs';
import { supabase } from './config.mjs';

// ── Configuración ───────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..');

const APPLY = process.argv.includes('--apply');

const CATEGORIA = 'salud';
const CATEGORIA_ADOLESCENTE = 'salud_adolescente';

const UNIDAD_DEFUNCIONES = 'defunciones';
const UNIDAD_FECUNDIDAD = 'por mil';
const UNIDAD_MATERNA = 'por 10.000 nacidos vivos';

const ANIO_2024 = 2024;
const REGION_NACIONAL = 'Nacional';
const JURIS_CORDOBA = '14';

// Id sintético del acumulador nacional (no existe en el CSV: se construye sumando).
const NACIONAL_ID = 'NACIONAL';

// Ids del CSV que NO son jurisdicciones provinciales. Se cargan igual (si se
// descartaran, SUM(provincias) no cerraría con el total nacional) y se reportan
// como anomalía, con el mismo criterio que load-nacimientos.mjs.
const IDS_NO_PROVINCIA = new Map([
  ['98', 'NA'],
  ['99', 'Sin Información'],
]);

const FUENTE_CSV = 'DEIS — Defunciones 2024 (datos abiertos)';
const FUENTE_MATERNA = 'DEIS — Anuario de Estadísticas Vitales 2024, cuadro 44';

// Nombre EXACTO de la familia ya cargada (la pantalla /salud-adolescente la
// filtra por este string). Si no hubiera filas existentes se usa
// FUENTE_FECUNDIDAD_NUEVA; con la familia presente se reutiliza su fuente.
const NOMBRE_FECUNDIDAD = 'Tasa fecundidad adolescente';
const FUENTE_FECUNDIDAD_NUEVA = 'DEIS — Boletín 175 (adolescencia 2024)';
const NOMBRE_MATERNA = 'Razón de mortalidad materna';

const NOMBRE_HISTORICO_CBA = 'Defunciones (histórico Córdoba)';
const NOMBRE_HISTORICO_NACIONAL = 'Defunciones (histórico Nacional)';
const NOMBRE_NACIMIENTOS_TOTALES = 'Nacimientos totales';
const FUENTE_NACIMIENTOS_LIKE = '%Nacidos vivos%';

const JSON_PATH = join(REPO, 'scripts', 'data', 'deis-vitales-2024.json');

const CACHE_DEIS = join(homedir(), '.cache', 'deis');
const CSV_PATH = join(CACHE_DEIS, 'defuncion2024.csv');
const CSV_URL =
  'https://datos.salud.gob.ar/dataset/27c588e8-43d0-411a-a40c-7ecc563c2c9f/resource/28e2aef4-c536-43bc-a098-0bdfb9d7933c/download/defuncion2024.csv';

// ── Grupos de edad ──────────────────────────────────────────────────
// El CSV trae el prefijo numérico y los nombres sin acentos, con espacios
// internos irregulares ("01.De a 0  a 14 anios"). Se mapea por PREFIJO (no por
// el texto crudo) y la etiqueta se fija acá, que es el único lugar donde se
// decide cómo se llama cada grupo en la base.
const EDAD_GRUPOS = [
  { prefijo: 1, etiqueta: '0 a 14 años' },
  { prefijo: 2, etiqueta: '15 a 34 años' },
  { prefijo: 3, etiqueta: '35 a 54 años' },
  { prefijo: 4, etiqueta: '55 a 74 años' },
  { prefijo: 5, etiqueta: '75 y más años' },
  { prefijo: 6, etiqueta: 'Sin especificar' },
];

// Sexo: el CSV trae la etiqueta textual (`Sexo`) además del código (`sexo_id`).
// Se usa el texto (misma normalización que load-nacimientos.mjs) y se valida
// que el mapa código→texto sea el esperado.
const SEXO_POR_CODIGO = new Map([
  ['1', 'masculino'],
  ['2', 'femenino'],
  ['3', 'indeterminado'],
  ['9', 'desconocido'],
]);
const SEXOS = new Set(SEXO_POR_CODIGO.values());

// ── Capítulos CIE-10 ────────────────────────────────────────────────
// Rango completo del capítulo. Los códigos del CSV son de 3 caracteres
// (letra + 2 dígitos), así que la pertenencia se resuelve comparando
// (letra, número) contra [desde, hasta].
const CAPITULOS_CIE10 = [
  { romano: 'I', titulo: 'Enfermedades infecciosas y parasitarias', desde: 'A00', hasta: 'B99' },
  { romano: 'II', titulo: 'Tumores (neoplasias)', desde: 'C00', hasta: 'D48' },
  { romano: 'III', titulo: 'Enfermedades de la sangre y órganos hematopoyéticos', desde: 'D50', hasta: 'D89' },
  { romano: 'IV', titulo: 'Enfermedades endocrinas, nutricionales y metabólicas', desde: 'E00', hasta: 'E89' },
  { romano: 'V', titulo: 'Trastornos mentales y del comportamiento', desde: 'F00', hasta: 'F99' },
  { romano: 'VI', titulo: 'Sistema nervioso', desde: 'G00', hasta: 'G99' },
  { romano: 'VII', titulo: 'Ojo y anexos', desde: 'H00', hasta: 'H59' },
  { romano: 'VIII', titulo: 'Oído y apófisis mastoides', desde: 'H60', hasta: 'H95' },
  { romano: 'IX', titulo: 'Sistema circulatorio', desde: 'I00', hasta: 'I99' },
  { romano: 'X', titulo: 'Sistema respiratorio', desde: 'J00', hasta: 'J99' },
  { romano: 'XI', titulo: 'Sistema digestivo', desde: 'K00', hasta: 'K95' },
  { romano: 'XII', titulo: 'Piel y tejido subcutáneo', desde: 'L00', hasta: 'L99' },
  { romano: 'XIII', titulo: 'Sistema musculoesquelético y tejido conjuntivo', desde: 'M00', hasta: 'M99' },
  { romano: 'XIV', titulo: 'Sistema genitourinario', desde: 'N00', hasta: 'N99' },
  { romano: 'XV', titulo: 'Embarazo, parto y puerperio', desde: 'O00', hasta: 'O99' },
  { romano: 'XVI', titulo: 'Afecciones originadas en el período perinatal', desde: 'P00', hasta: 'P96' },
  { romano: 'XVII', titulo: 'Malformaciones congénitas y deformidades', desde: 'Q00', hasta: 'Q99' },
  { romano: 'XVIII', titulo: 'Síntomas y signos mal definidos', desde: 'R00', hasta: 'R99' },
  { romano: 'XIX', titulo: 'Lesiones, envenenamientos y otras consecuencias de causas externas', desde: 'S00', hasta: 'T98' },
  { romano: 'XX', titulo: 'Causas externas de morbilidad y mortalidad', desde: 'V01', hasta: 'Y98' },
  { romano: 'XXI', titulo: 'Factores que influyen en el estado de salud', desde: 'Z00', hasta: 'Z99' },
  { romano: 'XXII', titulo: 'Códigos para propósitos especiales', desde: 'U00', hasta: 'U99' },
];

const TOP_CAUSAS = 10;

// Columnas REALES del CSV (ojo: "jurisdicion_residencia_nombre" va con una sola
// "s" y los campos vienen entrecomillados; partirLinea saca las comillas).
const COL = {
  anio: 'anio',
  jurisId: 'jurisdiccion_de_residencia_id',
  jurisNombre: 'jurisdicion_residencia_nombre',
  cie10: 'cie10_causa_id',
  cie10Texto: 'cie10_clasificacion',
  sexoId: 'sexo_id',
  sexo: 'Sexo',
  materna: 'muerte_materna_id',
  edad: 'grupo_edad',
  cantidad: 'cantidad',
};

const COLUMNAS_CSV = 11;

// ── Parser CSV (sin dependencias) ───────────────────────────────────
// Copiado de load-nacimientos.mjs (allí no se exporta porque ese script corre
// como CLI): respeta comillas y "" escapadas.

/** Detecta el delimitador contando separadores FUERA de comillas. */
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

/** Parte una línea CSV respetando comillas dobles ("a;b") y "" escapadas. */
function partirLinea(linea, delim) {
  const campos = [];
  let actual = '';
  let enComillas = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (enComillas) {
      if (c === '"') {
        if (linea[i + 1] === '"') {
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
  return campos;
}

function mapearColumnas(header, spec) {
  const idx = {};
  for (const [clave, nombre] of Object.entries(spec)) {
    const i = header.indexOf(nombre);
    if (i === -1) {
      throw new Error(
        `falta la columna "${nombre}" en el CSV. Header: ${JSON.stringify(header)}`
      );
    }
    idx[clave] = i;
  }
  return idx;
}

// ── Normalizadores ──────────────────────────────────────────────────

/** Igual que load-nacimientos: minúsculas sin acentos (masculino/femenino/...). */
function normalizarSexo(raw) {
  const s = String(raw ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (!s) return null;
  if (s === 'm' || s === 'masculino' || s === 'varon' || s === 'nino') return 'masculino';
  if (s === 'f' || s === 'femenino' || s === 'mujer' || s === 'nina') return 'femenino';
  return s;
}

/** "01.De a 0  a 14 anios" -> 1 (el prefijo numérico es la clave estable). */
function prefijoGrupoEdad(raw) {
  const m = /^\s*(\d+)\s*\./.exec(String(raw ?? ''));
  return m ? Number(m[1]) : null;
}

/** Entero de defunciones. Los CSV traen enteros planos, sin separador de miles. */
function parseCantidad(raw) {
  const s = String(raw ?? '').trim();
  if (s === '') return null;
  if (/^\d+$/.test(s)) return Number(s);
  if (/^\d{1,3}(\.\d{3})+$/.test(s)) return Number(s.replace(/\./g, '')); // 1.234
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** Dos decimales, como haría validateRows (para no meter ruido de float). */
function dosDecimales(n) {
  return Number(Number(n).toFixed(2));
}

/** El desglose puede venir como objeto o como string JSON (loaders viejos). */
function desgloseComoObjeto(desglose) {
  if (typeof desglose === 'string') {
    try {
      return JSON.parse(desglose);
    } catch {
      return {};
    }
  }
  return desglose && typeof desglose === 'object' ? desglose : {};
}

// ── Clave (letra, número) para los rangos CIE-10 ─────────────────────

function claveCie10(codigo) {
  const m = /^([A-Z])(\d{2})$/.exec(String(codigo ?? '').trim().toUpperCase());
  if (!m) return null;
  return m[1].charCodeAt(0) * 1000 + Number(m[2]);
}

/** Capítulo CIE-10 de un código de 3 caracteres, o null si no cae en ninguno. */
function capituloDe(codigo) {
  const k = claveCie10(codigo);
  if (k === null) return null;
  for (const cap of CAPITULOS_CIE10) {
    if (claveCie10(cap.desde) <= k && k <= claveCie10(cap.hasta)) return cap;
  }
  return null;
}

function nombreCapitulo(cap) {
  return `Defunciones por capítulo CIE-10 — ${cap.romano} ${cap.titulo} (${cap.desde}-${cap.hasta})`;
}

function familiaDe(row) {
  const n = row.indicador_nombre;
  if (row.categoria === CATEGORIA_ADOLESCENTE) return 'Tasa fecundidad adolescente';
  if (n === 'Defunciones totales') return 'Defunciones totales';
  if (n.startsWith('Defunciones — ')) {
    const sufijo = n.slice('Defunciones — '.length);
    return SEXOS.has(sufijo) ? 'Defunciones — sexo' : 'Defunciones — grupo de edad';
  }
  if (n.startsWith('Defunciones por capítulo CIE-10')) return 'Defunciones por capítulo CIE-10';
  if (n.startsWith('Defunciones por causa')) return 'Defunciones por causa (top-10)';
  if (n === NOMBRE_MATERNA) return 'Razón de mortalidad materna (cuadro 44)';
  if (n === NOMBRE_HISTORICO_CBA) return 'Defunciones (histórico Córdoba)';
  return 'otros';
}

// ── Estado de la corrida ────────────────────────────────────────────

const stats = {
  filasLeidas: 0,
  filasDescartadas: 0,
  muestrasDescartadas: [],
  jurisdicciones: new Map(), // id -> nombre
  sexoIdATexto: new Map(), // `${sexo_id}` -> Set(texto)
  codigosSinCapitulo: new Map(), // codigo -> defunciones
  gruposEdadCrudos: new Map(), // texto crudo -> filas
  crudoPorPrefijoEdad: new Map(), // prefijo -> texto crudo observado
  maternaFlags: new Map(), // flag -> filas
};

// Acumuladores agregados. `jid` es el id del CSV o NACIONAL_ID (el nacional se
// acumula fila a fila sumando TODAS las jurisdicciones, incluidas 98 y 99, para
// que cierre con el total del archivo).
const accTotales = new Map(); // jid -> { jurisId, region, valor }
const accSexo = new Map(); // `${jid}|${sexo}` -> { jurisId, region, sexo, valor }
const accEdad = new Map(); // `${jid}|${prefijo}` -> { jurisId, region, prefijo, etiqueta, valor }
const accCapitulo = new Map(); // `${jid}|${romano}` -> { jurisId, region, cap, valor }
const accCausa = new Map(); // `${jid}|${codigo}` -> { jurisId, region, codigo, texto, valor }
const accMaterna = new Map(); // `${jid}|${flag}` -> { jurisId, region, flag, valor }

function regionDe(jid) {
  return jid === NACIONAL_ID ? REGION_NACIONAL : (stats.jurisdicciones.get(jid) ?? jid);
}

function descartar(motivo, lineaNro, linea) {
  stats.filasDescartadas++;
  if (stats.muestrasDescartadas.length < 5) {
    stats.muestrasDescartadas.push(`L${lineaNro} ${motivo} :: ${linea.slice(0, 140)}`);
  }
}

// ── Descarga ────────────────────────────────────────────────────────

/**
 * datos.salud.gob.ar sirve la cadena TLS sin el certificado intermedio; el
 * bundle Mozilla que trae Node no lo tiene y fetch muere con "unable to verify
 * the first certificate". Se FUSIONA el store del sistema con el default:
 * arregla el problema SIN desactivar la verificación (nunca
 * rejectUnauthorized:false). Mismo criterio que load-nacimientos.mjs.
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
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destino));
}

/** Baja el CSV sólo si no está en la caché del extractor. */
async function asegurarCsv() {
  if (existsSync(CSV_PATH)) {
    console.log(`📦 CSV en caché: ${CSV_PATH}`);
    return;
  }
  mkdirSync(CACHE_DEIS, { recursive: true });
  console.log(`🔐 CAs del sistema fusionadas con las de Node: ${habilitarCAsDelSistema() ? 'sí' : 'no (fallback)'}`);
  process.stdout.write('📥 bajando defuncion2024.csv … ');
  await descargar(CSV_URL, CSV_PATH);
  console.log('ok');
}

// ── Parseo en streaming + agregación ────────────────────────────────

async function agregarDefunciones(path) {
  const rl = createInterface({
    input: createReadStream(path, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  let idx = null;
  let delim = ';';
  let lineaNro = 0;

  for await (const linea of rl) {
    lineaNro++;
    if (lineaNro === 1) {
      const header = linea.replace(/^\uFEFF/, '');
      delim = detectarDelimitador(header);
      idx = mapearColumnas(partirLinea(header, delim), COL);
      continue;
    }
    if (!linea.trim()) continue;

    const campos = partirLinea(linea, delim);
    if (campos.length !== COLUMNAS_CSV) {
      descartar(`se esperaban ${COLUMNAS_CSV} columnas y vinieron ${campos.length}`, lineaNro, linea);
      continue;
    }

    const cantidad = parseCantidad(campos[idx.cantidad]);
    if (cantidad === null) {
      descartar(`cantidad no numérica "${campos[idx.cantidad]}"`, lineaNro, linea);
      continue;
    }

    const anio = String(campos[idx.anio] ?? '').trim();
    if (anio !== String(ANIO_2024)) {
      descartar(`anio inesperado "${anio}" (el archivo es de 2024)`, lineaNro, linea);
      continue;
    }

    const jurisId = String(campos[idx.jurisId] ?? '').trim();
    const region = String(campos[idx.jurisNombre] ?? '').trim();
    if (!jurisId || !region) {
      descartar('jurisdicción vacía', lineaNro, linea);
      continue;
    }
    if (!stats.jurisdicciones.has(jurisId)) stats.jurisdicciones.set(jurisId, region);
    else if (stats.jurisdicciones.get(jurisId) !== region) {
      descartar(`jurisdicción ${jurisId} con dos nombres distintos`, lineaNro, linea);
      continue;
    }

    const sexoId = String(campos[idx.sexoId] ?? '').trim();
    const sexoTexto = String(campos[idx.sexo] ?? '').trim();
    if (!stats.sexoIdATexto.has(sexoId)) stats.sexoIdATexto.set(sexoId, new Set());
    stats.sexoIdATexto.get(sexoId).add(sexoTexto);
    const sexo = normalizarSexo(sexoTexto);
    if (!sexo) {
      descartar('sexo vacío (no se agrega al desglose por sexo)', lineaNro, linea);
      continue;
    }

    const grupoRaw = String(campos[idx.edad] ?? '').trim();
    const prefijo = prefijoGrupoEdad(grupoRaw);
    const definicionEdad = EDAD_GRUPOS.find((g) => g.prefijo === prefijo);
    if (!definicionEdad) {
      descartar(`grupo de edad sin mapear "${grupoRaw}"`, lineaNro, linea);
      continue;
    }
    stats.gruposEdadCrudos.set(grupoRaw, (stats.gruposEdadCrudos.get(grupoRaw) ?? 0) + 1);
    if (!stats.crudoPorPrefijoEdad.has(prefijo)) stats.crudoPorPrefijoEdad.set(prefijo, grupoRaw);

    const codigo = String(campos[idx.cie10] ?? '').trim().toUpperCase();
    const texto = String(campos[idx.cie10Texto] ?? '').trim();
    if (!codigo || !texto) {
      descartar('causa CIE-10 vacía', lineaNro, linea);
      continue;
    }
    const cap = capituloDe(codigo);
    if (!cap) {
      stats.codigosSinCapitulo.set(codigo, (stats.codigosSinCapitulo.get(codigo) ?? 0) + cantidad);
    }

    const flagMaterna = String(campos[idx.materna] ?? '').trim() || 'NA';
    stats.maternaFlags.set(flagMaterna, (stats.maternaFlags.get(flagMaterna) ?? 0) + 1);

    // Se acumula por la jurisdicción del CSV y por el agregado nacional.
    for (const jid of [jurisId, NACIONAL_ID]) {
      const t = accTotales.get(jid) ?? { jurisId: jid, region: regionDe(jid), valor: 0 };
      t.valor += cantidad;
      accTotales.set(jid, t);

      const ks = `${jid}|${sexo}`;
      const s = accSexo.get(ks) ?? { jurisId: jid, region: regionDe(jid), sexo, valor: 0 };
      s.valor += cantidad;
      accSexo.set(ks, s);

      const ke = `${jid}|${prefijo}`;
      const e = accEdad.get(ke) ?? {
        jurisId: jid,
        region: regionDe(jid),
        prefijo,
        etiqueta: definicionEdad.etiqueta,
        valor: 0,
      };
      e.valor += cantidad;
      accEdad.set(ke, e);

      if (cap) {
        const kc = `${jid}|${cap.romano}`;
        const c = accCapitulo.get(kc) ?? { jurisId: jid, region: regionDe(jid), cap, valor: 0 };
        c.valor += cantidad;
        accCapitulo.set(kc, c);
      }

      const kca = `${jid}|${codigo}`;
      const ca = accCausa.get(kca) ?? { jurisId: jid, region: regionDe(jid), codigo, texto, valor: 0 };
      ca.valor += cantidad;
      accCausa.set(kca, ca);

      if (flagMaterna === 'M' || flagMaterna === 'T') {
        const km = `${jid}|${flagMaterna}`;
        const m = accMaterna.get(km) ?? { jurisId: jid, region: regionDe(jid), flag: flagMaterna, valor: 0 };
        m.valor += cantidad;
        accMaterna.set(km, m);
      }
    }

    stats.filasLeidas++;
  }

  return { delimitador: delim, lineas: lineaNro - 1 };
}

// ── Lecturas de la base (para validar y reutilizar procedencia) ─────

/** Pagina con .range(): PostgREST corta en 1000 y acá se leen familias enteras. */
async function paginar(construir) {
  const out = [];
  for (let off = 0; ; off += 1000) {
    const { data, error } = await construir().range(off, off + 999);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
}

async function contar(construir) {
  const { count, error } = await construir(
    supabase.from('indicadores').select('*', { count: 'exact', head: true })
  );
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/** Filas de una familia existente (nombre exacto), paginadas y ordenadas. */
function leerFamilia(nombre, { categoria } = {}) {
  return paginar(() => {
    let q = supabase
      .from('indicadores')
      .select('indicador_nombre, categoria, unidad, fuente, periodo, region, valor, desglose')
      .eq('indicador_nombre', nombre);
    if (categoria) q = q.eq('categoria', categoria);
    return q.order('periodo', { ascending: true });
  });
}

/**
 * Fuente única de una familia ya cargada; null si no hay filas. Si hay más de
 * una no se elige a dedo: se corta, porque no se puede reutilizar procedencia.
 */
function fuenteUnica(filas, etiqueta) {
  const fuentes = [...new Set(filas.map((f) => f.fuente))];
  if (fuentes.length > 1) {
    throw new Error(
      `la familia "${etiqueta}" tiene ${fuentes.length} fuentes distintas (${fuentes.join(' | ')}): ` +
        'no se puede reutilizar una procedencia única sin decidir a mano cuál corresponde.'
    );
  }
  return fuentes[0] ?? null;
}

/** Nacidos vivos 2024 por jurisdicción, desde la base (denominador de la RMM). */
async function leerNacimientos2024() {
  const filas = await paginar(() =>
    supabase
      .from('indicadores')
      .select('region, valor, fuente')
      .eq('categoria', CATEGORIA)
      .eq('indicador_nombre', NOMBRE_NACIMIENTOS_TOTALES)
      .eq('periodo', ANIO_2024)
      .like('fuente', FUENTE_NACIMIENTOS_LIKE)
      .order('region', { ascending: true })
  );
  const porRegion = new Map(filas.map((f) => [f.region, Number(f.valor)]));
  const nacional = [...porRegion.values()].reduce((a, b) => a + b, 0);
  return { porRegion, nacional, filas: filas.length };
}

// ── Construcción de filas para `indicadores` ────────────────────────

function ordenarJids(a, b) {
  if (a === NACIONAL_ID) return 1;
  if (b === NACIONAL_ID) return -1;
  return Number(a) - Number(b);
}

function filasDesdeCsv() {
  const filas = [];
  const jids = [...accTotales.keys()].sort(ordenarJids);

  for (const jid of jids) {
    const t = accTotales.get(jid);
    filas.push({
      indicador_nombre: 'Defunciones totales',
      categoria: CATEGORIA,
      valor: t.valor,
      unidad: UNIDAD_DEFUNCIONES,
      periodo: ANIO_2024,
      region: t.region,
      desglose:
        jid === NACIONAL_ID
          ? {
              anio: ANIO_2024,
              construido: 'suma de las jurisdicciones del CSV (el archivo no trae fila Nacional)',
              jurisdicciones_sumadas: accTotales.size - 1,
            }
          : { anio: ANIO_2024, jurisdiccion_id: Number(jid) },
      fuente: FUENTE_CSV,
      activo: true,
    });
  }

  // Los 4 sexos se emiten para TODAS las jurisdicciones (con 0 si no hubo
  // defunciones de ese sexo) para que SUM(sexos) = Defunciones totales.
  for (const jid of jids) {
    const region = regionDe(jid);
    for (const sexo of SEXO_POR_CODIGO.values()) {
      const s = accSexo.get(`${jid}|${sexo}`);
      filas.push({
        indicador_nombre: `Defunciones — ${sexo}`,
        categoria: CATEGORIA,
        valor: s?.valor ?? 0,
        unidad: UNIDAD_DEFUNCIONES,
        periodo: ANIO_2024,
        region,
        desglose: { anio: ANIO_2024, sexo, sin_filas_en_la_fuente: s === undefined },
        fuente: FUENTE_CSV,
        activo: true,
      });
    }
  }

  // Los 6 grupos se emiten para TODAS las jurisdicciones (con 0 si el CSV no
  // trae filas de ese grupo) para que SUM(grupos) = Defunciones totales.
  for (const jid of jids) {
    const region = regionDe(jid);
    for (const g of EDAD_GRUPOS) {
      const e = accEdad.get(`${jid}|${g.prefijo}`);
      filas.push({
        indicador_nombre: `Defunciones — ${g.etiqueta}`,
        categoria: CATEGORIA,
        valor: e?.valor ?? 0,
        unidad: UNIDAD_DEFUNCIONES,
        periodo: ANIO_2024,
        region,
        desglose: {
          anio: ANIO_2024,
          grupo_edad: g.etiqueta,
          grupo_edad_fuente: stats.crudoPorPrefijoEdad.get(g.prefijo) ?? '',
          sin_filas_en_la_fuente: e === undefined,
        },
        fuente: FUENTE_CSV,
        activo: true,
      });
    }
  }

  // Los 22 capítulos se emiten para TODAS las jurisdicciones (0 si no hubo
  // defunciones de ese capítulo): así SUM(capítulos) = Defunciones totales.
  for (const jid of jids) {
    const region = regionDe(jid);
    for (const cap of CAPITULOS_CIE10) {
      const c = accCapitulo.get(`${jid}|${cap.romano}`);
      filas.push({
        indicador_nombre: nombreCapitulo(cap),
        categoria: CATEGORIA,
        valor: c?.valor ?? 0,
        unidad: UNIDAD_DEFUNCIONES,
        periodo: ANIO_2024,
        region,
        desglose: {
          anio: ANIO_2024,
          capitulo: cap.romano,
          rango_cie10: `${cap.desde}-${cap.hasta}`,
          sexo: 'todos',
          sin_filas_en_la_fuente: c === undefined,
        },
        fuente: FUENTE_CSV,
        activo: true,
      });
    }
  }

  // Top-N causas por jurisdicción (ambos sexos). No se excluye ninguna causa.
  const causasPorJid = new Map();
  for (const c of accCausa.values()) {
    if (!causasPorJid.has(c.jurisId)) causasPorJid.set(c.jurisId, []);
    causasPorJid.get(c.jurisId).push(c);
  }
  for (const jid of jids) {
    const candidatas = (causasPorJid.get(jid) ?? []).slice().sort((a, b) => {
      if (b.valor !== a.valor) return b.valor - a.valor;
      return a.codigo.localeCompare(b.codigo, 'es');
    });
    candidatas.slice(0, TOP_CAUSAS).forEach((c, i) => {
      filas.push({
        indicador_nombre: `Defunciones por causa — ${c.texto}`,
        categoria: CATEGORIA,
        valor: c.valor,
        unidad: UNIDAD_DEFUNCIONES,
        periodo: ANIO_2024,
        region: c.region,
        desglose: {
          anio: ANIO_2024,
          cie10_causa_id: c.codigo,
          rango: i + 1,
          sexo: 'todos',
          causas_candidatas: candidatas.length,
        },
        fuente: FUENTE_CSV,
        activo: true,
      });
    });
  }

  return filas;
}

function filasSeriesJson(json, fuenteFecundidad) {
  const filas = [];
  const meta = json._meta ?? {};
  const pdfFecundidad = meta.fuentes?.fecundidad_adolescente?.pdf ?? 'boletín 175';
  const pdfAnuario = meta.fuentes?.mortalidad_materna?.pdf ?? 'anuario de estadísticas vitales';
  const vacios = { fecundidad: 0, materna: 0 };

  for (const { region, serie } of json.fecundidad_adolescente) {
    for (const [anio, valor] of Object.entries(serie)) {
      if (valor === null || valor === undefined) {
        vacios.fecundidad++;
        continue;
      }
      filas.push({
        indicador_nombre: NOMBRE_FECUNDIDAD,
        categoria: CATEGORIA_ADOLESCENTE,
        valor: dosDecimales(valor),
        unidad: UNIDAD_FECUNDIDAD,
        periodo: Number(anio),
        region,
        desglose: {
          anio: Number(anio),
          cuadro: '5',
          boletin: 'Boletín 175 — Salud de adolescentes 2024',
          pdf: pdfFecundidad,
          denominador: 'nacidos vivos de madres de 10 a 19 por cada 1.000 mujeres de 10 a 19',
        },
        fuente: fuenteFecundidad,
        activo: true,
      });
    }
  }

  for (const { region, serie } of json.mortalidad_materna) {
    for (const [anio, valor] of Object.entries(serie)) {
      if (valor === null || valor === undefined) {
        vacios.materna++;
        continue;
      }
      filas.push({
        indicador_nombre: NOMBRE_MATERNA,
        categoria: CATEGORIA,
        valor: dosDecimales(valor),
        unidad: UNIDAD_MATERNA,
        periodo: Number(anio),
        region,
        desglose: {
          anio: Number(anio),
          cuadro: '44',
          pdf: pdfAnuario,
          definicion: 'muertes maternas (M) por 10.000 nacidos vivos',
        },
        fuente: FUENTE_MATERNA,
        activo: true,
      });
    }
  }

  return { filas, vacios };
}

// ── Validaciones y reporte ──────────────────────────────────────────

const fallas = [];

function chequear(ok, descripcion) {
  console.log(`   ${ok ? '✅' : '❌'} ${descripcion}`);
  if (!ok) fallas.push(descripcion);
  return ok;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  ETL SALUD 2024 — DEIS (defunciones · materna · fecundidad) ${APPLY ? '· APPLY' : '· DRY-RUN'}`);
  console.log('═══════════════════════════════════════════════════════════');

  // ── 0. Entradas ──
  const json = JSON.parse(readFileSync(JSON_PATH, 'utf8'));
  const meta = json._meta ?? {};
  console.log(`📄 series JSON: ${JSON_PATH}`);
  console.log(`   generado ${meta.generado ?? '?'} — ${meta.procesamiento ?? '?'}`);
  await asegurarCsv();

  const parseo = await agregarDefunciones(CSV_PATH);

  // ── 1. Base: familias ya cargadas (para validar y reutilizar procedencia) ──
  const nacimientos = await leerNacimientos2024();
  const fecundidadBase = await leerFamilia(NOMBRE_FECUNDIDAD, { categoria: CATEGORIA_ADOLESCENTE });
  const historicoCbaBase = (await leerFamilia(NOMBRE_HISTORICO_CBA)).filter((f) => f.region === 'Córdoba');
  const historicoNacionalBase = (await leerFamilia(NOMBRE_HISTORICO_NACIONAL)).filter(
    (f) => f.region === REGION_NACIONAL
  );

  const fuenteFecundidad = fuenteUnica(fecundidadBase, NOMBRE_FECUNDIDAD) ?? FUENTE_FECUNDIDAD_NUEVA;
  const fuenteHistoricoCba = fuenteUnica(historicoCbaBase, NOMBRE_HISTORICO_CBA);
  if (!fuenteHistoricoCba) {
    throw new Error(
      `no hay filas de "${NOMBRE_HISTORICO_CBA}" en la base: sin la serie 2000-2023 no se puede ` +
        'extender con la fuente existente (no se inventa una nueva).'
    );
  }
  // La familia histórico guardó el desglose como string JSON (jsonb escalar):
  // se preserva esa MISMA forma para la fila nueva, no una representación nueva.
  const desgloseHistoricoTexto = JSON.stringify({
    ...desgloseComoObjeto(historicoCbaBase.at(-1)?.desglose),
    anio: ANIO_2024,
  });

  const conteos = {
    nacimientos: await contar((q) =>
      q.eq('categoria', CATEGORIA).like('indicador_nombre', 'Nacimientos%').like('fuente', FUENTE_NACIMIENTOS_LIKE)
    ),
    historicoCba: historicoCbaBase.length,
    historicoNacional: historicoNacionalBase.length,
    fecundidad: fecundidadBase.length,
  };

  console.log('\n🗂️  Familias ya cargadas (deben quedar intactas):');
  console.log(`   nacimientos (Nacidos vivos)        ${String(conteos.nacimientos).padStart(6)}`);
  console.log(`   defunciones histórico Córdoba      ${String(conteos.historicoCba).padStart(6)}  (${historicoCbaBase[0]?.periodo}-${historicoCbaBase.at(-1)?.periodo})  fuente "${fuenteHistoricoCba}"`);
  console.log(`   defunciones histórico Nacional     ${String(conteos.historicoNacional).padStart(6)}  (${historicoNacionalBase[0]?.periodo}-${historicoNacionalBase.at(-1)?.periodo})`);
  console.log(`   fecundidad adolescente             ${String(conteos.fecundidad).padStart(6)}  (${fecundidadBase[0]?.periodo}-${fecundidadBase.at(-1)?.periodo})  fuente "${fuenteFecundidad}"`);
  console.log(`   · desglose reutilizado por la fila 2024 del histórico: ${desgloseHistoricoTexto}`);

  // ── 2. Filas ──
  const { filas: filasJson, vacios } = filasSeriesJson(json, fuenteFecundidad);
  const filasCsv = filasDesdeCsv();
  const valorCordobaCsv = accTotales.get(JURIS_CORDOBA)?.valor ?? null;
  const filasHistorico = [
    {
      indicador_nombre: NOMBRE_HISTORICO_CBA,
      categoria: CATEGORIA,
      valor: valorCordobaCsv,
      unidad: UNIDAD_DEFUNCIONES,
      periodo: ANIO_2024,
      region: 'Córdoba',
      desglose: desgloseHistoricoTexto,
      fuente: fuenteHistoricoCba,
      activo: true,
    },
  ];
  const filas = [...filasCsv, ...filasJson, ...filasHistorico];

  console.log(`\n📥 Filas crudas del CSV: ${stats.filasLeidas} leídas · ${stats.filasDescartadas} descartadas (delimitador "${parseo.delimitador}", ${parseo.lineas} líneas)`);
  if (stats.filasDescartadas) for (const m of stats.muestrasDescartadas) console.log(`   ${m}`);

  const porFamilia = new Map();
  for (const r of filas) {
    const f = familiaDe(r);
    porFamilia.set(f, (porFamilia.get(f) ?? 0) + 1);
  }
  console.log(`\n📊 Filas generadas: ${filas.length}`);
  for (const [f, n] of porFamilia) console.log(`   ${f.padEnd(44)} ${String(n).padStart(5)}`);

  // ── 3. Jurisdicciones del CSV ──
  const jidsReales = [...stats.jurisdicciones.keys()].sort(ordenarJids);
  console.log(`\n🗺️  Jurisdicciones del CSV: ${jidsReales.length} (+ Nacional construido)`);
  for (const jid of jidsReales) {
    const marcas = [];
    if (IDS_NO_PROVINCIA.has(jid)) marcas.push('⚠️ NO es provincia');
    console.log(
      `   id ${jid.padStart(3)}  ${(stats.jurisdicciones.get(jid) ?? '').padEnd(52)} ${String(accTotales.get(jid)?.valor ?? 0).padStart(7)} defunciones${marcas.length ? '   ' + marcas.join(' · ') : ''}`
    );
  }
  const tieneNacional = jidsReales.some((j) => stats.jurisdicciones.get(j) === REGION_NACIONAL);
  console.log(
    `   → el CSV ${tieneNacional ? 'SÍ' : 'NO'} trae la fila Nacional: \`Defunciones totales\` de Nacional se construye sumando las ${jidsReales.length} jurisdicciones del archivo.`
  );

  console.log(`\n🔎 sexo_id -> Sexo: ${[...stats.sexoIdATexto.entries()].map(([k, v]) => `${k}=${[...v].join('/')}`).join('  ')}`);
  console.log(`🔎 grupos de edad del CSV -> etiqueta cargada:`);
  for (const g of [...stats.gruposEdadCrudos.keys()].sort()) {
    console.log(`   "${g}"${' '.repeat(Math.max(1, 26 - g.length))} -> ${EDAD_GRUPOS.find((x) => x.prefijo === prefijoGrupoEdad(g))?.etiqueta}   (${stats.gruposEdadCrudos.get(g)} filas)`);
  }
  console.log(`🔎 flag muerte_materna: ${[...stats.maternaFlags.entries()].map(([k, v]) => `${k}=${v} filas`).join('  ')}`);

  // ── 4. Validaciones obligatorias ──
  console.log('\n🔐 Validaciones');

  // 4.1 duplicados en (periodo|region|indicador_nombre)
  const conteo = new Map();
  for (const r of filas) {
    const k = `${r.periodo}|${r.region}|${r.indicador_nombre}`;
    conteo.set(k, (conteo.get(k) ?? 0) + 1);
  }
  const dups = [...conteo.entries()].filter(([, c]) => c > 1);
  if (dups.length > 0) {
    console.error(`   ❌ Duplicados en (periodo|region|indicador_nombre): ${dups.length}`);
    for (const [k, c] of dups.slice(0, 10)) console.error(`      ${c}×  ${k}`);
    console.error('   ❌ Hay claves duplicadas: aborto ANTES de escribir para no ensuciar la base.');
    process.exit(1);
  }
  console.log('   ✅ Duplicados en (periodo|region|indicador_nombre): 0');

  // 4.2 consistencia 2024 por jurisdicción
  const desvios = [];
  for (const jid of [...accTotales.keys()]) {
    const total = accTotales.get(jid).valor;
    let sumaSexo = 0;
    let sumaEdad = 0;
    let sumaCapitulo = 0;
    for (const [k, v] of accSexo) if (k.startsWith(`${jid}|`)) sumaSexo += v.valor;
    for (const [k, v] of accEdad) if (k.startsWith(`${jid}|`)) sumaEdad += v.valor;
    for (const [k, v] of accCapitulo) if (k.startsWith(`${jid}|`)) sumaCapitulo += v.valor;
    if (sumaSexo !== total || sumaEdad !== total || sumaCapitulo !== total) {
      desvios.push(`${regionDe(jid)}: total=${total} sexo=${sumaSexo} edad=${sumaEdad} capítulos=${sumaCapitulo}`);
    }
  }
  for (const d of desvios.slice(0, 10)) console.log(`      ${d}`);
  chequear(
    desvios.length === 0,
    `consistencia 2024: SUM(sexo) = SUM(grupo de edad) = SUM(capítulos CIE-10) = Defunciones totales en las ${accTotales.size} regiones`
  );

  // 4.3 XLSX vs CSV, por jurisdicción
  const historicas = new Map(json.defunciones_historicas.map((r) => [r.region, r.serie]));
  const sinPar = [];
  const mismatches = [];
  for (const jid of jidsReales) {
    const region = stats.jurisdicciones.get(jid);
    const xlsx = historicas.get(region)?.[String(ANIO_2024)];
    const csv = accTotales.get(jid).valor;
    if (xlsx === undefined) {
      sinPar.push(`${region} (id ${jid})`);
      continue;
    }
    if (xlsx !== csv) mismatches.push(`${region}: CSV=${csv} XLSX=${xlsx}`);
  }
  for (const m of mismatches.slice(0, 10)) console.log(`      ${m}`);
  console.log(`   · sin par en el XLSX (no son provincias): ${sinPar.join(', ') || 'ninguna'}`);
  chequear(
    mismatches.length === 0,
    `XLSX vs CSV 2024: coinciden las ${jidsReales.length - sinPar.length} jurisdicciones comparables`
  );

  // 4.4 suma del CSV = Nacional del XLSX
  const sumaCsv = jidsReales.reduce((a, jid) => a + accTotales.get(jid).valor, 0);
  const nacionalXlsx = historicas.get(REGION_NACIONAL)?.[String(ANIO_2024)];
  console.log(`   · suma de las ${jidsReales.length} jurisdicciones del CSV = ${sumaCsv} · XLSX Nacional 2024 = ${nacionalXlsx} · fila Nacional construida = ${accTotales.get(NACIONAL_ID)?.valor}`);
  chequear(sumaCsv === nacionalXlsx, `Nacional construido = XLSX (${nacionalXlsx})`);

  // 4.5 cross-check de mortalidad materna
  const cuadro44 = new Map(json.mortalidad_materna.map((r) => [r.region, r.serie]));
  const filasMat = [];
  const fallasMaterna = [];
  for (const region of [...nacimientos.porRegion.keys()].sort((a, b) => a.localeCompare(b, 'es'))) {
    const jid = jidsReales.find((j) => stats.jurisdicciones.get(j) === region);
    if (!jid) continue;
    const nv = nacimientos.porRegion.get(region);
    const m = accMaterna.get(`${jid}|M`)?.valor ?? 0;
    const t = accMaterna.get(`${jid}|T`)?.valor ?? 0;
    const ref = cuadro44.get(region)?.[String(ANIO_2024)];
    filasMat.push({ region, nv, m, t, computada: (m / nv) * 10000, computadaMT: ((m + t) / nv) * 10000, ref });
    if (ref === null || ref === undefined) continue;
    const dev = (((m / nv) * 10000 - ref) / ref) * 100;
    if (Math.abs(dev) > 15) {
      fallasMaterna.push(`${region}: cuadro 44 ${ref} vs M/NV ${((m / nv) * 10000).toFixed(2)} (${dev.toFixed(1)}%)`);
    }
  }
  const nvNacional = nacimientos.nacional;
  const mNacional = accMaterna.get(`${NACIONAL_ID}|M`)?.valor ?? 0;
  const tNacional = accMaterna.get(`${NACIONAL_ID}|T`)?.valor ?? 0;
  const refNacional = cuadro44.get(REGION_NACIONAL)?.[String(ANIO_2024)];
  filasMat.push({
    region: `${REGION_NACIONAL} (total, construido)`,
    nv: nvNacional,
    m: mNacional,
    t: tNacional,
    computada: (mNacional / nvNacional) * 10000,
    computadaMT: ((mNacional + tNacional) / nvNacional) * 10000,
    ref: refNacional,
  });
  const devNacional = (((mNacional / nvNacional) * 10000 - refNacional) / refNacional) * 100;

  console.log('\n   Razón de mortalidad materna: calculada desde el CSV vs cuadro 44 (por 10.000 NV)');
  console.log(
    `   ${'región'.padEnd(52)} ${'NV'.padStart(7)} ${'M'.padStart(3)} ${'T'.padStart(3)} ${'M/NV'.padStart(7)} ${'M+T/NV'.padStart(8)} ${'cuadro44'.padStart(9)} ${'ΔM'.padStart(8)}`
  );
  for (const f of filasMat) {
    const devM = f.ref ? ((f.computada - f.ref) / f.ref) * 100 : null;
    const marca = devM === null ? '' : Math.abs(devM) > 15 ? ' ❌' : '';
    console.log(
      `   ${f.region.padEnd(52)} ${String(f.nv).padStart(7)} ${String(f.m).padStart(3)} ${String(f.t).padStart(3)} ${f.computada.toFixed(2).padStart(7)} ${f.computadaMT.toFixed(2).padStart(8)} ${String(f.ref ?? 'sin dato').padStart(9)} ${(devM === null ? 'n/a' : `${devM >= 0 ? '+' : ''}${devM.toFixed(1)}%`).padStart(8)}${marca}`
    );
  }
  for (const m of fallasMaterna.slice(0, 10)) console.log(`      ${m}`);
  const conRef = filasMat.filter((f) => typeof f.ref === 'number').length;
  const fueraMT = filasMat.filter((f) => typeof f.ref === 'number' && Math.abs(((f.computadaMT - f.ref) / f.ref) * 100) > 15).length;
  console.log(
    `   · con M: ${conRef - fallasMaterna.length}/${conRef} dentro de ±15% · Nacional ${(mNacional / nvNacional * 10000).toFixed(2)} vs ${refNacional} (${devNacional >= 0 ? '+' : ''}${devNacional.toFixed(1)}%)`
  );
  console.log(
    `   · con M+T: ${fueraMT}/${conRef} fuera de ±15% (el cuadro 44 excluye la muerte materna tardía) → se usa M.`
  );
  chequear(
    fallasMaterna.length === 0 && Math.abs(devNacional) <= 15,
    'cross-check de mortalidad materna dentro de ±15%'
  );

  // 4.6 las filas ya cargadas se reconocen (no se reinsertan)
  const clavesBase = new Set(fecundidadBase.map((f) => buildNaturalKey(f)));
  const propias = filasJson.filter(
    (r) => r.indicador_nombre === NOMBRE_FECUNDIDAD && r.region === 'Córdoba' && r.periodo >= 2015 && r.periodo <= 2022
  );
  const reconocidas = propias.filter((r) => clavesBase.has(buildNaturalKey(r))).length;
  chequear(
    propias.length === 8 && reconocidas === 8,
    `fecundidad adolescente Córdoba 2015-2022: ${reconocidas}/${propias.length} filas ya existentes con la misma clave natural (no se reinsertan)`
  );
  chequear(
    !filas.some((r) => r.indicador_nombre === NOMBRE_HISTORICO_CBA && r.periodo !== ANIO_2024),
    `histórico Córdoba: se genera sólo ${ANIO_2024} (las ${conteos.historicoCba} filas 2000-2023 no se tocan)`
  );

  // 4.7 códigos CIE-10 sin capítulo
  chequear(
    stats.codigosSinCapitulo.size === 0,
    `todos los códigos CIE-10 caen en un capítulo${stats.codigosSinCapitulo.size ? `: sin mapear ${JSON.stringify([...stats.codigosSinCapitulo.entries()].slice(0, 10))}` : ''}`
  );

  // 4.8 nulos de las series
  console.log(`   · series con "sin dato" (-) descartadas: fecundidad ${vacios.fecundidad} · mortalidad materna ${vacios.materna} (Santa Cruz, Río Negro y Catamarca no publican 2024)`);

  // ── 5. Muestras ──
  console.log('\n🔬 Muestra Córdoba 2024');
  const muestra = filas.filter((r) => r.region === 'Córdoba' && r.periodo === ANIO_2024);
  for (const r of muestra.filter((r) => r.indicador_nombre.startsWith('Defunciones ') && !r.indicador_nombre.startsWith('Defunciones por')).slice(0, 12)) {
    console.log(
      `   ${r.periodo}  ${r.indicador_nombre.padEnd(58)} ${String(r.valor).padStart(7)}  ${r.unidad}  desglose=${JSON.stringify(r.desglose)}`
    );
  }
  for (const r of muestra.filter((r) => r.indicador_nombre === NOMBRE_FECUNDIDAD || r.indicador_nombre === NOMBRE_HISTORICO_CBA)) {
    console.log(
      `   ${r.periodo}  ${r.indicador_nombre.padEnd(58)} ${String(r.valor).padStart(7)}  ${r.unidad}  fuente="${r.fuente}"  desglose=${JSON.stringify(r.desglose)}`
    );
  }

  const topCba = muestra
    .filter((r) => r.indicador_nombre.startsWith('Defunciones por causa'))
    .sort((a, b) => a.desglose.rango - b.desglose.rango);
  console.log(`\n🔬 Top-${TOP_CAUSAS} causas — Córdoba 2024 (de ${topCba[0]?.desglose.causas_candidatas ?? '?'} causas candidatas)`);
  for (const r of topCba) {
    console.log(`   ${String(r.desglose.rango).padStart(2)}. ${String(r.desglose.cie10_causa_id).padEnd(4)} ${String(r.valor).padStart(5)}  ${r.indicador_nombre.replace('Defunciones por causa — ', '')}`);
  }

  // ── 5b. Concentración de causas (anomalías de la FUENTE) ──
  // No aborta: los datos se cargan tal como vienen. Sirve para que un valor
  // imposible no llegue a la pantalla sin que nadie lo haya visto. Ejemplo real
  // que este chequeo destapa: Córdoba trae 3.798 defunciones por `I47`
  // (taquicardia paroxística = 11,3% de TODAS las muertes de la provincia)
  // cuando el resto del país tiene ~1,8%: es un artefacto de codificación del
  // archivo, no un dato epidemiológico. Los códigos del capítulo XVIII
  // (síntomas y signos mal definidos, R00-R99) quedan FUERA del umbral: que una
  // provincia concentre muertes "mal definidas" es un hecho conocido y válido.
  const causaNacional = new Map();
  const causasPorJid = new Map();
  for (const c of accCausa.values()) {
    if (c.jurisId === NACIONAL_ID) causaNacional.set(c.codigo, c);
    if (!causasPorJid.has(c.jurisId)) causasPorJid.set(c.jurisId, []);
    causasPorJid.get(c.jurisId).push(c);
  }
  const totalNacional = accTotales.get(NACIONAL_ID).valor;
  const ordenarCausas = (a, b) =>
    b.valor !== a.valor ? b.valor - a.valor : a.codigo.localeCompare(b.codigo, 'es');

  console.log(`\n🔬 Top-${TOP_CAUSAS} causas — Nacional 2024 (de ${causaNacional.size} causas)`);
  for (const c of [...causaNacional.values()].sort(ordenarCausas).slice(0, TOP_CAUSAS)) {
    console.log(
      `   ${String(c.codigo).padEnd(4)} ${String(c.valor).padStart(6)}  ${((c.valor / totalNacional) * 100).toFixed(2).padStart(5)}%  ${c.texto}`
    );
  }

  const concentracion = [];
  for (const jid of [...jidsReales, NACIONAL_ID]) {
    const top = (causasPorJid.get(jid) ?? []).slice().sort(ordenarCausas)[0];
    if (!top) continue;
    const cuota = (top.valor / accTotales.get(jid).valor) * 100;
    const cuotaNacional = ((causaNacional.get(top.codigo)?.valor ?? 0) / totalNacional) * 100;
    const malDefinida = capituloDe(top.codigo)?.romano === 'XVIII';
    concentracion.push({
      region: regionDe(jid),
      codigo: top.codigo,
      texto: top.texto,
      valor: top.valor,
      cuota,
      cuotaNacional,
      sospechosa: !malDefinida && cuota > 5 && cuota > cuotaNacional * 4,
    });
  }
  const sospechosas = concentracion.filter((c) => c.sospechosa);
  console.log('\n🔎 Causa #1 por jurisdicción (cuota local vs cuota nacional):');
  for (const c of concentracion) {
    console.log(
      `   ${c.sospechosa ? '⚠️ ' : '   '} ${c.region.padEnd(52)} ${c.codigo} ${String(c.valor).padStart(5)} = ${c.cuota.toFixed(1).padStart(4)}% local` +
        ` (nacional ${c.cuotaNacional.toFixed(2)}%) — ${c.texto}`
    );
  }
  if (sospechosas.length === 0) console.log('   ✅ ninguna causa #1 concentra >5% del total local y >4× su cuota nacional');
  else console.log(`   ⚠️  ${sospechosas.length} jurisdicción(es) con causa #1 anómalamente concentrada: revisar la codificación de la fuente (el dato se carga igual).`);

  if (fallas.length > 0) {
    console.error(`\n❌ ${fallas.length} validación(es) fallaron (exit 1):`);
    for (const f of fallas) console.error(`   ${f}`);
    process.exit(1);
  }

  // ── 6. Escritura (o plan) ──
  const res = await insertIfMissing(filas, { apply: APPLY });
  if (res.error) {
    console.error('❌ Error:', res.error.message ?? res.error);
    process.exit(1);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(
    `${APPLY ? '✅ insertadas' : '🏜️  DRY-RUN · a insertar'} ${APPLY ? res.inserted : res.missing.length} · ya existentes ${res.existing} · total ${filas.length}` +
      (APPLY ? '' : '   (usá --apply para escribir)')
  );
  console.log(
    `   (el único grupo ya existente esperado son las ${propias.length} de fecundidad Córdoba 2015-2022; ` +
      `nacimientos ${conteos.nacimientos}, histórico Córdoba ${conteos.historicoCba} y Nacional ${conteos.historicoNacional} no se generan)`
  );
  console.log('═══════════════════════════════════════════════════════════');
}

main().catch((err) => {
  console.error('❌ ETL falló:', err instanceof Error ? err.message : err);
  process.exit(1);
});
