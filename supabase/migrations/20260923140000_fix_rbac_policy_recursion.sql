-- ============================================================
-- fix_rbac_policy_recursion
--
-- Root cause: the RBAC policies (previously created only via the
-- Studio dashboard, never captured in this repo) were
-- self-referential. "Escritura admin user_roles" was FOR ALL with
--   USING (EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ...))
-- i.e. a policy ON user_roles that SELECTs user_roles. Any RLS
-- evaluation that touches user_roles (including the formularios and
-- respuestas_formulario admin policies, which inline the same
-- EXISTS) exploded with:
--   infinite recursion detected in policy for relation "user_roles"
-- which surfaced as PostgREST 500 on authenticated requests
-- (e.g. HEAD /rest/v1/formularios?select=*&activo=eq.true).
--
-- Fix: one SECURITY DEFINER helper (bypasses RLS while checking the
-- caller) and every admin check rewritten to use it. Also captures
-- the RBAC policies in the repo for the first time.
--
-- Applies to: self-hosted production (supabase.ddna.com.ar).
-- Applied: 2026-09-23.
-- ============================================================

-- 1) Admin-check helper -----------------------------------------------------
-- SECURITY DEFINER with a fixed search_path; it reads user_roles without
-- re-triggering RLS on that table, so policies can call it without recursion.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- 2) Rewrite the self-referential policies (same name, same command, same
--    role scope: these two applied to PUBLIC originally) -------------------
DROP POLICY IF EXISTS "Escritura admin user_roles" ON public.user_roles;
CREATE POLICY "Escritura admin user_roles" ON public.user_roles
  FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Escritura admin roles" ON public.roles;
CREATE POLICY "Escritura admin roles" ON public.roles
  FOR ALL
  USING (public.is_admin());

-- 3) Form policies: use the helper instead of inlining the user_roles EXISTS
--    (the inlined version triggered the recursion through the policy above).
DROP POLICY IF EXISTS "Admin formularios" ON public.formularios;
CREATE POLICY "Admin formularios" ON public.formularios
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin respuestas" ON public.respuestas_formulario;
CREATE POLICY "Admin respuestas" ON public.respuestas_formulario
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin delete respuestas" ON public.respuestas_formulario;
CREATE POLICY "Admin delete respuestas" ON public.respuestas_formulario
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin update respuestas" ON public.respuestas_formulario;
CREATE POLICY "Admin update respuestas" ON public.respuestas_formulario
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());