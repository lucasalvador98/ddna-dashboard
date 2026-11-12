import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ChatPage from './page';

const { useAuthMock } = vi.hoisted(() => ({ useAuthMock: vi.fn() }));
const localStorageDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');

vi.mock('@/components/auth-provider', () => ({ useAuth: useAuthMock }));
vi.mock('@/lib/supabase', () => ({ supabase: {} }));

const historyKey = (userId: string) =>
  `ddna-dashboard:repository-chat:active:v1:${encodeURIComponent(userId)}`;

function makeStoredMessage(role: 'user' | 'assistant', content: string, minute = 0) {
  return {
    role,
    content,
    timestamp: `2026-11-12T10:${String(minute).padStart(2, '0')}:00.000Z`,
  };
}

function seedHistory(userId: string, messages: ReturnType<typeof makeStoredMessage>[]) {
  const key = historyKey(userId);
  localStorage.setItem(key, JSON.stringify({ version: 1, messages }));
  return key;
}

function savedMessages(key: string) {
  const payload = JSON.parse(localStorage.getItem(key) ?? 'null') as {
    messages?: Array<{ role: string; content: string }>;
  } | null;
  return payload?.messages ?? [];
}

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

function createPartialSseResponse() {
  let closeStream!: () => void;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('event: token\ndata: {"text":"Respuesta parcial."}\n\n'));
      closeStream = () => controller.close();
    },
  });
  return {
    response: new Response(body, { headers: { 'Content-Type': 'text/event-stream' } }),
    close: () => closeStream(),
  };
}

