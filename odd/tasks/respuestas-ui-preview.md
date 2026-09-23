# Feature: responses UI overhaul + form preview

## Objective

Make the admin responses screen readable and let the user preview a form from
both the forms list and the responses screen.

## Problem

Reported as "the sidebar basically shows raw JSON". Verified first:

- There is **no** `JSON.stringify` in the formularios UI (`src/**/*.tsx` grep:
  25 hits, zero in `src/components/formularios/**` or `src/app/formularios/**`).
- The real defects are:

1. `src/components/formularios/admin/responses-table.tsx:42` reads
   `definicion.fields` only. Production definitions keep `fields: []` and store
   all 44 fields in `bloques[*].fields`, so the table renders **zero** preview
   columns (only Nº / Enviada / Acciones).
2. `response-detail.tsx:33` flattens `bloques` into one list of 44 grey cards
   with no block titles — reads as an undifferentiated dump.
3. `response-detail.tsx:48` `renderAnswer()` is weak: objects become
   `[object Object]`, arrays are joined raw, `scale` renders with a double
   parenthesis; `number`/`date`/`email`/`phone` are not handled.
4. `response-detail.tsx:80` silently drops unanswered fields.
5. Preview only exists inside the builder
   (`src/app/formularios/[id]/builder-client.tsx:263`). No preview affordance on
   `/formularios` or `/formularios/respuestas/[id]`.

## Decision (user, 2026-09-23)

Response detail = **filled-in form, Google-Forms style**: render the real form
with the respondent's answers loaded, grouped by block, read-only.
Not a prettier sidebar list.

## Scope

In scope:

- Read-only mode on the shared renderer.
- Response drawer body replaced by the filled-in form.
- Preview modal reachable from the forms list and the responses screen.
- Fix the table's `definicion.fields` read so preview columns appear.
- Tests for all of the above.

Out of scope:

- Any backend/Supabase change, any migration work.
- XLSX export format.
- The builder's own preview (already works).

## Constraints

- `FormRenderer` is shared by the builder preview AND the public form
  `/f/[slug]`. Changes must be additive; existing props keep working.
- `FieldInput` (`src/components/formularios/fields.tsx`) must stay usable by the
  public form unchanged when the new prop is absent.
- Reuse `getAllFields` from `@/lib/formularios/defaults` instead of re-flattening.
- Reuse `BuilderPreview` for the preview modal; do not fork a second renderer.
- UI strings Spanish; identifiers, comments and code in English (AGENTS.md).
- TypeScript strict, no `any` (use `unknown`).
- Tailwind utility classes only, no inline styles (except existing animation key).
- Never render `JSON.stringify` of answers as the primary view.

## Tasks

- [x] T1 `FormRenderer`: add `readOnly?: boolean`. When set, inputs are disabled,
      no submit button, no validation errors. Header renders only when a title is
      present so the drawer can pass an empty title.
- [x] T2 `fields.tsx` `FieldInput`: add optional `disabled?: boolean`, applied to
      input/textarea/select/radio/checkbox/scale buttons; keep disabled controls
      legible (`disabled:bg-slate-50 disabled:text-slate-700`).
- [x] T3 `responses-table.tsx`: source preview columns from `getAllFields(definicion)`
      instead of `definicion.fields`; harden `formatValue` so objects never print
      as `[object Object]`.
- [x] T4 `response-detail.tsx`: replace the flat answer list with the filled-in
      `FormRenderer` (`initialAnswers={respuesta.respuestas}`, `readOnly`),
      keeping the metadata header (fecha, ID) and the delete footer. Widen the
      drawer from `max-w-md` to `max-w-2xl`. Remove the now-dead
      `collectFields`/`renderAnswer` helpers.
- [x] T5 New `src/components/formularios/form-preview-modal.tsx`: backdrop modal
      (Escape, focus restore, scroll lock) rendering `BuilderPreview`.
- [x] T6 `respuestas-client.tsx`: "Vista previa" button in the header band,
      wired to the new modal.
- [x] T7 `formularios-client.tsx`: "Vista previa" action on each `FormRow`,
      wired to the same modal at the list level.
- [x] T8 Tests: update `respuestas-client.test.tsx` (drawer now renders inputs, so
      `getByText('Ana')` becomes `getByDisplayValue('Ana')`); add coverage for
      readOnly mode, block-column table, and the preview modal opening from both
      entry points. Check `formularios-client.test.tsx` for role-count assertions
      that the new button could break.

## Acceptance criteria

- Opening a response shows the form grouped by block with that respondent's
  values filled in and every control disabled.
- Unanswered fields are visible as empty, not omitted.
- The responses table shows up to 4 preview columns for a `bloques` definition.
- "Vista previa" opens from `/formularios` and from
  `/formularios/respuestas/[id]`, renders the same form the public link shows,
  and closes on Escape.
