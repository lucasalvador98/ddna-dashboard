# ETL DDNA — Pipeline de Datos

Pipeline de Extracción, Transformación y Carga de datos para el Tablero de Monitoreo de la **Defensoría de los Derechos de Niñas, Niños y Adolescentes (DDNA)** de la Provincia de Córdoba.

## Requisitos

- Python 3.10+
- `pip install -r requirements.txt`

## Instalación

```bash
cd etl
pip install -r requirements.txt
```

## Estructura del Proyecto

```
etl/
├── config.py                 # Configuración global (Supabase, rutas de archivos)
├── main.py                 # CLI principal: inspect, transform, load, etl
├── etl_inspect.py          # Inspector interactivo de archivos
├── sources.yaml            # Catálogo de fuentes de datos
├── requirements.txt       # Dependencias Python
├── README.md             # Este archivo
│
├── paicor_2018.csv        # Datos PAICOR 2018 (descargados)
├── paicor_2018.csv       # Datos PAICOR 2018 locales
│
├── extract/               # Fase 1: Extracción
│   ├── __init__.py
│   └── read_excel.py      # Lector genérico Excel/XLS con fallback
│
├── transform/            # Fase 2: Transformación
│   ├── __init__.py
│   ├── salud.py          # Mortalidad infantil, cobertura vacunal, DEIS
│   ├── educacion.py      # Escolarización, Aprender, Censo
│   ├── pobreza.py        # Pobreza/indigencia, ENCOPRAC
│   ├── seguridad.py      # Denuncias, Ministerio Público
│   ├── demografia.py    # Población censal
│   └── inversion.py     # Inversión social
│
├── load/                  # Fase 3: Carga
│   ├── __init__.py
│   ├── sql_generator.py  # Generador SQL UPSERT
│   └── supabase_loader.py # Cargador vía API REST
│
├── load_paicor.py        # Script dedicado: PAICOR desde CKAN
├── load_inversion.py     # Script dedicado: Inversión desde Excel
│
└── output/              # SQL/JSON generados (gitignored)
```

## Datos en Base de Datos

### Tablas de Supabase

| Tabla | Registros | Descripción |
|------|----------|-------------|
| `indicadores` | ~1800+ | Datos de todas las categorías |
| `paicor` | 105 | Beneficiarios PAICOR 2018 por departamento |
| `indicadores_api` | 16 | Metadata de fuentes API |
| `indicadores_geografia` | 10 | Capas geoespaciales |

### Registros por Categoría (al 15/04/2026)

| Categoría | Registros | Fuente |
|----------|-----------|--------|
| Educación | 1056 | Aprender + Censo 2022 |
| Demografía | 411 | Censo 2022 + DEIS |
| Salud | 145 | Mortalidad infantil + DEIS |
| Pobreza | 48 | INDEC + ENCOPRAC |
| Seguridad | 7 | Ministerio Público Córdoba |
| **Total** | **1667** | |

---

## Carga Masiva a Supabase — Chunks SQL

Estado al 22/04/2026: **6,681 INSERTs** generados en `etl/output/chunks/` (134 archivos × ~50 INSERTs c/u).
Pendiente de ejecutar a Supabase.

### Archivos generados

```
etl/output/ddna_all_data_20260422_120653.sql   # Original: 26,757 líneas, 6,681 INSERTs
etl/output/chunks/chunk_0000.sql            # Chunk 0 (50 INSERTs, 22 KB)
etl/output/chunks/chunk_0001.sql            # Chunk 1 (50 INSERTs, 25 KB)
...
etl/output/chunks/chunk_0133.sql            # Chunk 133 (31 INSERTs, 13 KB)
```

### Script de división

`etl/scripts/split_sql.py` — divide el SQL original en chunks de 50 INSERTs.

```bash
python etl/scripts/split_sql.py   # Genera chunks en etl/output/chunks/
```

### Procedimiento para continuar la carga

