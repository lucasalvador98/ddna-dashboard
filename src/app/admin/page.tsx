'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Loader2, RefreshCw, UserPlus, Users, Mail, Key, Eye, EyeOff } from 'lucide-react';
import { LoginGate } from '@/components/login-gate';
import { useAuth } from '@/components/auth-provider';
import { navigation } from '@/lib/navigation';
import clsx from 'clsx';

interface AuthConfig { enabled: boolean; protected_routes: string[]; }
interface AdminUser { email: string; created_at: string; }

const ALL_ROUTES = [...new Set(navigation.flatMap(g => g.items.map(i => i.href))), '/presupuesto-nnya']
  .filter(r => r !== '/login' && r !== '/');

const ROUTE_INFO: Record<string, { label: string; icon: string; group: string }> = {
  '/salud': { label: 'Salud', icon: '❤️', group: 'Salud' },
  '/salud-adolescente': { label: 'Salud Adolescente', icon: '🩺', group: 'Salud' },
  '/educacion': { label: 'Educación', icon: '📚', group: 'Educación' },
  '/pobreza': { label: 'Pobreza e Indigencia', icon: '📊', group: 'Condiciones Sociales' },
  '/encuestas': { label: 'Encuestas 2024', icon: '📋', group: 'Condiciones Sociales' },
  '/infancias': { label: 'Infancias (UCA)', icon: '👶', group: 'Condiciones Sociales' },
  '/seguridad': { label: 'Justicia', icon: '⚖️', group: 'Seguridad' },
  '/inversion': { label: 'Inversión Social', icon: '💰', group: 'Inversión' },
  '/presupuesto-nnya': { label: 'Presupuesto NNyA', icon: '🏛️', group: 'Inversión' },
  '/geo': { label: 'Mapas', icon: '🗺️', group: 'Herramientas' },
  '/repositorio': { label: 'Repositorio', icon: '📁', group: 'Herramientas' },
  '/fuentes': { label: 'Fuentes de Datos', icon: '🗄️', group: 'Herramientas' },
  '/ejecutivo': { label: 'Informe Ejecutivo', icon: '📄', group: 'Herramientas' },
  '/admin': { label: 'Configuración', icon: '⚙️', group: 'Admin' },
};

const GROUPS = ['Salud', 'Educación', 'Condiciones Sociales', 'Seguridad', 'Inversión', 'Herramientas', 'Admin'];

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const showMsg = (type: 'ok' | 'err', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const loadConfig = useCallback(async () => {
    try { const r = await fetch('/api/auth/config'); if (r.ok) setConfig(await r.json()); } catch {}
    setLoading(false);
  }, []);

  const loadAdmins = useCallback(async () => {
    try { const r = await fetch('/api/auth/admins'); if (r.ok) setAdmins(await r.json()); } catch {}
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
      await fetch('/api/auth/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: true, protected_routes: newRoutes }) });
      showMsg('ok', `"${ROUTE_INFO[route]?.label}": ${isProtected ? 'pública' : 'restringida'}`);
    } catch { setConfig(config); showMsg('err', 'Error al guardar'); }
    setSaving(null);
  };

  const addAdmin = async () => {
    if (!newEmail || !newPassword) return;
    setAdding(true);
    try {
      const r = await fetch('/api/auth/admins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: newEmail, password: newPassword }) });
      if (r.ok) { setNewEmail(''); setNewPassword(''); showMsg('ok', 'Administrador agregado'); loadAdmins(); }
      else { const d = await r.json(); showMsg('err', d.error || 'Error'); }
    } catch { showMsg('err', 'Error de conexión'); }
    setAdding(false);
  };

  if (authLoading || loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#1a2556] animate-spin" /></div>;
  if (!user) return <LoginGate><div /></LoginGate>;

  const protectedCount = config?.protected_routes.length ?? 0;

  return (
    <LoginGate>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-[#1a2556]">Configuración</h1>
            <p className="text-sm text-gray-500 mt-1">{protectedCount} de {ALL_ROUTES.length} páginas requieren autenticación</p>
          </div>
          <button onClick={() => { loadConfig(); loadAdmins(); }} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Actualizar
          </button>
        </div>

        {msg && (
          <div className={clsx('flex items-center gap-2 px-4 py-3 rounded-xl text-sm animate-in fade-in', msg.type === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200')}>
            {msg.type === 'ok' ? '✅' : '❌'} {msg.text}
          </div>
        )}

        {/* Pages */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <Shield className="w-5 h-5 text-[#1a2556]" />
            <h2 className="font-display text-lg text-[#1a2556]">Control de acceso por página</h2>
          </div>
          <div className="p-4 space-y-6">
            {GROUPS.map(group => {
              const groupRoutes = ALL_ROUTES.filter(r => ROUTE_INFO[r]?.group === group);
              if (groupRoutes.length === 0) return null;
              return (
                <div key={group}>
                  <p className="font-accent text-xs text-gray-400 uppercase tracking-wide mb-2 px-2">{group}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groupRoutes.map(route => {
                      const info = ROUTE_INFO[route] || { label: route, icon: '📄' };
                      const isProtected = config?.protected_routes.includes(route) ?? false;
                      return (
                        <button
                          key={route}
                          onClick={() => toggleRoute(route)}
                          disabled={saving === route}
                          className={clsx(
                            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all border',
                            isProtected ? 'bg-amber-50 border-amber-300 shadow-sm' : 'bg-gray-50 border-transparent hover:border-gray-200 hover:bg-white',
                            saving === route && 'opacity-50'
                          )}
                        >
                          <span className="text-lg">{info.icon}</span>
                          <span className="flex-1 text-left font-medium text-[#1a2556]">{info.label}</span>
                          {saving === route ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          ) : isProtected ? (
                            <span className="text-xs font-accent text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">restringida</span>
                          ) : (
                            <span className="text-xs font-accent text-green-700 bg-green-100 px-2 py-0.5 rounded-full">pública</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Admins */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <Users className="w-5 h-5 text-[#1a2556]" />
            <h2 className="font-display text-lg text-[#1a2556]">Administradores</h2>
          </div>
          <div className="p-6 space-y-4">
            {admins.length > 0 && (
              <div className="space-y-2">
                {admins.map(a => (
                  <div key={a.email} className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-[#1a2556]/10 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-[#1a2556]" />
                    </div>
                    <span className="text-sm text-[#1a2556] font-medium">{a.email}</span>
                    <span className="ml-auto text-xs text-gray-400">desde {new Date(a.created_at).toLocaleDateString('es-AR')}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  placeholder="Email del nuevo administrador"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1a2556] focus:border-transparent"
                  onKeyDown={e => e.key === 'Enter' && addAdmin()}
                />
              </div>
              <div className="relative w-48">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1a2556] focus:border-transparent"
                  onKeyDown={e => e.key === 'Enter' && addAdmin()}
                />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={addAdmin} disabled={adding || !newEmail || !newPassword}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1a2556] text-white rounded-xl text-sm font-medium hover:bg-[#0d1530] disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
    </LoginGate>
  );
}
