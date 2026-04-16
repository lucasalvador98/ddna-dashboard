"use client";

import { Users, Heart, BookOpen, Coins, UserCircle, AlertTriangle, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { KpiCard } from "@/components/kpi-card";
import { useIndicadores } from "@/lib/hooks";
import type { CategoriaIndicador } from "@/lib/supabase";

const categoryConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: "amber" | "magenta" | "blue" | "terracotta" | "navy" | "orange" }> = {
  pobreza: { icon: Users, color: "magenta" },
  salud: { icon: Heart, color: "blue" },
  educacion: { icon: BookOpen, color: "amber" },
  inversion: { icon: Coins, color: "terracotta" },
  demografia: { icon: UserCircle, color: "navy" },
  seguridad: { icon: AlertTriangle, color: "orange" },
};

const quickAccessCategories = [
  { id: "salud", label: "Salud", icon: "cat-salud.png", gradient: "from-[#E07A5F] to-[#BF1363]", shadow: "rgba(224, 122, 95, 0.5)" },
  { id: "educacion", label: "Educación", icon: "cat-educacion.png", gradient: "from-[#F3A712] to-[#FF7F11]", shadow: "rgba(243, 167, 18, 0.5)" },
  { id: "pobreza", label: "Pobreza", icon: "cat-pobreza.png", gradient: "from-[#BF1363] to-[#9a0f4f]", shadow: "rgba(191, 19, 99, 0.5)" },
  { id: "seguridad", label: "Seguridad", icon: "cat-justicia.png", gradient: "from-[#3777FF] to-[#2959cc]", shadow: "rgba(55, 119, 255, 0.5)" },
  { id: "inversion", label: "Inversión", icon: "cat-censo.png", gradient: "from-[#FF7F11] to-[#E07A5F]", shadow: "rgba(255, 127, 17, 0.5)" },
  { id: "demografia", label: "Demografía", icon: "cat-estudiantes.png", gradient: "from-[#3777FF] to-[#1E9AD8]", shadow: "rgba(55, 119, 255, 0.4)" },
];

function formatValue(valor: string, unidad: string): string {
  if (unidad === "‰") return `${valor}‰`;
  if (unidad === "%") return `${valor}%`;
  if (unidad === "Md") return `$${valor} Md`;
  if (unidad === "hab" || unidad === "casos") return Number(valor).toLocaleString("es-AR");
  return valor;
}

