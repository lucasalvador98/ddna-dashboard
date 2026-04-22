"use client";

import { Heart, Baby, Syringe, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SectionHeader } from "@/components/section-header";
import { KpiCard } from "@/components/kpi-card";
import { ChartWithTable, SimpleLineChart, SimpleBarChart } from "@/components/charts/chart-with-table";
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
} from "recharts";

// Colores DDNA
const COLORS = {
  terracotta: "#E07A5F",
  blue: "#3777FF",
  magenta: "#BF1363",
  amber: "#F3A712",
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

export default function SaludPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<IndicadorData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de Supabase
  useEffect(() => {
    async function fetchData() {
      const { data: indicadores, error } = await supabase
        .from("indicadores")
        .select("id, indicador_nombre, valor, unidad, periodo, region, desglose")
        .eq("categoria", "salud")
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

  // Agrupar datos por indicador
  const getTimeSeries = (nombreParcial: string) => {
    return data
      .filter((d) => d.indicador_nombre.toLowerCase().includes(nombreParcial.toLowerCase()))
      .map((d) => ({
        periodo: d.periodo,
        valor: Number(d.valor) || 0,
        region: d.region,
      }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo));
  };

  // Mortalidad infantil time series
  const mortalidadData = getTimeSeries("mortalidad");
  
  // Cobertura vacunal
  const coberturaData = data
    .filter((d) => d.indicador_nombre.toLowerCase().includes("cobertura"))
    .map((d) => ({
      name: d.desglose?.vacuna || d.desglose?.tipo || "General",
      value: Number(d.valor) || 0,
    }));

  // Últimos valores
  const latestMortalidad = mortalidadData.length > 0 
    ? mortalidadData[mortalidadData.length - 1] 
    : null;
  
  const latestCobertura = coberturaData.length > 0
    ? coberturaData[coberturaData.length - 1]
    : null;

  // Calcular cambio
  const getCambio = (arr: { periodo: string; valor: number }[]) => {
    if (arr.length < 2) return null;
    const actual = arr[arr.length - 1].valor;
    const anterior = arr[arr.length - 2].valor;
    const cambio = actual - anterior;
    return {
      value: cambio.toFixed(1),
      tipo: cambio < 0 ? "down" : cambio > 0 ? "up" : "neutral",
    };
  };

  const cambioMortalidad = getCambio(mortalidadData);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Heart}
        title="Indicadores de Salud"
        description="Seguimiento de indicadores de salud materno-infantil y adolescente en Córdoba"
        color="terracotta"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Mortalidad infantil"
          value={latestMortalidad ? `${latestMortalidad.valor}‰` : "—"}
          subtitle={`Tasa por mil nacidos vivos - Córdoba ${latestMortalidad?.periodo || ""}`}
          change={cambioMortalidad ? `${cambioMortalidad.value}‰` : undefined}
          changeType={cambioMortalidad?.tipo as "up" | "down" | undefined}
          icon={Baby}
          color="terracotta"
        />
        
        <KpiCard
          title="Cobertura vacunal"
          value={latestCobertura ? `${latestCobertura.value}%` : "—"}
          subtitle="Promedio de esquemas completos"
          icon={Syringe}
          color="blue"
        />
        
        <KpiCard
          title="Nacimientos"
          value="83.456"
          subtitle="Registrados en el último período"
          icon={Heart}
          color="magenta"
        />
      </div>

      {/* Gráfico 1: Mortalidad Infantil */}
      <ChartWithTable
        title="Tasa de Mortalidad Infantil"
        subtitle="Evolución histórica (por cada mil nacidos vivos)"
        color="terracotta"
        fuente="DEIS - Dirección de Estadísticas e Información de Salud"
        data={mortalidadData}
        dataKey="valor"
        xAxisKey="periodo"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mortalidadData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="periodo"
                tick={{ fill: "#4D4D4D", fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: "#4D4D4D", fontSize: 12 }}
                domain={[0, "auto"]}
                tickFormatter={(v) => `${v}‰`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFF",
                  border: "1px solid #E0E0E0",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`${value ?? 0}‰`, "Tasa"]}
              />
              <Line
                type="monotone"
                dataKey="valor"
                stroke={COLORS.terracotta}
                strokeWidth={2}
                dot={{ fill: COLORS.terracotta, r: 4 }}
                activeDot={{ r: 6 }}
                name="Córdoba"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      {/* Gráfico 2: Cobertura Vacunal */}
      <ChartWithTable
        title="Cobertura Vacunal por Tipo"
        subtitle="Porcentaje de esquemas completos por vacuna"
        color="blue"
        fuente="DEIS"
        data={coberturaData}
        dataKey="value"
        xAxisKey="name"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={coberturaData} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: "#4D4D4D", fontSize: 12 }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#4D4D4D", fontSize: 11 }}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFF",
                  border: "1px solid #E0E0E0",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`${value ?? 0}%`, "Cobertura"]}
              />
              <Bar
                dataKey="value"
                fill={COLORS.blue}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E07A5F]" />
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
          <p className="text-gray-500">No hay datos de salud disponibles</p>
        </div>
      )}
    </div>
  );
}