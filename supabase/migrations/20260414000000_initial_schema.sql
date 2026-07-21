-- ============================================================
-- DDNA Dashboard - Database Schema
-- Defensoría de los Derechos de Niñas, Niños y Adolescentes
-- Provincia de Córdoba
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Tabla: fuentes_datos
-- Catálogo de fuentes de datos oficiales
-- ============================================================
CREATE TABLE fuentes_datos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  organizacion TEXT NOT NULL,
  url TEXT,
  categoria TEXT NOT NULL CHECK (categoria IN ('salud', 'educacion', 'pobreza', 'seguridad', 'inversion', 'demografia')),
  frecuencia TEXT NOT NULL CHECK (frecuencia IN ('diaria', 'semanal', 'mensual', 'trimestral', 'semestral', 'anual', 'ad_hoc')),
  metodo_ingesta TEXT NOT NULL CHECK (metodo_ingesta IN ('api', 'manual', 'csv_upload')),
  ultima_actualizacion TIMESTAMPTZ,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Tabla: indicadores
-- Definición de cada indicador que se monitorea
-- ============================================================
CREATE TABLE indicadores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  categoria TEXT NOT NULL CHECK (categoria IN ('salud', 'educacion', 'pobreza', 'seguridad', 'inversion', 'demografia')),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  unidad TEXT NOT NULL,
  fuente_id UUID REFERENCES fuentes_datos(id) ON DELETE SET NULL,
  frecuencia_actualizacion TEXT NOT NULL DEFAULT 'anual',
  orden INT DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Tabla: datos_indicadores
-- Los valores de cada indicador por periodo y región
-- ============================================================
CREATE TABLE datos_indicadores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  indicador_id UUID NOT NULL REFERENCES indicadores(id) ON DELETE CASCADE,
  valor NUMERIC NOT NULL,
  periodo TEXT NOT NULL, -- e.g., "2024", "2024-Q1", "2024-01"
  region TEXT NOT NULL DEFAULT 'Córdoba',
  desglose JSONB DEFAULT '{}', -- e.g., {"sexo": "femenino", "grupo_etario": "0-5"}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Tabla: uploads
-- Registro de archivos CSV subidos (auditoría)
-- ============================================================
CREATE TABLE uploads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  filename TEXT NOT NULL,
  categoria TEXT NOT NULL,
  fuente TEXT NOT NULL,
  registros_procesados INT DEFAULT 0,
  registros_errores INT DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'procesando' CHECK (estado IN ('procesando', 'completado', 'error')),
  usuario TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================
-- Índices
-- ============================================================
CREATE INDEX idx_indicadores_categoria ON indicadores(categoria);
CREATE INDEX idx_indicadores_activo ON indicadores(activo);
CREATE INDEX idx_datos_indicador_id ON datos_indicadores(indicador_id);
CREATE INDEX idx_datos_periodo ON datos_indicadores(periodo);
CREATE INDEX idx_datos_region ON datos_indicadores(region);
CREATE INDEX idx_datos_indicador_periodo ON datos_indicadores(indicador_id, periodo);
CREATE INDEX idx_uploads_categoria ON uploads(categoria);
CREATE INDEX idx_uploads_estado ON uploads(estado);
CREATE INDEX idx_fuentes_categoria ON fuentes_datos(categoria);

-- ============================================================
-- Row Level Security (RLS)
-- Público puede leer, solo admins pueden escribir
-- ============================================================
ALTER TABLE fuentes_datos ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE datos_indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública (anon + authenticated)
CREATE POLICY "Lectura pública fuentes_datos" ON fuentes_datos FOR SELECT USING (TRUE);
CREATE POLICY "Lectura pública indicadores" ON indicadores FOR SELECT USING (TRUE);
CREATE POLICY "Lectura pública datos_indicadores" ON datos_indicadores FOR SELECT USING (TRUE);
CREATE POLICY "Lectura pública uploads" ON uploads FOR SELECT USING (TRUE);

