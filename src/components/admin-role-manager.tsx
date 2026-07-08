'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Edit3,
} from 'lucide-react';
import clsx from 'clsx';
import { APP_ROUTES } from '@/lib/rbac-types';
import type { Role, RolePermission } from '@/lib/rbac-types';

// ── Permissions table ──────────────────────────────────────────────

function PermTable({
  perms,
  onUpdate,
  saving,
}: {
  perms: RolePermission[];
  onUpdate: (route: string, field: 'can_view' | 'can_edit', value: boolean) => void;
  saving: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-2.5 text-[10px] text-gray-400 uppercase tracking-wider font-medium">
              Pantalla
            </th>
            <th className="text-left px-4 py-2.5 text-[10px] text-gray-400 uppercase tracking-wider font-medium hidden sm:table-cell">
              Ruta
            </th>
            <th className="text-center px-4 py-2.5 text-[10px] text-gray-400 uppercase tracking-wider font-medium w-16">
              <span className="inline-flex items-center gap-1">
                <Eye className="w-3 h-3" /> Ver
              </span>
            </th>
            <th className="text-center px-4 py-2.5 text-[10px] text-gray-400 uppercase tracking-wider font-medium w-16">
              <span className="inline-flex items-center gap-1">
                <Edit3 className="w-3 h-3" /> Editar
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {perms.map((p) => {
            const routeDef = APP_ROUTES.find((r) => r.route === p.route);
            return (
              <tr key={p.route} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-2.5 text-sm text-[#1a2556] font-medium">
                  {routeDef?.label ?? p.route}
                </td>
                <td className="px-4 py-2.5 text-[11px] text-gray-400 font-mono hidden sm:table-cell">
                  {p.route}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <label className="inline-flex items-center justify-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={p.can_view}
                      onChange={(e) => onUpdate(p.route, 'can_view', e.target.checked)}
                      disabled={saving}
                      className="w-4 h-4 rounded border-gray-300 text-[#1a2556] focus:ring-[#1a2556] disabled:opacity-50"
                    />
                  </label>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <label className="inline-flex items-center justify-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={p.can_edit}
                      onChange={(e) => onUpdate(p.route, 'can_edit', e.target.checked)}
                      disabled={saving}
                      className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-600 disabled:opacity-50"
                    />
                  </label>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────

interface RoleManagerProps {
  onFlash: (type: 'ok' | 'err', text: string) => void;
}

export function RoleManager({ onFlash }: RoleManagerProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected role
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [perms, setPerms] = useState<RolePermission[]>([]);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Create role form
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const loadRoles = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
        // Keep selection or default to first role
        if (selectedRoleId) {
          const stillExists = data.some((r: Role) => r.id === selectedRoleId);
          if (!stillExists && data.length > 0) {
            setSelectedRoleId(data[0].id);
          }
        } else if (data.length > 0) {
          setSelectedRoleId(data[0].id);
        }
      }
    } catch {}
    setLoading(false);
  }, [selectedRoleId]);

  useEffect(() => {
    loadRoles();
  }, []); // Only on mount

  // When roles load or selection changes, update local permissions
  useEffect(() => {
    if (!selectedRoleId || roles.length === 0) return;
    const role = roles.find((r) => r.id === selectedRoleId);
    if (role) {
      setPerms(JSON.parse(JSON.stringify(role.permissions))); // deep clone
      setHasChanges(false);
    }
  }, [selectedRoleId, roles]);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const isBuiltIn = selectedRole?.name === 'admin' || selectedRole?.name === 'editor' || selectedRole?.name === 'visor';

  const handlePermChange = (route: string, field: 'can_view' | 'can_edit', value: boolean) => {
    setPerms((prev) =>
      prev.map((p) => (p.route === route ? { ...p, [field]: value } : p)),
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      const payload = {
        permissions: perms.map((p) => ({
          route: p.route,
          can_view: p.can_view,
          can_edit: p.can_edit,
        })),
      };
      const res = await fetch(`/api/auth/roles/${selectedRoleId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setHasChanges(false);
        onFlash('ok', 'Permisos actualizados');
        await loadRoles(); // refresh
      } else {
        const d = await res.json();
        onFlash('err', d.error || 'Error al guardar');
      }
    } catch {
      onFlash('err', 'Error de conexión');
    }
    setSaving(false);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/auth/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() || undefined }),
      });
      if (res.ok) {
        await loadRoles();
        setNewName('');
        setNewDesc('');
        onFlash('ok', `Rol "${newName.trim()}" creado`);
      } else {
        const d = await res.json();
        onFlash('err', d.error || 'Error al crear rol');
      }
    } catch {
      onFlash('err', 'Error de conexión');
    }
    setCreating(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este rol? Se quitarán los permisos de los usuarios asignados.')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/auth/roles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedRoleId === id) setSelectedRoleId(null);
        await loadRoles();
        onFlash('ok', 'Rol eliminado');
      } else {
        const d = await res.json();
        onFlash('err', d.error || 'Error al eliminar');
      }
    } catch {
      onFlash('err', 'Error de conexión');
    }
    setDeleting(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Role tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRoleId(role.id)}
            className={clsx(
              'inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all border',
              selectedRoleId === role.id
                ? 'bg-[#1a2556] text-white border-[#1a2556] shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800',
            )}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="capitalize">{role.name}</span>
            <span className={clsx(
              'text-[10px] px-1.5 py-0.5 rounded-full',
              selectedRoleId === role.id
                ? 'bg-white/20 text-white/80'
                : 'bg-gray-100 text-gray-400',
            )}>
              {role.permissions.length}
            </span>
          </button>
        ))}

        {/* Add role button */}
        <button
          onClick={() => setCreating(!creating)}
          className={clsx(
            'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border border-dashed',
            creating
              ? 'bg-gray-100 text-gray-500 border-gray-300'
              : 'bg-white text-gray-400 border-gray-300 hover:border-gray-400 hover:text-gray-600',
          )}
        >
          <Plus className="w-3.5 h-3.5" /> Nuevo rol
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[160px]">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Nombre</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="ej: colaborador"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1a2556] focus:border-transparent outline-none bg-white"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>
            <div className="flex-[2] min-w-[200px]">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Descripción</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Opcional — ¿qué puede hacer este rol?"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1a2556] focus:border-transparent outline-none bg-white"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1a2556] text-white rounded-lg text-sm font-medium hover:bg-[#0d1530] disabled:opacity-50 transition-colors"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Crear
            </button>
          </div>
        </div>
      )}

      {/* Permission editor for selected role */}
      {selectedRole && (
        <div>
          {/* Role header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-[#1a2556] capitalize">{selectedRole.name}</p>
              {selectedRole.description && (
                <p className="text-xs text-gray-400">{selectedRole.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isBuiltIn && (
                <button
                  onClick={() => handleDelete(selectedRole.id)}
                  disabled={deleting === selectedRole.id}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleting === selectedRole.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  Eliminar
                </button>
              )}
              {isBuiltIn && (
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-md">Rol fijo</span>
              )}
            </div>
          </div>

          {/* Permissions table */}
          <PermTable perms={perms} onUpdate={handlePermChange} saving={saving} />

          {/* Save bar */}
          <div className={clsx(
            'flex items-center justify-end gap-3 pt-3 transition-all',
            hasChanges ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}>
            {hasChanges && (
              <span className="text-xs text-amber-600">Tenés cambios sin guardar</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#1a2556] text-white rounded-lg text-sm font-medium hover:bg-[#0d1530] disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Guardar permisos
            </button>
          </div>
        </div>
      )}

      {!selectedRole && roles.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">No hay roles creados. Creá el primero.</p>
      )}
    </div>
  );
}
