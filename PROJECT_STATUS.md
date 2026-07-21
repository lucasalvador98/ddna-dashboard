# DDNA Dashboard — Estado del Proyecto

> **Última actualización**: Mayo 2026
> **Live**: https://ddna-dashboard.vercel.app/
> **Repo**: https://github.com/lucasalvador98/ddna-dashboard
> **Supabase**: `ddna-dashboard` (ppyyqrvirjqmfpqaqnxy)

---

## Qué está hecho ✅

### 1. Dashboard con datos reales
- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4
- 6 secciones con gráficos conectados a Supabase: salud, educación, pobreza, seguridad, inversión, fuentes
- KPIs con cambio respecto al período anterior
- Fallback automático a placeholders si Supabase no responde
- Bugs visuales corregidos (warnings de Image, data collision en charts, filtros duplicados)
- Identidad visual DDNA completa: paleta institucional, fuente Epilogue, logos oficiales

### 2. RAG Agent — Chat con datos de indicadores
- **Endpoint**: `/api/repositorio/chat` — agente conversacional con tools
- **6 herramientas de indicadores** en `src/lib/agent/indicator-tools.ts`:
  - `listAvailableIndicators` — catálogo de indicadores por categoría
  - `getLatestIndicatorValue` — último valor de un indicador
  - `getIndicatorTimeSeries` — serie temporal completa
  - `getCategoryOverview` — resumen de categoría
  - `getIndicatorBreakdown` — desglose por dimensión (edad, género, región)
  - `search_knowledge_base` — búsqueda vectorial en documentos
- LLM: Groq (`llama-3.1-8b-instant`)
- Embeddings: OpenAI `text-embedding-3-small`
- Modo herramienta + streaming de respuestas
- Citas de fuentes con badges clickeables

### 3. Repositorio Documental
- **Bucket**: `ddna-repositorio` en Supabase Storage
- **16 documentos** indexados (PDFs, DOCX, XLSX)
- **7,541 chunks** en tabla `doc_chunks` con embeddings vectoriales
- Auto-indexing al subir: el endpoint `/api/repositorio/process` extrae texto, chunkea y genera embeddings
- Búsqueda vectorial via pgvector (`search_doc_chunks`)
- Página `/repositorio` para explorar y subir archivos

### 4. Chat con Bibliografía
- **Endpoint**: `/api/agent/chat` — agente de investigación general
- Tools: `search-docs`, `web-search`, `scrape-url`, `download-file`, `list-bucket`
- Búsqueda web via DuckDuckGo
- Scraping de URLs específicas
- Formato de respuesta: respuesta + fuentes citadas

### 5. Backfill Endpoint
- **`POST /api/admin/backfill`** — procesa todos los PDFs no procesados del repositorio
- Protegido con `INTERNAL_API_SECRET`
- Reemplaza el workflow de N8N (eliminado)
- Rate-limit safe: máximo 20 archivos por llamada, procesamiento secuencial

### 6. APIs
- `/api/health` — Health check (verifica Supabase)
- `/api/indicadores` — GET indicadores con filtro por categoría
- `/api/fuentes` — GET fuentes de datos
- `/api/upload` — POST carga de datos CSV (admin)
- `/api/external` — Proxy para APIs públicas (datos.gob.ar, gestión abierta CBA, INDEC)
- `/api/repositorio/upload` — POST subida de archivos al repositorio
- `/api/repositorio/process` — POST procesamiento de documentos (chunking + embeddings)
- `/api/repositorio/chat` — POST agente de indicadores
- `/api/agent/chat` — POST agente de investigación general
- `/api/agent/search-docs` — POST búsqueda vectorial
- `/api/agent/web-search` — POST búsqueda web
- `/api/agent/scrape-url` — POST scraping de URL
- `/api/agent/download-file` — POST descarga de archivos públicos
- `/api/agent/list-bucket` — GET listado de archivos en bucket
- `/api/admin/backfill` — POST backfill de PDFs pendientes
- `/api/extract-pdf` — POST extracción de texto de PDF

### 7. Deploy en Vercel
- **Live**: https://ddna-dashboard.vercel.app/
- Conectado a repo GitHub, build automático en push a main
- Variables de entorno configuradas: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`

---

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript strict |
| Estilos | Tailwind CSS v4 |
| Base de datos | Supabase (PostgreSQL + pgvector) |
| Embeddings | OpenAI `text-embedding-3-small` |
| LLM | Groq (`llama-3.1-8b-instant`) |
| Charts | Recharts |
| Deploy | Vercel |

---

## Supabase — Schema

### Tabla `indicadores`
- ~6,700 registros de datos de indicadores
- Columnas: `id`, `indicador_nombre`, `categoria`, `valor`, `unidad`, `periodo`, `region`, `desglose` (JSONB), `fuente`, `ultima_actualizacion`, `activo`
- RLS: select público, insert/update/delete admin

### Tabla `repositorio`
- 16 archivos con metadata
- Columnas: `id`, `nombre`, `tipo`, `size`, `url`, `categoria`, `processed`, `total_chunks`, `last_processed_at`

### Tabla `doc_chunks`
- 7,541 chunks indexados
- Columnas: `id`, `repo_file_id`, `chunk_index`, `content`, `embedding` (vector 1536), `metadata`
- Índice IVFFlat para búsqueda por similitud coseno

### Tabla `fuentes`
- Catálogo de fuentes de datos con badges por categoría

---

## Links

| Recurso | URL |
|---------|-----|
| Dashboard | https://ddna-dashboard.vercel.app/ |
| GitHub | https://github.com/lucasalvador98/ddna-dashboard |
| Supabase | https://supabase.com/dashboard/project/ppyyqrvirjqmfpqaqnxy |

---

## Configuración de desarrollo

```bash
git clone https://github.com/lucasalvador98/ddna-dashboard.git
cd ddna-dashboard
npm install
cp .env.local.example .env.local
# Editar .env.local con credenciales
npm run dev
```

### Variables de entorno requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=https://ppyyqrvirjqmfpqaqnxy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
INTERNAL_API_SECRET=...       # para /api/admin/backfill
```

---

## Decisiones técnicas

| Decisión | Elección | Razón |
|----------|----------|-------|
| Framework | Next.js 16 (App Router) | SSR/SSG, API routes, deploy Vercel |
| Visualización | Recharts | Ligero, React-native, suficiente para KPIs |
| Base de datos | Supabase (PostgreSQL) | Auth, storage, API REST, pgvector |
| Vector DB | pgvector (Supabase) | Sin infraestructura extra, misma DB |
| LLM | Groq (Llama 3.1 8B) | Rápido, económico, buena calidad en español |
| Embeddings | OpenAI text-embedding-3-small | 1536 dims, $0.02/1M tokens |
| RLS | Público lectura, admin escritura | Seguridad por defecto, sin auth UI |
| N8N | Eliminado | Reemplazado por `/api/admin/backfill` |
| ETL / datos raw | Eliminados del repo | Datos ya cargados en Supabase |
