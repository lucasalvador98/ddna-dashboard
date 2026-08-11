-- ============================================================
-- DDNA Dashboard — Hardening: revoke default grants + re-grant mínimos
-- Creado: 2026-08-11
-- ============================================================

-- Revoke default GRANTs (defense in depth: Postgres default GRANTs
-- are too permissive for the Data API exposure model).
REVOKE ALL ON TABLE public.formularios FROM anon, authenticated;
REVOKE ALL ON TABLE public.respuestas_formulario FROM anon, authenticated;

-- Minimal GRANTs per the module's access model.
-- Public reads the active form for /f/[slug].
GRANT SELECT ON TABLE public.formularios TO anon, authenticated;

-- Anonymous visitors submit responses (RLS checks the form is active).
GRANT INSERT ON TABLE public.respuestas_formulario TO anon;

-- Admins read, update, and delete responses through the admin panel.
GRANT SELECT, UPDATE, DELETE ON TABLE public.respuestas_formulario TO authenticated;

-- ============================================================
-- Rollback:
--   The original migration (20260811140625_formularios.sql) already
--   issued these GRANTs, so rolling forward from that file reinstates
--   the same privileges. To revert hardening only:
--     GRANT INSERT ON respuestas_formulario TO authenticated;
--   This file deliberately restricts the INSERT grant for authenticated
--   (removing it for `respuestas_formulario`) because the public submit
--   API uses an ANON client.
-- ============================================================
