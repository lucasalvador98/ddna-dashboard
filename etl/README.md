# ETL DDNA — Pipeline de Datos

Pipeline de Extracción, Transformación y Carga de datos para el Tablero de Monitoreo de la **Defensoría de los Derechos de Niñas, Niños y Adolescentes (DDNA)** de la Provincia de Córdoba.

## Requisitos

- Python 3.10+
- pip

## Instalación

```bash
cd etl
pip install -r requirements.txt
```

## Archivos de Datos

Los archivos fuente están en `../../datos/raw/` organizados por categoría:

| Categoría | Directorio | Archivos |
|-----------|-----------|----------|
| Salud | `deis/` | Mortalidad infantil, cobertura vacunal, datos DEIS |
| Educación | `aprender/`, `censo-2022/` | Educación por nivel y edad |
| Pobreza | `pobreza/` | Pobreza e indigencia, encuestas de consumo |
| Seguridad | `justicia/` | Estadísticas de justicia y denuncias |
| Demografía | `censo-2022/` | Población censal |
| Inversión | `inversion/` | **Sin datos aún** |

> **Nota**: Los archivos PDF (informes, anuarios) no son procesables automáticamente. Se incluyen scripts de transformación que los detectan y omiten con un mensaje de advertencia.

## Uso

### Fase 1: Inspeccionar datos

Antes de transformar, inspeccione los archivos para entender su estructura:

```bash
# Inspeccionar todos los archivos
python main.py inspect

# Inspeccionar una categoría específica
python main.py inspect --category salud

# Salida en JSON (para procesamiento posterior)
python main.py inspect --json

# Archivo específico
python inspect.py --file ../datos/raw/deis/Mortalidad\ infantil\ Nacion-Provincia.xlsx
```

### Fase 2: Transformar

Convierte los datos crudos al formato del esquema de Supabase:

```bash
# Transformar una categoría
python main.py transform --category salud

# Transformar todas las categorías
python main.py transform --all
```

Los resultados se guardan en `etl/output/{categoria}_transformed.json`.

### Fase 3: Cargar

#### Método SQL (recomendado)

Genera archivos SQL que se pueden ejecutar en el **SQL Editor** de Supabase:

```bash
python main.py load --method sql
```

Esto genera:
- `etl/output/{categoria}_YYYYMMDD_HHMMSS.sql` — SQL por categoría
- `etl/output/ddna_all_data_YYYYMMDD_HHMMSS.sql` — SQL combinado

Para ejecutar en Supabase:
1. Ir al [Dashboard de Supabase](https://supabase.com/dashboard)
2. Seleccionar el proyecto `ddna-dashboard`
3. Ir a **SQL Editor**
4. Copiar y ejecutar el contenido del archivo SQL generado

#### Método API (requiere SERVICE_ROLE_KEY)

```bash
export SUPABASE_SERVICE_ROLE_KEY="tu-clave-aqui"
python main.py load --method api
```

> ⚠️ La SERVICE_ROLE_KEY permite escritura directa sin RLS. Manejar con precaución.

### Pipeline completo

```bash
# Pipeline completo para una categoría
python main.py etl --category salud

# Pipeline completo para todas
python main.py etl --all

# Pipeline completo con carga por API
python main.py etl --all --method api
```

## Estructura del Proyecto

```
etl/
├── config.py                 # Configuración (Supabase, rutas)
├── main.py                    # Punto de entrada CLI
├── inspect.py                 # Inspector de archivos (fase 1)
├── requirements.txt           # Dependencias Python
├── README.md                  # Este archivo
├── extract/
│   ├── __init__.py
│   └── read_excel.py         # Lector genérico de Excel/XLS
├── transform/
│   ├── __init__.py
│   ├── salud.py               # Transformación de datos de salud
│   ├── educacion.py           # Transformación de datos educativos
│   ├── pobreza.py             # Transformación de datos de pobreza
│   ├── seguridad.py           # Transformación de datos de seguridad
│   └── demografia.py          # Transformación de datos demográficos
├── load/
│   ├── __init__.py
│   ├── sql_generator.py       # Generador de SQL UPSERT
│   └── supabase_loader.py     # Cargador directo vía API REST
└── output/                    # SQL y JSON generados (gitignored)
```

## Esquema de Base de Datos

Las tablas principales son:

- **`indicadores`**: Definición de cada indicador (categoría, nombre, unidad, fuente)
- **`datos_indicadores`**: Valores por periodo y región (valor, periodo, desglose JSONB)
- **`fuentes_datos`**: Catálogo de fuentes oficiales (ya poblado con 8 fuentes)

Los IDs se generan deterministicamente (UUID5) a partir del nombre y categoría para permitir re-ejecuciones sin duplicados.

## Notas

- Los archivos `.xls` (formato Excel 97-2003) requieren `xlrd` para lectura
- Los archivos `.xlsx` (formato moderno) requieren `openpyxl`
- Los archivos PDF se omiten automáticamente con un mensaje de advertencia
- El campo `desglose` almacena dimensiones adicionales como JSONB (sexo, grupo etario, tipo, etc.)
- **Inversión social**: No hay archivos de datos aún. Crear un stub o agregar datos manualmente vía el admin del dashboard