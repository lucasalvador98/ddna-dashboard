import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ChatPage from './page';

vi.mock('@/lib/supabase', () => ({ supabase: {} }));

function createSseResponse(done: Record<string, unknown>) {
  const events = [
    'event: token\ndata: {"text":"Respuesta de prueba."}\n\n',
    `event: done\ndata: ${JSON.stringify(done)}\n\n`,
  ].join('');
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(events));
      controller.close();
    },
  });

  return new Response(body, { headers: { 'Content-Type': 'text/event-stream' } });
}

async function submitQuestion(done: Record<string, unknown>) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createSseResponse(done)));
  render(<ChatPage />);
  fireEvent.change(screen.getByRole('textbox', { name: 'Escribí tu pregunta' }), {
    target: { value: 'Consulta de prueba' },
  });
  fireEvent.click(screen.getByRole('button', { name: /enviar/i }));
  await screen.findByText('Respuesta de prueba.');
}

describe('repository chat retrieval status', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('distinguishes a retrieval warning from a successful search with no matches', async () => {
    await submitQuestion({
      sources: [],
      toolsUsed: ['searchKnowledgeBase'],
      hasContext: false,
      searchMethod: 'none',
      warning: 'La búsqueda textual no está disponible.',
    });

    expect(screen.getByText('La búsqueda generó una advertencia y no encontró documentos relacionados.')).toBeInTheDocument();
    expect(screen.getByText('La búsqueda textual no está disponible.')).toBeInTheDocument();
    expect(screen.queryByText('No hay documentos procesados')).not.toBeInTheDocument();
  });

  it('reports an empty retrieval and the method without claiming the corpus is unprocessed', async () => {
    await submitQuestion({
      sources: [],
      toolsUsed: ['searchKnowledgeBase'],
      hasContext: false,
      searchMethod: 'text',
    });

    expect(screen.getByText('La búsqueda no encontró documentos relacionados.')).toBeInTheDocument();
    expect(screen.getByText('Método de búsqueda: Texto completo')).toBeInTheDocument();
    expect(screen.queryByText('No hay documentos procesados')).not.toBeInTheDocument();
  });

  it('preserves the context result when retrieval also reports a warning', async () => {
    await submitQuestion({
      sources: [{ fileName: 'informe.pdf' }],
      toolsUsed: ['searchKnowledgeBase'],
      hasContext: true,
      searchMethod: 'hybrid',
      warning: 'La búsqueda vectorial falló; los resultados pueden estar incompletos.',
    });

    expect(screen.getByText('Se encontraron documentos relacionados, pero la búsqueda generó una advertencia.')).toBeInTheDocument();
    expect(screen.getByText('Método de búsqueda: Híbrido')).toBeInTheDocument();
    expect(screen.getByText('La búsqueda vectorial falló; los resultados pueden estar incompletos.')).toBeInTheDocument();
  });
});
