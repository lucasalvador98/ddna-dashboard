# UX trust and repository chat

## Objective

Make the dashboard's user-facing status truthful, align visible actions with existing server authorization, and make repository chat usable with browser-local history and controls.

## Problem and rationale

The read-only UX audit found that several pages turn failed reads into plausible success or empty states, while the chat API emits retrieval warnings that the UI discards. Some screens expose controls whose APIs are admin-only. The chat has no cancellation or retry, and its current conversation disappears on reload.

## Scope and constraints

- T1/T2 are complete. The user reauthorized T3 on 2026-11-12 while DevOps handles deployment.
- Preserve all existing server-side authorization checks. This work must not broaden API access or introduce a database table, migration, or server-side conversation storage.
- Persist chat in browser storage only, scoped to the authenticated user. Clear that user's local transcript on logout and provide a manual clear action; handle unavailable/corrupt storage safely. User confirmed clear-on-logout on 2026-11-12.
- Keep existing Spanish UI copy professional and consistent with the surrounding page.
- Do not touch the pre-existing untracked `docs/REQUERIMIENTOS_OBSERVATORIO.md`.
- TDD is explicitly enabled by the user for this feature. Exact runner: `npx vitest run`.
- Implementation route: delegated direct, one writer, because each work unit changes multiple non-trivial UI/test files and the permission flow crosses several components.
- Delivery strategy: `ask-on-risk` (default); the user selected `stacked-to-main` for review slices. T1 produced 992 and T2 601 authored changed lines across nine cohesive slices; every slice is below 400 lines. The user later requested a single branch and explicitly authorized a fast-forward push to `main`; no PR was created. T3 is now reauthorized on a new local branch.

## Authorized scope

T1/T2 are complete; T3 is reauthorized. No data cleanup, server authorization redesign, deployment, push, pull request, or database mutation is authorized by this task. T1/T2 were pushed to `main` on 2026-11-11.

## Acceptance criteria

- Retrieval warning, retrieval method, and context status emitted by the chat API are reflected accurately in the UI; a failed or empty search is not mislabeled as an unprocessed corpus.
- Failed catalogue/config reads are visibly errors, not sample data or success-shaped defaults; the admin KPI names the metric it actually counts; report loading does not claim fake per-source progress.
- Admin-only chat/report functionality and repository mutations are identified before use; non-admin users see an appropriate read-only or access-denied state. API guards remain authoritative and unchanged.
- The active transcript persists in browser storage only; users can clear it, cancel/retry requests, and follow document citations.
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

### T3a — Browser-local active transcript

- [x] Persist and restore the active transcript in the browser only, scoped per user; clear it on logout and provide a manual clear action. Handle unavailable or invalid storage safely.
- [x] Add focused tests for persistence, per-user isolation, logout clearing, and storage failures.

**Route:** delegated direct. Trigger evidence: browser state, auth identity and client lifecycle cross multiple files.

### T3b — Streaming cancellation and retry

- [ ] Add a cancel control for an in-flight response and a retry control for failed requests.
- [ ] Propagate the request abort signal to the active model request and stop subsequent tool/model rounds when supported. Do not present partial output as a completed answer.
- [ ] Add focused tests for cancel, retry, and interrupted/partial streams.

**Route:** delegated direct. Trigger evidence: cancellation crosses the client reader, chat route stream loop, and chat completion transport.

### T3c — Clickable document citations

- [ ] Render available document citations as links while preserving a safe fallback for sources without a URL.
- [ ] Add focused tests for safe URLs, link labels, and missing/invalid URL fallback.

**Route:** delegated direct, same writer. Trigger evidence: the API already emits source URLs but the client type/render path discards them.

## Verification

- Per task: write the regression test first, observe it fail, implement, then observe it pass (`npx vitest run <focused test paths>`).
- After each task: `npx tsc --noEmit` and targeted ESLint on changed files.
- Final for T1/T2: `npx vitest run`, `npx tsc --noEmit`, `npm run build`, and parent spot-checks. Re-run the applicable checks after T3 implementation.
- Runtime scenarios for T1/T2: use a non-admin account on chat, report and repository pages; force a data-source failure and confirm the UI states it honestly.
- T3 runtime scenarios: refresh after a chat exchange; clear local history; sign out and verify the local transcript is deleted; cancel during streaming; retry an error; follow a citation.

## Progress and evidence

- T1: complete. TDD: 7 behavioral regression tests failed before implementation (RED); focused suite passed 8 files / 21 tests (GREEN). Independent contract verification passed. Parent reran the focused suite and `npx tsc --noEmit` (both pass). Full suite: 61 files / 553 tests passed. Targeted ESLint: 0 errors, 3 warnings; build deferred to final verification.
- T1 work-unit/PR slices (stacked-to-main, no PRs created): `3c56c30` chat retrieval status (152 lines); `d919154` Fuentes failure state (271); `cabe5bf` duplicate API panel removal (190); `8f8deab` APIs fetch error state (69); `17fa120` admin config/KPI truthfulness (77); `e751e61` report loading status (233). All under 400 changed lines.
- T2: complete. TDD RED/GREEN: the focused tests failed before implementation; final focused suite passed 4 files / 17 tests. Parent reran T2 tests and `npx tsc --noEmit` (both pass). Independent T2 contract verification passed. Targeted ESLint: 0 errors, 2 existing unused-import warnings. No browser runtime was run.
- T2 work-unit/PR slices (stacked-to-main, no PRs created): `3d33473` shared admin gate for chat/report (324 lines); `d84db18` repository read-only browsing and admin controls (203); `e1bed58` permission edge-case tests (74). All under 400 lines.
- T3: reauthorized by the user on 2026-11-12. User confirmed clear-on-logout; per-user history otherwise survives page reloads during the authenticated session.
- T3a: complete. Pre-implementation RED was observed (8 failed / 5 passed); final focused suite passed 2 files / 21 tests. Parent reran that suite and `npx tsc --noEmit` (both pass). Independent T3a verification found no blocker. Targeted ESLint: 0 errors, 1 pre-existing unused import warning. Character-cap behavior is implemented but not directly asserted; no browser runtime was run.
- T3a work-unit slices (stacked-to-main): `89dd51f` per-user browser history helper/tests (221 lines); `1967e7c` chat-page persistence integration/tests (396 lines). Both under 400 lines.
- T3b: next; cancellation/retry and upstream abort propagation remain unimplemented.
- T3c: pending; clickable citations remain unimplemented.
- Chain strategy selected: `stacked-to-main`.
- Completed slices total: T1 = 992 lines across six commits; T2 = 601 lines across three commits. Each slice remains below 400 lines. `npx vitest run`: 64 files / 567 tests passed. `npx tsc --noEmit`: passed. The first `npm run build` stopped to surface a Next.js `SecurityFatalError` recommending a security upgrade; one retry passed the build. The upgrade was not run and awaits separate user authorization.
- RDD status remained on. Native assessment returned high/unassessable because the active OpenCode runtime is ineligible for immutable receipt review. No review was started and the user-owned RDD switch was not changed. T1 and T2 received independent contract verification.
- User authorized a fast-forward push to `main`; the initial consolidation moved it from `057619e` to `0fbd1ee`, followed by tracker commit `6566d90`. No PR was created. T3 branch: `feature/ux-chat-t3`, based on `6566d90`. Deployment remains a separate DevOps action.
- Next step: implement T3b using strict TDD on `feature/ux-chat-t3`; then T3c. Do not push, run the Next.js security upgrade, or deploy without separate authorization.
