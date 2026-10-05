'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { ArrowDown, ArrowUp, ArrowUpDown, Baby, Info, Mars, Users, Venus } from 'lucide-react';
import { KpiCard } from '@/components/kpi-card';
import { ChartCard } from '@/components/charts/chart-card';
import { EmptyState } from '@/components/empty-state';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/** Agregado provincial: `region` para el total de la provincia en la tabla `indicadores`. */
import { PROVINCIA_CENSO } from '@/lib/poblacion-censo';

// La región del agregado provincial vive en un módulo normal (no `'use client'`):
// importarla desde acá a un Server Component la convertiría en referencia opaca.
export const PROVINCIA_REGION = PROVINCIA_CENSO;

/** Una jurisdicción (provincia o departamento) con los cortes del Censo 2022. */
export interface PoblacionScope {
  region: string;
  esProvincia: boolean;
  total: number | null;
  varones: number | null;
  mujeres: number | null;
  nnya: number | null;
  hasta14: number | null;
  de15a64: number | null;
  de65mas: number | null;
  /**
   * Población por año simple de edad (`PERSONA_EDAD`): 0..109 como edades
   * exactas y 110 como grupo abierto ("110 y más"), siempre ascendente. Sólo
   * trae las edades con registro: los departamentos chicos no censan todas las
   * edades altas, así que el largo de la serie varía por jurisdicción y no se
   * rellena con ceros.
   */
  edades: { edad: number; valor: number }[];
}

interface PoblacionChartsProps {
  jurisdicciones: PoblacionScope[];
  fuente: string;
  periodo: number;
  unidad: string;
}

const COLORS = {
  orange: '#FF8C00',
  blue: '#165DFF',
  magenta: '#8A4B4B',
  terracotta: '#C2410C',
};

const TOOLTIP_STYLE = {
  backgroundColor: '#FFF',
  border: '1px solid #D8D5D3',
  borderRadius: '8px',
  fontSize: '13px',
};

type SortKey = 'total' | 'varones' | 'mujeres' | 'nnya' | 'pctNnya';

const SORT_LABELS: Record<SortKey, string> = {
  total: 'Total',
  varones: 'Varones',
  mujeres: 'Mujeres',
  nnya: 'NNyA (0 a 17)',
  pctNnya: '% NNyA',
};

const SORT_ORDER: SortKey[] = ['total', 'varones', 'mujeres', 'nnya', 'pctNnya'];

/** Entero con separador de miles es-AR; `—` cuando el indicador no está en la base. */
function fmtInt(valor: number | null): string {
  if (valor == null || !Number.isFinite(valor)) return '—';
  return valor.toLocaleString('es-AR');
}

/** Porcentaje de `parte` sobre `total`, o `null` si falta alguno de los dos. */
function pct(parte: number | null, total: number | null): number | null {
  if (parte == null || total == null || total === 0) return null;
  return (parte / total) * 100;
}

function fmtPct(valor: number | null): string {
  if (valor == null) return '—';
  return `${valor.toFixed(1)}%`;
}

