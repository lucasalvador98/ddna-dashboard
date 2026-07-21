'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Download,
  RefreshCw,
  Trash2,
  Edit3,
  Save,
  Loader2,
  CheckCircle,
  Clock,
  Minus,
  FileText,
  FileSpreadsheet,
  FileType,
} from 'lucide-react';
import clsx from 'clsx';
import {
  formatBytes,
  formatDateTime,
  getFileType,
  getStatus,
  FILE_TYPE_COLORS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '@/lib/repositorio';
import type { RepoFile } from '@/lib/repositorio';

export type DrawerAction =
  | { type: 'download'; file: RepoFile }
  | { type: 'reprocess'; file: RepoFile }
  | { type: 'delete'; file: RepoFile }
  | { type: 'save-metadata'; file: RepoFile; descripcion: string; notas: string };

interface Props {
  file: RepoFile | null;
  onClose: () => void;
  onAction: (action: DrawerAction) => void;
  actionInProgress?: boolean;
}

export function RepoFileDrawer({ file, onClose, onAction, actionInProgress }: Props) {
  const [editing, setEditing] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (file) {
      setDescripcion(file.descripcion ?? '');
      setNotas(file.notas ?? '');
      setEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file?.id]);

  if (!file) return null;

  const ext = file.nombre_archivo.split('.').pop() ?? '';
  const type = getFileType(ext);
  const colors = FILE_TYPE_COLORS[type] ?? FILE_TYPE_COLORS.docx;
  const status = getStatus(file);
  const catStyle = CATEGORY_COLORS[file.categoria];

  const Icon = type === 'pdf' ? FileText : type === 'xlsx' ? FileSpreadsheet : FileType;
  const StatusIcon = status.icon === 'check' ? CheckCircle : status.icon === 'clock' ? Clock : Minus;
  const statusColor =
    status.color === 'green'
      ? 'text-emerald-700 bg-emerald-50'
      : status.color === 'amber'
        ? 'text-amber-700 bg-amber-50'
        : 'text-gray-600 bg-gray-50';

  const hasMetadataChanges =
    descripcion !== (file.descripcion ?? '') || notas !== (file.notas ?? '');

  const handleDownload = () => onAction({ type: 'download', file });
  const handleReprocess = () => onAction({ type: 'reprocess', file });
  const handleDelete = () => {
    if (
      confirm(
        `¿Eliminar "${file.nombre_archivo}"? Se borrará también del storage y de los chunks del RAG.`,
      )
    ) {
      onAction({ type: 'delete', file });
    }
  };
  const handleSaveMetadata = () => {
    onAction({ type: 'save-metadata', file, descripcion, notas });
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setDescripcion(file.descripcion ?? '');
    setNotas(file.notas ?? '');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Detalle del archivo"
        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
        style={{ animation: 'drawer-in 200ms ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-accent text-base text-[#1a2556]">Detalle del archivo</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            type="button"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* File icon + name */}
          <div className="flex items-start gap-3">
            <div
              className={clsx(
                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                colors.bg,
              )}
            >
              <Icon className={clsx('w-6 h-6', colors.text)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1a2556] break-all">
                {file.nombre_archivo}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span
                  className={clsx(
                    'px-2 py-0.5 rounded-md text-[10px] font-semibold',
                    catStyle?.bg,
                    catStyle?.text,
                  )}
                >
                  {CATEGORY_LABELS[file.categoria] ?? file.categoria}
                </span>
                <span
                  className={clsx(
                    'px-2 py-0.5 rounded-md text-[10px] font-medium',
                    colors.bg,
                    colors.text,
                  )}
                >
                  {colors.label}
                </span>
                <span
                  className={clsx(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium',
                    statusColor,
                  )}
                >
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
              </div>
            </div>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <MetaField label="Tamaño" value={formatBytes(file.tamano_bytes)} />
            <MetaField label="Subido" value={formatDateTime(file.fecha_subida)} />
            <MetaField label="ID" value={file.id.slice(0, 8)} mono />
            <MetaField label="Chunks" value={file.processed ? String(file.total_chunks) : '—'} />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                Descripción
              </label>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-[10px] text-[#3777FF] hover:text-[#1a2556] flex items-center gap-0.5"
                  type="button"
                >
                  <Edit3 className="w-3 h-3" /> Editar
                </button>
              )}
            </div>
            {editing ? (
              <textarea
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                rows={3}
                placeholder="Descripción del archivo..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1a2556] focus:border-transparent outline-none resize-none"
              />
            ) : (
              <p
                className={clsx('text-sm', file.descripcion ? 'text-gray-700' : 'text-gray-400 italic')}
              >
                {file.descripcion || 'Sin descripción'}
              </p>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1.5 block">
              Notas
            </label>
            {editing ? (
              <textarea
                value={notas}
                onChange={e => setNotas(e.target.value)}
                rows={2}
                placeholder="Notas internas..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1a2556] focus:border-transparent outline-none resize-none"
              />
            ) : (
              <p className={clsx('text-sm', file.notas ? 'text-gray-700' : 'text-gray-400 italic')}>
                {file.notas || 'Sin notas'}
              </p>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-gray-200 px-5 py-3 flex items-center justify-between gap-2 bg-gray-50">
          {editing ? (
            <>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveMetadata}
                disabled={!hasMetadataChanges || actionInProgress}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1a2556] text-white rounded-lg text-sm font-medium hover:bg-[#0d1530] disabled:opacity-50"
                type="button"
              >
                <Save className="w-3.5 h-3.5" /> Guardar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleDelete}
                disabled={actionInProgress}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                title="Eliminar"
                type="button"
                aria-label="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                {file.url_storage && !file.processed && (
                  <button
                    onClick={handleReprocess}
                    disabled={actionInProgress}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-sm font-medium disabled:opacity-50"
                    type="button"
                  >
                    {actionInProgress ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    Procesar
                  </button>
                )}
                <button
                  onClick={handleDownload}
                  disabled={!file.url_storage}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a2556] text-white rounded-lg text-sm font-medium hover:bg-[#0d1530] disabled:opacity-50"
                  type="button"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function MetaField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{label}</p>
      <p className={clsx('text-sm text-gray-700 mt-0.5', mono && 'font-mono text-xs')}>
        {value}
      </p>
    </div>
  );
}
