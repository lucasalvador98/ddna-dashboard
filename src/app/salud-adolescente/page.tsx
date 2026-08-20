import { createClient } from '@supabase/supabase-js';
import { Suspense } from 'react';
import { HeartPulse, Baby, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { PageLoading } from '@/components/page-loading';
import { SectionHeader } from '@/components/section-header';
import { EmptyState } from '@/components/empty-state';
import { KpiCard } from '@/components/kpi-card';
import { ChartWithTable } from '@/components/charts/chart-with-table';
import {
  NacimientosLineChart,
  FecundidadBarChart,
  ComparacionChart,
} from './salud-adolescente-charts';

const COLORS = {
  magenta: '#BF1363',
  terracotta: '#E07A5F',
  blue: '#3777FF',
  green: '#10B981',
  red: '#EF4444',
  amber: '#F3A712',
};

type DataRow = {
  indicador_nombre: string;
  valor: number;
  periodo: string;
  region: string;
};

async function fetchSaludAdolescenteData(): Promise<DataRow[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase
    .from('indicadores')
    .select('indicador_nombre, valor, periodo, region')
    .eq('categoria', 'salud_adolescente')
    .order('periodo', { ascending: true });

  if (error) throw error;
  return (data || []) as DataRow[];
}

function getNacimientos(data: DataRow[]) {
  return data
    .filter((d) => d.indicador_nombre === 'Nacimientos adolescentes')
    .map((d) => ({
      periodo: d.periodo,
      valor: Number(d.valor) || 0,
    }))
    .sort((a, b) => Number(a.periodo) - Number(b.periodo));
}

function getFecundidad(data: DataRow[]) {
  return data
    .filter((d) => d.indicador_nombre === 'Tasa fecundidad adolescente')
    .map((d) => ({
      periodo: d.periodo,
      valor: Number(d.valor) || 0,
    }))
    .sort((a, b) => Number(a.periodo) - Number(b.periodo));
}

function getMortalidad(data: DataRow[]) {
  return data
    .filter((d) => d.indicador_nombre === 'Tasa mortalidad adolescente')
    .map((d) => ({
      periodo: d.periodo,
      valor: Number(d.valor) || 0,
    }))
    .sort((a, b) => Number(a.periodo) - Number(b.periodo));
}

function getCambio(series: { periodo: string; valor: number }[]) {
  if (series.length < 2) return null;
  const actual = series[series.length - 1].valor;
  const anterior = series[series.length - 2].valor;
  const cambio = ((actual - anterior) / anterior) * 100;
  return {
    value: cambio.toFixed(1),
    tipo: cambio < 0 ? ('down' as const) : cambio > 0 ? ('up' as const) : ('neutral' as const),
  };
}

export default function SaludAdolescentePage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={HeartPulse}
        title="Salud Adolescente"
        description="Indicadores de salud sexual y reproductiva en adolescentes - Córdoba"
        color="magenta"
      />
      <Suspense fallback={<PageLoading />}>
        <SaludAdolescenteContent />
      </Suspense>
    </div>
  );
}

