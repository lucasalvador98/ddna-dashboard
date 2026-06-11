import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

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
  // Matrícula general — 3 departments so getDeptoTop works
  function matRow(nombre: string, region: string, valor: number) {
    return { id: `e-${nombre}-${region}`, indicador_nombre: nombre, valor, unidad: '', periodo: 2024, region, desglose: {} };
  }
  const rows: unknown[] = [
    // Matrícula - General
    matRow('Matrícula - General', 'Capital', 136544),
    matRow('Matrícula - General', 'Colón', 28291),
    matRow('Matrícula - General', 'Río Cuarto', 25965),
    // Matrícula sector estatal
    matRow('Matrícula sector estatal - General', 'Capital', 86906),
    matRow('Matrícula sector estatal - General', 'Colón', 15000),
    // Matrícula sector privado
    matRow('Matrícula sector privado - General', 'Capital', 49638),
    matRow('Matrícula sector privado - General', 'Colón', 5000),
    // Personal docente
    matRow('Personal docente - General', 'Capital', 11475),
    matRow('Personal docente - General', 'Colón', 2149),
    matRow('Personal docente - General', 'Río Cuarto', 1557),
    // Unidades educativas
    matRow('Unidades educativas - General', 'Capital', 135),
    matRow('Unidades educativas - General', 'Colón', 100),
    matRow('Unidades educativas - General', 'Río Cuarto', 28),
    // Asistencia educativa (with edad in desglose)
    {
      id: 'e-asist-6', indicador_nombre: 'Tasa de asistencia educativa', valor: 98.52,
      unidad: '%', periodo: 2022, region: 'Córdoba', desglose: { edad: 6 },
    },
    {
      id: 'e-asist-7', indicador_nombre: 'Tasa de asistencia educativa', valor: 98.32,
      unidad: '%', periodo: 2022, region: 'Córdoba', desglose: { edad: 7 },
    },
    {
      id: 'e-asist-15', indicador_nombre: 'Tasa de asistencia educativa', valor: 94.03,
      unidad: '%', periodo: 2022, region: 'Córdoba', desglose: { edad: 15 },
    },
    {
      id: 'e-asist-16', indicador_nombre: 'Tasa de asistencia educativa', valor: 91.51,
      unidad: '%', periodo: 2022, region: 'Córdoba', desglose: { edad: 16 },
    },
    {
      id: 'e-asist-17', indicador_nombre: 'Tasa de asistencia educativa', valor: 85.98,
      unidad: '%', periodo: 2022, region: 'Córdoba', desglose: { edad: 17 },
    },
    // Escolarización por edad
    {
      id: 'e-escolar-9-asiste', indicador_nombre: 'Escolarización por edad', valor: 55500,
      unidad: 'hab', periodo: 2022, region: 'Córdoba',
      desglose: { edad: 9, metrica: 'asiste', descripcion: 'Población que asiste' },
    },
    {
      id: 'e-escolar-9-nunca', indicador_nombre: 'Escolarización por edad', valor: 281,
      unidad: 'hab', periodo: 2022, region: 'Córdoba',
      desglose: { edad: 9, metrica: 'nunca_asistio', descripcion: 'Nunca asistió' },
    },
    {
      id: 'e-escolar-15-asiste', indicador_nombre: 'Escolarización por edad', valor: 52578,
      unidad: 'hab', periodo: 2022, region: 'Córdoba',
      desglose: { edad: 15, metrica: 'asiste', descripcion: 'Población que asiste' },
    },
    {
      id: 'e-escolar-15-nunca', indicador_nombre: 'Escolarización por edad', valor: 206,
      unidad: 'hab', periodo: 2022, region: 'Córdoba',
      desglose: { edad: 15, metrica: 'nunca_asistio', descripcion: 'Nunca asistió' },
    },
    // Población por nivel educativo alcanzado
    {
      id: 'e-nivel-prim-incomp', indicador_nombre: 'Población por nivel educativo alcanzado', valor: 500,
      unidad: 'hab', periodo: 2022, region: 'Córdoba',
      desglose: { nivel_educativo: 'Primario Incompleto', edad: 10 },
    },
    {
      id: 'e-nivel-prim-comp', indicador_nombre: 'Población por nivel educativo alcanzado', valor: 400,
      unidad: 'hab', periodo: 2022, region: 'Córdoba',
      desglose: { nivel_educativo: 'Primario Completo', edad: 12 },
    },
    {
      id: 'e-nivel-sec-incomp', indicador_nombre: 'Población por nivel educativo alcanzado', valor: 300,
      unidad: 'hab', periodo: 2022, region: 'Córdoba',
      desglose: { nivel_educativo: 'Secundario Incompleto', edad: 14 },
    },
    {
      id: 'e-nivel-sec-comp', indicador_nombre: 'Población por nivel educativo alcanzado', valor: 200,
      unidad: 'hab', periodo: 2022, region: 'Córdoba',
      desglose: { nivel_educativo: 'Secundario Completo', edad: 18 },
    },
    {
      id: 'e-nivel-uni-incomp', indicador_nombre: 'Población por nivel educativo alcanzado', valor: 100,
      unidad: 'hab', periodo: 2022, region: 'Córdoba',
      desglose: { nivel_educativo: 'Universitario Incompleto', edad: 20 },
    },
    {
      id: 'e-nivel-uni-comp', indicador_nombre: 'Población por nivel educativo alcanzado', valor: 80,
      unidad: 'hab', periodo: 2022, region: 'Córdoba',
      desglose: { nivel_educativo: 'Universitario Completo', edad: 25 },
    },
  ];
  return rows;
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

