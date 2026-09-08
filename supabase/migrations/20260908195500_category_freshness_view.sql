-- ============================================================
-- DDNA Dashboard — Vista de frescura por categoría
-- Creado: 2026-09-08
--
-- El endpoint /api/health consultaba TODAS las filas de indicadores
-- (~22k) para calcular el max(ultima_actualizacion) por categoría,
-- pero PostgREST corta las respuestas a 1000 filas
-- (PGRST_DB_MAX_ROWS default del compose self-hosted). Con las
-- categorías de carga reciente llenando el top-1000, las categorías
-- stale quedaban fuera de la respuesta y el health las reportaba
-- como "healthy".
--
-- Esta vista devuelve UNA fila por categoría con el máximo
-- ultima_actualizacion (~15 filas), inmune al límite de PostgREST.
-- ============================================================

CREATE OR REPLACE VIEW public.vw_category_freshness
WITH (security_invoker = true) AS
SELECT
  categoria,
  max(ultima_actualizacion) AS ultima_actualizacion
FROM public.indicadores
GROUP BY categoria;

-- La app lee la vista vía Data API (RLS de indicadores: lectura pública,
-- y con security_invoker se aplican las policies del caller).
GRANT SELECT ON TABLE public.vw_category_freshness TO anon, authenticated;

-- ============================================================
-- Rollback:
--   DROP VIEW IF EXISTS public.vw_category_freshness;
-- ============================================================