async function SaludAdolescenteContent() {
  const data = await fetchSaludAdolescenteData();

  const nacimientos = getNacimientos(data);
  const fecundidad = getFecundidad(data);
  const mortalidad = getMortalidad(data);

  const ultimosNacimientos = nacimientos.length > 0 ? nacimientos[nacimientos.length - 1].valor : 0;
  const ultimosFecundidad = fecundidad.length > 0 ? fecundidad[fecundidad.length - 1].valor : 0;
  const ultimosMortalidad = mortalidad.length > 0 ? mortalidad[mortalidad.length - 1].valor : 0;

  const periodoNacimientos = nacimientos.length > 0 ? nacimientos[nacimientos.length - 1].periodo : null;
  const periodoFecundidad = fecundidad.length > 0 ? fecundidad[fecundidad.length - 1].periodo : null;
  const periodoMortalidad = mortalidad.length > 0 ? mortalidad[mortalidad.length - 1].periodo : null;

  const cambioNacimientos = getCambio(nacimientos);
  const cambioFecundidad = getCambio(fecundidad);

  const nacimientosUltimos5 = nacimientos.slice(-5);
  const tendencia =
    nacimientosUltimos5.length >= 2
      ? nacimientosUltimos5[nacimientosUltimos5.length - 1].valor - nacimientosUltimos5[0].valor
      : 0;
  const tendenciaAlcista = tendencia > 0;

  return (
    <div className="space-y-6">
      {tendenciaAlcista && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 font-semibold">
            <AlertTriangle className="w-5 h-5" />
            <span>ALERTA: Los nacimientos en adolescentes han aumentado en los últimos años</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Nacimientos adolescentes"
          value={ultimosNacimientos > 0 ? ultimosNacimientos.toLocaleString('es-AR') : '—'}
          subtitle={
            periodoNacimientos
              ? `${periodoNacimientos} — Mujeres de 10-19 años`
              : 'Mujeres de 10-19 años'
          }
          change={cambioNacimientos ? `${cambioNacimientos.value}%` : undefined}
          changeType={cambioNacimientos?.tipo as 'up' | 'down' | undefined}
          icon={Baby}
          color="magenta"
        />

        <KpiCard
          title="Tasa de Fecundidad"
          value={ultimosFecundidad > 0 ? `${ultimosFecundidad.toFixed(1)}‰` : '—'}
          subtitle={
            periodoFecundidad
              ? `${periodoFecundidad} — Por cada mil mujeres 15-19 años`
              : 'Por cada mil mujeres 15-19 años'
          }
          change={cambioFecundidad ? `${cambioFecundidad.value}%` : undefined}
          changeType={cambioFecundidad?.tipo as 'up' | 'down' | undefined}
          icon={HeartPulse}
          color="terracotta"
        />

        <KpiCard
          title="Tasa Mortalidad"
          value={ultimosMortalidad > 0 ? `${ultimosMortalidad.toFixed(1)}‰` : '—'}
          subtitle={
            periodoMortalidad
              ? `${periodoMortalidad} — Adolescentes 15-19 años`
              : 'Adolescentes 15-19 años'
          }
          icon={TrendingDown}
          color="blue"
        />
      </div>

      {nacimientos.length > 0 && (
        <ChartWithTable
          title="Nacimientos en Adolescentes"
          subtitle={`Serie histórica ${nacimientos.length > 0 ? `${nacimientos[0].periodo}-${nacimientos[nacimientos.length - 1].periodo}` : '2015-2022'} (mujeres 10-19 años)`}
          color="magenta"
          fuente="DEIS - Dirección de Estadísticas e Información de Salud"
          data={nacimientos}
          dataKey="valor"
          xAxisKey="periodo"
        >
          <NacimientosLineChart data={nacimientos} />
        </ChartWithTable>
      )}

      {fecundidad.length > 0 && (
        <ChartWithTable
          title="Tasa de Fecundidad Adolescente"
          subtitle="Por cada mil mujeres de 15-19 años - Comparación histórica"
          color="terracotta"
          fuente="DEIS"
          data={fecundidad}
          dataKey="valor"
          xAxisKey="periodo"
        >
          <FecundidadBarChart data={fecundidad} />
        </ChartWithTable>
      )}

      {nacimientos.length > 0 && fecundidad.length > 0 && (
        <ChartWithTable
          title="Comparación: Nacimientos vs Tasa de Fecundidad"
          subtitle="Relación entre volumen y tasa (ambas métricas)"
          color="blue"
          fuente="DEIS"
          data={nacimientos.map((n, i) => ({
            periodo: n.periodo,
            nacimientos: n.valor,
            tasa: fecundidad[i]?.valor || 0,
          }))}
          dataKey="nacimientos"
          xAxisKey="periodo"
        >
          <ComparacionChart nacimientos={nacimientos} fecundidad={fecundidad} />
        </ChartWithTable>
      )}

      {data.length === 0 && (
        <EmptyState title="No hay datos de salud adolescente disponibles" />
      )}
    </div>
  );
}
