'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Plus,
  LayoutDashboard,
  Table2,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Trash2,
  FileText,
  Calendar,
  Building2,
  Hash,
  List,
  MapPin,
  BookOpen,
  Newspaper,
  type LucideIcon,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoginGate } from '@/components/login-gate';
import clsx from 'clsx';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface MonitoreoRegistro {
  id: number;
  fecha_sincronizacion: string | null;
  planilla: string | null;
  quien_carga: string | null;
  estado: string;
  fecha_noticia: string | null;
  medio: string;
  titulo: string;
  genero_periodistico: string | null;
  seccion: string | null;
  topico_principal: string | null;
  caso: boolean | null;
  provincia: string | null;
  ciudad_cordoba: string | null;
  uso_estadisticas: boolean | null;
  fuente_citada_1: string | null;
  fuente_citada_2: string | null;
  uso_fuentes: string | null;
  created_at: string;
  updated_at: string;
}

interface MonitoreoActor {
  id: number;
  registro_id: number;
  orden: number;
  actor_descripcion: string | null;
  genero: string | null;
  franja_etaria: string | null;
  victimario_victima: string | null;
  rol: string | null;
  identificabilidad: boolean | null;
  created_at: string;
}

interface ActorFormData {
  actor_descripcion: string;
  genero: string;
  franja_etaria: string;
  victimario_victima: string;
  rol: string;
  identificabilidad: boolean;
}

interface RegistroFormData {
  quien_carga: string;
  estado: string;
  fecha_noticia: string;
  medio: string;
  titulo: string;
  genero_periodistico: string;
  seccion: string;
  topico_principal: string;
  caso: boolean;
  provincia: string;
  ciudad_cordoba: string;
  uso_estadisticas: boolean;
  fuente_citada_1: string;
  fuente_citada_2: string;
  uso_fuentes: string;
}

type ViewType = 'dashboard' | 'table' | 'form';

interface RegistroConActores extends MonitoreoRegistro {
  monitoreo_actores: Pick<MonitoreoActor, 'id'>[];
}

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const MEDIO_OPTIONS = [
  'Cadena 3',
  'El doce',
  'La Voz',
  'La Voz de San Justo',
  'Puntal',
  'Villa Maria Vivo',
  'Otro',
] as const;

const GENERO_PERIODISTICO_OPTIONS = ['Noticia', 'Informe', 'Opinión'] as const;

const SECCION_OPTIONS = [
  'Deportes',
  'Espectaculos',
  'Opinión',
  'Política',
  'Salud',
  'Sociedad',
  'Sucesos',
] as const;

const TOPICO_PRINCIPAL_OPTIONS = [
  'Abuso sexual',
  'Accidente de otros tipos',
  'Accidente de tránsito',
  'Accidente doméstico',
  'Acciones positivas',
  'Ahogamiento',
  'Asesinato',
  'Búsqueda de paradero',
  'Cuidados parentales',
  'Delincuencia',
  'Educación',
  'Empleo',
  'Grooming',
  'Identidad de NNyA',
  'Muerte por otras causas',
  'Pobreza',
  'Pornografía infantil',
  'Recreación, entretenimiento y deporte',
  'Redes sociales y tecnología',
  'Salud COVID 19',
  'Salud general',
  'Secuestro',
  'Suicidio',
  'Tenencia de armas',
  'Trata de NNyA',
  'Venta/tenencia de drogas',
  'Violencia de género',
  'Violencia de otros tipos',
  'Violencia entre pares',
  'Violencia familiar',
] as const;

const ESTADO_OPTIONS = ['PENDIENTE', 'CARGADO', 'VERIFICADO', 'DESCARTADO'] as const;

const FUENTE_CITADA_OPTIONS = [
  'Adulto protagonista',
  'Especialistas',
  'Fuentes familiares',
  'Fuentes gubernamentales',
  'Fuentes judiciales',
  'Fuentes policiales',
  'NNyA protagonista',
  'No cita fuentes',
  'ONGs',
  'Otro medio',
  'Redes sociales',
  'Testigo',
] as const;

const USO_FUENTES_OPTIONS = [
  'No usa fuentes',
  'Usa 1 fuente',
  'Usa 2 fuentes',
  'Usa 3 o más fuentes',
] as const;

