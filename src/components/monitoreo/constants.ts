// ═══════════════════════════════════════════════════════════════════
// TYPES — shared monitoreo interfaces
// ═══════════════════════════════════════════════════════════════════

export interface MonitoreoRegistro {
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

export interface MonitoreoActor {
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

export interface ActorFormData {
  actor_descripcion: string;
  genero: string;
  franja_etaria: string;
  victimario_victima: string;
  rol: string;
  identificabilidad: boolean;
}

export interface RegistroFormData {
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

export interface RegistroConActores extends MonitoreoRegistro {
  monitoreo_actores: Pick<MonitoreoActor, 'id'>[];
}

export type ViewType = 'dashboard' | 'table' | 'form';

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS — select options
// ═══════════════════════════════════════════════════════════════════

export const MEDIO_OPTIONS = [
  'Cadena 3',
  'El doce',
  'La Voz',
  'La Voz de San Justo',
  'Puntal',
  'Villa Maria Vivo',
  'Otro',
] as const;

export const GENERO_PERIODISTICO_OPTIONS = ['Noticia', 'Informe', 'Opinión'] as const;

export const SECCION_OPTIONS = [
  'Deportes',
  'Espectaculos',
  'Opinión',
  'Política',
  'Salud',
  'Sociedad',
  'Sucesos',
] as const;

export const TOPICO_PRINCIPAL_OPTIONS = [
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

export const ESTADO_OPTIONS = ['PENDIENTE', 'CARGADO', 'VERIFICADO', 'DESCARTADO'] as const;

export const FUENTE_CITADA_OPTIONS = [
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

export const USO_FUENTES_OPTIONS = [
  'No usa fuentes',
  'Usa 1 fuente',
  'Usa 2 fuentes',
  'Usa 3 o más fuentes',
] as const;

export const ROL_OPTIONS = [
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

export const GENERO_ACTOR_OPTIONS = ['Ambos', 'Femenino', 'Masculino', 'No consigna', 'Otro'] as const;

export const FRANJA_ETARIA_OPTIONS = ['Adolescentes', 'Niños', 'Todos'] as const;

export const VICTIMARIO_VICTIMA_OPTIONS = ['Ninguno', 'Victimario', 'Víctima'] as const;

export const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  CARGADO: 'bg-blue-100 text-blue-800',
  VERIFICADO: 'bg-emerald-100 text-emerald-800',
  DESCARTADO: 'bg-slate-100 text-slate-500',
};

export const ITEMS_PER_PAGE = 50;

export const EMPTY_FORM_DATA: RegistroFormData = {
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

export const EMPTY_ACTOR: ActorFormData = {
  actor_descripcion: '',
  genero: '',
  franja_etaria: '',
  victimario_victima: '',
  rol: '',
  identificabilidad: false,
};

// ═══════════════════════════════════════════════════════════════════
// CHART COLORS — hex values for recharts, matching existing CSS vars
// ═══════════════════════════════════════════════════════════════════

export const CHART_COLORS_HEX = [
  '#f3a712', // --ddna-data-1 (Amber)
  '#bf1363', // --ddna-data-2 (Magenta)
  '#3777ff', // --ddna-data-5 (Blue)
  '#ff7f11', // --ddna-data-3 (Orange)
  '#a66999', // --ddna-data-7 (Mauve)
  '#3599b8', // --ddna-data-8 (Teal)
  '#4ac5bb', // --ddna-data-10 (Cyan)
  '#10B981', // extra green
  '#f4d25a', // --ddna-data-13
] as const;

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

export function formatDate(dateStr: string | null): string {
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

export function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-');
  const date = new Date(parseInt(y), parseInt(m) - 1);
  return date.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
}

export function getThisMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export function aggregateCounts<T extends string>(
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

export function getMonthlyCounts(
  dates: (string | null)[]
): { month: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const d of dates) {
    if (!d) continue;
    const date = new Date(d);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, count]) => ({ month, count }));
}
