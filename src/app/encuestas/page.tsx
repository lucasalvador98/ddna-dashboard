'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, Heart, Brain, Users, AlertTriangle, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PageLoading } from '@/components/page-loading';
import { PageError } from '@/components/page-error';
import { SectionHeader } from '@/components/section-header';
import { KpiCard } from '@/components/kpi-card';
import { ChartWithTable } from '@/components/charts/chart-with-table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// ─── Colores DDNA ─────────────────────────────────
const COLORS = {
  magenta: '#BF1363',
  orange: '#FF7F11',
  blue: '#3777FF',
  green: '#10B981',
  terracotta: '#E07A5F',
  amber: '#F3A712',
  navy: '#1a2556',
};

const CHART_COLORS = [
  '#BF1363',
  '#FF7F11',
  '#3777FF',
  '#10B981',
  '#E07A5F',
  '#F3A712',
  '#1a2556',
  '#6B9AFF',
  '#22C55E',
  '#F97316',
];

// ─── Tipos ─────────────────────────────────────────
interface IndicadorRaw {
  id: string;
  indicador_nombre: string;
  valor: number;
  unidad: string;
  periodo: string;
  region: string;
}

interface ChartTopic {
  topic: string;
  label: string;
  items: { name: string; value: number }[];
  color: string;
}

// ─── Helpers ───────────────────────────────────────
/** Extrae el topic y la opción de un nombre como "Encuesta 2024 - Hacinamiento - No" */
function parseIndicatorName(name: string): { topic: string; option: string } | null {
  // Formato: "Encuesta 2024 - Topic - Option"
  const match = name.match(/^Encuesta 2024 - (.+) - (.+)$/);
  if (!match) return null;
  return { topic: match[1].trim(), option: match[2].trim() };
}

/** Agrupa indicadores por topic y arma datos para chart de barras */
function groupByTopic(data: IndicadorRaw[]): ChartTopic[] {
  const groups = new Map<string, { name: string; value: number }[]>();

  for (const d of data) {
    const parsed = parseIndicatorName(d.indicador_nombre);
    if (!parsed) continue;
    const { topic, option } = parsed;
    if (!groups.has(topic)) groups.set(topic, []);
    groups.get(topic)!.push({ name: option, value: Number(d.valor) || 0 });
  }

  const colorKeys = ['magenta', 'orange', 'blue', 'green', 'terracotta', 'amber', 'navy'] as const;
  let colorIdx = 0;

  return Array.from(groups.entries())
    .filter(([, items]) => items.length > 0)
    .map(([topic, items]) => ({
      topic,
      label: topic,
      items: items.sort((a, b) => b.value - a.value),
      color: COLORS[colorKeys[colorIdx++ % colorKeys.length]],
    }));
}

// ─── Topics priorizados para mostrar primero ───────
const PRIORITY_TOPICS = new Set([
  'Hacinamiento',
  'Frecuencia afecto a hijos',
  'Lectura de cuentos',
  'Ultimo abrazo recibido',
  'Estado emocional',
  'Estres por estudios',
  'Ha visto consumo en pares',
  'Escuela como contencion',
  'Estado de animo general',
  'Tiene amigos de confianza',
  'Presion para consumir',
  'Feliz en casa',
  'Hogar come 4 comidas',
  'Ultimo abrazo a hijos',
]);

