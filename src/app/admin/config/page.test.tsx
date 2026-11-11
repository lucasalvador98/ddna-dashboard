import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConfigPage from './page';

const { getAuthConfigMock } = vi.hoisted(() => ({ getAuthConfigMock: vi.fn() }));

vi.mock('@/lib/actions/auth-config', () => ({ getAuthConfig: getAuthConfigMock }));
vi.mock('@/lib/app-path', () => ({ dashboardPath: (path: string) => path }));

describe('admin auth configuration status', () => {
  beforeEach(() => {
    getAuthConfigMock.mockReset();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          status: 'healthy',
          message: 'OK',
          checks: { supabase: 'connected' },
        }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the configuration load failure instead of assuming there are no restrictions', async () => {
    getAuthConfigMock.mockRejectedValueOnce(new Error('configuration unavailable'));
    render(<ConfigPage />);

    expect(await screen.findByText('No se pudo cargar la configuración de autenticación.')).toBeInTheDocument();
    expect(screen.queryByText('🔓 Sin restricciones')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });
});