function mockAccess(roleName: string, permissionsStatus = 200, chatResponse?: Response, userId = 'user-1') {
  useAuthMock.mockReturnValue({
    user: { id: userId, user_metadata: { role: 'admin' } },
    loading: false,
  });
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/api/auth/config')) {
      return new Response(JSON.stringify({ enabled: true, protected_routes: ['/repositorio'] }));
    }
    if (url.includes('/api/auth/me/permissions')) {
      return new Response(JSON.stringify({
        user_id: userId,
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
    localStorage.clear();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    if (localStorageDescriptor) Object.defineProperty(window, 'localStorage', localStorageDescriptor);
    localStorage.clear();
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

  it('restores the active transcript after remount without overwriting it with an initial empty state', async () => {
    const key = seedHistory('user-1', [makeStoredMessage('assistant', 'Respuesta guardada')]);
    mockAccess('admin');
    const firstMount = render(<ChatPage />);

    expect(await screen.findByText('Respuesta guardada')).toBeInTheDocument();
    expect(savedMessages(key).map((message) => message.content)).toEqual(['Respuesta guardada']);

    firstMount.unmount();
    mockAccess('admin');
    render(<ChatPage />);

    expect(await screen.findByText('Respuesta guardada')).toBeInTheDocument();
  });

  it('bounds the saved active transcript to its most recent messages', async () => {
    const messages = Array.from({ length: 90 }, (_, index) =>
      makeStoredMessage(index % 2 === 0 ? 'user' : 'assistant', `Mensaje ${index}`, index % 60),
    );
    const key = seedHistory('user-1', messages);
    mockAccess('admin');
    render(<ChatPage />);

    expect(await screen.findByText('Mensaje 89')).toBeInTheDocument();
    await waitFor(() => expect(savedMessages(key)).toHaveLength(80));
    expect(screen.queryByText('Mensaje 0')).not.toBeInTheDocument();
  });

  it('isolates transcript storage by user and clears the prior account on switch', async () => {
    const previousKey = seedHistory('user-1', [makeStoredMessage('assistant', 'Cuenta anterior')]);
    const nextKey = seedHistory('user-2', [makeStoredMessage('assistant', 'Cuenta actual')]);
    mockAccess('admin', 200, undefined, 'user-1');
    const page = render(<ChatPage />);

    expect(await screen.findByText('Cuenta anterior')).toBeInTheDocument();
    mockAccess('admin', 200, undefined, 'user-2');
    page.rerender(<ChatPage />);

    expect(await screen.findByText('Cuenta actual')).toBeInTheDocument();
    await waitFor(() => expect(localStorage.getItem(previousKey)).toBeNull());
    expect(screen.queryByText('Cuenta anterior')).not.toBeInTheDocument();
    expect(savedMessages(nextKey).map((message) => message.content)).toEqual(['Cuenta actual']);
  });

  it('clears the signed-out user transcript from storage and memory', async () => {
    const key = seedHistory('user-1', [makeStoredMessage('assistant', 'Historial privado')]);
    mockAccess('admin');
    const page = render(<ChatPage />);
    expect(await screen.findByText('Historial privado')).toBeInTheDocument();

    useAuthMock.mockReturnValue({ user: null, loading: false });
    page.rerender(<ChatPage />);

    await waitFor(() => expect(localStorage.getItem(key)).toBeNull());
    expect(screen.queryByText('Historial privado')).not.toBeInTheDocument();

    mockAccess('admin');
    page.rerender(<ChatPage />);
    expect(await screen.findByRole('textbox', { name: 'Escribí tu pregunta' })).toBeInTheDocument();
    expect(screen.queryByText('Historial privado')).not.toBeInTheDocument();
  });

  it('removes persisted history when the user starts a new conversation', async () => {
    const key = seedHistory('user-1', [makeStoredMessage('assistant', 'Conversación anterior')]);
    mockAccess('admin');
    render(<ChatPage />);
    expect(await screen.findByText('Conversación anterior')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /nueva conversación/i }));

    await waitFor(() => expect(localStorage.getItem(key)).toBeNull());
    expect(screen.queryByText('Conversación anterior')).not.toBeInTheDocument();
  });

  it('recovers from malformed storage and keeps chat usable', async () => {
    const key = historyKey('user-1');
    localStorage.setItem(key, '{invalid json');
    mockAccess('admin', 200, createSseResponse({ sources: [], toolsUsed: [], hasContext: false, searchMethod: 'text' }));
    render(<ChatPage />);

    const input = await screen.findByRole('textbox', { name: 'Escribí tu pregunta' });
    await waitFor(() => expect(localStorage.getItem(key)).toBeNull());
    fireEvent.change(input, {
      target: { value: 'Consulta después de datos corruptos' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    expect(await screen.findByText('Respuesta de prueba.')).toBeInTheDocument();
    await waitFor(() => expect(localStorage.getItem(key)).not.toBe('{invalid json'));
  });

  it('keeps chat usable when localStorage is unavailable', async () => {
    let storageAccessAttempted = false;
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => {
        storageAccessAttempted = true;
        throw new Error('Storage unavailable');
      },
    });
    mockAccess('admin', 200, createSseResponse({ sources: [], toolsUsed: [], hasContext: false, searchMethod: 'text' }));
    render(<ChatPage />);

    fireEvent.change(await screen.findByRole('textbox', { name: 'Escribí tu pregunta' }), {
      target: { value: 'Consulta sin almacenamiento' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    expect(await screen.findByText('Respuesta de prueba.')).toBeInTheDocument();
    expect(storageAccessAttempted).toBe(true);
  });

  it('keeps chat usable when localStorage writes exceed quota', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    mockAccess('admin', 200, createSseResponse({ sources: [], toolsUsed: [], hasContext: false, searchMethod: 'text' }));
    render(<ChatPage />);

    fireEvent.change(await screen.findByRole('textbox', { name: 'Escribí tu pregunta' }), {
      target: { value: 'Consulta con cuota agotada' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    expect(await screen.findByText('Respuesta de prueba.')).toBeInTheDocument();
    expect(setItem).toHaveBeenCalled();
  });

  it('does not persist streamed partial output as a completed assistant message', async () => {
    const key = historyKey('user-1');
    const partial = createPartialSseResponse();
    mockAccess('admin', 200, partial.response);
    render(<ChatPage />);
    fireEvent.change(await screen.findByRole('textbox', { name: 'Escribí tu pregunta' }), {
      target: { value: 'Consulta con respuesta interrumpida' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    expect(await screen.findByText('Respuesta parcial.')).toBeInTheDocument();
    await waitFor(() => expect(savedMessages(key).map((message) => message.role)).toEqual(['user']));

    partial.close();

    await waitFor(() => expect(screen.queryByText('Respuesta parcial.')).not.toBeInTheDocument());
    expect(savedMessages(key).map((message) => message.content)).toEqual(['Consulta con respuesta interrumpida']);
  });
});
