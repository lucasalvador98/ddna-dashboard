"use client";

import { BookOpen, GraduationCap, AlertCircle, Trophy } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionHeader } from "@/components/section-header";
import { ChartCard } from "@/components/charts/chart-card";
import { useChartData } from "@/lib/use-chart-data";
import { placeholderChartData } from "@/lib/chart-data";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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

export default function EducacionPage() {
  const { data: chartData } = useChartData("educacion");
  const escolarizacionData = chartData?.charts?.escolarizacion ?? placeholderChartData.educacion.charts.escolarizacion;
  const aprenderData = chartData?.charts?.aprender ?? placeholderChartData.educacion.charts.aprender;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={BookOpen}
        title="Indicadores de Educación"
        description="Monitoreo de indicadores educativos: escolarización, abandono, repitencia y logros de aprendizaje"
        color="amber"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Escolarización total"
          value="89,1%"
          subtitle="Tasa neta de escolarización combinada"
          change="+2,3 pp"
          changeType="up"
          icon={GraduationCap}
          color="amber"
        />
        <KpiCard
          title="Abandono escolar"
          value="3,2%"
          subtitle="Tasa de abandono en secundario"
          change="-0,8 pp"
          changeType="down"
          icon={AlertCircle}
          color="magenta"
        />
        <KpiCard
          title="Resultados Aprender"
          value="55,8%"
          subtitle="Nivel satisfactorio en ciencias"
          change="+4,2 pp"
          changeType="up"
          icon={Trophy}
          color="blue"
        />
      </div>

      {/* Escolarización Area Chart */}
      <ChartCard
        title="Tasa de Escolarización por Nivel"
        subtitle="Educación inicial, primaria y secundaria — Córdoba (2018-2024)"
        color="amber"
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={escolarizacionData}
              margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorInicial" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={DDNA_COLORS.amber} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={DDNA_COLORS.amber} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPrimario" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={DDNA_COLORS.blue} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={DDNA_COLORS.blue} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSecundario" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={DDNA_COLORS.magenta} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={DDNA_COLORS.magenta} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#4D4D4D", fontSize: 12 }}
                tickLine={{ stroke: "#E0E0E0" }}
              />
              <YAxis
                tick={{ fill: "#4D4D4D", fontSize: 12 }}
                tickLine={{ stroke: "#E0E0E0" }}
                domain={[70, 100]}
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
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => (
                  <span style={{ color: "#4D4D4D" }}>
                    {value === "inicial"
                      ? "Inicial"
                      : value === "primario"
                      ? "Primario"
                      : "Secundario"}
                  </span>
                )}
              />
              <Area
                type="monotone"
                dataKey="inicial"
                stroke={DDNA_COLORS.amber}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorInicial)"
                name="Inicial"
              />
              <Area
                type="monotone"
                dataKey="primario"
                stroke={DDNA_COLORS.blue}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrimario)"
                name="Primario"
              />
              <Area
                type="monotone"
                dataKey="secundario"
                stroke={DDNA_COLORS.magenta}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSecundario)"
                name="Secundario"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Resultados Aprender Bar Chart */}
      <ChartCard
        title="Resultados Aprender por Área"
        subtitle="Porcentaje de estudiantes por nivel de logro — Último período"
        color="amber"
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={aprenderData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="area"
                tick={{ fill: "#4D4D4D", fontSize: 12 }}
                tickLine={{ stroke: "#E0E0E0" }}
              />
              <YAxis
                tick={{ fill: "#4D4D4D", fontSize: 12 }}
                tickLine={{ stroke: "#E0E0E0" }}
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
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => (
                  <span style={{ color: "#4D4D4D" }}>
                    {value === "satisfactorio"
                      ? "Satisfactorio"
                      : value === "básico"
                      ? "Básico"
                      : "Debajo del básico"}
                  </span>
                )}
              />
              <Bar
                dataKey="satisfactorio"
                stackId="a"
                fill="#22C55E"
                radius={[0, 0, 0, 0]}
                name="Satisfactorio"
              />
              <Bar
                dataKey="básico"
                stackId="a"
                fill={DDNA_COLORS.amber}
                radius={[0, 0, 0, 0]}
                name="Básico"
              />
              <Bar
                dataKey="debajo"
                stackId="a"
                fill={DDNA_COLORS.terracotta}
                radius={[4, 4, 0, 0]}
                name="Debajo del básico"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
