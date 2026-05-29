# DDNA Agent Architecture

**Versión**: 2.0  
**Fecha**: 2026-05-29  
**Estado**: Implementado ✅

---

## 🎯 Objetivo

Dos agentes conversacionales independientes que permiten consultar los datos de la Defensoría:

1. **Agente de Indicadores** (`/api/repositorio/chat`) — consulta datos estructurados de la DB + documentos
2. **Agente de Investigación** (`/api/agent/chat`) — búsqueda en documentos + web + scraping

Ambos usan Groq como LLM y OpenAI para embeddings.

---

## 🏗️ Arquitectura General

```
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND                                  │
│  /repositorio/chat  (UI de chat con fuentes citadas)          │
└────────────────────────┬─────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
   ┌──────▼──────┐              ┌──────▼──────────┐
   │  AGENTE DE  │              │  AGENTE DE      │
   │ INDICADORES │              │  INVESTIGACIÓN  │
   │             │              │                 │
   │ /repositorio│              │ /api/agent/chat │
   │ /chat       │              │                 │
   └──────┬──────┘              └──────┬──────────┘
          │                            │
   ┌──────┴────────────────────────────┴──────────┐
   │                  TOOLS                        │
   ├───────────────────────┬──────────────────────┤
   │ Indicador Tools (5)   │ Research Tools       │
   │ • listAvailable       │ • search-docs        │
   │ • getLatestValue      │ • web-search         │
   │ • getTimeSeries       │ • scrape-url         │
   │ • getCategoryOverview │ • download-file      │
   │ • getBreakdown        │ • list-bucket        │
   ├───────────────────────┴──────────────────────┤
   │         search_knowledge_base                │
   │      (compartida por ambos agentes)          │
   └───────────────────────┬──────────────────────┘
                           │
                ┌──────────▼──────────┐
                │     SUPABASE         │
                │  • indicadores       │
                │  • doc_chunks (pgv.) │
                │  • repositorio       │
                │  • Storage           │
                └──────────────────────┘
```

---

## Agente 1: Indicadores (`/api/repositorio/chat`)

**Archivo**: `src/app/api/repositorio/chat/route.ts`  
**Tools**: `src/lib/agent/indicator-tools.ts`

### Flow

```
User: "¿Cuál es la tasa de pobreza infantil en Córdoba?"

1. Vector search → busca en doc_chunks contenido relevante
2. LLM (Groq) analiza la pregunta + chunks → decide tools a usar
3. LLM llama a getLatestIndicatorValue("Pobreza infantil")
4. Tool consulta tabla indicadores en Supabase → devuelve datos
5. LLM sintetiza respuesta con datos + fuentes
6. Respuesta: valor + año + fuente + badges clickeables

Máximo 3 rondas de tools, 5 tool calls totales.
```

### Tools de Indicadores

| Tool | Descripción | Parámetros |
|------|-------------|------------|
| `listAvailableIndicators` | Lista todos los indicadores por categoría | — |
| `getLatestIndicatorValue` | Último valor de un indicador | `indicadorNombre` (req), `categoria` (opt) |
| `getIndicatorTimeSeries` | Serie temporal completa | `indicadorNombre` (req), `categoria` (opt), `limit` (opt) |
| `getCategoryOverview` | Resumen de todos los indicadores de una categoría | `categoria` (req) |
| `getIndicatorBreakdown` | Desglose por dimensión (edad, género, región) | `indicadorNombre` (req), `desgloseField` (opt) |
| `search_knowledge_base` | Búsqueda vectorial en documentos | `query` (req), `max_results` (opt) |

### LLM

- **Proveedor**: Groq (con fallback a OpenAI)
- **Modelo**: `llama-3.1-8b-instant` (Groq) / `gpt-4o-mini` (OpenAI)
- **Temperatura**: 0.3 (respuestas precisas)
- **Tools**: Function calling nativo de Groq (compatible con OpenAI format)

---

## Agente 2: Investigación (`/api/agent/chat`)

**Archivo**: `src/app/api/agent/chat/route.ts`

### Flow

```
User: "¿Qué dice el informe de pobreza 2024 sobre la indigencia?"

1. LLM analiza la pregunta
2. Decide llamar a search-docs → busca en doc_chunks
3. Si no encuentra suficiente contexto, llama a web-search → DuckDuckGo
4. Si el usuario dio una URL, llama a scrape-url
5. Sintetiza respuesta con fuentes

Máximo 5 tool calls totales.
```

