"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface PaicorData {
  departamento: string;
  turno: string;
  nivel: string;
  cant_beneficios: number;
  año: number;
}

export interface PaicorChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

export interface UsePaicorResult {
  /** Data formatted for bar chart (by department) */
  chartData: PaicorChartData | null;
  /** Raw data from database */
  rawData: PaicorData[];
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Metadata about the data source */
  metadata: {
    fuente: string;
    ultimaActualizacion: string | null;
    totalBeneficiarios: number;
    totalDepartamentos: number;
  } | null;
}

/**
 * Hook que consulta la tabla paicor desde Supabase y retorna
 * los datos formateados para un gráfico de barras por departamento.
 */
export function usePaicor(año?: number): UsePaicorResult {
  const [chartData, setChartData] = useState<PaicorChartData | null>(null);
  const [rawData, setRawData] = useState<PaicorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{
    fuente: string;
    ultimaActualizacion: string | null;
    totalBeneficiarios: number;
    totalDepartamentos: number;
  } | null>(null);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      setError("Supabase no configurado");
      setLoading(false);
      return;
    }

    async function fetchPaicor() {
      try {
        let query = supabase
          .from("paicor")
          .select("departamento, turno, nivel, cant_beneficios, año, fuente, created_at")
          .order("año", { ascending: false })
          .order("departamento", { ascending: true });

        if (año) {
          query = query.eq("año", año);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          setError(fetchError.message);
          setLoading(false);
          return;
        }

        if (!data || data.length === 0) {
          setError("No hay datos disponibles");
          setLoading(false);
          return;
        }

        // Get unique fuentes and latest update date
        const fuentes = [...new Set(data.map((d: any) => d.fuente).filter(Boolean))];
        const fechas = data
          .map((d: any) => d.created_at)
          .filter(Boolean)
          .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());
        
        const totalBeneficiarios = data.reduce(
          (sum: number, d: any) => sum + (Number(d.cant_beneficios) || 0),
          0
        );
        
        const uniqueDepartamentos = new Set(
          data.map((d: any) => d.departamento).filter(Boolean)
        );

        setMetadata({
          fuente: fuentes.length === 1 ? fuentes[0] : fuentes.join(", "),
          ultimaActualizacion: fechas[0] ? new Date(fechas[0]).toISOString() : null,
          totalBeneficiarios,
          totalDepartamentos: uniqueDepartamentos.size,
        });

        // Aggregate by department for chart
        const deptTotals = new Map<string, number>();
        for (const row of data) {
          const dept = row.departamento?.toUpperCase() || "UNKNOWN";
          deptTotals.set(dept, (deptTotals.get(dept) || 0) + (Number(row.cant_beneficios) || 0));
        }

        // Sort departments by total beneficiaries (descending)
        const sortedDepts = [...deptTotals.entries()].sort((a, b) => b[1] - a[1]);
        
        // Create chart data
        setChartData({
          labels: sortedDepts.map(([dept]) => dept),
          datasets: [
            {
              label: "Beneficiarios",
              data: sortedDepts.map(([, count]) => count),
              backgroundColor: "rgba(59, 130, 246, 0.7)", // Blue-500
            },
          ],
        });

        // Store raw data
        setRawData(
          data.map((d: any) => ({
            departamento: d.departamento,
            turno: d.turno,
            nivel: d.nivel,
            cant_beneficios: Number(d.cant_beneficios) || 0,
            año: Number(d.año) || 0,
          }))
        );

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }

    fetchPaicor();
  }, [año]);

  return { chartData, rawData, loading, error, metadata };
}