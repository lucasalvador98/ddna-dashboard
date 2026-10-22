import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';
import { SidebarProvider } from './sidebar-context';

// next/navigation is mocked globally in src/test/setup.ts (pathname "/").

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockFetch(options: {
  enabled: boolean;
  permissions?: unknown;
  permissionsStatus?: number;
}) {
  vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
    const url =
      typeof input === 'string' ? input : input instanceof URL ? input.href : String(input);

    if (url.includes('/api/auth/config')) {
      return Promise.resolve(
        jsonResponse({ enabled: options.enabled, protected_routes: ['/admin', '/monitoreo'] }),
      );
    }

    if (url.includes('/api/auth/me/permissions')) {
      return Promise.resolve(
        jsonResponse(options.permissions ?? {}, options.permissionsStatus ?? 200),
      );
    }

    return Promise.resolve(jsonResponse({}, 404));
  });
}

const VISOR_MATRIX = {
  user_id: 'visor-1',
  role: { id: 3, name: 'visor' },
  base_permissions: [{ route: '/salud', can_view: true, can_edit: false }],
  extras: [],
  effective: { '/salud': { can_view: true, can_edit: false } },
};

const ADMIN_MATRIX = {
  user_id: 'admin-1',
  role: { id: 1, name: 'admin' },
  base_permissions: [],
  extras: [],
  // Deliberately without /admin: the admin role keeps the panel link anyway.
  effective: {},
};

function renderSidebar() {
  return render(
    <SidebarProvider>
      <Sidebar badges={null} />
    </SidebarProvider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Sidebar permission filtering', () => {
  it('hides the screens the matrix does not grant', async () => {
    mockFetch({ enabled: true, permissions: VISOR_MATRIX });

    renderSidebar();

    // Visible: granted route (its group collapses to a single link) + home
    expect(await screen.findByText('Indicadores')).toBeInTheDocument();
    expect(screen.getByText('Tablero General')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Monitoreo de Medios')).not.toBeInTheDocument();
    });
    expect(screen.queryByText('Educación')).not.toBeInTheDocument();
    expect(screen.queryByText('Configuración')).not.toBeInTheDocument();
    expect(screen.queryByText('Formularios')).not.toBeInTheDocument();
  });

  it('keeps the admin panel link for the admin role even without a matrix row', async () => {
    mockFetch({ enabled: true, permissions: ADMIN_MATRIX });

    renderSidebar();

    expect(await screen.findByText('Configuración')).toBeInTheDocument();
  });

  it('does not filter when auth is disabled (public mode)', async () => {
    mockFetch({ enabled: false });

    renderSidebar();

    await screen.findByText('Tablero General');
    expect(screen.getByText('Configuración')).toBeInTheDocument();
    expect(screen.getByText('Monitoreo de Medios')).toBeInTheDocument();
    expect(screen.getByText('Educación')).toBeInTheDocument();
  });

  it('does not filter when the self endpoint has no session (401)', async () => {
    mockFetch({ enabled: true, permissions: { error: 'No autenticado' }, permissionsStatus: 401 });

    renderSidebar();

    await screen.findByText('Tablero General');
    expect(screen.getByText('Configuración')).toBeInTheDocument();
    expect(screen.getByText('Monitoreo de Medios')).toBeInTheDocument();
  });
});

describe('MobileNav permission filtering', () => {
  it('applies the same filter as the desktop sidebar', async () => {
    mockFetch({ enabled: true, permissions: VISOR_MATRIX });

    render(
      <SidebarProvider>
        <MobileNav isOpen={false} onClose={() => {}} />
      </SidebarProvider>,
    );

    await screen.findByText('Tablero General');
    await waitFor(() => {
      expect(screen.queryByText('Monitoreo de Medios')).not.toBeInTheDocument();
    });
    expect(screen.queryByText('Configuración')).not.toBeInTheDocument();
    expect(screen.queryByText('Educación')).not.toBeInTheDocument();
  });

  it('shows everything in public mode', async () => {
    mockFetch({ enabled: false });

    render(
      <SidebarProvider>
        <MobileNav isOpen={false} onClose={() => {}} />
      </SidebarProvider>,
    );

    await screen.findByText('Tablero General');
    expect(screen.getByText('Monitoreo de Medios')).toBeInTheDocument();
    expect(screen.getByText('Configuración')).toBeInTheDocument();
  });
});