-- Políticas de escritura (solo authenticated con rol admin)
CREATE POLICY "Escritura admin fuentes_datos" ON fuentes_datos FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Escritura admin indicadores" ON indicadores FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Escritura admin datos_indicadores" ON datos_indicadores FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Escritura admin uploads" ON uploads FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Actualización admin fuentes_datos" ON fuentes_datos FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Actualización admin indicadores" ON indicadores FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Actualización admin datos_indicadores" ON datos_indicadores FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Actualización admin uploads" ON uploads FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================
-- Función: actualización automática de updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fuentes_datos_updated_at BEFORE UPDATE ON fuentes_datos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_indicadores_updated_at BEFORE UPDATE ON indicadores FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Datos semilla: Fuentes de datos principales
-- ============================================================
INSERT INTO fuentes_datos (nombre, organizacion, url, categoria, frecuencia, metodo_ingesta, descripcion) VALUES
  ('DEIS - Dirección de Estadísticas e Información de Salud', 'Ministerio de Salud de la Nación', 'https://www.deis.msal.gov.ar', 'salud', 'anual', 'manual', 'Datos de mortalidad infantil, natalidad y salud adolescente'),
  ('Encuesta Aprender', 'Ministerio de Educación de la Nación', 'https://aprender.aulasvirtuales.educacion.gob.ar', 'educacion', 'anual', 'manual', 'Resultados de evaluaciones nacionales de aprendizaje'),
  ('INDEC - Instituto Nacional de Estadística y Censos', 'INDEC', 'https://www.indec.gob.ar', 'pobreza', 'semestral', 'api', 'Estadísticas de pobreza, indigencia y distribución del ingreso'),
  ('Censo Nacional de Población 2022', 'INDEC', 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-2-41-135', 'demografia', 'ad_hoc', 'csv_upload', 'Datos censales de población, hogares y vivienda'),
  ('Ministerio Público de la Provincia de Córdoba', 'Poder Judicial de Córdoba', 'https://www.mpcordoba.gob.ar', 'seguridad', 'anual', 'manual', 'Estadísticas de denuncias, delitos y acceso a justicia'),
  ('Dirección General de Estadística y Censos', 'Gobierno de la Provincia de Córdoba', 'https://estadistica.cba.gov.ar', 'demografia', 'anual', 'manual', 'Estadísticas provinciales de Educación, Salud y Trabajo'),
  ('Observatorio de la Deuda Social Argentina', 'Universidad Católica Argentina', 'https://www.uca.edu.ar/observatorio', 'pobreza', 'anual', 'manual', 'Barómetro social de la infancia y adolescencia'),
  ('Datos Abiertos de Argentina', 'datos.gob.ar', 'https://datos.gob.ar', 'demografia', 'diaria', 'api', 'Portal de datos abiertos con APIs series de tiempo');

-- Datos semilla: Indicadores principales
INSERT INTO indicadores (categoria, nombre, descripcion, unidad, fuente_id, frecuencia_actualizacion, orden) VALUES
  ('pobreza', 'Pobreza infantil', 'Porcentaje de niñas, niños y adolescentes bajo la línea de pobreza', '%', (SELECT id FROM fuentes_datos WHERE nombre LIKE '%INDEC%'), 'semestral', 1),
  ('salud', 'Mortalidad infantil', 'Tasa de mortalidad infantil por cada mil nacidos vivos', '‰', (SELECT id FROM fuentes_datos WHERE nombre LIKE '%DEIS%'), 'anual', 2),
  ('educacion', 'Tasa neta de escolarización', 'Porcentaje de niños y adolescentes que asisten al nivel educativo correspondiente', '%', (SELECT id FROM fuentes_datos WHERE nombre LIKE '%Aprender%'), 'anual', 3),
  ('inversion', 'Inversión social en infancia', 'Presupuesto destinado a políticas de infancia y adolescencia', 'Md', (SELECT id FROM fuentes_datos WHERE nombre LIKE '%Estadística%Córdoba%'), 'anual', 4),
  ('demografia', 'Población adolescente', 'Población de 12-17 años en la provincia de Córdoba', 'hab', (SELECT id FROM fuentes_datos WHERE nombre LIKE '%Censo%'), 'ad_hoc', 5),
  ('seguridad', 'Denuncias registradas', 'Cantidad de denuncias vinculadas a derechos de NNyA', 'casos', (SELECT id FROM fuentes_datos WHERE nombre LIKE '%Ministerio Público%'), 'anual', 6),
  ('salud', 'Cobertura vacunal', 'Porcentaje de cobertura del esquema de vacunación completo', '%', (SELECT id FROM fuentes_datos WHERE nombre LIKE '%DEIS%'), 'anual', 7),
  ('educacion', 'Abandono escolar', 'Tasa de abandono interanual en nivel secundario', '%', (SELECT id FROM fuentes_datos WHERE nombre LIKE '%Aprender%'), 'anual', 8);