describe('EducacionPage — full rewrite', () => {
  beforeEach(() => {
    sharedEducacionData = generateEducacionData();
    fromMock.__setAprenderData(generateAprenderData());
  });

  it('should fetch categoria=aprender from indicadores table', async () => {
    render(<EducacionPage />);

    await waitFor(() => {
      expect(screen.getByTestId('section-header')).toBeInTheDocument();
    });

    const chain = (fromMock as any).__chain;
    const eqCalls = chain.eq.mock.calls as string[][];
    const aprenderEqCall = eqCalls.find(
      (args: string[]) => args[0] === 'categoria' && args[1] === 'aprender',
    );
    expect(aprenderEqCall).toBeDefined();
  });

  it('should render all chart components including new indicators', async () => {
    render(<EducacionPage />);

    await waitFor(() => {
      const charts = screen.getAllByTestId('chart-with-table');
      // 6 education charts + 1 Aprender tab (active = lengua) = 7
      expect(charts.length).toBe(7);
    });

    const charts = screen.getAllByTestId('chart-with-table');
    const chartTitles = charts.map(c => c.getAttribute('data-title'));
    expect(chartTitles).toContain('Matrícula por Departamento');
    expect(chartTitles).toContain('Personal Docente por Departamento');
    expect(chartTitles).toContain('Unidades Educativas por Departamento');
    expect(chartTitles).toContain('Tasa de Asistencia Educativa por Edad');
    expect(chartTitles).toContain('Escolarización por Edad');
    expect(chartTitles).toContain('Población por Nivel Educativo Alcanzado');
    // Single Aprender chart with tab switching
    expect(chartTitles).toContain('Resultados Aprender - Lengua por Quintil');
    expect(chartTitles).not.toContain('Resultados Aprender - Matemática por Quintil');
  });

  it('should show 4 KPI cards', async () => {
    render(<EducacionPage />);

    await waitFor(() => {
      const kpis = screen.getAllByTestId('kpi-card');
      expect(kpis).toHaveLength(4);
    });

    const kpis = screen.getAllByTestId('kpi-card');
    const kpiTitles = kpis.map(k => k.getAttribute('data-title'));
    expect(kpiTitles).toContain('Matrícula Total');
    expect(kpiTitles).toContain('Sector Público');
    expect(kpiTitles).toContain('Escolarización Secundaria');
    expect(kpiTitles).toContain('Personal Docente');
  });

  it('should have tabs and sector toggle for Aprender charts', async () => {
    render(<EducacionPage />);

    await waitFor(() => {
      // Tabs
      expect(screen.getByText('Lengua')).toBeInTheDocument();
      expect(screen.getByText('Matemática')).toBeInTheDocument();
      // Sector toggle (now labeled Todos/Estatal/Privado)
      expect(screen.getByText('Todos')).toBeInTheDocument();
      expect(screen.getByText('Estatal')).toBeInTheDocument();
      expect(screen.getByText('Privado')).toBeInTheDocument();
    });

    // Default: Lengua tab active + Todos sector active
    const lenguaTab = screen.getByText('Lengua');
    expect(lenguaTab.className).toContain('text-white');
    const todosBtn = screen.getByText('Todos');
    expect(todosBtn.className).toContain('text-white');
  });

  it('should render KPI with correct total matrícula value', async () => {
    render(<EducacionPage />);

    await waitFor(() => {
      const kpis = screen.getAllByTestId('kpi-card');
      // Matrícula Total = 136544 + 28291 + 25965 = 190800
      const matriculaKpi = kpis.find(k => k.getAttribute('data-title') === 'Matrícula Total');
      expect(matriculaKpi?.getAttribute('data-value')).toBe('190.800');
    });
  });

  it('should switch Aprender chart when clicking Matemática tab', async () => {
    render(<EducacionPage />);

    await waitFor(() => {
      expect(screen.getByText('Matemática')).toBeInTheDocument();
    });

    // Click Matemática tab
    fireEvent.click(screen.getByText('Matemática'));

    await waitFor(() => {
      const charts = screen.getAllByTestId('chart-with-table');
      const chartTitles = charts.map(c => c.getAttribute('data-title'));
      expect(chartTitles).toContain('Resultados Aprender - Matemática por Quintil');
      expect(chartTitles).not.toContain('Resultados Aprender - Lengua por Quintil');
    });
  });

  it('should render without crashing when no aprender data', async () => {
    fromMock.__setAprenderData([]);
    render(<EducacionPage />);

    await waitFor(() => {
      expect(screen.getByTestId('section-header')).toBeInTheDocument();
    });
  });
});
