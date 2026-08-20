// Queries optimizadas para visualizaciones del dashboard de Defensorías
// Basado en el esquema: indicadores(id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)

export const dashboardQueries = {
  // ============== POBREZA ==============
  pobrezaEvolucion: `
    SELECT periodo, indicador_nombre, valor, desglose
    FROM indicadores
    WHERE categoria = 'pobreza'
      AND indicador_nombre IN ('Pobreza infantil', 'Indigencia infantil')
    ORDER BY periodo ASC
  `,
  
  pobrezaRegional: `
    SELECT region, valor, indicador_nombre
    FROM indicadores
    WHERE categoria = 'pobreza'
      AND region != 'Córdoba'
    ORDER BY region ASC
  `,

  // ============== EDUCACIÓN ==============
  escolarizacionPorNivel: `
    SELECT indicador_nombre, valor, periodo
    FROM indicadores
    WHERE categoria = 'educacion'
      AND indicador_nombre LIKE '%Escolarización%'
    ORDER BY periodo DESC
  `,
  
  aprenderResultados: `
    SELECT indicador_nombre, valor, desglose, region
    FROM indicadores
    WHERE categoria = 'aprender'
    ORDER BY indicador_nombre, region
  `,
  
  aprenderRegional: `
    SELECT region, indicador_nombre, valor
    FROM indicadores
    WHERE categoria = 'aprender'
      AND region != 'Total'
    ORDER BY region, indicador_nombre
  `,
  
  matriculaPorNivel: `
    SELECT indicador_nombre, valor
    FROM indicadores
    WHERE categoria = 'anuario_educacion'
      AND indicador_nombre LIKE '%Matrícula%'
  `,

  // ============== SALUD ==============
  mortalidadInfantil: `
    SELECT periodo, valor, indicador_nombre, region
    FROM indicadores
    WHERE categoria = 'salud'
      AND indicador_nombre LIKE '%Mortalidad%'
    ORDER BY periodo ASC
  `,
  
  saludAdolescente: `
    SELECT indicador_nombre, valor, periodo, region
    FROM indicadores
    WHERE categoria = 'salud_adolescente'
    ORDER BY periodo DESC
  `,
  
  nacimientosAdolescentes: `
    SELECT periodo, valor, indicador_nombre
    FROM indicadores
    WHERE categoria = 'salud_adolescente'
      AND indicador_nombre LIKE '%Nacimientos%'
    ORDER BY periodo ASC
  `,

  // ============== JUSTICIA ==============
  causasJusticia: `
    SELECT indicador_nombre, valor
    FROM indicadores
    WHERE categoria = 'justicia'
    ORDER BY valor DESC
  `,

  // ============== INVERSIÓN ==============
  inversionTotal: `
    SELECT indicador_nombre, valor, desglose
    FROM indicadores
    WHERE categoria = 'inversion'
    ORDER BY valor DESC
    LIMIT 20
  `,

  // ============== DEMOGRAFÍA ==============
  poblacionporEdad: `
    SELECT indicador_nombre, valor, desglose
    FROM indicadores
    WHERE categoria = 'demografia'
    ORDER BY indicador_nombre
  `,

  // ============== KPIs PRINCIPALES ==============
  kpiPobreza: `
    SELECT indicador_nombre, valor, periodo
    FROM indicadores
    WHERE categoria = 'pobreza'
      AND indicador_nombre = 'Pobreza infantil'
    ORDER BY periodo DESC
    LIMIT 1
  `,
  
  kpiEscolarizacion: `
    SELECT indicador_nombre, valor, periodo
    FROM indicadores
    WHERE categoria = 'educacion'
      AND indicador_nombre LIKE '%Escolarización%'
    ORDER BY periodo DESC
    LIMIT 1
  `,
  
  kpiMortalidad: `
    SELECT indicador_nombre, valor, periodo
    FROM indicadores
    WHERE categoria = 'salud'
      AND indicador_nombre LIKE '%Mortalidad%'
    ORDER BY periodo DESC
    LIMIT 1
  `,
  
  kpiInversion: `
    SELECT SUM(valor) as total_inversion
    FROM indicadores
    WHERE categoria = 'inversion'
  `,
};

// Funciones helper para formatear datos de gráficos
export function formatChartData(
  data: Record<string, unknown>[],
  xKey: string,
  yKeys: string[],
  options?: { transform?: (val: number) => number }
): Record<string, unknown>[] {
  if (!data || data.length === 0) return [];
  
  const { transform = (v: number) => v } = options || {};
  
  return data.map(row => {
    const result: Record<string, unknown> = {};
    const rowRecord = row as Record<string, unknown>;
    result[xKey] = rowRecord[xKey] ?? rowRecord[xKey.replace('_', '')];
    yKeys.forEach(key => {
      result[key] = transform(Number(rowRecord[key] as string | number) || 0);
    });
    return result;
  });
}

export function groupByPeriodo(data: Record<string, unknown>[], indicadorField: string = 'indicador_nombre'): Record<string, Record<string, unknown>[]> {
  const groups: Record<string, Record<string, unknown>[]> = {};
  
  data.forEach(row => {
    const r = row as Record<string, unknown>;
    const key = String(r[indicadorField] ?? 'valor');
    if (!groups[key]) groups[key] = [];
    groups[key].push({
      periodo: r.periodo,
      valor: Number(r.valor as string | number) || 0
    });
  });
  
  return groups;
}

export function combineTimeSeries(data: Record<string, Record<string, unknown>[]>, periodoKey: string = 'periodo'): Record<string, unknown>[] {
  const periodoSet = new Set<string>();
  Object.values(data).forEach(series => {
    series.forEach(item => periodoSet.add(String((item as Record<string, unknown>)[periodoKey])));
  });
  
  return Array.from(periodoSet).sort().map(periodo => {
    const row: Record<string, unknown> = { [periodoKey]: periodo };
    Object.entries(data).forEach(([key, series]) => {
      const match = series.find(s => String((s as Record<string, unknown>)[periodoKey]) === periodo);
      row[key] = match ? (match as Record<string, unknown>).valor as unknown : null;
    });
    return row;
  });
}