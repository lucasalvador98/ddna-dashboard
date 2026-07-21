# AGENTS.md — Code Review Rules

## Project: ddna-dashboard

**Stack**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Supabase

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