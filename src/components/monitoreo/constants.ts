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
  'Economia',
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
  'Adicciones',
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
  'Muerte de etimología dudosa',
  'Apuestas online',
  'Muerte por accidente de tránsito',
  'Abandono',
  'Política',
  'Edad de Imputabilidad',
  'Bullying',
  'Muerte por enfrentamiento policial',
  'Infracciones',
  'Cuota alimentaria',
  'Adopción',
] as const;

export const ESTADO_OPTIONS = ['PENDIENTE', 'CARGADO', 'VERIFICADO', 'DESCARTADO'] as const;

export const FUENTE_CITADA_OPTIONS = [
  'Adulto protagonista',
  'Docente',
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
  'NNyA que murió de forma dudosa',
  'NNyA en relación a las apuestas',
  'NNyA abandonado',
  'NNyA en relación a la tecnología',
  'NNyA en relación a la política',
  'NNyA que no puede estudiar',
  'NNyA secuestrado',
  'NNyA que murió en un enfrentamiento policial',
  'Niños/as y Adolescentes',
  'NNyA que sufre pobreza',
  'NNyA que sufre inseguridad',
  'NNyA en relación a la cuota alimentaria',
  'NNyA en relación a la adopción',
] as const;

export const GENERO_ACTOR_OPTIONS = [
  'Ambos',
  'Femenino',
  'Masculino',
  'No consigna',
  'Otro',
] as const;

export const FRANJA_ETARIA_OPTIONS = ['Adolescentes', 'Niños', 'No consigna', 'Todos'] as const;

export const VICTIMARIO_VICTIMA_OPTIONS = ['Ambos', 'Ninguno', 'Victimario', 'Víctima'] as const;

export const PROVINCIA_OPTIONS = [
  'CABA',
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
] as const;

