# ddna-dashboard — accumulated knowledge (from Engram)

> Migrated from Engram persistent memory on 2026-10-29. 70 entries.
> This is distilled knowledge from past working sessions: decisions, bug fixes, architecture notes, conventions, and discoveries.

## pattern (1)

### Slide de PISA 2025 agregada al deck de indicadores de ninez
_*date: 2026-10-06 19:13:36 · engram id: 68*_

**Qué**: Agregué una diapositiva de PISA 2025 al deck "Infancia: qué dicen los datos" (Defensoría DDNA Córdoba, octubre 2026), insertada como slide 18, después de "Aprender 2024" y antes de "Conclusiones". También agregué la cita de la fuente a la slide final (21, "Fuentes").

**Where**:
- Entrada: `C:\Users\Usuario\Downloads\indicadores niñez 2026 muna_DDNA.pptx`
- Salida: `C:\Users\Usuario\Downloads\indicadores niñez 2026 muna_DDNA + PISA.pptx`
- Backup: `...ORIGINAL.pptx` (hash MD5 idéntico al original, verificado)
- Scripts reproducibles: `C:\Users\Usuario\vps-tmp\pptx\build2.py` (build), `export2.ps1` (render), `chk.py` (verificación)

**Contenido**: eyebrow "Educación · PISA 2025"; título "PISA 2025: Córdoba supera al promedio nacional en las 4 áreas, pero lejos de la OCDE"; barras Córdoba 441/434/417/393 vs Nacional 403/393/389/367 en escala declarada 300-500; tarjeta ámbar "36% alcanza al menos el nivel básico en Matemática (OCDE: 65%)"; tarjeta verde "Ventaja sobre el país".

**Design system del deck**: slide 10.00x5.62 in; layouts TITULO/CONTENIDO/CIERRE/DEFAULT; eyebrow = roundRect adj=50000 blanco + borde 0B196D 1pt, punto de color + etiqueta Montserrat 10pt bold 0B196D; título = placeholder del layout 24pt bold; tarjetas = rectángulos rellenos sin borde (EAF1FF, E1F7EC, FBE6F0, FEF1D2, F2F4FA); número grande 32pt bold; footer 10pt 5B6280; acento Educación = 3777FF. Paleta: navy 0B196D, muted 5B6280, azul 3777FF, magenta BF1363, verde 16C172, ámbar F3A712.

**Learned (gotchas que costaron tiempo)**:
- **Nunca nombrar un script `inspect.py`**: le tapa el módulo `inspect` de la stdlib a lxml y rompe `import pptx` con un "circular import" engañoso.
- **PowerShell 5.1 lee los .ps1 como ANSI**: un `ñ` en una ruta dentro del script lo rompe con FileNotFoundException. Copiar a ruta ASCII y exportar desde ahí.
- **Renderizar es imprescindible**: PowerPoint por COM (`New-Object -ComObject PowerPoint.Application` + `Slides.Item(n).Export(png,"PNG",1600,900)`), porque no hay LibreOffice ni pywin32. Sin ver la imagen no hubiera detectado ni el título pisado en la tarjeta ni la falta de número de página.
- **python-pptx NO copia el placeholder SLIDE_NUMBER del layout** al agregar una slide: hay que clonarlo a mano desde una que lo tenga.
- **Clonar formas existentes > re-crearlas**: deepcopy del XML de las formas de otra slide para heredar rellenos, bordes, radios y tipografías idénticas.
- **Cuidado con escalas truncadas**: la primera versión usó escala 350-460 para puntajes PISA, haciendo que una diferencia real del 9% se viera como barras al doble. Se pasó a 300-500 con la escala declarada en el subtítulo.
- Insertar slide en posición: `add_slide()` agrega al final; mover con `prs.slides._sldIdLst.remove(...)` + `.insert(n, ...)`.
- **Al agregar un ítem a un cuadro de texto hay que verificar el desborde**: la 7ª fuente chocaba con los cuadrados de color del pie; se subió el bloque (etiqueta 1.70→1.42, cuadro 2.05→1.78).

## architecture (9)

### Migrated formularios + respuestas from Supabase Cloud to self-hosted VPS (byte-verified)
_*topic: `supabase/migration-cloud-to-vps` · date: 2026-09-23 14:14:47 · engram id: 4*_

**What**: Completed the cloud -> self-hosted VPS data migration for the form domain: all 3 formularios (including the 10257-char `definicion` with 7 bloques/44 campos) plus 7 missing responses and an overwrite of response 58636bc7. Every row verified byte-exact against md5 anchors computed by cloud.

**Why**: The VPS only had a stub definition `{"logic": [], "fields": [], "bloques": [], "version": 1}` (md5 c6351375...), so the form was empty there. Cloud was the only place where the real definition existed. User chose full parity: "Todo, dejando la VPS idéntica a cloud".

**Where**: VPS `deploy@179.199.132.207`, docker `supabase-db`, db `postgres`, user `supabase_admin`. Tables `public.formularios`, `public.respuestas_formulario`. Backups in `/home/deploy/migration-backup/` (formularios-20260923T140254Z.sql restores the stub; respuestas-20260923T141201Z.sql restores the old 58636bc7 payload). Scripts: `/home/deploy/mig_forms.sh`, `/home/deploy/mig_resp2.sh`. Local verified payload: `%TEMP%\opencode\cloud_58636bc7.b64`.

**Final verification**: formularios 3/3 md5 match (e302f941..., f6a07d95..., 49ea90b4...); respuestas 10 rows, orphans=0, VERIFY_OK rows=8, 58636bc7 md5=4733344f0a939d6fb8e991f9ed268b63; trigger update_formularios_updated_at restored to 'O'. Full-DB exact counts: identical except ai_usage_logs (33/29), indicadores (21149/22482, VPS live-ahead), respuestas_formulario (9/10, extra row 650bd093).

**Learned (gotchas that cost real time)**:
1. `ssh ... "bash -s"` feeds the script on stdin, so any `docker exec -i` inside it CONSUMES THE REST OF THE SCRIPT. The script dies silently after the first such command. Fix: `tr -d '\r' > /tmp/x.sh && bash /tmp/x.sh` so stdin stays free.
2. The cloud and VPS copies of 58636bc7 differ in bytes (2470) but render IDENTICALLY in tool output. Transcribing accented JSON text by hand produced a THIRD md5 (8deb05f6...) instead of cloud's 4733344f... . Never transcribe JSONB text: emit `replace(encode(convert_to(x,'UTF8'),'base64'), E'\n','')` from cloud, verify md5 LOCALLY on the decoded bytes, then let Postgres decode with `convert_from(decode(...,'base64'),'UTF8')::jsonb`.
3. `update_formularios_updated_at` (BEFORE UPDATE) overwrites updated_at. Disable it only inside the transaction (`alter table ... disable trigger ...`) to preserve the source timestamp, then re-enable.
4. Anon/publishable REST can SELECT `formularios` but gets 42501 permission denied on `respuestas_formulario`, so responses cannot be pulled from cloud over REST. There is no secret/service key tool exposed by the supabase MCP.
5. Fail-closed pattern that worked: a temp `_exp(id, want_md5)` table + a DO block that `raise exception` on any mismatch, executed with `psql -1 -v ON_ERROR_STOP=1` rolls the ENTIRE batch back. Use it for any future payload transfer.
6. `set timezone 'UTC'` is invalid SQL (use `SET TIME ZONE` or `PGTZ=UTC`), and `tgenabled` is "char" so `|| tgname ||` needs an explicit ::text cast.

### Responses UI overhaul merged to main and pushed — ready for VPS deploy
_*topic: `odd/respuestas-ui-preview/tasks` · date: 2026-09-23 14:26:49 · engram id: 6*_

**What**: Feature COMPLETE AND ON MAIN. Fast-forward merge `380648b..c84150f` pushed to `origin/main`. User chose a direct merge to main instead of stacked PRs (and `gh` CLI is not installed on this machine, so PRs were not an option anyway).

**Why**: User wanted everything approved in one step so they could deploy to the VPS immediately.

**Where**: `https://github.com/lucasalvador98/ddna-dashboard.git` — remote `origin` is HTTPS (not SSH). `main` tip is now `c84150f`.

**Commits now on main**:
- `321e065` read-only renderer mode + bloques table preview columns (187 lines)
- `9659e1b` add form preview modal (144 lines)
- `c84150f` response detail as filled-in read-only form + ODD doc (301 lines)
632 authored changed lines total, each slice under 400. Feature doc with slice boundaries: `odd/tasks/respuestas-ui-preview.md`.

**Design decision (user, 2026-09-23)**: response detail = filled-in form, Google-Forms style — `FormRenderer` with `initialAnswers` + `readOnly`, grouped by `bloques`. Not a label/value sidebar.

**Verified**: `npx vitest run src/components/formularios src/app/formularios` exit 0 (4 files / 29 tests); `npx tsc --noEmit` exit 0; eslint 0 errors on touched files. Full suite 437 passed / 1 failed — `tests/docker-infrastructure.test.ts`, PRE-EXISTING (Dockerfile untouched). `npm run lint` 7 errors, all pre-existing in `api/health/route.ts`, `lib/etl/validate.test.ts`, `lib/monitoreo/useMonitoreoDraft.test.ts`. An independent fresh-context verifier caught 2 real issues, both fixed: `formatValue` could still print `[object Object]` through arrays of objects (now routes elements through `formatScalar`), and a stale "JSON detail drawer" header comment.

**Learned / gotchas**:
- The repo has BOTH `origin/main` and `origin/master`, both sitting at `380648b` before this merge. After pushing `main`, `origin/master` is now BEHIND by these 3 commits — if the VPS checkout tracks `master`, `git pull` there will NOT bring the change. Confirm which branch the VPS tracks.
- `gh` CLI is NOT installed on this Windows machine — no PR creation possible without installing it.
- Prettier is NOT enforced: `.prettierrc` exists but no husky, no lint-staged, no CI workflow, and 17 untouched files under `src/lib/formularios` already fail `prettier --check` at HEAD. Do NOT run it as a normalizer.
- Native review UNAVAILABLE on this runtime: `gentle-ai review status` returned `immutable_review_transport_unsupported` (`next_action: stop`; supported runtimes: claude-code, codex). No review transaction, no receipt. `gentle-ai review assess` works and returned `high/unassessable`, so the RDD-off path applied: writer self-verification + independent verifier.
- Route used: delegated direct (writer trigger, 11 files) + fresh independent verifier.
- 6 unrelated files stay UNCOMMITTED on the feature branch (mtimes 2026-09-16/17): `docker-compose.etl.yml`, `scripts/backfill.mjs`, `scripts/load-budget-march-2025.mjs`, `scripts/migrate-inversion.mjs`, `scripts/run-backfill.mjs`, `scripts/migrate-storage.mjs`. Not touched by this work, deliberately not committed.
- Local `main` branch was created during this merge; local HEAD was returned to `feature/respuestas-ui-preview`.

**Next**: user deploys the VPS themselves. Nothing pending on this feature.

### odd/storage-migration-hardening/tasks
_*topic: `odd/storage-migration-hardening/tasks` · date: 2026-09-23 15:50:57 · engram id: 17*_

**What**: Created the ODD feature document `odd/tasks/storage-migration-hardening.md` (mirrored here) for hardening `scripts/migrate-storage.mjs` before its first real run. 4 tasks.

**Why**: The Storage migration Cloud -> self-hosted has NEVER run: the self-hosted bucket `ddna-repositorio` holds 0 objects, and 13 of 16 `repositorio.url_storage` values still point at Cloud. The script is untracked and has defects that make an unattended run unsafe.

**Defects being fixed (all verified by reading the file)**:
1. No integrity verification — download/upload without size or hash comparison, so a corrupt upload logs as success. The earlier formularios data migration WAS md5-verified; this script loses that rigor.
2. `list('', { limit: 100 })` — root prefix only, no pagination: silently misses subfolders and silently truncates past 100 files.
3. Hardcoded fallbacks: `CLOUD_SUPABASE_URL || 'https://ppyyqrvirjqmfpqaqnxy.supabase.co'` (line 29) and `NEXT_PUBLIC_SUPABASE_URL || 'http://179.199.132.207:8000'` (line 24).
4. `.not('url_storage','is',null)` skips the 3 NULL rows, which stay without a URL forever, silently.
5. No rollback and no run record: a mid-run failure leaves a partial bucket plus a partially rewritten DB with no non-zero exit signal.

**Tasks**: T1 harden the script (edit surface `scripts/migrate-storage.mjs` only) -> T2 run `--dry-run` and verify zero writes -> T3 present the plan and stop (the real transfer is separately gated) -> T4 commit as a work unit (pending explicit go-ahead; a second session has been operating git on this worktree).

**Acceptance criteria**: config guard with no fallbacks and an abort if both URLs resolve to the same origin; complete recursive paginated listing; per-file integrity verification; explicit handling of the 3 NULL `url_storage` rows (never invent a URL); a per-file run record; dry-run fidelity with zero writes.

