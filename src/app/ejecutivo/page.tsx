"use client";

import { AlertTriangle, Users, TrendingUp, BookOpen, Heart, Coins, Scale, Baby } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionHeader } from "@/components/section-header";

export default function ExecutiveDashboard() {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Scale}
        title="Estado de Niñez, Adolescencia y Familia"
        description="Indicadores clave para la toma de decisiones — Provincia de Córdoba"
        color="navy"
      />

      {/* Alertas críticas */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-accent text-red-700 font-semibold">Puntos de Atención Crítica</h3>
          <ul className="mt-2 space-y-1 text-sm text-red-600 font-body">
            <li>• <strong>Violencia Familiar:</strong> 55,993 casos registrados (2022)</li>
            <li>• <strong>Matemática Q1-Q2:</strong> +65% de estudiantes bajo nivel básico</li>
            <li>• <strong>Embarazo adolescente:</strong> Tendencia en aumento</li>
          </ul>
        </div>
      </div>

      {/* Crisis y Protección */}
      <section>
        <h2 className="font-accent text-sm text-[#BF1363] uppercase tracking-wide mb-3">
          <span className="w-2 h-2 rounded-full bg-[#BF1363] inline-block mr-2" />
          Crisis y Protección
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Violencia Familiar" value="55,993" subtitle="casos (2022)" icon={AlertTriangle} color="magenta" />
          <KpiCard title="Pobreza Infantil" value="52.9%" subtitle="máximo histórico (2021)" icon={Users} color="magenta" />
          <KpiCard title="Mortalidad Infantil" value="7.2‰" subtitle="por mil nacidos vivos" icon={Baby} color="terracotta" />
          <KpiCard title="Escolarización" value="89.1%" subtitle="tasa neta (promedio)" icon={BookOpen} color="amber" />
        </div>
      </section>

      {/* Educación */}
      <section>
        <h2 className="font-accent text-sm text-[#F3A712] uppercase tracking-wide mb-3">
          <span className="w-2 h-2 rounded-full bg-[#F3A712] inline-block mr-2" />
          Educación
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard title="Matrícula Total" value="887,014" subtitle="alumnos (2024)" icon={BookOpen} color="navy" />
          <KpiCard title="Sector Público" value="64.5%" subtitle="de la matrícula total" icon={TrendingUp} color="blue" />
          <KpiCard title="Aprender Matemática" value="71.1%" subtitle="Q1 bajo nivel básico" icon={AlertTriangle} color="magenta" />
        </div>
      </section>

      {/* Inversión Social */}
      <section>
        <h2 className="font-accent text-sm text-[#10B981] uppercase tracking-wide mb-3">
          <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block mr-2" />
          Inversión Social
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard title="Inversión Total" value="$549,519 M" subtitle="en infancia (2024)" icon={Coins} color="green" />
          <KpiCard title="Educación" value="$224,800 M" subtitle="40.9% del total" icon={BookOpen} color="navy" />
          <KpiCard title="Salud" value="$171,200 M" subtitle="31.1% del total" icon={Heart} color="terracotta" />
        </div>
      </section>

      {/* Sistema de Justicia */}
      <section>
        <h2 className="font-accent text-sm text-[#3777FF] uppercase tracking-wide mb-3">
          <span className="w-2 h-2 rounded-full bg-[#3777FF] inline-block mr-2" />
          Sistema de Justicia
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Violencia Familiar" value="55,993" subtitle="casos" icon={AlertTriangle} color="magenta" />
          <KpiCard title="Familia" value="5,089" subtitle="casos" icon={Users} color="navy" />
          <KpiCard title="Penal Juvenil" value="1,098" subtitle="casos" icon={Scale} color="navy" />
          <KpiCard title="Fiscalía" value="2,058" subtitle="casos" icon={Scale} color="navy" />
        </div>
      </section>

      {/* Acciones Prioritarias */}
      <section className="bg-gradient-to-r from-[#00074E] to-[#1a1a6e] rounded-xl p-6 text-white">
        <h2 className="font-display text-xl mb-4">Acciones Prioritarias Recomendadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-accent font-bold text-[#FF7F11] mb-2">1. Atención Inmediata</h3>
            <ul className="space-y-1 text-sm text-white/80 font-body">
              <li>• Reforzar equipos de Violencia Familiar</li>
              <li>• Programa de apoyo matemático intensiva Q1-Q2</li>
              <li>• Prevención de embarazo adolescente</li>
            </ul>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-accent font-bold text-[#F3A712] mb-2">2. Mediano Plazo</h3>
            <ul className="space-y-1 text-sm text-white/80 font-body">
              <li>• Expandir cobertura de Aprender a más escuelas</li>
              <li>• Fortalecer centros de salud para adolescentes</li>
              <li>• Escalar programas PAICOR</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Fuentes */}
      <section className="pt-6 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400 font-body">
          Fuentes: INDEC, Ministerio de Educación, DEIS, Poder Judicial Córdoba, Ministerio de Finanzas
          <br />
          Actualizado: {new Date().toLocaleDateString("es-AR")}
        </p>
      </section>
    </div>
  );
}
