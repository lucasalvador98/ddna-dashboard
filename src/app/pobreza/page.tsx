"use client";

import { Users, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionHeader } from "@/components/section-header";
import { ChartCard } from "@/components/charts/chart-card";
import { useChartData } from "@/lib/use-chart-data";
import { placeholderChartData } from "@/lib/chart-data";
import {
  LineChart,
  Line,
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

export default function PobrezaPage() {
  const { data: chartData } = useChartData("pobreza");
  const pobrezaData = chartData?.charts?.pobreza ?? placeholderChartData.pobreza.charts.pobreza;
  const brechaData = chartData?.charts?.brecha ?? placeholderChartData.pobreza.charts.brecha;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Users}
        title="Indicadores de Pobreza"
        description="Análisis de la pobreza infantil y adolescente, indigencia y vulnerabilidades socioeconómicas"
        color="magenta"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Pobreza infantil"
          value="45,7%"
          subtitle="Niños y adolescentes bajo línea de pobreza"
          change="-2,6 pp"
          changeType="down"
          icon={TrendingDown}
          color="magenta"
        />
        <KpiCard
          title="Indigencia infantil"
          value="11,9%"
          subtitle="Niños bajo línea de indigencia"
          change="-1,5 pp"
          changeType="down"
          icon={AlertTriangle}
          color="terracotta"
        />
        <KpiCard
          title="Brecha de pobreza"
          value="+6,8 pp"
          subtitle="Diferencia con pobreza general de adultos"
          icon={Users}
          color="navy"
        />
      </div>

      {/* Pobreza Line Chart */}
      <ChartCard
        title="Evolución de la Pobreza e Indigencia Infantil"
        subtitle="Porcentaje de NNA bajo líneas de pobreza e indigencia — Córdoba (2018-2024)"
        color="magenta"
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={pobrezaData}
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
                domain={[0, 60]}
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
                    {value === "pobreza" ? "Pobreza" : "Indigencia"}
                  </span>
                )}
              />
              <Line
                type="monotone"
                dataKey="pobreza"
                stroke={DDNA_COLORS.magenta}
                strokeWidth={3}
                dot={{ fill: DDNA_COLORS.magenta, strokeWidth: 2 }}
                activeDot={{ r: 6, fill: DDNA_COLORS.magenta }}
                name="Pobreza"
              />
              <Line
                type="monotone"
                dataKey="indigencia"
                stroke={DDNA_COLORS.terracotta}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: DDNA_COLORS.terracotta, strokeWidth: 2 }}
                activeDot={{ r: 4, fill: DDNA_COLORS.terracotta }}
                name="Indigencia"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Brecha Bar Chart */}
      <ChartCard
        title="Brecha de Pobreza por Grupo Etario"
        subtitle="Comparación de pobreza infantil vs pobreza general por edad"
        color="magenta"
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={brechaData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 60]}
                tick={{ fill: "#4D4D4D", fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="grupo"
                tick={{ fill: "#4D4D4D", fontSize: 12 }}
                width={70}
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
                    {value === "pobreza" ? "Pobreza NNA" : "Brecha vs adultos"}
                  </span>
                )}
              />
              <Bar
                dataKey="pobreza"
                fill={DDNA_COLORS.magenta}
                radius={[0, 4, 4, 0]}
                barSize={32}
                name="Pobreza NNA"
              />
              <Bar
                dataKey="brecha"
                fill={DDNA_COLORS.terracotta}
                radius={[0, 4, 4, 0]}
                barSize={32}
                name="Brecha vs adultos"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
