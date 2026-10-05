'use client';

import { useState } from 'react';
import { Table, Table2, ChevronDown, ChevronUp } from 'lucide-react';
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
} from 'recharts';

interface ChartWithTableProps {
  title: string;
  subtitle?: string;
  color?: 'terracotta' | 'amber' | 'magenta' | 'blue' | 'green';
  fuente?: string;
  ultimaActualizacion?: string | null;
  data: object[];
  dataKey: string; // La key principal para los valores (ej: "valor", "cobertura")
  xAxisKey: string; // La key del eje X (ej: "periodo", "year", "area")
  chartType?: 'line' | 'bar' | 'area' | 'pie';
  children?: React.ReactNode;
  colorMap?: Record<string, string>;
}

const colorStyles = {
  terracotta: {
    primary: '#C2410C',
    secondary: '#C2410C',
    light: '#FBF0EC',
  },
  amber: {
    primary: '#C2410C',
    secondary: '#9A6A2F',
    light: '#FAF3E0',
  },
  magenta: {
    primary: '#8A4B4B',
    secondary: '#8A4B4B',
    light: '#FAF0EE',
  },
  blue: {
    primary: '#165DFF',
    secondary: '#A7C4FF',
    light: '#F2F4FF',
  },
  green: {
    primary: '#356B6B',
    secondary: '#356B6B',
    light: '#F0F4F4',
  },
};

export function ChartWithTable({
  title,
  subtitle,
  color = 'terracotta',
  fuente,
  ultimaActualizacion,
  data,
  dataKey,
  xAxisKey,
  children,
}: ChartWithTableProps) {
  const [showTable, setShowTable] = useState(false);

  const colors = colorStyles[color];

  const rows = data as unknown as Record<string, unknown>[];
  const allKeys = rows.length > 0 ? Object.keys(rows[0]).filter(k => k !== xAxisKey) : [];

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      {/* Header del chart */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg text-navy">{title}</h3>
            {subtitle && <p className="font-body text-sm text-text-primary mt-1">{subtitle}</p>}
          </div>

          {/* Metadata */}
          <div className="text-right">
            {fuente && <p className="text-xs text-gray-400">Fuente: {fuente}</p>}
            {ultimaActualizacion && (
              <p className="text-xs text-gray-400">
                Actualizado: {new Date(ultimaActualizacion).toLocaleDateString('es-AR')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico children (pasado desde afuera) */}
      {children}

      {/* Toggle tabla de datos */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setShowTable(!showTable)}
          className="w-full px-5 py-3 flex items-center justify-between text-text-primary hover:bg-secondary-bg transition-colors"
        >
          <span className="font-body text-sm flex items-center gap-2">
            <Table2 className="w-4 h-4" />
            Ver datos fuente
          </span>
          {showTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTable && rows.length > 0 && (
          <div className="px-5 pb-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-600 bg-gray-50 rounded-tl-lg">
                      {xAxisKey.charAt(0).toUpperCase() + xAxisKey.slice(1)}
                    </th>
                    {allKeys.map(key => (
                      <th
                        key={key}
                        className="text-right py-2 px-3 font-medium text-gray-600 bg-gray-50"
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-700">{String(row[xAxisKey] ?? '')}</td>
                      {allKeys.map(key => (
                        <td key={key} className="text-right py-2 px-3 text-gray-700">
                          {typeof row[key] === 'number'
                            ? (row[key] as number).toLocaleString('es-AR', {
                                maximumFractionDigits: 2,
                              })
                            : String(row[key] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rows.length === 0 && (
              <p className="text-gray-400 text-center py-8">No hay datos disponibles</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Componente simple de línea de tiempo para series históricas
 */
interface TimeSeriesChartProps {
  data: Array<{ periodo: string; valor: number }>;
  color?: string;
  unit?: string;
  title?: string;
}

export function SimpleLineChart({ data, color = '#C2410C', unit = '' }: TimeSeriesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        No hay datos disponibles
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D8D5D3" />
        <XAxis
          dataKey="periodo"
          tick={{ fill: '#050506', fontSize: 12 }}
          tickLine={{ stroke: '#D8D5D3' }}
        />
        <YAxis
          tick={{ fill: '#050506', fontSize: 12 }}
          tickLine={{ stroke: '#D8D5D3' }}
          tickFormatter={(v: number | string) => `${v ?? 0}${unit}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFF',
            border: '1px solid #D8D5D3',
            borderRadius: '8px',
          }}
          formatter={(value) => [`${value ?? 0}${unit}`, 'Valor']}
        />
        <Line
          type="monotone"
          dataKey="valor"
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/**
 * Componente simple de barras
 */
interface BarChartData {
  name: string;
  value: number;
}

export function SimpleBarChart({
  data,
  color = '#C2410C',
  unit = '',
}: {
  data: BarChartData[];
  color?: string;
  unit?: string;
}) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        No hay datos disponibles
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D8D5D3" />
        <XAxis
          dataKey="name"
          tick={{ fill: '#050506', fontSize: 11 }}
          tickLine={{ stroke: '#D8D5D3' }}
        />
        <YAxis
          tick={{ fill: '#050506', fontSize: 12 }}
          tickLine={{ stroke: '#D8D5D3' }}
          tickFormatter={(v: number | string) => `${v ?? 0}${unit}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFF',
            border: '1px solid #D8D5D3',
            borderRadius: '8px',
          }}
          formatter={(value) => [`${value ?? 0}${unit}`, 'Valor']}
        />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
