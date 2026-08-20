'use client';

import { FileText, FileSpreadsheet, FileType, CheckCircle, Clock, Minus, Download } from 'lucide-react';
import clsx from 'clsx';
import { formatBytes, getFileType, getStatus, FILE_TYPE_COLORS } from '@/lib/repositorio';
import type { RepoFile } from '@/lib/repositorio';

interface Props {
  file: RepoFile;
  onClick?: () => void;
}

export function RepoFileCard({ file, onClick }: Props) {
  const ext = file.nombre_archivo.split('.').pop() ?? '';
  const type = getFileType(ext);
  const colors = FILE_TYPE_COLORS[type] ?? FILE_TYPE_COLORS.docx;
  const status = getStatus(file);

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
      className="group bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-navy/40 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={clsx('w-11 h-11 rounded-lg flex items-center justify-center', colors.bg)}>
          <Icon className={clsx('w-5 h-5', colors.text)} />
        </div>
        <button
          onClick={handleDownload}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-blue hover:bg-blue-50 rounded-lg transition-all"
          title="Descargar"
          type="button"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      <p
        className="text-sm font-medium text-navy line-clamp-2 leading-snug min-h-[2.5rem]"
        title={file.nombre_archivo}
      >
        {file.nombre_archivo}
      </p>

      <p className="text-[10px] text-gray-400 font-mono mt-1 truncate">
        {formatBytes(file.tamano_bytes)}
      </p>

      <div className="mt-3 flex items-center gap-1.5">
        <span
          className={clsx(
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
            statusColor,
          )}
        >
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </div>
    </div>
  );
}
