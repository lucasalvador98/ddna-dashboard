import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

describe('dashboard URLs behind the shared-domain proxy', () => {
  it('keeps API, login and raw anchor destinations inside the observatory', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/observatorio');
    vi.resetModules();
    const { dashboardPath } = await import('./app-path');
    expect(dashboardPath('/api/health')).toBe('/observatorio/api/health');
    expect(new URL(dashboardPath('/login'), 'https://ddna.com.ar/observatorio/salud').pathname).toBe('/observatorio/login');
    expect(dashboardPath('/repositorio')).toBe('/observatorio/repositorio');
  });
  it('preserves the root deployment when no prefix is configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '');
    vi.resetModules();
    const { dashboardPath } = await import('./app-path');
    expect(dashboardPath('/api/health')).toBe('/api/health');
  });
});
