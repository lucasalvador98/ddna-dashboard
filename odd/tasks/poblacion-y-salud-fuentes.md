# Feature: poblacion-y-salud-fuentes

## Objetivo

1. Completar los datos de SALUD que faltan, usando **todas** las fuentes disponibles
   (no solo el series API de INDEC).
2. Construir una pantalla nueva de **POBLACIÓN / DEMOGRAFÍA** con Nación / provincia /
   departamento / localidad y desglose de hombres, mujeres y NNyA.

## Mapa de fuentes (verificado)

### Series API de INDEC (`apis.datos.gob.ar/series/api`)
Publica series **por jurisdicción** (DEIS). Patrón: `<ind>_arg` nacional,
`<ind>_<cod_prov>` provincial (14 = Córdoba).

| Serie | Qué | Período | Estado |
|---|---|---|---|
| `tn_14` / `tn_arg` | Tasa de natalidad Córdoba / Argentina | 2000-2024 | ✅ cargada |
| `tmi_14` / `tmi_arg` | Mortalidad infantil Córdoba / Argentina | 1990-2024 | ✅ ya estaba |
| `tmf_14` | Mortalidad fetal Córdoba | 2006-2024 | ✅ cargada |
| `hdef_14` / `hdef_arg` | Defunciones históricas | 1914-2023 | ✅ cargada |

**Lo que el series API NO tiene**: fecundidad general, nacidos vivos absolutos,
cobertura vacunal provincial.

### Cobertura vacunal — SÍ hay datos, y son los más actuales (2025)

> Corrección: antes dije que estaba "bloqueada". Estaba mal. Existe, pero como **PDF**,
> no como API.

- `https://www.argentina.gob.ar/salud/inmunoprevenibles/coberturas-de-vacunacion`
  publica el **Calendario Nacional de Vacunación 2024 y 2025**:
  - `nacion_-_cnv_2024_-_publicacion_final_02_09_2026.pdf`
  - `nacion_-_cnv_2025_-_publicacion_final_02_09_2026.pdf`
- **Traen el corte por jurisdicción**. Estructura de cada fila:
  `Jurisdicción | población objetivo | dosis aplicadas | cobertura %`.
  Córdoba aparece 44 veces (una por vacuna); hay 23 jurisdicciones.
- **Ojo con el encoding**: `pdftotext` rompe los acentos ("C�rdoba"), así que hay que
  parsear buscando `rdoba` o normalizar primero.
- También hay `coberturas-de-vacunacion-por-jurisdiccion-cnv-2009-2020.pdf` (serie
  histórica por jurisdicción) y las publicaciones 2021/2022/2023.

### Otras fuentes de salud relevadas

- **DEIS (`argentina.gob.ar/salud/deis`)**: "Estadísticas vitales - Año **2024**" con
  natalidad y mortalidad **por provincia**; e "Indicadores seleccionados de salud para
  la población de 10 a 19 años - Año 2024".
- **`datos.salud.gob.ar`** (CKAN de Salud): es pobre, solo 3 datasets de vacunación
  (Triple Viral SRP hasta 2019, dosis COVID).
- **`datosgestionabierta.cba.gov.ar`** (CKAN provincial): **no expone API** (devuelve
  HTML). Tiene "Centros de vacunación de Córdoba", pero eso son centros, no cobertura.
- **Mapa de Coberturas y Distribución de Vacunas** (`argentina.gob.ar/salud/cobertura-y-distribucion-de-vacunas/cobertura`):
  interactivo (Leaflet), hasta 2025 por jurisdicción, pero sin endpoint de datos visible.

### Catálogo CKAN `datos.gob.ar`
- **"Nacidos Vivos Registrados por Jurisdicción de Residencia de la Madre"** —
  XLS/CSV/XLSX, **incluye 2023** → nacimientos totales por jurisdicción.
- "Nacimientos en Argentina", "Serie histórica de nacimientos / defunciones…".
- "Sistema sociodemográfico - Salud" / "- Grupos poblacionales e inequidades".
- Vacunación: solo "Campaña antigripal" y "Puntos de vacunación" → **no** es
  cobertura de calendario. Falta fuentes provincial (Córdoba) o DEIS.

### Censo 2022 — la fuente para demografía
- Dataset `censo-nacional-de-poblacion-hogares-y-viviendas-2022`, **un ZIP por
  provincia**. Córdoba: `.../48/distribution/48.4/download/14-cordoba-2022.zip` (16.7 MB).
- Contiene `hogar.csv`, **`persona.csv` (144 MB)**, `vivienda.csv`.
- **No es microdata cruda**: es una tabla **ya agregada** con
  `codigo, cod_prov, provincia, cod_dep, departamento, fraccion, radio,
  cod_variable, cod_categoria, categoria, cantidad`.
  Es decir **geo × variable × categoría → cantidad**. Granularidad hasta
  **radio** (lo más fino, ~localidad).
- Variables confirmadas (diccionario): `PERSONA_P02` = **Sexo registrado al nacer**,
  `PERSONA_EDAD` / `EDADGRU` / `EDADQUI` = **edad**, `PERSONA_P35` = **hijos
  nacidos vivos** (fecundidad).

## Alcance

**Salud (lo que falta)**
- S1 — Nacimientos totales por jurisdicción (CKAN "Nacidos Vivos Registrados",
  hasta 2023) → Córdoba vs Nación.
- S2 — Tasa de natalidad vs fecundidad: natalidad ya está (2000-2024); fecundidad
  general no existe en el series API → se puede derivar del Censo (P35).
- S3 — **Cobertura vacunal Córdoba vs Nación: HACIBLE**. Fuente = PDFs del CNV
  2024/2025 con corte por jurisdicción. Requiere parser de PDF (pdftotext +
  normalización de acentos). Da datos **más nuevos que todo lo demás** (2025).

**Población / demografía (pantalla nueva)**
- P1 — ETL del Censo 2022: descargar el ZIP de Córdoba (y Nación), parsear
  `persona.csv`, filtrar `PERSONA_P02` (sexo) y `PERSONA_EDADGRU` (edad), agregar
  por departamento, y cargar en `indicadores` con categoría `poblacion`.
- P2 — Idem para el total país (para el contraste Nación vs Córdoba).
- P3 — UI: pantalla nueva con desglose hombres / mujeres / NNyA y selector
  Nación / provincia / departamento.

## Riesgos

- El ZIP de Córdoba son 16.7 MB comprimidos / 214 MB descomprimidos. El ETL debe
  streamear, no cargar todo en memoria.
- Granularidad: `persona.csv` llega a **radio** censal, que no es exactamente
  "localidad" administrativa. Hay que mapear radio → localidad o quedarse en
  departamento.
- El diccionario de **categorías** (qué significa cada `cod_categoria`) no tiene
  recurso CSV propio en el dataset; puede requerir los PDFs de definiciones.

## Tareas

- [x] T1 — Cargar las series de salud disponibles en el series API. `29f79f2`
- [ ] T2 — ETL de "Nacidos Vivos Registrados por Jurisdicción" (CKAN, hasta 2023).
- [ ] T3 — ETL del Censo 2022 (sexo + edad) → categoría `poblacion`.
- [ ] T4 — UI de la pantalla de Población / Demografía.
- [ ] T5 — Cobertura vacunal Córdoba vs Nación: parser de los PDFs del CNV
      2024/2025 (corte por jurisdicción). Da los datos más actuales del tablero.
- [ ] T6 — Deploy coordinado (va último).
