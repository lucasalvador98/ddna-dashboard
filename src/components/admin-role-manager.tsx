'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, Trash2, CheckCircle, Loader2, Eye, Edit3 } from 'lucide-react';
import clsx from 'clsx';
import { APP_ROUTES } from '@/lib/rbac-types';
import type { Role, RolePermission } from '@/lib/rbac-types';

// ── Constants ───────────────────────────────────────────────────────

const BUILT_IN_ROLES = ['admin', 'editor', 'visor'];

const ROUTE_GROUPS = [
  { label: 'Administración', routes: ['/admin'] },
  { label: 'Indicadores sociales', routes: ['/salud', '/educacion', '/pobreza', '/seguridad'] },
  { label: 'Finanzas públicas', routes: ['/inversion', '/presupuesto-nnya'] },
  { label: 'Monitoreo', routes: ['/monitoreo'] },
  { label: 'Documentos', routes: ['/repositorio', '/ejecutivo'] },
  { label: 'Datos', routes: ['/geo', '/fuentes'] },
];

// ── Toggle Pill ─────────────────────────────────────────────────────

function TogglePill({
  active,
  onChange,
  disabled,
  icon: Icon,
  label,
}: {
  active: boolean;
  onChange: (value: boolean) => void;
  disabled: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!active)}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors',
        active ? 'bg-navy text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
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
    // Mount-only data fetch — setState in async callback is intentional
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRoles();
  }, []); // Only on mount

  useEffect(() => {
    if (!selectedRoleId || roles.length === 0) return;
    const role = roles.find((r) => r.id === selectedRoleId);
    if (role) {
      // Intentional form reset when selection changes — sync editable copy
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPerms(JSON.parse(JSON.stringify(role.permissions))); // deep clone
      setHasChanges(false);
    }
  }, [selectedRoleId, roles]);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const isBuiltIn = BUILT_IN_ROLES.includes(selectedRole?.name ?? '');

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

  // ── Loading state ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  // ── Helper: find route label ─────────────────────────────────────

  const routeLabel = (route: string) => APP_ROUTES.find((r) => r.route === route)?.label ?? route;

  return (
    <div className="flex flex-col lg:flex-row gap-0 min-h-[500px] border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* ── Left Sidebar: Roles ──────────────────────────────────── */}
      <div className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50/50">
        {/* Sidebar header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Roles</h3>
        </div>

        {/* Role list — horizontal scroll on mobile, vertical on desktop */}
        <div className="lg:overflow-y-auto lg:max-h-[calc(500px-49px)]">
          <div className="flex lg:flex-col gap-1 p-2 overflow-x-auto lg:overflow-x-visible">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={clsx(
                  'group flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left shrink-0 lg:shrink',
                  selectedRoleId === role.id
                    ? 'bg-navy text-white border-l-2 border-l-navy'
                    : 'text-gray-600 hover:bg-gray-50',
                )}
              >
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span className="capitalize truncate">{role.name}</span>
                <span
                  className={clsx(
                    'text-[10px] px-1.5 py-0.5 rounded-full ml-auto shrink-0',
                    selectedRoleId === role.id
                      ? 'bg-white/20 text-white/80'
                      : 'bg-gray-200 text-gray-500',
                  )}
                >
                  {role.permissions.length}
                </span>
                {!BUILT_IN_ROLES.includes(role.name) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(role.id);
                    }}
                    disabled={deleting === role.id}
                    className={clsx(
                      'shrink-0 p-0.5 rounded transition-all opacity-0 group-hover:opacity-100',
                      selectedRoleId === role.id
                        ? 'text-white/60 hover:text-white hover:bg-white/10'
                        : 'text-gray-300 hover:text-red-500 hover:bg-red-50',
                    )}
                  >
                    {deleting === role.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
                {BUILT_IN_ROLES.includes(role.name) && (
                  <span
                    className={clsx(
                      'text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0',
                      selectedRoleId === role.id
                        ? 'bg-white/20 text-white/70'
                        : 'bg-gray-200 text-gray-400',
                    )}
                  >
                    fijo
                  </span>
                )}
              </button>
            ))}

            {/* Create role button / inline form */}
            {!creating ? (
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 border border-dashed border-gray-300 hover:border-gray-400 hover:text-gray-600 transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">Crear rol</span>
              </button>
            ) : (
              <div className="w-full shrink-0 px-1 py-2 space-y-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre del rol"
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-navy focus:border-transparent outline-none bg-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  autoFocus
                />
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Descripción (opcional)"
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-navy focus:border-transparent outline-none bg-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    disabled={creating || !newName.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-navy text-white rounded-md text-xs font-medium hover:bg-[#0F172A] disabled:opacity-50 transition-colors"
                  >
                    {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    Crear
                  </button>
                  <button
                    onClick={() => {
                      setCreating(false);
                      setNewName('');
                      setNewDesc('');
                    }}
                    className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Permissions ──────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedRole ? (
          <>
            {/* Role header */}
            <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-navy capitalize">{selectedRole.name}</h3>
                {isBuiltIn && (
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md font-medium">
                    Rol fijo
                  </span>
                )}
              </div>
              {selectedRole.description && (
                <p className="text-xs text-gray-400">{selectedRole.description}</p>
              )}
            </div>

            {/* Permission groups */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
              {ROUTE_GROUPS.map((group) => {
                const groupPerms = perms.filter((p) => group.routes.includes(p.route));
                if (groupPerms.length === 0) return null;

                return (
                  <div key={group.label}>
                    <h4 className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">
                      {group.label}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {groupPerms.map((p) => (
                        <div
                          key={p.route}
                          className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
                        >
                          <p className="text-sm font-medium text-navy">{routeLabel(p.route)}</p>
                          <p className="text-[10px] text-gray-400 font-mono mb-2">{p.route}</p>
                          <div className="flex items-center gap-1.5">
                            <TogglePill
                              active={p.can_view}
                              onChange={(v) => handlePermChange(p.route, 'can_view', v)}
                              disabled={isBuiltIn || saving}
                              icon={Eye}
                              label="Ver"
                            />
                            <TogglePill
                              active={p.can_edit}
                              onChange={(v) => handlePermChange(p.route, 'can_edit', v)}
                              disabled={isBuiltIn || saving}
                              icon={Edit3}
                              label="Editar"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save bar */}
            <div
              className={clsx(
                'flex items-center justify-end gap-3 px-4 lg:px-6 py-3 border-t border-gray-200 bg-gray-50/50 transition-all',
                hasChanges ? 'opacity-100' : 'opacity-0 pointer-events-none',
              )}
            >
              {hasChanges && (
                <span className="text-xs text-amber-600 font-medium">Tenés cambios sin guardar</span>
              )}
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="flex items-center gap-1.5 px-5 py-2 bg-navy text-white rounded-lg text-sm font-medium hover:bg-[#0F172A] disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Guardar permisos
              </button>
            </div>
          </>
        ) : (
          /* Empty state when no role selected and no roles exist */
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-400">No hay roles creados</p>
          </div>
        )}
      </div>
    </div>
  );
}
