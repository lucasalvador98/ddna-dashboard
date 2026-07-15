# Fuentes de Datos — DDNA Dashboard

> **Última actualización**: 15 de Julio 2026 — Carga SENAF completada
> **Estado actual**: 21,149 registros en Supabase (15 categorías)

---

## Leyenda

- **tipo**: `api` = automático via HTTP/REST, `csv` = descarga directa (automatizable), `manual` = carga manual
- **frecuencia**: frecuencia de actualización esperada
- **estado**: ✅ = disponible en Supabase, ⏳ = pendiente, 🔄 = en desarrollo

---

## Fuentes Conectadas (en Supabase)

### Resumen por categoría

| Categoría (tabla `indicadores`) | Registros | Periodo | Fuente principal                        |
| ------------------------------- | --------- | ------- | --------------------------------------- |
| Pobreza e indigencia            | 15,977    | 2003-2026 | INDEC EPH + ENCOPRAC                    |
| Educación                       | 1,055     | 2022-2024 | Censo 2022 + Aprender                   |
| Anuario Estadístico Educativo   | 785       | 2024     | Min. Educación — anuarios               |
| Empleo                          | 709       | 1982-2026 | INDEC EPH                               |
| Inversión social infancia       | 725       | 2021-2025 | Visualizador PTO + Datos Abiertos CBA   |
| Canastas básicas (CBA/CBT)      | 500       | 2018-2026 | INDEC — API Series de Tiempo            |
| Demografía                      | 361       | 2022      | Censo 2022                              |
| SENAF                           | 382       | 2020-2023 | Programas Nacionales SENAF †            |
| Salud (DEIS)                    | 236       | 1990-2024 | DEIS — Mortalidad infantil, vacunación  |
| Encuestas 2024 (DDNA)           | 131       | 2024      | Encuestas propias de la Defensoría      |
| Seguridad                       | 129       | 1999-2024 | Ministerio Público Córdoba              |
| Aprender                        | 80        | 2024      | Evaluaciones Aprender 6° y 5°/6°        |
| Salud Adolescente               | 32        | 2015-2022 | DEIS                                    |
| DEIS (raw)                      | 36        | 2005-2022 | DEIS — datos directos                   |
| Consumos                        | 3         | 2022      | Estudios de consumos                    |

### 1. SALUD (236 + 32 salud_adolescente)

| fuente                                | tipo   | frecuencia | estado | detalle                                                  |
| ------------------------------------- | ------ | ---------- | ------ | -------------------------------------------------------- |
| Tasa Mortalidad Infantil (DEIS)       | api    | anual      | ✅     | TMI Córdoba y Nacional vía API Series — **hasta 2024**   |
| RMM / TMNEO / TMPOS (DEIS)           | manual | anual      | ✅     | Mortalidad materna/neonatal/post-neonatal — **hasta 2024** |
| Cobertura vacunal (DEIS)              | manual | anual      | ✅     | 8 series por tipo de vacuna                              |
| Salud Adolescente                     | manual | anual      | ✅     | Mortalidad adolescente, embarazo, causas                 |

### 2. EDUCACIÓN (1,055 + 785 anuario + 80 aprender)

| fuente                                | tipo   | frecuencia | estado | detalle                                            |
| ------------------------------------- | ------ | ---------- | ------ | -------------------------------------------------- |
| Tasa de asistencia educativa          | manual | ad-hoc     | ✅     | Censo 2022 — 19 grupos de edad (0-17 años)         |
| Anuario Estadístico Educativo         | manual | anual      | ✅     | Indicadores del sistema educativo — 785 registros  |
| Evaluación Aprender                   | manual | periódica  | ✅     | Lengua y Matemática 6° primario y 5°/6° secundario |

### 3. POBREZA E INDIGENCIA (15,977)

| fuente                                | tipo   | frecuencia | estado | detalle                                               |
| ------------------------------------- | ------ | ---------- | ------ | ----------------------------------------------------- |
| Pobreza e indigencia infantil         | manual | semestral  | ✅     | INDEC ENCOPRAC + EPH — Personas y Hogares             |
| Líneas de indigencia y pobreza        | API    | mensual    | ✅     | Canastas básicas INDEC vía API Series de Tiempo       |

### 4. INVERSIÓN SOCIAL (725)

