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
  metadata?: {
    fuente: string;
    ultimaActualizacion: string | null;
  };
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
  const [metadata, setMetadata] = useState<{ fuente: string; ultimaActualizacion: string | null } | undefined>();

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
        // Schema actual: indicador_nombre, valor, periodo, region, desglose están en la misma fila
        // NO existe tabla separada datos_indicadores
        const { data: indicadores, error: indicadoresError } = await supabase
          .from("indicadores")
          .select("id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, ultima_actualizacion")
          .eq("categoria", categoria)
          .order("periodo", { ascending: false });

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

        // Extract metadata from indicators (fuente and latest update date)
        const fuentes = [...new Set(indicadores.map((i: any) => i.fuente).filter(Boolean))];
        const ultimaFecha = indicadores.reduce((latest: Date, ind: any) => {
          if (!ind.ultima_actualizacion) return latest;
          const fecha = new Date(ind.ultima_actualizacion);
          return fecha > latest ? fecha : latest;
        }, new Date(0));
        
        setMetadata({
          fuente: fuentes.length === 1 ? fuentes[0] : fuentes.join(", "),
          ultimaActualizacion: ultimaFecha.getTime() > 0 ? ultimaFecha.toISOString() : null,
        });

        // Los datos ya están en la misma fila - transformarlos directamente
        // Agrupar por indicador_nombre
        const indicadoresMap = new Map<string, Array<{
          id: string;
          indicador_nombre: string;
          valor: number;
          unidad: string;
          periodo: string;
          region: string;
          desglose: Record<string, unknown> | null;
        }>>();

        for (const ind of indicadores) {
          const key = ind.indicador_nombre;
          if (!indicadoresMap.has(key)) {
            indicadoresMap.set(key, []);
          }
          indicadoresMap.get(key)!.push({
            id: ind.id,
            indicador_nombre: ind.indicador_nombre,
            valor: Number(ind.valor) || 0,
            unidad: ind.unidad || "casos",
            periodo: ind.periodo || "",
            region: ind.region || "Córdoba",
            desglose: ind.desglose || null,
          });
        }

        // Transform to chart data format
        const charts = transformIndicadoresToCharts(categoria, indicadoresMap);

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

  return { data, loading, error, source, metadata };
}

/**
 * Transforma los datos de indicadores (donde cada fila tiene valor, periodo, region, desglose)
 * al formato que Recharts espera.
 */
