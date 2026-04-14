"use client";

import { Users, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionHeader } from "@/components/section-header";
import { ChartCard } from "@/components/charts/chart-card";
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

// Mock data: Pobreza e indigencia infantil 2018-2024
const pobrezaData = [
  { year: "2018", pobreza: 49.2, indigencia: 12.8 },
  { year: "2019", pobreza: 47.1, indigencia: 11.9 },
  { year: "2020", pobreza: 52.4, indigencia: 15.3 },
  { year: "2021", pobreza: 54.2, indigencia: 17.1 },
  { year: "2022", pobreza: 51.8, indigencia: 15.8 },
  { year: "2023", pobreza: 48.3, indigencia: 13.4 },
  { year: "2024", pobreza: 45.7, indigencia: 11.9 },
];

// Mock data: Brecha de pobreza por grupo etario
const brechaData = [
  { grupo: "0-5 años", pobreza: 52.4, brecha: 8.2 },
  { grupo: "6-12 años", pobreza: 48.1, brecha: 3.9 },
  { grupo: "13-17 años", pobreza: 44.8, brecha: 0.6 },
];

export default function PobrezaPage() {
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
                stroke="#BF1363"
                strokeWidth={3}
                dot={{ fill: "#BF1363", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#BF1363" }}
                name="Pobreza"
              />
              <Line
                type="monotone"
                dataKey="indigencia"
                stroke="#E07A5F"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#E07A5F", strokeWidth: 2 }}
                activeDot={{ r: 4, fill: "#E07A5F" }}
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
                fill="#BF1363"
                radius={[0, 4, 4, 0]}
                barSize={32}
                name="Pobreza NNA"
              />
              <Bar
                dataKey="brecha"
                fill="#E07A5F"
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
