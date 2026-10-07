# DDNA Dashboard

> **Producción**: http://179.199.132.207/observatorio/ — VPS Hostinger, self-hosted (Caddy)
> **Legacy**: https://ddna-dashboard.vercel.app/ — Vercel + Supabase Cloud; integración con GitHub desconectada el 2026-10-07, retiro pendiente
> Tablero General de Monitoreo de la **Defensoría de los Derechos de Niñas, Niños y Adolescentes** — Provincia de Córdoba

Sistema de monitoreo y visualización de indicadores de infancia y adolescencia que reemplaza la dependencia de Power BI por una solución web moderna, de código abierto y mantenible. **Deployado en Docker sobre una VPS de Hostinger**, con Supabase self-hosted en la misma VPS.

---

## Contexto

La DDNA operaba su Tablero General sobre **Power BI (.pbix)** con archivos CSV/Excel como fuentes de datos. La actualización era 100% manual (~4 horas por ciclo), con dependencia de licencias propietarias, sin repositorio de fuentes consultable y mantenimiento frágil sin versionado.

Este proyecto moderniza ese flujo con una **arquitectura abierta**: Next.js + Supabase + Recharts, eliminando Power BI y permitiendo automatización, colaboración y acceso vía navegador sin instalación.

---

## Arquitectura

```
┌─────────────────────────────────────────────┐
│  PRESENTACIÓN — Next.js + Recharts/Plotly  │
│  (Dashboard web, KPIs, gráficos)           │
├─────────────────────────────────────────────┤
│  API — Next.js API Routes + Supabase       │
│  (Endpoints REST, lazy client)              │
├─────────────────────────────────────────────┤
│  DATOS — Supabase (PostgreSQL)              │
│  (Indicadores, series, fuentes, uploads)    │
├─────────────────────────────────────────────┤
│  ETL — Node.js scripts                      │
│  (Ingesta + transformación desde APIs/CSV)  │
└─────────────────────────────────────────────┘
```

| Componente           | Tecnología                          | Justificación                                             |
| -------------------- | ----------------------------------- | --------------------------------------------------------- |
| Framework Web        | Next.js 16 (App Router, TypeScript) | SSR/SSG, API Routes integradas, deploy Docker en VPS      |
| Visualización        | Recharts + Plotly.js                | Recharts para KPIs/líneas, Plotly para mapas interactivos |
| Backend / BD         | Supabase (PostgreSQL) self-hosted   | Auth, storage, real-time, API REST autogenerada (VPS)     |
| ETL                  | Node.js (scripts/)                  | Scripts de ingesta y transformación desde APIs/CSV        |
| Control de versiones | Git + GitHub                        | CI/CD, LFS para datos grandes                             |

### Recuperación de datos (híbrida)

- **API programada** (`datos.gob.ar`, DEIS): Scripts Node.js en `scripts/` que descargan y normalizan automáticamente
- **CSV manual**: Upload vía interfaz web con validación y carga a Supabase
- **Fallback placeholder**: Dashboard funciona sin Supabase conectado usando datos de referencia

---

## Módulos funcionales

1. **Visualización**: Dashboard principal con KPIs, secciones temáticas (Salud, Educación, Pobreza, Seguridad, Inversión Social), gráficos interactivos
2. **Gestión de Datos**: Carga de archivos, validación, historial de actualizaciones
3. **Catálogo de Fuentes**: Documentación de todas las fuentes oficiales con metadatos y links
4. **Informes**: Generación de reportes y exportación (roadmap)

---

## Inicio rápido

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

El dashboard funciona con **datos placeholder** sin Supabase. Al configurar las credenciales, cambia automáticamente a datos reales.

## Configuración de Supabase

> **Este repo corre contra un Supabase self-hosted en la VPS** (ver `DEPLOY_TOPOLOGY.md` y el skill `supabase-selfhosted-mcp`). El proyecto histórico de Supabase Cloud (`ppyyqrvirjqmfpqaqnxy`) sigue vivo: alimenta al deploy legacy de Vercel y lo consumen los scripts de migración en `scripts/` vía las variables `CLOUD_*` de `.env.local`.

1. Copiar `.env.local.example` a `.env.local` y pegar credenciales del Supabase self-hosted:

