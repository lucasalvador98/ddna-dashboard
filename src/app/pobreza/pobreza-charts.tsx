'use client';

import { useState } from 'react';
import {
  Info,
  Home,
  PersonStanding,
  Briefcase,
  UtensilsCrossed,
  Layers,
  TrendingDown,
} from 'lucide-react';
import { KpiCard } from '@/components/kpi-card';
import { ChartCard } from '@/components/charts/chart-card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';

type IndicadorRow = {
  indicador_nombre: string;
  valor: number;
  periodo: number;
  desglose: Record<string, unknown>;
  fuente: string;
  region: string;
};

type TabId = 'ingresos' | 'multidimensional';

const TABS: { id: TabId; label: string }[] = [
  { id: 'ingresos', label: 'Ingresos (INDEC)' },
  { id: 'multidimensional', label: 'Multidimensional (UCA)' },
];

const COLORS = {
  magenta: '#BF1363',
  terracotta: '#E07A5F',
  amber: '#F3A712',
  orange: '#FF7F11',
  blue: '#3777FF',
  green: '#10B981',
  purple: '#8B5CF6',
};

const INDEC_FUENTE = 'EPH-INDEC / datos.gob.ar';

function fmt(val?: number | null): string {
  if (val == null || isNaN(val)) return 'N/D';
  return `${val.toFixed(1)}%`;
}

function periodoLabel(p: number, desglose: Record<string, unknown>): string {
  const semestre = desglose?.semestre;
  if (semestre === 1) return `1° sem ${p}`;
  if (semestre === 2) return `2° sem ${p}`;
  return String(p);
}

interface Change {
  label: string;
  up: boolean;
}

interface PobrezaChartsProps {
  indecData: IndicadorRow[];
  ucaData: IndicadorRow[];
  evoChartData: { label: string; Hogares?: number; Personas?: number }[];
  tableRows: { periodo: string; ph: string; pp: string }[];
  latestPH?: IndicadorRow;
  latestPP?: IndicadorRow;
  latestDesempleo?: IndicadorRow;
  indecIndigenciaHogares?: IndicadorRow;
  changePH: Change | null;
  changePP: Change | null;
  dimensionChartData: {
    dimension: string;
    valor: number;
    fill: string;
    indicator: string;
    periodo: number;
  }[];
  historicData: {
    periodo: number;
    'Inseguridad alimentaria': number | null;
    'Empleo no registrado': number | null;
    Hacinamiento: number | null;
    'Sin internet': number | null;
  }[];
  ucMonetaria?: IndicadorRow;
  ucIndigencia?: IndicadorRow;
  ucInseguridad?: IndicadorRow;
  ucMultidimensional?: IndicadorRow;
}

export default function PobrezaCharts({
  indecData,
  ucaData,
  evoChartData,
  tableRows,
  latestPH,
  latestPP,
  latestDesempleo,
  indecIndigenciaHogares,
  changePH,
  changePP,
  dimensionChartData,
  historicData,
  ucMonetaria,
  ucIndigencia,
  ucInseguridad,
  ucMultidimensional,
}: PobrezaChartsProps) {
  const [tab, setTab] = useState<TabId>('ingresos');

  return (
    <>
      <nav className="flex gap-1 bg-gray-100 rounded-lg p-1" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-white text-[#1a2556] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'ingresos' && (
        <TabIngresos
          indecData={indecData}
          evoChartData={evoChartData}
          tableRows={tableRows}
          latestPH={latestPH}
          latestPP={latestPP}
          latestDesempleo={latestDesempleo}
          indecIndigenciaHogares={indecIndigenciaHogares}
          changePH={changePH}
          changePP={changePP}
        />
      )}

      {tab === 'multidimensional' && (
        <TabMultidimensional
          ucaData={ucaData}
          dimensionChartData={dimensionChartData}
          historicData={historicData}
          ucMonetaria={ucMonetaria}
          ucIndigencia={ucIndigencia}
          ucInseguridad={ucInseguridad}
          ucMultidimensional={ucMultidimensional}
        />
      )}
    </>
  );
}

// ─── Tab 1: Ingresos ─────────────────────────────────────────────