const ROL_OPTIONS = [
  'Adolescente',
  'Bebé',
  'NNyA TESTIGO/víctima de violencia de género',
  'NNyA abusado sexualmente',
  'NNyA accidentado',
  'NNyA agredido',
  'NNyA agresor',
  'NNyA asesinado',
  'NNyA buscado',
  'NNyA con discapacidad',
  'NNyA drogodependiente',
  'NNyA en relación a la salud',
  'NNyA en relación al consumo de alcohol',
  'NNyA en relación al empleo',
  'NNyA en relación al entretenimiento, recreación y deporte',
  'NNyA encontrado',
  'NNyA estudiante',
  'NNyA privado de su libertad',
  'NNyA que cometió asesinato',
  'NNyA que cometió un delito',
  'NNyA que cometió una infracción',
  'NNyA que murió por condiciones de salud',
  'NNyA que murió por un accidente',
  'NNyA que realizó acciones positivas',
  'NNyA sin cuidados parentales',
  'NNyA victima de grooming',
  'NNyA víctima de trata',
  'Niño/a',
  'NNYA que cometió abuso',
] as const;

const GENERO_ACTOR_OPTIONS = ['Ambos', 'Femenino', 'Masculino', 'No consigna', 'Otro'] as const;

const FRANJA_ETARIA_OPTIONS = ['Adolescentes', 'Niños', 'Todos'] as const;

const VICTIMARIO_VICTIMA_OPTIONS = ['Ninguno', 'Victimario', 'Víctima'] as const;

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  CARGADO: 'bg-blue-100 text-blue-800',
  VERIFICADO: 'bg-emerald-100 text-emerald-800',
  DESCARTADO: 'bg-slate-100 text-slate-500',
};

const CHART_COLORS = [
  'bg-[var(--ddna-data-1)]',
  'bg-[var(--ddna-data-2)]',
  'bg-[var(--ddna-data-5)]',
  'bg-[var(--ddna-data-3)]',
  'bg-[var(--ddna-data-7)]',
  'bg-[var(--ddna-data-8)]',
  'bg-[var(--ddna-data-10)]',
];

const CHART_COLORS_HEX = [
  'var(--ddna-data-1)',
  'var(--ddna-data-2)',
  'var(--ddna-data-5)',
  'var(--ddna-data-3)',
  'var(--ddna-data-7)',
  'var(--ddna-data-8)',
  'var(--ddna-data-10)',
];

const ITEMS_PER_PAGE = 50;

const EMPTY_FORM_DATA: RegistroFormData = {
  quien_carga: '',
  estado: 'PENDIENTE',
  fecha_noticia: '',
  medio: '',
  titulo: '',
  genero_periodistico: '',
  seccion: '',
  topico_principal: '',
  caso: false,
  provincia: '',
  ciudad_cordoba: '',
  uso_estadisticas: false,
  fuente_citada_1: '',
  fuente_citada_2: '',
  uso_fuentes: '',
};

const EMPTY_ACTOR: ActorFormData = {
  actor_descripcion: '',
  genero: '',
  franja_etaria: '',
  victimario_victima: '',
  rol: '',
  identificabilidad: false,
};

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-');
  const date = new Date(parseInt(y), parseInt(m) - 1);
  return date.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
}

function getThisMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function aggregateCounts<T extends string>(
  items: (T | null)[]
): { label: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const item of items) {
    if (item) {
      counts[item] = (counts[item] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function getMonthlyCounts(dates: string[]): { month: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const d of dates) {
    const date = new Date(d);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, count]) => ({ month, count }));
}

// ═══════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function StateBadge({ estado }: { estado: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        ESTADO_COLORS[estado] || 'bg-slate-100 text-slate-600'
      )}
    >
      {estado}
    </span>
  );
}

function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={value}
          onChange={e => onChange(e.target.checked)}
        />
        <div
          className={clsx(
            'block w-10 h-6 rounded-full transition-colors',
            value ? 'bg-[var(--ddna-blue)]' : 'bg-slate-300'
          )}
        />
        <div
          className={clsx(
            'absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm',
            value && 'translate-x-4'
          )}
        />
      </div>
      <span className="text-sm text-slate-700 group-hover:text-slate-900">{label}</span>
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent bg-white"
      >
        <option value="">{placeholder || `Seleccionar ${label.toLowerCase()}`}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent"
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD VIEW
// ═══════════════════════════════════════════════════════════════════

