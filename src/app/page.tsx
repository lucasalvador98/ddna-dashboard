'use client';

import { Users, Heart, BookOpen, Coins, UserCircle, AlertTriangle, FileText } from 'lucide-react';
import Link from 'next/link';
import { KpiCard } from '@/components/kpi-card';
import { SectionCard } from '@/components/section-card';
import {
  getLatestValue,
  getTimeSeries,
  calculateChange,
  getInversionTotal,
  getPoblacion0a17,
  findStatValue,
  findStatSum,
  useDashboardData,
  type Indicador,
} from '@/lib/use-dashboard-data';
import type { CategoriaIndicador } from '@/lib/supabase';

const categoryConfig = {
  pobreza: { icon: Users, color: 'magenta' as const },
  salud: { icon: Heart, color: 'terracotta' as const },
  educacion: { icon: BookOpen, color: 'amber' as const },
  inversion: { icon: Coins, color: 'terracotta' as const },
  demografia: { icon: UserCircle, color: 'navy' as const },
  seguridad: { icon: AlertTriangle, color: 'orange' as const },
};

function formatValue(valor: number | null, unidad: string): string {
  if (valor === null || valor === undefined) return '—';
  if (unidad === '%' || unidad === '‰') return `${valor}${unidad}`;
  if (unidad === 'Md') return `$${(valor / 1000000).toFixed(1)}Md`;
  if (unidad === 'hab' || unidad === 'casos' || unidad === 'alumnos')
    return valor.toLocaleString('es-AR');
  return String(valor);
}

function formatChange(cambio: number | null): string | undefined {
  if (cambio === null || cambio === undefined) return undefined;
  const prefix = cambio > 0 ? '+' : '';
  return `${prefix}${cambio.toFixed(1)}%`;
}

function formatStatNumber(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return '—';
  if (valor >= 1_000_000) {
    return `${(valor / 1_000_000).toFixed(1)} M`;
  }
  if (valor >= 1_000) {
    return valor.toLocaleString('es-AR');
  }
  return String(valor);
}