### Tools de Investigación

| Tool | Endpoint | Descripción |
|------|----------|-------------|
| `search-docs` | `/api/agent/search-docs` | Búsqueda vectorial en `doc_chunks` |
| `web-search` | `/api/agent/web-search` | Búsqueda web via DuckDuckGo |
| `scrape-url` | `/api/agent/scrape-url` | Extrae texto de una URL específica |
| `download-file` | `/api/agent/download-file` | Descarga archivos desde URLs públicas |
| `list-bucket` | `/api/agent/list-bucket` | Lista archivos en Supabase Storage |

---

## Pipeline de Documentos

### Auto-indexing al subir

```
1. Usuario sube archivo → /api/repositorio/upload
   → Guarda en Supabase Storage + tabla repositorio

2. POST /api/repositorio/process { fileId }
   → Descarga archivo del bucket
   → Extrae texto (pdf.ts | docx.ts | xlsx.ts)
   → Divide en chunks (chunker.ts: 500-1000 chars, 100 overlap)
   → Genera embeddings (embedder.ts: OpenAI text-embedding-3-small)
   → Guarda en doc_chunks con vector(1536)
   → Actualiza repositorio.processed = true
```

### Backfill de PDFs históricos

```
POST /api/admin/backfill
Authorization: Bearer <INTERNAL_API_SECRET>

→ SELECT * FROM repositorio WHERE processed = false
→ Procesa secuencialmente (máx 20 archivos)
→ Para cada uno: extracción → chunking → embeddings → INSERT
```

### Búsqueda Vectorial

```sql
-- Función search_doc_chunks en Supabase
SELECT c.id, c.content, c.metadata,
       1 - (c.embedding <=> query_embedding::vector) AS similarity
FROM doc_chunks c
WHERE c.embedding IS NOT NULL
ORDER BY c.embedding <=> query_embedding::vector
LIMIT 10;
```

---

## Stack de Agentes

| Componente | Tecnología | Notas |
|------------|------------|-------|
| **LLM** | Groq (Llama 3.1 8B) | Principal, rápido y económico |
| **LLM fallback** | OpenAI (gpt-4o-mini) | Si GROQ_API_KEY no configurada |
| **Embeddings** | OpenAI text-embedding-3-small | 1536 dimensiones |
| **Vector DB** | pgvector (Supabase) | Índice IVFFlat, cosine distance |
| **Tool calling** | Function calling (Groq/OpenAI) | Tool definitions en `indicator-tools.ts` |
| **Web search** | DuckDuckGo | Sin API key, HTML scraping |
| **Text extraction** | `pdfjs-dist`, `mammoth`, `xlsx` | Según tipo de archivo |
| **Chunking** | Custom splitter | `src/lib/rag/chunker.ts` |
| **Frontend** | React + Tailwind v4 | Chat UI con fuentes + badges |

---

## Base de Datos

### `repositorio`
```sql
CREATE TABLE repositorio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo TEXT,           -- 'pdf', 'docx', 'xlsx'
  size BIGINT,
  url TEXT,            -- URL pública en Supabase Storage
  categoria TEXT,
  processed BOOLEAN DEFAULT FALSE,
  total_chunks INTEGER DEFAULT 0,
  last_processed_at TIMESTAMPTZ
);
```

### `doc_chunks`
```sql
CREATE TABLE doc_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_file_id UUID REFERENCES repositorio(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  UNIQUE(repo_file_id, chunk_index)
);

CREATE INDEX idx_doc_chunks_embedding
  ON doc_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

### Datos actuales
- **16 documentos** en `repositorio`
- **7,541 chunks** en `doc_chunks`
- **~6,700 indicadores** en tabla `indicadores`

---

## Variables de Entorno

```env
# Supabase (requerido para todo)
NEXT_PUBLIC_SUPABASE_URL=https://ppyyqrvirjqmfpqaqnxy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Embeddings (requerido para procesar documentos y búsqueda)
OPENAI_API_KEY=sk-...

# LLM principal (requerido para ambos agentes)
GROQ_API_KEY=gsk_...

# Backfill (requerido para /api/admin/backfill)
INTERNAL_API_SECRET=...
```
