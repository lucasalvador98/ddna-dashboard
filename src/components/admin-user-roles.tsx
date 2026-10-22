'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUsers } from '@/lib/actions/auth-users';
import { dashboardPath } from '@/lib/app-path';
import { APP_ROUTES, type PermissionsPayload, type PermissionEntry } from '@/lib/rbac-types';
import {
  Mail,
  Key,
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  Calendar,
  SlidersHorizontal,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import clsx from 'clsx';

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
  expanded,
  onRoleChange,
  onToggleScreens,
}: {
  user: UserItem;
  roles: SimpleRole[];
  savingUserId: string | null;
  expanded: boolean;
  onRoleChange: (userId: string, roleId: number | null) => void;
  onToggleScreens: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100/60 transition-colors">
      <div className="w-9 h-9 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
        <Mail className="w-4 h-4 text-navy" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-navy font-medium truncate">{u.email}</p>
        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
          <Calendar className="w-3 h-3" />
          {new Date(u.created_at).toLocaleDateString('es-AR')}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggleScreens}
        aria-expanded={expanded}
        title="Pantallas adicionales de este usuario"
        className={clsx(
          'flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors',
          expanded
            ? 'bg-navy text-white'
            : 'text-gray-500 hover:text-navy hover:bg-gray-200/70'
        )}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Pantallas
      </button>
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
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-navy focus:border-transparent outline-none cursor-pointer"
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

// ── Per-user screen extras ─────────────────────────────────────────
//
// public.user_permissions are ADDITIONS on top of the role base: checking a
// route here grants it to this user even when the role does not have it.
// Nothing can be revoked here (that lives in the Roles tab), so routes the
// role already grants show up as read-only "heredado".

type PermissionDraft = Record<string, PermissionEntry>;

