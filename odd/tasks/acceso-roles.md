# Acceso: usuarios por agente + pantallas ocultables por rol

Estado del sistema de acceso del tablero DDNA: dejar de compartir admin@ddna entre todos, pantalla de creación de usuarios funcional, y pantallas ocultables por agente con personalización por usuario.

## Specs

- **S1**: "ahora estamos usando todos los agentes las credenciales de admin@ddna" — el login compartido debe dejar de ser el único camino.
- **S2**: "me gustaria que funcione de una vez por todas la pantalla de creacion de nuevos usuarios" — crear usuario con email, contraseña y ROL desde la pantalla admin, con errores visibles.
- **S3**: "la disponibilidad de ocultarle pantallas a cada agente" — el sidebar oculta por rol, y la ruta se niega server-side (no solo cosmético).
- **S4**: "Sobre todo pensando en las siguientes monitoreo de medios, herramientas de ia y formularios" — los módulos objetivo del ocultamiento.
- **S5**: "me gustan los 3 roles yo haria admin, agente y visor" — roles base: admin (todo), agente (datos en vista), visor (datos en vista). El rol `editor` existente (id 2) se renombra a `agente`.
- **S6**: "Luego la posibilidad de agregarle a un visor por ejemplo el uso de la pantalla monitoreo" — AGREGADOS por usuario: `user_permissions(user_id, route, can_view, can_edit)` que suman pantallas sobre la base del rol.
- **S7**: "Algo asi me gustaria que sea un poco personalizable tambien" — la base de cada rol es editable desde el RoleManager existente; los agregados por usuario desde la pantalla de usuarios.
- **S8**: Bootstrap autorizado: `admin@ddna.gob.ar` → admin y `lucaalaporta@gmail.com` → admin en user_roles.
- **S9**: superficie de rutas: APP_ROUTES debe cubrir las rutas del sidebar (agregar `/salud-adolescente`, `/encuestas`, `/infancias`).
- **S10**: la matriz vigente de admin/editor/visor no se pierde al renombrar (rol id 2 conserva sus filas).

## Tareas

- **T1** (S8): INSERT idempotente en `user_roles` para los dos admins. Ruta: SQL directo con service key + migration file.
- **T2** (S5, S6, S9, S10): migración SQL: tabla `user_permissions` (+RLS consistente), rename `editor`→`agente`, extensión de APP_ROUTES en código. Archivos: `supabase/migrations/*.sql`, `src/lib/rbac-types.ts`.
- **T3** (S2): API: `POST /api/auth/admins` acepta `role_id` validado, superficie error del upsert, y `PUT /api/auth/users/[id]/role` acepta `null`→borra fila (sin_rol). Nuevo `GET /api/auth/me/permissions` (self: rol + user_permissions + role_permissions fusionados).
- **T4** (S2, S6, S7): UI admin: selector de rol en el form de creación, editor de agregados por usuario (checkboxes por ruta view/edit), estado de error visible (no `catch {}`).
- **T5** (S3, S4): `sidebar.tsx` + `mobile-nav.tsx`: filtran grupos/items por los permisos fusionados del usuario (vía `/api/auth/me/permissions`); `/admin` solo para admin.
- **T6** (S3, S4): `src/lib/auth-proxy.ts`: para rutas protegidas, negar según permisos server-side (service role) con redirect a home o página "sin acceso".
- **T7** (S3): `login-gate.tsx`: usar el endpoint self en vez de `/api/auth/roles` (admin-only).
- **T8**: tests (endpoint self, proxy deny/allow, sidebar filtering con mocks), `npm run build` + lint + tsc en verde.

## Log

- **L1**: "antes de eso me gustaria que refatoricemos el tema del logueo por que ahora estamos usando todos los agentes las credenciales de admin@ddna pero me gustaria que funcione de una vez por todas la pantalla de creacion de nuevos usaurios y la disponibilidad de ocultarle pantallas a cada agente. Sobre todo pensando en las siguientes monitoreo de medios, herramientas de ia y formularios."
- **L2**: "(custom) me gustan los 3 roles yo haria admin, agente y visor. Luego la posibilidad de agregarle a un visor por ejemplo el uso de la pantalla monitoreo. Algo asi me gustaria que sea un poco personalizable tambien"
- **L3**: Bootstrap decidido: admin@ddna + lucaalaporta = admin (juan@prensa queda sin rol).
- **L4**: Contexto: la resolución va ANTES de re-run del publish/deploy para hornear todo en una sola imagen.
- **L5** (implementación T2-T8, 2026-10-21): migración `20261021172000_user_permissions_and_agente_role.sql` (tabla `user_permissions` + RLS, rename `editor`→`agente` idempotente y guardado, seed de `/salud-adolescente`, `/encuestas`, `/infancias` con `can_view=true` para no perder visibilidad); `APP_ROUTES` cubre esas 3 rutas; `POST /api/auth/admins` acepta `role_id` validado y expone el error del upsert; `PUT /api/auth/users/[id]/role` acepta `null`→borra la fila; nuevos `GET /api/auth/me/permissions` y `GET/PUT /api/auth/users/[id]/permissions`; sidebar/mobile-nav filtran por la matriz fusionada; `auth-proxy` niega server-side rutas protegidas sin `can_view` (403); `login-gate` usa el endpoint self. Regla acordada: ruta gobernada por `APP_ROUTES` sin fila `can_view=true` ⇒ oculta/negada; ruta fuera de `APP_ROUTES` ⇒ se mantiene el comportamiento previo. `npm run build` no se ejecutó en este pase (fuera de los comandos autorizados).