function TabIngresos({
  indecData,
  evoChartData,
  tableRows,
  latestPH,
  latestPP,
  latestDesempleo,
  indecIndigenciaHogares,
  changePH,
  changePP,
}: {
  indecData: IndicadorRow[];
  evoChartData: { label: string; Hogares?: number; Personas?: number }[];
  tableRows: { periodo: string; ph: string; pp: string }[];
  latestPH?: IndicadorRow;
  latestPP?: IndicadorRow;
  latestDesempleo?: IndicadorRow;
  indecIndigenciaHogares?: IndicadorRow;
  changePH: Change | null;
  changePP: Change | null;
}) {
  if (indecData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Info className="w-12 h-12 text-gray-300 mb-4" />
        <p className="font-body text-gray-600">No hay datos disponibles</p>
        <p className="text-sm text-gray-400 mt-1">
          Los datos de INDEC para Córdoba no están disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Pobreza Hogares"
          value={fmt(latestPH?.valor)}
          subtitle={latestPH ? `${periodoLabel(latestPH.periodo, latestPH.desglose)}` : 'Sin datos'}
          change={changePH?.label}
          changeType={changePH ? (changePH.up ? 'up' : 'down') : 'neutral'}
          icon={Home}
          color="magenta"
        />
        <KpiCard
          title="Pobreza Personas"
          value={fmt(latestPP?.valor)}
          subtitle={latestPP ? `${periodoLabel(latestPP.periodo, latestPP.desglose)}` : 'Sin datos'}
          change={changePP?.label}
          changeType={changePP ? (changePP.up ? 'up' : 'down') : 'neutral'}
          icon={PersonStanding}
          color="magenta"
        />
        <KpiCard
          title="Indigencia Hogares"
          value={fmt(indecIndigenciaHogares?.valor)}
          subtitle={
            indecIndigenciaHogares
              ? periodoLabel(indecIndigenciaHogares.periodo, indecIndigenciaHogares.desglose)
              : 'Sin datos'
          }
          icon={Home}
          color="terracotta"
        />
        <KpiCard
          title="Desempleo Gran Córdoba"
          value={fmt(latestDesempleo?.valor)}
          subtitle={
            latestDesempleo
              ? `${periodoLabel(latestDesempleo.periodo, latestDesempleo.desglose)}`
              : 'Sin datos'
          }
          icon={Briefcase}
          color="amber"
        />
      </div>

      <ChartCard
        title="Evolución de la Pobreza — Córdoba (2016-2025)"
        subtitle="Porcentaje de hogares y personas bajo la línea de pobreza. Se muestran todos los semestres disponibles."
        color="magenta"
        fuente={INDEC_FUENTE}
      >
        {evoChartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
            No hay datos de evolución disponibles
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={evoChartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#4D4D4D', fontSize: 12 }}
                tickLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                tick={{ fill: '#4D4D4D', fontSize: 12 }}
                tickLine={{ stroke: '#E5E7EB' }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFF',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
                formatter={value => [`${value ?? '—'}%`, '']}
              />
              <Legend />
              <Bar
                dataKey="Personas"
                fill={COLORS.magenta}
                radius={[4, 4, 0, 0]}
                name="Pobreza Personas"
              />
              <Bar
                dataKey="Hogares"
                fill={COLORS.terracotta}
                radius={[4, 4, 0, 0]}
                name="Pobreza Hogares"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
        <div className="p-5 border-b border-[#E0E0E0]">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: COLORS.magenta }} />
            <h3 className="font-display text-lg text-[#1a2556]">Últimos Períodos</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-600">Período</th>
                <th className="px-5 py-3 font-medium text-gray-600 text-right">Pobreza Hogares</th>
                <th className="px-5 py-3 font-medium text-gray-600 text-right">Pobreza Personas</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-700">{row.periodo}</td>
                  <td className="px-5 py-3 text-right text-gray-700">{row.ph}</td>
                  <td className="px-5 py-3 text-right text-gray-700">{row.pp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-100">
          Fuente: {INDEC_FUENTE}
        </div>
      </div>
    </div>
  );
}

// ─── Tab 2: Multidimensional ─────────────────────────────────────

function TabMultidimensional({
  ucaData,
  dimensionChartData,
  historicData,
  ucMonetaria,
  ucIndigencia,
  ucInseguridad,
  ucMultidimensional,
}: {
  ucaData: IndicadorRow[];
  dimensionChartData: {
    dimension: string;
    valor: number;
    fill: string;
    indicator: string;
    periodo: number;
  }[];
  historicData: {
    periodo: number;
    'Inseguridad alimentaria': number | null;
    'Empleo no registrado': number | null;
    Hacinamiento: number | null;
    'Sin internet': number | null;
  }[];
  ucMonetaria?: IndicadorRow;
  ucIndigencia?: IndicadorRow;
  ucInseguridad?: IndicadorRow;
  ucMultidimensional?: IndicadorRow;
}) {
  if (ucaData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Info className="w-12 h-12 text-gray-300 mb-4" />
        <p className="font-body text-gray-600">No hay datos disponibles</p>
        <p className="text-sm text-gray-400 mt-1">
          Los datos de UCA-ODSA aún no están disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 leading-relaxed">
            <p>
              La <strong>UCA-ODSA</strong> mide la pobreza desde un{' '}
              <strong>enfoque de derechos</strong>. No solo ingresos: evalúa{' '}
              <strong>6 dimensiones</strong> del desarrollo humano (alimentación, crianza,
              información, empleo, hábitat, multidimensional). Datos extraídos de la{' '}
              <strong>EDSA</strong> (Encuesta de la Deuda Social Argentina) 2004-2024.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Pobreza Monetaria"
          value={fmt(ucMonetaria?.valor)}
          subtitle={ucMonetaria ? `${ucMonetaria.periodo} — Argentina urbana` : 'Sin datos'}
          icon={PersonStanding}
          color="magenta"
        />
        <KpiCard
          title="Indigencia"
          value={fmt(ucIndigencia?.valor)}
          subtitle={ucIndigencia ? `${ucIndigencia.periodo} — Argentina urbana` : 'Sin datos'}
          icon={TrendingDown}
          color="terracotta"
        />
        <KpiCard
          title="Inseguridad Alimentaria"
          value={fmt(ucInseguridad?.valor)}
          subtitle={ucInseguridad ? `${ucInseguridad.periodo} — Total país` : 'Sin datos'}
          icon={UtensilsCrossed}
          color="orange"
        />
        <KpiCard
          title="Pobreza Multidimensional"
          value={fmt(ucMultidimensional?.valor)}
          subtitle={
            ucMultidimensional ? `${ucMultidimensional.periodo} — 2+ carencias` : 'Sin datos'
          }
          icon={Layers}
          color="amber"
        />
      </div>

      <ChartCard
        title="Dimensiones de la Pobreza Estructural"
        subtitle="% de hogares con déficit en cada dimensión — último valor disponible (EDSA 2004-2024)"
        color="magenta"
        fuente="UCA-ODSA (EDSA)"
      >
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            layout="vertical"
            data={dimensionChartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#4D4D4D', fontSize: 12 }}
              tickLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(v: number) => `${v}%`}
            />
            <YAxis
              dataKey="dimension"
              type="category"
              tick={{ fill: '#4D4D4D', fontSize: 12 }}
              tickLine={false}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFF',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                fontSize: '13px',
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: any, _name: any, props: any) => [
                `${value ?? '—'}%`,
                props?.payload?.indicator || _name,
              ]) as any}
            />
            <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
              {dimensionChartData.map((d, i) => (
                <Cell key={`uca-cell-${i}`} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 text-center mt-4">
          Fuente: UCA-ODSA — Encuesta de la Deuda Social Argentina (EDSA) 2004-2024
        </p>
      </ChartCard>

      {historicData.length > 0 && (
        <ChartCard
          title="Evolución de Dimensiones Clave (2004-2024)"
          subtitle="Indicadores seleccionados por dimensión — muestra tendencias de largo plazo"
          color="magenta"
          fuente="UCA-ODSA (EDSA)"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={historicData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="periodo"
                  tick={{ fill: '#4D4D4D', fontSize: 12 }}
                  tickLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  tick={{ fill: '#4D4D4D', fontSize: 12 }}
                  tickLine={{ stroke: '#E5E7EB' }}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={((value: any) => [value !== null ? `${value}%` : '—', '']) as any}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Inseguridad alimentaria"
                  stroke={COLORS.magenta}
                  strokeWidth={2}
                  dot={{ fill: COLORS.magenta, r: 3 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="Empleo no registrado"
                  stroke={COLORS.amber}
                  strokeWidth={2}
                  dot={{ fill: COLORS.amber, r: 3 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="Hacinamiento"
                  stroke={COLORS.orange}
                  strokeWidth={2}
                  dot={{ fill: COLORS.orange, r: 3 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="Sin internet"
                  stroke={COLORS.blue}
                  strokeWidth={2}
                  dot={{ fill: COLORS.blue, r: 3 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">
            Indicadores seleccionados: uno representativo por dimensión (alimentación, empleo,
            hábitat, información)
          </p>
        </ChartCard>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-[#F3A712] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900 leading-relaxed">
            <p>
              La UCA mide <strong>pobreza multidimensional</strong>: no solo ingreso, sino también
              acceso a derechos. Los datos muestran que el{' '}
              <strong>{fmt(ucInseguridad?.valor)}</strong> de personas sufre inseguridad alimentaria
              — incluso quienes <em>NO</em> son pobres por ingreso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
