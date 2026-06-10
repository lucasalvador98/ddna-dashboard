'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Home,
  PersonStanding,
  AlertCircle,
  Loader2,
  Info,
  Briefcase,
  UtensilsCrossed,
  Layers,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { SectionHeader } from '@/components/section-header';
import { KpiCard } from '@/components/kpi-card';
import { ChartCard } from '@/components/charts/chart-card';
import { supabase } from '@/lib/supabase';
import { parseDesglose } from '@/lib/parse-desglose';
import { INDICATOR_NAMES } from '@/lib/indicator-names';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';

// ─── Types ──────────────────────────────────────────────────────
type IndicadorRow = {
  indicador_nombre: string;
  valor: number;
  periodo: number;
  desglose: Record<string, unknown>;
  fuente: string;
  region: string;
};

type TabId = 'ingresos' | 'multidimensional' | 'infancia';

const TABS: { id: TabId; label: string }[] = [
  { id: 'ingresos', label: 'Ingresos (INDEC)' },
  { id: 'multidimensional', label: 'Multidimensional (UCA)' },
  { id: 'infancia', label: 'Infancia (UCA)' },
];

// ─── Constants ──────────────────────────────────────────────────
const COLORS = {
  magenta: '#BF1363',
  terracotta: '#E07A5F',
  amber: '#F3A712',
  orange: '#FF7F11',
  blue: '#3777FF',
  green: '#10B981',
  purple: '#8B5CF6',
};

const INDEC_FUENTE = 'EPH-INDEC / datos.gob.ar';

// TODO: Replace hardcoded DIMENSIONES_UCA values with real data from indicadores table
//       (categoria='pobreza', fuente ~ 'UCA'). Each dimension should come from its own
//       indicador_nombre in the DB. The current values are approximate estimates based on
//       UCA-ODSA historical reports and should be validated before production use.
const DIMENSIONES_UCA = [
  {
    dimension: 'Déficit en alimentación y salud',
    valor: 26.6,
    fill: '#BF1363',
    desc: '% de hogares',
  },
  { dimension: 'Déficit en servicios básicos', valor: 30, fill: '#E07A5F', desc: '% de hogares' },
  { dimension: 'Déficit en vivienda digna', valor: 25, fill: '#F3A712', desc: '% de hogares' },
  { dimension: 'Déficit en medio ambiente', valor: 40, fill: '#FF7F11', desc: '% de hogares' },
  { dimension: 'Déficit en acceso a educación', valor: 20, fill: '#3777FF', desc: '% de hogares' },
  {
    dimension: 'Déficit en empleo y seg. social',
    valor: 35,
    fill: '#10B981',
    desc: '% de hogares',
  },
];

// ─── Helpers ────────────────────────────────────────────────────
function fmt(val?: number | null): string {
  if (val == null || isNaN(val)) return 'N/D';
  return `${val.toFixed(1)}%`;
}

function calcChange(curr?: number, prev?: number) {
  if (curr == null || prev == null || prev === 0) return null;
  const diff = curr - prev;
  return {
    label: `${diff > 0 ? '+' : ''}${diff.toFixed(1)} pp`,
    up: diff > 0,
  };
}

function periodoLabel(p: number, desglose: Record<string, unknown>): string {
  const semestre = desglose?.semestre;
  if (semestre === 1) return `1° sem ${p}`;
  if (semestre === 2) return `2° sem ${p}`;
  return String(p);
}

/** Safely extract semestre as number from desglose (which is Record<string, unknown>) */
function getSemestre(d: IndicadorRow): number {
  return Number(d.desglose?.semestre ?? 0);
}

