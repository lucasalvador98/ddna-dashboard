"use client";

import { useEffect, useState } from "react";
import { FileText, RefreshCw, ExternalLink } from "lucide-react";
import clsx from "clsx";
import { SectionHeader } from "@/components/section-header";
import { ChartCard } from "@/components/charts/chart-card";
import { supabase, isSupabaseConfigured, getFuentesDatos, FuenteDato } from "@/lib/supabase";

type CategoriaIndicador =
  | "salud"
  | "educacion"
  | "pobreza"
  | "seguridad"
  | "inversion"
  | "demografia";

// Category colors for badges using DDNA theme colors
const categoryColors: Record<CategoriaIndicador, { bg: string; text: string }> = {
  salud: { bg: "bg-[#E07A5F]/10", text: "text-[#E07A5F]" },
  educacion: { bg: "bg-[#F3A712]/10", text: "text-[#F3A712]" },
  pobreza: { bg: "bg-[#BF1363]/10", text: "text-[#BF1363]" },
  seguridad: { bg: "bg-[#3777FF]/10", text: "text-[#3777FF]" },
  inversion: { bg: "bg-[#FF7F11]/10", text: "text-[#FF7F11]" },
  demografia: { bg: "bg-[#00074E]/10", text: "text-[#00074E]" },
};

// Method badge colors
const methodColors: Record<string, { bg: string; text: string }> = {
  api: { bg: "bg-[#22C55E]/10", text: "text-[#22C55E]" },
  manual: { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]" },
  csv_upload: { bg: "bg-[#F3A712]/10", text: "text-[#F3A712]" },
};

// Method labels in Spanish
const methodLabels: Record<string, string> = {
  api: "API",
  manual: "Manual",
  csv_upload: "CSV",
};

// Fallback data when Supabase is not configured
const fallbackFuentes: FuenteDato[] = [
  {
    id: "1",
    nombre: "Ministerio de Salud de Córdoba",
    organizacion: "Gobierno de Córdoba",
    url: "https://salud.cba.gov.ar",
    frecuencia: "Trimestral",
    categoria: "salud",
    ultima_actualizacion: "2024-12-15",
    metodo_ingesta: "api",
    created_at: "2024-01-01",
  },
  {
    id: "2",
    nombre: "Ministerio de Educación",
    organizacion: "Gobierno de Córdoba",
    url: "https://educacion.cba.gov.ar",
    frecuencia: "Anual",
    categoria: "educacion",
    ultima_actualizacion: "2024-11-30",
    metodo_ingesta: "csv_upload",
    created_at: "2024-01-01",
  },
  {
    id: "3",
    nombre: "INDEC - EPH",
    organizacion: "Gobierno Nacional",
    url: "https://www.indec.gob.ar",
    frecuencia: "Semestral",
    categoria: "pobreza",
    ultima_actualizacion: "2024-09-30",
    metodo_ingesta: "api",
    created_at: "2024-01-01",
  },
  {
    id: "4",
    nombre: "Secretaría de Niñez",
    organizacion: "Gobierno de Córdoba",
    url: "https://ninez.cba.gov.ar",
    frecuencia: "Mensual",
    categoria: "seguridad",
    ultima_actualizacion: "2024-12-01",
    metodo_ingesta: "api",
    created_at: "2024-01-01",
  },
  {
    id: "5",
    nombre: "Ministerio de Finanzas",
    organizacion: "Gobierno de Córdoba",
    url: "https://finanzas.cba.gov.ar",
    frecuencia: "Trimestral",
    categoria: "inversion",
    ultima_actualizacion: "2024-10-31",
    metodo_ingesta: "manual",
    created_at: "2024-01-01",
  },
  {
    id: "6",
    nombre: "Dirección General de Estadística",
    organizacion: "Gobierno de Córdoba",
    url: "https://estadistica.cba.gov.ar",
    frecuencia: "Decenal",
    categoria: "demografia",
    ultima_actualizacion: "2022-05-18",
    metodo_ingesta: "csv_upload",
    created_at: "2024-01-01",
  },
];

