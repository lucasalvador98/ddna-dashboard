'use client';

import { useState, useEffect, useCallback } from 'react';
import { BarChart3, DollarSign, Phone, Cpu, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { getUsageStats, type AiUsageLog } from '@/lib/actions/ai-usage';

type ToolStats = Record<string, { calls: number; totalTokens: number; totalCost: number }>;

function aggregateByTool(logs: AiUsageLog[]): ToolStats {
  const stats: ToolStats = {};
  for (const log of logs) {
    if (!stats[log.tool]) stats[log.tool] = { calls: 0, totalTokens: 0, totalCost: 0 };
    stats[log.tool].calls += 1;
    stats[log.tool].totalTokens += log.total_tokens;
    stats[log.tool].totalCost += log.cost_estimate;
  }
  return stats;
}

function fmt(n: number): string {
  return n.toLocaleString('es-AR');
}

function fmtUsd(n: number): string {
  return `$${n.toFixed(4)}`;
}

export default function AiUsagePage() {
  const [logs, setLogs] = useState<AiUsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsageStats(days);
      setLogs(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos');
    }
    setLoading(false);
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const totalCalls = logs.length;
  const totalTokens = logs.reduce((s, l) => s + l.total_tokens, 0);
  const totalCost = logs.reduce((s, l) => s + l.cost_estimate, 0);
  const avgTokens = totalCalls > 0 ? Math.round(totalTokens / totalCalls) : 0;
  const toolStats = aggregateByTool(logs);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-lg text-[#334155]">Uso de IA</h2>
        <p className="text-sm text-gray-500 mt-1">
          Registro de consumo de modelos de lenguaje en los últimos {days} días
        </p>
      </div>

      {/* Days filter */}
      <div className="flex gap-2">
        {[3, 7, 14, 30].map((n) => (
          <button
            key={n}
            onClick={() => setDays(n)}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
              days === n
                ? 'bg-[#334155] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {n} días
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="font-display text-2xl text-[#334155] tabular-nums">
                {fmt(totalCalls)}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">Total de llamadas</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <p className="font-display text-2xl text-[#334155] tabular-nums">
                {fmt(totalTokens)}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">Tokens totales</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Promedio: {fmt(avgTokens)} por llamada
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="font-display text-2xl text-[#334155] tabular-nums">
                {fmtUsd(totalCost)}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">Costo estimado total (USD)</p>
            </div>
          </div>

          {/* Stats by tool */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-display text-base text-[#334155] mb-4">
              Uso por herramienta
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="pb-3 font-medium">Herramienta</th>
                    <th className="pb-3 font-medium tabular-nums">Llamadas</th>
                    <th className="pb-3 font-medium tabular-nums">Tokens totales</th>
                    <th className="pb-3 font-medium tabular-nums">Costo estimado</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(toolStats)
                    .sort((a, b) => b[1].calls - a[1].calls)
                    .map(([tool, s]) => (
                      <tr key={tool} className="border-b border-gray-50 text-[#334155]">
                        <td className="py-3 font-medium">{tool}</td>
                        <td className="py-3 tabular-nums">{fmt(s.calls)}</td>
                        <td className="py-3 tabular-nums">{fmt(s.totalTokens)}</td>
                        <td className="py-3 tabular-nums">{fmtUsd(s.totalCost)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent calls */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-display text-base text-[#334155] mb-4">
              Llamadas recientes
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="pb-3 font-medium">Fecha</th>
                    <th className="pb-3 font-medium">Herramienta</th>
                    <th className="pb-3 font-medium">Modelo</th>
                    <th className="pb-3 font-medium tabular-nums">Prompt</th>
                    <th className="pb-3 font-medium tabular-nums">Completion</th>
                    <th className="pb-3 font-medium tabular-nums">Costo</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No hay registros en este período
                      </td>
                    </tr>
                  ) : (
                    logs.slice(0, 100).map((log) => (
                      <tr key={log.id} className="border-b border-gray-50 text-[#334155]">
                        <td className="py-2.5 text-gray-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5">{log.tool}</td>
                        <td className="py-2.5 text-gray-500">{log.model}</td>
                        <td className="py-2.5 tabular-nums">{fmt(log.prompt_tokens)}</td>
                        <td className="py-2.5 tabular-nums">{fmt(log.completion_tokens)}</td>
                        <td className="py-2.5 tabular-nums">{fmtUsd(log.cost_estimate)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {logs.length > 100 && (
              <p className="text-xs text-gray-400 mt-3">
                Mostrando las últimas 100 de {logs.length} llamadas
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
