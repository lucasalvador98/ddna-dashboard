'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Mail,
  UserPlus,
  Loader2,
  CheckCircle,
  XCircle,
  Calendar,
} from 'lucide-react';
import clsx from 'clsx';
import type { UserRole } from '@/lib/rbac-types';

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

// ── Main component ─────────────────────────────────────────────────

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

interface UserRoleManagerProps {
  onFlash: (type: 'ok' | 'err', text: string) => void;
}

export function UserRoleManager({ onFlash }: UserRoleManagerProps) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<SimpleRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/auth/users'),
        fetch('/api/auth/roles'),
      ]);

      if (usersRes.ok) {
        const data: UserRole[] = await usersRes.json();
        // Map to UserItem format
        const seen = new Set<string>();
        const items: UserItem[] = [];
        for (const u of data) {
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
      }

      if (rolesRes.ok) {
        const data = await rolesRes.json();
        setRoles(data.map((r: { id: number; name: string }) => ({ id: r.id, name: r.name })));
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {users.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No hay usuarios registrados</p>
      ) : (
        users.map((u) => (
          <div
            key={u.id}
            className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl"
          >
            <div className="w-9 h-9 rounded-full bg-[#1a2556]/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-[#1a2556]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#1a2556] font-medium truncate">{u.email}</p>
              <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" />
                {new Date(u.created_at).toLocaleDateString('es-AR')}
              </p>
            </div>
            <div className="relative w-40">
              {savingUserId === u.id ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                </div>
              ) : (
                <select
                  value={u.role_id ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleRoleChange(u.id, val ? Number(val) : null);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1a2556] focus:border-transparent outline-none cursor-pointer"
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
        ))
      )}
    </div>
  );
}
