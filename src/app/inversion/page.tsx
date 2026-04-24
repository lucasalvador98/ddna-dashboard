"use client";

import { Coins, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SectionHeader } from "@/components/section-header";
import { KpiCard } from "@/components/kpi-card";
import { ChartWithTable } from "@/components/charts/chart-with-table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

  // Inversión por área/categoría (último año)
  const getInversionPorArea = () => {
    const porArea = new Map<string, number>();
    for (const d of data) {
      const area = d.desglose?.categoria || "Sin categoría";
      porArea.set(area, (porArea.get(area) || 0) + Number(d.valor));
    }
    return Array.from(porArea.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  };

  // Inversión por organismo (top 10)
  const getInversionPorOrganismo = () => {
    const porOrganismo = new Map<string, number>();
    for (const d of data) {
      const org = d.desglose?.organismo || "Sin organismo";
      porOrganismo.set(org, (porOrganismo.get(org) || 0) + Number(d.valor));
    }
    return Array.from(porOrganismo.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10
  };

  const inversionArea = getInversionPorArea();
  const inversionOrganismo = getInversionPorOrganismo();
  
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
          title="Inversión total 2024"
          value={`$${(total / 1000).toFixed(1)} MM`}
          subtitle="Millones de pesos en inversión social"
          icon={Coins}
          color="terracotta"
        />
        <KpiCard
          title="En Educación"
          value={`$${((inversionArea.find(d => d.name === "Educación")?.value || 0) / 1000).toFixed(1)} MM`}
          subtitle="Millones de pesos"
          icon={TrendingUp}
          color="amber"
        />
        <KpiCard
          title="En Salud"
          value={`$${((inversionArea.find(d => d.name === "Salud")?.value || 0) / 1000).toFixed(1)} MM`}
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
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={inversionArea} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#4D4D4D", fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}M`} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#4D4D4D", fontSize: 11 }} width={90} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E0E0E0", borderRadius: "8px" }} 
                formatter={(v) => [`${v?.toLocaleString("es-AR") ?? 0}`, "Inversión"]}
              />
              <Bar dataKey="value" fill={COLORS.terracotta} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      <ChartWithTable
        title="Top 10 Organismos por Inversión"
        subtitle="Principales organismos ejecutores de inversión social en infancia (2024)"
        color="terracotta"
        fuente="Ministerio de Finanzas Córdoba"
        data={inversionOrganismo.map(d => ({ organismo: d.name, inversion: d.value }))}
        dataKey="inversion"
        xAxisKey="organismo"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={inversionOrganismo} margin={{ top: 10, right: 30, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="name" tick={{ fill: "#4D4D4D", fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: "#4D4D4D", fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}M`} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E0E0E0", borderRadius: "8px" }}
                formatter={(v) => [`${v?.toLocaleString("es-AR") ?? 0}`, "Inversión"]}
              />
              <Bar dataKey="value" fill={COLORS.terracotta} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      {loading && <div className="py-12 text-center text-gray-500">Cargando...</div>}
      {error && <div className="bg-red-50 p-4 rounded text-red-700">Error: {error}</div>}
      {data.length === 0 && !loading && <div className="bg-gray-50 p-8 rounded text-center text-gray-500">Sin datos disponibles</div>}
    </div>
  );
}
