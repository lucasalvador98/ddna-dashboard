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

const COLORS = {
  magenta: '#BF1363',
  terracotta: '#E07A5F',
  blue: '#3777FF',
};

interface ChartDataItem {
  periodo: string;
  valor: number;
}

export function NacimientosLineChart({ data }: { data: ChartDataItem[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis dataKey="periodo" tick={{ fill: '#4D4D4D', fontSize: 12 }} />
          <YAxis
            tick={{ fill: '#4D4D4D', fontSize: 12 }}
            tickFormatter={(v) => v.toLocaleString()}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFF',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
            }}
            formatter={(value) => [Number(value).toLocaleString('es-AR'), 'Nacimientos']}
          />
          <Line
            type="monotone"
            dataKey="valor"
            stroke={COLORS.magenta}
            strokeWidth={3}
            dot={{ fill: COLORS.magenta, r: 5 }}
            name="Nacimientos"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FecundidadBarChart({ data }: { data: ChartDataItem[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis dataKey="periodo" tick={{ fill: '#4D4D4D', fontSize: 12 }} />
          <YAxis
            tick={{ fill: '#4D4D4D', fontSize: 12 }}
            tickFormatter={(v) => `${v}‰`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFF',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
            }}
            formatter={(value) => [`${value}‰`, 'Tasa de Fecundidad']}
          />
          <Bar dataKey="valor" fill={COLORS.terracotta} radius={[4, 4, 0, 0]} name="Tasa" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ComparacionChart({
  nacimientos,
  fecundidad,
}: {
  nacimientos: ChartDataItem[];
  fecundidad: ChartDataItem[];
}) {
  const combined = nacimientos.map((n, i) => ({
    periodo: n.periodo,
    nacimientos: n.valor,
    tasa: fecundidad[i]?.valor || 0,
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={combined} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
          <XAxis dataKey="periodo" tick={{ fill: '#4D4D4D', fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fill: '#4D4D4D', fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#4D4D4D', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFF',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="nacimientos"
            stroke={COLORS.magenta}
            name="Nacimientos"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="tasa"
            stroke={COLORS.blue}
            name="Tasa (‰)"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
