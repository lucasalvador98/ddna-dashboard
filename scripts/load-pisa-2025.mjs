#!/usr/bin/env node
/**
 * ETL — PISA 2025 (Argentina / Córdoba) → tabla `indicadores`
 *
 * Carga el dataset verificado `scripts/data/pisa-2025-argentina.json`
 * (OECD, PISA 2025 Results Vol. I — Argentina Country Note) en la tabla
 * `indicadores` del Supabase self-hosted (producción).
 *
 * Reglas:
 *  - categoria='educacion', periodo=2025 para todas las filas (así
 *    surgen en la sección de educación del tablero).
 *  - Regiones autorizadas: 'Nacional', 'Córdoba', 'OCDE promedio'.
 *  - Fuente: 'OECD / PISA 2025'; para filas de Córdoba se agrega
 *    ' + Córdoba (Región Adjudicada)'.
 *  - Idempotente: antes de escribir consulta las filas existentes
 *    (categoria='educacion', periodo=2025) y sólo inserta/upsertea las
 *    que faltan según clave natural indicador_nombre+periodo+region+fuente.
 *    Nunca borra ni pisa filas pre-existentes de otras fuentes.
 *  - Hojas no numéricas (strings como "casi 0", null) se omiten y se reportan.
 *
 * Uso:
 *   node scripts/load-pisa-2025.mjs            # dry-run (no escribe nada)
 *   node scripts/load-pisa-2025.mjs --apply    # escribe (alias: --commit)
 *
 * Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local
 * (ver scripts/config.mjs).
 */
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { supabase } from './config.mjs';
import { validateRows, upsertRows } from './etl-runner.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CATEGORIA = 'educacion';
const PERIODO = 2025;
const BASE_FUENTE = 'OECD / PISA 2025';
const FUENTE_CORDOBA = `${BASE_FUENTE} + Córdoba (Región Adjudicada)`;
const SUFFIX_CORDOBA = ' (Córdoba)';
const dataFile = resolve(__dirname, 'data', 'pisa-2025-argentina.json');

const R = { NAC: 'Nacional', OCDE: 'OCDE promedio', CBA: 'Córdoba' };

// Razones de omisión (se reportan en el resumen)
const SKIP_WORLD = 'contexto mundial (no hay región autorizada: Nacional/Córdoba/OCDE promedio)';
const SKIP_HIST = 'valor comparativo histórico (PISA 2018/2022); no corresponde a una fila 2025';

/**
 * Genera las entradas de metadata para un leaf del tipo
 * { argentina, oecd_promedio, [pais_2022], [pais_2018], [cambio_vs_2022_pp] }.
 * - argentina → región 'Nacional'
 * - oecd_promedio → región 'OCDE promedio'
 * - pais_2022 / pais_2018 → se omiten (comparativos históricos)
 * - cambio_vs_2022_pp (opcional) → región 'Nacional', unidad 'puntos porcentuales'
 */
function pair(path, name, unidad, { cambio = false } = {}) {
  const entries = {
    [`${path}.argentina`]: { name, unidad, region: R.NAC },
    [`${path}.oecd_promedio`]: { name, unidad, region: R.OCDE },
    [`${path}.pais_2022`]: { skip: SKIP_HIST },
    [`${path}.pais_2018`]: { skip: SKIP_HIST },
  };
  if (cambio) {
    entries[`${path}.cambio_vs_2022_pp`] = {
      name: `${name} - Cambio vs. 2022 (pp)`,
      unidad: 'puntos porcentuales',
      region: R.NAC,
    };
  }
  return entries;
}

/**
 * Mapa path JSON → metadata de la fila indicador.
 * Cada hoja numérica que se carga tiene entrada EXACTA aquí (nombre claro,
 * unidad y región). Las claves sin entrada se omiten y se reportan.
 */
