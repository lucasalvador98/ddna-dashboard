# Feature: limpieza-repo

## Objetivo

Sacar del repo el peso muerto acumulado: código sin referencias, scripts
superseded, assets sin uso y drift de documentación. Sin cambios de
comportamiento.

## Cuidado conocido

**NO borrar `src/proxy.ts`.** Un scout lo marcó como muerto porque "nadie lo
importa", pero es un **entry point por convención de Next 16**
(`export { authProxy as proxy }` + `export const config = { matcher }`). Next lo
autodetecta sin `import`. Borrarlo rompe todo el auth.
Lección: ningún borrado se ejecuta sin verificar referencias por export y por
convención del framework.

## Fase 1 — código, scripts y assets

### Borrados confirmados (0 referencias reales)

| Archivo | Por qué |
|---|---|
| `src/lib/use-paicor.ts` | 0 importadores |
| `src/lib/hooks.ts` | 0 importadores |
| `src/lib/data.ts` | solo lo importaba `hooks.ts` (muerto) — cadena muerta |
| `src/lib/dashboard-queries.ts` | 0 importadores |
| `src/lib/chart-data.ts` | solo lo importaba `use-chart-data.ts` (muerto) |
| `src/lib/use-chart-data.ts` | 0 importadores |
| `src/components/chart-container.tsx` | 0 importadores |
| `src/lib/ux/useFilterPersist.ts` | 0 importadores |
| `src/types/ddg-api.d.ts` | declara `module 'ddg-api'` que nadie importa |
| `src/lib/actions/indicadores.ts` | las rutas API consultan supabase directo |
| `src/lib/actions/fuentes.ts` | idem |
| `scripts/update-indicators.mjs` | superseded por `update-indec-indicators.mjs`, series IDs viejos, 0 refs |

### Pendiente de decisión

- **Scripts con menciones en docs**: `scripts/backfill.mjs` (20 menciones) y
  `scripts/reprocess-all.ts` (2). El audit de metodología dice "archivar", no
  borrar. Se resuelve con el usuario.
- **Assets**: capturas PNG en la raíz, `public/fonts/`, `public/logos/` (11 de 13
  sin uso), `public/identidad/`, `public/themes/`, `src/fonts/` (las fuentes
  Tipográficas que el tema del portal no usa). Son material de marca: se decide
  con el usuario si se borran o se conservan como archivo histórico.
- **Rutas API huérfanas**: `/api/upload`, `/api/extract-pdf`,
  `/api/admin/reprocess` (0 llamadores). `/api/indicadores` y `/api/fuentes`
  están documentadas como API pública → no se tocan sin confirmación.

## Fase 2

- Piloto cross-filter de **Salud** (distinto al de Pobreza, sigue vivo:
  "Piloto: hacé click en un punto del gráfico…").
- Drift de docs: `PROJECT_STATUS.md` / `ROADMAP.md` / `README.md` siguen
  mencionando la "fuente Epilogue" (ya no existe), los endpoints `/api/agent/*`
  (no existen) y el wording "legacy Vercel".

## Tareas

- [x] T1 — Borrar los 12 archivos confirmados. `4efb2b3`
- [x] T2 — Verificar: `tsc --noEmit` 0, `npm run build` 0, tests con los mismos
      9 fallos preexistentes (salud/page, repositorio/chat/route,
      docker-infrastructure — confirmados en un worktree limpio del HEAD).
- [x] T3 — Assets: borrados los 31 no referenciados (~4.5MB): fuentes viejas,
      theme JSON, `public/identidad`, 14 de 16 logos, capturas de la raíz. `c0b4aea`
- [x] T4 — Los 2 scripts one-off que `METODOLOGIA_AUDIT` ya marcaba para archivar. `a252c0f`
- [x] T5 — Fase 2: piloto de Salud (era un feature real, solo se le sacó la
      palabra "Piloto"), 3 rutas API huérfanas, y el drift de `/api/agent/*`. `e2583b1`, `b165e47`
- [ ] T6 — **Deploy coordinado con DevOps** (va último, con todo adentro).

## Resultado

- 12 archivos de código muerto + 31 assets + 2 scripts + 3 rutas API.
- Cero cambios de comportamiento; todo verificado con tsc, build y tests.
- El `deploy.sh` no se usó: el deploy lo hace el DevOps (ver `DEPLOY_TOPOLOGY.md`).
- No se pudo deployar ni verificar en producción: cada deploy requiere aviso previo
  al DevOps por el contrato de la VPS multi-sitio.
- `git status` limpio; todo en `origin/main`.

## Desestimado (2026-10-07)
Las tareas que quedan abiertas en este documento no se van a hacer por ahora;
queda como registro lo realizado. Ver odd/tasks/salud-2024-actualizacion.md para
el trabajo vigente de Salud.
