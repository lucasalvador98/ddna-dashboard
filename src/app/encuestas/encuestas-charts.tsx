'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartWithTable } from '@/components/charts/chart-with-table';
import type { ChartTopic } from './page';

const CHART_COLORS = [
  '#8A4B4B',
  '#B3541E',
  '#165DFF',
  '#2F6F4F',
  '#C2410C',
  '#C2410C',
  '#050506',
  '#A7C4FF',
  '#6B4A9C',
  '#0F3FA8',
];

interface EncuestasChartsProps {
  priorityCharts: ChartTopic[];
  showOtherCharts: ChartTopic[];
}

export function EncuestasCharts({ priorityCharts, showOtherCharts }: EncuestasChartsProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        {priorityCharts.map(chart => {
          const chartData = chart.items;

          return (
            <ChartWithTable
              key={chart.topic}
              title={chart.label}
              subtitle="Distribución de respuestas — Encuesta 2024"
              color="magenta"
              fuente="Encuesta DDNA 2024 — 1.757 respuestas (adultos + jóvenes)"
              data={chartData}
              dataKey="value"
              xAxisKey="name"
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#D8D5D3" horizontal={false} />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: '#050506', fontSize: 12 }}
                      tickFormatter={(v: number) => `${v}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: '#050506', fontSize: 11 }}
                      width={chartData.reduce((max, d) => Math.max(max, d.name.length), 0) * 8 + 10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFF',
                        border: '1px solid #D8D5D3',
                        borderRadius: '8px',
                      }}
                      formatter={value => [`${Number(value).toFixed(1)}%`, 'Respuestas']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartWithTable>
          );
        })}
      </div>

      {showOtherCharts.length > 0 && (
        <>
          <h2 className="font-display text-xl text-navy mt-8 mb-4">Otros indicadores</h2>
          <div className="grid grid-cols-1 gap-6">
            {showOtherCharts.map(chart => {
              const chartData = chart.items;
              return (
                <ChartWithTable
                  key={chart.topic}
                  title={chart.label}
                  subtitle="Distribución de respuestas — Encuesta 2024"
                  color="amber"
                  fuente="Encuesta DDNA 2024"
                  data={chartData}
                  dataKey="value"
                  xAxisKey="name"
                >
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#D8D5D3" horizontal={false} />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          tick={{ fill: '#050506', fontSize: 12 }}
                          tickFormatter={(v: number) => `${v}%`}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fill: '#050506', fontSize: 11 }}
                          width={120}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFF',
                            border: '1px solid #D8D5D3',
                            borderRadius: '8px',
                          }}
                          formatter={value => [
                            `${value != null ? Number(value).toFixed(1) : '—'}%`,
                            'Respuestas',
                          ]}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {chartData.map((entry, idx) => (
                            <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartWithTable>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