const META = {
  // ── participacion ────────────────────────────────────────────────
  'participacion.estudiantes_argentina': { name: 'PISA 2025 Argentina - Estudiantes evaluados', unidad: 'estudiantes', region: R.NAC },
  'participacion.escuelas_argentina': { name: 'PISA 2025 Argentina - Escuelas participantes', unidad: 'escuelas', region: R.NAC },
  'participacion.quincenarios_15anios_representados': { name: 'PISA 2025 Argentina - Población de 15 años representada', unidad: 'estudiantes', region: R.NAC },
  'participacion.cobertura_poblacion_pct': { name: 'PISA 2025 Argentina - Cobertura de la población objetivo (%)', unidad: '%', region: R.NAC },
  'participacion.estudiantes_total_mundial': { skip: SKIP_WORLD },
  'participacion.paises_participantes': { skip: SKIP_WORLD },
  'participacion.quincenarios_15anios_mundial': { skip: SKIP_WORLD },

  // ── niveles_proficiencia_pct ─────────────────────────────────────
  ...pair('niveles_proficiencia_pct.ciencia_nivel2_mas', 'PISA 2025 Ciencia - Nivel 2+ (%)', '%'),
  ...pair('niveles_proficiencia_pct.lectura_nivel2_mas', 'PISA 2025 Lectura - Nivel 2+ (%)', '%'),
  ...pair('niveles_proficiencia_pct.matematica_nivel2_mas', 'PISA 2025 Matemática - Nivel 2+ (%)', '%'),
  ...pair('niveles_proficiencia_pct.ciencia_ambiental_nivel2_mas', 'PISA 2025 Ciencias Ambientales - Nivel 2+ (%)', '%'),
  ...pair('niveles_proficiencia_pct.ciencia_top_performer_nivel5_6', 'PISA 2025 Ciencia - Nivel 5/6 (%)', '%'),
  ...pair('niveles_proficiencia_pct.lectura_nivel5_mas', 'PISA 2025 Lectura - Nivel 5+ (%)', '%'),
  ...pair('niveles_proficiencia_pct.matematica_nivel5_6', 'PISA 2025 Matemática - Nivel 5/6 (%)', '%'),

  // ── puntajes_promedio ────────────────────────────────────────────
  'puntajes_promedio.nacional.ciencia': { name: 'PISA 2025 Ciencia - Puntaje promedio', unidad: 'puntos', region: R.NAC },
  'puntajes_promedio.nacional.lectura': { name: 'PISA 2025 Lectura - Puntaje promedio', unidad: 'puntos', region: R.NAC },
  'puntajes_promedio.nacional.matematica': { name: 'PISA 2025 Matemática - Puntaje promedio', unidad: 'puntos', region: R.NAC },
  'puntajes_promedio.nacional.aprendizaje_mundo_digital': { name: 'PISA 2025 Aprendizaje en el mundo digital - Puntaje promedio', unidad: 'puntos', region: R.NAC },
  'puntajes_promedio.cordoba.ciencia': { name: 'PISA 2025 Ciencia - Puntaje promedio', unidad: 'puntos', region: R.CBA },
  'puntajes_promedio.cordoba.lectura': { name: 'PISA 2025 Lectura - Puntaje promedio', unidad: 'puntos', region: R.CBA },
  'puntajes_promedio.cordoba.matematica': { name: 'PISA 2025 Matemática - Puntaje promedio', unidad: 'puntos', region: R.CBA },
  'puntajes_promedio.cordoba.aprendizaje_mundo_digital': { name: 'PISA 2025 Aprendizaje en el mundo digital - Puntaje promedio', unidad: 'puntos', region: R.CBA },

  // ── cordoba_region_adjudicada ────────────────────────────────────
  'cordoba_region_adjudicada.estudiantes': { name: `PISA 2025 Córdoba - Estudiantes participantes${SUFFIX_CORDOBA}`, unidad: 'estudiantes', region: R.CBA },
  'cordoba_region_adjudicada.escuelas': { name: `PISA 2025 Córdoba - Escuelas participantes${SUFFIX_CORDOBA}`, unidad: 'escuelas', region: R.CBA },
  // puntajes.* → mismos nombres/valores/región que puntajes_promedio.cordoba.*
  // (datos duplicados en el JSON); el dedupe por clave natural los descarta.
  'cordoba_region_adjudicada.puntajes.ciencia': { name: 'PISA 2025 Ciencia - Puntaje promedio', unidad: 'puntos', region: R.CBA },
  'cordoba_region_adjudicada.puntajes.lectura': { name: 'PISA 2025 Lectura - Puntaje promedio', unidad: 'puntos', region: R.CBA },
  'cordoba_region_adjudicada.puntajes.matematica': { name: 'PISA 2025 Matemática - Puntaje promedio', unidad: 'puntos', region: R.CBA },
  'cordoba_region_adjudicada.puntajes.aprendizaje_mundo_digital': { name: 'PISA 2025 Aprendizaje en el mundo digital - Puntaje promedio', unidad: 'puntos', region: R.CBA },
  'cordoba_region_adjudicada.diferencia_vs_nacional.ciencia': { name: 'PISA 2025 Ciencia - Diferencia vs. nacional (puntos)', unidad: 'puntos', region: R.CBA },
  'cordoba_region_adjudicada.diferencia_vs_nacional.lectura': { name: 'PISA 2025 Lectura - Diferencia vs. nacional (puntos)', unidad: 'puntos', region: R.CBA },
  'cordoba_region_adjudicada.diferencia_vs_nacional.matematica': { name: 'PISA 2025 Matemática - Diferencia vs. nacional (puntos)', unidad: 'puntos', region: R.CBA },
  'cordoba_region_adjudicada.diferencia_vs_nacional.aprendizaje_mundo_digital': { name: 'PISA 2025 Aprendizaje en el mundo digital - Diferencia vs. nacional (puntos)', unidad: 'puntos', region: R.CBA },
  'cordoba_region_adjudicada.nivel2_mas_pct.ciencia': { name: 'PISA 2025 Ciencia - Nivel 2+ (%)', unidad: '%', region: R.CBA },
  'cordoba_region_adjudicada.nivel2_mas_pct.lectura': { name: 'PISA 2025 Lectura - Nivel 2+ (%)', unidad: '%', region: R.CBA },
  'cordoba_region_adjudicada.nivel2_mas_pct.matematica': { name: 'PISA 2025 Matemática - Nivel 2+ (%)', unidad: '%', region: R.CBA },
  'cordoba_region_adjudicada.nivel2_mas_pct.aprendizaje_mundo_digital': { name: 'PISA 2025 Aprendizaje en el mundo digital - Nivel 2+ (%)', unidad: '%', region: R.CBA },

  // ── brechas_socioeconomicas_ciencia ──────────────────────────────
  'brechas_socioeconomicas_ciencia.puntaje_2do_cuartil_socioeconomico': { name: 'PISA 2025 Ciencia - Puntaje 2° cuartil socioeconómico', unidad: 'puntos', region: R.NAC },
  'brechas_socioeconomicas_ciencia.brecha_avanzados_vs_desventajados': { name: 'PISA 2025 Ciencia - Brecha aventajados vs. desventajados (puntos)', unidad: 'puntos', region: R.NAC },
  'brechas_socioeconomicas_ciencia.brecha_promedio_oecd': { name: 'PISA 2025 Ciencia - Brecha aventajados vs. desventajados (puntos)', unidad: 'puntos', region: R.OCDE },
  ...pair('brechas_socioeconomicas_ciencia.desventajados_en_cuarto_superior_pct', 'PISA 2025 Ciencia - Desventajados que llegan al cuarto superior (%)', '%'),
  ...pair('brechas_socioeconomicas_ciencia.socioeconomico_explica_variacion_pct', 'PISA 2025 Ciencia - Variación explicada por nivel socioeconómico (%)', '%'),

  // ── actitudes ────────────────────────────────────────────────────
  ...pair('actitudes.mentalidad_de_crecimiento_pct', 'PISA 2025 - Con mentalidad de crecimiento (%)', '%'),
  ...pair('actitudes.efecto_mentalidad_crecimiento_puntos_ciencia', 'PISA 2025 Ciencia - Efecto de la mentalidad de crecimiento (puntos)', 'puntos'),
  ...pair('actitudes.curiosos_sobre_muchas_cosas_pct', 'PISA 2025 - Curiosos sobre muchas cosas (%)', '%'),
  ...pair('actitudes.esfuerzo_cuando_desafiante_pct', 'PISA 2025 - Se esfuerzan cuando hay desafíos (%)', '%'),
  ...pair('actitudes.escuela_perdida_tiempo_pct', 'PISA 2025 - Sienten que la escuela es pérdida de tiempo (%)', '%', { cambio: true }),
  ...pair('actitudes.planifica_estudiar_pct', 'PISA 2025 - Planifican el estudio (%)', '%'),
  ...pair('actitudes.pregunta_para_comprobar_comprension_pct', 'PISA 2025 - Preguntan para comprobar la comprensión (%)', '%'),
  ...pair('actitudes.pide_ayuda_docentes_pct', 'PISA 2025 - Piden ayuda a docentes (%)', '%'),
  ...pair('actitudes.pide_ayuda_companeros_pct', 'PISA 2025 - Piden ayuda a compañeros (%)', '%'),

  // ── ausentismo_puntualidad_pct ───────────────────────────────────
  ...pair('ausentismo_puntualidad_pct.falto_un_dia_o_mas', 'PISA 2025 - Faltó un día completo o más (%)', '%'),
  ...pair('ausentismo_puntualidad_pct.falto_una_clase_o_mas', 'PISA 2025 - Faltó a una clase o más (%)', '%'),
  ...pair('ausentismo_puntualidad_pct.llego_tarde', 'PISA 2025 - Llegó tarde (%)', '%'),

  // ── recursos_y_clima ─────────────────────────────────────────────
  ...pair('recursos_y_clima.falta_docentes_pct', 'PISA 2025 - Falta de docentes (%)', '%'),
  ...pair('recursos_y_clima.falta_asistentes_pct', 'PISA 2025 - Falta de personal de apoyo (%)', '%'),
  ...pair('recursos_y_clima.falta_material_educativo_pct', 'PISA 2025 - Falta de material educativo (%)', '%'),
  ...pair('recursos_y_clima.falta_infraestructura_pct', 'PISA 2025 - Falta de infraestructura (%)', '%'),
  ...pair('recursos_y_clima.docente_muestra_interes_pct', 'PISA 2025 - Docentes que muestran interés (%)', '%'),
  ...pair('recursos_y_clima.docente_insiste_hasta_comprender_pct', 'PISA 2025 - Docentes que insisten hasta que se comprende (%)', '%'),
  ...pair('recursos_y_clima.docente_da_ayuda_extra_pct', 'PISA 2025 - Docentes que dan ayuda extra (%)', '%'),
  ...pair('recursos_y_clima.no_puede_trabajar_bien_pct', 'PISA 2025 - No puede trabajar bien (%)', '%'),
  ...pair('recursos_y_clima.ruido_desorden_pct', 'PISA 2025 - Ruido y desorden (%)', '%'),
  ...pair('recursos_y_clima.companeros_no_escuchan_pct', 'PISA 2025 - Compañeros que no escuchan (%)', '%'),

  // ── digital_y_ia ─────────────────────────────────────────────────
  ...pair('digital_y_ia.dispositivos_aprendizaje_horas_dia', 'PISA 2025 - Dispositivos para aprendizaje (horas/día)', 'horas por dia'),
  ...pair('digital_y_ia.dispositivos_ocio_horas_dia', 'PISA 2025 - Dispositivos para ocio (horas/día)', 'horas por dia'),
  ...pair('digital_y_ia.companeros_distraidos_digital_pct', 'PISA 2025 - Compañeros distraídos por dispositivos (%)', '%'),
  ...pair('digital_y_ia.escuelas_con_prohibicion_celular_pct', 'PISA 2025 - Escuelas que prohíben el celular (%)', '%'),
  ...pair('digital_y_ia.usa_chatbot_ia_semanal_pct', 'PISA 2025 - Usa chatbot de IA semanalmente (%)', '%'),
  ...pair('digital_y_ia.solo_10pct_nunca_usa_ia', 'PISA 2025 - Nunca usa IA (%)', '%'),

  // ── convivencia ──────────────────────────────────────────────────
  ...pair('convivencia.victimas_bullying_pct', 'PISA 2025 - Víctimas de bullying (%)', '%'),
  ...pair('convivencia.victimas_ciberbullying_pct', 'PISA 2025 - Víctimas de ciberbullying (%)', '%'),
  'convivencia.ciberbullying_puntos_menos_ciencia': { name: 'PISA 2025 Ciencia - Víctimas de ciberbullying puntúan menos (puntos)', unidad: 'puntos', region: R.NAC },
  ...pair('convivencia.padres_preguntan_semanal_pct', 'PISA 2025 - Padres preguntan sobre la escuela semanalmente (%)', '%'),
  ...pair('convivencia.charlas_problemas_semanal_pct', 'PISA 2025 - Charlan sobre problemas semanalmente (%)', '%'),
};