function DashboardView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [monthCount, setMonthCount] = useState(0);
  const [topicCounts, setTopicCounts] = useState<{ label: string; count: number }[]>([]);
  const [medioCounts, setMedioCounts] = useState<{ label: string; count: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; count: number }[]>([]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const monthStart = getThisMonthStart();

      const [{ count: total }, { count: month }, { data: allData }] = await Promise.all([
        supabase.from('monitoreo_registros').select('*', { count: 'exact', head: true }),
        supabase
          .from('monitoreo_registros')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', monthStart),
        supabase
          .from('monitoreo_registros')
          .select('created_at, topico_principal, medio')
          .limit(5000),
      ]);

      setTotalCount(total ?? 0);
      setMonthCount(month ?? 0);

      if (allData) {
        setTopicCounts(aggregateCounts(allData.map(r => r.topico_principal)).slice(0, 5));
        setMedioCounts(aggregateCounts(allData.map(r => r.medio)));
        setMonthlyData(getMonthlyCounts(allData.map(r => r.created_at)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--ddna-blue)] animate-spin" />
        <span className="ml-3 text-slate-500">Cargando dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-slate-600">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-[var(--ddna-blue)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const maxTopicCount = topicCounts.length > 0 ? topicCounts[0].count : 1;
  const maxMedioCount = medioCounts.length > 0 ? medioCounts[0].count : 1;
  const maxMonthlyCount = monthlyData.length > 0 ? Math.max(...monthlyData.map(d => d.count)) : 1;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--ddna-blue)]/10 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-[var(--ddna-blue)]" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalCount}</p>
          <p className="text-sm text-slate-500 mt-1">Total de registros</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{monthCount}</p>
          <p className="text-sm text-slate-500 mt-1">Registros este mes</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <List className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{topicCounts.length}</p>
          <p className="text-sm text-slate-500 mt-1">Tópicos principales</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{medioCounts.length}</p>
          <p className="text-sm text-slate-500 mt-1">Medios distintos</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 tópicos */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Hash className="w-4 h-4 text-[var(--ddna-blue)]" />
            Principales tópicos
          </h3>
          {topicCounts.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>
          ) : (
            <div className="space-y-3">
              {topicCounts.map((topic, i) => (
                <div key={topic.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 truncate mr-2">{topic.label}</span>
                    <span className="text-slate-500 font-medium flex-shrink-0">{topic.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all duration-500',
                        CHART_COLORS[i % CHART_COLORS.length]
                      )}
                      style={{ width: `${(topic.count / maxTopicCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Distribución por medio */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[var(--ddna-blue)]" />
            Distribución por medio
          </h3>
          {medioCounts.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>
          ) : (
            <div className="space-y-3">
              {medioCounts.map((medio, i) => (
                <div key={medio.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 truncate mr-2">{medio.label}</span>
                    <span className="text-slate-500 font-medium flex-shrink-0">{medio.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all duration-500',
                        CHART_COLORS[(i + 3) % CHART_COLORS.length]
                      )}
                      style={{ width: `${(medio.count / maxMedioCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Evolución mensual */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--ddna-blue)]" />
          Evolución mensual
        </h3>
        {monthlyData.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>
        ) : (
          <div className="relative pt-6 pb-2">
            {/* Bars */}
            <div className="flex items-end justify-between gap-1.5 h-40">
              {monthlyData.map(d => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <span className="text-xs text-slate-500 font-medium">{d.count}</span>
                  <div
                    className="w-full rounded-t-md bg-[var(--ddna-blue)] hover:opacity-80 transition-opacity"
                    style={{
                      height: `${Math.max((d.count / maxMonthlyCount) * 100, 4)}%`,
                    }}
                  />
                </div>
              ))}
            </div>
            {/* Month labels */}
            <div className="flex justify-between gap-1.5 mt-2">
              {monthlyData.map(d => (
                <span key={d.month} className="flex-1 text-center text-xs text-slate-400 truncate">
                  {formatMonthLabel(d.month)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TABLE VIEW
// ═══════════════════════════════════════════════════════════════════

function TableView({ onEditRegistro }: { onEditRegistro: (id: number) => void }) {
  const [registros, setRegistros] = useState<RegistroConActores[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [filterMedio, setFilterMedio] = useState('');
  const [filterTopico, setFilterTopico] = useState('');
  const [filterSeccion, setFilterSeccion] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const fetchRegistros = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('monitoreo_registros')
        .select('*, monitoreo_actores(id)', { count: 'exact' });

      if (search) {
        query = query.ilike('titulo', `%${search}%`);
      }
      if (filterMedio) {
        query = query.eq('medio', filterMedio);
      }
      if (filterTopico) {
        query = query.eq('topico_principal', filterTopico);
      }
      if (filterSeccion) {
        query = query.eq('seccion', filterSeccion);
      }
      if (filterEstado) {
        query = query.eq('estado', filterEstado);
      }
      if (fechaDesde) {
        query = query.gte('fecha_noticia', fechaDesde);
      }
      if (fechaHasta) {
        query = query.lte('fecha_noticia', fechaHasta);
      }

      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const {
        data,
        count,
        error: fetchError,
      } = await query.order('created_at', { ascending: false }).range(from, to);

      if (fetchError) throw fetchError;

      setRegistros((data ?? []) as RegistroConActores[]);
      setTotalCount(count ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar registros');
    } finally {
      setLoading(false);
    }
  }, [
    search,
    filterMedio,
    filterTopico,
    filterSeccion,
    filterEstado,
    fechaDesde,
    fechaHasta,
    page,
  ]);

  useEffect(() => {
    fetchRegistros();
  }, [fetchRegistros]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [search, filterMedio, filterTopico, filterSeccion, filterEstado, fechaDesde, fechaHasta]);

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent"
            />
          </div>

          {/* Medio filter */}
          <select
            value={filterMedio}
            onChange={e => setFilterMedio(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent"
          >
            <option value="">Todos los medios</option>
            {MEDIO_OPTIONS.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Sección filter */}
          <select
            value={filterSeccion}
            onChange={e => setFilterSeccion(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent"
          >
            <option value="">Todas las secciones</option>
            {SECCION_OPTIONS.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Estado filter */}
          <select
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            {ESTADO_OPTIONS.map(e => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          {/* Tópico filter */}
          <select
            value={filterTopico}
            onChange={e => setFilterTopico(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent"
          >
            <option value="">Todos los tópicos</option>
            {TOPICO_PRINCIPAL_OPTIONS.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Fecha desde */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Fecha desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={e => setFechaDesde(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent"
            />
          </div>

          {/* Fecha hasta */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Fecha hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={e => setFechaHasta(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent"
            />
          </div>

          {/* Active filters indicator */}
          <div className="flex items-end">
            {(search ||
              filterMedio ||
              filterTopico ||
              filterSeccion ||
              filterEstado ||
              fechaDesde ||
              fechaHasta) && (
              <button
                onClick={() => {
                  setSearch('');
                  setFilterMedio('');
                  setFilterTopico('');
                  setFilterSeccion('');
                  setFilterEstado('');
                  setFechaDesde('');
                  setFechaHasta('');
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results count & pagination */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          {totalCount} registro{totalCount !== 1 ? 's' : ''}
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin inline ml-2" />}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-slate-700 font-medium min-w-[4rem] text-center">
            {totalPages > 0 ? `${page + 1} / ${totalPages}` : '—'}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 bg-white rounded-xl border border-slate-200">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-slate-600 text-sm">{error}</p>
          <button
            onClick={fetchRegistros}
            className="px-4 py-2 bg-[var(--ddna-blue)] text-white rounded-lg text-sm hover:opacity-90"
          >
            Reintentar
          </button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-[var(--ddna-blue)] animate-spin" />
        </div>
      ) : registros.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200 gap-3">
          <FileText className="w-12 h-12 text-slate-300" />
          <p className="text-slate-500">No se encontraron registros</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Medio
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Sección
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tópico
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Caso
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actores
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registros.map(r => (
                  <tr
                    key={r.id}
                    onClick={() => onEditRegistro(r.id)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {formatDate(r.fecha_noticia)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800 font-medium">{r.medio}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate">
                      {r.titulo}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{r.seccion || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-[200px] truncate">
                      {r.topico_principal || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {r.caso ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Sí
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[var(--ddna-blue)]/10 text-xs font-medium text-[var(--ddna-blue)]">
                        {r.monitoreo_actores?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StateBadge estado={r.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom pagination */}
      {registros.length > 0 && (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <span className="text-sm text-slate-500 px-2">
            {page + 1} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// FORM VIEW
// ═══════════════════════════════════════════════════════════════════

function FormView({
  editingId,
  onSave,
  onCancel,
}: {
  editingId: number | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<RegistroFormData>(EMPTY_FORM_DATA);
  const [actors, setActors] = useState<ActorFormData[]>([{ ...EMPTY_ACTOR }]);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(!!editingId);
  const [error, setError] = useState<string | null>(null);

  // Load existing registro if editing
  useEffect(() => {
    if (!editingId) return;
    let cancelled = false;

    async function load() {
      try {
        const { data: registro, error: regError } = await supabase
          .from('monitoreo_registros')
          .select('*')
          .eq('id', editingId)
          .single();

        if (regError) throw regError;
        if (!registro || cancelled) return;

        const { data: actorData } = await supabase
          .from('monitoreo_actores')
          .select('*')
          .eq('registro_id', editingId)
          .order('orden', { ascending: true });

        if (cancelled) return;

        setFormData({
          quien_carga: registro.quien_carga ?? '',
          estado: registro.estado,
          fecha_noticia: registro.fecha_noticia ?? '',
          medio: registro.medio,
          titulo: registro.titulo,
          genero_periodistico: registro.genero_periodistico ?? '',
          seccion: registro.seccion ?? '',
          topico_principal: registro.topico_principal ?? '',
          caso: registro.caso ?? false,
          provincia: registro.provincia ?? '',
          ciudad_cordoba: registro.ciudad_cordoba ?? '',
          uso_estadisticas: registro.uso_estadisticas ?? false,
          fuente_citada_1: registro.fuente_citada_1 ?? '',
          fuente_citada_2: registro.fuente_citada_2 ?? '',
          uso_fuentes: registro.uso_fuentes ?? '',
        });

        if (actorData && actorData.length > 0) {
          setActors(
            actorData.map((a: MonitoreoActor) => ({
              actor_descripcion: a.actor_descripcion ?? '',
              genero: a.genero ?? '',
              franja_etaria: a.franja_etaria ?? '',
              victimario_victima: a.victimario_victima ?? '',
              rol: a.rol ?? '',
              identificabilidad: a.identificabilidad ?? false,
            }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar registro');
        }
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [editingId]);

  const updateFormField = <K extends keyof RegistroFormData>(
    key: K,
    value: RegistroFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const updateActor = (index: number, field: keyof ActorFormData, value: string | boolean) => {
    setActors(prev => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  };

  const addActor = () => {
    if (actors.length >= 3) return;
    setActors(prev => [...prev, { ...EMPTY_ACTOR }]);
  };

  const removeActor = (index: number) => {
    setActors(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!formData.medio || !formData.titulo) {
        throw new Error('Medio y título son obligatorios');
      }

      const registroPayload = {
        quien_carga: formData.quien_carga || null,
        estado: formData.estado,
        fecha_noticia: formData.fecha_noticia || null,
        medio: formData.medio,
        titulo: formData.titulo,
        genero_periodistico: formData.genero_periodistico || null,
        seccion: formData.seccion || null,
        topico_principal: formData.topico_principal || null,
        caso: formData.caso || false,
        provincia: formData.provincia || null,
        ciudad_cordoba: formData.ciudad_cordoba || null,
        uso_estadisticas: formData.uso_estadisticas || false,
        fuente_citada_1: formData.fuente_citada_1 || null,
        fuente_citada_2: formData.fuente_citada_2 || null,
        uso_fuentes: formData.uso_fuentes || null,
      };

      if (editingId) {
        // UPDATE existing
        const { error: updateError } = await supabase
          .from('monitoreo_registros')
          .update(registroPayload)
          .eq('id', editingId);

        if (updateError) throw updateError;

        // Replace actors: delete all, re-insert
        await supabase.from('monitoreo_actores').delete().eq('registro_id', editingId);

        const validActors = actors
          .map((a, i) => ({
            registro_id: editingId,
            orden: i + 1,
            actor_descripcion: a.actor_descripcion || null,
            genero: a.genero || null,
            franja_etaria: a.franja_etaria || null,
            victimario_victima: a.victimario_victima || null,
            rol: a.rol || null,
            identificabilidad: a.identificabilidad || false,
          }))
          .filter(a => a.actor_descripcion);

        if (validActors.length > 0) {
          const { error: actError } = await supabase.from('monitoreo_actores').insert(validActors);
          if (actError) throw actError;
        }
      } else {
        // INSERT new
        const { data: newRegistro, error: insertError } = await supabase
          .from('monitoreo_registros')
          .insert(registroPayload)
          .select('id')
          .single();

        if (insertError) throw insertError;
        if (!newRegistro) throw new Error('No se pudo crear el registro');

        // Insert actors
        const validActors = actors
          .map((a, i) => ({
            registro_id: newRegistro.id,
            orden: i + 1,
            actor_descripcion: a.actor_descripcion || null,
            genero: a.genero || null,
            franja_etaria: a.franja_etaria || null,
            victimario_victima: a.victimario_victima || null,
            rol: a.rol || null,
            identificabilidad: a.identificabilidad || false,
          }))
          .filter(a => a.actor_descripcion);

        if (validActors.length > 0) {
          const { error: actError } = await supabase.from('monitoreo_actores').insert(validActors);
          if (actError) throw actError;
        }
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--ddna-blue)] animate-spin" />
        <span className="ml-3 text-slate-500">Cargando registro...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          {editingId ? 'Editar registro' : 'Nuevo registro'}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-[var(--ddna-blue)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                {editingId ? 'Actualizar' : 'Guardar'}
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Metadatos ─────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--ddna-blue)]" />
          Metadatos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Quién carga"
            value={formData.quien_carga}
            onChange={v => updateFormField('quien_carga', v)}
            placeholder="Nombre de la persona"
          />
          <SelectField
            label="Estado"
            value={formData.estado}
            options={ESTADO_OPTIONS}
            onChange={v => updateFormField('estado', v)}
            required
          />
        </div>
      </section>

      {/* ── Contenido ─────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-[var(--ddna-blue)]" />
          Contenido
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <TextInput
              label="Fecha de la noticia"
              type="date"
              value={formData.fecha_noticia}
              onChange={v => updateFormField('fecha_noticia', v)}
            />
            <SelectField
              label="Medio"
              value={formData.medio}
              options={MEDIO_OPTIONS}
              onChange={v => updateFormField('medio', v)}
              required
            />
            <SelectField
              label="Género periodístico"
              value={formData.genero_periodistico}
              options={GENERO_PERIODISTICO_OPTIONS}
              onChange={v => updateFormField('genero_periodistico', v)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Título <span className="text-red-500 ml-0.5">*</span>
            </label>
            <textarea
              value={formData.titulo}
              onChange={e => updateFormField('titulo', e.target.value)}
              placeholder="Título de la noticia"
              required
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SelectField
              label="Sección"
              value={formData.seccion}
              options={SECCION_OPTIONS}
              onChange={v => updateFormField('seccion', v)}
            />
            <SelectField
              label="Tópico principal"
              value={formData.topico_principal}
              options={TOPICO_PRINCIPAL_OPTIONS}
              onChange={v => updateFormField('topico_principal', v)}
            />
            <div className="flex items-center pt-6">
              <Toggle
                label="¿Es un caso?"
                value={formData.caso}
                onChange={v => updateFormField('caso', v)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Ubicación ─────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[var(--ddna-blue)]" />
          Ubicación
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Provincia"
            value={formData.provincia}
            onChange={v => updateFormField('provincia', v)}
            placeholder="Córdoba"
          />
          <TextInput
            label="Ciudad de Córdoba"
            value={formData.ciudad_cordoba}
            onChange={v => updateFormField('ciudad_cordoba', v)}
            placeholder="Barrio / localidad"
          />
        </div>
      </section>

      {/* ── Fuentes ───────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[var(--ddna-blue)]" />
          Fuentes
        </h3>
        <div className="space-y-4">
          <Toggle
            label="¿Usa estadísticas?"
            value={formData.uso_estadisticas}
            onChange={v => updateFormField('uso_estadisticas', v)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SelectField
              label="Fuente citada 1"
              value={formData.fuente_citada_1}
              options={FUENTE_CITADA_OPTIONS}
              onChange={v => updateFormField('fuente_citada_1', v)}
              placeholder="Seleccionar fuente"
            />
            <SelectField
              label="Fuente citada 2"
              value={formData.fuente_citada_2}
              options={FUENTE_CITADA_OPTIONS}
              onChange={v => updateFormField('fuente_citada_2', v)}
              placeholder="Seleccionar fuente"
            />
            <SelectField
              label="Uso de fuentes"
              value={formData.uso_fuentes}
              options={USO_FUENTES_OPTIONS}
              onChange={v => updateFormField('uso_fuentes', v)}
              placeholder="Cantidad de fuentes"
            />
          </div>
        </div>
      </section>

      {/* ── Actores ─────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[var(--ddna-blue)]" />
            Actores
          </h3>
          {actors.length < 3 && (
            <button
              type="button"
              onClick={addActor}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--ddna-blue)] border border-[var(--ddna-blue)]/30 rounded-lg hover:bg-[var(--ddna-blue)]/5 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Agregar actor
            </button>
          )}
        </div>

        <div className="space-y-6">
          {actors.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              No hay actores. Hacé clic en "Agregar actor" para añadir uno.
            </p>
          )}

          {actors.map((actor, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">Actor #{index + 1}</span>
                {actors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeActor(index)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Quitar
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <TextInput
                  label="Descripción del actor"
                  value={actor.actor_descripcion}
                  onChange={v => updateActor(index, 'actor_descripcion', v)}
                  placeholder="Descripción o nombre"
                />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <SelectField
                    label="Género"
                    value={actor.genero}
                    options={GENERO_ACTOR_OPTIONS}
                    onChange={v => updateActor(index, 'genero', v)}
                  />
                  <SelectField
                    label="Franja etaria"
                    value={actor.franja_etaria}
                    options={FRANJA_ETARIA_OPTIONS}
                    onChange={v => updateActor(index, 'franja_etaria', v)}
                  />
                  <SelectField
                    label="Victimario / Víctima"
                    value={actor.victimario_victima}
                    options={VICTIMARIO_VICTIMA_OPTIONS}
                    onChange={v => updateActor(index, 'victimario_victima', v)}
                  />
                  <SelectField
                    label="Rol"
                    value={actor.rol}
                    options={ROL_OPTIONS}
                    onChange={v => updateActor(index, 'rol', v)}
                  />
                </div>
                <Toggle
                  label="¿Identificable?"
                  value={actor.identificabilidad}
                  onChange={v => updateActor(index, 'identificabilidad', v)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom save bar */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[var(--ddna-blue)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              {editingId ? 'Actualizar registro' : 'Guardar registro'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB BUTTONS
// ═══════════════════════════════════════════════════════════════════

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
        active
          ? 'bg-white text-[var(--ddna-blue)] shadow-sm border border-slate-200'
          : 'text-white/70 hover:text-white hover:bg-white/10'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

export default function MonitoreoPage() {
  const [view, setView] = useState<ViewType>('dashboard');
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleNewClick = () => {
    setEditingId(null);
    setView('form');
  };

  const handleEditRegistro = (id: number) => {
    setEditingId(id);
    setView('form');
  };

  const handleSaveSuccess = () => {
    setEditingId(null);
    setView('table');
  };

  const handleCancel = () => {
    setEditingId(null);
    setView('table');
  };

  return (
    <LoginGate>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a2556] to-[#2a3570]">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="font-display text-2xl text-white">Monitoreo de Medios</h1>
                <p className="text-sm text-white/60 mt-1">
                  Registro y seguimiento de noticias sobre NNyA en medios de Córdoba
                </p>
              </div>
              {view !== 'form' && (
                <button
                  onClick={handleNewClick}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-sm font-medium transition-all backdrop-blur-sm"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo registro
                </button>
              )}
            </div>

            {/* Tab navigation */}
            <div className="flex items-center gap-2">
              <TabButton
                active={view === 'dashboard'}
                icon={LayoutDashboard}
                label="Dashboard"
                onClick={() => setView('dashboard')}
              />
              <TabButton
                active={view === 'table'}
                icon={Table2}
                label="Tabla"
                onClick={() => setView('table')}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {view === 'dashboard' && <DashboardView />}
          {view === 'table' && <TableView onEditRegistro={handleEditRegistro} />}
          {view === 'form' && (
            <FormView editingId={editingId} onSave={handleSaveSuccess} onCancel={handleCancel} />
          )}
        </div>
      </div>
    </LoginGate>
  );
}
