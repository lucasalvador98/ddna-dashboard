# Metodología de Ponderación Presupuestaria para NNyA

## Proyecto: DDNA Dashboard

**Última actualización**: 25 de junio de 2026
**Fuentes**: DNPPE/UNICEF Córdoba, Datos Abiertos Ejecución Presupuestaria, Visualizador PTO

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

## 3. Fuentes de Datos

### 3.1 Archivos fuente por año

| Período   | Fuente                          | Archivo / Ubicación                                                                                                                                                           | Tipo de dato         |
| --------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 2021-2024 | Visualizador PTO (Excel interno) | `E:\Backup Luca\DDNA\Inversion\Base de datos en valores.xlsx` (sheet: "Base de datos en valores")                                                                            | Ejecutado + ponderado |
| 2025      | Datos Abiertos — Marzo 2025     | `E:\Backup Luca\DDNA\Inversion\Datos Abiertos - Ejecución Presupuestaria Marzo 2025\Gastos Administración Central - Acumulado Marzo 2025.xlsx`                                | Ejecutado crudo      |
| 2026      | Ley de Presupuesto              | Estimación basada en Ley 11.088 (valores inflados)                                                                                                                            | Proyectado            |

> **⚠️ Importante**: El dato 2025 es **acumulado a marzo**, no anual completo. Se actualizará cuando haya datos de más meses.

### 3.2 Fuentes oficiales

| Fuente                   | URL                                | Periodicidad |
| ------------------------ | ---------------------------------- | ------------ |
| Visualizador PTO         | economiaygestionpublica.cba.gov.ar | Anual        |
| Datos Abiertos Ejecución | datosabiertos.cba.gov.ar           | Mensual      |
| Ley de Presupuesto       | legislaturacba.gob.ar              | Anual        |
| Censo INDEC              | censo.gob.ar                       | Cada 10 años |
| EPH-INDEC                | indec.gob.ar                       | Trimestral   |

---

## 4. Proceso de Carga

### 4.1 Cómo ejecutar los scripts

Cada script está en `scripts/` y se ejecuta con Node.js. Requieren `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`.

| Script                             | Años       | Fuente                    | Comando                                                          |
| ---------------------------------- | ---------- | ------------------------- | ---------------------------------------------------------------- |
| `migrate-inversion.mjs`            | 2021-2024  | Visualizador PTO          | `node --max-old-space-size=4096 scripts/migrate-inversion.mjs`   |
| `load-budget-march-2025.mjs`       | 2025       | Datos Abiertos Marzo 2025 | `node scripts/load-budget-march-2025.mjs`                        |
| `load-budget-2026-estimate.mjs`    | 2026       | Ley de Presupuesto        | `node scripts/load-budget-2026-estimate.mjs`                     |

### 4.2 Script Original — Visualizador PTO (2021-2024)

**Ubicación**: `scripts/migrate-inversion.mjs`

Lee el Excel del Visualizador de Presupuesto Transparente que YA incluye el ponderador NNyA calculado por DNPPE/UNICEF. El Excel tiene la siguiente estructura:

| Columna             | Índice | Descripción                          |
| ------------------- | ------ | ------------------------------------ |
| AÑO                 | 0      | Año fiscal                           |
| JURISDICCION        | 3      | Ministerio/entidad                   |
| PROGRAMA            | 5      | Programa presupuestario              |
| Aplica              | 15     | Si/No - Si el programa aplica a NNyA |
| Categoría           | 16     | Categoría del programa               |
| Ponderador          | 21     | Factor de ponderación NNyA           |
| DEVENGADO PONDERADO | 27     | Monto final para NNyA                |

**Requisitos:**
- `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`
- Excel en la ruta configurada en el script

### 4.3 Script Datos Abiertos — Marzo 2025

**Ubicación**: `scripts/load-budget-march-2025.mjs`

Lee el Excel de ejecución presupuestaria cruda (sin ponderador), aplica ponderadores NNyA por defecto según área (clasificación por FUNCION y keywords de niñez), y agrega por programa.

**Ponderadores de referencia por área:**

```javascript
{ Educación: 1.0, Salud: 0.3, 'Desarrollo Social': 0.308, 'Niñez y Adolescencia': 1.0, Otros: 0.308 }
```

