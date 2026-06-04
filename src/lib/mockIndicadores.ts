/**
 * @file mockIndicadores.ts
 * @description Mock data for informe-ejecutivo tests.
 *
 * All values are based on real data from the production DB (ppyyqrvirjqmfpqaqnxy).
 * Organised by category to make tests readable and composable.
 *
 * Usage:
 *   import { mockSalud, mockPobreza, mockAprender, allMockIndicadores } from './mockIndicadores';
 */

import type { IndicadorRow } from './informe-ejecutivo';

// ─── SALUD ────────────────────────────────────────────────────────────────────

export const mockSalud: IndicadorRow[] = [
  // Tasa de Mortalidad Infantil — Córdoba (series 2020-2022)
  {
    id: 'salud-tmi-2022',
    indicador_nombre: 'Mortalidad infantil (TMI Cba)',
    categoria: 'salud',
    valor: 8.5,
    unidad: '‰',
    periodo: '2022',
    region: 'Córdoba',
    desglose: { serie: 'TMI Cba', fuente: 'Mortalidad infantil Nacion-Provincia.xlsx', hoja: 'Sheet1' },
    fuente: 'DEIS',
  },
  {
    id: 'salud-tmi-2021',
    indicador_nombre: 'Mortalidad infantil (TMI Cba)',
    categoria: 'salud',
    valor: 9.1,
    unidad: '‰',
    periodo: '2021',
    region: 'Córdoba',
    desglose: { serie: 'TMI Cba', fuente: 'Mortalidad infantil Nacion-Provincia.xlsx', hoja: 'Sheet1' },
    fuente: 'DEIS',
  },
  {
    id: 'salud-tmi-2020',
    indicador_nombre: 'Mortalidad infantil (TMI Cba)',
    categoria: 'salud',
    valor: 8.8,
    unidad: '‰',
    periodo: '2020',
    region: 'Córdoba',
    desglose: { serie: 'TMI Cba', fuente: 'Mortalidad infantil Nacion-Provincia.xlsx', hoja: 'Sheet1' },
    fuente: 'DEIS',
  },
  // Tasa de Mortalidad Infantil — comparativa nacional
  {
    id: 'salud-tmi-nacional-2022',
    indicador_nombre: 'Mortalidad infantil (TMI)',
    categoria: 'salud',
    valor: 9.4,
    unidad: '‰',
    periodo: '2022',
    region: 'Argentina',
    desglose: { serie: 'TMI Nacional', fuente: 'Mortalidad infantil Nacion-Provincia.xlsx', hoja: 'Sheet1' },
    fuente: 'DEIS',
  },
  {
    id: 'salud-tmi-nacional-2021',
    indicador_nombre: 'Mortalidad infantil (TMI)',
    categoria: 'salud',
    valor: 9.7,
    unidad: '‰',
    periodo: '2021',
    region: 'Argentina',
    desglose: { serie: 'TMI Nacional', fuente: 'Mortalidad infantil Nacion-Provincia.xlsx', hoja: 'Sheet1' },
    fuente: 'DEIS',
  },
  // Razón de Mortalidad Materna — Córdoba
  {
    id: 'salud-rmm-2022',
    indicador_nombre: 'Mortalidad infantil (RMM Cba)',
    categoria: 'salud',
    valor: 3.37,
    unidad: '‰',
    periodo: '2022',
    region: 'Córdoba',
    desglose: { serie: 'RMM Cba', fuente: 'Mortalidad infantil Nacion-Provincia.xlsx', hoja: 'Sheet1' },
    fuente: 'DEIS',
  },
  {
    id: 'salud-rmm-2021',
    indicador_nombre: 'Mortalidad infantil (RMM Cba)',
    categoria: 'salud',
    valor: 6.34,
    unidad: '‰',
    periodo: '2021',
    region: 'Córdoba',
    desglose: { serie: 'RMM Cba', fuente: 'Mortalidad infantil Nacion-Provincia.xlsx', hoja: 'Sheet1' },
    fuente: 'DEIS',
  },
];

