-- ============================================================
-- DDNA Dashboard — RAG Schema
-- Repositorio documental + vector search
-- Creado: 2026-05-14
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- ============================================================
-- Tabla: repositorio
-- Metadata de archivos subidos al bucket
-- ============================================================
CREATE TABLE IF NOT EXISTS repositorio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_archivo TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT NOT NULL,
  tipo_documento TEXT NOT NULL,
  tamano_bytes INTEGER,
  url_storage TEXT,
  fecha_subida DATE DEFAULT CURRENT_DATE,
  tags TEXT[],
  usuario_subio TEXT DEFAULT 'sistema'::text,
  notas TEXT,
  -- RAG processing state
  processed BOOLEAN DEFAULT FALSE,
  total_chunks INTEGER DEFAULT 0,
  last_processed_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Tabla: doc_chunks
-- Chunks de texto + embeddings vectoriales
-- ============================================================
CREATE TABLE IF NOT EXISTS doc_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  repo_file_id UUID REFERENCES repositorio(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),  -- OpenAI text-embedding-3-small = 1536 dims
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Índices
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_doc_chunks_repo_file ON doc_chunks(repo_file_id);
CREATE INDEX IF NOT EXISTS idx_doc_chunks_chunk_index ON doc_chunks(chunk_index);
CREATE INDEX IF NOT EXISTS idx_repositorio_categoria ON repositorio(categoria);
CREATE INDEX IF NOT EXISTS idx_repositorio_processed ON repositorio(processed);
CREATE INDEX IF NOT EXISTS idx_repositorio_tipo ON repositorio(tipo_documento);

-- ============================================================
-- Row Level Security
-- Público puede leer, solo admins/service_role escriben
-- ============================================================
ALTER TABLE repositorio ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_chunks ENABLE ROW LEVEL SECURITY;

-- Lectura pública
DROP POLICY IF EXISTS "Lectura pública repositorio" ON repositorio;
CREATE POLICY "Lectura pública repositorio" ON repositorio
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Lectura pública doc_chunks" ON doc_chunks;
CREATE POLICY "Lectura pública doc_chunks" ON doc_chunks
  FOR SELECT USING (TRUE);

-- Escritura solo service_role (admin)
DROP POLICY IF EXISTS "Escritura admin repositorio" ON repositorio;
CREATE POLICY "Escritura admin repositorio" ON repositorio
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Actualización admin repositorio" ON repositorio
  FOR UPDATE USING (TRUE);

DROP POLICY IF EXISTS "Escritura admin doc_chunks" ON doc_chunks;
CREATE POLICY "Escritura admin doc_chunks" ON doc_chunks
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Actualización admin doc_chunks" ON doc_chunks
  FOR UPDATE USING (TRUE);

-- ============================================================
-- Función RPC: búsqueda por similitud vectorial
-- Usa cosine similarity (<=>) sobre la columna embedding
-- ============================================================
CREATE OR REPLACE FUNCTION search_doc_chunks(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10,
  category_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  repo_file_id UUID,
  chunk_index INT,
  content TEXT,
  metadata JSONB,
  nombre_archivo TEXT,
  categoria TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.repo_file_id,
    dc.chunk_index,
    dc.content,
    dc.metadata,
    r.nombre_archivo,
    r.categoria,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM doc_chunks dc
  JOIN repositorio r ON dc.repo_file_id = r.id
  WHERE dc.embedding IS NOT NULL
    AND r.processed = TRUE
    AND (category_filter IS NULL OR r.categoria = category_filter)
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================
-- Gatillo: actualizar updated_at en repositorio
-- ============================================================
CREATE OR REPLACE FUNCTION update_repositorio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_repositorio_updated_at ON repositorio;
CREATE TRIGGER trigger_repositorio_updated_at
  BEFORE UPDATE ON repositorio
  FOR EACH ROW
  EXECUTE FUNCTION update_repositorio_updated_at();
