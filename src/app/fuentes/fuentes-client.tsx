'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  FileText,
  ExternalLink,
  Database,
  Building2,
  Users,
  Heart,
  Search,
} from 'lucide-react';
import clsx from 'clsx';
import { ChartCard } from '@/components/charts/chart-card';
import { PageError } from '@/components/page-error';
import { PageLoading } from '@/components/page-loading';
import type { FuenteDato, CategoriaIndicador } from '@/lib/supabase';

// ── Types ───────────────────────────────────────────────────

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

// ── Constants ───────────────────────────────────────────────

// Partial: only the 6 core categories have palette entries; the rest render
// without a colored badge (see the `?.` access below).
const categoryColors: Partial<Record<CategoriaIndicador, { bg: string; text: string }>> = {
  salud: { bg: 'bg-terracotta/10', text: 'text-terracotta' },
  educacion: { bg: 'bg-amber/10', text: 'text-amber' },
  pobreza: { bg: 'bg-magenta/10', text: 'text-magenta' },
  seguridad: { bg: 'bg-blue/10', text: 'text-blue' },
  inversion: { bg: 'bg-orange/10', text: 'text-orange' },
  demografia: { bg: 'bg-navy/10', text: 'text-navy' },
};

const methodColors: Record<string, { bg: string; text: string }> = {
  api: { bg: 'bg-success/10', text: 'text-success' },
  manual: { bg: 'bg-warning/10', text: 'text-warning' },
  csv_upload: { bg: 'bg-amber/10', text: 'text-amber' },
};

const methodLabels: Record<string, string> = {
  api: 'API',
  manual: 'Manual',
  csv_upload: 'CSV',
};

const fallbackFuentes: FuenteDato[] = [
  {
    id: '1',
    nombre: 'Ministerio de Salud de Córdoba',
    organizacion: 'Gobierno de Córdoba',
    url: 'https://salud.cba.gov.ar',
    frecuencia: 'Trimestral',
    categoria: 'salud',
    ultima_actualizacion: '2024-12-15',
    metodo_ingesta: 'api',
    created_at: '2024-01-01',
  },
  {
    id: '2',
    nombre: 'Ministerio de Educación',
    organizacion: 'Gobierno de Córdoba',
    url: 'https://educacion.cba.gov.ar',
    frecuencia: 'Anual',
    categoria: 'educacion',
    ultima_actualizacion: '2024-11-30',
    metodo_ingesta: 'csv_upload',
    created_at: '2024-01-01',
  },
  {
    id: '3',
    nombre: 'INDEC - EPH',
    organizacion: 'Gobierno Nacional',
    url: 'https://www.indec.gob.ar',
    frecuencia: 'Semestral',
    categoria: 'pobreza',
    ultima_actualizacion: '2024-09-30',
    metodo_ingesta: 'api',
    created_at: '2024-01-01',
  },
  {
    id: '4',
    nombre: 'Secretaría de Niñez',
    organizacion: 'Gobierno de Córdoba',
    url: 'https://ninez.cba.gov.ar',
    frecuencia: 'Mensual',
    categoria: 'seguridad',
    ultima_actualizacion: '2024-12-01',
    metodo_ingesta: 'api',
    created_at: '2024-01-01',
  },
  {
    id: '5',
    nombre: 'Ministerio de Finanzas',
    organizacion: 'Gobierno de Córdoba',
    url: 'https://finanzas.cba.gov.ar',
    frecuencia: 'Trimestral',
    categoria: 'inversion',
    ultima_actualizacion: '2024-10-31',
    metodo_ingesta: 'manual',
    created_at: '2024-01-01',
  },
  {
    id: '6',
    nombre: 'Dirección General de Estadística',
    organizacion: 'Gobierno de Córdoba',
    url: 'https://estadistica.cba.gov.ar',
    frecuencia: 'Decenal',
    categoria: 'demografia',
    ultima_actualizacion: '2022-05-18',
    metodo_ingesta: 'csv_upload',
    created_at: '2024-01-01',
  },
];