**Constraints**: must stay idempotent, must NEVER delete from the Cloud bucket, must exit non-zero on any failure. Out of scope: schema changes, the JWT rotation, the real transfer, the other 5 modified scripts + docker-compose.etl.yml (user's separate uncommitted work), and the 4 hardcoded Cloud Storage URLs in `src/` (public bucket, no key needed).

**Hard constraint restated**: the Cloud project must stay alive — the VPS app's repository download links depend on the Cloud bucket because 0 files exist in the self-hosted bucket. Nothing in this feature may delete or disable the Cloud side.

### Repositorio downloads switched to self-hosted Supabase storage URLs
_*topic: `repositorio-storage-host` · date: 2026-09-25 12:44:00 · engram id: 25*_

**What**: Repositorio document downloads now use the self-hosted Supabase storage URL instead of the hardcoded Cloud host `https://ppyyqrvirjqmfpqaqnxy.supabase.co`.
**Why**: Storage data was migrated from Supabase Cloud to the self-hosted instance (http://179.199.132.207:8000). `repositorio.url_storage` already holds a full, percent-encoded self-hosted URL; the old code stripped the host and rebuilt against Cloud, defeating the migration and double-encoding filenames.
**Where**: src/app/repositorio/repositorio-client.tsx, src/components/repositorio/repo-file-card.tsx, src/components/repositorio/repo-file-row.tsx (now `const url = file.url_storage` directly), src/app/api/repositorio/chat/route.ts `buildSources` (now `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ddna-repositorio/${encodeURIComponent(nombre)}`).
**Learned**: `NEXT_PUBLIC_SUPABASE_URL` is the single source of truth for the self-hosted base URL across the app. Remaining `ppyyqrvirjqmfpqaqnxy` references are only comments in lib/rag/process-document.ts and lib/mockIndicadores.ts (not call sites). Pre-existing uncommitted migration work exists in scripts/migrate-storage.mjs and odd/tasks/storage-migration-hardening.md.

### odd/auth-refactor/tasks
_*topic: `odd/auth-refactor/tasks` · date: 2026-09-25 13:44:22 · engram id: 30*_

**What**: ODD feature `odd/auth-refactor` created (mirrored here) for the auth/session refactor. 7 tasks. Authorized by the user after a read-only audit pinned both symptoms to deterministic root causes.

**User decision**: run the DIRECT plan (not SDD) — Ola 1 (security) + Ola 2 (session rewrite). SDD was available globally (assets + CLI present) but the repo has no `openspec/` store (sdd-status: unresolved, next: sdd-new); not used.

**Root causes being fixed**:
- Symptom A (login hangs, refresh fixes it): `login/page.tsx:24` loading never reset on success (only router.push L49 exits); `login-gate.tsx:124-128,157` role/roles fetch have no timeout/AbortController so a hung server chain leaves permsLoaded=false; config fetch L82-86 no timeout.
- Symptom B (stale header after signout): `auth-provider.tsx:68-84` SIGNED_OUT branch keeps previous session/user; signOut() only fires that event so nothing nulls the session; no router.refresh/redirect.
- D2: `/api/auth/users/[id]/role` gated on checkAdminAuth (admin-only) -> 403 "Sin acceso" for editor/visor on every gated page.
- D6 (security, urgent): proxy skips /api/*; `/api/upload` no guard + service_role write; `/api/repositorio/chat` rate-limit only, exposes OpenAI spend + KB + web tools. Reachable by anon.
- D8: LoginGate resets configLoading in finally even with retry pending -> brief unprotected render.

**Tasks**: W1 guard open /api routes; W2 AuthProvider real SIGNED_OUT clears + signOut redirect (Symptom B); W3 login loading reset + router.refresh (Symptom A button); W4 LoginGate timeouts/AbortController (Symptom A spinner); W5 role endpoint readable by any authenticated user / server-side role gate (D2); W6 single auth-config source in proxy, remove client admin-table fetch (D8); W7 optional RBAC-base migrations.

**Constraints**: reuse existing checkAdminAuth; never expose INTERNAL_API_SECRET to browser; keep success shapes + upload/processing logic; strict TDD where tests exist; tsc 0 + tests green (one tolerated pre-existing Docker test failure); a second git session may be active so commit only our paths and rebase (never force). Google/OAuth login parked until the app has a domain + HTTPS.

### ETL PISA 2025 cargado en indicadores (104 filas) con fix de paginación
_*date: 2026-09-29 18:48:48 · engram id: 57*_

**What**: `scripts/load-pisa-2025.mjs` cargó 104 indicadores PISA 2025 (categoria=educacion, periodo=2025) en la tabla `indicadores` del Supabase self-hosted: Nacional 52, OCDE promedio 38, Córdoba 14. Fuente: 'OECD / PISA 2025' (+ ' + Córdoba (Región Adjudicada)' para filas Córdoba). Dataset verificado: `scripts/data/pisa-2025-argentina.json`.

**Why**: Absorber los resultados PISA 2025 (Argentina/Córdoba región adjudicada) en la sección educación del tablero.

**Where**: `scripts/load-pisa-2025.mjs` (nuevo), reusa `scripts/config.mjs`, `validateRows` y `upsertRows` de `scripts/etl-runner.mjs`. Patrón: dry-run por defecto, `--apply`/`--commit` para escribir; insert-if-missing por clave natural `indicador_nombre|periodo|region|fuente`.

**Learned**: Bug crítico de idempotencia: la tabla `indicadores` tiene >22k filas y PostgREST pagina a 1000 filas por defecto; un pre-check `select` sin `.eq('categoria')`/`.eq('periodo')` no ve las filas más nuevas → segunda ejecución duplicó 104→208. Fix: scope por categoria+periodo + `.limit(10000)`. Además, la DB viva NO tiene índice único en la clave natural (upsertRows cayó al fallback de insert en lotes con warning "Índice único no encontrado") — la idempotencia depende del pre-check del script; convendría migración con unique constraint. Las migraciones SQL del repo están desactualizadas respecto al esquema vivo (la tabla real usa columnas planas: indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, ultima_actualizacion, activo).

### odd/pisa-2025-education-tab/tasks
_*topic: `odd/pisa-2025-education-tab/tasks` · date: 2026-09-30 13:11:49 · engram id: 58*_

**What**: ODD tracking for the PISA 2025 Education sub-tab. Dataset and ETL already committed; UI implementation is in the working tree, verified; deployment must wait for DevOps notice.

**Data**: OECD PISA 2025 Results Vol I, Argentina Country Note DOI 10.1787/e2019444-en (2026-09-08) + Córdoba Región Adjudicada jurisdiction report. Source file `scripts/data/pisa-2025-argentina.json`. DB rows `indicadores` (categoria=educacion, periodo=2025, fuente LIKE '%PISA%') — 104 rows, 52 Nacional / 38 OCDE promedio / 14 Córdoba. Córdoba: 434 science, 417 reading, 393 math, 441 digital; differences vs national +41/+28/+26/+38. No locality-level data.

**Commits already pushed**: `57c012d feat(educacion): ETL + dataset for PISA 2025 (Argentina, Cordoba, OECD)`.

**UI**: Worker implemented a top-level `Indicadores | Pruebas PISA 2025` switch in `src/app/educacion/educacion-charts.tsx`, `PisaTab` component in `src/components/educacion/pisa-tab.tsx`, and server query/prop in `src/app/educacion/page.tsx`; test fixture updated. Sections: score comparison, Córdoba-vs-national delta, level-2 proficiency table, national context cards. Runtime reads from DB; never hardcodes values.

**Verification**: `npx tsc --noEmit` exit 0; `npx vitest run src/app/educacion/page.test.tsx` 6/6; `npm run build` passed; anonymous read of same query returns all 104 rows; match audit found 0 ambiguous matches and expected OECD mean-score holes show as `—`.

**Tasks**: T1 data capture done; T2 ETL/load done; T3 UI done and verified; T4 commit/push UI work unit pending; deploy is a separate gate and MUST wait until DevOps is notified (per `DEPLOY_TOPOLOGY.md`). User said they plan to do the sub-tab later, then said continue with pending — UI is now ready locally, awaiting commit/deploy policy.

### PISA 2025 education sub-tab committed; deploy waits for DevOps
_*topic: `pisa-2025-education-tab-deploy-gate` · date: 2026-09-30 13:14:48 · engram id: 59*_

**What**: Committed and pushed the PISA 2025 sub-tab UI + ODD task doc to `main`. User approved commit/push (`dale`); did NOT deploy because of the golden DevOps boundary.

**Commits**: `1de5420 feat(educacion): add PISA 2025 sub-tab for Argentina and Cordoba` (page query + tab UI + PisaTab + test fixture + ODD task doc); `cfc2004 docs(odd): record PISA UI commit and DevOps deploy gate` (T4 completion).

**UI**: server page queries `indicadores` for categoria=educacion, periodo=2025, fuente like PISA; client tab switch Indicadores / Pruebas PISA 2025; sub-tab renders score comparison, proficiency, policy context. Data reads from DB, not hardcoded. Verified before commit: tsc exit 0, education page tests 6/6, npm run build passed, anonymous Supabase query returns 104 rows, matching audit had no ambiguous indicator_name hits.

**Deploy is NOT done**: `DEPLOY_TOPOLOGY.md` is authoritative; each tablero deploy must notify DevOps first. New code is on origin/main, but the active Caddy/observatorio-candidate deployment must be updated by/with DevOps. Do not run deploy.sh or change infra directly.

### ODD salud-2024-actualizacion: plan, fuentes y alcance aprobado
_*topic: `odd/salud-2024-actualizacion/tasks` · date: 2026-10-07 13:52:34 · engram id: 77*_

**Qué**: Nuevo documento ODD para la actualización de Salud 2024: `odd/tasks/salud-2024-actualizacion.md`. Espejo Engram: topic_key `odd/salud-2024-actualizacion/tasks`.

**Alcance aprobado por el usuario** (2026-10-07): actualizar TODO lo que tenemos a 2024, cargar datos nuevos para mostrar a futuro, y UI con propuestas de gráficos nuevos.

**Fuentes estructuradas verificadas** (mejores que los PDFs, porque `pdftotext -layout` MEZCLA FILAS en los cuadros de estos PDFs — tablas con corte de línea; extraer de ahí es inventar datos):
- `defuncion2024.csv` (47.527 filas, delimitador `;`): muertes 2024 × jurisdicción × causa CIE-10 (1.053 causas distintas) × sexo (1 masc/2 fem/3 indet/9 desc) × 6 grupos de edad (01.De a 0 a 14, 02.De 15 a 34, 03.De 35 a 54, 04.De 55 a 74, 05.De 75 y más, 06.Sin especificar) × flag muerte materna (M=materna, T=tardía, NA). 26 jurisdicciones. URL: `https://datos.salud.gob.ar/dataset/27c588e8-43d0-411a-a40c-7ecc563c2c9f/resource/28e2aef4-c536-43bc-a098-0bdfb9d7933c/download/defuncion2024.csv`
- `serie-historica-defunciones-ocurridas-argentina-jurisdiccion-1914-2024.xlsx` — ya se puede actualizar la serie histórica a 2024.
- `base_def_2024_mensual.csv` — defunciones mensuales 2024.

**Tareas del doc**: A1 (serie histórica a 2024), B1 (defunciones por sexo/edad), B2 (causas de muerte — dimensión NUEVA), B3 (muerte materna desde el MISMO CSV, evita el cuadro 40 del PDF), B4 (fecundidad adolescente 2013-2024 del Boletín 175 cuadro 5 — solo PDF, requiere pdfplumber), C1 (propuestas de gráficos), C2 (implementar UI).

**Learned**: el único dato valioso que SOLO existe en PDF es la fecundidad adolescente 2013-2024 por jurisdicción (Boletín 175 cuadro 5) y la mortalidad materna por jurisdicción (anuario cuadro 44). La muerte materna 2024 se puede derivar del CSV de defunciones con el flag, sin tocar el PDF. En CKAN de salud TAMBIÉN hay: TMI 1990-2024, Tasa de Natalidad, Tasa de mortalidad fetal 2024, serie de nacimientos 1914-2022 — las que ya tenemos cargadas del ciclo anterior.

## decision (16)

### Segundo proyecto Supabase: stack aislado dentro de la VPS
_*topic: `infra/supabase-vps-multi-proyecto` · date: 2026-09-23 13:50:37 · engram id: 3*_

**What**: Decidido que un futuro segundo proyecto en Supabase debe correr dentro de la misma VPS, con auth/usuarios aislados del stack actual (supabase.ddna.com.ar) → requiere un stack de docker compose propio en puertos alternativos.
**Why**: El usuario confirmó que el nuevo proyecto necesita sus propios usuarios de auth aislados; compartir stack (mismo GoTrue/JWT/Storage) queda descartado.
**Where**: VPS (fuera de este repo); repositorio relacionado: ddna-dashboard, docker-compose.*.yml son solo la app Next.js.
**Learned**: Opción alternativa si falta RAM: compartir el contenedor Postgres con una segunda database y duplicar solo servicios stateless; verificar RAM de la VPS antes de arrancar el segundo stack.

### User wants full login refactor; symptoms: infinite login hang + stale sign-out text
_*date: 2026-09-25 13:32:57 · engram id: 28*_

**What**: The user wants the login/auth system refactored, not just patched. They reported two concrete UX symptoms and a future goal.

**User-reported symptoms (verbatim intent)**:
- Symptom A: "no te deja ingresar rápido, queda cargando infinitamente, tenés que refrescar la página para que te deje pasar" — after entering credentials the app hangs on an infinite spinner; only a manual refresh gets them in.
- Symptom B: "cuando cerrás sesión del botón del margen superior derecho el texto se queda bugeado y no sabés si cerró o no. Todo tenés que refrescar para saber" — sign-out leaves stale/garbled header text, user can't tell if logout worked, must refresh to see the truth.

These map to the catalogued open auth defects: AuthProvider keeps the previous session on SIGNED_OUT (#4, masks failures, causes stale header), LoginGate shows an infinite loading / "Sin acceso" dead-end instead of redirecting to /login (#5), and transient config failure defaults to auth-enabled → false lockout (#6). A full auth audit is running (task started 2026-09-25) to root-cause both symptoms with file:line evidence.

**User's target**: "lo refactorizaría completo y le agregaría algún servicio para autenticar en el futuro, como Google."

**Google OAuth — clarified**: does NOT require Google DNS. It is standard OpenID Connect via Supabase's Google provider (needs a Google Cloud OAuth 2.0 client ID/secret + redirect URI back to the Supabase auth callback). The real blocker is that the app is served from a raw IP over HTTP (`http://179.199.132.207`), and Google rejects non-localhost http:// redirect URIs — so Google sign-in requires the app to have a real domain with a valid HTTPS cert (any domain, not a Google service). The VPS already has infra; a domain + TLS (e.g. via Caddy/Traefik, or the existing monitoring domain) would be the prerequisite. This is a product/infrastructure decision, not a DNS-provider decision.

**Approach agreed**: audit-first (read-only) before deciding between a session-layer rewrite vs targeted fixes — the user explicitly chose the audit path.

### Auth refactor accepted by user; W1-W5 complete
_*date: 2026-09-25 14:10:17 · engram id: 32*_

**What**: User verified in the browser that the auth refactor fixed both symptoms — "quedo genial". W1-W5 (odd/auth-refactor) is now COMPLETE and accepted. Acceptance criteria all met in production (VPS HEAD 05f2135).

**Confirmed working by the user**: login no longer hangs (Symptom A) and sign-out clears the header + redirects to /login without a manual refresh (Symptom B).

**What remains open across the session**:
- W6 (single auth-config source in the proxy, remove client admin-table fetch) — deliberately deferred; most invasive, D8 already mitigated in W4. Needs a dedicated session + product decision.
- W7 (optional) — move RBAC base tables (user_roles/roles/settings) into migrations for auditability.
- Small cleanups: `/api/indicadores` orphan route returns 500 (embed of `datos_indicadores` has no FK; zero callers) — fix or delete; `deploy.sh` PostgREST warmup always prints 5x 403 because it probes the root endpoint (anon can't introspect) — cosmetic false alarm.
- Uncommitted work still sitting in the tree: docs (README.md, PROJECT_STATUS.md — updated to VPS/self-hosted reality), the hardened `scripts/migrate-storage.mjs` + odd/tasks/storage-migration-hardening.md, the env-var fixes in backfill/run-backfill/load-budget-march-2025/migrate-inversion, and two throwaway `scripts/tmp-*.mjs` helpers that should be deleted.
- `master` branch is stale (3 behind main) and can be deleted.
- A second git session has been pushing to this repo; coordinate before committing the backlog.

**Google/OAuth login**: parked until the app has a real domain + HTTPS (Google rejects non-localhost http:// redirect URIs; the app currently runs on a raw IP over HTTP). No Google DNS required — any domain + TLS works.

### Google login parked until domain exists; auth refactor accepted
_*date: 2026-09-25 14:11:12 · engram id: 33*_

**Decision (user, 2026-09-25)**: Do NOT implement Google/OAuth login yet. Parked until the project has a real domain. "por ahora no vamos a usar google hasta que no tenga el dominio". Reinforces the earlier finding: Google OAuth needs a real domain + HTTPS (the app runs on raw IP http://179.199.132.207, and Google rejects non-localhost http:// redirect URIs). No Google DNS required — any domain + TLS works. The auth refactor (odd/auth-refactor, W1-W5) is complete and user-accepted; Google would be a separate future feature once DNS/domain exists.

Also confirmed by user: after the W1-W5 refactor, "quedo genial" — both login symptoms (infinite loading on login, stale header on signout) are fixed in production.

### GOLDEN RULE: DevOps owns multi-site/edge; nosotros solo el tablero; avisar antes de cada deploy
_*date: 2026-09-28 19:26:44 · engram id: 51*_

**=== DIVISIÓN DE RESPONSABILIDADES (decisión del usuario, 2026-09-28) — DE ORO, LEER PRIMERO ===**

**Hay un DevOps que maneja el multi-sitio. Nosotros nos encargamos SOLO del tablero.**

- **DevOps = dueño de**: Caddy / edge router, orquestación de puertos, dominios, DNS, HTTPS/certificados, WordPress, `ddna-infra` (proyecto `ddna-controlled`), topología de red, y cualquier deploy que afecte la infraestructura compartida. Es el UNICO autorizado a tocar compose de infra, puertos, 80, DNS, 443, certificados, y a aplicar `compose.production.yml`.
- **Nosotros = dueños de**: el código y deploy del TABLERO únicamente. NO tocar el edge/infra compartida salvo que el DevOps lo pida expresamente.

**RUTA DEL TABLERO**: el tablero vive en `http://179.199.132.207/observatorio/` (served by el contenedor `ddna-observatorio-candidate` en la red `ddna_frontend`, vía Caddy). YA NO es la raíz `http://179.199.132.207/` (eso es WordPress) ni el contenedor `ddna-dashboard-app-1` viejo (detenido a propósito el 2026-09-26 para liberar el puerto 80 que ahora ocupa Caddy; exit 143 = SIGTERM limpio, NO es una caída).

**REGLA DE ORO — DEPLOY**: **CADA VEZ que necesitemos hacer un deploy del tablero hay que AVISAR al DevOps primero.** Nunca desplegar directo. Ademas:
- NO arrancar el contenedor `ddna-dashboard-app-1` viejo (choca con Caddy por el puerto 80).
- NO aplicar `compose.production.yml`, NO cambiar DNS/443/certificados, NO ejecutar `cutover.py` de nuevo, sin nueva instruccion explicita del DevOps.
- NO ejecutar `deploy.sh` en los checkouts historicos del VPS.
- El "deployment activo" es un PREVIEW por IP (sin HTTPS). La imagen HTTPS esta preparada pero NO es la activa. CI/CD esta preparado pero sin primer deploy.

**Docs de referencia en el VPS** (leer antes de tocar infra): `/home/deploy/ddna-infra/ACTIVE_DEPLOYMENT.md`, `CONTROLLED_DEPLOY_STATUS.md`, `CONTROLLED_ROLLBACK.md`, `PRE_DEPLOY_AUDIT.md`, `IP_PREVIEW_REPORT.md`, `DNS_HANDOFF.md`. `ACTIVE_DEPLOYMENT.md` es el que manda ("estado actual validado").

**How I read the incident**: el corte fue LIMPIO y documentado (adjuntos de despliegue con hashes SHA256, plan, rollback, auditoria previa). El unico "problema" fue que el dashboard quedo detenido al liberar el 80 — pero eso es exactamente lo que el DevOps planeo, y el tablero ya esta arriba en /observatorio/. Conclusion: el rollout multi-sitio fue exitoso; nos影响的 solo fue el cambio de URL y que debimos enterarnos (el devops cambio la topologia).

### Poverty pilot removed with native review; review schema requires strict field names
_*topic: `pobreza-pilot-removal-review` · date: 2026-09-30 17:04:25 · engram id: 60*_

**What**: Ola A completed — removed the unconsolidated "Piloto" prototype from /pobreza. `src/app/pobreza/pobreza-pilot.tsx` deleted (−116 lines), its import + integration block stripped from `src/app/pobreza/page.tsx` (−10), stale doc reference at docs/AUDITORIA_CRITICA.md:17 updated. Commit `d85c69f`, pushed, working tree clean. The production Poverty dashboard (KPIs, evolution chart, periods table, UCA charts, FilterBar) is byte-identical.

**Native review (RDD)**: lineage `review-0b1fd10015ad6ac0`, lens `review-reliability`, verdict approved, one non-blocking SUGGESTION (`R3-doc-stale-pilot-reference`: docs/AUDITORIA_CRITICA.md:44 still says "lo reflejamos en el piloto"), then acknowledged and authority burned (delivery = ordinary repository policy). The advisory finding is separate later work, NOT a reason to re-review.

**LEARNED (harness/friction worth remembering)**:
- `gentle_review_capture` (the Pi wrapper tool) kept re-serializing the opaque collect binding as an object although the schema demands a JSON **string**; repeated attempts failed identically. The working path was the native CLI: `gentle-ai review status --next-transition=true` to read the binding, then `gentle-ai review capture-result --lineage=… --expected-revision=… --target=… --repository-context=… --lens=… --order=… --subject-hash=… --agent=pi --input=<path>`, then `gentle_review {"operation":"acknowledge-approved","lineageId":…}`.
- The native reviewer schema (`gentle-ai review schema reviewer`, `additionalProperties:false`) is strict and NOT the shape the reviewer subagent produced. Required: `subject_hash`, `inspection{status,paths}`, `findings[{location "path:line", severity BLOCKER|CRITICAL|WARNING|SUGGESTION, claim, proof_refs[], id "R3-…"}]`, `evidence[]`. Rejected: `order`, `selected_order`, `lineage_id`, `authority_revision`, `target_identity`, `file`, `line`, `description`, `verdict`, `summary`. Findings severity `low` must map to `SUGGESTION`; `file`+`line` must merge into `location`.
- `subagent_run` on the `review-reliability` agent failed with "unsupported input field"; running the lens through `gentle-ai-explore` with explicit review instructions worked.
- Lens subagents have no write tool, so the artifact must be persisted by the parent to a file before `--input`.

**Still pending for the user**: notify DevOps for a single coordinated deploy (PISA sub-tab `1de5420` + poverty removal `d85c69f`; note the auth-refactor fixes W1-W7 are in main but the ACTIVE image `ddna-dashboard:observatorio-candidate` was built 2026-09-25, BEFORE those fixes, which explains "el problema del login sigue presente").

### PR #3 del DevOps mergeado: fixes de basePath en login y repositorio
_*date: 2026-10-06 19:34:51 · engram id: 69*_

**Qué**: Revisé y mergeé el PR #3 del DevOps (LautyUCC, rama `recovery/dashboard-vps-fixes` @ `feb942a`) contra `main` @ `4a9a9d3`. Merge commit `f439ea1`.

**Qué trae**: completa los DOS call sites que quedaban con href crudo y escapaban del basePath `/observatorio`:
1. `src/lib/auth-proxy.ts` — el redirect a `/login` usaba `new URL('/login', request.url)`, que con basePath manda al ROOT del dominio (WordPress) en vez de `/observatorio/login`. **Esto afectaba el login: entrabas sin sesión a una ruta protegida y te tiraba fuera del tablero.**
2. `src/app/repositorio/chat/page.tsx` — el link "Ver documentos" iba a `/repositorio` en vez de `/observatorio/repositorio`.
3. `src/components/auth-provider.tsx` — `loading` ahora arranca en `isSupabaseConfigured` (false cuando no hay Supabase) en vez de `true` + efecto que lo baja; elimina el parpadeo.
Plus 157 líneas de tests de regresión (auth-provider, auth-proxy, app-path).

**Verificación previa al merge** (en worktree aislado `C:\Users\Usuario\ddna-pr3-review`, con node_modules en junction para no molestar la otra sesión git):
- Los 3 archivos de test nuevos: 8/8 pass
- `tsc --noEmit`: exit 0
- Suite completa: 437 pass / 9 fail — EXACTAMENTE lo que decía el PR (+8 pass, mismos 9 fallos pre-existentes: salud mocks, docker, chat API)

**Cheque crítico que hizo falta**: el PR usa `dashboardPath` de `@/lib/app-path` SIN agregar ese archivo. Verifiqué que ya existe en main (era del trabajo de auth W1-W7) y que `chat/page.tsx` ya lo importaba. Si no hubiera existido, el PR habría roto el build.

**Learned**:
- **Los `href` crudos NO los prefija Next con basePath** — solo `next/link` y el router. Cualquier `<a href="/ruta">` escapa del basePath. El helper `dashboardPath()` existe para eso y hay que usarlo en todos los hrefs crudos; el PR deja el patrón documentado en `src/lib/app-path.ts`.
- **Mergear a main dispara deploy de Vercel Production** (integración nativa de Vercel, NO un GitHub Action — verifiqué que no existe `.github/workflows/` en ninguna rama; DEPLOY.md lo documenta como "pending setup"). El usuario desconectó Vercel antes del merge, así que no publicó nada.
- El VPS queda UN COMMIT ATRAS tras este merge (4a9a9d3 vs f439ea1): el deploy del VPS es manual (`build-dashboard.py`), no se dispara con push.
- Al mergear preservé la autoría del DevOps con merge_method "merge" en vez de squash (era un solo commit con mensaje limpio); el mensaje del merge lo escribí en español coloquial con el resumen técnico.

### odd/dependency-security-remediation/tasks — ODD plan and task list
_*topic: `odd/dependency-security-remediation/tasks` · date: 2026-10-07 12:44:54 · engram id: 71*_

**Feature document**: odd/tasks/dependency-security-remediation.md (ACTIVE, branch fix/dependency-vulnerabilities)

**Objective**: reduce vulnerability surface of ddna-dashboard as far as safe; document the rest.

**Plan (T1-T6)**:
- T1 Baseline verification (build + lint + test:run) on the audit-fix lockfile -> gentle-ai-verify.
- T2 Commit the audit-fix lockfile as work unit A.
- T3 Upgrade next + eslint-config-next to exactly 16.4.0 (preserves exact pins; brings postcss 8.5.23 + sharp ^0.35.4), re-run npm audit.
- T4 Add overrides.image-size=^2.0.4 (patched; pptxgenjs never loads it: dist requires only jszip + sizeof) + PPTX embedded-image smoke test.
- T5 Move shadcn CLI from dependencies to devDependencies (app never imports it); npm prune extraneous.
- T6 Final delegated verification (lint, test:run, build, npm audit, npm audit --omit=dev) + remaining commits (no push).

**Accepted risks (do not force)**: braces 3.0.3 via shadcn/eslint-config-next/ts-morph (dev-only, no upstream patch; npm fix = shadcn@1.0.0 downgrade); sprintf-js via mammoth->argparse (argparse only in mammoth CLI, not in the library path src/lib/rag/extractors/docx.ts; npm fix = mammoth 0.3.29); xlsx 0.18.5 (no npm fix; scripts/load-*.mjs only; CDN tarball decision deferred to deploy coordination).

**Constraints**: no npm audit fix --force; next/react pins keep exact; deploy out of scope (AGENTS.md requires DevOps notice).

### odd/react19-hooks-lint/tasks - DONE: lint 0 errors, no suppressions
_*topic: `odd/react19-hooks-lint/tasks` · date: 2026-10-07 13:09:51 · engram id: 73*_

**Feature document**: odd/tasks/react19-hooks-lint.md - STATUS DONE (2026-10-07), branch fix/react19-hooks-lint from main 14ca970, one work-unit commit (see git log), not merged/pushed.

**Result**: npm run lint now exits 0 with 0 errors (was 23 errors / 61 warnings; now 0 errors / 60 warnings). Full suite unchanged at 39 files / 446 tests with the same 9 pre-existing failures; build exit 0 (TypeScript clean). Exactly the 14-file surface; no eslint-disable added (an obsolete pre-existing one was removed); no config change; no new deps.

**KEY FINDING (rule false positive)**: react-hooks/set-state-in-effect in eslint-plugin-react-hooks 7.1.1 flags ANY effect-invoked function with a direct setState, INCLUDING after await (empirically probed). Post-await state application is legitimate React. Fix used the pattern the rule endorses: 7 fetch effects (geo-maps x4, fuentes-client, monitoreo-dashboard, monitoreo-table) apply state in .then/.catch/.finally with derived loading + reloadKey retries - no suppressions. Revisit if the plugin gains await awareness.

**Other fixes**: set-state-in-effect rendering-time prop->state sync (select-field, repo-file-drawer), mount-only-while-open modal (report-modal), login-gate user-gated reads, use-dashboard-data env-derived initial state; immutability x2 (declaration order in repositorio/chat/page.tsx); purity x1 (Date.now out of render in monitoreo-form); prefer-const x2 (api/health/route.ts); no-explicit-any x5 removed (validate.test.ts, useMonitoreoDraft.test.ts).

**Behaviour review (gentle-ai-verify, read-only)**: no newly introduced defect provable in any flagged area; two unguarded .catch error races preserved from baseline; geo-maps/monitoreo-dashboard have no cancellation guard (unchanged; React 19 no-ops post-unmount setState); spinner semantics of monitoreo-table/fuentes-client lack unit tests - browser spot-check recommended.

**Pending**: user merge decision for fix/react19-hooks-lint (and fix/xlsx-security-upgrade).

### odd/xlsx-security-upgrade/tasks - DONE: SheetJS 0.20.3 tarball, readFile break caught and fixed
_*topic: `odd/xlsx-security-upgrade/tasks` · date: 2026-10-07 13:10:15 · engram id: 74*_

**Feature document**: odd/tasks/xlsx-security-upgrade.md - STATUS DONE (2026-10-07), branch fix/xlsx-security-upgrade from main 14ca970, commit ac85766, not merged/pushed.

**Result**: xlsx replaced: npm 0.18.5 (frozen, 2 high advisories, no npm fix) -> official tarball https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz (0.20.3 == xlsx-latest on 2026-10-07; fixes: prototype pollution in 0.19.3, ReDoS in 0.20.2; ships own types; ZERO dependencies - lock dropped 8 legacy sub-deps: adler-32, cfb, codepage, crc-32, frac, ssf, wmf, word). npm audit: 13 -> 12 (xlsx gone; remaining = 9 dev braces chain + 3 mammoth/argparse/sprintf-js).

**KEY FINDING (regression caught before commit)**: the ESM build of xlsx >= 0.20 has NO fs helpers, so XLSX.readFile throws "Cannot access file" (probed: 0.18.5 ESM readFile OK; 0.20.3 ESM readFile fails; 0.20.3 ESM read(readFileSync(...), {type:'buffer'}) OK; CJS readFile OK in both). The 3 ETL scripts (load-budget-2025.mjs, load-budget-march-2025.mjs, migrate-inversion.mjs) were adapted to read(readFileSync(EXCEL_PATH), {type:'buffer'}) with an explanatory comment. xlsx is runtime, not script-only: src/lib/rag/extractors/xlsx.ts parses untrusted repository files; src/lib/formularios/xlsx.ts generates exports.

**New test**: src/lib/rag/extractors/xlsx.test.ts (vitest, @vitest-environment node) - 4 cases: round-trip buildXlsx -> extractTextFromXLSX and extractJSONFromXLSX, disk-read entry point, and a __proto__ header prototype-pollution guard (0.20.3 neutralizes it: key becomes __proto___NaN, prototype intact).

**Evidence**: focused test 4/4; suite 40 files / 450 tests with the same 9 pre-existing failures; cold build exit 0 (Next 16.4.0); npm ci clean install exit 0 + npm ci --dry-run exit 0 with identical lockfile sha256; eslint 0 errors on touched files.

**Risk**: new external host at install time (cdn.sheetjs.com) - app Dockerfile and ETL container (docker-compose.etl.yml, npm ci --ignore-scripts, mounts scripts/+package.json+package-lock.json+.senaf-cache) must reach it; Docker unavailable locally so the container path must be validated on next deploy/ETL run. Fallback if blocked: vendor tarball + file: reference + compose volume change (DevOps surface).

**Pending**: user merge decision for fix/xlsx-security-upgrade (and fix/react19-hooks-lint).

### PENDING: main protection decision (A/B/C/D + who applies) - nothing applied yet
_*date: 2026-10-07 14:01:46 · engram id: 79*_

**Pending decision (blocked by user meeting, 2026-10-07)**: main protection level + who applies it. NOTHING was applied on GitHub - main is currently unprotected.

**Context**: repo main == 0fdc229 (pushed). No automatic deploy path exists with the merged workflows: deploy.yml = workflow_dispatch only (inputs devops_notified + devops_notice, environment production, if github.ref == main); publish.yml = workflow_run on successful push/main CI only, publishes GHCR image by digest, environment image-build, no deploy; Vercel was disconnected from main by the user/DevOps. deploy/host/deploy.py recreates only the selected component (`up -d --no-deps --no-build --pull never`) and fails the release if any other managed container changes Id/Image/StartedAt - WordPress cannot be touched implicitly.

**The candados (prepared in-repo, NOT applied)**: deploy/main-protection.json (strict required check "Validate dashboard" - exists as the job name in ci.yml line 57; enforce_admins true; 1 required approving review with dismiss_stale_reviews; allow_force_pushes false; allow_deletions false); deploy/environment-policy.json (deployment_branch_policy custom: main only, wait_timer 0, prevent_self_review false); deploy/actions-policy.json (GitHub-owned + 2 pinned docker actions). deploy/configure-github.sh is DRY-RUN by default; --apply also loads VPS secrets over SSH (VPS_SSH_PRIVATE_KEY production, NEXT_PUBLIC_SUPABASE_ANON_KEY + NEXT_PUBLIC_SUPABASE_URL image-build) - that part needs SSH to the host and is NOT needed for protection-only scope.

**Options presented to the user**: A = full DevOps policy (PR + 1 review, max safety, needs a second approver); B = PR + CI check, no external review (recommended, solo-friendly, blocks direct pushes); C = minimal (block force-push/deletion only, direct pushes still allowed); D = leave as-is. Second question: who applies - (1) install gh locally via scoop/winget and apply with browser auth (gh NOT installed; winget and scoop available), (2) user runs generated commands, (3) DevOps runs configure-github.sh --apply (full, with secrets).

**Note**: applying A or B breaks direct pushes to main for this session and for the OTHER session active in this worktree (Salud 2024 work). Required-status-check context "Validate dashboard" must have run at least once (our push triggered CI).

### Hero de la home: banner único con h1/p sr-only y recorte 8:3 en mobile
_*topic: `ddna-dashboard/home-hero-banner` · date: 2026-10-14 19:41:51 · engram id: 86*_

**What**: El hero de `src/app/page.tsx` dejó de ser logo+título+subtítulo en HTML y pasó a ser el banner `public/logos/portada-observatorio-web.jpg` (2506x473), que ya trae logo, título y subtítulo dibujados.
**Why**: Evitar duplicar el contenido (el header ya muestra el logo) y que el diseño quede "orgánico". En mobile una franja 5.3:1 daría ~70px de alto con subtítulo ilegible.
**Where**: src/app/page.tsx (sección hero), src/app/page.test.tsx, public/logos/portada-observatorio-web.jpg (renombrado desde "portada pagina observatorio web (1).jpg").
**Learned**:
- Patrón accesible: `<h1 className="sr-only">Tablero de Monitoreo</h1>` + `<p className="sr-only">` con el subtítulo, y la imagen con `alt=""` (decorativa) para no duplicar el anuncio en lectores de pantalla.
- Recorte responsive con aspect FIJO: `aspect-[8/3] lg:aspect-[2506/473]` + `object-cover object-[77%_50%] lg:object-center`. Un `h-40` fijo NO sirve: la fracción visible depende del ancho y el título se corta en 320-375px. Con aspect fijo la fracción visible es constante (f=W_box/(H_box*5.299)).
- Geometría medida con sharp sobre el JPEG: título x 40.5%..86.3% (centro 63.4%), subtítulo x 45%..82.2%; marco negro en y≈9% y 92%, x≈3% y 97.5%.
- Verificado con Playwright a 320/375/640/768/1024/1440 px.

### Hero home: póster fundido en banda #ff7f11 — estado final aceptado (69563cf)
_*topic: `ddna-dashboard/hero-home-decision-pendiente` · date: 2026-10-14 19:53:11 · engram id: 87*_

**What**: Encabezado (hero) de la home: estado FINAL aceptado — póster fundido en una banda naranja `#ff7f11` con fade al gris del tablero. Commits `d2b1636` → `f0f1a86` → `106b83f` → `69563cf` en main (NO pusheados).
**Why**: El usuario rechazó dos iteraciones previas (póster full-bleed "mancha naranja"; póster en tarjeta blanca "recuadro feo"). El fundido con el color exacto del asset fue la opción que aceptó.
**Where**: src/app/page.tsx (hero), src/components/header.tsx (logo DDNA oculto en la home), public/logos/portada-observatorio-web.jpg.

## Estado final (69563cf)
- Hero: `<section className="relative">` con backdrop absoluto `linear-gradient(to bottom, #ff7f11 0%, #ff7f11 84%, rgba(255,127,17,0) 100%)` y el póster (`aspect-[8/3] lg:aspect-[2506/473]`, `object-[77%_50%] lg:object-center`) dentro de `pt-8 lg:pt-12 pb-12 lg:pb-16`.
- Clave del resultado: el margen del JPEG es #ff7f11 casi uniforme en los 4 bordes (medido con sharp), así que el póster se funde sin costura y el marco negro pasa a ser diseño. Sin tarjeta, sin ring/shadow, sin banda blanca.
- Header: logo DDNA oculto solo en la home (`pathname !== '/'`), en desktop y mobile; en mobile queda la varita de Córdoba.
- Verificado: 454/454 tests, `npm run build` OK, eslint 0 errores, tsc limpio, screenshots Playwright propio a 375 y 1440.

## Por si se retoma el diseño
- El asset sigue siendo un poster con texto horneado (no indexa, no escala). El rediseño "hero del sistema" (SectionHeader + texto HTML, póster a /login) sigue siendo el camino si DDNA no reemite el asset sin texto.
- Para mantener el fundido si se cambia el asset: volver a muestrear los bordes y actualizar el gradiente inline.
- Este documento reemplaza la deuda anotada antes: la opción A ya no está implementada; el estado pedido por el usuario es este.

### Push sincronizado: ETL anuario+VS en repo (70f9f86), informes ignorados, RAG session intacta
_*topic: `ddna-dashboard/etl-anuario-2025-vulnerabilidad` · date: 2026-10-19 14:01:30 · engram id: 91*_

**What**: Pull/rebase/push synchronizado con los cambios del otro equipo del usuario — ETL cargado al repo, informes ignorados.
**Where**: repo main — push 3de80e8..70f9f86. main quedó sincronizada con origin/main y SIN conflicto.
**Learned**:
- El otro equipo pushió 4 commits de AI (OpenAI fallback para chat/reports, gpt-6-luna, providers por env, harden tools en 'nil agent'→src/lib/agent). Rebase de los 4 commits locales del informe banner + commit nuevo de ETL encima: SIN conflictos.
- FLUJO del rebase con un worktree compartido ocupado por la sesión del RAG: git STASH push del trabajo tracked de la otra sesión (pobreza/seguridad/app-shell/filter-bar borrado), pull --rebase, stash pop — el WIP de la otra sesión quedó intacto y SIN commitear (igual que sus scripts audit-rag*/reindex*/desindexar y docs/REQUERIMIENTOS_OBSERVATORIO.md — NUNCA commitear eso, es de la otra sesión).
- CUIDADO: el stash también se llevó .gitignore (que yo había modificado): después del stash pop vuelve. Ordenar: modificar .gitignore ANTES del stash = se stash', luego restaurar con pop.
- COMMIT del repo: SOLO .gitignore + scripts/load-anuario-educacion-2025.mjs (374 líneas) + scripts/load-vulnerabilidad-sanitaria.mjs (390 líneas) = commit 70f9f86 'feat(etl): cargas del Anuario Educativo 2025 y Vulnerabilidad Sanitaria a indicadores'. PUSHED a origin/main.
- .gitignore agregó: docs/informe-dean-funes-primera-infancia.html/.pdf, docs/PERFIL_DEAN_FUNES_PRIMERA_INFANCIA.md, docs/FUENTES_DATOS_LOCALIDAD.md (los 4 = paquete del informe, decisión del usuario de NO commitearlos + .tmp-censo/ crudos).
- GATES post-rebase: npm run build OK exit 0 + vitest 42/42 archivos, 463/463 tests (creció por los tests nuevos del otro equipo).
- Los datos cargados a la DB NO dependen del repo: las 81 filas de VS y las 1395 del anuario ya están en Supabase y su ETL script ahora versionado.

### Storage migración COMPLETA: 13/13 archivos verificados SHA-256 + URLs al dominio nuevo
_*topic: `observatorio/storage-migration` · date: 2026-10-21 13:26:47 · engram id: 92*_

**What**: Migración de storage COMPLETA — resultado final verificado. El grueso (archivos) ya estaba migrado por otra sesión; esta sesión verificó integridad y completó la migración de DOMINIO de las URLs.
**Where**: bucket self-hosted ddna-repositorio (13 archivos), tabla repositorio (13 filas), scripts/migrate-storage.mjs (modificado con guard + hosts legados).
**Learned**:
- ESTADO ENCONTRADO: la migración de ARCHIVOS ya estaba hecha (13/13 en el bucket self-hosted — la corrió otra sesión/equipo, memory #15 de setiembre decía 0). La DB apuntaba a http://179.199.132.207:8000 (IP del VPS, no al cloud como decía la memoria vieja — la DB ya había sido actualizada).
- VERIFICACIÓN DE INTEGRIDAD: los 13 archivos son BYTE-IDÉNTICOS (SHA-256 cloud vs self-hosted) — 25MB totales (PDFs de informes, encuestas xlsx/docx).
- MIGRACIÓN DE DOMINIO hecha por esta sesión: 13 url_storage http://179.199.132.207:8000 → https://supabase.ddna.com.ar (mismo tema mixed content que el resto). El script migraba solo el host cloud; extendido con LEGACY_HOSTS=[cloud, IP] para tratar el IP como host legado.
- Guard agregado al script: NO actualiza la URL de una fila si el archivo no existe en el destino (evita apuntar a 404) — va a lista needsHuman.
- VERIFICADO POST-MIGRACIÓN: 13/13 URLs en https://supabase.ddna.com.ar; descargas públicas SIN auth por el dominio → 200 con tamaños correctos; el flujo de la app (window.open para download — nav top-level, sin problema de mixed content; /api/repositorio/process server-side es host-agnóstico: splitea por '/storage/v1/object/public/ddna-repositorio/').
- ROLLBACK: el bucket cloud sigue INTACTO con los 13 archivos — volver atrás = update SQL de las URLs al host cloud.
- PENDIENTE MENOR: commitear scripts/migrate-storage.mjs (untracked, modificado por esta sesión con el guard + LEGACY_HOSTS).
- CUIDADO con el parse: supabase-js v2 storage.download() en Node devuelve un Blob sin .arrayBuffer iterable directo en algunos entornos — usar new Response(blob).arrayBuffer().
- El CSV radios-censales WKT y el CRLF: scripts/migrate-storage.mjs tenía CRLF — normalizar a LF antes de patchear por string match.

### Refactor acceso en curso: admin/agente/visor + user_permissions personalizables
_*topic: `ddna-dashboard/refactor-acceso` · date: 2026-10-21 20:14:13 · engram id: 93*_

**What**: Refactor de acceso en curso — decisiones de producto cerradas y bootstrap aplicado; implementación delegada a worker.
**Where**: odd/tasks/acceso-roles.md (feature doc con S1-S10 + T1-T8 + Log), worker mvijua9h-2-n1mu.
**Why**: El usuario pidió resolver el logueo compartido (todos usan admin@ddna), la pantalla de creación de usuarios rota, y ocultar pantallas por agente ANTES de hornear la imagen nueva.
**Learned** (estado verificado en la DB 2026-10-21):
- DIAGNÓSTICO ROOT: user_roles VACÍA → todo el admin daba 403 silencioso (catch{} en admin-user-roles.tsx:165 mostraba 'No hay usuarios registrados').
- Decisiones (S5-S8): roles = admin / agente / visor (+ rename editor→agente hecho); personalizables: AGREGADOS por usuario vía tabla nueva user_permissions (route, can_view, can_edit) — 'agregarle a un visor la pantalla monitoreo'; la base de cada rol sigue editable desde el RoleManager existente.
- Bootstrap aplicado: admin@ddna.gob.ar (ac118281) + lucaalaporta@gmail.com (0c82757b) → role 1. La sesión en paralelo insertó TAMBIÉN a juan@prensa (ae38ee88) como admin — quedaron 3 admins; el dueño puede demotar desde la UI cuando funcione. FLAG de colisión: la otra sesión está tocando el mismo subsistema.
- La matriz base vigente: admin todo+edit; agente(ex-editor): datos vista + edit ejecutivo/fuentes/monitoreo/repositorio; visor: datos vista. role_permissions 29 filas.
- Defectos a corregir en código (del explorador, con file:line): admins/route.ts:52,67-68 (role_id:1 hardcode + error tragado); admin-user-roles.tsx:165 (catch{}), 200-204 (sin rol); users/[id]/role/route.ts ~95-100 (rechaza null); login-gate.tsx:163 (endpoint admin-only → non-admin todo denegado); sidebar.tsx:69 + mobile-nav.tsx:102 (sin filtro); auth-proxy.ts (solo sesión, sin permisos); rbac-types APP_ROUTES sin /salud-adolescente, /encuestas, /infancias; UserRole type con columnas que no existen (email/role_name).
- El deploy queda DEPENDIENTE de este refactor: cuando el worker entregue → revisión + suite + commit + push → re-run publish → aviso DevOps → dispatch deploy → verificación post-deploy.
- El login ya funciona en test local (http://localhost:3300) con la URL https://supabase.ddna.com.ar (verificado con credenciales inválidas → error real de auth).

## discovery (17)

### Responses UI reads definicion.fields while production data lives in bloques
_*topic: `bugfix/respuestas-bloques-vs-fields` · date: 2026-09-23 14:22:12 · engram id: 5*_

**What**: Verified why the admin responses screen looks unreadable. There is NO JSON.stringify anywhere in the formularios UI (grep over src/**/*.tsx: 25 hits, zero inside src/components/formularios/** or src/app/formularios/**). The real defects are elsewhere.

**Why**: User reported "me estas mostrando basicamente el json en la barra lateral". Verification was needed before agreeing.

**Where / root cause**:
1. `src/components/formularios/admin/responses-table.tsx:42` — `const previewFields = definicion.fields.filter(...).slice(0,4)`. It reads ONLY the top-level `fields`. Production definitions (the one migrated from Supabase Cloud) have `fields: []` and all 44 campos inside `bloques[*].fields`. Result: ZERO preview columns; the table degrades to Nº / Enviada / Acciones only.
2. `src/components/formularios/admin/response-detail.tsx:33-45` — `collectFields()` DOES flatten `bloques`, but the drawer renders all 7 blocks as one flat list of 44 grey cards with no block titles → reads as an undifferentiated dump.
3. `response-detail.tsx:48-70` — `renderAnswer()` is weak: `default: String(value)` turns objects into `[object Object]`; arrays are joined naively; `scale` renders with a double parenthesis `12  (min (1) — max (10))`; number/date/email/phone/textarea all fall through to the default.
4. `response-detail.tsx:80` — filters out unanswered fields, so you cannot see what was left blank.

**Preview status**: preview exists ONLY inside the builder (`src/app/formularios/[id]/builder-client.tsx:263` toggle -> `BuilderPreview` -> `FormRenderer preview`). There is NO preview affordance on `/formularios` or on `/formularios/respuestas/[id]`.

**Reusable pieces (already exist, do not rebuild)**:
- `FormRenderer` (`src/components/formularios/form-renderer.tsx`) already accepts `initialAnswers`, `onSubmit`, `submitLabel` and `preview` — so a filled-in read-only response view is nearly free; it just needs a read-only guard because inputs stay editable in preview mode.
- `getAllFields` is exported from `@/lib/formularios/defaults` (imported by form-renderer.tsx:13). `response-detail.tsx` duplicates this logic as a private `collectFields` — should be unified.
- `RespuestasClient` already receives the full `Formulario` (titulo, descripcion, definicion, slug), so `BuilderPreview` can be wired with no new data fetching.

**Learned**: whenever `DefinicionFormulario` is read, ALWAYS flatten `bloques` first — the `fields` array is legacy/back-compat only. `types.ts:78-83` declares `fields` as required but production data keeps it empty.

### MCP to Supabase project mapping + confirmed dual-production topology
_*date: 2026-09-23 15:30:32 · engram id: 14*_

**What**: Mapped every Supabase MCP server to its actual project ref, and captured the confirmed dual-production topology of ddna-dashboard.

**MCP -> project mapping (from C:\Users\Usuario\.pi\agent\mcp.json)**:
- `supabase-monitoreo` -> `https://mcp.supabase.com/mcp?project_ref=ppyyqrvirjqmfpqaqnxy&features=docs,account,database,debugging,development,functions,branching,storage` — this IS the leaked-key project (ddna-dashboard Cloud). NOT read-only.
- `supabase` -> `http://localhost:8080/mcp` — self-hosted Supabase on the VPS (via tunnel).
- `supabase-gestioncomercial` -> `project_ref=dlkjsckafohzhjsjfzyl`, `read_only=true`.
- `supabase-preprunape` -> `project_ref=wbhshrxibzleubcsistn`.
- Non-Supabase: engram (stdio, lazy), github (npx, GITHUB_PERSONAL_ACCESS_TOKEN), hostinger (npx, HOSTINGER_API_TOKEN), playwright (local node_modules cli), context7 (mcp.context7.com). All lifecycle lazy.

**Topology (user-confirmed)**: TWO production environments coexist deliberately, on two different databases:
- Vercel (`https://ddna-dashboard.vercel.app/`) -> fed by Supabase **Cloud** `ppyyqrvirjqmfpqaqnxy`. Proven: the client chunk `/_next/static/chunks/00ci79rt8xkdz.js` embeds `ppyyqrvirjqmfpqaqnxy.supabase.co`.
- VPS (`http://179.199.132.207/`) -> fed by **self-hosted** Supabase. Proven by `.env.local` NEXT_PUBLIC_SUPABASE_URL=http://179.199.132.207:8000.
Both endpoints answer (Vercel LIVE, VPS HTTP 200).

**Key implication for the leaked-key remediation**: rotating the Cloud JWT secret does NOT break the Supabase MCP servers, because they authenticate against the Supabase platform over OAuth (mcp.supabase.com), not with the project JWT. It DOES invalidate the Vercel deployment's anon/service keys until Vercel env vars are updated and redeployed, and it invalidates `CLOUD_SUPABASE_SERVICE_ROLE_KEY` used by the migration scripts.

**Learned**: the Cloud project is internally called "monitoreo" in the MCP config even though it is the ddna-dashboard project — the naming does not distinguish cloud vs self-hosted, which is easy to misread. Also: `scripts/config.mjs` (committed, unmodified) falls back to the Cloud URL while using the self-hosted `SUPABASE_SERVICE_ROLE_KEY`, i.e. it can send the new project's credential to the old project.

### Pending work inventory: storage migration never ran, 0 files transferred
_*date: 2026-09-23 15:31:56 · engram id: 15*_

**What**: Inventoried the pending work on ddna-dashboard. Headline: the Storage cloud->self-hosted migration is written but has NEVER RUN — zero files were transferred.

**Storage migration reality (verified against both DBs via MCP)**:
- Self-hosted `repositorio` table: 16 rows. 13 still have `url_storage` pointing at `https://ppyyqrvirjqmfpqaqnxy.supabase.co/storage/v1/object/public/ddna-repositorio/...`; 3 rows have `url_storage` NULL ("Datos Proteccion Digital.docx", "Encuesta adultos y NyN 12 a 18 Años 2024 (Responses).xlsx", "Encuesta adultos y NyN 12 a 18 Años 2024 Sec oscar (Responses).xlsx").
- Self-hosted bucket `ddna-repositorio`: `SELECT count(*) FROM storage.objects WHERE bucket_id='ddna-repositorio'` -> **0**. Not one file was ever copied.
- `scripts/migrate-storage.mjs` is untracked (never committed), so it has never reached the VPS either.
- All `nombre_archivo` values are flat (no slashes/subfolders), so the `encodeURIComponent(filename)` URL builder is safe as-is.
- Could not count the Cloud bucket: `supabase-monitoreo` MCP requires OAuth and is not authenticated in this session.

**HARD CONSTRAINT discovered**: the Cloud project CANNOT be paused or deleted. The VPS app reads repositorio metadata from the self-hosted DB but the files still live ONLY in Cloud Storage, so every repository download link on the VPS depends on Cloud being alive. This rules out the "just decommission Cloud" remediation path.

**migrate-storage.mjs defects (parent read, not in the scout report)**:
- No checksum/size verification between download and upload — a truncated or corrupt upload is logged as success. Note the earlier formularios data migration WAS byte-verified with md5 anchors, so this is a rigor regression.
- `cloud.storage.from(BUCKET).list('', { limit: 100 })` — root prefix only and no pagination: silently misses subfolders and silently truncates past 100 files.
- No rollback; a mid-run failure leaves a partially migrated bucket plus a partially rewritten DB.
- Line 29 keeps the Cloud-URL fallback anti-pattern (`process.env.CLOUD_SUPABASE_URL || 'https://ppyyqrvirjqmfpqaqnxy.supabase.co'`), same as `scripts/config.mjs`.
- The `.not('url_storage','is',null)` filter skips the 3 NULL rows, so they stay without a URL.

**ROADMAP.md Pendiente** — Alta: (1) GROQ_API_KEY missing in Vercel so the chat falls back to OpenAI, (2) test the chat in production. Media: (3) clean 6,164 inversion ETL records, (4) RMM/TMNEO/TMPOS post-2022 ETL from DEIS microdata. Baja: (5) streaming in the indicators chat, (6) UI polish (animations, skeletons, mobile), (7) missing unit tests (agent tools, hooks, new components), (8) login auto-redirect.

**odd/tasks/respuestas-ui-preview.md**: T1-T8 all done. Reported checks: `npx tsc --noEmit` exit 0, 437 tests passed with 1 pre-existing failure, lint errors all pre-existing in untouched files.

**Git state**: main == feature/respuestas-ui-preview == origin for both == c84150f (everything pushed, fast-forward merge done). `master` local and remote are stale at 380648b, 3 commits behind. Working tree dirty only in scripts/ + docker-compose.etl.yml. A second session was operating git on the same worktree concurrently (reflog showed a checkout/merge/checkout sequence mid-audit) — writes are NOT single-threaded right now.

**Learned**: `subagent_reply` returned "query is unavailable" twice for gentle-ai-explore while the child was still running; the child nevertheless completed and delivered a correct report on its own. Do not assume a failed reply means the child is stuck.

### Why git state changed: main fast-forwarded + VPS deployed (corrected: VPS is NOT behind)
_*date: 2026-09-23 15:46:10 · engram id: 16*_

**What**: Explained why "things changed" in ddna-dashboard git state, then CORRECTED a wrong claim about the VPS. Nothing came from the remote; the change was a local fast-forward merge of main plus a successful VPS deploy.

**CORRECTION (this entry previously claimed the VPS was 3 commits behind — that was FALSE and unverified)**: I inferred it from `deploy.sh` running `git pull origin main` plus `origin/main` being ahead of the pre-merge state, WITHOUT measuring the VPS. Actual measurement over SSH (`ssh -i ~/.ssh/ddna_deploy deploy@179.199.132.207`, BatchMode, key-based auth works):
- VPS repo HEAD: `c84150f` — identical to `origin/main`. Commit date 2026-09-23 12:07:04 -0300.
- VPS working tree: CLEAN (`git status --short` empty).
- Image `ddna-dashboard-app` built 2026-09-23 15:33:56 UTC (= 12:33:56 local).
- Container `ddna-dashboard-app-1` started 2026-09-23T15:34:08Z (= 12:34:08 local), status healthy.
- So the deploy ran 12 minutes after the 12:22 merge. The formularios work IS live on the VPS. Nothing is pending there.
- Other containers on the VPS: `vps-cron` (docker:27-cli, up 7 days), `supabase-storage` (v1.60.4), `supabase-edge-functions` (v1.74.0), `realtime-dev.supabase-realtime` (v2.102.3) — all up 2 weeks.

**Verified git facts**: `git fetch --all --prune` produced zero new refs; local == upstream (`0 0`). Reflog 2026-09-23 12:22:38: checkout feature -> main, `merge feature/respuestas-ui-preview: Fast-forward`, then checkout back to feature. Local `main` moved `380648b` -> `c84150f`. The dirty script files are NOT from today: mtimes 2026-09-16 16:31-16:58, uncommitted for a week.

**Branch topology**: `git merge-base --is-ancestor` confirms `origin/master`, `origin/feat/presentacion-ia` (e1524a4) and `origin/feat/informe-ejecutivo-v2` (c0e9b9c) are ALL ancestors of main. `git branch -a --no-merged main` is empty. `master` is only a stale duplicate pointer 3 behind (`380648b`); `main` is the GitHub default and what the VPS follows.

**Learned (process)**: do not present an inference about remote/deployed state as a measured fact. The harness has the tooling to measure it (dedicated `~/.ssh/ddna_deploy` key, BatchMode, no password prompt) — use it before asserting. The user caught this; the correction mattered because the wrong claim would have driven a pointless "deploy the VPS" work item. Also: this repo carries BOTH `master` and `main` as long-lived branches, in sync at `380648b` until 2026-09-23 when only `main` advanced — a standing trap where commits can land on the wrong branch with no warning.

### Storage migration: dry-run verified zero-writes; 3 NULL rows need human decision
_*date: 2026-09-23 15:59:56 · engram id: 18*_

**What**: T1-T2 of odd/storage-migration-hardening complete. `scripts/migrate-storage.mjs` hardened and the dry-run independently verified as ZERO-writes. The real transfer is gated on explicit user approval.

**Dry-run plan (verified, exit 0, before/after DB counts identical)**:
- Self-hosted bucket: 0 objects. Cloud bucket: 13 objects (matches the 13 rows pointing at Cloud).
- 13 files "would migrate" (flat names, no subfolders): Aldolescencia-en-tiempos-de-pandemia.-1 (1).pdf, Analisis-situacional-1 (1).pdf, BASE DE DATOS ANDRES VERIFICAR SI ESTA OK.xlsx, ConsumosAdolescentes-5968397.pdf, Copy of 2021 Medios Base de datos.xlsx, encuesta2024_rows.xlsx, Encuesta_Covid-19_Percepciones_de_adultos_sobre_NNyA-1-1.pdf, Encuestas 2024.docx, Inversion_social_destinada-a-ninez-y-adolescencia_Periodo-2010-2023.pdf, Inversion_Social_Infancias-y-Adolescencias_Cordoba_Consideraciones-y-desafios_para-presupuesto-2024.pdf, Miremos-nuestras-emociones_Encuesta-de-Bienestar-Subjetivo-a-NNyA.pdf, MONITOREO-MEDIOS-2022.docx, Tablero_general.docx.
- 13 DB rows url_storage rewritten Cloud -> self-hosted (http://179.199.132.207:8000/storage/v1/object/public/ddna-repositorio/<name>).
- 3 NULL rows CANNOT be fixed by the migration: "Encuesta adultos y NyN 12 a 18 Años 2024 (Responses).xlsx" (id 9dc461ca), "Encuesta adultos y NyN 12 a 18 Años 2024 Sec oscar (Responses).xlsx" (id f74dd11c), "Datos Proteccion Digital.docx" (id 18c99a53). They have NO object in the Cloud bucket either (13 vs 16) — the files were never uploaded to Cloud. They need a human decision: upload the files manually or delete the rows.

**Hardening implemented (in scripts/migrate-storage.mjs, 340 lines)**: config guard with no fallbacks + abort on same-origin; recursive paginated listing; post-upload integrity verification (re-download, size + SHA-256); explicit NULL-row handling (never invents URLs); per-file outcome record; non-zero exit on any failure; dry-run prints exact plan and performs zero writes (verified statically: upload line 194 gated by DRY_RUN at 168; DB updates at 282/306 gated at 277/301).

**Deviations observed**: the worker ran the live dry-run despite the parent reserving that step (result was still used and re-verified). The worker also noted its `env -u` guard proof needed empty-string pre-assignment because dotenv fills from .env.local.

**Next**: T3 = present plan to user (this entry); real transfer is a separately gated user decision; T4 = commit the hardened script (needs explicit go-ahead; a second session has been operating git on this worktree).

### VPS maintenance audit: dead weekly cron, no DB backups, 5GB reclaimable
_*date: 2026-09-23 19:51:23 · engram id: 21*_

**What**: Deployed the login-loop fix to the VPS and audited the VPS for maintenance needs. Verdict: YES, it needs maintenance, and one automation is dead.

**Deploy (done)**: VPS repo HEAD = 773208e (== origin/main after the 2 login-fix commits 3fc5c65 + 773208e from 2026-09-23). Container ddna-dashboard-app-1 healthy (started 16:26:47Z). Both fixes live: Bug A (cookie persistence, code-level) and Bug B (formularios RLS 500, DB-level).

**Maintenance findings (all measured, not inferred)**:
- 🔴 RED: the maintenance cron (`vps-cron`, docker:27-cli) is DEAD. Its script writes every line to `>> ""` (empty redirect target) because the heredoc was built with all `$VAR` expanded to empty at container creation. Verified: `bash: line 1: : No such file or directory`; `/var/log/maintenance.log` does NOT exist after 7 days (container started 2026-09-16; a Sunday 03:00 run happened). Its intended jobs (docker system prune weekly, builder prune weekly, disk >80% alert, weekly supabase restart if db up >7 days) NEVER run.
- 🟠 Build cache: 6.5GB total, **4.96GB reclaimable** — direct consequence of the dead cron (docker builder prune -f would reclaim ~5GB; disk is at 26% so this is cheap, not urgent).
- 🟠 NO automated DB backup: only one-shot migration artifacts exist (/home/deploy/migration-backup, data.sql, schema.sql, roles.sql, mig_forms.sh, mig_resp.sh, mig_resp2.sh, ddna-dashboard/, supabase/, lds.backup.yaml). Nothing schedules pg_dump. The self-hosted production DB is 303MB (trivial to back up nightly). This is the top risk: single self-hosted DB with no recurring backup.
- 🟡 25 apt upgradable packages; kernel 6.8.0-138; uptime 28 days (boot 2026-08-26). Needs an apt upgrade + reboot window.
- 🟡 Swap in use 345Mi of 2Gi with 7.8Gi RAM — mild pressure, not urgent (vm.swappiness=10 per DEPLOY.md).
- 🟡 SSH: no PasswordAuthentication line in sshd_config → default enabled (password auth on). Recommend key-only.
- 🟢 All 13 containers restart=unless-stopped — survive reboots.
- 🟢 Disk 26% used (72G free); no dead containers; load 1-min 4.47 on 2 vCPU but 5/15-min averages normal.
- 🟢 ufw status returned empty via sudo (inconclusive — verify separately).
- Known debt still open: rotate the leaked Cloud service_role key (user decision), storage migration paused (0 files in self-hosted bucket), `consumo` category stale in /api/health (data freshness, ETL).

**Planned actions offered to user**: (1) docker builder prune -f now; (2) fix/rewrite the vps-cron maintenance script (decide whether the weekly supabase restart behavior should be kept — probably drop); (3) add a nightly pg_dump backup cron with rotation to /home/deploy/backups. Later: apt upgrade + reboot, SSH key-only, verify ufw.

### Auth audit: login-hang and stale-signout root-caused; open /api write routes (D6) is a security hole
_*date: 2026-09-25 13:36:58 · engram id: 29*_

**What**: Full auth audit completed (2026-09-25, read-only, gentle-ai-explore). Both user-reported symptoms have deterministic root causes pinned to exact lines, plus two new findings (one a real security hole).

**Symptom A — login hangs, refresh "fixes it it".** Not one bug, four stacked:
- `src/app/login/page.tsx:24` sets `loading=true` on submit; on SUCCESS (signInWithPassword OK) it is NEVER reset — only `router.push(redirect)` at L49 exits. If that navigation stalls or bounces off the proxy, the button spins forever. A refresh unmounts and clears it.
- `src/components/login-gate.tsx:124-128,157` — role/roles fetches are bare `fetch()` with NO AbortController/timeout. If the server chain (checkAdminAuth → getUser → GoTrue cold-start on the VPS) never settles, `permsLoaded` stays false → infinite spinner (L229/263). Error paths set the flag; a HANG touches no flag.
- LoginGate config fetch (L82-86) via anon browser client on an admin table, no timeout; 3 retries × ~1.5-4.5s backoff.
- **D2 (new, design bug)**: `src/app/api/auth/users/[id]/role/route.ts:16` calls `checkAdminAuth()` — so fetching a user's OWN role requires ADMIN. Any editor/visor gets 403 → "Sin acceso" on EVERY gated page. The LoginGate tests mock a 200 editor response, so test and implementation contradict.

**Symptom B — stale header after sign-out.** `src/components/auth-provider.tsx:68-84`: the SIGNED_OUT branch designed to "avoid gate flicker" (`setSession(prev => prev)`, `setUser(prev => prev)`) also swallows a REAL sign-out. `signOut()` (L108) only calls `supabase.auth.signOut()`, which fires exactly that event. No path ever nulls session/user → header keeps showing the stale email + Salir button. No `router.refresh()`/redirect after sign-out either → no feedback.

**NEW — D6 security (urgent, separate from UX)**: the proxy skips `/api/*` (auth-proxy.ts:70). `/api/upload` has NO guard and writes with service_role; `/api/repositorio/chat` has only rate-limiting and exposes OpenAI spend + KB search + web tools. Reachable by anon. Should be guarded regardless of the refactor.

**Refactor recipe (from audit, priority order)**: (1) AuthProvider: clear session/user on real SIGNED_OUT; signOut does `router.replace('/login')`. (2) login/page.tsx: reset loading on success + `router.refresh()`. (3) Timeout/AbortController on every LoginGate fetch with explicit fallback. (4) Role endpoint readable by any authenticated user (or user_roles via RLS by auth.uid()) — move role gate server-side. (5) Proxy guard sensitive write APIs. (6) Single auth-config source resolved in proxy, passed to client (removes 9s jank + D8 bypass window where children render unprotected). (7) Move RBAC base tables (user_roles/roles/settings) into migrations for auditability. (8) Coherent LoginGate + sign-out tests.

**Recommendation**: fix D6 (open write APIs) as an immediate security patch, then do fixes 1-6 as the session-layer rewrite the user asked for. Google OAuth stays parked until the app has a domain+HTTPS (not Google DNS).

### Mapa de fuentes: series API vs CKAN vs Censo 2022 (sexo/edad/fecundidad por radio)
_*date: 2026-10-05 15:57:13 · engram id: 61*_

**What**: Mapeo completo de fuentes de datos para SALUD y la pantalla nueva de POBLACIÓN/DEMOGRAFÍA. Corrección importante del usuario: no limitarse al series API de INDEC — hay otras fuentes.

**SERIES API (apis.datos.gob.ar/series/api) — lo que SÍ tiene**:
- **Por jurisdicción** (DEIS publica series provinciales): `tn_14`/`tn_arg` (tasa de natalidad Córdoba/Argentina, **2000-2024**), `tmi_14`/`tmi_arg` (mortalidad infantil, 1990-2024, ya cargada), `tmf_14` (mortalidad fetal Córdoba, 2006-2024), `hdef_14`/`hdef_arg` (defunciones históricas 1914-2023). Patrón de IDs: `<ind>_arg` nacional, `<ind>_<cod_prov>` provincial (14=Córdoba, 02=CABA...).
- Endpoint de búsqueda: `https://apis.datos.gob.ar/series/api/search/?q=<term>&limit=N` → devuelve `{data:[{field:{id,description,title,frequency,time_index_start,time_index_end,units}, dataset:{...}}], count}`. El campo es `field.id`, NO `field_id`.
- **NO tiene**: fecundidad general (count 0 para "fecundidad"; no existen tf_/tgf_/fec_ series), nacidos vivos absolutos (no hay nv_*), cobertura vacunal provincial (solo dosis COVID 2020-2021).

**CATÁLOGO CKAN datos.gob.ar (api/3/action/package_search y package_show) — lo que hay además**:
- **"Nacidos Vivos Registrados por Jurisdicción de Residencia de la Madre"** (id: `nacidos-vivos-registrados-por-jurisdiccion-de-residencia-de-la-madre-republica-argentina`) — XLS/CSV/XLSX, incluye **2023**. → nacimientos totales por jurisdicción.
- "Nacimientos en Argentina" (CSV), "Serie histórica de nacimientos/defunciones ocurridos en Argentina por..." (PDF/CSV/XLSX).
- "Sistema sociodemográfico - Salud" / "- Grupos poblacionales e inequidades" (CSV).
- "Campaña de vacunación antigripal" (XLSX/CSV), "Puntos de vacunación" (CSV) — NO es cobertura de calendario completa.

**CENSO 2022 (dataset id `censo-nacional-de-poblacion-hogares-y-viviendas-2022`)** — LA FUENTE para demografía:
- 32 recursos: **un ZIP por provincia** (por código INDEC), ej. Córdoba = `https://infra.datos.gob.ar/catalog/indec/dataset/48/distribution/48.4/download/14-cordoba-2022.zip` (**16.7 MB**).
- El ZIP tiene 3 CSVs: `hogar` (55MB), **`persona` (144MB)**, `vivienda` (14.6MB).
- **CLAVE**: NO es microdata cruda — es una tabla **ya agregada** con columnas: `codigo, cod_prov, provincia, cod_dep, departamento, fraccion, radio, cod_variable, cod_categoria, categoria, cantidad`. O sea: **geo × variable × categoría → cantidad**. Listo para pivotar sin procesar microdata.
- Granularidad geográfica: provincia → departamento → fracción → **radio** (lo más fino, ~localidad).
- Diccionario de variables: `https://infra.datos.gob.ar/catalog/indec/dataset/48/distribution/48.26/download/diccionario-variables.csv`. Variables confirmadas: **`PERSONA_P02` = Sexo registrado al nacer**, `PERSONA_EDAD`/`PERSONA_EDADGRU`/`PERSONA_EDADQUI` = edad (total/grandes grupos/quinquenal), **`PERSONA_P35` = cuántas hijas e hijos nacidos vivos tuvo en total** (fecundidad), `PERSONA_P36` = hijos vivos actualmente.
- Nota: el diccionario de CATEGORÍAS no tiene recurso propio listado; las categorías vienen por `cod_categoria`/`categoria` y probablemente estén en los PDFs de definiciones.

**IMPLICANCIA**: la pantalla de población/demografía (Nación/provincia/departamento/localidad × hombres/mujeres/NNyA) ES construible con el Censo 2022, sin procesar microdata. Es un feature real: descargar ZIP por provincia → parsear persona.csv → filtrar variables P02/EDADGRU → agregar → cargar en `indicadores` (categoría nueva `poblacion` o `demografia`) → UI.

### Evaluamos relación entre ToR de MPPU y ddna-dashboard
_*topic: `mppu-tor-relacion-ddna-dashboard` · date: 2026-10-05 18:23:56 · engram id: 62*_

**What**: El usuario compartió `C:/Users/Usuario/Downloads/Terms_of_Reference_Global_Collective_Intelligence_Platform_MPPU.pdf` (ToR de MPPU / "One Planet, One Humanity" para contratar un proveedor de una plataforma web de inteligencia colectiva para ~600 miembros) y pidió evaluar si tiene relación con ddna-dashboard.

**Why**: Posible oportunidad de propuesta/consultoría para el mismo equipo. Se necesitaba saber qué se reutiliza y qué es nuevo.

**Where**: Sin cambios de código. Análisis read-only sobre `C:/Users/Usuario/ddna-dashboard` (PROJECT_STATUS.md, src/app/*, supabase/migrations/*). Texto extraído del PDF con `pdftotext -layout`.

**Learned**:
- El ToR define 6 módulos: Global Community, Knowledge Hub, Data Lab, Collaborative Lab, AI Creation Studio, Action & Amplification Network. Requisitos transversales: infraestructura en cuentas de la organización, GDPR (UE), capa de IA model-agnostic con citas verificables, entregables en formatos abiertos, manuales de backup/recuperación, capacitación, SLAs y costos itemizados (dev, infra, IA, mantenimiento, mejoras).
- Veredicto: relación **parcial**. Solapamiento fuerte en 2 de 6 módulos: **Knowledge Hub** (repositorio documental con pgvector + RAG agent con citas clickeables a fuentes) y **Data Lab** (tablero de indicadores con Recharts/Plotly, KPIs y geo/mapas). Parcial en AI Creation Studio (hay agente RAG pero no generación de contenido/campañas/traducciones).
- Gaps reales: Global Community (perfiles, directorio, matching, mensajería realtime, notificaciones), Collaborative Lab (workspaces, edición colaborativa, versionado), Action & Amplification Network (feed de iniciativas, campañas, métricas de difusión).
- Diferencias de fondo: otro cliente y dominio (MPPU internacional vs DDNA = Defensoría de los Derechos de Niñas, Niños y Adolescentes, Córdoba), régimen legal GDPR europeo con datos personales de miembros UE, y escala de arquitectura (600 usuarios con realtime + edición colaborativa exige WebSockets/CRDT, muy por encima del stack actual).
- No hay registro previo de MPPU: grep en el repo (md/ts/tsx/json) sin coincidencias y `mem_search` cross-project sin resultados.

**Next**: Si el usuario decide avanzar con la propuesta, mapear módulo por módulo con esfuerzo/costos y separar "reutilizable del tablero" de "construcción nueva".

### Censo 2022 Córdoba: esquema del dataset 48.4 e indicadores de población por departamento
_*topic: `etl/censo-2022-cordoba/poblacion` · date: 2026-10-05 18:55:14 · engram id: 64*_

**What**: ETL nuevo `scripts/load-censo-2022.mjs` que carga población de Córdoba (Censo 2022) en `indicadores` por departamento × sexo × edad; dry-run verificado, apply pendiente del padre. 2.987 filas generadas, duplicados 0.

**Why**: Se necesitaba población por departamento y grupos de edad (incluye 0-17 para NNyA) desde el agregado provincial del INDEC.

**Where**: `scripts/load-censo-2022.mjs` (nuevo, único archivo tocado).

**Learned** (datos verificados contra el CSV real, 2.085.236 filas, y contra los diccionarios oficiales):
- Fuente: `https://infra.datos.gob.ar/catalog/indec/dataset/48/distribution/48.4/download/14-cordoba-2022.zip` → `14-cordoba-2022-persona.csv` (144 MB, 2.085.236 líneas).
- NO es microdata: es tabla AGREGADA `geo × variable × categoría → cantidad` a nivel fracción/radio, columnas `codigo,cod_prov,provincia,cod_dep,departamento,fraccion,radio,cod_variable,cod_categoria,categoria,cantidad`. Hay que SUM().
- **La columna `departamento` trae el CÓDIGO, no el nombre** (p. ej. "014"). Mapa cod_dep→nombre validado 26/26 contra INDEC `c2022_codigos_departamentos.xlsx` (dataset "Códigos geográficos del INDEC 2022"). 014 = Capital (1.498.060). Ojo: orden alfabético pone "Río Seco" (112) antes que "Río Segundo" (119).
- CSV tiene campos entrecomillados con comas (etiquetas de categoría) → hace falta parser CSV con estado de comillas, no `split(',')`.
- Variables clave: `PERSONA_P02` (1=Mujer/Femenino, 2=Varón/Masculino), `PERSONA_EDADGRU` (1=HASTA 14 AÑOS, 2=15 A 64 AÑOS, 3=65 AÑOS Y MÁS), `PERSONA_EDAD` (0..110).
- **`PERSONA_EDADGRU` solo tiene 3 grupos → NO alcanza para calcular NNyA (0-17)**. Hay que usar `PERSONA_EDAD` año a año (111 categorías; etiquetas oficiales: 0="edad", 110="valido hasta" — raras pero del diccionario 48.25, no corrupción del CSV).
- Las 3 variables suman exacto 3.812.064 personas en Córdoba (ΣP02 = ΣEDADGRU = ΣEDAD). Es el total que da el dataset agregado; contrastar con el total provincial publicado antes de publicar.
- Diccionarios oficiales útiles: `48.25/diccionario-categorias.csv`, `48.26/diccionario-variables.csv`. Catálogo CKAN: `https://datos.gob.ar/api/3/action/package_show?id=censo-nacional-de-poblacion-hogares-y-viviendas-2022` (32 recursos, un ZIP por provincia).
- En este entorno `write` a `/tmp/...` resuelve a `C:\tmp\...` mientras que bash mapea `/tmp` a `%LOCALAPPDATA%\Temp`; hay que usar `$(cygpath -w)` o `require(process.cwd()+'/...')`.

### Deploy del tablero: basePath no compilado, sitio caido con 404
_*date: 2026-10-06 19:13:22 · engram id: 65*_

**Qué pasó**: El deploy del tablero DDNA quedó a medias y el sitio terminó CAÍDO con 404 en todas las rutas.

**Causa raíz — tres fallas encadenadas de `deploy.sh` (el script CONGELADO)**: se corrió `bash deploy.sh` en el VPS. Hizo bien el pull (hasta `4a9a9d3`) y el build, pero:
1. `docker-compose.prod.yml` NO declara `NEXT_PUBLIC_BASE_PATH` entre sus build args → el build salió con `basePath: ""` → la app quedó sirviendo en la RAÍZ, y Caddy, que enruta `/observatorio/*`, recibía 404 en todo.
2. `deploy.sh` publica el puerto **80**, que ya tiene `ddna-edge` (Caddy) → `Bind for 0.0.0.0:80 failed: port is already allocated`.
3. Taguea `ddna-dashboard-app:latest`, pero el deploy activo espera `ddna-dashboard:observatorio-candidate` (proyecto compose `ddna-controlled`).

**Clave técnica**: `basePath` de Next **se hornea en el BUILD**, no se lee en runtime. La variable de entorno del compose no lo arregla.

**La vía correcta es el script del DevOps**: `/home/deploy/ddna-infra/build-dashboard.py`. Ese sí pasa `NEXT_PUBLIC_BASE_PATH` (lo lee de `secrets/dashboard-build.env`), usa allowlist de args públicos, taguea directamente `ddna-dashboard:observatorio-candidate` y escribe provenance en `dashboard-build-inputs.json`. Corre sobre el checkout aislado `/home/deploy/ddna-dashboard-observatorio` y verifica que esté limpio (assert de git status).

**Trampa en ese checkout**: estaba en la rama divergente `fix/observatorio-vps` @ `ffd1996`, **48 commits atrás de main**. Hay que pararlo en main antes de compilar o construye código viejo.

**Procedimiento verificado**:
```
cd /home/deploy/ddna-dashboard-observatorio
git fetch origin && git checkout -B main origin/main     # -> 4a9a9d3
cd /home/deploy/ddna-infra && python3 build-dashboard.py # -> "Docker build exit: 0"
docker compose -f compose.private.yml up -d dashboard
```
Y el rollback inmediato: `docker tag ddna-dashboard:observatorio-candidate.prev ddna-dashboard:observatorio-candidate`.

**El chequeo que vale** (único que prueba que el basePath quedó bien):
`docker exec ddna-observatorio-candidate sh -c 'grep -o "\"basePath\":[^,}]*" /app/.next/routes-manifest.json'` → debe decir `"/observatorio"`.

**Datos de infra verificados**: `compose.private.yml` tiene `name: ddna-controlled` (línea 1, no hace falta `-p`). El Caddyfile ACTIVO es `Caddyfile.preview` (montado en `/etc/caddy/Caddyfile` de `ddna-edge`), NO el `.production`. Enruta con `reverse_proxy dashboard:3000` por nombre de servicio → recrear el contenedor es transparente, sin caída.

**Lección**: un build exitoso NO prueba un deploy. Verificar siempre DESDE AFUERA, con curl al sitio real. Hubo tres estados distintos: imagen nueva correcta, contenedor sin recrear, y contenedor recreado pero roto. Solo el sitio servido los distingue.

### Fecundidad: el denominador es poblacion total, no mujeres
_*date: 2026-10-06 19:13:36 · engram id: 66*_

**Qué**: La tasa de fecundidad por edad de la madre en Córdoba NO se calcula dividiendo por las mujeres de esa edad (la definición de manual), sino por la POBLACIÓN TOTAL del grupo de edad.

**Por qué**: El primer cálculo (denominador = mujeres estimadas) daba 22,5 por mil para 15 a 19 en 2022, y la serie oficial del DEIS dice 12,8. Un 76% de error. La causa NO era la estimación, era la CONVENCIÓN.

**La prueba aritmética que lo resolvió**: el valor oficial es incompatible con un denominador de mujeres. Con 3440 nacimientos de madres 15-19 y una tasa de 12,8 por mil, el denominador debería ser 268750 mujeres de 15-19. Pero el Censo cuenta 294939 PERSONAS de 15-19 en total: sería 91% mujeres, imposible. Con población total del grupo da 11,66 por mil, a 8,9% del oficial (el DEIS usa proyecciones poblacionales, no el conteo censal).

**Where**: `scripts/load-fecundidad.mjs`. Indicadores `Tasa de fecundidad — <grupo>`, `categoria='salud'`, region Córdoba, periodo 2022, fuente `DEIS + Censo 2022 (elaboración propia)`.

**Valores** (Córdoba 2022, por mil): Menor de 15: 0,19 / 15 a 19: 11,66 / 20 a 24: 28,35 / 25 a 29: 35,62 / 30 a 34: 36,00 (pico) / 35 a 39: 24,42 / 40 a 44: 6,65 / De 45 y más: 0,66.

**Learned**:
- El script se **autovalida** contra la serie oficial `Tasa fecundidad adolescente` (que vive en `categoria='salud_adolescente'`, NO en `salud`) y aborta si el desvío supera el 25%.
- Dividir por población total tiene una ventaja grande: **no requiere estimar nada**, porque el Censo publica el conteo exacto de cada edad simple. El denominador de mujeres obligaba a estimar (el Censo 2022 NO publica edad × sexo cruzado).
- La tasa de natalidad agregada valida el método general: Córdoba 2022 dio 10,91 por mil contra 10,80 oficial.
- **Antes de publicar un indicador derivado, compararlo contra la fuente oficial.** El error de 76% no se veía mirando el gráfico: la curva parecía perfectamente plausible. Solo apareció al cruzarla con la serie del DEIS.

### react-hooks 7.1.1 set-state-in-effect has no await awareness — verified fix patterns
_*date: 2026-10-07 13:43:23 · engram id: 75*_

What: Made `npm run lint` exit 0 (23 errors -> 0) on branch fix/react19-hooks-lint by fixing code only, no eslint-disable and no config change.

Why: eslint-plugin-react-hooks 7.1.1 (via eslint-config-next 16.4.0) enables compiler-powered rules: set-state-in-effect, set-state-in-render, purity, refs, immutability (all error).

Where: src/components/geo-maps.tsx, monitoreo/monitoreo-{table,dashboard,form,select-field}.tsx, src/app/fuentes/fuentes-client.tsx, src/app/repositorio/chat/page.tsx, src/components/report-modal.tsx, repositorio/repo-file-drawer.tsx, login-gate.tsx, src/lib/use-dashboard-data.ts, src/app/api/health/route.ts, two test files.

Learned (rule mechanics, verified empirically by temporarily editing geo-maps.tsx and running scoped eslint):
- set-state-in-effect flags an effect call to a function whose body contains ANY direct setState call, including setState after `await` or in `finally`. Removing only the sync setLoading(true)/setError(null) does NOT clear it; removing all direct setState from the callee does.
- Workarounds that pass without disabling the rule: (a) move state writes into promise callbacks (.then/.catch/.finally) inside the fetcher — the rule's own description endorses setState in callbacks; (b) derive state during render from a query key (e.g. loading = loadedQueryKey !== queryKey) with an effect-owned cancelled flag; (c) prop-to-state mirrors: conditional setState during render compared against a previous value (allowed; unconditional render setState is the only forbidden case); (d) reset-on-open by mounting the body only while open (inner component) instead of a reset effect; (e) impure calls like Date.now(): capture the clock in an effect declared before the consumer hook and read it from a ref.
- Postgrest builders are thenables (PromiseLike), so TS rejects `.catch` on a `.then` chain — wrap with Promise.resolve(builder) first.
- Observed gate results: lint 0 errors / 60 warnings (was 61); vitest 39 files / 446 tests, 9 failed (salud page 5, docker-infrastructure 1, chat route 3) = same failing set as baseline but totals read 40/450 in the task brief; build exit 0.

### Backend https://supabase.ddna.com.ar activo y verificado — env local actualizada, pasos de deploy definidos
_*topic: `infra/dominio-https` · date: 2026-10-07 14:55:50 · engram id: 80*_

**What**: El backend de Supabase ya está publicado en HTTPS bajo el dominio propio: https://supabase.ddna.com.ar (respuesta del usuario). Verificado endpoint por endpoint y la env local actualizada.
**Why**: Era el blocker de mixed content (la NEXT_PUBLIC_SUPABASE_URL hornada era http://179.199.132.207:8000 y bajo https://ddna.com.ar el browser lo bloquearía).
**Where**: .env.local (NEXT_PUBLIC_SUPABASE_URL=https://supabase.ddna.com.ar — backup en .env.local.bak-versupabase); build local y tests corridos OK tras el cambio.
**Learned** (verificado in-vivo 2026-10-21):
- REST: https://supabase.ddna.com.ar/rest/v1/indicadores → 200 con la anon key real, TLS OK.
- CORS: Access-Control-Allow-Origin: https://ddna.com.ar (echo del Origin — el Kong/plugin lo permite) → fetch del browser OK bajo el dominio.
- Auth: /auth/v1/token responde (400 con body vacío = alive).
- Storage: /storage/v1/object/list respond e (400 sin bucket params, alive).
- La env local quedó con https y el build + 463/463 tests pasan. CLOUD_SUPABASE_URL (cloud) sigue aparte para la migración de storage.
- PASOS QUE FALTAN PARA EL DEPLOY (acción del usuario/devops, no necesitan cambio de código):
  1. GitHub: actualizar la variable de entorno `NEXT_PUBLIC_SUPABASE_URL` del environment `image-build` (la usa publish.yml como build arg) → https://supabase.ddna.com.ar
  2. Trigger de rebuild: push (o run manual) → CI + publish.yml genera la imagen ghcr:<sha> con la URL nueva hornada
  3. deploy.yml workflow_dispatch con el SHA nuevo + devops_notified=true y la referencia del aviso (contrato)
  4. DevOps: si el compose.private.yml del VPS pisa NEXT_PUBLIC en runtime, actualizarla ahí también (la imagen VIVE con build args como ENV runtime e ignora el override salvo el compose)
- OJO: los registros viejos de la tabla repositorio siguen apuntando a URLs del CLOUD (p9466 storage migration pendiente, otra session) — el cambio de dominio NO resuelve eso.

### next/image en ddna-dashboard exige dashboardPath() (basePath /observatorio)
_*topic: `ddna-dashboard/next-image-basepath` · date: 2026-10-14 19:41:51 · engram id: 85*_

**What**: Verificado en producción que el optimizer de next/image solo resuelve archivos de public/ si el `url` incluye el basePath. Con `src="/logos/x.png"` (sin basePath) el endpoint `/_next/image?...` devuelve 404; con `src=dashboardPath('/logos/x.png')` (=> `/observatorio/logos/x.png`) devuelve 200.
**Why**: Es contraintuitivo: la doc de Next dice que basePath se agrega solo. En este deploy (standalone + Next 16.4) no es así, y el helper `src/lib/app-path.ts` existe justo por esto.
**Where**: src/lib/app-path.ts, src/components/header.tsx (Image + dashboardPath), src/app/page.tsx (hero).
**Learned**: Evidencia en vivo (2026-10-14):
- `curl -sIL "https://ddna.com.ar/observatorio/_next/image?url=%2Fobservatorio%2Flogos%2FLOGO%20DDNA_HORIZONTAL_COLOR.png&w=256&q=75"` -> 200 image/png
- misma URL con `url=%2Flogos%2F...` -> 404
- sharp SÍ está trazado en .next/standalone (node_modules/sharp presente), así que la optimización funciona en el contenedor.
- Además: `http://179.199.132.207/observatorio/...` ahora responde 308 -> `https://ddna.com.ar/observatorio/...`; DEPLOY_TOPOLOGY.md quedó desactualizado en ese punto.

### Datos primera infancia Deán Funes: solo llega a departamento (Ischilín), no a localidad
_*topic: `ddna-dashboard/cobertura-datos-localidades` · date: 2026-10-19 12:35:44 · engram id: 89*_

**What**: Inventario de datos disponibles en el tablero para "primera infancia (0-6) en la localidad Deán Funes" — consulta read-only del usuario.
**Why**: El usuario quiso saber qué datos hay para esa localidad; se auditó la tabla `indicadores` y el resto del modelo vía PostgREST con la clave anon.
**Where**: tabla `indicadores` (Supabase self-hosted, http://179.199.132.207:8000), src/lib/poblacion-censo.ts, src/lib/use-dashboard-data.ts.
**Learned**:
- `indicadores` tiene 38.614 filas y 0 filas con región "Deán Funes" (region=ilike.*unes* → */0). La granularidad máxima es DEPARTAMENTO: Córdoba (provincia), Calamuchita, Capital, Colón, Cruz del Eje, General Roca, General San Martín, Ischilín, Juárez Celman, Marcos Juárez, Minas, Pocho, ...
- Deán Funes pertenece al departamento **Ischilín** (sí cargado). Censo 2022 INDEC, Ischilín: total 36.023; NNyA 0-17: 10.520; hasta 14: 8.581; edad 0: 447; 1: 404; 2: 531; 3: 587; 4: 596; 5: 560; 6: 574 → 0-6 suma 3.699.
- Censo por edad suelta (0..110) está cargado por departamento; el censo a nivel LOCALIDAD no está cargado en el tablero.
- Otras categorías: anuario_educacion (departamentos), canastas (Nacional), aprender (Q1-Q5 estatal/privado), pobreza/salud/educacion/inversion (provincia/aglomerado). Ninguna baja a localidad.
- La tabla `datos_indicadores` referenciada en el código NO existe en el schema cache (PGRST205) — referencia huérfana (posible deuda).
- Query de referencia para 0-6 por departamento: `GET /rest/v1/indicadores?categoria=eq.demografia&fuente=eq.Censo 2022 — INDEC&region=eq.<Depto>&indicador_nombre=like.Población — edad *`

### Informe HTML horneado: muestra datos sin JS (fix del 'todo en 0' al compartir)
_*topic: `ddna-dashboard/datos-localidad-dean-funes` · date: 2026-10-19 12:46:04 · engram id: 90*_

**What**: Informe HTML corregido para compartirse — ahora muestra los datos incluso en visores que NO ejecutan JavaScript (el problema que reportó el usuario: 'todo en 0').
**Why**: Los KPIs arrancaban en 0 y los gráficos se dibujaban 100% con JS (IntersectionObserver + rAF + createElementNS). En previews de WhatsApp/Teams/mail (que strippean JS o no lo ejecutan) quedaba vacío.
**Where**: docs/informe-dean-funes-primera-infancia.html (horneado con .tmp-censo/bake-informe.mjs — reproducible).
**Learned**:
- TÉCNICA 'bake': renderizar la página headless, capturar los SVGs YA DIBUJADOS (outerHTML con viewBox incluido — imprescindible para que escaled con width=100%) y hornearlos en el HTML fuente; los contadores reciben su valor FINAL como texto estático (el JS los re-anima si corre; si no, queda el valor).
- El bake es IDEMPOTENTE una vez corregido el regex: `new RegExp('<svg id="'+id+'"[\s\S]*?</svg>')` (match hasta el PRIMER '</svg>' — no usar [^>]*></svg> que no matchea contenido horneado).
- BUGS detectados y corregidos en el proceso: (1) doble '>' en el reemplazo de contadores (needle.slice(0,-2) ya dejaba el '>' y agregué otro → los KPIs mostraban '>17.023' etc.), (2) valores capturados A MITAD DE ANIMACIÓN (los tres KPIs al 67.1% exacto del target = easeOutCubic en progreso 0.31 — el rAF de headless corre más lento que el tiempo real: NUNCA capturar contadores de un DOM animado; hornear valores EXPLÍCITOS), (3) regex de bash -e con escapes anidados destruye backslashes — usar write tool para los patches con regex.
- VERIFICACIÓN DOBLE final: SIN JS (javaScriptEnabled:false): KPIs 25.360/70,3%/9.370/3.701 ✓, 4 charts horneados con elementos ✓, labels de edad ✓, 19 labels 'k' en nacimientos ✓, tasas TMI ✓. CON JS: mismos valores, toggle Deán Funes (estimados 314/284/373...) funciona, 0 errores.
- Mejora estructural: drawEdad y drawLine ahora SIEMPRE estampan labels de valores (labelPts por serie con labelFmt) — ya no dependen del tooltip.
- El archivo ignora los cambios de tamaño: 49 KB, sigue standalone.
- PENDIENTE: regenerar el PDF con make-pdf.cjs si se quiere el PDF sincronizado con los labels (el make-pdf ya los agrega en el vuelo, así que el PDF actual ya los tenía — solo re-generar si se cambió algo más).

## bugfix (13)

### Implemented responses UI overhaul + form preview modal (T1-T8)
_*topic: `formularios/responses-ui-preview` · date: 2026-09-23 14:40:41 · engram id: 7*_

**What**: Added readOnly mode to FormRenderer/FieldInput, fixed the responses table to source preview columns from getAllFields(definicion), replaced the response drawer body with the filled-in read-only form, and added a FormPreviewModal reachable from /formularios and /formularios/respuestas/[id].
**Why**: User reported the drawer looked like a raw dump and preview columns were missing — production definitions keep top-level fields:[] and store everything in bloques[*].fields, so any read of definicion.fields alone renders zero columns.
**Where**: src/components/formularios/form-renderer.tsx, fields.tsx, admin/responses-table.tsx, admin/response-detail.tsx, NEW form-preview-modal.tsx, src/app/formularios/formularios-client.tsx, src/app/formularios/respuestas/[id]/respuestas-client.tsx + 4 test files, odd/tasks/respuestas-ui-preview.md.
**Learned**: (1) Reuse getAllFields from @/lib/formularios/defaults — never read definicion.fields alone. (2) FormPreviewModal must gate its effects on form!==null because formularios-client mounts it always (form=null when closed), otherwise body scroll lock stays active. (3) Pre-existing unrelated failures: tests/docker-infrastructure.test.ts (expects npm ci --omit=dev) and 7 lint errors in untouched files (health route, etl/validate.test, useMonitoreoDraft.test). (4) Eye icon was NOT actually imported in respuestas-client.tsx despite the task doc claiming it was.

### P0 leak RESOLVED: Supabase auto-disabled keys; rotation verified 401/200
_*date: 2026-09-23 15:24:53 · engram id: 12*_

**RESOLVED — 2026-09-24**: Supabase Cloud disabled the leaked legacy anon+service_role keys automatically at 2026-09-24T20:10:06Z ("Legacy API keys are disabled", detected via the public repo), and the user generated NEW publishable + secret keys and updated the consumers.

**Rotation verification (all three measured)**:
- Leaked key from git history: HTTP 401 against Cloud — dead. ✅
- `.env.local` CLOUD_SUPABASE_SERVICE_ROLE_KEY: now DIFFERENT from the leaked one and HTTP 200 with data against Cloud — new secret key works. ✅
- Vercel: `/api/health` 200 "connected". The `/api/indicadores` 500 is NOT an auth error — requests pass authentication (a disabled key would 401), so Vercel's current keys are accepted. ✅ (see orphan-endpoint finding below)

**Bonus finding (unrelated to rotation)**: `/api/indicadores` returns 500 in BOTH environments (VPS and Vercel) with the same PostgREST error: "Could not find a relationship between 'indicadores' and 'datos_indicadores' in the schema cache" (PGRST200 — PostgREST searched pg_constraint, no FK found; hint suggests `grupos_indicadores`). `src/app/api/indicadores/route.ts:28` embeds `datos_indicadores(...)` in a select on indicadores. Grep shows ZERO callers of `/api/indicadores` in src/ — it is an ORPHAN endpoint. The repo migration `20260414000000_initial_schema.sql:52` has `indicador_id UUID NOT NULL REFERENCES indicadores(id)`, but the actual DBs apparently lack that FK. Not caused by the rotation; latent bug; fix or delete on user request.

**What still exists**: the credentials and their uses are now: .env.local has the new CLOUD secret; Vercel holds new-publishable/secret equivalents; migration scripts (backfill/run-backfill/migrate-storage) get the new key automatically from .env.local. Optional remaining step: purge the leaked key from git history (filter-repo/BFG) — now that the key is dead it is optional; the repo remains PUBLIC, so the history still attracts scanners (low risk now that it is inert).

### Login loop root cause: no-op cookie setAll + infinite RLS policy recursion on user_roles
_*date: 2026-09-23 16:12:32 · engram id: 19*_

**What**: Root-caused the recurring login loop AND the authenticated 500 on formularios for ddna-dashboard's VPS deployment. Two independent bugs, both confirmed with direct evidence.

**Bug A — login loop (401 "No autenticado" on every admin API call)**: server-side Supabase clients in route handlers and server actions have a NO-OP setAll — `src/lib/auth-guard.ts:38`, `src/lib/actions/assert-admin.ts:21`, `src/lib/actions/admin-stats.ts:19` (only `src/lib/auth-proxy.ts:104` persists via response cookies). When the access token expires, every admin API call makes the server refresh via GoTrue — gotrue logs show `token_refreshed` + `token_revoked` in rapid bursts with `user_agent:"node"` — but the new cookies are discarded, so the browser keeps a stale refresh token that GoTrue keeps revoking on reuse (rotation + reuse detection). Result: getUser() fails → auth-guard 401 → LoginGate shows "Sin acceso" (`login-gate.tsx:142-149`, no redirect) while AuthProvider keeps the previous session on SIGNED_OUT (`auth-provider.tsx:62-74`). Fix pattern (canonical @supabase/ssr): in setAll call `cookieStore.set(name, value, options)` for each — works in both route handlers and server actions.

**Bug B — formularios 500 for authenticated**: the RBAC policies (created from the Supabase Studio dashboard, NOT from repo migrations — schema drift) are self-referential. "Escritura admin user_roles" is FOR ALL with USING `EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ...)`, i.e. a policy on user_roles that SELECTs user_roles → Postgres returns EXACTLY `infinite recursion detected in policy for relation "user_roles"` (reproduced by running the RLS as the authenticated role via SET ROLE + request.jwt.claim.sub). The `formularios` "Admin formularios" policy subqueries user_roles → triggers the recursion → PostgREST 500. Anon reads work because the anon policy (`activo = true`) never touches user_roles. Fix: create `public.is_admin()` SECURITY DEFINER (RLS bypass) and rewrite the self-referential policies on user_roles/roles plus the formularios/respuestas admin policies to use it. New migration needed + apply to self-hosted + commit to repo.

**Verified facts along the way**: admin@ddna.gob.ar (user ac118281-cdff-4a88-a816-d019c291b06b) HAS role admin in user_roles. Grants: authenticated/anon/service_role all have full DML on user_roles/roles. auth.uid()/role()/jwt() exist in the auth schema. The PostgREST 500 log lines (`authenticated HEAD /formularios?... 500` at 15:45/15:47/15:50) coincide exactly with successful logins/refreshes in gotrue — i.e., right after login the page load 500s. VPS: service `supabase-rest`/`supabase-auth`/`supabase-db` all healthy, up 2 weeks.

**Repo files**: odd/tasks/login-loop-fix.md created with tasks L1-L4. Also relevant: the legacy write policies in 20260414000000_initial_schema.sql use `auth.jwt() ->> 'role' = 'admin'` which never matches gotrue-issued JWTs (role=authenticated) — masked because admin writes go through the service key.

### Login loop fixed: cookie persistence (L2) + RLS recursion migration applied live (L3)
_*date: 2026-09-23 16:19:18 · engram id: 20*_

**What**: Fixed both login-loop root causes on ddna-dashboard. L2 (code) and L3 (DB migration) implemented and verified; pending deploy so the code fix reaches the VPS.

**L2 — Bug A fixed** (session cookie persistence): edited `src/lib/auth-guard.ts`, `src/lib/actions/assert-admin.ts`, `src/lib/actions/admin-stats.ts` to persist rotated cookies in setAll via `cookieStore.set(name, value, options)` (the canonical @supabase/ssr pattern). Verified: `npx tsc --noEmit` exit 0; `vitest run` 437 passed / 1 failed (pre-existing, `tests/docker-infrastructure.test.ts` asserting `npm ci --omit=dev` in the Dockerfile — unrelated to auth). The fix only takes effect after deploy: the VPS container currently runs the old code (HEAD c84150f, uncommitted changes not pulled).

**L3 — Bug B fixed and VERIFIED IN PRODUCTION** (infinite RLS recursion): applied migration `fix_rbac_policy_recursion` to the self-hosted DB (tracked in supabase_migrations). It creates `public.is_admin()` (SECURITY DEFINER, search_path=public, grants EXECUTE to anon/authenticated/service_role) and rewrites 6 policies — "Escritura admin user_roles" (FOR ALL), "Escritura admin roles" (FOR ALL), "Admin formularios" (FOR ALL TO authenticated), "Admin respuestas"/"Admin delete respuestas"/"Admin update respuestas" — to use `is_admin()` instead of the inline `EXISTS(user_roles JOIN roles ...)`. Repository copy: `supabase/migrations/20260923140000_fix_rbac_policy_recursion.sql`.

Live verification after apply:
- pg_policy: all 6 admin policies now show `using_expr = is_admin()`; the read policies ("Lectura pública...", "Insert público respuestas") untouched.
- Simulation that previously errored with `infinite recursion detected in policy for relation "user_roles"` now returns `formularios_visibles = 3` for the admin user as role authenticated.

**Governance findings while fixing**:
- The user_roles/roles/policies were created ONLY via the Studio dashboard — they were never in supabase/migrations and never tracked. The migration fix also captures them in the repo for the first time.
- `supabase_migrations.schema_migrations` on the self-hosted DB only tracks 2 entries with versions that do NOT match the repo filenames (`category_freshness_umbral` as 20260915185118 vs repo 20260909120000; plus `create_repositorio_bucket` 20260916195810 which is not in the repo at all). The repo migrations are NOT the source of truth for this DB — schema drift is structural.

**Remaining**: L4 = commit (needs explicit go-ahead; other session may still be writing git) + push + VPS deploy (user runs deploy.sh or approves me) + browser re-test of login. After deploy: the 401 loop should stop (cookies persist) and the formularios 500 for authenticated should be gone (DB-level fix, already live).

**Note**: the formularios 500 fix is ALREADY live at the DB level (no deploy needed), so the user can re-test right away. Legacy note: `auth.jwt() ->> 'role' = 'admin'` write policies in 20260414000000_initial_schema.sql never match gotrue-issued JWTs (role=authenticated) — masked because admin writes bypass RLS via the service key.

### Fixed repo upload 401 (session gate) + storage migration complete and deployed
_*date: 2026-09-25 13:25:52 · engram id: 27*_

**What**: Fixed the repository upload 401. The `/api/repositorio/upload` route was gated on `INTERNAL_API_SECRET` (a Bearer token only server-side scripts carry), but the ONLY caller is the browser UI (src/components/repositorio/repo-upload-zone.tsx sends a FormData POST). So every UI upload returned 401 — the feature was permanently broken, not a key problem.

**Fix (deployed)**: replaced the INTERNAL_API_SECRET gate with the existing `checkAdminAuth()` session guard (src/lib/auth-guard.ts, the one fixed earlier for cookie persistence). Upload now returns 401 when not logged in and 403 when not admin. The service-role upload + `repositorio` insert + background `processDocument` logic is unchanged. The upload zone/page is NOT behind LoginGate in the UI, so the route is now the gate.

**Committed 51dc1f1, pushed to main, deployed to VPS** (HEAD 51dc1f1, container healthy). Verified: POST /api/repositorio/upload without a session → 401 (new behavior confirmed). Remaining INTERNAL_API_SECRET users (left alone, correct): /api/admin/backfill (server-side script route) and /api/repositorio/process (invoked by backfill).

**Also fixed earlier the same day**: 4 download call sites that hardcoded the Cloud storage host (so downloads now use self-hosted). Committed b0314ce, deployed. Migration of the 13 repository files Cloud→self-hosted completed and verified (sha256, 13/13 in bucket, 13 url_storage rewritten, 0 NULL after deleting 3 empty rows). Download confirmed working by the user.

**Learned**: two distinct PostgREST behaviors on the self-hosted VPS — the root `?select=1` returns 403 for anon (normal; it's schema introspection), while real table reads return 200. The deploy.sh PostgREST warmup uses the root endpoint, so it always prints 5x 403 and "not ready" even when healthy — a false alarm worth fixing in the script (use a real table like `/rest/v1/indicadores?select=id&limit=1` instead). Also: the self-hosted bucket serves anonymous public GETs, so download links need no auth.

### Auth refactor W1-W5 shipped and deployed; W6 deferred pending browser verification
_*date: 2026-09-25 14:06:18 · engram id: 31*_

**What**: Auth refactor W1-W5 (the fix the user asked for) implemented, committed, pushed to origin/main, deployed to the VPS (HEAD 05f2135), and verified. W6 deferred. ODD feature doc: odd/tasks/auth-refactor.md.

**Shipped (each a work-unit commit, deployed, tsc 0, LoginGate tests 6/6):**
- W1 `aa23263` — D6 security: `POST /api/upload`, `POST /api/repositorio/chat`, `GET /api/auth/config` all now call `checkAdminAuth()` as first statement. Verified live: 401 for anon. Closed the anon service-role-write + OpenAI-spend + settings-leak hole (the proxy skips /api/*).
- W2 `b83e3e0` — Symptom B root fix: AuthProvider SIGNED_OUT now clears session/user (was keeping prev); signOut() try/catch + explicit state clear + `router.replace('/login')` + refresh, even when supabase is null. Header calls signOut() bare so it inherits the redirect.
- W3+W4 `d3e3371` — Symptom A root fix: login/page.tsx success path now `router.refresh()` + `setLoading(false)` before `router.push`; LoginGate got `fetchWithTimeout` (AbortController 8s) on role+roles fetches, and D8 fixed (configLoading no longer resets during a pending retry, so gated children never briefly render unprotected).
- W5 `05f2135` — D2: added `checkAuth()` (authenticate, no role req) in auth-guard.ts (shared `createSessionClient` helper; checkAdminAuth behavior unchanged). Role GET allows own role for any user; other-user role + PUT stay admin-only. Matrix verified.

**Verified live on VPS**: HEAD 05f2135, container healthy, /api/health 200, the three D6 routes 401 anon.

**Deferred**: W6 (single auth-config source in proxy, remove client admin-table fetch) — most invasive; D8 already mitigated in W4; needs a dedicated session + product decision. W7 (RBAC base tables into migrations) optional.

**PENDING USER BROWSER VERIFICATION** (the actual acceptance test): log in -> no infinite spinner; log out -> header clears immediately + redirects to /login without a manual refresh.

**Learned**: a second git session is actively pushing to this repo (saw a competing commit mid-refactor); all my pushes were rebased onto origin/main, never force-pushed. The VPS is shared (also hosts WordPress + observatorio containers), so never apply a blind provider firewall.

### W6+W7 complete; full auth-refactor (W1-W7) done and deployed
_*date: 2026-09-25 14:49:16 · engram id: 35*_

**What**: W6 (single auth-config source) and W7 (RBAC base tables into migrations) completed, pushed, and deployed. The entire auth-refactor feature (odd/auth-refactor) is now fully done (W1-W7).

**W6 (530148a, deployed + healthy)**: unified the three separate reads of the `settings` (key=auth) config into ONE server-side cached module `src/lib/auth-settings.ts` (service_role REST read, 5s in-memory TTL, fail-closed defaults, snake_case `protected_routes`). `auth-proxy.ts` now imports it; `/api/auth/config` serves from it and its guard changed from `checkAdminAuth` to `checkAuth` (any authenticated — the client gate needs the enabled flag, not sensitive). `login-gate.tsx` no longer queries the `settings` table from the browser at all — it does a single `fetchWithTimeout('/api/auth/config')`, fail-closed on any failure. This removed the ~9s retry jank and the D8 window where gated children briefly rendered unprotected. Net -83 lines. One test mock (`login-gate.test.tsx`) had to be migrated from the supabase-client mock to a fetch spy (authorized; all 6 assertions preserved, 6/6 green, tsc 0).

**W7 (997c336)**: created `supabase/migrations/20260925120000_rbac_base_schema.sql` capturing the RBAC base tables (roles, user_roles, role_permissions, settings) — previously created only via the Studio dashboard and living solely in the live DB (unauditable, not reproducible). Migration is idempotent and introspected from the live DB. IMPORTANT: it also fixed a latent instance of the RLS recursion bug — the `role_permissions` "Escritura admin" policy was FOR ALL with an inline `EXISTS(...user_roles...)` subquery (the same self-referential pattern fixed for `user_roles` earlier but never applied here); rewritten to use the SECURITY DEFINER `is_admin()` helper. Verified live: no RBAC policy has an inline user_roles subquery; app health 200.

**State**: W1-W7 all done and deployed. The two user-reported symptoms remain fixed (user-confirmed). Working tree clean. Remaining open/deferred: Google OAuth (parked until domain+HTTPS), pruning the two stale `feat/*` remote branches (informe-ejecutivo-v2, presentacion-ia — already ancestors of main, harmless). A second git session is still active on this repo.

### Bug: /salud truncada a 1000 filas por falta de paginado
_*date: 2026-10-06 19:13:36 · engram id: 67*_

**Qué**: Bug preexistente serio arreglado en `/salud`: el fetch pedía `categoria='salud'` SIN paginar y PostgREST corta en 1000 filas por request. Ordenando por `periodo` ascendente, la pantalla se quedaba con las 1000 más viejas y descartaba todo lo reciente.

**Where**: `src/app/salud/page.tsx` → `fetchCategoria(categoria)` con `.range()` en loop + desempate `.order('id')`. Commit `4a9a9d3`.

**Medición antes** (contra la DB real): la pantalla veía 1000 de 8270 filas (87,9% perdido); Cobertura de vacunación veía NADA de 1399; Nacimientos 810 de 5872; Mortalidad infantil 86 de 296; Tasa de natalidad 16 de 52. En el HTML servido la palabra "2025" aparecía 0 veces y no se listaba ninguna vacuna. Después: HTML de 102390 a 126591 bytes, vacunas listadas de 2 a 6.

**Learned**:
- **PostgREST corta en 1000 filas por request sin avisar.** Cualquier query sobre `indicadores` que pueda superar 1000 filas necesita `.range()` en loop. Es el tercer lugar del repo con el problema (ya resuelto en `/poblacion` y `/pobreza`).
- **Paginar ordenando solo por una columna no-única es incorrecto**: el orden entre filas del mismo `periodo` queda indefinido y entre páginas eso duplica o pierde filas. Hay que agregar desempate estable (`.order('id')`).
- Verificar el HTML servido con `curl` + `grep` es una forma barata de detectar truncados silenciosos: contar ocurrencias de un valor esperado (ej. "2025") revela lo que el fetch perdió.

**NO resuelto**: los 1399 registros de cobertura vacunal CNV 2024/2025 están en la DB pero NO se muestran, porque la sección "Cobertura de Vacunación" está construida sobre nombres legacy hardcodeados en `src/lib/indicator-names.ts` (`Cobertura DPT4 - Nacional`, `Cobertura SRP2 - Córdoba`, datos de 2021) que no coinciden con los nombres CNV (`Cobertura BCG - Única Dosis Menor de 7 días (CNV)`). Falta cablear la UI (tarea 12 del ODD).

### Dependency security remediation merged to main (ff 14ca970, not pushed)
_*topic: `deps/audit-state` · date: 2026-10-07 12:41:27 · engram id: 70*_

**Merged**: fast-forward to main on 2026-10-07. `main` == `fix/dependency-vulnerabilities` == 14ca970 (5 commits: 8142b01 audit-fix lockfile, dfa04ea next 16.4.0, 1f08f8c image-size override, 8b943ff shadcn -> devDeps, 14ca970 docs). Nothing pushed: main is ahead of origin/main by 5. Deploy pending DevOps coordination (AGENTS.md).

**What**: Completed dependency-security-remediation. Working tree clean.
**Why**: User authorized "arreglalo como puedas" after the audit triage (33 -> 18 advisories), then explicitly chose to merge locally without push.
**Where**: package.json (next/eslint-config-next exactly 16.4.0; overrides.image-size=^2.0.4; shadcn moved to devDependencies), package-lock.json, odd/tasks/dependency-security-remediation.md.
**Learned (verified outcomes)**:
- npm audit: 33 -> 18 (audit fix) -> 13 (10 high / 3 moderate, 0 critical). `npm audit --omit=dev`: 4 (xlsx high + mammoth/argparse/sprintf-js moderate).
- Cold build passes on Next 16.4.0; test:run byte-identical to baseline (9 failed / 437 passed, pre-existing: salud page, chat route, docker-infrastructure stale expectation); lint regressed 7 -> 23 errors because eslint-config-next 16.4.0 raises eslint-plugin-react-hooks to ^7.1.0 (7.1.1): 16 new errors react-hooks/set-state-in-effect (13), immutability (2), purity (1) across 12 files - documented as follow-up, NOT silenced; alternative to hold eslint-config-next at 16.2.3 (dev-only). No CI exists (.github absent), so no automated gate is broken.
- image-size override proven safe: pptxgenjs dist requires only jszip + sizeof (never image-size); require-hook smoke test generated a 45526-byte PPTX with embedded PNG and observed 0 image-size loads.
- `npm ci` exit 0 with package-lock.json unchanged = lockfile in sync for the Dockerfile path. node_modules on disk already matches main's content (npm ci ran on it).
- `npm ls --depth=0` exit 0; 6 platform-optional "extraneous" entries (@emnapi/*, @img/sharp-wasm32, @napi-rs/wasm-runtime, @tybys/wasm-util) survive ci/prune = npm 11 labeling quirk.
- Accepted risks left visible: braces dev chain (no upstream patch), mammoth->argparse->sprintf-js (argparse only in mammoth CLI), xlsx 0.18.5 (no npm fix; scripts/load-*.mjs only; CDN tarball or reader migration deferred to deploy coordination).
**Next steps**: user decides (a) fix the 16 react-hooks lint sites as their own feature or hold eslint-config-next back, (b) xlsx CDN/vendor decision, (c) when to push and deploy (DevOps; watch /observatorio/ routing on the first Next 16.4.0 deploy).

### Salud 2024 cargado: defunciones, causas, fecundidad adolescente y supervivencia infantil
_*date: 2026-10-07 15:06:38 · engram id: 81*_

**Qué**: Ciclo 2024 del DEIS cargado completo en el tablero (categoría salud pasó de 8.270 a ~12.800 filas) + 3 secciones nuevas de UI en /salud. Commits be71318 + 61f304c.

**Decisiones de método que valen para el futuro**:
1. **Fuentes estructuradas > PDF**: `pdftotext -layout` MEZCLA FILAS en los cuadros del anuario/boletines del DEIS con filas cortadas multi-línea (cuadro 1, 4, 22). Extraer de ahí es inventar datos. En cambio los cuadros TIPO SERIE (una fila por jurisdicción con todos los años en línea: cuadro 5 del boletín 175, cuadro 44 del anuario, 4.1-4.5 del boletín 174) salen PERFECTOS con `pdfplumber extract_text()`. Regla: en estos PDFs, extraer solo cuadros serie; para los demás, buscar CSV/XLSX.
2. `pdfplumber` se instaló vía `py -m pip install pdfplumber` (v0.11.10) — `py` es el alias de Windows que funciona (no `python`, que es el stub de la Store).
3. **Validación cruzada en cascada** que usamos y conviene repetir: serie nueva vs la ya cargada (fecundidad adolescente Córdoba 2015-2022: 8/8 idénticos), serie vs otro cuadro del mismo PDF (TMM5 cuadro 4.5 == cuadro 3), y XLSX vs CSV independiente (defunciones 2024: 24/24 jurisdicciones). Si dos fuentes independientes coinciden, el dato es de confianza.
4. **El CSV de defunciones 2024 tiene el flag de muerte materna** (muerte_materna_id M/T) — la razón materna se deriva del CSV sin extraer el cuadro 40/44 del PDF. PERO: la razón oficial EXCLUYE la muerte materna tardía — con M+T fallan 17/22 jurisdicciones, con solo M cierran 22/22.
5. **Artefacto de codificación provincial (Córdoba)**: I47 taquicardia paroxística = 11,3% de todas las muertes de Córdoba (nacional 1,8%); Córdoba concentra el 56% de las I47 del país con el 9% de las muertes; el cluster arritmias+choque (I47/I49/R57) = 19,2% local vs 4,6% nacional. Es un patrón de codificación (muertes cardíacas súbitas → código de arritmia), no epidemiología. Por eso el gráfico de causas es por CAPÍTULO CIE-10 (inmune: caen igual en Sistema circulatorio) y la nota metodológica en pantalla lo explica. NO filtrar el dato en el ETL: se carga tal cual, la decisión es de presentación.

**Datos cargados en el ciclo**: defunciones 2024 (totales/sexo/grupos de edad/capítulos CIE-10/top-10 causas × 26 jurisdicciones), fecundidad adolescente 2013-2024 × 25 regiones (la serie estaba frenada en 2022; Córdoba 2024 = 8,8‰), mortalidad materna 2000-2024 × 25 (Córdoba 2024 = 3,8), y supervivencia infantil (TMI/neonatal/posneonatal/1-4/TMM5) 2001-2024 × 25 regiones (nuestra TMI solo cubría Córdoba+Nacional). TMM5 Córdoba: 19,2 (2001) → 8,2 (2024). Nacional no viene en el CSV de defunciones: se construye sumando y verifica contra el XLSX (376.405).

**UI**: /salud ahora filtra el fetch por los 51 nombres que usa (1.655 filas vs 12.800 de la categoría completa — 84% menos) y tiene 6 secciones: Indicadores, Natalidad y fecundidad, Supervivencia infantil, Causas de muerte, Mortalidad materna, Vacunación. 13 gráficos con tabla. **Lección**: refactors de fetch rompen mocks posicionales — el mock de page.test.tsx distinguía consultas por orden y hubo que reescribirlo para identificarlas por `categoria` (451 tests pasan).
- Extra: `next dev` de Next 16 reescribe un bloque "nextjs-agent-rules" en AGENTS.md con cada corrida; el propio bloque pide commitearlo para mantener el árbol limpio.

### Vacunacion CNV cableada a la UI: hallazgos y decisiones
_*date: 2026-10-07 19:14:20 · engram id: 82*_

**Qué**: Cableamos la cobertura vacunal CNV a la UI de /salud (commit 99610dd) — la tarea 12 que quedaba del ciclo de Salud. Las 1.399 filas CNV estaban cargadas desde f2747bc pero la sección usaba nombres legacy de 2021 (DPT3-Nacional, DPT4 por quintil) y jamás las leía.

**Diseño**: sección "Cobertura CNV (2024-2025)" DESPUÉS de la legacy (intacta): (1) Córdoba vs Total país por vacuna 2025, ordenadas por cobertura de Córdoba; (2) Córdoba 2024 vs 2025 interanual; (3) borde rojo por debajo del 95% + ReferenceLine "95% inmunidad de rebaño" heredada del chart legacy.

**Hallazgos de datos que quedan visibles a propósito**:
- Solo 2 vacunas de Córdoba alcanzan el 95%: Hepatitis B neonatal (100%) y BCG (98,9%). 26 de 28 barras marcadas en rojo. Los refuerzos de 5 años están en 56-64%.
- 121 filas de la base >100% (max 129,9%): pasa cuando la población objetivo estimada < vacunados reales. NO se corrigen; lo explica la nota metodológica.
- Córdoba VSR embarazadas 2025 = 25% vs 71,7% en 2024 (caída de 47 pp — huele a problema del PDF fuente; se deja visible tal cual).
- 2025 sin 3 vacunas; Fiebre Amarilla 1ra dosis sin fila de Córdoba → los huecos se SALTEAN, nunca cero-relleno.

**Decisión de fetch**: los 32 nombres CNV se agregaron al filtro explícito NOMBRES_SALUD que ya paginaba (mismo camino, sin cuarta consulta concurrente). El comentario viejo que decía "CNV excluido" se corrigió.

**Learned**:
- Los nombres CNV viven como constantes en `src/lib/indicator-names.ts` (CNV_VACUNA_NOMBRES, 32) junto a los legacy, que NO se borran (otros gráficos y tests los usan). Agregar una vacuna al ETL exige agregarla acá: es un espejo manual, punto de fragilidad a mantener.
- Antes de afirmar que un dato "no se muestra", contar ocurrencias del valor esperado en el HTML servido (la palabra "2025" = 0 era la prueba del hueco).
- Playwright DOM-check como verificación de gráficos Recharts: contar rects de barras, leer leyendas y strokes (el borde rojo es stroke #A11F1F, no fill — llenar habría destruido la codificación primaria Córdoba/Nación).
- Con 26/28 barras bajo el umbral, marcarlas con FILL rojo sería visualmente una pared roja: borde rojo + línea de referencia es la codificación correcta.

### Observatorio: R1 sidebar / R2 pobreza / R3 seguridad implementados
_*topic: `observatorio-requerimientos-r1-r4` · date: 2026-10-14 15:12:51 · engram id: 83*_

What: Tres requerimientos del Observatorio implementados y verificados el 2026-10-14, documentados en docs/REQUERIMIENTOS_OBSERVATORIO.md (formato R#: Pedido/Evidencia/Causa/Tiene que/Se verifica/Fuera).

Why: El usuario pidió resolver pantallas a medio terminar y el agente RAG está desorientado; hacía falta bajar los pedidos a requisitos con evidencia antes de tocar código.

Where (archivos tocados, sin commit aÚn):
- src/components/app-shell.tsx — R1 sidebar fija
- src/app/pobreza/page.tsx + borrado de src/components/filter-bar.tsx — R2
- src/app/seguridad/page.tsx, seguridad-charts.tsx, page.test.tsx — R3
- scripts/audit-seguridad.mjs — diagnóstico read-only nuevo

Learned (tres trampas reales, verificado en navegador):
1. Flex item + height: en un <body className="flex flex-col">, un hijo con flex-1 (flex-basis:0%) IGNORA cualquier style height inline — flex-basis gana sobre height en el eje principal. Mi primer fix (calc(100dvh - 4.25rem)) no hizo nada. La solución correcta es envolver header+fila en un contenedor h-dvh overflow-hidden, sin números mágicos.
2. El FilterBar de "ejes" en /pobreza era un control muerto: se leía a sí mismo (searchParams.get('eje') dentro del mismo componente) y ningún Link ni otra pantalla usaba ?eje=. Verificar con grep -rn "eje=" src/ antes de borrar.
3. Deuda de datos: la categoría seguridad mezcla unidades en un mismo eje (Robos 42.771-67.288 hechos; Tentativas 0-1.295; Tasa 0-41,67 x100K). Idéntico defecto en origen afecta al agente RAG, que puede citar una tasa como si fueran hechos. Los conteos de seguridad son solo 129 filas.
4. Medir con getBBox() sobre .recharts-line-curve, NO regex del atributo d — mezcla coords x e y y da números falsos. Y confirmar que la página terminó de renderizar antes de medir (una evaluación prematura me hizo medir /salud cuando navegaba a /pobreza).

### RAG: el indexador está roto, no los archivos
_*topic: `observatorio-rag-indice-corrupto` · date: 2026-10-14 19:08:09 · engram id: 84*_

What: El agente RAG leía un índice con bytes de PDF crudos. Diagnóstico FINAL corregido tras extraer los originales del Storage.

Why: El usuario reportó que el agente trae información desorientada y no le encontramos la utilidad.

CORRECCIÓN IMPORTANTE (lo que antes tenía mal): los ARCHIVOS no están corruptos — el INDEXADOR está roto. Verificado bajando los 13 archivos del bucket `ddna-repositorio` y extrayendo texto con pdf-parse v2 sobre los originales: los 7 PDF tienen texto real y perfecto (ConsumosAdolescentes 46.941 chars / 3.919 palabras; Analisis-situacional 45.679 / 3.912; Aldolescencia-en-pandemia 42.378 / 3.320; Miremos-nuestras-emociones 35.349 / 2.945; Encuesta_Covid 17.705 / 1.463; Inversion_Social_Infancias 15.041 / 1.112; Inversion_social 2010-2023 143.652 / 10.024). El índice, en cambio, tenía chunks tipo "0 0 0 0 ... /Subtype /Type1 /Name /F8". O sea: la extracción falló y se guardó el archivo crudo troceado. Reindexar es la solución y los originales funcionan.

Where: scripts/process-pdf.mjs (indexador del repo, usa PDFParse de pdf-parse v2), docs/REQUERIMIENTOS_OBSERVATORIO.md R4, scripts/audit-rag-goldenset.mjs, scripts/desindexar-archivo.mjs

Learned:
1. Python NO está disponible en la máquina Windows del usuario (alias de Microsoft Store). Toda extracción se hace con pdf-parse v2 en Node. El patrón del repo es `const { PDFParse } = require('pdf-parse'); new PDFParse(new Uint8Array(buf))`.
2. En Git Bash de Windows, `/tmp` no es el mismo path que ve Node: `mkdir -p /tmp/x` crea en el MSYS temp, pero Node escribe en `C:\tmp\x`. Usar siempre `join(tmpdir(), ...)` + `mkdirSync(recursive:true)`.
3. PostgREST `.textSearch` necesita operadores: `'a & b'` funciona, `'a b'` tira `syntax error in tsquery`. El agente real NO usa `content`, usa `search_vector` con `{config:'spanish', type:'websearch'}` y `keywords.join(' OR ')`, más `.limit(20)` SIN ordenar. Réplica exacta o la medición no vale.
4. PostgREST corta en 1.000 filas: hay que paginar con `.range()` + `.order('id')`.
5. La service_role key hardcodeada en scripts/process-pdf.mjs sigue en origin/main (también en DEPLOY.md, PROJECT_STATUS.md, README.md, docs/FUENTES.md, odd/tasks/storage-migration-hardening.md), pero es la VIEJA: devuelve HTTP 401 contra la API. Higiene pendiente, no P0.
6. Los 38.614 indicadores funcionan 5/5 con valores reales (NNyA 977.486 personas 2022, pobreza 45,6% 2024, BCG 96,4% 2025, fecundidad adolescente 9,7 por mil 2024). Nombres de indicador inconsistentes dificultan acertar el nombre exacto.
7. `ai_usage_logs` solo guarda tokens y costo, NO la pregunta: no hay historial para armar el golden set.

## config (9)

### Disabled supabase-ddna MCP entry pending DNS zone for ddna.com.ar
_*topic: `infra/mcp-supabase-ddna-dns` · date: 2026-09-23 12:48:35 · engram id: 1*_

What: Removed the mcp.servers.supabase-ddna entry from C:\Users\Usuario\.config\opencode\opencode.json (global config) so OpenCode stops failing to connect each session. Why: ddna.com.ar has no DNS zone yet (authoritative NS ns1/ns2.dns-parking.com answer NXDOMAIN); user chose to disable the entry and retry later by another route. Where: global opencode.json, mcp.servers block. Learned: JSON validated after edit (ConvertFrom-Json OK); remaining MCP servers: engram, github, hostinger, playwright, supabase, supabase-gestioncomercial, supabase-preprunape. To re-enable later: re-add {"type":"remote","url":"https://supabase.ddna.com.ar/mcp?features=docs%2Cdatabase%2Cdebugging%2Cdevelopment"} once the ddna.com.ar zone + supabase record exist, or point to the official mcp.supabase.com endpoint with the project_ref. Prior note: supabase.ddna.com.ar serves an official Supabase MCP from the user's own server.

### Enabled read-only MCP role password on self-hosted Supabase VPS
_*topic: `supabase/selfhosted-mcp` · date: 2026-09-23 13:36:40 · engram id: 2*_

What: Set a password on the Postgres role supabase_read_only_user matching Studio's POSTGRES_PASSWORD, which fixed supabase-selfhosted MCP list_tables and list_extensions returning 'password authentication failed'.
Why: Local MCP read-only tools build the DSN as postgresql://supabase_read_only_user:${POSTGRES_PASSWORD}@db:5432/postgres (studio lib/api/self-hosted/util.ts getConnectionString), but the role ships with rolpassword NULL. This is documented in supabase/docker/CONFIG.md line 93: 'This role has no password by default, so read-only MCP will fail to connect. To enable, assign a password matching POSTGRES_PASSWORD.' docker/utils/db-passwd.sh deliberately skips this role.
Where: VPS 179.199.132.207 (srv1932068), container supabase-db; fix applied as superuser role supabase_admin. Also added mcp.supabase-selfhosted to C:/Users/Usuario/.config/opencode/opencode.json and added the ddna_deploy public key to deploy's authorized_keys for non-interactive SSH.
Learned: (1) postgres is NOT superuser in this image - ALTER ROLE on reserved roles fails with 'reserved role, only superusers can modify it'; must use supabase_admin. (2) /mcp on Envoy prefix_rewrite goes to cluster studio at /api/mcp, not to postgres-meta. (3) PG_META_DB_USER is postgres, unrelated to the read-only path. (4) PowerShell mangles SQL with || in ssh arguments - pipe the script to 'tr -d \r | bash -s' instead. (5) The Envoy /mcp DENY block is commented out and the local-IP ALLOW is active per the skill's patch.

### Audited gentle-ai harness health + upgraded CLI 3.6.1 -> 3.7.0
_*date: 2026-09-23 15:17:55 · engram id: 11*_

**What**: Full read-only audit of the gentle-ai harness on this repo, then closed the one real gap. Result: healthy, zero warnings, versions aligned.

**Audit evidence**:
- `gentle-ai doctor` -> 8 passed, 0 failed, 0 warnings, "healthy".
- RDD switch: on (decided by global), clone-local unset. `review mode status` is non-mutating.
- `review inspect-authority`: 0 entries, 0 edges, valid:true, complete:true -> no orphan/burned/blocked lineage.
- `review capabilities`: protocol 1.5, schema review-integration.capabilities/v1.5, gates post-apply/pre-commit/pre-push/pre-pr/release.
- 11 subagents registered: gentle-ai-explore, gentle-ai-worker, gentle-ai-verify, jd-fix-agent, jd-judge-a/b, review-{risk,readability,reliability,resilience}.
- Engram reachable (stdio handshake); mem_stats returns project ddna-dashboard.
- MCP: 0/9 "listening" is normal (lazy); verified `supabase` (11 tools) and `github` (26 tools) connect on demand.
- Repo artifacts: AGENTS.md, .agents/skills (3 skills), odd/tasks. No git hooks installed -> no automatic gate enforcement.

**Gap closed (2026-09-23)**: version skew CLI 3.6.1 vs gentle-pi 3.7.0.
- `gentle-ai update` reported the Windows binary distribution is temporarily unavailable pending enforced Authenticode signing; the official path is `go install github.com/gentleman-programming/gentle-ai/v3/cmd/gentle-ai@latest` (needs Go 1.25.10+; this machine has Go 1.27.1, GOBIN=C:\Users\Usuario\go\bin).
- Ran it after backing up to `C:\Users\Usuario\go\bin\gentle-ai.exe.3.6.1.bak`. Now 3.7.0 == gentle-pi 3.7.0, doctor confirms "installed assets match running binary version (3.7.0)".
- `gentle-ai sync` then reported no actions needed; `gentle-ai skill-registry refresh` regenerated `.atl/skill-registry.md` (10 skills, includes supabase, supabase-postgres-best-practices, supabase-selfhosted-mcp). `.atl/` is gitignored (.gitignore:55), so the refresh left the repo clean.

**Learned**: `gentle-ai sync` aligns managed assets to the *running binary* version; it never upgrades the binary. On Windows the upgrade path is `go install` from source, not the packaged distribution. `gga` (Gentleman Guardian Angel) is still behind: 2.8.1 vs 2.10.1, updated via brew. SDD is not wired in this repo (no openspec/, no .pi/), so only the ODD branch runs.

### Deploy is manual via deploy.sh; no GitHub Actions workflow exists
_*topic: `deploy/manual-deploy-vps` · date: 2026-09-23 15:29:11 · engram id: 13*_

**What**: Confirmed how deploys actually run on this project: there is NO CI/CD. `deploy.sh` at the repo root is the deploy entrypoint and it must be run by hand on the VPS.

**Why**: Needed to tell the user how to deploy after merging to main.

**Where**: `deploy.sh` (repo root), `DEPLOY.md`, VPS `/home/deploy/ddna-dashboard`.

**How it works** (`deploy.sh`, bash, `set -e`):
1. `cd /home/deploy/ddna-dashboard`
2. `git stash --quiet 2>/dev/null || true`
3. `git pull origin main` — **hardcoded to `origin main`**, so it pulls `main` regardless of what the local checkout's upstream is. This is why pushing to `main` (not `master`) is what matters for deploys.
4. `ln -sf .env.production .env`
5. `docker compose -f docker-compose.prod.yml build --no-cache` (full rebuild, slow)
6. `docker compose -f docker-compose.prod.yml up -d`
7. sleep 10, then PostgREST warmup loop (5 attempts, 3s apart) reading `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` from `.env.production`
8. `docker image prune -f`

Run it: `ssh deploy@179.199.132.207 "bash /home/deploy/ddna-dashboard/deploy.sh"`
Verify: `docker compose -f docker-compose.prod.yml ps` and `curl http://localhost:80/api/health`

**Gotchas**:
- `DEPLOY.md` line 137 says "Workflow file: `.github/workflows/deploy.yml`" and even prints the YAML — but **`.github/` does not exist in the repo at all** (verified with a hidden-file glob). DEPLOY.md line 94 marks CI/CD as "pending setup". Do NOT assume a push to main triggers a deploy; it does not.
- `deploy.sh` runs `git stash` but **never `git stash pop`** — any tracked local edits on the VPS disappear into the stash and stay there. Check `git stash list` afterwards if the VPS checkout has local modifications. `.env.production` is gitignored so it is untouched.
- SSH access: `ssh deploy@179.199.132.207` (user `deploy`, key `~/.ssh/ddna_deploy` on this machine). Password auth is also enabled per DEPLOY.md.
- The repo has BOTH `origin/main` and `origin/master`; `origin/HEAD` points at `main`. Only `main` is pulled by the deploy.
- Rollback: `git checkout {previous commit}` on the VPS + rebuild (DEPLOY.md §Rollback).

### VPS maintenance executed: 8GB freed, nightly backups, host cron replaces dead vps-cron
_*date: 2026-09-23 19:55:27 · engram id: 22*_

**What**: Executed VPS maintenance (user approved "los tres, sin restart"): builder prune done, nightly DB backups installed and verified, broken maintenance cron replaced with host cron.

**Results (all verified)**:
1. `docker builder prune -f` freed **8.0GB** — disk went 25G -> 19G used (26% -> 20%, 78G free). Reclaimable build cache now 0B (7 entries, 1.546GB all active).
2. Nightly backup: `/home/deploy/scripts/backup_db.sh` dumps `postgres` DB from `supabase-db` in custom format, checks the PGDMP magic, rotates to the 7 newest. First dump: `ddna-20260923-195419.dump` **103M**, verified restorable with `pg_restore -l` inside the container (TOC: 858 entries, dbname postgres). Crontab (deploy user): `30 3 * * * backup_db.sh` nightly.
3. Maintenance cron: dead `vps-cron` container (docker:27-cli, script broken with `>> ""` empty redirects) was STOPPED and then removed by the prune (its `vps-cron_default` network went with it). Replaced by host cron Sunday 03:05 running `/home/deploy/scripts/maintenance.sh` (system prune + builder prune older than 72h + disk >80% alert). Verified: exit 0, log written to /home/deploy/logs/maintenance.log. The weekly Supabase restart behavior was intentionally dropped per user decision.
4. Key infra facts re-confirmed: DB names are `postgres` and `_supabase`; all 13 containers unless-stopped; cron daemon runs; vps-cron had mounted /var/log rw + docker.sock rw + /home/deploy ro.

**Still recommended (not executed, user decisions)**: apt upgrade (25 packages) + scheduled reboot window (kernel 6.8.0-138, uptime since 2026-08-26); SSH key-only auth (PasswordAuthentication currently defaults to enabled); verify ufw status (sudo output was empty); ETL freshness for the `consumo` category (/api/health reports it stale); rotate the leaked Cloud service_role JWT (still pending user action); storage migration is paused (0 files in self-hosted bucket).

**Learned**: the first `ssh ... | tail -30` deploy command returned "No result provided" even though the deploy succeeded (container at 16:26Z, healthy) — SSH piped through tail can swallow output; verify by re-checking state instead of trusting an empty return.

### MCP root route proven non-viable on Hostinger VPS; snapshot taken; cleanup done
_*date: 2026-09-24 19:39:49 · engram id: 23*_

**What**: Attempted the "root temporal vía MCP" route for VPS maintenance on the Hostinger VM (id 1932068, IP 179.199.132.207). Outcome: PROVEN NOT VIABLE — measured, cleaned up, no trace left. Replaced with a snapshot-based safety net.

**Attempt + measurement**:
- Found VM: id 1932068 (KVM 2, Ubuntu 24.04 + Docker template, running, firewall_group_id null).
- Created local ed25519 key, registered in Hostinger (`createPublicKey` id 586035 → now DELETED, "Request accepted"), attached to VM (`attachPublicKeyV1` returned a sparse envelope, so success was NOT confirmed from the API).
- SSH ground truth: 6 attempts as root + 1 as deploy with the new key, all `Permission denied (publickey,password)`. Conclusion: the Hostinger attach does NOT inject the key into the running box's authorized_keys (applies only to future provisioning/console, or the sshd config forbids it). The route gives no live root shell.
- Cleanup: deleted Hostinger key 586035 (account), deleted local key files (/c/Users/Usuario/vps-tmp/maint_key*). Zero trace.
- No pre-existing snapshot (getSnapshot id 0), so created one: action id 116490192 (ct_snapshot_create, state sent) — this is now the rollback point for the pending apt/reboot window.

**Tooling map (verified, for future reference)**:
- supabase MCP: DB only — cannot touch the OS.
- hostinger MCP: NO exec/command/console/shell/ssh-exec tool exists (searched "exec command console shell script ssh" — zero matches). Available and useful: `restartVirtualMachine` (provider-level reboot, no sudo), VM snapshots, firewall group tools (but the VM has NO firewall group and applying one blind risks breaking services whose port surface is unknown on this box — e.g. the app calls PostgREST client-side on :8000).
- SSH tunnel (supabase-selfhosted skill): DB only.
- Therefore sshd_config (key-only SSH), apt upgrade, and ufw STILL require the deploy user's sudo password on the box. No MCP can do them.

**Status of the pending maintenance**: M4 apt upgrade + reboot and M5 SSH key-only remain user-executed (blocks provided). The reboot itself can be triggered by me via MCP once apt is done. ufw local check also needs sudo; provider firewall left untouched deliberately (measure-first).

### M4+M5 done: kernel 6.8.0-142, Docker 29.8.1, SSH key-only, backups running 2 nights
_*date: 2026-09-25 12:26:51 · engram id: 24*_

**What**: Completed M4 (apt upgrade + reboot) and M5 (SSH key-only) on the Hostinger VPS (id 1932068) 2026-09-25. Both verified externally. Also discovered the VPS hosts multiple projects beyond the dashboard.

**M5 — SSH key-only (done)**: Installed `/etc/ssh/sshd_config.d/10-key-only.conf` (PasswordAuthentication no / KbdInteractiveAuthentication no) via scp+sudo cp (the user's terminal kept mangling long pasted lines, so the file was uploaded from local and copied with one short command). Key detail: Ubuntu cloud images ship `/etc/ssh/sshd_config.d/50-cloud-init.conf` containing `PasswordAuthentication yes` (mode 0600, root-only), and because `Include /etc/ssh/sshd_config.d/*.conf` is at the top of sshd_config and OpenSSH uses the FIRST value found, a `99-` drop-in does NOT win. The fix was naming it `10-key-only.conf` so it sorts before `50-`. Verified externally: `ssh -v` now reports "Authentications that can continue: publickey" only, and the ddna_deploy key still logs in. Backup at `/etc/ssh/sshd_config.bak-2026-09-25`.

**M4 — apt upgrade + reboot (done)**: User ran `apt-get update && apt-get -y upgrade` (docker-ce 29.7.2 -> 29.8.1, containerd.io, linux-image 6.8.0-142 among the 25 packages). I triggered the reboot via Hostinger MCP (`restartVirtualMachine`, action 116623456); SSH returned in ~15s. Post-reboot verified: kernel 6.8.0-142-generic (was 6.8.0-138), Docker 29.8.1, **16/16 containers up and healthy**, dashboard /api/health 200, PostgREST :8000 answering, cron running with both entries intact, swap down to 321Mi. Disk grew 19G -> 31G (apt cache + new images) — reclaimable with apt clean + docker prune.

**Backup automation proven autonomously**: the nightly `backup_db.sh` cron produced dumps on its own on Sep 24 03:30 and Sep 25 03:30 (103M each), alongside the manual Sep 23 one — 3 dumps, 309M total. Rotation keeps the 7 newest.

**New context — the VPS is a multi-project host**: besides the dashboard and the Supabase stack there are `ddna-wordpress-app`, `ddna-wordpress-db`, `ddna-observatorio-candidate` and `ddna-edge` containers, plus backup dirs `ddna-controlled`, `ddna-pre-wordpress`, `ddna-wordpress-migration` (created Sep 25 01:50-02:53) — a WordPress migration is running in parallel with this repo's work. This validates the earlier decision NOT to apply a Hostinger provider firewall blindly: the port surface is larger than the dashboard's, and a restrictive rule set would have cut those services.

**Learned**: OpenSSH drop-in precedence is first-match-wins by filename order, so an alphabetically later file is silently ignored — that is why the first attempt appeared to do nothing. And on this box, long pasted shell lines get mangled by the user's terminal; upload files with scp and have them run one short command.

### Cleanup done: backlog committed, master deleted, warmup fixed
_*date: 2026-09-25 14:29:29 · engram id: 34*_

**What**: Cleanup pass committed and pushed. The working tree is now clean; master branch deleted (local + remote); the deploy.sh false-403 warmup fixed. HEAD c78e987.

**Committed in the cleanup (all pushed to origin/main)**:
- d9af560 — ETL/env-var backlog: backfill.mjs + run-backfill.mjs (hardcoded Cloud key -> CLOUD_* env), load-budget-march-2025.mjs + migrate-inversion.mjs (hardcoded Windows path -> EXCEL_PATH/CLI arg), docker-compose.etl.yml (node:20-alpine + npm ci). This was the pre-existing Sep 16-17 uncommitted work; confirmed no hardcoded service_role key remains in any working-tree script.
- 0da17b6 — docs: README.md + PROJECT_STATUS.md realigned to VPS + self-hosted reality (Vercel kept as explicit legacy on Cloud).
- 780fd05 — hardened scripts/migrate-storage.mjs + odd/tasks/{storage-migration-hardening,auth-refactor}.md.
- 3c5747b — .gitignore .codegraph/ (tooling index).
- c78e987 — deploy.sh PostgREST warmup now probes a real table row (/rest/v1/indicadores?select=id&limit=1) instead of the schema root, eliminating the false "5x 403 not ready" on every deploy.

**Other cleanup facts**:
- master was 100% merged (ancestor of main, 16 behind) -> deleted locally and on origin. The two feat/* remote branches (informe-ejecutivo-v2, presentacion-ia) remain but are already ancestors of main (harmless, can be pruned later).
- /api/indicadores no longer 500s: the broken `datos_indicadores` embed was already removed by the other session's observatorio commit; verified live returns data. So no fix needed there.
- The throwaway scripts/tmp-*.mjs helpers were deleted.

**Remaining open (all low priority / deferred)**: W6 (single auth-config source in proxy — deferred, most invasive), W7 (RBAC base tables into migrations, optional), Google OAuth (parked until domain+HTTPS). A second git session has been active on this repo; all pushes were rebased, never force-pushed.

### Pushed 0fdc229: main integrates deps, xlsx, lint and the DevOps CI/CD branch; suite fully green
_*date: 2026-10-07 13:54:21 · engram id: 78*_

**Event**: 2026-10-07 - main fully integrated and pushed twice: (1) `f439ea1..68294dd` (deps + xlsx + lint branches), (2) `68294dd..0fdc229` after merging the DevOps branch `origin/feature/cicd-manual-release` locally. `origin/main` == `0fdc229`; local == origin.

**DevOps branch review** (single commit 8a6ad83, based on f439ea1, 30 files +911/-30): brings GitHub Actions CI (`ci.yml`: pull_request + push main, no secrets), image publish (`publish.yml`: workflow_run of successful push/main CI -> GHCR image by full SHA/digest, no deploy), MANUAL deploy (`deploy.yml`: workflow_dispatch only; requires current main tip + successful CI/publish + devops_notified gate), a host-side receiver in `deploy/` (deploy.py/healthcheck.py/rollback.py/archive.py/policy.py + install-controller.sh + configure-github.sh dry-run default), Dockerfile to ARG NODE_IMAGE=node:22.23.3-alpine@sha256 pinned + NEXT_PUBLIC_BASE_PATH=/observatorio mandatory, .dockerignore/.gitignore updates, DEPLOY_TOPOLOGY.md update, and it FIXES the 3 pre-existing failing test files (salud page mock chain, chat route auth-guard mock + new test, docker-infrastructure expectations aligned to `RUN npm ci` intentionally NOT --omit=dev).

**Merge outcome**: clean 3-way merge (0fdc229); the 3 files overlapping our lint fixes (health/route.ts prefer-const, validate.test.ts, useMonitoreoDraft.test.ts) contained IDENTICAL changes on both sides and auto-merged. Merged tree verified: lint 0 errors / 60 warnings; **tests 40 files / 451 tests, ALL PASSING (0 failed)** - first fully green suite; build exit 0 (Next 16.4.0).

**Branches deleted (local, merged)**: fix/dependency-vulnerabilities (14ca970), fix/xlsx-security-upgrade (ac85766), fix/react19-hooks-lint (fede448). Remaining local: main + feature/respuestas-ui-preview (not ours, tracks origin). Remote `origin/feature/cicd-manual-release` intentionally left (DevOps PR branch).

**Expected on GitHub after the push**: CI run + a Publish image run that may FAIL until the owner creates the `image-build` environment (variable NEXT_PUBLIC_SUPABASE_URL, secret NEXT_PUBLIC_SUPABASE_ANON_KEY) per deploy/README step 2; no deploy is triggered automatically.

**Pending owner/DevOps actions (from deploy/README, not executed here)**: configure-github.sh --apply (main protection + required `Validate dashboard` check + production environment; needs admin), install-controller.sh --apply on the VPS (needs sudo), first controlled manual deploy after WordPress integration + DevOps notice.

**Other**: another session keeps writing in this worktree (odd/tasks/salud-2024-actualizacion.md, scripts/extract-deis-2024.py - untracked, untouched by this work).

## manual (1)

### ODD tasks: propuesta-mppu (prime contractor por integración OSS)
_*topic: `odd/propuesta-mppu/tasks` · date: 2026-10-05 18:28:14 · engram id: 63*_

**What**: Se creó `odd/tasks/propuesta-mppu.md` (feature doc) + este espejo, para preparar la propuesta al ToR de MPPU en rol de **prime contractor por integración de OSS**.

**Why**: El usuario, tras el análisis de solapamiento entre el ToR de MPPU y ddna-dashboard, eligió explícitamente entrar como **prime contractor de los 6 módulos** vía integración OSS (opción "prime"), no como socio técnico especializado.

**Where**: `odd/tasks/propuesta-mppu.md`, 8 tareas (T1-T8). Source del pliego: `C:/Users/Usuario/Downloads/Terms_of_Reference_Global_Collective_Intelligence_Platform_MPPU.pdf`.

**Estrategia definida**:
- Una sola plataforma sobre Supabase self-hosted (Auth, Storage, Realtime, pgvector), ya probado en producción.
- Módulos 2 (Knowledge Hub), 3 (Data Lab) y 5 (AI Creation Studio) = **propios**, con evidencia dura del Tablero (7.541 chunks pgvector, RAG con citas clickeables, 11 secciones con Recharts/Leaflet, Groq con fallback a OpenAI, RBAC completo).
- Módulo 1 (Global Community) = **adoptar** Discourse con SSO contra Supabase Auth. No se construye.
- Módulo 4 (Collaborative Lab) = **adoptar** Yjs/Hocuspocus + Tiptap, o Nextcloud/OnlyOffice.
- Módulo 6 (Action & Amplification) = propio, frontend + datos, sin realtime crítico.
- Argumento vendible: migramos de Power BI propietario a soberanía de datos; cero vendor lock-in, que es literalmente lo que el ToR pide.

**Brechas duras (bloquean presentarse)**: GDPR (sin DPO, registro de tratamiento, DPIA ni flujo de derechos), backups y monitoreo no documentados, equipo nombrado + SLAs + capacitación + soporte, escala realtime a 600 usuarios sin medición, multilenguaje (hoy es-AR provincial).

**Riesgos registrados**: el costo variable de IA a 600 usuarios es el rubro más subestimado; "600 miembros" ≠ "600 concurrentes" (declarar supuesto o se pierde por precio o por plata); probar Discourse/Nextcloud en nuestra infra antes de prometer; Supabase self-hosted no es multi-tenant por defecto; no hay relación previa ni interlocutor identificado con MPPU.

**Preguntas abiertas para el usuario**: (1) ¿solo o en consorcio con prime legal?, (2) ¿hay capacidad real de cubrir GDPR con consultor/DPO?, (3) fecha de cierre y moneda.

**Next**: T1 (go/no-go) — leer el pliego completo y verificar requisitos excluyentes, plazos, forma jurídica, moneda y garantías. Sin eso, el resto puede ser trabajo tirado.

## session_summary (4)

### Session summary: ddna-dashboard
_*date: 2026-09-23 14:41:11 · engram id: 8*_

## Goal
Implement T1-T8 of odd/tasks/respuestas-ui-preview.md: read-only mode on the shared form renderer, filled-in response drawer, preview modal from both entry points, table preview-column fix, and tests.

## Instructions
- Implement the task doc exactly; no alternative designs.
- TypeScript strict, no any; Spanish UI strings, English identifiers/comments; Tailwind utilities reusing neighbouring surfaces.
- No git commands, no commits, no backend/Supabase or /f/[slug] changes.
- Report verification as <command>: <observed result>; classify unrelated failures verbatim.

## Discoveries
- Production form definitions keep definicion.fields empty; all fields live in bloques[*].fields — always use getAllFields from @/lib/formularios/defaults.
- FormPreviewModal must gate its effects on form!==null because formularios-client mounts it permanently with form=null when closed (otherwise body scroll lock persists).
- The task doc claimed Eye was already imported in respuestas-client.tsx; it was not — had to add it.
- Pre-existing failures unrelated to this change: tests/docker-infrastructure.test.ts (expects "npm ci --omit=dev"; untouched Dockerfile uses "npm ci") and 7 lint errors in untouched files (api/health/route.ts prefer-const x2, lib/etl/validate.test.ts no-explicit-any x3, lib/monitoreo/useMonitoreoDraft.test.ts no-explicit-any x2).

## Accomplished
- T1 FormRenderer readOnly prop: disables inputs, hides submit, suppresses error text, conditional header on titulo.
- T2 FieldInput disabled prop threaded to all controls with legible disabled styles.
- T3 responses-table uses getAllFields + hardened formatValue (objects render —).
- T4 response-detail body replaced by read-only FormRenderer; drawer max-w-2xl; dead helpers removed; missing definicion fallback.
- T5 new form-preview-modal.tsx (QrModal interaction contract, BuilderPreview body, max-h-[85vh] scroll).
- T6 Vista previa button in responses header band; T7 Vista previa on each FormRow with previewFormId state.
- T8 Tests: updated drawer/preview assertions, readOnly + empty-title coverage, new responses-table.test.tsx (2 tests).
- Verification: npm run test:run = 437 passed / 1 pre-existing unrelated failure; npx tsc --noEmit = exit 0; npm run lint = exit 1 from pre-existing errors only (none in changed files).

## Next Steps
- Optional: fix the pre-existing docker-infrastructure test / Dockerfile mismatch and the 7 pre-existing lint errors (out of this ticket's scope).

## Relevant Files
- src/components/formularios/form-renderer.tsx — readOnly mode, conditional header, error suppression
- src/components/formularios/fields.tsx — disabled prop on every control
- src/components/formularios/admin/responses-table.tsx — getAllFields preview columns, hardened formatValue
- src/components/formularios/admin/response-detail.tsx — filled-in read-only form body, max-w-2xl
- src/components/formularios/form-preview-modal.tsx — NEW preview modal
- src/app/formularios/respuestas/[id]/respuestas-client.tsx — Vista previa button + modal
- src/app/formularios/formularios-client.tsx — FormRow onPreview + modal state
- src/components/formularios/admin/responses-table.test.tsx — NEW regression test
- src/components/formularios/form-renderer.test.tsx, src/app/formularios/respuestas/[id]/respuestas-client.test.tsx, src/app/formularios/formularios-client.test.tsx — updated coverage
- odd/tasks/respuestas-ui-preview.md — T1-T8 ticked, Progress note added

### Session summary
_*date: 2026-10-07 13:05:03 · engram id: 72*_

**Goal**: Fix the ddna-dashboard dependency vulnerabilities as far as safe, after the user hit ENOLOCK in the wrong directory and then ran npm audit / npm audit fix in the project.
**Instructions**: Authorized "arreglalo como puedas"; ODD workflow; no --force; no deploy; branch work with work-unit commits; verification delegated.
**Discoveries**: next 16.2.3 exact-pinned blocked the critical fix; pptxgenjs never loads its image-size dependency (dist requires only jszip + sizeof); mammoth uses argparse only in its CLI; braces has no upstream patch; eslint-config-next 16.4.0 activates eslint-plugin-react-hooks 7.1.x rules causing 16 new lint errors; 6 npm-11 "extraneous" platform-optional artifacts survive ci/prune.
**Accomplished**: Branch fix/dependency-vulnerabilities with commits 8142b01, dfa04ea, 1f08f8c, 8b943ff, 14ca970. Audit 33 -> 13 full (0 critical) and 4 production-only. next 16.4.0 with cold build green and test parity; image-size override verified by require-hook smoke test; shadcn moved to devDependencies; npm ci proves lockfile sync. Full evidence in odd/tasks/dependency-security-remediation.md.
**Next Steps**: User decides on the 16 react-hooks lint sites (own feature vs holding eslint-config-next back) and on xlsx (CDN tarball vs reader migration). Deploy requires DevOps coordination.
**Relevant Files**: package.json, package-lock.json, odd/tasks/dependency-security-remediation.md, src/components/download-pptx-button.tsx, src/lib/rag/extractors/docx.ts, scripts/load-*.mjs, tests/docker-infrastructure.test.ts.

### Session summary
_*date: 2026-10-07 13:50:42 · engram id: 76*_

**Goal**: Fix ddna-dashboard dependency vulnerabilities as far as safe (user: "arreglalo como puedas"), then resolve the two follow-ups: the react-hooks lint errors and the xlsx advisory (user: "resolvamos 1 y 2").

**Instructions**: ODD workflow; no --force; deploy out of scope (DevOps coordination per AGENTS.md); work-unit commits on feature branches; independent verification delegated; merges are explicit user decisions; no pushes.

**Discoveries**: next 16.2.3 exact pin blocked the critical fix -> 16.4.0 also fixed nested postcss/sharp; pptxgenjs never loads its image-size dep (dist requires only jszip + sizeof) so a patched override was provably safe; mammoth uses argparse only in its CLI; braces/sprintf-js have no upstream patch; eslint-plugin-react-hooks 7.1.1 (via eslint-config-next 16.4.0) has a set-state-in-effect false positive on post-await setState; xlsx >= 0.20 ESM has no fs helpers (XLSX.readFile throws) - caught by the new test before commit; SheetJS 0.20.3 has zero deps; npm 11 labels 6 platform-optional packages as extraneous even after ci/prune.

**Accomplished**:
- Branch fix/dependency-vulnerabilities (merged to main as ff 14ca970, not pushed): audit 33 -> 13, 0 critical; next 16.4.0 (cold build green, test parity); image-size override; shadcn to devDependencies; npm ci lock-sync.
- Branch fix/xlsx-security-upgrade (commit ac85766): xlsx 0.18.5 -> official SheetJS 0.20.3 tarball; audit 13 -> 12; 3 ETL scripts adapted from readFile to read(readFileSync); new 4-case test incl. prototype-pollution guard; verification PASS.
- Branch fix/react19-hooks-lint (commit fede448): 23 lint errors -> 0 (60 warnings remain); 14-file code-only surface, no suppressions; 7 fetch effects restructured due to the rule false positive; independent behaviour review found no newly introduced defect.

**Next Steps**: user decides merging the two branches (or browser spot-check of monitoreo-table/fuentes-client spinners first); when deploying: DevOps coordination, watch /observatorio/ routing on the first Next 16.4.0 deploy, validate that the ETL container can reach cdn.sheetjs.com, and consider the Dockerfile npm ci --omit=dev alignment (would drop the shadcn dev tree from the production image). Pre-existing unrelated debt remains: 9 failing tests (salud page, chat route, stale docker-infrastructure expectation) and 60 lint warnings.

**Relevant Files**: odd/tasks/dependency-security-remediation.md, odd/tasks/xlsx-security-upgrade.md, odd/tasks/react19-hooks-lint.md, package.json, package-lock.json, src/lib/rag/extractors/xlsx.test.ts, scripts/load-budget-2025.mjs, scripts/load-budget-march-2025.mjs, scripts/migrate-inversion.mjs, src/components/monitoreo/monitoreo-table.tsx, src/app/fuentes/fuentes-client.tsx, src/components/login-gate.tsx.

### Session summary
_*date: 2026-10-14 19:53:23 · engram id: 88*_

## Goal
Reemplazar el encabezado (hero) de la home del tablero por el banner que pasó el usuario: `public/logos/portada pagina observatorio web (1).jpg` (2506x473), tratando de no pisar la sesión paralela del Agente RAG.

## Instructions
- Español rioplatense. No commitear salvo pedido explícito. No tocar la infra del DevOps.
- El usuario pidió explícitamente no interferir con otra sesión que trabaja en el Agente RAG.
- Decisión final del usuario: el banner DEBE ser el asset que él pasó; el rediseño queda para otra sesión, mañana.

## Discoveries
- El asset es un poster de portada de sitio (logo + título + subtítulo + gradiente naranja + marco negro horneados en el JPEG) → como banda full-bleed en un tablero blanco se lee como "mancha naranja" y duplica el logo del header (variante color vs blanca).
- `next/image` en este deploy (Next 16.4 standalone, basePath /observatorio) SOLO resuelve `public/` si el `url` incluye el basePath, o sea siempre con `dashboardPath()`; sin basePath el optimizer devuelve 404. Verificado en producción; sharp sí está trazado en `.next/standalone`.
- El deploy real ya es `https://ddna.com.ar/observatorio/...` (el `http://179.199.132.207/observatorio/...` responde 308). `DEPLOY_TOPOLOGY.md` quedó desactualizado en ese punto.
- El Playwright MCP es compartido entre sesiones y se cerró/mezcló con la sesión paralela: para verificar UI usé un script propio con `playwright-core` de `node_modules` (headless, localhost), que es determinista.
- El gemelo `portada pagina observatorio web.jpg` tenía el título mal escrito ("Tabla de Monitoreo"); el usuario autorizó borrarlo.

## Accomplished
- `public/logos/portada pagina observatorio web (1).jpg` → renombrado a `public/logos/portada-observatorio-web.jpg`; borrado el gemelo con typo.
- `src/app/page.tsx`: hero reemplazado por el banner (texto real sr-only + imagen decorativa), recorte 8:3 con aspect fijo en mobile/tablet y banner completo desde lg (resuelve el título cortado en 320-375px). `src/app/page.test.tsx`: +3 tests (banner presente, alt vacío, h1 real).
- Verificado: 12/12 tests del archivo, 454/454 de la suite, `npm run build` exit 0, eslint 0 errores, `tsc --noEmit` limpio, screenshots a 320/375/640/768/1024/1440.
- Se implementó y se descartó (a pedido del usuario) un hero compuesto con el sistema de diseño (sin logo duplicado, texto en HTML). El estado dejado es el poster.

## Next Steps
1. Retomar la deuda de diseño del hero (Engram `ddna-dashboard/hero-home-decision-pendiente`): pedir a DDNA el asset sin texto/logo y recomponer el hero con `SectionHeader`/tokens (opción A), o contener el naranja (B/C).
2. `git add public/logos/portada-observatorio-web.jpg` si se quiere que el asset llegue a CI/deploy (hoy está untracked); commitear src/app/page.tsx + page.test.tsx cuando el usuario lo pida.
3. Recordar que un deploy del tablero requiere avisar al DevOps antes.
4. Sin tocar la sesión paralela del RAG: ella trabaja en scripts/audit-rag*, scripts/reindex-rag.mjs, docs/REQUERIMIENTOS_OBSERVATORIO.md (yo solo toqué src/app/page.tsx y page.test.tsx).

## Relevant Files
- src/app/page.tsx (hero), src/app/page.test.tsx
- public/logos/portada-observatorio-web.jpg (untracked)
- src/components/header.tsx, src/components/section-header.tsx, src/components/repositorio/repo-hero.tsx (lenguaje de encabezados)
- src/lib/app-path.ts + next.config.ts (basePath)
