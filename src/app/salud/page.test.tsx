import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// ─── Deferred promises for controlling Supabase responses ─────────
// Now handles 2 parallel queries (salud + salud_adolescente)
let resolveSalud: (value: unknown) => void;
let resolveAdolescente: (value: unknown) => void;
let rejectQuery: (reason: unknown) => void;

let queryCount = 0;

function createDeferred() {
  let resolver: (value: unknown) => void;
  let rejecter: (reason: unknown) => void;
  const promise = new Promise((resolve, reject) => {
    resolver = resolve;
    rejecter = reject;
  });
  // Track which query this is (first = salud, second = salud_adolescente)
  if (queryCount === 0) {
    resolveSalud = resolver!;
    rejectQuery = rejecter!;
  } else {
    resolveAdolescente = resolver!;
  }
  queryCount++;
  return promise;
}

const mockSupabaseChain = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockImplementation(() => createDeferred()),
};

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockSupabaseChain),
  },
  CategoriaIndicador: 'salud',
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
  });

  it('should show loading state initially', async () => {
    render(<SaludPage />);
    expect(screen.getByText('Cargando datos...')).toBeInTheDocument();

    // Resolve both deferred promises to clean up
    resolveSalud({ data: [], error: null });
    resolveAdolescente({ data: [], error: null });
    await vi.waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });
  });

  it('should show empty state when no data returned', async () => {
    render(<SaludPage />);

    resolveSalud({ data: [], error: null });
    resolveAdolescente({ data: [], error: null });

    await vi.waitFor(() => {
      expect(screen.getByText('No hay datos de salud disponibles')).toBeInTheDocument();
    });
  });

  it('should show Nacimientos KPI with data when Nacimientos adolescentes exists', async () => {
    render(<SaludPage />);

    // First query: salud (TMI data)
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

    // Second query: salud_adolescente (nacimientos)
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

    await vi.waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });

    // The KPI should show the nacimientos value formatted in es-AR
    expect(screen.getByText('4.450')).toBeInTheDocument();
    expect(screen.getByText('Nacimientos adolescentes')).toBeInTheDocument();
    expect(screen.getByText(/Registrados en 2022/)).toBeInTheDocument();
  });

  it('should show "—" when Nacimientos adolescentes data is not in the DB', async () => {
    render(<SaludPage />);

    // Only salud data, no adolescentes
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

    await vi.waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Nacimientos adolescentes')).toBeInTheDocument();

    const kpiCards = screen.getAllByTestId('kpi-card');
    const nacimientoCard = kpiCards.find(
      card => card.getAttribute('data-title') === 'Nacimientos adolescentes'
    );
    expect(nacimientoCard).toBeDefined();
    expect(nacimientoCard!.getAttribute('data-value')).toBe('—');
    expect(nacimientoCard!.getAttribute('data-subtitle')).toBe('Sin datos disponibles');
  });

  it('should show error state when fetch fails', async () => {
    render(<SaludPage />);

    // Reject both deferred promises to simulate network error
    rejectQuery(new Error('Network error'));
    resolveAdolescente({ data: [], error: null });

    await vi.waitFor(() => {
      expect(screen.getByText(/Error al cargar los datos/)).toBeInTheDocument();
    });
  });

  it('should not show loading/error/empty after successful data load', async () => {
    render(<SaludPage />);

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

    await vi.waitFor(() => {
      expect(screen.queryByText('Cargando datos...')).not.toBeInTheDocument();
    });

    expect(screen.queryByText(/Error al cargar/)).not.toBeInTheDocument();
    expect(screen.queryByText('No hay datos de salud disponibles')).not.toBeInTheDocument();
  });
});
