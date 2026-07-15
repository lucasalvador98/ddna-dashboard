import { AlertCircle, RefreshCw } from 'lucide-react';

interface PageErrorProps {
  message: string;
  onRetry?: () => void;
}

/**
 * Consistent error state for DDNA dashboard pages.
 * Designed to sit inside a `space-y-6` wrapper alongside a SectionHeader.
 */
export function PageError({ message, onRetry }: PageErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <AlertCircle className="w-12 h-12 text-red-400" />
      <div>
        <p className="font-body text-[#4D4D4D] mb-1">Error al cargar los datos</p>
        <p className="text-sm text-[#4D4D4D]/60 max-w-md">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#BF1363] text-white rounded-lg text-sm font-medium hover:bg-[#a01052] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      )}
    </div>
  );
}
