# Auditoría de Tarjetas — 2026-09-07

> Inventario de 36 pantallas, cruce con DB (21149 rows) y FUENTES.md

| Pantalla | Archivo | Categorías | Indicadores | Último periodo | Última carga | Estado | Recomendación |
|---|---|---|---|---|---|---|---|
| admin | `src\app\admin\ai-usage\page.tsx` | - | - | - | - | - | Mantener |
| admin | `src\app\admin\config\page.tsx` | - | - | - | - | - | Mantener |
| admin | `src\app\admin\page.tsx` | - | - | - | - | - | Mantener |
| admin | `src\app\admin\roles\page.tsx` | - | - | - | - | - | Mantener |
| admin | `src\app\admin\usuarios\page.tsx` | - | - | - | - | - | Mantener |
| apis | `src\app\apis\apis-client.tsx` | - | - | - | - | - | Mantener |
| apis | `src\app\apis\page.tsx` | - | - | - | - | - | Mantener |
| educacion | `src\app\educacion\page.tsx` | - | - | - | - | - | Mantener |
| ejecutivo | `src\app\ejecutivo\page.tsx` | - | - | - | - | - | Mantener |
| encuestas | `src\app\encuestas\page.tsx` | - | - | - | - | - | Mantener |
| f | `src\app\f\[slug]\page.tsx` | - | - | - | - | - | Mantener |
| f | `src\app\f\[slug]\public-form-client.tsx` | - | - | - | - | - | Mantener |
| formularios | `src\app\formularios\formularios-client.tsx` | - | - | - | - | - | Mantener |
| formularios | `src\app\formularios\nuevo\page.tsx` | - | - | - | - | - | Mantener |
| formularios | `src\app\formularios\page.tsx` | - | - | - | - | - | Mantener |
| formularios | `src\app\formularios\respuestas\[id]\page.tsx` | - | - | - | - | - | Mantener |
| formularios | `src\app\formularios\respuestas\[id]\respuestas-client.tsx` | - | - | - | - | - | Mantener |
| formularios | `src\app\formularios\[id]\builder-client.tsx` | - | - | - | - | - | Mantener |
| formularios | `src\app\formularios\[id]\page.tsx` | - | - | - | - | - | Mantener |
| fuentes | `src\app\fuentes\fuentes-client.tsx` | salud, educacion, pobreza, seguridad, inversion, demografia | - | 2024 | 2026-06-12 | stale | Revisar, programar ETL |
| fuentes | `src\app\fuentes\page.tsx` | salud, educacion, pobreza, seguridad, inversion, demografia | - | 2024 | 2026-06-12 | stale | Revisar, programar ETL |
| geo | `src\app\geo\page.tsx` | - | - | - | - | - | Mantener |
| infancias | `src\app\infancias\page.tsx` | - | - | - | - | - | Mantener |
| inversion | `src\app\inversion\page.tsx` | - | - | - | - | - | Mantener |
| login | `src\app\login\page.tsx` | - | - | - | - | - | Mantener |
| monitoreo | `src\app\monitoreo\monitoreo-client.tsx` | - | - | - | - | - | Mantener |
| monitoreo | `src\app\monitoreo\page.tsx` | - | - | - | - | - | Mantener |
| page.tsx | `src\app\page.tsx` | - | - | - | - | - | Mantener |
| pobreza | `src\app\pobreza\page.tsx` | - | - | - | - | - | Mantener |
| presupuesto-nnya | `src\app\presupuesto-nnya\page.tsx` | - | - | - | - | - | Mantener |
| repositorio | `src\app\repositorio\chat\page.tsx` | - | - | - | - | - | Mantener |
| repositorio | `src\app\repositorio\page.tsx` | - | - | - | - | - | Mantener |
| repositorio | `src\app\repositorio\repositorio-client.tsx` | - | - | - | - | - | Mantener |
| salud | `src\app\salud\page.tsx` | - | - | - | - | - | Mantener |
| salud-adolescente | `src\app\salud-adolescente\page.tsx` | - | - | - | - | - | Mantener |
| seguridad | `src\app\seguridad\page.tsx` | - | - | - | - | - | Mantener |

## Por categoría (DB)

| Categoría | Último periodo | Última carga | Días desde | Estado |
|---|---|---|---|---|
| anuario_educacion | 2024 | 2026-06-10 | 89 | stale |
| aprender | 2024 | 2026-04-28 | 132 | desactualizada |
| deis | 2022 | 2026-04-28 | 132 | desactualizada |
| demografia | 2022 | 2026-04-27 | 132 | desactualizada |
| educacion | 2024 | 2026-04-24 | 136 | desactualizada |
| encuestas_2024 | 2024 | 2026-06-10 | 89 | stale |
| inversion | 2024 | 2026-06-09 | 89 | stale |
| pobreza | 2024 | 2026-06-17 | 81 | stale |
| salud | 2024 | 2026-06-12 | 86 | stale |
| salud_adolescente | 2022 | 2026-04-28 | 132 | desactualizada |

## Priorización sugerida

- **P0 (mostrar siempre):** pobreza, salud, educación, inversión, empleo — datos con impacto directo para vecino/periodista
- **P1 (drill-down):** demografía, anuario_educación, aprender, seguridad, senaf
- **P2 (ocultar/fusionar):** consumo (3 rows), deis (36 rows), salud_adolescente (32) — poco volumen o redundante
