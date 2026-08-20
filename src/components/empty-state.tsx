'use client';

import { FolderOpen, Plus, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    /** If true, shows a copy-to-clipboard button instead of a link. */
    copyValue?: string;
  };
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
}: EmptyStateProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-[#334155] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-5">{description}</p>
      )}

      {action && action.copyValue ? (
        <button
          onClick={() => handleCopy(action.copyValue!)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              {action.label}
            </>
          )}
        </button>
      ) : action?.href ? (
        <a
          href={action.href}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#334155] text-white rounded-lg text-sm font-medium hover:bg-[#0F172A] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {action.label}
        </a>
      ) : action?.onClick ? (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#334155] text-white rounded-lg text-sm font-medium hover:bg-[#0F172A] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