// ─── POBREZA ──────────────────────────────────────────────────────────────────

export const mockPobreza: IndicadorRow[] = [
  // Pobreza hogares — Córdoba, semestral (EPH-INDEC)
  {
    id: 'pob-hogares-2024s2',
    indicador_nombre: 'Pobreza hogares',
    categoria: 'pobreza',
    valor: 25.0,
    unidad: '%',
    periodo: '2024',
    region: 'Córdoba',
    desglose: { semestre: 2 },
    fuente: 'EPH-INDEC / datos.gob.ar',
  },
  {
    id: 'pob-hogares-2024s1',
    indicador_nombre: 'Pobreza hogares',
    categoria: 'pobreza',
    valor: 36.0,
    unidad: '%',
    periodo: '2024',
    region: 'Córdoba',
    desglose: { semestre: 1 },
    fuente: 'EPH-INDEC / datos.gob.ar',
  },
  {
    id: 'pob-hogares-2023s2',
    indicador_nombre: 'Pobreza hogares',
    categoria: 'pobreza',
    valor: 29.0,
    unidad: '%',
    periodo: '2023',
    region: 'Córdoba',
    desglose: { semestre: 2 },
    fuente: 'EPH-INDEC / datos.gob.ar',
  },
  {
    id: 'pob-hogares-2023s1',
    indicador_nombre: 'Pobreza hogares',
    categoria: 'pobreza',
    valor: 27.0,
    unidad: '%',
    periodo: '2023',
    region: 'Córdoba',
    desglose: { semestre: 1 },
    fuente: 'EPH-INDEC / datos.gob.ar',
  },
  // Valores 0 en 2013-2015 = datos no disponibles (INDEC intervenido) — deben ignorarse
  {
    id: 'pob-hogares-2015s1',
    indicador_nombre: 'Pobreza hogares',
    categoria: 'pobreza',
    valor: 0,
    unidad: '%',
    periodo: '2015',
    region: 'Córdoba',
    desglose: { semestre: 1 },
    fuente: 'EPH-INDEC / datos.gob.ar',
  },
  // Pobreza personas
  {
    id: 'pob-personas-2024',
    indicador_nombre: 'Pobreza personas',
    categoria: 'pobreza',
    valor: 38.9,
    unidad: '%',
    periodo: '2024',
    region: 'Córdoba',
    desglose: { semestre: 2 },
    fuente: 'EPH-INDEC / datos.gob.ar',
  },
  {
    id: 'pob-personas-2023',
    indicador_nombre: 'Pobreza personas',
    categoria: 'pobreza',
    valor: 42.1,
    unidad: '%',
    periodo: '2023',
    region: 'Córdoba',
    desglose: { semestre: 2 },
    fuente: 'EPH-INDEC / datos.gob.ar',
  },
  {
    id: 'pob-personas-2022',
    indicador_nombre: 'Pobreza personas',
    categoria: 'pobreza',
    valor: 36.5,
    unidad: '%',
    periodo: '2022',
    region: 'Córdoba',
    desglose: { semestre: 2 },
    fuente: 'EPH-INDEC / datos.gob.ar',
  },
  // Indigencia
  {
    id: 'pob-indigencia-hogares-2024',
    indicador_nombre: 'Indigencia (hogares)',
    categoria: 'pobreza',
    valor: 8.8,
    unidad: '%',
    periodo: '2024',
    region: 'Argentina urbana',
    desglose: { metodo: 'EDSA', trimestre: 'Q3 2024' },
    fuente: 'UCA-ODSA / EDSA Equidad 2024',
  },
  {
    id: 'pob-indigencia-personas-2024',
    indicador_nombre: 'Indigencia (personas)',
    categoria: 'pobreza',
    valor: 11.2,
    unidad: '%',
    periodo: '2024',
    region: 'Argentina urbana',
    desglose: { metodo: 'EDSA', trimestre: 'Q3 2024' },
    fuente: 'UCA-ODSA / EDSA Equidad 2024',
  },
  // Inseguridad alimentaria — NNyA (indicadores de infancia directos)
  {
    id: 'pob-insal-nnya-2025',
    indicador_nombre: 'Inseguridad alimentaria total (NNyA)',
    categoria: 'pobreza',
    valor: 28.8,
    unidad: '%',
    periodo: '2025',
    region: 'Argentina urbana',
    desglose: { dimension: 'alimentacion', poblacion: 'NNyA 0-17' },
    fuente: 'UCA-ODSA / Barómetro Deuda Social Infancia 2025',
  },
  {
    id: 'pob-insal-nnya-2024',
    indicador_nombre: 'Inseguridad alimentaria total (NNyA)',
    categoria: 'pobreza',
    valor: 35.5,
    unidad: '%',
    periodo: '2024',
    region: 'Argentina urbana',
    desglose: { dimension: 'alimentacion', poblacion: 'NNyA 0-17' },
    fuente: 'UCA-ODSA / Barómetro Deuda Social Infancia 2025',
  },
  {
    id: 'pob-insal-severa-nnya-2025',
    indicador_nombre: 'Inseguridad alimentaria severa (NNyA)',
    categoria: 'pobreza',
    valor: 13.2,
    unidad: '%',
    periodo: '2025',
    region: 'Argentina urbana',
    desglose: { severa: true, dimension: 'alimentacion', poblacion: 'NNyA 0-17' },
    fuente: 'UCA-ODSA / Barómetro Deuda Social Infancia 2025',
  },
  {
    id: 'pob-insal-nse-muy-bajo-2025',
    indicador_nombre: 'NNyA en nivel muy bajo - inseguridad alimentaria severa',
    categoria: 'pobreza',
    valor: 31.1,
    unidad: '%',
    periodo: '2025',
    region: 'Argentina urbana',
    desglose: { dimension: 'alimentacion', poblacion: 'NNyA 0-17', nivel_socioeconomico: 'muy bajo' },
    fuente: 'UCA-ODSA / Barómetro Deuda Social Infancia 2025',
  },
  // Empleo
  {
    id: 'pob-empleo-informal-2025',
    indicador_nombre: 'Empleo no registrado (informal)',
    categoria: 'pobreza',
    valor: 54.5,
    unidad: '%',
    periodo: '2025',
    region: 'Argentina urbana',
    desglose: { nota: 'trabajadores sin aportes ni beneficios', dimension: 'empleo' },
    fuente: 'UCA-ODSA / Trabajo 2010-2025',
  },
  {
    id: 'pob-empleo-pleno-2025',
    indicador_nombre: 'Empleo pleno de derechos (18+)',
    categoria: 'pobreza',
    valor: 38.8,
    unidad: '%',
    periodo: '2025',
    region: 'Argentina urbana',
    desglose: { dimension: 'empleo', poblacion: '18+' },
    fuente: 'UCA-ODSA / Trabajo 2010-2025',
  },
  // Conectividad NNyA
  {
    id: 'pob-sin-internet-nnya-2025',
    indicador_nombre: 'NNyA sin internet en el hogar',
    categoria: 'pobreza',
    valor: 15.8,
    unidad: '%',
    periodo: '2025',
    region: 'Argentina urbana',
    desglose: { dimension: 'informacion', poblacion: 'NNyA 0-17' },
    fuente: 'UCA-ODSA / Barómetro Deuda Social Infancia 2025',
  },
];