// ─── Page Component ─────────────────────────────────────────────
export default function PobrezaPage() {
  const [tab, setTab] = useState<TabId>('ingresos');
  const [indecData, setIndecData] = useState<IndicadorRow[]>([]);
  const [ucaData, setUcaData] = useState<IndicadorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [indecRes, ucaRes] = await Promise.all([
          supabase
            .from('indicadores')
            .select('indicador_nombre, valor, periodo, desglose, fuente, region')
            .eq('categoria', 'pobreza')
            .eq('fuente', INDEC_FUENTE)
            .eq('activo', true)
            .order('periodo', { ascending: true }),
          supabase
            .from('indicadores')
            .select('indicador_nombre, valor, periodo, desglose, fuente, region')
            .eq('categoria', 'pobreza')
            .ilike('fuente', '%UCA%')
            .eq('activo', true)
            .order('periodo', { ascending: true }),
        ]);

        if (indecRes.error) throw indecRes.error;
        if (ucaRes.error) throw ucaRes.error;

        if (!cancelled) {
          setIndecData(
            (indecRes.data || []).map(r => ({
              ...r,
              desglose: parseDesglose(r.desglose),
            })) as IndicadorRow[]
          );
          setUcaData(
            (ucaRes.data || []).map(r => ({
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
          title="Pobreza e Indigencia"
          description="Medición por ingresos (INDEC) y multidimensional (UCA-ODSA)"
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
          title="Pobreza e Indigencia"
          description="Medición por ingresos (INDEC) y multidimensional (UCA-ODSA)"
          color="magenta"
        />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="font-body text-gray-700 mb-2">Error al cargar los datos</p>
          <p className="text-sm text-gray-400 mb-5 max-w-md">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-[#BF1363] text-white rounded-lg text-sm font-medium hover:bg-[#a01052] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ─── Empty state ──────────────────────────────────────────────
  const hasIndec = indecData.length > 0;
  const hasUca = ucaData.length > 0;

  if (!hasIndec && !hasUca) {
    return (
      <div className="space-y-6">
        <SectionHeader
          icon={Users}
          title="Pobreza e Indigencia"
          description="Medición por ingresos (INDEC) y multidimensional (UCA-ODSA)"
          color="magenta"
        />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Info className="w-12 h-12 text-gray-300 mb-4" />
          <p className="font-body text-gray-600">No hay datos disponibles</p>
          <p className="text-sm text-gray-400 mt-1">
            Los datos de pobreza aún no se han cargado en la base.
          </p>
        </div>
      </div>
    );
  }

  // ─── INDEC processed data ─────────────────────────────────────
  // Get all data points for an indicator — no semester filter, all periods
  const indecGetAll = (indicatorName: string) => {
    return indecData
      .filter(r => r.indicador_nombre === indicatorName)
      .map(r => ({ year: r.periodo, semestre: Number(r.desglose?.semestre) || 0, valor: r.valor }));
  };

  const phAll = indecGetAll(INDICATOR_NAMES.POBREZA_HOGARES);
  const ppAll = indecGetAll(INDICATOR_NAMES.POBREZA_PERSONAS);

  // Build sorted unique period labels (year + semester)
  const periodSet = new Map<string, { year: number; semestre: number; label: string }>();
  for (const d of [...phAll, ...ppAll]) {
    const key = `${d.year}-${d.semestre}`;
    if (!periodSet.has(key)) {
      periodSet.set(key, {
        year: d.year,
        semestre: d.semestre,
        label: periodoLabel(d.year, { semestre: d.semestre || undefined }),
      });
    }
  }

  const sortedPeriods = [...periodSet.values()].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.semestre - b.semestre
  );

  const evoChartData = sortedPeriods.map(p => ({
    label: p.label,
    Hogares: phAll.find(d => d.year === p.year && d.semestre === p.semestre)?.valor ?? undefined,
    Personas: ppAll.find(d => d.year === p.year && d.semestre === p.semestre)?.valor ?? undefined,
  }));

  // Latest KPIs (INDEC)
  const getLatest = (name: string, semestre?: number) => {
    let filtered = indecData
      .filter(r => r.indicador_nombre === name)
      .sort((a, b) => b.periodo - a.periodo);
    if (semestre !== undefined) filtered = filtered.filter(r => r.desglose?.semestre === semestre);
    return filtered[0];
  };

  const getPrev = (name: string, latestPeriodo: number, semestre?: number) => {
    const candidates = indecData.filter(r => {
      if (r.indicador_nombre !== name) return false;
      const rPeriodo = Number(r.periodo);
      if (isNaN(rPeriodo)) return false;

      if (semestre !== undefined && r.desglose?.semestre !== undefined) {
        // Same year, earlier semestre (e.g. S1 when latest is S2)
        if (rPeriodo === latestPeriodo && getSemestre(r) < semestre) return true;
        // Earlier year, any semestre
        if (rPeriodo < latestPeriodo) return true;
        return false;
      }

      // No semestre: just find the previous period
      return rPeriodo < latestPeriodo;
    });

    // Sort by period desc, then by semestre desc
    candidates.sort((a, b) => {
      const pDiff = Number(b.periodo) - Number(a.periodo);
      if (pDiff !== 0) return pDiff;
      return getSemestre(b) - getSemestre(a);
    });

    return candidates.length > 0 ? candidates[0] : undefined;
  };

  const latestPH = getLatest(INDICATOR_NAMES.POBREZA_HOGARES);
  const latestPP = getLatest(INDICATOR_NAMES.POBREZA_PERSONAS);
  const latestDesempleo = getLatest(INDICATOR_NAMES.TASA_DESEMPLEO);

  const prevPH = latestPH
    ? getPrev(
        INDICATOR_NAMES.POBREZA_HOGARES,
        latestPH.periodo,
        Number(latestPH.desglose?.semestre)
      )
    : undefined;
  const prevPP = latestPP
    ? getPrev(
        INDICATOR_NAMES.POBREZA_PERSONAS,
        latestPP.periodo,
        Number(latestPP.desglose?.semestre)
      )
    : undefined;

  const changePH = calcChange(latestPH?.valor, prevPH?.valor);
  const changePP = calcChange(latestPP?.valor, prevPP?.valor);

  // Table data: last 5 periods (both indicators)
  // TODO: table semestre cardinality — currently takes latest semestre per year.
  // Business decision needed: show BOTH semesters as separate rows or just latest?
  const allPeriods = [...new Set(indecData.map(r => r.periodo))].sort((a, b) => b - a).slice(0, 5);
  const tableRows = allPeriods.map(p => {
    // Sort by semestre DESC so latest semestre per year wins
    const ph = indecData
      .filter(r => r.indicador_nombre === INDICATOR_NAMES.POBREZA_HOGARES && r.periodo === p)
      .sort((a, b) => getSemestre(b) - getSemestre(a))[0];
    const pp = indecData
      .filter(r => r.indicador_nombre === INDICATOR_NAMES.POBREZA_PERSONAS && r.periodo === p)
      .sort((a, b) => getSemestre(b) - getSemestre(a))[0];
    return {
      periodo: periodoLabel(p, ph?.desglose ?? pp?.desglose ?? {}),
      ph: fmt(ph?.valor),
      pp: fmt(pp?.valor),
    };
  });

  // ─── UCA processed data ───────────────────────────────────────
  const ucaLatest = (name: string) => {
    return ucaData
      .filter(r => r.indicador_nombre === name)
      .sort((a, b) => b.periodo - a.periodo)[0];
  };

  const ucMonetaria = ucaLatest(INDICATOR_NAMES.POBREZA_MONETARIA_PERSONAS);
  const ucIndigencia = ucaLatest(INDICATOR_NAMES.INDIGENCIA_PERSONAS);
  const ucInseguridad = ucaLatest(INDICATOR_NAMES.INSEGURIDAD_ALIMENTARIA_TOTAL);
  const ucMultidimensional = ucaLatest(INDICATOR_NAMES.POBREZA_MULTIDIMENSIONAL);

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Users}
        title="Pobreza e Indigencia"
        description="Indicadores de condiciones socioeconómicas — Córdoba (EPH-INDEC & UCA-ODSA). Medición por ingresos y enfoque multidimensional de derechos."
        color="magenta"
      />

      {/* ── Tab navigation ────────────────────────────────── */}
      <nav className="flex gap-1 bg-gray-100 rounded-lg p-1" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-white text-[#1a2556] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* ── Tab 1: Pobreza por Ingresos (INDEC) ────────────── */}
      {tab === 'ingresos' && (
        <TabIngresos
          indecData={indecData}
          latestPH={latestPH}
          latestPP={latestPP}
          latestDesempleo={latestDesempleo}
          changePH={changePH}
          changePP={changePP}
          evoChartData={evoChartData}
          tableRows={tableRows}
        />
      )}

      {/* ── Tab 2: Pobreza Multidimensional (UCA) ──────────── */}
      {tab === 'multidimensional' && (
        <TabMultidimensional
          ucaData={ucaData}
          ucMonetaria={ucMonetaria}
          ucIndigencia={ucIndigencia}
          ucInseguridad={ucInseguridad}
          ucMultidimensional={ucMultidimensional}
        />
      )}

      {/* ── Tab 3: Infancia (UCA) ──────────────────────────── */}
      {tab === 'infancia' && <TabInfancia ucaData={ucaData} />}
    </div>
  );
}

// ─── Tab 1: Ingresos ─────────────────────────────────────────────
function TabIngresos({
  indecData,
  latestPH,
  latestPP,
  latestDesempleo,
  changePH,
  changePP,
  evoChartData,
  tableRows,
}: {
  indecData: IndicadorRow[];
  latestPH?: IndicadorRow;
  latestPP?: IndicadorRow;
  latestDesempleo?: IndicadorRow;
  changePH: ReturnType<typeof calcChange>;
  changePP: ReturnType<typeof calcChange>;
  evoChartData: { label: string; Hogares?: number; Personas?: number }[];
  tableRows: { periodo: string; ph: string; pp: string }[];
}) {
  if (indecData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Info className="w-12 h-12 text-gray-300 mb-4" />
        <p className="font-body text-gray-600">No hay datos disponibles</p>
        <p className="text-sm text-gray-400 mt-1">
          Los datos de INDEC para Córdoba no están disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Pobreza Hogares"
          value={fmt(latestPH?.valor)}
          subtitle={latestPH ? `${periodoLabel(latestPH.periodo, latestPH.desglose)}` : 'Sin datos'}
          change={changePH?.label}
          changeType={changePH ? (changePH.up ? 'up' : 'down') : 'neutral'}
          icon={Home}
          color="magenta"
        />
        <KpiCard
          title="Pobreza Personas"
          value={fmt(latestPP?.valor)}
          subtitle={latestPP ? `${periodoLabel(latestPP.periodo, latestPP.desglose)}` : 'Sin datos'}
          change={changePP?.label}
          changeType={changePP ? (changePP.up ? 'up' : 'down') : 'neutral'}
          icon={PersonStanding}
          color="magenta"
        />
        <KpiCard
          title="Indigencia Hogares"
          value={fmt(
            indecData
              .filter(r => r.indicador_nombre === INDICATOR_NAMES.INDIGENCIA_HOGARES)
              .sort((a, b) => b.periodo - a.periodo)[0]?.valor
          )}
          subtitle={
            indecData
              .filter(r => r.indicador_nombre === INDICATOR_NAMES.INDIGENCIA_HOGARES)
              .sort((a, b) => b.periodo - a.periodo)[0]
              ? periodoLabel(
                  indecData
                    .filter(r => r.indicador_nombre === INDICATOR_NAMES.INDIGENCIA_HOGARES)
                    .sort((a, b) => b.periodo - a.periodo)[0]!.periodo,
                  indecData
                    .filter(r => r.indicador_nombre === INDICATOR_NAMES.INDIGENCIA_HOGARES)
                    .sort((a, b) => b.periodo - a.periodo)[0]!.desglose
                )
              : 'Sin datos'
          }
          icon={Home}
          color="terracotta"
        />
        <KpiCard
          title="Desempleo Gran Córdoba"
          value={fmt(latestDesempleo?.valor)}
          subtitle={
            latestDesempleo
              ? `${periodoLabel(latestDesempleo.periodo, latestDesempleo.desglose)}`
              : 'Sin datos'
          }
          icon={Briefcase}
          color="amber"
        />
      </div>

      {/* Chart: Evolución */}
      <ChartCard
        title="Evolución de la Pobreza — Córdoba (2016-2025)"
        subtitle="Porcentaje de hogares y personas bajo la línea de pobreza. Se muestran todos los semestres disponibles."
        color="magenta"
        fuente={INDEC_FUENTE}
      >
        {evoChartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
            No hay datos de evolución disponibles
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={evoChartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#4D4D4D', fontSize: 12 }}
                tickLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                tick={{ fill: '#4D4D4D', fontSize: 12 }}
                tickLine={{ stroke: '#E5E7EB' }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFF',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
                formatter={value => [`${value ?? '—'}%`, '']}
              />
              <Legend />
              <Bar
                dataKey="Personas"
                fill={COLORS.magenta}
                radius={[4, 4, 0, 0]}
                name="Pobreza Personas"
              />
              <Bar
                dataKey="Hogares"
                fill={COLORS.terracotta}
                radius={[4, 4, 0, 0]}
                name="Pobreza Hogares"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Table: Latest 5 periods */}
      <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
        <div className="p-5 border-b border-[#E0E0E0]">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: COLORS.magenta }} />
            <h3 className="font-display text-lg text-[#1a2556]">Últimos Períodos</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-600">Período</th>
                <th className="px-5 py-3 font-medium text-gray-600 text-right">Pobreza Hogares</th>
                <th className="px-5 py-3 font-medium text-gray-600 text-right">Pobreza Personas</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-700">{row.periodo}</td>
                  <td className="px-5 py-3 text-right text-gray-700">{row.ph}</td>
                  <td className="px-5 py-3 text-right text-gray-700">{row.pp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-100">
          Fuente: {INDEC_FUENTE}
        </div>
      </div>
    </div>
  );
}

// ─── Tab 2: Multidimensional ─────────────────────────────────────
function TabMultidimensional({
  ucaData,
  ucMonetaria,
  ucIndigencia,
  ucInseguridad,
  ucMultidimensional,
}: {
  ucaData: IndicadorRow[];
  ucMonetaria?: IndicadorRow;
  ucIndigencia?: IndicadorRow;
  ucInseguridad?: IndicadorRow;
  ucMultidimensional?: IndicadorRow;
}) {
  if (ucaData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Info className="w-12 h-12 text-gray-300 mb-4" />
        <p className="font-body text-gray-600">No hay datos disponibles</p>
        <p className="text-sm text-gray-400 mt-1">
          Los datos de UCA-ODSA aún no están disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Explanatory box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 leading-relaxed">
            <p>
              La <strong>UCA-ODSA</strong> mide la pobreza desde un{' '}
              <strong>enfoque de derechos</strong>. No solo ingresos: evalúa{' '}
              <strong>6 dimensiones</strong> del desarrollo humano (alimentación, servicios,
              vivienda, ambiente, educación, empleo).
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Pobreza Monetaria"
          value={fmt(ucMonetaria?.valor)}
          subtitle={ucMonetaria ? `${ucMonetaria.periodo} — Argentina urbana` : 'Sin datos'}
          icon={PersonStanding}
          color="magenta"
        />
        <KpiCard
          title="Indigencia"
          value={fmt(ucIndigencia?.valor)}
          subtitle={ucIndigencia ? `${ucIndigencia.periodo} — Argentina urbana` : 'Sin datos'}
          icon={TrendingDown}
          color="terracotta"
        />
        <KpiCard
          title="Inseguridad Alimentaria"
          value={fmt(ucInseguridad?.valor)}
          subtitle={ucInseguridad ? `${ucInseguridad.periodo} — Total país` : 'Sin datos'}
          icon={UtensilsCrossed}
          color="orange"
        />
        <KpiCard
          title="Pobreza Multidimensional"
          value={fmt(ucMultidimensional?.valor)}
          subtitle={
            ucMultidimensional ? `${ucMultidimensional.periodo} — 2+ carencias` : 'Sin datos'
          }
          icon={Layers}
          color="amber"
        />
      </div>

      {/* Chart: Dimensiones */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800 leading-relaxed">
            <p className="font-medium">
              Aviso: datos de dimensiones no disponibles en la base de datos
            </p>
            <p className="mt-1">
              Los valores de las dimensiones que se muestran a continuación son{' '}
              <strong>estimaciones aproximadas</strong> basadas en informes históricos de UCA-ODSA,
              no datos extraídos de la base. La evolución por dimensión no está disponible
              actualmente en el sistema. Se requiere carga de datos desde los informes completos.
            </p>
          </div>
        </div>
      </div>
      <ChartCard
        title="Dimensiones de la Pobreza Estructural"
        subtitle="% de hogares con déficit en cada dimensión (valores estimados según UCA-ODSA 2010-2024). Cada barra indica el porcentaje de hogares urbanos que no accede adecuadamente a ese derecho."
        color="magenta"
        fuente="UCA-ODSA (EDSA)"
      >
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            layout="vertical"
            data={DIMENSIONES_UCA}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#4D4D4D', fontSize: 12 }}
              tickLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(v: number) => `${v}%`}
            />
            <YAxis
              dataKey="dimension"
              type="category"
              tick={{ fill: '#4D4D4D', fontSize: 12 }}
              tickLine={false}
              width={160}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFF',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                fontSize: '13px',
              }}
              formatter={value => [`${value ?? '—'}%`, '']}
            />
            <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
              {DIMENSIONES_UCA.map((d, i) => (
                <Cell key={`uca-cell-${i}`} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 text-center mt-4">
          Valores estimados según metodología UCA-ODSA. Datos exactos en informe completo.
        </p>
        <p className="text-xs text-gray-400 text-center mt-2">
          Los datos de evolución por dimensión están disponibles en el informe completo de UCA-ODSA.
        </p>
      </ChartCard>

      {/* Context Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-[#F3A712] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900 leading-relaxed">
            <p>
              La UCA mide <strong>pobreza multidimensional</strong>: no solo ingreso, sino también
              acceso a derechos (alimentación, salud, vivienda, educación, empleo). El{' '}
              <strong>{fmt(ucInseguridad?.valor)}</strong> de personas sufre inseguridad alimentaria
              — incluso el <strong>26.7%</strong> de quienes <em>NO</em> son pobres por ingreso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 3: Infancia (UCA) ─────────────────────────────────────────
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Inseguridad Alimentaria Total"
          value={`${findVal('Inseguridad alimentaria total')?.valor ?? '—'}%`}
          subtitle="2025 — NNyA 0-17 (UCA)"
          icon={UtensilsCrossed}
          color="magenta"
          change="⬇️ -6.7pp vs 2024"
          changeType="down"
        />
        <KpiCard
          title="Inseg. Alimentaria Severa"
          value={`${findVal('severa')?.valor ?? '—'}%`}
          subtitle="2025 — pasan hambre"
          icon={AlertCircle}
          color="orange"
          change="⬇️ -3.3pp vs 2024"
          changeType="down"
        />
        <KpiCard
          title="Sin internet en casa"
          value={`${findVal('sin internet')?.valor ?? '—'}%`}
          subtitle="2025 — era 73.5% en 2010"
          icon={Layers}
          color="blue"
          change="⬇️ -57.7pp vs 2010"
          changeType="down"
        />
        <KpiCard
          title="Sin actividad física"
          value={`${findVal('física')?.valor ?? '—'}%`}
          subtitle="2025 — interior del país"
          icon={Users}
          color="terracotta"
        />
      </div>

      {/* NNyA Time Series */}
      {(() => {
        const nnIaData = ucaData
          .filter(d => d.indicador_nombre?.toLowerCase().includes('inseguridad alimentaria total'))
          .sort((a, b) => a.periodo - b.periodo);

        if (nnIaData.length >= 2) {
          const chartData = nnIaData.map(d => ({
            year: d.periodo,
            valor: d.valor,
          }));
          return (
            <ChartCard
              title="Evolución — Inseguridad Alimentaria NNyA"
              subtitle="Porcentaje de NNyA (0-17 años) con inseguridad alimentaria total. Argentina urbana."
              color="magenta"
              fuente="UCA-ODSA — Barómetro de la Deuda Social de la Infancia"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: '#4D4D4D', fontSize: 12 }}
                    tickLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis
                    tick={{ fill: '#4D4D4D', fontSize: 12 }}
                    tickLine={{ stroke: '#E5E7EB' }}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF',
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                    formatter={value => [`${value ?? '—'}%`, 'Inseguridad Alimentaria']}
                  />
                  <Bar
                    dataKey="valor"
                    fill={COLORS.magenta}
                    radius={[4, 4, 0, 0]}
                    name="NNyA 0-17"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          );
        }

        return (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <div className="flex gap-3">
              <TrendingUp className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700 leading-relaxed">
                <p>
                  Los datos de evolución temporal para NNyA están disponibles en los informes
                  anuales completos del{' '}
                  <strong>Barómetro de la Deuda Social de la Infancia (UCA)</strong>.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
        <div className="flex gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-accent text-red-700 font-semibold text-lg mb-2">
              La desigualdad que no cede
            </h3>
            <p className="text-sm text-red-600 font-body mb-3">
              NNyA de nivel <strong>muy bajo</strong>: <strong>28 veces más</strong> probabilidad de
              pasar hambre que nivel medio-alto.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/50 rounded-lg p-3 text-center">
                <p className="font-accent text-red-700">Nivel muy bajo</p>
                <p className="text-2xl font-bold text-red-600">31.1%</p>
                <p className="text-xs text-red-500">inseguridad severa</p>
              </div>
              <div className="bg-white/50 rounded-lg p-3 text-center">
                <p className="font-accent text-green-700">Nivel medio-alto</p>
                <p className="text-2xl font-bold text-green-600">1.1%</p>
                <p className="text-xs text-green-500">inseguridad severa</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-3">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 font-body">
          <p className="mb-2">
            <strong>Fuente:</strong> Barómetro de la Deuda Social de la Infancia — UCA (2010-2025).
            Infancia en Argentina: avances en la coyuntura, deudas estructurales.
          </p>
          <p>
            7 dimensiones monitoreadas: Alimentación, Salud, Hábitat, Subsistencia, Crianza,
            Educación, Información.
          </p>
        </div>
      </div>
    </div>
  );
}
