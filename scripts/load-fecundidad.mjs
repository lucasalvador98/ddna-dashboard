#!/usr/bin/env node
/**
 * Tasa de fecundidad por edad de la madre — Córdoba, 2022.
 *
 *   tasa(grupo) = nacimientos de madres del grupo / población del grupo × 1000
 *
 * ── Sobre el denominador (leer antes de tocar) ──────────────────────────────
 * La definición "de manual" de tasa específica de fecundidad divide por las
 * MUJERES de esa edad. Pero el Censo 2022 NO publica edad × sexo cruzado, así
 * que las mujeres por edad sólo se pueden ESTIMAR (aplicando la proporción
 * femenina del total). Con ese denominador, Córdoba 15-19 daría 22,5‰.
 *
 * La serie oficial del DEIS ("Tasa fecundidad adolescente") dice 12,8‰ para
 * 2022. Ese valor es aritméticamente incompatible con un denominador de
 * mujeres: implicaría 268.750 mujeres de 15-19, cuando el Censo cuenta
 * 294.939 PERSONAS de 15-19 en total (sería 91% mujeres: imposible).
 * En cambio coincide con la POBLACIÓN TOTAL del grupo (11,7‰ vs 12,8‰;
 * la diferencia restante se explica porque el DEIS usa proyecciones
 * poblacionales y no el conteo censal).
 *
 * Por eso este script divide por la POBLACIÓN TOTAL del grupo de edad: es la
 * convención que reproduce el único valor oficial comparable que tenemos, y
 * además NO requiere estimar nada (se usa el conteo censal de cada edad).
 *
 * ⚠️ Consecuencia: esta serie NO es comparable con una tasa específica de
 * fecundidad calculada sobre mujeres. Sí es comparable con la serie oficial
 * "Tasa fecundidad adolescente" del DEIS.
 *
 * El script se autovalida contra esa serie oficial y aborta si el desvío es
 * grosero, para que un cambio de convención no pase inadvertido.
 *
 * Dry-run por defecto; --apply escribe. Con --replace borra las filas previas.
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
const REPLACE = process.argv.includes('--replace');
const REGION = 'Córdoba';
const ANIO = 2022;

/** grupo del archivo de nacimientos → rango de edades que lo compone. */
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
  for (;;) {
    const { data, error } = await build().range(off, off + 999);
    if (error) throw new Error(error.message);
    out.push(...data);
    if (data.length < 1000) break;
    off += 1000;
  }
  return out;
}

// ── Numerador: nacimientos 2022 por grupo de edad de la madre ───────────────
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
for (const r of nacRows)
  nacimientos.set(r.indicador_nombre.replace('Nacimientos — madre ', '').trim(), Number(r.valor));

// ── Denominador: población del grupo, por edad simple (conteo censal) ───────
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

console.log(`\n📊 Tasa de fecundidad por edad — ${REGION} ${ANIO}`);
console.log(`   Denominador: POBLACIÓN TOTAL del grupo de edad (conteo censal, sin estimar)\n`);

const filas = [];
console.log('   grupo          nacim.   población     tasa‰');
for (const g of GRUPOS) {
  const nac = nacimientos.get(g.grupo);
  if (nac === undefined) continue;
  let pob = 0;
  for (let e = g.desde; e <= g.hasta; e++) pob += porEdad.get(e) ?? 0;
  if (pob <= 0) continue;
  const tasa = (nac / pob) * 1000;
  console.log(
    `   ${g.grupo.padEnd(14)} ${String(nac).padStart(6)}   ${String(pob).padStart(9)}   ${tasa.toFixed(2).padStart(6)}`
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
      poblacion_grupo: pob,
      anio: ANIO,
      metodo: 'nacimientos de madres del grupo / poblacion total del grupo x 1000',
      denominador: 'poblacion total del grupo de edad (ambos sexos), conteo censal',
      nota:
        'Denominador = poblacion total del grupo, no mujeres: el Censo 2022 no publica edad x sexo cruzado y la serie oficial del DEIS usa esta misma convencion. NO comparable con una tasa especifica de fecundidad calculada sobre mujeres.',
    },
    activo: true,
  });
}

// ── Autovalidación contra la serie oficial del DEIS ─────────────────────────
const { data: oficial } = await db
  .from('indicadores')
  .select('valor')
  .eq('indicador_nombre', 'Tasa fecundidad adolescente')
  .eq('region', REGION)
  .eq('periodo', ANIO)
  .limit(1);

const mia = filas.find((f) => f.desglose.grupo_edad_madre === '15 a 19');
if (oficial?.length && mia) {
  const ref = Number(oficial[0].valor);
  const desvio = Math.abs(mia.valor - ref) / ref;
  console.log(`\n   🔎 Validación contra la serie oficial del DEIS (15 a 19, ${ANIO}):`);
  console.log(`        oficial ${ref.toFixed(1)}‰   ·   calculada ${mia.valor.toFixed(2)}‰   ·   desvío ${(desvio * 100).toFixed(1)}%`);
  if (desvio > 0.25) {
    console.error(
      `   ❌ DESVÍO GROSSERO (${(desvio * 100).toFixed(0)}%). El denominador no está reproduciendo\n` +
        `      la convención oficial, o la fuente de nacimientos cambió. Revisá antes de cargar.`
    );
    process.exit(1);
  }
  console.log(`   ✅ Dentro del rango esperado (el DEIS usa proyecciones, no el conteo censal).`);
}

if (REPLACE && APPLY) {
  const { error } = await db
    .from('indicadores')
    .delete()
    .eq('categoria', 'salud')
    .eq('region', REGION)
    .eq('periodo', ANIO)
    .like('indicador_nombre', 'Tasa de fecundidad — %');
  if (error) {
    console.error('❌ no se pudieron borrar las filas previas:', error.message);
    process.exit(1);
  }
  console.log('\n   🗑️  filas previas borradas (--replace)');
}

const res = await insertIfMissing(filas, { apply: APPLY });
if (res.error) {
  console.error('❌', res.error.message ?? res.error);
  process.exit(1);
}
console.log(
  `\n${APPLY ? '✅' : '🏜️  DRY-RUN'} filas ${filas.length} · ya existentes ${res.existing} · ${APPLY ? `insertadas ${res.inserted}` : `a insertar ${res.missing.length}`}\n`
);
