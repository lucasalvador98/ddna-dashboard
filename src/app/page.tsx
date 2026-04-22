"use client";

import { Users, Heart, BookOpen, Coins, UserCircle, AlertTriangle } from "lucide-react";
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
  { id: "salud", label: "Salud", href: "/salud", icon: "cat-salud.png", bg: "bg-[#E07A5F]" },
  { id: "educacion", label: "Educación", href: "/educacion", icon: "cat-educacion.png", bg: "bg-[#F3A712]" },
  { id: "pobreza", label: "Pobreza", href: "/pobreza", icon: "cat-pobreza.png", bg: "bg-[#BF1363]" },
  { id: "seguridad", label: "Seguridad", href: "/seguridad", icon: "cat-justicia.png", bg: "bg-[#3777FF]" },
  { id: "inversion", label: "Inversión", href: "/inversion", icon: "cat-censo.png", bg: "bg-[#FF7F11]" },
  { id: "demografia", label: "Demografía", href: "/demografia", icon: "cat-estudiantes.png", bg: "bg-[#1E9AD8]" },
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
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header - Clean institutional style */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logos */}
            <div className="flex items-center gap-3 lg:gap-4">
              <Image
                src="/logos/Cba.png"
                alt="Gobierno de Córdoba"
                width={40}
                height={40}
                className="rounded"
              />
              <Image
                src="/logos/LOGO DDNA_HORIZONTAL_COLOR.png"
                alt="DDNA"
                width={160}
                height={40}
                className="object-contain"
              />
            </div>
            
            {/* Status badge */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className={`w-2 h-2 rounded-full ${source === "supabase" ? "bg-green-500" : "bg-amber-500"}`} />
              <span className="hidden sm:inline">
                {source === "supabase" ? "Datos en vivo" : "Datos de referencia"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Page title */}
      <div className="bg-[#00074E]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12">
          <h1 className="font-display text-3xl lg:text-4xl text-white">
            Tablero de Monitoreo
          </h1>
          <p className="font-body text-base lg:text-lg text-white/80 mt-1">
            Defensoría de los Derechos de Niñas, Niños y Adolescentes de Córdoba
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-10">
        
        {/* Quick Access */}
        <section className="mb-10">
          <h2 className="font-display text-xl text-[#00074E] mb-5">
            Acceso Rápido
          </h2>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
            {quickAccessCategories.map((cat) => (
              <Link 
                key={cat.id}
                href={cat.href}
                className="group flex flex-col items-center"
              >
                <div 
                  className={`w-full aspect-square ${cat.bg} rounded-xl flex items-center justify-center mb-2 transition-opacity group-hover:opacity-80`}
                >
                  <Image
                    src={`/logos/${cat.icon}`}
                    alt={cat.label}
                    width={48}
                    height={48}
                    className="w-12 h-12 lg:w-14 lg:h-14 object-contain brightness-0 invert"
                  />
                </div>
                <span className="font-accent text-xs lg:text-sm text-[#4D4D4D] text-center">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* KPIs */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl text-[#00074E]">
              Indicadores Clave
            </h2>
            {metadata?.ultimaActualizacion && (
              <span className="text-sm text-gray-400">
                Actualizado: {new Date(metadata.ultimaActualizacion).toLocaleDateString("es-AR")}
              </span>
            )}
          </div>
          
          {loading && source === "supabase" ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7F11]" />
              <span className="ml-3 font-body text-gray-500">Cargando...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
              
              {salud ? (
                <KpiCard
                  title={salud.nombre || "Mortalidad infantil"}
                  value={formatValue(salud.valor, salud.unidad || "‰")}
                  subtitle={salud.subtitulo || "Tasa por cada mil nacidos vivos"}
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
              
              {demografia ? (
                <KpiCard
                  title={demografia.nombre || "Población adolescente"}
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

        {/* Stats banner */}
        <section className="bg-[#00074E] rounded-xl p-6 lg:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="font-display text-2xl lg:text-3xl text-white">3.892.456</p>
              <p className="font-accent text-xs text-white/60 mt-1">Población 0-17 años</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl lg:text-3xl text-white">847</p>
              <p className="font-accent text-xs text-white/60 mt-1">Centros de salud</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl lg:text-3xl text-white">2.341</p>
              <p className="font-accent text-xs text-white/60 mt-1">Establecimientos educativos</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl lg:text-3xl text-white">95,1%</p>
              <p className="font-accent text-xs text-white/60 mt-1">Cobertura vacunal</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logos/Cba.png"
                alt="Gobierno de Córdoba"
                width={32}
                height={32}
                className="rounded"
              />
              <Image
                src="/logos/LOGO DDNA_HORIZONTAL_COLOR.png"
                alt="DDNA"
                width={120}
                height={32}
                className="object-contain"
              />
            </div>
            <p className="text-sm text-gray-400">
              Defensoría de los Derechos de Niñas, Niños y Adolescentes — Provincia de Córdoba
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
