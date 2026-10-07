# DEPLOY_TOPOLOGY.md — Topología de despliegue y contrato DevOps ↔ Tablero

> **Estado actual validado:** 2026-10-07. Este documento es la fuente de verdad de
> cómo se despliega el tablero en la VPS compartida y qué límites aplican.
> **Antes de cualquier deploy o cambio de infraestructura, LEER ESTE ARCHIVO.**

---

## 1. División de responsabilidades (regla de oro)

| | Dueño | Alcance |
|---|---|---|
| **DevOps** | Edge / multi-sitio | Caddy (edge router), orquestación de puertos, dominios, DNS, HTTPS/certificados, WordPress, `ddna-infra` (proyecto `ddna-controlled`), topología de red, y cualquier deploy que afecte la infra compartida. **ÚNICO autorizado** a: tocar puertos (incl. 80), DNS, 443/certs, `compose.production.yml`, `cutover.py`. |
| **Nosotros** | Solo el **Tablero** | Código y deploy del tablero (Next.js `ddna-dashboard`). **NO** tocar el edge/infra compartida salvo petición expresa del DevOps. |

**Contrato de deploy:** cada vez que necesitemos desplegar el tablero **hay que avisar al DevOps primero**. Nunca desplegar directo.

---

## 2. Rutas vigentes

| Qué | URL | Notas |
|---|---|---|
| **Portal principal (WordPress)** | `http://179.199.132.207/` | Raíz del dominio/IP |
| **Tablero de Monitoreo (nosotros)** | `http://179.199.132.207/observatorio/` | Caddy `ddna-edge` → servicio `dashboard:3000` (proyecto `ddna-controlled`, `/home/deploy/ddna-infra/compose.private.yml`) |
| **Supabase API** | `http://179.199.132.207:8000` | self-hosted |

> ⚠️ **El tablero NO vive más en la raíz `http://179.199.132.207/`** (eso es WordPress)
> ni en el contenedor `ddna-dashboard-app-1` viejo. Cualquier integración, variable,
> test o config que apuntara a la raíz debe migrarse a `/observatorio/`.

---

## 3. Qué NO tocar (sin instrucción expresa del DevOps)

- ❌ **No arrancar el contenedor `ddna-dashboard-app-1` viejo** — fue detenido a propósito el 2026-09-26 para liberar el puerto 80 que ahora ocupa Caddy (exit 143 = SIGTERM limpio, **no es una caída**).
- ❌ **No aplicar `compose.production.yml`**, ni cambiar DNS / 443 / certificados.
- ❌ **No ejecutar `cutover.py` de nuevo** — el corte ya está completado.
- ❌ **No ejecutar `deploy.sh`** — está congelado y es **obsoleto** para este entorno (el flujo cambió: ahora el deploy lo orquesta el DevOps vía Caddy). Ver §5.
- ❌ **No ejecutar `deploy.sh` en los checkouts históricos del VPS.**

---

## 4. Estado del despliegue activo (verificado 2026-10-07)

- Es un **PREVIEW por IP, sin HTTPS**: el Caddyfile activo montado en `ddna-edge` es
  **`Caddyfile.preview`** (puerto 80, `auto_https off`). La **imagen HTTPS
  (`Caddyfile.production`) está preparada pero NO es la activa**. No activar HTTPS sin
  nueva instrucción del DevOps.
- **Caddy `ddna-edge` enruta `/observatorio` → servicio `dashboard:3000`**, proyecto
  `ddna-controlled`, archivo `/home/deploy/ddna-infra/compose.private.yml`.
- **El build correcto es `/home/deploy/ddna-infra/build-dashboard.py`**: buildea desde el
  checkout limpio `/home/deploy/ddna-dashboard-observatorio`, pasa
  `NEXT_PUBLIC_BASE_PATH=/observatorio` (desde `secrets/dashboard-build.env`), taguea
  `ddna-dashboard:observatorio-candidate` y escribe la provenance en
  `dashboard-build-inputs.json`.
  Activación: `cd /home/deploy/ddna-infra && docker compose -f compose.private.yml up -d dashboard`.
- **Rutas verificadas en vivo (HTTP 200)**: `/observatorio/`, `/salud`, `/poblacion`,
  `/educacion`, `/login`.