// ─── APRENDER ─────────────────────────────────────────────────────────────────
// Nota: "region" codifica quintil + sector (Q1-Estatal, Q5-Privado, etc.)

export const mockAprender: IndicadorRow[] = [
  // Nivel Lengua - Por debajo del básico
  { id: 'apr-leng-baj-q1e', indicador_nombre: 'Nivel Lengua - Por debajo del básico', categoria: 'aprender', valor: 23.7, unidad: '%', periodo: '2024', region: 'Q1-Estatal', desglose: {}, fuente: 'Aprender 2024' },
  { id: 'apr-leng-baj-q2e', indicador_nombre: 'Nivel Lengua - Por debajo del básico', categoria: 'aprender', valor: 19.8, unidad: '%', periodo: '2024', region: 'Q2-Estatal', desglose: {}, fuente: 'Aprender 2024' },
  { id: 'apr-leng-baj-q3e', indicador_nombre: 'Nivel Lengua - Por debajo del básico', categoria: 'aprender', valor: 16.4, unidad: '%', periodo: '2024', region: 'Q3-Estatal', desglose: {}, fuente: 'Aprender 2024' },
  { id: 'apr-leng-baj-q4e', indicador_nombre: 'Nivel Lengua - Por debajo del básico', categoria: 'aprender', valor: 13.5, unidad: '%', periodo: '2024', region: 'Q4-Estatal', desglose: {}, fuente: 'Aprender 2024' },
  { id: 'apr-leng-baj-q5e', indicador_nombre: 'Nivel Lengua - Por debajo del básico', categoria: 'aprender', valor: 9.7,  unidad: '%', periodo: '2024', region: 'Q5-Estatal', desglose: {}, fuente: 'Aprender 2024' },
  { id: 'apr-leng-baj-q1p', indicador_nombre: 'Nivel Lengua - Por debajo del básico', categoria: 'aprender', valor: 27.6, unidad: '%', periodo: '2024', region: 'Q1-Privado', desglose: {}, fuente: 'Aprender 2024' },
  { id: 'apr-leng-baj-q5p', indicador_nombre: 'Nivel Lengua - Por debajo del básico', categoria: 'aprender', valor: 9.6,  unidad: '%', periodo: '2024', region: 'Q5-Privado', desglose: {}, fuente: 'Aprender 2024' },

  // Nivel Lengua - Satisfactorio
  { id: 'apr-leng-sat-q1e', indicador_nombre: 'Nivel Lengua - Satisfactorio', categoria: 'aprender', valor: 39.9, unidad: '%', periodo: '2024', region: 'Q1-Estatal', desglose: {}, fuente: 'Aprender 2024' },
  { id: 'apr-leng-sat-q3e', indicador_nombre: 'Nivel Lengua - Satisfactorio', categoria: 'aprender', valor: 47.8, unidad: '%', periodo: '2024', region: 'Q3-Estatal', desglose: {}, fuente: 'Aprender 2024' },
  { id: 'apr-leng-sat-q5e', indicador_nombre: 'Nivel Lengua - Satisfactorio', categoria: 'aprender', valor: 54.3, unidad: '%', periodo: '2024', region: 'Q5-Estatal', desglose: {}, fuente: 'Aprender 2024' },
  { id: 'apr-leng-sat-q1p', indicador_nombre: 'Nivel Lengua - Satisfactorio', categoria: 'aprender', valor: 37.0, unidad: '%', periodo: '2024', region: 'Q1-Privado', desglose: {}, fuente: 'Aprender 2024' },
  { id: 'apr-leng-sat-q5p', indicador_nombre: 'Nivel Lengua - Satisfactorio', categoria: 'aprender', valor: 54.4, unidad: '%', periodo: '2024', region: 'Q5-Privado', desglose: {}, fuente: 'Aprender 2024' },

  // Nivel Lengua - Avanzado
  { id: 'apr-leng-avz-q1e', indicador_nombre: 'Nivel Lengua - Avanzado', categoria: 'aprender', valor: 1.7,  unidad: '%', periodo: '2024', region: 'Q1-Estatal', desglose: {}, fuente: 'Aprender 2024' },
  { id: 'apr-leng-avz-q5e', indicador_nombre: 'Nivel Lengua - Avanzado', categoria: 'aprender', valor: 9.1,  unidad: '%', periodo: '2024', region: 'Q5-Estatal', desglose: {}, fuente: 'Aprender 2024' },
  { id: 'apr-leng-avz-q1p', indicador_nombre: 'Nivel Lengua - Avanzado', categoria: 'aprender', valor: 1.2,  unidad: '%', periodo: '2024', region: 'Q1-Privado', desglose: {}, fuente: 'Aprender 2024' },
  { id: 'apr-leng-avz-q5p', indicador_nombre: 'Nivel Lengua - Avanzado', categoria: 'aprender', valor: 11.2, unidad: '%', periodo: '2024', region: 'Q5-Privado', desglose: {}, fuente: 'Aprender 2024' },

  // Nivel Lengua - Básico
  { id: 'apr-leng-bas-q1e', indicador_nombre: 'Nivel Lengua - Básico', categoria: 'aprender', valor: 34.8, unidad: '%', periodo: '2024', region: 'Q1-Estatal', desglose: {}, fuente: 'Aprender 2024' },
  { id: 'apr-leng-bas-q5e', indicador_nombre: 'Nivel Lengua - Básico', categoria: 'aprender', valor: 26.9, unidad: '%', periodo: '2024', region: 'Q5-Estatal', desglose: {}, fuente: 'Aprender 2024' },
  { id: 'apr-leng-bas-q1p', indicador_nombre: 'Nivel Lengua - Básico', categoria: 'aprender', valor: 34.2, unidad: '%', periodo: '2024', region: 'Q1-Privado', desglose: {}, fuente: 'Aprender 2024' },
  { id: 'apr-leng-bas-q5p', indicador_nombre: 'Nivel Lengua - Básico', categoria: 'aprender', valor: 24.8, unidad: '%', periodo: '2024', region: 'Q5-Privado', desglose: {}, fuente: 'Aprender 2024' },
];

