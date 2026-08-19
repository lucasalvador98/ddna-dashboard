// Datos placeholder centralizados para gráficos por sección.
// Se usan como fallback cuando Supabase no está disponible o no hay datos.
// Cada sección tiene sus chart data key específicos que las páginas referencian.

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface CategoryChartData {
  charts: Record<string, ChartDataPoint[]>;
}

export const placeholderChartData: Record<string, CategoryChartData> = {
  salud: {
    charts: {
      mortalidad: [
        { year: "2018", cordoba: 8.9, argentina: 9.4 },
        { year: "2019", cordoba: 8.5, argentina: 9.1 },
        { year: "2020", cordoba: 7.8, argentina: 8.4 },
        { year: "2021", cordoba: 7.6, argentina: 8.2 },
        { year: "2022", cordoba: 7.4, argentina: 7.9 },
        { year: "2023", cordoba: 7.1, argentina: 7.6 },
        { year: "2024", cordoba: 6.8, argentina: 7.2 },
      ],
      vacunal: [
        { vaccine: "BCG", cobertura: 94.2 },
        { vaccine: "Polio", cobertura: 91.8 },
        { vaccine: "Sarampión", cobertura: 89.5 },
        { vaccine: "Triple Viral", cobertura: 87.3 },
        { vaccine: "Hepatitis B", cobertura: 95.1 },
        { vaccine: "Neumococo", cobertura: 88.9 },
      ],
    },
  },

  educacion: {
    charts: {
      escolarizacion: [
        { year: "2018", inicial: 84.2, primario: 98.1, secundario: 78.5 },
        { year: "2019", inicial: 85.8, primario: 98.3, secundario: 79.8 },
        { year: "2020", inicial: 83.1, primario: 97.8, secundario: 76.2 },
        { year: "2021", inicial: 86.4, primario: 98.5, secundario: 80.3 },
        { year: "2022", inicial: 87.9, primario: 98.7, secundario: 82.1 },
        { year: "2023", inicial: 89.2, primario: 99.1, secundario: 84.6 },
        { year: "2024", inicial: 90.8, primario: 99.3, secundario: 86.2 },
      ],
      aprender: [
        { area: "Lengua", satisfactorio: 62.4, basico: 24.1, debajo: 13.5 },
        { area: "Matemática", satisfactorio: 48.7, basico: 31.2, debajo: 20.1 },
        { area: "Cs. Naturales", satisfactorio: 55.8, basico: 28.4, debajo: 15.8 },
        { area: "Cs. Sociales", satisfactorio: 58.2, basico: 27.1, debajo: 14.7 },
      ],
    },
  },

  pobreza: {
    charts: {
      pobreza: [
        { year: "2018", pobreza: 49.2, indigencia: 12.8 },
        { year: "2019", pobreza: 47.1, indigencia: 11.9 },
        { year: "2020", pobreza: 52.4, indigencia: 15.3 },
        { year: "2021", pobreza: 54.2, indigencia: 17.1 },
        { year: "2022", pobreza: 51.8, indigencia: 15.8 },
        { year: "2023", pobreza: 48.3, indigencia: 13.4 },
        { year: "2024", pobreza: 45.7, indigencia: 11.9 },
      ],
      brecha: [
        { grupo: "0-5 años", pobreza: 52.4, brecha: 8.2 },
        { grupo: "6-12 años", pobreza: 48.1, brecha: 3.9 },
        { grupo: "13-17 años", pobreza: 44.8, brecha: 0.6 },
      ],
    },
  },

  seguridad: {
    charts: {
      denuncias: [
        { year: "2019", cantidad: 1847 },
        { year: "2020", cantidad: 2156 },
        { year: "2021", cantidad: 2489 },
        { year: "2022", cantidad: 2634 },
        { year: "2023", cantidad: 2847 },
        { year: "2024", cantidad: 3102 },
      ],
      tipo: [
        { name: "Violencia familiar", value: 1248, color: "#3777FF" },
        { name: "Negligencia", value: 892, color: "#F3A712" },
        { name: "Abuso sexual", value: 456, color: "#BF1363" },
        { name: "Maltrato infantil", value: 312, color: "#E07A5F" },
        { name: "Otros", value: 194, color: "#A7DBF9" },
      ],
    },
  },

  inversion: {
    charts: {
      inversion: [
        { year: "2018", educacion: 12450, salud: 8920, proteccion: 3420, desarrollo: 2180 },
        { year: "2019", educacion: 13890, salud: 9540, proteccion: 3890, desarrollo: 2450 },
        { year: "2020", educacion: 15120, salud: 11280, proteccion: 4280, desarrollo: 2890 },
        { year: "2021", educacion: 16840, salud: 12890, proteccion: 4920, desarrollo: 3240 },
        { year: "2022", educacion: 18420, salud: 14120, proteccion: 5450, desarrollo: 3680 },
        { year: "2023", educacion: 20150, salud: 15840, proteccion: 6120, desarrollo: 4120 },
        { year: "2024", educacion: 22480, salud: 17120, proteccion: 6890, desarrollo: 4580 },
      ],
      presupuesto: [
        { year: "2018", porcentaje: 18.4 },
        { year: "2019", porcentaje: 19.1 },
        { year: "2020", porcentaje: 20.8 },
        { year: "2021", porcentaje: 21.4 },
        { year: "2022", porcentaje: 22.1 },
        { year: "2023", porcentaje: 22.8 },
        { year: "2024", porcentaje: 23.5 },
      ],
    },
  },
};