const sources = [
  {
    id: 'datosgob',
    label: 'Datos Argentina (Nacional)',
    icon: Database,
    desc: 'Catálogo CKAN - Educación, Salud, Niñez',
  },
  {
    id: 'cba',
    label: 'Gestión Abierta CBA (Provincial)',
    icon: Building2,
    desc: 'Datos abiertos provincial',
  },
  {
    id: 'senaf',
    label: 'SENAF Nacional',
    icon: Users,
    desc: 'Programas de infancia y adolescencia',
  },
  {
    id: 'indec',
    label: 'INDEC Argentina',
    icon: FileText,
    desc: 'FTP, Visualizaciones, Microdatos',
  },
  {
    id: 'contextual',
    label: 'Indicadores Contextuales',
    icon: Heart,
    desc: 'IPC, Empleo, NBI — enriquecimiento',
  },
];

// ── Helpers ─────────────────────────────────────────────────

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ── Props ───────────────────────────────────────────────────

interface FuentesClientProps {
  initialFuentes: FuenteDato[];
  initialUsingFallback: boolean;
  initialError: string | null;
  initialLastFetch: string;
}

// ── Component ───────────────────────────────────────────────

export function FuentesClient({
  initialFuentes,
  initialUsingFallback,
  initialError,
  initialLastFetch,
}: FuentesClientProps) {
  const [activeTab, setActiveTab] = useState<'fuentes' | 'apis'>('fuentes');

  const [fuentes, setFuentes] = useState<FuenteDato[]>(initialFuentes);
  const [isLoading, setIsLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(initialUsingFallback);
  const [lastFetch, setLastFetch] = useState<Date | null>(new Date(initialLastFetch));
  const [fuentesError, setFuentesError] = useState<string | null>(initialError);

  const [loading, setLoading] = useState(true);
  const [activeSource, setActiveSource] = useState<string>('datosgob');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<EndpointData | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchFuentes = useCallback(async () => {
    setIsLoading(true);
    setFuentesError(null);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

      if (supabaseUrl && supabaseAnonKey) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data, error } = await supabase
          .from('fuentes_datos')
          .select('*')
          .order('nombre', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setFuentes(data as FuenteDato[]);
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
      setFuentesError('Error al cargar las fuentes de datos.');
      setFuentes(fallbackFuentes);
      setUsingFallback(true);
    } finally {
      setIsLoading(false);
      setLastFetch(new Date());
    }
  }, []);

  const fetchApiData = async () => {
    setLoading(true);
    setApiError(null);
    const params = new URLSearchParams();
    params.set('source', activeSource);
    if (activeSource === 'datosgob' || activeSource === 'cba') {
      params.set('action', 'list');
    } else if (activeSource === 'indec') {
      params.set('source', 'indec');
      params.set('action', 'info');
    } else if (activeSource === 'contextual') {
      params.set('source', 'contextual');
      params.set('action', 'info');
    } else if (activeSource === 'senaf') {
      params.set('action', 'list');
    }

    try {
      const res = await fetch(`/api/external?${params}`);
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los datos de APIs';
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'apis') {
      fetchApiData();
    }
  }, [activeTab, activeSource]);

  const filteredResults = data?.datasets
    ? data.datasets.filter(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
    : searchQuery
      ? []
      : data?.results
          ?.map(r => r.name)
          .filter(n => n?.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="border-b border-border">
        <nav className="flex gap-1">
          <button
            onClick={() => setActiveTab('fuentes')}
            className={clsx(
              'px-4 py-3 font-accent text-sm border-b-2 transition-colors',
              activeTab === 'fuentes'
                ? 'border-orange text-orange'
                : 'border-transparent text-text-primary hover:text-navy'
            )}
          >
            Fuentes de Datos
          </button>
          <button
            onClick={() => setActiveTab('apis')}
            className={clsx(
              'px-4 py-3 font-accent text-sm border-b-2 transition-colors',
              activeTab === 'apis'
                ? 'border-orange text-orange'
                : 'border-transparent text-text-primary hover:text-navy'
            )}
          >
            APIs Externas
          </button>
        </nav>
      </div>

      {activeTab === 'fuentes' && (
        <>
          {fuentesError && <PageError message={fuentesError} onRetry={() => fetchFuentes()} />}
          <div
            className={clsx(
              'rounded-lg p-4 flex items-center justify-between',
              usingFallback
                ? 'bg-warning/10 border border-warning/30'
                : 'bg-success/10 border border-success/30'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  'w-2 h-2 rounded-full',
                  usingFallback ? 'bg-warning' : 'bg-success'
                )}
              />
              <span
                className={clsx(
                  'font-body text-sm font-medium',
                  usingFallback ? 'text-warning' : 'text-success'
                )}
              >
                {usingFallback
                  ? 'Mostrando datos de ejemplo — Configure Supabase para conectar fuentes reales'
                  : 'Conectado a Supabase — Datos en vivo'}
              </span>
            </div>
            {lastFetch && (
              <span className="font-body text-xs text-text-primary">
                Actualizado: {lastFetch.toLocaleTimeString('es-AR')}
              </span>
            )}
          </div>

          <ChartCard
            title="Fuentes Integradas"
            subtitle={`${fuentes.length} fuentes de datos documentadas`}
            color="orange"
          >
            {isLoading ? (
              <PageLoading message="Cargando fuentes de datos..." />
            ) : fuentesError ? null : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 px-4 font-body text-sm font-medium text-text-primary">
                        Nombre
                      </th>
                      <th className="py-3 px-4 font-body text-sm font-medium text-text-primary">
                        Organización
                      </th>
                      <th className="py-3 px-4 font-body text-sm font-medium text-text-primary">
                        Categoría
                      </th>
                      <th className="py-3 px-4 font-body text-sm font-medium text-text-primary">
                        Frecuencia
                      </th>
                      <th className="py-3 px-4 font-body text-sm font-medium text-text-primary">
                        Método
                      </th>
                      <th className="py-3 px-4 font-body text-sm font-medium text-text-primary">
                        Última actualización
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fuentes.map(fuente => (
                      <tr
                        key={fuente.id}
                        className="border-b border-border/50 hover:bg-secondary-bg/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-navy">{fuente.nombre}</span>
                            {fuente.url && (
                              <a
                                href={fuente.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue hover:text-navy transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-body text-sm text-text-primary">
                          {fuente.organizacion}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={clsx(
                              'inline-flex items-center px-2.5 py-1 rounded-full font-body text-xs font-medium capitalize',
                              categoryColors[fuente.categoria]?.bg,
                              categoryColors[fuente.categoria]?.text
                            )}
                          >
                            {fuente.categoria}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-body text-sm text-text-primary">
                          {fuente.frecuencia}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={clsx(
                              'inline-flex items-center px-2.5 py-1 rounded-full font-body text-xs font-medium uppercase',
                              methodColors[fuente.metodo_ingesta]?.bg,
                              methodColors[fuente.metodo_ingesta]?.text
                            )}
                          >
                            {methodLabels[fuente.metodo_ingesta] || fuente.metodo_ingesta}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-body text-sm text-text-primary">
                          {formatDate(fuente.ultima_actualizacion)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ChartCard>
        </>
      )}

      {activeTab === 'apis' && (
        <div className="space-y-4">
          {apiError && <PageError message={apiError} onRetry={() => fetchApiData()} />}
          {apiError ? null : (
            <div className="flex flex-wrap gap-2 mb-6">
              {sources.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSource(s.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-accent text-sm transition-colors ${
                    activeSource === s.id
                      ? 'bg-navy text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {apiError ? null : (
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar datasets..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
              />
            </div>
          )}

          {loading ? (
            <PageLoading message="Cargando datos de APIs..." />
          ) : apiError ? null : (
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
                        <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">
                          Dataset ID
                        </th>
                        <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">
                          Acciones
                        </th>
                        <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">
                          Ver detalle
                        </th>
                        <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">
                          Tipo
                        </th>
                        <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">
                          Fuente
                        </th>
                        <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">URL</th>
                        <th>API URL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredResults.slice(0, 50).map((d: unknown, i) => {
                        const name = typeof d === 'string' ? d : ((d as Record<string, unknown>)["name"] as string | undefined) ?? ((d as Record<string, unknown>)["title"] as string | undefined);
                        return (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono text-sm text-gray-700">
                              {name?.substring(0, 40)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                CKAN
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <a
                                href={`/api/external?source=${activeSource === 'datosgob' ? 'datosgob' : activeSource}&action=show&id=${name}`}
                                target="_blank"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Detalle →
                              </a>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {name?.includes('educacion')
                                ? 'Educación'
                                : name?.includes('salud')
                                  ? 'Salud'
                                  : name?.includes('ninez')
                                    ? 'Niñez'
                                    : 'General'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {name?.includes('desarrollo')
                                ? 'SENAF'
                                : name?.includes('educacion')
                                  ? 'Min.Educación'
                                  : 'INDEC'}
                            </td>
                            <td className="px-4 py-3">
                              <a
                                href={
                                  activeSource === 'datosgob'
                                    ? `https://datos.gob.ar/dataset/${name}`
                                    : activeSource === 'cba'
                                      ? `https://datosgestionabierta.cba.gov.ar/dataset/${name}`
                                      : `https://datosabiertos.desarrollosocial.gob.ar/dataset/${name}`
                                }
                                target="_blank"
                                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                            <td className="px-4 py-3">
                              <code className="text-xs bg-gray-100 px-1 rounded">
                                ?source={activeSource === 'datosgob' ? 'datosgob' : activeSource}
                                &amp;action=show&amp;id={name}
                              </code>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredResults.length > 50 && (
                    <p className="px-4 py-3 text-sm text-gray-500 text-center">
                      Mostrando 50 de {filteredResults.length} resultados. Usá el filtro para buscar
                      más.
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

      {activeTab === 'apis' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-6">
            {sources.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSource(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-accent text-sm transition-colors ${
                  activeSource === s.id
                    ? 'bg-navy text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy" />
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
                        <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">
                          Dataset ID
                        </th>
                        <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">
                          Acciones
                        </th>
                        <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">
                          Ver detalle
                        </th>
                        <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">
                          Tipo
                        </th>
                        <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">
                          Fuente
                        </th>
                        <th className="text-left px-4 py-3 font-accent text-sm text-gray-500">URL</th>
                        <th>API URL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredResults.slice(0, 50).map((d: unknown, i) => {
                        const name = typeof d === 'string' ? d : ((d as Record<string, unknown>)["name"] as string | undefined) ?? ((d as Record<string, unknown>)["title"] as string | undefined);
                        return (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono text-sm text-gray-700">
                              {name?.substring(0, 40)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                CKAN
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <a
                                href={`/api/external?source=${activeSource === 'datosgob' ? 'datosgob' : activeSource}&action=show&id=${name}`}
                                target="_blank"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Detalle →
                              </a>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {name?.includes('educacion')
                                ? 'Educación'
                                : name?.includes('salud')
                                  ? 'Salud'
                                  : name?.includes('ninez')
                                    ? 'Niñez'
                                    : 'General'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {name?.includes('desarrollo')
                                ? 'SENAF'
                                : name?.includes('educacion')
                                  ? 'Min.Educación'
                                  : 'INDEC'}
                            </td>
                            <td className="px-4 py-3">
                              <a
                                href={
                                  activeSource === 'datosgob'
                                    ? `https://datos.gob.ar/dataset/${name}`
                                    : activeSource === 'cba'
                                      ? `https://datosgestionabierta.cba.gov.ar/dataset/${name}`
                                      : `https://datosabiertos.desarrollosocial.gob.ar/dataset/${name}`
                                }
                                target="_blank"
                                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                            <td className="px-4 py-3">
                              <code className="text-xs bg-gray-100 px-1 rounded">
                                ?source={activeSource === 'datosgob' ? 'datosgob' : activeSource}
                                &amp;action=show&amp;id={name}
                              </code>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredResults.length > 50 && (
                    <p className="px-4 py-3 text-sm text-gray-500 text-center">
                      Mostrando 50 de {filteredResults.length} resultados. Usá el filtro para buscar
                      más.
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
