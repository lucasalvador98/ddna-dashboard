'use client';

/**
 * Infancias — Barómetro de la Deuda Social de la Infancia (UCA).
 *
 * Monitoreo de derechos de NNyA (0-17 años) en áreas urbanas de Argentina.
 * Datos del Barómetro de la Deuda Social de la Infancia — UCA-ODSA (2010-2025).
 *
 * Fuente principal: https://repositorio.uca.edu.ar/bitstream/123456789/21190/4/infancia-argentina-avances.pdf
 * Cobertura: 7 dimensiones (Alimentación, Salud, Hábitat, Subsistencia,
 *   Crianza y Socialización, Educación, Información).
 *
 * NOTA: Varios indicadores de salud aún no están cargados en la DB.
 * Los valores marcados con "*" provienen del informe 2025 de la UCA
 * y se muestran como referencia hasta su carga definitiva.
 */

import { useState, useEffect } from 'react';
import {
  Users,
  Home,
  AlertCircle,
  Info,
  UtensilsCrossed,
  Stethoscope,
  Smile,
  Layers,
  TrendingDown,
  TrendingUp,
  BookOpen,
  Wifi,
} from 'lucide-react';
import { PageLoading } from '@/components/page-loading';
import { PageError } from '@/components/page-error';
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
  green: '#10B981',
};

// ─── Helpers ────────────────────────────────────────────────────

/** Busca un indicador por substring exacto en el nombre */
function findByKeyword(data: IndicadorRow[], keyword: string): IndicadorRow | undefined {
  return data.find(d => d.indicador_nombre?.toLowerCase().includes(keyword.toLowerCase()));
}

/** Busca el valor del indicador más reciente (mayor periodo) que matchee el keyword */
function findLatest(data: IndicadorRow[], keyword: string): IndicadorRow | undefined {
  const matches = data.filter(d =>
    d.indicador_nombre?.toLowerCase().includes(keyword.toLowerCase())
  );
  if (matches.length === 0) return undefined;
  return matches.reduce((a, b) => (a.periodo > b.periodo ? a : b));
}

// ─── Page Component ──────────────────────────────────────────────

export default function InfanciasPage() {
  const [ucaData, setUcaData] = useState<IndicadorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Targeted query: only fetch indicators this page actually displays.
        // The UCA-ODSA dataset has 15K+ records; a generic query hits the
        // Supabase 1000-row default limit and silently drops most indicators.
        const NEEDED_INDICATORS = [
          'Inseguridad alimentaria total (NNyA)',
          'Inseguridad alimentaria severa (NNyA)',
          'NNyA sin cuentos/historias orales en familia',
          'No festejó el ultimo cumpleaños',
          'NNyA 0-4 años que comparten cama/colchón',
          'NNyA nivel muy bajo que comparten cama/colchón',
          'NNyA sin biblioteca familiar',
          'NNyA que no leen textos impresos',
          'NNyA nivel muy bajo que no leen textos impresos',
          'NNyA en hogares con hacinamiento (pobres)',
          'NNyA sin internet en el hogar',
          'NNyA sin actividad física extraescolar (interior)',
          'NNyA en nivel muy bajo - inseguridad alimentaria severa',
        ];

        const { data, error: err } = await supabase
          .from('indicadores')
          .select('indicador_nombre, valor, periodo, desglose, fuente, region')
          .eq('categoria', 'pobreza')
          .eq('activo', true)
          .in('indicador_nombre', NEEDED_INDICATORS)
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
        <PageLoading />
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
        <PageError message={error} />
      </div>
    );
  }

  // ─── Resolve indicators from DB ────────────────────────────────

  const insegTotal = findLatest(ucaData, 'inseguridad alimentaria total (nnya)');
  const insegSevera = findLatest(ucaData, 'inseguridad alimentaria severa (nnya)');
  const sinCuentos = findLatest(ucaData, 'cuentos');
  const sinCumple = findLatest(ucaData, 'cumpleaños');
  const comparteCama04 = findLatest(ucaData, '0-4 años que comparten');
  const comparteCamaBajo = findLatest(ucaData, 'nivel muy bajo que comparten');
  const sinBiblioteca = findLatest(ucaData, 'biblioteca familiar');
  const noLeeTextos = findLatest(ucaData, 'no leen textos impresos');
  const noLeeTextosBajo = findLatest(ucaData, 'nivel muy bajo que no leen');
  const hacinamiento = findLatest(ucaData, 'hacinamiento (pobres)');
  const sinInternet = findLatest(ucaData, 'sin internet en el hogar');
  const sinActividadFisica = findLatest(ucaData, 'actividad física');
  const insegSeveraBajo = findLatest(ucaData, 'nivel muy bajo - inseguridad');

  // Hardcoded del informe 2025 de la UCA (aún no cargados en DB)
  const SALUD_SIN_ATENCION = '19.8'; // % que no asistió al médico por razones económicas
  const SALUD_SIN_ODONTOLOGO = '34.6'; // % que no asistió al odontólogo

  // ─── Content ──────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Users}
        title="Infancias"
        description="Barómetro de la Deuda Social de la Infancia — UCA-ODSA"
        color="magenta"
      />

      <TabInfancia
        insegTotal={insegTotal}
        insegSevera={insegSevera}
        sinCuentos={sinCuentos}
        sinCumple={sinCumple}
        comparteCama04={comparteCama04}
        comparteCamaBajo={comparteCamaBajo}
        sinBiblioteca={sinBiblioteca}
        noLeeTextos={noLeeTextos}
        noLeeTextosBajo={noLeeTextosBajo}
        hacinamiento={hacinamiento}
        sinInternet={sinInternet}
        sinActividadFisica={sinActividadFisica}
        insegSeveraBajo={insegSeveraBajo}
        saludSinAtencion={SALUD_SIN_ATENCION}
        saludSinOdontologo={SALUD_SIN_ODONTOLOGO}
      />
    </div>
  );
}

