# Feature: dependency-security-remediation

> **STATUS: DONE** (2026-10-07). Branch: `fix/dependency-vulnerabilities`,
> commits `8142b01`, `dfa04ea`, `1f08f8c`, `8b943ff` + this docs commit.
> Nothing pushed; deploy remains a user/DevOps decision (AGENTS.md /
> DEPLOY_TOPOLOGY.md). One open follow-up: the 16 new `react-hooks` lint errors
> (see "Follow-up"), kept out of scope on purpose.

## Objective

Reduce the known-vulnerability surface as far as is safe and honest: apply
every fix that does not require breaking changes or a fake mitigation, and leave
an explicit, reasoned record of what cannot be fixed and why.

## Problem

`npm audit` reported 33 advisories. `npm audit fix` (no `--force`) resolved 15
without touching `package.json` (86 lockfile entries bumped). The remaining 18
sat in six chains: the `next@16.2.3` critical cluster (with its nested
`postcss` / `sharp`), dev-only `braces`, `image-size` via `pptxgenjs`,
`sprintf-js` via `mammoth`, and `xlsx` (no npm fix).

## Decision

- Upgrade `next` + `eslint-config-next` to exactly `16.4.0`.
- Override `image-size` to `^2.0.4` (patched; provably never loaded by the
  shipped `pptxgenjs` bundles) after a behavioural smoke test.
- Move the `shadcn` CLI from `dependencies` to `devDependencies` (the app never
  imports it) so its tree leaves the production dependency set.
- Do NOT force `argparse`, `braces`, `pptxgenjs`, `mammoth` or `xlsx`: every
  available "fix" is a downgrade or a cosmetic override. Documented below.
- Nothing is pushed; deploy stays a user/DevOps decision.

## Scope

In scope: `package.json`, `package-lock.json`, this task file.

Out of scope: source changes (including the new lint findings, see Follow-up);
migrating `xlsx` to the SheetJS CDN tarball or another library; removing dev
tooling; any deploy action.

## Constraints

- `next`, `react`, `react-dom`, `eslint-config-next` keep exact pins.
- No `npm audit fix --force`.
- Every dependency change followed by observed `lint` / `test:run` / `build`.

## Acceptance criteria (final state)

1. `package.json` pins `next` and `eslint-config-next` at exactly `16.4.0`. DONE.
2. `npm audit` no longer lists `next`, `postcss`, `sharp`, `image-size` or
   `pptxgenjs`; what remains is exactly the documented accepted-risk set. DONE
   (13 entries, all accounted for below).
3. `npm ls --depth=0` exits 0 with no `missing` / `invalid`. Six `extraneous`
   lines remain: `@emnapi/core`, `@emnapi/runtime`, `@emnapi/wasi-threads`,
   `@img/sharp-wasm32`, `@napi-rs/wasm-runtime`, `@tybys/wasm-util`. They are
   platform-optional artifacts that survive both `npm ci` and `npm prune` — an
   npm 11 labelling quirk, not tree damage. Accepted.
4. `npm run build` passes, cold, on Next 16.4.0. `npm run test:run` is identical
   to baseline (same 9 pre-existing failures). `npm run lint` was already
   failing pre-change (7 errors) and now reports 16 additional `react-hooks`
   errors introduced by `eslint-config-next@16.4.0` — documented, not silenced.
5. PPTX path re-proven after the override (smoke test below). DONE.
6. Work-unit commits on the branch; nothing pushed. DONE.

## Tasks

- [x] **T1** — Baseline verification (delegated to gentle-ai-verify, commit
      `8142b01` state): lint exit 1 / 7 errors / 61 warnings; tests exit 1,
      3 failed files / 36 passed (39), 9 failed / 437 passed (446); build exit 0
      (Next 16.2.3). Failures pre-existing and unrelated to dependencies.
- [x] **T2** — Commit `8142b01` `chore(deps): apply non-breaking npm audit fixes`
      (lockfile only; 684 insertions / 368 deletions; `package.json` untouched).
- [x] **T3** — Commit `dfa04ea` `chore(deps): upgrade next to 16.4.0`
      (+ `eslint-config-next` in lockstep). Audit no longer lists `next`,
      `postcss` or `sharp`; installed `postcss 8.5.23` under next and
      `sharp 0.35.5` (both beyond the advisory ranges).
- [x] **T4** — Commit `1f08f8c` `chore(deps): pin image-size to patched 2.x via
      npm overrides`. Smoke test through a `require` hook on the real path
      (`pptxgenjs` + embedded PNG): `image-size instalado: 2.0.4`,
      `bytes: 45526 | pic: true | media: 2`,
      `cargas de image-size: 0 (nunca se requirio)`.
- [x] **T5** — Commit `8b943ff` `chore(deps): move shadcn CLI to
      devDependencies`, then `npm ci`: exit 0 and `package-lock.json` unchanged,
      which also proves the lockfile is in sync for the Dockerfile's `npm ci`.
      `npm ls --depth=0` exit 0.
