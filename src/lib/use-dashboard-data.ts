'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { CategoriaIndicador } from '@/lib/supabase';

export interface Indicador {
  id: string;
  indicador_nombre: string;
  categoria: string;
  valor: number;
  unidad: string;
  periodo: string;
  region: string;
  desglose: Record<string, unknown>;
  fuente?: string;
  ultima_actualizacion?: string;
}

export interface KpiData {
  id: string;
  categoria: CategoriaIndicador;
  nombre: string;
  valor: string;
  subtitulo: string;
  cambio?: string;
  cambioTipo?: 'up' | 'down' | 'neutral';
  unidad?: string;
}

export interface DashboardData {
  pobreza: Indicador[];
  salud: Indicador[];
  educacion: Indicador[];
  inversion: Indicador[];
  demografia: Indicador[];
  seguridad: Indicador[];
}

// ———————————————————————————————————————————————
// Child-relevant categories for inversion filtering
// ———————————————————————————————————————————————
const CHILD_RELEVANT_CATEGORIES: string[] = [
  'Educación básica (inicial, elemental y media)',
  'Comedores escolares y copa de leche',
  'Niños en riesgo',
  'Transporte escolar',
  'Materno-infantil',
  'Transferencias de ingresos a las familias',
  'Calidad educativa, gestión curricular y capacitaci',
  'Trabajo infantil',
  'Atención ambulatoria e internación',
  'Prevención de enfermedades y riesgos específicos',
  'Deporte y recreación',
  'Atención de grupos vulnerables',
  'Violencia familiar',
];

// ———————————————————————————————————————————————
// Desglose parsing (handles double-encoded JSONB)
// ———————————————————————————————————————————————
function parseDesglose(raw: unknown): Record<string, unknown> {
  if (!raw) return {};

  // Already a plain object — Supabase client may have parsed outer JSONB
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try {
          result[key] = JSON.parse(value);
        } catch {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  // Still a string — inner JSON from double-encoded column
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // Not valid JSON, return empty
    }
  }

  return {};
}

function normalizeIndicador(ind: Record<string, unknown>): Indicador {
  return {
    id: String(ind.id),
    indicador_nombre: String(ind.indicador_nombre || ''),
    categoria: String(ind.categoria || ''),
    valor: Number(ind.valor) || 0,
    unidad: String(ind.unidad || ''),
    periodo: String(ind.periodo || ''),
    region: String(ind.region || ''),
    desglose: parseDesglose(ind.desglose),
  };
}

// ———————————————————————————————————————————————
// Placeholder data (fallback when Supabase is off)
// ———————————————————————————————————————————————
const PLACEHOLDER_DASHBOARD_DATA: DashboardData = {
  pobreza: [
    {
      id: 'p1',
      indicador_nombre: 'Pobreza infantil',
      categoria: 'pobreza',
      valor: 39.2,
      unidad: '%',
      periodo: '2024-S2',
      region: 'Córdoba',
      desglose: { grupo_edad: '0-17' },
    },
  ],
  salud: [
    {
      id: 's1',
      indicador_nombre: 'Mortalidad infantil',
      categoria: 'salud',
      valor: 8.5,
      unidad: '‰',
      periodo: '2022',
      region: 'Córdoba',
      desglose: {},
    },
  ],
  educacion: [
    {
      id: 'e1',
      indicador_nombre: 'Tasa de asistencia educativa',
      categoria: 'educacion',
      valor: 89.2,
      unidad: '%',
      periodo: '2022',
      region: 'Córdoba',
      desglose: {},
    },
  ],
  inversion: [
    {
      id: 'i1',
      indicador_nombre: 'Inversión social infancia',
      categoria: 'inversion',
      valor: 45.2,
      unidad: 'Md',
      periodo: '2024',
      region: 'Córdoba',
      desglose: {},
    },
  ],
  demografia: [
    {
      id: 'd1',
      indicador_nombre: 'Poblacion por edad',
      categoria: 'demografia',
      valor: 903524,
      unidad: 'hab',
      periodo: '2022',
      region: 'Córdoba',
      desglose: { grupo_edad: '0-17' },
    },
  ],
  seguridad: [],
};