```env
NEXT_PUBLIC_SUPABASE_URL=http://179.199.132.207:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

> El tablero se sirve bajo el subpath `/observatorio/`; el build de producción debe
> recibir `NEXT_PUBLIC_BASE_PATH=/observatorio` (ver `DEPLOY_TOPOLOGY.md`).

3. Ejecutar la migración en **SQL Editor** del dashboard de Supabase:
   - `supabase/migrations/20260414000000_initial_schema.sql`
4. Reiniciar el dev server: `npm run dev`

---

## Estructura del proyecto

```
src/
  app/
    layout.tsx               ← Layout raíz con sidebar + header + tipografía del portal
    page.tsx                 ← Home con KPIs conectados a Supabase
    salud/page.tsx           ← Mortalidad, natalidad, supervivencia, causas, mortalidad materna, vacunación (nombres legacy)
    educacion/page.tsx       ← Escolarización, resultados Aprender
    pobreza/page.tsx         ← Pobreza/indigencia infantil, brechas
    seguridad/page.tsx       ← Denuncias, distribución por tipo
    inversion/page.tsx       ← Inversión social por área, % presupuesto
    fuentes/page.tsx         ← Catálogo de fuentes de datos
    api/
      health/route.ts        ← Health check endpoint
      indicadores/route.ts   ← API indicadores (JSON)
      fuentes/route.ts       ← API fuentes (JSON)
  components/
    sidebar.tsx              ← Navegación lateral colapsable con logos DDNA + Cba
    header.tsx               ← Header con branding e identidad visual
    kpi-card.tsx             ← Tarjeta de indicador KPI con cambios interanuales
    section-header.tsx       ← Header de sección con icono y color
    charts/chart-card.tsx    ← Wrapper reutilizable para gráficos
  lib/
    supabase.ts              ← Cliente Supabase (lazy init) + tipos + queries
    data.ts                  ← Datos placeholder y tipos KpiData
    hooks.ts                 ← Hook useIndicadores() con fallback automático
  globals.css                ← Design tokens DDNA como CSS custom properties
