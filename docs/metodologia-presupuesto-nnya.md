# Metodología de Ponderación Presupuestaria para NNyA

## Proyecto: DDNA Dashboard

**Última actualización**: Junio 2026
**Fuentes**: DNPPE/UNICEF Córdoba, Visualizador de Presupuesto Transparente

---

## 1. ¿Qué es el Ponderador de NNyA?

El **ponderador de Niños, Niñas y Adolescentes (NNyA)** es un factor que representa el **porcentaje de un gasto presupuestario que beneficia directamente a la población entre 0 y 17 años**.

### Fórmula básica

```
Devengado Ponderado = Devengado Crudo × Ponderador NNyA
```

### Ejemplo

| Programa             | Devengado Crudo | Ponderador    | Devengado Ponderado |
| -------------------- | --------------- | ------------- | ------------------- |
| Educación Primaria   | $100 millones   | 1.0 (100%)    | $100 millones       |
| Hospital General     | $50 millones    | 0.30 (30%)    | $15 millones        |
| Infraestructura Vial | $200 millones   | 0.308 (30.8%) | $61.6 millones      |

---

## 2. Metodología DNPPE/UNICEF

La Dirección Nacional de Política de Presupuesto y Evaluación del Gasto (DNPPE) en conjunto con UNICEF desarrollaron una metodología para cuantificar la inversión pública destinada a la infancia.

### 2.1 Categorías de Gasto

Cada programa presupuestario se clasifica en una de estas categorías:

| Categoría | Descripción                                       | Ponderador          | Ejemplos                                               |
| --------- | ------------------------------------------------- | ------------------- | ------------------------------------------------------ |
| **A**     | Gasto puro - Solo requiere presencia de NNyA      | **100%**            | Educación primaria, jardines infantes, becas escolares |
| **B**     | Gasto adulto - Solo requiere presencia de adultos | **0%**              | Centros de jubilados, programas solo adultos           |
| **C**     | Gasto mixto - Requiere presencia de ambos         | **Variable**        | Salud (hospitales), transferencias sociales, seguridad |
| **D**     | Gasto general - No requiere presencia específica  | **Según población** | Infraestructura vial, administración general           |

### 2.2 Cálculo del Ponderador para Categoría C

Para gastos mixtos, el ponderador se calcula como:

```
Ponderador = Población 0-17 años / Población total beneficiaria
```

**Fuentes para el cálculo:**

- EPH-INDEC (Encuesta Permanente de Hogares)
- Registros administrativos provinciales
- Padrón de AUH-ANSES
- Censo Nacional de Población

### 2.3 Ponderadores por Defecto (Córdoba)

| Área                 | Ponderador Default | Fuente                       |
| -------------------- | ------------------ | ---------------------------- |
| Educación            | 1.0 (100%)         | Gasto puro                   |
| Salud                | 0.30 (30%)         | Proporción 0-17 en consultas |
| Desarrollo Social    | 0.308 (30.8%)      | Proporción 0-17 en hogares   |
| Niñez y Adolescencia | 1.0 (100%)         | Gasto puro                   |
| Otros                | 0.308 (30.8%)      | Proporción 0-17 en población |

---

## 3. Datos en el Dashboard

### 3.1 Estructura en Supabase

Tabla: `indicadores`

```sql
-- Campos relevantes para inversión
indicador_nombre: 'Presupuesto provincial ponderado NNyA'
categoria: 'inversion'
valor: [devengado ponderado]
unidad: 'pesos'
periodo: [año]
desglose: {
  area: 'Educación' | 'Salud' | 'Desarrollo Social' | 'Niñez y Adolescencia' | 'Otros',
  programa: 'nombre del programa',
  ponderador_promedio: 0.0 - 1.0,
  jurisdiccion: 'ministerio/entidad',
  categoria_raw: 'categoría original del presupuesto',
  metodologia: 'Ponderado según proporción de NNyA...'
}
fuente: 'Ministerio de Finanzas Córdoba / Visualizador PTO'
```

### 3.2 Datos Actuales (2024)

| Área                 | Programas | Ponderador Promedio | Total Ponderado     | Total Crudo         |
| -------------------- | --------- | ------------------- | ------------------- | ------------------- |
| Educación            | 25        | 96.3%               | $720 mil millones   | $727 mil millones   |
| Salud                | 17        | 40.4%               | $205 mil millones   | $627 mil millones   |
| Desarrollo Social    | 24        | 42.5%               | $86 mil millones    | $140 mil millones   |
| Niñez y Adolescencia | 21        | 100%                | $27 mil millones    | $27 mil millones    |
| Otros                | 18        | 30.8%               | $15 mil millones    | $47 mil millones    |
| **TOTAL**            | **105**   | -                   | **$1.053 billones** | **$1.568 billones** |

