import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReportModal } from './report-modal';

// Mock fetch for API calls
function createMockFetch(ok: boolean, data: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
    status,
  });
}

const mockReportResponse = {
  report: {
    title: 'Informe Ejecutivo',
    date: '04/06/2026',
    overview: 'Resumen del análisis.',
    sections: [],
    conclusion: 'Conclusión.',
    recommendations: [],
  },
  generatedAt: '2026-06-04T12:00:00.000Z',
};

describe('ReportModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', createMockFetch(true, mockReportResponse));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ReportModal isOpen={false} onClose={onClose} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders modal content when isOpen is true', () => {
    render(<ReportModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText('Informe Ejecutivo')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /generar informe/i }),
    ).toBeInTheDocument();
  });

  it('shows all 6 category checkboxes', () => {
    render(<ReportModal isOpen={true} onClose={onClose} />);
    expect(screen.getByLabelText(/pobreza/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/salud/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/educación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/inversión/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/seguridad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/demografía/i)).toBeInTheDocument();
  });

  it('pre-checks all categories by default', () => {
    render(<ReportModal isOpen={true} onClose={onClose} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(6);
    checkboxes.forEach((cb) => {
      expect(cb).toBeChecked();
    });
  });

  it('shows "Todos los ejes temáticos" checkbox that toggles all', () => {
    render(<ReportModal isOpen={true} onClose={onClose} />);

    // "Todos los ejes temáticos" should be checked initially
    const todasCheckbox = screen.getByLabelText(/todos los ejes temáticos/i);
    expect(todasCheckbox).toBeChecked();

    // Uncheck "Todos"
    fireEvent.click(todasCheckbox);
    expect(todasCheckbox).not.toBeChecked();

    // All category checkboxes should be unchecked too
    const categoryCheckboxes = screen
      .getAllByRole('checkbox')
      .filter((cb) => cb !== todasCheckbox);
    categoryCheckboxes.forEach((cb) => {
      expect(cb).not.toBeChecked();
    });
  });

  it('calls onClose when close button is clicked', () => {
    render(<ReportModal isOpen={true} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /cerrar/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows loading spinner when generating report', () => {
    // Make fetch slow so we can see loading state
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => mockReportResponse,
                  text: async () => JSON.stringify(mockReportResponse),
                  status: 200,
                }),
              500,
            ),
          ),
      ),
    );

    render(<ReportModal isOpen={true} onClose={onClose} />);

    const generateButton = screen.getByRole('button', {
      name: /generar informe/i,
    });
    fireEvent.click(generateButton);

    // Should show multi-step loading
    expect(
      screen.getByText('Consultando base de datos...'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Buscando documentos relacionados...'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Consultando fuentes web...'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Generando informe crítico...'),
    ).toBeInTheDocument();
  });

  it('shows error state when API fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    );

    render(<ReportModal isOpen={true} onClose={onClose} />);

    const generateButton = screen.getByRole('button', {
      name: /generar informe/i,
    });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Error al generar el informe')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /reintentar/i }),
    ).toBeInTheDocument();
  });

  it('renders report content after successful generation', async () => {
    render(<ReportModal isOpen={true} onClose={onClose} />);

    const generateButton = screen.getByRole('button', {
      name: /generar informe/i,
    });
    fireEvent.click(generateButton);

    // Wait for report to load
    await waitFor(() => {
      expect(screen.getByText('Informe Ejecutivo')).toBeInTheDocument();
    });

    // Print button should appear
    expect(
      screen.getByRole('button', { name: /imprimir/i }),
    ).toBeInTheDocument();
  });

  it('shows print button after generation', async () => {
    render(<ReportModal isOpen={true} onClose={onClose} />);

    const generateButton = screen.getByRole('button', {
      name: /generar informe/i,
    });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /imprimir/i }),
      ).toBeInTheDocument();
    });
  });

  it('calls onClose when backdrop is clicked', () => {
    const { container } = render(
      <ReportModal isOpen={true} onClose={onClose} />,
    );

    // Click the backdrop (outer div)
    const backdrop = container.firstChild as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  // ── Multi-step Loading Transitions ──────────────────────────

  it('shows all 4 loading steps during generation', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => mockReportResponse,
                  text: async () => JSON.stringify(mockReportResponse),
                  status: 200,
                }),
              5000,
            ),
          ),
      ),
    );

    render(<ReportModal isOpen={true} onClose={onClose} />);

    const generateButton = screen.getByRole('button', {
      name: /generar informe/i,
    });
    fireEvent.click(generateButton);

    // All 4 step labels should be visible
    expect(
      screen.getByText('Consultando base de datos...'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Buscando documentos relacionados...'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Consultando fuentes web...'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Generando informe crítico...'),
    ).toBeInTheDocument();
  });

  it('shows first step as active (highlighted) and rest as inactive', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => mockReportResponse,
                  text: async () => JSON.stringify(mockReportResponse),
                  status: 200,
                }),
              5000,
            ),
          ),
      ),
    );

    render(<ReportModal isOpen={true} onClose={onClose} />);

    const generateButton = screen.getByRole('button', {
      name: /generar informe/i,
    });
    fireEvent.click(generateButton);

    // First step text should have high opacity (text-gray-800)
    expect(screen.getByText('Consultando base de datos...')).toHaveClass(
      'text-gray-800',
    );

    // Second step should have lower opacity
    expect(screen.getByText('Buscando documentos relacionados...')).toHaveClass(
      'text-gray-400',
    );
  });
});
