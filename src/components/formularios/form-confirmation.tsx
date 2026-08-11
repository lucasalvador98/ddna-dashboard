// Public success screen shown after a form is submitted anonymously.
// UI strings in Spanish; identifiers/comments in English.

export function FormConfirmation() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-display text-2xl text-[var(--ddna-navy)]">¡Gracias por responder!</h1>
        <p className="text-sm text-slate-500 mt-2">
          Tu respuesta fue registrada correctamente. Podés cerrar esta página.
        </p>
      </div>
    </div>
  );
}
