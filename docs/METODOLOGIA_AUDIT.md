# Auditoría Metodológica — DDNA Dashboard

> Estado: Borrador — revisar con equipo de datos

## Resumen
Revisión de fuentes y metodologia de ponderación para los 15 tableros. Objetivo: validar si las fuentes/API actuales (datos.gob.ar, Wayback Machine para SENAF, etc.) y la metodologia DNPPE/UNICEF para ponderadores son las más estables y simples para el objetivo (indicadores NNyA Córdoba).

## Tabla de decisión

| Indicador / Fuente | Fuente actual | Alternativa | Tradeoff | Recomendación |
|---|---|---|---|---|
| Canastas / Empleo / Pobreza (INDEC via datos.gob.ar) | `apis.datos.gob.ar/series` | API directa INDEC o `indec.gob.ar` CSV | `datos.gob.ar` es estable y documentada, pero depende de un proxy. Alternativa es scraping directo más frágil. | **Mantener** `datos.gob.ar` + `fetchWithRetry` + validación. Monitorear si INDEC cambia IDs. |
| SENAF (Primeros Años, Dispositivos, Línea 102) | `web.archive.org` via Wayback (datosabiertos.desarrollosocial.gob.ar caído desde 2023) | Nuevo portal `datos Argentina` o pedido a SENAF directo | Wayback es frágil y no se actualiza (último 2023). Si hay nuevo portal, migrar. | **Investigar** si hay nuevo dataset en `datos.gob.ar` o `argentina.gob.ar/senaf`. Si no, mantener Wayback con cache + alerta de staleness. |
| Inversión (Presupuesto PTO Córdoba) | `load-budget-*.mjs` con ponderadores DNPPE/UNICEF | Metodología simple sin ponderar (gasto bruto) | Ponderado es más preciso para NNyA pero más complejo y opaco. Bruto es simple pero sobreestima. | **Mantener ponderado** pero documentar ponderadores en `docs/metodologia-presupuesto-nnya.md` y validar con Finanzas Córdoba anualmente. |
| Salud (DEIS, vacunación) | `load-deis-2024.mjs`, `load-vaccination-data.mjs` | API DEIS si existe | Los CSV DEIS son anuales y estables. No hay API pública mejor. | **Mantener** CSV + validación. |
| Demografía, Consumo, etc. (stale 28/04) | Varios CSV/manual | INDEC Censo API, EPH | Muchos tableros con última carga 28/04 (4 meses). Necesitan cron. | **Activar cron** mensual para estos via `etl.yml` y health `stale` >45d. |

## Próximos pasos
- [ ] Verificar si SENAF tiene nuevo portal 2024-2026 y actualizar URLs en `load-senaf-data.mjs` si existe
- [ ] Validar ponderadores DNPPE/UNICEF con equipo (¿0.66 para BEG sigue vigente en 2026?)
- [ ] Definir umbral de staleness por categoría y alertar en `/api/health` (ya hecho en Slice 1)
- [ ] Archivar scripts one-off (`backfill.mjs`, `reprocess-all.ts`) que no son parte del pipeline regular
