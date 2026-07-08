'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  ShieldPlus,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Settings,
  Eye,
  Edit3,
} from 'lucide-react';
import clsx from 'clsx';
import { APP_ROUTES } from '@/lib/rbac-types';
import type { Role, RolePermission } from '@/lib/rbac-types';

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

// ── Permission checkbox row ────────────────────────────────────────

function PermRow({
  label,
  route,
  canView,
  canEdit,
  onViewChange,
  onEditChange,
}: {
  label: string;
  route: string;
  canView: boolean;
  canEdit: boolean;
  onViewChange: (v: boolean) => void;
  onEditChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
      <span className="flex-1 text-sm text-[#1a2556] font-medium">{label}</span>
      <span className="text-[10px] text-gray-400 font-mono w-20 text-right">{route}</span>
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={canView}
          onChange={(e) => onViewChange(e.target.checked)}
          className="w-3.5 h-3.5 rounded border-gray-300 text-[#1a2556] focus:ring-[#1a2556]"
        />
        <Eye className="w-3 h-3 text-gray-400" />
      </label>
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={canEdit}
          onChange={(e) => onEditChange(e.target.checked)}
          className="w-3.5 h-3.5 rounded border-gray-300 text-amber-600 focus:ring-amber-600"
        />
        <Edit3 className="w-3 h-3 text-gray-400" />
      </label>
    </div>
  );
}

// ── Single role card ───────────────────────────────────────────────

function RoleCard({
  role,
  onDelete,
  onSavePerms,
}: {
  role: Role;
  onDelete: (id: number) => void;
  onSavePerms: (roleId: number, perms: RolePermission[]) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [perms, setPerms] = useState<RolePermission[]>(role.permissions);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const isBuiltIn = role.name === 'admin' || role.name === 'editor' || role.name === 'visor';
  const hasChanges = JSON.stringify(perms) !== JSON.stringify(role.permissions);

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        permissions: perms.map((p) => ({
          route: p.route,
          can_view: p.can_view,
          can_edit: p.can_edit,
        })),
      };
      const res = await fetch(`/api/auth/roles/${role.id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMsg({ type: 'ok', text: 'Permisos actualizados' });
      } else {
        const d = await res.json();
        setMsg({ type: 'err', text: d.error || 'Error al guardar' });
      }
    } catch {
      setMsg({ type: 'err', text: 'Error de conexión' });
    }
    setSaving(false);
  };

  const handleViewChange = (route: string, v: boolean) => {
    setPerms((prev) => prev.map((p) => (p.route === route ? { ...p, can_view: v } : p)));
  };

  const handleEditChange = (route: string, v: boolean) => {
    setPerms((prev) => prev.map((p) => (p.route === route ? { ...p, can_edit: v } : p)));
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
        <div className="w-7 h-7 rounded-lg bg-[#1a2556]/10 flex items-center justify-center flex-shrink-0">
          <Shield className="w-3.5 h-3.5 text-[#1a2556]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1a2556] capitalize">{role.name}</p>
          <p className="text-[11px] text-gray-400 truncate">
            {role.description ?? 'Sin descripción'} — {role.permissions.length} pantallas
          </p>
        </div>
        {isBuiltIn ? (
          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">Fijo</span>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(role.id);
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar rol"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </button>

      {/* Expanded permissions */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-1">
          <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-wider mb-2 px-3">
            <span className="flex-1">Pantalla</span>
            <span className="w-20 text-right">Ruta</span>
            <span className="w-8 text-center" title="Ver">
              <Eye className="w-3 h-3 inline" />
            </span>
            <span className="w-8 text-center" title="Editar">
              <Edit3 className="w-3 h-3 inline" />
            </span>
          </div>
          {perms.map((p) => {
            const routeDef = APP_ROUTES.find((r) => r.route === p.route);
            return (
              <PermRow
                key={p.route}
                label={routeDef?.label ?? p.route}
                route={p.route}
                canView={p.can_view}
                canEdit={p.can_edit}
                onViewChange={(v) => handleViewChange(p.route, v)}
                onEditChange={(v) => handleEditChange(p.route, v)}
              />
            );
          })}
          {msg && (
            <div className="pt-2">
              <FlashMsg type={msg.type} text={msg.text} onDismiss={() => setMsg(null)} />
            </div>
          )}
          {hasChanges && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1a2556] text-white rounded-lg text-xs font-medium hover:bg-[#0d1530] disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                Guardar permisos
              </button>
            </div>
          )}
        </div>
      )}
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
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const loadRoles = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/roles');
      if (res.ok) setRoles(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

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
    if (!confirm('¿Eliminar este rol? Se quitarán los permisos a los usuarios asignados.')) return;
    try {
      const res = await fetch(`/api/auth/roles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadRoles();
        onFlash('ok', 'Rol eliminado');
      } else {
        const d = await res.json();
        onFlash('err', d.error || 'Error al eliminar');
      }
    } catch {
      onFlash('err', 'Error de conexión');
    }
  };

  const handleSavePerms = async (roleId: number, _perms: RolePermission[]) => {
    // The component handles its own save, but we need to refresh the list
    await loadRoles();
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
      {roles.map((role) => (
        <RoleCard key={role.id} role={role} onDelete={handleDelete} onSavePerms={handleSavePerms} />
      ))}

      {/* Create role form */}
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
        <p className="text-xs text-gray-400 mb-3">Crear nuevo rol</p>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre del rol"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1a2556] focus:border-transparent outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Descripción (opcional)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1a2556] focus:border-transparent outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1a2556] text-white rounded-lg text-sm font-medium hover:bg-[#0d1530] disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldPlus className="w-4 h-4" />
            )}{' '}
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}
