'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { ChartWithTable } from '@/components/charts/chart-with-table';

const COLORS = ['#3777FF', '#BF1363', '#F3A712', '#E07A5F', '#3599B8', '#A66999'];

interface DistribucionItem {
  name: string;
  value: number;
}

interface CrimeSeriesInfo {
  label: string;
  color: string;
}

interface SeguridadChartsProps {
  distribucionData: DistribucionItem[];
  total: number;
  crimeChartData: Record<string, unknown>[];
  crimeSeries: CrimeSeriesInfo[];
  crimeYearRange: string;
}

export function SeguridadCharts({
  distribucionData,
  total,
  crimeChartData,
  crimeSeries,
  crimeYearRange,
}: SeguridadChartsProps) {
  return (
    <>
      <ChartWithTable
        title="Casos por Tipo"
        subtitle="Distribución de casos en el sistema de justicia"
        color="blue"
        fuente="Ministerio Público Córdoba"
        data={distribucionData.map(d => ({ tipo: d.name, casos: d.value }))}
        dataKey="casos"
        xAxisKey="tipo"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={distribucionData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#4D4D4D', fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#4D4D4D', fontSize: 11 }}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFF',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                }}
                formatter={v => [v?.toLocaleString('es-AR') ?? 0, 'Casos']}
              />
              <Bar dataKey="value" fill="#3777FF" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      <ChartWithTable
        title="Distribución Porcentual"
        subtitle="Porcentaje de casos por tipo"
        color="blue"
        fuente="Ministerio Público Córdoba"
        data={distribucionData.map(d => ({
          tipo: d.name,
          porcentaje: total > 0 ? ((d.value / total) * 100).toFixed(1) : 0,
        }))}
        dataKey="porcentaje"
        xAxisKey="tipo"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={distribucionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                }
              >
                {distribucionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={v => [v?.toLocaleString('es-AR') ?? 0, 'Casos']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      {crimeChartData.length > 0 && (
        <ChartWithTable
          title="Evolución de Delitos"
          subtitle={`Series históricas de delitos y contravenciones (${crimeYearRange})`}
          color="blue"
          fuente="datos.gob.ar — Sistema Nacional de Información Criminal"
          data={crimeChartData}
          dataKey="valor"
          xAxisKey="periodo"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={crimeChartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey="periodo"
                  tick={{ fill: '#4D4D4D', fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fill: '#4D4D4D', fontSize: 12 }} domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => [
                    typeof value === 'number' ? value.toLocaleString('es-AR') : value,
                    name,
                  ]}
                />
                <Legend />
                {crimeSeries.map(s => (
                  <Line
                    key={s.label}
                    type="monotone"
                    dataKey={s.label}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={false}
                    name={s.label}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>
      )}
    </>
  );
}
