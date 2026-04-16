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
  const { data, loading, source, metadata } = useIndicadores();
  
  // Get the latest value for each category from real data
  const getLatestByCategory = (cat: string) => {
    const categoryData = data.filter(d => d.categoria === cat);
    if (categoryData.length === 0) return null;
    // Return the first one (most recent since we order by periodo desc)
    return categoryData[0];
  };
  
  const pobreza = getLatestByCategory("pobreza");
  const salud = getLatestByCategory("salud");
  const educacion = getLatestByCategory("educacion");
  const inversion = getLatestByCategory("inversion");
  const demografia = getLatestByCategory("demografia");
  const seguridad = getLatestByCategory("seguridad");

  return (
    <div className="space-y-10">
      {/* Header Banner - Colorful DDNA Style */}
      <section className="relative">
        {/* Gradient background - orange to amber */}
        <div className="bg-gradient-to-r from-[#FF7F11] via-[#F3A712] to-[#FF7F11] py-6 px-6 lg:px-8">
          
          {/* Rounded title container */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 inline-block">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Logos */}
              <div className="flex items-center gap-4">
                <Image
                  src="/logos/Cba.png"
                  alt="Gobierno de Córdoba"
                  width={56}
                  height={56}
                  className="rounded-xl shadow-md"
                />
                <Image
                  src="/logos/LOGO DDNA_HORIZONTAL_COLOR.png"
                  alt="DDNA"
                  width={200}
                  height={56}
                  className="object-contain"
                />
              </div>
              
              {/* Title */}
              <div className="lg:ml-8">
                <h1 className="font-display text-2xl lg:text-3xl text-[#00074E] tracking-tight">
                  Tablero de Monitoreo
                </h1>
                <p className="font-body text-sm text-[#4D4D4D] mt-1">
                  Defensoría de los Derechos de Niñas, Niños y Adolescentes
                </p>
              </div>
              
              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#4D4D4D]">
                <div className="flex items-center gap-2">
                  <span className="bg-[#F3A712]/20 text-[#00074E] px-3 py-1 rounded-full font-accent text-xs">
                    {metadata?.fuente === "api" ? "API" : metadata?.fuente === "manual" ? "Manual" : (source === "supabase" ? "En vivo" : "Referencia")}
                  </span>
                </div>
                {metadata?.ultimaActualizacion && (
                  <span className="text-xs">
                    Actualizado: {new Date(metadata.ultimaActualizacion).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Grid - Colorful DDNA Style */}
      <section className="px-6 lg:px-8 py-6">
        <h2 className="font-display text-xl text-[#00074E] mb-6 tracking-tight">
          Acceso Rápido
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8 justify-items-center">
          {/* Inicio */}
          <a 
            href="/"
            className="group flex flex-col items-center gap-3 no-underline"
          >
            <div 
              className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-gradient-to-br from-[#F3A712] to-[#FF7F11] flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
              style={{ boxShadow: "0 4px 15px rgba(243, 167, 18, 0.4)" }}
            >
              <Image
                src="/logos/Recurso 1@2x.png"
                alt="Inicio"
                width={64}
                height={64}
                className="w-14 h-14 lg:w-16 lg:h-16 object-contain brightness-0 invert"
              />
            </div>
            <span className="font-accent text-sm text-[#4D4D4D] text-center tracking-wide group-hover:text-[#FF7F11] transition-colors font-medium">
              Inicio
            </span>
          </a>

          {/* Salud */}
          <a 
            href="/?categoria=salud"
            className="group flex flex-col items-center gap-3 no-underline"
          >
            <div 
              className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-gradient-to-br from-[#E07A5F] to-[#c45a3f] flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
              style={{ boxShadow: "0 4px 15px rgba(224, 122, 95, 0.4)" }}
            >
              <Image
                src="/logos/cat-salud.png"
                alt="Salud"
                width={64}
                height={64}
                className="w-14 h-14 lg:w-16 lg:h-16 object-contain brightness-0 invert"
              />
            </div>
            <span className="font-accent text-sm text-[#4D4D4D] text-center tracking-wide group-hover:text-[#E07A5F] transition-colors font-medium">
              Salud
            </span>
          </a>

          {/* Educación */}
          <a 
            href="/?categoria=educacion"
            className="group flex flex-col items-center gap-3 no-underline"
          >
            <div 
              className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-gradient-to-br from-[#F3A712] to-[#d4920f] flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
              style={{ boxShadow: "0 4px 15px rgba(243, 167, 18, 0.4)" }}
            >
              <Image
                src="/logos/cat-educacion.png"
                alt="Educación"
                width={64}
                height={64}
                className="w-14 h-14 lg:w-16 lg:h-16 object-contain brightness-0 invert"
              />
            </div>
            <span className="font-accent text-sm text-[#4D4D4D] text-center tracking-wide group-hover:text-[#F3A712] transition-colors font-medium">
              Educación
            </span>
          </a>

          {/* Pobreza */}
          <a 
            href="/?categoria=pobreza"
            className="group flex flex-col items-center gap-3 no-underline"
          >
            <div 
              className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-gradient-to-br from-[#BF1363] to-[#9a0f4f] flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
              style={{ boxShadow: "0 4px 15px rgba(191, 19, 99, 0.4)" }}
            >
              <Image
                src="/logos/cat-pobreza.png"
                alt="Pobreza"
                width={64}
                height={64}
                className="w-14 h-14 lg:w-16 lg:h-16 object-contain brightness-0 invert"
              />
            </div>
            <span className="font-accent text-sm text-[#4D4D4D] text-center tracking-wide group-hover:text-[#BF1363] transition-colors font-medium">
              Pobreza
            </span>
          </a>

          {/* Seguridad */}
          <a 
            href="/?categoria=seguridad"
            className="group flex flex-col items-center gap-3 no-underline"
          >
            <div 
              className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-gradient-to-br from-[#3777FF] to-[#2959cc] flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
              style={{ boxShadow: "0 4px 15px rgba(55, 119, 255, 0.4)" }}
            >
              <Image
                src="/logos/cat-justicia.png"
                alt="Seguridad"
                width={64}
                height={64}
                className="w-14 h-14 lg:w-16 lg:h-16 object-contain brightness-0 invert"
              />
            </div>
            <span className="font-accent text-sm text-[#4D4D4D] text-center tracking-wide group-hover:text-[#3777FF] transition-colors font-medium">
              Seguridad
            </span>
          </a>

          {/* Inversión Social */}
          <a 
            href="/?categoria=inversion"
            className="group flex flex-col items-center gap-3 no-underline"
          >
            <div 
              className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-gradient-to-br from-[#FF7F11] to-[#cc6608] flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
              style={{ boxShadow: "0 4px 15px rgba(255, 127, 17, 0.4)" }}
            >
              <Image
                src="/logos/cat-censo.png"
                alt="Inversión Social"
                width={64}
                height={64}
                className="w-14 h-14 lg:w-16 lg:h-16 object-contain brightness-0 invert"
              />
            </div>
            <span className="font-accent text-sm text-[#4D4D4D] text-center tracking-wide group-hover:text-[#FF7F11] transition-colors font-medium">
              Inversión
            </span>
          </a>
        </div>
      </section>

      {/* KPI Grid */}
      <section className="px-6 lg:px-8">
        <h2 className="font-display text-xl text-[#00074E] mb-4 tracking-tight">
          Indicadores Clave
        </h2>
        {loading && source === "supabase" ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E9AD8]" />
            <span className="ml-3 font-body text-[#4D4D4D]">Cargando indicadores...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Pobreza */}
            {pobreza ? (
              <KpiCard
                title={pobreza.nombre}
                value={formatValue(pobreza.valor, pobreza.unidad || "%")}
                subtitle={pobreza.subtitulo || "Porcentaje de NNA bajo línea de pobreza"}
                change={pobreza.cambio}
                changeType={pobreza.cambioTipo}
                icon={categoryConfig.pobreza.icon}
                color={categoryConfig.pobreza.color}
              />
            ) : (
              <KpiCard
                title="Pobreza infantil"
                value="—"
                subtitle="Sin datos disponibles"
                icon={categoryConfig.pobreza.icon}
                color={categoryConfig.pobreza.color}
              />
            )}
            
            {/* Salud */}
            {salud ? (
              <KpiCard
                title={salud.nombre || "Mortalidad infantil"}
                value={formatValue(salud.valor, salud.unidad || "‰")}
                subtitle={salud.subtitulo || "Tasa por cada mil nacidos vivos (Córdoba)"}
                change={salud.cambio}
                changeType={salud.cambioTipo}
                icon={categoryConfig.salud.icon}
                color={categoryConfig.salud.color}
              />
            ) : (
              <KpiCard
                title="Mortalidad infantil"
                value="—"
                subtitle="Sin datos disponibles"
                icon={categoryConfig.salud.icon}
                color={categoryConfig.salud.color}
              />
            )}
            
            {/* Educación */}
            {educacion ? (
              <KpiCard
                title={educacion.nombre || "Escolarización"}
                value={formatValue(educacion.valor, educacion.unidad || "%")}
                subtitle={educacion.subtitulo || "Tasa neta de escolarización"}
                change={educacion.cambio}
                changeType={educacion.cambioTipo}
                icon={categoryConfig.educacion.icon}
                color={categoryConfig.educacion.color}
              />
            ) : (
              <KpiCard
                title="Escolarización"
                value="—"
                subtitle="Sin datos disponibles"
                icon={categoryConfig.educacion.icon}
                color={categoryConfig.educacion.color}
              />
            )}
            
            {/* Demografía (población adolescente) */}
            {demografia ? (
              <KpiCard
                title={demografia.nombre || "Adolescentes"}
                value={formatValue(demografia.valor, demografia.unidad || "hab")}
                subtitle={demografia.subtitulo || "Población de 12-17 años"}
                change={demografia.cambio}
                changeType={demografia.cambioTipo}
                icon={categoryConfig.demografia.icon}
                color={categoryConfig.demografia.color}
              />
            ) : (
              <KpiCard
                title="Adolescentes"
                value="—"
                subtitle="Sin datos disponibles"
                icon={categoryConfig.demografia.icon}
                color={categoryConfig.demografia.color}
              />
            )}
            
            {/* Seguridad */}
            {seguridad ? (
              <KpiCard
                title={seguridad.nombre || "Denuncias"}
                value={formatValue(seguridad.valor, seguridad.unidad || "casos")}
                subtitle={seguridad.subtitulo || "Registradas en el último período"}
                change={seguridad.cambio}
                changeType={seguridad.cambioTipo}
                icon={categoryConfig.seguridad.icon}
                color={categoryConfig.seguridad.color}
              />
            ) : (
              <KpiCard
                title="Denuncias"
                value="—"
                subtitle="Sin datos disponibles"
                icon={categoryConfig.seguridad.icon}
                color={categoryConfig.seguridad.color}
              />
            )}
            
            {/* Inversión - buscar datos de presupuesto/ejecución */}
            {inversion ? (
              <KpiCard
                title={inversion.nombre || "Inversión social"}
                value={formatValue(inversion.valor, inversion.unidad || "$")}
                subtitle={inversion.subtitulo || "Destinado a infancia y adolescencia"}
                change={inversion.cambio}
                changeType={inversion.cambioTipo}
                icon={categoryConfig.inversion.icon}
                color={categoryConfig.inversion.color}
              />
            ) : (
              <KpiCard
                title="Inversión social"
                value="—"
                subtitle="Sin datos disponibles"
                icon={categoryConfig.inversion.icon}
                color={categoryConfig.inversion.color}
              />
            )}
          </div>
        )}
      </section>

      {/* Quick Stats */}
      <section className="px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Población - navy accent */}
          <div className="relative bg-white rounded-xl border border-[#E0E0E0] p-5 text-center overflow-hidden group hover:shadow-lg transition-shadow duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-[#00074E]/5 to-transparent" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#00074E]" />
            <p className="font-display text-4xl lg:text-5xl text-[#00074E] relative z-10">3.892.456</p>
            <p className="font-accent text-xs text-[#4D4D4D] mt-3 tracking-wide relative z-10">Población total 0-17</p>
          </div>
          
          {/* Salud - terracotta accent */}
          <div className="relative bg-white rounded-xl border border-[#E0E0E0] p-5 text-center overflow-hidden group hover:shadow-lg transition-shadow duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-[#E07A5F]/5 to-transparent" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#E07A5F]" />
            <p className="font-display text-4xl lg:text-5xl text-[#E07A5F] relative z-10">847</p>
            <p className="font-accent text-xs text-[#4D4D4D] mt-3 tracking-wide relative z-10">Centros de salud</p>
          </div>
          
          {/* Educación - amber accent */}
          <div className="relative bg-white rounded-xl border border-[#E0E0E0] p-5 text-center overflow-hidden group hover:shadow-lg transition-shadow duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-[#F3A712]/5 to-transparent" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#F3A712]" />
            <p className="font-display text-4xl lg:text-5xl text-[#F3A712] relative z-10">2.341</p>
            <p className="font-accent text-xs text-[#4D4D4D] mt-3 tracking-wide relative z-10">Establecimientos educativos</p>
          </div>
          
          {/* Vacunación - magenta accent */}
          <div className="relative bg-white rounded-xl border border-[#E0E0E0] p-5 text-center overflow-hidden group hover:shadow-lg transition-shadow duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-[#BF1363]/5 to-transparent" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#BF1363]" />
            <p className="font-display text-4xl lg:text-5xl text-[#BF1363] relative z-10">95,1%</p>
            <p className="font-accent text-xs text-[#4D4D4D] mt-3 tracking-wide relative z-10">Cobertura vacunal</p>
          </div>
        </div>
      </section>
    </div>
  );
}
