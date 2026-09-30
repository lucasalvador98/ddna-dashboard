# Feature: PISA 2025 Education sub-tab

## Objective

Add PISA 2025 Argentina + Córdoba + OECD comparison data to the `educacion`
indicator table, then present it as a dedicated "Pruebas PISA 2025" tab in the
Education section.

## Source and scope

- OECD PISA 2025 Results (Volume I), Argentina Country Note, DOI
  `10.1787/e2019444-en`, released 2026-09-08.
- Córdoba participated as a **Región Adjudicada** with its own sample (2,242
  students / 79 schools); provincial figures came from the Argentine jurisdiction
  report (ElDoce 2026-09-09 / Infobae 2026-09-08).
- Locality/municipality granularity is not published by PISA; finest available
  subnational scope is Córdoba province.
- Source-of-truth file: `scripts/data/pisa-2025-argentina.json`.
- Database rows: `indicadores`, `categoria='educacion'`, `periodo=2025`,
  `fuente LIKE '%PISA%'`, regions Nacional / Córdoba / OCDE promedio.

## Tasks

- [x] T1 — Capture the verified PISA 2025 source data in
      `scripts/data/pisa-2025-argentina.json` with source provenance. Commit
      `57c012d`.
- [x] T2 — Add an idempotent dry-run-by-default ETL at
      `scripts/load-pisa-2025.mjs`; load the dataset into the self-hosted DB.
      Production verified: 104 unique rows (52 Nacional / 38 OCDE promedio /
      14 Córdoba), no duplicates. Commit `57c012d`.
- [x] T3 — Create the "Pruebas PISA 2025" sub-tab under Educación, including
      score comparison, proficiency, and context indicators. `tsc --noEmit` and
      `src/app/educacion/page.test.tsx` pass; live anon query returns 104 rows;
      all tab match needles resolve uniquely.
- [x] T4 — Commit/push UI work unit: `1de5420`. **Deployment is a separate
      gate and remains pending:** notify the DevOps first per
      `DEPLOY_TOPOLOGY.md`; do not deploy directly.

## Acceptance criteria

1. Education page retains the existing Indicadores view and adds a separate
   "Pruebas PISA 2025" tab.
2. Tab reads the PISA rows from Supabase (not hardcoded numbers); compares
   Córdoba vs Nacional and OECD where available.
3. Missing OECD score means render `—` (not fabricate it); context metrics are
   shown only when present.
4. `npx tsc --noEmit`, `npx vitest run src/app/educacion/page.test.tsx`, and
   `npm run build` pass.
5. No deploy without prior DevOps notice.

## Evidence

- Data verification: 104 rows, no duplicates; 14 Córdoba values verified (434
  science / 417 reading / 393 mathematics / 441 digital).
- Anonymous DB read: 104 rows returned with the same query the page uses.
- UI verification: LoginGate/page tests 6/6 passed; tsc exit 0; full production
  build completed successfully.
- Matching verification: no ambiguous indicator-name matches; OECD mean-score
  gaps intentionally render `—`.
