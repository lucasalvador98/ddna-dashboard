'use client';

import { FileText, FileSpreadsheet, FileType, CheckCircle, Clock, Minus, Download } from 'lucide-react';
import clsx from 'clsx';
import {
  formatBytes,
  formatDate,
  getFileType,
  getStatus,
  FILE_TYPE_COLORS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '@/lib/repositorio';
import type { RepoFile } from '@/lib/repositorio';

interface Props {
  file: RepoFile;
  onClick?: () => void;
}

export function RepoFileRow({ file, onClick }: Props) {
  const ext = file.nombre_archivo.split('.').pop() ?? '';
  const type = getFileType(ext);
  const colors = FILE_TYPE_COLORS[type] ?? FILE_TYPE_COLORS.docx;
  const status = getStatus(file);
  const catStyle = CATEGORY_COLORS[file.categoria];

  const Icon = type === 'pdf' ? FileText : type === 'xlsx' ? FileSpreadsheet : FileType;
  const StatusIcon = status.icon === 'check' ? CheckCircle : status.icon === 'clock' ? Clock : Minus;
  const statusColor =
    status.color === 'green'
      ? 'text-emerald-600 bg-emerald-50'
      : status.color === 'amber'
        ? 'text-amber-700 bg-amber-50'
        : 'text-gray-500 bg-gray-50';

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!file.url_storage) return;
    const path = file.url_storage.split('/storage/v1/object/public/ddna-repositorio/')[1];
    if (!path) return;
    const url = `https://ppyyqrvirjqmfpqaqnxy.supabase.co/storage/v1/object/public/ddna-repositorio/${encodeURIComponent(path)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-3 px-4 py-2.5 bg-white border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', colors.bg)}>
        <Icon className={clsx('w-4 h-4', colors.text)} />
      </div>
      <div className="flex-1 min-w-0 grid grid-cols-12 gap-3 items-center">
        <p
          className="col-span-5 text-sm font-medium text-[#1a2556] truncate"
          title={file.nombre_archivo}
        >
          {file.nombre_archivo}
        </p>
        <span
          className={clsx(
            'col-span-2 px-2 py-0.5 rounded text-[10px] font-medium w-fit',
            catStyle?.bg,
            catStyle?.text,
          )}
        >
          {CATEGORY_LABELS[file.categoria] ?? file.categoria}
        </span>
        <p className="col-span-2 text-xs text-gray-400">{formatBytes(file.tamano_bytes)}</p>
        <p className="col-span-2 text-xs text-gray-400">{formatDate(file.fecha_subida)}</p>
        <div className="col-span-1 flex items-center justify-end gap-2">
          <span
            className={clsx(
              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
              statusColor,
            )}
          >
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
          <button
            onClick={handleDownload}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-[#3777FF] transition-all"
            title="Descargar"
            type="button"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
