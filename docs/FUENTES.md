# Fuentes de Datos — DDNA Dashboard

> **Última actualización**: 24 de Abril 2026
> **Estado actual**: 6,751 registros en Supabase (educación, inversión, pobreza, salud, seguridad)

---

## Leyenda

- **tipo**: `api` = automático via HTTP/REST, `csv` = descarga directa (automatizable), `manual` = carga manual
- **frecuencia**: frecuencia de actualización esperada
- **estado**: ✅ = disponible en Supabase, ⏳ = pendiente, 🔄 = en desarrollo

---

## Fuentes Conectadas (en Supabase)

### 1. SALUD

| fuente | tipo | frecuencia | estado | detalle |
|--------|------|------------|--------|---------|
| Mortalidad infantil (DEIS) | manual | anual | ✅ | TMI, RMM, TMNEO, TMPOS — Córdoba y Nacional 2005-2022 |
| Cobertura vacunal (DEIS) | manual | anual | ✅ | 8 series por tipo de vacuna |
| Tasa de asistencia educativa | manual | ad-hoc | ✅ | Census 2022 — 19 grupos de edad (0-17 años) |
| Pobreza e indigencia infantil | manual | semestral | ✅ | INDEC ENCOPRAC 2016-2024 — Personas y Hogares |
| Inversión social infancia | manual | anual | ✅ | 6,164 registros por programa/organismo (2024) |
| Denuncias/delitos (MP Córdoba) | manual | anual | ✅ | 7 categorías (2022) |

---

## APIs Disponibles (para conexión futura)

### Nivel Nacional — Argentina 🇦🇷

#### 🔥 datos.gob.ar (Catálogo CKAN Nacional)

**Base URL**: `https://datos.gob.ar/api/3/action/`

| Dataset | ID CKAN | Formato | Relevancia | Automatizable |
|---------|---------|---------|------------|---------------|
| **APrender 2023** | `educacion-aprender-2023` | CSV (SharePoint) | Evaluaciones de 6° primario y 5°/6° secundario | ⚠️ Requiere autenticación |
| **APrender 2022** | `educacion-aprender-2022` | CSV (SharePoint) | Evaluaciones Aprender | ⚠️ Requiere autenticación |
| **Anuario estadístico educativo** | `educacion-anuario-estadisticos-educativos` | CSV | Estadísticas del sistema educativo | 🔄 Por implementar |
| **Indicadores educativos** | `educacion-indicadores-educativos` | CSV | Tasas de escolarización, aprobación, abandono | 🔄 Por implementar |
| **Base de datos por escuela (2009-2024)** | `educacion-base-datos-por-escuela-*` | CSV | Datos a nivel establecimiento | 🔄 Por implementar |
| **ICSE 2022** | `educacion-icse-2022` | CSV | Índice de Calidad Socioeducativa | 🔄 Por implementar |
| **Padrón oficial establecimientos** | `educacion-padron-oficial-establecimientos-educativos` | CSV | Geolocalización de escuelas | 🔄 Por implementar |
| **Censos docentes** | `educacion-censos-docentes` | CSV | Datos de docentes por nivel/provincia | 🔄 Por implementar |
| **ENNYS2 (Encuesta Nutrición y Salud)** | `salud-ennys2` | CSV | Nutrición infantil 0-5 años | 🔄 Por implementar |
| **ROHA (Oncopediátrico)** | `salud-roha` | CSV | Registro oncológico 0-14 años (2000-2019) | 🔄 Por implementar |
| **Programa SUMAR beneficiarios** | `salud-total-beneficiarios-programa-sumar` | CSV | Cobertura de salud adolescente | 🔄 Por implementar |
| **SENAF - Actividades formación** | `desarrollo-social-actividades-formacion-promocion-secretaria-nacional-ninez-adolescencia-familia` | **CSV ✅** | Programas y acciones de Senaf | 🔄 Por implementar |
| **Dispositivos adolescentes infractores** | `desarrollo-social-dispositivos-aprehension-especializados-para-adolescentes-presuntos-infractores` | **CSV ✅** | Centros de derivación, tipo de dispositivo | 🔄 Por implementar |
| **Potenciar Trabajo** | `desarrollo-social-potenciar-trabajo` | CSV | Programas de empleo (contexto juvenil) | 🔄 Por implementar |
| **EPH - Mercado de trabajo** | `trabajo-eph-*` | CSV | Tasa de actividad, empleo, desempleo | 🔄 Por implementar |

