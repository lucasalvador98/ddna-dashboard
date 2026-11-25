# Data freshness and live sources

Feature: make dashboard data current and visibly dated. Tasks are not started; code writes need approval per task.

## Specs

S1. "Que otras mejoras para los usuarios podriamos listar? En terminos de datos estamos actualizados? yo creo que falta"
S2. "Igualmente hay datos conectados a una api o me equivoco?"
S3. "los datos de pobreza creo que deberian estar dinamicos."
S4. "Hace un odd con todas esas tareas y de la manera mas eficiente sin tanto gasto de tokens posibles."
S5. "Podriamos actualizar todo no?" — actualizar los datos de las 15 categorías que reporta `vw_category_freshness`.
S6. Alcance confirmado por el usuario (2026-11-25): "Las 15, sin excepción". Incluye re-scrapear o rehacer loaders para las categorías que hoy dependen de archivos fijos.
S7. Confirmado por el usuario (2026-11-25): `.env.local` define `NEXT_PUBLIC_SUPABASE_URL` apuntando a `supabase.ddna.com.ar` (self-hosted), no al proyecto Cloud.

Findings to honor (not new requirements): `/api/external` fetches SENAF live (24 h cache); `scripts/update-indec-indicators.mjs` pulls INDEC series from `apis.datos.gob.ar` but runs manually; `/pobreza` reads Supabase `indicadores`; `etl.sh` cron is dead per `docs/ai-memory.md`; `src/lib/use-dashboard-data.ts` has hardcoded fallback periods.

## Tasks

| ID | Specs | Route | Commit |
|---|---|---|---|
| T1 Read-only freshness check: `max(periodo)` per category from `/api/health` / `vw_category_freshness` | S1, S2 | inline, read-only | - |
| T2 Schedule the INDEC poverty update (`update-indec-indicators.mjs`) and document a runbook | S2, S3 | writer (scripts + docs), high-risk item 5: own commit | - |
| T3 Replace dead `etl.sh` cron with a verified job | S2, S3 | writer, high-risk item 5: own commit | - |
| T4 Remove hardcoded fallback periods; show "sin datos" when the source is missing | S1 | inline, TDD | - |
| T5 Show per-section data date ("Datos hasta ... · actualizado ...") from freshness view | S1 | writer, TDD | - |
| T6 Apply pending loads after dry-run: Censo 2022, Anuario 2025, Presupuesto 2026 estimate. DB writes need explicit user approval | S1 | ask first (high-risk item 1) | - |
| T7 Wire CNV vacunación 2024-2025 into `/salud` | S1 | writer, TDD | - |
| T8 Annotate security series gaps (robos to 2021, contravenciones to 2023) | S1 | inline | - |
| T9 Show last sync date in Monitoreo and last upload date in Repositorio | S1 | writer, TDD | - |
| T10 Show data period on chat citations | S1 | inline, TDD | - |
| T11 Deploy PISA 2025 sub-tab | S1 | blocked: DevOps action, not implemented here | - |
| T12 Export charts to CSV/PNG | S1 | later; not started | - |
| T13 Loader→categoría→tabla inventory for all 15 categories (which script writes which table, from which upstream) | S5, S6 | inline, read-only | - |
| T14 Harden `scripts/config.mjs`: fail loudly when `NEXT_PUBLIC_SUPABASE_URL` is missing instead of falling back to the Cloud project | S7 | inline, TDD, high-risk item 3 (shared by every loader) | - |
| T15 Capture pre-write row counts per affected table through the authenticated client from `config.mjs` (no secret printed) | S5 | inline, read-only | - |
| T16 Execute the loaders that have new upstream data, category by category, verifying `ultima_carga` advances and row counts are sane | S5, S6 | inline, DB writes authorized by S6 | - |
| T17 Verify `/api/health` reaches `healthy` and record the per-category outcome | S5 | inline, read-only | - |
| T18 Align freshness thresholds to the real source cadence (`20261125140000_freshness_umbral_por_cadencia.sql`) | S5, S6 | inline, high-risk item 3 (changes the `/api/health` contract) | `ec4d05f` |
| T19 Apply the threshold migration to the production Postgres | S5 | blocked: needs the SSH tunnel or Postgres credentials | - |

## Log

