"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { CategoriaIndicador } from "@/lib/supabase";
import { placeholderChartData, type CategoryChartData } from "@/lib/chart-data";

interface UseChartDataResult {
  data: CategoryChartData | null;
  loading: boolean;
  error: string | null;
  source: "supabase" | "placeholder";
}

/**
 * Hook que carga datos de gráficos desde Supabase por categoría.
 * Transforma los datos de indicadores + datos_indicadores al formato que Recharts espera.
 * Si Supabase no está disponible, usa los datos placeholder de chart-data.ts.
 */
export function useChartData(categoria: CategoriaIndicador): UseChartDataResult {
  const [data, setData] = useState<CategoryChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"supabase" | "placeholder">("placeholder");

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      setData(placeholderChartData[categoria] ?? null);
      setLoading(false);
      setSource("placeholder");
      return;
    }

    async function fetchChartData() {
      try {
        // 1. Fetch all active indicators for this category
        const { data: indicadores, error: indicadoresError } = await supabase
          .from("indicadores")
          .select("id, nombre, unidad")
          .eq("categoria", categoria)
          .eq("activo", true)
          .order("orden", { ascending: true });

        if (indicadoresError) {
          setError(indicadoresError.message);
          setData(placeholderChartData[categoria] ?? null);
          setSource("placeholder");
          return;
        }

        if (!indicadores || indicadores.length === 0) {
          setData(placeholderChartData[categoria] ?? null);
          setSource("placeholder");
          return;
        }

        // 2. Fetch all data points for these indicators
        const indicadorIds = indicadores.map((ind: { id: string }) => ind.id);

        const { data: datos, error: datosError } = await supabase
          .from("datos_indicadores")
          .select("indicador_id, valor, periodo, region, desglose")
          .in("indicador_id", indicadorIds)
          .order("periodo", { ascending: true });

        if (datosError) {
          setError(datosError.message);
          setData(placeholderChartData[categoria] ?? null);
          setSource("placeholder");
          return;
        }

        if (!datos || datos.length === 0) {
          setData(placeholderChartData[categoria] ?? null);
          setSource("placeholder");
          return;
        }

        // 3. Transform data into chart-friendly format
        const charts = transformToChartData(categoria, indicadores, datos as Array<{
          indicador_id: string;
          valor: number;
          periodo: string;
          region: string;
          desglose: Record<string, string> | null;
        }>);

        if (Object.keys(charts).length === 0) {
          setData(placeholderChartData[categoria] ?? null);
          setSource("placeholder");
          return;
        }

        setData({ charts });
        setSource("supabase");
      } catch {
        setError("Error connecting to Supabase");
        setData(placeholderChartData[categoria] ?? null);
        setSource("placeholder");
      } finally {
        setLoading(false);
      }
    }

    fetchChartData();
  }, [categoria]);

  return { data, loading, error, source };
}

/**
 * Transform Supabase data into chart data keyed by chart name.
 * Determines the chart type based on the data structure:
 * - Single region time series → [{year, valor}]
 * - Multi-region time series → pivot by region [{year, cordoba, argentina}]
 * - Desglose data → pivot by desglose fields
 * - Categorical (single period) → [{name, value}]
 */
