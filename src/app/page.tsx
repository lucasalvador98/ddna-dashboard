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
      {/* Header Banner - Official DDNA Style */}
      <section className="relative">
        {/* Orange accent strip at very top */}
        <div className="h-1.5 bg-[#FF7F11]" />
        
        {/* Main header area - white with logo */}
        <div className="bg-white py-6 px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Logos */}
            <div className="flex items-center gap-4">
              <Image
                src="/logos/Cba.png"
                alt="Gobierno de Córdoba"
                width={56}
                height={56}
                className="rounded-lg"
              />
              <Image
                src="/logos/LOGO DDNA_HORIZONTAL_COLOR.png"
                alt="DDNA"
                width={220}
                height={56}
                className="object-contain"
              />
            </div>
            
            {/* Title - only visible on larger screens */}
            <div className="hidden lg:block">
              <h1 className="font-display text-2xl text-[#00074E] tracking-tight">
                Tablero de Monitoreo
              </h1>
            </div>
            
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#4D4D4D]">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-body">
                  Fuente: {metadata?.fuente === "api" ? "API externa" : metadata?.fuente === "manual" ? "Carga manual" : (source === "supabase" ? "Base de datos DDNA" : "Valores referenciales")}
                </span>
              </div>
              {metadata?.ultimaActualizacion && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-body">
                    Actualizado: {new Date(metadata.ultimaActualizacion).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Orange accent strip at bottom */}
        <div className="h-1 bg-[#FF7F11]" />
      </section>

      {/* Page Title - visible on mobile */}
      <div className="lg:hidden px-6">
        <h1 className="font-display text-2xl text-[#00074E] tracking-tight">
          Tablero de Monitoreo
        </h1>
        <p className="font-body text-sm text-[#4D4D4D] mt-1">
          Defensoría de los Derechos de Niñas, Niños y Adolescentes
        </p>
      </div>

      {/* Quick Access Grid - DDNA Style with white circular buttons */}
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
              className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-white border-2 border-[#E0E0E0] flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-[#FF7F11] group-hover:shadow-lg"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <Image
                src="/logos/Recurso 1@2x.png"
                alt="Inicio"
                width={64}
                height={64}
                className="w-14 h-14 lg:w-16 lg:h-16 object-contain"
              />
            </div>
            <span className="font-accent text-sm text-[#4D4D4D] text-center tracking-wide group-hover:text-[#FF7F11] transition-colors">
              Inicio
            </span>
          </a>

          {/* Salud */}
          <a 
            href="/?categoria=salud"
            className="group flex flex-col items-center gap-3 no-underline"
          >
            <div 
              className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-white border-2 border-[#E0E0E0] flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-[#FF7F11] group-hover:shadow-lg"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <Image
                src="/logos/cat-salud.png"
                alt="Salud"
                width={64}
                height={64}
                className="w-14 h-14 lg:w-16 lg:h-16 object-contain"
              />
            </div>
            <span className="font-accent text-sm text-[#4D4D4D] text-center tracking-wide group-hover:text-[#FF7F11] transition-colors">
              Salud
            </span>
          </a>

          {/* Educación */}
          <a 
            href="/?categoria=educacion"
            className="group flex flex-col items-center gap-3 no-underline"
          >
            <div 
              className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-white border-2 border-[#E0E0E0] flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-[#FF7F11] group-hover:shadow-lg"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <Image
                src="/logos/cat-educacion.png"
                alt="Educación"
                width={64}
                height={64}
                className="w-14 h-14 lg:w-16 lg:h-16 object-contain"
              />
            </div>
            <span className="font-accent text-sm text-[#4D4D4D] text-center tracking-wide group-hover:text-[#FF7F11] transition-colors">
              Educación
            </span>
          </a>

          {/* Pobreza */}
          <a 
            href="/?categoria=pobreza"
            className="group flex flex-col items-center gap-3 no-underline"
          >
            <div 
              className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-white border-2 border-[#E0E0E0] flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-[#FF7F11] group-hover:shadow-lg"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <Image
                src="/logos/cat-pobreza.png"
                alt="Pobreza"
                width={64}
                height={64}
                className="w-14 h-14 lg:w-16 lg:h-16 object-contain"
              />
            </div>
            <span className="font-accent text-sm text-[#4D4D4D] text-center tracking-wide group-hover:text-[#FF7F11] transition-colors">
              Pobreza
            </span>
          </a>

          {/* Seguridad */}
          <a 
            href="/?categoria=seguridad"
            className="group flex flex-col items-center gap-3 no-underline"
          >
            <div 
              className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-white border-2 border-[#E0E0E0] flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-[#FF7F11] group-hover:shadow-lg"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <Image
                src="/logos/cat-justicia.png"
                alt="Seguridad"
                width={64}
                height={64}
                className="w-14 h-14 lg:w-16 lg:h-16 object-contain"
              />
            </div>
            <span className="font-accent text-sm text-[#4D4D4D] text-center tracking-wide group-hover:text-[#FF7F11] transition-colors">
              Seguridad
            </span>
          </a>

          {/* Inversión Social */}
          <a 
            href="/?categoria=inversion"
            className="group flex flex-col items-center gap-3 no-underline"
          >
            <div 
              className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-white border-2 border-[#E0E0E0] flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-[#FF7F11] group-hover:shadow-lg"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <Image
                src="/logos/cat-censo.png"
                alt="Inversión Social"
                width={64}
                height={64}
                className="w-14 h-14 lg:w-16 lg:h-16 object-contain"
              />
            </div>
            <span className="font-accent text-sm text-[#4D4D4D] text-center tracking-wide group-hover:text-[#FF7F11] transition-colors">
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
