import { createClient } from '@supabase/supabase-js';
import { Suspense } from 'react';
import { ClipboardList, Heart, Brain, Users, AlertTriangle, Info } from 'lucide-react';
import { PageLoading } from '@/components/page-loading';
import { SectionHeader } from '@/components/section-header';
import { EmptyState } from '@/components/empty-state';
import { KpiCard } from '@/components/kpi-card';
import { EncuestasCharts } from './encuestas-charts';

// ─── Colores DDNA ─────────────────────────────────
const COLORS = {
  magenta: '#BF1363',
  orange: '#FF7F11',
  blue: '#3777FF',
  green: '#10B981',
  terracotta: '#E07A5F',
  amber: '#F3A712',
  navy: '#334155',
};

// ─── Tipos ─────────────────────────────────────────
interface IndicadorRaw {
  id: string;
  indicador_nombre: string;
  valor: number;
  unidad: string;
  periodo: string;
  region: string;
}

export interface ChartTopic {
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

// ─── Data Fetching ─────────────────────────────────
async function fetchEncuestasData(): Promise<IndicadorRaw[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('indicadores')
    .select('id, indicador_nombre, valor, unidad, periodo, region')
    .eq('categoria', 'encuestas_2024')
    .order('indicador_nombre', { ascending: true });

  if (error) throw error;

  return (data || []) as IndicadorRaw[];
}

// ─── Page ──────────────────────────────────────────
export default function EncuestasPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={ClipboardList}
        title="Encuestas 2024"
        description="Resultados de la encuesta a adultos con hijos y jóvenes de Córdoba"
        color="magenta"
      />
      <Suspense fallback={<PageLoading />}>
        <EncuestasContent />
      </Suspense>
    </div>
  );
}

async function EncuestasContent() {
  const data = await fetchEncuestasData();

  if (data.length === 0) {
    return (
      <EmptyState
        icon={Info}
        title="No hay datos de encuestas disponibles"
        description="Los datos de la encuesta 2024 aún no se han cargado."
      />
    );
  }

  // ─── Derivar datos ──────────────────────────────
  const allTopics = groupByTopic(data);

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

  const priorityCharts = allTopics.filter(t => PRIORITY_TOPICS.has(t.topic));
  const otherCharts = allTopics.filter(t => !PRIORITY_TOPICS.has(t.topic));
  const showOtherCharts = otherCharts.slice(0, 6);

  return (
    <div className="space-y-6">
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
      <EncuestasCharts
        priorityCharts={priorityCharts}
        showOtherCharts={showOtherCharts}
      />

      {/* Nota metodológica */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mt-6">
        <h3 className="font-accent text-sm text-[#334155] font-medium mb-2 flex items-center gap-2">
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
