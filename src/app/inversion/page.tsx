"use client";

import { Coins, TrendingUp, Percent, BarChart3 } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionHeader } from "@/components/section-header";
import { ChartCard } from "@/components/charts/chart-card";
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

// Mock data: Inversión social en infancia por área 2018-2024 (en millones de pesos)
const inversionData = [
  { year: "2018", educacion: 12450, salud: 8920, proteccion: 3420, desarrollo: 2180 },
  { year: "2019", educacion: 13890, salud: 9540, proteccion: 3890, desarrollo: 2450 },
  { year: "2020", educacion: 15120, salud: 11280, proteccion: 4280, desarrollo: 2890 },
  { year: "2021", educacion: 16840, salud: 12890, proteccion: 4920, desarrollo: 3240 },
  { year: "2022", educacion: 18420, salud: 14120, proteccion: 5450, desarrollo: 3680 },
  { year: "2023", educacion: 20150, salud: 15840, proteccion: 6120, desarrollo: 4120 },
  { year: "2024", educacion: 22480, salud: 17120, proteccion: 6890, desarrollo: 4580 },
];

// Mock data: % del presupuesto destinado a infancia
const presupuestoData = [
  { year: "2018", porcentaje: 18.4 },
  { year: "2019", porcentaje: 19.1 },
  { year: "2020", porcentaje: 20.8 },
  { year: "2021", porcentaje: 21.4 },
  { year: "2022", porcentaje: 22.1 },
  { year: "2023", porcentaje: 22.8 },
  { year: "2024", porcentaje: 23.5 },
];

export default function InversionPage() {
  const totalInversion = 51110; // 2024 total in millions

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
          color="blue"
        />
      </div>

      {/* Inversión Stacked Bar Chart */}
      <ChartCard
        title="Inversión Social en Infancia por Área"
        subtitle="Millones de pesos constantes — Córdoba (2018-2024)"
        color="orange"
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
                fill="#F3A712"
                name="Educación"
              />
              <Bar
                dataKey="salud"
                stackId="a"
                fill="#3777FF"
                name="Salud"
              />
              <Bar
                dataKey="proteccion"
                stackId="a"
                fill="#BF1363"
                name="Protección"
              />
              <Bar
                dataKey="desarrollo"
                stackId="a"
                fill="#E07A5F"
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
                stroke="#FFB347"
                strokeWidth={3}
                dot={{ fill: "#FFB347", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: "#FFB347" }}
                name="% Presupuesto"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
