# Feature: auth-refactor (security + session rewrite)

## Objective

Eliminate the recurring login defects the user experiences (infinite loading on
login, stale header after sign-out) AND close the open `/api` write surface,
using the completed auth audit as the map.

## Why now

The user reports two persistent symptoms and wants a clean refactor rather than
one-off patches. A read-only audit pinned both to deterministic root causes.

## Root causes (from audit, file:line)

- **Symptom A — login hangs, refresh "fixes" it:**
  - `src/app/login/page.tsx:24` sets `loading=true` and NEVER resets it on success
    (only `router.push` at L49 exits). A stalled/bounced navigation = infinite
    button spinner; a refresh unmounts and clears it.
  - `src/components/login-gate.tsx:124-128,157` role/roles `fetch()` have no
    AbortController/timeout. If the server chain (checkAdminAuth → getUser →
    GoTrue cold-start) never settles, `permsLoaded` stays false = eternal spinner.
  - `src/components/login-gate.tsx:82-86` config fetch via anon client on an
    admin table, no timeout, with retries that can leave `configLoading` true.
- **Symptom B — stale header after sign-out:**
  - `src/components/auth-provider.tsx:68-84` the `SIGNED_OUT` branch keeps the
    previous `session`/`user` (`return prev`). `signOut()` only fires that same
    event, so nothing ever nulls the session; header keeps the email. No
    `router.refresh()`/redirect on sign-out.

## Additional confirmed findings to fix

- **D2 (functional):** `src/app/api/auth/users/[id]/role/route.ts` gates on
  `checkAdminAuth()` (admin-only), so any editor/visor gets 403 → "Sin acceso"
  on every gated page. A user's own role must be readable by any authenticated
  user.
- **D6 (security, urgent):** the proxy skips `/api/*`; `/api/upload` has no guard
  and writes with service_role; `/api/repositorio/chat` is only rate-limited and
  exposes OpenAI spend + KB search + web tools. Reachable by anon.
- **D8 (bypass window):** LoginGate resets `configLoading` in `finally` even with
  a retry pending → `children` render unprotected briefly.

## Scope

**Wave 1 — Security (urgent, independent)**
- W1: Guard `/api/upload` and `/api/repositorio/chat` (and `/api/auth/config`)
  with `checkAdminAuth()`. No logic change beyond the guard.

**Wave 2 — Session refactor**
- W2: `auth-provider.tsx` — clear `session`/`user` on real `SIGNED_OUT`;
  `signOut()` does `router.replace('/login')` + error feedback. (kills B)
- W3: `login/page.tsx` — reset `loading` on success + `router.refresh()`. (kills button spinner)
- W4: `login-gate.tsx` — AbortController/timeout on config/role/roles fetches
  with explicit fallback; no flag left hanging. (kills infinite spinner)
- W5: role endpoint readable by any authenticated user (or `user_roles` via RLS
  by `auth.uid()`); move the role gate server-side. (unblocks non-admins)
- W6: single auth-config source resolved in the proxy, passed to client;
  remove the client fetch of the admin `settings` table (removes jank + D8 bypass).
  (largest/most invasive; may be split or deferred with a note)

Out of scope: Google/OAuth login (parked until the app has a domain + HTTPS);
RBAC base tables into migrations (W7, nice-to-have, separate); mobile sign-out;
httpOnly cookie rework (informational).

## Constraints

- Use the existing `checkAdminAuth()` (already fixed for cookie persistence).
- Do NOT expose `INTERNAL_API_SECRET` to the browser.
- Keep the existing success shapes and upload/processing logic.
- Strict TDD where tests exist (LoginGate has tests). `npx tsc --noEmit` + `npm run test:run` must stay green (one known pre-existing Dockerfile test failure is tolerated).
- A second git session may be operating this repo: commit only our paths, rebase not force.

## Acceptance criteria

1. Signed-out header clears immediately (no stale email, no refresh needed).
2. Sign-out redirects to /login with no stuck spinner.
3. Login success never leaves an infinite spinner (loading resets on every path).
4. LoginGate never shows an eternal spinner: every fetch has a timeout/fallback.
5. An `editor`/`visor` user can open gated pages (own role returns 200).
6. `/api/upload`, `/api/repositorio/chat`, `/api/auth/config` reject anon/non-admin (401/403).
7. `tsc` exit 0; tests green (except the tolerated pre-existing Docker test).

## Tasks

- [x] W1 — Security: guard the open `/api` write/read routes. DONE `aa23263` — /api/upload, /api/repositorio/chat, /api/auth/config -> 401 anon (verified live).
- [x] W2 — AuthProvider: real SIGNED_OUT clears state; signOut redirects. DONE `b83e3e0` (Symptom B root fix)
- [x] W3 — login/page.tsx: reset loading on success + router.refresh(). DONE `d3e3371` (Symptom A button)
- [x] W4 — LoginGate: timeouts/AbortController + no hanging flags. DONE `d3e3371` (Symptom A spinner; D8 mitigated)
- [x] W5 — Role endpoint readable by any authenticated user; server-side role gate. DONE `05f2135` (D2; tests 6/6)
- [ ] W6 — Single auth-config source in proxy; remove client admin-table fetch. DEFERRED (most invasive; D8 already mitigated; needs a dedicated session).
- [ ] W7 (optional) — Move RBAC base tables into migrations for auditability.

## Evidence

W1-W5 committed, pushed to origin/main, deployed to VPS (HEAD `05f2135`), verified live: tsc 0; LoginGate 6/6; D6 routes 401 anon; W5 authz matrix correct. PENDING USER BROWSER VERIFICATION: login no-spinner + signout clears header/redirects. Second git session active during the refactor (rebased, never force-pushed).