// ─── EDUCACIÓN ────────────────────────────────────────────────────────────────

export const mockEducacion: IndicadorRow[] = [
  // Matrícula total por departamento (2024)
  { id: 'edu-mat-capital', indicador_nombre: 'Matrícula - General', categoria: 'educacion', valor: 136544, unidad: 'hab', periodo: '2024', region: 'Capital', desglose: { hoja: 'Sheet1', fuente: 'Operativo Aprender', sector: 'total', archivo: 'Educacion Provincia.xlsx', nivel_educativo: 'General' }, fuente: 'etl' },
  { id: 'edu-mat-colon',   indicador_nombre: 'Matrícula - General', categoria: 'educacion', valor: 28291,  unidad: 'hab', periodo: '2024', region: 'Colón',   desglose: { hoja: 'Sheet1', fuente: 'Operativo Aprender', sector: 'total', archivo: 'Educacion Provincia.xlsx', nivel_educativo: 'General' }, fuente: 'etl' },
  { id: 'edu-mat-calam',   indicador_nombre: 'Matrícula - General', categoria: 'educacion', valor: 7211,   unidad: 'hab', periodo: '2024', region: 'Calamuchita', desglose: { hoja: 'Sheet1', fuente: 'Operativo Aprender', sector: 'total', archivo: 'Educacion Provincia.xlsx', nivel_educativo: 'General' }, fuente: 'etl' },

  // Matrícula estatal vs privada (Capital)
  { id: 'edu-mat-est-cap', indicador_nombre: 'Matrícula sector estatal - General', categoria: 'educacion', valor: 86906, unidad: 'hab', periodo: '2024', region: 'Capital', desglose: { sector: 'estatal', nivel_educativo: 'General' }, fuente: 'etl' },
  { id: 'edu-mat-prv-cap', indicador_nombre: 'Matrícula sector privado - General', categoria: 'educacion', valor: 49638, unidad: 'hab', periodo: '2024', region: 'Capital', desglose: { sector: 'privado', nivel_educativo: 'General' }, fuente: 'etl' },

  // Escolarización por edad (Censo 2022)
  { id: 'edu-escol-9-asiste',         indicador_nombre: 'Escolarización por edad', categoria: 'educacion', valor: 55500, unidad: 'hab', periodo: '2022', region: 'Córdoba', desglose: { edad: 9, metrica: 'asiste',           descripcion: 'Población que asiste', fuente: 'Censo Nacional 2022' }, fuente: 'manual' },
  { id: 'edu-escol-9-no-asistio',     indicador_nombre: 'Escolarización por edad', categoria: 'educacion', valor: 771,   unidad: 'hab', periodo: '2022', region: 'Córdoba', desglose: { edad: 9, metrica: 'no_asiste_asistio', descripcion: 'No asiste pero asistió', fuente: 'Censo Nacional 2022' }, fuente: 'manual' },
  { id: 'edu-escol-9-nunca',          indicador_nombre: 'Escolarización por edad', categoria: 'educacion', valor: 281,   unidad: 'hab', periodo: '2022', region: 'Córdoba', desglose: { edad: 9, metrica: 'nunca_asistio',     descripcion: 'Nunca asistió',        fuente: 'Censo Nacional 2022' }, fuente: 'manual' },
  { id: 'edu-escol-10-asiste',        indicador_nombre: 'Escolarización por edad', categoria: 'educacion', valor: 55081, unidad: 'hab', periodo: '2022', region: 'Córdoba', desglose: { edad: 10, metrica: 'asiste',          descripcion: 'Población que asiste', fuente: 'Censo Nacional 2022' }, fuente: 'manual' },
  { id: 'edu-escol-10-no-asistio',    indicador_nombre: 'Escolarización por edad', categoria: 'educacion', valor: 759,   unidad: 'hab', periodo: '2022', region: 'Córdoba', desglose: { edad: 10, metrica: 'no_asiste_asistio', descripcion: 'No asiste pero asistió', fuente: 'Censo Nacional 2022' }, fuente: 'manual' },
  { id: 'edu-escol-10-nunca',         indicador_nombre: 'Escolarización por edad', categoria: 'educacion', valor: 247,   unidad: 'hab', periodo: '2022', region: 'Córdoba', desglose: { edad: 10, metrica: 'nunca_asistio',    descripcion: 'Nunca asistió',        fuente: 'Censo Nacional 2022' }, fuente: 'manual' },
];

