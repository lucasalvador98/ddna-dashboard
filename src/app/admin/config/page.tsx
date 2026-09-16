'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Loader2,
  CheckCircle,
  XCircle,
  Globe,
  Heart,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import clsx from 'clsx';
import { getAuthConfig } from '@/lib/actions/auth-config';
import { APP_ROUTES } from '@/lib/rbac-types';

type HealthStatus = 'healthy' | 'degraded' | 'starting' | 'error';

interface HealthData {
  status: HealthStatus;
  message: string;
  checks: {
    supabase: string;
    perCategory?: Record<string, { ultima_carga: string | null; days_since: number | null; stale: boolean }>;
  };
}

export default function ConfigPage() {
  const [enabled, setEnabled] = useState(false);
  const [protectedRoutes, setProtectedRoutes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  const loadConfig = useCallback(async () => {
    try {
      const { data } = await getAuthConfig();
      setEnabled(data.value?.enabled ?? false);
      setProtectedRoutes(data.value?.protected_routes ?? []);
    } catch {
      // Error handling — default to disabled state
    }
    setLoading(false);
  }, []);

  const loadHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth({ status: 'error', message: 'No se pudo conectar al endpoint de salud', checks: { supabase: 'error' } });
    }
    setHealthLoading(false);
  }, []);

  useEffect(() => {
    // Mount-only config & health fetch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadConfig();
    void loadHealth();
  }, [loadConfig, loadHealth]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const r = await fetch('/api/auth/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      });
      if (r.ok) {
        setEnabled(!enabled);
        setFlash({ type: 'ok', text: !enabled ? 'Autenticación activada' : 'Autenticación desactivada' });
        setTimeout(() => setFlash(null), 4000);
      } else {
        const body = await r.json().catch(() => ({}));
        setFlash({ type: 'err', text: body.error || 'Error al cambiar' });
      }
    } catch {
      setFlash({ type: 'err', text: 'Error de conexión con el servidor' });
    }
    setToggling(false);
  };

  const handleRouteToggle = async (route: string) => {
    const next = protectedRoutes.includes(route)
      ? protectedRoutes.filter((r) => r !== route)
      : [...protectedRoutes, route];

    setProtectedRoutes(next);

    try {
      const r = await fetch('/api/auth/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protected_routes: next }),
      });
      if (!r.ok) {
        // Revert on failure
        setProtectedRoutes(protectedRoutes);
        const body = await r.json().catch(() => ({}));
        setFlash({ type: 'err', text: body.error || 'Error al actualizar rutas' });
      }
    } catch {
      setProtectedRoutes(protectedRoutes);
      setFlash({ type: 'err', text: 'Error de conexión' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
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
          {flash.type === 'ok' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
          {flash.text}
        </div>
      )}

      {/* Section 1: Auth toggle + status */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-display text-lg text-navy mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Autenticación
        </h2>

        <div
          className={clsx(
            'p-5 rounded-xl mb-4',
            enabled ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-100',
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-accent text-sm font-semibold text-navy">
                {enabled ? '🔒 Autenticación activada' : '🔓 Sin restricciones'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {enabled
                  ? 'Los usuarios deben iniciar sesión. Los roles controlan el acceso a cada pantalla.'
                  : 'Todas las páginas son públicas — cualquiera puede acceder.'}
              </p>
            </div>
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={clsx(
                'px-5 py-2.5 rounded-xl text-sm font-accent font-semibold transition-all whitespace-nowrap',
                enabled
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200',
                'disabled:opacity-60',
              )}
            >
              {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : enabled ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Protected routes checklist */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-display text-lg text-navy mb-2 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Rutas protegidas
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Seleccioná qué pantallas requieren autenticación. Las rutas marcadas solo son accesibles para usuarios con sesión activa.
        </p>

        {!enabled && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs mb-4">
            <AlertTriangle className="w-3.5 h-3.5" />
            La autenticación está desactivada — las rutas protegidas no tendrán efecto hasta que la actives.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {APP_ROUTES.map(({ route, label }) => {
            const isActive = protectedRoutes.includes(route);
            return (
              <button
                key={route}
                onClick={() => handleRouteToggle(route)}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all text-left',
                  isActive
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200',
                )}
              >
                {isActive ? <CheckCircle className="w-4 h-4 flex-shrink-0 text-green-500" /> : <XCircle className="w-4 h-4 flex-shrink-0 text-gray-300" />}
                <div>
                  <span className="font-medium">{label}</span>
                  <span className="block text-xs text-gray-400">{route}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 3: System health */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-navy flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Salud del sistema
          </h2>
          <button
            onClick={loadHealth}
            disabled={healthLoading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Actualizar estado"
          >
            <RefreshCw className={clsx('w-4 h-4 text-gray-500', healthLoading && 'animate-spin')} />
          </button>
        </div>

        {healthLoading && !health ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        ) : health ? (
          <div className="space-y-3">
            {/* Overall status */}
            <div
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl border',
                health.status === 'healthy' && 'bg-green-50 border-green-200',
                health.status === 'degraded' && 'bg-amber-50 border-amber-200',
                health.status === 'starting' && 'bg-blue-50 border-blue-200',
                health.status === 'error' && 'bg-red-50 border-red-200',
              )}
            >
              {health.status === 'healthy' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {health.status === 'degraded' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {health.status === 'starting' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
              {health.status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
              <div>
                <p className={clsx(
                  'text-sm font-medium',
                  health.status === 'healthy' && 'text-green-700',
                  health.status === 'degraded' && 'text-amber-700',
                  health.status === 'starting' && 'text-blue-700',
                  health.status === 'error' && 'text-red-700',
                )}>
                  {health.status === 'healthy' && 'Todo operativo'}
                  {health.status === 'degraded' && 'Funcionando con advertencias'}
                  {health.status === 'starting' && 'Iniciando...'}
                  {health.status === 'error' && 'Error de conexión'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{health.message}</p>
              </div>
            </div>

            {/* Supabase status */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-sm text-gray-600">Supabase</span>
              <span
                className={clsx(
                  'text-xs font-medium px-2 py-0.5 rounded-full',
                  health.checks.supabase === 'connected' && 'bg-green-100 text-green-700',
                  health.checks.supabase === 'no_schema' && 'bg-amber-100 text-amber-700',
                  health.checks.supabase === 'starting' && 'bg-blue-100 text-blue-700',
                  health.checks.supabase === 'error' && 'bg-red-100 text-red-700',
                  health.checks.supabase === 'disconnected' && 'bg-gray-100 text-gray-500',
                )}
              >
                {health.checks.supabase === 'connected' && 'Conectado'}
                {health.checks.supabase === 'no_schema' && 'Sin esquema'}
                {health.checks.supabase === 'starting' && 'Iniciando'}
                {health.checks.supabase === 'error' && 'Error'}
                {health.checks.supabase === 'disconnected' && 'Desconectado'}
              </span>
            </div>

            {/* Per-category freshness */}
            {health.checks.perCategory && Object.keys(health.checks.perCategory).length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-500 mb-2">Frescura de datos por categoría</p>
                <div className="space-y-1.5">
                  {Object.entries(health.checks.perCategory).map(([cat, info]) => (
                    <div key={cat} className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                      <span className="text-gray-600 capitalize">{cat}</span>
                      <span className={clsx('text-xs font-medium', info.stale ? 'text-amber-600' : 'text-green-600')}>
                        {info.days_since !== null ? `${info.days_since}d` : 'Sin datos'}
                        {info.stale && ' ⚠️'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
