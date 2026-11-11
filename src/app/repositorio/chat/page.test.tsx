import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ChatPage from './page';

const { useAuthMock } = vi.hoisted(() => ({ useAuthMock: vi.fn() }));

vi.mock('@/components/auth-provider', () => ({ useAuth: useAuthMock }));
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

function mockAccess(roleName: string, permissionsStatus = 200, chatResponse?: Response) {
  useAuthMock.mockReturnValue({
    user: { id: 'user-1', user_metadata: { role: 'admin' } },
    loading: false,
  });
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/api/auth/config')) {
      return new Response(JSON.stringify({ enabled: true, protected_routes: ['/repositorio'] }));
    }
    if (url.includes('/api/auth/me/permissions')) {
      return new Response(JSON.stringify({
        user_id: 'user-1',
        role: { id: roleName === 'admin' ? 1 : 2, name: roleName },
        effective: {},
      }), { status: permissionsStatus });
    }
    return chatResponse ?? new Response('{}', { status: 500 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function submitQuestion(done: Record<string, unknown>) {
  mockAccess('admin', 200, createSseResponse(done));
  render(<ChatPage />);
  fireEvent.change(await screen.findByRole('textbox', { name: 'Escribí tu pregunta' }), {
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

  it('shows no input to non-admin users before they submit a question', async () => {
    const fetchMock = mockAccess('agente');
    render(<ChatPage />);

    expect(await screen.findByText('Solo las personas con rol de administrador pueden utilizar el asistente de investigación.')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Escribí tu pregunta' })).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('/api/repositorio/chat'), expect.anything());
  });

  it('fails closed when the self-permissions endpoint fails', async () => {
    mockAccess('admin', 500);
    render(<ChatPage />);

    expect(await screen.findByText('No se pudieron verificar los permisos. Esta función está temporalmente deshabilitada.')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Escribí tu pregunta' })).not.toBeInTheDocument();
  });
});
