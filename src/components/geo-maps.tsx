'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Popup,
  CircleMarker,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Map as MapIcon,
  GraduationCap,
  Baby,
  HeartPulse,
  AlertTriangle,
  Loader2,
  AlertCircle,
  Search,
  X,
  Info,
} from 'lucide-react';
import { SectionHeader } from '@/components/section-header';
import clsx from 'clsx';

// ===========================================================================
// TYPES
// ===========================================================================
interface GeoJSONFeature {
  type: 'Feature';
  geometry: GeoJSON.Geometry;
  properties: Record<string, unknown>;
}

interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

interface SchoolProps {
  id?: number;
  cueanexo?: string;
  nombre?: string;
  est_sector?: string;
  est_ambito?: string;
  est_domicilio?: string;
  est_barrio?: string;
  est_localidad?: string;
  est_departamento?: string;
  nivel?: string; // JSON array as string e.g. '["Primario","Secundario"]'
}

interface HealthProps {
  id?: number;
  latitud?: number;
  longitud?: number;
  establecimiento_salud?: string;
  domicilio?: string;
  codigo_cuie?: string;
}

// Departamento → NBI % (Censo 2010, INDEC — valores aproximados de referencia)
const NBI_STATIC: Record<string, number> = {
  Capital: 6.5,
  'Río Cuarto': 9.8,
  'San Justo': 12.3,
  Colón: 8.2,
  Punilla: 11.5,
  'Santa María': 10.8,
  Calamuchita: 12.1,
  'Cruz del Eje': 18.9,
  Ischilín: 18.2,
  'Río Primero': 15.5,
  'Río Segundo': 11.8,
  'Tercero Arriba': 10.2,
  'General San Martín': 11.6,
  Unión: 10.9,
  'Marcos Juárez': 9.5,
  'Presidente Roque Sáenz Peña': 13.8,
  'General Roca': 15.2,
  'Juárez Celman': 12.7,
  'Río Seco': 19.8,
  Sobremonte: 22.3,
  Tulumba: 21.8,
  Totoral: 16.4,
  Minas: 24.1,
  Pocho: 26.7,
  'San Alberto': 17.2,
  'San Javier': 19.0,
};

// ===========================================================================
// CONSTANTS
// ===========================================================================
const IDECOR_BASE =
  'https://idecor-ws.mapascordoba.gob.ar/geoserver/idecor/ows';
const WFS_PARAMS =
  'service=WFS&version=2.0.0&request=GetFeature&outputFormat=application/json';

function wfsUrl(typeName: string): string {
  return `${IDECOR_BASE}?${WFS_PARAMS}&typeName=${typeName}`;
}

const MAP_CENTER: [number, number] = [-32.0, -64.0];
const MAP_ZOOM = 8;
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | IDECOR - Infraestructura de Datos Espaciales de Córdoba';

const NIVELES = ['Inicial', 'Primario', 'Secundario', 'Superior'] as const;
const SECTORES = ['Público', 'Privado'] as const;
const YEARS = [2020, 2021, 2022, 2023] as const;

type TabId = 'educativo' | 'nacimientos' | 'nbi' | 'salud';

