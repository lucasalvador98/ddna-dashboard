# DDNA Dashboard — Roadmap

> **Última actualización**: Agosto 2026

---

## ✅ Completado

### Dashboard
- [x] Scaffold Next.js 16 + TypeScript + Tailwind v4 + App Router
- [x] 11 secciones conectadas a Supabase con datos reales (salud, salud adolescente, educación, pobreza, encuestas, infancias, seguridad, inversión, presupuesto NNyA, monitoreo, fuentes)
- [x] KPI cards con cambio interanual
- [x] Charts Recharts con fuente y fecha de actualización
- [x] Identidad visual DDNA (paleta institucional, fuente Epilogue, logos oficiales)
- [x] Mapas interactivos con Leaflet (`/geo`)
- [x] Informe Ejecutivo (`/ejecutivo`) con generación de presentaciones
- [x] Deploy en Vercel con build automático

### RAG Agent (Indicadores)
- [x] `/api/repositorio/chat` — agente con tools para consultar indicadores
- [x] 6 tools de indicadores: listar, último valor, serie temporal, overview, breakdown, search_knowledge_base
- [x] Integración con Groq (Llama 3.1 8B) como LLM + fallback a OpenAI
- [x] Chat UI en `/repositorio/chat` con fuentes citadas y badges clickeables

### Repositorio Documental
- [x] Bucket `ddna-repositorio` en Supabase Storage
- [x] Tabla `repositorio` con metadata de archivos (16 documentos)
- [x] Auto-indexing al subir: extracción de texto → chunking → embeddings
- [x] 7,541 chunks en `doc_chunks` con índice IVFFlat
- [x] Página `/repositorio` con rediseño UX completo: 9 componentes modulares, drawer de detalle, drag & drop upload, grupos colapsables

### Chat con Bibliografía
- [x] `/api/agent/chat` — agente de investigación general con OpenAI
- [x] Tools: búsqueda en docs, búsqueda web (DuckDuckGo), scraping de URLs, descarga de archivos, listado de bucket

### Autenticación y RBAC
- [x] Auth con Supabase — middleware, login page, AuthProvider en layout
- [x] RBAC completo: roles, permisos por pantalla, admins por ruta protegida
- [x] LoginGate role-aware — 5+ páginas protegidas
- [x] Logout en header, sesión visible
- [x] Admin toggle público/protegido por página

### Panel de Administración
- [x] Admin reorganizado en tabs: Dashboard | Roles | Usuarios | Config
- [x] Gestor de roles con cards y toggles (layout dos columnas)
- [x] KPIs de datos, overview de indicadores y acciones rápidas
- [x] API routes protegidas con server-side auth + service role
- [x] Fix: singleton de Supabase client (eliminado GoTrueClient multiple instances warning)

### Monitoreo de Medios
- [x] Módulo completo de Monitoreo de Medios con CRUD
- [x] Dashboard con 7 charts en 4 secciones (Actores, Fuentes, Identificabilidad, Términos)
- [x] Tabla con server-pagination, column sorting, CSV export
- [x] Formulario con validación, secciones colapsables, search debounced
- [x] Fecha noticia separada de fecha de sincronización
- [x] Script incremental de sincronización
- [x] Delete individual de registros

### Presupuesto NNyA
- [x] Página interactiva de presupuesto con metodología DNPPE/UNICEF
- [x] Datos de ejecución marzo 2025 (272 filas ponderadas NNyA)
- [x] Estimación 2026 y badge "acumulado a marzo" en UI
- [x] Formato de valores en notación legible en español

