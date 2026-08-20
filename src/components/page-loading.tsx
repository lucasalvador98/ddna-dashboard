import { Loader2 } from 'lucide-react';

interface PageLoadingProps {
  message?: string;
}

/**
 * Consistent loading spinner for DDNA dashboard pages.
 * Designed to sit inside a `space-y-6` wrapper alongside a SectionHeader.
 */
export function PageLoading({ message = 'Cargando datos...' }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 text-magenta animate-spin" />
      {message && (
        <span className="font-body text-sm text-text-primary">{message}</span>
      )}
    </div>
  );
}
