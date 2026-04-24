"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Search, Database, FileText, Building2, Users, Heart } from "lucide-react";

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

export default function ApisPage() {
  const [loading, setLoading] = useState(true);
  const [activeSource, setActiveSource] = useState<string>("datosgob");
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<EndpointData | null>(null);
  const [indecInfo, setIndecInfo] = useState<any>(null);
  const [contextual, setContextual] = useState<any>(null);

  const fetchData = async () => {
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
    fetchData();
  }, [activeSource]);

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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="font-display text-3xl text-[#00074E]">APIs y Fuentes de Datos</h1>
          <p className="font-body text-gray-600 mt-2">
            Explorador de catálogos de datos públicos conectados al dashboard DDNA
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Source tabs */}
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

        {/* Search */}
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

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00074E]" />
            <span className="ml-3 text-gray-500">Cargando...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Info header */}
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
                      📄 {name}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Datasets list */}
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
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                              CKAN
                            </span>
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

            {/* Empty state */}
            {!loading && !filteredResults.length && (
              <div className="text-center py-12 text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No se encontraron datasets</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}