### APIs
- [x] `/api/health` — Health check (verifica Supabase)
- [x] `/api/indicadores` — GET indicadores con filtro por categoría
- [x] `/api/fuentes` — GET fuentes de datos
- [x] `/api/upload` — POST carga de datos CSV (admin)
- [x] `/api/external` — Proxy para APIs públicas (datos.gob.ar, gestión abierta CBA, INDEC)
- [x] `/api/repositorio/upload` — POST subida de archivos al repositorio
- [x] `/api/repositorio/process` — POST procesamiento de documentos (chunking + embeddings)
- [x] `/api/repositorio/chat` — POST agente de indicadores
- [x] `/api/agent/chat` — POST agente de investigación general
- [x] `/api/agent/search-docs` — POST búsqueda vectorial
- [x] `/api/agent/web-search` — POST búsqueda web
- [x] `/api/agent/scrape-url` — POST scraping de URL
- [x] `/api/agent/download-file` — POST descarga de archivos públicos
- [x] `/api/agent/list-bucket` — GET listado de archivos en bucket
- [x] `/api/admin/backfill` — POST backfill de PDFs pendientes
- [x] `/api/extract-pdf` — POST extracción de texto de PDF

### Testing
- [x] Playwright E2E tests con MCP server
- [x] Tests unitarios para hooks de dashboard (`use-dashboard-data.test.ts`)
- [x] Tests unitarios para formateo (`format-inversion.test.ts`, `aprender-transform.test.ts`)
- [x] Tests unitarios para componentes (`page.test.tsx`, `report-content.test.tsx`, `report-modal.test.tsx`)
- [x] Tests de lógica de indicadores (`indicator-names.test.ts`, `informe-ejecutivo.test.ts`)

### Agente & Fixes
- [x] Integración INDEC API (canastas y empleo)
- [x] Fix: búsqueda difusa en agente de indicadores (pobreza infantil)
- [x] Fix: agente no veía región de indicadores
- [x] Fix: RLS pública en settings, cache middleware 5s

### Limpieza (Mayo 2026)
- [x] Eliminados `datos/` y `etl/` del repo (datos ya en Supabase)
- [x] Eliminados archivos de configuración local (`.gga`, `.sisyphus/ralph-loop.local.md`)
- [x] Eliminados artifacts SDD obsoletos (`.atl/changes/`)
- [x] Eliminados docs desactualizados (`RAG_AGENT_ARCHITECTURE.md`, propuesta HTML)
- [x] Actualizados `PROJECT_STATUS.md`, `ROADMAP.md`, `docs/AGENT_ARCHITECTURE.md`

### Auditoría de Fuentes (Julio 2026)
- [x] Creado `scripts/load-senaf-data.mjs` — carga SENAF (Primeros Años, Dispositivos, Línea 102)
- [x] Ejecutado `scripts/load-senaf-data.mjs` (2026-08-19) — SENAF cargado en Supabase: Primeros Años (362) + Dispositivos adolescentes (18) + Línea 102 (2) = 382 registros
- [x] Verificado TMI vía API hasta 2024 (Nac: 8.5, Cba: 6.8)
- [x] Detectado: RMM/TMNEO/TMPOS sin API directa — requieren ETL desde microdatos DEIS
- [x] Actualizados `docs/FUENTES.md`, `PROJECT_STATUS.md`, `ROADMAP.md`
- [x] Verificado: no hay archivos data/CSV locales que limpiar

---

## 🔲 Pendiente

### Prioridad Alta
1. **GROQ_API_KEY en Vercel** — la variable no está configurada en producción, el chat usa OpenAI como fallback
2. **Testear chat en producción** — verificar que `/repositorio/chat` funciona con datos reales

### Prioridad Media
3. **Limpieza de datos ETL para inversión** — hay 6,164 registros que necesitan revisión/limpieza
4. **RMM/TMNEO/TMPOS post-2022** — DEIS no tiene API, requiere ETL desde microdatos de defunciones + nacidos vivos

### Prioridad Baja
5. **Streaming de respuestas** en el chat de indicadores (actualmente envía respuesta completa)
6. **Mejoras de UI** — animaciones suaves, skeletons de carga, responsive mobile
7. **Tests unitarios faltantes** — agent tools, hooks restantes, componentes nuevos
8. **Login auto-redirect** — redirigir al usuario a la página que intentaba acceder después del login

---

## Estructura del Proyecto