export default function HomePage() {
  const { data, loading, source } = useDashboardData();

  // Extract category arrays
  const pobrezaData = data?.pobreza || [];
  const saludData = data?.salud || [];
  const educacionData = data?.educacion || [];
  const inversionData = data?.inversion || [];
  const demografiaData = data?.demografia || [];
  const seguridadData = data?.seguridad || [];

  // Get latest indicator values per KPI
  const pobrezaInd = getLatestValue(pobrezaData, 'Pobreza infantil');
  const indigenciaInd = getLatestValue(pobrezaData, 'Indigencia infantil');
  const mortalidadInd = getLatestValue(saludData, 'TMI Cba');
  const escolarizacionInd = getLatestValue(educacionData, 'Tasa de asistencia educativa');
  const denunciasInd = getLatestValue(seguridadData, 'Total casos');
  const pobreza = pobrezaInd?.valor ?? null;
  const indigencia = indigenciaInd?.valor ?? null;
  const mortalidad = mortalidadInd?.valor ?? null;
  const escolarizacion = escolarizacionInd?.valor ?? null;
  const denuncias = denunciasInd?.valor ?? null;

  // FIXED: use child-relevant inversion sum instead of blind sum
  const inversion = getInversionTotal(inversionData);

  // FIXED: compute population 0-17 from demografia data
  const poblacion = getPoblacion0a17(demografiaData);

  // Poverty time series with FIXED indicator name
  const pobrezaSerie = getTimeSeries(pobrezaData, 'Pobreza infantil');
  const pobrezaChanges = calculateChange(pobrezaSerie);
  const cambioPobreza =
    pobrezaChanges.length > 0 ? pobrezaChanges[pobrezaChanges.length - 1].cambio : null;

  // Stats banner values (real data from indicators, non-redundant with KPIs)
  const statsEstablecimientos = findStatSum(educacionData, 'Unidades educativas');
  const statsMatricula = findStatSum(educacionData, 'Matrícula - General');
  const statsCategorias = data ? Object.keys(data).filter(k => data[k as CategoriaIndicador]?.length > 0).length : 6;
  const statsFuentes = '10';

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Page title */}
      <div className="bg-[#00074E]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl text-white">Tablero de Monitoreo</h1>
            <p className="font-body text-base lg:text-lg text-white/80 mt-1">
              Defensoría de los Derechos de Niñas, Niños y Adolescentes de Córdoba
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <span className={`w-2 h-2 rounded-full ${source === 'supabase' ? 'bg-green-400' : 'bg-amber-400'}`} />
            <span className="hidden sm:inline">
              {source === 'supabase' ? 'Datos en vivo' : 'Datos de referencia'}
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-10">
        {/* KPIs */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl text-[#00074E]">Indicadores Clave</h2>
            {source === 'supabase' && <span className="text-sm text-gray-400">Datos en vivo</span>}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7F11]" />
              <span className="ml-3 font-body text-gray-500">Cargando...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <KpiCard
                title="Pobreza infantil"
                value={formatValue(pobreza, '%')}
                subtitle="Porcentaje de NNA bajo línea de pobreza"
                change={formatChange(cambioPobreza)}
                changeType={
                  cambioPobreza !== null && cambioPobreza < 0
                    ? 'down'
                    : cambioPobreza !== null
                      ? 'up'
                      : 'neutral'
                }
                icon={categoryConfig.pobreza.icon}
                color={categoryConfig.pobreza.color}
              />

              <KpiCard
                title="Mortalidad infantil"
                value={formatValue(mortalidad, '‰')}
                subtitle="por cada 1000 nacidos vivos"
                icon={categoryConfig.salud.icon}
                color={categoryConfig.salud.color}
              />

              <KpiCard
                title="Escolarización"
                value={formatValue(escolarizacion, '%')}
                subtitle="Tasa de asistencia educativa"
                icon={categoryConfig.educacion.icon}
                color={categoryConfig.educacion.color}
              />

              <KpiCard
                title="Población 0-17 años"
                value={formatValue(poblacion, 'hab')}
                subtitle="Censo 2022 - Córdoba"
                icon={categoryConfig.demografia.icon}
                color={categoryConfig.demografia.color}
              />

              <KpiCard
                title="Denuncias"
                value={formatValue(denuncias, 'casos')}
                subtitle="Registrado en el último período"
                icon={categoryConfig.seguridad.icon}
                color={categoryConfig.seguridad.color}
              />

              <KpiCard
                title="Inversión social"
                value={formatValue(inversion, 'Md')}
                subtitle="Destinado a infancia y adolescencia"
                icon={categoryConfig.inversion.icon}
                color={categoryConfig.inversion.color}
              />
            </div>
          )}
        </section>

        {/* Stats banner — complementary metrics */}
        <section className="bg-[#00074E] rounded-xl p-6 lg:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="font-display text-2xl lg:text-3xl text-white">
                {formatStatNumber(statsEstablecimientos)}
              </p>
              <p className="font-accent text-xs text-white/60 mt-1">Establecimientos educativos</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl lg:text-3xl text-white">
                {formatStatNumber(statsMatricula)}
              </p>
              <p className="font-accent text-xs text-white/60 mt-1">Matrícula escolar</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl lg:text-3xl text-white">
                {statsCategorias}
              </p>
              <p className="font-accent text-xs text-white/60 mt-1">Categorías de indicadores</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl lg:text-3xl text-white">
                {statsFuentes}
              </p>
              <p className="font-accent text-xs text-white/60 mt-1">Fuentes de datos</p>
            </div>
          </div>
        </section>

        {/* Executive Report CTA */}
        <section className="mt-8">
          <Link
            href="/ejecutivo"
            target="_blank"
            className="flex items-center justify-between w-full px-6 py-5 bg-gradient-to-r from-[#00074E] to-[#1a1a6e] rounded-xl hover:shadow-xl hover:scale-[1.01] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-accent text-lg text-white font-semibold">Informe Ejecutivo</p>
                <p className="text-sm text-white/70 font-body">Análisis general con indicadores clave, alertas y recomendaciones</p>
              </div>
            </div>
            <span className="text-white/60 text-sm font-accent hidden sm:inline">Abrir → Ctrl+P para PDF</span>
          </Link>
        </section>

        {/* Quick access to sections */}
        <section className="mt-8">
          <h2 className="font-display text-xl text-[#00074E] mb-4">Explorar por tema</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SectionCard title="Salud" description="Mortalidad infantil, materna y neonatal" href="/salud" icon={Heart} color="terracotta" />
            <SectionCard title="Educación" description="Asistencia, matrícula, unidades educativas" href="/educacion" icon={BookOpen} color="amber" />
            <SectionCard title="Pobreza" description="Pobreza e indigencia infantil y por hogares" href="/pobreza" icon={Users} color="magenta" />
            <SectionCard title="Seguridad" description="Casos de niñez, violencia familiar y justicia" href="/seguridad" icon={AlertTriangle} color="orange" />
            <SectionCard title="Inversión Social" description="Presupuesto provincial destinado a niñez" href="/inversion" icon={Coins} color="terracotta" />
            <SectionCard title="Repositorio" description="Documentos, informes y bibliografía DDNA" href="/repositorio" icon={BookOpen} color="navy" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/logos/Cba.png"
                alt="Gobierno de Córdoba"
                width={32}
                height={32}
                className="rounded"
              />
              <img
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
