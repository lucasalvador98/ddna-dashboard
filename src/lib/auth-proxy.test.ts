import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@supabase/ssr', () => ({ createServerClient: vi.fn() }));
vi.mock('@/lib/auth-settings', () => ({ getAuthSettings: vi.fn() }));

import { createServerClient } from '@supabase/ssr';
import { getAuthSettings } from '@/lib/auth-settings';

const getUser = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/observatorio');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://unit.invalid');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'unit-public-placeholder');
  vi.mocked(getAuthSettings).mockResolvedValue({ enabled: true, protected_routes: ['/admin'] });
  getUser.mockResolvedValue({ data: { user: null } });
  vi.mocked(createServerClient).mockReturnValue({ auth: { getUser } } as ReturnType<typeof createServerClient>);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

function adminRequest() {
  return new NextRequest('http://localhost/observatorio/admin?tab=roles', {
    nextConfig: { basePath: '/observatorio' },
  });
}

describe('auth proxy behind /observatorio', () => {
  it('redirects an unauthenticated protected request to the prefixed login', async () => {
    const { authProxy } = await import('./auth-proxy');
    const response = await authProxy(adminRequest());
    const location = new URL(response.headers.get('location')!);
    expect(response.status).toBe(307);
    expect(location.origin).toBe('http://localhost');
    expect(location.pathname).toBe('/observatorio/login');
    expect(location.searchParams.get('redirect')).toBe('/admin?tab=roles');
  });

  it('preserves the current server settings and authenticated access', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'unit-user' } } });
    const { authProxy } = await import('./auth-proxy');
    const response = await authProxy(adminRequest());
    expect(getAuthSettings).toHaveBeenCalledOnce();
    expect(getUser).toHaveBeenCalledOnce();
    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('preserves disabled-auth behavior without contacting the session client', async () => {
    vi.mocked(getAuthSettings).mockResolvedValue({ enabled: false, protected_routes: ['/admin'] });
    const { authProxy } = await import('./auth-proxy');
    const response = await authProxy(adminRequest());
    expect(response.headers.get('x-middleware-next')).toBe('1');
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it('preserves root deployments when no base path is configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '');
    vi.resetModules();
    const { authProxy } = await import('./auth-proxy');
    const response = await authProxy(new NextRequest('http://localhost/admin'));
    expect(new URL(response.headers.get('location')!).pathname).toBe('/login');
  });
});
