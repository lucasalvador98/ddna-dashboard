-- ============================================================
-- DDNA Dashboard — Formularios Schema
-- Módulo de formularios tipo Google Forms
-- Creado: 2026-08-11
-- ============================================================

-- ============================================================
-- Tabla: formularios
-- Definición de formularios (titulo, slug, definicion versionada JSONB)
-- ============================================================
CREATE TABLE formularios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  definicion JSONB NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Tabla: respuestas_formulario
-- Respuestas públicas anónimas
-- ============================================================
CREATE TABLE respuestas_formulario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formulario_id UUID NOT NULL REFERENCES formularios(id) ON DELETE CASCADE,
  respuestas JSONB NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para el listado de respuestas por formulario
CREATE INDEX idx_respuestas_formulario_form_id ON respuestas_formulario(formulario_id);

-- Índice para el listado admin (submitted_at desc, limit 100)
CREATE INDEX idx_respuestas_formulario_submitted ON respuestas_formulario(submitted_at DESC);

-- Trigger: actualizar updated_at en formularios (reutiliza update_updated_at())
DROP TRIGGER IF EXISTS update_formularios_updated_at ON formularios;
CREATE TRIGGER update_formularios_updated_at
  BEFORE UPDATE ON formularios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE formularios ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_formulario ENABLE ROW LEVEL SECURITY;

-- Lectura pública: solo formularios activos
CREATE POLICY "Lectura pública formularios activos"
  ON formularios FOR SELECT TO anon
  USING (activo = TRUE);

-- Admin: control total sobre formularios
-- (defensa en profundidad; los writes admin van por service_role)
CREATE POLICY "Admin formularios"
  ON formularios FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Insert público anónimo: solo si el formulario está activo
CREATE POLICY "Insert público respuestas"
  ON respuestas_formulario FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM formularios f
      WHERE f.id = formulario_id AND f.activo = TRUE
    )
  );

-- Lectura de respuestas: solo admin
CREATE POLICY "Admin respuestas"
  ON respuestas_formulario FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Borrado de respuestas: solo admin
CREATE POLICY "Admin delete respuestas"
  ON respuestas_formulario FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Actualización de respuestas: solo admin
-- (defensa en profundidad; la app no expone update)
CREATE POLICY "Admin update respuestas"
  ON respuestas_formulario FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- ============================================================
-- GRANTs: exponer tablas al Data API
-- ============================================================
GRANT SELECT ON formularios TO anon, authenticated;
GRANT INSERT ON respuestas_formulario TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON respuestas_formulario TO authenticated;

-- ============================================================
-- Rollback:
--   DROP TABLE respuestas_formulario;
--   DROP TABLE formularios;
-- ============================================================
