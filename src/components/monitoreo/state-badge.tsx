'use client';

import clsx from 'clsx';
import { ESTADO_COLORS } from './constants';

interface StateBadgeProps {
  estado: string;
}

export function StateBadge({ estado }: StateBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        ESTADO_COLORS[estado] || 'bg-slate-100 text-slate-600'
      )}
    >
      {estado}
    </span>
  );
}
