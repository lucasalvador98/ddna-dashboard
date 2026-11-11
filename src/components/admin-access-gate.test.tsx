import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminOnlyGate } from './admin-access-gate';

const { useAuthMock } = vi.hoisted(() => ({ useAuthMock: vi.fn() }));

vi.mock('@/components/auth-provider', () => ({ useAuth: useAuthMock }));

const feature = 'el contenido protegido';

function mockAccess(options: {
  roleName?: string | null;
  configStatus?: number;
  permissionsStatus?: number;
  permissionsPayload?: unknown;
} = {}) {
  useAuthMock.mockReturnValue({
    user: {
      id: 'user-1',
      user_metadata: { role: 'admin' },
    },
    loading: false,
  });

  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/api/auth/config')) {
      return new Response(JSON.stringify({ enabled: false, protected_routes: [] }), {
        status: options.configStatus ?? 200,
      });
    }
    if (url.includes('/api/auth/me/permissions')) {
      const role = options.roleName === null
        ? null
        : { id: 1, name: options.roleName ?? 'admin' };
      const payload = options.permissionsPayload ?? {
        user_id: 'user-1',
        role,
        effective: {},
      };
      return new Response(JSON.stringify(payload), { status: options.permissionsStatus ?? 200 });
    }
    return new Response('{}', { status: 404 });
  }));
}

describe('AdminOnlyGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('allows an administrator identified by the self-permissions endpoint', async () => {
    mockAccess({ roleName: 'admin' });
    render(<AdminOnlyGate feature={feature}><div>Contenido protegido</div></AdminOnlyGate>);

    expect(await screen.findByText('Contenido protegido')).toBeInTheDocument();
  });

  it('denies a non-admin even when user-editable metadata claims admin', async () => {
    mockAccess({ roleName: 'agente' });
    render(<AdminOnlyGate feature={feature}><div>Contenido protegido</div></AdminOnlyGate>);

    expect(await screen.findByText(`Solo las personas con rol de administrador pueden utilizar ${feature}.`)).toBeInTheDocument();
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it.each([
    ['auth configuration', { configStatus: 500 }],
    ['permissions', { permissionsStatus: 500 }],
  ] as const)('fails closed when the %s request fails', async (_name, options) => {
    mockAccess(options);
    render(<AdminOnlyGate feature={feature}><div>Contenido protegido</div></AdminOnlyGate>);

    expect(await screen.findByText('No se pudieron verificar los permisos. Esta función está temporalmente deshabilitada.')).toBeInTheDocument();
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('fails closed when the permissions payload has an invalid shape', async () => {
    mockAccess({ permissionsPayload: {
      user_id: 'user-1',
      role: { id: 1, name: 'admin' },
      effective: [],
    } });
    render(<AdminOnlyGate feature={feature}><div>Contenido protegido</div></AdminOnlyGate>);

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron verificar los permisos.');
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('fails closed when permissions belong to a different user', async () => {
    mockAccess({ permissionsPayload: {
      user_id: 'another-user',
      role: { id: 1, name: 'admin' },
      effective: {},
    } });
    render(<AdminOnlyGate feature={feature}><div>Contenido protegido</div></AdminOnlyGate>);

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron verificar los permisos.');
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });
});
