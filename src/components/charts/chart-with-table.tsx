"use client";

import { useState } from "react";
import { Table, Table2, ChevronDown, ChevronUp } from "lucide-react";

interface ChartWithTableProps {
  title: string;
  subtitle?: string;
  color?: "terracotta" | "amber" | "magenta" | "blue" | "green";
  fuente?: string;
  ultimaActualizacion?: string | null;
  data: Record<string, any>[];
  dataKey: string; // La key principal para los valores (ej: "valor", "cobertura")
  xAxisKey: string; // La key del eje X (ej: "periodo", "year", "area")
  chartType?: "line" | "bar" | "area" | "pie";
  children?: React.ReactNode;
  colorMap?: Record<string, string>;
}

const colorStyles = {
  terracotta: {
    primary: "#E07A5F",
    secondary: "#F4A261",
    light: "#FDE8E4",
  },
  amber: {
    primary: "#F3A712",
    secondary: "#F5C842",
    light: "#FFF3CD",
  },
  magenta: {
    primary: "#BF1363",
    secondary: "#D94B8A",
    light: "#FDE8F0",
  },
  blue: {
    primary: "#3777FF",
    secondary: "#6B9AFF",
    light: "#E6F0FF",
  },
  green: {
    primary: "#3599B8",
    secondary: "#5CB8CC",
    light: "#E6F5F8",
  },
};

export function ChartWithTable({
  title,
  subtitle,
  color = "terracotta",
  fuente,
  ultimaActualizacion,
  data,
  dataKey,
  xAxisKey,
  children,
}: ChartWithTableProps) {
  const [showTable, setShowTable] = useState(false);
  
  const colors = colorStyles[color];
  
  // Obtener todas las keys disponibles en los datos
  const allKeys = data.length > 0 ? Object.keys(data[0]).filter(k => k !== xAxisKey) : [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header del chart */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg text-[#00074E]">{title}</h3>
            {subtitle && (
              <p className="font-body text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          
          {/* Metadata */}
          <div className="text-right">
            {fuente && (
              <p className="text-xs text-gray-400">Fuente: {fuente}</p>
            )}
            {ultimaActualizacion && (
              <p className="text-xs text-gray-400">
                Actualizado: {new Date(ultimaActualizacion).toLocaleDateString("es-AR")}
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
          className="w-full px-5 py-3 flex items-center justify-between text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <span className="font-body text-sm flex items-center gap-2">
            <Table2 className="w-4 h-4" />
            Ver datos fuente
          </span>
          {showTable ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {/* Tabla de datos */}
        {showTable && data.length > 0 && (
          <div className="px-5 pb-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-600 bg-gray-50 rounded-tl-lg">
                      {xAxisKey.charAt(0).toUpperCase() + xAxisKey.slice(1)}
                    </th>
                    {allKeys.map((key) => (
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
                  {data.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-2 px-3 text-gray-700">
                        {row[xAxisKey]}
                      </td>
                      {allKeys.map((key) => (
                        <td
                          key={key}
                          className="text-right py-2 px-3 text-gray-700"
                        >
                          {typeof row[key] === "number"
                            ? row[key].toLocaleString("es-AR", {
                                maximumFractionDigits: 2,
                              })
                            : row[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {data.length === 0 && (
              <p className="text-gray-400 text-center py-8">
                No hay datos disponibles
              </p>
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

export function SimpleLineChart({
  data,
  color = "#E07A5F",
  unit = "",
}: TimeSeriesChartProps) {
  // Importar aquí para evitar errores de SSR
  const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } =
    require("recharts");

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
        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
        <XAxis
          dataKey="periodo"
          tick={{ fill: "#4D4D4D", fontSize: 12 }}
          tickLine={{ stroke: "#E0E0E0" }}
        />
        <YAxis
          tick={{ fill: "#4D4D4D", fontSize: 12 }}
          tickLine={{ stroke: "#E0E0E0" }}
          tickFormatter={(v) => `${v}${unit}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FFF",
            border: "1px solid #E0E0E0",
            borderRadius: "8px",
          }}
          formatter={(value: number) => [`${value}${unit}`, "Valor"]}
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
  color = "#E07A5F",
  unit = "",
}: {
  data: BarChartData[];
  color?: string;
  unit?: string;
}) {
  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } =
    require("recharts");

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
        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#4D4D4D", fontSize: 11 }}
          tickLine={{ stroke: "#E0E0E0" }}
        />
        <YAxis
          tick={{ fill: "#4D4D4D", fontSize: 12 }}
          tickLine={{ stroke: "#E0E0E0" }}
          tickFormatter={(v) => `${v}${unit}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FFF",
            border: "1px solid #E0E0E0",
            borderRadius: "8px",
          }}
          formatter={(value: number) => [`${value}${unit}`, "Valor"]}
        />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}