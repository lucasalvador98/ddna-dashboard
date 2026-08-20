'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Users, BookOpen, GraduationCap, AlertCircle } from 'lucide-react';
import { KpiCard } from '@/components/kpi-card';
import { ChartWithTable } from '@/components/charts/chart-with-table';
import { EmptyState } from '@/components/empty-state';
import { computeAprenderByQuintil } from '@/lib/aprender-transform';
import type { AprenderRow } from '@/lib/aprender-transform';

// ─── Colors ─────────────────────────────────────────────────────

const COLORS = {
  amber: '#F3A712',
  blue: '#3777FF',
  magenta: '#BF1363',
  terracotta: '#E07A5F',
  green: '#10B981',
  red: '#EF4444',
  avanzado: '#059669',
};

// ─── Props ──────────────────────────────────────────────────────

interface EducacionClientProps {
  totalMatricula: number;
  matriculaPeriod: string | undefined;
  pctPublico: number;
  asistenciaData: { edad: number; label: string; valor: number }[];
  asistenciaPeriod: string | undefined;
  tasaSecundaria: number;
  totalDocentes: number;
  docentesPeriod: string | undefined;
  matriculaDeptoData: { name: string; valor: number }[];
  docentesDeptoData: { name: string; valor: number }[];
  unidadesDeptoData: { name: string; valor: number }[];
  unidadesPeriod: string | undefined;
  escolarizacionData: { edad: string; asiste: number; no_asiste_asistio: number; nunca_asistio: number }[];
  nivelEducativoData: { name: string; valor: number }[];
  aprenderData: AprenderRow[];
  aprenderError: string | null;
  tieneDatos: boolean;
}

// ─── Component ──────────────────────────────────────────────────