| fuente                                | tipo   | frecuencia | estado | detalle                                               |
| ------------------------------------- | ------ | ---------- | ------ | ----------------------------------------------------- |
| Inversión social infancia             | manual | anual      | ✅     | Visualizador PTO 2021-2024 + Datos Abiertos 2025      |

### 5. SEGURIDAD (129)

| fuente                                | tipo   | frecuencia | estado | detalle                                               |
| ------------------------------------- | ------ | ---------- | ------ | ----------------------------------------------------- |
| Denuncias/delitos (MP Córdoba)        | manual | anual      | ✅     | 7 categorías (1999-2024)                              |

### 6. OTRAS CATEGORÍAS

| categoría           | registros | fuente                                       |
| ------------------- | --------- | -------------------------------------------- |
| Empleo              | 709       | INDEC EPH — tasa actividad, empleo, desempleo |
| Demografía          | 361       | Censo 2022 — población por edad y sexo        |
| Encuestas DDNA 2024 | 131       | Encuestas propias a adultos y jóvenes         |
| Canastas Básicas    | 500       | INDEC — CBA, CBT, Coeficiente de Engel        |
| Consumos            | 3         | Estudios de consumos                          |

---

## APIs Disponibles (para conexión futura)

### Nivel Nacional — Argentina 🇦🇷

#### 🔥 datos.gob.ar (Catálogo CKAN Nacional)

**Base URL**: `https://datos.gob.ar/api/3/action/`

| Dataset                                   | ID CKAN                                                                                             | Formato          | Relevancia                                     | Automatizable             |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------- | ------------------------- |
| **APrender 2023**                         | `educacion-aprender-2023`                                                                           | CSV (SharePoint) | Evaluaciones de 6° primario y 5°/6° secundario | ⚠️ Requiere autenticación |
| **APrender 2022**                         | `educacion-aprender-2022`                                                                           | CSV (SharePoint) | Evaluaciones Aprender                          | ⚠️ Requiere autenticación |
| **Anuario estadístico educativo**         | `educacion-anuario-estadisticos-educativos`                                                         | CSV              | Estadísticas del sistema educativo             | 🔄 Por implementar        |
| **Indicadores educativos**                | `educacion-indicadores-educativos`                                                                  | CSV              | Tasas de escolarización, aprobación, abandono  | 🔄 Por implementar        |
| **Base de datos por escuela (2009-2024)** | `educacion-base-datos-por-escuela-*`                                                                | CSV              | Datos a nivel establecimiento                  | 🔄 Por implementar        |
| **ICSE 2022**                             | `educacion-icse-2022`                                                                               | CSV              | Índice de Calidad Socioeducativa               | 🔄 Por implementar        |
| **Padrón oficial establecimientos**       | `educacion-padron-oficial-establecimientos-educativos`                                              | CSV              | Geolocalización de escuelas                    | 🔄 Por implementar        |
| **Censos docentes**                       | `educacion-censos-docentes`                                                                         | CSV              | Datos de docentes por nivel/provincia          | 🔄 Por implementar        |
| **ENNYS2 (Encuesta Nutrición y Salud)**   | `salud-ennys2`                                                                                      | CSV              | Nutrición infantil 0-5 años                    | 🔄 Por implementar        |
| **ROHA (Oncopediátrico)**                 | `salud-roha`                                                                                        | CSV              | Registro oncológico 0-14 años (2000-2019)      | 🔄 Por implementar        |
| **Programa SUMAR beneficiarios**          | `salud-total-beneficiarios-programa-sumar`                                                          | CSV              | Cobertura de salud adolescente                 | 🔄 Por implementar        |
| **SENAF - Actividades formación**         | `desarrollo-social-actividades-formacion-promocion-secretaria-nacional-ninez-adolescencia-familia`  | **CSV ✅**       | Programas y acciones de Senaf                  | 🔄 Por implementar        |
| **Dispositivos adolescentes infractores** | `desarrollo-social-dispositivos-aprehension-especializados-para-adolescentes-presuntos-infractores` | **CSV ✅**       | Centros de derivación, tipo de dispositivo     | 🔄 Por implementar        |
| **Potenciar Trabajo**                     | `desarrollo-social-potenciar-trabajo`                                                               | CSV              | Programas de empleo (contexto juvenil)         | 🔄 Por implementar        |
| **EPH - Mercado de trabajo**              | `trabajo-eph-*`                                                                                     | CSV              | Tasa de actividad, empleo, desempleo           | 🔄 Por implementar        |
| **CBA - Canasta Básica Alimentaria**      | `150.1_CSTA_BATAL_0_D_20`                                                                           | API REST         | Adulto equivalente, GBA                        | ✅ Implementado           |
| **CBT - Canasta Básica Total**            | `150.1_CSTA_BTTAL_0_D_20`                                                                           | API REST         | Adulto equivalente, GBA                        | ✅ Implementado           |