function ScreensEditor({
  userId,
  roleName,
  onFlash,
  onClose,
}: {
  userId: string;
  roleName: string | null;
  onFlash: (type: 'ok' | 'err', text: string) => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [base, setBase] = useState<PermissionsPayload['base_permissions']>([]);
  const [draft, setDraft] = useState<PermissionDraft>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(dashboardPath(`/api/auth/users/${userId}/permissions`));
      const data = (await res.json().catch(() => null)) as
        | PermissionsPayload
        | { error?: string }
        | null;

      if (!res.ok || !data || !('base_permissions' in data)) {
        setError(
          (data as { error?: string } | null)?.error ??
            `No se pudieron cargar los permisos (HTTP ${res.status})`
        );
        setLoading(false);
        return;
      }

      setBase(data.base_permissions ?? []);

      const next: PermissionDraft = {};
      for (const row of data.extras ?? []) {
        next[row.route] = { can_view: row.can_view, can_edit: row.can_edit };
      }
      setDraft(next);
    } catch {
      setError('Error de conexión al cargar los permisos');
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    // Loads when the row is expanded — setState in async callback is intentional
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const setView = (route: string, value: boolean) => {
    setDraft((prev) => ({
      ...prev,
      [route]: { can_view: value, can_edit: value ? (prev[route]?.can_edit ?? false) : false },
    }));
  };

  const setEdit = (route: string, value: boolean) => {
    setDraft((prev) => ({
      ...prev,
      [route]: { can_view: (prev[route]?.can_view ?? false) || value, can_edit: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Only granted rows are persisted: extras add, they never revoke.
      const permissions = Object.entries(draft)
        .filter(([, value]) => value.can_view)
        .map(([route, value]) => ({
          route,
          can_view: value.can_view,
          can_edit: value.can_edit,
        }));

      const res = await fetch(dashboardPath(`/api/auth/users/${userId}/permissions`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        const message = data?.error || 'Error al guardar las pantallas adicionales';
        setError(message);
        onFlash('err', message);
      } else {
        onFlash('ok', 'Pantallas adicionales actualizadas');
        onClose();
      }
    } catch {
      setError('Error de conexión');
      onFlash('err', 'Error de conexión');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
      <div className="flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-navy mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-navy">
            Pantallas adicionales
            {roleName ? <span className="text-gray-400 font-normal"> · rol {roleName}</span> : null}
          </p>
          <p className="text-xs text-gray-400">
            Sumá pantallas que el rol no tiene. Lo heredado del rol se edita en la pestaña Roles y
            no se puede quitar acá.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs bg-red-50 text-red-700 border border-red-200">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{error}</p>
            <button type="button" onClick={() => void load()} className="mt-1 font-medium underline">
              Reintentar
            </button>
          </div>
        </div>
      )}

      <div className="max-h-72 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-100">
        {APP_ROUTES.map(({ route, label }) => {
          const baseEntry = base.find((b) => b.route === route);
          const inheritedView = baseEntry?.can_view === true;
          const inheritedEdit = baseEntry?.can_edit === true;
          const entry = draft[route] ?? { can_view: false, can_edit: false };
          const viewChecked = inheritedView || entry.can_view;
          const editChecked = inheritedEdit || entry.can_edit;

          return (
            <div key={route} className="flex items-center gap-3 px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-navy truncate">{label}</p>
                <p className="text-[10px] text-gray-400 font-mono truncate">{route}</p>
              </div>
              {inheritedView && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 whitespace-nowrap">
                  heredado
                </span>
              )}
              <label className="flex items-center gap-1.5 text-xs text-gray-600 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={viewChecked}
                  disabled={inheritedView || saving}
                  onChange={(e) => setView(route, e.target.checked)}
                  className="rounded border-gray-300 text-navy focus:ring-navy disabled:opacity-50"
                />
                Ver
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-600 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={editChecked}
                  disabled={inheritedEdit || saving || !viewChecked}
                  onChange={(e) => setEdit(route, e.target.checked)}
                  className="rounded border-gray-300 text-navy focus:ring-navy disabled:opacity-50"
                />
                Editar
              </label>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Cerrar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-navy text-white rounded-lg text-xs font-medium hover:bg-[#050506] disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          Guardar pantallas
        </button>
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Add user form
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRoleId, setNewRoleId] = useState<number | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const [users, rolesRes] = await Promise.all([
        getUsers(),
        fetch(dashboardPath('/api/auth/roles')),
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

      if (!rolesRes.ok) {
        throw new Error(`no se pudieron cargar los roles (HTTP ${rolesRes.status})`);
      }

      const data = (await rolesRes.json()) as Array<{ id: number; name: string }>;
      const simpleRoles = data.map((r) => ({ id: r.id, name: r.name }));
      setRoles(simpleRoles);
      setNewRoleId((current) => current ?? simpleRoles[0]?.id ?? null);
    } catch (err) {
      // Visible error instead of the previous silent catch
      setLoadError(err instanceof Error ? err.message : 'Error desconocido');
    }
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
      const res = await fetch(dashboardPath(`/api/auth/users/${userId}/role`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // null is accepted by the API: it removes the assignment ("Sin rol")
        body: JSON.stringify({ role_id: roleId }),
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
    setFormError(null);
    try {
      const res = await fetch(dashboardPath('/api/auth/admins'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          ...(newRoleId !== null ? { role_id: newRoleId } : {}),
        }),
      });
      if (res.ok) {
        setNewEmail('');
        setNewPassword('');
        onFlash('ok', 'Usuario creado');
        await loadData();
      } else {
        const d = await res.json().catch(() => ({}));
        const message = (d as { error?: string }).error || 'Error al crear usuario';
        setFormError(message);
        onFlash('err', message);
      }
    } catch {
      setFormError('Error de conexión');
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
      {loadError && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>No se pudieron cargar los usuarios: {loadError}</p>
            <button
              type="button"
              onClick={() => void loadData()}
              className="mt-1 text-xs font-medium underline"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No hay usuarios registrados</p>
      ) : (
        <div className="space-y-1.5">
          {users.map((u) => {
            const expanded = expandedUserId === u.id;

            return (
              <div key={u.id} className="space-y-2">
                <UserRow
                  user={u}
                  roles={roles}
                  savingUserId={savingUserId}
                  expanded={expanded}
                  onRoleChange={handleRoleChange}
                  onToggleScreens={() => setExpandedUserId(expanded ? null : u.id)}
                />
                {expanded && (
                  <ScreensEditor
                    // Changing the role changes the base matrix, so remount
                    key={`${u.id}:${u.role_id ?? 'sin_rol'}`}
                    userId={u.id}
                    roleName={u.role_name}
                    onFlash={onFlash}
                    onClose={() => setExpandedUserId(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add user form */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-400 mb-3">Crear nuevo usuario</p>
        {formError && (
          <div className="flex items-start gap-2 px-3 py-2 mb-3 rounded-lg text-xs bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <p className="flex-1">{formError}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[160px] relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy focus:border-transparent outline-none"
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
              className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy focus:border-transparent outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
            />
            <button
              onClick={() => setShowPw(!showPw)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <select
            aria-label="Rol del nuevo usuario"
            value={newRoleId ?? ''}
            onChange={(e) => setNewRoleId(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-navy focus:border-transparent outline-none cursor-pointer"
          >
            {roles.length === 0 && <option value="">Sin roles</option>}
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddUser}
            disabled={adding || !newEmail || !newPassword}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-navy text-white rounded-lg text-sm font-medium hover:bg-[#050506] disabled:opacity-50 transition-colors whitespace-nowrap"
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
