"use client";

import { Users, TrendingDown, TrendingUp, AlertTriangle, BarChart3, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SectionHeader } from "@/components/section-header";
import { KpiCard } from "@/components/kpi-card";
import { ChartWithTable } from "@/components/charts/chart-with-table";
import {
  LineChart,
  Line,
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
  magenta: "#BF1363",
  orange: "#FF7F11",
  blue: "#3777FF",
  green: "#10B981",
  terracotta: "#E07A5F",
};

export default function CondicionesPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de múltiples categorías que reflejan condiciones socioeconómicas
  useEffect(() => {
    async function fetchData() {
      // Cargar inversión social (refleja políticas de protección)
      const { data: inversion } = await supabase
        .from("indicadores")
        .select("id, indicador_nombre, valor, unidad, periodo, region, fuente")
        .eq("categoria", "inversion")
        .order("periodo", { ascending: false })
        .limit(100);

      // Cargar datos demográficos
      const { data: demografia } = await supabase
        .from("indicadores")
        .select("id, indicador_nombre, valor, periodo, region")
        .eq("categoria", "demografia")
        .order("periodo", { ascending: false })
        .limit(50);

      // Cargar salud (acceso a servicios de salud)
      const { data: salud } = await supabase
        .from("indicadores")
        .select("id, indicador_nombre, valor, unidad, periodo")
        .eq("categoria", "salud")
        .order("periodo", { ascending: false })
        .limit(50);

      // Todos los datos juntos
      const allData = [
        ...(inversion || []).map(d => ({ ...d, source: "inversion" })),
        ...(demografia || []).map(d => ({ ...d, source: "demografia" })),
        ...(salud || []).map(d => ({ ...d, source: "salud" })),
      ];

      setData(allData);
      setLoading(false);
    }
    fetchData();
  }, []);

  // KPIs derivados
  const inversionData = data.filter(d => d.source === "inversion");
  const demografiaData = data.filter(d => d.source === "demografia");
  const saludData = data.filter(d => d.source === "salud");

  // Total inversión social
  const totalInversion = inversionData.reduce((sum, d) => sum + (Number(d.valor) || 0), 0);

  // Población total (del dato de demografía)
  const poblacionTotal = demografiaData.reduce((sum, d) => sum + (Number(d.valor) || 0), 0);

  // Última mortalidad infantil
  const mortalidad = saludData.find(d => 
    d.indicador_nombre?.toLowerCase().includes("mortalidad")
  );

  // Inversion por año (serie temporal)
  const getInversionPorAnio = () => {
    const porAnio = new Map<number, number>();
    inversionData.forEach(d => {
      const anio = d.periodo || 2024;
      porAnio.set(anio, (porAnio.get(anio) || 0) + (Number(d.valor) || 0));
    });
    return Array.from(porAnio.entries())
      .map(([periodo, valor]) => ({ periodo, valor }))
      .sort((a, b) => a.periodo - b.periodo);
  };

  const inversionAnual = getInversionPorAnio();

  // Educación por región (datos más granulares)
  const educacionData = data.filter(d => d.source === "demografia");
  const getEducacionPorRegion = () => {
    const porRegion = new Map<string, number>();
    educacionData.forEach(d => {
      if (d.region && d.region !== "Córdoba") {
        porRegion.set(d.region, (porRegion.get(d.region) || 0) + (Number(d.valor) || 0));
      }
    });
    return Array.from(porRegion.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);
  };

  const educacionRegional = getEducacionPorRegion();

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Users}
        title="Condiciones Socioeconómicas"
        description="Indicadores de inversión social, demografía y acceso a servicios - Córdoba"
        color="magenta"
      />

      {/* Nota sobre datos */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-700">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">
            Esta página combina indicadores de inversión social, demografía y salud.
            Los datos específicos de pobreza (línea de indigencia) requieren actualizarse.
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Inversión Social Total"
          value={totalInversion > 0 ? `$${(totalInversion / 1000000).toFixed(0)}M` : "—"}
          subtitle="millones en programas sociales"
          icon={TrendingUp}
          color="green"
        />
        
        <KpiCard
          title="Población Total"
          value={poblacionTotal > 0 ? poblacionTotal.toLocaleString("es-AR") : "—"}
          subtitle="censo 2022"
          icon={Users}
          color="blue"
        />
        
        <KpiCard
          title="Mortalidad Infantil"
          value={mortalidad ? `${Number(mortalidad.valor).toFixed(1)}‰` : "—"}
          subtitle="por mil nacidos vivos"
          icon={TrendingDown}
          color="terracotta"
        />
      </div>

      {/* Gráfico: Inversión Social por Año */}
      {inversionAnual.length > 0 && (
        <ChartWithTable
          title="Inversión Social por Año"
          subtitle="Evolución del gasto en programas sociales (2024)"
          color="green"
          fuente="Ministerio de Finanzas"
          data={inversionAnual}
          dataKey="valor"
          xAxisKey="periodo"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={inversionAnual} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="periodo" tick={{ fill: "#4D4D4D", fontSize: 12 }} />
                <YAxis 
                  tick={{ fill: "#4D4D4D", fontSize: 12 }} 
                  tickFormatter={(v) => `$${v/1000000}M`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E0E0E0", borderRadius: "8px" }}
                  formatter={(value) => [`$${Number(value).toLocaleString("es-AR")}`, "Inversión"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="valor" 
                  stroke={COLORS.green} 
                  strokeWidth={2}
                  dot={{ fill: COLORS.green, r: 4 }}
                  name="Inversión"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>
      )}

      {/* Gráfico: Datos por Región */}
      {educacionRegional.length > 0 && (
        <ChartWithTable
          title="Indicadores por Departamento"
          subtitle="Principales departmentscon datos disponibles"
          color="blue"
          fuente="Censo 2022"
          data={educacionRegional}
          dataKey="value"
          xAxisKey="name"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={educacionRegional.slice(0, 10)} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#4D4D4D", fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#4D4D4D", fontSize: 10 }} width={70} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E0E0E0", borderRadius: "8px" }}
                  formatter={(value) => [Number(value).toLocaleString("es-AR"), "Valor"]}
                />
                <Bar dataKey="value" fill={COLORS.blue} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>
      )}

      {/* Fuentes de datos disponibles */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Fuentes de datos disponibles
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-gray-50 rounded p-2">
            <span className="text-gray-500">Inversión:</span>
            <p className="font-medium">Ministerio de Finanzas</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <span className="text-gray-500">Demografía:</span>
            <p className="font-medium">Censo 2022</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <span className="text-gray-500">Salud:</span>
            <p className="font-medium">DEIS</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <span className="text-gray-500">Educación:</span>
            <p className="font-medium">Ministerio Educación</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BF1363]" />
          <span className="ml-3 font-body text-gray-500">Cargando datos...</span>
        </div>
      )}

      {data.length === 0 && !loading && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">Cargando datos de condiciones socioeconómicas...</p>
        </div>
      )}
    </div>
  );
}