**Ejemplo de consulta CKAN**:
```bash
# Listar datasets de educación
curl "https://datos.gob.ar/api/3/action/package_list?limit=500" | jq '.result[] | select(. | contains("educacion"))'

# Obtener recursos de un dataset
curl "https://datos.gob.ar/api/3/action/package_show?id=educacion-aprender-2023"
```

#### INDEC

| Servicio | URL | Tipo | Estado | Para DDNA |
|----------|-----|------|--------|----------|
| **Visualizaciones interactivas** | `https://shiny.indec.gob.ar/` | Shiny/R | ✅ Activo | Indicadores contextuales (pobreza, empleo, educación) |
| **FTP** | `https://www.indec.gob.ar/ftp/` | FTP | ✅ Activo | PDFs, tablas, informes técnicos |
| **Bases de datos EPH** | `https://www.indec.gob.ar/.../BasesDeDatos` | Web | ✅ Activo | Microdatos de empleo y pobreza (requiere procesamiento) |
| **Dosier NNyA** | `https://www.indec.gob.ar/ftp/cuadros/poblacion/dosier_nnya_11_237A4EFD2B08.pdf` | PDF | ✅ Activo | Estadísticas consolidadas de infancia |
| **API REST** | — | — | ❌ No disponible | — |
| **NSDP (Estándares IMF)** | `https://sdds.indec.gob.ar/` | Web | ✅ Activo | Metadatos y metodología |

---

### Nivel Provincial — Córdoba 🏛️

#### 🔥 Gestión Abierta Córdoba (CKAN Provincial)

**Base URL**: `https://datosgestionabierta.cba.gov.ar/api/3/action/`

| Dataset | ID CKAN | Formato | Relevancia | Automatizable |
|---------|---------|---------|------------|---------------|
| **Centros de salud** | `centros-de-salud` | CSV/XLSX | Ubicación y datos de efectores | 🔄 Por implementar |
| **Centros de vacunación** | `centros-de-vacunacion-de-la-provincia-de-cordoba` | CSV | Cobertura geográfica | 🔄 Por implementar |
| **Educación para el futuro** | `educacion-para-el-futuro` | CSV | Programas educativos provinciales | 🔄 Por implementar |
| **Indicadores educación** | `indicadores-del-relevamiento-anual-de-educacion` | CSV | Relevamiento anual | 🔄 Por implementar |
| **Seguridad ciudadana** | `seguridad-ciudadana` | CSV | Estadísticas de seguridad | 🔄 Por implementar |
| **Transparencia justicia** | `transparencia-activa-justicia` | CSV | Datos del poder judicial | 🔄 Por implementar |
| **Presupuesto provincial** | `presupuesto` | CSV/XLSX | Ejecución presupuestaria por programa | 🔄 Por implementar |
| **Memorias de gestión** | `memorias-gestion` | PDF/SVG | Reportes de gestión 2017-2023 | ❌ PDF manual |
| **Protección derechos NNyA** | `promocion-y-proteccion-de-los-derechos-de-las-ninas-ninos-adolescentes-y-familias` | PDF/SVG | Políticas de infancia (21 recursos) | ❌ PDF manual |

**Ejemplo de consulta CKAN provincial**:
```bash
# Listar datasets disponibles
curl "https://datosgestionabierta.cba.gov.ar/api/3/action/package_list?limit=200"

# Filtrar por relevancia para DDNA
curl "https://datosgestionabierta.cba.gov.ar/api/3/action/package_list?limit=200" | jq '.result[] | select(. | test("salud|educacion|seguridad|presupuesto|ninez"))
```

#### Ministries Provinciales (web, sin API)

