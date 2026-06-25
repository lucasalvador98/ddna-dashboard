'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Loader2, RefreshCw, Lock, Globe, UserPlus, Users, Mail } from 'lucide-react';
import { LoginGate } from '@/components/login-gate';
import { useAuth } from '@/components/auth-provider';
import { navigation } from '@/lib/navigation';
import clsx from 'clsx';

interface AuthConfig {
  enabled: boolean;
  protected_routes: string[];
}

interface AdminUser {
  email: string;
  created_at: string;
}

const ALL_ROUTES = [
  ...new Set(navigation.flatMap(g => g.items.map(i => i.href))),
  '/presupuesto-nnya',
].filter(r => r !== '/login' && r !== '/');

const ROUTE_LABELS: Record<string, string> = {
  '/salud': 'Salud', '/salud-adolescente': 'Salud Adolescente',
  '/educacion': 'Educación', '/pobreza': 'Pobreza e Indigencia',
  '/encuestas': 'Encuestas 2024', '/infancias': 'Infancias (UCA)',
  '/seguridad': 'Justicia', '/inversion': 'Inversión Social',
  '/presupuesto-nnya': 'Presupuesto NNyA', '/geo': 'Mapas',
  '/repositorio': 'Repositorio', '/fuentes': 'Fuentes de Datos',
  '/ejecutivo': 'Informe Ejecutivo', '/admin': 'Configuración',
};

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/config');
      if (res.ok) setConfig(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const loadAdmins = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/admins');
      if (res.ok) setAdmins(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadConfig(); loadAdmins(); }, [loadConfig, loadAdmins]);

  const toggleRoute = async (route: string) => {
    if (!config) return;
    setSaving(route);
    const isProtected = config.protected_routes.includes(route);
    const newRoutes = isProtected
      ? config.protected_routes.filter(r => r !== route)
      : [...config.protected_routes, route];

    setConfig({ ...config, protected_routes: newRoutes });
    try {
      await fetch('/api/auth/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: true, protected_routes: newRoutes }),
      });
      setMsg({ type: 'ok', text: `${ROUTE_LABELS[route]}: ${isProtected ? 'liberada' : 'restringida'}` });
    } catch {
      setConfig(config);
      setMsg({ type: 'err', text: 'Error al guardar' });
    }
    setSaving(null);
  };

  const addAdmin = async () => {
    if (!newAdminEmail) return;
    setAddingAdmin(true);
    try {
      const res = await fetch('/api/auth/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail, password: 'Ddna2026!' }),
      });
      if (res.ok) {
        setNewAdminEmail('');
        setMsg({ type: 'ok', text: 'Admin agregado correctamente' });
        loadAdmins();
      } else {
        const d = await res.json();
        setMsg({ type: 'err', text: d.error || 'Error al agregar admin' });
      }
    } catch {
      setMsg({ type: 'err', text: 'Error de conexión' });
    }
    setAddingAdmin(false);
  };

  if (authLoading || loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#1a2556] animate-spin" /></div>;
  }

  if (!user) {
    return <LoginGate><div /></LoginGate>;
  }

  const protectedCount = config?.protected_routes.length ?? 0;

  return (
    <LoginGate>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-[#1a2556]">Configuración</h1>
          <button onClick={() => { loadConfig(); loadAdmins(); }} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
            <RefreshCw className="w-3 h-3" /> Actualizar
          </button>
        </div>

        {msg && (
          <div className={clsx('p-3 rounded-lg text-sm', msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
            {msg.text}
          </div>
        )}

        {/* Páginas protegidas */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-5 h-5 text-[#1a2556]" />
            <h2 className="font-display text-lg text-[#1a2556]">Restringir páginas</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            {protectedCount} de {ALL_ROUTES.length} páginas requieren login. Las que no están marcadas son públicas.
          </p>
          <div className="space-y-1">
            {ALL_ROUTES.map(route => {
              const isProtected = config?.protected_routes.includes(route) ?? false;
              return (
                <button
                  key={route}
                  onClick={() => toggleRoute(route)}
                  disabled={saving === route}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all text-sm',
                    isProtected ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 hover:bg-gray-100',
                    saving === route && 'opacity-60'
                  )}
                >
                  {saving === route ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : isProtected ? (
                    <Lock className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Globe className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="flex-1 font-medium text-[#1a2556]">{ROUTE_LABELS[route] || route}</span>
                  <span className="text-xs text-gray-400 font-mono">{route}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Administradores */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-[#1a2556]" />
            <h2 className="font-display text-lg text-[#1a2556]">Administradores</h2>
          </div>

          {admins.length > 0 && (
            <div className="space-y-2 mb-4">
              {admins.map(a => (
                <div key={a.email} className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-lg text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-[#1a2556]">{a.email}</span>
                  <span className="ml-auto text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString('es-AR')}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="email"
              value={newAdminEmail}
              onChange={e => setNewAdminEmail(e.target.value)}
              placeholder="Email del nuevo administrador"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1a2556] focus:border-transparent"
              onKeyDown={e => e.key === 'Enter' && addAdmin()}
            />
            <button
              onClick={addAdmin}
              disabled={addingAdmin || !newAdminEmail}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2556] text-white rounded-lg text-sm font-medium hover:bg-[#0d1530] disabled:opacity-50 transition-colors"
            >
              {addingAdmin ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Agregar
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Los nuevos administradores reciben la contraseña temporal <code>Ddna2026!</code>. Deben cambiarla en su primer inicio de sesión.
          </p>
        </div>
      </div>
    </LoginGate>
  );
}