export const LOCALIDAD_CORDOBA_OPTIONS = [
  'Achiras', 'Adelia María', 'Agua de Oro', 'Alcira Gigena', 'Alejandro Roca',
  'Alejo Ledesma', 'Alicia', 'Almafuerte', 'Alpa Corral', 'Alta Gracia',
  'Alto Alegre', 'Altos de Chipión', 'Amboy', 'Ambul', 'Ana Zumarán',
  'Anisacate', 'Arias', 'Arroyito', 'Arroyo Algodón', 'Arroyo Cabral',
  'Ausonia', 'Avellaneda', 'Ballesteros', 'Ballesteros Sud', 'Balnearia',
  'Bañado de Soto', 'Bell Ville', 'Bengolea', 'Berrotarán', 'Bialet Massé',
  'Bouwer', 'Brinkmann', 'Buchardo', 'Bulnes', 'Cabalango',
  'Calchín', 'Calchín Oeste', 'Camilo Aldao', 'Caminiaga', 'Canals',
  'Candelaria Sud', 'Cañada de Luque', 'Capilla de los Remedios', 'Capilla del Monte',
  'Carnerillo', 'Carrilobo', 'Casa Grande', 'Cavanagh', 'Cerro Colorado',
  'Chaján', 'Chancani', 'Charbonier', 'Charras', 'Chazón',
  'Chilibroste', 'Chucul', 'Chuña', 'Cintra', 'Colazo',
  'Colonia Almada', 'Colonia Caroya', 'Colonia Italiana', 'Colonia Marina',
  'Colonia Prosperidad', 'Colonia San Bartolomé', 'Colonia Tirolesa', 'Colonia Vignaud',
  'Coronel Baigorria', 'Coronel Moldes', 'Corral de Bustos Ifflinger', 'Corralito',
  'Cosquín', 'Costa Sacate', 'Cruz Alta', 'Cruz del Eje', 'Cuesta Blanca',
  'Dalmacio Vélez', 'Deán Funes', 'Del Campillo', 'Despeñaderos', 'Devoto',
  'El Arañado', 'El Brete', 'El Fortín', 'El Manzano', 'El Tío',
  'Elena', 'Embalse', 'Estación General Paz', 'Estación Juárez Celman',
  'Estancia Vieja', 'Etruria', 'Falda del Carmen', 'Freyre', 'General Baldissera',
  'General Cabrera', 'General Deheza', 'General Levalle', 'General Roca',
  'Guatimozín', 'Hernando', 'Huanchilla', 'Huerta Grande', 'Huinca Renancó',
  'Idiazábal', 'Inriville', 'Isla Verde', 'Italó', 'James Craik',
  'Jesús María', 'Jovita', 'Justiniano Posse', 'La Calera', 'La Carlota',
  'La Cruz', 'La Cumbre', 'La Falda', 'La Francia', 'La Granja',
  'La Laguna', 'La Palestina', 'La Para', 'La Paz', 'La Playosa',
  'La Población', 'Laborde', 'Laboulaye', 'Laguna Larga', 'Las Acequias',
  'Las Higueras', 'Las Junturas', 'Las Perdices', 'Las Tapias', 'Las Varas',
  'Las Varillas', 'Leones', 'Los Cedros', 'Los Cerrillos', 'Los Cóndores',
  'Los Hornillos', 'Los Molinos', 'Los Reartes', 'Los Surgentes',
  'Lozada', 'Luque', 'Malagueño', 'Malvinas Argentinas', 'Manfredi',
  'Marcos Juárez', 'Marull', 'Matorrales', 'Mayu Sumaj', 'Mendiolaza',
  'Mi Granja', 'Mina Clavero', 'Miramar de Ansenuza', 'Monte Buey', 'Monte Maíz',
  'Monte Cristo', 'Morrison', 'Morteros', 'Noetinger', 'Nono',
  'Obispo Trejo', 'Olaeta', 'Oliva', 'Oncativo', 'Ordóñez',
  'Pampayasta Sud', 'Pascanas', 'Pasco', 'Pilar', 'Pincén',
  'Piquillín', 'Porteña', 'Potrero de Garay', 'Pozo del Molle',
  'Pueblo Italiano', 'Quebracho Herrado', 'Quilino', 'Rafael García',
  'Reducción', 'Río Ceballos', 'Río Cuarto', 'Río de los Sauces',
  'Río Primero', 'Río Segundo', 'Río Tercero', 'Sacanta', 'Saira',
  'Saldán', 'Salsacate', 'Salsipuedes', 'Sampacho', 'San Agustín',
  'San Antonio de Arredondo', 'San Antonio de Litín', 'San Basilio',
  'San Carlos Minas', 'San Esteban', 'San Francisco', 'San Francisco del Chañar',
  'San Javier y Yacanto', 'San José', 'San José de la Dormida',
  'San Lorenzo', 'San Marcos Sierra', 'San Marcos Sud', 'San Pedro',
  'San Roque', 'Santa Catalina Holmberg', 'Santa Eufemia', 'Santa María de Punilla',
  'Santa Rosa de Calamuchita', 'Santa Rosa de Río Primero', 'Santiago Temple',
  'Saturnino María Laspiur', 'Sebastián Elcano', 'Seeber', 'Serrano', 'Serrezuela',
  'Sinsacate', 'Tancacha', 'Tanti', 'Ticino', 'Tío Pujio',
  'Toledo', 'Tránsito', 'Ucacha', 'Unquillo', 'Valle Hermoso',
  'Viamonte', 'Vicuña Mackenna', 'Villa Allende', 'Villa Ascasubi',
  'Villa Carlos Paz', 'Villa Concepción del Tío', 'Villa Cura Brochero',
  'Villa de las Rosas', 'Villa de María', 'Villa de Soto', 'Villa del Dique',
  'Villa del Rosario', 'Villa del Totoral', 'Villa Dolores', 'Villa General Belgrano',
  'Villa Giardino', 'Villa Huidobro', 'Villa La Bolsa', 'Villa Los Aromos',
  'Villa María', 'Villa Nueva', 'Villa Parque Santa Ana', 'Villa Parque Síquiman',
  'Villa Río Icho Cruz', 'Villa Rumipal', 'Villa Santa Cruz del Lago',
  'Villa Sarmiento (San Alberto)', 'Villa Tulumba', 'Villa Valeria', 'Villa Yacanto',
  'Washington', 'Wenceslao Escalante',
] as const;

export const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  CARGADO: 'bg-blue-100 text-blue-800',
  VERIFICADO: 'bg-emerald-100 text-emerald-800',
  DESCARTADO: 'bg-slate-100 text-slate-500',
};

export const ITEMS_PER_PAGE = 50;

export const EMPTY_FORM_DATA: RegistroFormData = {
  quien_carga: '',
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

export function getMonthlyCounts(dates: (string | null)[]): { month: string; count: number }[] {
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