**Requisitos:**
- `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`
- Excel fuente en `E:\Backup Luca\DDNA\Inversion\Datos Abiertos - Ejecución Presupuestaria Marzo 2025\`

### 4.4 Script Ley de Presupuesto — 2026 (estimación)

**Ubicación**: `scripts/load-budget-2026-estimate.mjs`

Genera una estimación basada en la Ley de Presupuesto aprobada. Aplica ponderadores por defecto. Inserta ~19 registros.

**Constantes a actualizar si cambia la ley:**

```javascript
const TOTAL_GASTOS_2026 = 11_442_000_000_000; // $11.442 billones
const INVERSION_SOCIAL_PCT = 0.347; // 34.7%
const AREA_PCT = {
  Educación: 0.609, Salud: 0.237, 'Desarrollo Social': 0.092,
  'Niñez y Adolescencia': 0.031, Otros: 0.031,
};
```

**Requisitos:**
- `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`
- Actualizar constantes si cambia la ley

### 4.5 Proceso ETL (general)

```
1. LEER Excel fuente
   ↓
2. CLASIFICAR cada fila por área (según FINALIDAD/FUNCION o keywords de niñez)
   ↓
3. APLICAR ponderador NNyA según área
   ↓
4. AGREGAR por (año, área, programa) sumando DEVENGADO PONDERADO
   ↓
5. ELIMINAR datos existentes del período en Supabase
   ↓
6. INSERTAR nuevas filas en tabla indicadores con categoría 'inversion'
```

### 4.6 Agregar un nuevo año

1. **Obtener** el Excel de la fuente correspondiente
2. **Crear o modificar** un script en `scripts/` basado en los existentes
3. **Actualizar** la ruta del Excel y el período en el script
4. **Ejecutar**: `node scripts/load-budget-NUEVO.mjs`
5. **Verificar** con consultas SQL (ver sección 6)

---

## 5. Datos en el Dashboard

### 5.1 Estructura en Supabase

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

### 5.2 Datos Actuales (2025)

| Área                 | Programas | Ponderador Promedio | Total Ponderado        | Total Crudo          |
| -------------------- | --------- | ------------------- | ---------------------- | -------------------- |
| Educación            | 33        | 100%                | $378.84 mil millones   | $378.84 mil millones |
| Otros                | 167       | 30.8%               | $316.38 mil millones   | $1.03 billones       |
| Niñez y Adolescencia | 8         | 100%                | $134.06 mil millones   | $134.06 mil millones |
| Salud                | 27        | 30.0%               | $64.61 mil millones    | $215.36 mil millones |
| Desarrollo Social    | 37        | 30.8%               | $15.32 mil millones    | $49.75 mil millones  |
| **TOTAL**            | **272**   | -                   | **$909.20 mil millones** | **$1.81 billones**   |

> Los totales 2021-2024 son anuales completos (fuente Visualizador PTO). El dato 2025 es acumulado a marzo (fuente Datos Abiertos).

### 5.3 Evolución Histórica

| Año  | Total Ponderado      | Total Crudo      | % Ponderado | Fuente                    | Nota                         |
| ---- | -------------------- | ---------------- | ----------- | ------------------------- | ---------------------------- |
| 2021 | $157 mil millones    | —                | —           | Visualizador PTO          | Anual completo               |
| 2022 | $282 mil millones    | —                | —           | Visualizador PTO          | Anual completo               |
| 2023 | $739 mil millones    | —                | —           | Visualizador PTO          | Anual completo               |
| 2024 | $1.053 billones      | $1.568 billones  | 67.1%       | Visualizador PTO          | Anual completo               |
| 2025 | $909.20 mil millones | $1.81 billones   | 50.4%       | Datos Abiertos Marzo 2025 | ⚠️ Acumulado a marzo         |
| 2026 | —                    | —                | —           | Ley de Presupuesto        | Estimación (pendiente carga) |

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

## 7. Notas Metodológicas

1. **Los ponderadores no son fijos**: Se actualizan periódicamente con nuevos datos de EPH y registros administrativos

2. **El "Aplica = Si" es clave**: No todos los programas del presupuesto benefician a NNyA. Solo los que tienen la marca "Si" en la columna Aplica son incluidos

3. **La fuente es oficial**: El Visualizador de Presupuesto Transparente y Datos Abiertos son fuentes oficiales del gobierno de Córdoba

4. **Los datos de ejecución mensual son parciales**: El dato 2025 refleja solo el acumulado a marzo. No es comparable directamente con años completos.

5. **Consistencia histórica**: Para mantener la serie temporal comparable, se recomienda usar siempre la misma fuente y metodología para cada tipo de dato

---

## 8. Referencias

- UNICEF España: "Metodología para la medición de la inversión presupuestaria en infancia"
- DNPPE/UNICEF Córdoba: Visualizador de Presupuesto Transparente con Orientación
- Ley 11.088: Presupuesto General de la Administración Pública Provincial para el Año 2026
- Guía Metodológica para la Estimación del Gasto Público en Niñas, Niños y Adolescentes (Perú)

---

**Documento elaborado por**: DDNA Dashboard
**Contacto**: [GitHub Issues](https://github.com/lucasalvador98/ddna-dashboard/issues)
