'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartWithTable } from '@/components/charts/chart-with-table';
import type { Indicador as DashboardIndicador } from '@/lib/use-dashboard-data';

const COLORS = {
  terracotta: '#E07A5F',
  blue: '#3777FF',
  magenta: '#BF1363',
  amber: '#F3A712',
};

export interface SaludChartsProps {
  variant: 'mortality' | 'vaccination';
  mortalidadComparativaData: Record<string, unknown>[];
  rmmData: { periodo: string; valor: number; region: string }[];
  rmmNacional: { periodo: string; valor: number; region: string }[];
  mortalidadData: { periodo: string; valor: number; region: string }[];
  tmneoData: { periodo: string; valor: number; region: string }[];
  tmposData: { periodo: string; valor: number; region: string }[];
  vaccinationChartData: Record<string, unknown>[];
  quintilChartData: Record<string, unknown>[];
  dpt4Cba: DashboardIndicador | undefined;
  srp2Cba: DashboardIndicador | undefined;
  dptEscolarCba: DashboardIndicador | undefined;
  latestDpt4Valor: number | null;
  latestSrp2Valor: number | null;
}

export function SaludCharts({
  variant,
  mortalidadComparativaData,
  rmmData,
  rmmNacional,
  mortalidadData,
  tmneoData,
  tmposData,
  vaccinationChartData,
  quintilChartData,
  dpt4Cba,
  srp2Cba,
  dptEscolarCba,
  latestDpt4Valor,
  latestSrp2Valor,
}: SaludChartsProps) {
  if (variant === 'mortality') {
    return (
      <>
        {/* Gráfico 1: Mortalidad Infantil */}
        <ChartWithTable
          title="Tasa de Mortalidad Infantil"
          subtitle="Evolución histórica - Comparación Córdoba vs Total Nacional (por cada mil nacidos vivos)"
          color="terracotta"
          fuente="DEIS - Dirección de Estadísticas e Información de Salud"
          data={mortalidadComparativaData}
          dataKey="valor"
          xAxisKey="periodo"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={mortalidadComparativaData}
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="periodo" tick={{ fill: '#4D4D4D', fontSize: 12 }} />
                <YAxis
                  tick={{ fill: '#4D4D4D', fontSize: 12 }}
                  domain={[0, 'auto']}
                  tickFormatter={v => `${Number(v).toFixed(1)}‰`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => [`${value ?? 0}‰`, name]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="TMI Cba"
                  stroke={COLORS.terracotta}
                  strokeWidth={2}
                  dot={{ fill: COLORS.terracotta, r: 4 }}
                  name="Córdoba"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="TMI"
                  stroke={COLORS.blue}
                  strokeWidth={2}
                  dot={{ fill: COLORS.blue, r: 4 }}
                  name="Nacional"
                  strokeDasharray="5 5"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>

        {/* Gráfico 2: RMM Córdoba vs Nacional */}
        {rmmData.length > 0 && (
          <ChartWithTable
            title="Mortalidad Posneonatal (RMM)"
            subtitle="Evolución histórica - Comparación Córdoba vs Total Nacional (por cada mil nacidos vivos)"
            color="blue"
            fuente="DEIS - Dirección de Estadísticas e Información de Salud"
            data={(() => {
              const series = [
                { nombre: 'RMM Cba', data: rmmData },
                ...(rmmNacional.length > 0
                  ? [{ nombre: 'RMM Nacional', data: rmmNacional }]
                  : []),
              ];
              const periodos = [
                ...new Set(series.flatMap(s => s.data.map(d => d.periodo))),
              ];
              return periodos
                .map(periodo => {
                  const row: Record<string, unknown> = { periodo };
                  for (const s of series) {
                    row[s.nombre] =
                      s.data.find(d => d.periodo === periodo)?.valor || null;
                  }
                  return row;
                })
                .sort((a, b) => Number(a.periodo) - Number(b.periodo));
            })()}
            dataKey="valor"
            xAxisKey="periodo"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={(() => {
                    const series = [
                      { nombre: 'RMM Cba', data: rmmData },
                      ...(rmmNacional.length > 0
                        ? [{ nombre: 'RMM Nacional', data: rmmNacional }]
                        : []),
                    ];
                    const periodos = [
                      ...new Set(series.flatMap(s => s.data.map(d => d.periodo))),
                    ];
                    return periodos
                      .map(periodo => {
                        const row: Record<string, unknown> = { periodo };
                        for (const s of series) {
                          row[s.nombre] =
                            s.data.find(d => d.periodo === periodo)?.valor || null;
                        }
                        return row;
                      })
                      .sort((a, b) => Number(a.periodo) - Number(b.periodo));
                  })()}
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis dataKey="periodo" tick={{ fill: '#4D4D4D', fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: '#4D4D4D', fontSize: 12 }}
                    domain={[0, 'auto']}
                    tickFormatter={v => `${Number(v).toFixed(1)}‰`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF',
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                    }}
                    formatter={(value, name) => [`${value ?? 0}‰`, name]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="RMM Cba"
                    stroke={COLORS.blue}
                    strokeWidth={2}
                    dot={{ fill: COLORS.blue, r: 4 }}
                    name="Córdoba"
                    connectNulls
                  />
                  {rmmNacional.length > 0 && (
                    <Line
                      type="monotone"
                      dataKey="RMM Nacional"
                      stroke={COLORS.magenta}
                      strokeWidth={2}
                      dot={{ fill: COLORS.magenta, r: 4 }}
                      name="Nacional"
                      strokeDasharray="5 5"
                      connectNulls
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartWithTable>
        )}

        {/* Gráfico 3: Desglose de Mortalidad Infantil */}
        {(mortalidadData.length > 0 ||
          rmmData.length > 0 ||
          tmneoData.length > 0 ||
          tmposData.length > 0) &&
          (() => {
            const series = [
              { key: 'TMI Cba', data: mortalidadData, color: COLORS.terracotta },
              { key: 'RMM Cba', data: rmmData, color: COLORS.blue },
              { key: 'TMNEO Cba', data: tmneoData, color: '#FF7F11' },
              { key: 'TMPOS Cba', data: tmposData, color: COLORS.amber },
            ].filter(s => s.data.length > 0);

            if (series.length === 0) return null;

            const periodos = [
              ...new Set(series.flatMap(s => s.data.map(d => d.periodo))),
            ];
            const chartData = periodos
              .map(periodo => {
                const row: Record<string, unknown> = { periodo };
                for (const s of series) {
                  row[s.key] = s.data.find(d => d.periodo === periodo)?.valor ?? null;
                }
                return row;
              })
              .sort((a, b) => Number(a.periodo) - Number(b.periodo));

            return (
              <ChartWithTable
                title="Desglose de Mortalidad Infantil — Córdoba"
                subtitle="Evolución de los 4 indicadores de mortalidad infantil (por cada mil nacidos vivos)"
                color="terracotta"
                fuente="DEIS / datos.gob.ar"
                data={chartData}
                dataKey="valor"
                xAxisKey="periodo"
              >
                <div className="h-72">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                      <XAxis
                        dataKey="periodo"
                        tick={{ fill: '#4D4D4D', fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fill: '#4D4D4D', fontSize: 12 }}
                        domain={[0, 'auto']}
                        tickFormatter={v => `${Number(v).toFixed(1)}‰`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFF',
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px',
                        }}
                        formatter={(value, name) => [
                          `${Number(value ?? 0).toFixed(1)}‰`,
                          name,
                        ]}
                      />
                      <Legend />
                      {series.map(s => (
                        <Line
                          key={s.key}
                          type="monotone"
                          dataKey={s.key}
                          stroke={s.color}
                          strokeWidth={2}
                          dot={{ fill: s.color, r: 3 }}
                          name={s.key}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartWithTable>
            );
          })()}
      </>
    );
  }

  return (
    <>
      {/* Gráfico 4: Evolución de Cobertura Vacunación */}
      <ChartWithTable
        title="Evolución de Cobertura — Todas las Vacunas (2015-2024)"
        subtitle="Ninguna vacuna alcanzó el 95% necesario para inmunidad de rebaño en los últimos 7 años"
        color="terracotta"
        fuente="SAP/UNICEF Observatorio de la Infancia — Ministerio de Salud DiCEI"
        data={vaccinationChartData}
        dataKey="valor"
        xAxisKey="periodo"
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={vaccinationChartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="periodo" tick={{ fill: '#4D4D4D', fontSize: 12 }} />
              <YAxis
                tick={{ fill: '#4D4D4D', fontSize: 12 }}
                domain={[40, 100]}
                tickFormatter={v => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFF',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                }}
                formatter={(value, name) => [value !== null ? `${value}%` : '—', name]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={() => 95}
                stroke="#94A3B8"
                strokeWidth={1.5}
                strokeDasharray="8 4"
                dot={false}
                name="95% Inmunidad de rebaño"
                legendType="line"
              />
              <Line
                type="monotone"
                dataKey="DPT3"
                stroke={COLORS.terracotta}
                strokeWidth={2.5}
                dot={{ fill: COLORS.terracotta, r: 3 }}
                name="DPT3 (6 meses)"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="DPT4"
                stroke={COLORS.blue}
                strokeWidth={2.5}
                dot={{ fill: COLORS.blue, r: 3 }}
                name="DPT4 (refuerzo 2do año)"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="SRP 1ra dosis"
                stroke={COLORS.magenta}
                strokeWidth={2}
                dot={{ fill: COLORS.magenta, r: 3 }}
                name="SRP 1ra dosis (12 meses)"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="SRP 2da dosis"
                stroke={COLORS.amber}
                strokeWidth={2}
                dot={{ fill: COLORS.amber, r: 3 }}
                name="SRP 2da dosis (5 años)"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="PCV13"
                stroke="#FF7F11"
                strokeWidth={2}
                dot={{ fill: '#FF7F11', r: 3 }}
                name="PCV13 Neumococo"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      {/* Gráfico 5: Quintil */}
      {quintilChartData.length > 0 && (
        <ChartWithTable
          title="Cobertura DPT4 por Quintil Socioeconómico"
          subtitle="Paradoja: el quintil más pobre a veces supera al más rico — posible efecto complacencia"
          color="blue"
          fuente="SAP CONARPE 2023"
          data={quintilChartData}
          dataKey="valor"
          xAxisKey="periodo"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height={256}>
              <BarChart
                data={quintilChartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey="periodo"
                  tick={{ fill: '#4D4D4D', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: '#4D4D4D', fontSize: 12 }}
                  domain={[0, 100]}
                  tickFormatter={v => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => [
                    value !== null ? `${value}%` : '—',
                    name,
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="Q1 — Mayor pobreza"
                  fill={COLORS.terracotta}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Q5 — Menor pobreza"
                  fill={COLORS.blue}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>
      )}

      {/* Gráfico 6: Córdoba */}
      {(dpt4Cba || srp2Cba || dptEscolarCba) && (
        <ChartWithTable
          title="Cobertura Vacunación — Córdoba"
          subtitle="Jurisdicción provincial vs. nacional"
          color="magenta"
          fuente="SAP 2022"
          data={
            [
              dpt4Cba && {
                indicador: 'DPT4 (refuerzo)',
                Córdoba: Number(dpt4Cba.valor),
                Nacional: latestDpt4Valor,
                periodo: dpt4Cba.periodo,
              },
              srp2Cba && {
                indicador: 'SRP 2da dosis',
                Córdoba: Number(srp2Cba.valor),
                Nacional: latestSrp2Valor,
                periodo: srp2Cba.periodo,
              },
              dptEscolarCba && {
                indicador: 'DPT escolar',
                Córdoba: Number(dptEscolarCba.valor),
                Nacional: null,
                periodo: dptEscolarCba.periodo,
              },
            ].filter(Boolean) as Record<string, unknown>[]
          }
          dataKey="Córdoba"
          xAxisKey="indicador"
        >
          <div className="h-48">
            <ResponsiveContainer width="100%" height={192}>
              <BarChart
                data={
                  [
                    dpt4Cba && {
                      indicador: 'DPT4',
                      Córdoba: Number(dpt4Cba.valor),
                      Nacional: latestDpt4Valor,
                    },
                    srp2Cba && {
                      indicador: 'SRP2',
                      Córdoba: Number(srp2Cba.valor),
                      Nacional: latestSrp2Valor,
                    },
                    dptEscolarCba && {
                      indicador: 'DPT Escolar',
                      Córdoba: Number(dptEscolarCba.valor),
                    },
                  ].filter(Boolean) as Record<string, unknown>[]
                }
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey="indicador"
                  tick={{ fill: '#4D4D4D', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: '#4D4D4D', fontSize: 12 }}
                  domain={[0, 100]}
                  tickFormatter={v => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => [
                    value !== null ? `${value}%` : '—',
                    name,
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="Córdoba"
                  fill={COLORS.magenta}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Nacional"
                  fill={COLORS.blue}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>
      )}
    </>
  );
}
