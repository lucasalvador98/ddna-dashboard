# Tokens de identidad DDNA — referencia

Fuente de verdad: el theme del portal institucional
(`http://179.199.132.207/wp-content/themes/ddna-theme/assets/css/settings/tokens.css`),
que es el sistema de diseño **en producción**.

> Complementario: `odd/tasks/restyle-identidad-visual.md` documenta el plan de
> aplicación al Tablero.

## Color

Tokens **vigentes en el Tablero** (`src/app/globals.css`; ante cualquier diferencia, manda ese archivo):

| Token | Valor | Uso |
|---|---|---|
| `--ddna-amber` | `#ff8c00` | marca / primario (barra, acentos) |
| `--ddna-orange` | `#c2410c` | naranja institucional quemado (series de gráfico) |
| `--ddna-magenta` | `#9a3412` | Pobreza, alertas |
| `--ddna-blue` / `--ddna-sky-blue` / `--ddna-info` | `#165dff` | Seguridad, links, foco |
| `--ddna-navy` | `#050506` | sidebar, títulos |
| `--ddna-terracotta` | `#c2410c` | Salud |
| `--ddna-cream` | `#f5f0ec` | acentos claros |
| `--ddna-background` | `#e9e7e7` | fondo general (gris cálido) |
| `--ddna-outspace` | `#d8d5d3` | superficie secundaria |
| `--ddna-text` | `#050506` | texto principal |
| `--ddna-muted` | `#5b5755` | texto secundario |
| `--ddna-border` | `#050506` | borde |

Equivalencias del theme del portal (`--color-*`): `--color-secondary`/`--color-text`/`--color-border` `#050506` · `--color-background` `#e9e7e7` · `--color-surface` `#ffffff` · `--color-muted` `#5b5755` · `--color-focus` `#165dff`.

## Tipografía

| Rol | Stack |
|---|---|
| Body | `"Forma DJR Text", "Avenir Next", Avenir, system-ui, -apple-system, "Segoe UI", sans-serif` |
| Display | `"Forma DJR Display", "Arial Black", system-ui, sans-serif` |

Pesos: 300 light · 400 regular · 500 medium · 600 semibold · 700 bold · 900 black

> **Forma DJR no está alojada ni licenciada todavía** (el theme lo declara así).
> Mientras tanto el portal usa de fallback **Avenir Next / Arial Black**. El
> Tablero debe usar los mismos fallbacks para verse consistente.

Escala fluida: `xs .75rem` · `sm .875rem` · `base 1rem` · `lg 1.25rem` ·
`xl 1.75rem` · `2xl 2.5rem` · `3xl 3.25rem` (todas con `clamp()`).
Interlineado: `tight .98` · `heading 1.08` · `body 1.6` · `loose 1.75`.
Tracking: `tight -0.025em` · `wide 0.08em`.

## Forma

- `--border-width: 2px` (borde grueso, clave del aire editorial)
- `--radius-sm: 1rem` · `--radius-md: 1.75rem` · `--radius-lg: clamp(2rem,4vw,4rem)` · `--radius-pill: 999px`
- Sombras: `sm 0 1px 2px rgb(5 5 6/8%)` · `md 0 .75rem 2rem rgb(5 5 6/12%)` · `focus 0 0 0 3px rgb(22 93 255/35%)`

## Espaciado y contenedores

`space-1 .25rem` · `2 .5rem` · `3 .75rem` · `4 1rem` · `5 1.5rem` · `6 2rem` ·
`7 clamp(2.5rem,4vw,4rem)` · `8 clamp(3.5rem,7vw,8rem)` · `9 clamp(5rem,10vw,11rem)`

Contenedores: `wide 112rem` · `content 75rem` · `reading 48rem` ·
gutter `clamp(1rem,3vw,3.5rem)`

Breakpoints: narrow 360 · mobile 768 · tablet 1024 · notebook 1200 · wide 1600

## Nota sobre la presentación institucional

`Presentación - Editable.ai` (Adobe Illustrator 30.6, 7 páginas) es el deck
institucional (misión, visión, estructura). **Todo el texto está convertido a
curvas** y el archivo no expone fuentes ni colores de forma legible. Se puede
usar como referencia de contenido y tono, **no como fuente de tokens**.

## Advertencia de accesibilidad (aplicada)

`#ff8c00` da **2.33:1** sobre blanco y **1.89:1** sobre `#e9e7e7`: no alcanza
el 3:1 de WCAG 1.4.11 para relleno de gráficos ni el 4.5:1 para texto pequeño.

Regla que quedó aplicada en el tablero:
- **Identidad** (barra superior, acentos, bordes, íconos): `#ff8c00`, siempre
  con texto `#050506` encima (8.73:1) o como borde.
- **Series de gráfico** (lo que codifica información): `#c2410c` (5.18:1),
  el naranja institucional quemado.
