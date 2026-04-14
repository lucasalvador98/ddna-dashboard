"use client";

import { Users, Heart, BookOpen, Coins, UserCircle, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { KpiCard } from "@/components/kpi-card";
import { useIndicadores } from "@/lib/hooks";
import { kpisPlaceholder } from "@/lib/data";
import type { CategoriaIndicador } from "@/lib/supabase";

const categoryConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: "amber" | "magenta" | "blue" | "terracotta" | "navy" | "orange" }> = {
  pobreza: { icon: Users, color: "magenta" },
  salud: { icon: Heart, color: "blue" },
  educacion: { icon: BookOpen, color: "amber" },
  inversion: { icon: Coins, color: "terracotta" },
  demografia: { icon: UserCircle, color: "navy" },
  seguridad: { icon: AlertTriangle, color: "orange" },
};

function formatValue(valor: string, unidad: string): string {
  if (unidad === "‰") return `${valor}‰`;
  if (unidad === "%") return `${valor}%`;
  if (unidad === "Md") return `$${valor} Md`;
  if (unidad === "hab" || unidad === "casos") return Number(valor).toLocaleString("es-AR");
  return valor;
}

export default function HomePage() {
  const { data, loading, source } = useIndicadores();

  // Use real data if available, otherwise fallback to placeholders
  const displayData = data.length > 0 ? data : kpisPlaceholder;

  // Extract latest KPI per category
  const pobreza = displayData.find((d) => d.categoria === "pobreza") || kpisPlaceholder.find((p) => p.categoria === "pobreza");
  const salud = displayData.find((d) => d.categoria === "salud") || kpisPlaceholder.find((p) => p.categoria === "salud");
  const educacion = displayData.find((d) => d.categoria === "educacion") || kpisPlaceholder.find((p) => p.categoria === "educacion");
  const inversion = displayData.find((d) => d.categoria === "inversion") || kpisPlaceholder.find((p) => p.categoria === "inversion");
  const demografia = displayData.find((d) => d.categoria === "demografia") || kpisPlaceholder.find((p) => p.categoria === "demografia");
  const seguridad = displayData.find((d) => d.categoria === "seguridad") || kpisPlaceholder.find((p) => p.categoria === "seguridad");

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#00074E] via-[#00074E] to-[#3777FF] p-8 text-white">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)"/>
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <Image
              src="/logos/Cba.png"
              alt="Gobierno de Córdoba"
              width={48}
              height={48}
              className="rounded-lg"
            />
            <Image
              src="/logos/LOGO DDNA_HORIZONTAL_COLOR.png"
              alt="DDNA"
              width={200}
              height={48}
              className="object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
          
          <h1 className="font-display text-3xl lg:text-4xl text-white tracking-tight mb-3">
            Tablero General de Monitoreo
          </h1>
          <p className="font-body text-lg text-[#A7DBF9] max-w-2xl">
            Defensoría de los Derechos de Niñas, Niños y Adolescentes — Provincia de Córdoba
          </p>
          
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 font-body text-sm text-[#A7DBF9]">
              {source === "supabase" ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                  Datos en tiempo real
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#F3A712]" />
                  Datos de referencia
                </>
              )}
            </div>
            <div className="font-body text-sm text-[#A7DBF9]">
              Fuente: {source === "supabase" ? "Base de datos DDNA" : "Valores referenciales"}
            </div>
          </div>
        </div>
      </section>

      {/* KPI Grid */}
      <section>
        <h2 className="font-display text-xl text-[#00074E] mb-4 tracking-tight">
          Indicadores Clave
        </h2>
        {loading && source === "supabase" ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E9AD8]" />
            <span className="ml-3 font-body text-[#4D4D4D]">Cargando indicadores...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {pobreza && (
              <KpiCard
                title={pobreza.nombre}
                value={formatValue(pobreza.valor, pobreza.unidad || "%")}
                subtitle={pobreza.subtitulo}
                change={pobreza.cambio}
                changeType={pobreza.cambioTipo}
                icon={categoryConfig.pobreza.icon}
                color={categoryConfig.pobreza.color}
              />
            )}
            
            {salud && (
              <KpiCard
                title="Mortalidad infantil"
                value={formatValue(salud.valor, "‰")}
                subtitle="Tasa por cada mil nacidos vivos (Córdoba)"
                change={salud.cambio}
                changeType={salud.cambioTipo}
                icon={categoryConfig.salud.icon}
                color={categoryConfig.salud.color}
              />
            )}
            
            {educacion && (
              <KpiCard
                title="Escolarización"
                value={formatValue(educacion.valor, "%")}
                subtitle="Tasa neta de escolarización"
                change={educacion.cambio}
                changeType={educacion.cambioTipo}
                icon={categoryConfig.educacion.icon}
                color={categoryConfig.educacion.color}
              />
            )}
            
            {inversion && (
              <KpiCard
                title="Inversión social"
                value="$58.700 Md"
                subtitle="Destinado a infancia y adolescencia"
                change="+14,4%"
                changeType="up"
                icon={categoryConfig.inversion.icon}
                color={categoryConfig.inversion.color}
              />
            )}
            
            {demografia && (
              <KpiCard
                title="Adolescentes"
                value={formatValue(demografia.valor, "hab")}
                subtitle="Población de 12-17 años"
                change={demografia.cambio}
                changeType={demografia.cambioTipo}
                icon={categoryConfig.demografia.icon}
                color={categoryConfig.demografia.color}
              />
            )}
            
            {seguridad && (
              <KpiCard
                title="Denuncias"
                value={formatValue(seguridad.valor, "casos")}
                subtitle="Registradas en el último período"
                change="+537"
                changeType="up"
                icon={categoryConfig.seguridad.icon}
                color={categoryConfig.seguridad.color}
              />
            )}
          </div>
        )}
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#E0E0E0] p-4 text-center">
          <p className="font-display text-3xl text-[#00074E]">3.892.456</p>
          <p className="font-accent text-xs text-[#4D4D4D] mt-2 tracking-wide">Población total 0-17</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E0E0E0] p-4 text-center">
          <p className="font-display text-3xl text-[#3777FF]">847</p>
          <p className="font-accent text-xs text-[#4D4D4D] mt-2 tracking-wide">Centros de salud</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E0E0E0] p-4 text-center">
          <p className="font-display text-3xl text-[#F3A712]">2.341</p>
          <p className="font-accent text-xs text-[#4D4D4D] mt-2 tracking-wide">Establecimientos educativos</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E0E0E0] p-4 text-center">
          <p className="font-display text-3xl text-[#BF1363]">95,1%</p>
          <p className="font-accent text-xs text-[#4D4D4D] mt-2 tracking-wide">Cobertura vacunal</p>
        </div>
      </section>
    </div>
  );
}