- [x] **T6** — Branch-head gate, independently verified at `8b943ff`
      (gentle-ai-verify) plus a parent-run cold build:
      - cold `npm run build`: exit 0, `▲ Next.js 16.4.0 (Turbopack)`,
        compiled in 20.4s, 17/17 static pages, full route table.
      - `npm run test:run`: byte-for-byte identical to baseline (9 failed /
        437 passed; same 3 files) — no new test failure.
      - `npm audit`: 13 total (10 high / 3 moderate), zero critical.
      - `npm audit --omit=dev`: 4 total (1 high / 3 moderate) — see below.
      - `npm run lint`: 23 errors / 61 warnings; the 16 new `react-hooks/*`
        errors are the documented follow-up (see Follow-up).
      - `package-lock.json` untouched by any verification command.

## Evidence

| Check | Baseline (T1) | Branch head (T6) |
|---|---|---|
| `next build` | exit 0 (16.2.3) | exit 0 cold (16.4.0) |
| `test:run` | 9 failed / 437 passed | 9 failed / 437 passed (same files) |
| `lint` | 7 errors / 61 warnings | 23 errors / 61 warnings (16 new, see Follow-up) |
| `npm audit` | 18 | 13 |
| `npm audit --omit=dev` | (not measured) | 4 |
| `npm ls --depth=0` | exit 0 | exit 0 (6 platform-optional `extraneous`) |
| PPTX smoke | — | pass, 0 `image-size` loads |

## Accepted risks (kept visible, not silenced)

1. **`braces` chain — 9 dev-only entries** (`eslint-config-next`,
   `@next/eslint-plugin-next`, `fast-glob`, `micromatch`, `braces`, `shadcn`,
   `@shadcn/registry`, `ts-morph`, `@ts-morph/common`). Stack-exhaustion DoS in
   glob pattern matching, reachable only from developer tooling. `braces 3.0.3`
   is the latest release and the advisory covers all versions; npm's only "fix"
   is downgrading `shadcn` to `1.0.0`. Not forced.
2. **`mammoth` -> `argparse@1.x` -> `sprintf-js` — 3 moderate entries.**
   `sprintf-js` has no patched release. `argparse` is loaded only by
   `node_modules/mammoth/bin/mammoth` (CLI); the library path we use
   (`src/lib/rag/extractors/docx.ts`) never loads it. npm's "fix" is downgrading
   `mammoth` to `0.3.29` (2016). Not forced.
3. **`xlsx@0.18.5` — 1 high entry, no npm fix.** SheetJS ships patches only via
   `cdn.sheetjs.com`. Used only by local ETL loaders (`scripts/load-*.mjs`) on
   trusted INDEC / budget files. Changing the install source affects Docker
   builds -> deploy-coordinated decision, deferred. Options when it is taken up:
   install the pinned CDN tarball, or migrate the three scripts to a maintained
   reader.
4. **`image-size` override** is a deliberate, provable pin: remove it when
   `pptxgenjs` widens its declared range to a patched line.

## Follow-up (out of scope on purpose)

`eslint-config-next@16.4.0` raises `eslint-plugin-react-hooks` to `^7.1.0`
(installed `7.1.1`; 16.2.3 capped `^7.0.0`), which activates three new rules
and produces **16 new errors, 61 warnings unchanged**:

- `react-hooks/set-state-in-effect` (13): `src/app/fuentes/fuentes-client.tsx:277`,
  `src/components/geo-maps.tsx:309,534,808,970`, `src/components/login-gate.tsx:122`,
  `src/components/monitoreo/monitoreo-dashboard.tsx:412`,
  `src/components/monitoreo/monitoreo-table.tsx:208,213`,
  `src/components/monitoreo/select-field.tsx:39`, `src/components/report-modal.tsx:81`,
  `src/components/repositorio/repo-file-drawer.tsx:51`, `src/lib/use-dashboard-data.ts:183`
- `react-hooks/immutability` (2): `src/app/repositorio/chat/page.tsx:70,72`
- `react-hooks/purity` (1): `src/components/monitoreo/monitoreo-form.tsx:173`

These are real React 19 correctness signals across 12 files and deserve their own
tracked change (they can change effect/render behaviour, so they do not belong in
a dependency-security commit). `lint` was already failing before this branch (7
errors), so no green gate was lost. Alternatives if a zero-delta lint output is
preferred: fix the 16 sites as a separate feature (recommended), or hold
`eslint-config-next` back at `16.2.3` (dev-only package; the critical runtime fix
lives in `next@16.4.0`).

## Risks

- A `next` minor upgrade can change build/routing behaviour. Verified locally:
  cold build, full test suite parity, smoke test. Not verified end-to-end
  against the VPS; the observatory routing fixes landed recently, so the first
  deploy after this branch should be observed by the DevOps.
- Related observation for deploy hygiene: `tests/docker-infrastructure.test.ts`
  already fails on `main` because the Dockerfile uses `npm ci` while the test
  expects `npm ci --omit=dev`. With `shadcn` now a devDependency, aligning the
  Dockerfile with that expectation would additionally drop the whole shadcn
  toolchain from the production image. Out of scope here (deploy surface).
