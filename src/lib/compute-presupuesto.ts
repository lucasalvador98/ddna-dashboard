import { isEducacionCategory, isSaludCategory, formatInversionChange } from './format-inversion';
import { parseDesglose } from './parse-desglose';

export interface InversionRow {
  periodo: string;
  valor: number;
  area: string;
  programa: string;
  ponderador: number;
}

export function normalizeInversionRow(raw: Record<string, unknown>): InversionRow {
  const desglose = parseDesglose(raw.desglose);
  return {
    periodo: String(raw.periodo || ''),
    valor: Number(raw.valor) || 0,
    area: (desglose?.area as string) || 'Otros',
    programa: (desglose?.programa as string) || 'Sin programa',
    ponderador: Number(desglose?.ponderador_promedio) || 0,
  };
}

export const AREA_ORDER = ['Educación', 'Salud', 'Desarrollo Social', 'Niñez y Adolescencia', 'Otros'] as const;

export type FilterArea = (typeof AREA_ORDER)[number] | 'all';

export const AREA_COLORS: Record<string, string> = {
  Educación: '#3777FF',
  Salud: '#E07A5F',
  'Desarrollo Social': '#F3A712',
  'Niñez y Adolescencia': '#BF1363',
  Otros: '#10B981',
};

export function computePeriods(data: InversionRow[]): string[] {
  return [...new Set(data.map(d => d.periodo))].sort((a, b) => b.localeCompare(a));
}

export function computeInversionArea(filteredData: InversionRow[]) {
  const porArea = new Map<string, number>();
  for (const d of filteredData) {
    porArea.set(d.area, (porArea.get(d.area) || 0) + d.valor);
  }
  return AREA_ORDER.map(name => ({ name, value: porArea.get(name) || 0 }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function computeInversionPrograma(filteredData: InversionRow[]) {
  const porPrograma = new Map<string, { value: number; ponderador: number; area: string }>();
  for (const d of filteredData) {
    const existing = porPrograma.get(d.programa);
    if (existing) {
      existing.value += d.valor;
    } else {
      porPrograma.set(d.programa, { value: d.valor, ponderador: d.ponderador, area: d.area });
    }
  }
  return Array.from(porPrograma.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 15);
}

export function computeChangeData(data: InversionRow[], periods: string[]) {
  if (periods.length < 2) return null;
  const [currentPeriod, previousPeriod] = periods;
  const currentTotal = data.filter(d => d.periodo === currentPeriod).reduce((s, d) => s + d.valor, 0);
  const previousTotal = data.filter(d => d.periodo === previousPeriod).reduce((s, d) => s + d.valor, 0);
  if (!previousTotal) return null;
  const cambio = ((currentTotal - previousTotal) / previousTotal) * 100;
  return {
    value: formatInversionChange(cambio),
    type: (cambio > 0 ? 'up' : cambio < 0 ? 'down' : 'neutral') as 'up' | 'down' | 'neutral',
  };
}

export function computeEvolutionData(data: InversionRow[], periods: string[]) {
  if (periods.length === 0) return [];

  const empty = { Educación: 0, Salud: 0, 'Desarrollo Social': 0, 'Niñez y Adolescencia': 0, Otros: 0 };
  const periodMap = new Map<string, Record<string, number>>();
  for (const p of periods) periodMap.set(p, { ...empty });

  for (const d of data) {
    const entry = periodMap.get(d.periodo);
    if (entry && d.area in entry) entry[d.area] += d.valor;
  }

  return periods.map(periodo => ({ periodo, ...(periodMap.get(periodo) ?? empty) })).reverse();
}

export function computePieData(inversionArea: { name: string; value: number }[]) {
  return inversionArea.map(d => ({
    name: d.name,
    value: d.value,
    fill: AREA_COLORS[d.name] ?? '#E07A5F',
  }));
}

export function computeEducacionTotal(inversionArea: { name: string; value: number }[]) {
  return inversionArea.filter(d => isEducacionCategory(d.name)).reduce((sum, d) => sum + d.value, 0);
}

export function computeSaludTotal(inversionArea: { name: string; value: number }[]) {
  return inversionArea.filter(d => isSaludCategory(d.name)).reduce((sum, d) => sum + d.value, 0);
}

export function computeTotal(filteredData: InversionRow[]): number {
  return filteredData.reduce((sum, d) => sum + d.valor, 0);
}
