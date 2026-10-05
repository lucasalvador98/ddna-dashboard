#!/usr/bin/env node
/**
 * Tasa de fecundidad por edad — Córdoba.
 *
 * Metodología:
 *   tasa(edad) = nacimientos de madres en esa edad / mujeres de esa edad × 1000
 *
 * Fuentes (ambas ya cargadas en `indicadores`):
 *   - Numerador  : nacimientos por edad de la madre, 2022, Córdoba
 *                  (fuente 'DEIS — Nacidos vivos por jurisdicción')
 *   - Denominador: mujeres por edad, Censo 2022, Córdoba
 *                  (fuente 'Censo 2022 — INDEC', indicador 'Población — edad N')
 *
 * Se usa 2022 para AMBOS a propósito: mezclar el denominador censal con
 * nacimientos de otro año daría una tasa que no corresponde a ningún período real.
 *
 * Grupos (los del archivo de nacimientos):
 *   Menor de 15 -> mujeres 10-14 · 15 a 19 · 20 a 24 · 25 a 29 · 30 a 34 ·
 *   35 a 39 · 40 a 44 · De 45 y más -> mujeres 45-49
 *   ('Sin especificar' se excluye: no tiene denominador posible.)
 *
 * Dry-run por defecto; --apply escribe.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { insertIfMissing } from './etl-runner.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env.local') });

const { createClient } = await import('@supabase/supabase-js');
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const APPLY = process.argv.includes('--apply');
const REGION = 'Córdoba';
const ANIO = 2022;

/** Grupo del archivo de nacimientos → rango de edades de la mujer (inclusive). */
const GRUPOS = [
  { grupo: 'Menor de 15', desde: 10, hasta: 14 },
  { grupo: '15 a 19', desde: 15, hasta: 19 },
  { grupo: '20 a 24', desde: 20, hasta: 24 },
  { grupo: '25 a 29', desde: 25, hasta: 29 },
  { grupo: '30 a 34', desde: 30, hasta: 34 },
  { grupo: '35 a 39', desde: 35, hasta: 39 },
  { grupo: '40 a 44', desde: 40, hasta: 44 },
  { grupo: 'De 45 y más', desde: 45, hasta: 49 },
];

async function paginar(build) {
  let off = 0;
  const out = [];
  while (true) {
    const { data, error } = await build().range(off, off + 999);
    if (error) throw new Error(error.message);
    if (!data.length) break;
    out.push(...data);
    if (data.length < 1000) break;
    off += 1000;
  }
  return out;
}

// ── Numerador: nacimientos de 2022 por grupo de edad de la madre ────────────
const nacRows = await paginar(() =>
  db
    .from('indicadores')
    .select('indicador_nombre, valor')
    .eq('categoria', 'salud')
    .eq('region', REGION)
    .eq('periodo', ANIO)
    .like('indicador_nombre', 'Nacimientos — madre %')
    .like('fuente', '%Nacidos vivos%')
);

const nacimientos = new Map();
for (const r of nacRows) {
  const grupo = r.indicador_nombre.replace('Nacimientos — madre ', '').trim();
  nacimientos.set(grupo, Number(r.valor));
}

// ── Denominador: mujeres por edad simple del Censo 2022 ────────────────────
const mujerRows = await paginar(() =>
  db
    .from('indicadores')
    .select('indicador_nombre, valor')
    .eq('categoria', 'demografia')
    .eq('region', REGION)
    .eq('periodo', ANIO)
    .eq('fuente', 'Censo 2022 — INDEC')
    .eq('indicador_nombre', 'Población — mujeres')
);

const mujeresTotal = Number(mujerRows[0]?.valor ?? 0);

// Edades simples (hombres+mujeres no alcanza: se necesita el corte por sexo,
// que el Censo no publica cruzado con edad). Por eso el denominador se estima
// con la estructura por edad aplicada a la mitad femenina, y se documenta.
const edadRows = await paginar(() =>
  db
    .from('indicadores')
    .select('indicador_nombre, valor')
    .eq('categoria', 'demografia')
    .eq('region', REGION)
    .eq('periodo', ANIO)
    .eq('fuente', 'Censo 2022 — INDEC')
    .like('indicador_nombre', 'Población — edad %')
);

const porEdad = new Map();
for (const r of edadRows) {
  const m = /^Población — edad (\d+)/.exec(r.indicador_nombre);
  if (m) porEdad.set(Number(m[1]), Number(r.valor));
}
const poblacionTotal = [...porEdad.values()].reduce((a, b) => a + b, 0);

console.log(`\n📊 Fecundidad por edad — ${REGION} ${ANIO}\n`);
console.log(`   Nacimientos (madres)   : ${nacRows.length} grupos con dato`);
console.log(`   Mujeres (Censo)        : ${mujeresTotal.toLocaleString('es-AR')}`);
console.log(`   Población por edad     : ${poblacionTotal.toLocaleString('es-AR')} (${porEdad.size} edades)`);

const proporcionMujeres = poblacionTotal > 0 ? mujeresTotal / poblacionTotal : 0;
console.log(
  `   ⚠️  El Censo no publica edad × sexo cruzado: el denominador femenino por edad\n` +
    `       se estima aplicando la proporción de mujeres del total (${(proporcionMujeres * 100).toFixed(2)}%) a la estructura por edad.`
);

const filas = [];
console.log(`\n   grupo          nacim.   mujeres(est.)   tasa‰`);
for (const g of GRUPOS) {
  const nac = nacimientos.get(g.grupo);
  if (nac === undefined) {
    console.log(`   ${g.grupo.padEnd(14)} —        (sin dato de nacimientos)`);
    continue;
  }
  let mujeres = 0;
  for (let e = g.desde; e <= g.hasta; e++) mujeres += (porEdad.get(e) ?? 0) * proporcionMujeres;
  const mujeresRedondeadas = Math.round(mujeres);
  if (mujeresRedondeadas <= 0) continue;
  const tasa = (nac / mujeresRedondeadas) * 1000;
  console.log(
    `   ${g.grupo.padEnd(14)} ${String(nac).padStart(6)}   ${String(mujeresRedondeadas).padStart(12)}   ${tasa.toFixed(1).padStart(6)}`
  );
  filas.push({
    indicador_nombre: `Tasa de fecundidad — ${g.grupo}`,
    categoria: 'salud',
    valor: Number(tasa.toFixed(2)),
    unidad: '‰',
    periodo: ANIO,
    region: REGION,
    fuente: 'DEIS + Censo 2022 (elaboración propia)',
    desglose: {
      grupo_edad_madre: g.grupo,
      nacimientos: nac,
      mujeres_estimadas: mujeresRedondeadas,
      anio: ANIO,
      metodo: 'nacimientos(padre)/mujeres(edad estimada) x 1000',
      nota:
        'Denominador estimado: el Censo no publica edad x sexo cruzado. Se aplica la proporcion de mujeres del total a la estructura por edad.',
    },
    activo: true,
  });
}

console.log(`\n   Filas a cargar: ${filas.length}`);
const res = await insertIfMissing(filas, { apply: APPLY });
if (res.error) {
  console.error('❌', res.error.message ?? res.error);
  process.exit(1);
}
console.log(
  `\n${APPLY ? '✅' : '🏜️  DRY-RUN'} filas ${filas.length} · ya existentes ${res.existing} · ${APPLY ? `insertadas ${res.inserted}` : `a insertar ${res.missing.length}`}`
);
