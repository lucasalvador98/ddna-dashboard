/**
 * ETL: Actualizar indicadores desde API de datos.gob.ar (INDEC)
 *
 * Series incluidas:
 * - Canastas básicas (CBA, CBT, indigencia, pobreza, Engel)
 * - Empleo Córdoba (desempleo, empleo, actividad, subocupación)
 * - Asalariados registrados Córdoba
 * - IPC Nacional (para deflactar)
 *
 * Ejecutar: node scripts/update-indec-indicators.mjs        (dry-run, no escribe)
 *           node scripts/update-indec-indicators.mjs --apply (escribe)
 * Requiere: SUPABASE_SERVICE_ROLE_KEY en .env.local
 *
 * Idempotencia: sin índice único en la DB, el upsert por onConflict falla y
 * re-insertar a ciegas duplica filas. Este script usa insert-if-missing:
 * pre-check por scope (categoria+periodo+region+fuente) contra lo ya existente
 * y filtrado por clave natural completa (indicador_nombre|periodo|region|
 * fuente|mes|fuente_api), insertando solo lo que falta.
 */
import { supabase } from './config.mjs';
import { fetchWithRetry, validateRows, insertIfMissing } from './etl-runner.mjs';

const BASE_URL = 'https://apis.datos.gob.ar/series/api/series/';

// ============================================================
// SERIES A ACTUALIZAR
// ============================================================

const SERIES = [
  // --- CANASTAS BÁSICAS Y UMBRALES ---
  {
    id: '150.1_CSTA_BARIA_0_D_26',
    nombre: 'Canasta Básica Alimentaria (CBA)',
    categoria: 'canastas',
    unidad: 'pesos',
    fuente: 'INDEC / datos.gob.ar',
    region: 'Nacional',
  },
  {
    id: '150.1_CSTA_BATAL_0_D_20',
    nombre: 'Canasta Básica Total (CBT)',
    categoria: 'canastas',
    unidad: 'pesos',
    fuente: 'INDEC / datos.gob.ar',
    region: 'Nacional',
  },
  {
    id: '150.1_LA_INDICIA_0_D_16',
    nombre: 'Línea de Indigencia',
    categoria: 'canastas',
    unidad: 'pesos',
    fuente: 'INDEC / datos.gob.ar',
    region: 'Nacional',
  },
  {
    id: '150.1_LA_POBREZA_0_D_13',
    nombre: 'Línea de Pobreza',
    categoria: 'canastas',
    unidad: 'pesos',
    fuente: 'INDEC / datos.gob.ar',
    region: 'Nacional',
  },
  {
    id: '150.1_IRSA_COGEL_0_D_25',
    nombre: 'Coeficiente de Engel (inversa)',
    categoria: 'canastas',
    unidad: 'coeficiente',
    fuente: 'INDEC / datos.gob.ar',
    region: 'Nacional',
  },

  // --- EMPLEO CÓRDOBA (EPH Continua) ---
  {
    id: '45.2_ECTDTGC_0_T_46',
    nombre: 'Desempleo Córdoba (trimestral)',
    categoria: 'empleo',
    unidad: '%',
    fuente: 'EPH-INDEC / datos.gob.ar',
    region: 'Córdoba',
  },
  {
    id: '44.2_ECTETGC_0_T_43',
    nombre: 'Empleo Córdoba (trimestral)',
    categoria: 'empleo',
    unidad: '%',
    fuente: 'EPH-INDEC / datos.gob.ar',
    region: 'Córdoba',
  },
  {
    id: '43.2_ECTATGC_0_T_46',
    nombre: 'Actividad Córdoba (trimestral)',
    categoria: 'empleo',
    unidad: '%',
    fuente: 'EPH-INDEC / datos.gob.ar',
    region: 'Córdoba',
  },
  {
    id: '47.2_ECTSDTGC_0_T_60',
    nombre: 'Subocupación demandante Córdoba',
    categoria: 'empleo',
    unidad: '%',
    fuente: 'EPH-INDEC / datos.gob.ar',
    region: 'Córdoba',
  },
  {
    id: '48.2_ECTSNDTGC_0_T_52',
    nombre: 'Subocupación no demandante Córdoba',
    categoria: 'empleo',
    unidad: '%',
    fuente: 'EPH-INDEC / datos.gob.ar',
    region: 'Córdoba',
  },

  // --- ASALARIADOS PRIVADOS CÓRDOBA ---
  {
    id: '154.1_COBAOBA_C_0_0_7',
    nombre: 'Asalariados sector privado Córdoba',
    categoria: 'empleo',
    unidad: 'miles de personas',
    fuente: 'STESS / datos.gob.ar',
    region: 'Córdoba',
  },

  // --- ÍNDICE EMPLEO CÓRDOBA ---
  {
    id: '51.3_ICE_GRAOBA_0_M_19',
    nombre: 'Índice Empleo Gran Córdoba',
    categoria: 'empleo',
    unidad: 'índice',
    fuente: 'STESS / datos.gob.ar',
    region: 'Córdoba',
  },

  // --- POBREZA CÓRDOBA (ya tenemos, pero actualizamos) ---
  {
    id: '64.2_POBLACION_NUA_0_0_41_96',
    nombre: 'Pobreza personas Córdoba',
    categoria: 'pobreza',
    unidad: '%',
    fuente: 'EPH-INDEC / datos.gob.ar',
    region: 'Córdoba',
  },
  {
    id: '63.2_HOGARES_PONUA_0_0_40_49',
    nombre: 'Pobreza hogares Córdoba',
    categoria: 'pobreza',
    unidad: '%',
    fuente: 'EPH-INDEC / datos.gob.ar',
    region: 'Córdoba',
  },

  // --- MORTALIDAD INFANTIL (ya tenemos, pero actualizamos) ---
  {
    id: 'tmi_14',
    nombre: 'Mortalidad infantil (TMI Cba)',
    categoria: 'salud',
    unidad: '‰',
    fuente: 'DEIS / datos.gob.ar',
    region: 'Córdoba',
  },
  {
    id: 'tmi_arg',
    nombre: 'Mortalidad infantil (TMI)',
    categoria: 'salud',
    unidad: '‰',
    fuente: 'DEIS / datos.gob.ar',
    region: 'Nacional',
  },

  // --- DESEMELO NACIONAL ---
  {
    id: '42.1_EPDT_0_A_30',
    nombre: 'Desempleo nacional (anual)',
    categoria: 'empleo',
    unidad: '%',
    fuente: 'EPH-INDEC / datos.gob.ar',
    region: 'Nacional',
  },
];

