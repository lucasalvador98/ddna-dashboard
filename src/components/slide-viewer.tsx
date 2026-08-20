'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Check,
  TrendingUp,
  TrendingDown,
  Sparkles,
  BookOpen,
  FileDown,
} from 'lucide-react';
import clsx from 'clsx';
import type { PresentationReport, PresentationSlide, SlideDataPoint } from '@/lib/presentacion-ia';

interface SlideViewerProps {
  presentation: PresentationReport;
}

export function SlideViewer({ presentation }: SlideViewerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  const slides = presentation.slides;
  const currentSlide = slides[currentIdx];
  const totalSlides = slides.length;
  const progressPercent = Math.round(((currentIdx + 1) / totalSlides) * 100);

  const nextSlide = () => {
    setCurrentIdx((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  };

  const prevSlide = () => {
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : prev));
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Helper to parse numeric values for charts/bars
  const parseNumericValue = (v: string | number): number => {
    if (typeof v === 'number') return v;
    const match = v.match(/([\d.,]+)/);
    if (!match) return 0;
    return parseFloat(match[1].replace(',', '.'));
  };

  // Render slides according to type
  const renderSlideContent = (slide: PresentationSlide) => {
    switch (slide.tipo) {
      case 'cover':
        return (
          <div className="h-full flex flex-col justify-between p-8 bg-navy text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-xs font-accent tracking-widest text-orange font-bold uppercase">
                DDNA Córdoba • Presentación IA
              </span>
              <BookOpen className="w-5 h-5 text-white/60" />
            </div>

            <div className="my-auto space-y-4">
              <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight tracking-tight text-white">
                {slide.titulo}
              </h1>
              {slide.subtitulo && (
                <p className="font-body text-base md:text-lg text-white/80 max-w-xl">
                  {slide.subtitulo}
                </p>
              )}
            </div>

            <div className="flex justify-between items-end text-xs text-white/60 font-body">
              <div>
                <p className="font-semibold text-white/80">Objetivo:</p>
                <p className="mt-0.5 line-clamp-1">{presentation.objetivo || 'Análisis general'}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white/80">Fecha:</p>
                <p className="mt-0.5">{presentation.fecha}</p>
              </div>
            </div>
          </div>
        );

      case 'agenda':
        return (
          <div className="h-full flex flex-col justify-between p-8 bg-white">
            <div>
              <span className="text-xs font-accent tracking-widest text-navy font-bold uppercase">
                Índice de Temas
              </span>
              <h2 className="font-accent text-xl md:text-2xl font-bold text-navy mt-1">
                {slide.titulo}
              </h2>
              <p className="font-body text-sm text-gray-500 mt-2">
                {slide.narrativa}
              </p>
            </div>

            <div className="my-auto grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50%] overflow-y-auto pr-2">
              {slide.datos.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-orange text-white flex items-center justify-center text-xs font-bold font-accent">
                    {idx + 1}
                  </div>
                  <span className="font-body text-xs font-semibold text-gray-700 truncate">
                    {item.label || String(item.valor)}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-400 font-body">
              Resumen estructural de la presentación
            </div>
          </div>
        );

      case 'kpi_destacado': {
        const dp = slide.datos?.[0] || { label: 'Indicador', valor: 'N/D' };
        const displayVal = `${dp.valor}${dp.unidad || ''}`;
        
        let trendIcon = null;
        let trendColor = 'text-gray-400 bg-gray-50 border-gray-200';
        if (dp.tendencia === 'up') {
          trendIcon = <TrendingUp className="w-4 h-4" />;
          trendColor = 'text-green-600 bg-green-50 border-green-200';
        } else if (dp.tendencia === 'down') {
          trendIcon = <TrendingDown className="w-4 h-4" />;
          trendColor = 'text-red-600 bg-red-50 border-red-200';
        }

        return (
          <div className="h-full flex flex-col justify-between p-8 bg-white">
            <div>
              <span className="text-xs font-accent tracking-widest text-navy font-bold uppercase">
                Métrica Destacada
              </span>
              <h2 className="font-accent text-xl md:text-2xl font-bold text-navy mt-1">
                {slide.titulo}
              </h2>
            </div>

            <div className="my-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 space-y-2">
                <span className="font-accent text-xs uppercase tracking-wider text-gray-400">
                  {dp.label}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl md:text-6xl font-black text-navy">
                    {dp.valor}
                  </span>
                  <span className="font-accent text-xl text-gray-500 font-bold">
                    {dp.unidad}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  {trendIcon && (
                    <span className={clsx("inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-xs font-bold", trendColor)}>
                      {trendIcon}
                      {dp.delta_pct ? `${dp.delta_pct}%` : ''}
                    </span>
                  )}
                  {dp.periodo && (
                    <span className="text-xs text-gray-500 font-body">Período: {dp.periodo}</span>
                  )}
                </div>
              </div>

              <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="font-body text-xs md:text-sm text-gray-600 leading-relaxed">
                  {slide.narrativa}
                </p>
              </div>
            </div>

            <div className="h-10" /> {/* spacing */}
          </div>
        );
      }

      case 'tendencia': {
        // Find all unique periods
        const allPeriods = Array.from(
          new Set(
            slide.datos
              .flatMap((dp) => dp.serie || [])
              .map((s) => s.periodo)
          )
        ).sort((a, b) => Number(a) - Number(b));

        return (
          <div className="h-full flex flex-col justify-between p-8 bg-white">
            <div>
              <span className="text-xs font-accent tracking-widest text-navy font-bold uppercase">
                Serie Temporal / Evolución
              </span>
              <h2 className="font-accent text-xl md:text-2xl font-bold text-navy mt-1">
                {slide.titulo}
              </h2>
            </div>

            <div className="my-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 overflow-x-auto">
                {allPeriods.length > 0 ? (
                  <table className="w-full text-xs font-body border border-gray-150 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-150 text-navy border-b border-gray-200">
                        <th className="p-2.5 text-left font-accent font-semibold">Indicador</th>
                        {allPeriods.map((p) => (
                          <th key={p} className="p-2.5 text-center font-accent font-semibold">{p}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {slide.datos.map((dp, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="p-2.5 font-medium text-gray-800 text-left max-w-[150px] truncate" title={dp.label}>
                            {dp.label}
                          </td>
                          {allPeriods.map((p) => {
                            const val = dp.serie?.find((s) => s.periodo === p)?.valor;
                            return (
                              <td key={p} className="p-2.5 text-center font-semibold text-gray-700">
                                {val !== undefined ? `${val}${dp.unidad || ''}` : '-'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4 bg-gray-55 text-center text-xs text-gray-400">
                    No hay serie temporal disponible
                  </div>
                )}
              </div>

              <div className="md:col-span-5 bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="font-body text-xs md:text-sm text-gray-600 leading-relaxed">
                  {slide.narrativa}
                </p>
              </div>
            </div>

            <div className="h-10" />
          </div>
        );
      }

      case 'comparativo': {
        const maxVal = Math.max(
          ...slide.datos.map((dp) => parseNumericValue(dp.valor)),
          1 // Avoid division by zero
        );

        return (
          <div className="h-full flex flex-col justify-between p-8 bg-white">
            <div>
              <span className="text-xs font-accent tracking-widest text-navy font-bold uppercase">
                Análisis Comparativo
              </span>
              <h2 className="font-accent text-xl md:text-2xl font-bold text-navy mt-1">
                {slide.titulo}
              </h2>
            </div>

            <div className="my-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                {slide.datos.map((dp, idx) => {
                  const val = parseNumericValue(dp.valor);
                  const percent = Math.min(Math.round((val / maxVal) * 100), 100);

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-body text-gray-600">
                        <span className="font-semibold text-gray-700 truncate pr-2 max-w-[200px]" title={dp.label}>
                          {dp.label}
                        </span>
                        <span className="font-bold flex-shrink-0">
                          {dp.valor} {dp.unidad || ''}
                        </span>
                      </div>
                      
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-navy rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="font-body text-xs md:text-sm text-gray-600 leading-relaxed">
                  {slide.narrativa}
                </p>
              </div>
            </div>

            <div className="h-10" />
          </div>
        );
      }

      case 'alarma': {
        const dp = slide.datos?.[0];
        return (
          <div className="h-full flex flex-col justify-between p-8 bg-red-50/50 border-2 border-red-200 rounded-xl text-red-950">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                <span className="text-xs font-accent tracking-widest text-red-700 font-bold uppercase">
                  Alerta Crítica / Desvío
                </span>
              </div>
              {dp?.periodo && (
                <span className="text-xs font-body text-red-800">Período: {dp.periodo}</span>
              )}
            </div>

            <div className="my-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 space-y-2">
                <h3 className="font-accent text-lg md:text-xl font-bold text-red-900 leading-tight">
                  {slide.titulo}
                </h3>
                
                {dp && (
                  <div className="space-y-1">
                    <p className="text-xs text-red-700 font-accent uppercase tracking-wide">{dp.label}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-5xl md:text-6xl font-black text-red-700">
                        {dp.valor}
                      </span>
                      <span className="font-accent text-xl text-red-600 font-bold">
                        {dp.unidad}
                      </span>
                      {dp.delta_pct && (
                        <span className="ml-2 px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs font-bold">
                          ↑ {dp.delta_pct}%
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 bg-white border border-red-200 rounded-xl p-4 shadow-sm">
                <p className="font-body text-xs md:text-sm text-red-900 leading-relaxed whitespace-pre-line font-medium">
                  {slide.narrativa}
                </p>
              </div>
            </div>

            <div className="h-10" />
          </div>
        );
      }

      case 'contexto':
        return (
          <div className="h-full flex flex-col justify-between p-8 bg-white">
            <div>
              <span className="text-xs font-accent tracking-widest text-navy font-bold uppercase">
                Contexto General
              </span>
              <h2 className="font-accent text-xl md:text-2xl font-bold text-navy mt-1">
                {slide.titulo}
              </h2>
            </div>

            <div className="my-auto">
              <div className="bg-navy/5 border-l-4 border-navy p-4 rounded-r-xl">
                <p className="font-body text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                  {slide.narrativa}
                </p>
              </div>
            </div>

            <div className="h-10" />
          </div>
        );

      case 'recomendacion':
        return (
          <div className="h-full flex flex-col justify-between p-8 bg-white">
            <div>
              <span className="text-xs font-accent tracking-widest text-orange font-bold uppercase">
                Propuestas / Recomendaciones
              </span>
              <h2 className="font-accent text-xl md:text-2xl font-bold text-navy mt-1">
                {slide.titulo}
              </h2>
            </div>

            <div className="my-auto max-h-[55%] overflow-y-auto pr-2 space-y-3">
              {slide.recomendacion ? (
                // Parse split guidelines/bullets
                slide.recomendacion.split('\n').filter(Boolean).map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-green-50/50 border border-green-100 rounded-lg">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="font-body text-xs md:text-sm text-gray-700 leading-snug">
                      {rec.replace(/^[-\s*•]+/, '')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400 text-xs">
                  Sin recomendaciones específicas detalladas
                </div>
              )}
            </div>

            <div className="text-xs text-gray-400 font-body">
              Acciones sugeridas basadas en el análisis de datos
            </div>
          </div>
        );

      case 'cierre':
        return (
          <div className="h-full flex flex-col justify-between p-8 bg-navy text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-xs font-accent tracking-widest text-orange font-bold uppercase">
                Conclusiones
              </span>
              <Sparkles className="w-5 h-5 text-orange animate-pulse" />
            </div>

            <div className="my-auto space-y-4 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
                {slide.titulo}
              </h2>
              <p className="font-body text-sm md:text-base text-white/80 max-w-lg mx-auto leading-relaxed whitespace-pre-line">
                {slide.narrativa}
              </p>
              {slide.recomendacion && (
                <div className="max-w-md mx-auto p-3 bg-white/5 border border-white/10 rounded-lg text-xs italic text-orange mt-4">
                  {slide.recomendacion}
                </div>
              )}
            </div>

            <div className="flex justify-between items-end text-xs text-white/60 font-body">
              <div>
                <p className="font-semibold text-white/80">Contacto DDNA Córdoba:</p>
                <p className="mt-0.5">contacto@ddnacordoba.org.ar</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white/80">Plataforma:</p>
                <p className="mt-0.5 text-white/80">Dashboard de Monitoreo</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center p-8 text-center bg-white">
            <p className="text-gray-400 text-sm">Slide no renderizable: {slide.tipo}</p>
          </div>
        );
    }
  };

  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrintPDF = () => {
    setIsPrinting(true);
    // Give React one frame to render the print zone before triggering print
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
        // Restore after dialog closes (print / cancel)
        const afterPrint = () => {
          setIsPrinting(false);
          window.removeEventListener('afterprint', afterPrint);
        };
        window.addEventListener('afterprint', afterPrint);
      });
    });
  };

  return (
    <div className="space-y-6 font-body">
      {/* Visual Progress Bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Slide frame (16:9 widescreen style approximation) */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-2xl aspect-[16/9] bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 select-none flex flex-col group">
          {currentSlide.tipo !== 'cover' && currentSlide.tipo !== 'cierre' && (
            <div
              className="h-1 flex-shrink-0"
              style={{ backgroundColor: currentSlide.color_acento || '#334155' }}
            />
          )}

          <div className="flex-1 min-h-0 relative">
            {renderSlideContent(currentSlide)}

            {currentSlide.insight &&
             currentSlide.tipo !== 'cover' &&
             currentSlide.tipo !== 'cierre' &&
             currentSlide.tipo !== 'alarma' && (
              <div className="absolute bottom-6 left-8 right-8 bg-orange/10 border border-orange rounded-lg p-2.5">
                <p className="text-xs text-navy italic font-semibold line-clamp-2" title={currentSlide.insight}>
                  <span className="font-accent uppercase font-bold text-orange mr-1.5 not-italic">Insight:</span>
                  {currentSlide.insight}
                </p>
              </div>
            )}

            {currentSlide.fuentes && currentSlide.fuentes.length > 0 && (
              <div className={clsx(
                "absolute bottom-1.5 left-8 text-[9px] truncate max-w-[80%]",
                (currentSlide.tipo === 'cover' || currentSlide.tipo === 'cierre') ? 'text-white/40' : 'text-gray-400'
              )}>
                Fuentes: {currentSlide.fuentes.join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation and Indicators */}
      <div className="slide-print-controls flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={prevSlide}
            disabled={currentIdx === 0}
            className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="font-accent text-sm font-semibold text-navy">
            {currentIdx + 1} / {totalSlides}
          </span>

          <button
            onClick={nextSlide}
            disabled={currentIdx === totalSlides - 1}
            className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Thumbnail dots */}
          <div className="flex flex-wrap gap-1.5 justify-center max-w-xs sm:max-w-sm">
            {slides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={clsx(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-accent transition-all border",
                  currentIdx === idx
                    ? "bg-orange border-orange text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}
                title={`${idx + 1}: ${slide.titulo} (${slide.tipo})`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* PDF button */}
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-3 py-2 bg-navy hover:bg-navy/90 text-white text-xs font-accent font-semibold rounded-lg transition-colors flex-shrink-0"
            title="Descargar como PDF (igual a lo que ves)"
          >
            <FileDown className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* ── Zona de impresión: renderizada solo cuando isPrinting=true ── */}
      {isPrinting && (
        <div aria-hidden="true">
          {slides.map((slide, idx) => (
            <div key={idx} className="slide-print-page">
              <div className="w-full h-full relative flex flex-col">
                {slide.tipo !== 'cover' && slide.tipo !== 'cierre' && (
                  <div
                    className="h-1.5 w-full flex-shrink-0"
                    style={{ backgroundColor: slide.color_acento || '#334155' }}
                  />
                )}
                <div className="flex-1 relative">
                  {renderSlideContent(slide)}

                  {slide.insight &&
                   slide.tipo !== 'cover' &&
                   slide.tipo !== 'cierre' &&
                   slide.tipo !== 'alarma' && (
                    <div className="absolute bottom-6 left-8 right-8 bg-orange/10 border border-orange rounded-lg p-2.5">
                      <p className="text-xs text-navy italic font-semibold">
                        <span className="font-accent uppercase font-bold text-orange mr-1.5 not-italic">Insight:</span>
                        {slide.insight}
                      </p>
                    </div>
                  )}

                  {slide.fuentes && slide.fuentes.length > 0 && (
                    <div className={clsx(
                      "absolute bottom-1.5 left-8 text-[9px] truncate max-w-[80%]",
                      (slide.tipo === 'cover' || slide.tipo === 'cierre') ? 'text-white/40' : 'text-gray-400'
                    )}>
                      Fuentes: {slide.fuentes.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
