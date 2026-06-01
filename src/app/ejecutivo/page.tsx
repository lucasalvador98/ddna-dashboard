"use client";

import {
  AlertTriangle,
  Users,
  TrendingUp,
  BookOpen,
  Heart,
  Coins,
  Scale,
  Baby,
  Loader2,
} from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { SectionHeader } from "@/components/section-header";
import {
  useDashboardData,
  findStatValue,
  findStatSum,
  getInversionTotal,
} from "@/lib/use-dashboard-data";
import type { Indicador } from "@/lib/use-dashboard-data";

// ─── Format helpers ────────────────────────────────────────────────────────────

function fmtPercent(val: number | null, fallback: string): string {
  if (val == null) return fallback;
  return `${val.toFixed(1)}%`;
}

function fmtNumber(val: number | null, fallback: string): string {
  if (val == null) return fallback;
  return val.toLocaleString("es-AR");
}

function fmtCurrency(val: number | null, fallback: string): string {
  if (val == null) return fallback;
  return `$${val.toLocaleString("es-AR")} M`;
}

function fmtPerMille(val: number | null, fallback: string): string {
  if (val == null) return fallback;
  return `${val.toFixed(1)}‰`;
}

// Sum inversion rows for a given keyword within CHILD_RELEVANT_CATEGORIES
function sumInversionByKeyword(inversionData: Indicador[], keyword: string): number {
  if (!inversionData || inversionData.length === 0) return 0;

  const sorted = [...inversionData].sort((a, b) => b.periodo.localeCompare(a.periodo));
  const latestPeriod = sorted[0]?.periodo;
  if (!latestPeriod) return 0;

  const keywordLower = keyword.toLowerCase();
  return inversionData
    .filter((ind) => {
      if (ind.periodo !== latestPeriod) return false;
      const cat = String(ind.desglose?.categoria ?? "").toLowerCase();
      return cat.includes(keywordLower);
    })
    .reduce((sum, ind) => sum + Number(ind.valor || 0), 0);
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ExecutiveDashboard() {
  const { data: dashboardData, loading } = useDashboardData();

  // ── Compute KPIs from dashboard data ──────────────────────────────────────

  const violenciaFamiliar =
    findStatValue(dashboardData?.seguridad ?? [], "Violencia Familiar") ?? null;

  const pobrezaInfantil =
    findStatValue(dashboardData?.pobreza ?? [], "Pobreza infantil") ?? null;

  const mortalidadInfantil =
    findStatValue(dashboardData?.salud ?? [], "TMI Cba") ?? null;

  const escolarizacion =
    findStatValue(dashboardData?.educacion ?? [], "asistencia educativa") ?? null;

  const matriculaTotal = findStatSum(dashboardData?.educacion ?? [], "Matricula");

  const sectorPublicoPct =
    findStatValue(dashboardData?.educacion ?? [], "estatal") ?? null;

  const inversionTotal = getInversionTotal(dashboardData?.inversion ?? []);

  const inversionEducacion = sumInversionByKeyword(
    dashboardData?.inversion ?? [],
    "educación"
  );

  const inversionSalud = sumInversionByKeyword(
    dashboardData?.inversion ?? [],
    "salud"
  ) || sumInversionByKeyword(dashboardData?.inversion ?? [], "materno");

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          icon={Scale}
          title="Estado de Niñez, Adolescencia y Familia"
          description="Indicadores clave para la toma de decisiones — Provincia de Córdoba"
          color="navy"
        />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`@media print { aside, header, .print\\:hidden { display: none !important; } body { background: white !important; } }`}</style>
      <div className="space-y-6 print:space-y-4">
      <SectionHeader
        icon={Scale}
        title="Estado de Niñez, Adolescencia y Familia"
        description="Indicadores clave para la toma de decisiones — Provincia de Córdoba"
        color="navy"
      />

      {/* Print button */}
      <div className="flex justify-end print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-[#00074E] text-white rounded-lg hover:bg-[#1a1a6e] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* Alertas críticas */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-accent text-red-700 font-semibold">
            Puntos de Atención Crítica
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-red-600 font-body">
            <li>
              • <strong>Violencia Familiar:</strong>{" "}
              {fmtNumber(violenciaFamiliar, "55,993")} casos registrados
            </li>
            <li>
              • <strong>Matemática Q1-Q2:</strong> +65% de estudiantes bajo nivel
              básico
            </li>
            <li>
              • <strong>Embarazo adolescente:</strong> Tendencia en aumento
            </li>
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
          <KpiCard
            title="Violencia Familiar"
            value={fmtNumber(violenciaFamiliar, "55,993")}
            subtitle="casos (último período)"
            icon={AlertTriangle}
            color="magenta"
          />
          <KpiCard
            title="Pobreza Infantil"
            value={fmtPercent(pobrezaInfantil, "52.9%")}
            subtitle="población 0-17 años"
            icon={Users}
            color="magenta"
          />
          <KpiCard
            title="Mortalidad Infantil"
            value={fmtPerMille(mortalidadInfantil, "7.2‰")}
            subtitle="por mil nacidos vivos"
            icon={Baby}
            color="terracotta"
          />
          <KpiCard
            title="Escolarización"
            value={fmtPercent(escolarizacion, "89.1%")}
            subtitle="tasa neta de asistencia"
            icon={BookOpen}
            color="amber"
          />
        </div>
      </section>

      {/* Educación */}
      <section>
        <h2 className="font-accent text-sm text-[#F3A712] uppercase tracking-wide mb-3">
          <span className="w-2 h-2 rounded-full bg-[#F3A712] inline-block mr-2" />
          Educación
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            title="Matrícula Total"
            value={fmtNumber(matriculaTotal, "887,014")}
            subtitle="alumnos (último período)"
            icon={BookOpen}
            color="navy"
          />
          <KpiCard
            title="Sector Público"
            value={fmtPercent(sectorPublicoPct, "64.5%")}
            subtitle="de la matrícula total"
            icon={TrendingUp}
            color="blue"
          />
          <KpiCard
            title="Aprender Matemática"
            value="71.1%"
            subtitle="Q1 bajo nivel básico"
            icon={AlertTriangle}
            color="magenta"
          />
        </div>
      </section>

      {/* Inversión Social */}
      <section>
        <h2 className="font-accent text-sm text-[#10B981] uppercase tracking-wide mb-3">
          <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block mr-2" />
          Inversión Social
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            title="Inversión Total"
            value={fmtCurrency(inversionTotal, "$549,519 M")}
            subtitle="en infancia (último período)"
            icon={Coins}
            color="green"
          />
          <KpiCard
            title="Educación"
            value={
              inversionEducacion > 0
                ? fmtCurrency(inversionEducacion, "$224,800 M")
                : "$224,800 M"
            }
            subtitle={
              inversionTotal > 0 && inversionEducacion > 0
                ? `${((inversionEducacion / inversionTotal) * 100).toFixed(1)}% del total`
                : "40.9% del total"
            }
            icon={BookOpen}
            color="navy"
          />
          <KpiCard
            title="Salud"
            value={
              inversionSalud > 0
                ? fmtCurrency(inversionSalud, "$171,200 M")
                : "$171,200 M"
            }
            subtitle={
              inversionTotal > 0 && inversionSalud > 0
                ? `${((inversionSalud / inversionTotal) * 100).toFixed(1)}% del total`
                : "31.1% del total"
            }
            icon={Heart}
            color="terracotta"
          />
        </div>
      </section>

      {/* Sistema de Justicia */}
      <section>
        <h2 className="font-accent text-sm text-[#3777FF] uppercase tracking-wide mb-3">
          <span className="w-2 h-2 rounded-full bg-[#3777FF] inline-block mr-2" />
          Sistema de Justicia
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Violencia Familiar"
            value="55,993"
            subtitle="casos"
            icon={AlertTriangle}
            color="magenta"
          />
          <KpiCard title="Familia" value="5,089" subtitle="casos" icon={Users} color="navy" />
          <KpiCard
            title="Penal Juvenil"
            value="1,098"
            subtitle="casos"
            icon={Scale}
            color="navy"
          />
          <KpiCard title="Fiscalía" value="2,058" subtitle="casos" icon={Scale} color="navy" />
        </div>
      </section>

      {/* Acciones Prioritarias */}
      <section className="bg-gradient-to-r from-[#00074E] to-[#1a1a6e] rounded-xl p-6 text-white">
        <h2 className="font-display text-xl mb-4">Acciones Prioritarias Recomendadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-accent font-bold text-[#FF7F11] mb-2">
              1. Atención Inmediata
            </h3>
            <ul className="space-y-1 text-sm text-white/80 font-body">
              <li>• Reforzar equipos de Violencia Familiar</li>
              <li>• Programa de apoyo matemático intensiva Q1-Q2</li>
              <li>• Prevención de embarazo adolescente</li>
            </ul>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-accent font-bold text-[#F3A712] mb-2">
              2. Mediano Plazo
            </h3>
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
          Fuentes: INDEC, Ministerio de Educación, DEIS, Poder Judicial Córdoba,
          Ministerio de Finanzas
          <br />
          Actualizado: {new Date().toLocaleDateString("es-AR")}
        </p>
      </section>
    </div>
    </>
  );
}
