/**
 * ETL: Actualizar indicadores desde API de datos.gob.ar (INDEC)
 *
 * Series incluidas:
 * - Canastas básicas (CBA, CBT, indigencia, pobreza, Engel)
 * - Empleo Córdoba (desempleo, empleo, actividad, subocupación)
 * - Asalariados registrados Córdoba
 * - IPC Nacional (para deflactar)
 *
 * Ejecutar: node scripts/update-indec-indicators.mjs
 * Requiere: SUPABASE_SERVICE_ROLE_KEY en .env.local
 */
import { supabase } from './config.mjs';

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
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${id}`);
  const json = await res.json();
  return json.data || [];
}

async function deleteOld(nombre, fuente) {
  const { error } = await supabase
    .from('indicadores')
    .delete()
    .eq('indicador_nombre', nombre)
    .eq('fuente', fuente);
  if (error) throw error;
}

function parseDate(dateStr) {
  // Format: "2025-11-01" or "2025-11"
  const parts = dateStr.split('-');
  return {
    year: Number(parts[0]),
    month: parts[1] ? Number(parts[1]) : null,
  };
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  ACTUALIZACIÓN DE INDICADORES INDEC');
  console.log('═══════════════════════════════════════════════════\n');

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

      // Eliminar datos anteriores de esta serie
      await deleteOld(s.nombre, s.fuente);

      // Transformar datos
      const rows = data.map(([periodo, valor]) => {
        const { year, month } = parseDate(periodo);
        return {
          indicador_nombre: s.nombre,
          categoria: s.categoria,
          valor: Number(Number(valor).toFixed(2)),
          unidad: s.unidad,
          periodo: year,
          region: s.region,
          desglose: JSON.stringify({
            mes: month,
            fuente_api: s.id,
            frecuencia: month ? 'mensual' : 'anual',
          }),
          fuente: s.fuente,
          ultima_actualizacion: new Date().toISOString(),
          activo: true,
        };
      });

      // Insertar en lotes de 100
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { error } = await supabase.from('indicadores').insert(batch);
        if (error) throw error;
      }

      totalInserted += rows.length;
      console.log(`✅ ${rows.length} rows (${rows[0].periodo} → ${rows[rows.length - 1].periodo})`);
    } catch (err) {
      totalErrors++;
      console.log(`❌ ${err.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log(`  RESUMEN: ${totalInserted} registros insertados, ${totalErrors} errores`);
  console.log('═══════════════════════════════════════════════════');
}

main().catch(console.error);
