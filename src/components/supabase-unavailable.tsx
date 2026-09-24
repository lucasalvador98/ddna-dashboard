import { DatabaseZap } from 'lucide-react';

/**
 * Intentional local/degraded state. It prevents data pages from fabricating
 * metrics when the independent Supabase service has not been configured.
 */
export function SupabaseUnavailable() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
        <DatabaseZap className="h-8 w-8 text-gray-400" />
      </div>
      <h2 className="text-base font-semibold text-navy">Datos no configurados</h2>
      <p className="mt-1 max-w-md text-sm text-gray-500">
        Esta instancia local del Observatorio no tiene conexión a Supabase. No se muestran datos de ejemplo como si fueran datos institucionales.
      </p>
    </div>
  );
}
