import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// ─── Deferred promises for controlling Supabase responses ─────────
// Las consultas ya no se distinguen por ORDEN: la página tiene 3 fetches
// (salud filtrada con .in(), adolescencia, y natalidad/fecundidad también con
// .in()). Se identifican por su `categoria` y por ser la primera de 'salud'
// con .in(); las auxiliares se resuelven vacías para no ensuciar los tests.
let resolveSalud: (value: unknown) => void;
let resolveAdolescente: (value: unknown) => void;
let rejectQuery: (reason: unknown) => void;

let queryCount = 0;
let saludPrincipalUsada = false;

type Defer = { resolve: (v: unknown) => void; reject: (r: unknown) => void };

function deferredPara(categoria: string, conIn: boolean): Promise<unknown> {
  return new Promise((resolve: (v: unknown) => void, reject: (r: unknown) => void) => {
    if (categoria === 'salud_adolescente') {
      resolveAdolescente = resolve;
      rejectQuery = reject;
    } else if (conIn && saludPrincipalUsada) {
      // segunda consulta de 'salud' con .in (natalidad y fecundidad): vacía
      resolve({ data: [], error: null });
      return;
    } else {
      saludPrincipalUsada = true;
      resolveSalud = resolve;
      rejectQuery = reject;
    }
  });
}

function createMockSupabaseChain() {
  let categoria = 'salud';
  let conIn = false;
  queryCount++;
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockImplementation(function (this: unknown, col: string, val: string) {
      if (col === 'categoria') categoria = String(val);
      return this;
    }),
    order: vi.fn().mockReturnThis(),
    in: vi.fn().mockImplementation(function (this: unknown) {
      conIn = true;
      return this;
    }),
    range: vi.fn().mockImplementation((offset: number) =>
      offset > 0 ? Promise.resolve({ data: [], error: null }) : deferredPara(categoria, conIn)
    ),
  };
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: vi.fn(() => createMockSupabaseChain()) })),
}));

// Mock recharts
vi.mock('recharts', () => {
  const MockResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  );
  const MockLineChart = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  );
  const MockBarChart = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  );
  const MockLine = () => <div data-testid="line" />;
  const MockBar = () => <div data-testid="bar" />;
  const MockXAxis = () => <div data-testid="x-axis" />;
  const MockYAxis = () => <div data-testid="y-axis" />;
  const MockCartesianGrid = () => <div data-testid="cartesian-grid" />;
  const MockTooltip = () => <div data-testid="tooltip" />;
  const MockLegend = () => <div data-testid="legend" />;
  return {
    ResponsiveContainer: MockResponsiveContainer,
    LineChart: MockLineChart,
    BarChart: MockBarChart,
    Line: MockLine,
    Bar: MockBar,
    XAxis: MockXAxis,
    YAxis: MockYAxis,
    CartesianGrid: MockCartesianGrid,
    Tooltip: MockTooltip,
    Legend: MockLegend,
  };
});

// Mock chart-with-table
vi.mock('@/components/charts/chart-with-table', () => ({
  ChartWithTable: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="chart-with-table" data-title={title}>
      {children}
    </div>
  ),
  SimpleLineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="simple-line-chart">{children}</div>
  ),
  SimpleBarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="simple-bar-chart">{children}</div>
  ),
}));

// Mock section-header
vi.mock('@/components/section-header', () => ({
  SectionHeader: ({ title }: { title: string }) => (
    <div data-testid="section-header" data-title={title}>
      {title}
    </div>
  ),
}));

// Mock kpi-card
vi.mock('@/components/kpi-card', () => ({
  KpiCard: ({ title, value, subtitle }: { title: string; value: string; subtitle: string }) => (
    <div data-testid="kpi-card" data-title={title} data-value={value} data-subtitle={subtitle}>
      <div>{title}</div>
      <div>{value}</div>
      <div>{subtitle}</div>
    </div>
  ),
}));

import SaludPage from './page';

describe('SaludPage — Nacimientos KPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryCount = 0;
    saludPrincipalUsada = false;
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-key');
  });

  afterEach(() => vi.unstubAllEnvs());

  it('should show empty state when no data returned', async () => {
    const pagePromise = SaludPage();

    resolveSalud({ data: [], error: null });
    resolveAdolescente({ data: [], error: null });

    const page = await pagePromise;
    render(page);

    expect(screen.getByText('No hay datos de salud disponibles')).toBeInTheDocument();
  });

  it('should show Nacimientos KPI with data when Nacimientos adolescentes exists', async () => {
    const pagePromise = SaludPage();

    resolveSalud({
      data: [
        {
          id: 't1',
          indicador_nombre: 'Mortalidad infantil (TMI Cba)',
          valor: 8.5,
          unidad: '‰',
          periodo: '2022',
          region: 'Córdoba',
          desglose: {},
        },
      ],
      error: null,
    });
    resolveAdolescente({
      data: [
        {
          id: 'n1',
          indicador_nombre: 'Nacimientos adolescentes',
          valor: 4450,
          unidad: 'unidad',
          periodo: '2022',
          region: 'Córdoba',
          desglose: {},
        },
      ],
      error: null,
    });

    const page = await pagePromise;
    render(page);

    expect(screen.getByText('4.450')).toBeInTheDocument();
    expect(screen.getByText('Nacimientos adolescentes')).toBeInTheDocument();
    expect(screen.getByText(/Registrados en 2022/)).toBeInTheDocument();
  });

  it('should show "—" when Nacimientos adolescentes data is not in the DB', async () => {
    const pagePromise = SaludPage();

    resolveSalud({
      data: [
        {
          id: 't1',
          indicador_nombre: 'Mortalidad infantil (TMI Cba)',
          valor: 8.5,
          unidad: '‰',
          periodo: '2022',
          region: 'Córdoba',
          desglose: {},
        },
      ],
      error: null,
    });
    resolveAdolescente({ data: [], error: null });

    const page = await pagePromise;
    render(page);

    const kpiCards = screen.getAllByTestId('kpi-card');
    const nacimientoCard = kpiCards.find(
      card => card.getAttribute('data-title') === 'Nacimientos adolescentes'
    );
    expect(nacimientoCard).toBeDefined();
    expect(nacimientoCard!.getAttribute('data-value')).toBe('—');
    expect(nacimientoCard!.getAttribute('data-subtitle')).toBe('Sin datos disponibles');
  });

  it('should throw error when fetch fails', async () => {
    const pagePromise = SaludPage();

    rejectQuery(new Error('Network error'));
    resolveAdolescente({ data: [], error: null });

    await expect(pagePromise).rejects.toThrow('Network error');
  });

  it('should not show error/empty after successful data load', async () => {
    const pagePromise = SaludPage();

    resolveSalud({
      data: [
        {
          id: 'n1',
          indicador_nombre: 'Nacimientos adolescentes',
          valor: 3500,
          unidad: 'unidad',
          periodo: '2023',
          region: 'Córdoba',
          desglose: {},
        },
      ],
      error: null,
    });
    resolveAdolescente({ data: [], error: null });

    const page = await pagePromise;
    render(page);

    expect(screen.queryByText(/Error al cargar/)).not.toBeInTheDocument();
    expect(screen.queryByText('No hay datos de salud disponibles')).not.toBeInTheDocument();
  });
});
