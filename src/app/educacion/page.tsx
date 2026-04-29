"use client";

import { BookOpen, GraduationCap, Users, TrendingDown, TrendingUp, BarChart3 } from "lucide-react";
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
  BarChart,
  Bar,
} from "recharts";

// Colores DDNA
const COLORS = {
  amber: "#F3A712",
  blue: "#3777FF",
  magenta: "#BF1363",
  terracotta: "#E07A5F",
  green: "#10B981",
  red: "#EF4444",
};

interface IndicadorData {
  id: string;
  indicador_nombre: string;
  valor: number;
  unidad: string;
  periodo: number;
  region: string;
  desglose: Record<string, any> | null;
}

export default function EducacionPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<IndicadorData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos
  useEffect(() => {
    async function fetchData() {
      const { data: indicadores, error } = await supabase
        .from("indicadores")
        .select("id, indicador_nombre, valor, unidad, periodo, region, desglose")
        .eq("categoria", "educacion")
        .order("periodo", { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setData(indicadores || []);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // ============== DATOS 1: Matrícula por sector (público vs privado) ==============
  const getMatriculaSector = () => {
    const publica = data.find(d => d.indicador_nombre === "Matrícula sector estatal - General");
    const privada = data.find(d => d.indicador_nombre === "Matrícula sector privado - General");
    
    return [
      { name: "Estatal", value: Number(publica?.valor) || 0, fill: COLORS.blue },
      { name: "Privado", value: Number(privada?.valor) || 0, fill: COLORS.amber },
    ];
  };

  const matriculaSector = getMatriculaSector();
  const totalMatricula = matriculaSector.reduce((sum, d) => sum + d.value, 0);

  // ============== DATOS 2: Asistencia educativa ==============
  const getAsistenciaEducativa = () => {
    const asistencia = data.filter(d => d.indicador_nombre === "Tasa de asistencia educativa");
    
    return asistencia
      .filter(d => d.desglose?.edad)
      .map(d => ({
        edad: d.desglose?.edad ?? 0,
        label: `${d.desglose?.edad} años`,
        valor: Number(d.valor) || 0,
      }))
      .sort((a, b) => a.edad - b.edad);
  };

  const asistenciaData = getAsistenciaEducativa();

  // ============== DATOS 3: Aprendiz - Lengua por quintil ==============
  const getAprenderLengua = () => {
    // Datos de aprender filtrados por indicador
    return [
      { quintil: "Q1", satisfactorio: 39.9, basico: 34.8, debajo: 23.7 },
      { quintil: "Q2", satisfactorio: 43.5, basico: 34.1, debajo: 19.8 },
      { quintil: "Q3", satisfactorio: 47.8, basico: 32.3, debajo: 16.4 },
      { quintil: "Q4", satisfactorio: 50.2, basico: 30.3, debajo: 13.5 },
      { quintil: "Q5", satisfactorio: 54.3, basico: 26.9, debajo: 9.7 },
    ];
  };

  const aprenderLengua = getAprenderLengua();

  // ============== DATOS 4: Aprendiz - Matemática por quintil ==============
  const getAprenderMatematica = () => {
    return [
      { quintil: "Q1", satisfactorio: 4.8, basico: 24.1, debajo: 71.1 },
      { quintil: "Q2", satisfactorio: 5.7, basico: 28.8, debajo: 65.5 },
      { quintil: "Q3", satisfactorio: 8.9, basico: 32.4, debajo: 58.7 },
      { quintil: "Q4", satisfactorio: 11.7, basico: 36.9, debajo: 51.4 },
      { quintil: "Q5", satisfactorio: 21.4, basico: 39.4, debajo: 39.2 },
    ];
  };

  const aprenderMatematica = getAprenderMatematica();

  // KPIs
  const tasaPromedio = asistenciaData.length > 0 
    ? asistenciaData.reduce((sum, d) => sum + d.valor, 0) / asistenciaData.length
    : 0;

  const tasaPrimaria = asistenciaData.filter(d => d.edad >= 6 && d.edad <= 12)
    .reduce((sum, d) => sum + d.valor, 0) / 
    (asistenciaData.filter(d => d.edad >= 6 && d.edad <= 12).length || 1);

  const tasaSecundaria = asistenciaData.filter(d => d.edad >= 13 && d.edad <= 17)
    .reduce((sum, d) => sum + d.valor, 0) / 
    (asistenciaData.filter(d => d.edad >= 13 && d.edad <= 17).length || 1);

  // Porcentaje sector público
  const pctPublico = totalMatricula > 0 
    ? (((matriculaSector.find(d => d.name === "Estatal")?.value || 0) / totalMatricula) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={BookOpen}
        title="Indicadores de Educación"
        description="Seguimiento de matriculación, asistencia y resultados educativos en Córdoba"
        color="amber"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Matrícula Total"
          value={totalMatricula > 0 ? totalMatricula.toLocaleString("es-AR") : "—"}
          subtitle="Alumnos en el sistema educativo"
          icon={Users}
          color="amber"
        />
        
        <KpiCard
          title="Sector Público"
          value={pctPublico > 0 ? `${pctPublico.toFixed(1)}%` : "—"}
          subtitle="Del total de matrícula"
          icon={BookOpen}
          color="blue"
        />
        
        <KpiCard
          title="Escolarización Secundaria"
          value={tasaSecundaria > 0 ? `${tasaSecundaria.toFixed(1)}%` : "—"}
          subtitle="Jóvenes de 13-17 años"
          icon={GraduationCap}
          color="magenta"
        />
      </div>

      {/* Gráfico 1: Matrícula por Sector */}
      <ChartWithTable
        title="Matrícula por Sector"
        subtitle="Distribución entre escuela pública y privada (Córdoba, 2024)"
        color="amber"
        fuente="Ministerio de Educación - Anuario 2024"
        data={matriculaSector}
        dataKey="value"
        xAxisKey="name"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={matriculaSector} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="name" tick={{ fill: "#4D4D4D", fontSize: 12 }} />
              <YAxis tick={{ fill: "#4D4D4D", fontSize: 12 }} tickFormatter={(v) => v.toLocaleString()} />
              <Tooltip
                contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E0E0E0", borderRadius: "8px" }}
                formatter={(value) => [Number(value).toLocaleString("es-AR"), "Alumnos"]}
              />
              <Bar dataKey="value" name="Matrícula" radius={[4, 4, 0, 0]}>
                {matriculaSector.map((entry, index) => (
                  <Bar key={`bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      {/* Gráfico 2: Asistencia por Edad */}
      {asistenciaData.length > 0 && (
        <ChartWithTable
          title="Tasa de Asistencia Educativa por Edad"
          subtitle="Porcentaje de población que asiste a establecimientos (Córdoba, 2022)"
          color="amber"
          fuente="Censo Nacional 2022"
          data={asistenciaData}
          dataKey="valor"
          xAxisKey="label"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={asistenciaData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="label" tick={{ fill: "#4D4D4D", fontSize: 10 }} interval={2} />
                <YAxis tick={{ fill: "#4D4D4D", fontSize: 12 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E0E0E0", borderRadius: "8px" }}
                  formatter={(value) => [`${value}%`, "Tasa de Asistencia"]}
                />
                <Bar dataKey="valor" fill={COLORS.amber} name="Asistencia" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>
      )}

      {/* Gráfico 3: Aprender Lengua por Quintil */}
      <ChartWithTable
        title="Resultados Aprender - Lengua por Quintil"
        subtitle="Porcentaje de estudiantes por nivel de logro (Córdoba, 2024)"
        color="green"
        fuente="Evaluación Aprender 2024"
        data={aprenderLengua}
        dataKey="satisfactorio"
        xAxisKey="quintil"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={aprenderLengua} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="quintil" tick={{ fill: "#4D4D4D", fontSize: 12 }} />
              <YAxis tick={{ fill: "#4D4D4D", fontSize: 12 }} domain={[0, 60]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E0E0E0", borderRadius: "8px" }}
                formatter={(value, name) => [`${value}%`, name === "satisfactorio" ? "Satisfactorio" : name]}
              />
              <Legend />
              <Bar dataKey="satisfactorio" fill={COLORS.green} name="Satisfactorio" radius={[2, 2, 0, 0]} />
              <Bar dataKey="basico" fill={COLORS.amber} name="Básico" radius={[2, 2, 0, 0]} />
              <Bar dataKey="debajo" fill={COLORS.red} name="Por debajo" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      {/* Gráfico 4: Aprender Matemática por Quintil - CRÍTICO */}
      <ChartWithTable
        title="Resultados Aprender - Matemática por Quintil"
        subtitle="Porcentaje de estudiantes por nivel de logro (Córdoba, 2024) - ALERTA"
        color="magenta"
        fuente="Evaluación Aprender 2024"
        data={aprenderMatematica}
        dataKey="satisfactorio"
        xAxisKey="quintil"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={aprenderMatematica} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="quintil" tick={{ fill: "#4D4D4D", fontSize: 12 }} />
              <YAxis tick={{ fill: "#4D4D4D", fontSize: 12 }} domain={[0, 80]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E0E0E0", borderRadius: "8px" }}
                formatter={(value, name) => [`${value}%`, name === "satisfactorio" ? "Satisfactorio" : name]}
              />
              <Legend />
              <Bar dataKey="satisfactorio" fill={COLORS.green} name="Satisfactorio" radius={[2, 2, 0, 0]} />
              <Bar dataKey="basico" fill={COLORS.amber} name="Básico" radius={[2, 2, 0, 0]} />
              <Bar dataKey="debajo" fill={COLORS.red} name="Por debajo" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartWithTable>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F3A712]" />
          <span className="ml-3 font-body text-gray-500">Cargando datos...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error al cargar datos: {error}
        </div>
      )}

      {data.length === 0 && !loading && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">No hay datos de educación disponibles</p>
        </div>
      )}
    </div>
  );
}