function transformToChartData(
  categoria: string,
  indicadores: Array<{ id: string; nombre: string; unidad: string }>,
  datos: Array<{
    indicador_id: string;
    valor: number;
    periodo: string;
    region: string;
    desglose: Record<string, string> | null;
  }>
): Record<string, Array<Record<string, string | number>>> {
  const charts: Record<string, Array<Record<string, string | number>>> = {};

  // Group data by indicator
  const dataByIndicador = new Map<string, Array<{
    valor: number;
    periodo: string;
    region: string;
    desglose: Record<string, string> | null;
  }>>();

  for (const dato of datos) {
    if (!dataByIndicador.has(dato.indicador_id)) {
      dataByIndicador.set(dato.indicador_id, []);
    }
    dataByIndicador.get(dato.indicador_id)!.push({
      valor: dato.valor,
      periodo: dato.periodo,
      region: dato.region,
      desglose: dato.desglose,
    });
  }

  // Map indicadores to chart keys based on category
  const chartKeyMap = getChartKeyMap(categoria, indicadores);

  // Group all indicator IDs by their chart key (multiple indicators may share a key)
  const chartKeyGroups = new Map<string, string[]>();
  for (const [indicadorId, chartKey] of chartKeyMap) {
    if (!chartKeyGroups.has(chartKey)) {
      chartKeyGroups.set(chartKey, []);
    }
    chartKeyGroups.get(chartKey)!.push(indicadorId);
  }

  for (const [chartKey, indicadorIds] of chartKeyGroups) {
    // Collect ALL data for all indicators in this chart group
    const allData = indicadorIds
      .flatMap((id) => dataByIndicador.get(id) ?? [])
      .sort((a, b) => a.periodo.localeCompare(b.periodo));

    if (allData.length === 0) continue;

    const hasDesglose = allData.some((d) => d.desglose && Object.keys(d.desglose).length > 0);
    const regions = [...new Set(allData.map((d) => d.region))];

    if (hasDesglose && chartKey === "vacunal") {
      // Categorical: vaccine coverage {vaccine, cobertura}
      charts[chartKey] = allData
        .filter((d) => d.desglose && "vacuna" in d.desglose)
        .map((d) => ({
          vaccine: d.desglose!.vacuna,
          cobertura: Number(d.valor),
        }));
    } else if (hasDesglose && chartKey === "aprender") {
      // Stacked bar: Aprender results by area
      const areaData = new Map<string, Record<string, number>>();
      for (const d of allData) {
        if (!d.desglose) continue;
        const area = d.desglose.area || "Sin área";
        const nivel = d.desglose.nivel || "desconocido";
        if (!areaData.has(area)) {
          areaData.set(area, {});
        }
        areaData.get(area)![nivel] = Number(d.valor);
      }
      charts[chartKey] = Array.from(areaData.entries()).map(([area, niveles]) => ({
        area,
        ...niveles,
      }));
    } else if (hasDesglose && chartKey === "tipo") {
      // Pie chart data: {name, value, color}
      const tipoColors: Record<string, string> = {
        "Violencia familiar": "#3777FF",
        "Negligencia": "#F3A712",
        "Abuso sexual": "#BF1363",
        "Maltrato infantil": "#E07A5F",
        "Otros": "#A7DBF9",
      };
      charts[chartKey] = allData
        .filter((d) => d.desglose && "tipo" in d.desglose)
        .map((d) => ({
          name: d.desglose!.tipo,
          value: Number(d.valor),
          color: tipoColors[d.desglose!.tipo] || "#999999",
        }));
    } else if (indicadorIds.length > 1 && chartKey === "pobreza") {
      // Multi-indicator merge: combine poverty + indigence into one chart
      // Each indicator gets its own data key based on indicator name
      const periods = [...new Set(allData.map((d) => d.periodo))].sort();
      const pivoted = periods.map((periodo) => {
        const point: Record<string, string | number> = { year: periodo };
        for (const indicadorId of indicadorIds) {
          const indNombre = indicadores.find((i) => i.id === indicadorId)?.nombre ?? indicadorId;
          const indData = (dataByIndicador.get(indicadorId) ?? []).filter((d) => d.periodo === periodo);
          const indicador = indicadores.find((i) => i.id === indicadorId);
          // Use a short key for the chart data
          const key = indicador?.nombre?.toLowerCase().includes("indigencia") ? "indigencia" : "pobreza";
          for (const row of indData) {
            if (row.region === "Córdoba" || indData.length === 1) {
              point[key] = Number(row.valor);
            } else if (row.region !== "Córdoba") {
              // Skip non-Córdoba regions for merged chart (poverty line uses Córdoba data)
            }
          }
        }
        return point;
      });
      charts[chartKey] = pivoted;
    } else if (regions.length > 1) {
      // Multi-region time series: pivot by region
      const periods = [...new Set(allData.map((d) => d.periodo))].sort();
      const pivoted = periods.map((periodo) => {
        const point: Record<string, string | number> = { year: periodo };
        for (const row of allData.filter((d) => d.periodo === periodo)) {
          const regionKey = row.region.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
          point[regionKey] = Number(row.valor);
        }
        return point;
      });
      charts[chartKey] = pivoted;
    } else {
      // Simple time series: merge by periodo, using indicator name as key
      const periods = [...new Set(allData.map((d) => d.periodo))].sort();

      if (indicadorIds.length > 1) {
        // Multiple indicators merged by period
        const pivoted = periods.map((periodo) => {
          const point: Record<string, string | number> = { year: periodo };
          for (const indicadorId of indicadorIds) {
            const indicador = indicadores.find((i) => i.id === indicadorId);
            const indData = (dataByIndicador.get(indicadorId) ?? []).filter((d) => d.periodo === periodo);
            for (const row of indData) {
              if (row.desglose && Object.keys(row.desglose).length > 0) {
                const key = Object.values(row.desglose)[0];
                point[key] = Number(row.valor);
              } else {
                // Use indicator-specific key from the chartKeyMap
                const key = indicador?.nombre?.toLowerCase().includes("presupuesto") ? "porcentaje" : "valor";
                point[key] = Number(row.valor);
              }
            }
          }
          return point;
        });
        charts[chartKey] = pivoted;
      } else {
        // Single indicator
        const pivoted = periods.map((periodo) => {
          const point: Record<string, string | number> = { year: periodo };
          const periodData = allData.filter((d) => d.periodo === periodo);

          if (periodData.length === 1) {
            point.valor = Number(periodData[0].valor);
          } else {
            for (const row of periodData) {
              if (row.desglose && Object.keys(row.desglose).length > 0) {
                const key = Object.values(row.desglose)[0];
                point[key] = Number(row.valor);
              } else {
                point.valor = Number(row.valor);
              }
            }
          }
          return point;
        });
        charts[chartKey] = pivoted;
      }
    }
  }

  return charts;
}

