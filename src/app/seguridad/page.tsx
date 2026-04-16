"use client";

import { Shield, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionHeader } from "@/components/section-header";
import { ChartCard } from "@/components/charts/chart-card";
import { useChartData } from "@/lib/use-chart-data";
import { placeholderChartData } from "@/lib/chart-data";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Tema.json dataColors palette for consistent branding
const DDNA_COLORS = {
  amber: "#F3A712",
  magenta: "#BF1363",
  orange: "#FF7F11",
  cream: "#FFE2BF",
  blue: "#3777FF",
  navy: "#00074E",
  mauve: "#A66999",
  teal: "#3599B8",
  cyan: "#4AC5BB",
  terracotta: "#E07A5F",
};

export default function SeguridadPage() {
  const { data: chartData, metadata } = useChartData("seguridad");
  const denunciasData = chartData?.charts?.denuncias ?? placeholderChartData.seguridad.charts.denuncias;
  const tipoData = chartData?.charts?.tipo ?? placeholderChartData.seguridad.charts.tipo;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Shield}
        title="Indicadores de Seguridad"
        description="Seguimiento de denuncias, intervenciones y medidas de protección de derechos de NNA"
        color="blue"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Total denuncias"
          value="3.102"
          subtitle="Denuncias registradas en el último período"
          change="+255"
          changeType="up"
          icon={AlertTriangle}
          color="blue"
        />
        <KpiCard
          title="Variación interanual"
          value="+9,0%"
          subtitle="Aumento respecto al período anterior"
          change="+1,2 pp"
          changeType="up"
          icon={TrendingUp}
          color="magenta"
        />
        <KpiCard
          title="Tasa por 10.000"
          value="23,4"
          subtitle="Denuncias cada 10.000 habitantes menores"
          icon={BarChart3}
          color="navy"
        />
      </div>

      {/* Denuncias Line Chart */}
      <ChartCard
        title="Denuncias Registradas"
        subtitle="Serie histórica de denuncias — Córdoba (2019-2024)"
        color="blue"
        fuente={metadata?.fuente}
        ultimaActualizacion={metadata?.ultimaActualizacion}
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={denunciasData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#4D4D4D", fontSize: 12 }}
                tickLine={{ stroke: "#E0E0E0" }}
              />
              <YAxis
                tick={{ fill: "#4D4D4D", fontSize: 12 }}
                tickLine={{ stroke: "#E0E0E0" }}
                domain={[1000, 3500]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFF",
                  border: "1px solid #E0E0E0",
                  borderRadius: "8px",
                }}
                formatter={(value) => [Number(value).toLocaleString(), "Denuncias"]}
              />
              <Line
                type="monotone"
                dataKey="cantidad"
                stroke={DDNA_COLORS.blue}
                strokeWidth={3}
                dot={{ fill: DDNA_COLORS.blue, strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: DDNA_COLORS.blue }}
                name="Denuncias"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Distribución Pie Chart */}
      <ChartCard
        title="Distribución por Tipo de Denuncia"
        subtitle="Porcentaje según tipo de vulneración — Último período"
        color="blue"
        fuente={metadata?.fuente}
        ultimaActualizacion={metadata?.ultimaActualizacion}
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={tipoData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {tipoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={String(entry.color)} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFF",
                  border: "1px solid #E0E0E0",
                  borderRadius: "8px",
                }}
                formatter={(value) => [Number(value).toLocaleString(), "Cantidad"]}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => (
                  <span style={{ color: "#4D4D4D" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
