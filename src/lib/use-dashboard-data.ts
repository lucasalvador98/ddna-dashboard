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

interface DashboardData {
  pobreza: Indicador[];
  salud: Indicador[];
  educacion: Indicador[];
  inversion: Indicador[];
  demografia: Indicador[];
  seguridad: Indicador[];
}

const PLACEHOLDER_DASHBOARD_DATA: DashboardData = {
  pobreza: [
    {
      id: 'p1',
      indicador_nombre: 'Pobreza infantil',
      categoria: 'pobreza',
      valor: 39.2,
      unidad: '%',
      periodo: '2024-2',
      region: 'Córdoba',
      desglose: {},
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
      indicador_nombre: 'Escolarización secundaria',
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
  demografia: [],
  seguridad: [],
};

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
        const { data: indicadores, error } = await supabase
          .from('indicadores')
          .select('id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose')
          .limit(200);

        if (error || !indicadores || indicadores.length === 0) {
          setData(PLACEHOLDER_DASHBOARD_DATA);
          setSource('placeholder');
          setLoading(false);
          return;
        }

        // Group by category
        const grouped: DashboardData = {
          pobreza: [],
          salud: [],
          educacion: [],
          inversion: [],
          demografia: [],
          seguridad: [],
        };

        for (const ind of indicadores) {
          const cat = (ind.categoria || 'pobreza') as keyof DashboardData;
          if (grouped[cat]) {
            grouped[cat].push(ind as Indicador);
          }
        }

        setData(grouped);
        setSource('supabase');
      } catch (err) {
        console.error('Error fetching data:', err);
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

export function getLatestValue(indicadores: Indicador[], nombreBuscar?: string): Indicador | null {
  if (!indicadores || indicadores.length === 0) return null;

  if (nombreBuscar) {
    const encontrado = indicadores.find(i =>
      i.indicador_nombre.toLowerCase().includes(nombreBuscar.toLowerCase())
    );
    return encontrado || indicadores[0];
  }

  return indicadores[0];
}

export function getTimeSeries(
  indicadores: Indicador[],
  _nombreBuscar?: string
): { periodo: string; valor: number }[] {
  return indicadores
    .map(ind => ({
      periodo: ind.periodo,
      valor: Number(ind.valor) || 0,
    }))
    .reverse();
}

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

export function useKPIs() {
  const [data, setData] = useState<KpiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'supabase' | 'placeholder'>('placeholder');

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      setLoading(false);
      return;
    }

    async function fetchKPIs() {
      try {
        const { data: indicadores } = await supabase
          .from('indicadores')
          .select('id, indicador_nombre, categoria, valor, unidad, periodo')
          .limit(4);

        if (indicadores && indicadores.length > 0) {
          const kpis: KpiData[] = indicadores.map((ind, idx) => ({
            id: ind.id,
            categoria: ind.categoria as CategoriaIndicador,
            nombre: ind.indicador_nombre,
            valor: ind.valor ? `${ind.valor}${ind.unidad || ''}` : '—',
            subtitulo: ind.periodo || '',
            cambio: idx > 0 ? '+5.2%' : undefined,
            cambioTipo: idx > 0 ? 'up' : 'neutral',
            unidad: ind.unidad,
          }));
          setData(kpis);
          setSource('supabase');
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchKPIs();
  }, []);

  return { data, loading, source };
}
