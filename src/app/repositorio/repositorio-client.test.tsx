import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import RepositorioClient from './repositorio-client';

const { useAuthMock } = vi.hoisted(() => ({ useAuthMock: vi.fn() }));

vi.mock('@/components/auth-provider', () => ({ useAuth: useAuthMock }));
vi.mock('@/components/login-gate', () => ({
  LoginGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/lib/supabase', () => ({ supabase: {} }));

const file = {
  id: 'file-1',
  nombre_archivo: 'informe.pdf',
  descripcion: 'Descripción existente',
  categoria: 'informes',
  tipo_documento: 'pdf',
  tamano_bytes: 1024,
  url_storage: 'https://example.test/informe.pdf',
  fecha_subida: '2026-11-11T00:00:00.000Z',
  notas: 'Nota existente',
  processed: false,
  total_chunks: 0,
};

function mockAccess(roleName: string | null, permissionsStatus = 200) {
  useAuthMock.mockReturnValue({
    user: { id: 'user-1', user_metadata: { role: 'admin' } },
    loading: false,
  });
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/api/auth/config')) {
      return new Response(JSON.stringify({ enabled: true, protected_routes: ['/repositorio'] }));
    }
    if (url.includes('/api/auth/me/permissions')) {
      return new Response(JSON.stringify({
        user_id: 'user-1',
        role: roleName ? { id: roleName === 'admin' ? 1 : 2, name: roleName } : null,
        effective: {},
      }), { status: permissionsStatus });
    }
    return new Response('{}', { status: 500 });
  }));
}

describe('repository mutation controls', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('keeps upload, processing, metadata, and delete actions for administrators', async () => {
    mockAccess('admin');
    render(<RepositorioClient initialFiles={[file]} />);

    expect(await screen.findByRole('heading', { name: 'Subir nuevo archivo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Procesar pendientes' })).toBeInTheDocument();
    fireEvent.click(screen.getByText(file.nombre_archivo));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Procesar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
  });

  it('keeps document browsing read-only for viewers', async () => {
    mockAccess('agente');
    render(<RepositorioClient initialFiles={[file]} />);

    expect(await screen.findByText(/Solo las personas administradoras pueden subir, procesar, editar o eliminar archivos/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Subir nuevo archivo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Procesar pendientes' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(file.nombre_archivo));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    const drawer = screen.getByRole('dialog');
    const openWindow = vi.spyOn(window, 'open').mockImplementation(() => null);
    fireEvent.click(within(drawer).getByRole('button', { name: 'Descargar' }));

    expect(openWindow).toHaveBeenCalledWith(file.url_storage, '_blank');
    expect(screen.getByText('Descripción existente')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Procesar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
  });

  it('keeps management controls hidden while permissions are pending, then resolves for an admin', async () => {
    useAuthMock.mockReturnValue({
      user: { id: 'user-1', user_metadata: { role: 'admin' } },
      loading: false,
    });
    let resolvePermissions!: (response: Response) => void;
    const permissionsResponse = new Promise<Response>((resolve) => {
      resolvePermissions = resolve;
    });
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/auth/config')) {
        return Promise.resolve(new Response(JSON.stringify({ enabled: true, protected_routes: ['/repositorio'] })));
      }
      if (url.includes('/api/auth/me/permissions')) return permissionsResponse;
      return Promise.resolve(new Response('{}', { status: 500 }));
    }));
    render(<RepositorioClient initialFiles={[file]} />);

    expect(await screen.findByText(/Verificando permisos de administración/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Subir nuevo archivo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Procesar pendientes' })).not.toBeInTheDocument();

    resolvePermissions(new Response(JSON.stringify({
      user_id: 'user-1',
      role: { id: 1, name: 'admin' },
      effective: {},
    })));

    expect(await screen.findByRole('heading', { name: 'Subir nuevo archivo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Procesar pendientes' })).toBeInTheDocument();
  });

  it('hides every mutation control when permission verification fails', async () => {
    mockAccess('admin', 500);
    render(<RepositorioClient initialFiles={[file]} />);

    expect(await screen.findByText(/No se pudieron verificar los permisos/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Subir nuevo archivo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Procesar pendientes' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(file.nombre_archivo));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Descargar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Procesar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
  });
});
