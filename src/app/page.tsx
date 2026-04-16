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
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#00074E] via-[#00074E] to-[#0a0a5e] p-8 text-white">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Amber accent orb - top right */}
          <div 
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 animate-pulse"
            style={{ background: "radial-gradient(circle, #F3A712 0%, transparent 70%)" }}
          />
          {/* Magenta accent orb - bottom left */}
          <div 
            className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-10 animate-pulse"
            style={{ background: "radial-gradient(circle, #BF1363 0%, transparent 70%)", animationDelay: "1s" }}
          />
          {/* Grid pattern overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.07]">
            <defs>
              <pattern id="heroGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[#FFE2BF]" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#heroGrid)" />
          </svg>
        </div>
        
        {/* Amber accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#F3A712] via-[#BF1363] to-[#FF7F11]" />
        
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
          <p className="font-body text-lg text-[#FFE2BF] max-w-2xl">
            Defensoría de los Derechos de Niñas, Niños y Adolescentes — Provincia de Córdoba
          </p>
          
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2 text-[#FFE2BF]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-body">
                Fuente: {metadata?.fuente === "api" ? "API externa" : metadata?.fuente === "manual" ? "Carga manual" : (source === "supabase" ? "Base de datos DDNA" : "Valores referenciales")}
              </span>
            </div>
            {metadata?.ultimaActualizacion && (
              <div className="flex items-center gap-2 text-[#FFE2BF]">
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
      </section>

      {/* Quick Access Grid - DDNA Style */}
      <section className="py-4">
        <h2 className="font-display text-xl text-[#00074E] mb-6 tracking-tight">
          Acceso Rápido
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 justify-items-center">
          {/* Inicio */}
          <a 
            href="/"
            className="group flex flex-col items-center gap-3 no-underline"
          >
            <div 
              className="w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
              style={{ 
                backgroundColor: "#F3A712",
                boxShadow: "0 4px 12px rgba(243, 167, 18, 0.3)"
              }}
            >
              <Image
                src="/logos/Recurso 1@2x.png"
                alt="Inicio"
                width={48}
                height={48}
                className="w-10 h-10 lg:w-12 lg:h-12 object-contain brightness-0 invert"
              />
            </div>
            <span className="font-accent text-sm text-[#4D4D4D] text-center tracking-wide group-hover:text-[#00074E] transition-colors">
              Inicio
            </span>
          </a>

          {/* Salud */}
          <a 
            href="/?categoria=salud"
            className="group flex flex-col items-center gap-3 no-underline"
          >
            <div 
              className="w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
              style={{ 
                backgroundColor: "#E07A5F",
                boxShadow: "0 4px 12px rgba(224, 122, 95, 0.3)"
              }}
            >
              <Image
                src="/logos/Recurso 2@2x.png"
                alt="Salud"
                width={48}
                height={48}
                className="w-10 h-10 lg:w-12 lg:h-12 object-contain brightness-0 invert"
              />
            </div>
            <span className="font-accent text-sm text-[#4D4D4D] text-center tracking-wide group-hover:text-[#00074E] transition-colors">
              Salud
            </span>
          </a>

          {/* Educación */}
          <a 
            href="/?categoria=educacion"
            className="group flex flex-col items-center gap-3 no-underline"
          >
            <div 
              className="w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
              style={{ 
                backgroundColor: "#F3A712",
                boxShadow: "0 4px 12px rgba(243, 167, 18, 0.3)"
              }}
            >
              <Image
                src="/logos/Recurso 3@2x.png"
                alt="Educación"
                width={48}
                height={48}
                className="w-10 h-10 lg:w-12 lg:h-12 object-contain brightness-0 invert"
              />
            </div>
            <span className="font-accent text-sm text-[#4D4D4D] text-center tracking-wide group-hover:text-[#00074E] transition-colors">
              Educación
            </span>
          </a>

          {/* Pobreza */}
          <a 
            href="/?categoria=pobreza"
            className="group flex flex-col items-center gap-3 no-underline"
          >
            <div 
              className="w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
              style={{ 
                backgroundColor: "#BF1363",
                boxShadow: "0 4px 12px rgba(191, 19, 99, 0.3)"
              }}
            >
              <Image
                src="/logos/Recurso 4@2x.png"
                alt="Pobreza"
                width={48}
                height={48}
                className="w-10 h-10 lg:w-12 lg:h-12 object-contain brightness-0 invert"
              />
            </div>
            <span className="font-accent text-sm text-[#4D4D4D] text-center tracking-wide group-hover:text-[#00074E] transition-colors">
              Pobreza
            </span>
          </a>

          {/* Seguridad */}
          <a 
            href="/?categoria=seguridad"
            className="group flex flex-col items-center gap-3 no-underline"
          >
            <div 
              className="w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
              style={{ 
                backgroundColor: "#3777FF",
                boxShadow: "0 4px 12px rgba(55, 119, 255, 0.3)"
              }}
            >
              <Image
                src="/logos/Recurso 5@2x.png"
                alt="Seguridad"
                width={48}
                height={48}
                className="w-10 h-10 lg:w-12 lg:h-12 object-contain brightness-0 invert"
              />
            </div>
            <span className="font-accent text-sm text-[#4D4D4D] text-center tracking-wide group-hover:text-[#00074E] transition-colors">
              Seguridad
            </span>
          </a>

          {/* Inversión Social */}
          <a 
            href="/?categoria=inversion"
            className="group flex flex-col items-center gap-3 no-underline"
          >
            <div 
              className="w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
              style={{ 
                backgroundColor: "#FF7F11",
                boxShadow: "0 4px 12px rgba(255, 127, 17, 0.3)"
              }}
            >
              <Image
                src="/logos/Recurso 6@2x.png"
                alt="Inversión Social"
                width={48}
                height={48}
                className="w-10 h-10 lg:w-12 lg:h-12 object-contain brightness-0 invert"
              />
            </div>
            <span className="font-accent text-sm text-[#4D4D4D] text-center tracking-wide group-hover:text-[#00074E] transition-colors">
              Inversión
            </span>
          </a>
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
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      </section>
    </div>
  );
}
