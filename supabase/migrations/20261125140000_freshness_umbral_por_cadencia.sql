-- ============================================================
-- DDNA Dashboard — Umbrales de frescura alineados a la cadencia real
-- Creado: 2026-11-25
--
-- Motivo (evidencia: odd/tasks/data-freshness-live-sources.md, E5):
-- el health quedaba en `degraded` de forma permanente por dos categorías
-- cuyo umbral no corresponde a la cadencia real de su fuente:
--
--   * senaf   tenía 45 días (mensual-ish), pero `load-senaf-data.mjs`
--             descarga snapshots FIJOS de la Wayback Machine del
--             2023-12-13 sobre datasets que terminan en 2023T3.
--             Ninguna corrida del loader puede producir datos posteriores
--             a 2023, y no existe hoy una fuente SENAF viva integrada.
--             -> NULL: la categoría no vence mientras no haya fuente.
--                Revertir a 45 en cuanto exista un loader con fuente viva.
--
--   * consumo tenía 90 días (trimestral-ish), pero sus 3 filas provienen
--             de la "Encuesta Consumo 2022", que es una encuesta de gastos
--             de cadencia quinquenal.
--             -> 1825 días (~5 años), que sí detecta un atraso real.
--
-- El resto de los umbrales no cambia: canastas 45, empleo 120,
-- pobreza 210, salud/deis/educacion/anuario/aprender/seguridad/
-- inversion/salud_adolescente 400, demografia y encuestas_2024 NULL.
--
-- LIMITACIÓN CONOCIDA (no resuelta acá): la vista mide
-- max(ultima_actualizacion), o sea CUÁNDO SE INSERTÓ la última fila, no
-- el período del dato. Como los loaders son insert-if-missing, una
-- categoría al día envejece igual hasta marcarse stale. Con umbrales
-- realistas eso deja de producir falsos rojos, pero tampoco detecta un
-- loader que se detuvo si no hay inserciones nuevas.
-- ============================================================

CREATE OR REPLACE VIEW public.vw_category_freshness
WITH (security_invoker = true) AS
SELECT
  i.categoria,
  max(i.ultima_actualizacion) AS ultima_actualizacion,
  CASE i.categoria
    WHEN 'canastas'          THEN 45
    WHEN 'senaf'             THEN NULL  -- sin fuente viva: el loader apunta a Wayback 2023-12-13
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
    WHEN 'consumo'           THEN 1825 -- Encuesta Consumo: cadencia quinquenal
    WHEN 'demografia'        THEN NULL  -- censo: carga ad hoc, no vence
    WHEN 'encuestas_2024'    THEN NULL  -- encuesta puntual, no vence
    ELSE 45
  END AS umbral_dias
FROM public.indicadores i
GROUP BY i.categoria;

-- CREATE OR REPLACE conserva los grants de la v2; re-idempotente por las dudas.
GRANT SELECT ON TABLE public.vw_category_freshness TO anon, authenticated;

-- ============================================================
-- Rollback: re-aplicar 20260909120000_category_freshness_umbral.sql
-- ============================================================
