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

// Mock supabase for settings query
const mockSupabaseSingle = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: mockSupabaseSingle,
        })),
      })),
    })),
  },
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

function resolveConfig(enabled: boolean) {
  mockSupabaseSingle.mockResolvedValue({
    data: { value: { enabled, protected_routes: ['/admin', '/monitoreo', '/repositorio'] } },
    error: null,
  });
}

function mockFetchPermissions() {
  vi.spyOn(globalThis, 'fetch').mockImplementation((url: string | URL | Request) => {
    const urlStr = typeof url === 'string' ? url : url instanceof URL ? url.href : url.url;
    if (urlStr.includes('/api/auth/users/') && urlStr.includes('/role')) {
      return Promise.resolve(
        new Response(JSON.stringify({ role_name: 'admin' }), { status: 200 }),
      );
    }
    if (urlStr.includes('/api/auth/roles')) {
      return Promise.resolve(
        new Response(
          JSON.stringify([
            {
              id: 1,
              name: 'admin',
              permissions: [
                { id: 1, role_id: 1, route: '/', can_view: true, can_edit: true },
                { id: 2, role_id: 1, route: '/admin', can_view: true, can_edit: true },
              ],
            },
          ]),
          { status: 200 },
        ),
      );
    }
    return Promise.resolve(new Response(JSON.stringify({}), { status: 404 }));
  });
}

function mockFetchNoPermissions() {
  vi.spyOn(globalThis, 'fetch').mockImplementation((url: string | URL | Request) => {
    const urlStr = typeof url === 'string' ? url : url instanceof URL ? url.href : url.url;
    if (urlStr.includes('/api/auth/users/') && urlStr.includes('/role')) {
      return Promise.resolve(
        new Response(JSON.stringify({ role_name: 'editor' }), { status: 200 }),
      );
    }
    if (urlStr.includes('/api/auth/roles')) {
      return Promise.resolve(
        new Response(
          JSON.stringify([
            {
              id: 2,
              name: 'editor',
              permissions: [
                { id: 3, role_id: 2, route: '/salud', can_view: true, can_edit: false },
              ],
            },
          ]),
          { status: 200 },
        ),
      );
    }
    return Promise.resolve(new Response(JSON.stringify({}), { status: 404 }));
  });
}

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
    mockFetchPermissions();

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
    mockFetchNoPermissions();

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
