import { createClient } from '@supabase/supabase-js';
import { Suspense } from 'react';
import {
  Database,
  Newspaper,
  Users,
  Activity,
  Zap,
  BarChart3,
  FolderOpen,
} from 'lucide-react';
import { PageLoading } from '@/components/page-loading';
import { AdminUpdateButton } from './admin-update-button';

interface SystemStats {
  counts: {
    indicadores: number;
    datos_indicadores: number;
    fuentes: number;
    monitoreo_registros: number;
    monitoreo_actores: number;
    grupos: number;
  };
  latest: {
    indicador_periodo: string | null;
    monitoreo_fecha: string | null;
  };
}

async function fetchStats(): Promise<SystemStats> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const [indicadores, datosIndicadores, fuentes, monitoreo, actores, grupos] = await Promise.all([
    supabase.from('indicadores').select('id', { count: 'exact', head: true }),
    supabase.from('datos_indicadores').select('id', { count: 'exact', head: true }),
    supabase.from('fuentes_datos').select('id', { count: 'exact', head: true }),
    supabase.from('monitoreo_registros').select('id', { count: 'exact', head: true }),
    supabase.from('monitoreo_actores').select('id', { count: 'exact', head: true }),
    supabase.from('grupos_indicadores').select('id', { count: 'exact', head: true }),
  ]);

  const [latestIndicador, latestMonitoreo] = await Promise.all([
    supabase
      .from('datos_indicadores')
      .select('periodo')
      .order('periodo', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('monitoreo_registros')
      .select('fecha_publicacion')
      .order('fecha_publicacion', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    counts: {
      indicadores: indicadores.count ?? 0,
      datos_indicadores: datosIndicadores.count ?? 0,
      fuentes: fuentes.count ?? 0,
      monitoreo_registros: monitoreo.count ?? 0,
      monitoreo_actores: actores.count ?? 0,
      grupos: grupos.count ?? 0,
    },
    latest: {
      indicador_periodo: latestIndicador.data?.periodo ?? null,
      monitoreo_fecha: latestMonitoreo.data?.fecha_publicacion ?? null,
    },
  };
}

export default function AdminPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <AdminContent />
    </Suspense>
  );
}

async function AdminContent() {
  const stats = await fetchStats();
  return <AdminDashboard stats={stats} />;
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-[#334155]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#334155]" />
        </div>
        <h2 className="font-display text-lg text-[#334155]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#334155] font-medium">{label}</p>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
      <span className="text-sm font-display text-[#334155] tabular-nums">{value}</span>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'amber' | 'terracotta' | 'navy';
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    terracotta: 'bg-orange-50 text-orange-600',
    navy: 'bg-[#334155]/10 text-[#334155]',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="font-display text-2xl text-[#334155] tabular-nums">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{title}</p>
      {subtitle && <p className="text-[11px] text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function AdminDashboard({ stats }: { stats: SystemStats }) {
  const formatNumber = (n: number) => n.toLocaleString('es-AR');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Indicadores"
          value={formatNumber(stats.counts.indicadores)}
          subtitle={`${formatNumber(stats.counts.datos_indicadores)} datos`}
          icon={BarChart3}
          color="blue"
        />
        <KpiCard
          title="Fuentes de datos"
          value={formatNumber(stats.counts.fuentes)}
          subtitle="APIs, CSVs y manuales"
          icon={Database}
          color="amber"
        />
        <KpiCard
          title="Monitoreo de medios"
          value={formatNumber(stats.counts.monitoreo_registros)}
          subtitle={`${formatNumber(stats.counts.monitoreo_actores)} actores`}
          icon={Newspaper}
          color="terracotta"
        />
        <KpiCard
          title="Usuarios del sistema"
          value={formatNumber(stats.counts.grupos)}
          subtitle="Cargá usuarios en la pestaña Usuarios"
          icon={Users}
          color="navy"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card icon={Database} title="Vista de datos">
          <div className="divide-y divide-gray-100">
            <StatRow
              icon={BarChart3}
              label="Indicadores"
              value={formatNumber(stats.counts.indicadores)}
              subtitle="Categorías de indicadores"
            />
            <StatRow
              icon={Activity}
              label="Datos de indicadores"
              value={formatNumber(stats.counts.datos_indicadores)}
              subtitle={
                stats.latest.indicador_periodo
                  ? `Último período: ${stats.latest.indicador_periodo}`
                  : undefined
              }
            />
            <StatRow
              icon={Database}
              label="Fuentes de datos"
              value={formatNumber(stats.counts.fuentes)}
              subtitle="APIs, CSVs, manuales"
            />
            <StatRow
              icon={Newspaper}
              label="Registros de monitoreo"
              value={formatNumber(stats.counts.monitoreo_registros)}
              subtitle={
                stats.latest.monitoreo_fecha
                  ? `Última fecha: ${new Date(stats.latest.monitoreo_fecha).toLocaleDateString('es-AR')}`
                  : undefined
              }
            />
            <StatRow
              icon={Users}
              label="Actores mediáticos"
              value={formatNumber(stats.counts.monitoreo_actores)}
            />
            <StatRow
              icon={FolderOpen}
              label="Grupos de indicadores"
              value={formatNumber(stats.counts.grupos)}
            />
          </div>
        </Card>

        <Card icon={Zap} title="Acciones rápidas">
          <div className="space-y-3">
            <AdminUpdateButton />
            <a
              href="/monitoreo"
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm text-[#334155] font-medium transition-colors"
            >
              <Newspaper className="w-4 h-4 text-gray-500" />
              Ir a Monitoreo de Medios
            </a>
            <a
              href="/fuentes"
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm text-[#334155] font-medium transition-colors"
            >
              <Database className="w-4 h-4 text-gray-500" />
              Gestionar fuentes de datos
            </a>
            <a
              href="/repositorio"
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm text-[#334155] font-medium transition-colors"
            >
              <FolderOpen className="w-4 h-4 text-gray-500" />
              Repositorio documental
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