// ─── Página ────────────────────────────────────────
export default function EncuestasPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<IndicadorRaw[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: indicadores, error } = await supabase
          .from('indicadores')
          .select('id, indicador_nombre, valor, unidad, periodo, region')
          .eq('categoria', 'encuestas_2024')
          .order('indicador_nombre', { ascending: true });

        if (error) {
          setError(error.message);
        } else {
          setData((indicadores || []) as IndicadorRaw[]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ─── Early returns ──────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          icon={ClipboardList}
          title="Encuestas 2024"
          description="Resultados de la encuesta a adultos con hijos y jóvenes de Córdoba"
          color="magenta"
        />
        <PageLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <SectionHeader
          icon={ClipboardList}
          title="Encuestas 2024"
          description="Resultados de la encuesta a adultos con hijos y jóvenes de Córdoba"
          color="magenta"
        />
        <PageError message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader
          icon={ClipboardList}
          title="Encuestas 2024"
          description="Resultados de la encuesta a adultos con hijos y jóvenes de Córdoba"
          color="magenta"
        />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Info className="w-12 h-12 text-gray-300 mb-4" />
          <p className="font-body text-gray-600">No hay datos de encuestas disponibles</p>
          <p className="text-sm text-gray-400 mt-1">
            Los datos de la encuesta 2024 aún no se han cargado.
          </p>
        </div>
      </div>
    );
  }

  // ─── Derivar datos ──────────────────────────────
  const allTopics = groupByTopic(data);

  // KPIs: buscar valores específicos por nombre completo
  const findValor = (keyword: string): number | null => {
    const match = data.find(d => d.indicador_nombre.toLowerCase().includes(keyword.toLowerCase()));
    return match ? Number(match.valor) : null;
  };

  const pctAfectoDiario = findValor('Frecuencia afecto a hijos - Todos los días');
  const pctNoRecuerdaAbrazo = findValor('Ultimo abrazo recibido - No recuerdo');
  const pctEstresDiario = findValor('Estres por estudios - Todos los días');
  const pctConsumoFrecuente = findValor('Ha visto consumo en pares - Sí frecuentemente');
  const pctAbrazoHoy = findValor('Ultimo abrazo a hijos - Hoy');
  const pctEscuelaNoContencion = findValor('Escuela como contencion - No');
  const pctNoLectura = findValor('Lectura de cuentos - Nunca');
  const pctAmigosConfianza = findValor('Tiene amigos de confianza - Sí');
  const pctHacinamiento = findValor('Hacinamiento - Si');
  const pctMamaPrepara = findValor('Quien prepara comida - Mamá');
  const pctMamaCuida = findValor('Quien cuida hijos enfermos - Mamá');

  // Separar topics prioritarios del resto
  const priorityCharts = allTopics.filter(t => PRIORITY_TOPICS.has(t.topic));
  const otherCharts = allTopics.filter(t => !PRIORITY_TOPICS.has(t.topic));
  // Mostrar primeros 4 de "otros" para no saturar
  const showOtherCharts = otherCharts.slice(0, 6);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={ClipboardList}
        title="Encuestas 2024"
        description="Resultados de la encuesta a personas adultas con hijos (718 respuestas) y jóvenes (1.038 respuestas) de la provincia de Córdoba"
        color="magenta"
      />

      {/* Banner informativo */}
      <div className="bg-gradient-to-r from-[#BF1363]/5 to-[#FF7F11]/5 border border-[#BF1363]/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ClipboardList className="w-5 h-5 text-[#BF1363] mt-0.5 shrink-0" />
          <div>
            <p className="font-body text-sm text-[#4D4D4D]">
              <strong className="text-[#BF1363]">1.757 respuestas</strong> en total — 718 personas
              adultas con hijos y 1.038 jóvenes de 12 a 18 años. La encuesta relevó información
              sobre bienestar, alimentación, vínculos afectivos, salud emocional y consumo.
            </p>
          </div>
        </div>
      </div>

      {/* ─── KPIs ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="Afecto diario a hijos"
          value={pctAfectoDiario !== null ? `${pctAfectoDiario}%` : '—'}
          subtitle="Adultos que muestran afecto a sus hijos todos los días"
          icon={Heart}
          color="magenta"
        />
        <KpiCard
          title="No recuerdan el último abrazo"
          value={pctNoRecuerdaAbrazo !== null ? `${pctNoRecuerdaAbrazo}%` : '—'}
          subtitle="Jóvenes que no recuerdan cuándo fue su último abrazo"
          icon={Heart}
          color="orange"
        />
        <KpiCard
          title="Estrés diario por estudios"
          value={pctEstresDiario !== null ? `${pctEstresDiario}%` : '—'}
          subtitle="Jóvenes con estrés todos los días por estudios"
          icon={Brain}
          color="blue"
        />
        <KpiCard
          title="Consumo frecuente en pares"
          value={pctConsumoFrecuente !== null ? `${pctConsumoFrecuente}%` : '—'}
          subtitle="Jóvenes que ven consumo de sustancias frecuentemente en sus pares"
          icon={Users}
          color="terracotta"
        />
      </div>

      {/* Segunda fila de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="Abrazaron hoy a sus hijos"
          value={pctAbrazoHoy !== null ? `${pctAbrazoHoy}%` : '—'}
          subtitle="Adultos que abrazaron a sus hijos hoy"
          icon={Heart}
          color="green"
        />
        <KpiCard
          title="Escuela NO es contención"
          value={pctEscuelaNoContencion !== null ? `${pctEscuelaNoContencion}%` : '—'}
          subtitle="Jóvenes que sienten que la escuela NO los contiene"
          icon={AlertTriangle}
          color="navy"
        />
        <KpiCard
          title="Nunca les leen cuentos"
          value={pctNoLectura !== null ? `${pctNoLectura}%` : '—'}
          subtitle="Adultos que nunca les leen cuentos a sus hijos"
          icon={ClipboardList}
          color="blue"
        />
        <KpiCard
          title="Tienen amigos de confianza"
          value={pctAmigosConfianza !== null ? `${pctAmigosConfianza}%` : '—'}
          subtitle="Jóvenes que tienen amigos de confianza"
          icon={Users}
          color="green"
        />
      </div>

      {/* ─── Charts ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6">
        {priorityCharts.map(chart => {
          const total = chart.items.reduce((sum, i) => sum + i.value, 0);
          // Para topics con pocas opciones, sumamos y mostramos como porcentaje del total
          const showPct = chart.items.length <= 5;
          const chartData = showPct ? chart.items : chart.items;

          return (
            <ChartWithTable
              key={chart.topic}
              title={chart.label}
              subtitle={`Distribución de respuestas — Encuesta 2024`}
              color="magenta"
              fuente="Encuesta DDNA 2024 — 1.757 respuestas (adultos + jóvenes)"
              data={chartData}
              dataKey="value"
              xAxisKey="name"
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={chartData}
                    layout={chartData.length > 6 ? 'vertical' : 'vertical'}
                    margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: '#4D4D4D', fontSize: 12 }}
                      tickFormatter={(v: number) => `${v}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: '#4D4D4D', fontSize: 11 }}
                      width={chartData.reduce((max, d) => Math.max(max, d.name.length), 0) * 8 + 10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFF',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                      }}
                      formatter={value => [`${Number(value).toFixed(1)}%`, 'Respuestas']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartWithTable>
          );
        })}
      </div>

      {/* ─── Otros indicadores ────────────────────── */}
      {showOtherCharts.length > 0 && (
        <>
          <h2 className="font-display text-xl text-[#1a2556] mt-8 mb-4">Otros indicadores</h2>
          <div className="grid grid-cols-1 gap-6">
            {showOtherCharts.map(chart => {
              const chartData = chart.items;
              return (
                <ChartWithTable
                  key={chart.topic}
                  title={chart.label}
                  subtitle="Distribución de respuestas — Encuesta 2024"
                  color="amber"
                  fuente="Encuesta DDNA 2024"
                  data={chartData}
                  dataKey="value"
                  xAxisKey="name"
                >
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          tick={{ fill: '#4D4D4D', fontSize: 12 }}
                          tickFormatter={(v: number) => `${v}%`}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fill: '#4D4D4D', fontSize: 11 }}
                          width={120}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFF',
                            border: '1px solid #E0E0E0',
                            borderRadius: '8px',
                          }}
                          formatter={value => [
                            `${value != null ? Number(value).toFixed(1) : '—'}%`,
                            'Respuestas',
                          ]}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {chartData.map((entry, idx) => (
                            <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartWithTable>
              );
            })}
          </div>
        </>
      )}

      {/* Nota metodológica */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mt-6">
        <h3 className="font-accent text-sm text-[#1a2556] font-medium mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-[#BF1363]" />
          Nota metodológica
        </h3>
        <p className="font-body text-sm text-[#4D4D4D] leading-relaxed">
          Los datos provienen de una encuesta autoadministrada digital y en papel realizada durante
          2024 en la provincia de Córdoba. Participaron 718 personas adultas con hijos a cargo y
          1.038 jóvenes de 12 a 18 años. Los porcentajes representan el proportion de respuestas
          sobre el total de cada grupo etario. Los indicadores de adultos y jóvenes se presentan
          agrupados por temática.
        </p>
      </div>
    </div>
  );
}