// Clave natural para idempotencia (misma que el onConflict de upsertRows)
function naturalKey(row) {
  return [row.indicador_nombre, row.periodo, row.region, row.fuente].join('|');
}

/** Recorre el JSON y emite filas indicador + listado de omisiones. */
function buildRows(data) {
  const rows = [];
  const skipped = []; // { path, reason, value? }

  const emit = (path, value, meta, seccion) => {
    if (typeof value === 'string') {
      skipped.push({ path, value, reason: `valor no numérico ("${value}") — se omite` });
      return;
    }
    if (value === null || value === undefined) {
      skipped.push({ path, value, reason: 'valor null — se omite' });
      return;
    }
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      skipped.push({ path, value, reason: `no numérico (${value}) — se omite` });
      return;
    }
    const row = {
      indicador_nombre: meta.name,
      categoria: CATEGORIA,
      valor: value,
      unidad: meta.unidad,
      periodo: PERIODO,
      region: meta.region,
      desglose: { ciclo: 'PISA 2025', seccion, clave: path.split('.').pop() },
      fuente: meta.region === R.CBA ? FUENTE_CORDOBA : BASE_FUENTE,
    };
    // Dedupe dentro del propio JSON (p. ej. puntajes duplicados en Córdoba)
    const key = naturalKey(row);
    if (seenKeys.has(key)) {
      skipped.push({ path, value, reason: 'duplicado de otra hoja del JSON (misma clave natural) — se omite' });
      return;
    }
    seenKeys.add(key);
    rows.push(row);
  };

  const walk = (obj, prefix) => {
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('_')) continue; // notas/metadata interna
      const path = prefix ? `${prefix}.${k}` : k;
      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        walk(v, path);
        continue;
      }
      const meta = META[path];
      if (!meta) {
        skipped.push({ path, value: v, reason: 'sin metadata en META (clave inesperada) — se omite' });
        continue;
      }
      if (meta.skip) {
        skipped.push({ path, value: v, reason: meta.skip });
        continue;
      }
      emit(path, v, meta, prefix || path);
    }
  };

  const seenKeys = new Set();
  walk(data);
  return { rows, skipped };
}

