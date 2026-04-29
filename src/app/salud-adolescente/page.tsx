"use client";

import { HeartPulse, Baby, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SectionHeader } from "@/components/section-header";
import { KpiCard } from "@/components/kpi-card";
import { ChartWithTable } from "@/components/charts/chart-with-table";
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

const COLORS = {
  magenta: "#BF1363",
  terracotta: "#E07A5F",
  blue: "#3777FF",
  green: "#10B981",
  red: "#EF4444",
  amber: "#F3A712",
};

interface IndicadorData {
  indicador_nombre: string;
  valor: number;
  periodo: number;
  region: string;
}

export default function SaludAdolescentePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<IndicadorData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: indicadores, error } = await supabase
        .from("indicadores")
        .select("indicador_nombre, valor, periodo, region")
        .eq("categoria", "salud_adolescente")
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

  // ============== DATOS 1: Nacimientos adolescentes ==============
  const getNacimientos = () => {
    return data
      .filter(d => d.indicador_nombre === "Nacimientos adolescentes")
      .map(d => ({
        periodo: d.periodo,
        valor: Number(d.valor) || 0,
      }))
      .sort((a, b) => a.periodo - b.periodo);
  };

  const nacimientos = getNacimientos();

  // ============== DATOS 2: Tasa fecundidad ==============
  const getFecundidad = () => {
    return data
      .filter(d => d.indicador_nombre === "Tasa fecundidad adolescente")
      .map(d => ({
        periodo: d.periodo,
        valor: Number(d.valor) || 0,
      }))
      .sort((a, b) => a.periodo - b.periodo);
  };

  const fecundidad = getFecundidad();

  // ============== DATOS 3: Mortalidad adolescente ==============
  const getMortalidad = () => {
    return data
      .filter(d => d.indicador_nombre === "Tasa mortalidad adolescente")
      .map(d => ({
        periodo: d.periodo,
        valor: Number(d.valor) || 0,
      }))
      .sort((a, b) => a.periodo - b.periodo);
  };

  const mortalidad = getMortalidad();

  // KPIs
  const ultimosNacimientos = nacimientos.length > 0 ? nacimientos[nacimientos.length - 1].valor : 0;
  const ultimosFecundidad = fecundidad.length > 0 ? fecundidad[fecundidad.length - 1].valor : 0;
  const ultimosMortalidad = mortalidad.length > 0 ? mortalidad[mortalidad.length - 1].valor : 0;

  // Calcular cambio
  const getCambio = (series: { periodo: number; valor: number }[]) => {
    if (series.length < 2) return null;
    const actual = series[series.length - 1].valor;
    const anterior = series[series.length - 2].valor;
    const cambio = ((actual - anterior) / anterior) * 100;
    return {
      value: cambio.toFixed(1),
      tipo: cambio < 0 ? "down" : cambio > 0 ? "up" : "neutral",
    };
  };

  const cambioNacimientos = getCambio(nacimientos);
  const cambioFecundidad = getCambio(fecundidad);

  // Tendencia de nacimientos en los últimos 5 años
  const nacimientosUltimos5 = nacimientos.slice(-5);
  const tendencia = nacimientosUltimos5.length >= 2 
    ? nacimientosUltimos5[nacimientosUltimos5.length - 1].valor - nacimientosUltimos5[0].valor
    : 0;
  const tendenciaAlcista = tendencia > 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={HeartPulse}
        title="Salud Adolescente"
        description="Indicadores de salud sexual y reproductiva en adolescentes - Córdoba"
        color="magenta"
      />

      {/* ALERTA CRÍTICA */}
      {tendenciaAlcista && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 font-semibold">
            <AlertTriangle className="w-5 h-5" />
            <span>ALERTA: Los nacimientos en adolescentes han aumentado en los últimos años</span>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Nacimientos adolescentes"
          value={ultimosNacimientos > 0 ? ultimosNacimientos.toLocaleString("es-AR") : "—"}
          subtitle="Mujeres de 10-19 años"
          change={cambioNacimientos ? `${cambioNacimientos.value}%` : undefined}
          changeType={cambioNacimientos?.tipo as "up" | "down" | undefined}
          icon={Baby}
          color="magenta"
        />
        
        <KpiCard
          title="Tasa de Fecundidad"
          value={ultimosFecundidad > 0 ? `${ultimosFecundidad.toFixed(1)}‰` : "—"}
          subtitle="Por cada mil mujeres 15-19 años"
          change={cambioFecundidad ? `${cambioFecundidad.value}%` : undefined}
          changeType={cambioFecundidad?.tipo as "up" | "down" | undefined}
          icon={HeartPulse}
          color="terracotta"
        />
        
        <KpiCard
          title="Tasa Mortalidad"
          value={ultimosMortalidad > 0 ? `${ultimosMortalidad.toFixed(1)}‰` : "—"}
          subtitle="Adolescentes 15-19 años"
          icon={TrendingDown}
          color="blue"
        />
      </div>

      {/* Gráfico 1: Nacimientos adolescentes - EVOLUCIÓN */}
      {nacimientos.length > 0 && (
        <ChartWithTable
          title="Nacimientos en Adolescentes"
          subtitle="Serie histórica 2015-2022 (mujeres 10-19 años)"
          color="magenta"
          fuente="DEIS - Dirección de Estadísticas e Información de Salud"
          data={nacimientos}
          dataKey="valor"
          xAxisKey="periodo"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={nacimientos} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="periodo" tick={{ fill: "#4D4D4D", fontSize: 12 }} />
                <YAxis tick={{ fill: "#4D4D4D", fontSize: 12 }} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E0E0E0", borderRadius: "8px" }}
                  formatter={(value) => [Number(value).toLocaleString("es-AR"), "Nacimientos"]}
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
        </ChartWithTable>
      )}

      {/* Gráfico 2: Tasa de Fecundidad - COMPARACIÓN */}
      {fecundidad.length > 0 && (
        <ChartWithTable
          title="Tasa de Fecundidad Adolescente"
          subtitle="Por cada mil mujeres de 15-19 años - Comparación histórica"
          color="terracotta"
          fuente="DEIS"
          data={fecundidad}
          dataKey="valor"
          xAxisKey="periodo"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={fecundidad} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="periodo" tick={{ fill: "#4D4D4D", fontSize: 12 }} />
                <YAxis tick={{ fill: "#4D4D4D", fontSize: 12 }} tickFormatter={(v) => `${v}‰`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E0E0E0", borderRadius: "8px" }}
                  formatter={(value) => [`${value}‰`, "Tasa de Fecundidad"]}
                />
                <Bar dataKey="valor" fill={COLORS.terracotta} radius={[4, 4, 0, 0]} name="Tasa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>
      )}

      {/* Gráfico 3: Comparación todas las métricas */}
      {nacimientos.length > 0 && fecundidad.length > 0 && (
        <ChartWithTable
          title="Comparación: Nacimientos vs Tasa de Fecundidad"
          subtitle="Relación entre volumen y tasa (ambas métricas)"
          color="blue"
          fuente="DEIS"
          data={nacimientos.map((n, i) => ({
            periodo: n.periodo,
            nacimientos: n.valor,
            tasa: fecundidad[i]?.valor || 0,
          }))}
          dataKey="nacimientos"
          xAxisKey="periodo"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart 
                data={nacimientos.map((n, i) => ({
                  periodo: n.periodo,
                  nacimientos: n.valor,
                  tasa: fecundidad[i]?.valor || 0,
                }))}
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="periodo" tick={{ fill: "#4D4D4D", fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fill: "#4D4D4D", fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "#4D4D4D", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E0E0E0", borderRadius: "8px" }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="nacimientos" stroke={COLORS.magenta} name="Nacimientos" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="tasa" stroke={COLORS.blue} name="Tasa (‰)" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BF1363]" />
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
          <p className="text-gray-500">No hay datos de salud adolescente disponibles</p>
        </div>
      )}
    </div>
  );
}