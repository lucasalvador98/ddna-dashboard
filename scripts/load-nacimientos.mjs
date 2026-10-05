#!/usr/bin/env node
/**
 * ETL: nacidos vivos por jurisdicción — DEIS, Estadísticas Vitales.
 *
 * Fuentes (CSV públicos, datos abiertos del Ministerio de Salud):
 *   1. Serie 2005-2022 (delimitador ",", 65 MB / ~547k filas)
 *   2. Año 2023       (delimitador ";", ~23k filas, header con BOM UTF-8)
 *
 * Ambos traen las MISMAS 12 columnas y vienen DESAGREGADOS: una fila por
 * combinación de edad de madre × instrucción × tipo de parto × semana de
 * gestación × peso al nacer × sexo. Este script AGREGA en 3 grupos:
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

const FUENTES = [
  {
    etiqueta: '2005-2022 (delimitador ",")',
    archivo: 'nacidos-vivos-2005-2022.csv',
    url: `${BASE_DATASET}/5a68ea36-03fe-4b38-b590-d7cf2a13b821/download/nacidos-vivos-registrados-en-la-republica-argentina-entre-los-anos-2005-2022.csv`,
  },
  {
    etiqueta: '2023 (delimitador ";")',
    archivo: 'nacimientos-2023.csv',
    url: `${BASE_DATASET}/40e722b8-72eb-49a0-89dc-5ee174bf63b4/download/nacimientos2023.csv`,
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

function mapearColumnas(header) {
  const idx = {};
  for (const [clave, nombre] of Object.entries(COL)) {
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

async function agregarCsv(path) {
  const rl = createInterface({
    input: createReadStream(path, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  let idx = null;
  let delim = ',';
  let lineaNro = 0;
  let filasFuente = 0;

  for await (let linea of rl) {
    lineaNro++;
    if (lineaNro === 1) {
      const header = linea.replace(/^\uFEFF/, '');
      delim = detectarDelimitador(header);
      idx = mapearColumnas(partirLinea(header, delim));
      continue;
    }
    if (!linea.trim()) continue;

    const campos = partirLinea(linea, delim);
    if (campos.length !== 12) {
      descartar(`se esperaban 12 columnas y vinieron ${campos.length}`, lineaNro, linea);
      continue;
    }

    const anio = Number(campos[idx.anio]);
    if (!Number.isInteger(anio) || anio < 2000 || anio > 2100) {
      descartar(`anio inválido "${campos[idx.anio]}"`, lineaNro, linea);
      continue;
    }

    const region = String(campos[idx.jurisNombre] ?? '').trim();
    if (!region) {
      descartar('jurisdicción vacía', lineaNro, linea);
      continue;
    }

    const cantidad = parseCantidad(campos[idx.cantidad]);
    if (cantidad === null) {
      descartar(`nacimientos_cantidad no numérico "${campos[idx.cantidad]}"`, lineaNro, linea);
      continue;
    }

    const sexo = normalizarSexo(campos[idx.sexo]);
    const grupoRaw = String(campos[idx.edad] ?? '').trim();
    const grupo = limpiarPrefijoGrupo(grupoRaw);
    const jurisIdRaw = String(campos[idx.jurisId] ?? '').trim();
    const jurisId = idNormalizado(jurisIdRaw);

    // ── Totales ──
    const kt = `${anio}|${jurisIdRaw}`;
    const t = accTotales.get(kt) ?? { anio, jurisId, region, valor: 0 };
    t.valor += cantidad;
    accTotales.set(kt, t);

    // ── Por sexo ──
    if (sexo) {
      const ks = `${anio}|${jurisIdRaw}|${sexo}`;
      const s = accSexo.get(ks) ?? { anio, jurisId, region, sexo, valor: 0 };
      s.valor += cantidad;
      accSexo.set(ks, s);
    } else {
      descartar('sexo vacío (no se agrega al desglose por sexo)', lineaNro, linea);
    }

    // ── Por edad de la madre ──
    if (grupo) {
      const ke = `${anio}|${jurisIdRaw}|${grupoRaw}`;
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
    const { filasFuente, delimitador } = await agregarCsv(destino);
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