function fmtSample(rows, n = 8) {
  return rows
    .slice(0, n)
    .map((r) => `  • ${r.indicador_nombre} [${r.region}] = ${r.valor} ${r.unidad} — ${r.fuente}`)
    .join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply') || args.includes('--commit');
  const mode = apply ? 'APPLY' : 'DRY-RUN';

  console.log('═══════════════════════════════════════════════════');
  console.log(`  ETL PISA 2025 → indicadores (${mode})`);
  console.log('═══════════════════════════════════════════════════\n');

  // 1) Leer y aplanar el dataset verificado
  const data = JSON.parse(await readFile(dataFile, 'utf8'));
  const { rows, skipped } = buildRows(data);

  // 2) Validar con el mismo criterio que el resto de los ETL
  const { valid, warnings } = validateRows(rows);
  warnings.forEach((w) => console.warn(`  ⚠️  ${w}`));

  // 3) Estado actual de la tabla (nunca se escribe sin mirar antes).
  // Scope por categoria+periodo: la tabla completa tiene >22k filas y
  // PostgREST pagina a 1000 filas por defecto — sin filtro el pre-check
  // no vería las filas PISA (las más nuevas) y no sería idempotente.
  const { data: existing, error: selErr } = await supabase
    .from('indicadores')
    .select('indicador_nombre, periodo, region, fuente')
    .eq('categoria', CATEGORIA)
    .eq('periodo', PERIODO)
    .limit(10000);
  if (selErr) {
    throw new Error(`No se pudo leer el estado actual de indicadores: ${selErr.message}`);
  }

  const existing2025 = (existing || []).filter((r) => String(r.periodo) === String(PERIODO));
  const existingKeys = new Set(existing2025.map(naturalKey));
  const existingByRegion = {};
  for (const r of existing2025) {
    existingByRegion[r.region] = (existingByRegion[r.region] || 0) + 1;
  }

  const fresh = valid.filter((r) => !existingKeys.has(naturalKey(r)));
  const alreadyPresent = valid.length - fresh.length;

  console.log(`📄 Hojas analizadas del JSON: ${rows.length + skipped.length}`);
  console.log(`✅ Filas planificadas (válidas): ${valid.length}`);
  console.log(`⏭️  Omitidas: ${skipped.length}`);
  console.log(`\n📋 Estado pre-existente (categoria='educacion', periodo='2025'):`);
  if (existing2025.length === 0) {
    console.log('   (sin filas)');
  } else {
    console.log(`   Total: ${existing2025.length} filas`);
    for (const [region, count] of Object.entries(existingByRegion).sort()) {
      console.log(`   • ${region}: ${count}`);
    }
  }
  console.log(`\n🔑 Coinciden con la clave natural PISA (se actualizarían, no duplican): ${alreadyPresent}`);
  console.log(`🆕 Filas nuevas a insertar: ${fresh.length}`);

  if (valid.length > 0) {
    console.log('\n📊 Muestra de filas planificadas:');
    console.log(fmtSample(valid));
    if (valid.length > 8) console.log(`   … y ${valid.length - 8} más`);
  }

  // Resumen de omisiones
  const skipByReason = {};
  for (const s of skipped) {
    skipByReason[s.reason] = (skipByReason[s.reason] || 0) + 1;
  }
  if (skipped.length > 0) {
    console.log('\n⏭️  Omitidas por motivo:');
    for (const [reason, count] of Object.entries(skipByReason)) {
      console.log(`   • ${count} × ${reason}`);
    }
  }

  if (!apply) {
    console.log('\n🏜️  DRY-RUN: no se escribió nada. Usá --apply (o --commit) para cargar.');
    return;
  }

  if (fresh.length === 0) {
    console.log('\n✅ Nada nuevo para insertar: todas las filas PISA ya existen (idempotente).');
    return;
  }

  // 4) Validar-antes-de-escribir ya hecho (paso 2). Escribir: upsert o insert-if-missing.
  try {
    const { inserted, error } = await upsertRows(fresh);
    if (error) throw error;
    console.log(`\n✅ Se cargaron ${inserted} filas PISA 2025 (educacion / 2025).`);
  } catch (err) {
    console.error(`\n❌ Error al escribir en Supabase: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  // 5) Verificación post-escritura: leer de vuelta y agrupar por región
  const { data: check, error: checkErr } = await supabase
    .from('indicadores')
    .select('region')
    .eq('categoria', CATEGORIA)
    .eq('periodo', PERIODO)
    .like('fuente', '%PISA%');
  if (checkErr) {
    console.error(`\n❌ Error al verificar: ${checkErr.message}`);
    process.exitCode = 1;
    return;
  }
  const byRegion = {};
  for (const r of check) byRegion[r.region] = (byRegion[r.region] || 0) + 1;
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  VERIFICACIÓN: filas PISA por región');
  console.log('═══════════════════════════════════════════════════');
  for (const [region, count] of Object.entries(byRegion).sort()) {
    console.log(`  ${region}: ${count}`);
  }
  console.log(`  TOTAL: ${check.length}`);
  console.log('═══════════════════════════════════════════════════');
}

main().catch((err) => {
  console.error(`❌ ${err.message}`);
  process.exitCode = 1;
});