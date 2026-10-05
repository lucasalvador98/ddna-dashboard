#!/usr/bin/env node
/**
 * ETL: nacidos vivos por jurisdicción — DEIS, Estadísticas Vitales.
 *
 * Fuentes (CSV públicos, datos abiertos del Ministerio de Salud):
 *   1. Serie 2005-2022 (delimitador ",", 65 MB / ~547k filas)
 *   2. Año 2023       (delimitador ";", ~23k filas, header con BOM UTF-8)
 *   3. Año 2024       (delimitador ";", ~22k filas) — formato DISTINTO: 8 columnas
 *                     `PROVRES;TIPPARTO;SEXO;IMEDAD;ITIEMGEST;IMINSTRUC;IPESONAC;CUENTA`,
 *                     SIN columna de año (el archivo es de un solo año → 2024 fijo)
 *                     y SIN nombre de jurisdicción (solo el código PROVRES).
 *
 * Las fuentes 1 y 2 traen las MISMAS 12 columnas y vienen DESAGREGADAS: una fila
 * por combinación de edad de madre × instrucción × tipo de parto × semana de
 * gestación × peso al nacer × sexo.
 *
 * La fuente 3 trae menos columnas y ningún nombre de jurisdicción:
 *   · `PROVRES` se resuelve con el mapa id→nombre que se DERIVA de las fuentes 1
 *     y 2 durante esta misma corrida (no se duplica la lista de provincias).
 *   · `SEXO` viene como código numérico; se traduce a la etiqueta textual DEIS
 *     (masculino/femenino/indeterminado/desconocido) y luego pasa por
 *     normalizarSexo, así las series quedan idénticas a las de 2005-2023.
 *   · `IMEDAD` trae el mismo prefijo numérico que las otras fuentes → misma
 *     normalización (limpiarPrefijoGrupo).
 *   · `CUENTA` es el conteo (equivale a `nacimientos_cantidad`).
 *
 * Este script AGREGA las 3 fuentes en 3 grupos:
 *
 *   - Totales          : Nacimientos totales                (SUM por anio+jurisdicción)
 *   - Por sexo         : Nacimientos — <sexo>
 *   - Por edad madre   : Nacimientos — madre <grupo>        (sin el prefijo numérico)
 *
 * El CSV grande se baja a un temporal y se parsea EN STREAMING
 * (createReadStream + readline); nunca se retiene el array de filas crudas,
 * solo los acumuladores agregados (~1.5k entradas en el peor caso).
 *
 * Dry-run por defecto; `--apply` escribe (vía insertIfMissing de etl-runner).
 *
 * Uso:
 *   node scripts/load-nacimientos.mjs           # dry-run
 *   node scripts/load-nacimientos.mjs --apply   # inserta lo faltante
 */

import { createReadStream, createWriteStream, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createInterface } from 'node:readline';
import { getCACertificates, setDefaultCACertificates } from 'node:tls';
import { insertIfMissing } from './etl-runner.mjs';

// ── Configuración ───────────────────────────────────────────────────

const APPLY = process.argv.includes('--apply');

const CATEGORIA = 'salud';
const FUENTE = 'DEIS — Nacidos vivos por jurisdicción';
const UNIDAD = 'nacimientos';

const BASE_DATASET =
  'http://datos.salud.gob.ar/dataset/d1350588-d8bb-4892-b21c-48738311e218/resource';

// Año de la fuente 3 (el CSV no trae columna de año).
const ANIO_2024 = 2024;