```

---

## Paleta de colores DDNA

| Token               | Color   | Uso                 |
| ------------------- | ------- | ------------------- |
| `--ddna-amber`      | #ff8c00 | Marca / Educación   |
| `--ddna-orange`     | #c2410c | Naranja quemado (series de gráfico, Salud) |
| `--ddna-magenta`    | #9a3412 | Pobreza, alertas    |
| `--ddna-blue`       | #165dff | Seguridad, links    |
| `--ddna-navy`       | #050506 | Sidebar, títulos    |
| `--ddna-terracotta` | #c2410c | Salud               |
| `--ddna-sky-blue`   | #165dff | Acentos             |
| `--ddna-cream`      | #f5f0ec | Acentos claros      |
| `--ddna-background` | #e9e7e7 | Fondo general       |

> Valores verificados contra `src/app/globals.css`. `docs/TOKENS_DDNA.md` lista además la
> paleta del theme del portal; ante cualquier diferencia, manda `globals.css`.

---

## Fuentes de datos integradas

| Categoría  | Fuente                       | Origen           |
| ---------- | ---------------------------- | ---------------- |
| Salud      | DEIS — Mortalidad infantil   | API / CSV        |
| Salud      | Cobertura vacunal            | CSV manual       |
| Educación  | Evaluación Aprender          | CSV              |
| Educación  | Escolarización por nivel     | Censo 2022 / CSV |
| Pobreza    | INDEC — Pobreza e indigencia | API datos.gob.ar |
| Censales   | Censo Nacional 2022          | CSV              |
| Seguridad  | Ministerio Público de Cba    | CSV manual       |
| Inversión  | Presupuesto provincial       | CSV manual       |
| Demografía | Proyecciones poblacionales   | CSV              |

---

## Usuarios destinatarios

| Usuario        | Uso                             | Requisito                      |
| -------------- | ------------------------------- | ------------------------------ |
| Autoridades    | Presentaciones ejecutivas       | Interfaz profesional, estética |
| Equipo técnico | Mantenimiento, carga de datos   | Acceso admin, documentación    |
| Investigadores | Consulta de fuentes, análisis   | Repositorio con metadatos      |
| Ciudadanos     | Consulta pública de indicadores | Acceso abierto vía navegador   |

---

## Estado del proyecto

- [x] Scaffold del proyecto (Next.js 16 + TypeScript + Tailwind v4)
- [x] Layout con sidebar colapsable + header con logos oficiales DDNA
- [x] Identidad visual completa (Caprasimo + DK Lemon fonts, Recurso 1-7 icons, Tema.json palette)
- [x] Home page con KPIs conectados a Supabase + fallback placeholder
- [x] 6 secciones temáticas con gráficos Recharts (salud, educación, pobreza, seguridad, inversión, fuentes)
- [x] Supabase: tabla `indicadores` (categoría `salud` ≈ **12.800 filas** tras el ciclo DEIS 2024)
- [x] 11+ indicadores seedeados con datos históricos (2018-2024)
- [x] API REST: `/api/health`, `/api/indicadores`, `/api/fuentes`, `/api/upload`
- [x] Catálogo de fuentes con badges por categoría
- [x] Interfaz de carga CSV para admins (`/admin`)
- [x] Scripts ETL para datos Excel/CSV (Node.js en `scripts/`)
- [x] ETL DEIS Salud 2024 completo (defunciones, causas CIE-10, fecundidad adolescente, mortalidad materna, supervivencia infantil TMI/neonatal/posneonatal/1-4/TMM5)
- [x] Carga de datos reales a Supabase desde múltiples fuentes (Excel/CSV/PDF)
- [x] Deploy principal en Docker sobre VPS Hostinger — **http://179.199.132.207/observatorio/** (ver `DEPLOY_TOPOLOGY.md`)
- [x] Deploy legacy en Vercel — **https://ddna-dashboard.vercel.app/** (Supabase Cloud; integración con GitHub desconectada el 2026-10-07, retiro pendiente)

---

## Contenido en Supabase (medido 2026-10-07)

- **`salud` ≈ 12.800 filas** tras el ciclo DEIS 2024 completo (defunciones 2024, causas por
  capítulo CIE-10, top-10 causas, fecundidad adolescente 2013-2024 × 25 regiones, mortalidad
  materna 2000-2024 × 25, supervivencia infantil TMI/neonatal/posneonatal/1-4/TMM5 2001-2024 × 25).
- **CNV vacunación: 1.399 filas (2024-2025) cargadas pero NO visibles en `/salud`** — la sección
  todavía usa los nombres legacy de `src/lib/indicator-names.ts`. Pendiente de cablear en la UI.
- El resto de las categorías no fue re-medido en esta revisión; su volumen se consulta en la DB.

---

## ETL — Pipeline de Datos

El dashboard se alimenta con datos cargados a Supabase mediante **scripts Node.js** en `scripts/` (`.mjs`) que cubren la ingesta y transformación desde APIs y archivos (CSV/Excel/PDF).

| Script                                | Fuente                     | Tipo de carga        |
| ------------------------------------- | -------------------------- | -------------------- |
| `scripts/update-indec-indicators.mjs` | INDEC / datos.gob.ar API   | API REST (series)    |
| `scripts/load-senaf-data.mjs`         | SENAF                      | CSV → Supabase       |
| `scripts/load-salud-2024.mjs`         | DEIS Estadísticas Vitales 2024 | CSV/JSON → Supabase |
| `scripts/load-cnv-vacunacion.mjs`     | CNV (vacunación)           | PDF → Supabase       |
| `scripts/load-deis-2024.mjs`          | DEIS mortalidad infantil (TMNEO) | PDF → SQL      |
| `scripts/load-vaccination-data.mjs`   | Cobertura vacunal histórica | CSV → Supabase      |
| `scripts/load-budget-*.mjs`           | Presupuesto                | CSV → Supabase       |
| `scripts/config.mjs`                  | —                          | Config compartida    |

> Los scripts usan `scripts/config.mjs` para la conexión a Supabase.

> **Nota histórica**: el pipeline ETL original en Python (`etl/` con `etl.main`, `etl/config.py`, `etl/transform/`) y los datos crudos (`datos/`) fueron eliminados del repo durante la limpieza de 2026 — los datos ya están cargados en Supabase.

---

## Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run start     # Servidor de producción
npm run lint      # Linting con ESLint
```

---

## Licencia

Proyecto interno de la Defensoría de los Derechos de Niñas, Niños y Adolescentes — Provincia de Córdoba.