// ———————————————————————————————————————————————
// Main data-fetching hook
// ———————————————————————————————————————————————
export function useDashboardData(): {
  data: DashboardData | null;
  loading: boolean;
  source: 'supabase' | 'placeholder';
} {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'supabase' | 'placeholder'>('placeholder');

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      setData(PLACEHOLDER_DASHBOARD_DATA);
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const categories: Array<keyof DashboardData> = [
          'pobreza',
          'salud',
          'educacion',
          'inversion',
          'demografia',
          'seguridad',
        ];

        // Fetch each category independently with per-category limits
        const results = await Promise.all(
          categories.map(cat =>
            supabase
              .from('indicadores')
              .select('id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose')
              .eq('categoria', cat)
              .order('periodo', { ascending: false })
              .limit(cat === 'inversion' ? 3000 : 500)
          )
        );

        const grouped: DashboardData = {
          pobreza: [],
          salud: [],
          educacion: [],
          inversion: [],
          demografia: [],
          seguridad: [],
        };

        categories.forEach((cat, idx) => {
          const res = results[idx];
          if (res.data && !res.error) {
            grouped[cat] = res.data.map(normalizeIndicador);
          }
        });

        const hasAnyData = categories.some(cat => grouped[cat].length > 0);

        if (hasAnyData) {
          setData(grouped);
          setSource('supabase');
        } else {
          setData(PLACEHOLDER_DASHBOARD_DATA);
          setSource('placeholder');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setData(PLACEHOLDER_DASHBOARD_DATA);
        setSource('placeholder');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, source };
}

// ———————————————————————————————————————————————
// Utility functions (fixed implementations)
// ———————————————————————————————————————————————

/**
 * Get the most recent indicator, optionally filtered by name.
 * BUG FIX: now sorts by periodo DESC before picking.
 */
export function getLatestValue(indicadores: Indicador[], nombreBuscar?: string): Indicador | null {
  if (!indicadores || indicadores.length === 0) return null;

  // Sort by periodo descending so the most recent comes first.
  // Handles formats: "2024-S2", "2024", "2022", etc.
  const sorted = [...indicadores].sort((a, b) => b.periodo.localeCompare(a.periodo));

  if (nombreBuscar) {
    const lowerSearch = nombreBuscar.toLowerCase();
    const encontrado = sorted.find(i => i.indicador_nombre.toLowerCase().includes(lowerSearch));
    return encontrado || sorted[0];
  }

  return sorted[0];
}

/**
 * Get a time series for an indicator, optionally filtered by name.
 * BUG FIX: the nombreBuscar parameter is now actually used.
 */
export function getTimeSeries(
  indicadores: Indicador[],
  nombreBuscar?: string
): { periodo: string; valor: number }[] {
  let filtered = indicadores;

  if (nombreBuscar) {
    const lowerSearch = nombreBuscar.toLowerCase();
    filtered = indicadores.filter(i => i.indicador_nombre.toLowerCase().includes(lowerSearch));
  }

  // Sort by periodo ascending for time-series display
  return filtered
    .sort((a, b) => a.periodo.localeCompare(b.periodo))
    .map(ind => ({
      periodo: ind.periodo,
      valor: Number(ind.valor) || 0,
    }));
}

/**
 * Calculate period-over-period percentage change for a time series.
 */
export function calculateChange(
  series: { periodo: string; valor: number }[]
): { periodo: string; cambio: number | null }[] {
  const changes: { periodo: string; cambio: number | null }[] = [];

  for (let i = 1; i < series.length; i++) {
    const current = series[i].valor;
    const previous = series[i - 1].valor;
    const cambio = previous ? ((current - previous) / previous) * 100 : null;
    changes.push({ periodo: series[i].periodo, cambio });
  }

  return changes;
}

// ———————————————————————————————————————————————
// Domain getters for the main page
// ———————————————————————————————————————————————

/**
 * Sum child-relevant inversion for the latest available period.
 * BUG FIX: previously did a blind sum of ALL inversion rows.
 */
export function getInversionTotal(inversionData: Indicador[]): number {
  if (!inversionData || inversionData.length === 0) return 0;

  // Find the latest period in the dataset
  const latestPeriod = [...inversionData].sort((a, b) => b.periodo.localeCompare(a.periodo))[0]
    ?.periodo;

  if (!latestPeriod) return 0;

  return inversionData
    .filter(ind => {
      if (ind.periodo !== latestPeriod) return false;
      const cat = String(ind.desglose?.categoria ?? '');
      const catLower = cat.toLowerCase();
      return CHILD_RELEVANT_CATEGORIES.some(rc => catLower.includes(rc.toLowerCase()));
    })
    .reduce((sum, ind) => sum + Number(ind.valor || 0), 0);
}

/**
 * Compute population aged 0-17 from demografia data.
 * BUG FIX: previously did a blind sum of ALL demografia rows.
 */
