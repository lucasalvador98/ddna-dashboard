# Deployment Plan — Docker for Hostinger VPS

> **Status**: Ready for deployment
> **Last updated**: 2026-08-26
> **Goal**: Package the dashboard in Docker for deployment on Hostinger VPS

---

## Context

- **Current stack**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + Supabase
- **App**: `ddna-dashboard` (Defensoría de Niños, Niñas y Adolescentes de Córdoba)
- **Target**: Hostinger VPS (Linux, Docker available)
- **Source**: GitHub repo `lucasalvador98/ddna-dashboard`

### Key dependencies affecting deployment
- `next: 16.2.3` — uses `output: 'standalone'` for Docker
- `cheerio`, `mammoth`, `pdf-parse`, `pptxgenjs`, `xlsx` — pure JavaScript libraries
- `recharts` — bundle size consideration (~200KB gzipped)
- `playwright` — dev only, not included in production image
- `@playwright/mcp` — dev only

---

## Prerequisites

- [x] `next.config.ts` configured with `output: 'standalone'`
- [x] `Dockerfile` created (3-stage multi-stage build)
- [x] `.dockerignore` created
- [x] `docker-compose.yml` created (development)
- [x] `docker-compose.prod.yml` created (production override)
- [x] `.env.production.example` created
- [x] `/api/health` endpoint already exists and returns `{ status: "healthy" }`
- [x] Docker scripts added to `package.json`

---

## Required Environment Variables

| Variable | Required | Secret | Source |
|----------|----------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | No | Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | No | Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Yes | Supabase dashboard |
| `OPENAI_API_KEY` | Yes | Yes | OpenAI platform |
| `INTERNAL_API_SECRET` | Yes | Yes | Generated per-deploy |
| `NODE_ENV` | Yes | No | Set to `production` |

---

## Phase 1 — Build and Test Locally

### 1.1 Build the Docker image
```bash
npm run docker:build
# or
docker compose build
```

### 1.2 Run locally
```bash
npm run docker:dev
# or
docker compose up
```

### 1.3 Verify
- App serves on `http://localhost:3000`
- Health check: `curl http://localhost:3000/api/health`
- Expected response: `{"status":"healthy",...}`

---

## Phase 2 — Deploy to VPS

### 2.1 Setup VPS
- Install Docker + Docker Compose
- Create non-root user
- Configure SSH key
- Firewall (ufw): only 22, 80, 443

### 2.2 Deploy
```bash
git clone https://github.com/lucasalvador98/ddna-dashboard.git
cd ddna-dashboard
cp .env.production.example .env.production
# Edit .env.production with real values
npm run docker:prod
# or
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### 2.3 Verify
```bash
docker compose logs -f app
curl https://your-domain/api/health
```

---

## Phase 3 — Reverse Proxy + HTTPS (Optional)

- Nginx reverse proxy to `app:3000`
- HTTPS with Let's Encrypt / certbot
- Auto-renewal via cron

---

## ETL Scripts

The `scripts/*.mjs` ETL scripts run **outside** Docker, directly on the VPS or in a separate container. They are not part of the web application container.

---

## Rollback Strategy

1. Vercel deployment stays live until VPS is verified
2. DNS A record → VPS IP only after successful smoke test
3. If VPS fails: revert DNS to Vercel (zero data loss, Supabase unchanged)
4. Container rollback: `git checkout {previous-tag}` + rebuild

---

## Docker Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `docker:dev` | `docker compose up` | Start development server |
| `docker:build` | `docker compose build` | Build Docker image |
| `docker:prod` | `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d` | Start production |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Build OOM on 2GB VPS | Build locally or in CI; copy image via `docker save/load` |
| Missing env vars → runtime crash | `.env.production.example` documents all vars; health check catches misconfig |
| Rollback needed | Keep Vercel active; DNS switch back. No data migration risk |

---

## References

- [Next.js Docker deployment](https://nextjs.org/docs/app/api-reference/config/next-config-js/output#standalone)
- [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Hostinger VPS docs](https://www.hostinger.com/tutorials/vps)