export default function EducacionClient(props: EducacionClientProps) {
  const {
    totalMatricula,
    matriculaPeriod,
    pctPublico,
    asistenciaData,
    asistenciaPeriod,
    tasaSecundaria,
    totalDocentes,
    docentesPeriod,
    matriculaDeptoData,
    docentesDeptoData,
    unidadesDeptoData,
    unidadesPeriod,
    escolarizacionData,
    nivelEducativoData,
    aprenderData,
    aprenderError,
    tieneDatos,
  } = props;

  const [sector, setSector] = useState<'combinado' | 'estatal' | 'privado'>('combinado');
  const [aprenderSubject, setAprenderSubject] = useState<'lengua' | 'matematica'>('lengua');

  // ── Aprender filtering (client-side stateful) ──────────────

  const filteredAprenderData = (() => {
    if (sector === 'combinado') return aprenderData;
    const suffix = sector === 'estatal' ? '-Estatal' : '-Privado';
    return aprenderData.filter(d => d.region?.endsWith(suffix));
  })();

  const aprenderLengua = computeAprenderByQuintil(filteredAprenderData, 'Lengua');
  const aprenderMatematica = computeAprenderByQuintil(filteredAprenderData, 'Matemática');
  const aprenderFetchFailed = aprenderError && aprenderData.length === 0;

  // ── Render ─────────────────────────────────────────────────

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="Matrícula Total"
          value={totalMatricula > 0 ? totalMatricula.toLocaleString('es-AR') : '—'}
          subtitle={matriculaPeriod ? `${matriculaPeriod} — Alumnos en el sistema educativo` : 'Alumnos en el sistema educativo'}
          icon={Users}
          color="amber"
        />
        <KpiCard
          title="Sector Público"
          value={pctPublico > 0 ? `${pctPublico.toFixed(1)}%` : '—'}
          subtitle={matriculaPeriod ? `${matriculaPeriod} — Del total de matrícula` : 'Del total de matrícula'}
          icon={BookOpen}
          color="blue"
        />
        <KpiCard
          title="Escolarización Secundaria"
          value={tasaSecundaria > 0 ? `${tasaSecundaria.toFixed(1)}%` : '—'}
          subtitle={asistenciaPeriod ? `${asistenciaPeriod} — Jóvenes de 13-17 años` : 'Jóvenes de 13-17 años'}
          icon={GraduationCap}
          color="magenta"
        />
        <KpiCard
          title="Personal Docente"
          value={totalDocentes > 0 ? totalDocentes.toLocaleString('es-AR') : '—'}
          subtitle={docentesPeriod ? `${docentesPeriod} — Docentes en el sistema educativo` : 'Docentes en el sistema educativo'}
          icon={GraduationCap}
          color="green"
        />
      </div>

      {/* Chart 1: Matrícula por Departamento */}
      {matriculaDeptoData.length > 0 && (
        <ChartWithTable
          title="Matrícula por Departamento"
          subtitle={`Departamentos con mayor cantidad de alumnos (Córdoba, ${matriculaPeriod || '2024'})`}
          color="amber"
          fuente="Ministerio de Educación - Anuario 2024"
          data={matriculaDeptoData}
          dataKey="valor"
          xAxisKey="name"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={matriculaDeptoData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="name" tick={{ fill: '#4D4D4D', fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                <YAxis
                  tick={{ fill: '#4D4D4D', fontSize: 12 }}
                  tickFormatter={v => v.toLocaleString()}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                  }}
                  formatter={value => [Number(value).toLocaleString('es-AR'), 'Alumnos']}
                />
                <Bar dataKey="valor" fill={COLORS.blue} name="Matrícula" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>
      )}

      {/* Chart 2: Personal Docente por Departamento */}
      {docentesDeptoData.length > 0 && (
        <ChartWithTable
          title="Personal Docente por Departamento"
          subtitle={`Departamentos con mayor cantidad de docentes (Córdoba, ${docentesPeriod || '2024'})`}
          color="green"
          fuente="Ministerio de Educación - Anuario 2024"
          data={docentesDeptoData}
          dataKey="valor"
          xAxisKey="name"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={docentesDeptoData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="name" tick={{ fill: '#4D4D4D', fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                <YAxis
                  tick={{ fill: '#4D4D4D', fontSize: 12 }}
                  tickFormatter={v => v.toLocaleString()}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                  }}
                  formatter={value => [Number(value).toLocaleString('es-AR'), 'Docentes']}
                />
                <Bar dataKey="valor" fill={COLORS.green} name="Docentes" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>
      )}

      {/* Chart 3: Unidades Educativas por Departamento */}
      {unidadesDeptoData.length > 0 && (
        <ChartWithTable
          title="Unidades Educativas por Departamento"
          subtitle={`Departamentos con mayor cantidad de escuelas (Córdoba, ${unidadesPeriod || '2024'})`}
          color="terracotta"
          fuente="Ministerio de Educación - Anuario 2024"
          data={unidadesDeptoData}
          dataKey="valor"
          xAxisKey="name"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={unidadesDeptoData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="name" tick={{ fill: '#4D4D4D', fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                <YAxis
                  tick={{ fill: '#4D4D4D', fontSize: 12 }}
                  tickFormatter={v => v.toLocaleString()}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                  }}
                  formatter={value => [Number(value).toLocaleString('es-AR'), 'Unidades Educativas']}
                />
                <Bar dataKey="valor" fill={COLORS.terracotta} name="Unidades" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>
      )}

      {/* Chart 4: Tasa de Asistencia por Edad */}
      {asistenciaData.length > 0 && (
        <ChartWithTable
          title="Tasa de Asistencia Educativa por Edad"
          subtitle={`Porcentaje de población que asiste a establecimientos (Córdoba, ${asistenciaPeriod || '2022'})`}
          color="amber"
          fuente="Censo Nacional 2022"
          data={asistenciaData}
          dataKey="valor"
          xAxisKey="label"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={asistenciaData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="label" tick={{ fill: '#4D4D4D', fontSize: 10 }} interval={2} />
                <YAxis
                  tick={{ fill: '#4D4D4D', fontSize: 12 }}
                  domain={[0, 100]}
                  tickFormatter={v => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                  }}
                  formatter={value => [`${value}%`, 'Tasa de Asistencia']}
                />
                <Bar dataKey="valor" fill={COLORS.amber} name="Asistencia" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>
      )}

      {/* Chart 5: Escolarización por Edad */}
      {escolarizacionData.length > 0 && (
        <ChartWithTable
          title="Escolarización por Edad"
          subtitle="Población por condición de asistencia escolar (Córdoba, 2022)"
          color="blue"
          fuente="Censo Nacional 2022"
          data={escolarizacionData}
          dataKey="asiste"
          xAxisKey="edad"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={escolarizacionData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="edad" tick={{ fill: '#4D4D4D', fontSize: 10 }} interval={2} />
                <YAxis
                  tick={{ fill: '#4D4D4D', fontSize: 12 }}
                  tickFormatter={v => v.toLocaleString()}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => [
                    Number(value).toLocaleString('es-AR'),
                    name === 'asiste' ? 'Asiste' : name === 'no_asiste_asistio' ? 'No asiste / Asistió' : 'Nunca asistió',
                  ]}
                />
                <Legend />
                <Bar dataKey="asiste" stackId="stack" fill={COLORS.green} name="Asiste" radius={[2, 2, 0, 0]} />
                <Bar dataKey="no_asiste_asistio" stackId="stack" fill={COLORS.amber} name="No asiste / Asistió" radius={[2, 2, 0, 0]} />
                <Bar dataKey="nunca_asistio" stackId="stack" fill={COLORS.red} name="Nunca asistió" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>
      )}

      {/* Chart 6: Población por Nivel Educativo Alcanzado */}
      {nivelEducativoData.length > 0 && (
        <ChartWithTable
          title="Población por Nivel Educativo Alcanzado"
          subtitle="Distribución de la población según máximo nivel educativo alcanzado (Córdoba, 2022)"
          color="magenta"
          fuente="Censo Nacional 2022"
          data={nivelEducativoData}
          dataKey="valor"
          xAxisKey="name"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={nivelEducativoData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 120, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  type="number"
                  tick={{ fill: '#4D4D4D', fontSize: 12 }}
                  tickFormatter={v => v.toLocaleString()}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#4D4D4D', fontSize: 11 }}
                  width={140}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                  }}
                  formatter={value => [Number(value).toLocaleString('es-AR'), 'Población']}
                />
                <Bar dataKey="valor" fill={COLORS.magenta} name="Población" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartWithTable>
      )}

      {/* Tabs + Toggle for Aprender */}
      {aprenderLengua.length + aprenderMatematica.length > 0 && (
        <div className="space-y-4">
          {/* Tab bar: Lengua | Matemática */}
          <div className="flex items-center justify-between">
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              <button
                onClick={() => setAprenderSubject('lengua')}
                className={`px-5 py-2 text-sm font-semibold transition-colors ${
                  aprenderSubject === 'lengua'
                    ? 'bg-navy text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Lengua
              </button>
              <button
                onClick={() => setAprenderSubject('matematica')}
                className={`px-5 py-2 text-sm font-semibold transition-colors ${
                  aprenderSubject === 'matematica'
                    ? 'bg-navy text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Matemática
              </button>
            </div>

            {/* Sector toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Sector:</span>
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                {(['combinado', 'estatal', 'privado'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSector(s)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      sector === s
                        ? 'bg-navy text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {s === 'combinado' ? 'Todos' : s === 'estatal' ? 'Estatal' : 'Privado'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ALERTA: Matemática con Q1-Estatal > 50% por debajo */}
          {aprenderSubject === 'matematica' &&
            aprenderMatematica.length > 0 &&
            aprenderMatematica[0]?.debajo > 50 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  ALERTA: Más del {aprenderMatematica[0].debajo.toFixed(0)}% de estudiantes en Q1 están
                  por debajo del nivel básico en Matemática
                </span>
              </div>
            )}

          {/* Chart: Aprender por Quintil (active tab) */}
          {(aprenderSubject === 'lengua' ? aprenderLengua : aprenderMatematica).length > 0 && (
            <ChartWithTable
              title={`Resultados Aprender - ${aprenderSubject === 'lengua' ? 'Lengua' : 'Matemática'} por Quintil`}
              subtitle={`Porcentaje de estudiantes por nivel de logro (Córdoba, 2024) — ${sector === 'combinado' ? 'Todos los sectores' : sector === 'estatal' ? 'Sector Estatal' : 'Sector Privado'}`}
              color={aprenderSubject === 'lengua' ? 'green' : 'magenta'}
              fuente="Evaluación Aprender 2024"
              data={aprenderSubject === 'lengua' ? aprenderLengua : aprenderMatematica}
              dataKey="satisfactorio"
              xAxisKey="quintil"
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={aprenderSubject === 'lengua' ? aprenderLengua : aprenderMatematica}
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                    <XAxis dataKey="quintil" tick={{ fill: '#4D4D4D', fontSize: 12 }} />
                    <YAxis
                      tick={{ fill: '#4D4D4D', fontSize: 12 }}
                      domain={[0, 100]}
                      tickFormatter={v => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFF',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                      }}
                      formatter={(value, name) => [
                        `${value}%`,
                        name === 'avanzado' ? 'Avanzado' : name === 'satisfactorio' ? 'Satisfactorio' : name === 'basico' ? 'Básico' : 'Por debajo',
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="avanzado" fill={COLORS.avanzado} name="Avanzado" radius={[2, 2, 0, 0]} stackId="stack" />
                    <Bar dataKey="satisfactorio" fill={COLORS.green} name="Satisfactorio" radius={[2, 2, 0, 0]} stackId="stack" />
                    <Bar dataKey="basico" fill={COLORS.amber} name="Básico" radius={[2, 2, 0, 0]} stackId="stack" />
                    <Bar dataKey="debajo" fill={COLORS.red} name="Por debajo" radius={[2, 2, 0, 0]} stackId="stack" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartWithTable>
          )}
        </div>
      )}

      {aprenderFetchFailed && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-700 mb-2">No se pudieron cargar los datos de Aprender. Los gráficos pueden estar incompletos.</p>
          <p className="text-amber-600 text-sm">{aprenderError}</p>
          <button onClick={() => window.location.reload()} className="text-sm text-amber-600 underline hover:text-amber-800 mt-1">Reintentar</button>
        </div>
      )}

      {!tieneDatos && (
        <EmptyState title="No hay datos de educación disponibles" />
      )}
    </>
  );
}
