import { Filter } from "lucide-react";
import clsx from "clsx";

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function ChartContainer({
  title,
  subtitle,
  children,
  className,
  actions,
}: ChartContainerProps) {
  return (
    <section
      className={clsx(
        "bg-white rounded-xl border border-[#E0E0E0] overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b border-[#E0E0E0]">
        <div>
          <h3 className="text-lg font-bold text-[#00074E]">{title}</h3>
          {subtitle && (
            <p className="text-sm text-[#4D4D4D] mt-1">{subtitle}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#4D4D4D] bg-[#FDF3E7] rounded-lg hover:bg-[#FFE8CD] transition-colors"
              aria-label="Filtrar datos"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </button>
            {actions}
          </div>
        )}
      </div>

      {/* Chart Area */}
      <div className="p-6">{children}</div>
    </section>
  );
}

interface ChartPlaceholderProps {
  message?: string;
  height?: string;
}

export function ChartPlaceholder({
  message = "Gráfico en desarrollo",
  height = "h-64",
}: ChartPlaceholderProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center bg-[#FDF3E7] rounded-lg border-2 border-dashed border-[#E0E0E0]",
        height
      )}
    >
      <div className="w-16 h-16 rounded-full bg-[#FFE8CD] flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-[#F3A712]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-[#4D4D4D]">{message}</p>
      <p className="text-xs text-[#4D4D4D]/60 mt-1">
        Los datos se mostrarán aquí
      </p>
    </div>
  );
}
