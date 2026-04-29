"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

// Tipos basados en el esquema real de Supabase
export interface Indicador {
  id: string;
  indicador_nombre: string;
  categoria: string;
  valor: number;
  unidad: string;
  periodo: number;
  region: string;
  desglose: Record<string, any> | null;
  fuente: string | null;
  ultima_actualizacion: string | null;
  activo?: boolean | null;
}

export interface DashboardData {
  pobreza: Indicador[];
  educacion: Indicador[];
  salud: Indicador[];
  inversion: Indicador[];
  demografia: Indicador[];
  seguridad: Indicador[];
  deis: Indicador[];
  aprender: Indicador[];
  justicia: Indicador[];
  salud_adolescente: Indicador[];
  anuario_educacion: Indicador[];
}

interface UseDashboardDataResult {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  source: "supabase" | "placeholder";
}

/**
 * Hook principal para cargar todos los datos del dashboard
 * Agrupa por categoría para facilitar el acceso
 */
export function useDashboardData(): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"supabase" | "placeholder">("placeholder");

  useEffect(() => {
    async function fetchAllData() {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      if (!supabaseUrl) {
        setLoading(false);
        return;
      }

      try {
        const categorias = [
          'pobreza', 'educacion', 'salud', 'inversion', 
          'demografia', 'seguridad', 'deis', 'aprender', 
          'justicia', 'salud_adolescente', 'anuario_educacion', 'consumo'
        ];

        const allData: Record<string, Indicador[]> = {};

        for (const cat of categorias) {
          const { data: indicadores, error: err } = await supabase
            .from("indicadores")
            .select("id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, ultima_actualizacion")
            .eq("categoria", cat)
            .order("periodo", { ascending: false });

          if (err) {
            console.error(`Error fetching ${cat}:`, err.message);
            allData[cat] = [];
          } else {
            allData[cat] = indicadores || [];
          }
        }

        setData(allData as unknown as DashboardData);
        setSource("supabase");
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  return { data, loading, error, source };
}

// ============== HELPERS PARA VISUALIZACIONES ==============

// Obtener el valor más reciente de una categoría
export function getLatestValue(data: Indicador[], indicadorNombre?: string): number | null {
  if (!data || data.length === 0) return null;
  
  let filtered = data;
  if (indicadorNombre) {
    filtered = data.filter(d => d.indicador_nombre === indicadorNombre);
  }
  
  // Ya viene ordenado por periodo descendente
  if (filtered.length > 0) {
    return Number(filtered[0].valor);
  }
  return null;
}

// Obtener evolución temporal (ordenar ascendente)
export function getTimeSeries(data: Indicador[], indicadorNombre?: string): { periodo: number; valor: number }[] {
  if (!data || data.length === 0) return [];
  
  let filtered = data;
  if (indicadorNombre) {
    filtered = data.filter(d => d.indicador_nombre === indicadorNombre);
  }
  
  return filtered
    .map(d => ({ periodo: d.periodo, valor: Number(d.valor) || 0 }))
    .sort((a, b) => a.periodo - b.periodo);
}

// Obtener datos por región
export function getByRegion(data: Indicador[]): Record<string, number> {
  if (!data || data.length === 0) return {};
  
  const result: Record<string, number> = {};
  data.forEach(d => {
    if (d.region && d.region !== 'Córdoba') {
      result[d.region] = Number(d.valor) || 0;
    }
  });
  return result;
}

// Calcular cambio porcentual entre períodos consecutivos
export function calculateChange(data: { periodo: number; valor: number }[]): { periodo: number; cambio: number }[] {
  if (data.length < 2) return [];
  
  const sorted = [...data].sort((a, b) => a.periodo - b.periodo);
  const changes: { periodo: number; cambio: number }[] = [];
  
  for (let i = 1; i < sorted.length; i++) {
    const anterior = sorted[i - 1].valor;
    const actual = sorted[i].valor;
    const cambio = anterior !== 0 ? ((actual - anterior) / anterior) * 100 : 0;
    changes.push({
      periodo: sorted[i].periodo,
      cambio: Math.round(cambio * 10) / 10
    });
  }
  
  return changes;
}

// Obtener KPIs principales para el dashboard
export function useMainKPIs(data: DashboardData | null) {
  return useMemo(() => {
    if (!data) return null;

    return {
      pobreza: {
        nombre: "Pobreza infantil",
        valor: getLatestValue(data.pobreza, "Pobreza infantil"),
        unidad: "%",
        serie: getTimeSeries(data.pobreza, "Pobreza infantil")
      },
      indigencia: {
        nombre: "Indigencia infantil", 
        valor: getLatestValue(data.pobreza, "Indigencia infantil"),
        unidad: "%",
        serie: getTimeSeries(data.pobreza, "Indigencia infantil")
      },
      mortalidadInfantil: {
        nombre: "Mortalidad infantil",
        valor: getLatestValue(data.salud),
        unidad: "‰",
        serie: getTimeSeries(data.salud)
      },
      escolarizacion: {
        nombre: "Escolarización",
        valor: getLatestValue(data.educacion, "Tasa de asistencia educativa"),
        unidad: "%",
        serie: getTimeSeries(data.educacion, "Tasa de asistencia educativa")
      },
      inversionTotal: {
        nombre: "Inversión social",
        valor: data.inversion.reduce((sum, d) => sum + (Number(d.valor) || 0), 0),
        unidad: "$",
        serie: []
      },
      matricula: {
        nombre: "Matrícula educativa",
        valor: getLatestValue(data.anuario_educacion, "Matrícula Total"),
        unidad: "alumnos",
        serie: []
      }
    };
  }, [data]);
}