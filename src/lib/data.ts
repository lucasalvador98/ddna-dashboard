// Tipos y datos placeholder para cuando Supabase aún no esté conectado
// Eliminar una vez que el backend esté activo

export type CategoriaIndicador =
  | "salud"
  | "educacion"
  | "pobreza"
  | "seguridad"
  | "inversion"
  | "demografia"
  | "deis"
  | "aprender"
  | "justicia"
  | "salud_adolescente"
  | "anuario_educacion"
  | "consumo";

export interface KpiData {
  id: string;
  categoria: CategoriaIndicador;
  nombre: string;
  valor: string;
  subtitulo: string;
  cambio?: string;
  cambioTipo?: "up" | "down" | "neutral";
  unidad?: string;
}

export const kpisPlaceholder: KpiData[] = [
  {
    id: "pobreza-infantil",
    categoria: "pobreza",
    nombre: "Pobreza infantil",
    valor: "42,3%",
    subtitulo: "Niñas, niños y adolescentes bajo línea de pobreza",
    cambio: "-2,1 pp",
    cambioTipo: "down",
    unidad: "%",
  },
  {
    id: "mortalidad-infantil",
    categoria: "salud",
    nombre: "Mortalidad infantil",
    valor: "7,2‰",
    subtitulo: "Tasa por cada mil nacidos vivos",
    cambio: "-0,8‰",
    cambioTipo: "down",
    unidad: "‰",
  },
  {
    id: "escolarizacion",
    categoria: "educacion",
    nombre: "Escolarización",
    valor: "89,1%",
    subtitulo: "Tasa neta de escolarización",
    cambio: "+1,3 pp",
    cambioTipo: "up",
    unidad: "%",
  },
  {
    id: "inversion-social",
    categoria: "inversion",
    nombre: "Inversión social",
    valor: "$XX.X Md",
    subtitulo: "Destinado a infancia y adolescencia",
    cambio: "+12,4%",
    cambioTipo: "up",
    unidad: "Md",
  },
  {
    id: "adolescentes",
    categoria: "demografia",
    nombre: "Adolescentes",
    valor: "712.340",
    subtitulo: "Población de 12-17 años",
    unidad: "hab",
  },
  {
    id: "denuncias",
    categoria: "seguridad",
    nombre: "Denuncias",
    valor: "2.847",
    subtitulo: "Registradas en el último período",
    cambio: "+156",
    cambioTipo: "up",
    unidad: "casos",
  },
];

export const categoriasInfo: Record<
  CategoriaIndicador,
  { titulo: string; descripcion: string; color: string; icono: string }
> = {
  salud: {
    titulo: "Salud",
    descripcion:
      "Indicadores de salud infantil y adolescente: mortalidad, cobertura vacunal, acceso a servicios de salud, salud mental.",
    color: "#E07A5F",
    icono: "Heart",
  },
  educacion: {
    titulo: "Educación",
    descripcion:
      "Indicadores educativos: tasa de escolarización, resultados evaluaciones Aprender, abandono, sobreedad.",
    color: "#F3A712",
    icono: "BookOpen",
  },
  pobreza: {
    titulo: "Pobreza",
    descripcion:
      "Indicadores de pobreza y vulnerabilidad: incidencia, brechas, pobreza multidimensional, indigencia.",
    color: "#BF1363",
    icono: "Users",
  },
  seguridad: {
    titulo: "Seguridad",
    descripcion:
      "Indicadores de seguridad y justicia: denuncias, violencia, conflicto con la ley penal, protección digital.",
    color: "#3777FF",
    icono: "Shield",
  },
  inversion: {
    titulo: "Inversión Social",
    descripcion:
      "Análisis de la inversión pública destinada a niñez y adolescencia: presupuesto ejecutado, comparativas interanuales.",
    color: "#FFB347",
    icono: "Coins",
  },
  demografia: {
    titulo: "Demografía",
    descripcion:
      "Datos poblacionales: censo, proyecciones, composición etaria, distribución geográfica.",
    color: "#00074E",
    icono: "BarChart3",
  },
  deis: {
    titulo: "Estadísticas Vitales (DEIS)",
    descripcion:
      "Nacimientos, mortalidad fetal y perinatal, estadísticas vitales del Ministerio de Salud.",
    color: "#8B5CF6",
    icono: "Baby",
  },
  aprender: {
    titulo: "Evaluaciones Aprender",
    descripcion:
      "Resultados de evaluaciones educativas nacionales por área, nivel y quintil de ingreso.",
    color: "#10B981",
    icono: "GraduationCap",
  },
  justicia: {
    titulo: "Justicia",
    descripcion:
      "Causos judiciales relacionados con infancia: familia, violencia familiar, Penal Juvenil.",
    color: "#6366F1",
    icono: "Scale",
  },
  salud_adolescente: {
    titulo: "Salud Adolescente",
    descripcion:
      "Indicadores de salud sexual y reproductiva, natalidad, fecundidad en adolescentes.",
    color: "#EC4899",
    icono: "HeartPulse",
  },
  anuario_educacion: {
    titulo: "Anuario Educativo",
    descripcion:
      "Matrícula educativa por nivel: inicial, primario, secundario, superior no universitario.",
    color: "#F59E0B",
    icono: "School",
  },
  consumo: {
    titulo: "Consumo Hogares",
    descripcion:
      "Características de hogares con menores: tamaño, ingreso per cápita, condiciones de vida.",
    color: "#14B8A6",
    icono: "Home",
  },
};