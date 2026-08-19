import { createClient } from '@supabase/supabase-js';
import { Suspense } from 'react';
import { BookOpen } from 'lucide-react';
import { PageLoading } from '@/components/page-loading';
import { SectionHeader } from '@/components/section-header';
import { parseDesglose } from '@/lib/parse-desglose';
import type { Indicador } from '@/lib/use-dashboard-data';
import type { AprenderRow } from '@/lib/aprender-transform';
import EducacionClient from './educacion-charts';

// ─── Helpers ────────────────────────────────────────────────────

function getDeptoTop(data: Indicador[], indicadorNombre: string, topN = 15) {
  const rows = data.filter(d => d.indicador_nombre === indicadorNombre);
  if (rows.length === 0) return [];

  const periods = [...new Set(rows.map(r => r.periodo))].sort();
  const latest = periods[periods.length - 1];

  const map = new Map<string, number>();
  for (const r of rows) {
    if (r.periodo !== latest) continue;
    map.set(r.region, (map.get(r.region) || 0) + Number(r.valor || 0));
  }

  return [...map.entries()]
    .map(([name, valor]) => ({ name, valor: Math.round(valor) }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, topN);
}

function getIndicatorTotal(data: Indicador[], indicadorNombre: string) {
  const rows = data.filter(d => d.indicador_nombre === indicadorNombre);
  if (rows.length === 0) return 0;

  const periods = [...new Set(rows.map(r => r.periodo))].sort();
  const latest = periods[periods.length - 1];

  return rows
    .filter(r => r.periodo === latest)
    .reduce((sum, r) => sum + Number(r.valor || 0), 0);
}

function getIndicatorPeriod(data: Indicador[], indicadorNombre: string) {
  const rows = data.filter(d => d.indicador_nombre === indicadorNombre);
  if (rows.length === 0) return undefined;
  const periods = [...new Set(rows.map(r => r.periodo))].sort();
  return periods[periods.length - 1] as string | undefined;
}

function getAsistenciaEducativa(data: Indicador[]) {
  const asistencia = data.filter(d => d.indicador_nombre === 'Tasa de asistencia educativa');
  return asistencia
    .filter(d => d.desglose?.edad)
    .map(d => ({
      edad: Number(d.desglose?.edad) || 0,
      label: `${d.desglose?.edad ?? 0} años`,
      valor: Number(d.valor) || 0,
    }))
    .sort((a, b) => a.edad - b.edad);
}

function getEscolarizacionData(data: Indicador[]) {
  const rows = data.filter(d => d.indicador_nombre === 'Escolarización por edad');
  const map = new Map<number, { asiste: number; no_asiste_asistio: number; nunca_asistio: number }>();

  for (const row of rows) {
    const edad = Number(row.desglose?.edad) || 0;
    const metrica = String(row.desglose?.metrica || '');
    const valor = Number(row.valor || 0);

    if (!map.has(edad)) {
      map.set(edad, { asiste: 0, no_asiste_asistio: 0, nunca_asistio: 0 });
    }
    const entry = map.get(edad)!;
    if (metrica === 'asiste') entry.asiste += valor;
    else if (metrica === 'no_asiste_asistio') entry.no_asiste_asistio += valor;
    else if (metrica === 'nunca_asistio') entry.nunca_asistio += valor;
  }

  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([edad, values]) => ({
      edad: `${edad} años`,
      ...values,
    }));
}

function getNivelEducativoData(data: Indicador[]) {
  const rows = data.filter(d => d.indicador_nombre === 'Población por nivel educativo alcanzado');
  const map = new Map<string, number>();

  for (const row of rows) {
    const nivel = String(row.desglose?.nivel_educativo || '');
    if (!nivel) continue;
    map.set(nivel, (map.get(nivel) || 0) + Number(row.valor || 0));
  }

  return [...map.entries()]
    .map(([name, valor]) => ({ name, valor: Math.round(valor) }))
    .sort((a, b) => b.valor - a.valor);
}

