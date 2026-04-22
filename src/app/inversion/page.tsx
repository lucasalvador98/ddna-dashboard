"use client";

import { Coins, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SectionHeader } from "@/components/section-header";
import { KpiCard } from "@/components/kpi-card";
import { ChartWithTable } from "@/components/charts/chart-with-table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

const COLORS = {
  terracotta: "#E07A5F",
  amber: "#F3A712",
  blue: "#3777FF",
  magenta: "#BF1363",
};

interface IndicadorData {
  id: string;
  indicador_nombre: string;
  valor: number;
  unidad: string;
  periodo: string;
  region: string;
  desglose: Record<string, any> | null;
}

export default function InversionPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<IndicadorData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: indicadores, error } = await supabase
        .from("indicadores")
        .select("id, indicador_nombre, valor, unidad, periodo, region, desglose")
        .eq("categoria", "inversion")
        .order("periodo", { ascending: true });

      if (error) setError(error.message);
      else setData(indicadores || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Inversión por área (último año)
  const getInversionPorArea = () => {
    const porArea = new Map<string, number>();
    for (const d of data) {
      const area = d.desglose?.area || "General";
      porArea.set(area, (porArea.get(area) || 0) + Number(d.valor));
    }
    return Array.from(porArea.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  };

  // Evolución histórica
  const getEvolucion = () => {
    const porPeriodo = new Map<string, number>();
    for (const d of data) {
      const periodo = d.periodo;
      porPeriodo.set(periodo, (porPeriodo.get(periodo) || 0) + Number(d.valor));
    }
    return Array.from(porPeriodo.entries())
      .map(([periodo, valor]) => ({ periodo, valor: Math.round(valor) }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo));
  };

  const inversionArea = getInversionPorArea();
  const evolucion = getEvolucion();
  
  const latest = evolucion.length > 0 ? evolucion[evolucion.length - 1] : null;
  const total = inversionArea.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Coins}
        title="Indicadores de Inversión"
        description="Inversión social en infancia y adolescencia en Córdoba"
        color="terracotta"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Inversión total"
          value={latest ? `$${(latest.valor / 1000).toFixed(1)} MM` : "—"}
          subtitle={`Millones de pesos - ${latest?.periodo || ""}`}
          icon={Coins}
          color="terracotta"
        />
        <KpiCard
          title="Inversión en Educación"
          value={`$${((inversionArea.find(d => d.name === "Educación")?.value || 0 / 1000).toFixed(1)} MM`}
          subtitle="Millones de pesos"
          icon={TrendingUp}
          color="amber"
        />
        <KpiCard
          title="Inversión en Salud"
          value={`$${((inversionArea.find(d => d.name === "Salud")?.value || 0 / 1000).toFixed(1)} MM`}
          subtitle="Millones de pesos"
          icon={Coins}
          color="blue"
        />
      </div>

      <ChartWithTable
        title="Inversión por Área"
        subtitle="Distribución de inversión social por área (último período)"
        color="terracotta"
        fuente="Ministerio de Finanzas Córdoba"
        data={inversionArea.map(d => ({ area: d.name, inversion: d.value }))}
        dataKey="inversion"
        xAxisKey="area"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={inversionArea} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#4D4D4D", fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}M`} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#4D4D4D", fontSize: 11 }} width={90} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E0E0E0", borderRadius: "8px" }} 
                formatter={(v: number) => [`$${v.toLocaleString("es-AR")}`, "Inversión"]}
              />
              <Bar dataKey="value" fill={COLORS.terracotta} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      <ChartWithTable
        title="Evolución de la Inversión"
        subtitle="Inversión social total a lo largo de los años"
        color="terracotta"
        fuente="Ministerio de Finanzas Córdoba"
        data={evolucion}
        dataKey="valor"
        xAxisKey="periodo"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolucion} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="periodo" tick={{ fill: "#4D4D4D", fontSize: 12 }} />
              <YAxis tick={{ fill: "#4D4D4D", fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}M`} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E0E0E0", borderRadius: "8px" }}
                formatter={(v: number) => [`$${v.toLocaleString("es-AR")}`, "Inversión"]}
              />
              <Line type="monotone" dataKey="valor" stroke={COLORS.terracotta} strokeWidth={2} dot={{ fill: COLORS.terracotta, r: 4 }} name="Inversión Total" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      {loading && <div className="py-12 text-center text-gray-500">Cargando...</div>}
      {error && <div className="bg-red-50 p-4 rounded text-red-700">Error: {error}</div>}
      {data.length === 0 && !loading && <div className="bg-gray-50 p-8 rounded text-center text-gray-500">Sin datos disponibles</div>}
    </div>
  );
}