// ============================================================
// FUNCIONES
// ============================================================

async function fetchSeries(id) {
  const url = `${BASE_URL}?ids=${id}&format=json&sort=desc&limit=100`;
  const res = await fetchWithRetry(url, { retries: 3, backoffMs: [1000, 2000, 4000] });
  const json = await res.json();
  return json.data || [];
}

function parseDate(dateStr) {
  // Format: "2025-11-01" or "2025-11"
  const parts = dateStr.split('-');
  return {
    year: Number(parts[0]),
    month: parts[1] ? Number(parts[1]) : null,
  };
}

// Por defecto es dry-run: no escribe nada. --apply habilita la escritura
// (mismo patrón que load-pisa-2025.mjs).
const APPLY = process.argv.includes('--apply');

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log(`  ACTUALIZACIÓN DE INDICADORES INDEC ${APPLY ? '' : '(DRY-RUN — pasá --apply para escribir)'}`);
  console.log('═══════════════════════════════════════════════════\n');

  let totalValid = 0;
  let totalExisting = 0;
  let totalPlanned = 0;
  let totalInserted = 0;
  let totalErrors = 0;

  for (const s of SERIES) {
    process.stdout.write(`📊 ${s.nombre}... `);

    try {
      const data = await fetchSeries(s.id);
      if (!data || data.length === 0) {
        console.log('⚠️  Sin datos');
        continue;
      }

      // Transformar datos
      const rawRows = data.map(([periodo, valor]) => {
        const { year, month } = parseDate(periodo);
        return {
          indicador_nombre: s.nombre,
          categoria: s.categoria,
          valor: Number(valor),
          unidad: s.unidad,
          periodo: year,
          region: s.region,
          desglose: {
            mes: month,
            fuente_api: s.id,
            frecuencia: month ? 'mensual' : 'anual',
          },
          fuente: s.fuente,
        };
      });

      // Validar (sin delete previo, idempotente)
      const { valid, warnings } = validateRows(rawRows);
      if (warnings.length > 0) {
        warnings.forEach((w) => console.warn(`  ⚠️  ${w}`));
      }
      if (valid.length === 0) {
        console.log('⚠️  Nada válido para insertar');
        continue;
      }

      // Pre-check + insert-if-missing: filtra los validados por clave natural
      // completa (nombre|periodo|region|fuente|mes|fuente_api) contra lo ya
      // existente en la DB. Con dry-run solo planifica (no escribe).
      const { missing, existing, inserted, error } = await insertIfMissing(valid, { apply: APPLY });
      if (error) throw error;

      totalValid += valid.length;
      totalExisting += existing;
      if (APPLY) {
        totalInserted += inserted;
        console.log(`✅ ${valid.length} validados · ${existing} ya existentes · ${inserted} insertados (${valid[0].periodo} → ${valid[valid.length - 1].periodo})${warnings.length ? ` +${warnings.length} warnings` : ''}`);
      } else {
        totalPlanned += missing.length;
        console.log(`✅ ${valid.length} validados · ${existing} ya existentes · ${missing.length} a insertar (${valid[0].periodo} → ${valid[valid.length - 1].periodo})${warnings.length ? ` +${warnings.length} warnings` : ''}`);
      }
    } catch (err) {
      totalErrors++;
      console.log(`❌ ${err.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════');
  if (APPLY) {
    console.log(`  RESUMEN: ${totalValid} validados · ${totalExisting} ya existentes (skip) · ${totalInserted} insertados · ${totalErrors} errores`);
  } else {
    console.log(`  RESUMEN: ${totalValid} validados · ${totalExisting} ya existentes (skip) · ${totalPlanned} a insertar (dry-run) · ${totalErrors} errores`);
  }
  console.log('═══════════════════════════════════════════════════');
}

main().catch(console.error);