// ─── Page ───────────────────────────────────────────────────────

export default async function EducacionPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [educacionResult, aprenderResult] = await Promise.all([
    supabase
      .from('indicadores')
      .select('id, indicador_nombre, valor, unidad, periodo, region, desglose')
      .eq('categoria', 'educacion')
      .order('periodo', { ascending: true }),
    supabase
      .from('indicadores')
      .select('id, indicador_nombre, valor, unidad, periodo, region, desglose')
      .eq('categoria', 'aprender')
      .order('periodo', { ascending: true }),
  ]);

  if (educacionResult.error) throw educacionResult.error;

  const aprenderError = aprenderResult.error?.message ?? null;

  const data = (educacionResult.data || []).map(d => ({
    ...d,
    desglose: parseDesglose(d.desglose),
  })) as Indicador[];

  const aprenderData = (aprenderResult.data || []).map(d => ({
    ...d,
    desglose: parseDesglose(d.desglose),
  })) as AprenderRow[];

  // ── KPI data ──────────────────────────────────────────────
  const totalMatricula = getIndicatorTotal(data, 'Matrícula - General');
  const matriculaPeriod = getIndicatorPeriod(data, 'Matrícula - General');

  const totalEstatal = getIndicatorTotal(data, 'Matrícula sector estatal - General');
  const totalGeneral = getIndicatorTotal(data, 'Matrícula - General');
  const pctPublico = totalGeneral > 0 ? (totalEstatal / totalGeneral) * 100 : 0;

  const asistenciaData = getAsistenciaEducativa(data);
  const asistenciaPeriod = data
    .filter(d => d.indicador_nombre === 'Tasa de asistencia educativa')
    .sort((a, b) => Number(b.periodo) - Number(a.periodo))[0]?.periodo;

  const tasaSecundaria =
    asistenciaData.filter(d => d.edad >= 13 && d.edad <= 17).reduce((sum, d) => sum + d.valor, 0) /
    (asistenciaData.filter(d => d.edad >= 13 && d.edad <= 17).length || 1);

  const totalDocentes = getIndicatorTotal(data, 'Personal docente - General');
  const docentesPeriod = getIndicatorPeriod(data, 'Personal docente - General');

  // ── Chart data ────────────────────────────────────────────
  const matriculaDeptoData = getDeptoTop(data, 'Matrícula - General');
  const docentesDeptoData = getDeptoTop(data, 'Personal docente - General');
  const unidadesDeptoData = getDeptoTop(data, 'Unidades educativas - General');
  const unidadesPeriod = getIndicatorPeriod(data, 'Unidades educativas - General');
  const escolarizacionData = getEscolarizacionData(data);
  const nivelEducativoData = getNivelEducativoData(data);
  const tieneDatos = data.length > 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={BookOpen}
        title="Indicadores de Educación"
        description="Seguimiento de matriculación, asistencia y resultados educativos en Córdoba"
        color="amber"
      />
      <Suspense fallback={<PageLoading />}>
        <EducacionClient
          totalMatricula={totalMatricula}
          matriculaPeriod={matriculaPeriod}
          pctPublico={pctPublico}
          asistenciaData={asistenciaData}
          asistenciaPeriod={asistenciaPeriod}
          tasaSecundaria={tasaSecundaria}
          totalDocentes={totalDocentes}
          docentesPeriod={docentesPeriod}
          matriculaDeptoData={matriculaDeptoData}
          docentesDeptoData={docentesDeptoData}
          unidadesDeptoData={unidadesDeptoData}
          unidadesPeriod={unidadesPeriod}
          escolarizacionData={escolarizacionData}
          nivelEducativoData={nivelEducativoData}
          aprenderData={aprenderData}
          aprenderError={aprenderError}
          tieneDatos={tieneDatos}
        />
      </Suspense>
    </div>
  );
}
