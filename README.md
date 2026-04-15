# DDNA Dashboard

> **Live**: https://ddna-dashboard.vercel.app/  
> Tablero General de Monitoreo de la **Defensoría de los Derechos de Niñas, Niños y Adolescentes** — Provincia de Córdoba

Sistema de monitoreo y visualización de indicadores de infancia y adolescencia que reemplaza la dependencia de Power BI por una solución web moderna, de código abierto y mantenible. **Deployado en Vercel**.

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
│  ETL — Python + Pandas                      │
│  (Ingesta + transformación desde APIs/CSV)  │
└─────────────────────────────────────────────┘
```

| Componente | Tecnología | Justificación |
|-----------|-----------|---------------|
| Framework Web | Next.js 16 (App Router, TypeScript) | SSR/SSG, API Routes integradas, deploy en Vercel |
| Visualización | Recharts + Plotly.js | Recharts para KPIs/líneas, Plotly para mapas interactivos |
| Backend / BD | Supabase (PostgreSQL) | Auth, storage, real-time, API REST autogenerada |
| ETL | Python + Pandas | Estándar en análisis de datos, ingesta programada |
| Control de versiones | Git + GitHub | CI/CD, LFS para datos grandes |

### Recuperación de datos (híbrida)

- **API programada** (`datos.gob.ar`, DEIS): Scripts Python que descargan y normalizan automáticamente
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

1. Crear proyecto en [supabase.com](https://supabase.com) (región: us-west-2 o sa-east-1)
2. Copiar `.env.local.example` a `.env.local` y pegar credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

3. Ejecutar la migración en **SQL Editor** del dashboard de Supabase:
   - `supabase/migrations/20260414000000_initial_schema.sql`
4. Reiniciar el dev server: `npm run dev`

---

## Estructura del proyecto

```
src/
  app/
    layout.tsx               ← Layout raíz con sidebar + header + Epilogue font
    page.tsx                 ← Home con KPIs conectados a Supabase
    salud/page.tsx           ← Mortalidad infantil, cobertura vacunal
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

| Token | Color | Uso |
|-------|-------|-----|
| `--ddna-amber` | #F3A712 | Primario, Educación |
| `--ddna-magenta` | #BF1363 | Pobreza, alertas |
| `--ddna-blue` | #3777FF | Seguridad, links |
| `--ddna-navy` | #00074E | Sidebar, títulos |
| `--ddna-orange` | #FF7F11 | Inversión |
| `--ddna-terracotta` | #E07A5F | Salud |
| `--ddna-sky-blue` | #1E9AD8 | Acentos |
| `--ddna-cream` | #FFE2BF | Acentos claros |
| `--ddna-background` | #FFF0DE | Fondo general |

---

## Fuentes de datos integradas

| Categoría | Fuente | Origen |
|-----------|--------|--------|
| Salud | DEIS — Mortalidad infantil | API / CSV |
| Salud | Cobertura vacunal | CSV manual |
| Educación | Evaluación Aprender | CSV |
| Educación | Escolarización por nivel | Censo 2022 / CSV |
| Pobreza | INDEC — Pobreza e indigencia | API datos.gob.ar |
| Censales | Censo Nacional 2022 | CSV |
| Seguridad | Ministerio Público de Cba | CSV manual |
| Inversión | Presupuesto provincial | CSV manual |
| Demografía | Proyecciones poblacionales | CSV |

---

## Usuarios destinatarios

| Usuario | Uso | Requisito |
|---------|-----|-----------|
| Autoridades | Presentaciones ejecutivas | Interfaz profesional, estética |
| Equipo técnico | Mantenimiento, carga de datos | Acceso admin, documentación |
| Investigadores | Consulta de fuentes, análisis | Repositorio con metadatos |
| Ciudadanos | Consulta pública de indicadores | Acceso abierto vía navegador |

---

## Estado del proyecto

- [x] Scaffold del proyecto (Next.js 16 + TypeScript + Tailwind v4)
- [x] Layout con sidebar colapsable + header con logos oficiales DDNA
- [x] Identidad visual completa (Caprasimo + DK Lemon fonts, Recurso 1-7 icons, Tema.json palette)
- [x] Home page con KPIs conectados a Supabase + fallback placeholder
- [x] 6 secciones temáticas con gráficos Recharts (salud, educación, pobreza, seguridad, inversión, fuentes)
- [x] Supabase: tabla `indicadores` (schema simplificado con valores embebidos, 1667 registros)
- [x] 11+ indicadores seedeados con datos históricos (2018-2024)
- [x] API REST: `/api/health`, `/api/indicadores`, `/api/fuentes`, `/api/upload`
- [x] Catálogo de fuentes con badges por categoría
- [x] Interfaz de carga CSV para admins (`/admin`)
- [x] Scripts ETL Python para datos Excel (`etl/`)
- [x] ETL completo: salud (145), educacion (1056), pobreza (48), seguridad (7), demografia (411)
- [x] Carga de datos reales desde Excel a Supabase (1667 registros)
- [x] Deploy en Vercel — **https://ddna-dashboard.vercel.app/**

---

## Contenido en Supabase (al 15/04/2026)

| Categoría | Registros |
|----------|-----------|
| Salud | 145 (Mortalidad infantil, DEIS) |
| Educación | 1056 (Aprender + Censo 2022) |
| Pobreza | 48 (INDEC + ENCOPRAC) |
| Seguridad | 7 (Ministerio Público Córdoba) |
| Demografía | 411 (Censo 2022 + DEIS) |
| **Total** | **1667** |

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