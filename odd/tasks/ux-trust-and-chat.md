# UX trust and repository chat

## Objective

Make the dashboard's user-facing status truthful and align visible actions with existing server authorization. Browser-local chat history and interaction controls were planned but explicitly deferred by the user.

## Problem and rationale

The read-only UX audit found that several pages turn failed reads into plausible success or empty states, while the chat API emits retrieval warnings that the UI discards. Some screens expose controls whose APIs are admin-only. The chat has no cancellation or retry, and its current conversation disappears on reload.

## Scope and constraints

- Implement the user-approved UX blocks that remain in scope: truthful states and permission-aware UI. Browser-local chat history and controls (T3) were explicitly deferred by the user on 2026-11-11.
- Preserve all existing server-side authorization checks. This work must not broaden API access or introduce a database table, migration, or server-side conversation storage.
- Deferred T3 decision: if reauthorized, persist chat in browser storage only; scope it to the authenticated user where possible, provide a clear action to remove it, and tolerate unavailable/corrupt storage.
- Keep existing Spanish UI copy professional and consistent with the surrounding page.
- Do not touch the pre-existing untracked `docs/REQUERIMIENTOS_OBSERVATORIO.md`.
- TDD is explicitly enabled by the user for this feature. Exact runner: `npx vitest run`.
- Implementation route: delegated direct, one writer, because each work unit changes multiple non-trivial UI/test files and the permission flow crosses several components.
- Delivery strategy: `ask-on-risk` (default); the user selected `stacked-to-main` for review slices. T1 produced 992 and T2 601 authored changed lines across nine cohesive slices; every slice is below 400 lines. The user later requested a single branch and explicitly authorized a fast-forward push to `main`; no PR was created. T3 is deferred.

## Authorized scope

T1 and T2 only: truthful status/error states and permission-aware UI. T3 is deferred. No data cleanup, server authorization redesign, deployment, pull request, or database mutation is authorized by this task. A fast-forward push of T1/T2 to `main` was explicitly authorized and completed on 2026-11-11.

## Acceptance criteria

- Retrieval warning, retrieval method, and context status emitted by the chat API are reflected accurately in the UI; a failed or empty search is not mislabeled as an unprocessed corpus.
- Failed catalogue/config reads are visibly errors, not sample data or success-shaped defaults; the admin KPI names the metric it actually counts; report loading does not claim fake per-source progress.
- Admin-only chat/report functionality and repository mutations are identified before use; non-admin users see an appropriate read-only or access-denied state. API guards remain authoritative and unchanged.
- Deferred T3 acceptance (not implemented): the active transcript persists in browser storage only; users can clear it, cancel/retry requests, and follow document citations.
- Tests cover the T1 failure states and T2 permission behavior. No unrelated working-tree file is staged or changed.

## Tasks and route evidence

### T1 — Truthful status and error states

- [x] Consume chat `warning`, `searchMethod`, and `hasContext` without converting retrieval failure into “no documents processed”.
- [x] Replace the `/fuentes` example-data success fallback and `/apis` empty-on-error behavior with explicit failure UI; remove any duplicated data-panel rendering found in the audited sources.
- [x] Show auth-config loading failure explicitly instead of treating it as “no restrictions”.
- [x] Correct the admin KPI label to match the count it actually displays.
- [x] Replace simulated report-stage progress with truthful loading status.
- [x] Add focused regression tests and record RED/GREEN results.

**Route:** delegated direct. Trigger evidence: the failures span the chat, sources, APIs, admin config, executive report and their tests (4+ files); this is not a mechanical one-file edit.

### T2 — Permission-aware controls

- [x] Reuse the existing self-permissions/RBAC flow to show the admin-only state on chat and report pages before the user submits a request.
- [x] Keep repository browsing available according to the current route permissions, but show mutation controls only to admins and explain the read-only state to other authorized viewers.
- [x] Preserve the server-side checks on every endpoint; add tests for both admin and non-admin UI states.

**Route:** delegated direct, same writer. Trigger evidence: `LoginGate`, the repository UI and multiple admin-only APIs form a cross-file permission boundary.

### T3 — Browser-local chat workflow (deferred by user)

- [ ] Persist and restore the active transcript in the browser only, with a clear/delete action and safe handling of unavailable or invalid storage.
- [ ] Add cancellation for an in-flight request and a retry affordance for a failed request.
- [ ] Render available document citations as links while preserving a safe fallback for sources without a URL.
- [ ] Add focused tests for persistence, clearing, cancellation, retry and links.

**Route:** delegated direct, same writer. Trigger evidence: chat streaming, state lifetime and source rendering all live in a multi-file client/API boundary.

## Verification

- Per task: write the regression test first, observe it fail, implement, then observe it pass (`npx vitest run <focused test paths>`).
- After each task: `npx tsc --noEmit` and targeted ESLint on changed files.
- Final for T1/T2: `npx vitest run`, `npx tsc --noEmit`, `npm run build`, and parent spot-checks.
- Runtime scenarios for T1/T2: use a non-admin account on chat, report and repository pages; force a data-source failure and confirm the UI states it honestly.
- Deferred T3 runtime scenarios: refresh after a chat exchange; clear local history; cancel during streaming; retry an error; follow a citation.

## Progress and evidence

- T1: complete. TDD: 7 behavioral regression tests failed before implementation (RED); focused suite passed 8 files / 21 tests (GREEN). Independent contract verification passed. Parent reran the focused suite and `npx tsc --noEmit` (both pass). Full suite: 61 files / 553 tests passed. Targeted ESLint: 0 errors, 3 warnings; build deferred to final verification.
- T1 work-unit/PR slices (stacked-to-main, no PRs created): `3c56c30` chat retrieval status (152 lines); `d919154` Fuentes failure state (271); `cabe5bf` duplicate API panel removal (190); `8f8deab` APIs fetch error state (69); `17fa120` admin config/KPI truthfulness (77); `e751e61` report loading status (233). All under 400 changed lines.
- T2: complete. TDD RED/GREEN: the focused tests failed before implementation; final focused suite passed 4 files / 17 tests. Parent reran T2 tests and `npx tsc --noEmit` (both pass). Independent T2 contract verification passed. Targeted ESLint: 0 errors, 2 existing unused-import warnings. No browser runtime was run.
- T2 work-unit/PR slices (stacked-to-main, no PRs created): `3d33473` shared admin gate for chat/report (324 lines); `d84db18` repository read-only browsing and admin controls (203); `e1bed58` permission edge-case tests (74). All under 400 lines.
- T3: deferred by the user on 2026-11-11 (“no sigas con el t3”). Do not implement without fresh explicit authorization.
- Chain strategy selected: `stacked-to-main`.
- Completed slices total: T1 = 992 lines across six commits; T2 = 601 lines across three commits. Each slice remains below 400 lines. `npx vitest run`: 64 files / 567 tests passed. `npx tsc --noEmit`: passed. The first `npm run build` stopped to surface a Next.js `SecurityFatalError` recommending a security upgrade; one retry passed the build. The upgrade was not run and awaits separate user authorization.
- RDD status remained on. Native assessment returned high/unassessable because the active OpenCode runtime is ineligible for immutable receipt review. No review was started and the user-owned RDD switch was not changed. T1 and T2 received independent contract verification.
- User authorized a fast-forward push to `main`; the initial consolidation moved it from `057619e` to `0fbd1ee`. No PR was created. The work branch created for this task was deleted locally after consolidation; deployment remains a separate DevOps action.
- Next step: stop here. Resume only if the user explicitly reauthorizes T3 or the separate Next.js security upgrade.
