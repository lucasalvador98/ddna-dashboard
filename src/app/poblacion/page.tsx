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

// Nombres exactos de los indicadores cargados por el ETL del Censo. Son los
// cortes agregados de la pantalla; las edades simples (111 nombres más) van
// aparte en NOMBRES_EDADES.
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

// ─── Edad simple (PERSONA_EDAD) ──────────────────────────────────
// El ETL cargó 0..109 como indicadores propios y etiquetó el último código
// abierto (110, cuya etiqueta oficial es "valido hasta") como "110 y más".
// Ojo: no todas las edades altas existen en todos los departamentos (las series
// van de 96 a 111 edades según el tamaño del departamento), así que la serie se
// arma sólo con las edades realmente presentes: no se rellena con ceros.
const EDAD_SIMPLE_MAX = 109;
const EDAD_ABIERTA = 110;

const NOMBRES_EDADES: readonly string[] = [
  ...Array.from({ length: EDAD_SIMPLE_MAX + 1 }, (_, edad) => `Población — edad ${edad}`),
  `Población — edad ${EDAD_ABIERTA} y más`,
];

/** Nombre del indicador → años cumplidos (el grupo abierto "110 y más" vale 110). */
const EDAD_POR_NOMBRE = new Map<string, number>([
  ...Array.from({ length: EDAD_SIMPLE_MAX + 1 }, (_, edad): [string, number] => [
    `Población — edad ${edad}`,
    edad,
  ]),
  [`Población — edad ${EDAD_ABIERTA} y más`, EDAD_ABIERTA],
]);

// 7 cortes + 111 edades simples = 118 nombres × 27 regiones ≈ 3.014 filas: más
// del triple del tope de 1.000 filas por request de PostgREST, así que el fetch
// pagina con `.range()`. Todos los nombres van en un solo `.in()` porque el
// filtro es el mismo para toda la pantalla (categoria + fuente + periodo).
const NOMBRES_FETCH: readonly string[] = [...NOMBRES_INDICADORES, ...NOMBRES_EDADES];

type CensoRow = {
  indicador_nombre: string | null;
  valor: number | null;
  unidad: string | null;
  region: string | null;
};

// ─── Data fetching ───────────────────────────────────────────────

/**
 * Trae los cortes del Censo 2022 paginando de a 1.000 filas: PostgREST corta
 * cualquier respuesta en ese tope y el filtro ampliado (7 cortes + 111 edades
 * simples ≈ 3.014 filas) necesita 4 páginas. La garantía que importa es que el
 * loop no se corte antes: se sigue pidiendo hasta recibir una página incompleta,
 * así que las 27 regiones (agregado provincial + 26 departamentos) llegan enteras.
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
      .in('indicador_nombre', NOMBRES_FETCH)
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

/**
 * Agrupa las filas por región y las ordena: provincia primero, luego por población.
 * Las edades se guardan en un `Map` por región (clave = años) para que una fila
 * repetida por el paginado no infle la serie.
 */
function buildJurisdicciones(rows: CensoRow[]): PoblacionScope[] {
  type BucketRegion = {
    cortes: Partial<Record<IndicadorKey, number>>;
    edades: Map<number, number>;
  };

  const porRegion = new Map<string, BucketRegion>();

  for (const row of rows) {
    if (!row.region) continue;
    const nombre = row.indicador_nombre;
    if (!nombre) continue;

    const valor = Number(row.valor);
    if (!Number.isFinite(valor)) continue;

    const bucket = porRegion.get(row.region) ?? { cortes: {}, edades: new Map<number, number>() };

    const key = INDICADOR_POR_NOMBRE.get(nombre);
    if (key) {
      bucket.cortes[key] = valor;
    } else {
      const edad = EDAD_POR_NOMBRE.get(nombre);
      if (edad == null) continue;
      bucket.edades.set(edad, valor);
    }

    porRegion.set(row.region, bucket);
  }

  const jurisdicciones: PoblacionScope[] = [...porRegion.entries()].map(
    ([region, { cortes, edades }]) => ({
      region,
      esProvincia: region === PROVINCIA_CENSO,
      total: cortes.total ?? null,
      varones: cortes.varones ?? null,
      mujeres: cortes.mujeres ?? null,
      nnya: cortes.nnya ?? null,
      hasta14: cortes.hasta14 ?? null,
      de15a64: cortes.de15a64 ?? null,
      de65mas: cortes.de65mas ?? null,
      edades: [...edades.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([edad, valor]) => ({ edad, valor })),
    })
  );

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
        description={`Censo Nacional 2022 (INDEC) — Córdoba y sus 26 departamentos: total, varones, mujeres, NNyA (0 a 17), grandes grupos y estructura por edad simple`}
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
