'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Loader2, RefreshCw, ToggleLeft, ToggleRight, Lock, Globe } from 'lucide-react';
import { LoginGate } from '@/components/login-gate';
import { useAuth } from '@/components/auth-provider';
import { navigation } from '@/lib/navigation';
import clsx from 'clsx';

interface AuthConfig {
  enabled: boolean;
  protected_routes: string[];
}

// All available pages from navigation + additional routes
const ALL_ROUTES = [
  ...new Set(
    navigation.flatMap(g =>
      g.items.map(i => i.href)
    )
  ),
  '/presupuesto-nnya',
  '/apis',
].filter(r => r !== '/login' && r !== '/'); // Never protect login or homepage

const ROUTE_LABELS: Record<string, string> = {
  '/salud': 'Salud',
  '/salud-adolescente': 'Salud Adolescente',
  '/educacion': 'Educación',
  '/pobreza': 'Pobreza e Indigencia',
  '/encuestas': 'Encuestas 2024',
  '/infancias': 'Infancias (UCA)',
  '/seguridad': 'Justicia',
  '/inversion': 'Inversión Social',
  '/presupuesto-nnya': 'Presupuesto NNyA',
  '/geo': 'Mapas',
  '/repositorio': 'Repositorio',
  '/fuentes': 'Fuentes de Datos',
  '/ejecutivo': 'Informe Ejecutivo',
  '/admin': 'Configuración (Admin)',
  '/apis': 'APIs',
};

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [toggling, setToggling] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadConfig = useCallback(async () => {
    setConfigLoading(true);
    try {
      const res = await fetch('/api/auth/config');
      if (!res.ok) throw new Error('Error al cargar configuración');
      const data = await res.json();
      setConfig(data);
    } catch {
      // Keep previous config
    } finally {
      setConfigLoading(false);
    }
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  // ── Toggle auth enabled/disabled ─────────────────────────────────

  const handleToggle = async () => {
    if (!config) return;
    setToggling(true);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !config.enabled }),
      });
      if (!res.ok) throw new Error();
      setConfig(prev => prev ? { ...prev, enabled: !prev.enabled } : null);
      setMessage({ type: 'success', text: `Autenticación ${!config.enabled ? 'activada' : 'desactivada'}` });
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setToggling(false);
    }
  };

  // ── Toggle specific route protection ─────────────────────────────

  const toggleRoute = async (route: string) => {
    if (!config) return;
    setSaving(true);
    const newRoutes = config.protected_routes.includes(route)
      ? config.protected_routes.filter(r => r !== route)
      : [...config.protected_routes, route];
    
    const newConfig = { ...config, protected_routes: newRoutes };
    setConfig(newConfig);

    try {
      const res = await fetch('/api/auth/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: config.enabled, protected_routes: newRoutes }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setConfig(config); // revert
      setMessage({ type: 'error', text: 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────

  if (authLoading || configLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#1a2556] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <LoginGate>
        <div />
      </LoginGate>
    );
  }

  return (
    <LoginGate>
      <div className="space-y-6 max-w-3xl">
        <h1 className="font-display text-2xl text-[#1a2556]">Configuración</h1>

        {message && (
          <div className={clsx('flex items-center gap-2 p-3 rounded-lg text-sm', message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
            {message.text}
          </div>
        )}

        {/* Auth Toggle Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-[#1a2556]" />
              <div>
                <h2 className="font-display text-lg text-[#1a2556]">
                  {config?.enabled ? '🔒 Autenticación activada' : '🔓 Autenticación desactivada'}
                </h2>
                <p className="font-body text-xs text-gray-500 mt-0.5">
                  {config?.enabled
                    ? `${config.protected_routes.length} páginas requieren login`
                    : 'Todas las páginas son públicas'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={clsx('flex items-center gap-2 px-5 py-2.5 rounded-xl font-accent text-sm font-semibold transition-all', config?.enabled ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200', 'disabled:opacity-60')}
            >
              {toggling ? <Loader2 className="w-5 h-5 animate-spin" /> : config?.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              {toggling ? 'Cambiando...' : config?.enabled ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        </div>

        {/* Per-Page Toggles */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-display text-lg text-[#1a2556] mb-1">Páginas protegidas</h3>
          <p className="font-body text-xs text-gray-500 mb-4">
            Seleccioná qué páginas requieren autenticación. La homepage nunca se protege.
          </p>

          <div className="space-y-1">
            {ALL_ROUTES.map(route => {
              const isProtected = config?.protected_routes.includes(route) ?? false;
              return (
                <button
                  key={route}
                  onClick={() => toggleRoute(route)}
                  disabled={saving || !config?.enabled}
                  className={clsx(
                    'w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-left transition-all',
                    isProtected ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-transparent hover:bg-gray-100',
                    !config?.enabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {isProtected ? <Lock className="w-4 h-4 text-amber-600" /> : <Globe className="w-4 h-4 text-gray-400" />}
                    <span className="text-sm font-medium text-[#1a2556]">{ROUTE_LABELS[route] || route}</span>
                  </div>
                  <code className="text-xs text-gray-400 font-mono">{route}</code>
                </button>
              );
            })}
          </div>
        </div>

        {/* Session Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-display text-lg text-[#1a2556] mb-2">Duración de la Sesión</h3>
          <p className="font-body text-sm text-gray-500">
            La sesión expira después de 1 hora de inactividad. Al expirar, deberás iniciar sesión nuevamente.
          </p>
        </div>
      </div>
    </LoginGate>
  );
}
