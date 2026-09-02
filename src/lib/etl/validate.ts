import { z } from 'zod';

export interface RawIndicadorRow {
  indicador_nombre: string;
  categoria: string;
  valor: unknown;
  unidad: string;
  periodo: unknown;
  region: string;
  desglose?: unknown;
  fuente: string;
}

export interface ValidatedRow {
  indicador_nombre: string;
  categoria: string;
  valor: number;
  unidad: string;
  periodo: number;
  region: string;
  desglose: string | null;
  fuente: string;
  ultima_actualizacion: string;
  activo: boolean;
}

export interface ValidationResult {
  valid: ValidatedRow[];
  warnings: string[];
}

// Rangos por unidad
const UNIT_RANGES: Record<string, { min: number; max: number }> = {
  '%': { min: 0, max: 100 },
  '‰': { min: 0, max: 50 },
  'pesos': { min: 0, max: Number.MAX_SAFE_INTEGER },
  'índice': { min: 0, max: 10000 },
  'miles de personas': { min: 0, max: 50000 },
  'coeficiente': { min: 0, max: 10 },
};

const VALID_REGIONS = ['Nacional', 'Córdoba', 'CABA', 'Buenos Aires', 'Patagonia', 'Cuyo', 'NOA', 'NEA', 'Centro', 'Córdoba Capital'];

const RowSchema = z.object({
  indicador_nombre: z.string().min(1, 'indicador_nombre requerido'),
  categoria: z.string().min(1),
  valor: z.number().finite('valor debe ser número finito'),
  unidad: z.string().min(1),
  periodo: z.number().int().min(2000).max(2026),
  region: z.string().min(1),
  fuente: z.string().min(1),
});

export function validateRows(rows: RawIndicadorRow[]): ValidationResult {
  const valid: ValidatedRow[] = [];
  const warnings: string[] = [];
  const now = new Date().toISOString();

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const valorNum = typeof r.valor === 'string' ? Number(r.valor) : (r.valor as number);
    const periodoNum = typeof r.periodo === 'string' ? Number(r.periodo) : (r.periodo as number);

    if (r.valor === null || r.valor === undefined || r.valor === '') {
      warnings.push(`[${i}] ${r.indicador_nombre}: valor vacío, descartado`);
      continue;
    }
    if (typeof valorNum !== 'number' || Number.isNaN(valorNum) || !Number.isFinite(valorNum)) {
      warnings.push(`[${i}] ${r.indicador_nombre}: valor no numérico (${r.valor}), descartado`);
      continue;
    }

    const parsed = RowSchema.safeParse({
      indicador_nombre: r.indicador_nombre,
      categoria: r.categoria,
      valor: Number(valorNum.toFixed(2)),
      unidad: r.unidad,
      periodo: periodoNum,
      region: r.region,
      fuente: r.fuente,
    });

    if (!parsed.success) {
      warnings.push(`[${i}] ${r.indicador_nombre}: ${parsed.error.issues.map((iss) => iss.message).join(', ')}`);
      continue;
    }

    // Rango por unidad
    const range = UNIT_RANGES[r.unidad];
    if (range && (valorNum < range.min || valorNum > range.max)) {
      warnings.push(
        `[${i}] ${r.indicador_nombre}: valor ${valorNum} fuera de rango [${range.min},${range.max}] para unidad "${r.unidad}", descartado`
      );
      continue;
    }

    // Región warning (no bloquea, pero avisa si es desconocida)
    if (r.region && !VALID_REGIONS.includes(r.region) && !r.region.startsWith('Córdoba')) {
      warnings.push(`[${i}] ${r.indicador_nombre}: región no estándar "${r.region}"`);
    }

    valid.push({
      indicador_nombre: parsed.data.indicador_nombre,
      categoria: parsed.data.categoria,
      valor: parsed.data.valor,
      unidad: parsed.data.unidad,
      periodo: parsed.data.periodo,
      region: parsed.data.region,
      desglose: r.desglose ? JSON.stringify(r.desglose) : null,
      fuente: parsed.data.fuente,
      ultima_actualizacion: now,
      activo: true,
    });
  }

  return { valid, warnings };
}

export function parseDate(dateStr: string): { year: number; month: number | null } {
  const parts = dateStr.split('-');
  return {
    year: Number(parts[0]),
    month: parts[1] ? Number(parts[1]) : null,
  };
}
