import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// ─── Shared mutable state (NOT referenced by vi.mock factory) ────
// This is safe to use in test code, but NOT inside vi.mock() factory
const mockState: { aprenderData: unknown[] } = { aprenderData: [] };

// ─── Shared educacion data (set in beforeEach for chart rendering) ──
let sharedEducacionData: unknown[] = [];

// ─── Supabase mock ───────────────────────────────────────────────
vi.mock('@/lib/supabase', () => {
  // All variables MUST be defined inside the factory (hoisted)
  const sharedState = { aprenderData: [] as unknown[] };

  const fromMock = vi.fn();

  // Track the current categoria from the most recent eq() call
  // This is reliable because Promises are created synchronously in Promise.all
  let currentCategoria = '';

  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn((field: string, value: string) => {
      if (field === 'categoria') currentCategoria = value;
      return chain;
    }) as ReturnType<typeof vi.fn>,
    order: vi.fn(() => {
      if (currentCategoria === 'aprender') {
        return Promise.resolve({
          data: sharedState.aprenderData,
          error: null,
        });
      }
      return Promise.resolve({
        data: sharedEducacionData,
        error: null,
      });
    }),
  };

  fromMock.mockReturnValue(chain);

  // Attach state and chain accessors
  (fromMock as any).__chain = chain;
  (fromMock as any).__setAprenderData = (data: unknown[]) => {
    sharedState.aprenderData = data;
  };
  (fromMock as any).__getAprenderData = () => sharedState.aprenderData;

  return {
    supabase: {
      from: fromMock,
    },
    CategoriaIndicador: 'educacion',
  };
});

// Get reference to the from mock with state setter
const { supabase } = await import('@/lib/supabase');
const fromMock = supabase.from as ReturnType<typeof vi.fn> & {
  __setAprenderData: (data: unknown[]) => void;
  __getAprenderData: () => unknown[];
};

// ─── Mock data builders ──────────────────────────────────────────
function makeAprenderRow(
  level: string,
  valor: number,
  quintil: string,
  sector: string,
  subject: 'Lengua' | 'Matemática',
) {
  return {
    id: `a-${subject}-${level}-${quintil}-${sector}`,
    indicador_nombre: `Nivel ${subject} - ${level}`,
    valor,
    unidad: '%',
    periodo: 2024,
    region: `${quintil}-${sector}`,
    desglose: {},
  };
}

function generateAprenderData() {
  const rows: unknown[] = [];
  const quintils = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'];
  const levels = ['Satisfactorio', 'Básico', 'Por debajo del básico'];
  const sectors = ['Estatal', 'Privado'];

  for (const subject of ['Lengua', 'Matemática'] as const) {
    const baseSat = subject === 'Lengua' ? 40 : 5;
    const baseBas = subject === 'Lengua' ? 30 : 25;
    const baseDeb = subject === 'Lengua' ? 20 : 40;
    for (const q of quintils) {
      for (const sector of sectors) {
        const offset = sector === 'Estatal' ? 5 : -5;
        rows.push(makeAprenderRow('Satisfactorio', baseSat + offset, q, sector, subject));
        rows.push(makeAprenderRow('Básico', baseBas + offset, q, sector, subject));
        rows.push(makeAprenderRow('Por debajo del básico', baseDeb + offset, q, sector, subject));
      }
    }
  }
  return rows;
}

function generateEducacionData() {
  return [
    // Matrícula sector data
    {
      id: 'e1',
      indicador_nombre: 'Matrícula sector estatal - General',
      valor: 500000,
      unidad: '',
      periodo: 2024,
      region: 'Córdoba',
      desglose: {},
    },
    {
      id: 'e2',
      indicador_nombre: 'Matrícula sector privado - General',
      valor: 250000,
      unidad: '',
      periodo: 2024,
      region: 'Córdoba',
      desglose: {},
    },
    // Asistencia educativa data (with edad in desglose)
    {
      id: 'e3',
      indicador_nombre: 'Tasa de asistencia educativa',
      valor: 95,
      unidad: '%',
      periodo: 2022,
      region: 'Córdoba',
      desglose: { edad: 6 },
    },
    {
      id: 'e4',
      indicador_nombre: 'Tasa de asistencia educativa',
      valor: 98,
      unidad: '%',
      periodo: 2022,
      region: 'Córdoba',
      desglose: { edad: 7 },
    },
    {
      id: 'e5',
      indicador_nombre: 'Tasa de asistencia educativa',
      valor: 85,
      unidad: '%',
      periodo: 2022,
      region: 'Córdoba',
      desglose: { edad: 15 },
    },
  ];
}

vi.mock('recharts', () => {
  const createComp = (testId: string) => ({ children }: { children: React.ReactNode }) =>
    <div data-testid={testId}>{children}</div>;
  return {
    ResponsiveContainer: createComp('responsive-container'),
    BarChart: createComp('bar-chart'),
    Bar: () => <div data-testid="bar" />,
    XAxis: createComp('x-axis'),
    YAxis: createComp('y-axis'),
    CartesianGrid: createComp('cartesian-grid'),
    Tooltip: createComp('tooltip'),
    Legend: createComp('legend'),
  };
});

vi.mock('@/components/charts/chart-with-table', () => ({
  ChartWithTable: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="chart-with-table" data-title={title}>{children}</div>
  ),
}));

vi.mock('@/components/section-header', () => ({
  SectionHeader: ({ title }: { title: string }) => (
    <div data-testid="section-header" data-title={title}>{title}</div>
  ),
}));

vi.mock('@/components/kpi-card', () => ({
  KpiCard: ({ title, value }: { title: string; value: string }) => (
    <div data-testid="kpi-card" data-title={title} data-value={value}>
      <div>{title}</div>
      <div>{value}</div>
    </div>
  ),
}));

import EducacionPage from './page';

describe('EducacionPage — Aprender charts', () => {
  beforeEach(() => {
    sharedEducacionData = generateEducacionData();
    fromMock.__setAprenderData(generateAprenderData());
  });

  it('should fetch categoria=aprender from indicadores table', async () => {
    render(<EducacionPage />);

    await waitFor(() => {
      expect(screen.getByTestId('section-header')).toBeInTheDocument();
    });

    // The component should call supabase.from('indicadores').eq('categoria', 'aprender')
    // Access the chain returned by fromMock to check its eq() calls
    const chain = (fromMock as any).__chain;
    const eqCalls = chain.eq.mock.calls as string[][];
    const aprenderEqCall = eqCalls.find(
      (args: string[]) => args[0] === 'categoria' && args[1] === 'aprender',
    );
    expect(aprenderEqCall).toBeDefined();
  });

  it('should render Lengua and Matemática chart components', async () => {
    render(<EducacionPage />);

    await waitFor(() => {
      const charts = screen.getAllByTestId('chart-with-table');
      expect(charts.length).toBeGreaterThanOrEqual(4);
    });

    const charts = screen.getAllByTestId('chart-with-table');
    const chartTitles = charts.map(c => c.getAttribute('data-title'));
    expect(chartTitles).toContain('Resultados Aprender - Lengua por Quintil');
    expect(chartTitles).toContain('Resultados Aprender - Matemática por Quintil');
  });

  it('should render without crashing when no aprender data', async () => {
    fromMock.__setAprenderData([]);
    render(<EducacionPage />);

    await waitFor(() => {
      expect(screen.getByTestId('section-header')).toBeInTheDocument();
    });
  });
});
