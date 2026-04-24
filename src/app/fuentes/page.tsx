"use client";

import { useEffect, useState } from "react";
import { FileText, RefreshCw, ExternalLink, Database, Search, Building2, Users, Heart } from "lucide-react";
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

const categoryColors: Record<CategoriaIndicador, { bg: string; text: string }> = {
  salud: { bg: "bg-[#E07A5F]/10", text: "text-[#E07A5F]" },
  educacion: { bg: "bg-[#F3A712]/10", text: "text-[#F3A712]" },
  pobreza: { bg: "bg-[#BF1363]/10", text: "text-[#BF1363]" },
  seguridad: { bg: "bg-[#3777FF]/10", text: "text-[#3777FF]" },
  inversion: { bg: "bg-[#FF7F11]/10", text: "text-[#FF7F11]" },
  demografia: { bg: "bg-[#00074E]/10", text: "text-[#00074E]" },
};

const methodColors: Record<string, { bg: string; text: string }> = {
  api: { bg: "bg-[#22C55E]/10", text: "text-[#22C55E]" },
  manual: { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]" },
  csv_upload: { bg: "bg-[#F3A712]/10", text: "text-[#F3A712]" },
};

const methodLabels: Record<string, string> = {
  api: "API",
  manual: "Manual",
  csv_upload: "CSV",
};

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

interface Dataset {
  name: string;
  title?: string;
  organization?: string;
}

interface EndpointData {
  source: string;
  datasets?: string[];
  total?: number;
  results?: Dataset[];
  csv_urls?: Record<string, string>;
}

