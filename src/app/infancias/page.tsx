'use client';

/**
 * Infancias — Barómetro de la Deuda Social de la Infancia (UCA).
 *
 * Monitoreo de 7 dimensiones de derechos de NNyA (0-17 años) en áreas urbanas de Argentina.
 * Datos del Barómetro de la Deuda Social de la Infancia — UCA-ODSA (2010-2025).
 */

import { useState, useEffect } from 'react';
import {
  Users,
  Home,
  AlertCircle,
  Loader2,
  Info,
  UtensilsCrossed,
  Layers,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { SectionHeader } from '@/components/section-header';
import { KpiCard } from '@/components/kpi-card';
import { supabase } from '@/lib/supabase';
import { parseDesglose } from '@/lib/parse-desglose';

// ─── Types ──────────────────────────────────────────────────────

type IndicadorRow = {
  indicador_nombre: string;
  valor: number;
  periodo: number;
  desglose: Record<string, unknown>;
  fuente: string;
  region: string;
};

// ─── Colors ─────────────────────────────────────────────────────

const COLORS = {
  magenta: '#BF1363',
  orange: '#FF7F11',
  terracotta: '#E07A5F',
  amber: '#F3A712',
  blue: '#3777FF',
  navy: '#1E3A5F',
};

// ─── Page Component ──────────────────────────────────────────────

export default function InfanciasPage() {
  const [ucaData, setUcaData] = useState<IndicadorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data, error: err } = await supabase
          .from('indicadores')
          .select('indicador_nombre, valor, periodo, desglose, fuente, region')
          .eq('categoria', 'pobreza')
          .ilike('fuente', '%UCA%')
          .eq('activo', true)
          .order('periodo', { ascending: true });

        if (err) throw err;

        if (!cancelled) {
          setUcaData(
            (data || []).map(r => ({
              ...r,
              desglose: parseDesglose(r.desglose),
            })) as IndicadorRow[]
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar datos');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          icon={Users}
          title="Infancias"
          description="Barómetro de la Deuda Social de la Infancia — UCA-ODSA"
          color="magenta"
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#BF1363] animate-spin" />
        </div>
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        <SectionHeader
          icon={Users}
          title="Infancias"
          description="Barómetro de la Deuda Social de la Infancia — UCA-ODSA"
          color="magenta"
        />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-700 font-body">Error al cargar datos: {error}</p>
        </div>
      </div>
    );
  }

  // ─── Content ──────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Users}
        title="Infancias"
        description="Barómetro de la Deuda Social de la Infancia — UCA-ODSA"
        color="magenta"
      />

      <TabInfancia ucaData={ucaData} />
    </div>
  );
}

// ─── Tab: Infancia (UCA) ─────────────────────────────────────────