```
ddna-dashboard/
├── src/
│   ├── app/
│   │   ├── page.tsx                        # Dashboard principal con KPIs
│   │   ├── layout.tsx                      # Layout con sidebar + header + AuthProvider
│   │   ├── globals.css                     # Estilos globales + tema DDNA
│   │   ├── salud/                          # Gráficos de salud
│   │   ├── salud-adolescente/              # Gráficos de salud adolescente
│   │   ├── educacion/                      # Gráficos de educación
│   │   ├── pobreza/                        # Gráficos de pobreza e indigencia
│   │   ├── encuestas/                      # Encuestas 2024
│   │   ├── infancias/                      # Barómetro UCA Infancias
│   │   ├── seguridad/                      # Gráficos de seguridad/justicia
│   │   ├── inversion/                      # Gráficos de inversión social
│   │   ├── presupuesto-nnya/               # Presupuesto interactivo NNyA
│   │   ├── monitoreo/                      # Monitoreo de Medios
│   │   ├── fuentes/                        # Catálogo de fuentes + APIs
│   │   ├── repositorio/                    # Repositorio documental
│   │   │   ├── page.tsx                    # Lista de archivos (rediseñado)
│   │   │   └── chat/                       # Chat con indicadores
│   │   ├── geo/                            # Mapas interactivos
│   │   ├── ejecutivo/                      # Informe Ejecutivo
│   │   ├── apis/                           # Documentación de APIs
│   │   ├── login/                          # Login page
│   │   ├── admin/                          # Panel de administración
│   │   └── api/
│   │       ├── health/                     # Health check
│   │       ├── indicadores/                # API de indicadores
│   │       ├── fuentes/                    # API de fuentes
│   │       ├── upload/                     # Carga CSV
│   │       ├── external/                   # Proxy APIs externas
│   │       ├── extract-pdf/                # Extracción de texto PDF
│   │       ├── repositorio/
│   │       │   ├── upload/                 # Subida de archivos
│   │       │   ├── process/                # Procesamiento (chunking + embeddings)
│   │       │   └── chat/                   # Agente de indicadores
│   │       ├── agent/
│   │       │   ├── chat/                   # Agente de investigación general
│   │       │   ├── search-docs/            # Búsqueda vectorial
│   │       │   ├── web-search/             # Búsqueda web
│   │       │   ├── scrape-url/             # Scraping de URLs
│   │       │   ├── download-file/          # Descarga de archivos
│   │       │   └── list-bucket/            # Listado de bucket
│   │       └── admin/
│   │           ├── backfill/               # Backfill de PDFs pendientes
│   │           └── roles/                  # Gestión de roles (RBAC)
│   ├── lib/
│   │   ├── agent/
│   │   │   ├── indicator-tools.ts          # 6 tools de indicadores + search_knowledge_base
│   │   │   └── openai.ts                   # Cliente OpenAI para agents
│   │   ├── rag/
│   │   │   ├── embedder.ts                 # Generación de embeddings
│   │   │   ├── chunker.ts                  # División de texto en chunks
│   │   │   ├── process-document.ts         # Pipeline de procesamiento
│   │   │   └── extractors/
│   │   │       ├── pdf.ts                  # Extracción PDF
│   │   │       ├── docx.ts                 # Extracción DOCX
│   │   │       └── xlsx.ts                 # Extracción XLSX
│   │   ├── hooks.ts                        # Hooks de Supabase
│   │   ├── chart-data.ts                   # Datos placeholder
│   │   ├── supabase.ts                     # Cliente Supabase (singleton)
│   │   ├── auth-guard.ts                   # Auth utilities
│   │   ├── rbac-types.ts                   # Tipos de RBAC
│   │   ├── navigation.ts                   # Configuración de navegación
│   │   ├── use-dashboard-data.ts           # Hook principal de datos
│   │   ├── use-chart-data.ts               # Hook de datos para charts
│   │   ├── dashboard-queries.ts            # Queries del dashboard
│   │   ├── format-inversion.ts             # Formateo de valores de inversión
│   │   ├── indicator-names.ts              # Nombres canónicos de indicadores
│   │   ├── parse-desglose.ts               # Parseo de desgloses JSONB
│   │   ├── aprender-transform.ts           # Transform de datos Aprender
│   │   ├── informe-ejecutivo.ts            # Lógica de informe ejecutivo
│   │   ├── repositorio.ts                  # Utilidades del repositorio
│   │   └── ...
│   ├── components/
│   │   ├── kpi-card.tsx                    # Card de KPI
│   │   ├── sidebar.tsx                     # Sidebar colapsable con grupos
│   │   ├── sidebar-context.tsx             # Context del sidebar
│   │   ├── header.tsx                      # Header con logo + usuario
│   │   ├── auth-provider.tsx               # Provider de autenticación
│   │   ├── login-gate.tsx                  # Gate role-aware por ruta
│   │   ├── section-card.tsx                # Card de acceso a secciones
│   │   ├── section-header.tsx              # Header de sección
│   │   ├── chart-container.tsx             # Contenedor genérico de charts
│   │   ├── geo-maps.tsx                    # Mapas Leaflet
│   │   ├── download-pptx-button.tsx        # Botón de descarga PPTX
│   │   ├── report-content.tsx              # Contenido de informe
│   │   ├── report-modal.tsx                # Modal de informe
│   │   ├── slide-viewer.tsx                # Visor de slides
│   │   ├── presentacion-form.tsx           # Formulario de presentación
│   │   ├── chart-container.tsx             # Contenedor de charts
│   │   ├── charts/                         # Componentes de gráficos
│   │   ├── monitoreo/                      # 10 componentes de monitoreo
│   │   │   ├── monitoreo-dashboard.tsx
│   │   │   ├── monitoreo-table.tsx
│   │   │   ├── monitoreo-form.tsx
│   │   │   ├── monitoreo-stats.tsx
│   │   │   ├── actor-form.tsx
│   │   │   ├── select-field.tsx
│   │   │   ├── state-badge.tsx
│   │   │   ├── text-input.tsx
│   │   │   ├── toggle.tsx
│   │   │   └── constants.ts
│   │   └── repositorio/                    # Componentes del repositorio (9 modulares)
│   ├── test/
│   │   └── setup.ts                        # Setup de testing (Vitest + jsdom)
│   ├── types/                              # Tipos globales
│   └── middleware.ts                       # Next.js middleware para auth
├── docs/
│   ├── FUENTES.md                          # Catálogo de fuentes de datos
│   └── AGENT_ARCHITECTURE.md               # Arquitectura del agente
├── e2e/                                    # Tests E2E con Playwright
├── supabase/                               # Migraciones y config
├── public/
│   ├── logos/                              # Logos DDNA
│   └── themes/                             # Tema.json
├── .env.local.example                      # Template de variables de entorno
└── package.json
```

