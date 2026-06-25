'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Loader2, RefreshCw, UserPlus, Mail, Key, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { LoginGate } from '@/components/login-gate';
import { useAuth } from '@/components/auth-provider';
import clsx from 'clsx';

interface AdminUser { email: string; created_at: string; }

const PROTECTED_ROUTES = ['/admin', '/geo', '/repositorio', '/fuentes', '/ejecutivo', '/presupuesto-nnya'];

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const flash = (type: 'ok' | 'err', text: string) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 4000); };

  const loadConfig = useCallback(async () => {
    try { const r = await fetch('/api/auth/config'); if (r.ok) setEnabled((await r.json()).enabled ?? false); } catch {}
    setLoading(false);
  }, []);

  const loadAdmins = useCallback(async () => {
    setAdminsLoading(true);
    try { const r = await fetch('/api/auth/admins'); if (r.ok) setAdmins(await r.json()); } catch {}
    setAdminsLoading(false);
  }, []);

  useEffect(() => { loadConfig(); loadAdmins(); }, [loadConfig, loadAdmins]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const r = await fetch('/api/auth/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: !enabled, protected_routes: PROTECTED_ROUTES }) });
      if (r.ok) { setEnabled(!enabled); flash('ok', !enabled ? 'Autenticación activada' : 'Autenticación desactivada'); }
      else flash('err', 'Error al cambiar');
    } catch { flash('err', 'Error de conexión'); }
    setToggling(false);
  };

  const addAdmin = async () => {
    if (!newEmail || !newPassword) return;
    setAdding(true);
    try {
      const r = await fetch('/api/auth/admins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: newEmail, password: newPassword }) });
      if (r.ok) { setNewEmail(''); setNewPassword(''); flash('ok', 'Admin agregado'); loadAdmins(); }
      else { const d = await r.json(); flash('err', d.error || 'Error'); }
    } catch { flash('err', 'Error de conexión'); }
    setAdding(false);
  };

  if (authLoading || loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#1a2556] animate-spin" /></div>;
  if (!user) return <LoginGate><div /></LoginGate>;

  return (
    <LoginGate>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-[#1a2556]">Configuración</h1>
          <button onClick={() => { loadConfig(); loadAdmins(); }} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600">
            <RefreshCw className="w-3.5 h-3.5" /> Actualizar
          </button>
        </div>

        {msg && (
          <div className={clsx('flex items-center gap-2 px-4 py-3 rounded-xl text-sm', msg.type === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200')}>
            {msg.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} {msg.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Acceso */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-[#1a2556]" />
              <h2 className="font-display text-lg text-[#1a2556]">Control de acceso</h2>
            </div>
            <div className={clsx('p-5 rounded-xl mb-4', enabled ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-100')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-accent text-sm font-semibold text-[#1a2556]">{enabled ? '🔒 Autenticación activada' : '🔓 Sin restricciones'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{enabled ? '6 páginas requieren inicio de sesión' : 'Todas las páginas son públicas'}</p>
                </div>
                <button onClick={handleToggle} disabled={toggling} className={clsx('px-5 py-2.5 rounded-xl text-sm font-accent font-semibold transition-all', enabled ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200', 'disabled:opacity-60')}>
                  {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : enabled ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-3">Páginas protegidas cuando la autenticación está activa:</p>
            <div className="grid grid-cols-2 gap-2">
              {PROTECTED_ROUTES.map(r => (
                <div key={r} className={clsx('flex items-center gap-2 px-3 py-2 rounded-lg text-xs', enabled ? 'bg-amber-50 text-amber-800' : 'bg-gray-50 text-gray-500')}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: enabled ? '#D97706' : '#9CA3AF' }} />
                  {r === '/admin' ? 'Configuración' : r === '/geo' ? 'Mapas' : r === '/repositorio' ? 'Repositorio' : r === '/fuentes' ? 'Fuentes' : r === '/ejecutivo' ? 'Inf. Ejecutivo' : 'Presupuesto NNyA'}
                </div>
              ))}
            </div>
          </div>

          {/* Usuarios */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-5 h-5 text-[#1a2556]" />
              <h2 className="font-display text-lg text-[#1a2556]">Administradores</h2>
            </div>
            {adminsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>
            ) : admins.length > 0 ? (
              <div className="space-y-2 mb-4">
                {admins.map(a => (
                  <div key={a.email} className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-lg text-sm">
                    <div className="w-7 h-7 rounded-full bg-[#1a2556]/10 flex items-center justify-center flex-shrink-0"><Mail className="w-3.5 h-3.5 text-[#1a2556]" /></div>
                    <span className="text-[#1a2556] font-medium truncate">{a.email}</span>
                    <span className="ml-auto text-xs text-gray-400 flex-shrink-0">{new Date(a.created_at).toLocaleDateString('es-AR')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No hay administradores</p>
            )}
            <div className="flex gap-2">
              <div className="flex-1 min-w-0 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email" className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1a2556] focus:border-transparent" onKeyDown={e => e.key === 'Enter' && addAdmin()} />
              </div>
              <div className="w-40 relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Clave" className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1a2556] focus:border-transparent" onKeyDown={e => e.key === 'Enter' && addAdmin()} />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
              </div>
              <button onClick={addAdmin} disabled={adding || !newEmail || !newPassword} className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a2556] text-white rounded-lg text-sm font-medium hover:bg-[#0d1530] disabled:opacity-50 transition-colors whitespace-nowrap">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
    </LoginGate>
  );
}