function TabInfancia({ ucaData }: { ucaData: IndicadorRow[] }) {
  const findVal = (keyword: string) =>
    ucaData.find(d => d.indicador_nombre?.toLowerCase().includes(keyword.toLowerCase()));

  if (ucaData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Info className="w-12 h-12 text-gray-300 mb-4" />
        <p className="font-body text-gray-600">No hay datos de infancia disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Explanatory box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 leading-relaxed">
            <p>
              El <strong>Barómetro de la Deuda Social de la Infancia (UCA)</strong> monitorea{' '}
              <strong>7 dimensiones</strong> de derechos de NNyA (0-17 años) en áreas urbanas de
              Argentina desde 2010.
            </p>
          </div>
        </div>
      </div>

      {/* Sección 1: Alimentación */}
      <section>
        <h2 className="font-accent text-sm text-[#BF1363] uppercase tracking-wide mb-3">
          <span className="w-2 h-2 rounded-full bg-[#BF1363] inline-block mr-2" />
          Alimentación y Salud
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Inseguridad Alimentaria Total" value={`${findVal('Inseguridad alimentaria total')?.valor ?? '—'}%`} subtitle="2025 — NNyA 0-17" icon={UtensilsCrossed} color="magenta" change="⬇️ -6.7pp vs 2024" changeType="down" />
          <KpiCard title="Inseg. Alimentaria Severa" value={`${findVal('severa')?.valor ?? '—'}%`} subtitle="2025 — pasan hambre" icon={AlertCircle} color="orange" change="⬇️ -3.3pp vs 2024" changeType="down" />
          <KpiCard title="Sin cobertura de salud" value="—" subtitle="Déficit persistente (UCA)" icon={TrendingDown} color="terracotta" />
          <KpiCard title="Sin consulta odontológica" value="—" subtitle="Déficit muy elevado (UCA)" icon={TrendingDown} color="amber" />
        </div>
      </section>

      {/* Sección 2: Crianza y Socialización */}
      <section>
        <h2 className="font-accent text-sm text-[#F3A712] uppercase tracking-wide mb-3">
          <span className="w-2 h-2 rounded-full bg-[#F3A712] inline-block mr-2" />
          Crianza y Socialización
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Sin cuentos en familia" value={`${findVal('cuentos')?.valor ?? '—'}%`} subtitle="2025 — brecha por nivel social" icon={Users} color="magenta" />
          <KpiCard title="No festejó cumpleaños" value={`${findVal('cumpleaños')?.valor ?? '—'}%`} subtitle="2023 — mínimo histórico" icon={TrendingDown} color="orange" change="⬇️ vs 23.3% en 2019" changeType="down" />
          <KpiCard title="Comparte cama/colchón (0-4)" value={`${findVal('comparten cama')?.valor ?? '—'}%`} subtitle="2025 — 1 de cada 2 bebés" icon={AlertCircle} color="terracotta" />
          <KpiCard title="Comparte cama (nivel bajo)" value={`${findVal('48.8')?.valor ?? findVal('nivel muy bajo')?.valor ?? '—'}%`} subtitle="2025 — pobreza extrema" icon={AlertCircle} color="orange" />
        </div>
      </section>

      {/* Sección 3: Hábitat y Desarrollo */}
      <section>
        <h2 className="font-accent text-sm text-[#3777FF] uppercase tracking-wide mb-3">
          <span className="w-2 h-2 rounded-full bg-[#3777FF] inline-block mr-2" />
          Hábitat y Desarrollo
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Sin biblioteca familiar" value={`${findVal('biblioteca')?.valor ?? '—'}%`} subtitle="2025 — 7 de cada 10 NNyA" icon={Layers} color="navy" />
          <KpiCard title="No lee textos impresos" value={`${findVal('no leen textos')?.valor ?? '—'}%`} subtitle="2025 — post-pandemia" icon={Layers} color="blue" change="⬇️ vs 66.5% en 2021" changeType="down" />
          <KpiCard title="Hacinamiento (pobres)" value={`${findVal('hacinamiento')?.valor ?? '—'}%`} subtitle="2025 — 5× más que no pobres" icon={Home} color="orange" />
          <KpiCard title="Sin internet en casa" value={`${findVal('sin internet')?.valor ?? '—'}%`} subtitle="2025 — era 73.5% en 2010" icon={Layers} color="blue" change="⬇️ -57.7pp vs 2010" changeType="down" />
        </div>
      </section>

      {/* Sección 4: Brechas */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
        <div className="flex gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-accent text-red-700 font-semibold text-lg mb-3">Las brechas que no ceden</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/50 rounded-lg p-3 text-center">
                <p className="font-accent text-red-700 mb-1">Inseguridad alimentaria</p>
                <p className="text-2xl font-bold text-red-600">×28</p>
                <p className="text-xs text-red-500">nivel muy bajo vs medio-alto</p>
              </div>
              <div className="bg-white/50 rounded-lg p-3 text-center">
                <p className="font-accent text-red-700 mb-1">No lee textos</p>
                <p className="text-2xl font-bold text-red-600">×1.7</p>
                <p className="text-xs text-red-500">68.6% muy bajo vs 41.3% medio-alto</p>
              </div>
              <div className="bg-white/50 rounded-lg p-3 text-center">
                <p className="font-accent text-red-700 mb-1">Cama compartida</p>
                <p className="text-2xl font-bold text-red-600">×3</p>
                <p className="text-xs text-red-500">48.8% muy bajo vs 16.1% CABA</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-3">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 font-body">
          <p className="mb-2"><strong>Fuente:</strong> Barómetro de la Deuda Social de la Infancia — UCA (2010-2025).</p>
          <p>7 dimensiones: Alimentación, Salud, Hábitat, Subsistencia, Crianza y Socialización, Educación, Información.</p>
        </div>
      </div>
    </div>
  );
}
