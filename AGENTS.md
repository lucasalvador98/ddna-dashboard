# AGENTS.md — Code Review Rules

## Project: ddna-dashboard

**Stack**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Supabase

---

## ⚠️ Deploy & Infra — LEER PRIMERO

La VPS es **multi-sitio** y hay un **DevOps** que maneja el edge/infra. Nosotros
solo somos dueños del **Tablero**.

**Antes de cualquier deploy, cambio de puerto o despliegue, LEER
[`DEPLOY_TOPOLOGY.md`](./DEPLOY_TOPOLOGY.md).** Puntos no negociables:

- El tablero vive en **`http://179.199.132.207/observatorio/`** (la raíz es WordPress).
- **Cada deploy del tablero requiere avisar al DevOps primero** — nunca directo.
- **No** arrancar el `ddna-dashboard-app-1` viejo, **no** usar `deploy.sh` (congelado/obsoleto),
  **no** tocar puertos/DNS/443/certs/`compose.production.yml` sin instrucción del DevOps.
- No asumir la topología de ayer: **verificar en vivo** antes de actuar sobre rutas/puertos.

---

## Code Standards

### General
- Usar TypeScript strict mode — tipar todo lo posible
- No usar `any` — usar `unknown` si es necesario
- Componentes de React como Server Components por defecto, usar `'use client'` solo cuando sea necesario
- Funciones async con proper error handling (try/catch)

### Naming
- PascalCase para componentes React: `KpiCard.tsx`
- camelCase para funciones/utilidades: `useDashboardData.ts`
- kebab-case para archivos de páginas: `salud-adolescente/page.tsx`
- Prefijos con use para hooks: `useDashboardData`

### Componentes
-分离 presentational/container cuando hay lógica compleja
- Props con TypeScript interface/explicit type
- Children como `React.ReactNode`

### Estilos
- Tailwind CSS — clases utility, no CSS inline
- Usar `clsx` para conditional classes

### Supabase
- Queries en `/src/lib/`
- Tipos para tablas en `/src/lib/types.ts`
- RLS policies en backend (Supabase), no en frontend

---

## Review Checklist

- [ ] TypeScript compila sin errores (`npm run build`)
- [ ] ESLint pasa (`npm run lint`)
- [ ] No hay console.log/debugging
- [ ] Variables de entorno no hardcodeadas
- [ ] API keys en .env, no en código
- [ ] Componentes tienen tipos para props
- [ ] Pages tienen metadata export

---

## Git Conventions

- Commits con prefijos: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Branch naming: `feature/nombre`, `fix/nombre`
- PRs con descripción clara

---

## Project Skills

Skills locales del proyecto en `.agents/skills/` (leer el `SKILL.md` antes de trabajar en el tema):

- `supabase` — tareas generales con Supabase (RLS, Data API, CLI, seguridad)
- `supabase-postgres-best-practices` — performance y best practices de Postgres
- `supabase-selfhosted-mcp` — acceso MCP al Supabase self-hosted del VPS vía túnel SSH (nunca exponer `/mcp` público)

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
