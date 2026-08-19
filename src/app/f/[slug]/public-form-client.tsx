'use client';

// Client wrapper for the standalone public form (/f/[slug]). Renders the shared
// FormRenderer, submits via the public API route and manages the success/error
// states. Browser-safe; the server re-validates everything on submit.

import { useState } from 'react';
import { FormRenderer } from '@/components/formularios/form-renderer';
import { FormConfirmation } from '@/components/formularios/form-confirmation';
import type { DefinicionFormulario } from '@/lib/formularios/types';

interface PublicFormClientProps {
  slug: string;
  titulo: string;
  descripcion: string | null;
  definicion: DefinicionFormulario;
}

type SubmitStatus = 'idle' | 'success';

export function PublicFormClient({ slug, titulo, descripcion, definicion }: PublicFormClientProps) {
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [globalError, setGlobalError] = useState<string | null>(null);

  async function handleSubmit(answers: Record<string, unknown>) {
    setGlobalError(null);
    try {
      const response = await fetch('/api/formularios/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, respuestas: answers }),
      });

      if (response.ok) {
        setStatus('success');
        return;
      }

      let message = 'No se pudo enviar la respuesta. Intentá de nuevo.';
      try {
        const data = (await response.json()) as { error?: string };
        if (typeof data.error === 'string' && data.error !== '') {
          message = data.error;
        }
      } catch {
        // Non-JSON error body: keep the default message.
      }

      if (response.status === 429) {
        message = 'Demasiadas solicitudes. Intentá de nuevo en unos minutos.';
      }

      setGlobalError(message);
    } catch {
      setGlobalError('No se pudo enviar la respuesta. Verificá tu conexión e intentá de nuevo.');
    }
  }

  if (status === 'success') {
    return <FormConfirmation />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-10 lg:py-14">
      {globalError && (
        <p
          role="alert"
          className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {globalError}
        </p>
      )}
      <FormRenderer
        definicion={definicion}
        titulo={titulo}
        descripcion={descripcion}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
