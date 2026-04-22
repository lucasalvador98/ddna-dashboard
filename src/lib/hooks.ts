"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { CategoriaIndicador, Indicador, DatoIndicador } from "@/lib/supabase";
import { kpisPlaceholder, type KpiData } from "@/lib/data";

interface UseIndicadoresResult {
  data: KpiData[];
  loading: boolean;
  error: string | null;
  source: "supabase" | "placeholder";
  metadata?: {
    fuente: string;
    ultimaActualizacion: string | null;
  };
}

/**
 * Hook que intenta cargar indicadores desde Supabase.
 * Si Supabase no está configurado o hay error, usa datos placeholder.
 */
export function useIndicadores(categoria?: CategoriaIndicador): UseIndicadoresResult {
  const [data, setData] = useState<KpiData[]>(kpisPlaceholder);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"supabase" | "placeholder">("placeholder");
  const [metadata, setMetadata] = useState<{ fuente: string; ultimaActualizacion: string | null } | undefined>();

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      // No Supabase configured — use placeholder data filtered by category
      const filtered = categoria
        ? kpisPlaceholder.filter((kpi) => kpi.categoria === categoria)
        : kpisPlaceholder;
      setData(filtered);
      setLoading(false);
      setSource("placeholder");
      return;
    }

    async function fetchIndicadores() {
      try {
        // Schema real: indicador_nombre, valor, periodo, region, desglose están en la misma fila
        let query = supabase
          .from("indicadores")
          .select("id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, ultima_actualizacion")
          .order("periodo", { ascending: false });

        if (categoria) {
          query = query.eq("categoria", categoria);
        }

        const { data: indicadores, error: indicadoresError } = await query;

        if (indicadoresError) {
          setError(indicadoresError.message);
          const filtered = categoria
            ? kpisPlaceholder.filter((kpi) => kpi.categoria === categoria)
            : kpisPlaceholder;
          setData(filtered);
          setSource("placeholder");
          return;
        }

        if (!indicadores || indicadores.length === 0) {
          const filtered = categoria
            ? kpisPlaceholder.filter((kpi) => kpi.categoria === categoria)
            : kpisPlaceholder;
          setData(filtered);
          setSource("placeholder");
          return;
        }

        // Extract metadata from indicadores
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

        // Los datos ya están en la misma fila (valor, periodo, region)
        // Agrupar por indicador para mostrar el más reciente
        const indicadoresMap = new Map<string, {
          id: string;
          categoria: string;
          nombre: string;
          valor: number;
          unidad: string;
          periodo: string;
          region: string;
        }>();

        // agrupar y quedarse con el más reciente
        for (const ind of indicadores) {
          if (!indicadoresMap.has(ind.id)) {
            indicadoresMap.set(ind.id, {
              id: ind.id,
              categoria: ind.categoria,
              nombre: ind.indicador_nombre,
              valor: Number(ind.valor) || 0,
              unidad: ind.unidad || 'casos',
              periodo: ind.periodo || '',
              region: ind.region || 'Córdoba'
            });
          }
        }

        // Convertir a formato KpiData
        const kpiData: KpiData[] = Array.from(indicadoresMap.values()).map((ind, idx) => {
          // Calcular cambio simple (comparando valores - placeholder)
          const cambio = idx > 0 ? "+5.2" : undefined;
          const cambioTipo: "up" | "down" | "neutral" = idx > 0 ? "up" : "neutral";

          return {
            id: ind.id,
            categoria: ind.categoria as CategoriaIndicador,
            nombre: ind.nombre,
            valor: ind.valor ? String(ind.valor) : "—",
            subtitulo: ind.periodo ? `Período: ${ind.periodo}` : "",
            cambio,
            cambioTipo,
            unidad: ind.unidad,
          };
        });

        setData(kpiData);
        setSource("supabase");
      } catch {
        setError("Error connecting to Supabase");
        const filtered = categoria
          ? kpisPlaceholder.filter((kpi) => kpi.categoria === categoria)
          : kpisPlaceholder;
        setData(filtered);
        setSource("placeholder");
      } finally {
        setLoading(false);
      }
    }

    fetchIndicadores();
  }, [categoria]);

  return { data, loading, error, source, metadata };
}