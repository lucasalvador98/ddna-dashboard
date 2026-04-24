"use client";

import { BookOpen, GraduationCap, Users, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SectionHeader } from "@/components/section-header";
import { KpiCard } from "@/components/kpi-card";
import { ChartWithTable } from "@/components/charts/chart-with-table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";

// Colores DDNA
const COLORS = {
  amber: "#F3A712",
  blue: "#3777FF",
  magenta: "#BF1363",
  terracotta: "#E07A5F",
};

interface IndicadorData {
  id: string;
  indicador_nombre: string;
  valor: number;
  unidad: string;
  periodo: string;
  region: string;
  desglose: Record<string, any> | null;
}

export default function EducacionPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<IndicadorData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos
  useEffect(() => {
    async function fetchData() {
      const { data: indicadores, error } = await supabase
        .from("indicadores")
        .select("id, indicador_nombre, valor, unidad, periodo, region, desglose")
        .eq("categoria", "educacion")
        .order("periodo", { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setData(indicadores || []);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  //time series por nivel educativo
  const getAsistenciaEducativa = () => {
    // Filtrar solo "Tasa de asistencia educativa" que tiene valores reales en %
    const asistencia = data.filter((d) => 
      d.indicador_nombre === "Tasa de asistencia educativa"
    );
    
    // Mapear datos para gráfico por edad
    return asistencia
      .map((d) => ({
        edad: d.desglose?.edad ?? 0,
        edadLabel: `${d.desglose?.edad ?? 0} años`,
        valor: Number(d.valor) || 0,
        asistentes: d.desglose?.asistentes || 0,
        poblacion: d.desglose?.poblacion_total || 0,
      }))
      .sort((a, b) => a.edad - b.edad);
  };

  const asistenciaData = getAsistenciaEducativa();
  
  // Últimos valores (año más reciente)
  const tasaPromedio = asistenciaData.length > 0 
    ? asistenciaData.reduce((sum, d) => sum + d.valor, 0) / asistenciaData.length
    : 0;
  
  const tasaInicial = asistenciaData.filter((d) => d.edad >= 3 && d.edad <= 5)
    .reduce((sum, d) => sum + d.valor, 0) / 
    (asistenciaData.filter((d) => d.edad >= 3 && d.edad <= 5).length || 1);
  
  const tasaPrimaria = asistenciaData.filter((d) => d.edad >= 6 && d.edad <= 12)
    .reduce((sum, d) => sum + d.valor, 0) / 
    (asistenciaData.filter((d) => d.edad >= 6 && d.edad <= 12).length || 1);
  
  const tasaSecundaria = asistenciaData.filter((d) => d.edad >= 13 && d.edad <= 17)
    .reduce((sum, d) => sum + d.valor, 0) / 
    (asistenciaData.filter((d) => d.edad >= 13 && d.edad <= 17).length || 1);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={BookOpen}
        title="Indicadores de Educación"
        description="Seguimiento de matriculación y resultados educativos en Córdoba"
        color="amber"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Tasa Promedio"
          value={tasaPromedio > 0 ? `${tasaPromedio.toFixed(1)}%` : "—"}
          subtitle="Asistencia educativa promedio (0-17 años)"
          icon={GraduationCap}
          color="amber"
        />
        
        <KpiCard
          title="Educación Inicial"
          value={tasaInicial > 0 ? `${tasaInicial.toFixed(1)}%` : "—"}
          subtitle="Niños de 3-5 años"
          icon={BookOpen}
          color="blue"
        />
        
        <KpiCard
          title="Educación Secundaria"
          value={tasaSecundaria > 0 ? `${tasaSecundaria.toFixed(1)}%` : "—"}
          subtitle="Jóvenes de 13-17 años"
          icon={Users}
          color="magenta"
        />
      </div>

      {/* Gráfico: Tasa de Asistencia Educativa por Edad */}
      <ChartWithTable
        title="Tasa de Asistencia Educativa por Edad"
        subtitle="Porcentaje de población que asiste a establecimientos educativos (Córdoba, 2022)"
        color="amber"
        fuente="Censo Nacional 2022"
        data={asistenciaData}
        dataKey="valor"
        xAxisKey="edadLabel"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={asistenciaData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="edadLabel"
                tick={{ fill: "#4D4D4D", fontSize: 11 }}
                interval={2}
              />
              <YAxis
                tick={{ fill: "#4D4D4D", fontSize: 12 }}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFF",
                  border: "1px solid #E0E0E0",
                  borderRadius: "8px",
                }}
                formatter={(value, name, props) => [
                  `${value}%`,
                  props.payload.edadLabel,
                ]}
                labelFormatter={(label) => label}
              />
              <Bar
                dataKey="valor"
                fill={COLORS.amber}
                name="Tasa de Asistencia"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      {/* Placeholder para Resultados Aprender */}
      <ChartWithTable
        title="Resultados Aprender"
        subtitle="Evaluaciones de calidad educativa por área"
        color="amber"
        fuente="Ministerio de Educación"
        data={[]}
        dataKey="valor"
        xAxisKey="area"
      >
        <div className="h-72 flex items-center justify-center text-gray-400">
          <p>Datos de evaluaciones Aprender en desarrollo</p>
        </div>
      </ChartWithTable>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F3A712]" />
          <span className="ml-3 font-body text-gray-500">Cargando datos...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error al cargar datos: {error}
        </div>
      )}

      {data.length === 0 && !loading && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">No hay datos de educación disponibles</p>
        </div>
      )}
    </div>
  );
}