### 3.3 Evolución Histórica

| Año  | Total Ponderado   | Total Crudo     | % Ponderado |
| ---- | ----------------- | --------------- | ----------- |
| 2021 | $157 mil millones | -               | -           |
| 2022 | $282 mil millones | -               | -           |
| 2023 | $739 mil millones | -               | -           |
| 2024 | $1.053 billones   | $1.568 billones | 67.1%       |

---

## 4. Pipeline de Datos

### 4.1 Fuente de Datos

**Visualizador de Presupuesto Transparente** del Ministerio de Finanzas de Córdoba.

Estructura del Excel fuente:

| Columna             | Índice | Descripción                          |
| ------------------- | ------ | ------------------------------------ |
| AÑO                 | 0      | Año fiscal                           |
| JURISDICCION        | 3      | Ministerio/entidad                   |
| PROGRAMA            | 5      | Programa presupuestario              |
| Aplica              | 15     | Si/No - Si el programa aplica a NNyA |
| Categoría           | 16     | Categoría del programa               |
| Ponderador          | 21     | Factor de ponderación NNyA           |
| DEVENGADO PONDERADO | 27     | Monto final para NNyA                |

### 4.2 Proceso ETL

```
1. LEER Excel del Visualizador PTO
   ↓
2. FILTRAR por Aplica = "Si"
   ↓
3. MAPEAR categorías a áreas de alto nivel:
   - Educación → Educación
   - Salud, Obras sociales → Salud
   - Nutrición, Ayuda directa, Condiciones de vida → Desarrollo Social
   - Protección del niño → Niñez y Adolescencia
   - Otros → Otros
   ↓
4. AGREGAR por (year, area, programa) sumando DEVENGADO PONDERADO
   ↓
5. INSERTAR en tabla indicadores con categoría 'inversion'
```

### 4.3 Scripts de Carga

Existen múltiples scripts según el tipo de dato:

#### Script Original (Visualizador PTO con ponderador)

Ubicación: `scripts/migrate-inversion.mjs`

```bash
# Ejecutar con Node.js
node --max-old-space-size=4096 scripts/migrate-inversion.mjs
```

**Requisitos:**

- Variable de entorno: `SUPABASE_SERVICE_ROLE_KEY`
- Archivo Excel en la ruta configurada en el script

#### Script para Datos Crudos 2025 (Datos Abiertos)

Ubicación: `scripts/load-budget-2025.mjs`

```bash
node scripts/load-budget-2025.mjs
```

**Características:**

- Lee datos de ejecución presupuestaria cruda (sin ponderador)
- Aplica ponderadores por defecto según área
- Agrega datos por (año, área, programa)
- Inserta en tabla `indicadores` con categoría 'inversion'

**Requisitos:**

- Excel "Gastos Administración Central - Acumulado [MES] [AÑO].xlsx" en `scripts/data/`
- Variable de entorno: `SUPABASE_SERVICE_ROLE_KEY`

#### Script para Ley de Presupuesto (estimaciones)

Ubicación: `scripts/load-budget-2026-estimate.mjs`

```bash
node scripts/load-budget-2026-estimate.mjs
```

**Características:**

- Genera estimación basada en Ley de Presupuesto
- Aplica ponderadores por defecto según área
- Inserta 19 registros (5 áreas × ~4 programas cada una)
- Marca datos como "estimate" en metadatos

**Requisitos:**

- Variable de entorno: `SUPABASE_SERVICE_ROLE_KEY`
- Actualizar constantes en el script si cambia la ley

---

## 5. Cómo Aplicar a Nuevos Datos

### 5.1 Para Datos del Visualizador PTO (con ponderador incluido)

1. Descargar el Excel actualizado del Visualizador PTO
2. Colocarlo en `scripts/data/`
3. Actualizar la ruta en `migrate-inversion.mjs`
4. Ejecutar el script

### 5.2 Para Datos Crudos (ejecución presupuestaria)

1. **Descargar** el Excel de Datos Abiertos (ejecución acumulada)
2. **Colocar** en `scripts/data/` con nombre descriptivo
3. **Actualizar** la ruta en `load-budget-2025.mjs` (o copiar y modificar)
4. **Ejecutar**: `node scripts/load-budget-2025.mjs`
5. **Verificar** en el dashboard o consultando la DB

