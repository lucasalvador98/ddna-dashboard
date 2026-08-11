import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppShell } from './app-shell';

let pathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}));

// The /f/ branch never renders Header/Sidebar, but importing AppShell pulls in
// the auth-provider chain, so stub the supabase module to avoid env lookup.
vi.mock('@/lib/supabase', () => ({
  getBrowserClient: () => ({}),
  supabase: {},
}));

describe('AppShell', () => {
  beforeEach(() => {
    pathname = '/';
  });

  it('renders children raw without dashboard chrome for public /f/ routes', () => {
    pathname = '/f/encuesta-2026';

    render(
      <AppShell>
        <h1>Formulario público</h1>
      </AppShell>,
    );

    expect(screen.getByText('Formulario público')).toBeInTheDocument();
    // No skip-link (dashboard-only) and no main content wrapper on public pages.
    expect(screen.queryByText('Saltar al contenido principal')).not.toBeInTheDocument();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });
});