export default function FuentesPage() {
  const [fuentes, setFuentes] = useState<FuenteDato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchFuentes() {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured()) {
          const data = await getFuentesDatos();
          if (data.length > 0) {
            setFuentes(data);
            setUsingFallback(false);
          } else {
            setFuentes(fallbackFuentes);
            setUsingFallback(true);
          }
        } else {
          setFuentes(fallbackFuentes);
          setUsingFallback(true);
        }
      } catch {
        setFuentes(fallbackFuentes);
        setUsingFallback(true);
      } finally {
        setIsLoading(false);
        setLastFetch(new Date());
      }
    }

    fetchFuentes();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={FileText}
        title="Catálogo de Fuentes de Datos"
        description="Listado de fuentes de información utilizadas para el monitoreo de indicadores de NNA"
        color="orange"
      />

      {/* Status Banner */}
      <div
        className={clsx(
          "rounded-lg p-4 flex items-center justify-between",
          usingFallback
            ? "bg-[#F59E0B]/10 border border-[#F59E0B]/30"
            : "bg-[#22C55E]/10 border border-[#22C55E]/30"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              "w-2 h-2 rounded-full",
              usingFallback ? "bg-[#F59E0B]" : "bg-[#22C55E]"
            )}
          />
          <span
            className={clsx(
              "font-body text-sm font-medium",
              usingFallback ? "text-[#F59E0B]" : "text-[#22C55E]"
            )}
          >
            {usingFallback
              ? "Mostrando datos de ejemplo — Configure Supabase para conectar fuentes reales"
              : "Conectado a Supabase — Datos en vivo"}
          </span>
        </div>
        {lastFetch && (
          <span className="font-body text-xs text-[#4D4D4D]">
            Actualizado: {lastFetch.toLocaleTimeString("es-AR")}
          </span>
        )}
      </div>

      {/* Sources Table */}
      <ChartCard
        title="Fuentes Integradas"
        subtitle={`${fuentes.length} fuentes de datos documentadas`}
        color="orange"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-6 h-6 text-[#4D4D4D] animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E0E0E0]">
                  <th className="py-3 px-4 font-body text-sm font-medium text-[#4D4D4D]">
                    Nombre
                  </th>
                  <th className="py-3 px-4 font-body text-sm font-medium text-[#4D4D4D]">
                    Organización
                  </th>
                  <th className="py-3 px-4 font-body text-sm font-medium text-[#4D4D4D]">
                    Categoría
                  </th>
                  <th className="py-3 px-4 font-body text-sm font-medium text-[#4D4D4D]">
                    Frecuencia
                  </th>
                  <th className="py-3 px-4 font-body text-sm font-medium text-[#4D4D4D]">
                    Método
                  </th>
                  <th className="py-3 px-4 font-body text-sm font-medium text-[#4D4D4D]">
                    Última actualización
                  </th>
                </tr>
              </thead>
              <tbody>
                {fuentes.map((fuente) => (
                  <tr
                    key={fuente.id}
                    className="border-b border-[#E0E0E0]/50 hover:bg-[#FDF3E7]/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#00074E]">
                          {fuente.nombre}
                        </span>
                        {fuente.url && (
                          <a
                            href={fuente.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#3777FF] hover:text-[#00074E] transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-body text-sm text-[#4D4D4D]">
                      {fuente.organizacion}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={clsx(
                          "inline-flex items-center px-2.5 py-1 rounded-full font-body text-xs font-medium capitalize",
                          categoryColors[fuente.categoria]?.bg,
                          categoryColors[fuente.categoria]?.text
                        )}
                      >
                        {fuente.categoria}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-body text-sm text-[#4D4D4D]">
                      {fuente.frecuencia}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={clsx(
                          "inline-flex items-center px-2.5 py-1 rounded-full font-body text-xs font-medium uppercase",
                          methodColors[fuente.metodo_ingesta]?.bg,
                          methodColors[fuente.metodo_ingesta]?.text
                        )}
                      >
                        {methodLabels[fuente.metodo_ingesta] || fuente.metodo_ingesta}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-body text-sm text-[#4D4D4D]">
                      {formatDate(fuente.ultima_actualizacion)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>
    </div>
  );
}