export default function PoblacionCharts({
  jurisdicciones,
  fuente,
  periodo,
  unidad,
}: PoblacionChartsProps) {
  const provincia = useMemo(
    () => jurisdicciones.find(j => j.esProvincia) ?? jurisdicciones[0] ?? null,
    [jurisdicciones]
  );

  const [selectedRegion, setSelectedRegion] = useState<string>(
    provincia?.region ?? PROVINCIA_REGION
  );
  const [sortKey, setSortKey] = useState<SortKey>('total');
  const [sortAsc, setSortAsc] = useState(false);

  const selected = useMemo(
    () => jurisdicciones.find(j => j.region === selectedRegion) ?? provincia,
    [jurisdicciones, selectedRegion, provincia]
  );

  const departamentos = useMemo(
    () => jurisdicciones.filter(j => !j.esProvincia),
    [jurisdicciones]
  );

  const sexoData = useMemo(() => {
    if (!selected) return [];
    const filas = [
      { name: 'Varones', value: selected.varones, fill: COLORS.blue },
      { name: 'Mujeres', value: selected.mujeres, fill: COLORS.magenta },
    ];
    return filas.filter((f): f is { name: string; value: number; fill: string } => f.value != null);
  }, [selected]);

  const gruposData = useMemo(() => {
    if (!selected) return [];
    return [
      { grupo: 'Hasta 14 años', valor: selected.hasta14, fill: COLORS.orange },
      { grupo: '15 a 64 años', valor: selected.de15a64, fill: COLORS.blue },
      { grupo: '65 años y más', valor: selected.de65mas, fill: COLORS.magenta },
    ];
  }, [selected]);

  const edadesData = useMemo(() => {
    if (!selected) return [];
    return [...selected.edades].sort((a, b) => a.edad - b.edad);
  }, [selected]);

  const tableRows = useMemo(() => {
    const conPct = jurisdicciones.map(j => ({ ...j, pctNnya: pct(j.nnya, j.total) }));
    return conPct.sort((a, b) => {
      // La fila provincial queda fija arriba: es el total del que se leen los
      // departamentos, no un departamento más.
      if (a.esProvincia !== b.esProvincia) return a.esProvincia ? -1 : 1;
      const av = a[sortKey] ?? -1;
      const bv = b[sortKey] ?? -1;
      return sortAsc ? av - bv : bv - av;
    });
  }, [jurisdicciones, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortAsc(prev => !prev);
      return;
    }
    setSortKey(key);
    setSortAsc(key === 'total' ? false : true);
  }

  if (!selected) {
    return (
      <EmptyState
        icon={Info}
        title="Sin datos de población"
        description="El Censo 2022 (INDEC) no devolvió filas para las jurisdicciones de Córdoba."
      />
    );
  }

  const pctVarones = pct(selected.varones, selected.total);
  const pctMujeres = pct(selected.mujeres, selected.total);
  const pctNnya = pct(selected.nnya, selected.total);
  const baseCenso = `Censo ${periodo}`;

  return (
    <div className="space-y-6">
      {/* ─── Selector de jurisdicción ─────────────────────────────── */}
      <div className="bg-white rounded-xl border-2 border-border p-4 flex flex-wrap items-center gap-x-4 gap-y-3">
        <label className="flex items-center gap-2" htmlFor="jurisdiccion">
          <span className="font-accent text-sm text-text-primary tracking-wide">Jurisdicción</span>
          <select
            id="jurisdiccion"
            value={selected.region}
            onChange={e => setSelectedRegion(e.target.value)}
            className="font-body text-sm text-navy bg-white border-2 border-border rounded-lg px-3 py-2 min-w-56 focus:outline-none focus:ring-2 focus:ring-orange/40"
          >
            {provincia && (
              <option value={provincia.region}>{provincia.region} (provincia)</option>
            )}
            {departamentos.map(d => (
              <option key={d.region} value={d.region}>
                {d.region}
              </option>
            ))}
          </select>
        </label>
        <p className="font-body text-xs text-muted-foreground">
          {departamentos.length} departamentos + agregado provincial · {baseCenso} (INDEC)
        </p>
      </div>

      {/* ─── KPIs ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Población total"
          value={fmtInt(selected.total)}
          subtitle={`100,0% del total · ${baseCenso}`}
          icon={Users}
          color="blue"
        />
        <KpiCard
          title="Varones"
          value={fmtInt(selected.varones)}
          subtitle={`${fmtPct(pctVarones)} del total · ${baseCenso}`}
          icon={Mars}
          color="navy"
        />
        <KpiCard
          title="Mujeres"
          value={fmtInt(selected.mujeres)}
          subtitle={`${fmtPct(pctMujeres)} del total · ${baseCenso}`}
          icon={Venus}
          color="magenta"
        />
        <KpiCard
          title="NNyA (0 a 17)"
          value={fmtInt(selected.nnya)}
          subtitle={`${fmtPct(pctNnya)} del total · ${baseCenso}`}
          icon={Baby}
          color="orange"
        />
      </div>

      {/* ─── Gráficos ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Composición por sexo"
          subtitle={`${selected.region} — ${baseCenso}`}
          color="blue"
          fuente={fuente}
        >
          {sexoData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
              Sin datos de sexo para esta jurisdicción
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={sexoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${String(name ?? '')} (${((percent ?? 0) * 100).toFixed(1)}%)`
                  }
                >
                  {sexoData.map(entry => (
                    <Cell key={`sexo-${entry.name}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={value => [`${Number(value).toLocaleString('es-AR')} personas`, '']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Grandes grupos de edad"
          subtitle={`${selected.region} — ${baseCenso} (hasta 14 / 15 a 64 / 65 años y más)`}
          color="orange"
          fuente={fuente}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={gruposData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8D5D3" vertical={false} />
              <XAxis
                dataKey="grupo"
                tick={{ fill: '#050506', fontSize: 12 }}
                tickLine={{ stroke: '#D8D5D3' }}
              />
              <YAxis
                tick={{ fill: '#050506', fontSize: 12 }}
                tickLine={{ stroke: '#D8D5D3' }}
                tickFormatter={(value: number) => value.toLocaleString('es-AR')}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={value => [`${Number(value).toLocaleString('es-AR')} personas`, '']}
              />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]} name="Personas">
                {gruposData.map(entry => (
                  <Cell key={`grupo-${entry.grupo}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ─── Estructura por edad simple ───────────────────────────── */}
      {/* Las edades con registro se grafican tal cual llegan (sin rellenar con
          ceros): un departamento chico no censa todas las edades altas, así que
          mostrar un 0 inventaría población que el censo no reporta. */}
      {edadesData.length > 0 && (
        <ChartCard
          title="Estructura por edad"
          subtitle={`${selected.region} — ${baseCenso}: población por año simple de edad (0 a 110) · ${edadesData.length} edades con registro`}
          color="navy"
          fuente={fuente}
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={edadesData}
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              barCategoryGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#D8D5D3" vertical={false} />
              <XAxis
                dataKey="edad"
                interval={4}
                allowDecimals={false}
                tick={{ fill: '#050506', fontSize: 11 }}
                tickLine={{ stroke: '#D8D5D3' }}
              />
              <YAxis
                tick={{ fill: '#050506', fontSize: 12 }}
                tickLine={{ stroke: '#D8D5D3' }}
                tickFormatter={(value: number) => value.toLocaleString('es-AR')}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelFormatter={label => `Edad ${String(label)}`}
                formatter={value => [`${Number(value).toLocaleString('es-AR')} personas`, '']}
              />
              <Bar dataKey="valor" name="Personas" fill={COLORS.blue} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* ─── Tabla por departamento ───────────────────────────────── */}
      <div className="bg-white rounded-xl border-2 border-border overflow-hidden">
        <div className="p-6 border-b-2 border-border">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: COLORS.blue }} />
            <div>
              <h3 className="font-display text-lg text-navy tracking-tight">
                Población por departamento
              </h3>
              <p className="font-body text-sm text-muted-foreground mt-1">
                {departamentos.length} departamentos + agregado provincial · ordená por columna y
                hacé click en una fila para seleccionar la jurisdicción
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-6 py-3 font-medium text-text-primary">Departamento</th>
                {SORT_ORDER.map(key => (
                  <th
                    key={key}
                    className="px-6 py-3 font-medium text-text-primary text-right"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(key)}
                      title={`Ordenar por ${SORT_LABELS[key]}`}
                      className={clsx(
                        'inline-flex flex-row-reverse items-center gap-1 hover:text-navy transition-colors',
                        sortKey === key && 'text-navy font-semibold'
                      )}
                    >
                      {SORT_LABELS[key]}
                      {sortKey === key ? (
                        sortAsc ? (
                          <ArrowUp className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map(row => {
                const isSelected = row.region === selected.region;
                return (
                  <tr
                    key={row.region}
                    onClick={() => setSelectedRegion(row.region)}
                    className={clsx(
                      'border-t border-border cursor-pointer transition-colors',
                      row.esProvincia && 'bg-secondary-bg font-medium',
                      isSelected ? 'bg-orange/10' : 'hover:bg-gray-50'
                    )}
                  >
                    <td className="px-6 py-3">
                      <button
                        type="button"
                        onClick={event => {
                          event.stopPropagation();
                          setSelectedRegion(row.region);
                        }}
                        className={clsx(
                          'text-left hover:underline',
                          row.esProvincia ? 'text-navy font-semibold' : 'text-text-primary'
                        )}
                      >
                        {row.region}
                        {row.esProvincia && ' (provincia)'}
                      </button>
                    </td>
                    <td className="px-6 py-3 text-right text-text-primary">
                      {fmtInt(row.total)}
                    </td>
                    <td className="px-6 py-3 text-right text-text-primary">
                      {fmtInt(row.varones)}
                    </td>
                    <td className="px-6 py-3 text-right text-text-primary">
                      {fmtInt(row.mujeres)}
                    </td>
                    <td className="px-6 py-3 text-right text-text-primary">{fmtInt(row.nnya)}</td>
                    <td className="px-6 py-3 text-right text-text-primary">
                      {fmtPct(row.pctNnya)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 text-xs text-muted-foreground border-t border-border">
          Fuente: {fuente} · {baseCenso}. Unidad: {unidad}. Los cortes por sexo y edad se derivan
          de los mismos registros del operativo censal.
        </div>
      </div>
    </div>
  );
}
