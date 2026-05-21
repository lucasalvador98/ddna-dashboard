'use client';

import { Users, Heart, BookOpen, Coins, UserCircle, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { KpiCard } from '@/components/kpi-card';
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

  // Stats banner values (real data from indicators)
  const statsPoblacion = poblacion;
  const statsMortalidad = findStatValue(saludData, 'TMI Cba');
  const statsEstablecimientos = findStatSum(educacionData, 'Unidades educativas');
  const statsMatricula = findStatSum(educacionData, 'Matrícula - General');

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
                style={{ height: 'auto' }}
                className="rounded"
              />
              <Image
                src="/logos/LOGO DDNA_HORIZONTAL_COLOR.png"
                alt="DDNA"
                width={160}
                height={40}
                style={{ height: 'auto' }}
                className="object-contain"
              />
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span
                className={`w-2 h-2 rounded-full ${source === 'supabase' ? 'bg-green-500' : 'bg-amber-500'}`}
              />
              <span className="hidden sm:inline">
                {source === 'supabase' ? 'Datos en vivo' : 'Datos de referencia'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Page title */}
      <div className="bg-[#00074E]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12">
          <h1 className="font-display text-3xl lg:text-4xl text-white">Tablero de Monitoreo</h1>
          <p className="font-body text-base lg:text-lg text-white/80 mt-1">
            Defensoría de los Derechos de Niñas, Niños y Adolescentes de Córdoba
          </p>
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

        {/* Stats banner — computed from real data */}
        <section className="bg-[#00074E] rounded-xl p-6 lg:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="font-display text-2xl lg:text-3xl text-white">
                {formatStatNumber(statsPoblacion)}
              </p>
              <p className="font-accent text-xs text-white/60 mt-1">Población 0-17 años</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl lg:text-3xl text-white">
                {statsMortalidad != null ? `${statsMortalidad}‰` : '—'}
              </p>
              <p className="font-accent text-xs text-white/60 mt-1">
                Mortalidad infantil (Córdoba)
              </p>
            </div>
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
                style={{ height: 'auto' }}
                className="rounded"
              />
              <Image
                src="/logos/LOGO DDNA_HORIZONTAL_COLOR.png"
                alt="DDNA"
                width={120}
                height={32}
                style={{ height: 'auto' }}
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
