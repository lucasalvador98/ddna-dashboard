-- ============================================================
-- DDNA Dashboard — Vista de frescura v2: umbral por categoría
-- Creado: 2026-09-09
--
-- La tabla indicadores ya no tiene frecuencia_actualizacion (fue
-- eliminada del esquema), así que la cadencia esperada de cada
-- categoría se declara acá como umbral en días. Es la decisión de
-- producto que evita que fuentes anuales (censo, DEIS, Aprender)
-- aparezcan "stale" todo el año.
--
-- Criterio (ajustable acá, un solo lugar):
--   mensual-ish  -> 45 días   (canastas, senaf)
--   trimestral   -> 120 días  (empleo, EPH)
--   semestral    -> 210 días  (pobreza, EPH semestral)
--   anual        -> 400 días  (salud/deis/educacion/aprender/seguridad/inversion)
--   ad hoc       -> NULL      (demografia/censo, encuestas_2024: no vence)
--
-- Para volver al umbral plano de 45 días: poner ELSE 45 y borrar el
-- CASE (o revertir esta migración con la v1).
-- ============================================================

CREATE OR REPLACE VIEW public.vw_category_freshness
WITH (security_invoker = true) AS
SELECT
  i.categoria,
  max(i.ultima_actualizacion) AS ultima_actualizacion,
  CASE i.categoria
    WHEN 'canastas'          THEN 45
    WHEN 'senaf'             THEN 45
    WHEN 'empleo'            THEN 120
    WHEN 'pobreza'           THEN 210
    WHEN 'salud'             THEN 400
    WHEN 'deis'              THEN 400
    WHEN 'salud_adolescente' THEN 400
    WHEN 'educacion'         THEN 400
    WHEN 'anuario_educacion' THEN 400
    WHEN 'aprender'          THEN 400
    WHEN 'seguridad'         THEN 400
    WHEN 'inversion'         THEN 400
    WHEN 'consumo'           THEN 90
    WHEN 'demografia'        THEN NULL  -- censo: carga ad hoc, no vence
    WHEN 'encuestas_2024'    THEN NULL  -- encuesta puntual, no vence
    ELSE 45
  END AS umbral_dias
FROM public.indicadores i
GROUP BY i.categoria;

-- La v1 ya otorgó SELECT a anon/authenticated; CREATE OR REPLACE
-- conserva los grants. Por las dudas, re-idempotente:
GRANT SELECT ON TABLE public.vw_category_freshness TO anon, authenticated;

-- ============================================================
-- Rollback: volver a la v1 (sin umbral) con el SQL de
-- 20260908195500_category_freshness_view.sql.
-- ============================================================
