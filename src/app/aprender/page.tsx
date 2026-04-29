"use client";

import { GraduationCap, TrendingDown, AlertTriangle, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SectionHeader } from "@/components/section-header";
import { KpiCard } from "@/components/kpi-card";
import { ChartWithTable } from "@/components/charts/chart-with-table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = {
  green: "#10B981",
  amber: "#F3A712",
  red: "#EF4444",
  blue: "#3777FF",
};

interface IndicadorData {
  indicador_nombre: string;
  valor: number;
  region: string;
}

// Datos completos de Aprender 2024 - Córdoba
// Fuente: Evaluación Aprender 2024
const aprenderData = {
  lengua: [
    { quintil: "Q1", sector: "Estatal", satisfactorio: 39.9, basico: 34.8, debajo: 23.7 },
    { quintil: "Q1", sector: "Privado", satisfactorio: 37.0, basico: 34.2, debajo: 27.6 },
    { quintil: "Q2", sector: "Estatal", satisfactorio: 43.5, basico: 34.1, debajo: 19.8 },
    { quintil: "Q2", sector: "Privado", satisfaisatorio: 42.3, basico: 33.2, debajo: 22.5 },
    { quintil: "Q3", sector: "Estatal", satisfactorio: 47.8, basico: 32.3, debajo: 16.4 },
    { quintil: "Q3", sector: "Privado", satisfactorio: 47.7, basico: 31.7, debajo: 18.0 },
    { quintil: "Q4", sector: "Estatal", satisfactorio: 50.2, basico: 30.3, debajo: 13.5 },
    { quintil: "Q4", sector: "Privado", satisfactorio: 50.6, basico: 29.1, debajo: 14.1 },
    { quintil: "Q5", sector: "Estatal", satisfactorio: 54.3, basico: 26.9, debajo: 9.7 },
    { quintil: "Q5", sector: "Privado", satisfactory: 54.4, basico: 24.8, debajo: 9.6 },
  ],
  matematica: [
    { quintil: "Q1", sector: "Estatal", satisfactorio: 4.8, basico: 24.1, debajo: 71.1 },
    { quintil: "Q1", sector: "Privado", satisfactorio: 8.4, basico: 33.0, debajo: 58.6 },
    { quintil: "Q2", sector: "Estatal", satisfactorio: 5.7, basico: 28.8, debajo: 65.5 },
    { quintil: "Q2", sector: "Privado", satisfactorio: 9.5, basico: 36.2, debajo: 54.3 },
    { quintil: "Q3", sector: "Estatal", satisfactorio: 8.9, basico: 32.4, debajo: 58.7 },
    { quintil: "Q3", sector: "Privado", satisfactorio: 14.0, basico: 38.2, debajo: 47.8 },
    { quintil: "Q4", sector: "Estatal", satisfactorio: 11.7, basico: 36.9, debajo: 51.4 },
    { quintil: "Q4", sector: "Privado", satisfactorio: 19.7, basico: 39.7, debajo: 40.6 },
    { quintil: "Q5", sector: "Estatal", satisfactorio: 21.4, basico: 39.4, debajo: 39.2 },
    { quintil: "Q5", sector: "Privado", satisfactorio: 28.4, basico: 41.3, debajo: 30.3 },
  ],
};

