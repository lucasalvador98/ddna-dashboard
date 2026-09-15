'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, BarChart3, Eye } from 'lucide-react';
import { KpiCard } from '@/components/kpi-card';
import { ChartCard } from '@/components/charts/chart-card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type IndicadorRow = {
  indicador_nombre: string;
  valor: number;
  periodo: number;
  desglose: Record<string, unknown>;
  fuente: string;
  region: string;
};

function fmt(v?: number | null) {
  if (v == null || isNaN(v)) return 'N/D';
  return `${v.toFixed(1)}%`;
}

interface PilotRow {
  label: string;
  value: number | null;
  periodo: number | null;
  change?: string;
  data: { label: string; valor: number }[];
}

export function PobrezaPilot({ indecData }: { indecData: IndicadorRow[] }) {
  const [open, setOpen] = useState<string | null>(null);

  // Build pilot rows — one per key indicator, with its historic data
  const indicators = [
    'Pobreza Hogares',
    'Pobreza Personas',
    'Indigencia Hogares',
    'Indigencia Personas',
  ];

  const rows: PilotRow[] = indicators.map((name) => {
    const series = indecData
      .filter((r) => r.indicador_nombre === name)
      .sort((a, b) => a.periodo - b.periodo)
      .map((r) => ({ label: String(r.periodo), valor: r.valor }));
    const last = series[series.length - 1];
    const prev = series[series.length - 2];
    const change = last && prev ? `${(last.valor - prev.valor).toFixed(1)} pp` : undefined;
    return {
      label: name,
      value: last?.valor ?? null,
      periodo: last ? Number(last.label) : null,
      change,
      data: series,
    };
  }).filter((r) => r.data.length > 0);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-1">
          <BarChart3 className="w-4 h-4 text-[var(--ddna-blue)]" />
          Indicadores — hacé click en un dato para ver el gráfico
        </h3>
        <p className="text-sm text-slate-500">Lista resumida. Solo se muestra el gráfico del indicador que abras.</p>
      </div>

      <div className="space-y-3">
        {rows.map((row) => {
          const isOpen = open === row.label;
          return (
            <div key={row.label} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : row.label)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
              >
                <div>
                  <div className="font-medium text-slate-800">{row.label}</div>
                  <div className="text-sm text-slate-500">{row.periodo ? `Último: ${row.periodo}` : 'Sin datos'} {row.change ? `· ${row.change}` : ''}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-slate-800">{fmt(row.value)}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                      <Eye className="w-3 h-3" /> Ver gráfico
                    </div>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-slate-200 p-4 bg-slate-50/50">
                  <ChartCard title={row.label} subtitle={`Evolución ${row.data[0]?.label} → ${row.data[row.data.length - 1]?.label}`} color="magenta" fuente="INDEC">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={row.data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v) => [`${v}%`, '']} />
                        <Bar dataKey="valor" fill="#BF1363" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-center text-slate-400">Piloto — solo se muestra un gráfico a la vez. Así mantenés el hilo.</p>
    </div>
  );
}
