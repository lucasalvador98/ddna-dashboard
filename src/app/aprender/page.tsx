"use client";

import { GraduationCap, TrendingDown, AlertTriangle, BarChart3, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { parseDesglose } from "@/lib/parse-desglose";
import { SectionHeader } from "@/components/section-header";
import { KpiCard } from "@/components/kpi-card";
import { ChartWithTable } from "@/components/charts/chart-with-table";
import {
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
  green: "#10B981",
  amber: "#F3A712",
  red: "#EF4444",
  blue: "#3777FF",
};

interface AprenderRow {
  quintil: string;
  satisfactorio: number;
  basico: number;
  debajo: number;
}

// ─── Data fetching & transformation ────────────────────────────────────────────

function buildChartData(
  rawData: Array<{ indicador_nombre: string; valor: number; desglose: Record<string, unknown> }>,
  subject: "lengua" | "matematica",
  sector?: string
): AprenderRow[] {
  const subjectKey = subject === "lengua" ? "Lengua" : "Matemática";
  const quintiles = ["Q1", "Q2", "Q3", "Q4", "Q5"];

  return quintiles.map((q) => {
    const row: AprenderRow = { quintil: q, satisfactorio: 0, basico: 0, debajo: 0 };

    const matches = (d: { desglose: Record<string, unknown> }) =>
      d.desglose?.quintil === q && (!sector || d.desglose?.sector === sector);

    const sat = rawData.find(
      (d) => d.indicador_nombre === `Nivel ${subjectKey} - Satisfactorio` && matches(d)
    );
    row.satisfactorio = sat ? Number(sat.valor) : 0;

    const bas = rawData.find(
      (d) => d.indicador_nombre === `Nivel ${subjectKey} - Básico` && matches(d)
    );
    row.basico = bas ? Number(bas.valor) : 0;

    const deb = rawData.find(
      (d) =>
        (d.indicador_nombre === `Nivel ${subjectKey} - Por debajo del básico` ||
          d.indicador_nombre === `Nivel ${subjectKey} - Por debajo del básicos`) &&
        matches(d)
    );
    row.debajo = deb ? Number(deb.valor) : 0;

    return row;
  });
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AprenderPage() {
  const [rawData, setRawData] = useState<
    Array<{ indicador_nombre: string; valor: number; desglose: Record<string, unknown> }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [area, setArea] = useState<"lengua" | "matematica">("lengua");

  useEffect(() => {
    supabase
      .from("indicadores")
      .select("indicador_nombre, valor, desglose")
      .eq("categoria", "aprender")
      .then(({ data }) => {
        setRawData(
          (data || []).map((d) => ({
            ...d,
            desglose: parseDesglose(d.desglose),
          }))
        );
        setLoading(false);
      });
  }, []);

  // ── Derived data ───────────────────────────────────────────────────────────

  const chartData = buildChartData(rawData, area, "Estatal");
  const estatalFull = buildChartData(rawData, area, "Estatal");
  const privadoFull = buildChartData(rawData, area, "Privado");

  const hasData = rawData.length > 0;

  // KPI averages (Estatal, all quintiles)
  const satisfactorio = chartData.reduce((sum, d) => sum + d.satisfactorio, 0) / chartData.length;
  const basico = chartData.reduce((sum, d) => sum + d.basico, 0) / chartData.length;
  const debajo = chartData.reduce((sum, d) => sum + d.debajo, 0) / chartData.length;

  // Sector comparison: Estatal Q1-Q2 vs Privado Q4-Q5
  const estatalQ1Q2 =
    hasData
      ? (estatalFull[0]?.satisfactorio + estatalFull[1]?.satisfactorio) / 2
      : area === "lengua"
        ? 41.7
        : 5.25;
  const privadoQ4Q5 =
    hasData
      ? (privadoFull[3]?.satisfactorio + privadoFull[4]?.satisfactorio) / 2
      : area === "lengua"
        ? 52.5
        : 24.05;

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          icon={GraduationCap}
          title="Evaluación Aprender"
          description="Resultados de evaluaciones educativas por quintil de ingreso - Córdoba 2024"
          color="terracotta"
        />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={GraduationCap}
        title="Evaluación Aprender"
        description="Resultados de evaluaciones educativas por quintil de ingreso - Córdoba 2024"
        color="terracotta"
      />

      {/* Selector de área */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setArea("lengua")}
          className={`px-4 py-2 rounded-lg font-medium ${
            area === "lengua"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Lengua
        </button>
        <button
          onClick={() => setArea("matematica")}
          className={`px-4 py-2 rounded-lg font-medium ${
            area === "matematica"
              ? "bg-amber-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Matemática
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Nivel Satisfactorio"
          value={`${satisfactorio.toFixed(1)}%`}
          subtitle={hasData ? "Promedio general" : "Sin datos disponibles"}
          icon={TrendingDown}
          color="terracotta"
        />

        <KpiCard
          title="Nivel Básico"
          value={`${basico.toFixed(1)}%`}
          subtitle={hasData ? "Necesita fortalecimiento" : "Sin datos disponibles"}
          icon={BarChart3}
          color="amber"
        />

        <KpiCard
          title="Por debajo del básico"
          value={`${debajo.toFixed(1)}%`}
          subtitle={hasData ? "Requiere apoyo intensivo" : "Sin datos disponibles"}
          icon={AlertTriangle}
          color="magenta"
        />
      </div>

      {/* Alerta para Matemática */}
      {area === "matematica" && hasData && chartData[0]?.debajo > 50 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-red-700 font-semibold">
            <AlertTriangle className="w-5 h-5" />
            <span>ALERTA: Más del 50% de estudiantes por debajo del nivel básico en Q1-Q2</span>
          </div>
        </div>
      )}

      {/* Gráfico principal: Lengua o Matemática por Quintil */}
      <ChartWithTable
        title={`Resultados Aprender - ${area === "lengua" ? "Lengua" : "Matemática"} por Quintil`}
        subtitle="Porcentaje de estudiantes por nivel de logro"
        color={area === "lengua" ? "green" : "amber"}
        fuente="Evaluación Aprender 2024 - Ministerio de Educación"
        data={chartData}
        dataKey="satisfactorio"
        xAxisKey="quintil"
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="quintil" tick={{ fill: "#4D4D4D", fontSize: 14 }} />
              <YAxis
                tick={{ fill: "#4D4D4D", fontSize: 12 }}
                domain={[0, area === "matematica" ? 80 : 60]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFF",
                  border: "1px solid #E0E0E0",
                  borderRadius: "8px",
                }}
                formatter={(value, name) => [
                  `${value}%`,
                  name === "satisfactorio"
                    ? "Satisfactorio"
                    : name === "basico"
                      ? "Básico"
                      : "Por debajo",
                ]}
              />
              <Legend />
              <Bar
                dataKey="satisfactorio"
                fill={COLORS.green}
                name="Satisfactorio"
                radius={[2, 2, 0, 0]}
              />
              <Bar dataKey="basico" fill={COLORS.amber} name="Básico" radius={[2, 2, 0, 0]} />
              <Bar
                dataKey="debajo"
                fill={COLORS.red}
                name="Por debajo"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      {/* Gráfico comparativo: Sector Público vs Privado */}
      <ChartWithTable
        title="Comparación: Escuela Pública vs Privada"
        subtitle="Porcentaje de nivel satisfactorio (quintiles populares vs ricos)"
        color="blue"
        fuente="Evaluación Aprender 2024"
        data={[
          { sector: "Estatal Q1-Q2", value: estatalQ1Q2 },
          { sector: "Privado Q4-Q5", value: privadoQ4Q5 },
        ]}
        dataKey="value"
        xAxisKey="sector"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={[
                { sector: "Estatal Q1-Q2", value: estatalQ1Q2 },
                { sector: "Privado Q4-Q5", value: privadoQ4Q5 },
              ]}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="sector" tick={{ fill: "#4D4D4D", fontSize: 12 }} />
              <YAxis
                tick={{ fill: "#4D4D4D", fontSize: 12 }}
                domain={[0, 60]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFF",
                  border: "1px solid #E0E0E0",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`${Number(value).toFixed(1)}%`, "Nivel Satisfactorio"]}
              />
              <Bar dataKey="value" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      {/* Tabla de datos */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Quintil
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                Satisfactorio
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-amber-600">
                Básico
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-red-600">
                Por debajo
              </th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-4 py-3 text-sm font-medium">{row.quintil}</td>
                <td className="px-4 py-3 text-sm text-right text-green-600">
                  {row.satisfactorio.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-sm text-right text-amber-600">
                  {row.basico.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-sm text-right text-red-600">
                  {row.debajo.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
