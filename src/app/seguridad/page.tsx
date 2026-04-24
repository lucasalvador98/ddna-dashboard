"use client";

import { Shield, AlertTriangle, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SectionHeader } from "@/components/section-header";
import { KpiCard } from "@/components/kpi-card";
import { ChartWithTable } from "@/components/charts/chart-with-table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3777FF", "#BF1363", "#F3A712", "#E07A5F", "#3599B8", "#A66999"];

interface IndicadorData {
  id: string;
  indicador_nombre: string;
  valor: number;
  unidad: string;
  periodo: string;
  region: string;
  desglose: Record<string, any> | null;
}

export default function SeguridadPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<IndicadorData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: indicadores, error } = await supabase
        .from("indicadores")
        .select("id, indicador_nombre, valor, unidad, periodo, region, desglose")
        .eq("categoria", "seguridad")
        .order("valor", { ascending: false });

      if (error) setError(error.message);
      else setData(indicadores || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Distribución por tipo de denuncia
  const getDistribucion = () => {
    return data
      .filter(d => d.indicador_nombre.toLowerCase().includes("casos"))
      .map(d => ({
        name: d.indicador_nombre.replace("Casos de ", ""),
        value: Number(d.valor) || 0,
      }))
      .sort((a, b) => b.value - a.value);
  };

  const distribucionData = getDistribucion();
  const total = distribucionData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Shield}
        title="Indicadores de Seguridad"
        description="Denuncias y casos en el sistema de justicia"
        color="blue"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Total casos"
          value={total > 0 ? total.toLocaleString("es-AR") : "—"}
          subtitle="Casos registrados en el sistema"
          icon={Shield}
          color="blue"
        />
        <KpiCard
          title="Violencia Familiar"
          value={distribucionData.find(d => d.name === "Violencia Familiar")?.value.toLocaleString("es-AR") || "—"}
          subtitle="Denuncias por violencia familiar"
          icon={AlertTriangle}
          color="magenta"
        />
        <KpiCard
          title="Niñez y Adolescencia"
          value={distribucionData.find(d => d.name === "Niñez")?.value.toLocaleString("es-AR") || "—"}
          subtitle="Casos de niños, niñas y adolescentes"
          icon={Shield}
          color="orange"
        />
      </div>

      <ChartWithTable
        title="Casos por Tipo"
        subtitle="Distribución de casos en el sistema de justicia"
        color="blue"
        fuente="Ministerio Público Córdoba"
        data={distribucionData.map(d => ({ tipo: d.name, casos: d.value }))}
        dataKey="casos"
        xAxisKey="tipo"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={distribucionData} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#4D4D4D", fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#4D4D4D", fontSize: 11 }} width={90} />
              <Tooltip contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E0E0E0", borderRadius: "8px" }} formatter={(v) => [v?.toLocaleString("es-AR") ?? 0, "Casos"]} />
              <Bar dataKey="value" fill="#3777FF" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      <ChartWithTable
        title="Distribución Porcentual"
        subtitle="Porcentaje de casos por tipo"
        color="blue"
        fuente="Ministerio Público Córdoba"
        data={distribucionData.map(d => ({ tipo: d.name, porcentaje: total > 0 ? ((d.value / total) * 100).toFixed(1) : 0 }))}
        dataKey="porcentaje"
        xAxisKey="tipo"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={distribucionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
              >
                {distribucionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [v?.toLocaleString("es-AR") ?? 0, "Casos"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      {loading && <div className="py-12 text-center text-gray-500">Cargando...</div>}
      {error && <div className="bg-red-50 p-4 rounded text-red-700">Error: {error}</div>}
    </div>
  );
}
