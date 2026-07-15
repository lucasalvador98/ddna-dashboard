'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, AlertCircle, CheckCircle, RefreshCw, FolderOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoginGate } from '@/components/login-gate';
import { SectionHeader } from '@/components/section-header';
import {
  RepoHero,
  RepoStats,
  RepoUploadZone,
  RepoFilters,
  RepoGroupList,
  RepoFileDrawer,
} from '@/components/repositorio';
import type { ViewMode, DrawerAction } from '@/components/repositorio';
import type { RepoFile, ProcessResult } from '@/lib/repositorio';

export default function RepositorioPage() {
  const [files, setFiles] = useState<RepoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('grid');

  // Drawer state
  const [selectedFile, setSelectedFile] = useState<RepoFile | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [drawerFlash, setDrawerFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Process pending
  const [processing, setProcessing] = useState(false);
  const [processResults, setProcessResults] = useState<ProcessResult[]>([]);

  // Page-level flash (for things like delete confirmation)
  const [pageFlash, setPageFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const fetchRepo = useCallback(async () => {
    const { data, error } = await supabase
      .from('repositorio')
      .select('*')
      .order('categoria', { ascending: true })
      .order('nombre_archivo', { ascending: true });

    if (!error) setFiles(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRepo();
  }, [fetchRepo]);

  // Filter files by search
  const filteredFiles = files.filter(f => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      f.nombre_archivo.toLowerCase().includes(q) ||
      (f.descripcion?.toLowerCase().includes(q) ?? false) ||
      (f.notas?.toLowerCase().includes(q) ?? false)
    );
  });

  const pendingCount = files.filter(f => !f.processed && f.url_storage).length;

  // ── Process pending ────────────────────────────────────────────────────────
  const processPending = useCallback(async () => {
    const pending = files.filter(f => !f.processed && f.url_storage);
    if (pending.length === 0) return;

    setProcessing(true);
    setProcessResults(pending.map(f => ({ id: f.id, nombre: f.nombre_archivo, status: 'pending' })));

    for (const file of pending) {
      setProcessResults(prev =>
        prev.map(r => (r.id === file.id ? { ...r, status: 'processing' } : r)),
      );

      try {
        const res = await fetch('/api/repositorio/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileId: file.id }),
        });
        const data = await res.json();

        if (!res.ok || data.error) {
          setProcessResults(prev =>
            prev.map(r =>
              r.id === file.id
                ? { ...r, status: 'error', error: data.error || `HTTP ${res.status}` }
                : r,
            ),
          );
        } else if (data.message === 'File already processed') {
          setProcessResults(prev =>
            prev.map(r =>
              r.id === file.id ? { ...r, status: 'skipped', chunks: data.totalChunks } : r,
            ),
          );
        } else {
          setProcessResults(prev =>
            prev.map(r =>
              r.id === file.id ? { ...r, status: 'done', chunks: data.totalChunks } : r,
            ),
          );
        }
      } catch (err) {
        setProcessResults(prev =>
          prev.map(r =>
            r.id === file.id
              ? { ...r, status: 'error', error: err instanceof Error ? err.message : String(err) }
              : r,
          ),
        );
      }
    }

    setProcessing(false);
    await fetchRepo();
  }, [files, fetchRepo]);

  // ── Drawer action handler ──────────────────────────────────────────────────
  const handleDrawerAction = useCallback(async (action: DrawerAction) => {
    setActionInProgress(true);
    setDrawerFlash(null);

    try {
      if (action.type === 'download') {
        if (!action.file.url_storage) return;
        const path = action.file.url_storage.split('/storage/v1/object/public/ddna-repositorio/')[1];
        if (!path) return;
        const url = `https://ppyyqrvirjqmfpqaqnxy.supabase.co/storage/v1/object/public/ddna-repositorio/${encodeURIComponent(path)}`;
        window.open(url, '_blank');
        return;
      }

      if (action.type === 'reprocess') {
        const res = await fetch('/api/repositorio/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileId: action.file.id }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setDrawerFlash({ type: 'err', text: data.error || 'Error al procesar' });
        } else {
          setDrawerFlash({ type: 'ok', text: `Procesado: ${data.totalChunks ?? action.file.total_chunks} chunks` });
          await fetchRepo();
        }
        return;
      }

      if (action.type === 'delete') {
        const res = await fetch(`/api/repositorio/file/${action.file.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok || data.error) {
          setDrawerFlash({ type: 'err', text: data.error || 'Error al eliminar' });
        } else {
          setDrawerFlash({ type: 'ok', text: `"${action.file.nombre_archivo}" eliminado` });
          setSelectedFile(null);
          setPageFlash({ type: 'ok', text: 'Archivo eliminado correctamente' });
          await fetchRepo();
        }
        return;
      }

      if (action.type === 'save-metadata') {
        const res = await fetch(`/api/repositorio/file/${action.file.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            descripcion: action.descripcion,
            notas: action.notas,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setDrawerFlash({ type: 'err', text: data.error || 'Error al guardar' });
        } else {
          setDrawerFlash({ type: 'ok', text: 'Cambios guardados' });
          // Update the selected file with the new metadata so the drawer reflects the saved state
          setSelectedFile(prev => prev ? { ...prev, descripcion: action.descripcion, notas: action.notas } : prev);
          await fetchRepo();
        }
        return;
      }
    } catch (err) {
      setDrawerFlash({
        type: 'err',
        text: err instanceof Error ? err.message : 'Error desconocido',
      });
    } finally {
      setActionInProgress(false);
    }
  }, [fetchRepo]);

  const handleFileClick = useCallback((file: RepoFile) => {
    setSelectedFile(file);
    setDrawerFlash(null);
  }, []);

  return (
    <LoginGate>
      <div className="space-y-6 pb-12">
        <SectionHeader
          icon={FolderOpen}
          title="Repositorio de Archivos"
          description="Gestión y procesamiento de documentos del observatorio DDNA"
          color="amber"
        />
        <RepoHero />

        <div className="max-w-7xl mx-auto px-6 space-y-6">
          {pageFlash && (
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
                pageFlash.type === 'ok'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {pageFlash.type === 'ok' ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              {pageFlash.text}
            </div>
          )}

          <RepoStats files={files} />

          <RepoUploadZone onUploaded={fetchRepo} />

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : (
            <>
              <RepoFilters
                search={search}
                onSearchChange={setSearch}
                view={view}
                onViewChange={setView}
                totalShown={filteredFiles.length}
                totalAll={files.length}
              />

              <RepoGroupList
                files={filteredFiles}
                view={view}
                onFileClick={handleFileClick}
                onProcessPending={processPending}
                processing={processing}
                processResults={processResults}
                pendingCount={pendingCount}
              />
            </>
          )}
        </div>

        <RepoFileDrawer
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onAction={handleDrawerAction}
          actionInProgress={actionInProgress}
        />

        {drawerFlash && (
          <div className="fixed bottom-6 right-6 z-50 max-w-sm">
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm ${
                drawerFlash.type === 'ok'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {drawerFlash.type === 'ok' ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              {drawerFlash.text}
            </div>
          </div>
        )}
      </div>
    </LoginGate>
  );
}