const FUENTES = [
  {
    etiqueta: '2005-2022 (delimitador ",")',
    archivo: 'nacidos-vivos-2005-2022.csv',
    url: `${BASE_DATASET}/5a68ea36-03fe-4b38-b590-d7cf2a13b821/download/nacidos-vivos-registrados-en-la-republica-argentina-entre-los-anos-2005-2022.csv`,
    formato: 'deis-desagregado',
  },
  {
    etiqueta: '2023 (delimitador ";")',
    archivo: 'nacimientos-2023.csv',
    url: `${BASE_DATASET}/40e722b8-72eb-49a0-89dc-5ee174bf63b4/download/nacimientos2023.csv`,
    formato: 'deis-desagregado',
  },
  {
    etiqueta: `2024 (delimitador ";", PROVRES, ${ANIO_2024} fijo)`,
    archivo: 'nacimientos-2024.csv',
    url: 'https://www.argentina.gob.ar/sites/default/files/2021/03/datos_sobre_nacidos_vivos_2024.csv',
    formato: 'provres-2024',
  },
];

// Nombres REALES de las columnas en el CSV (ojo: "jurisdicion_residencia_nombre"
// viene con una sola "s", y "Sexo" va con mayúscula).
const COL = {
  anio: 'anio',
  jurisId: 'jurisdiccion_de_residencia_id',
  jurisNombre: 'jurisdicion_residencia_nombre',
  edad: 'edad_madre_grupo',
  sexo: 'Sexo',
  cantidad: 'nacimientos_cantidad',
};

// Columnas del archivo 2024: sin año, sin nombre de jurisdicción y con el sexo
// codificado. `TIPPARTO`/`ITIEMGEST`/`IMINSTRUC`/`IPESONAC` no se agregan (el
// desglose cargado es total / por sexo / por edad de la madre), igual que en las
// otras dos fuentes, donde tampoco se usan esas cuatro columnas.
const COL_2024 = {
  provres: 'PROVRES',
  edad: 'IMEDAD',
  sexo: 'SEXO',
  cantidad: 'CUENTA',
};

// Códigos de `SEXO` del archivo 2024 → etiqueta textual del DEIS. Verificado
// contra el CSV 2023 (columna sexo_id | Sexo): 1=masculino, 2=femenino,
// 3=indeterminado, 9=desconocido. Además, el total de masculino supera al de
// femenino (razón de masculinidad > 1) tanto en 2023 como en 2024, lo que
// confirma que 1/2 NO están invertidos.
const SEXO_POR_CODIGO = new Map([
  [1, 'masculino'],
  [2, 'femenino'],
  [3, 'indeterminado'],
  [9, 'desconocido'],
]);

// Mapa id→nombre de jurisdicción DERIVADO de las fuentes DEIS (1 y 2), que sí
// traen el nombre. Lo consume la fuente 2024, que solo trae el código PROVRES:
// así la lista de provincias no se duplica a mano. Se puebla mientras se parsean
// las fuentes anteriores, por eso el orden de FUENTES importa.
const regionPorJurisId = new Map();

// Ids del DEIS que NO son jurisdicciones provinciales (se cargan igual y se
// reportan como anomalía; si se descartaran, los totales no cerrarían).
const IDS_NO_PROVINCIA = new Map([
  [98, 'NA'],
  [99, 'Sin Información'],
]);

// ── Parser CSV (sin dependencias, respeta comillas y comillas escapadas) ──

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

/** Parte una línea CSV respetando comillas dobles ("a,b") y "" escapadas. */
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

/**
 * Normaliza el valor de la columna `Sexo` a minúsculas sin acentos.
 * Los valores observados en las fuentes son: masculino, femenino,
 * indeterminado, desconocido (los dos últimos se conservan tal cual para no
 * perder nacimientos: SUM(por sexo) debe seguir cerrando con el total).
 */
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

/** "5.30 a 34" -> "30 a 34" ; "8.De 45 y más" -> "De 45 y más". */
function limpiarPrefijoGrupo(grupo) {
  return String(grupo)
    .replace(/^\s*\d+\s*\.\s*/, '')
    .trim();
}

