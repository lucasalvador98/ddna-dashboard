'use client';

import { FileText, FileSpreadsheet, FileType, Brain, FolderOpen } from 'lucide-react';
import type { RepoFile } from '@/lib/repositorio';

interface Props {
  files: RepoFile[];
}

export function RepoStats({ files }: Props) {
  const stats = {
    total: files.length,
    pdf: files.filter(f => f.tipo_documento === 'pdf').length,
    xlsx: files.filter(f => f.tipo_documento === 'xlsx').length,
    docx: files.filter(f => f.tipo_documento === 'docx').length,
    rag: files.filter(f => f.processed).length,
  };

  const items = [
    {
      value: stats.total,
      label: 'Total archivos',
      icon: FolderOpen,
      color: 'text-navy',
      bg: 'bg-slate-50',
    },
    {
      value: stats.pdf,
      label: 'PDF',
      icon: FileText,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      value: stats.xlsx,
      label: 'Excel',
      icon: FileSpreadsheet,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      value: stats.docx,
      label: 'Word',
      icon: FileType,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      value: stats.rag,
      label: 'Procesados RAG',
      icon: Brain,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
            </div>
            <p className="text-2xl font-display text-navy leading-none">{item.value}</p>
            <p className="text-xs text-gray-500 mt-1">{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}
