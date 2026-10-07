# Feature: xlsx-security-upgrade

> **STATUS: DONE** (2026-10-07). Branch `fix/xlsx-security-upgrade` from `main`
> at `14ca970`; one work-unit commit. Not merged, not pushed (user decision).
> Follow-up item (b) tracked in `odd/tasks/dependency-security-remediation.md`.
>
> **Discovered during execution:** the upgrade breaks the ETL scripts' read path
> (`XLSX.readFile` no longer exists in the 0.20 ESM build). The new focused test
> caught it red before the commit; the fix is part of this same work unit.

## Objective

Replace `xlsx@0.18.5` (npm registry, frozen, two high advisories with **no npm
fix**) with the official SheetJS release published on `cdn.sheetjs.com`
(0.20.3, resolved through the `xlsx-latest` alias on 2026-10-07). That release
fixes both advisories: prototype pollution in 0.19.3 and the ReDoS in 0.20.2.

## Problem

- npm's `xlsx` is stuck at 0.18.5; SheetJS ships patched builds only via its CDN.
- The library is **not** script-only — it parses untrusted files at runtime:
  - `src/lib/rag/extractors/xlsx.ts` — `XLSX.read(buffer, {type:'buffer'})`,
    `sheet_to_txt`, `decode_range`; parses repository documents ingested into RAG.
  - `src/lib/formularios/xlsx.ts` — builds export workbooks and already
    sanitises formula injection.
- Scripts read local workbooks with `XLSX.readFile`: `scripts/load-budget-2025.mjs`,
  `scripts/load-budget-march-2025.mjs`, `scripts/migrate-inversion.mjs`.
- Two install paths fetch the new source: the app image (`Dockerfile`, `npm ci`)
  and the ETL container (`docker-compose.etl.yml`, `npm ci --ignore-scripts`).

## Decision

Install the pinned official tarball
`https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz` as the `xlsx` dependency,
with its integrity recorded in the lockfile. 0.20.3 ships its own TypeScript
types and has **zero dependencies** (the lockfile drops eight legacy sub-deps:
`adler-32`, `cfb`, `codepage`, `crc-32`, `frac`, `ssf`, `wmf`, `word`).

The upgrade forced one source adaptation (see "What the upgrade surfaced"):
the three ETL scripts now use `XLSX.read(readFileSync(path), { type: 'buffer' })`.

Rejected alternatives: **exceljs** (six files to rewrite, different API, more
transitive deps); **keeping 0.18.5** (two high advisories reachable from
untrusted XLSX); **vendoring the tarball with a `file:` reference** (fully
offline, but `docker-compose.etl.yml` does not mount a vendor directory, so the
ETL container's `npm ci` would fail unless the compose file changes — kept as
fallback if the CDN host is ever blocked).

## What the upgrade surfaced (key finding)

`XLSX.readFile` works with 0.18.5's ESM build but **throws** `Cannot access file`
with 0.20.3's ESM build: `xlsx.mjs` >= 0.20 has no fs helpers (CJS `xlsx.js`
keeps them). Probed in an isolated scratch directory outside the repo:

| Build | `readFile` | `read(readFileSync(...))` |
|---|---|---|
| 0.18.5 ESM | OK | (not needed) |
| 0.20.3 ESM | **throws** `Cannot access file` | OK |
| 0.20.3 CJS | OK | OK |

Without the adaptation the three ETL loaders would have failed at runtime.

## Scope (as executed)

In scope: `package.json`, `package-lock.json`, the three ETL scripts (only their
read call + `node:fs` import), one new focused test, this task file.

Out of scope: extractor/generator logic, Dockerfile / docker-compose changes,
moving `xlsx` between dependencies and devDependencies (it is genuine runtime).

## Tasks

- [x] **T1** — Pinned tarball installed. `npm ls xlsx` -> `0.20.3` from
      `cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`; `require('xlsx').version`
      -> `0.20.3`.
- [x] **T2** — New test `src/lib/rag/extractors/xlsx.test.ts` (4 cases):
      round-trip `buildXlsx` -> `extractTextFromXLSX`, `extractJSONFromXLSX`,
      disk read (ETL entry point, using the adapted pattern), and a
      `sheet_to_json` prototype-pollution guard (`__proto__` header). The disk
      case first failed with `Cannot access file` — that red is what exposed the
      `readFile` incompatibility; green after adapting the scripts.
- [x] **T3** — Independent verification (gentle-ai-verify) at the branch head:
      - `npm ls xlsx` / library version -> 0.20.3, tarball URL, `dependencies: {}`.
      - `npm audit` -> **12** total (9 high / 3 moderate, 0 critical), `xlsx`
        gone; the 12 are exactly the documented chains (braces family x9,
        mammoth/argparse/sprintf-js x3).
      - focused test 4/4; full suite **40 files / 450 tests, 9 failed / 441
        passed** — identical failure set to the baseline (salud page 5,
        docker-infrastructure 1, chat route 3).
      - cold `npm run build` -> exit 0, `Next.js 16.4.0`, 17/17 static pages
        (also type-checks the new test file).
      - `npm ci` -> exit 0, added 834 packages (clean install proves the tarball
        URL resolves); `npm ci --dry-run` -> exit 0 with an **identical sha256**
        of `package-lock.json` (lock consistent, not rewritten).
      - `npx eslint` on the touched files -> 0 errors (1 pre-existing warning).
      - `git status` -> only the expected 5 modified + 3 untracked files.

## Risks

- **New external host at install time** (`registry.npmjs.org` plus
  `cdn.sheetjs.com`). The app image build and the ETL container must reach it.
  Docker is unavailable in this environment, so only the local clean install was
  proven; validate the container path on the next deploy / ETL run. If the host
  is blocked, `npm ci` fails loudly (recoverable) and the vendor fallback above
  applies.
- SheetJS 0.20.x changed internals (which is exactly what `readFile` showed);
  the used subset is now covered by the new test.