// ─── DEIS — ESTADÍSTICAS VITALES ─────────────────────────────────────────────

export const mockDeis: IndicadorRow[] = [
  { id: 'deis-nv-cba-2022', indicador_nombre: 'Nacidos vivos registrados', categoria: 'deis', valor: 41588, unidad: 'hab', periodo: '2022', region: 'Cordoba',    desglose: {}, fuente: 'DEIS' },
  { id: 'deis-nv-arg-2022', indicador_nombre: 'Nacidos vivos registrados', categoria: 'deis', valor: 495295, unidad: 'hab', periodo: '2022', region: 'Argentina', desglose: {}, fuente: 'DEIS' },
  { id: 'deis-nv-cba-2021', indicador_nombre: 'Nacidos vivos registrados', categoria: 'deis', valor: 44159, unidad: 'hab', periodo: '2021', region: 'Cordoba',    desglose: {}, fuente: 'DEIS' },
  { id: 'deis-nv-arg-2021', indicador_nombre: 'Nacidos vivos registrados', categoria: 'deis', valor: 529794, unidad: 'hab', periodo: '2021', region: 'Argentina', desglose: {}, fuente: 'DEIS' },
  { id: 'deis-nv-cba-2020', indicador_nombre: 'Nacidos vivos registrados', categoria: 'deis', valor: 44348, unidad: 'hab', periodo: '2020', region: 'Cordoba',    desglose: {}, fuente: 'DEIS' },
  { id: 'deis-nv-arg-2020', indicador_nombre: 'Nacidos vivos registrados', categoria: 'deis', valor: 533299, unidad: 'hab', periodo: '2020', region: 'Argentina', desglose: {}, fuente: 'DEIS' },
  // Tendencia más larga para tests de límite de 3 períodos
  { id: 'deis-nv-cba-2019', indicador_nombre: 'Nacidos vivos registrados', categoria: 'deis', valor: 50929, unidad: 'hab', periodo: '2019', region: 'Cordoba',    desglose: {}, fuente: 'DEIS' },
  { id: 'deis-nv-cba-2018', indicador_nombre: 'Nacidos vivos registrados', categoria: 'deis', valor: 53569, unidad: 'hab', periodo: '2018', region: 'Cordoba',    desglose: {}, fuente: 'DEIS' },
];

