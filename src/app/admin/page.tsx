'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Loader2,
  RefreshCw,
  UserPlus,
  Mail,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Database,
  FileText,
  Newspaper,
  Users,
  Activity,
  Settings,
  Zap,
  BarChart3,
  FolderOpen,
  Calendar,
} from 'lucide-react';
import { LoginGate } from '@/components/login-gate';
import { useAuth } from '@/components/auth-provider';
import { KpiCard } from '@/components/kpi-card';
import { RoleManager } from '@/components/admin-role-manager';
import { UserRoleManager } from '@/components/admin-user-roles';
import clsx from 'clsx';

// ── Types ─────────────────────────────────────────────────────────

interface AdminUser {
  email: string;
  created_at: string;
}

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

const PROTECTED_ROUTES = [
  { path: '/admin', label: 'Configuración', icon: Settings },
  { path: '/geo', label: 'Mapas', icon: BarChart3 },
  { path: '/repositorio', label: 'Repositorio', icon: FolderOpen },
  { path: '/fuentes', label: 'Fuentes', icon: Database },
  { path: '/ejecutivo', label: 'Inf. Ejecutivo', icon: FileText },
  { path: '/presupuesto-nnya', label: 'Presupuesto NNyA', icon: FileText },
];

// ── Flash message ─────────────────────────────────────────────────

function FlashMessage({
  type,
  text,
  onDismiss,
}: {
  type: 'ok' | 'err';
  text: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={clsx(
        'flex items-center gap-2 px-4 py-3 rounded-xl text-sm',
        type === 'ok'
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-red-50 text-red-700 border border-red-200'
      )}
    >
      {type === 'ok' ? (
        <CheckCircle className="w-4 h-4 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 flex-shrink-0" />
      )}
      {text}
    </div>
  );
}

// ── Section card wrapper ──────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('bg-white rounded-2xl border border-gray-200 shadow-sm p-6', className)}>
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

