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
  const getEscolarizacion = () => {
    const escolarizacion = data.filter((d) => 
      d.indicador_nombre.toLowerCase().includes("escolarización")
    );
    
    // Agrupar por periodo y nivel
    const porPeriodo = new Map<string, Record<string, number>>();
    
    for (const d of escolarizacion) {
      const nivel = d.desglose?.nivel || "General";
      const periodo = d.periodo;
      
      if (!porPeriodo.has(periodo)) {
        porPeriodo.set(periodo, {});
      }
      porPeriodo.get(periodo)![nivel] = Number(d.valor) || 0;
    }
    
    return Array.from(porPeriodo.entries())
      .map(([periodo, valores]) => ({
        periodo,
        ...valores,
      }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo));
  };

  const escolarizacionData = getEscolarizacion();
  
  // Últimos valores
  const latestData = data.length > 0 
    ? data.filter((d) => d.desglose?.nivel === "inicial")
    : [];
  
  const latestInicial = latestData.length > 0 
    ? latestData[latestData.length - 1] 
    : null;

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
          title="Escolarización inicial"
          value={latestInicial ? `${latestInicial.valor}%` : "—"}
          subtitle="Niños de 3-5 años en Jardín/Guardería"
          icon={GraduationCap}
          color="amber"
        />
        
        <KpiCard
          title="Escolarización primario"
          value="99,8%"
          subtitle="Niños de 6-12 años"
          icon={BookOpen}
          color="blue"
        />
        
        <KpiCard
          title="Escolarización secundario"
          value="90,0%"
          subtitle="Jóvenes de 13-17 años"
          icon={Users}
          color="magenta"
        />
      </div>

      {/* Gráfico 1: Escolarización por nivel */}
      <ChartWithTable
        title="Tasa de Escolarización por Nivel Educativo"
        subtitle="Evolución histórica por nivel (2018-2024)"
        color="amber"
        fuente="Censo Nacional 2022 / Ministerio de Educación"
        data={escolarizacionData}
        dataKey="valor"
        xAxisKey="periodo"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={escolarizacionData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="periodo"
                tick={{ fill: "#4D4D4D", fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: "#4D4D4D", fontSize: 12 }}
                domain={[70, 105]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFF",
                  border: "1px solid #E0E0E0",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`${value ?? 0}%`, "Tasa"]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="inicial"
                stroke={COLORS.amber}
                strokeWidth={2}
                dot={{ fill: COLORS.amber, r: 4 }}
                name="Inicial"
              />
              <Line
                type="monotone"
                dataKey="primario"
                stroke={COLORS.blue}
                strokeWidth={2}
                dot={{ fill: COLORS.blue, r: 4 }}
                name="Primario"
              />
              <Line
                type="monotone"
                dataKey="secundario"
                stroke={COLORS.magenta}
                strokeWidth={2}
                dot={{ fill: COLORS.magenta, r: 4 }}
                name="Secundario"
              />
            </LineChart>
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