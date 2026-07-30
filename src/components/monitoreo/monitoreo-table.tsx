'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Search,
  Loader2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Trash2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  MEDIO_OPTIONS,
  SECCION_OPTIONS,
  TOPICO_PRINCIPAL_OPTIONS,
  ESTADO_OPTIONS,
  ITEMS_PER_PAGE,
  formatDate,
  type RegistroConActores,
} from './constants';
import { StateBadge } from './state-badge';

interface TableViewProps {
  onEditRegistro: (id: number) => void;
}

type SortColumn =
  | 'fecha_noticia'
  | 'fecha_sincronizacion'
  | 'medio'
  | 'titulo'
  | 'seccion'
  | 'topico_principal'
  | 'estado';
type SortDirection = 'asc' | 'desc';

// ── CSV Export ──────────────────────────────────────────────────

function exportToCSV(records: RegistroConActores[], filename: string) {
  if (records.length === 0) return;

  const headers = ['Fecha noticia', 'Fecha sincronización', 'Medio', 'Título', 'Sección', 'Tópico', 'Estado', 'Caso', 'Actores'];
  const escapeCSV = (val: string | null | undefined) => {
    const str = val ?? '';
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = records.map(r => [
    formatDate(r.fecha_noticia),
    formatDate(r.fecha_sincronizacion),
    escapeCSV(r.medio),
    escapeCSV(r.titulo),
    escapeCSV(r.seccion),
    escapeCSV(r.topico_principal),
    escapeCSV(r.estado),
    r.caso ? 'Sí' : 'No',
    String(r.monitoreo_actores?.length ?? 0),
  ]);

  const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Sortable Column Header ─────────────────────────────────────

function SortableHeader({
  label,
  column,
  currentSort,
  currentDir,
  onSort,
}: {
  label: string;
  column: SortColumn;
  currentSort: SortColumn;
  currentDir: SortDirection;
  onSort: (col: SortColumn) => void;
}) {
  const active = currentSort === column;
  const Icon = !active ? ArrowUpDown : currentDir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">
      <button
        onClick={() => onSort(column)}
        className={`flex items-center gap-1 transition-colors ${
          active ? 'text-[var(--ddna-blue)]' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        {label}
        <Icon className={`w-3 h-3 ${active ? 'opacity-100' : 'opacity-40'}`} />
      </button>
    </th>
  );
}

export function MonitoreoTable({ onEditRegistro }: TableViewProps) {
  const [registros, setRegistros] = useState<RegistroConActores[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterMedio, setFilterMedio] = useState('');
  const [filterTopico, setFilterTopico] = useState('');
  const [filterSeccion, setFilterSeccion] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Sorting
  const [sortColumn, setSortColumn] = useState<SortColumn>('fecha_noticia');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const fetchRegistros = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('monitoreo_registros')
        .select('*, monitoreo_actores(id)', { count: 'exact' });

      // Full-text search: OR on titulo and medio
      if (debouncedSearch) {
        query = query.or(`titulo.ilike.%${debouncedSearch}%,medio.ilike.%${debouncedSearch}%`);
      }
      if (filterMedio) query = query.eq('medio', filterMedio);
      if (filterTopico) query = query.eq('topico_principal', filterTopico);
      if (filterSeccion) query = query.eq('seccion', filterSeccion);
      if (filterEstado) query = query.eq('estado', filterEstado);
      if (fechaDesde) query = query.gte('fecha_noticia', fechaDesde);
      if (fechaHasta) query = query.lte('fecha_noticia', fechaHasta);

      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const {
        data,
        count,
        error: fetchError,
      } = await query.order(sortColumn, { ascending: sortDirection === 'asc' }).range(from, to);

      if (fetchError) throw fetchError;

      setRegistros((data ?? []) as RegistroConActores[]);
      setTotalCount(count ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar registros');
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    filterMedio,
    filterTopico,
    filterSeccion,
    filterEstado,
    fechaDesde,
    fechaHasta,
    page,
    sortColumn,
    sortDirection,
  ]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  useEffect(() => {
    fetchRegistros();
  }, [fetchRegistros]);

  // Reset page when filters change (debouncedSearch included)
  useEffect(() => {
    setPage(0);
  }, [
    debouncedSearch,
    filterMedio,
    filterTopico,
    filterSeccion,
    filterEstado,
    fechaDesde,
    fechaHasta,
  ]);

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; titulo: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await supabase.from('monitoreo_actores').delete().eq('registro_id', deleteConfirm.id);
      const { error } = await supabase.from('monitoreo_registros').delete().eq('id', deleteConfirm.id);
      if (error) throw error;
      setDeleteConfirm(null);
      fetchRegistros();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterMedio('');
    setFilterTopico('');
    setFilterSeccion('');
    setFilterEstado('');
    setFechaDesde('');
    setFechaHasta('');
  };

  const hasActiveFilters =
    !!search ||
    !!filterMedio ||
    !!filterTopico ||
    !!filterSeccion ||
    !!filterEstado ||
    !!fechaDesde ||
    !!fechaHasta;

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título o medio..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent"
            />
          </div>

          <select
            value={filterMedio}
            onChange={e => setFilterMedio(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent"
          >
            <option value="">Todos los medios</option>
            {MEDIO_OPTIONS.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={filterSeccion}
            onChange={e => setFilterSeccion(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent"
          >
            <option value="">Todas las secciones</option>
            {SECCION_OPTIONS.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            {ESTADO_OPTIONS.map(e => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          <select
            value={filterTopico}
            onChange={e => setFilterTopico(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent"
          >
            <option value="">Todos los tópicos</option>
            {TOPICO_PRINCIPAL_OPTIONS.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Noticia desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={e => setFechaDesde(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Noticia hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={e => setFechaHasta(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--ddna-blue)] focus:border-transparent"
            />
          </div>

          {hasActiveFilters && (
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results count, export & top pagination */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Página {page + 1} de {totalPages} ({totalCount.toLocaleString('es-AR')} registro
          {totalCount !== 1 ? 's' : ''})
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin inline ml-2" />}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(registros, `monitoreo-pagina-${page + 1}.csv`)}
            disabled={registros.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-[var(--ddna-blue)] border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-slate-700 font-medium min-w-[4rem] text-center">
            {totalCount > 0 ? `${page + 1} / ${totalPages}` : '—'}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 bg-white rounded-xl border border-slate-200">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-slate-600 text-sm">{error}</p>
          <button
            onClick={fetchRegistros}
            className="px-4 py-2 bg-[var(--ddna-blue)] text-white rounded-lg text-sm hover:opacity-90"
          >
            Reintentar
          </button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-[var(--ddna-blue)] animate-spin" />
        </div>
      ) : registros.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200 gap-3">
          <FileText className="w-12 h-12 text-slate-300" />
          {hasActiveFilters ? (
            <>
              <p className="text-slate-500">No se encontraron registros para estos filtros</p>
              <p className="text-sm text-slate-400">
                Intenta ajustar los filtros o limpiar la búsqueda
              </p>
            </>
          ) : (
            <>
              <p className="text-slate-500">No hay registros cargados todavía</p>
              <p className="text-sm text-slate-400">Crea el primero usando el formulario</p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <SortableHeader
                    label="Fecha de la noticia"
                    column="fecha_noticia"
                    currentSort={sortColumn}
                    currentDir={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Carga"
                    column="fecha_sincronizacion"
                    currentSort={sortColumn}
                    currentDir={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Medio"
                    column="medio"
                    currentSort={sortColumn}
                    currentDir={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Título"
                    column="titulo"
                    currentSort={sortColumn}
                    currentDir={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Sección"
                    column="seccion"
                    currentSort={sortColumn}
                    currentDir={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Tópico"
                    column="topico_principal"
                    currentSort={sortColumn}
                    currentDir={sortDirection}
                    onSort={handleSort}
                  />
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Caso
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actores
                  </th>
                  <SortableHeader
                    label="Estado"
                    column="estado"
                    currentSort={sortColumn}
                    currentDir={sortDirection}
                    onSort={handleSort}
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registros.map(r => (
                  <tr
                    key={r.id}
                    onClick={() => onEditRegistro(r.id)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap font-medium">
                      {formatDate(r.fecha_noticia)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap">
                      {formatDate(r.fecha_sincronizacion)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800 font-medium">{r.medio}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{r.titulo}</span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setDeleteConfirm({ id: r.id, titulo: r.titulo });
                          }}
                          className="flex-shrink-0 p-1 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{r.seccion || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-[200px] truncate">
                      {r.topico_principal || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {r.caso ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Sí
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[var(--ddna-blue)]/10 text-xs font-medium text-[var(--ddna-blue)]">
                        {r.monitoreo_actores?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StateBadge estado={r.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom pagination */}
      {registros.length > 0 && (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <span className="text-sm text-slate-500 px-2">
            {page + 1} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Delete confirmation modal ──────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Eliminar registro</h3>
            <p className="text-sm text-slate-600 mb-1">
              ¿Estás seguro de eliminar el registro?
            </p>
            <p className="text-sm font-medium text-slate-800 mb-4 truncate">
              &ldquo;{deleteConfirm.titulo}&rdquo;
            </p>
            <p className="text-xs text-red-600 mb-5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Esta acción no se puede deshacer. También se eliminarán los actores asociados.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