1. Limpiar tabla:
   ```sql
   DELETE FROM indicadores WHERE id LIKE 'e07d4ee9%' OR id LIKE '9ecb2fb6%'; -- definiciones base
   ```
2. Ejecutar chunks en orden (0 a 133) vía Supabase MCP o SQL Editor:
   ```bash
   # Cada chunk ~25KB → ejecutar en Supabase SQL Editor o via supabase_execute_sql MCP
   # Chunk 0 ya probado → sintaxis OK
   ```
3. Verificar conteo:
   ```sql
   SELECT COUNT(*) as total, categoria FROM indicadores GROUP BY categoria ORDER BY categoria;
   -- Meta: 6,681+ registros
   ```

## Uso

### Script Principal (`main.py`)

El CLI principal maneja las 3 fases:

```bash
# Fase 1: Inspeccionar datos
python main.py inspect                              # Todos los archivos
python main.py inspect --category salud        # Por categoría
python main.py inspect --json                  # Salida JSON

# Fase 2: Transformar
python main.py transform --category salud      # Por categoría
python main.py transform --all                 # Todas las categorías

# Fase 3: Cargar (genera SQL)
python main.py load --method sql                # Genera SQL para SQL Editor

# Pipeline completo
python main.py etl --category salud           # inspect + transform + load
python main.py etl --all                     # Pipeline completo
python main.py etl --all --method api         # Con carga directa vía API
```

### Scripts Dedicados

Para cargas específicas, hay scripts especializados:

#### `load_paicor.py`

Carga datos del programa PAICOR desde CKAN (Gestión Abierta Córdoba) o archivo local.

```bash
# Ejecutar (genera SQL en output/)
python load_paicor.py
```

**Funcionalidad:**
- Descarga datos desde CKAN (2017, 2019-2022)
- Lee archivo local `paicor_2018.csv` (2018)
- Corrige encoding (MAÑANA, turna Tarde/Noche)
- Genera SQL con UPSERT para tabla `paicor`

**Tabla destino:**
```sql
paicor(
  anio INTEGER,
  departamento TEXT,
  turno TEXT,      -- MAÑANA, TARDE, NOCHE
  nivel TEXT,
  cant_beneficios INTEGER,
  fuente TEXT
)
```

**CKAN URLs (pueden cambiar):**
- 2017: `ce3cd34e-3a37-4005-a030-df5c1bec0a53`
- 2019: `b92a2e2d-25ce-4622-8291-ec7aad9af7a0`
- 2020: `7bb24e17-1d6f-443b-8e64-4fa0e5aa8a22`
- 2021: `c4ac7346-920d-4fbf-8795-fa0edbe8da06`
- 2022: `022a6974-b88b-4a4a-98c9-68816d85af3e`

#### `load_inversion.py`

Carga datos de Inversión Social desde Excel.

```bash
# Ejecutar (genera SQL en output/)
python load_inversion.py
```

**Configuración:**
- Por defecto: `../../datos/Inversion/BASE DE DATOS.xlsx`
- Override: `export INVERSION_EXCEL_FILE=/ruta/al/archivo.xlsx`

**Hoja:** `BASE DE DATOS`

**Categorías extraídas:**
- Educación
- Salud
- Protección del niño y adolescente
- Desarrollo e integración
- Nutrición y alimentación
- Ayuda directa
- Condiciones de vida
- Deportes, recreación y cultura

**Columnas usadas:**
- Columna A: Año
- Columna L (12): DEVENGADO (monto ejecutado)
- Columna Q (17): Categoría

**Tabla destino:**
```sql
indicadores(
  categoria TEXT,       -- 'inversion'
  indicador_nombre TEXT,
  valor NUMERIC,        -- Millones de pesos (Md)
  unidad TEXT,         -- 'Md'
  periodo INTEGER,     -- Año
  fuente TEXT         -- 'manual'
)
```

### Inspector Interactivo (`etl_inspect.py`)

Inspecciona un archivo Excel y muestra su estructura:

