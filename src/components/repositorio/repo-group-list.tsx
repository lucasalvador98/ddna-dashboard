'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import clsx from 'clsx';
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/repositorio';
import type { RepoFile, ProcessResult } from '@/lib/repositorio';
import { RepoFileCard } from './repo-file-card';
import { RepoFileRow } from './repo-file-row';
import type { ViewMode } from './repo-filters';

interface Props {
  files: RepoFile[];
  view: ViewMode;
  onFileClick: (file: RepoFile) => void;
  onProcessPending: () => void;
  processing: boolean;
  processResults: ProcessResult[];
  pendingCount: number;
}

export function RepoGroupList({
  files,
  view,
  onFileClick,
  onProcessPending,
  processing,
  processResults,
  pendingCount,
}: Props) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = (cat: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // Group files by category, preserving canonical order
  const grouped = CATEGORIES.map(c => ({
    cat: c.value,
    files: files.filter(f => f.categoria === c.value),
  })).filter(g => g.files.length > 0);

  if (grouped.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
        <p className="text-sm text-gray-500">
          No se encontraron archivos con los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-accent text-sm font-semibold text-amber-800">
                  {pendingCount} archivo{pendingCount > 1 ? 's' : ''} pendiente
                  {pendingCount > 1 ? 's' : ''} de procesar
                </p>
                <p className="font-body text-xs text-amber-700 mt-0.5">
                  Procesalos para que estén disponibles en el chat con la bibliografía
                </p>
              </div>
            </div>
            <button
              onClick={onProcessPending}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-accent text-sm font-semibold rounded-lg transition-colors"
              type="button"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {processing ? 'Procesando...' : 'Procesar pendientes'}
            </button>
          </div>

          {processResults.length > 0 && (
            <div className="mt-3 pt-3 border-t border-amber-200 space-y-1.5">
              {processResults.map(r => (
                <div key={r.id} className="flex items-center gap-2 text-xs">
                  {r.status === 'pending' && (
                    <div className="w-3 h-3 rounded-full bg-amber-200 shrink-0" />
                  )}
                  {r.status === 'processing' && (
                    <Loader2 className="w-3 h-3 text-amber-600 animate-spin shrink-0" />
                  )}
                  {r.status === 'done' && (
                    <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                  )}
                  {r.status === 'skipped' && (
                    <CheckCircle className="w-3 h-3 text-slate-400 shrink-0" />
                  )}
                  {r.status === 'error' && (
                    <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                  )}
                  <span className="font-mono truncate text-amber-900">{r.nombre}</span>
                  {r.status === 'done' && (
                    <span className="text-emerald-700 ml-auto shrink-0">{r.chunks} chunks</span>
                  )}
                  {r.status === 'skipped' && (
                    <span className="text-slate-500 ml-auto shrink-0">ya procesado</span>
                  )}
                  {r.status === 'error' && (
                    <span className="text-red-600 ml-auto truncate max-w-[200px]">{r.error}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {grouped.map(({ cat, files: groupFiles }) => {
        const isCollapsed = collapsed.has(cat);
        const catStyle = CATEGORY_COLORS[cat];
        const processedCount = groupFiles.filter(f => f.processed).length;
        return (
          <div key={cat} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => toggle(cat)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              type="button"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
              <span
                className={clsx(
                  'px-2 py-0.5 rounded-md text-xs font-semibold',
                  catStyle?.bg,
                  catStyle?.text,
                )}
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </span>
              <span className="text-sm text-gray-500">
                {groupFiles.length} archivo{groupFiles.length > 1 ? 's' : ''}
              </span>
              <span className="ml-auto text-xs text-gray-400">
                {processedCount} procesado{processedCount !== 1 ? 's' : ''}
              </span>
            </button>

            {!isCollapsed && (
              <div className="border-t border-gray-100">
                {view === 'grid' ? (
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {groupFiles.map(f => (
                      <RepoFileCard
                        key={f.id}
                        file={f}
                        onClick={() => onFileClick(f)}
                      />
                    ))}
                  </div>
                ) : (
                  <div>
                    {groupFiles.map(f => (
                      <RepoFileRow
                        key={f.id}
                        file={f}
                        onClick={() => onFileClick(f)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
