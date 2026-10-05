import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import { SectionHeader } from '@/components/section-header';
import { hasPublicSupabaseConfig } from '@/lib/runtime-config';
import { SupabaseUnavailable } from '@/components/supabase-unavailable';
import PoblacionCharts, { type PoblacionScope } from './poblacion-charts';
import {
  PROVINCIA_CENSO,
  CATEGORIA_CENSO,
  FUENTE_CENSO,
  PERIODO_CENSO,
} from '@/lib/poblacion-censo';

export const metadata: Metadata = {
  title: 'Población y Demografía',
};

// ─── Filtro del Censo 2022 (Córdoba) ─────────────────────────────
// ⚠️ La categoría `demografia` también guarda 361 filas viejas de otra fuente
// ("Población por edad"). Sin el filtro por `fuente` se mezclarían dos censos
// distintos, así que los tres campos (categoria + fuente + periodo) van juntos.
const CENSO_CATEGORIA = CATEGORIA_CENSO;
const CENSO_FUENTE = FUENTE_CENSO;
const CENSO_PERIODO = PERIODO_CENSO;

// Nombres exactos de los indicadores cargados por el ETL del Censo. Sólo se
// piden los cortes que usa la pantalla (7 por jurisdicción → 189 filas), en vez
// de las ~3.014 del filtro completo (que además superan el tope de 1.000 filas
// por request de PostgREST).
const INDICADORES = {
  total: 'Población total',
  nnya: 'Población — NNyA (0 a 17)',
  varones: 'Población — varones',
  mujeres: 'Población — mujeres',
  hasta14: 'Población — HASTA 14 AÑOS',
  de15a64: 'Población — 15 A 64 AÑOS',
  de65mas: 'Población — 65 AÑOS Y MÁS',
} as const;

type IndicadorKey = keyof typeof INDICADORES;

const NOMBRES_INDICADORES: readonly string[] = Object.values(INDICADORES);

const INDICADOR_POR_NOMBRE = new Map<string, IndicadorKey>(
  (Object.entries(INDICADORES) as [IndicadorKey, string][]).map(([key, nombre]) => [nombre, key])
);

type CensoRow = {
  indicador_nombre: string | null;
  valor: number | null;
  unidad: string | null;
  region: string | null;
};

// ─── Data fetching ───────────────────────────────────────────────

/**
 * Trae los cortes del Censo 2022 paginando de a 1.000 filas: PostgREST corta
 * cualquier respuesta en ese tope y acá la garantía que importa es que estén
 * las 27 regiones (agregado provincial + 26 departamentos).
 */
async function fetchCensoRows(): Promise<CensoRow[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const PAGE = 1000;
  const rows: CensoRow[] = [];
  let offset = 0;

  for (;;) {
    const { data, error } = await supabase
      .from('indicadores')
      .select('indicador_nombre, valor, unidad, region')
      .eq('categoria', CENSO_CATEGORIA)
      .eq('fuente', CENSO_FUENTE)
      .eq('periodo', CENSO_PERIODO)
      .in('indicador_nombre', NOMBRES_INDICADORES)
      .order('region', { ascending: true })
      .order('indicador_nombre', { ascending: true })
      .range(offset, offset + PAGE - 1);

    if (error) throw error;

    const page = (data ?? []) as CensoRow[];
    rows.push(...page);

    if (page.length < PAGE) break;
    offset += PAGE;
  }

  return rows;
}

/** Agrupa las filas por región y las ordena: provincia primero, luego por población. */
function buildJurisdicciones(rows: CensoRow[]): PoblacionScope[] {
  const porRegion = new Map<string, Partial<Record<IndicadorKey, number>>>();

  for (const row of rows) {
    if (!row.region) continue;
    const key = row.indicador_nombre ? INDICADOR_POR_NOMBRE.get(row.indicador_nombre) : undefined;
    if (!key) continue;

    const valor = Number(row.valor);
    if (!Number.isFinite(valor)) continue;

    const bucket = porRegion.get(row.region) ?? {};
    bucket[key] = valor;
    porRegion.set(row.region, bucket);
  }

  const jurisdicciones: PoblacionScope[] = [...porRegion.entries()].map(([region, v]) => ({
    region,
    esProvincia: region === PROVINCIA_CENSO,
    total: v.total ?? null,
    varones: v.varones ?? null,
    mujeres: v.mujeres ?? null,
    nnya: v.nnya ?? null,
    hasta14: v.hasta14 ?? null,
    de15a64: v.de15a64 ?? null,
    de65mas: v.de65mas ?? null,
  }));

  return jurisdicciones.sort((a, b) => {
    if (a.esProvincia !== b.esProvincia) return a.esProvincia ? -1 : 1;
    return (b.total ?? -1) - (a.total ?? -1);
  });
}

// ─── Page (Server Component) ─────────────────────────────────────

export default async function PoblacionPage() {
  if (!hasPublicSupabaseConfig()) {
    return <SupabaseUnavailable />;
  }

  const rows = await fetchCensoRows();
  const jurisdicciones = buildJurisdicciones(rows);
  // La unidad es la misma en todo el filtro ('personas'); si no hay filas, el
  // client muestra el estado vacío y la unidad no se usa.
  const unidad = rows.find(row => row.unidad)?.unidad ?? 'personas';

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Users}
        title="Población y Demografía"
        description={`Censo Nacional 2022 (INDEC) — Córdoba, sus 26 departamentos y los cortes de varones, mujeres y NNyA (0 a 17)`}
        color="blue"
      />

      <PoblacionCharts
        jurisdicciones={jurisdicciones}
        fuente={CENSO_FUENTE}
        periodo={CENSO_PERIODO}
        unidad={unidad}
      />
    </div>
  );
}
