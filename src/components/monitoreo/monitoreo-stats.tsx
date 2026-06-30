'use client';

import { Newspaper, Calendar, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface MonitoreoStatsProps {
  totalRegistros: number;
  registrosMes: number;
  pendientes: number;
  verificados: number;
  loading: boolean;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">{icon}</div>
      <p className="text-3xl font-bold text-slate-800">
        {typeof value === 'number' && value > 0 ? value.toLocaleString('es-AR') : value}
      </p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}

export function MonitoreoStats({
  totalRegistros,
  registrosMes,
  pendientes,
  verificados,
  loading,
}: MonitoreoStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total de registros"
        value={loading ? '...' : totalRegistros}
        icon={
          <div className="w-10 h-10 rounded-lg bg-[var(--ddna-blue)]/10 flex items-center justify-center">
            {loading ? (
              <Loader2 className="w-5 h-5 text-[var(--ddna-blue)] animate-spin" />
            ) : (
              <Newspaper className="w-5 h-5 text-[var(--ddna-blue)]" />
            )}
          </div>
        }
      />
      <StatCard
        label="Registros este mes"
        value={loading ? '...' : registrosMes}
        icon={
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-emerald-600" />
          </div>
        }
      />
      <StatCard
        label="Pendientes"
        value={loading ? '...' : pendientes}
        icon={
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
        }
      />
      <StatCard
        label="Verificados"
        value={loading ? '...' : verificados}
        icon={
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-purple-600" />
          </div>
        }
      />
    </div>
  );
}
