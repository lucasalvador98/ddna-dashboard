'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUsers } from '@/lib/actions/auth-users';
import {
  Users,
  Mail,
  Key,
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  CheckCircle,
  XCircle,
  Calendar,
} from 'lucide-react';
import clsx from 'clsx';

// ── Flash message ─────────────────────────────────────────────────

function FlashMsg({
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

// ── User row ───────────────────────────────────────────────────────

interface SimpleRole {
  id: number;
  name: string;
}

interface UserItem {
  id: string;
  email: string;
  created_at: string;
  role_id: number | null;
  role_name: string | null;
}

function UserRow({
  user: u,
  roles,
  savingUserId,
  onRoleChange,
}: {
  user: UserItem;
  roles: SimpleRole[];
  savingUserId: string | null;
  onRoleChange: (userId: string, roleId: number | null) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100/60 transition-colors">
      <div className="w-9 h-9 rounded-full bg-[#334155]/10 flex items-center justify-center flex-shrink-0">
        <Mail className="w-4 h-4 text-[#334155]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#334155] font-medium truncate">{u.email}</p>
        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
          <Calendar className="w-3 h-3" />
          {new Date(u.created_at).toLocaleDateString('es-AR')}
        </p>
      </div>
      <div className="relative w-36">
        {savingUserId === u.id ? (
          <div className="flex justify-center py-2">
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          </div>
        ) : (
          <select
            value={u.role_id ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              onRoleChange(u.id, val ? Number(val) : null);
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#334155] focus:border-transparent outline-none cursor-pointer"
          >
            <option value="">Sin rol</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────

interface UserRoleManagerProps {
  onFlash: (type: 'ok' | 'err', text: string) => void;
}

export function UserRoleManager({ onFlash }: UserRoleManagerProps) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<SimpleRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  // Add user form
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [adding, setAdding] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [users, rolesRes] = await Promise.all([
        getUsers(),
        fetch('/api/auth/roles'),
      ]);

      const seen = new Set<string>();
      const items: UserItem[] = [];
      for (const u of users) {
        if (!seen.has(u.user_id)) {
          seen.add(u.user_id);
          items.push({
            id: u.user_id,
            email: u.email,
            created_at: u.created_at,
            role_id: u.role_id,
            role_name: u.role_name,
          });
        }
      }
      setUsers(items);

      if (rolesRes.ok) {
        const data = await rolesRes.json();
        setRoles(data.map((r: { id: number; name: string }) => ({ id: r.id, name: r.name })));
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    // Mount-only data fetch — setState in async callback is intentional
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  const handleRoleChange = async (userId: string, roleId: number | null) => {
    setSavingUserId(userId);
    try {
      const res = await fetch(`/api/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role_id: roleId ?? undefined }),
      });
      if (res.ok) {
        await loadData();
        onFlash('ok', 'Rol actualizado');
      } else {
        const d = await res.json();
        onFlash('err', d.error || 'Error al asignar rol');
      }
    } catch {
      onFlash('err', 'Error de conexión');
    }
    setSavingUserId(null);
  };

  const handleAddUser = async () => {
    if (!newEmail || !newPassword) return;
    setAdding(true);
    try {
      const res = await fetch('/api/auth/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, password: newPassword }),
      });
      if (res.ok) {
        setNewEmail('');
        setNewPassword('');
        onFlash('ok', 'Usuario creado');
        await loadData();
      } else {
        const d = await res.json();
        onFlash('err', d.error || 'Error al crear usuario');
      }
    } catch {
      onFlash('err', 'Error de conexión');
    }
    setAdding(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No hay usuarios registrados</p>
      ) : (
        <div className="space-y-1.5">
          {users.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              roles={roles}
              savingUserId={savingUserId}
              onRoleChange={handleRoleChange}
            />
          ))}
        </div>
      )}

      {/* Add user form */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-400 mb-3">Crear nuevo usuario</p>
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[160px] relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#334155] focus:border-transparent outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
            />
          </div>
          <div className="w-36 relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type={showPw ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#334155] focus:border-transparent outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
            />
            <button
              onClick={() => setShowPw(!showPw)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <button
            onClick={handleAddUser}
            disabled={adding || !newEmail || !newPassword}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#334155] text-white rounded-lg text-sm font-medium hover:bg-[#0F172A] disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {adding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}{' '}
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}
