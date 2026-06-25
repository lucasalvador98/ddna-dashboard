'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

interface AuthConfig {
  enabled: boolean;
  protected_routes: string[];
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // ── Load current auth config from API ────────────────────────────────────

  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/config');
      const data = await res.json();
      if (data.value) {
        setConfig(data.value as AuthConfig);
      }
    } catch {
      // Keep previous config on failure
    } finally {
      setConfigLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // ── Toggle auth enabled/disabled via API ─────────────────────────────────

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
      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: 'error',
          text: data.error || 'Error al cambiar la configuración',
        });
        return;
      }

      setConfig((prev) =>
        prev ? { ...prev, enabled: !prev.enabled } : null
      );
      setMessage({
        type: 'success',
        text: `Autenticación ${!config.enabled ? 'activada' : 'desactivada'} correctamente`,
      });
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setToggling(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────

  if (authLoading || configLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#1a2556] animate-spin" />
      </div>
    );
  }

  // ── Not authenticated ────────────────────────────────────────────────────

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Acceso restringido</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-[#1a2556]">Administración</h1>
        <p className="font-body text-sm text-gray-500 mt-1">
          Gestioná la autenticación y acceso al dashboard
        </p>
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          )}
          <span
            className={`text-sm ${
              message.type === 'success' ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {message.text}
          </span>
        </div>
      )}

      {/* Auth Toggle Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-[#1a2556]" />
          <h2 className="font-display text-lg text-[#1a2556]">
            Control de Autenticación
          </h2>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-accent text-sm text-[#1a2556] font-semibold">
              {config?.enabled
                ? 'Autenticación Activada'
                : 'Autenticación Desactivada'}
            </p>
            <p className="font-body text-xs text-gray-500 mt-0.5">
              {config?.enabled
                ? 'Las rutas protegidas requieren inicio de sesión'
                : 'Todas las páginas son accesibles sin autenticación'}
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-accent text-sm font-semibold transition-all ${
              config?.enabled
                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
            } disabled:opacity-60`}
          >
            {toggling ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : config?.enabled ? (
              <ToggleRight className="w-5 h-5" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
            {toggling
              ? 'Cambiando...'
              : config?.enabled
                ? 'Desactivar'
                : 'Activar'}
          </button>
        </div>

        <button
          onClick={loadConfig}
          className="mt-4 flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizar configuración
        </button>
      </div>

      {/* Protected Routes List */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-display text-lg text-[#1a2556] mb-4">
          Rutas Protegidas
        </h3>

        {config?.protected_routes && config.protected_routes.length > 0 ? (
          <div className="space-y-2">
            {config.protected_routes.map((route) => (
              <div
                key={route}
                className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-lg"
              >
                <div className="w-2 h-2 rounded-full bg-[#1a2556]" />
                <code className="text-sm text-[#1a2556] font-mono">
                  {route}
                </code>
                {config.enabled && (
                  <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-accent">
                    Protegida
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            No hay rutas protegidas configuradas
          </p>
        )}
      </div>

      {/* Session Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-display text-lg text-[#1a2556] mb-4">
          Sesión Actual
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-gray-500">Email</span>
            <span className="text-[#1a2556] font-mono">{user.email}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-gray-500">ID</span>
            <span className="text-[#1a2556] font-mono text-xs truncate max-w-[240px]">
              {user.id}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-gray-500">Último acceso</span>
            <span className="text-[#1a2556] text-xs">
              {user.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleString('es-AR')
                : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
