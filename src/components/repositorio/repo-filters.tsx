'use client';

import { Search, LayoutGrid, List } from 'lucide-react';
import clsx from 'clsx';

export type ViewMode = 'grid' | 'list';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  totalShown: number;
  totalAll: number;
}

export function RepoFilters({
  search,
  onSearchChange,
  view,
  onViewChange,
  totalShown,
  totalAll,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o descripción..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#334155] focus:border-transparent outline-none"
        />
      </div>
      <div className="text-xs text-gray-400 hidden sm:block">
        {totalShown === totalAll ? `${totalAll} archivos` : `${totalShown} de ${totalAll}`}
      </div>
      <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg p-0.5 bg-white">
        <button
          onClick={() => onViewChange('grid')}
          className={clsx(
            'p-1.5 rounded-md transition-colors',
            view === 'grid' ? 'bg-[#334155] text-white' : 'text-gray-400 hover:text-gray-600',
          )}
          title="Vista grid"
          type="button"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewChange('list')}
          className={clsx(
            'p-1.5 rounded-md transition-colors',
            view === 'list' ? 'bg-[#334155] text-white' : 'text-gray-400 hover:text-gray-600',
          )}
          title="Vista lista"
          type="button"
        >
          <List className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