**Ejemplo de consulta CKAN**:

```bash
# Listar datasets de educación
curl "https://datos.gob.ar/api/3/action/package_list?limit=500" | jq '.result[] | select(. | contains("educacion"))'

# Obtener recursos de un dataset
curl "https://datos.gob.ar/api/3/action/package_show?id=educacion-aprender-2023"
```

#### INDEC

| Servicio                         | URL                                                                              | Tipo    | Estado    | Para DDNA                                               |
| -------------------------------- | -------------------------------------------------------------------------------- | ------- | --------- | ------------------------------------------------------- |
| **API Series de Tiempo**         | `https://apis.datos.gob.ar/series/api/series/`                                   | REST    | ✅ Activo | CBA, CBT, pobreza, empleo                               |
| **Visualizaciones interactivas** | `https://shiny.indec.gob.ar/`                                                    | Shiny/R | ✅ Activo | Indicadores contextuales (pobreza, empleo, educación)   |
| **FTP**                          | `https://www.indec.gob.ar/ftp/`                                                  | FTP     | ✅ Activo | PDFs, tablas, informes técnicos                         |
| **Bases de datos EPH**           | `https://www.indec.gob.ar/.../BasesDeDatos`                                      | Web     | ✅ Activo | Microdatos de empleo y pobreza (requiere procesamiento) |
| **Dosier NNyA**                  | `https://www.indec.gob.ar/ftp/cuadros/poblacion/dosier_nnya_11_237A4EFD2B08.pdf` | PDF     | ✅ Activo | Estadísticas consolidadas de infancia                   |
| **NSDP (Estándares IMF)**        | `https://sdds.indec.gob.ar/`                                                     | Web     | ✅ Activo | Metadatos y metodología                                 |

> 📖 Ver guía completa: [indec-canastas-api.md](./indec-canastas-api.md)

---

### Nivel Provincial — Córdoba 🏛️

#### 🔥 Gestión Abierta Córdoba (CKAN Provincial)

**Base URL**: `https://datosgestionabierta.cba.gov.ar/api/3/action/`

| Dataset                      | ID CKAN                                                                             | Formato  | Relevancia                            | Automatizable      |
| ---------------------------- | ----------------------------------------------------------------------------------- | -------- | ------------------------------------- | ------------------ |
| **Centros de salud**         | `centros-de-salud`                                                                  | CSV/XLSX | Ubicación y datos de efectores        | 🔄 Por implementar |
| **Centros de vacunación**    | `centros-de-vacunacion-de-la-provincia-de-cordoba`                                  | CSV      | Cobertura geográfica                  | 🔄 Por implementar |
| **Educación para el futuro** | `educacion-para-el-futuro`                                                          | CSV      | Programas educativos provinciales     | 🔄 Por implementar |
| **Indicadores educación**    | `indicadores-del-relevamiento-anual-de-educacion`                                   | CSV      | Relevamiento anual                    | 🔄 Por implementar |
| **Seguridad ciudadana**      | `seguridad-ciudadana`                                                               | CSV      | Estadísticas de seguridad             | 🔄 Por implementar |
| **Transparencia justicia**   | `transparencia-activa-justicia`                                                     | CSV      | Datos del poder judicial              | 🔄 Por implementar |
| **Presupuesto provincial**   | `presupuesto`                                                                       | CSV/XLSX | Ejecución presupuestaria por programa | 🔄 Por implementar |
| **Memorias de gestión**      | `memorias-gestion`                                                                  | PDF/SVG  | Reportes de gestión 2017-2023         | ❌ PDF manual      |
| **Protección derechos NNyA** | `promocion-y-proteccion-de-los-derechos-de-las-ninas-ninos-adolescentes-y-familias` | PDF/SVG  | Políticas de infancia (21 recursos)   | ❌ PDF manual      |

**Ejemplo de consulta CKAN provincial**:

