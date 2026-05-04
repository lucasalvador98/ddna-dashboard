# DDNA Agent Architecture — Enfoque B

**Versión**: 1.0  
**Fecha**: 2026-05-04  
**Enfoque**: Agent con Tools  
**Estado**: Por implementar

---

## 🎯 Objetivo

Crear un agente conversacional inteligente que pueda:

1. Responder preguntas sobre fuentes primarias de la Defensoría (documentos subidos)
2. Complementar con búsqueda en internet cuando sea necesario
3. Razonar y decidir qué herramienta usar según la consulta

---

## 🏗️ Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│                    /repositorio/chat (UI)                    │
└─────────────────────────┬────────────────────────────────────┘
                          │
                    ┌─────▼─────┐
                    │  AGENT   │
                    │ (Groq)   │
                    │          │
                    │ Decides: │
                    │ - Which  │
                    │   tools  │
                    │ - How to │
                    │   answer │
                    └─────┬─────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼────┐     ┌──────▼─────┐   ┌─────▼──────┐
    │ TOOL 1 │     │  TOOL 2    │   │  TOOL 3    │
    │Search  │     │  Web       │   │  Scrape    │
    │Docs    │     │  Search    │   │  URL       │
    └────────┘     └────────────┘   └────────────┘
```

---

## 🔧 Tools del Agent

### Tool 1: `search_knowledge_base`

Busca en los documentos subidos al repositorio.

```typescript
interface SearchKnowledgeBaseInput {
  query: string;
  max_results?: number; // default: 5
  filters?: {
    categoria?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  };
}

interface SearchKnowledgeBaseOutput {
  results: {
    content: string;
    source: string;
    similarity: number;
    metadata: Record<string, unknown>;
  }[];
  total: number;
}
```

**Cuándo usarla**:

- Preguntas sobre documentos de la Defensoría
- Información de encuestas, informes, datos históricos
- Cualquier cosa que pueda estar en los archivos subidos

---

### Tool 2: `web_search`

Busca en internet usando un motor de búsqueda.

```typescript
interface WebSearchInput {
  query: string;
  num_results?: number; // default: 10
  site?: string; // filtrar por sitio específico
}

interface WebSearchOutput {
  results: {
    title: string;
    url: string;
    snippet: string;
    source: string;
  }[];
}
```

**Cuándo usarla**:

- Datos actualizados (noticias, estadísticas recientes)
- Información que no está en los documentos
- Contextos o definiciones de términos

---

### Tool 3: `scrape_url`

Hace scraping de una URL específica.

```typescript
interface ScrapeUrlInput {
  url: string;
  extract_type?: 'text' | 'links' | 'metadata'; // default: "text"
}

interface ScrapeUrlOutput {
  content: string;
  title?: string;
  links?: string[];
  metadata?: Record<string, string>;
}
```

**Cuándo usarla**:

- El usuario proporciona una URL específica
- El agent decide que necesita información de una página específica
- Necesita extraer datos estructurados de una fuente web

---

## 🔄 Flujo del Agent

```
User: "¿Cuál es la tasa de pobreza infantil en Córdoba?"

Agent Reasoning:
"Esta pregunta podría responderse con:
1. Datos locales (documentos subidos) - si hay informes de pobreza
2. Datos web (buscar en internet) - si necesito datos actualizados

Primero buscaré en los documentos, luego complementaré con web si es necesario."

1. search_knowledge_base({ query: "pobreza infantil Córdoba" })
   → Encuentra: "Informe de pobreza 2024" (datos hasta 2023)

2. web_search({ query: "pobreza infantil Córdoba 2024 INDEC" })
   → Encuentra: "INDEC: Pobreza infantil 2024"