E1. T1 evidence (2026-11-18, GET https://ddna.com.ar/observatorio/api/health). Status degraded. Stale: canastas (48 d), consumo (203 d), senaf (90 d). Last load, days since: pobreza 2026-09-30 (48 d, not stale), salud 2026-10-20 (28 d), educacion 2026-09-29 (49 d), anuario_educacion 2026-10-19 (29 d), inversion 2026-06-25 (145 d), seguridad 2026-06-10 (160 d), deis and aprender 2026-04-28 (203 d). The endpoint reports load time, not data period; max(periodo) per category is still unverified.

L1. "Que otras mejoras para los usuarios podriamos listar? En terminos de datos estamos actualizados? yo creo que falta"
L2. "Igualmente hay datos conectados a una api o me equivoco? los datos de pobreza croe que deberian estar dinamicos. Hace un odd con todas esas tareas y de la manera mas eficiente sin tanto gasto de tokens posibles."
L3. "Podriamos actualizar todo no?"
L4. Decisiones del usuario (2026-11-25): alcance "Las 15, sin excepción"; ".env.local apunta a supabase.ddna.com.ar".
E2. Health en vivo 2026-11-25T13:24Z (GET https://ddna.com.ar/observatorio/api/health): `degraded`, stale = canastas (56 d), consumo (211 d), senaf (97 d). Sin vencer pero antiguas: aprender/deis (211 d), encuestas_2024 (168 d), seguridad (167 d), inversion (153 d). Nada se actualizó desde E1 (2026-11-18): los días crecieron exactamente 7-8 en todas las categorías.

E3. T13 inventory (2026-11-25, explorer over `scripts/`). All loaders write to `indicadores`; there is **no recurring ingestion schedule anywhere** (`etl.sh:6` cron is a commented example; `docker-compose.etl.yml` is an opt-in one-shot profile; no `schedule:` in `.github/workflows`; no `vercel.json`). Per category:

| categoría | loader | upstream | escritura |
|---|---|---|---|
| canastas, consumo, empleo, pobreza | `update-indec-indicators.mjs` | datos.gob.ar Series API (INDEC/EPH/STESS/DEIS) | insert-if-missing, **dry-run unless `--apply`** |
| senaf | `load-senaf-data.mjs` | 3 CSVs por Wayback Machine | **delete + insert** |
| deis | `load-deis-2024.mjs`, `load-salud-2024.mjs`, `load-nacimientos.mjs` | DEIS `defuncion2024.csv` + JSON local extraído de PDF | update-if-existing / insert-if-missing |
| salud | `load-salud-2024.mjs`, `load-cnv-vacunacion.mjs`, `load-vaccination-data.mjs` | DEIS CSV; PDFs CNV 2024-2025; serie histórica hardcodeada | insert-if-missing |
| salud_adolescente | `load-vulnerabilidad-sanitaria.mjs` | APIs poblaciones/CONICET + Georef + CSV radios INDEC | insert-if-missing |
| educacion, anuario_educacion | `load-anuario-educacion-2025.mjs` | PDF Anuario 2025 → `.tmp-censo/anuario2025.txt` | insert |
| demografia | `load-censo-2022.mjs` | ZIP/CSV Censo 2022 Córdoba | insert-if-missing |
| inversion | `load-budget-2025.mjs`, `load-budget-2026-estimate.mjs` | XLSX ejecución a marzo 2025 + constantes Ley 11.088 | delete + insert |
| encuestas_2024 | (ninguno) | datos legacy de formularios 2024 | estático |
| aprender | **ninguno** | — | — |
| seguridad | **ninguno** | — | — |

Hallazgo decisivo: **el único loader que consulta una API viva es `update-indec-indicators.mjs`**, y por defecto corre en dry-run. Todo lo demás lee PDFs/CSVs/JSON locales o Wayback, y varios borran filas antes de insertar. `aprender` y `seguridad` no tienen script: sus 211 y 167 días no se arreglan re-corriendo nada.

E4. T15/T16 ejecutado (2026-11-25). Pre-flight: `config.mjs` resuelve `https://supabase.ddna.com.ar` (self-hosted, no el Cloud). Dry-run INDEC: 1316 series validadas · 1309 ya existentes · **7 faltantes** = último período de CBA, CBT, Línea de Indigencia, Línea de Pobreza, Coef. de Engel (canastas) + Asalariados sector privado Córdoba e Índice Empleo Gran Córdoba (empleo). `Desempleo Córdoba (trimestral)` devuelve "Sin datos": serie vacía en la API.
Aplicado con `--apply`: **7 insertados, 0 errores**. Verificado: `indicadores` 40090 → **40097** filas; `vw_category_freshness` movió canastas a 2026-11-25T13:36:55Z y empleo a 2026-11-25T13:37:06Z.
Diagnóstico de la métrica: `vw_category_freshness` (`migrations/20260908195500_category_freshness_view.sql:20-23`) expone `max(ultima_actualizacion)`, es decir **cuándo se insertó la última fila**, no el período del dato. Como los loaders son insert-if-missing, una categoría completa **envejece igual** hasta marcarse stale para siempre. Ese defecto, no la falta de datos, es lo que mantiene el health en `degraded`.
Tras el apply el health pasó a `degraded` con **solo 2 stale: senaf (97 d) y consumo (211 d)**. canastas y empleo quedaron verdes.

E5. Causa raíz del residuo (2026-11-25). `update-indec-indicators.mjs` cubre solo 4 categorías: canastas (5 series), empleo (8), pobreza (2), salud (7). **No cubre deis ni consumo.**
- `consumo` no es una serie periódica: sus 3 filas son de **"Encuesta Consumo 2022"** (tamaño de hogar, menores por hogar, % hogares con menores). Es una encuesta de gastos, cadencia ~5 años, y tiene **umbral 90 días** (`20260909120000_category_freshness_umbral.sql:40`). Imposible de cumplir por diseño.
- `senaf` tampoco puede mejorar: sus 3 URLs son **snapshots fijos de Wayback del 2023-12-13** sobre datasets que terminan en 2023T3/2023. El loader no puede producir nada posterior a 2023 por más que se corra. Umbral 45 días.
- `deis` es una sola serie ("Nacidos vivos registrados", DEIS / datos.gob.ar) hasta 2022, sin loader activo que la mantenga.
Conclusión: el `degraded` remanente **no es atraso de carga**. Es desajuste entre el umbral configurado y la cadencia real de cada fuente (más un loader senaf atado a un snapshot muerto). Decidir cómo representarlo es una decisión de producto pendiente.

L5. Decisión del usuario (2026-11-25): **"Umbral realista por fuente"** — no se rediseña la métrica a tres estados; se alinean los umbrales a la cadencia real.
E6. Implementación de L5: migración `supabase/migrations/20261125140000_freshness_umbral_por_cadencia.sql` — `senaf` → NULL (sin fuente viva; el loader apunta a Wayback 2023-12-13) y `consumo` → 1825 días (Encuesta Consumo, cadencia quinquenal). El resto de los umbrales queda igual. Rollback: re-aplicar `20260909120000_category_freshness_umbral.sql`. La limitación insert-time-vs-periodo queda documentada en el encabezado de la migración y **no se resuelve** (fue la opción descartada).
**Estado: migración escrita pero NO aplicada.** Es DDL sobre la Postgres de producción y no hay acceso DDL disponible: el MCP self-hosted necesita el túnel SSH y `psql` necesita la password de Postgres, que no está en el repo. Tampoco se commiteó: el árbol está en la rama `feature/informe-situacion-dean-funes` con cambios ajenos sin commitear (`PROJECT_STATUS.md`, `README.md`, `Microsoft/`, `docs/insumos-informe-situacion/`).

L6. Usuario (2026-11-25): "commitealo en la main" + reporta que el túnel SSH estaba abierto pero se cerró al salir de la sesión (`ssh -L 8080:localhost:8000 ddna-vps` funciona por alias; `deploy@179.199.132.207` directo da `Permission denied (publickey)`).
E7. Commit `ec4d05f` en `main` (local): migración + este documento, 2 archivos, +145 líneas. **No pusheado**: la `main` local está 6 commits detrás de `origin/main`, así que pushear requiere pull/rebase previo y esa decisión es del usuario. T19 sigue bloqueada: el túnel volvió a cerrarse, `localhost:8080/mcp` responde 000.
E8. **T19 aplicada (2026-11-25)** con el túnel abierto (`ssh -L 8080:localhost:8000 ddna-vps`, dejando la ventana abierta) vía MCP self-hosted `apply_migration`. Verificación en la DB: `reloptions = [security_invoker=true]` conservado, 15 categorías, `umbral_senaf = NULL`, `umbral_consumo = 1825`, `anon`/`authenticated` con SELECT. El `pg_get_viewdef` previo coincidía exactamente con el repo: sin drift.
Resultado en vivo: `GET /api/health` → **`status: healthy`, "All systems operational.", stale: ninguna**.
**Lectura honesta de ese verde**: no significa "los datos están actualizados". Significa que el semáforo ya no exige una cadencia que las fuentes no tienen. `senaf` sigue mostrando datos hasta 2023 y `consumo` hasta 2022; lo que cambió es que ahora eso es un hueco **conocido y declarado** (umbral NULL) en lugar de un falso "atraso de carga".

E9. T14 implementada y commiteada en `7eeca8f`. `config.mjs` ya no tiene el fallback al proyecto Cloud; la URL se resuelve con `scripts/resolve-supabase-url.mjs`, que lanza error nombrando la variable. TDD real: RED 2 fallos de aserción -> GREEN 3/3. Integracion verificada tras el cambio: `config.mjs` sigue resolviendo `supabase.ddna.com.ar`. La suite completa no se pudo certificar por OOM del runner (408/440 pasaron, 3 fallos en `ejecutivo`, `formularios-client` y `repositorio/chat`, que no importan nada de lo cambiado).