// ─── SALUD ADOLESCENTE ────────────────────────────────────────────────────────

export const mockSaludAdolescente: IndicadorRow[] = [
  {
    id: 'sadol-emb-2022',
    indicador_nombre: 'Embarazo adolescente (10-19 años)',
    categoria: 'salud_adolescente',
    valor: 42.3,
    unidad: '‰',
    periodo: '2022',
    region: 'Córdoba',
    desglose: { grupo_etario: '10-19', metrica: 'tasa_por_1000_mujeres' },
    fuente: 'DEIS',
  },
  {
    id: 'sadol-emb-2021',
    indicador_nombre: 'Embarazo adolescente (10-19 años)',
    categoria: 'salud_adolescente',
    valor: 44.1,
    unidad: '‰',
    periodo: '2021',
    region: 'Córdoba',
    desglose: { grupo_etario: '10-19', metrica: 'tasa_por_1000_mujeres' },
    fuente: 'DEIS',
  },
  {
    id: 'sadol-emb-2020',
    indicador_nombre: 'Embarazo adolescente (10-19 años)',
    categoria: 'salud_adolescente',
    valor: 46.8,
    unidad: '‰',
    periodo: '2020',
    region: 'Córdoba',
    desglose: { grupo_etario: '10-19', metrica: 'tasa_por_1000_mujeres' },
    fuente: 'DEIS',
  },
];

