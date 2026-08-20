'use client';

import React, { useState } from 'react';
import pptxgen from 'pptxgenjs';
import { Download, Loader2 } from 'lucide-react';
import type { PresentationReport } from '@/lib/presentacion-ia';

interface DownloadPptxButtonProps {
  presentation: PresentationReport;
}

export function DownloadPptxButton({ presentation }: DownloadPptxButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_16x9';

      presentation.slides.forEach((slide) => {
        const pSlide = pptx.addSlide();
        const type = slide.tipo;

        // 1. Determine background color (hex format without '#')
        let bgColor = 'FFFFFF';
        let textColor = '1A2556';
        let titleColor = '1A2556';

        if (type === 'cover' || type === 'cierre') {
          bgColor = '1A2556';
          textColor = 'FFFFFF';
          titleColor = 'FFFFFF';
        } else if (type === 'alarma') {
          bgColor = 'FEF2F2'; // Light red
          textColor = '1E293B';
          titleColor = '991B1B'; // Dark red
        }

        pSlide.background = { fill: bgColor };

        // 2. Render Slide Title
        pSlide.addText(slide.titulo, {
          x: 0.8,
          y: 0.6,
          w: 11.7, // widescreen w is ~13.33, h is ~7.5. (16:9 in pptxgenjs is 13.33 x 7.5 inches)
          h: 0.8,
          fontSize: 28,
          bold: true,
          color: titleColor,
          fontFace: 'Arial',
        });

        // 3. Render Subtitle if present (e.g. cover, cierre, or others)
        if (slide.subtitulo) {
          pSlide.addText(slide.subtitulo, {
            x: 0.8,
            y: 1.3,
            w: 11.7,
            h: 0.5,
            fontSize: 16,
            color: type === 'cover' || type === 'cierre' ? 'FF7F11' : '64748B',
            fontFace: 'Arial',
          });
        }

        // ── Layout constants (16:9 = 13.33" × 7.5") ──────────────
        const SLIDE_W = 13.33;
        const SLIDE_H = 7.5;
        const MARGIN = 0.5;
        const CONTENT_X = MARGIN;
        const CONTENT_W = SLIDE_W - MARGIN * 2;  // 12.33"
        const FOOTER_H = 0.35;                   // fuentes al pie
        const INSIGHT_H = 0.65;                  // caja insight
        const INSIGHT_Y = SLIDE_H - FOOTER_H - INSIGHT_H - 0.15;
        const FOOTER_Y = SLIDE_H - FOOTER_H - 0.05;
        const DATA_BOTTOM = INSIGHT_Y - 0.15;    // límite inferior de datos

        // 4. Render Narrative (body text) — autofit vertical, máx 2 líneas
        const narrativeY = slide.subtitulo ? 1.8 : 1.4;
        const NARRATIVE_H = 0.9; // altura fija, shrink si desborda
        pSlide.addText(slide.narrativa, {
          x: CONTENT_X,
          y: narrativeY,
          w: CONTENT_W,
          h: NARRATIVE_H,
          fontSize: 13,
          color: textColor,
          fontFace: 'Arial',
          align: 'left',
          shrinkText: true,  // reduce fuente si no entra
          wrap: true,
        });

        // 5. Render Data / KPIs
        if (slide.datos && slide.datos.length > 0) {
          const dataY = narrativeY + NARRATIVE_H + 0.15;
          const dataH = DATA_BOTTOM - dataY; // altura disponible real

          // KPI destacado o alarma con 1 dato → valor grande + detalle
          if ((type === 'kpi_destacado' || type === 'alarma') && slide.datos.length === 1) {
            const dp = slide.datos[0];
            const displayVal = `${dp.valor}${dp.unidad ? ' ' + dp.unidad : ''}`;

            pSlide.addText(displayVal, {
              x: CONTENT_X,
              y: dataY,
              w: 6.0,
              h: 1.1,
              fontSize: 52,
              bold: true,
              color: type === 'alarma' ? 'DC2626' : 'FF7F11',
              fontFace: 'Arial',
              shrinkText: true,
            });

            let details = dp.label;
            if (dp.periodo) details += ` · Período: ${dp.periodo}`;
            if (dp.tendencia && dp.tendencia !== 'sin_datos') {
              const arrow = dp.tendencia === 'up' ? '↑' : dp.tendencia === 'down' ? '↓' : '→';
              details += `  ${arrow}${dp.delta_pct ? ` ${dp.delta_pct}%` : ''}`;
            }

            pSlide.addText(details, {
              x: CONTENT_X,
              y: dataY + 1.15,
              w: CONTENT_W,
              h: 0.45,
              fontSize: 13,
              bold: true,
              color: textColor,
              fontFace: 'Arial',
              shrinkText: true,
            });

          } else {
            // Tabla para múltiples datos, comparativo, tendencia
            const isTrend = type === 'tendencia' && slide.datos[0]?.serie;
            let tableRows: string[][];
            let headers: string[];

            if (isTrend) {
              headers = ['Período', 'Valor'];
              tableRows = (slide.datos[0].serie ?? []).slice(0, 8).map(s => [
                String(s.periodo),
                String(s.valor),
              ]);
            } else {
              headers = ['Indicador', 'Valor'];
              // Limitar a 10 filas máximo para que quepan en el slide
              tableRows = slide.datos.slice(0, 10).map(dp => {
                let valStr = String(dp.valor);
                if (dp.unidad) valStr += ` ${dp.unidad}`;
                if (dp.periodo) valStr += ` (${dp.periodo})`;
                return [dp.label || '', valStr];
              });
            }

            const allRows = [
              headers.map(h => ({
                text: h,
                options: { bold: true, fill: '1A2556', color: 'FFFFFF', fontSize: 12 },
              })),
              ...tableRows.map(row =>
                row.map(cell => ({ text: cell, options: { color: '1E293B', fontSize: 11 } }))
              ),
            ];

            // Altura por fila: ~0.32" — calcular cuántas filas caben
            const rowH = 0.32;
            const maxTableH = Math.min(dataH, rowH * allRows.length);

            pSlide.addTable(allRows as Parameters<typeof pSlide.addTable>[0], {
              x: CONTENT_X,
              y: dataY,
              w: CONTENT_W,
              h: maxTableH,
              colW: isTrend ? [CONTENT_W * 0.5, CONTENT_W * 0.5] : [CONTENT_W * 0.72, CONTENT_W * 0.28],
              border: { type: 'solid', pt: 0.5, color: 'E2E8F0' },
              fontFace: 'Arial',
              fontSize: 11,
              rowH,
            });
          }
        }

        // 6. Insight box — posición fija sobre el footer
        if (slide.insight && type !== 'cover' && type !== 'cierre') {
          pSlide.addText(`💡 ${slide.insight}`, {
            x: CONTENT_X,
            y: INSIGHT_Y,
            w: CONTENT_W,
            h: INSIGHT_H,
            fontSize: 11,
            italic: true,
            color: '92400E',
            fontFace: 'Arial',
            fill: { color: 'FEF3C7' },
            shrinkText: true,
            wrap: true,
          });
        }

        // 7. Fuentes — pie de página fijo
        if (slide.fuentes && slide.fuentes.length > 0) {
          const sourcesStr = `Fuentes: ${slide.fuentes.slice(0, 3).join(' · ')}`;
          pSlide.addText(sourcesStr, {
            x: CONTENT_X,
            y: FOOTER_Y,
            w: CONTENT_W,
            h: FOOTER_H,
            fontSize: 8,
            color: type === 'cover' || type === 'cierre' ? 'CBD5E1' : '94A3B8',
            fontFace: 'Arial',
            shrinkText: true,
          });
        }
      });

      // Save file
      await pptx.writeFile({ fileName: 'presentacion-ddna.pptx' });
    } catch (error) {
      console.error('Error al descargar PPTX:', error);
      alert('Ocurrió un error al generar la descarga de la presentación.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="px-4 py-2 bg-orange hover:bg-orange/90 disabled:bg-gray-300 text-white font-accent font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Descargar PPTX
        </>
      )}
    </button>
  );
}
