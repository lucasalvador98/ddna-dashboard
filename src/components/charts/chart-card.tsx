'use client';

import clsx from 'clsx';

type ChartCardColor = 'terracotta' | 'amber' | 'magenta' | 'blue' | 'navy' | 'orange';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  color?: ChartCardColor;
  fuente?: string;
  ultimaActualizacion?: string | null;
}

const colorClasses: Record<ChartCardColor, string> = {
  terracotta: '#C2410C',
  amber: '#C2410C',
  magenta: '#8A4B4B',
  blue: '#165DFF',
  navy: '#050506',
  orange: '#B3541E',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getFuenteLabel(fuente: string | undefined): string {
  if (!fuente) return 'Fuente no especificada';
  if (fuente === 'api') return 'Datos de API externa';
  if (fuente === 'manual') return 'Carga manual';
  return fuente;
}

export function ChartCard({
  title,
  subtitle,
  children,
  className,
  color = 'blue',
  fuente,
  ultimaActualizacion,
}: ChartCardProps) {
  const accentColor = colorClasses[color];

  return (
    <section
      className={clsx('bg-white rounded-2xl border-2 border-border overflow-hidden', className)}
    >
      {/* Header */}
      <div className="p-6 border-b-2 border-border">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full" style={{ backgroundColor: accentColor }} />
          <div>
            <h3 className="font-display text-lg text-navy tracking-tight">{title}</h3>
            {subtitle && <p className="font-body text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-6">{children}</div>

      {/* Footer con fuente y fecha */}
      {(fuente || ultimaActualizacion) && (
        <div className="px-6 pb-4 pt-0 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {fuente && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {getFuenteLabel(fuente)}
            </span>
          )}
          {ultimaActualizacion && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Actualizado: {formatDate(ultimaActualizacion)}
            </span>
          )}
        </div>
      )}
    </section>
  );
}