```bash
# Listar datasets disponibles
curl "https://datosgestionabierta.cba.gov.ar/api/3/action/package_list?limit=200"

# Filtrar por relevancia para DDNA
curl "https://datosgestionabierta.cba.gov.ar/api/3/action/package_list?limit=200" | jq '.result[] | select(. | test("salud|educacion|seguridad|presupuesto|ninez"))
```

#### Ministries Provinciales (web, sin API)

| Organismo                    | URL                              | API | Estado                |
| ---------------------------- | -------------------------------- | --- | --------------------- |
| Ministerio de Salud CBA      | `https://salud.cba.gov.ar`       | ❌  | Web — descarga manual |
| Ministerio de Educación CBA  | `https://educacion.cba.gov.ar`   | ❌  | Web — descarga manual |
| Secretaría de Niñez CBA      | `https://ninez.cba.gov.ar`       | ❌  | Web — descarga manual |
| Ministerio de Finanzas CBA   | `https://finanzas.cba.gov.ar`    | ❌  | Web — descarga manual |
| Dirección de Estadística CBA | `https://estadistica.cba.gov.ar` | ❌  | Web — descarga manual |

---

### Nivel Municipal — Ciudad de Córdoba 🏙️

**Base URL**: `https://gobiernoabierto.cordoba.gob.ar`

| Categoría            | Datasets disponibles          | API CKAN       | Automatizable |
| -------------------- | ----------------------------- | -------------- | ------------- |
| Salud                | Centros de salud, programas   | ❌ No responde | —             |
| Educación            | Programas educativos          | ❌ No responde | —             |
| Población y Sociedad | Datos demográficos por barrio | ❌ No responde | —             |
| Economía y Finanzas  | Presupuesto, échelle salarial | ❌ No responde | —             |
| Seguridad Vial       | Siniestralidad, multas        | ❌ No responde | —             |

> ⚠️ La API REST del portal municipal no responde correctamente. Solo funciona la navegación web.

---

## Indicadores Contextuales (no NNyA, enriquecimiento del dashboard)

Además de datos directa de NNyA, estos indicadores dan **contexto provincial/nacional** para enriquecer el dashboard:

| Indicador                               | Fuente                            | Periodicidad | Uso en dashboard        |
| --------------------------------------- | --------------------------------- | ------------ | ----------------------- |
| PBI per cápita Córdoba                  | MECON / Dirección Estadística CBA | Anual        | Contexto económico      |
| Índice de Gini                          | INDEC EPH                         | Semestral    | Desigualdad             |
| Tasa de actividad/empleo juvenil        | INDEC EPH                         | Trimestral   | Contexto laboral        |
| Inflación/IPC Córdoba                   | INDEC / Estadística CBA           | Mensual      | Valor real de inversión |
| Producto Bruto Geográfico               | Dirección Estadística CBA         | Anual        | Escala económica        |
| NBI (Necesidades Básicas Insatisfechas) | CNPV 2022                         | Decenal      | Pobreza estructural     |
| Hogares con NBI por provincia           | INDEC                             | Anual        | Mapa de pobreza         |

---

## Prioridades de Conexión API

### Inmediatas (este sprint)

1. ~~**SENAF Nacional — CSV directo**~~ ✅ **Datos cargados en Supabase**
   - Script: `scripts/load-senaf-data.mjs`
   - Datasets: Primeros Años (362) + Dispositivos adolescentes (18) + Línea 102 (2)
   - Impacto: Programas SENAF, adolescentes infractores, llamadas L102
   - ⚠️ Fuente original (`datosabiertos.desarrollosocial.gob.ar`) **DNS caído**. Los CSVs se descargan vía Wayback Machine (snapshot Dic 2023). Sin pipeline de actualización futura.

### Mediano plazo (próximo mes)

3. **RMM / TMNEO / TMPOS post-2022** — DEIS no tiene API para estos indicadores.
   Requiere ETL desde microdatos de defunciones (`datos.salud.gob.ar`) + nacidos vivos.
4. **Centros de Salud CBA** — CKAN provincial
5. **Presupuesto infantil CBA** — Si CKAN provincial activa el datastore

### Largo plazo (futuras versiones)

6. **Educación — Aprender (CSV)** — Requiere mejorar método de descarga (actualmente en SharePoint)
7. **EPH — Indicadores laborales** — Contexto para el dashboard
8. **IPC Córdoba** — Para deflactar inversión real

