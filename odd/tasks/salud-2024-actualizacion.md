# Salud 2024 — actualización de series y datos nuevos

**Estado**: completado (fases A y B; C implementado) · **Creado**: 2026-10-07 · **Fuente del pedido**: usuario
> "me gustaría que actualicemos todo lo que tenemos y grabemos información nueva para
> mostrar a futuro... también alguna propuesta de nuevos gráficos" + UI incluida.

## Contexto

El DEIS publicó el ciclo 2024 (enero de 2026). El usuario bajó 3 PDFs del portal de
publicaciones a `C:\Users\Usuario\DESARROLLO\Datos\datasets\datos`:

- `serie_5_nro_68_anuario_vitales_2024_v2.pdf` — Anuario de Estadísticas Vitales 2024 (44 cuadros)
- `boletin_numero_175_adolescencia-ano_2024_20260320.vf_.pdf` — Salud de adolescentes 2024
- `defunciones_de_menores_de_5_anos...-n-174-argentina_2024.vf_.pdf` — Mortalidad <5 años

**Hallazgo clave de la exploración**: `pdftotext -layout` mezcla filas en los cuadros de
estos PDFs (tablas con corte de línea multi-línea) → extraer de ahí ES inventar datos.
**Prioridad: fuentes estructuradas** (CSV/XLSX del CKAN de salud). PDFs solo cuando no
hay alternativa, y con pdfplumber + validación cruzada por sumas.

## Fuentes estructuradas disponibles (verificadas)

| Fuente | Qué da | Estado nuestro |
|---|---|---|
| `defuncion2024.csv` (47.527 filas; `;`) | muertes 2024 × jurisdicción × causa CIE-10 (1.053) × sexo × 6 grupos de edad × flag materna | **NUEVO** |
| `serie-historica-defunciones-...-1914-2024.xlsx` | defunciones por jurisdicción, 1914-2024 | tenemos hasta 2023 |
| `base_def_2024_mensual.csv` | defunciones mensuales 2024 | no |
| TMI 1990-2024 / Natalidad / Mort. fetal (CSV) | tasas oficiales | ✅ ya cargadas |

URLs en `scripts/load-salud-2024.mjs` (por escribir).

## Tareas

### Fase A — actualizar series existentes
- [x] **A1**. Defunciones históricas por jurisdicción a 2024 (XLSX serie histórica).
      Extiende "Defunciones (histórico Córdoba)" 2000-2023 → 2024. Validar contra
      `defuncion2024.csv` (sumas por jurisdicción deben coincidir).

### Fase B — datos nuevos (2024)
- [x] **B1**. `defuncion2024.csv` → defunciones por jurisdicción × sexo × grupo de edad
      (6 grupos: 0-14, 15-34, 35-54, 55-74, 75+, s/e). Unidad `defunciones`.
- [x] **B2**. `defuncion2024.csv` → **causas de muerte** (dimensión nueva). Top-N causas
      por jurisdicción (Córdoba + Nacional) con `cie10_clasificacion` como indicador.
      Decidir N y si agrupar por capítulo CIE-10.
- [x] **B3**. Muerte materna 2024 del MISMO CSV (flag `muerte_materna_id` M/T) → razón
      por 10.000 NV. Evita extraer el cuadro 40/42/44 del PDF.
- [x] **B4**. **Fecundidad adolescente 2013-2024 por jurisdicción** (Boletín 175, cuadro 5)
      — la más valiosa para un tablero NNyA; solo existe en PDF. Requiere
      `pdfplumber` (instalar) + validación: suma por año ≈ serie nacional; y el valor
      2022 de Córdoba debe coincidir con nuestra serie oficial (12,8‰).

### Fase C — UI de Salud
- [x] **C1**. Propuestas de gráficos nuevos (presentárselas al usuario antes de construir):
      1. **Causas de muerte** — barras horizontales top-10 Córdoba 2024 (+ vs Nación).
      2. **Defunciones por grupo de edad** — barras, 2024.
      3. **Fecundidad adolescente** — serie 2013-2024 Córdoba vs Nación (actualiza la
         serie existente que frena en 2022).
      4. **Mortalidad por edad y sexo** — grupo barras agrupadas.
- [x] **C2**. Implementar los gráficos aprobados + cablear la serie de defunciones a 2024.

## Reglas de la casa (de AGENTS.md y de lo aprendido)

- Filas nuevas SIEMPRE con chequeo de duplicados (`periodo|region|indicador_nombre`) y
  `insertIfMissing` (dry-run por defecto).
- `categoria='salud'` para defunciones/causas; `salud_adolescente` para las series de
  adolescencia (así vive hoy `Tasa fecundidad adolescente`).
- PostgREST corta a 1000: todo fetch de pantalla con paginado (bug ya visto en /salud).
- Tasa de fecundidad adolescente: denominador = **mujeres de 10-19**, convención del
  boletín (ya validada en la tasa por edad).
- Verificación final SIEMPRE contra el HTML servido, no solo contra la DB.

## Decisiones tomadas

- 2026-10-07 — alcance: actualizar todo + cargar lo nuevo + UI. Aprobado por el usuario.
- 2026-10-07 — defunciones/causas/materna desde CSV estructurado; PDF solo para
  fecundidad adolescente (cuadro 5) y lo que no tenga CSV.


## Registro de ejecución (2026-10-07)

- A1/B1/B2/B3: cargados con `scripts/load-salud-2024.mjs --apply` — 2.048 filas
  (defunciones 2024 × sexo/edad/capítulos/top-10, materna derivada del CSV, fecundidad
  adolescente 2013-2024). 0 duplicados. Verificado: XLSX vs CSV 24/24, materna 22/22.
- B4: hecho por el EXTRACTOR (cuadro 5 del boletín 175, pdfplumber `extract_text` — los
  cuadros serie salen limpios; los de filas cortadas NO). Validado contra la serie
  oficial ya cargada 2015-2022 (8/8) y contra el cuadro 3 del propio boletín (TMM5).
- Extensión posterior: supervivencia infantil (boletín 174, cuadros 4.1-4.5) = 2.976
  filas más — TMI/neonatal/posneonatal/1-4/TMM5 por jurisdicción 2001-2024. Validado
  TMM5 Córdoba 2024 = 8,2 y Nacional = 10,2 contra el cuadro 3 del mismo boletín.
- C2: /salud ahora filtra el fetch por nombres (1.655 filas en lugar de las 12.800 de
  la categoría completa) y agrega 3 secciones nuevas (Supervivencia infantil, Causas de
  muerte, Mortalidad materna). 13 gráficos con tabla. Los 451 tests pasan.
- Decisión de presentación: el gráfico de causas usa CAPÍTULOS CIE-10, no causas
  específicas, porque el registro cordobés codifica un exceso de muertes cardíacas como
  arritmias (I47 = 11,3% de sus muertes vs 1,8% nacional) — la agregación por capítulo
  es la vista robusta y la decisión está documentada en una nota metodológica en pantalla.
- Commits: be71318 (ETL ciclo 2024) + este commit (supervivencia + UI).