// ─── SEGURIDAD ────────────────────────────────────────────────────────────────

export const mockSeguridad: IndicadorRow[] = [
  {
    id: 'seg-hom-2023',
    indicador_nombre: 'Tasa de homicidio doloso',
    categoria: 'seguridad',
    valor: 5.8,
    unidad: 'por 100.000 hab',
    periodo: '2023',
    region: 'Córdoba',
    desglose: { tipo: 'homicidio_doloso' },
    fuente: 'Ministerio de Seguridad',
  },
  {
    id: 'seg-hom-2022',
    indicador_nombre: 'Tasa de homicidio doloso',
    categoria: 'seguridad',
    valor: 5.2,
    unidad: 'por 100.000 hab',
    periodo: '2022',
    region: 'Córdoba',
    desglose: { tipo: 'homicidio_doloso' },
    fuente: 'Ministerio de Seguridad',
  },
  {
    id: 'seg-hom-2021',
    indicador_nombre: 'Tasa de homicidio doloso',
    categoria: 'seguridad',
    valor: 4.9,
    unidad: 'por 100.000 hab',
    periodo: '2021',
    region: 'Córdoba',
    desglose: { tipo: 'homicidio_doloso' },
    fuente: 'Ministerio de Seguridad',
  },
];

// ─── COMPOSITE EXPORTS ────────────────────────────────────────────────────────

/** Todos los mocks combinados — útil para tests de "todas las categorías" */
export const allMockIndicadores: IndicadorRow[] = [
  ...mockSalud,
  ...mockPobreza,
  ...mockAprender,
  ...mockEducacion,
  ...mockDeis,
  ...mockSaludAdolescente,
  ...mockSeguridad,
];

/** Subset mínimo para tests de validación básica */
export const mockMinimal: IndicadorRow[] = [
  mockSalud[0],    // TMI Cba 2022
  mockPobreza[0],  // Pobreza hogares 2024 S2
];

/**
 * Helper: filtra mockIndicadores por categoría.
 * Equivalente a lo que hace fetchIndicators() con la DB real.
 */
export function filterByCategories(
  indicators: IndicadorRow[],
  categories: string[],
): IndicadorRow[] {
  if (categories.length === 0) return indicators;
  return indicators.filter((r) => categories.includes(r.categoria));
}