// ── Stat row ──────────────────────────────────────────────────────

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
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();

  // Auth state
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  // Admins state
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [adding, setAdding] = useState(false);

  // Stats state
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Flash
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const flash = useCallback((type: 'ok' | 'err', text: string) => setMsg({ type, text }), []);

  // ── Data loaders ──────────────────────────────────────────────

  const loadConfig = useCallback(async () => {
    try {
      const r = await fetch('/api/auth/config');
      if (r.ok) setEnabled((await r.json()).enabled ?? false);
    } catch {}
  }, []);

  const loadAdmins = useCallback(async () => {
    setAdminsLoading(true);
    try {
      const r = await fetch('/api/auth/admins');
      if (r.ok) setAdmins(await r.json());
    } catch {}
    setAdminsLoading(false);
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const r = await fetch('/api/admin/stats');
      if (r.ok) setStats(await r.json());
    } catch {}
    setStatsLoading(false);
  }, []);

  const loadAll = useCallback(() => {
    setLoading(true);
    Promise.all([loadConfig(), loadAdmins(), loadStats()]).then(() => setLoading(false));
  }, [loadConfig, loadAdmins, loadStats]);

  useEffect(() => {
    if (!authLoading) loadAll();
  }, [authLoading, loadAll]);

  // ── Handlers ──────────────────────────────────────────────────

  const handleToggle = async () => {
    setToggling(true);
    try {
      const r = await fetch('/api/auth/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: !enabled,
          protected_routes: PROTECTED_ROUTES.map(r => r.path),
        }),
      });
      if (r.ok) {
        setEnabled(!enabled);
        flash('ok', !enabled ? 'Autenticación activada' : 'Autenticación desactivada');
      } else {
        flash('err', 'Error al cambiar');
      }
    } catch {
      flash('err', 'Error de conexión');
    }
    setToggling(false);
  };

  const addAdmin = async () => {
    if (!newEmail || !newPassword) return;
    setAdding(true);
    try {
      const r = await fetch('/api/auth/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, password: newPassword }),
      });
      if (r.ok) {
        setNewEmail('');
        setNewPassword('');
        flash('ok', 'Admin agregado');
        loadAdmins();
      } else {
        const d = await r.json();
        flash('err', d.error || 'Error');
      }
    } catch {
      flash('err', 'Error de conexión');
    }
    setAdding(false);
  };

  // ── Loading state ─────────────────────────────────────────────

  if (authLoading || loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#1a2556] animate-spin" />
      </div>
    );

  if (!user)
    return (
      <LoginGate>
        <div />
      </LoginGate>
    );

  // ── Render ────────────────────────────────────────────────────

  const formatNumber = (n: number) => n.toLocaleString('es-AR');

  return (
    <LoginGate>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a2556] to-[#2a3570]">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl text-white">Panel de Administración</h1>
                <p className="text-sm text-white/60 mt-1">
                  Gestión de acceso, usuarios y datos del sistema
                </p>
              </div>
              <button
                onClick={loadAll}
                className="flex items-center gap-1.5 px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg text-xs transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Actualizar todo
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* Flash message */}
          {msg && <FlashMessage type={msg.type} text={msg.text} onDismiss={() => setMsg(null)} />}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Indicadores"
              value={formatNumber(stats?.counts.indicadores ?? 0)}
              subtitle={`${formatNumber(stats?.counts.datos_indicadores ?? 0)} datos cargados`}
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
              title="Administradores"
              value={String(admins.length)}
              subtitle={enabled ? 'Auth activada' : 'Auth desactivada'}
              icon={Users}
              color="navy"
            />
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Access Control */}
            <SectionCard icon={Shield} title="Control de acceso">
              <div
                className={clsx(
                  'p-5 rounded-xl mb-5',
                  enabled
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-gray-50 border border-gray-100'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-accent text-sm font-semibold text-[#1a2556]">
                      {enabled ? '🔒 Autenticación activada' : '🔓 Sin restricciones'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {enabled
                        ? `${PROTECTED_ROUTES.length} páginas requieren inicio de sesión`
                        : 'Todas las páginas son públicas'}
                    </p>
                  </div>
                  <button
                    onClick={handleToggle}
                    disabled={toggling}
                    className={clsx(
                      'px-5 py-2.5 rounded-xl text-sm font-accent font-semibold transition-all',
                      enabled
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                        : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200',
                      'disabled:opacity-60'
                    )}
                  >
                    {toggling ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : enabled ? (
                      'Desactivar'
                    ) : (
                      'Activar'
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-3">Páginas protegidas:</p>
              <div className="space-y-1.5">
                {PROTECTED_ROUTES.map(r => (
                  <div
                    key={r.path}
                    className={clsx(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs',
                      enabled ? 'bg-amber-50/60 text-amber-800' : 'bg-gray-50 text-gray-500'
                    )}
                  >
                    <r.icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{r.label}</span>
                    <span className="ml-auto text-[10px] opacity-50 font-mono">{r.path}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* User Management */}
            <SectionCard icon={Mail} title="Administradores">
              {adminsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
              ) : admins.length > 0 ? (
                <div className="space-y-2 mb-5">
                  {admins.map(a => (
                    <div
                      key={a.email}
                      className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#1a2556]/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-[#1a2556]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1a2556] font-medium truncate">{a.email}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(a.created_at).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">
                  No hay administradores registrados
                </p>
              )}

              {/* Add admin form */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 mb-3">Agregar nuevo administrador</p>
                <div className="flex gap-2">
                  <div className="flex-1 min-w-0 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="email"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1a2556] focus:border-transparent outline-none"
                      onKeyDown={e => e.key === 'Enter' && addAdmin()}
                    />
                  </div>
                  <div className="w-40 relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Clave"
                      className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1a2556] focus:border-transparent outline-none"
                      onKeyDown={e => e.key === 'Enter' && addAdmin()}
                    />
                    <button
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPw ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={addAdmin}
                    disabled={adding || !newEmail || !newPassword}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a2556] text-white rounded-lg text-sm font-medium hover:bg-[#0d1530] disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {adding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}{' '}
                    Agregar
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* Data Overview */}
            <SectionCard icon={Database} title="Vista de datos">
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
                <p className="text-sm text-gray-400 text-center py-6">
                  No se pudieron cargar las estadísticas
                </p>
              )}
            </SectionCard>

            {/* Quick Actions */}
            <SectionCard icon={Zap} title="Acciones rápidas">
              <div className="space-y-3">
                <button
                  onClick={loadAll}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm text-[#1a2556] font-medium transition-colors text-left"
                >
                  <RefreshCw className="w-4 h-4 text-gray-500" />
                  Actualizar todos los datos
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
            </SectionCard>
          </div>

          {/* RBAC Section — full width */}
          <SectionCard icon={Shield} title="Roles y permisos" className="w-full">
            <RoleManager onFlash={flash} />
          </SectionCard>

          <SectionCard icon={Users} title="Usuarios y roles" className="w-full">
            <UserRoleManager onFlash={flash} />
          </SectionCard>
        </div>
      </div>
    </LoginGate>
  );
}
