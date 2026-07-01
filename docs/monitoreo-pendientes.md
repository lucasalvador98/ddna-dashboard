# Monitoreo de Medios — Pendientes

> Generado: 2026-07-01
> Estado: Componentes extraídos (commit `41e8865`), recharts integrado, 4 secciones nuevas de dashboard.
> Base: `src/components/monitoreo/` (componentes allá, no en `src/app/monitoreo/`)

---

## Sprint 1: Bug Fixes (urgente, 15 min)

- [ ] Agregar `'Economia'` a `SECCION_OPTIONS` en `src/components/monitoreo/constants.ts`
- [ ] Agregar `'Adicciones'` a `TOPICO_PRINCIPAL_OPTIONS` en `src/components/monitoreo/constants.ts`
- [ ] Verificar que dashboard no tenga hardcap de registros (el commit de ayer ya no usa limit(5000) pero revisar `src/components/monitoreo/monitoreo-dashboard.tsx`)

## Sprint 2: Server-Side Aggregation

- [ ] Crear DB view `monitoreo_dashboard_stats` en Supabase (KPIs + distribuciones)
- [ ] Refactor dashboard para consultar la view en vez de traer 5000+ registros
- [ ] Remover `aggregateCounts()` del cliente

## Sprint 3: Features

- [ ] URL-based filters con `useSearchParams` (filtros sobreviven refresh/compartir link)
- [ ] Export CSV de registros filtrados
- [ ] Column sorting (click en header, indicador visual)

## Sprint 4: UX Polish

- [ ] Inline validation en formulario (errores en campos al submit)
- [ ] Empty states descriptivos ("sin resultados para estos filtros" vs "sin datos")
- [ ] Confirm dialog antes de borrar actor con datos
- [ ] Toast de éxito al guardar
- [ ] Loading skeletons para dashboard y tabla

## Sprint 5: Bulk Operations (Backlog)

- [ ] Checkbox column + selección múltiple en tabla
- [ ] Bulk action bar (cambiar estado en lote)

## Sprint 6: Config desde DB (Backlog)

- [ ] Tabla `monitoreo_config` en Supabase
- [ ] Seed con opciones actuales
- [ ] RLS read-only
- [ ] Cargar opciones desde DB con fallback hardcoded

## Sprint 7: Testing

- [ ] Tests unitarios para utils (aggregateCounts, export)
- [ ] Tests de componentes (FormView, TableView)
- [ ] Verificar que build pasa
