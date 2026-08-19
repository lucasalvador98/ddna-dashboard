import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import EducacionClient from './educacion-charts';
import type { AprenderRow } from '@/lib/aprender-transform';

// ─── Mocks ──────────────────────────────────────────────────────

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
  ChartWithTable: ({ title }: { title: string }) => (
    <div data-testid="chart-with-table" data-title={title} />
  ),
}));

vi.mock('@/components/kpi-card', () => ({
  KpiCard: ({ title, value }: { title: string; value: string }) => (
    <div data-testid="kpi-card" data-title={title} data-value={value} />
  ),
}));

// ─── Mock data generators ───────────────────────────────────────

function makeAprenderRow(
  level: string,
  valor: number,
  quintil: string,
  sector: string,
  subject: 'Lengua' | 'Matemática',
): AprenderRow {
  return {
    indicador_nombre: `Nivel ${subject} - ${level}`,
    valor,
    region: `${quintil}-${sector}`,
  };
}

function generateAprenderData(): AprenderRow[] {
  const rows: AprenderRow[] = [];
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

// ─── Props builder ──────────────────────────────────────────────

function buildEducacionProps(aprenderData: AprenderRow[]) {
  return {
    totalMatricula: 190800,
    matriculaPeriod: '2024' as const,
    pctPublico: (101906 / 190800) * 100,
    asistenciaData: [
      { edad: 6, label: '6 años', valor: 98.52 },
      { edad: 7, label: '7 años', valor: 98.32 },
      { edad: 15, label: '15 años', valor: 94.03 },
      { edad: 16, label: '16 años', valor: 91.51 },
      { edad: 17, label: '17 años', valor: 85.98 },
    ],
    asistenciaPeriod: '2022' as const,
    tasaSecundaria: (94.03 + 91.51 + 85.98) / 3,
    totalDocentes: 15181,
    docentesPeriod: '2024' as const,
    matriculaDeptoData: [
      { name: 'Capital', valor: 136544 },
      { name: 'Colón', valor: 28291 },
      { name: 'Río Cuarto', valor: 25965 },
    ],
    docentesDeptoData: [
      { name: 'Capital', valor: 11475 },
      { name: 'Colón', valor: 2149 },
      { name: 'Río Cuarto', valor: 1557 },
    ],
    unidadesDeptoData: [
      { name: 'Capital', valor: 135 },
      { name: 'Colón', valor: 100 },
      { name: 'Río Cuarto', valor: 28 },
    ],
    unidadesPeriod: '2024' as const,
    escolarizacionData: [
      { edad: '9 años', asiste: 55500, no_asiste_asistio: 0, nunca_asistio: 281 },
      { edad: '15 años', asiste: 52578, no_asiste_asistio: 0, nunca_asistio: 206 },
    ],
    nivelEducativoData: [
      { name: 'Primario Incompleto', valor: 500 },
      { name: 'Primario Completo', valor: 400 },
      { name: 'Secundario Incompleto', valor: 300 },
      { name: 'Secundario Completo', valor: 200 },
      { name: 'Universitario Incompleto', valor: 100 },
      { name: 'Universitario Completo', valor: 80 },
    ],
    aprenderData,
    aprenderError: null,
    tieneDatos: true,
  };
}

// ─── Tests ──────────────────────────────────────────────────────

describe('EducacionClient', () => {
  let props: ReturnType<typeof buildEducacionProps>;

  beforeEach(() => {
    props = buildEducacionProps(generateAprenderData());
  });

  it('should render all chart components including new indicators', async () => {
    render(<EducacionClient {...props} />);

    await waitFor(() => {
      const charts = screen.getAllByTestId('chart-with-table');
      expect(charts.length).toBe(7);
    });

    const chartTitles = screen.getAllByTestId('chart-with-table').map(c => c.getAttribute('data-title'));
    expect(chartTitles).toContain('Matrícula por Departamento');
    expect(chartTitles).toContain('Personal Docente por Departamento');
    expect(chartTitles).toContain('Unidades Educativas por Departamento');
    expect(chartTitles).toContain('Tasa de Asistencia Educativa por Edad');
    expect(chartTitles).toContain('Escolarización por Edad');
    expect(chartTitles).toContain('Población por Nivel Educativo Alcanzado');
    expect(chartTitles).toContain('Resultados Aprender - Lengua por Quintil');
    expect(chartTitles).not.toContain('Resultados Aprender - Matemática por Quintil');
  });

  it('should show 4 KPI cards', async () => {
    render(<EducacionClient {...props} />);

    await waitFor(() => {
      const kpis = screen.getAllByTestId('kpi-card');
      expect(kpis).toHaveLength(4);
    });

    const kpiTitles = screen.getAllByTestId('kpi-card').map(k => k.getAttribute('data-title'));
    expect(kpiTitles).toContain('Matrícula Total');
    expect(kpiTitles).toContain('Sector Público');
    expect(kpiTitles).toContain('Escolarización Secundaria');
    expect(kpiTitles).toContain('Personal Docente');
  });

  it('should have tabs and sector toggle for Aprender charts', async () => {
    render(<EducacionClient {...props} />);

    await waitFor(() => {
      expect(screen.getByText('Lengua')).toBeInTheDocument();
      expect(screen.getByText('Matemática')).toBeInTheDocument();
      expect(screen.getByText('Todos')).toBeInTheDocument();
      expect(screen.getByText('Estatal')).toBeInTheDocument();
      expect(screen.getByText('Privado')).toBeInTheDocument();
    });

    const lenguaTab = screen.getByText('Lengua');
    expect(lenguaTab.className).toContain('text-white');
    const todosBtn = screen.getByText('Todos');
    expect(todosBtn.className).toContain('text-white');
  });

  it('should render KPI with correct total matrícula value', async () => {
    render(<EducacionClient {...props} />);

    await waitFor(() => {
      const kpis = screen.getAllByTestId('kpi-card');
      const matriculaKpi = kpis.find(k => k.getAttribute('data-title') === 'Matrícula Total');
      expect(matriculaKpi?.getAttribute('data-value')).toBe('190.800');
    });
  });

  it('should switch Aprender chart when clicking Matemática tab', async () => {
    render(<EducacionClient {...props} />);

    await waitFor(() => {
      expect(screen.getByText('Matemática')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Matemática'));

    await waitFor(() => {
      const chartTitles = screen.getAllByTestId('chart-with-table').map(c => c.getAttribute('data-title'));
      expect(chartTitles).toContain('Resultados Aprender - Matemática por Quintil');
      expect(chartTitles).not.toContain('Resultados Aprender - Lengua por Quintil');
    });
  });

  it('should render without crashing when no aprender data', async () => {
    render(<EducacionClient {...props} aprenderData={[]} />);

    await waitFor(() => {
      const kpis = screen.getAllByTestId('kpi-card');
      expect(kpis).toHaveLength(4);
    });
  });
});
