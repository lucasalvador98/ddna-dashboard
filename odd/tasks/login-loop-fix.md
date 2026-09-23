# Feature: login-loop-fix

## Objective

Eliminate the recurring login loop on the VPS deployment (401 "No autenticado"
on every admin API call for a logged-in user) and the authenticated 500 on
`/rest/v1/formularios`.

## Problem (two independent root causes, both confirmed)

### Bug A — session cookie thrash (login loop)

Server-side Supabase clients in route handlers and server actions have a **no-op
`setAll`**: `src/lib/auth-guard.ts:38`, `src/lib/actions/assert-admin.ts:21`,
`src/lib/actions/admin-stats.ts:19` (only `src/lib/auth-proxy.ts:104` persists,
via response cookies).

Consequence (confirmed by gotrue logs): when an admin API call triggers a token
refresh (expired access token), the server refreshes and ROTATES the refresh
token via GoTrue (`token_refreshed` + `token_revoked` in rapid bursts,
`user_agent: "node"`), but the new cookies are discarded. The browser keeps the
stale refresh token, which GoTrue keeps revoking on reuse → every later call
401s. Meanwhile `src/components/auth-provider.tsx:62-74` keeps the previous
session on SIGNED_OUT (masks the failure) and `src/components/login-gate.tsx:142-149`
shows "Sin acceso" instead of redirecting to /login. Net: a logged-in user is
stuck 401-looping.

### Bug B — infinite RLS policy recursion (formularios 500)

The `user_roles` policies (created from the Supabase Studio dashboard, NOT from
repo migrations) are self-referential:

```
CREATE POLICY "Escritura admin user_roles" ON user_roles FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id
         WHERE ur.user_id = auth.uid() AND r.name = 'admin'));
```

A policy on `user_roles` that SELECTs `user_roles` recurses. Confirmed by
executing the exact authenticated query shape: the database itself returns
`infinite recursion detected in policy for relation "user_roles"`. The
`formularios` "Admin formularios" policy (and `roles` "Escritura admin roles")
subquery `user_roles` when evaluated for `authenticated`, which triggers the
recursion → PostgreSQL error → PostgREST 500. Anonymous reads work because the
anon policy ("activo = true") does not touch `user_roles`.

## Scope

- Bug A: `src/lib/auth-guard.ts`, `src/lib/actions/assert-admin.ts`,
  `src/lib/actions/admin-stats.ts` — persist rotated cookies via
  `cookieStore.set` in `setAll` (the canonical @supabase/ssr pattern).
- Bug B: a new migration `supabase/migrations/<ts>_fix_rbac_policy_recursion.sql`
  that (1) creates `public.is_admin()` SECURITY DEFINER (RLS bypass, checks
  `user_roles` for the calling user), (2) rewrites the self-referential policies
  on `user_roles` and `roles` to use `is_admin()`, (3) rewrites the
  `formularios`/`respuestas_formulario` admin policies to `is_admin()` for
  robustness. Must be applied to the self-hosted production DB and committed to
  the repo (the RBAC policies currently live only in the database).

Out of scope (flagged, not fixed here):
- LoginGate "Sin acceso" dead-end → optional follow-up (redirect to /login).
- AuthProvider keep-prev-session-on-SIGNED_OUT → optional follow-up.
- Legacy `auth.jwt() ->> 'role' = 'admin'` write policies in
  20260414000000_initial_schema.sql (never allowed authenticated; masked because
  admin writes use the service key).

## Acceptance criteria

1. Logged-in admin can call `/api/auth/users/<id>/role` and admin endpoints
   repeatedly without 401 between refreshes; the browser cookie advances after
   each server-side refresh.
2. `HEAD/GET /rest/v1/formularios?select=*&activo=eq.true` with a valid
   authenticated JWT returns 200 (not 500).
3. `npx tsc --noEmit` passes; existing tests pass.
4. The migration is captured in the repo and, on the self-hosted DB, the
   self-referential policies are gone (verified by pg_policy query).

## Tasks

- [x] L1 — Diagnose (DONE 2026-09-23): reproduced 401 loop, 500, and the exact
      `infinite recursion detected in policy for relation "user_roles"` error.
- [x] L2 — Fix Bug A (DONE 2026-09-23): cookie persistence in setAll in
      `src/lib/auth-guard.ts`, `src/lib/actions/assert-admin.ts`,
      `src/lib/actions/admin-stats.ts` (canonical @supabase/ssr pattern).
      Verified: `npx tsc --noEmit` exit 0; vitest 437 passed / 1 pre-existing
      Dockerfile failure (tests/docker-infrastructure.test.ts, unrelated).
- [x] L3 — Fix Bug B (DONE 2026-09-23): applied migration
      `fix_rbac_policy_recursion` to self-hosted production (tracked in
      supabase_migrations) creating `public.is_admin()` SECURITY DEFINER and
      rewriting 6 self-referential policies to use it. Repo copy:
      `supabase/migrations/20260923140000_fix_rbac_policy_recursion.sql`.
      Verified live: the previously-failing authenticated simulation now
      returns 3 active forms; pg_policy shows `is_admin()` in all 6 admin
      policies. No PostgREST reload needed (policies evaluated live).
- [ ] L4 — Deploy to the VPS (L2 is code-level; production still runs the old
      build) then re-test login in the browser: after ~1h of session use there
      must be no 401 loop, and the authenticated formularios request must be
      200. Bug B (formularios 500) is already fixed at the DB level and live.