'use client';

import { useEffect, useState } from 'react';
import { Plus, LayoutDashboard, Table2 } from 'lucide-react';
import clsx from 'clsx';
import { MonitoreoDashboard } from '@/components/monitoreo/monitoreo-dashboard';
import { MonitoreoTable } from '@/components/monitoreo/monitoreo-table';
import { MonitoreoForm } from '@/components/monitoreo/monitoreo-form';
import type { ViewType } from '@/components/monitoreo/constants';
import type { LucideIcon } from 'lucide-react';

// ── Tab button ────────────────────────────────────────────────────

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
        active
          ? 'bg-white text-[var(--ddna-blue)] shadow-sm border border-slate-200'
          : 'text-white/70 hover:text-white hover:bg-white/10'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CLIENT WRAPPER — view machine + editing state
// ═══════════════════════════════════════════════════════════════════

const VIEW_KEY = 'monitoreo:view';
const EDITING_KEY = 'monitoreo:editingId';

function loadView(): ViewType {
  try {
    const v = localStorage.getItem(VIEW_KEY) as ViewType | null;
    if (v === 'dashboard' || v === 'table' || v === 'form') return v;
  } catch {}
  return 'dashboard';
}

function loadEditingId(): number | null {
  try {
    const v = localStorage.getItem(EDITING_KEY);
    if (v) {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  } catch {}
  return null;
}

export function MonitoreoClient() {
  const [view, setView] = useState<ViewType>(() => {
    if (typeof window === 'undefined') return 'dashboard';
    return loadView();
  });
  const [editingId, setEditingId] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    return loadEditingId();
  });

  // Persist view/editingId without triggering reload on tab change
  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {}
  }, [view]);

  useEffect(() => {
    try {
      if (editingId !== null) localStorage.setItem(EDITING_KEY, String(editingId));
      else localStorage.removeItem(EDITING_KEY);
    } catch {}
  }, [editingId]);

  const handleNewClick = () => {
    setEditingId(null);
    setView('form');
  };

  const handleEditRegistro = (id: number) => {
    setEditingId(id);
    setView('form');
  };

  const handleSaveSuccess = () => {
    setEditingId(null);
    setView('table');
  };

  const handleCancel = () => {
    setEditingId(null);
    setView('table');
  };

  return (
    <>
      {/* Tab navigation + New button */}
      <div className="bg-gradient-to-r from-[#334155] to-[#475569]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TabButton
                active={view === 'dashboard'}
                icon={LayoutDashboard}
                label="Dashboard"
                onClick={() => setView('dashboard')}
              />
              <TabButton
                active={view === 'table'}
                icon={Table2}
                label="Tabla"
                onClick={() => setView('table')}
              />
            </div>
            {view !== 'form' && (
              <button
                onClick={handleNewClick}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-sm font-medium transition-all backdrop-blur-sm"
              >
                <Plus className="w-4 h-4" />
                Nuevo registro
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {view === 'dashboard' && <MonitoreoDashboard />}
        {view === 'table' && <MonitoreoTable onEditRegistro={handleEditRegistro} />}
        <div className={view !== 'form' ? 'hidden' : ''}>
          <MonitoreoForm editingId={editingId} onSave={handleSaveSuccess} onCancel={handleCancel} />
        </div>
      </div>
    </>
  );
}
