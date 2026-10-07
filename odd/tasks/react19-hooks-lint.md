# Feature: react19-hooks-lint

> **STATUS: DONE** (2026-10-07). Branch `fix/react19-hooks-lint` from `main` at
> `14ca970`; one work-unit commit. Not merged, not pushed (user decision).
> Follow-up item (a) of `odd/tasks/dependency-security-remediation.md`.

## Objective

Make `npm run lint` exit 0: fix the 16 `react-hooks` errors introduced by
`eslint-plugin-react-hooks` 7.1.x (via `eslint-config-next@16.4.0`) plus the 7
pre-existing errors, without changing observable behaviour and without silencing
a single rule.

## Problem

`eslint-config-next` 16.2.3 -> 16.4.0 widened `eslint-plugin-react-hooks` from
`^7.0.0` to `^7.1.0` (installed 7.1.1); three new rule families fire as errors.
Baseline: `23 errors / 61 warnings`, exit 1.

- `react-hooks/set-state-in-effect` (13): `fuentes-client.tsx`, `geo-maps.tsx`
  (x4), `login-gate.tsx`, `monitoreo-dashboard.tsx`, `monitoreo-table.tsx` (x2),
  `select-field.tsx`, `report-modal.tsx`, `repo-file-drawer.tsx`,
  `use-dashboard-data.ts`
- `react-hooks/immutability` (2): `repositorio/chat/page.tsx`
- `react-hooks/purity` (1): `monitoreo-form.tsx`
- pre-existing: `prefer-const` (2, `api/health/route.ts`),
  `@typescript-eslint/no-explicit-any` (5, two test files)

## Decision

Fix the code, not the config: no `eslint-disable` (one obsolete pre-existing
disable was removed together with its effect), no rule downgrade, no
`eslint.config.mjs` change, no new dependencies, only the 14-file surface.

## Key finding (rule false positive)

`react-hooks/set-state-in-effect` in 7.1.1 flags **any** effect-invoked function
that calls `setState` directly — including after `await`. The writer probed this
empirically (a fetcher whose only `setState` is post-`await` is still reported;
removing the direct call clears it). Applying state after an awaited fetch is
legitimate React, so the fix uses the pattern the rule endorses instead of a
suppression: the 7 fetch effects now apply state in `.then/.catch/.finally`
callbacks (7 sites: geo-maps x4, fuentes-client, monitoreo-dashboard,
monitoreo-table). Revisit when the plugin gains await awareness.

## Tasks

- [x] **T1** — Recon confirmed baseline `23 errors / 61 warnings`.
- [x] **T2** — Fixed by `gentle-ai-worker` within the 14-file surface:
      `set-state-in-effect` x13 (render-time prop-to-state sync, mount-only-while-open
      modal, promise-callback fetchers with derived `loading`, `reloadKey` retries),
      `immutability` x2 (declaration order, no rewrite), `purity` x1 (`Date.now`
      moved out of the render path), `prefer-const` x2, `no-explicit-any` x5
      (redundant casts removed; the fields were already `unknown`).
- [x] **T3** — Independent verification (gentle-ai-verify) at the branch head.

## Evidence (baseline -> head)

| Check | Baseline | Head |
|---|---|---|
| `npm run lint` | 23 errors / 61 warnings, exit 1 | **0 errors / 60 warnings, exit 0** |
| `npm run test:run` | 39 files / 446 tests, 9 failed / 437 passed | **identical** (same 3 failing files) |
| `npm run build` | exit 0 | **exit 0, TypeScript clean** |
| Surface | — | exactly the 14 files, no deletions, **no added suppressions**, 1 obsolete `eslint-disable` removed |

## Behaviour review (independent, read-only)

No newly introduced defect is provable from the code in any flagged area:
monitoreo-table / fuentes-client loading-and-error ordering, login-gate sign-out
gating (every `permissions`/`roleName` read is unreachable without `user`),
geo-maps / monitoreo-dashboard promise chains and the NBI fallback (equivalent
triple, same rethrow), report-modal reset semantics (unmount is a superset of the
old reset), use-dashboard-data no-env path (no crash).

- Two error races (an unguarded `.catch` setting a stale error) are **preserved
  from baseline**, not introduced.
- `geo-maps` and `monitoreo-dashboard` have no request-cancellation guard before
  or after this change; React 19 no-ops post-unmount state writes.
- No unit tests cover the spinner semantics of `monitoreo-table` /
  `fuentes-client`: a browser spot-check on tab/query changes is recommended.

## Risks

- The seven fetch sites are shaped by the rule's current behaviour; the
  `.then`-chains can return to `async/await` once the plugin distinguishes
  post-`await` updates (the false positive should be tracked upstream).
- `login-gate` retains permissions in memory after sign-out but no path reads
  them without a user, and the real boundary is Supabase RLS, not client UI.