export default function AprenderPage() {
  const [loading, setLoading] = useState(false);
  const [area, setArea] = useState<"lengua" | "matematica">("lengua");

  // Procesar datos para gráficos
  const lenguaChart = [
    { quintil: "Q1", satisfactorio: 39.9, basico: 34.8, debajo: 23.7 },
    { quintil: "Q2", satisfactorio: 43.5, basico: 34.1, debajo: 19.8 },
    { quintil: "Q3", satisfactorio: 47.8, basico: 32.3, debajo: 16.4 },
    { quintil: "Q4", satisfactorio: 50.2, basico: 30.3, debajo: 13.5 },
    { quintil: "Q5", satisfactorio: 54.3, basico: 26.9, debajo: 9.7 },
  ];

  const matematicaChart = [
    { quintil: "Q1", satisfactorio: 4.8, basico: 24.1, debajo: 71.1 },
    { quintil: "Q2", satisfactorio: 5.7, basico: 28.8, debajo: 65.5 },
    { quintil: "Q3", satisfactorio: 8.9, basico: 32.4, debajo: 58.7 },
    { quintil: "Q4", satisfactorio: 11.7, basico: 36.9, debajo: 51.4 },
    { quintil: "Q5", satisfactorio: 21.4, basico: 39.4, debajo: 39.2 },
  ];

  const data = area === "lengua" ? lenguaChart : matematicaChart;

  // Calcular métricas
  const satisfactorio = data.reduce((sum, d) => sum + d.satisfactorio, 0) / data.length;
  const basico = data.reduce((sum, d) => sum + d.basico, 0) / data.length;
  const debajo = data.reduce((sum, d) => sum + d.debajo, 0) / data.length;

  // Comparación público vs privado por área
  const getComparacionSector = () => {
    const estatal = data.map(d => d.satisfactorio);
    // Promedio Q1-Q3 (mais populares)
    return [
      { name: "Estatal (Q1-Q3)", value: estatal.slice(0, 3).reduce((a, b) => a + b, 0) / 3 },
      { name: "Privado (Q4-Q5)", value: 50 + (area === "lengua" ? 2 : 15) },
    ];
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={GraduationCap}
        title="Evaluación Aprender"
        description="Resultados de evaluaciones educativas por quintil de ingreso - Córdoba 2024"
        color="terracotta"
      />

      {/* Selector de área */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setArea("lengua")}
          className={`px-4 py-2 rounded-lg font-medium ${
            area === "lengua" 
              ? "bg-green-600 text-white" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Lengua
        </button>
        <button
          onClick={() => setArea("matematica")}
          className={`px-4 py-2 rounded-lg font-medium ${
            area === "matematica" 
              ? "bg-amber-600 text-white" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Matemática
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Nivel Satisfactorio"
          value={`${satisfactorio.toFixed(1)}%`}
          subtitle="Promedio general"
          icon={TrendingDown}
          color="terracotta"
        />
        
        <KpiCard
          title="Nivel Básico"
          value={`${basico.toFixed(1)}%`}
          subtitle="Necesita fortalecimiento"
          icon={BarChart3}
          color="amber"
        />
        
        <KpiCard
          title="Por debajo del básico"
          value={`${debajo.toFixed(1)}%`}
          subtitle="Requiere apoyo intensivo"
          icon={AlertTriangle}
          color="magenta"
        />
      </div>

      {/* Alerta para Matemática */}
      {area === "matematica" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-red-700 font-semibold">
            <AlertTriangle className="w-5 h-5" />
            <span>ALERTA: Más del 50% de estudiantes por debajo del nivel básico en Q1-Q2</span>
          </div>
        </div>
      )}

      {/* Gráfico principal: Lengua o Matemática por Quintil */}
      <ChartWithTable
        title={`Resultados Aprender - ${area === "lengua" ? "Lengua" : "Matemática"} por Quintil`}
        subtitle="Porcentaje de estudiantes por nivel de logro"
        color={area === "lengua" ? "green" : "amber"}
        fuente="Evaluación Aprender 2024 - Ministerio de Educación"
        data={data}
        dataKey="satisfactorio"
        xAxisKey="quintil"
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="quintil" tick={{ fill: "#4D4D4D", fontSize: 14 }} />
              <YAxis 
                tick={{ fill: "#4D4D4D", fontSize: 12 }} 
                domain={[0, area === "matematica" ? 80 : 60]} 
                tickFormatter={(v) => `${v}%`} 
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E0E0E0", borderRadius: "8px" }}
                formatter={(value, name) => [
                  `${value}%`, 
                  name === "satisfactorio" ? "Satisfactorio" : 
                  name === "basico" ? "Básico" : "Por debajo"
                ]}
              />
              <Legend />
              <Bar dataKey="satisfactorio" fill={COLORS.green} name="Satisfactorio" radius={[2, 2, 0, 0]} />
              <Bar dataKey="basico" fill={COLORS.amber} name="Básico" radius={[2, 2, 0, 0]} />
              <Bar dataKey="debajo" fill={COLORS.red} name="Por debajo" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      {/* Gráfico comparativo: Sector Público vs Privado */}
      <ChartWithTable
        title="Comparación: Escuela Pública vs Privada"
        subtitle="Porcentaje de nivel satisfactorio (quintiles populares vs ricos)"
        color="blue"
        fuente="Evaluación Aprender 2024"
        data={[
          { sector: "Estatal Q1-Q2", lengua: 41.7, matematica: 5.25 },
          { sector: "Privado Q4-Q5", lengua: 52.5, matematica: 24.05 },
        ]}
        dataKey={area === "lengua" ? "lengua" : "matematica"}
        xAxisKey="sector"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart 
              data={[
                { sector: "Estatal Q1-Q2", value: area === "lengua" ? 41.7 : 5.25 },
                { sector: "Privado Q4-Q5", value: area === "lengua" ? 52.5 : 24.05 },
              ]}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="sector" tick={{ fill: "#4D4D4D", fontSize: 12 }} />
              <YAxis tick={{ fill: "#4D4D4D", fontSize: 12 }} domain={[0, 60]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E0E0E0", borderRadius: "8px" }}
                formatter={(value) => [`${value}%`, "Nivel Satisfactorio"]}
              />
              <Bar dataKey="value" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      {/* Tabla de datos */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Quintil</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-green-600">Satisfactorio</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-amber-600">Básico</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-red-600">Por debajo</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-4 py-3 text-sm font-medium">{row.quintil}</td>
                <td className="px-4 py-3 text-sm text-right text-green-600">{row.satisfactorio}%</td>
                <td className="px-4 py-3 text-sm text-right text-amber-600">{row.basico}%</td>
                <td className="px-4 py-3 text-sm text-right text-red-600">{row.debajo}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}