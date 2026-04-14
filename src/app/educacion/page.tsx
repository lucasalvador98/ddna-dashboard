"use client";

import { BookOpen, GraduationCap, AlertCircle, Trophy } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionHeader } from "@/components/section-header";
import { ChartCard } from "@/components/charts/chart-card";
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

// Mock data: Tasa de escolarización por nivel 2018-2024
const escolarizacionData = [
  { year: "2018", inicial: 84.2, primario: 98.1, secundario: 78.5 },
  { year: "2019", inicial: 85.8, primario: 98.3, secundario: 79.8 },
  { year: "2020", inicial: 83.1, primario: 97.8, secundario: 76.2 },
  { year: "2021", inicial: 86.4, primario: 98.5, secundario: 80.3 },
  { year: "2022", inicial: 87.9, primario: 98.7, secundario: 82.1 },
  { year: "2023", inicial: 89.2, primario: 99.1, secundario: 84.6 },
  { year: "2024", inicial: 90.8, primario: 99.3, secundario: 86.2 },
];

// Mock data: Resultados Aprender por área
const aprenderData = [
  { area: "Lengua", satisfactorio: 62.4, básico: 24.1, debajo: 13.5 },
  { area: "Matemática", satisfactorio: 48.7, básico: 31.2, debajo: 20.1 },
  { area: "Ciencias Naturales", satisfactorio: 55.8, básico: 28.4, debajo: 15.8 },
  { area: "Ciencias Sociales", satisfactorio: 58.2, básico: 27.1, debajo: 14.7 },
];

export default function EducacionPage() {
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
                  <stop offset="5%" stopColor="#F3A712" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F3A712" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPrimario" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3777FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3777FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSecundario" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#BF1363" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#BF1363" stopOpacity={0} />
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
                stroke="#F3A712"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorInicial)"
                name="Inicial"
              />
              <Area
                type="monotone"
                dataKey="primario"
                stroke="#3777FF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrimario)"
                name="Primario"
              />
              <Area
                type="monotone"
                dataKey="secundario"
                stroke="#BF1363"
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
                fill="#F3A712"
                radius={[0, 0, 0, 0]}
                name="Básico"
              />
              <Bar
                dataKey="debajo"
                stackId="a"
                fill="#E07A5F"
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