/** Entero de nacimientos. Los CSV traen enteros planos, sin separador de miles. */
function parseCantidad(raw) {
  const s = String(raw ?? '').trim();
  if (s === '') return null;
  if (/^\d+$/.test(s)) return Number(s);
  if (/^\d{1,3}(\.\d{3})+$/.test(s)) return Number(s.replace(/\./g, '')); // 1.234
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function idNormalizado(raw) {
  const s = String(raw ?? '').trim();
  return /^\d+$/.test(s) ? Number(s) : s;
}

// ── Estado de la corrida ────────────────────────────────────────────

const stats = {
  filasLeidas: 0,
  filasDescartadas: 0,
  muestrasDescartadas: [],
  porAnio: new Map(), // anio -> suma total
  sexos: new Map(), // sexo normalizado -> cantidad de filas crudas
  jurisdicciones: new Map(), // id -> Set(nombres)
  gruposEdad: new Map(), // grupo crudo -> cantidad de filas crudas
};

// Acumuladores agregados: clave -> { anio, jurisId, region, valor, ... }
const accTotales = new Map(); // `${anio}|${jurisId}`
const accSexo = new Map(); // `${anio}|${jurisId}|${sexo}`
const accEdad = new Map(); // `${anio}|${jurisId}|${grupo}`

function descartar(motivo, lineaNro, linea) {
  stats.filasDescartadas++;
  if (stats.muestrasDescartadas.length < 5) {
    stats.muestrasDescartadas.push(`L${lineaNro} ${motivo} :: ${linea.slice(0, 140)}`);
  }
}

// ── Descarga ────────────────────────────────────────────────────────

/**
 * datos.salud.gob.ar sirve la cadena TLS sin el certificado intermedio; el
 * bundle Mozilla que trae Node no lo tiene y fetch muere con
 * "unable to verify the first certificate" (curl funciona porque usa el store
 * del SO). Se FUSIONA el store del sistema con el default: arregla el problema
 * SIN desactivar la verificación de certificados (nunca rejectUnauthorized:false).
 * Devuelve true si pudo ampliar el pool de CAs.
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
  // Stream a disco: el CSV grande (65 MB) no se bufferiza en memoria.
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destino));
}

// ── Parseo en streaming + agregación ────────────────────────────────

/**
 * Parsea y agrega una fuente en streaming (nunca retiene las filas crudas).
 *
 * `formato`:
 *   · 'deis-desagregado' — 12 columnas, trae año y nombre de jurisdicción.
 *   · 'provres-2024'     — 8 columnas, sin año (2024 fijo) y sin nombre de
 *     jurisdicción: el nombre se resuelve con `regionPorJurisId`, que ya
 *     poblaron las fuentes DEIS (por eso esas dos se parsean antes).
 */
async function agregarCsv(path, formato = 'deis-desagregado') {
  const es2024 = formato === 'provres-2024';
  const spec = es2024 ? COL_2024 : COL;
  const columnasEsperadas = es2024 ? 8 : 12;
  const etiquetaCantidad = es2024 ? 'CUENTA' : 'nacimientos_cantidad';

  // La fuente 2024 no trae nombre de jurisdicción: sin el mapa derivado se
  // descartarían TODAS sus filas en silencio. Mejor fallar explícitamente.
  if (es2024 && regionPorJurisId.size === 0) {
    throw new Error(
      'la fuente 2024 solo trae el código PROVRES y el mapa id→nombre está vacío: ' +
        'las fuentes DEIS (2005-2022 y 2023) deben parsearse antes.'
    );
  }

  const rl = createInterface({
    input: createReadStream(path, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  let idx = null;
  let delim = es2024 ? ';' : ',';
  let lineaNro = 0;
  let filasFuente = 0;

  for await (let linea of rl) {
    lineaNro++;
    if (lineaNro === 1) {
      const header = linea.replace(/^\uFEFF/, '');
      delim = detectarDelimitador(header);
      idx = mapearColumnas(partirLinea(header, delim), spec);
      continue;
    }
    if (!linea.trim()) continue;

    const campos = partirLinea(linea, delim);
    if (campos.length !== columnasEsperadas) {
      descartar(`se esperaban ${columnasEsperadas} columnas y vinieron ${campos.length}`, lineaNro, linea);
      continue;
    }

    const cantidad = parseCantidad(campos[idx.cantidad]);
    if (cantidad === null) {
      descartar(`${etiquetaCantidad} no numérico "${campos[idx.cantidad]}"`, lineaNro, linea);
      continue;
    }

    const grupoRaw = String(campos[idx.edad] ?? '').trim();
    const grupo = limpiarPrefijoGrupo(grupoRaw);

    let anio;
    let jurisId;
    let region;
    let sexo;

    if (es2024) {
      anio = ANIO_2024;
      const provresRaw = String(campos[idx.provres] ?? '').trim();
      jurisId = idNormalizado(provresRaw);
      region = regionPorJurisId.get(jurisId);
      if (!region) {
        descartar(
          `PROVRES "${provresRaw}" sin nombre de jurisdicción en el mapa derivado de las fuentes DEIS`,
          lineaNro,
          linea
        );
        continue;
      }
      // SEXO viene codificado: código → etiqueta DEIS → normalizarSexo, para
      // generar exactamente las mismas series que las fuentes 2005-2023.
      const codSexo = Number(String(campos[idx.sexo] ?? '').trim());
      sexo = normalizarSexo(SEXO_POR_CODIGO.get(codSexo) ?? campos[idx.sexo]);
    } else {
      anio = Number(campos[idx.anio]);
      if (!Number.isInteger(anio) || anio < 2000 || anio > 2100) {
        descartar(`anio inválido "${campos[idx.anio]}"`, lineaNro, linea);
        continue;
      }

      jurisId = idNormalizado(String(campos[idx.jurisId] ?? '').trim());
      region = String(campos[idx.jurisNombre] ?? '').trim();
      if (!region) {
        descartar('jurisdicción vacía', lineaNro, linea);
        continue;
      }
      sexo = normalizarSexo(campos[idx.sexo]);

      // Alimenta el mapa id→nombre que consume la fuente 2024 (gana el primero).
      if (!regionPorJurisId.has(jurisId)) regionPorJurisId.set(jurisId, region);
    }

    // ── Totales ──
    const kt = `${anio}|${jurisId}`;
    const t = accTotales.get(kt) ?? { anio, jurisId, region, valor: 0 };
    t.valor += cantidad;
    accTotales.set(kt, t);

    // ── Por sexo ──
    if (sexo) {
      const ks = `${anio}|${jurisId}|${sexo}`;
      const s = accSexo.get(ks) ?? { anio, jurisId, region, sexo, valor: 0 };
      s.valor += cantidad;
      accSexo.set(ks, s);
    } else {
      descartar('sexo vacío (no se agrega al desglose por sexo)', lineaNro, linea);
    }

    // ── Por edad de la madre ──
    if (grupo) {
      const ke = `${anio}|${jurisId}|${grupoRaw}`;
      const e = accEdad.get(ke) ?? { anio, jurisId, region, grupo: grupoRaw, grupoEtiqueta: grupo, valor: 0 };
      e.valor += cantidad;
      accEdad.set(ke, e);
    }

    // ── Stats de la corrida ──
    stats.filasLeidas++;
    filasFuente++;
    stats.porAnio.set(anio, (stats.porAnio.get(anio) ?? 0) + cantidad);
    stats.sexos.set(sexo ?? '(vacío)', (stats.sexos.get(sexo ?? '(vacío)') ?? 0) + 1);
    stats.gruposEdad.set(grupoRaw, (stats.gruposEdad.get(grupoRaw) ?? 0) + 1);
    if (!stats.jurisdicciones.has(jurisId)) stats.jurisdicciones.set(jurisId, new Set());
    stats.jurisdicciones.get(jurisId).add(region);
  }

  return { filasFuente, delimitador: delim };
}

// ── Construcción de filas para `indicadores` ────────────────────────

function construirFilas() {
  const rows = [];

  for (const it of accTotales.values()) {
    rows.push({
      indicador_nombre: 'Nacimientos totales',
      categoria: CATEGORIA,
      valor: it.valor,
      unidad: UNIDAD,
      periodo: it.anio,
      region: it.region,
      desglose: { anio: it.anio, jurisdiccion_id: it.jurisId },
      fuente: FUENTE,
      activo: true,
    });
  }

  for (const it of accSexo.values()) {
    rows.push({
      indicador_nombre: `Nacimientos — ${it.sexo}`,
      categoria: CATEGORIA,
      valor: it.valor,
      unidad: UNIDAD,
      periodo: it.anio,
      region: it.region,
      desglose: { anio: it.anio, sexo: it.sexo },
      fuente: FUENTE,
      activo: true,
    });
  }

  for (const it of accEdad.values()) {
    rows.push({
      indicador_nombre: `Nacimientos — madre ${it.grupoEtiqueta}`,
      categoria: CATEGORIA,
      valor: it.valor,
      unidad: UNIDAD,
      periodo: it.anio,
      region: it.region,
      desglose: { anio: it.anio, edad_madre_grupo: it.grupo },
      fuente: FUENTE,
      activo: true,
    });
  }

  rows.sort(
    (a, b) =>
      a.periodo - b.periodo ||
      a.region.localeCompare(b.region, 'es') ||
      a.indicador_nombre.localeCompare(b.indicador_nombre, 'es')
  );
  return rows;
}

/** Suma los acumuladores por clave base (anio|jurisId) para chequear cierre. */
function sumaPorBase(acc) {
  const m = new Map();
  for (const [k, v] of acc) {
    const base = k.split('|').slice(0, 2).join('|');
    m.set(base, (m.get(base) ?? 0) + v.valor);
  }
  return m;
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  ETL NACIDOS VIVOS POR JURISDICCIÓN (DEIS) ${APPLY ? '· APPLY' : '· DRY-RUN'}`);
  console.log('═══════════════════════════════════════════════════════════');

  const tmp = mkdtempSync(join(tmpdir(), 'nacimientos-'));
  console.log(
    `🔐 CAs del sistema fusionadas con las de Node: ${habilitarCAsDelSistema() ? 'sí' : 'no (fallback)'}`
  );

  for (const fuente of FUENTES) {
    const destino = join(tmp, fuente.archivo);
    process.stdout.write(`📥 ${fuente.etiqueta} — bajando… `);
    await descargar(fuente.url, destino);
    const { filasFuente, delimitador } = await agregarCsv(destino, fuente.formato);
    console.log(`ok — ${filasFuente} filas parseadas (delim "${delimitador}")`);
  }

  // ── G3: totales / por sexo / por edad ──
  const rows = construirFilas();
  const nTotales = accTotales.size;
  const nSexo = accSexo.size;
  const nEdad = accEdad.size;

  console.log(`\n📥 Filas crudas leídas: ${stats.filasLeidas} (descartadas ${stats.filasDescartadas})`);
  console.log(`📊 Filas generadas: ${rows.length}`);
  console.log(`   · totales          ${String(nTotales).padStart(5)}  (anio × jurisdicción)`);
  console.log(`   · por sexo         ${String(nSexo).padStart(5)}  (anio × jurisdicción × sexo)`);
  console.log(`   · por edad madre   ${String(nEdad).padStart(5)}  (anio × jurisdicción × grupo)`);

  // ── Cobertura temporal y jurisdiccional ──
  const anios = [...stats.porAnio.keys()].sort((a, b) => a - b);
  const faltantes = [];
  if (anios.length) {
    for (let a = anios[0]; a <= anios[anios.length - 1]; a++) {
      if (!stats.porAnio.has(a)) faltantes.push(a);
    }
  }
  console.log(`\n🗓️  Rango de años: ${anios[0]}–${anios[anios.length - 1]} (${anios.length} años)`);
  console.log(`   Totales por año: ${anios.map((a) => `${a}:${stats.porAnio.get(a)}`).join('  ')}`);
  if (faltantes.length) console.log(`   ⚠️  Años faltantes dentro del rango: ${faltantes.join(', ')}`);
  else console.log('   ✅ Sin años faltantes dentro del rango');

  const juris = [...stats.jurisdicciones.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]), 'es', { numeric: true }));
  console.log(`\n🗺️  Jurisdicciones detectadas: ${juris.length}`);
  for (const [id, nombres] of juris) {
    const marcas = [];
    if (IDS_NO_PROVINCIA.has(Number(id))) marcas.push('⚠️ NO es provincia');
    if (nombres.size > 1) marcas.push('⚠️ nombre inconsistente');
    console.log(`   id ${String(id).padStart(3)}  ${[...nombres].join(' | ')}${marcas.length ? '   ' + marcas.join(' · ') : ''}`);
  }

  // ── Anomalías de desagregación ──
  const sexos = [...stats.sexos.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`\n🔎 Valores de la columna Sexo: ${sexos.map(([s, n]) => `${s}=${n}`).join('  ')}`);
  const sexosInesperados = sexos.filter(([s]) => s !== 'masculino' && s !== 'femenino');
  if (sexosInesperados.length) {
    console.log(
      `   ⚠️  Además de masculino/femenino hay: ${sexosInesperados
        .map(([s, n]) => `${s} (${n} filas)`)
        .join(', ')} — se cargan como series propias para que el desglose cierre con el total.`
    );
  }

  console.log(`\n🔎 Grupos de edad de la madre (crudo -> etiqueta):`);
  for (const g of [...stats.gruposEdad.keys()].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))) {
    console.log(`   ${g.padEnd(20)} -> ${limpiarPrefijoGrupo(g)}   (${stats.gruposEdad.get(g)} filas)`);
  }

  if (stats.filasDescartadas) {
    console.log(`\n⚠️  Filas descartadas: ${stats.filasDescartadas}`);
    for (const m of stats.muestrasDescartadas) console.log(`   ${m}`);
  } else {
    console.log(`\n✅ Filas descartadas: 0`);
  }

  // ── Validación cruzada de la fuente 2024 (no trae nombre de jurisdicción) ──
  // Compara el año más reciente contra el anterior por jurisdicción: si el
  // código PROVRES mapeara a otra provincia (o el SEXO estuviera invertido),
  // saltaría acá. También imprime la razón de masculinidad por año.
  const aniosConTotales = [...new Set([...accTotales.values()].map((t) => t.anio))].sort((a, b) => a - b);
  const anioUlt = aniosConTotales[aniosConTotales.length - 1];
  const anioPrev = aniosConTotales[aniosConTotales.length - 2];
  if (anioUlt === ANIO_2024 && anioPrev !== undefined) {
    const totalesPorAnioId = new Map(); // `${anio}|${jurisId}` -> valor
    for (const t of accTotales.values()) totalesPorAnioId.set(`${t.anio}|${t.jurisId}`, t.valor);

    const idsUlt = [...accTotales.values()]
      .filter((t) => t.anio === anioUlt)
      .map((t) => t.jurisId)
      .sort((a, b) => Number(a) - Number(b));

    console.log(`\n🔁 Validación cruzada ${anioPrev} vs ${anioUlt} (mapa PROVRES→jurisdicción y códigos SEXO):`);
    console.log(`   ${'id'.padStart(3)}  ${'jurisdicción'.padEnd(46)} ${String(anioPrev).padStart(8)} ${String(anioUlt).padStart(8)}     Δ%`);
    let sumaPrev = 0;
    let sumaUlt = 0;
    for (const id of idsUlt) {
      const vPrev = totalesPorAnioId.get(`${anioPrev}|${id}`);
      const vUlt = totalesPorAnioId.get(`${anioUlt}|${id}`);
      const region = accTotales.get(`${anioUlt}|${id}`)?.region ?? '?';
      if (typeof vPrev !== 'number') {
        console.log(`   ${String(id).padStart(3)}  ${region.padEnd(46)} ${'—'.padStart(8)} ${String(vUlt).padStart(8)}   ⚠️ sin dato en ${anioPrev}`);
        continue;
      }
      if (typeof vUlt !== 'number') continue;
      sumaPrev += vPrev;
      sumaUlt += vUlt;
      const delta = ((vUlt - vPrev) / vPrev) * 100;
      const marca = Math.abs(delta) > 35 ? '  ⚠️ orden inesperado' : '';
      console.log(
        `   ${String(id).padStart(3)}  ${region.padEnd(46)} ${String(vPrev).padStart(8)} ${String(vUlt).padStart(8)}   ${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%${marca}`
      );
    }
    const deltaTotal = ((sumaUlt - sumaPrev) / sumaPrev) * 100;
    console.log(
      `   ${'TOTAL'.padStart(3)}  ${'(solo jurisdicciones comparables)'.padEnd(46)} ${String(sumaPrev).padStart(8)} ${String(sumaUlt).padStart(8)}   ${deltaTotal >= 0 ? '+' : ''}${deltaTotal.toFixed(1)}%`
    );

    const sexoPorAnio = new Map(); // anio -> { masculino, femenino }
    for (const s of accSexo.values()) {
      if (!sexoPorAnio.has(s.anio)) sexoPorAnio.set(s.anio, {});
      sexoPorAnio.get(s.anio)[s.sexo] = (sexoPorAnio.get(s.anio)[s.sexo] ?? 0) + s.valor;
    }
    const razon = (a) => {
      const m = sexoPorAnio.get(a)?.masculino;
      const f = sexoPorAnio.get(a)?.femenino;
      return m && f ? (m / f).toFixed(3) : '—';
    };
    const rPrev = Number(razon(anioPrev));
    const rUlt = Number(razon(anioUlt));
    console.log(
      `   Razón de masculinidad (masc/fem): ${anioPrev}=${razon(anioPrev)} · ${anioUlt}=${razon(anioUlt)}` +
        ` → ${rPrev > 1 && rUlt > 1 ? '✅ mismo orden en ambos años: el mapeo SEXO NO está invertido' : '⚠️ revisar el mapeo SEXO'}`
    );
  }

  // ── Consistencia: los desgloses deben cerrar con el total ──
  const dif = [];
  for (const [acc, nombre] of [[accSexo, 'sexo'], [accEdad, 'edad madre']]) {
    const sumas = sumaPorBase(acc);
    for (const [k, t] of accTotales) {
      const s = sumas.get(k);
      if (s !== undefined && s !== t.valor) dif.push(`${nombre} ${k}: desglose=${s} total=${t.valor}`);
    }
  }
  console.log(
    dif.length === 0
      ? `✅ Consistencia: SUM(por sexo) y SUM(por edad) cierran con los totales en todas las claves`
      : `⚠️  Consistencia: ${dif.length} diferencias (primeras 5):\n   ${dif.slice(0, 5).join('\n   ')}`
  );

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

  // ── Muestra de Córdoba (año más reciente) ──
  const anioMuestra = anios[anios.length - 1];
  const muestra = rows.filter((r) => r.region === 'Córdoba' && r.periodo === anioMuestra);
  console.log(`\n🔬 Muestra Córdoba ${anioMuestra} (${muestra.length} filas):`);
  for (const r of muestra) {
    console.log(
      `   ${String(r.periodo)}  ${r.indicador_nombre.padEnd(32)} ${String(r.valor).padStart(7)}  ${r.unidad}  desglose=${JSON.stringify(r.desglose)}`
    );
  }

  // ── Escritura (o plan) ──
  const res = await insertIfMissing(rows, { apply: APPLY });
  if (res.error) {
    console.error('❌ Error:', res.error.message ?? res.error);
    process.exit(1);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(
    `${APPLY ? '✅ insertadas' : '🏜️  DRY-RUN · a insertar'} ${APPLY ? res.inserted : res.missing.length} · ya existentes ${res.existing} · total ${rows.length}` +
      (APPLY ? '' : '   (usá --apply para escribir)')
  );
  console.log('═══════════════════════════════════════════════════════════');
}

main().catch((err) => {
  console.error('❌ ETL falló:', err instanceof Error ? err.message : err);
  process.exit(1);
});