/**
 * Maps indicator IDs to chart keys for each category.
 * This determines which chart each indicator's data appears in.
 */
function getChartKeyMap(
  categoria: string,
  indicadores: Array<{ id: string; nombre: string; unidad: string }>
): Map<string, string> {
  const map = new Map<string, string>();

  for (const ind of indicadores) {
    switch (categoria) {
      case "salud":
        if (ind.nombre.toLowerCase().includes("mortalidad")) {
          map.set(ind.id, "mortalidad");
        } else if (ind.nombre.toLowerCase().includes("vacunal") || ind.nombre.toLowerCase().includes("cobertura")) {
          map.set(ind.id, "vacunal");
        }
        break;
      case "educacion":
        if (ind.nombre.toLowerCase().includes("escolarizaci")) {
          map.set(ind.id, "escolarizacion");
        } else if (ind.nombre.toLowerCase().includes("aprender") || ind.nombre.toLowerCase().includes("resultado")) {
          map.set(ind.id, "aprender");
        } else if (ind.nombre.toLowerCase().includes("abandono")) {
          map.set(ind.id, "abandono");
        }
        break;
      case "pobreza":
        if (ind.nombre.toLowerCase().includes("pobreza") && !ind.nombre.toLowerCase().includes("indigencia")) {
          map.set(ind.id, "pobreza");
        } else if (ind.nombre.toLowerCase().includes("indigencia")) {
          // Indigencia is part of the pobreza chart (second line)
          map.set(ind.id, "pobreza");
        }
        break;
      case "seguridad":
        if (ind.nombre.toLowerCase().includes("denuncia")) {
          map.set(ind.id, "denuncias");
        }
        break;
      case "inversion":
        if (ind.nombre.toLowerCase().includes("presupuesto") || ind.nombre.toLowerCase().includes("porcentaje")) {
          map.set(ind.id, "presupuesto");
        } else if (ind.nombre.toLowerCase().includes("inversi")) {
          map.set(ind.id, "inversion");
        }
        break;
    }
  }

  return map;
}