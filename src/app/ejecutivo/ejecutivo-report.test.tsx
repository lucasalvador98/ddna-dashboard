import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EjecutivoReport from './ejecutivo-report';

const { useAuthMock } = vi.hoisted(() => ({ useAuthMock: vi.fn() }));

vi.mock('@/components/auth-provider', () => ({ useAuth: useAuthMock }));

function mockRole(roleName: string) {
  useAuthMock.mockReturnValue({
    user: { id: 'user-1', user_metadata: { role: 'admin' } },
    loading: false,
  });
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/api/auth/config')) {
      return new Response(JSON.stringify({ enabled: true, protected_routes: ['/ejecutivo'] }));
    }
    if (url.includes('/api/auth/me/permissions')) {
      return new Response(JSON.stringify({
        user_id: 'user-1',
        role: { id: roleName === 'admin' ? 1 : 2, name: roleName },
        effective: {},
      }));
    }
    return new Response('{}', { status: 500 });
  }));
}

describe('executive report access', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it('keeps the report form available to administrators', async () => {
    mockRole('admin');
    render(<EjecutivoReport />);

    expect(await screen.findByRole('button', { name: /generar informe/i })).toBeInTheDocument();
  });

  it('does not show report controls to a non-admin before form entry', async () => {
    mockRole('agente');
    render(<EjecutivoReport />);

    expect(await screen.findByText('Solo las personas con rol de administrador pueden utilizar la generación de informes ejecutivos.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /generar informe/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /presentación ia/i })).not.toBeInTheDocument();
  });
});
