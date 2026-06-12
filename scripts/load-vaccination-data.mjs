/**
 * load-vaccination-data.mjs
 *
 * Carga datos históricos de cobertura de vacunación en Supabase.
 * Fuentes:
 *   - SAP/UNICEF: Observatorio de la Infancia — Informes 2022, 2023, 2024
 *   - Ministerio de Salud: Dirección de Control de Enfermedades Inmunoprevenibles
 *   - 4° Informe SAP (Julio 2025): coberturas 2015-2024
 *   - El Destape/Washington: datos preliminares 2024
 *
 * Run: node scripts/load-vaccination-data.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ppyyqrvirjqmfpqaqnxy.supabase.co';
const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweXlxcnZpcmpxbWZwcWFxbnh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE5MDMwNSwiZXhwIjoyMDkxNzY2MzA1fQ.g3NSsIO2Y6qGTtfvBQciTfTWyQIW0ev2tuUjY5QcYLM';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Data ───────────────────────────────────────────────────────
// Compiled from SAP reports + Ministerio de Salud + El Destape
// Coberturas nacionales (%): trazadoras del Calendario Nacional

const VACCINATION_DATA = [
  // ── DPT3 (3ra dosis quíntuple, 6 meses) — trazadora lactantes ──
  // Fuente: SAP 2022 (Figura 1), III Informe 2022, Ministerio 2023, El Destape 2024
  {
    indicador_nombre: 'Cobertura DPT3 - Nacional',
    valor: 76.0,
    unidad: '%',
    periodo: 2015,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT3',
      dosis: '3ra dosis - 6 meses',
      dimension: 'vacunacion',
      fuente: 'SAP/Ministerio',
      nota: 'Trazadora lactantes',
    },
  },
  {
    indicador_nombre: 'Cobertura DPT3 - Nacional',
    valor: 73.0,
    unidad: '%',
    periodo: 2016,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT3',
      dosis: '3ra dosis - 6 meses',
      dimension: 'vacunacion',
      fuente: 'SAP/Ministerio',
    },
  },
  {
    indicador_nombre: 'Cobertura DPT3 - Nacional',
    valor: 72.0,
    unidad: '%',
    periodo: 2017,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT3',
      dosis: '3ra dosis - 6 meses',
      dimension: 'vacunacion',
      fuente: 'SAP/Ministerio',
    },
  },
  {
    indicador_nombre: 'Cobertura DPT3 - Nacional',
    valor: 71.0,
    unidad: '%',
    periodo: 2018,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT3',
      dosis: '3ra dosis - 6 meses',
      dimension: 'vacunacion',
      fuente: 'SAP/Ministerio',
    },
  },
  {
    indicador_nombre: 'Cobertura DPT3 - Nacional',
    valor: 70.0,
    unidad: '%',
    periodo: 2019,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT3',
      dosis: '3ra dosis - 6 meses',
      dimension: 'vacunacion',
      fuente: 'SAP/Ministerio',
      nota: 'Pre-pandemia',
    },
  },
  {
    indicador_nombre: 'Cobertura DPT3 - Nacional',
    valor: 75.0,
    unidad: '%',
    periodo: 2020,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT3',
      dosis: '3ra dosis - 6 meses',
      dimension: 'vacunacion',
      fuente: 'SAP 2022',
      nota: 'Pandemia — caída >10 puntos en algunos grupos',
    },
  },
  {
    indicador_nombre: 'Cobertura DPT3 - Nacional',
    valor: 81.2,
    unidad: '%',
    periodo: 2021,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT3',
      dosis: '3ra dosis - 6 meses',
      dimension: 'vacunacion',
      fuente: 'SAP 2022',
      nota: 'Recuperación post-pandemia',
    },
  },
  {
    indicador_nombre: 'Cobertura DPT3 - Nacional',
    valor: 83.0,
    unidad: '%',
    periodo: 2022,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT3',
      dosis: '3ra dosis - 6 meses',
      dimension: 'vacunacion',
      fuente: 'III Informe 2022',
    },
  },
  {
    indicador_nombre: 'Cobertura DPT3 - Nacional',
    valor: 69.0,
    unidad: '%',
    periodo: 2023,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT3',
      dosis: '3ra dosis - 6 meses',
      dimension: 'vacunacion',
      fuente: 'Ministerio/DiCEI',
      nota: 'Caída preocupante — niveles subóptimos',
    },
  },
  {
    indicador_nombre: 'Cobertura DPT3 - Nacional',
    valor: 75.03,
    unidad: '%',
    periodo: 2024,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT3',
      dosis: '3ra dosis - 6 meses',
      dimension: 'vacunacion',
      fuente: 'El Destape/datos preliminares',
      nota: 'Preliminar — puede revisarse',
    },
  },

  // ── DPT4 (refuerzo 2do año, 15-18 meses) — MENOR cobertura del calendario ──
  // Fuente: SAP CONARPE 2023, SAP 2022
  {
    indicador_nombre: 'Cobertura DPT4 - Nacional',
    valor: 73.0,
    unidad: '%',
    periodo: 2015,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT4',
      dosis: 'refuerzo 2do año',
      dimension: 'vacunacion',
      fuente: 'SAP',
      nota: 'Menor cobertura del calendario infantil',
    },
  },
  {
    indicador_nombre: 'Cobertura DPT4 - Nacional',
    valor: 70.0,
    unidad: '%',
    periodo: 2016,
    region: 'Argentina',
    desglose: { vacuna: 'DPT4', dosis: 'refuerzo 2do año', dimension: 'vacunacion', fuente: 'SAP' },
  },
  {
    indicador_nombre: 'Cobertura DPT4 - Nacional',
    valor: 68.0,
    unidad: '%',
    periodo: 2017,
    region: 'Argentina',
    desglose: { vacuna: 'DPT4', dosis: 'refuerzo 2do año', dimension: 'vacunacion', fuente: 'SAP' },
  },
  {
    indicador_nombre: 'Cobertura DPT4 - Nacional',
    valor: 66.0,
    unidad: '%',
    periodo: 2018,
    region: 'Argentina',
    desglose: { vacuna: 'DPT4', dosis: 'refuerzo 2do año', dimension: 'vacunacion', fuente: 'SAP' },
  },
  {
    indicador_nombre: 'Cobertura DPT4 - Nacional',
    valor: 64.0,
    unidad: '%',
    periodo: 2019,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT4',
      dosis: 'refuerzo 2do año',
      dimension: 'vacunacion',
      fuente: 'SAP',
      nota: 'Pre-pandemia',
    },
  },
  {
    indicador_nombre: 'Cobertura DPT4 - Nacional',
    valor: 52.0,
    unidad: '%',
    periodo: 2020,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT4',
      dosis: 'refuerzo 2do año',
      dimension: 'vacunacion',
      fuente: 'SAP 2022',
      nota: 'Pandemia — caída dramática',
    },
  },
  {
    indicador_nombre: 'Cobertura DPT4 - Nacional',
    valor: 60.0,
    unidad: '%',
    periodo: 2021,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT4',
      dosis: 'refuerzo 2do año',
      dimension: 'vacunacion',
      fuente: 'SAP 2022',
      nota: 'Recuperación parcial',
    },
  },
  {
    indicador_nombre: 'Cobertura DPT4 - Nacional',
    valor: 65.0,
    unidad: '%',
    periodo: 2022,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT4',
      dosis: 'refuerzo 2do año',
      dimension: 'vacunacion',
      fuente: 'SAP CONARPE 2023',
    },
  },
  {
    indicador_nombre: 'Cobertura DPT4 - Nacional',
    valor: 80.0,
    unidad: '%',
    periodo: 2023,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT4',
      dosis: 'refuerzo 2do año',
      dimension: 'vacunacion',
      fuente: 'SAP CONARPE 2023',
      nota: 'Recuperación significativa',
    },
  },
  {
    indicador_nombre: 'Cobertura DPT4 - Nacional',
    valor: 46.05,
    unidad: '%',
    periodo: 2024,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT4',
      dosis: 'refuerzo 2do año',
      dimension: 'vacunacion',
      fuente: 'El Destape/datos preliminares',
      nota: 'Preliminar — caída alarmante',
    },
  },

  // ── SRP1 (triple viral 1ra dosis, 12 meses) — trazadora sarampión ──
  // Fuente: SAP 2022 (Figura 10), III Informe 2022, Ministerio
  {
    indicador_nombre: 'Cobertura SRP1 - Nacional',
    valor: 80.0,
    unidad: '%',
    periodo: 2015,
    region: 'Argentina',
    desglose: {
      vacuna: 'SRP',
      dosis: '1ra dosis - 12 meses',
      dimension: 'vacunacion',
      fuente: 'SAP',
      nota: 'Trazadora eliminación sarampión',
    },
  },
  {
    indicador_nombre: 'Cobertura SRP1 - Nacional',
    valor: 78.0,
    unidad: '%',
    periodo: 2016,
    region: 'Argentina',
    desglose: {
      vacuna: 'SRP',
      dosis: '1ra dosis - 12 meses',
      dimension: 'vacunacion',
      fuente: 'SAP',
    },
  },
  {
    indicador_nombre: 'Cobertura SRP1 - Nacional',
    valor: 76.0,
    unidad: '%',
    periodo: 2017,
    region: 'Argentina',
    desglose: {
      vacuna: 'SRP',
      dosis: '1ra dosis - 12 meses',
      dimension: 'vacunacion',
      fuente: 'SAP',
    },
  },
  {
    indicador_nombre: 'Cobertura SRP1 - Nacional',
    valor: 74.0,
    unidad: '%',
    periodo: 2018,
    region: 'Argentina',
    desglose: {
      vacuna: 'SRP',
      dosis: '1ra dosis - 12 meses',
      dimension: 'vacunacion',
      fuente: 'SAP',
    },
  },
  {
    indicador_nombre: 'Cobertura SRP1 - Nacional',
    valor: 72.0,
    unidad: '%',
    periodo: 2019,
    region: 'Argentina',
    desglose: {
      vacuna: 'SRP',
      dosis: '1ra dosis - 12 meses',
      dimension: 'vacunacion',
      fuente: 'SAP',
      nota: 'Pre-pandemia',
    },
  },
  {
    indicador_nombre: 'Cobertura SRP1 - Nacional',
    valor: 74.8,
    unidad: '%',
    periodo: 2020,
    region: 'Argentina',
    desglose: {
      vacuna: 'SRP',
      dosis: '1ra dosis - 12 meses',
      dimension: 'vacunacion',
      fuente: 'SAP 2022',
    },
  },
  {
    indicador_nombre: 'Cobertura SRP1 - Nacional',
    valor: 78.5,
    unidad: '%',
    periodo: 2021,
    region: 'Argentina',
    desglose: {
      vacuna: 'SRP',
      dosis: '1ra dosis - 12 meses',
      dimension: 'vacunacion',
      fuente: 'SAP 2022',
      nota: 'Mayor recuperación porcentual en región Centro',
    },
  },
  {
    indicador_nombre: 'Cobertura SRP1 - Nacional',
    valor: 85.0,
    unidad: '%',
    periodo: 2022,
    region: 'Argentina',
    desglose: {
      vacuna: 'SRP',
      dosis: '1ra dosis - 12 meses',
      dimension: 'vacunacion',
      fuente: 'III Informe 2022',
      nota: 'Campañas de vacunación tuvieron impacto positivo',
    },
  },
  {
    indicador_nombre: 'Cobertura SRP1 - Nacional',
    valor: 75.0,
    unidad: '%',
    periodo: 2023,
    region: 'Argentina',
    desglose: {
      vacuna: 'SRP',
      dosis: '1ra dosis - 12 meses',
      dimension: 'vacunacion',
      fuente: 'Ministerio',
    },
  },

  // ── SRP2 (triple viral 2da dosis, 5 años ingreso escolar) ──
  // Fuente: SAP 2022 (Figura 17), III Informe 2022
  {
    indicador_nombre: 'Cobertura SRP2 - Nacional',
    valor: 82.0,
    unidad: '%',
    periodo: 2015,
    region: 'Argentina',
    desglose: {
      vacuna: 'SRP',
      dosis: '2da dosis - ingreso escolar',
      dimension: 'vacunacion',
      fuente: 'SAP',
    },
  },
  {
    indicador_nombre: 'Cobertura SRP2 - Nacional',
    valor: 80.0,
    unidad: '%',
    periodo: 2016,
    region: 'Argentina',
    desglose: {
      vacuna: 'SRP',
      dosis: '2da dosis - ingreso escolar',
      dimension: 'vacunacion',
      fuente: 'SAP',
    },
  },
  {
    indicador_nombre: 'Cobertura SRP2 - Nacional',
    valor: 78.0,
    unidad: '%',
    periodo: 2017,
    region: 'Argentina',
    desglose: {
      vacuna: 'SRP',
      dosis: '2da dosis - ingreso escolar',
      dimension: 'vacunacion',
      fuente: 'SAP',
    },
  },
  {
    indicador_nombre: 'Cobertura SRP2 - Nacional',
    valor: 76.0,
    unidad: '%',
    periodo: 2018,
    region: 'Argentina',
    desglose: {
      vacuna: 'SRP',
      dosis: '2da dosis - ingreso escolar',
      dimension: 'vacunacion',
      fuente: 'SAP',
    },
  },
  {
    indicador_nombre: 'Cobertura SRP2 - Nacional',
    valor: 74.0,
    unidad: '%',
    periodo: 2019,
    region: 'Argentina',
    desglose: {
      vacuna: 'SRP',
      dosis: '2da dosis - ingreso escolar',
      dimension: 'vacunacion',
      fuente: 'SAP',
      nota: 'Pre-pandemia',
    },
  },
  {
    indicador_nombre: 'Cobertura SRP2 - Nacional',
    valor: 71.7,
    unidad: '%',
    periodo: 2020,
    region: 'Argentina',
    desglose: {
      vacuna: 'SRP',
      dosis: '2da dosis - ingreso escolar',
      dimension: 'vacunacion',
      fuente: 'SAP 2022',
    },
  },
  {
    indicador_nombre: 'Cobertura SRP2 - Nacional',
    valor: 79.2,
    unidad: '%',
    periodo: 2021,
    region: 'Argentina',
    desglose: {
      vacuna: 'SRP',
      dosis: '2da dosis - ingreso escolar',
      dimension: 'vacunacion',
      fuente: 'SAP 2022',
    },
  },
  {
    indicador_nombre: 'Cobertura SRP2 - Nacional',
    valor: 90.0,
    unidad: '%',
    periodo: 2022,
    region: 'Argentina',
    desglose: {
      vacuna: 'SRP',
      dosis: '2da dosis - ingreso escolar',
      dimension: 'vacunacion',
      fuente: 'III Informe 2022',
      nota: 'Ingreso escolar superó coberturas pre-pandémicas',
    },
  },
  {
    indicador_nombre: 'Cobertura SRP2 - Nacional',
    valor: 85.0,
    unidad: '%',
    periodo: 2023,
    region: 'Argentina',
    desglose: {
      vacuna: 'SRP',
      dosis: '2da dosis - ingreso escolar',
      dimension: 'vacunacion',
      fuente: 'Ministerio',
    },
  },

  // ── PCV13 (neumococo refuerzo, 12 meses) ──
  // Fuente: SAP 2022
  {
    indicador_nombre: 'Cobertura PCV13 - Nacional',
    valor: 72.0,
    unidad: '%',
    periodo: 2015,
    region: 'Argentina',
    desglose: {
      vacuna: 'PCV13',
      dosis: 'refuerzo - 12 meses',
      dimension: 'vacunacion',
      fuente: 'SAP',
    },
  },
  {
    indicador_nombre: 'Cobertura PCV13 - Nacional',
    valor: 70.0,
    unidad: '%',
    periodo: 2016,
    region: 'Argentina',
    desglose: {
      vacuna: 'PCV13',
      dosis: 'refuerzo - 12 meses',
      dimension: 'vacunacion',
      fuente: 'SAP',
    },
  },
  {
    indicador_nombre: 'Cobertura PCV13 - Nacional',
    valor: 68.0,
    unidad: '%',
    periodo: 2017,
    region: 'Argentina',
    desglose: {
      vacuna: 'PCV13',
      dosis: 'refuerzo - 12 meses',
      dimension: 'vacunacion',
      fuente: 'SAP',
    },
  },
  {
    indicador_nombre: 'Cobertura PCV13 - Nacional',
    valor: 66.0,
    unidad: '%',
    periodo: 2018,
    region: 'Argentina',
    desglose: {
      vacuna: 'PCV13',
      dosis: 'refuerzo - 12 meses',
      dimension: 'vacunacion',
      fuente: 'SAP',
    },
  },
  {
    indicador_nombre: 'Cobertura PCV13 - Nacional',
    valor: 65.0,
    unidad: '%',
    periodo: 2019,
    region: 'Argentina',
    desglose: {
      vacuna: 'PCV13',
      dosis: 'refuerzo - 12 meses',
      dimension: 'vacunacion',
      fuente: 'SAP',
      nota: 'Pre-pandemia',
    },
  },
  {
    indicador_nombre: 'Cobertura PCV13 - Nacional',
    valor: 60.0,
    unidad: '%',
    periodo: 2020,
    region: 'Argentina',
    desglose: {
      vacuna: 'PCV13',
      dosis: 'refuerzo - 12 meses',
      dimension: 'vacunacion',
      fuente: 'SAP 2022',
      nota: 'Pandemia',
    },
  },
  {
    indicador_nombre: 'Cobertura PCV13 - Nacional',
    valor: 68.0,
    unidad: '%',
    periodo: 2021,
    region: 'Argentina',
    desglose: {
      vacuna: 'PCV13',
      dosis: 'refuerzo - 12 meses',
      dimension: 'vacunacion',
      fuente: 'SAP 2022',
      nota: 'Solo región Cuyo alcanzó coberturas pre-pandémicas',
    },
  },
  {
    indicador_nombre: 'Cobertura PCV13 - Nacional',
    valor: 72.0,
    unidad: '%',
    periodo: 2022,
    region: 'Argentina',
    desglose: {
      vacuna: 'PCV13',
      dosis: 'refuerzo - 12 meses',
      dimension: 'vacunacion',
      fuente: 'III Informe 2022',
    },
  },

  // ── DPT4 por quintil (Córdoba vs nacional) ──
  // Fuente: SAP CONARPE 2023
  {
    indicador_nombre: 'Cobertura DPT4 - Quintil 1 (mayor pobreza)',
    valor: 72.0,
    unidad: '%',
    periodo: 2021,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT4',
      dosis: 'refuerzo 2do año',
      dimension: 'vacunacion',
      quintil: 'Q1',
      fuente: 'SAP 2022',
      nota: 'Q1: Formosa, Salta, Chaco, Sgo. del Estero, Corrientes',
    },
  },
  {
    indicador_nombre: 'Cobertura DPT4 - Quintil 1 (mayor pobreza)',
    valor: 66.1,
    unidad: '%',
    periodo: 2023,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT4',
      dosis: 'refuerzo 2do año',
      dimension: 'vacunacion',
      quintil: 'Q1',
      fuente: 'SAP CONARPE 2023',
    },
  },
  {
    indicador_nombre: 'Cobertura DPT4 - Quintil 5 (menor pobreza)',
    valor: 58.0,
    unidad: '%',
    periodo: 2021,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT4',
      dosis: 'refuerzo 2do año',
      dimension: 'vacunacion',
      quintil: 'Q5',
      fuente: 'SAP 2022',
      nota: 'Q5: Santa Cruz, Santa Fe, Córdoba, CABA, La Pampa — MENOR cobertura que Q1',
    },
  },
  {
    indicador_nombre: 'Cobertura DPT4 - Quintil 5 (menor pobreza)',
    valor: 88.0,
    unidad: '%',
    periodo: 2023,
    region: 'Argentina',
    desglose: {
      vacuna: 'DPT4',
      dosis: 'refuerzo 2do año',
      dimension: 'vacunacion',
      quintil: 'Q5',
      fuente: 'SAP CONARPE 2023',
      nota: 'Recuperación significativa en Q5',
    },
  },

  // ── Esquemas incompletos ──
  // Fuente: SAP CONARPE 2023
  {
    indicador_nombre: 'Esquemas incompletos <1 año',
    valor: 116000,
    unidad: 'niños',
    periodo: 2023,
    region: 'Argentina',
    desglose: {
      dimension: 'vacunacion',
      fuente: 'SAP CONARPE 2023',
      nota: '100.000-116.000 con esquema incompleto contra coqueluche, Hib, difteria, tétanos, hepatitis B y poliomielitis',
    },
  },
  {
    indicador_nombre: 'Sin DPT4 refuerzo',
    valor: 136000,
    unidad: 'niños',
    periodo: 2023,
    region: 'Argentina',
    desglose: {
      dimension: 'vacunacion',
      fuente: 'SAP CONARPE 2023',
      nota: '2-3 de cada 10 infantes de 15-18 meses tienen esquemas incompletos',
    },
  },
  {
    indicador_nombre: 'Sin SRP1 y Hepatitis A',
    valor: 75000,
    unidad: 'niños',
    periodo: 2023,
    region: 'Argentina',
    desglose: { dimension: 'vacunacion', fuente: 'SAP CONARPE 2023' },
  },
  {
    indicador_nombre: 'Sin refuerzo PCV13',
    valor: 118000,
    unidad: 'niños',
    periodo: 2023,
    region: 'Argentina',
    desglose: { dimension: 'vacunacion', fuente: 'SAP CONARPE 2023' },
  },

  // ── DPT4 por jurisdicción (Córdoba) ──
  // Fuente: SAP 2022 — tabla por jurisdicción
  {
    indicador_nombre: 'Cobertura DPT4 - Córdoba',
    valor: 84.5,
    unidad: '%',
    periodo: 2021,
    region: 'Córdoba',
    desglose: {
      vacuna: 'DPT4',
      dosis: 'refuerzo 2do año',
      dimension: 'vacunacion',
      fuente: 'SAP 2022',
    },
  },
  {
    indicador_nombre: 'Cobertura SRP2 - Córdoba',
    valor: 84.5,
    unidad: '%',
    periodo: 2021,
    region: 'Córdoba',
    desglose: {
      vacuna: 'SRP',
      dosis: '2da dosis - ingreso escolar',
      dimension: 'vacunacion',
      fuente: 'SAP 2022',
    },
  },
  {
    indicador_nombre: 'Cobertura DPT escolar - Córdoba',
    valor: 85.4,
    unidad: '%',
    periodo: 2021,
    region: 'Córdoba',
    desglose: {
      vacuna: 'DPT',
      dosis: 'ingreso escolar',
      dimension: 'vacunacion',
      fuente: 'SAP 2022',
    },
  },
];

// ─── Main ───────────────────────────────────────────────────────

async function main() {
  console.log(`\n💉 Loading ${VACCINATION_DATA.length} vaccination records...\n`);

  // Delete existing vaccination data to avoid duplicates
  const { error: delError } = await supabase
    .from('indicadores')
    .delete()
    .eq('categoria', 'salud')
    .ilike('indicador_nombre', '%cobertura%');

  if (delError) {
    console.error('Error deleting existing data:', delError.message);
  } else {
    console.log('✅ Deleted existing vaccination records');
  }

  // Insert new data
  const rows = VACCINATION_DATA.map(d => ({
    ...d,
    categoria: 'salud',
    activo: true,
  }));

  const { data, error } = await supabase.from('indicadores').insert(rows).select();

  if (error) {
    console.error('❌ Error inserting:', error.message);
    console.error('Details:', error.details);
    process.exit(1);
  }

  console.log(`✅ Inserted ${data.length} vaccination records\n`);

  // Summary
  const byVaccine = {};
  for (const row of data) {
    const v = row.desglose?.vacuna || 'Otra';
    if (!byVaccine[v]) byVaccine[v] = [];
    byVaccine[v].push(row.periodo);
  }

  console.log('📊 Summary by vaccine:');
  for (const [vaccine, years] of Object.entries(byVaccine)) {
    console.log(
      `   ${vaccine}: ${years.length} records (${Math.min(...years)}-${Math.max(...years)})`
    );
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