| Organismo | URL | API | Estado |
|-----------|-----|-----|--------|
| Ministerio de Salud CBA | `https://salud.cba.gov.ar` | ❌ | Web — descarga manual |
| Ministerio de Educación CBA | `https://educacion.cba.gov.ar` | ❌ | Web — descarga manual |
| Secretaría de Niñez CBA | `https://ninez.cba.gov.ar` | ❌ | Web — descarga manual |
| Ministerio de Finanzas CBA | `https://finanzas.cba.gov.ar` | ❌ | Web — descarga manual |
| Dirección de Estadística CBA | `https://estadistica.cba.gov.ar` | ❌ | Web — descarga manual |

---

### Nivel Municipal — Ciudad de Córdoba 🏙️

**Base URL**: `https://gobiernoabierto.cordoba.gob.ar`

| Categoría | Datasets disponibles | API CKAN | Automatizable |
|-----------|---------------------|----------|---------------|
| Salud | Centros de salud, programas | ❌ No responde | — |
| Educación | Programas educativos | ❌ No responde | — |
| Población y Sociedad | Datos demográficos por barrio | ❌ No responde | — |
| Economía y Finanzas | Presupuesto, échelle salarial | ❌ No responde | — |
| Seguridad Vial | Siniestralidad, multas | ❌ No responde | — |

> ⚠️ La API REST del portal municipal no responde correctamente. Solo funciona la navegación web.

---

## Indicadores Contextuales (no NNyA, enriquecimiento del dashboard)

Además de datos directa de NNyA, estos indicadores dan **contexto provincial/nacional** para enriquecer el dashboard:

| Indicador | Fuente | Periodicidad | Uso en dashboard |
|-----------|--------|---------------|-------------------|
| PBI per cápita Córdoba | MECON / Dirección Estadística CBA | Anual | Contexto económico |
| Índice de Gini | INDEC EPH | Semestral | Desigualdad |
| Tasa de actividad/empleo juvenil | INDEC EPH | Trimestral | Contexto laboral |
| Inflación/IPC Córdoba | INDEC / Estadística CBA | Mensual | Valor real de inversión |
| Producto Bruto Geográfico | Dirección Estadística CBA | Anual | Escala económica |
| NBI (Necesidades Básicas Insatisfechas) | CNPV 2022 | Decenal | Pobreza estructural |
| Hogares con NBI por provincia | INDEC | Anual | Mapa de pobreza |

---

## Prioridades de Conexión API

### Inmediatas (este sprint)

1. **SENAF Nacional — CSV directo** 🔄
   - Dataset: `desarrollo-social-actividades-formacion-promocion-secretaria-nacional-ninez-adolescencia-familia`
   - URL: `https://datosabiertos.desarrollosocial.gob.ar/dataset/.../sintesis-rafp-senaf.csv`
   - Impacto: Actividades de promoción y formación de Senaf (niños, adolescentes, familias)

2. **Dispositivos de Adolescentes — CSV directo** 🔄
   - Dataset: `desarrollo-social-dispositivos-aprehension-especializados-para-adolescentes-presuntos-infractores`
   - URL: `https://datosabiertos.desarrollosocial.gob.ar/dataset/.../dispositivos-de-aprehension-dinai-2021-2022-y-2023.csv`
   - Impacto: Estadísticas de adolescentes en conflicto con la ley penal

### Mediano plazo (próximo mes)

3. **Centros de Salud CBA** — CKAN provincial
4. **Mortalidad infantil** — Integrar DEIS nacional vs provincial (comparativa)
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
  "desglose": {"fuente": "DEIS 2022", "nivel": "provincial"}
}
```

---

## Estados de carga

| estado | significado |
|--------|-------------|
| ✅ | Disponible en Supabase — listo para usar |
| ⏳ | Pendiente — archivo existe pero no se cargó |
| 🔄 | En desarrollo — extractor/transformer en construcción |
| ❌ | No disponible — requiere gestión (contacto institucional, PDF, etc.) |

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

---

## Repositorio DDNA (Archivos propios)

### Bucket de Storage

- **Bucket**: `ddna-repositorio`
- **URL base**: `https://ppyyqrvirjqmfpqaqnxy.supabase.co/storage/v1/object/public/ddna-repositorio`
- **Tabla**: `repositorio` (metadata en Supabase)

### Endpoints de gestión

| Acción | Endpoint |
|--------|-----------|
| Listar archivos | `GET /api/repositorio` |
| Subir archivo | `POST /api/repositorio/upload` |

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