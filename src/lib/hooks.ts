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
        let query = supabase
          .from("indicadores")
          .select("id, categoria, nombre, descripcion, unidad, frecuencia_actualizacion")
          .eq("activo", true)
          .order("orden", { ascending: true });

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

        // Fetch latest data for each indicator
        const kpiData: KpiData[] = await Promise.all(
          indicadores.map(async (ind: { id: string; categoria: string; nombre: string; descripcion: string; unidad: string; frecuencia_actualizacion: string }) => {
            const { data: datos } = await supabase
              .from("datos_indicadores")
              .select("valor, periodo, region")
              .eq("indicador_id", ind.id)
              .order("periodo", { ascending: false })
              .limit(2);

            const latestDato = datos?.[0] as { valor: number; periodo: string; region: string } | undefined;
            const previousDato = datos?.[1] as { valor: number; periodo: string; region: string } | undefined;

            let cambio: string | undefined;
            let cambioTipo: "up" | "down" | "neutral" = "neutral";

            if (latestDato && previousDato) {
              const diff = Number(latestDato.valor) - Number(previousDato.valor);
              cambio = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
              cambioTipo = diff > 0 ? "up" : diff < 0 ? "down" : "neutral";
            }

            return {
              id: ind.id,
              categoria: ind.categoria as CategoriaIndicador,
              nombre: ind.nombre,
              valor: latestDato ? String(latestDato.valor) : "—",
              subtitulo: ind.descripcion || "",
              cambio,
              cambioTipo,
              unidad: ind.unidad,
            };
          })
        );

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

  return { data, loading, error, source };
}