```bash
python etl_inspect.py --file /ruta/al/archivo.xlsx
python etl_inspect.py --file /ruta/al/archivo.xlsx --sheet "Nombre Hoja"
```

**Salida:**
- Filas/columnas
- Nombre de hojas
- Preview de datos (primeras 5 filas)
- Detección automática de estructura (años en columnas vs filas)

---

## Archivos de Datos

Los archivos fuente están en `../../datos/raw/` organizados por categoría:

| Categoría | Directorio | Archivos |
|-----------|-----------|----------|
| Salud | `deis/` | Mortalidad infantil, cobertura vacunal, datos DEIS |
| Educación | `aprender/`, `censo-2022/` | Educación por nivel y edad |
| Pobreza | `pobreza/` | Pobreza e indigencia, encuestas de consumo |
| Seguridad | `justicia/` | Estadísticas de justicia y denuncias |
| Demografía | `censo-2022/` | Población censal |
| Inversión | `inversion/` | Inversión social (ya cargado) |
| PAICOR | CKAN + local | Beneficiarios por departamento |

> **Nota**: Los archivos PDF (informes, anuarios) no son procesables automáticamente. Se incluyen scripts de transformación que los detectan y omiten con un mensaje de advertencia.

### Rutas configuradas en `config.py`

```python
RAW_DATA_DIR = Path("E:/Backup Luca/DDNA/datos/raw")

DATA_FILES = {
    "salud": [
        "deis/datosDeis-2024-07-26 (3).xlsx",
        "deis/Mortalidad infantil Nacion-Provincia.xlsx",
        "deis/Edad_Madre 2022.xlsx",
        "censo-2022/salud/Cobertura_Salud-Censo.xlsx",
        "salud_adolescente/salud adolescente deis.xlsx",
    ],
    "educacion": [
        "censo-2022/educacion/Educacion por nivel.xlsx",
        "censo-2022/educacion/Educacion por edades.xlsx",
        "educacion/Educacion Provincia.xlsx",
        "educacion/Datos escolarizacion.xlsx",
        "aprender/aprender 2024.xlsx",
        "anuario_educacion/2.1. RESUMEN 2024.xlsx",
        # ... más anuarios
    ],
    "pobreza": [
        "pobreza/cuadros_informe_pobreza_09_24 (1).xlsx",
    ],
    "seguridad": [
        "justicia/Justicia_cba_2022.xlsx",
    ],
    "demografia": [
        "censo-2022/demografia/censo poblacion.xlsx",
    ],
    "inversion": [
        "inversion/BASE DE DATOS ANDRES VERIFICAR SI ESTA OK.xlsx",
    ],
}
```

---

## Catálogo de Fuentes (`sources.yaml`)

El archivo `sources.yaml` define el catálogo de fuentes de datos utilizadas por el pipeline:

```yaml
fuentes:
  mortalidad_infantil:
    tipo: "manual"
    archivo: "deis/Mortalidad infantil Nacion-Provincia.xlsx"
    indicador: "Mortalidad infantil"
    categoria: "salud"
    unidad: "‰"
    frecuencia: "anual"
    fuente_oficial: "DEIS"
    ultima_actualizacion: "2026-04-15"
    estado: "cargado"
    # ...

apis:
  ckan_gestion_abierta:
    url_base: "https://datosgestionabierta.cba.gov.ar"
    estado: "funcionando"
```

**Estados posibles:**
- `pendiente`: No procesado aún
- `cargado`: Ya cargado a Supabase
- `funcionando`: API disponible
- `error`: Problema detectado

---

## Esquema de Base de Datos

### Tabla `indicadores`

```sql
CREATE TABLE indicadores (
  id UUID PRIMARY KEY,
  categoria TEXT NOT NULL,
  indicador_nombre TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  unidad TEXT DEFAULT 'casos',
  periodo TEXT NOT NULL,
  region TEXT DEFAULT 'Córdoba',
  desglose JSONB DEFAULT '{}',
  fuente TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla `paicor`

```sql
CREATE TABLE paicor (
  anio INTEGER,
  departamento TEXT,
  turno TEXT,
  nivel TEXT,
  cant_beneficios INTEGER,
  fuente TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (anio, departamento, turno, nivel));
