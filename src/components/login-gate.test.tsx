import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LoginGate } from './login-gate';

// ── Mocks ─────────────────────────────────────────────────────────

// Mock auth-provider so we control useAuth per test
vi.mock('@/components/auth-provider', () => ({
  useAuth: vi.fn(),
}));

// Re-mock next/navigation so usePathname is controllable
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() })),
  usePathname: vi.fn(() => '/'),
}));

import { useAuth } from '@/components/auth-provider';
import { usePathname } from 'next/navigation';

// Default mock return values
function mockAuthenticatedUser() {
  vi.mocked(useAuth).mockReturnValue({
    user: { id: 'user-1', email: 'test@ddna.org', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2024-01-01', identities: [] },
    loading: false,
    session: null,
    signOut: vi.fn(),
  });
}

function mockUnauthenticated() {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    loading: false,
    session: null,
    signOut: vi.fn(),
  });
}

function mockLoading() {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    loading: true,
    session: null,
    signOut: vi.fn(),
  });
}

// Mock the config endpoint fetch — LoginGate reads auth config via
// /api/auth/config, never directly from the settings table.
function resolveConfig(enabled: boolean) {
  vi.spyOn(globalThis, 'fetch').mockImplementation((url: string | URL | Request) => {
    const urlStr = typeof url === 'string' ? url : url instanceof URL ? url.href : url.url;
    if (urlStr.includes('/api/auth/config')) {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            enabled,
            protected_routes: ['/admin', '/monitoreo', '/repositorio'],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );
    }
    return Promise.resolve(new Response(JSON.stringify({}), { status: 404 }));
  });
}

function mockPermissions(payload: unknown, status = 200) {
  vi.spyOn(globalThis, 'fetch').mockImplementation((url: string | URL | Request) => {
    const urlStr = typeof url === 'string' ? url : url instanceof URL ? url.href : url.url;
    if (urlStr.includes('/api/auth/me/permissions')) {
      return Promise.resolve(
        new Response(JSON.stringify(payload), {
          status,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }
    return Promise.resolve(new Response(JSON.stringify({}), { status: 404 }));
  });
}

// The gate resolves the caller's matrix from /api/auth/me/permissions (any
// authenticated user). /api/auth/roles is admin-only and can never be the
// source for a non-admin session.
const ADMIN_MATRIX = {
  user_id: 'user-1',
  role: { id: 1, name: 'admin' },
  base_permissions: [
    { route: '/monitoreo', can_view: true, can_edit: true },
    { route: '/admin', can_view: true, can_edit: true },
  ],
  extras: [],
  effective: {
    '/monitoreo': { can_view: true, can_edit: true },
    '/admin': { can_view: true, can_edit: true },
  },
};

const NO_ACCESS_MATRIX = {
  user_id: 'user-1',
  role: { id: 2, name: 'agente' },
  base_permissions: [{ route: '/salud', can_view: true, can_edit: false }],
  extras: [],
  effective: { '/salud': { can_view: true, can_edit: false } },
};

describe('LoginGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: pathname = '/'
    vi.mocked(usePathname).mockReturnValue('/');
  });

  it('shows loading spinner while auth is loading', () => {
    mockLoading();
    resolveConfig(true);

    const { container } = render(
      <LoginGate>
        <div>Protected</div>
      </LoginGate>,
    );

    const spinner = container.querySelector('.lucide-loader-circle');
    expect(spinner).toBeInTheDocument();
  });

  it('renders children when auth is disabled', async () => {
    mockUnauthenticated();
    resolveConfig(false);

    render(
      <LoginGate>
        <div data-testid="content">Public Content</div>
      </LoginGate>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  it('shows restricted access when auth enabled and no user', async () => {
    mockUnauthenticated();
    resolveConfig(true);

    render(
      <LoginGate>
        <div>Protected</div>
      </LoginGate>,
    );

    await waitFor(() => {
      expect(screen.getByText('Acceso restringido')).toBeInTheDocument();
    });

    const link = screen.getByRole('link', { name: /iniciar sesión/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/login?redirect=%2F');
  });

  it('redirect link preserves current pathname', async () => {
    mockUnauthenticated();
    resolveConfig(true);
    vi.mocked(usePathname).mockReturnValue('/monitoreo');

    render(
      <LoginGate>
        <div>Protected</div>
      </LoginGate>,
    );

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /iniciar sesión/i });
      expect(link).toHaveAttribute('href', '/login?redirect=%2Fmonitoreo');
    });
  });

  it('renders children when authenticated and has permission', async () => {
    mockAuthenticatedUser();
    resolveConfig(true);
    mockPermissions(ADMIN_MATRIX);
    vi.mocked(usePathname).mockReturnValue('/monitoreo');

    render(
      <LoginGate>
        <div data-testid="content">Admin Content</div>
      </LoginGate>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  it('shows denied screen when authenticated but lacks permission', async () => {
    mockAuthenticatedUser();
    resolveConfig(true);
    mockPermissions(NO_ACCESS_MATRIX);
    vi.mocked(usePathname).mockReturnValue('/monitoreo');

    render(
      <LoginGate>
        <div>Forbidden Content</div>
      </LoginGate>,
    );

    await waitFor(() => {
      expect(screen.getByText('Sin acceso')).toBeInTheDocument();
    });
  });

  it('keeps /admin reserved for the admin role', async () => {
    mockAuthenticatedUser();
    resolveConfig(true);
    mockPermissions({
      ...NO_ACCESS_MATRIX,
      base_permissions: [{ route: '/admin', can_view: true, can_edit: true }],
      effective: { '/admin': { can_view: true, can_edit: true } },
    });
    vi.mocked(usePathname).mockReturnValue('/admin');

    render(
      <LoginGate>
        <div>Panel</div>
      </LoginGate>,
    );

    await waitFor(() => {
      expect(screen.getByText('Sin acceso')).toBeInTheDocument();
    });
  });

  it('shows denied screen when the self endpoint fails', async () => {
    mockAuthenticatedUser();
    resolveConfig(true);
    mockPermissions({ error: 'boom' }, 500);
    vi.mocked(usePathname).mockReturnValue('/monitoreo');

    render(
      <LoginGate>
        <div>Forbidden Content</div>
      </LoginGate>,
    );

    await waitFor(() => {
      expect(screen.getByText('Sin acceso')).toBeInTheDocument();
    });
  });
});
