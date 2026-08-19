// Public fallback shown when a form slug does not exist or the form is inactive.
// UI strings in Spanish; identifiers/comments in English.

export function FormularioNoDisponible() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-display text-2xl text-[var(--ddna-navy)]">Formulario no disponible</h1>
        <p className="text-sm text-slate-500 mt-2">
          Este formulario no existe o ya no está disponible para recibir respuestas.
        </p>
      </div>
    </div>
  );
}
