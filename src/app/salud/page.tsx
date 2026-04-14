"use client";

import { Heart, Baby, Syringe, TrendingUp, TrendingDown } from "lucide-react";
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

export default function SaludPage() {
  const { data: chartData } = useChartData("salud");
  const mortalidadData = chartData?.charts?.mortalidad ?? placeholderChartData.salud.charts.mortalidad;
  const vacunalData = chartData?.charts?.vacunal ?? placeholderChartData.salud.charts.vacunal;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Heart}
        title="Indicadores de Salud"
        description="Seguimiento de indicadores de salud materno-infantil y adolescentil en la Provincia de Córdoba"
        color="terracotta"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Mortalidad infantil"
          value="6,8‰"
          subtitle="Tasa por mil nacidos vivos - Córdoba 2024"
          change="-0,3‰"
          changeType="down"
          icon={Baby}
          color="terracotta"
        />
        <KpiCard
          title="Cobertura vacunal"
          value="91,1%"
          subtitle="Promedio de esquemas completos al año"
          change="+2,3 pp"
          changeType="up"
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

      {/* Mortalidad Line Chart */}
      <ChartCard
        title="Tasa de Mortalidad Infantil"
        subtitle="Por cada mil nacidos vivos — Córdoba vs Argentina (2018-2024)"
        color="terracotta"
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={mortalidadData}
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
                domain={[5, 10]}
                tickFormatter={(value) => `${value}‰`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFF",
                  border: "1px solid #E0E0E0",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`${value}‰`, ""]}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => (
                  <span style={{ color: "#4D4D4D" }}>
                    {value === "cordoba" ? "Córdoba" : "Argentina"}
                  </span>
                )}
              />
              <Line
                type="monotone"
                dataKey="cordoba"
                stroke="#E07A5F"
                strokeWidth={3}
                dot={{ fill: "#E07A5F", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#E07A5F" }}
                name="Córdoba"
              />
              <Line
                type="monotone"
                dataKey="argentina"
                stroke="#3777FF"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#3777FF", strokeWidth: 2 }}
                activeDot={{ r: 4, fill: "#3777FF" }}
                name="Argentina"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Cobertura Vacunal Bar Chart */}
      <ChartCard
        title="Cobertura Vacunal por Vacuna"
        subtitle="Porcentaje de esquemas completos — Último período disponible"
        color="terracotta"
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={vacunalData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: "#4D4D4D", fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="vaccine"
                tick={{ fill: "#4D4D4D", fontSize: 12 }}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFF",
                  border: "1px solid #E0E0E0",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`${value}%`, "Cobertura"]}
              />
              <Bar
                dataKey="cobertura"
                fill="#E07A5F"
                radius={[0, 4, 4, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
