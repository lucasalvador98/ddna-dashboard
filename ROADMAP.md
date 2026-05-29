# DDNA Dashboard — Roadmap

> **Última actualización**: Mayo 2026

---

## ✅ Completado

### Dashboard
- [x] Scaffold Next.js 16 + TypeScript + Tailwind v4 + App Router
- [x] 6 secciones conectadas a Supabase con datos reales (salud, educación, pobreza, seguridad, inversión, fuentes)
- [x] KPI cards con cambio interanual
- [x] Charts Recharts con fuente y fecha de actualización
- [x] Identidad visual DDNA (paleta institucional, fuente Epilogue, logos oficiales)
- [x] Bugs corregidos (Image warnings, data collision, filtros duplicados, sidebar)
- [x] Deploy en Vercel con build automático

### RAG Agent (Indicadores)
- [x] `/api/repositorio/chat` — agente con tools para consultar indicadores
- [x] 5 tools de indicadores: listar, último valor, serie temporal, overview, breakdown
- [x] Tool de búsqueda vectorial en documentos (`search_knowledge_base`)
- [x] Integración con Groq (Llama 3.1 8B) como LLM
- [x] Chat UI en `/repositorio/chat` con fuentes citadas y badges clickeables

### Repositorio Documental
- [x] Bucket `ddna-repositorio` en Supabase Storage
- [x] Tabla `repositorio` con metadata de archivos (16 documentos)
- [x] Auto-indexing al subir: extracción de texto → chunking → embeddings
- [x] 7,541 chunks en `doc_chunks` con índice IVFFlat
- [x] Página `/repositorio` para explorar y subir archivos

### Chat con Bibliografía
- [x] `/api/agent/chat` — agente de investigación general
- [x] Tools: búsqueda en docs, búsqueda web (DuckDuckGo), scraping de URLs
- [x] Tool de descarga de archivos públicos y listado de bucket

### Backfill
- [x] `POST /api/admin/backfill` — procesa PDFs no procesados del repositorio
- [x] Reemplaza el workflow de N8N (eliminado)
- [x] Protegido con `INTERNAL_API_SECRET`

### Limpieza (Mayo 2026)
- [x] Eliminados `datos/` y `etl/` del repo (datos ya en Supabase)
- [x] Eliminados archivos de configuración local (`.gga`, `.sisyphus/ralph-loop.local.md`)
- [x] Eliminados artifacts SDD obsoletos (`.atl/changes/`)
- [x] Eliminados docs desactualizados (`RAG_AGENT_ARCHITECTURE.md`, propuesta HTML)
- [x] Actualizados `PROJECT_STATUS.md`, `ROADMAP.md`, `docs/AGENT_ARCHITECTURE.md`

---

## 🔲 Pendiente

### Prioridad Alta
1. **GROQ_API_KEY en Vercel** — la variable no está configurada en producción, el chat usa OpenAI como fallback
2. **Testear chat en producción** — verificar que `/repositorio/chat` funciona con datos reales

### Prioridad Media
3. **Limpieza de datos ETL para inversión** — hay 6,164 registros que necesitan revisión/limpieza
4. **Cargar más datos** — salud solo llega a 2022, demografía sin datos, encuestas 2024 sin cargar

### Prioridad Baja
5. **Streaming de respuestas** en el chat de indicadores (actualmente envía respuesta completa)
6. **Mejoras de UI** — animaciones suaves, skeletons de carga, responsive mobile
7. **Testing** — tests unitarios para hooks y agent tools
8. **Auth UI** — login para admin (RLS ya configurado, falta frontend)

---

## Estructura del Proyecto

```
ddna-dashboard/
├── src/
│   ├── app/
│   │   ├── page.tsx                        # Dashboard principal
│   │   ├── layout.tsx                      # Layout con sidebar + header
│   │   ├── globals.css                     # Estilos globales + tema DDNA
│   │   ├── salud/                          # Gráficos de salud
│   │   ├── educacion/                      # Gráficos de educación
│   │   ├── pobreza/                        # Gráficos de pobreza
│   │   ├── seguridad/                      # Gráficos de seguridad
│   │   ├── inversion/                      # Gráficos de inversión
│   │   ├── fuentes/                        # Catálogo de fuentes + APIs
│   │   ├── repositorio/                    # Repositorio documental
│   │   │   ├── page.tsx                    # Lista de archivos
│   │   │   └── chat/                       # Chat con indicadores
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
│   │           └── backfill/               # Backfill de PDFs pendientes
│   ├── lib/
│   │   ├── agent/
│   │   │   └── indicator-tools.ts          # 5 tools de indicadores + search_knowledge_base
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
│   │   └── supabase.ts                     # Cliente Supabase
│   └── components/
│       ├── kpi-card.tsx                    # Card de KPI
│       ├── sidebar.tsx                     # Sidebar colapsable
│       └── charts/                         # Componentes de gráficos
├── supabase/                               # Migraciones y config
├── public/
│   ├── logos/                              # Logos DDNA
│   └── themes/                             # Tema.json
├── docs/
│   ├── FUENTES.md                          # Catálogo de fuentes de datos
│   └── AGENT_ARCHITECTURE.md               # Arquitectura del agente
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
- **INDEC** — Información sobre FTP, Shiny, microdatos
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