- **Estado de versiones**: `main` = `61f304c`. La VPS corre la imagen `e3c2229b`, construida
  desde `4a9a9d3` — **2 commits atrás** (`f439ea1` PR #3 + `61f304c` pendientes de build).
- **No hay CI/CD instalado**: `.github/workflows/` no existe en `main` ni en ninguna rama
  remota. El receptor de GitHub Actions nunca se creó; el deploy sigue siendo manual con
  aviso previo obligatorio al DevOps. Lo que disparaba auto-deploys era la integración
  nativa de Vercel, desconectada el 2026-10-07.
- Docker: `ddna-edge` (Caddy) tiene el **puerto 80**.

---

## 5. El `deploy.sh` quedó obsoleto (importante)

El `deploy.sh` del repo fue escrito para un entorno donde el dashboard era dueño del
puerto 80 (`80:3000`). Con Caddy al frente, **reconstruir y arrancar ese contenedor
haría conflicto por el puerto 80** y rompería el portal. Está **congelado y roto en 3
formas** (colisión de puerto 80; `docker-compose.prod.yml` sin `NEXT_PUBLIC_BASE_PATH`
como build arg → `/observatorio/*` da 404; tag `ddna-dashboard-app:latest` que el compose
activo no usa) y ya causó una caída de producción el 2026-10-06. **No usarlo.**

El flujo vigente es el script del DevOps `/home/deploy/ddna-infra/build-dashboard.py`
(ver §4). Cualquier cambio de este documento debe reflejar ese flujo, no `deploy.sh`.

---

## 6. Qué pedirle al DevOps en cada cambio de topología

Para que el supuesto desactualizado no vuelva a ocurrir, cada vez que el DevOps
cambie la topología, necesitamos estas **tres líneas**:

1. **Qué cambió** (qué rutas/puertos/contenedores se movieron).
2. **Cuál es la ruta vigente del tablero** ahora.
3. **Qué NO tocar**.

> Nota de proceso: un cambio de topología sin aviso fue lo que llevó a que el tablero
> quedara 2 días sin despliegue y a un riesgo real de conflicto de puerto. El aviso es
> el contrato que lo previene.

---

## 7. Referencias en el VPS (fuente de verdad del DevOps)

Estos archivos, en `/home/deploy/ddna-infra/`, mandan sobre la topología:

- `ACTIVE_DEPLOYMENT.md` — **estado actual validado** (el que más manda)
- `CONTROLLED_DEPLOY_STATUS.md` — estado del despliegue controlado
- `CONTROLLED_ROLLBACK.md` — procedimiento de rollback
- `PRE_DEPLOY_AUDIT.md` / `PRE_DNS_REPORT.md` — auditorías previas
- `IP_PREVIEW_REPORT.md` — validación del preview por IP
- `DNS_HANDOFF.md` — traspaso de DNS

> Los reportes PRE-DNS y primeros reportes de preparación son **históricos**.

Si este documento y los del DevOps se contradicen, **gana `ACTIVE_DEPLOYMENT.md`**
y se avisa al DevOps antes de actuar.

---

## 8. Checklist antes de cada deploy del tablero

- [ ] ¿Avisé al DevOps? (obligatorio)
- [ ] ¿Tengo la ruta vigente del tablero confirmada en vivo?
- [ ] ¿Sé que NO debo arrancar `ddna-dashboard-app-1` ni usar `deploy.sh`?
- [ ] ¿Los tests/build pasan? (`tsc`, `test`, `lint`)
- [ ] ¿Verifiqué en vivo después del deploy (no asumir)?

---

*Última actualización: 2026-10-07 — referencias de servicio/proyecto/build corregidas a la realidad verificada (Caddy→`dashboard:3000`, `compose.private.yml`, `build-dashboard.py`).*

## Propuesta CI/CD revisable — 7 de octubre de 2026

Ver [deploy/README.md](deploy/README.md). CI de PR y publicación GHCR trazable están propuestos; deploy sigue solo manual con constancia de aviso previo a DevOps. No se instaló el receptor nuevo, no se activó la imagen preparada ni se modificó la topología. La regla de aviso sigue vigente y no equivale a aprobación explícita del DevOps. Las imágenes y overrides reales se consultan en runtime: los reportes históricos no prueban el SHA activo.