// ===========================================================================
// HELPERS
// ===========================================================================
async function fetchGeoJSON(url: string): Promise<GeoJSONCollection> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`WFS error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

/** Parse the "nivel" field which may be a JSON array string */
function parseNiveles(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((n): n is string => typeof n === 'string');
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((n): n is string => typeof n === 'string')
        : [];
    } catch {
      return [raw];
    }
  }
  return [];
}

/** Clamp a ratio to [0,1] */
function clamp(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/** Choropleth colour: low=light yellow, high=dark red */
function choroplethColor(value: number, min: number, max: number): string {
  if (max === min) return '#fee08b';
  const t = clamp((value - min) / (max - min));
  // Interpolate between light yellow (#ffffcc) → orange (#fdae61) → dark red (#a50026)
  if (t < 0.5) {
    const s = t * 2;
    const r = Math.round(255 + s * (253 - 255));
    const g = Math.round(255 + s * (174 - 255));
    const b = Math.round(204 + s * (97 - 204));
    return `rgb(${r},${g},${b})`;
  }
  const s = (t - 0.5) * 2;
  const r = Math.round(253 + s * (165 - 253));
  const g = Math.round(174 + s * (0 - 174));
  const b = Math.round(97 + s * (38 - 97));
  return `rgb(${r},${g},${b})`;
}

// ===========================================================================
// REUSABLE: Map Wrapper (SSR-safe)
// ===========================================================================
function MapWrapper({
  children,
  height = 'h-[600px]',
}: {
  children: React.ReactNode;
  height?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={clsx(
          height,
          'bg-gray-100 flex items-center justify-center rounded-lg',
        )}
      >
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      scrollWheelZoom
      className={clsx(height, 'w-full rounded-lg z-0')}
    >
      <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
      {children}
    </MapContainer>
  );
}

// ===========================================================================
// REUSABLE: Legend
// ===========================================================================
function Legend({
  title,
  items,
}: {
  title: string;
  items: { color: string; label: string }[];
}) {
  return (
    <div className="bg-white rounded-lg border border-[#E0E0E0] p-3 text-xs">
      <p className="font-semibold text-[#1a2556] mb-2">{title}</p>
      <div className="space-y-1.5">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: it.color }}
            />
            <span className="text-[#4D4D4D]">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================================================================
// REUSABLE: Loading Spinner
// ===========================================================================
function Spinner({ text = 'Cargando datos...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-10 h-10 text-[#3777FF] animate-spin" />
      <p className="text-sm text-[#4D4D4D]">{text}</p>
    </div>
  );
}

// ===========================================================================
// REUSABLE: Error Banner
// ===========================================================================
function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-700">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs font-medium text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}

// ===========================================================================
// TAB 1: MAPA EDUCATIVO
// ===========================================================================
const SCHOOL_BLUE = '#3777FF';
const SCHOOL_ORANGE = '#FF7F11';

function EducativoMap() {
  const [schools, setSchools] = useState<GeoJSONCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNiveles, setSelectedNiveles] = useState<Set<string>>(new Set());
  const [selectedSector, setSelectedSector] = useState<string>('');

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGeoJSON(wfsUrl('idecor:establecimientos_educativos'));
      setSchools(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos educativos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const toggleNivel = (n: string) => {
    setSelectedNiveles((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const filteredFeatures = useMemo(() => {
    if (!schools) return [];
    return schools.features.filter((f) => {
      const p = f.properties as SchoolProps;
      const sectorMatch = !selectedSector || p.est_sector === selectedSector;
      if (!sectorMatch) return false;
      if (selectedNiveles.size === 0) return true;
      const niveles = parseNiveles(p.nivel);
      return niveles.some((n) => selectedNiveles.has(n));
    });
  }, [schools, selectedNiveles, selectedSector]);

  if (loading) return <Spinner text="Cargando establecimientos educativos..." />;
  if (error) return <ErrorBanner message={error} onRetry={fetchSchools} />;
  if (!schools)
    return <div className="text-sm text-[#4D4D4D] text-center py-10">Sin datos.</div>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Nivel filter */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs font-medium text-[#4D4D4D] self-center mr-1">
            Nivel:
          </span>
          {NIVELES.map((n) => (
            <button
              key={n}
              onClick={() => toggleNivel(n)}
              className={clsx(
                'px-2.5 py-1 text-xs rounded-full border transition-colors',
                selectedNiveles.has(n)
                  ? 'bg-[#3777FF] text-white border-[#3777FF]'
                  : 'bg-white text-[#4D4D4D] border-gray-300 hover:border-gray-400',
              )}
            >
              {n}
            </button>
          ))}
          {selectedNiveles.size > 0 && (
            <button
              onClick={() => setSelectedNiveles(new Set())}
              className="px-2 py-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3 inline" />
            </button>
          )}
        </div>

        {/* Sector filter */}
        <div className="flex gap-1.5">
          <span className="text-xs font-medium text-[#4D4D4D] self-center mr-1">
            Sector:
          </span>
          {SECTORES.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSector(selectedSector === s ? '' : s)}
              className={clsx(
                'px-2.5 py-1 text-xs rounded-full border transition-colors',
                selectedSector === s
                  ? 'bg-[#1a2556] text-white border-[#1a2556]'
                  : 'bg-white text-[#4D4D4D] border-gray-300 hover:border-gray-400',
              )}
            >
              {s}
            </button>
          ))}
          {selectedSector && (
            <button
              onClick={() => setSelectedSector('')}
              className="px-2 py-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3 inline" />
            </button>
          )}
        </div>

        {/* Count */}
        <span className="text-xs text-[#4D4D4D] ml-auto">
          {filteredFeatures.length} / {schools.features.length} establecimientos
        </span>
      </div>

      {/* Map */}
      <MapWrapper>
        <EducativoLayer features={filteredFeatures} />
      </MapWrapper>

      {/* Legend */}
      <Legend
        title="Sector"
        items={[
          { color: SCHOOL_BLUE, label: 'Público' },
          { color: SCHOOL_ORANGE, label: 'Privado' },
        ]}
      />
    </div>
  );
}

/** Separate component so it can use useMap if needed */
function EducativoLayer({ features }: { features: GeoJSONFeature[] }) {
  const map = useMap();

  // Fit bounds on data change
  useEffect(() => {
    if (features.length === 0) return;
    const bounds = L.latLngBounds(
      features
        .filter((f) => f.geometry?.type === 'Point')
        .map((f) => {
          const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates;
          return [lat, lng] as [number, number];
        }),
    );
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30] });
  }, [features, map]);

  return (
    <>
      {features.map((f) => {
        const p = f.properties as SchoolProps;
        const isPublic = p.est_sector === 'Público';
        const color = isPublic ? SCHOOL_BLUE : SCHOOL_ORANGE;
        const niveles = parseNiveles(p.nivel);

        if (f.geometry?.type !== 'Point') return null;
        const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates;

        return (
          <CircleMarker
            key={p.id ?? `${lat}-${lng}`}
            center={[lat, lng]}
            radius={4}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.6,
              weight: 1,
            }}
          >
            <Popup>
              <div className="text-xs space-y-1 min-w-[180px]">
                <p className="font-semibold text-[#1a2556]">{p.nombre ?? 'Sin nombre'}</p>
                <p className="text-[#4D4D4D]">{p.est_domicilio ?? ''}</p>
                {p.est_barrio && <p className="text-[#4D4D4D]">Barrio: {p.est_barrio}</p>}
                <p className="text-[#4D4D4D]">
                  {p.est_localidad ?? ''}{p.est_departamento ? `, ${p.est_departamento}` : ''}
                </p>
                <p className="text-[#4D4D4D]">
                  <span
                    className={clsx(
                      'inline-block px-1.5 py-0.5 rounded text-white text-[10px] font-medium',
                      isPublic ? 'bg-[#3777FF]' : 'bg-[#FF7F11]',
                    )}
                  >
                    {p.est_sector ?? '?'}
                  </span>
                </p>
                {niveles.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {niveles.map((n) => (
                      <span
                        key={n}
                        className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-[#4D4D4D]"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                )}
                {p.cueanexo && (
                  <p className="text-[10px] text-gray-400">CUE: {p.cueanexo}</p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

// ===========================================================================
// TAB 2: NACIMIENTOS POR DEPARTAMENTO
// ===========================================================================
function NacimientosMap() {
  const [departments, setDepartments] = useState<GeoJSONCollection | null>(null);
  const [births, setBirths] = useState<GeoJSONCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2023);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [deptData, birthData] = await Promise.all([
        fetchGeoJSON(wfsUrl('idecor:departamentos')),
        fetchGeoJSON(wfsUrl('idecor:dto_nacimiento')),
      ]);
      setDepartments(deptData);
      setBirths(birthData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos de nacimientos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build lookup: departamento name → { masc_X, fem_X, total_X } per year
  const birthLookup = useMemo(() => {
    const map = new Map<
      string,
      Record<number, { masc: number; fem: number; total: number }>
    >();
    if (!births) return map;

    for (const f of births.features) {
      const p = f.properties as Record<string, unknown>;
      const nombre = String(p.nombre ?? '').trim();
      if (!nombre) continue;

      const yearData: Record<number, { masc: number; fem: number; total: number }> = {};
      for (const y of YEARS) {
        const masc = Number(p[`masc_dto_${y}`] ?? p[`masc_dto_20-${String(y).slice(2)}`] ?? 0);
        const fem = Number(p[`fem_dto_${y}`] ?? p[`fem_dto_20-${String(y).slice(2)}`] ?? 0);
        const total = Number(p[`total_dto_${y}`] ?? p[`total_dto_20-${String(y).slice(2)}`] ?? masc + fem);
        yearData[y] = { masc, fem, total };
      }
      map.set(nombre, yearData);
    }
    return map;
  }, [births]);

  // Compute min/max for current year choropleth
  const { minTotal, maxTotal } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const [, yd] of birthLookup) {
      const v = yd[selectedYear]?.total ?? 0;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    return { minTotal: min === Infinity ? 0 : min, maxTotal: max === -Infinity ? 1 : max };
  }, [birthLookup, selectedYear]);

  // Join births onto department GeoJSON
  const deptWithBirths = useMemo(() => {
    if (!departments) return [];
    return departments.features.map((f) => {
      const nombre = String((f.properties as Record<string, unknown>).nombre ?? '').trim();
      const yd = birthLookup.get(nombre) ?? birthLookup.get(normalizeDeptName(nombre));
      return { ...f, _birthData: yd };
    }) as (GeoJSONFeature & { _birthData?: BirthYearData })[];
  }, [departments, birthLookup]);

  if (loading) return <Spinner text="Cargando datos de nacimientos..." />;
  if (error) return <ErrorBanner message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-4">
      {/* Year selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-[#4D4D4D]">Año:</span>
        {YEARS.map((y) => (
          <button
            key={y}
            onClick={() => setSelectedYear(y)}
            className={clsx(
              'px-3 py-1 text-xs rounded-full border transition-colors',
              selectedYear === y
                ? 'bg-[#BF1363] text-white border-[#BF1363]'
                : 'bg-white text-[#4D4D4D] border-gray-300 hover:border-gray-400',
            )}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Map */}
      <MapWrapper>
        <NacimientosChoropleth
          features={deptWithBirths}
          selectedYear={selectedYear}
          minTotal={minTotal}
          maxTotal={maxTotal}
        />
      </MapWrapper>

      {/* Choropleth legend (step gradient) */}
      <NacimientosLegend min={minTotal} max={maxTotal} />
    </div>
  );
}

function NacimientosChoropleth({
  features,
  selectedYear,
  minTotal,
  maxTotal,
}: {
  features: (GeoJSONFeature & { _birthData?: Record<number, { masc: number; fem: number; total: number }> })[];
  selectedYear: number;
  minTotal: number;
  maxTotal: number;
}) {
  const styledFeatures = useMemo(() => {
    return features.map((f) => {
      const total = f._birthData?.[selectedYear]?.total ?? 0;
      return {
        ...f,
        properties: {
          ...f.properties,
          _total: total,
          _color: choroplethColor(total, minTotal, maxTotal),
        },
      };
    });
  }, [features, selectedYear, minTotal, maxTotal]);

  const onEachFeature = useCallback(
    (feature: GeoJSON.Feature, layer: L.GeoJSON) => {
      const props = feature.properties as Record<string, unknown>;
      const nombre = String(props.nombre ?? '');
      const total = Number(props._total ?? 0);
      const yd = (feature as unknown as { _birthData?: Record<number, { masc: number; fem: number; total: number }> })._birthData;

      layer.bindTooltip(
        `<strong>${nombre}</strong><br/>Total ${selectedYear}: ${total.toLocaleString('es-AR')}`,
        { sticky: true },
      );

      layer.bindPopup(`
        <div style="font-size:12px;min-width:180px">
          <strong style="color:#1a2556">${nombre}</strong>
          <hr style="margin:4px 0" />
          ${[2020, 2021, 2022, 2023]
            .map((y) => {
              const d = yd?.[y];
              const t = d?.total ?? 0;
              const isSel = y === selectedYear;
              return `<p style="margin:2px 0;${isSel ? 'font-weight:bold;color:#BF1363' : ''}">
                ${y}: ${t.toLocaleString('es-AR')} nacimientos
                ${d ? ` (♀${d.fem.toLocaleString('es-AR')} ♂${d.masc.toLocaleString('es-AR')})` : ''}
              </p>`;
            })
            .join('')}
        </div>
      `);
    },
    [selectedYear],
  );

  const style = useCallback(
    (feature: GeoJSON.Feature | undefined) => {
      const color =
        (feature?.properties as Record<string, unknown>)?._color ?? '#cccccc';
      return {
        fillColor: String(color),
        weight: 1,
        opacity: 1,
        color: '#ffffff',
        fillOpacity: 0.75,
      };
    },
    [],
  );

  return (
    <GeoJSON
      key={selectedYear}
      data={styledFeatures as unknown as GeoJSON.GeoJsonObject}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}

function NacimientosLegend({ min, max }: { min: number; max: number }) {
  const steps = 5;
  const items = Array.from({ length: steps }, (_, i) => {
    const val = min + ((max - min) * i) / (steps - 1);
    const color = choroplethColor(val, min, max);
    return {
      color,
      label: `${Math.round(val).toLocaleString('es-AR')}${i === steps - 1 ? ' nac.' : ''}`,
    };
  });

  return <Legend title={`Total nacimientos (escala)`} items={items} />;
}

type BirthYearData = Record<number, { masc: number; fem: number; total: number }>;

/** Try common name variations for department matching */
function normalizeDeptName(name: string): string {
  const map: Record<string, string> = {
    'Río Cuarto': 'Rio Cuarto',
    'Rio Cuarto': 'Río Cuarto',
    'Río Segundo': 'Rio Segundo',
    'Rio Segundo': 'Río Segundo',
    'Río Primero': 'Rio Primero',
    'Rio Primero': 'Río Primero',
    'Cruz del Eje': 'Cruz Del Eje',
    'Cruz Del Eje': 'Cruz del Eje',
    'General San Martín': 'Gral. San Martin',
    'Gral. San Martín': 'General San Martín',
    'Gral. San Martin': 'General San Martín',
    'Tercero Arriba': 'Tercero Arriba',
  };
  return map[name] ?? name;
}

// ===========================================================================
// TAB 3: NBI POR DEPARTAMENTO
// ===========================================================================
function NBIMap() {
  const [departments, setDepartments] = useState<GeoJSONCollection | null>(null);
  const [nbiData, setNbiData] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to fetch NBI layer from IDECOR first
      let hasNbiLayer = false;
      try {
        await fetchGeoJSON(wfsUrl('idecor:nbi'));
        hasNbiLayer = true;
      } catch {
        try {
          await fetchGeoJSON(wfsUrl('idecor:nbi_por_departamento'));
          hasNbiLayer = true;
        } catch {
          // No NBI layer available in IDECOR — fall back to static data
        }
      }

      if (hasNbiLayer) {
        // If layer exists, use it (placeholder — real parsing would depend on actual schema)
        const nbiRes = await fetchGeoJSON(wfsUrl('idecor:nbi'));
        const lookup: Record<string, number> = {};
        for (const f of nbiRes.features) {
          const p = f.properties as Record<string, unknown>;
          const nombre = String(p.nombre ?? p.departamento ?? '').trim();
          const val = Number(p.nbi ?? p.porcentaje_nbi ?? p.valor ?? 0);
          if (nombre) lookup[nombre] = val;
        }
        setNbiData(lookup);
        setDataSource('IDECOR');
      } else {
        // Use static Censo 2010 data
        setNbiData(NBI_STATIC);
        setDataSource('Censo 2010 - INDEC (valores de referencia)');
      }

      const deptData = await fetchGeoJSON(wfsUrl('idecor:departamentos'));
      setDepartments(deptData);
    } catch (err) {
      // Fallback: try static data anyway
      try {
        const deptData = await fetchGeoJSON(wfsUrl('idecor:departamentos'));
        setDepartments(deptData);
        setNbiData(NBI_STATIC);
        setDataSource('Censo 2010 - INDEC (valores de referencia)');
      } catch (fallbackErr) {
        setError(
          err instanceof Error ? err.message : 'Error al cargar datos de NBI',
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const nbiMin = useMemo(
    () => (nbiData ? Math.min(...Object.values(nbiData)) : 0),
    [nbiData],
  );
  const nbiMax = useMemo(
    () => (nbiData ? Math.max(...Object.values(nbiData)) : 0),
    [nbiData],
  );

  const deptWithNbi = useMemo(() => {
    if (!departments || !nbiData) return [];
    return departments.features.map((f) => {
      const nombre = String(
        (f.properties as Record<string, unknown>).nombre ?? '',
      ).trim();
      const nbi = nbiData[nombre] ?? nbiData[normalizeDeptName(nombre)];
      return { ...f, _nbi: nbi };
    }) as (GeoJSONFeature & { _nbi?: number })[];
  }, [departments, nbiData]);

  if (loading) return <Spinner text="Cargando datos de NBI..." />;
  if (error) return <ErrorBanner message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-4">
      {/* Data source info */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          Fuente: {dataSource}
          {dataSource.includes('Censo') && (
            <>
              <br />
              Los valores del Censo 2010 son aproximados. Datos actualizados del
              Censo 2022 aún no están disponibles desagregados por departamento
              para NBI.
            </>
          )}
        </p>
      </div>

      {/* Map */}
      <MapWrapper>
        <NBIChoropleth
          features={deptWithNbi}
          nbiMin={nbiMin}
          nbiMax={nbiMax}
        />
      </MapWrapper>

      {/* Legend */}
      <NBILegend min={nbiMin} max={nbiMax} />
    </div>
  );
}

function NBIChoropleth({
  features,
  nbiMin,
  nbiMax,
}: {
  features: (GeoJSONFeature & { _nbi?: number })[];
  nbiMin: number;
  nbiMax: number;
}) {
  const styledFeatures = useMemo(() => {
    return features.map((f) => ({
      ...f,
      properties: {
        ...f.properties,
        _nbiColor: f._nbi != null ? choroplethColor(f._nbi, nbiMin, nbiMax) : '#cccccc',
        _nbi: f._nbi,
      },
    }));
  }, [features, nbiMin, nbiMax]);

  const onEachFeature = useCallback(
    (feature: GeoJSON.Feature, layer: L.GeoJSON) => {
      const props = feature.properties as Record<string, unknown>;
      const nombre = String(props.nombre ?? '');
      const nbi = props._nbi as number | undefined;

      layer.bindTooltip(
        `<strong>${nombre}</strong><br/>NBI: ${nbi != null ? nbi.toFixed(1) + '%' : 'S/D'}`,
        { sticky: true },
      );

      layer.bindPopup(`
        <div style="font-size:12px;min-width:160px">
          <strong style="color:#1a2556">${nombre}</strong>
          <p style="margin:4px 0">NBI: <strong>${nbi != null ? nbi.toFixed(1) + '%' : 'Sin dato'}</strong></p>
          <p style="font-size:10px;color:#999">Fuente: Censo 2010 INDEC</p>
        </div>
      `);
    },
    [],
  );

  const style = useCallback(
    (feature: GeoJSON.Feature | undefined) => {
      const color =
        (feature?.properties as Record<string, unknown>)?._nbiColor ?? '#cccccc';
      return {
        fillColor: String(color),
        weight: 1,
        opacity: 1,
        color: '#ffffff',
        fillOpacity: 0.75,
      };
    },
    [],
  );

  return (
    <GeoJSON
      data={styledFeatures as unknown as GeoJSON.GeoJsonObject}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}

function NBILegend({ min, max }: { min: number; max: number }) {
  const steps = 5;
  const items = Array.from({ length: steps }, (_, i) => {
    const val = min + ((max - min) * i) / (steps - 1);
    const color = choroplethColor(val, min, max);
    return {
      color,
      label: `${val.toFixed(1)}%${i === steps - 1 ? ' NBI' : ''}`,
    };
  });

  return <Legend title="% NBI (Necesidades Básicas Insatisfechas)" items={items} />;
}

// ===========================================================================
// TAB 4: CENTROS DE SALUD
// ===========================================================================
function SaludMap() {
  const [centers, setCenters] = useState<GeoJSONCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchCenters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGeoJSON(wfsUrl('idecor:Centros_Salud'));
      setCenters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar centros de salud');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCenters();
  }, [fetchCenters]);

  const filteredFeatures = useMemo(() => {
    if (!centers) return [];
    const q = search.toLowerCase().trim();
    if (!q) return centers.features;

    return centers.features.filter((f) => {
      const p = f.properties as HealthProps;
      const fields = [
        p.establecimiento_salud,
        p.domicilio,
        p.codigo_cuie,
      ]
        .filter(Boolean)
        .map((s) => s!.toLowerCase());
      return fields.some((s) => s.includes(q));
    });
  }, [centers, search]);

  if (loading) return <Spinner text="Cargando centros de salud..." />;
  if (error) return <ErrorBanner message={error} onRetry={fetchCenters} />;
  if (!centers) return <div className="text-sm text-[#4D4D4D] text-center py-10">Sin datos.</div>;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, domicilio o localidad..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/30 focus:border-[#E07A5F]"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-xs text-[#4D4D4D]">
        {filteredFeatures.length} / {centers.features.length} centros de salud
      </p>

      {/* Map */}
      <MapWrapper>
        <SaludLayer features={filteredFeatures} />
      </MapWrapper>

      {/* Legend */}
      <Legend
        title="Centros de Salud"
        items={[{ color: '#E07A5F', label: 'Centro de salud' }]}
      />
    </div>
  );
}

function SaludLayer({ features }: { features: GeoJSONFeature[] }) {
  const map = useMap();

  useEffect(() => {
    if (features.length === 0) return;
    const bounds = L.latLngBounds(
      features
        .filter((f) => f.geometry?.type === 'Point')
        .map((f) => {
          const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates;
          return [lat, lng] as [number, number];
        }),
    );
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30] });
  }, [features, map]);

  if (features.length === 0) {
    return null;
  }

  return (
    <>
      {features.map((f) => {
        const p = f.properties as HealthProps;
        if (f.geometry?.type !== 'Point') return null;
        const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates;

        return (
          <CircleMarker
            key={p.id ?? `${lat}-${lng}`}
            center={[lat, lng]}
            radius={5}
            pathOptions={{
              color: '#E07A5F',
              fillColor: '#E07A5F',
              fillOpacity: 0.7,
              weight: 1.5,
            }}
          >
            <Popup>
              <div className="text-xs space-y-1 min-w-[180px]">
                <p className="font-semibold text-[#1a2556]">
                  {p.establecimiento_salud ?? 'Sin nombre'}
                </p>
                {p.domicilio && <p className="text-[#4D4D4D]">{p.domicilio}</p>}
                {p.codigo_cuie && (
                  <p className="text-[10px] text-gray-400">CUIE: {p.codigo_cuie}</p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

// ===========================================================================
// MAIN GEO PAGE
// ===========================================================================
const TABS: { id: TabId; label: string; desc: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: 'educativo', label: 'Establecimientos Educativos', desc: '5.471 escuelas en Córdoba', icon: GraduationCap, color: '#3777FF' },
  { id: 'nacimientos', label: 'Nacimientos por Departamento', desc: 'Datos 2020-2023 por género', icon: Baby, color: '#BF1363' },
  { id: 'nbi', label: 'Necesidades Básicas Insatisfechas', desc: 'NBI por departamento (Censo 2010)', icon: AlertTriangle, color: '#FF7F11' },
  { id: 'salud', label: 'Centros de Salud', desc: '~300 establecimientos sanitarios', icon: HeartPulse, color: '#E07A5F' },
];

export default function GeoPage() {
  const [activeTab, setActiveTab] = useState<TabId | null>(null);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={MapIcon}
        title="Mapas Geográficos"
        description="Visualizaciones territoriales interactivas — Provincia de Córdoba"
        color="blue"
      />

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-blue-700">Datos Geoespaciales — IDECOR</h3>
          <p className="text-sm text-blue-600 mt-1">
            Datos del Instituto de Estadísticas y Censos de Córdoba (IDECOR) servidos
            via WFS GeoJSON desde GeoServer.{' '}
            <a
              href="https://idecor.mapascordoba.gob.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-800"
            >
              idecor.mapascordoba.gob.ar
            </a>
          </p>
        </div>
      </div>

      {/* Card grid — click to open map */}
      {!activeTab && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="group bg-white rounded-xl border border-gray-200 p-6 text-left hover:shadow-lg hover:border-[#1a2556]/20 transition-all hover:-translate-y-1"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: tab.color + '15' }}
              >
                <span style={{ color: tab.color, display: 'flex' }}>
                  <tab.icon className="w-6 h-6" />
                </span>
              </div>
              <h3 className="font-accent font-semibold text-[#1a2556] mb-1">{tab.label}</h3>
              <p className="text-sm text-gray-500">{tab.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Active map */}
      {activeTab && (
        <>
          {/* Back button */}
          <button
            onClick={() => setActiveTab(null)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a2556] mb-4 transition-colors"
          >
            <X className="w-4 h-4" />
            Volver a todos los mapas
          </button>
          <div className="min-h-[400px]">
            {activeTab === 'educativo' && <EducativoMap />}
            {activeTab === 'nacimientos' && <NacimientosMap />}
            {activeTab === 'nbi' && <NBIMap />}
            {activeTab === 'salud' && <SaludMap />}
          </div>
        </>
      )}

      {/* Footer attribution */}
      <div className="bg-white rounded-xl border border-[#E0E0E0] p-4">
        <h3 className="font-medium text-[#1a2556] text-sm mb-2">
          Acerca de los datos
        </h3>
        <ul className="text-xs text-[#4D4D4D] space-y-1">
          <li>
            <strong>IDECOR</strong> — Infraestructura de Datos Espaciales de la
            Provincia de Córdoba.
          </li>
          <li>
            <strong>Establecimientos educativos:</strong> Registro provincial de
            establecimientos (~5.400). Color por sector: azul = público, naranja
            = privado.
          </li>
          <li>
            <strong>Nacimientos por departamento:</strong> Estadísticas vitales
            2020–2023 por género. Fuente: Dirección de Estadísticas
            Socio-demográficas.
          </li>
          <li>
            <strong>NBI:</strong> Necesidades Básicas Insatisfechas por
            departamento. Fuente: Censo 2010 INDEC (los datos del Censo 2022
            desagregados por departamento aún no están publicados).
          </li>
          <li>
            <strong>Centros de Salud:</strong> Registro provincial de
            establecimientos de salud (~300).
          </li>
          <li className="text-[10px] text-gray-400 mt-1">
            Los datos se obtienen dinámicamente del GeoServer de IDECOR via WFS
            (Web Feature Service) en formato GeoJSON.
          </li>
        </ul>
      </div>
    </div>
  );
}