export default function FuentesPage() {
  const [activeTab, setActiveTab] = useState<"fuentes" | "apis">("fuentes");

  const [fuentes, setFuentes] = useState<FuenteDato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeSource, setActiveSource] = useState<string>("datosgob");
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<EndpointData | null>(null);

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

  const fetchApiData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("source", activeSource);
    if (activeSource === "datosgob" || activeSource === "cba") {
      params.set("action", "list");
    } else if (activeSource === "indec") {
      params.set("source", "indec");
      params.set("action", "info");
    } else if (activeSource === "contextual") {
      params.set("source", "contextual");
      params.set("action", "info");
    } else if (activeSource === "senaf") {
      params.set("action", "list");
    }

    try {
      const res = await fetch(`/api/external?${params}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "apis") {
      fetchApiData();
    }
  }, [activeTab, activeSource]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const sources = [
    { id: "datosgob", label: "Datos Argentina (Nacional)", icon: Database, desc: "Catálogo CKAN - Educación, Salud, Niñez" },
    { id: "cba", label: "Gestión Abierta CBA (Provincial)", icon: Building2, desc: "Datos abiertos provincial" },
    { id: "senaf", label: "SENAF Nacional", icon: Users, desc: "Programas de infancia y adolescencia" },
    { id: "indec", label: "INDEC Argentina", icon: FileText, desc: "FTP, Visualizaciones, Microdatos" },
    { id: "contextual", label: "Indicadores Contextuales", icon: Heart, desc: "IPC, Empleo, NBI — enriquecimiento" },
  ];

  const filteredResults = data?.datasets
    ? data.datasets.filter((d) => d.toLowerCase().includes(searchQuery.toLowerCase()))
    : searchQuery
    ? []
    : data?.results?.map((r) => r.name).filter((n) => n?.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={FileText}
        title="Catálogo de Fuentes y APIs"
        description="Explorador de fuentes de datos e APIs externas conectadas al dashboard DDNA"
        color="orange"
      />

      <div className="border-b border-[#E0E0E0]">
        <nav className="flex gap-1">
          <button
            onClick={() => setActiveTab("fuentes")}
            className={clsx(
              "px-4 py-3 font-accent text-sm border-b-2 transition-colors",
              activeTab === "fuentes"
                ? "border-[#FF7F11] text-[#FF7F11]"
                : "border-transparent text-[#4D4D4D] hover:text-[#00074E]"
            )}
          >
            Fuentes de Datos
          </button>
          <button
            onClick={() => setActiveTab("apis")}
            className={clsx(
              "px-4 py-3 font-accent text-sm border-b-2 transition-colors",
              activeTab === "apis"
                ? "border-[#FF7F11] text-[#FF7F11]"
                : "border-transparent text-[#4D4D4D] hover:text-[#00074E]"
            )}
          >
            APIs Externas
          </button>
        </nav>
      </div>

      {activeTab === "fuentes" && (
        <>
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
                      <th className="py-3 px-4 font-body text-sm font-medium text-[#4D4D4D]">Nombre</th>
                      <th className="py-3 px-4 font-body text-sm font-medium text-[#4D4D4D]">Organización</th>
                      <th className="py-3 px-4 font-body text-sm font-medium text-[#4D4D4D]">Categoría</th>
                      <th className="py-3 px-4 font-body text-sm font-medium text-[#4D4D4D]">Frecuencia</th>
                      <th className="py-3 px-4 font-body text-sm font-medium text-[#4D4D4D]">Método</th>
                      <th className="py-3 px-4 font-body text-sm font-medium text-[#4D4D4D]">Última actualización</th>
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
                            <span className="font-medium text-[#00074E]">{fuente.nombre}</span>
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
                        <td className="py-4 px-4 font-body text-sm text-[#4D4D4D]">{fuente.organizacion}</td>
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
                        <td className="py-4 px-4 font-body text-sm text-[#4D4D4D]">{fuente.frecuencia}</td>
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
                        <td className="py-4 px-4 font-body text-sm text-[#4D4D4D]">{formatDate(fuente.ultima_actualizacion)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ChartCard>
        </>
      )}

      {activeTab === "apis" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-6">
            {sources.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSource(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-accent text-sm transition-colors ${
                  activeSource === s.id
                    ? "bg-[#00074E] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <s.icon className="w-4 h-4" />
                {s.label}
              </button>
            ))}
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00074E] focus:border-transparent"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00074E]" />
              <span className="ml-3 text-gray-500">Cargando...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{data?.source || activeSource}</span>
                  {data?.total && <span> — {data.total} datasets disponibles</span>}
                </p>
                {data?.csv_urls && (
                  <div className="mt-2 text-sm">
                    <p className="font-medium text-gray-700">CSVs directos:</p>
                    {Object.entries(data.csv_urls).map(([name, url]) => (
                      <a
                        key={name}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:underline"
                      >
                        {name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {filteredResults.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">Dataset ID</th>
                        <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">Acciones</th>
                        <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">Ver detalle</th>
                        <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">Tipo</th>
                        <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">Fuente</th>
                        <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">URL</th>
                        <th>API URL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredResults.slice(0, 50).map((d: any, i) => {
                        const name = typeof d === "string" ? d : d.name || d.title;
                        return (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono text-sm text-gray-700">{name?.substring(0, 40)}</td>
                            <td className="px-4 py-3">
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">CKAN</span>
                            </td>
                            <td className="px-4 py-3">
                              <a
                                href={`/api/external?source=${activeSource === "datosgob" ? "datosgob" : activeSource}&action=show&id=${name}`}
                                target="_blank"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Detalle →
                              </a>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{name?.includes("educacion") ? "Educación" : name?.includes("salud") ? "Salud" : name?.includes("ninez") ? "Niñez" : "General"}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{name?.includes("desarrollo") ? "SENAF" : name?.includes("educacion") ? "Min.Educación" : "INDEC"}</td>
                            <td className="px-4 py-3">
                              <a
                                href={activeSource === "datosgob"
                                  ? `https://datos.gob.ar/dataset/${name}`
                                  : activeSource === "cba"
                                    ? `https://datosgestionabierta.cba.gov.ar/dataset/${name}`
                                    : `https://datosabiertos.desarrollosocial.gob.ar/dataset/${name}`}
                                target="_blank"
                                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                            <td className="px-4 py-3">
                              <code className="text-xs bg-gray-100 px-1 rounded">
                                ?source={activeSource === "datosgob" ? "datosgob" : activeSource}&amp;action=show&amp;id={name}
                              </code>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredResults.length > 50 && (
                    <p className="px-4 py-3 text-sm text-gray-500 text-center">
                      Mostrando 50 de {filteredResults.length} resultados. Usá el filtro para buscar más.
                    </p>
                  )}
                </div>
              )}

              {!loading && !filteredResults.length && (
                <div className="text-center py-12 text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No se encontraron datasets</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}