function transformIndicadoresToCharts(
  categoria: string,
  indicadoresMap: Map<string, Array<{
    id: string;
    indicador_nombre: string;
    valor: number;
    unidad: string;
    periodo: string;
    region: string;
    desglose: Record<string, unknown> | null;
  }>>
): Record<string, Array<Record<string, string | number>>> {
  const charts: Record<string, Array<Record<string, string | number>>> = {};

  // Map indicator names to chart keys
  const chartKeyMap = getChartKeyMapFromIndicadores(categoria, indicadoresMap);

  // Group indicators by chart key
  const chartKeyGroups = new Map<string, string[]>();
  for (const [indicadorNombre, chartKey] of chartKeyMap) {
    if (!chartKeyGroups.has(chartKey)) {
      chartKeyGroups.set(chartKey, []);
    }
    chartKeyGroups.get(chartKey)!.push(indicadorNombre);
  }

  for (const [chartKey, indicadorNombres] of chartKeyGroups) {
    // Collect ALL data for all indicators in this chart group
    const allData = indicadorNombres
      .flatMap((nombre) => indicadoresMap.get(nombre) ?? [])
      .sort((a, b) => (a.periodo || "").localeCompare(b.periodo || ""));

    if (allData.length === 0) continue;

    // Determine chart type based on data characteristics
    const hasDesglose = allData.some((d) => d.desglose && Object.keys(d.desglose).length > 0);
    const regions = [...new Set(allData.map((d) => d.region).filter(Boolean))];
    const periods = [...new Set(allData.map((d) => d.periodo).filter(Boolean))].sort();

    // Generate chart data based on structure
    if (chartKey === "mortalidad" && regions.length > 1) {
      // Multi-region time series: Córdoba vs Argentina
      charts[chartKey] = periods.map((periodo) => {
        const point: Record<string, string | number> = { year: periodo };
        const periodData = allData.filter((d) => d.periodo === periodo);
        for (const row of periodData) {
          const regionKey = row.region.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
          point[regionKey] = Number(row.valor);
        }
        return point;
      });
    } else if (chartKey === "escolarizacion") {
      // Time series by education level (from desglose or separate indicators)
      charts[chartKey] = periods.map((periodo) => {
        const point: Record<string, string | number> = { year: periodo };
        for (const row of allData.filter((d) => d.periodo === periodo)) {
          if (row.desglose && "nivel" in row.desglose) {
            const nivel = String(row.desglose.nivel).toLowerCase();
            if (nivel.includes("inicial")) point.inicial = Number(row.valor);
            else if (nivel.includes("primar")) point.primario = Number(row.valor);
            else if (nivel.includes("secundar")) point.secundario = Number(row.valor);
          } else {
            point.valor = Number(row.valor);
          }
        }
        return point;
      });
    } else if (hasDesglose && chartKey === "aprender") {
      // Stacked bar: Aprender results by area
      const areaData = new Map<string, Record<string, number>>();
      for (const d of allData) {
        if (!d.desglose) continue;
        const area = String(d.desglose.area || d.desglose.nivel || "Sin área");
        const nivel = String(d.desglose.nivel || d.desglose.resultado || "desconocido").toLowerCase();
        if (!areaData.has(area)) {
          areaData.set(area, {});
        }
        // Map to standard levels
        if (nivel.includes("satisfactorio") || nivel.includes("alto")) {
          areaData.get(area)!.satisfactorio = Number(d.valor);
        } else if (nivel.includes("básico") || nivel.includes("medio")) {
          areaData.get(area)!.básico = Number(d.valor);
        } else {
          areaData.get(area)!.debajo = Number(d.valor);
        }
      }
      charts[chartKey] = Array.from(areaData.entries()).map(([area, niveles]) => ({
        area,
        ...niveles,
      }));
    } else if (chartKey === "pobreza" || chartKey === "indigencia") {
      // Line chart: poverty and indigence time series
      const pobrezaData = allData.filter((d) => 
        d.indicador_nombre.toLowerCase().includes("pobreza") && 
        !d.indicador_nombre.toLowerCase().includes("indigencia")
      );
      const indigenciaData = allData.filter((d) => 
        d.indicador_nombre.toLowerCase().includes("indigencia")
      );
      
      charts[chartKey] = periods.map((periodo) => {
        const point: Record<string, string | number> = { year: periodo };
        const pobData = pobrezaData.filter((d) => d.periodo === periodo);
        const indData = indigenciaData.filter((d) => d.periodo === periodo);
        if (pobData.length > 0) point.pobreza = Number(pobData[0].valor);
        if (indData.length > 0) point.indigencia = Number(indData[0].valor);
        return point;
      });
    } else if (regions.length > 1) {
      // Multi-region comparison
      charts[chartKey] = periods.map((periodo) => {
        const point: Record<string, string | number> = { year: periodo };
        for (const row of allData.filter((d) => d.periodo === periodo)) {
          const regionKey = row.region.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
          point[regionKey] = Number(row.valor);
        }
        return point;
      });
    } else {
      // Simple time series
      charts[chartKey] = periods.map((periodo) => {
        const point: Record<string, string | number> = { year: periodo };
        const periodData = allData.filter((d) => d.periodo === periodo);
        
        if (periodData.length === 1) {
          point.valor = Number(periodData[0].valor);
        } else if (periodData.length > 1) {
          // Multiple values for same period - aggregate or pick first
          // Check if there's desglose to differentiate
          const withDesglose = periodData.filter((d) => d.desglose && Object.keys(d.desglose).length > 0);
          if (withDesglose.length > 0) {
            for (const row of withDesglose) {
              const key = String(Object.values(row.desglose!)[0]);
              point[key] = Number(row.valor);
            }
          } else {
            // Just use the first value or sum them
            point.valor = Number(periodData[0].valor);
          }
        }
        return point;
      });
    }
  }

  return charts;
}

/**
 * Maps indicator names to chart keys based on category.
 */
function getChartKeyMapFromIndicadores(
  categoria: string,
  indicadoresMap: Map<string, Array<{ indicador_nombre: string }>>
): Map<string, string> {
  const map = new Map<string, string>();

  for (const indicadorNombre of indicadoresMap.keys()) {
    const nombre = indicadorNombre.toLowerCase();
    
    switch (categoria) {
      case "salud":
        if (nombre.includes("mortalidad")) {
          map.set(indicadorNombre, "mortalidad");
        }
        break;
      case "educacion":
        if (nombre.includes("escolarizaci")) {
          map.set(indicadorNombre, "escolarizacion");
        } else if (nombre.includes("aprender") || nombre.includes("resultado")) {
          map.set(indicadorNombre, "aprender");
        } else if (nombre.includes("abandono") || nombre.includes("repiten")) {
          map.set(indicadorNombre, "abandono");
        }
        break;
      case "pobreza":
        if (nombre.includes("pobreza") && !nombre.includes("indigencia")) {
          map.set(indicadorNombre, "pobreza");
        } else if (nombre.includes("indigencia")) {
          map.set(indicadorNombre, "pobreza"); // Both go to same chart
        }
        break;
      case "seguridad":
        if (nombre.includes("denuncia") || nombre.includes("caso")) {
          map.set(indicadorNombre, "denuncias");
        }
        break;
      case "inversion":
        if (nombre.includes("presupuesto") || nombre.includes("porcentaje")) {
          map.set(indicadorNombre, "presupuesto");
        } else if (nombre.includes("inversi")) {
          map.set(indicadorNombre, "inversion");
        }
        break;
    }
  }

  return map;
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