- The public form `/f/[slug]` and the builder preview behave exactly as before.

## Checks

- `npm run test:run`
- `npm run lint`
- `npx tsc --noEmit` (if configured; otherwise `npm run build`)

## Route declaration

All tasks are delegated direct (writer trigger: 9 source/test files).

## Progress

T1–T8 done (2026-09-23). All checkboxes above reflect observed outcomes:

- Read-only mode, conditional header and `disabled` threading verified by new
  `form-renderer.test.tsx` cases (12 tests pass).
- Table `getAllFields` fix + hardened `formatValue` verified by the new
  `responses-table.test.tsx` (bloques definition with empty top-level `fields`;
  object answers render `—`, never `[object Object]`).
- Drawer now renders the filled-in read-only form (`getByDisplayValue('Ana')`,
  `toBeDisabled`); metadata header, delete footer, focus trap, Escape, scroll
  lock preserved; drawer widened to `max-w-2xl`; missing `definicion` shows a
  fallback message instead of crashing.
- `FormPreviewModal` created and reachable from both entry points; open/close
  (including Escape) covered in `respuestas-client.test.tsx` and
  `formularios-client.test.tsx`.
- Verification: `npm run test:run` → 437 passed, 1 failed — the failure is
  `tests/docker-infrastructure.test.ts` ("installs production deps only in deps
  stage" expects `npm ci --omit=dev`, the untouched `Dockerfile` uses `npm ci`);
  pre-existing and unrelated to this change.
  `npx tsc --noEmit` → exit 0, no output.
  `npm run lint` → exit 1: 7 errors, all pre-existing in untouched files
  (`src/app/api/health/route.ts` prefer-const ×2, `src/lib/etl/validate.test.ts`
  no-explicit-any ×3, `src/lib/monitoreo/useMonitoreoDraft.test.ts`
  no-explicit-any ×2); zero errors/warnings in the files changed here.

## Independent verification (2026-09-23)

A fresh-context verifier re-read the source rather than trusting the tick marks
and re-ran all three checks. Verdict `partial` on two findings; both fixed:

1. `responses-table.tsx:32` — `value.join(', ')` could still emit
   `[object Object]` when an answer array contains objects. Unreachable for new
   submissions (`validation.ts:310-314` requires string options) but reachable
   for legacy rows — the same class of data that motivated the fix.
   **Fixed:** array elements now pass through `formatScalar`, which maps any
   object to `''` and drops it; an all-object array renders `—`.
2. `respuestas-client.tsx:3-5` — header comment still described the removed
   "JSON detail drawer" and a CSV button (the button is XLSX).
   **Fixed.**

Post-fix verification:

- `npx vitest run src/components/formularios src/app/formularios` → exit 0,
  4 files / 29 tests passed.
- `npx eslint <the two edited files>` → exit 0.
- `npx tsc --noEmit` → exit 0.

Scope confirmation: 9 modified source/test files, 2 new files, this document.
The five pre-existing working-tree modifications (`docker-compose.etl.yml`,
`scripts/backfill.mjs`, `scripts/load-budget-march-2025.mjs`,
`scripts/migrate-inversion.mjs`, `scripts/run-backfill.mjs`) and the untracked
`scripts/migrate-storage.mjs` predate this task (mtimes 2026-09-16/17) and were
not touched.

Prettier deliberately NOT run: `.prettierrc` exists, but there is no husky, no
lint-staged and no CI workflow enforcing it, and 17 untouched files under
`src/lib/formularios` already fail `prettier --check` at HEAD. Running it here
would inject formatting churn with no reason tied to this task.

Native review: `gentle-ai review status` returned
`immutable_review_transport_unsupported` (`next_action: stop`) — this runtime is
not an eligible immutable-review runtime, so no review transaction was opened
and no receipt exists. Delivery stays under ordinary repository policy.

## Delivery strategy

`ask-on-risk` (chosen at preflight, 2026-09-23), chain strategy
**`stacked-to-main`** — each PR merges to `main` in order.

The initial forecast in this document was wrong: the finished feature is 615
authored changed lines (568 insertions + 47 deletions), above the ~400 per-PR
budget, so it is sliced. Commit / PR boundaries:

1. `feat(formularios): read-only renderer mode and bloques table preview
   columns` — `form-renderer.tsx`, `fields.tsx`, `responses-table.tsx` and their
   two test files. ~187 lines. No dependency on the slices below.
2. `feat(formularios): add form preview modal` — `form-preview-modal.tsx` (new),
   `formularios-client.tsx` and its test. ~144 lines. Reuses the existing
   `BuilderPreview`; independent of slice 1.
3. `feat(formularios): render response detail as filled-in read-only form` —
   `response-detail.tsx`, `respuestas-client.tsx`, its test and this document.
   ~284 lines. Depends on slices 1 and 2.

Each slice builds and tests green on its own. PRs target `main` in order.
