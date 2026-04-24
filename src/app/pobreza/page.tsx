"use client";

import { Users, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SectionHeader } from "@/components/section-header";
import { KpiCard } from "@/components/kpi-card";
import { ChartWithTable } from "@/components/charts/chart-with-table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = {
  magenta: "#BF1363",
  orange: "#FF7F11",
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

export default function PobrezaPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<IndicadorData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: indicadores, error } = await supabase
        .from("indicadores")
        .select("id, indicador_nombre, valor, unidad, periodo, region, desglose")
        .eq("categoria", "pobreza")
        .order("periodo", { ascending: true });

      if (error) setError(error.message);
      else setData(indicadores || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Time series Pobreza vs Indigencia (usando tipo "Personas" como métrica principal)
  const getPobrezaSeries = () => {
    // Filtrar por tipo "Personas" para evitar duplicados de Hogares vs Personas
    const pobreza = data.filter(d => 
        d.indicador_nombre.toLowerCase().includes("pobreza") && 
        !d.indicador_nombre.toLowerCase().includes("indigencia") &&
        d.desglose?.tipo === "Pobreza Personas"
      )
      .map(d => ({ periodo: d.periodo, valor: Number(d.valor) || 0 }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo));
    
    const indigencia = data.filter(d => 
        d.indicador_nombre.toLowerCase().includes("indigencia") &&
        d.desglose?.tipo === "Indigencia Personas"
      )
      .map(d => ({ periodo: d.periodo, valor: Number(d.valor) || 0 }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo));
    
    // Combinar por periodo
    const combinada = [...new Set([...pobreza.map(p => p.periodo), ...indigencia.map(i => i.periodo)])]
      .map(periodo => ({
        periodo,
        pobreza: pobreza.find(p => p.periodo === periodo)?.valor || 0,
        indigencia: indigencia.find(i => i.periodo === periodo)?.valor || 0,
      }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo));
    
    return combinada;
  };

  const pobrezaData = getPobrezaSeries();
  
  const latest = pobrezaData.length > 0 ? pobrezaData[pobrezaData.length - 1] : null;
  const cambio = pobrezaData.length >= 2 && latest
    ? (latest.pobreza - pobrezaData[pobrezaData.length - 2].pobreza).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Users}
        title="Indicadores de Pobreza"
        description="Evolución de pobreza e indigencia infantil en Córdoba"
        color="magenta"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Pobreza infantil"
          value={latest ? `${latest.pobreza}%` : "—"}
          subtitle={`Porcentaje NNA bajo línea de pobreza - ${latest?.periodo || ""}`}
          change={cambio ? `${cambio}%` : undefined}
          changeType={Number(cambio) < 0 ? "down" : Number(cambio) > 0 ? "up" : "neutral"}
          icon={TrendingDown}
          color="magenta"
        />
        
        <KpiCard
          title="Indigencia infantil"
          value={latest ? `${latest.indigencia}%` : "—"}
          subtitle={`Porcentaje NNA bajo línea de indigencia`}
          icon={TrendingUp}
          color="orange"
        />
        
        <KpiCard
          title="Brecha de pobreza"
          value={latest ? `${(latest.pobreza - latest.indigencia).toFixed(1)}%` : "—"}
          subtitle="Diferencia entre pobreza e indigencia"
          icon={Users}
          color="magenta"
        />
      </div>

      <ChartWithTable
        title="Pobreza e Indigencia Infantil"
        subtitle="Evolución histórica (porcentaje de hogares con niños/as)"
        color="magenta"
        fuente="INDEC / ENCOPRAC"
        data={pobrezaData}
        dataKey="valor"
        xAxisKey="periodo"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={pobrezaData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="periodo" tick={{ fill: "#4D4D4D", fontSize: 12 }} />
              <YAxis tick={{ fill: "#4D4D4D", fontSize: 12 }} domain={[0, 60]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E0E0E0", borderRadius: "8px" }} formatter={(v) => [`${v ?? 0}%`, ""]} />
              <Legend />
              <Line type="monotone" dataKey="pobreza" stroke={COLORS.magenta} strokeWidth={2} dot={{ fill: COLORS.magenta, r: 4 }} name="Pobreza" />
              <Line type="monotone" dataKey="indigencia" stroke={COLORS.orange} strokeWidth={2} dot={{ fill: COLORS.orange, r: 4 }} name="Indigencia" />
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