```

### Columna `desglose` (JSONB)

Se usa para subdimensiones:

```json
// Mortalidad por provincia
{"provincia": "Córdoba"}

// Escolarización por nivel
{"nivel": "Primario", "sector": "estatal"}

// Población por edad y sexo
{"edad": "0-4", "sexo": "total"}

// Cobertura vacunal
{"vacuna": "Sarampión", "edad_grupo": "12-23 meses"}
```

---

## Ejecución en Supabase

### Método 1: SQL Editor (recomendado)

1. Ejecutar `python main.py load --method sql`
2. Copiar contenido de `output/ddna_all_data_YYYYMMDD_HHMMSS.sql`
3. Ir a [Supabase SQL Editor](https://supabase.com/dashboard/project/ppyyqrvirjqmfpqaqnxy/sql)
4. Ejecutar el SQL

### Método 2: API REST (service role)

```bash
export SUPABASE_SERVICE_ROLE_KEY="tu-clave-aqui"
python main.py load --method api
```

> ⚠️ La SERVICE_ROLE_KEY permite escritura sin RLS. Manejar con precaución.

---

## Comandos Útiles

### Desarrollo

```bash
cd etl
pip install -r requirements.txt
python main.py inspect --category salud
python main.py transform --category educacion
python main.py load --method sql
```

### Cargas específicas

```bash
# PAICOR desde CKAN
python load_paicor.py

# Inversión desde Excel
python load_inversion.py

# Inspector interactivo
python etl_inspect.py --file ../datos/raw/deis/Mortalidad\ infantil\ Nacion-Provincia.xlsx
```

### Ver datos en Supabase

```sql
-- Ver todos los datos de inversión
SELECT * FROM indicadores WHERE categoria = 'inversion';

-- Ver PAICOR por departamento
SELECT departamento, SUM(cant_beneficios) as total
FROM paicor
GROUP BY departamento
ORDER BY total DESC;

-- Ver categorías disponibles
SELECT categoria, COUNT(*) FROM indicadores GROUP BY categoria;
```

---

## Entorno de Ejecución

### Variables de entorno

```bash
# Supabase
SUPABASE_URL=https://ppyyqrvirjqmfpqaqnxy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=...

# ETL (opcional)
INVERSION_EXCEL_FILE=/ruta/al/archivo.xlsx
RAW_DATA_DIR=/ruta/a/datos/raw
```

### Dependencias Python

```
pandas
openpyxl
xlrd
requests
```

---

## Notas Técnicas

- Los IDs se generan determinísticamente (UUID5) a partir del nombre + categoría para permitir re-ejecuciones sin duplicados
- Los archivos `.xls` (Excel 97-2003) requieren `xlrd`
- Los archivos `.xlsx` (formato moderno) requieren `openpyxl`
- Los archivos PDF se omiten automáticamente
- El campo `desglose` armazena dimensiones adicionales como JSONB
- CKAN URLs pueden cambiar — verificar periódicamente

---

## Troubleshooting

### Error: "No se encontraron archivos"

Verificar `RAW_DATA_DIR` en `config.py` y que los archivos existan en esa ruta.

### Error: "Sheet not found"

El script intenta automaticamente `BASE DE DATOS`, luego la primera hoja. Usar `--sheet nombre` si es necesario.

### Error: CKAN 404

Las URLs de CKAN pueden caducar. Verificar en [Datos Gestión Abierta](https://datosgestionabierta.cba.gov.ar).

### Error: Encoding

Algunos archivos tienen problemas de encoding. Los scripts intentancorregirlos automáticamente (MAÑANA, etc).

---

*Última actualización: 2026-04-22*
*Proyecto: DDNA Dashboard - Córdoba, Argentina*