**Ponderadores de referencia por área:**

```javascript
const PONDERADORES_DEFAULT = {
  Educación: 1.0, // Gasto puro
  Salud: 0.3, // Gasto mixto
  'Desarrollo Social': 0.308, // Gasto mixto
  'Niñez y Adolescencia': 1.0, // Gasto puro
  Otros: 0.308, // Gasto mixto
};
```

### 5.3 Para Ley de Presupuesto (valores proyectados)

1. **Obtener** la Ley de Presupuesto aprobada
2. **Extraer** los montos por área de inversión social
3. **Actualizar** las constantes en `load-budget-2026-estimate.mjs`:
   - `TOTAL_GASTOS_2026`
   - `INVERSION_SOCIAL_PCT`
   - `AREA_PCT` (porcentajes por área)
4. **Ejecutar**: `node scripts/load-budget-2026-estimate.mjs`
5. **Nota**: Este script elimina datos existentes del año antes de insertar

**Ejemplo de constantes a actualizar:**

```javascript
const TOTAL_GASTOS_2026 = 11_442_000_000_000; // $11.442 billones
const INVERSION_SOCIAL_PCT = 0.347; // 34.7%
const AREA_PCT = {
  Educación: 0.609, // 60.9% de inversión social
  Salud: 0.237, // 23.7%
  'Desarrollo Social': 0.092, // 9.2%
  'Niñez y Adolescencia': 0.031, // 3.1%
  Otros: 0.031, // 3.1%
};
```

---

## 6. Verificación de Datos

### 6.1 Consulta SQL para verificar carga

```sql
-- Resumen por año
SELECT
  periodo as año,
  COUNT(*) as indicadores,
  ROUND(SUM(valor) / 1000000000, 2) as total_miles_millones
FROM indicadores
WHERE categoria = 'inversion'
GROUP BY periodo
ORDER BY periodo;
```

### 6.2 Verificar por área

```sql
-- Desglose por área y año
SELECT
  periodo as año,
  desglose->>'area' as area,
  COUNT(*) as programas,
  ROUND(SUM(valor) / 1000000000, 2) as total_miles_millones
FROM indicadores
WHERE categoria = 'inversion'
GROUP BY periodo, desglose->>'area'
ORDER BY periodo, area;
```

### 6.3 Verificar integridad temporal

```sql
-- Años con datos
SELECT DISTINCT periodo
FROM indicadores
WHERE categoria = 'inversion'
ORDER BY periodo;
```

---

## 7. Fuentes de Datos

| Fuente                   | URL                                | Periodicidad |
| ------------------------ | ---------------------------------- | ------------ |
| Visualizador PTO         | economiaygestionpublica.cba.gov.ar | Anual        |
| Datos Abiertos Ejecución | (descarga manual)                  | Mensual      |
| Ley de Presupuesto       | legislaturacba.gob.ar              | Anual        |
| Censo INDEC              | censo.gob.ar                       | Cada 10 años |
| EPH-INDEC                | indec.gob.ar                       | Trimestral   |

---

## 8. Notas Metodológicas

1. **Los ponderadores no son fijos**: Se actualizan periódicamente con nuevos datos de EPH y registros administrativos

2. **El "Aplica = Si" es clave**: No todos los programas del presupuesto benefician a NNyA. Solo los que tienen la marca "Si" en la columna Aplica son incluidos

3. **La fuente es oficial**: El Visualizador de Presupuesto Transparente es la fuente oficial del Ministerio de Finanzas de Córdoba

4. **Los datos son anuales**: El presupuesto se aprueba por año fiscal. Los datos de ejecución mensual son parciales

5. **Consistencia histórica**: Para mantener la serie temporal comparable, se recomienda usar siempre la misma fuente y metodología

---

## 9. Referencias

- UNICEF España: "Metodología para la medición de la inversión presupuestaria en infancia"
- DNPPE/UNICEF Córdoba: Visualizador de Presupuesto Transparente con Orientación
- Ley 11.088: Presupuesto General de la Administración Pública Provincial para el Año 2026
- Guía Metodológica para la Estimación del Gasto Público en Niñas, Niños y Adolescentes (Perú)

---

**Documento elaborado por**: DDNA Dashboard
**Contacto**: [GitHub Issues](https://github.com/lucasalvador98/ddna-dashboard/issues)