export function getPoblacion0a17(demografiaData: Indicador[]): number {
  if (!demografiaData || demografiaData.length === 0) return 0;

  // Filter "Poblacion por edad" indicators, sorted by period DESC
  const relevant = [...demografiaData]
    .filter(ind => ind.indicador_nombre.toLowerCase().includes('poblacion por edad'))
    .sort((a, b) => b.periodo.localeCompare(a.periodo));

  const latestPeriod = relevant[0]?.periodo;
  if (!latestPeriod) return 0;

  // Sum values for age groups 0-17 in the latest period
  return relevant
    .filter(ind => {
      if (ind.periodo !== latestPeriod) return false;
      const ageGroup = ind.desglose?.grupo_edad ?? ind.desglose?.edad ?? ind.desglose?.age ?? '';
      if (ageGroup === '') return false;
      const ageStr = String(ageGroup);

      // Handle "0-5", "6-11", "12-17", "0-17", "15-19", etc.
      const rangeMatch = ageStr.match(/^(\d+)\s*-\s*(\d+)$/);
      if (rangeMatch) {
        const upper = parseInt(rangeMatch[2], 10);
        return upper <= 17;
      }

      // Handle single age values
      const singleAge = parseInt(ageStr, 10);
      if (!isNaN(singleAge)) return singleAge <= 17;

      return false;
    })
    .reduce((sum, ind) => sum + Number(ind.valor || 0), 0);
}

/**
 * Looks up a single stat value from an indicator array by name keyword.
 * Returns null if not found.
 */
export function findStatValue(indicadores: Indicador[], nombreBuscar: string): number | null {
  const ind = getLatestValue(indicadores, nombreBuscar);
  return ind?.valor ?? null;
}

/**
 * Looks up an aggregated stat by name keyword, summing all rows
 * for the most recent period. Use for indicators like
 * "Unidades educativas - General" or "Matrícula - General"
 * that have multiple rows per period (e.g. by level/zone).
 * Returns null if not found.
 */
export function findStatSum(indicadores: Indicador[], nombreBuscar: string): number | null {
  if (!indicadores || indicadores.length === 0) return null;

  const lowerSearch = nombreBuscar.toLowerCase();
  const matched = indicadores.filter(i => i.indicador_nombre.toLowerCase().includes(lowerSearch));

  if (matched.length === 0) return null;

  // Find the most recent period among matches
  const sorted = [...matched].sort((a, b) => b.periodo.localeCompare(a.periodo));
  const latestPeriod = sorted[0].periodo;

  // Sum all values for the most recent period
  const total = matched
    .filter(i => i.periodo === latestPeriod)
    .reduce((sum, i) => sum + Number(i.valor || 0), 0);

  return total;
}

// ———————————————————————————————————————————————
// useKPIs: focused KPI fetching for the summary bar
// ———————————————————————————————————————————————
export function useKPIs() {
  const [data, setData] = useState<KpiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'supabase' | 'placeholder'>('placeholder');

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      setData([
        {
          id: 'kpi-placeholder',
          categoria: 'pobreza',
          nombre: 'Pobreza infantil',
          valor: '39.2%',
          subtitulo: '2024-S2 · Córdoba',
          cambio: '+1.2%',
          cambioTipo: 'up',
          unidad: '%',
        },
      ]);
      setLoading(false);
      return;
    }

    async function fetchKPIs() {
      try {
        // Fetch a handful of the most recent indicators across key categories
        const queries = await Promise.all([
          supabase
            .from('indicadores')
            .select('id, indicador_nombre, categoria, valor, unidad, periodo')
            .eq('categoria', 'pobreza')
            .order('periodo', { ascending: false })
            .limit(1),
          supabase
            .from('indicadores')
            .select('id, indicador_nombre, categoria, valor, unidad, periodo')
            .eq('categoria', 'salud')
            .order('periodo', { ascending: false })
            .limit(1),
          supabase
            .from('indicadores')
            .select('id, indicador_nombre, categoria, valor, unidad, periodo')
            .eq('categoria', 'educacion')
            .order('periodo', { ascending: false })
            .limit(1),
          supabase
            .from('indicadores')
            .select('id, indicador_nombre, categoria, valor, unidad, periodo')
            .eq('categoria', 'inversion')
            .order('periodo', { ascending: false })
            .limit(1),
        ]);

        const kpis: KpiData[] = [];
        for (const res of queries) {
          if (res.data && res.data.length > 0) {
            const ind = res.data[0];
            kpis.push({
              id: ind.id,
              categoria: ind.categoria as CategoriaIndicador,
              nombre: ind.indicador_nombre,
              valor: ind.valor != null ? `${ind.valor}${ind.unidad || ''}` : '—',
              subtitulo: `${ind.periodo || ''}`,
              cambio: undefined,
              cambioTipo: 'neutral',
              unidad: ind.unidad ?? undefined,
            });
          }
        }

        if (kpis.length > 0) {
          setData(kpis);
          setSource('supabase');
        }
      } catch (err) {
        console.error('Error fetching KPIs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchKPIs();
  }, []);

  return { data, loading, source };
}
