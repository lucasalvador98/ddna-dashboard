"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, TrendingDown, Baby, Home, PersonStanding } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { ChartCard } from "@/components/charts/chart-card";
import { supabase } from "@/lib/supabase";

type PovertyRecord = {
  indicador_nombre: string;
  valor: number;
  periodo: number;
  desglose: Record<string, unknown>;
};

export default function PobrezaPage() {
  const [data, setData] = useState<PovertyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: povertyData } = await supabase
        .from("indicadores")
        .select("indicador_nombre, valor, periodo, desglose")
        .eq("categoria", "pobreza")
        .order("periodo", { ascending: true });

      if (povertyData) {
        setData(povertyData as PovertyRecord[]);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Process data for charts
  const pobrezaHogares = data
    .filter((r) => r.indicador_nombre === "Pobreza hogares")
    .map((r) => ({ periodo: r.periodo, valor: r.valor, desglose: r.desglose }));

  const pobrezaPersonas = data
    .filter((r) => r.indicador_nombre === "Pobreza personas")
    .map((r) => ({ periodo: r.periodo, valor: r.valor, desglose: r.desglose }));

  const indigenciaHogares = data
    .filter((r) => r.indicador_nombre === "Indigencia hogares")
    .map((r) => ({ periodo: r.periodo, valor: r.valor, desglose: r.desglose }));

  const indigenciaPersonas = data
    .filter((r) => r.indicador_nombre === "Indigencia personas")
    .map((r) => ({ periodo: r.periodo, valor: r.valor, desglose: r.desglose }));

  // Latest data (semestre 2 of 2024)
  const latestPobrezaHogar = pobrezaHogares.find(
    (r) => r.periodo === 2024 && r.desglose?.semestre === 2
  );
  const latestPobrezaPersona = pobrezaPersonas.find(
    (r) => r.periodo === 2024 && r.desglose?.semestre === 2
  );
  const latestIndigenciaHogar = indigenciaHogares.find(
    (r) => r.periodo === 2024 && r.desglose?.semestre === 2
  );
  const latestIndigenciaPersona = indigenciaPersonas.find(
    (r) => r.periodo === 2024 && r.desglose?.semestre === 2
  );

  // Previous semester for comparison
  const prevPobrezaHogar = pobrezaHogares.find(
    (r) => r.periodo === 2023 && r.desglose?.semestre === 2
  );
  const prevPobrezaPersona = pobrezaPersonas.find(
    (r) => r.periodo === 2023 && r.desglose?.semestre === 2
  );

  const formatPercent = (val?: number) => (val ? `${val.toFixed(1)}%` : "N/D");
  const calcChange = (current?: number, prev?: number) => {
    if (!current || !prev) return null;
    const diff = current - prev;
    return { value: diff.toFixed(1), positive: diff > 0 };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          icon={Users}
          title="Pobreza e Indigencia"
          description="Indicadores de condiciones socioeconómicas - Córdoba (EPH-INDEC)"
          color="magenta"
        />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BF1363]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Users}
        title="Pobreza e Indigencia"
        description="Indicadores de condiciones socioeconómicas - Córdoba (EPH-INDEC)"
        color="magenta"
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Home className="w-4 h-4" />
            Pobreza Hogares
          </div>
          <p className="text-3xl font-bold text-[#BF1363]">
            {formatPercent(latestPobrezaHogar?.valor)}
          </p>
          {prevPobrezaHogar && latestPobrezaHogar && (
            <div
              className={`flex items-center gap-1 text-sm mt-1 ${
                latestPobrezaHogar.valor > prevPobrezaHogar.valor
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {latestPobrezaHogar.valor > prevPobrezaHogar.valor ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {calcChange(latestPobrezaHogar.valor, prevPobrezaHogar.valor)?.value}
              % vs 2023
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <PersonStanding className="w-4 h-4" />
            Pobreza Personas
          </div>
          <p className="text-3xl font-bold text-[#BF1363]">
            {formatPercent(latestPobrezaPersona?.valor)}
          </p>
          {prevPobrezaPersona && latestPobrezaPersona && (
            <div
              className={`flex items-center gap-1 text-sm mt-1 ${
                latestPobrezaPersona.valor > prevPobrezaPersona.valor
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {latestPobrezaPersona.valor > prevPobrezaPersona.valor ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {calcChange(latestPobrezaPersona.valor, prevPobrezaPersona.valor)?.value}
              % vs 2023
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Home className="w-4 h-4" />
            Indigencia Hogares
          </div>
          <p className="text-3xl font-bold text-[#E07A5F]">
            {formatPercent(latestIndigenciaHogar?.valor)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <PersonStanding className="w-4 h-4" />
            Indigencia Personas
          </div>
          <p className="text-3xl font-bold text-[#E07A5F]">
            {formatPercent(latestIndigenciaPersona?.valor)}
          </p>
        </div>
      </div>

        {/* Evolución de Pobreza */}
        <ChartCard
        title="Evolución de la Pobreza - Córdoba"
        subtitle="Porcentaje de hogares y personas bajo la línea de pobreza"
        color="magenta"
        fuente="EPH-INDEC / Dirección de Estadísticas"
      >
        <div className="space-y-6">
          <div className="h-64">
            {/* Simple bar chart using HTML/CSS */}
            <div className="flex items-end justify-around h-full gap-2">
              {pobrezaHogares.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-[#BF1363] rounded-t hover:bg-[#d6387a] transition-colors"
                    style={{
                      height: `${(item.valor / 60) * 100}%`,
                      minHeight: item.valor > 0 ? "4px" : "0",
                    }}
                    title={`${item.periodo}: ${item.valor}%`}
                  />
                  <span className="text-xs text-gray-500 mt-2">{item.periodo}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center">
            2° semestre de cada año. Fuente: EPH-INDEC
          </p>
        </div>
      </ChartCard>

      {/* Pobreza Infantil */}
      <ChartCard
        title="Pobreza Infantil por Grupo Etario"
        subtitle="Niños/as de 0-17 años en situación de pobreza"
        color="amber"
        fuente="EPH-INDEC / Dirección de Estadísticas"
      >
        <div className="grid grid-cols-3 gap-4">
          {["0-5", "6-11", "12-17"].map((grupo) => {
            const infantileData = data.filter(
              (r) =>
                r.indicador_nombre === "Pobreza infantil" &&
                r.desglose?.grupo_edad === grupo &&
                r.desglose?.semestre === 2
            );
            const latest = infantileData.find((r) => r.periodo === 2024);
            return (
              <div
                key={grupo}
                className="bg-gray-50 rounded-lg p-4 text-center"
              >
                <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
                  <Baby className="w-4 h-4" />
                  <span className="text-sm">{grupo} años</span>
                </div>
                <p className="text-2xl font-bold text-[#F3A712]">
                  {latest ? `${latest.valor.toFixed(1)}%` : "N/D"}
                </p>
                <p className="text-xs text-gray-400 mt-1">2024 - 2° sem</p>
              </div>
            );
          })}
        </div>
      </ChartCard>

      {/* Tabla de evolución */}
      <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
        <div className="p-4 border-b border-[#E0E0E0]">
          <h3 className="font-display text-lg text-[#00074E]">
            Serie Histórica Completa
          </h3>
          <p className="text-sm text-gray-500">
            Evolución de pobreza e indigencia (2016-2024)
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Año</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Pob. Hogares
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Pob. Personas
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Ind. Hogares
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Ind. Personas
                </th>
              </tr>
            </thead>
            <tbody>
              {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016]
                .reverse()
                .map((year) => {
                  const ph = pobrezaHogares.find(
                    (r) => r.periodo === year && r.desglose?.semestre === 2
                  );
                  const pp = pobrezaPersonas.find(
                    (r) => r.periodo === year && r.desglose?.semestre === 2
                  );
                  const ih = indigenciaHogares.find(
                    (r) => r.periodo === year && r.desglose?.semestre === 2
                  );
                  const ip = indigenciaPersonas.find(
                    (r) => r.periodo === year && r.desglose?.semestre === 2
                  );
                  return (
                    <tr key={year} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-medium">{year}</td>
                      <td className="px-4 py-3 text-right">
                        {ph ? `${ph.valor.toFixed(1)}%` : "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {pp ? `${pp.valor.toFixed(1)}%` : "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {ih ? `${ih.valor.toFixed(1)}%` : "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {ip ? `${ip.valor.toFixed(1)}%` : "-"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
</div>
  );
}