3. Synthesize answer with both sources
```

---

## 📋 Prompt del Agent

```python
SYSTEM_PROMPT = """
Eres el asistente de investigación de la Defensoría de los Derechos de Niñas,
Niños y Adolescentes (DDNA) de la Provincia de Córdoba.

Tu trabajo es ayudar a los usuarios a encontrar información precisa y actualizada
sobre temas relacionados con la infancia y adolescencia en Córdoba y Argentina.

## Reglas importantes:

1. **Siempre responde en español** con tono profesional pero accesible.
2. **Cita las fuentes** de donde obtienes la información.
3. **Si no tienes información**, dilo honestamente y propone dónde buscar.
4. **Prioriza fuentes oficiales**: INDEC, DEIS,Ministerios, etc.
5. **Sé preciso con datos**: incluye años, fuentes, y contextos cuando sea relevante.

## Cómo trabajar:

1. **Analiza la pregunta** del usuario
2. **Decide qué herramientas usar**:
   - Si pregunta sobre documentos/archivos → `search_knowledge_base`
   - Si necesita datos actualizados → `web_search`
   - Si el usuario dio una URL → `scrape_url`
3. **Synthetiza** la respuesta con las fuentes encontradas
4. **Sugiere** si el usuario quiere más información o fuentes adicionales

## Formato de respuesta:

- **Respuesta**: Tu respuesta en español
- **Fuentes**: Lista de fuentes consultadas (nombre, fecha, url si aplica)
- **Nota**: Cualquier consideración adicional relevante
"""
```

---

## 📦 Esquema de Base de Datos

### Tabla: `repositorio` (existente)

```sql
-- Agregar campos para metadata enriquecida
ALTER TABLE repositorio
ADD COLUMN IF NOT EXISTS tipo_fuente TEXT DEFAULT 'documento', -- 'documento', 'url', 'api'
ADD COLUMN IF NOT EXISTS etiquetas TEXT[],
ADD COLUMN IF NOT EXISTS fecha_publicacion DATE,
ADD COLUMN IF NOT EXISTS origen TEXT, -- 'upload', 'scraped', 'api'
ADD COLUMN IF NOT EXISTS embed_url TEXT; -- para URLs scrapeadas
```

### Tabla: `url_content` (nueva)

```sql
CREATE TABLE url_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  content TEXT,
  summary TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  embeddings VECTOR(1536) -- optional, for URL search
);

CREATE INDEX idx_url_content_content ON url_content USING gin(to_tsvector('spanish', content));
```

---

## 🚀 Plan de Implementación

### Fase 1: Herramientas Base

- [ ] 1.1 Crear endpoint `/api/agent/search-docs` (buscar en doc_chunks)
- [ ] 1.2 Crear endpoint `/api/agent/web-search` (integrar búsqueda web)
- [ ] 1.3 Crear endpoint `/api/agent/scrape-url` (scraping de URLs)

### Fase 2: Integración Groq

- [ ] 2.1 Actualizar `/api/repositorio/chat` para usar el agent
- [ ] 2.2 Implementar el loop de decisión del agent
- [ ] 2.3 Agregar prompting sophisticated

### Fase 3: Mejoras

- [ ] 3.1 Agregar cacheo de búsquedas web
- [ ] 3.2 Agregar rate limiting
- [ ] 3.3 Mejorar el sistema de citas

---

## 📝 Notas Técnicas

### Web Search Options

| Opción               | Costo    | Notas                                               |
| -------------------- | -------- | --------------------------------------------------- |
| **DuckDuckGo**       | Gratis   | Bueno para testing, no es confiable para producción |
| **SerpAPI**          | Paid     | Mejor calidad, pero costo por query                 |
| ** Tavily**          | Freemium | Diseñado para AI agents, buena opción               |
| **Brave Search API** | Freemium | Buena alternativa gratuita                          |

**Recomendación**: Empezar con Tavily (tienen API gratuita para testing) o implementar wrapper de DuckDuckGo.

### Scraping Options

| Opción         | Notas                     |
| -------------- | ------------------------- |
| **Cheerio**    | Ligero, para HTML simple  |
| **Playwright** | Para sitios JS-heavy      |
| **Firecrawl**  | AI-powered scraping, caro |

**Recomendación**: Cheerio para la mayoría, Playwright para casos específicos.

---

## 🧪 Testing

### Tests unitarios de tools

```typescript
// test: search_knowledge_base
expect(await searchKnowledgeBase("pobreza")).toHaveLength(>0);

// test: web_search
expect(await webSearch("tasa mortalidad infantil Córdoba")).toHaveProperty('results');

// test: scrape_url
expect(await scrapeUrl("https://www.indec.gob.ar")).toHaveProperty('content');
```

---

_Documento vivo - actualizar según evoluciona el proyecto_
