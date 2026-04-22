"use client";

import { Coins, TrendingUp, Percent, BarChart3 } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionHeader } from "@/components/section-header";
import { ChartCard } from "@/components/charts/chart-card";
import { useChartData } from "@/lib/use-chart-data";
import { usePaicor } from "@/lib/use-paicor";
import { placeholderChartData } from "@/lib/chart-data";
import {
  ComposedChart,
  Bar,
  Line,
  LineChart,
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

export default function InversionPage() {
  const { data: chartData, metadata } = useChartData("inversion");
  const inversionData = chartData?.charts?.inversion ?? placeholderChartData.inversion.charts.inversion;
  const presupuestoData = chartData?.charts?.presupuesto ?? placeholderChartData.inversion.charts.presupuesto;

  // PAICOR data (beneficiaries by department)
  const { chartData: paicorChartData, loading: paicorLoading, metadata: paicorMetadata } = usePaicor();

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Coins}
        title="Inversión Social"
        description="Análisis del presupuesto destinado a políticas públicas para la infancia y adolescencia"
        color="orange"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Inversión total"
          value="$51.110 M"
          subtitle="Miles de millones de pesos — 2024"
          change="+8,2%"
          changeType="up"
          icon={Coins}
          color="orange"
        />
        <KpiCard
          title="% Presupuesto"
          value="23,5%"
          subtitle="Del presupuesto total a infancia"
          change="+0,7 pp"
          changeType="up"
          icon={Percent}
          color="amber"
        />
        <KpiCard
          title="Variación real"
          value="+12,4%"
          subtitle="Crecimiento real vs inflación"
          change="+3,1 pp"
          changeType="up"
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Inversión Stacked Bar Chart */}
      <ChartCard
        title="Inversión Social en Infancia por Área"
        subtitle="Millones de pesos constantes — Córdoba (2018-2024)"
        color="orange"
        fuente={metadata?.fuente}
        ultimaActualizacion={metadata?.ultimaActualizacion}
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={inversionData}
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
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFF",
                  border: "1px solid #E0E0E0",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`$${Number(value).toLocaleString()}M`, ""]}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => (
                  <span style={{ color: "#4D4D4D" }}>
                    {value === "educacion"
                      ? "Educación"
                      : value === "salud"
                      ? "Salud"
                      : value === "proteccion"
                      ? "Protección"
                      : "Desarrollo"}
                  </span>
                )}
              />
              <Bar
                dataKey="educacion"
                stackId="a"
                fill={DDNA_COLORS.amber}
                name="Educación"
              />
              <Bar
                dataKey="salud"
                stackId="a"
                fill={DDNA_COLORS.blue}
                name="Salud"
              />
              <Bar
                dataKey="proteccion"
                stackId="a"
                fill={DDNA_COLORS.magenta}
                name="Protección"
              />
              <Bar
                dataKey="desarrollo"
                stackId="a"
                fill={DDNA_COLORS.terracotta}
                radius={[4, 4, 0, 0]}
                name="Desarrollo"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Presupuesto Line Chart */}
      <ChartCard
        title="Evolución del % del Presupuesto Destinado a Infancia"
        subtitle="Porcentaje sobre presupuesto total — Córdoba (2018-2024)"
        color="orange"
        fuente={metadata?.fuente}
        ultimaActualizacion={metadata?.ultimaActualizacion}
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={presupuestoData}
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
                domain={[15, 25]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFF",
                  border: "1px solid #E0E0E0",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`${value}%`, ""]}
              />
              <Line
                type="monotone"
                dataKey="porcentaje"
                stroke={DDNA_COLORS.orange}
                strokeWidth={3}
                dot={{ fill: DDNA_COLORS.orange, strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: DDNA_COLORS.orange }}
                name="% Presupuesto"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* PAICOR Bar Chart */}
      <ChartCard
        title="PAICOR - Beneficiarios por Departamento"
        subtitle="Programa de Asistencia Integral de Córdoba (2018)"
        color="blue"
        fuente={paicorMetadata?.fuente}
        ultimaActualizacion={paicorMetadata?.ultimaActualizacion}
      >
        {paicorLoading ? (
          <div className="h-80 flex items-center justify-center">
            <span className="text-gray-500">Cargando datos...</span>
          </div>
        ) : paicorChartData ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={paicorChartData.labels.map((label, idx) => ({
                  departamento: label,
                  beneficiaries: paicorChartData.datasets[0].data[idx],
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey="departamento"
                  tick={{ fill: "#4D4D4D", fontSize: 10 }}
                  tickLine={{ stroke: "#E0E0E0" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fill: "#4D4D4D", fontSize: 12 }}
                  tickLine={{ stroke: "#E0E0E0" }}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFF",
                    border: "1px solid #E0E0E0",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [Number(value).toLocaleString(), "Beneficiarios"]}
                />
                <Bar
                  dataKey="beneficiarios"
                  fill={DDNA_COLORS.blue}
                  name="Beneficiarios"
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <span className="text-gray-500">No hay datos disponibles</span>
          </div>
        )}
      </ChartCard>
    </div>
  );
}
