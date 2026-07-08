'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Database,
  Newspaper,
  Users,
  Activity,
  Zap,
  BarChart3,
  FolderOpen,
} from 'lucide-react';
import clsx from 'clsx';

// ── Types ─────────────────────────────────────────────────────────

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

// ── Card wrapper ────────────────────────────────────────────────────

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
        <div className="w-9 h-9 rounded-lg bg-[#1a2556]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#1a2556]" />
        </div>
        <h2 className="font-display text-lg text-[#1a2556]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ── Stat row ────────────────────────────────────────────────────────

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
        <p className="text-sm text-[#1a2556] font-medium">{label}</p>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
      <span className="text-sm font-display text-[#1a2556] tabular-nums">{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const r = await fetch('/api/admin/stats');
      if (r.ok) setStats(await r.json());
    } catch {}
    setStatsLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const formatNumber = (n: number) => n.toLocaleString('es-AR');

  return (
    <div className="space-y-6">
      {/* Flash */}
      {flash && (
        <div
          className={clsx(
            'flex items-center gap-2 px-4 py-3 rounded-xl text-sm',
            flash.type === 'ok'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200',
          )}
        >
          {flash.type === 'ok' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 flex-shrink-0" />
          )}
          {flash.text}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Indicadores"
          value={formatNumber(stats?.counts.indicadores ?? 0)}
          subtitle={`${formatNumber(stats?.counts.datos_indicadores ?? 0)} datos`}
          icon={BarChart3}
          color="blue"
        />
        <KpiCard
          title="Fuentes de datos"
          value={formatNumber(stats?.counts.fuentes ?? 0)}
          subtitle="APIs, CSVs y manuales"
          icon={Database}
          color="amber"
        />
        <KpiCard
          title="Monitoreo de medios"
          value={formatNumber(stats?.counts.monitoreo_registros ?? 0)}
          subtitle={`${formatNumber(stats?.counts.monitoreo_actores ?? 0)} actores`}
          icon={Newspaper}
          color="terracotta"
        />
        <KpiCard
          title="Usuarios del sistema"
          value={formatNumber(stats?.counts.grupos ?? 0)}
          subtitle="Cargá usuarios en la pestaña Usuarios"
          icon={Users}
          color="navy"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Overview */}
        <Card icon={Database} title="Vista de datos">
          {statsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : stats ? (
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
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No se pudieron cargar las estadísticas</p>
          )}
        </Card>

        {/* Quick Actions */}
        <Card icon={Zap} title="Acciones rápidas">
          <div className="space-y-3">
            <button
              onClick={loadStats}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm text-[#1a2556] font-medium transition-colors text-left"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
              Actualizar datos
            </button>
            <a
              href="/monitoreo"
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm text-[#1a2556] font-medium transition-colors"
            >
              <Newspaper className="w-4 h-4 text-gray-500" />
              Ir a Monitoreo de Medios
            </a>
            <a
              href="/fuentes"
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm text-[#1a2556] font-medium transition-colors"
            >
              <Database className="w-4 h-4 text-gray-500" />
              Gestionar fuentes de datos
            </a>
            <a
              href="/repositorio"
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm text-[#1a2556] font-medium transition-colors"
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

// KpiCard inline because it's a server component in imports
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
    navy: 'bg-[#1a2556]/10 text-[#1a2556]',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="font-display text-2xl text-[#1a2556] tabular-nums">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{title}</p>
      {subtitle && <p className="text-[11px] text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