---

## Fuentes de Datos

Ver `docs/FUENTES.md` para el catálogo completo.

### APIs Externas Conectadas
- **datos.gob.ar** — Catálogo CKAN nacional
- **Gestión Abierta Córdoba** — Catálogo CKAN provincial
- **Gobierno Abierto Córdoba** — DRF municipal
- **INDEC** — API de canastas y empleo + FTP, Shiny, microdatos
- **SENAF** — CSVs de programas de infancia

### Documentos Indexados (16 archivos)
- Informes de pobreza (INDEC, ENCOPRAC)
- Datos DEIS (mortalidad infantil, edad madre)
- Censo 2022 (educación, demografía, salud)
- Aprender 2024 (lengua, matemática)
- Anuarios educativos 2024
- Justicia Córdoba 2022

---

## Comandos Útiles

### Desarrollo
```bash
npm run dev          # Inicia en http://localhost:3000
npm run build        # Build de producción
npm run lint         # ESLint
npm run test:run     # Tests unitarios (Vitest)
npm run test:e2e     # Tests E2E (Playwright)
```

### API
```bash
# Health check
curl http://localhost:3000/api/health

# Indicadores por categoría
curl "http://localhost:3000/api/indicadores?categoria=salud"

# Procesar documento del repositorio
curl -X POST http://localhost:3000/api/repositorio/process \
  -H "Content-Type: application/json" \
  -d '{"fileId": "uuid-del-archivo"}'

# Backfill de PDFs pendientes
curl -X POST http://localhost:3000/api/admin/backfill \
  -H "Authorization: Bearer <INTERNAL_API_SECRET>"
```
