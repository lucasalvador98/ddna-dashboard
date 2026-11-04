-- ============================================================
-- DDNA Dashboard — Ranked full-text search for doc_chunks
-- Creado: 2026-11-04
-- ============================================================
--
-- Why this exists
-- ---------------
-- The chat route built its full-text leg with PostgREST:
--
--   .textSearch('search_vector', keywords.join(' OR '), { config: 'spanish', type: 'websearch' })
--   .limit(20)
--
-- with no ORDER BY. PostgREST cannot order by ts_rank, so Postgres returned 20
-- arbitrary matches and the largest document crowded out the right one.
-- Measured on 2026-11-04 against the real corpus (10,007 chunks): for a
-- question about social investment in childhood, 19 of the 20 returned chunks
-- came from the biggest spreadsheet (3,276 chunks) because it contains the
-- generic terms "para", "sobre" and "2024". The expected report (735 chunks)
-- never appeared. The goldenset scored 0/5 on documents.
--
-- Ordering has to happen in SQL, so it lives in a function.
--
-- This migration is additive: it creates one read-only function and one index.
-- It changes no data and no existing object.

CREATE OR REPLACE FUNCTION search_doc_chunks_text(
  query_text TEXT,
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
  relevance REAL
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  -- COALESCE: websearch_to_tsquery does not accept NULL input.
  ts_query tsquery := websearch_to_tsquery('spanish', COALESCE(query_text, ''));
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
    ts_rank(dc.search_vector, ts_query) AS relevance
  FROM doc_chunks dc
  JOIN repositorio r ON dc.repo_file_id = r.id
  WHERE dc.search_vector @@ ts_query
    AND r.processed = TRUE
    AND (category_filter IS NULL OR r.categoria = category_filter)
  -- dc.id breaks ties so repeated runs return the same rows.
  ORDER BY ts_rank(dc.search_vector, ts_query) DESC, dc.id
  LIMIT match_count;
END;
$$;

-- ts_rank still needs the match to be found first; without a GIN index the
-- WHERE clause is a sequential scan over every chunk.
CREATE INDEX IF NOT EXISTS idx_doc_chunks_search_vector
  ON doc_chunks USING GIN (search_vector);

COMMENT ON FUNCTION search_doc_chunks_text(TEXT, INT, TEXT) IS
  'Ranked full-text search over doc_chunks. Replaces the unranked PostgREST textSearch that returned arbitrary rows.';
