"use client";

import { Scale, TrendingUp, Users, AlertTriangle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Colores del branding DDNA
const DDNA = {
  primary: "#00074E",    // Navy oscuro
  accent: "#FF7F11",      // Naranja
  magenta: "#BF1363",
  amber: "#F3A712",
  green: "#10B981",
  red: "#EF4444",
  gray: "#4D4D4D",
  lightGray: "#FAFAFA",
};

export default function ExecutiveDashboard() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: DDNA.lightGray }}>
      {/* Header institucional */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/logos/Cba.png"
              alt="Gobierno de Córdoba"
              width={36}
              height={36}
              style={{ height: "auto" }}
              className="rounded"
            />
            <Image
              src="/logos/LOGO DDNA_HORIZONTAL_COLOR.png"
              alt="DDNA"
              width={140}
              height={36}
              style={{ height: "auto" }}
              className="object-contain"
            />
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium">DASHBOARD EJECUTIVO</p>
            <p className="text-sm text-gray-600 font-semibold">{new Date().toLocaleDateString("es-AR", { year: "numeric", month: "long" })}</p>
          </div>
        </div>
      </header>

      {/* Título principal */}
      <div className="bg-[#00074E] py-8">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl lg:text-4xl text-white font-bold">
            Estado de Niñez, Adolescencia y Familia
          </h1>
          <p className="text-white/80 mt-2 text-lg">
            Indicadores clave para la toma de decisiones - Provincia de Córdoba
          </p>
        </div>
      </div>

      {/* ALERTAS CRÍTICAS */}
      <div className="max-w-7xl mx-auto px-6 -mt-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-red-700 text-lg">Puntos de Atención Crítica</h3>
            <ul className="mt-2 space-y-1 text-red-600">
              <li>• <strong>Violencia Familiar:</strong> 55,993 casos registrados (2022)</li>
              <li>• <strong>Matemática Q1-Q2:</strong> +65% de estudiantes bajo nivel básico</li>
              <li>• <strong>Embarazo adolescente:</strong> Tendencia en aumento</li>
            </ul>
          </div>
        </div>
      </div>

      {/* KPIs PRINCIPALES */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* FILA 1: CRISIS Y PROTECCIÓN */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#00074E] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#BF1363]" />
            CRISIS Y PROTECCIÓN
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Violencia Familiar */}
            <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-[#BF1363]">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-[#BF1363]" />
                <span className="text-sm text-gray-500 font-medium">Violencia Familiar</span>
              </div>
              <p className="text-3xl font-bold text-[#BF1363]">55,993</p>
              <p className="text-sm text-gray-500 mt-1">casos (2022)</p>
            </div>

            {/* Pobreza Infantil */}
            <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-[#BF1363]">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-[#BF1363]" />
                <span className="text-sm text-gray-500 font-medium">Pobreza Infantil</span>
              </div>
              <p className="text-3xl font-bold text-[#BF1363]">52.9%</p>
              <p className="text-sm text-gray-500 mt-1">máximo histórico (2021)</p>
            </div>

            {/* TMI */}
            <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-[#E07A5F]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👶</span>
                <span className="text-sm text-gray-500 font-medium">Mortalidad Infantil</span>
              </div>
              <p className="text-3xl font-bold text-[#E07A5F]">7.2‰</p>
              <p className="text-sm text-gray-500 mt-1">por mil nacidos vivos</p>
            </div>

            {/* Escolarización */}
            <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-[#F3A712]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📚</span>
                <span className="text-sm text-gray-500 font-medium">Escolarización</span>
              </div>
              <p className="text-3xl font-bold text-[#F3A712]">89.1%</p>
              <p className="text-sm text-gray-500 mt-1">tasa neta (promedio)</p>
            </div>
          </div>
        </section>

        {/* FILA 2: EDUCACIÓN */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#00074E] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F3A712]" />
            EDUCACIÓN
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Matrícula */}
            <div className="bg-white rounded-xl p-5 shadow-md">
              <p className="text-sm text-gray-500 font-medium mb-1">Matrícula Total</p>
              <p className="text-2xl font-bold text-[#00074E]">887,014</p>
              <p className="text-xs text-gray-400">alumnos (2024)</p>
            </div>

            {/* Sector Público */}
            <div className="bg-white rounded-xl p-5 shadow-md">
              <p className="text-sm text-gray-500 font-medium mb-1">Sector Público</p>
              <p className="text-2xl font-bold text-[#3777FF]">64.5%</p>
              <p className="text-xs text-gray-400">de la matrícula total</p>
            </div>

            {/* Aprender - ALERTA */}
            <div className="bg-red-50 rounded-xl p-5 shadow-md border border-red-200">
              <p className="text-sm text-red-600 font-medium mb-1">⚠️ Aprender Matemática</p>
              <p className="text-2xl font-bold text-red-700">71.1%</p>
              <p className="text-xs text-red-500">Q1 está bajo nivel básico</p>
            </div>
          </div>
        </section>

        {/* FILA 3: INVERSIÓN */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#00074E] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            INVERSIÓN SOCIAL
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-[#10B981]">
              <p className="text-sm text-gray-500 font-medium mb-1">Inversión Total</p>
              <p className="text-2xl font-bold text-[#10B981]">$549,519 M</p>
              <p className="text-xs text-gray-400">en infancia (2024)</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md">
              <p className="text-sm text-gray-500 font-medium mb-1">Educación</p>
              <p className="text-2xl font-bold text-[#00074E]">$224,800 M</p>
              <p className="text-xs text-gray-400">40.9% del total</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md">
              <p className="text-sm text-gray-500 font-medium mb-1">Salud</p>
              <p className="text-2xl font-bold text-[#00074E]">$171,200 M</p>
              <p className="text-xs text-gray-400">31.1% del total</p>
            </div>
          </div>
        </section>

        {/* FILA 4: JUSTICIA */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#00074E] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3777FF]" />
            SISTEMA DE JUSTICIA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-[#BF1363]">
              <p className="text-sm text-gray-500 font-medium">Violencia Familiar</p>
              <p className="text-xl font-bold text-[#BF1363]">55,993</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md">
              <p className="text-sm text-gray-500 font-medium">Familia</p>
              <p className="text-xl font-bold text-[#00074E]">5,089</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md">
              <p className="text-sm text-gray-500 font-medium">Penal Juvenil</p>
              <p className="text-xl font-bold text-[#00074E]">1,098</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md">
              <p className="text-sm text-gray-500 font-medium">Fiscalía</p>
              <p className="text-xl font-bold text-[#00074E]">2,058</p>
            </div>
          </div>
        </section>

        {/* ACCIONES PRIORITARIAS */}
        <section className="bg-gradient-to-r from-[#00074E] to-[#1a1a6e] rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold mb-4">🎯 ACCIONES PRIORITARIAS RECOMENDADAS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-bold text-[#FF7F11] mb-2">1. ATTENCIÓN INMEDIATA</h3>
              <ul className="space-y-1 text-sm text-white/80">
                <li>• Reforzar equipos de Violencia Familiar</li>
                <li>• Programa de apoyo matemático intensiva Q1-Q2</li>
                <li>• Prevención de embarazo adolescente</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-bold text-[#F3A712] mb-2">2. MEDIO PLAZO</h3>
              <ul className="space-y-1 text-sm text-white/80">
                <li>• Expandir coverage de Aprender a más escuelas</li>
                <li>• Fortalecer centros de salud Adolescent-friendly</li>
                <li>• Escalar programas PAICOR</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Fuentes */}
        <section className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            Fuentes: INDEC, Ministerio de Educación, DEIS, Poder Judicial Córdoba, Ministerio de Finanzas
            <br />
            Actualizado: {new Date().toLocaleDateString("es-AR")}
          </p>
        </section>
      </main>
    </div>
  );
}