// ─── Tab: Infancia (UCA) ─────────────────────────────────────────

interface TabInfanciaProps {
  insegTotal: IndicadorRow | undefined;
  insegSevera: IndicadorRow | undefined;
  sinCuentos: IndicadorRow | undefined;
  sinCumple: IndicadorRow | undefined;
  comparteCama04: IndicadorRow | undefined;
  comparteCamaBajo: IndicadorRow | undefined;
  sinBiblioteca: IndicadorRow | undefined;
  noLeeTextos: IndicadorRow | undefined;
  noLeeTextosBajo: IndicadorRow | undefined;
  hacinamiento: IndicadorRow | undefined;
  sinInternet: IndicadorRow | undefined;
  sinActividadFisica: IndicadorRow | undefined;
  insegSeveraBajo: IndicadorRow | undefined;
  saludSinAtencion: string;
  saludSinOdontologo: string;
}

function TabInfancia({
  insegTotal,
  insegSevera,
  sinCuentos,
  sinCumple,
  comparteCama04,
  comparteCamaBajo,
  sinBiblioteca,
  noLeeTextos,
  noLeeTextosBajo,
  hacinamiento,
  sinInternet,
  sinActividadFisica,
  insegSeveraBajo,
  saludSinAtencion,
  saludSinOdontologo,
}: TabInfanciaProps) {
  return (
    <div className="space-y-8">
      {/* ── Contexto introductorio ────────────────────────────── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 leading-relaxed space-y-2">
            <p>
              El <strong>Barómetro de la Deuda Social de la Infancia (UCA)</strong> monitorea el
              cumplimiento de derechos de NNyA (0-17 años) en <strong>7 dimensiones</strong> desde
              2010: alimentación, salud, hábitat, subsistencia, crianza y socialización, educación,
              e información.
            </p>
            <p>
              Los datos corresponden a centros urbanos de Argentina (EDSA — Encuesta de la Deuda
              Social Argentina). Los valores de salud marcados con * provienen del informe 2025 y
              están pendientes de carga definitiva en la base de indicadores.
            </p>
          </div>
        </div>
      </div>

      {/* ── Sección 1: Alimentación ───────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#BF1363] inline-block" />
          <h2 className="font-accent text-sm text-[#BF1363] uppercase tracking-wide">
            Alimentación
          </h2>
        </div>
        <p className="font-body text-sm text-gray-600 mb-4">
          La inseguridad alimentaria mejoró respecto de los picos de 2024 gracias a la asistencia
          récord del 64.8% de hogares con NNyA, pero los niveles siguen duplicando los previos a
          2017. La brecha entre sectores es la más profunda de todas las dimensiones.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Inseguridad Alimentaria Total"
            value={insegTotal ? `${insegTotal.valor}%` : '—'}
            subtitle="Redujeron ingesta de alimentos — 2025"
            icon={UtensilsCrossed}
            color="magenta"
            change={
              insegTotal?.periodo
                ? `⬇️ vs ${insegTotal.valor > 30 ? '35.5% en 2024' : 'años anteriores'}`
                : undefined
            }
            changeType="down"
          />
          <KpiCard
            title="Inseguridad Alimentaria Severa"
            value={insegSevera ? `${insegSevera.valor}%` : '—'}
            subtitle="Pasan hambre — 2025"
            icon={AlertCircle}
            color="orange"
            change={insegSevera ? `⬇️ -3.3pp vs 2024` : undefined}
            changeType="down"
          />
          <KpiCard
            title="Inseg. Severa (nivel muy bajo)"
            value={insegSeveraBajo ? `${insegSeveraBajo.valor}%` : '—'}
            subtitle="Hogares más vulnerables — 2025"
            icon={AlertCircle}
            color="terracotta"
          />
          <KpiCard
            title="Asistencia Alimentaria"
            value="64.8%"
            subtitle="Reciben comida del Estado/comunitario"
            icon={UtensilsCrossed}
            color="green"
          />
        </div>
      </section>

      {/* ── Sección 2: Salud ──────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#E07A5F] inline-block" />
          <h2 className="font-accent text-sm text-[#E07A5F] uppercase tracking-wide">Salud</h2>
        </div>
        <p className="font-body text-sm text-gray-600 mb-4">
          El 15.7% de NNyA no realizó ninguna consulta médica en 2025 y el 34.6% no asistió al
          odontólogo. En casi 1 de cada 5 casos la razón fue económica, exponiendo barreras de
          acceso incluso en un sistema de salud formalmente gratuito. El déficit de cobertura formal
          es récord: 6 de cada 10 chicos dependen exclusivamente del sistema público.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Sin atención médica"
            value="15.7%"
            subtitle="No realizó ninguna consulta en 2025"
            icon={Stethoscope}
            color="terracotta"
          />
          <KpiCard
            title="Sin atención por dinero"
            value={`${saludSinAtencion}%`}
            subtitle="Razones económicas — 1 de cada 5"
            icon={AlertCircle}
            color="orange"
          />
          <KpiCard
            title="Sin consulta odontológica"
            value={`${saludSinOdontologo}%`}
            subtitle="No fue al odontólogo en 2025"
            icon={Smile}
            color="amber"
          />
          <KpiCard
            title="Sin odontólogo por dinero"
            value="17.4%"
            subtitle="Dejó de atenderse por falta de recursos"
            icon={AlertCircle}
            color="terracotta"
          />
        </div>
      </section>

      {/* ── Sección 3: Crianza y Socialización ────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#F3A712] inline-block" />
          <h2 className="font-accent text-sm text-[#F3A712] uppercase tracking-wide">
            Crianza y Socialización
          </h2>
        </div>
        <p className="font-body text-sm text-gray-600 mb-4">
          Las privaciones en la crianza afectan el desarrollo temprano. Casi 1 de cada 3 chicos no
          recibe estímulos de lectura oral en familia. Y 1 de cada 2 bebés de 0 a 4 años duerme en
          cama compartida, un indicador crítico de hacinamiento extremo.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Sin cuentos en familia"
            value={sinCuentos ? `${sinCuentos.valor}%` : '—'}
            subtitle="No reciben lectura oral — 2025"
            icon={BookOpen}
            color="magenta"
          />
          <KpiCard
            title="No festejó cumpleaños"
            value={sinCumple ? `${sinCumple.valor}%` : '—'}
            subtitle="2023 — mínimo histórico"
            icon={TrendingDown}
            color="orange"
            change={sinCumple ? `⬇️ vs 23.3% en 2019` : undefined}
            changeType="down"
          />
          <KpiCard
            title="Comparten cama/colchón (0-4)"
            value={comparteCama04 ? `${comparteCama04.valor}%` : '—'}
            subtitle="1 de cada 2 bebés — 2025"
            icon={AlertCircle}
            color="terracotta"
          />
          <KpiCard
            title="Comparten cama (nivel bajo)"
            value={comparteCamaBajo ? `${comparteCamaBajo.valor}%` : '—'}
            subtitle="Hogares pobres extremos — 2025"
            icon={AlertCircle}
            color="orange"
          />
        </div>
      </section>

      {/* ── Sección 4: Hábitat y Desarrollo ───────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#3777FF] inline-block" />
          <h2 className="font-accent text-sm text-[#3777FF] uppercase tracking-wide">
            Hábitat, Educación e Información
          </h2>
        </div>
        <p className="font-body text-sm text-gray-600 mb-4">
          El 42% de los NNyA vive en hogares sin cloacas, agua corriente o inodoro. 1 de cada 4
          duerme en condiciones de hacinamiento. La brecha educativa se refleja en el acceso a
          libros y lectura: 7 de cada 10 no tienen biblioteca en casa y más de la mitad no lee
          textos impresos.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Sin biblioteca familiar"
            value={sinBiblioteca ? `${sinBiblioteca.valor}%` : '—'}
            subtitle="7 de cada 10 NNyA — 2025"
            icon={Layers}
            color="navy"
          />
          <KpiCard
            title="No leen textos impresos"
            value={noLeeTextos ? `${noLeeTextos.valor}%` : '—'}
            subtitle="Más de la mitad — 2025"
            icon={BookOpen}
            color="blue"
            change={noLeeTextos ? `⬇️ vs 66.5% en pandemia` : undefined}
            changeType="down"
          />
          <KpiCard
            title="Hacinamiento (pobres)"
            value={hacinamiento ? `${hacinamiento.valor}%` : '—'}
            subtitle="5× más que hogares no pobres"
            icon={Home}
            color="orange"
          />
          <KpiCard
            title="Sin internet en casa"
            value={sinInternet ? `${sinInternet.valor}%` : '—'}
            subtitle="Brecha digital — 2025"
            icon={Wifi}
            color="blue"
            change={sinInternet ? `⬇️ -57.7pp vs 2010` : undefined}
            changeType="down"
          />
        </div>
      </section>

      {/* ── Sección 5: Desigualdad — Brechas que persisten ────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
          <h2 className="font-accent text-sm text-red-600 uppercase tracking-wide">
            Desigualdad: las brechas que persisten
          </h2>
        </div>
        <p className="font-body text-sm text-gray-600 mb-4">
          La desigualdad entre sectores no se mide solo en ingresos. Estas brechas muestran cuántas
          veces más probable es que un NNyA del nivel socioeconómico más bajo sufra una privación
          respecto de uno del nivel más alto. Son brechas que <strong>no ceden</strong> con el
          tiempo.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <UtensilsCrossed className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-accent text-red-700 font-semibold">
                  Inseguridad alimentaria severa
                </h3>
                <p className="text-3xl font-bold text-red-600 mt-2">× 28</p>
                <p className="text-xs text-red-500 mt-1 leading-relaxed">
                  Un NNyA del nivel socioeconómico más bajo tiene <strong>28 veces más</strong>{' '}
                  probabilidades de sufrir inseguridad alimentaria severa que uno del nivel
                  medio-alto (31.1% vs ~1.1%).
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-accent text-red-700 font-semibold">No lectura de textos</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">× 1.7</p>
                <p className="text-xs text-red-500 mt-1 leading-relaxed">
                  El 68.6% de NNyA del nivel muy bajo no lee textos impresos vs 41.3% del nivel
                  medio-alto. La brecha es de <strong>1.7 veces</strong>, y afecta al desarrollo
                  cognitivo y educativo.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Home className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-accent text-red-700 font-semibold">
                  Cama compartida (hacinamiento)
                </h3>
                <p className="text-3xl font-bold text-red-600 mt-2">× 3</p>
                <p className="text-xs text-red-500 mt-1 leading-relaxed">
                  El 48.8% de NNyA del nivel muy bajo comparte cama o colchón vs 16.1% en niveles
                  medios-altos. Es <strong>3 veces más</strong> frecuente, reflejando condiciones de
                  vivienda crítica.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Fuente ────────────────────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-3">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 font-body">
          <p className="mb-2">
            <strong>Fuente:</strong> Barómetro de la Deuda Social de la Infancia — UCA-ODSA
            (2010-2025). EDSA Agenda para la Equidad (2017-2025).
          </p>
          <p>
            7 dimensiones monitoreadas: Alimentación, Salud, Hábitat, Subsistencia, Crianza y
            Socialización, Educación, Información. Los valores se actualizan anualmente con la
            publicación de cada nueva ola de la EDSA.
          </p>
        </div>
      </div>
    </div>
  );
}
