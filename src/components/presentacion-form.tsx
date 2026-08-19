'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Info,
  Play,
  AlertCircle,
  Search,
  X,
  BarChart2,
  LineChart,
  PieChart,
  LayoutGrid,
} from 'lucide-react';
import clsx from 'clsx';
import { getPresentacionKpis } from '@/lib/actions/presentacion-kpis';
import type { PresentationContext, KpiOption, KpisByAxis } from '@/lib/presentacion-ia';
import { PRESENTATION_AXES } from '@/lib/presentacion-ia';

interface PresentacionFormProps {
  onGenerate: (context: PresentationContext, selectedItems: KpiOption[]) => void;
}

const VIZ_ICON: Record<string, React.ReactNode> = {
  bar:  <BarChart2  className="w-3 h-3" />,
  line: <LineChart  className="w-3 h-3" />,
  pie:  <PieChart   className="w-3 h-3" />,
  card: <LayoutGrid className="w-3 h-3" />,
};

export function PresentacionForm({ onGenerate }: PresentacionFormProps) {
  const [titulo, setTitulo] = useState('');
  const [tematica, setTematica] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [poblacionObjetivo, setPoblacionObjetivo] = useState('');

  const [kpisPorEje, setKpisPorEje] = useState<KpisByAxis>({});
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [errorKpis, setErrorKpis] = useState<string | null>(null);

  // Selected by titulo (unique per eje)
  const [selectedTitulos, setSelectedTitulos] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState('');
  const [openAxes, setOpenAxes] = useState<Set<string>>(new Set());

  // Count total selected KPIs (expanding groups)
  const totalSelectedKpis = React.useMemo(() => {
    let count = 0;
    for (const ejeItems of Object.values(kpisPorEje)) {
      for (const item of ejeItems) {
        if (selectedTitulos.has(item.titulo)) count += item.kpi_nombres.length;
      }
    }
    return count;
  }, [selectedTitulos, kpisPorEje]);

  useEffect(() => {
    getPresentacionKpis()
      .then((data) => {
        setKpisPorEje(data.kpis_por_eje);
        setOpenAxes(new Set(Object.keys(data.kpis_por_eje)));
      })
      .catch((err) => {
        setErrorKpis(err instanceof Error ? err.message : 'Error al cargar indicadores');
      })
      .finally(() => setLoadingKpis(false));
  }, []);

  const toggleAxisAccordion = (axisId: string) => {
    setOpenAxes(prev => {
      const next = new Set(prev);
      next.has(axisId) ? next.delete(axisId) : next.add(axisId);
      return next;
    });
  };

  const toggleItem = (item: KpiOption) => {
    setSelectedTitulos(prev => {
      const next = new Set(prev);
      if (next.has(item.titulo)) {
        next.delete(item.titulo);
      } else {
        // Check 30-KPI limit
        if (totalSelectedKpis + item.kpi_nombres.length <= 30) {
          next.add(item.titulo);
        }
      }
      return next;
    });
  };

  const handleSelectAllAxis = (_axisId: string, items: KpiOption[]) => {
    const allSelected = items.every(i => selectedTitulos.has(i.titulo));
    setSelectedTitulos(prev => {
      const next = new Set(prev);
      if (allSelected) {
        items.forEach(i => next.delete(i.titulo));
      } else {
        for (const item of items) {
          if (totalSelectedKpis + item.kpi_nombres.length > 30) break;
          next.add(item.titulo);
        }
      }
      return next;
    });
  };

  const getAxisMeta = (axisId: string) =>
    PRESENTATION_AXES.find(a => a.id === axisId) || {
      label: axisId.toUpperCase(),
      description: '',
      icon: '📊',
    };

  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const matchesSearch = (item: KpiOption) => {
    if (!searchQuery.trim()) return true;
    const q = normalize(searchQuery);
    return normalize(item.titulo).includes(q) || normalize(item.fuente_label || '').includes(q);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return <span>{text}</span>;
    const q = normalize(query);
    const idx = normalize(text).indexOf(q);
    if (idx === -1) return <span>{text}</span>;
    return (
      <span>
        {text.slice(0, idx)}
        <mark className="bg-[#FF7F11]/20 text-[#FF7F11] rounded px-0.5 not-italic font-medium">
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </span>
    );
  };

  const handleFormSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!titulo.trim() || !tematica.trim() || selectedTitulos.size === 0) return;

    const selectedItems: KpiOption[] = [];
    for (const ejeItems of Object.values(kpisPorEje)) {
      for (const item of ejeItems) {
        if (selectedTitulos.has(item.titulo)) {
          selectedItems.push(item);
        }
      }
    }

    onGenerate(
      {
        titulo: titulo.trim(),
        tematica: tematica.trim(),
        objetivo: objetivo.trim(),
        poblacion_objetivo: poblacionObjetivo.trim(),
      },
      selectedItems,
    );
  };

  const isGenerateDisabled = !titulo.trim() || !tematica.trim() || selectedTitulos.size === 0;

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8 font-body">
      {/* SECTION A */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
          <div className="w-1.5 h-6 bg-[#FF7F11] rounded-full" />
          <h3 className="font-accent text-base font-semibold text-[#334155]">
            Sección A — Contexto de la presentación
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">
              Título de la presentación <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ej: Situación de la Niñez en Córdoba"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF7F11] focus:border-[#FF7F11]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">
              Temática principal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={tematica}
              onChange={e => setTematica(e.target.value)}
              placeholder="Ej: Derechos de NNyA en Córdoba 2024"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF7F11] focus:border-[#FF7F11]"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-gray-700">
              Objetivo <span className="text-gray-400 font-normal">(Opcional)</span>
            </label>
            <textarea
              rows={2}
              value={objetivo}
              onChange={e => setObjetivo(e.target.value)}
              placeholder="Ej: Informar a funcionarios sobre situación de infancia y proponer mejoras en inversión"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#FF7F11] focus:border-[#FF7F11]"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-gray-700">
              Audiencia / Población objetivo <span className="text-gray-400 font-normal">(Opcional)</span>
            </label>
            <input
              type="text"
              value={poblacionObjetivo}
              onChange={e => setPoblacionObjetivo(e.target.value)}
              placeholder="Ej: Funcionarios del área de niñez, legisladores y organizaciones sociales"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF7F11] focus:border-[#FF7F11]"
            />
          </div>
        </div>
      </section>

      {/* SECTION B */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-[#FF7F11] rounded-full" />
            <h3 className="font-accent text-base font-semibold text-[#334155]">
              Sección B — Selección de indicadores
            </h3>
          </div>
          <div className={clsx(
            'text-sm font-semibold px-3 py-1 rounded-full font-accent transition-colors',
            totalSelectedKpis >= 30
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-[#334155]/5 text-[#334155]',
          )}>
            {totalSelectedKpis} / 30 KPIs
          </div>
        </div>

        {loadingKpis && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-gray-50 border border-gray-100 rounded-lg p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {errorKpis && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{errorKpis}</p>
          </div>
        )}

        {!loadingKpis && !errorKpis && (() => {
          const totalFound = Object.values(kpisPorEje).reduce(
            (acc, items) => acc + items.filter(matchesSearch).length, 0,
          );

          return (
            <div className="space-y-3">
              {/* Search */}
              <div className="space-y-1.5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') e.preventDefault();
                      else if (e.key === 'Escape') { e.stopPropagation(); setSearchQuery(''); }
                    }}
                    placeholder="Buscar indicador... (ej: pobreza, mortalidad, cariño)"
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30 focus:border-[#FF7F11]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {searchQuery.trim() && (
                  <p className="text-xs text-gray-500 pl-1 font-medium">
                    {totalFound} {totalFound === 1 ? 'resultado' : 'resultados'}
                  </p>
                )}
              </div>

              {totalSelectedKpis >= 30 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-xs">
                  <Info className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <span>Límite de 30 KPIs alcanzado. Desmarcá algún indicador para agregar más.</span>
                </div>
              )}

              {searchQuery.trim() !== '' && totalFound === 0 ? (
                <div className="text-center py-8 text-gray-400 font-body text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>No se encontraron resultados para <strong>"{searchQuery}"</strong></p>
                </div>
              ) : (
                Object.entries(kpisPorEje).map(([axisId, items]) => {
                  const filtered = items.filter(matchesSearch);
                  if (searchQuery.trim() !== '' && filtered.length === 0) return null;

                  const meta = getAxisMeta(axisId);
                  const isOpen = searchQuery.trim() !== '' ? true : openAxes.has(axisId);
                  const selectedInAxis = filtered.filter(i => selectedTitulos.has(i.titulo));
                  const isAllSelected = selectedInAxis.length === filtered.length && filtered.length > 0;
                  const isSomeSelected = selectedInAxis.length > 0 && selectedInAxis.length < filtered.length;

                  return (
                    <div key={axisId} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                      {/* Accordion Header */}
                      <div
                        onClick={() => toggleAxisAccordion(axisId)}
                        className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 cursor-pointer select-none hover:bg-gray-100/70 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            ref={el => { if (el) el.indeterminate = isSomeSelected; }}
                            onChange={() => handleSelectAllAxis(axisId, filtered)}
                            disabled={totalSelectedKpis >= 30 && !isSomeSelected && !isAllSelected}
                            className="w-4 h-4 rounded border-gray-300 text-[#FF7F11] focus:ring-[#FF7F11] cursor-pointer"
                          />
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-lg flex-shrink-0">{meta.icon}</span>
                            <div>
                              <span className="font-accent text-sm font-semibold text-[#334155]">
                                {meta.label}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({selectedInAxis.length} de {filtered.length} seleccionados)
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>

                      {/* Accordion Content */}
                      {isOpen && (
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white">
                          {filtered.map(item => {
                            const isChecked = selectedTitulos.has(item.titulo);
                            const wouldExceed = !isChecked && totalSelectedKpis + item.kpi_nombres.length > 30;
                            const isDisabled = wouldExceed;

                            return (
                              <label
                                key={item.titulo}
                                className={clsx(
                                  'flex items-start gap-3 p-3 rounded-lg border transition-all select-none',
                                  isChecked
                                    ? 'border-[#FF7F11]/40 bg-[#FF7F11]/5 shadow-sm'
                                    : 'border-gray-100 hover:bg-gray-50',
                                  isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isDisabled}
                                  onChange={() => toggleItem(item)}
                                  className="w-4 h-4 rounded border-gray-300 text-[#FF7F11] focus:ring-[#FF7F11] mt-1 cursor-pointer"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-accent text-sm font-semibold text-gray-800 leading-tight">
                                    {highlightMatch(item.titulo, searchQuery)}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-500">
                                    {/* Viz type badge */}
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-accent font-semibold">
                                      {VIZ_ICON[item.tipo_viz] ?? VIZ_ICON.card}
                                      {item.tipo_viz}
                                    </span>
                                    {/* KPI count badge — only for groups */}
                                    {item.es_grupo && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#334155]/8 text-[#334155] font-accent font-semibold">
                                        {item.total_kpis} indicadores
                                      </span>
                                    )}
                                    {item.fuente_label && (
                                      <>
                                        <span>·</span>
                                        <span className="truncate max-w-[140px]" title={item.fuente_label}>
                                          {item.fuente_label}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          );
        })()}
      </section>

      {/* Submit */}
      <div className="pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={isGenerateDisabled}
          className={clsx(
            'w-full py-3 text-white font-accent font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md',
            isGenerateDisabled
              ? 'bg-gray-300 cursor-not-allowed shadow-none'
              : 'bg-[#334155] hover:bg-[#334155]/90 active:scale-[0.99] transform',
          )}
        >
          <Play className="w-5 h-5 fill-current" />
          Generar Presentación
        </button>
      </div>
    </form>
  );
}
