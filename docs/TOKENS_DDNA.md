# Tokens de identidad DDNA — referencia

Fuente de verdad: el theme del portal institucional
(`http://179.199.132.207/wp-content/themes/ddna-theme/assets/css/settings/tokens.css`),
que es el sistema de diseño **en producción**.

> Complementario: `odd/tasks/restyle-identidad-visual.md` documenta el plan de
> aplicación al Tablero.

## Color

| Token | Valor | Uso |
|---|---|---|
| `--ddna-orange` | `#ff8c00` | primario / color de marca |
| `--color-secondary` | `#050506` | casi-negro institucional |
| `--color-background` | `#e9e7e7` | fondo general (gris cálido) |
| `--color-surface` | `#ffffff` | superficie / tarjetas |
| `--color-text` | `#050506` | texto principal |
| `--color-muted` | `#5b5755` | texto secundario |
| `--color-border` | `#050506` | borde |
| `--color-focus` | `#165dff` | foco / accesibilidad |

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

## Advertencia de accesibilidad

`#ff8c00` sobre `#ffffff` **no alcanza contraste AA** para texto pequeño. Usar
el naranja como relleno, borde o acento; texto sobre naranja en `#050506`.