export default function HomePage() {
  const { data, loading, source, metadata } = useIndicadores();
  
  const getLatestByCategory = (cat: string) => {
    const categoryData = data.filter(d => d.categoria === cat);
    if (categoryData.length === 0) return null;
    return categoryData[0];
  };
  
  const pobreza = getLatestByCategory("pobreza");
  const salud = getLatestByCategory("salud");
  const educacion = getLatestByCategory("educacion");
  const inversion = getLatestByCategory("inversion");
  const demografia = getLatestByCategory("demografia");
  const seguridad = getLatestByCategory("seguridad");

  return (
    <div className="relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large decorative circles */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-[#FF7F11]/10 to-[#F3A712]/10 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#3777FF]/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-gradient-to-tl from-[#BF1363]/8 to-transparent blur-3xl" />
        
        {/* Floating dots pattern */}
        <svg className="absolute top-20 left-10 opacity-30" width="120" height="120" viewBox="0 0 120 120">
          <circle cx="10" cy="10" r="4" fill="#FF7F11" />
          <circle cx="40" cy="20" r="3" fill="#F3A712" />
          <circle cx="70" cy="10" r="5" fill="#3777FF" />
          <circle cx="100" cy="25" r="3" fill="#BF1363" />
          <circle cx="25" cy="50" r="4" fill="#E07A5F" />
          <circle cx="60" cy="45" r="3" fill="#FF7F11" />
          <circle cx="95" cy="55" r="4" fill="#F3A712" />
          <circle cx="15" cy="85" r="3" fill="#3777FF" />
          <circle cx="50" cy="80" r="5" fill="#BF1363" />
          <circle cx="85" cy="90" r="3" fill="#E07A5F" />
        </svg>
        
        <svg className="absolute bottom-40 right-20 opacity-25" width="100" height="100" viewBox="0 0 100 100">
          <circle cx="15" cy="15" r="4" fill="#3777FF" />
          <circle cx="50" cy="10" r="3" fill="#FF7F11" />
          <circle cx="85" cy="20" r="5" fill="#F3A712" />
          <circle cx="30" cy="50" r="3" fill="#BF1363" />
          <circle cx="70" cy="55" r="4" fill="#E07A5F" />
          <circle cx="10" cy="80" r="4" fill="#FF7F11" />
          <circle cx="55" cy="85" r="3" fill="#3777FF" />
          <circle cx="90" cy="75" r="4" fill="#F3A712" />
        </svg>
      </div>

      {/* Hero Section - Dynamic diagonal design */}
      <section className="relative">
        {/* Main gradient background with wave effect */}
        <div className="relative bg-gradient-to-br from-[#FF7F11] via-[#F3A712] to-[#FF7F11] pt-8 pb-24 lg:pb-32 overflow-hidden">
          {/* Diagonal stripe overlay */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <pattern id="diagonal-stripes" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="20" stroke="#fff" strokeWidth="10" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#diagonal-stripes)" />
            </svg>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute top-10 right-[10%] w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm" />
          <div className="absolute bottom-10 right-[25%] w-20 h-20 rounded-full bg-white/15 backdrop-blur-sm" />
          <div className="absolute top-1/3 left-[5%] w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm" />
          
          {/* Main content */}
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            {/* Top bar with logos */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <Image
                  src="/logos/Cba.png"
                  alt="Gobierno de Córdoba"
                  width={48}
                  height={48}
                  className="rounded-lg shadow-md"
                />
                <Image
                  src="/logos/LOGO DDNA_HORIZONTAL_COLOR.png"
                  alt="DDNA"
                  width={180}
                  height={48}
                  className="object-contain hidden sm:block"
                />
              </div>
              
              {/* Source badge */}
              <div className="flex items-center gap-3">
                <span className="bg-white/90 backdrop-blur-sm text-[#00074E] px-4 py-2 rounded-full font-accent text-sm shadow-lg flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
                  </span>
                  {metadata?.fuente === "api" ? "API" : metadata?.fuente === "manual" ? "Manual" : (source === "supabase" ? "En vivo" : "Referencia")}
                </span>
              </div>
            </div>
            
            {/* Hero text with playful typography */}
            <div className="text-center lg:text-left lg:max-w-2xl">
              <h1 className="font-display text-4xl lg:text-5xl xl:text-6xl text-white leading-tight mb-4 drop-shadow-lg">
                Tablero de{' '}
                <span className="relative inline-block">
                  <span className="relative z-10">Monitoreo</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 8C50 2 150 2 198 8" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.6"/>
                  </svg>
                </span>
              </h1>
              <p className="font-body text-lg lg:text-xl text-white/90 max-w-xl drop-shadow-md">
                Defensoría de los Derechos de Niñas, Niños y Adolescentes de Córdoba
              </p>
              
              {/* Decorative tagline */}
              <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="font-accent text-sm text-white">Datos actualizados para proteger sus derechos</span>
              </div>
            </div>
          </div>
          
          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Quick Access Section - Playful circles */}
      <section className="relative -mt-16 px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Section header with icon */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-br from-[#FF7F11] to-[#F3A712] p-3 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl lg:text-3xl text-[#00074E] tracking-tight">
              Acceso Rápido
            </h2>
          </div>
          
          {/* Playful circular buttons */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-6 lg:gap-8">
            {/* Home button */}
            <Link href="/" className="group flex flex-col items-center gap-3 no-underline">
              <div 
                className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-[#F3A712] to-[#FF7F11] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl transform -rotate-3"
                style={{ boxShadow: "0 8px 30px rgba(243, 167, 18, 0.5)" }}
              >
                <Image
                  src="/logos/Recurso 1@2x.png"
                  alt="Inicio"
                  width={72}
                  height={72}
                  className="w-16 h-16 lg:w-20 lg:h-20 object-contain brightness-0 invert"
                />
              </div>
              <span className="font-accent text-sm text-[#4D4D4D] text-center tracking-wide group-hover:text-[#FF7F11] transition-colors font-semibold">
                Inicio
              </span>
            </Link>

            {/* Category buttons */}
            {quickAccessCategories.map((cat, index) => (
              <Link 
                key={cat.id}
                href={`/?categoria=${cat.id}`}
                className="group flex flex-col items-center gap-3 no-underline"
              >
                <div 
                  className={`w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br ${cat.gradient} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl transform ${index % 2 === 0 ? 'rotate-3' : '-rotate-2'}`}
                  style={{ boxShadow: `0 8px 30px ${cat.shadow}` }}
                >
                  <Image
                    src={`/logos/${cat.icon}`}
                    alt={cat.label}
                    width={72}
                    height={72}
                    className="w-16 h-16 lg:w-20 lg:h-20 object-contain brightness-0 invert"
                  />
                </div>
                <span className={`font-accent text-sm text-[#4D4D4D] text-center tracking-wide group-hover:font-semibold transition-all duration-300 ${
                  cat.id === 'salud' ? 'group-hover:text-[#E07A5F]' :
                  cat.id === 'educacion' ? 'group-hover:text-[#F3A712]' :
                  cat.id === 'pobreza' ? 'group-hover:text-[#BF1363]' :
                  cat.id === 'seguridad' ? 'group-hover:text-[#3777FF]' :
                  cat.id === 'inversion' ? 'group-hover:text-[#FF7F11]' :
                  'group-hover:text-[#3777FF]'
                }`}>
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* KPI Section */}
      <section className="px-6 lg:px-8 py-8 relative">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-[#3777FF] to-[#1E9AD8] p-3 rounded-xl shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-display text-2xl lg:text-3xl text-[#00074E] tracking-tight">
              Indicadores Clave
            </h2>
            {metadata?.ultimaActualizacion && (
              <p className="font-body text-sm text-[#4D4D4D]/70">
                Actualizado: {new Date(metadata.ultimaActualizacion).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
          </div>
        </div>
        
        {loading && source === "supabase" ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7F11]" />
            <span className="ml-3 font-body text-[#4D4D4D]">Cargando indicadores...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
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
            
            {/* Demografía */}
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
            
            {/* Inversión */}
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

      {/* Quick Stats - Playful design */}
      <section className="px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-br from-[#00074E] to-[#1a1a5e] rounded-3xl p-8 lg:p-10 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#FF7F11]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#3777FF]/10 blur-3xl" />
          
          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Población */}
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#3777FF] to-[#1E9AD8] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <p className="font-display text-3xl lg:text-4xl text-white mb-1">3.892.456</p>
              <p className="font-accent text-xs lg:text-sm text-white/60 tracking-wide">Población 0-17 años</p>
            </div>
            
            {/* Centros de salud */}
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#E07A5F] to-[#BF1363] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <p className="font-display text-3xl lg:text-4xl text-white mb-1">847</p>
              <p className="font-accent text-xs lg:text-sm text-white/60 tracking-wide">Centros de salud</p>
            </div>
            
            {/* Establecimientos educativos */}
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#F3A712] to-[#FF7F11] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <p className="font-display text-3xl lg:text-4xl text-white mb-1">2.341</p>
              <p className="font-accent text-xs lg:text-sm text-white/60 tracking-wide">Establecimientos educativos</p>
            </div>
            
            {/* Cobertura vacunal */}
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#BF1363] to-[#9a0f4f] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="font-display text-3xl lg:text-4xl text-white mb-1">95,1%</p>
              <p className="font-accent text-xs lg:text-sm text-white/60 tracking-wide">Cobertura vacunal</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer decoration */}
      <div className="h-8 bg-gradient-to-r from-[#FF7F11] via-[#F3A712] to-[#FF7F11]" />
    </div>
  );
}
