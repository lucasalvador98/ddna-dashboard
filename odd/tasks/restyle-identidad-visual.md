# Feature: restyle-identidad-visual

## Objetivo

Que el Tablero se lea como parte del mismo ecosistema institucional que el
portal WordPress (`http://179.199.132.207/`, theme `ddna-theme`), conservando
su capacidad de tablero de datos (densidad de gráficos).

## Estado actual (medido)

**Portal WordPress** — tokens reales en
`/wp-content/themes/ddna-theme/assets/css/settings/tokens.css`:

| Token | Valor | Rol |
|---|---|---|
| `--ddna-orange` | `#ff8c00` | primario / marca |
| `--color-secondary` | `#050506` | casi-negro |
| `--color-background` | `#e9e7e7` | gris cálido de fondo |
| `--color-surface` | `#ffffff` | superficie |
| `--color-text` | `#050506` | texto |
| `--color-muted` | `#5b5755` | texto secundario |
| `--color-border` | `#050506` | borde |
| `--color-focus` | `#165dff` | foco/accesibilidad |
| `--border-width` | `2px` | borde grueso editorial |
| `--radius-sm/md/lg` | `1rem` / `1.75rem` / `clamp(2rem,4vw,4rem)` | radios muy redondeados |
| `--font-family-body` | "Forma DJR Text", "Avenir Next", Avenir, system-ui | cuerpo |
| `--font-family-display` | "Forma DJR Display", "Arial Black", system-ui | títulos |
| tipografía | xs→3xl con `clamp()` | escala fluida |
| contenedores | wide `112rem`, content `75rem`, reading `48rem` | |

> Nota del theme: *"las fuentes de marca se activan cuando estén
> licenciadas/alojadas"* — Forma DJR **no** está alojada; el portal usa de
> fallback Avenir Next / Arial Black. El tablero debe usar los mismos fallbacks
> para ser consistente (y no depender de fuentes con licencia).

**Tablero actual** — `src/app/globals.css` + tokens propios:

- Paleta **categorial de 8 colores** (amber `#F3A712`, magenta `#BF1363`, blue
  `#3777FF`, navy `#1a2556`, orange `#FF7F11`, terracotta `#E07A5F`,
  sky-blue `#1E9AD8`, cream `#FFE2BF`).
- Fuentes: Google Fonts (Epilogue / Playfair / DM Sans).
- Radios chicos (`rounded-xl`), bordes finos, cards suaves con sombra.
- Densidad alta: muchas tarjetas + gráficos por pantalla.

## Diagnóstico del problema

El tablero y el portal se ven como **dos productos distintos**:
- Color: categórico multicolor vs. monocromo + un acento naranja.
- Tipografía: sans geométrica Google vs. display de alto peso.
- Formas: radios chicos vs. radios grandes + borde de 2px.
- Ritmo: compacto vs. editorial con mucho aire.

## Riesgo a evitar

**Un tablero no es una landing.** El sistema del portal (tipografía `3xl`,
`space-9` de hasta 11rem, contenedores de lectura de 48rem) está diseñado para
pocas piezas y mucho aire. Aplicado literal a un tablero de 20+ gráficos,
**reduce drásticamente la cantidad de datos visibles por pantalla** y rompe la
función principal del producto.

Por eso la propuesta es: **adoptar la capa de identidad** (color, tipografía,
bordes, radios) y **conservar la densidad** propia del tablero.

## Dirección propuesta

| Capa | Acción | Origen |
|---|---|---|
| Color | Reemplazar la paleta categórica por: fondo `#e9e7e7`, superficie `#fff`, texto `#050506`, muted `#5b5755`, **acento único `#ff8c00`**, foco `#165dff` | tokens del portal |
| Color (categórico) | Mantener una escala categórica **derivada del naranja** (para los gráficos por categoría) en vez de 8 colores ajenos | derivado |
| Tipografía | Body: Avenir Next/Avenir/system-ui. Display: Arial Black/system-ui | fallbacks idénticos al portal |
| Bordes | `2px` sólido `#050506` en tarjetas y secciones | tokens del portal |
| Radios | `1rem` / `1.75rem` / fluidos grandes | tokens del portal |
| Espaciado | Escala propia del tablero (no adoptar `space-9` de 11rem) | conservar densidad |
| Sombras | Muy sutiles, base `rgb(5 5 6 / 8-12%)` | tokens del portal |

## Niveles deIntensity (a elegir)

- **A — Identidad solamente**: color + tipografía + bordes + radios. El tablero
  sigue tan denso como hoy. Cambio visual fuerte, riesgo funcional ~nulo.
- **B — Identidad + aire (recomendado)**: A +Increase del espaciado entre
  secciones (no entre KPIs), tarjetas con borde 2px y radios grandes. Se lee más
  "portal" sin perder datos por pantalla.
- **C — Sistema casi completo**: adoptar también la escala tipográfica fluida y
  el espaciado editorial. Máxima semejanza visual, menor densidad de datos.

## Tareas

- [ ] T1 — Levantar tokens del portal como fuente de verdad y documentarlos
      (references/tokens-dDNA-portal.md o similar).
- [ ] T2 — Reemplazar `@theme` de `globals.css` con la paleta institucional.
- [ ] T3 — Tipografía: cargar fallbacks del portal (Avenir Next / Arial Black).
- [ ] T4 — Bordes 2px + radios grandes en `KpiCard`, `SectionHeader`, `ChartCard`
      y las tarjetas de cada sección.
- [ ] T5 — Escala categórica derivada del naranja para los gráficos.
- [ ] T6 — Verificación visual en `/observatorio` (todas las secciones) + contraste
      WCAG AA con el fondo `#e9e7e7`.
- [ ] T7 — Deploy coordinado con DevOps (no directo).

## Riesgos

- El dashboard usa color para **codificar categorías**; aplanar a monocromo
  rompe la lectura de series. Por eso T5 es obligatoria, no opcional.
- Contraste: `#ff8c00` sobre `#ffffff` no alcanza AA para texto pequeño; usarlo
  solo como relleno/borde, y texto sobre naranja en `#050506`.
- Forma DJR no está licenciada/alojada: no intentar subirla.