---

## Formato para carga de nuevas fuentes

### CSV (fuente API o descarga)

```csv
indicador_nombre,categoria,valor,unidad,periodo,region,desglose
Mortalidad infantil TMI,Córdoba,8.5,‰,2022,Córdoba,"{""fuente"":""DEIS 2022""}"
```

### JSON (para Supabase API)

```json
{
  "indicador_nombre": "Tasa de mortalidad infantil",
  "categoria": "salud",
  "valor": 8.5,
  "unidad": "‰",
  "periodo": "2022",
  "region": "Córdoba",
  "desglose": { "fuente": "DEIS 2022", "nivel": "provincial" }
}
```

---

## Scripts de automatización ETL

| Script                              | Fuente                     | Tipo de carga      | Estado |
| ----------------------------------- | -------------------------- | ------------------ | ------ |
| `scripts/update-indec-indicators.mjs` | INDEC / datos.gob.ar API  | API REST (series)  | ✅     |
| `scripts/load-senaf-data.mjs`       | SENAF / desarrollo social  | CSV → Supabase     | ✅ (vía Wayback Machine) |
| `scripts/load-deis-2024.mjs`        | DEIS Estadísticas Vitales  | PDF → SQL          | ✅     |
| `scripts/load-vaccination-data.mjs` | DEIS vacunación            | CSV → Supabase     | ✅     |
| `scripts/load-uca-dimensions.mjs`   | UCA (pobreza)              | CSV → Supabase     | ✅     |
| `scripts/load-budget-*.mjs`         | Presupuesto                | CSV → Supabase     | ✅     |

> Todos los scripts están en `scripts/` y usan `scripts/config.mjs` para la conexión a Supabase.

## Estados de carga

| estado | significado                                                          |
| ------ | -------------------------------------------------------------------- |
| ✅     | Disponible en Supabase — listo para usar                             |
| ⏳     | Pendiente — archivo existe pero no se cargó                          |
| 🔄     | En desarrollo — extractor/transformer en construcción                |
| ❌     | No disponible — requiere gestión (contacto institucional, PDF, etc.) |

---

## Notas técnicas

- **CKAN API**: Todos los portales CKAN usan el mismo padrão REST: `{base_url}/api/3/action/{method}`
- **Métodos útiles**: `package_list`, `package_show`, `organization_show`, `datastore_search`
- **Rate limits**: No hay límites documentados, pero usar caché local para evitar saturación
- **Autenticación**: La mayoría de datasets son públicos. Solo algunos requieren token (SharePoint del Ministerio de Educación)

---

## Referencias

- Portal datos.gob.ar: https://datos.gob.ar
- Gestión Abierta CBA: https://datosgestionabierta.cba.gov.ar
- CKAN API docs: https://docs.ckan.org/en/2.10/api/
- INDEC: https://www.indec.gob.ar
- Shiny INDEC: https://shiny.indec.gob.ar/
- SENAF: https://www.argentina.gob.ar/justicia/senaf

> † Fuente original (`datosabiertos.desarrollosocial.gob.ar`) **DNS caído** desde 2024. Los CSVs se descargan desde Wayback Machine (snapshot Dic 2023). Sin pipeline de actualización futura.

---

## Repositorio DDNA (Archivos propios)

### Bucket de Storage

- **Bucket**: `ddna-repositorio`
- **URL base**: `https://ppyyqrvirjqmfpqaqnxy.supabase.co/storage/v1/object/public/ddna-repositorio`
- **Tabla**: `repositorio` (metadata en Supabase)

### Endpoints de gestión

| Acción          | Endpoint                       |
| --------------- | ------------------------------ |
| Listar archivos | `GET /api/repositorio`         |
| Subir archivo   | `POST /api/repositorio/upload` |

### Subir archivos manualmente

1. Ir a Supabase Dashboard → **Storage** → **ddna-repositorio**
2. Arrastrar archivos a la carpeta correspondiente
3. Verificar que aparezcan en `/repositorio`

### Categorías del repositorio

- `encuestas`: Encuestas propias de la Defensoría
- `inversion`: Datos de inversión social
- `consumos`: Estudios de consumos
- `medios`: Monitoreo de medios
- `proteccion`: Protección digital
- `informes`: Informes y tableros
