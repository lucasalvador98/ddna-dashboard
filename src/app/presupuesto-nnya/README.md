# Presupuesto NNyA Interactivo

## Descripción

Página interactiva que muestra la inversión provincial en infancia y adolescencia aplicando la metodología de ponderación DNPPE/UNICEF.

## Características

- **Vista por Área**: Distribución del presupuesto por sector (Educación, Salud, Desarrollo Social, etc.)
- **Vista por Programa**: Top 15 programas con mayor inversión NNyA
- **Vista Comparativa**: Evolución temporal del presupuesto ponderado
- **Filtros Interactivos**: Filtrar por área y período
- **Panel de Metodología**: Explicación de cómo se calculan los ponderadores

## Metodología

El presupuesto se presenta como **DEVENGADO PONDERADO**, que es el monto real del gasto multiplicado por un factor que representa el porcentaje que beneficia a NNyA:

```
Devengado Ponderado = Devengado Crudo × Ponderador NNyA
```

### Categorías de gasto

| Categoría         | Ponderador | Ejemplos                              |
| ----------------- | ---------- | ------------------------------------- |
| A (Gasto puro)    | 100%       | Educación primaria, jardines infantes |
| C (Gasto mixto)   | 30-40%     | Salud, transferencias sociales        |
| D (Gasto general) | 30.8%      | Infraestructura, administración       |

## Fuentes de datos

- **Visualizador de Presupuesto Transparente** (DNPPE/UNICEF Córdoba)
- **Datos Abiertos de Ejecución Presupuestaria** (Provincia de Córdoba)
- **Ley de Presupuesto Anual** (Legislatura de Córdoba)

## Pipeline de datos

### Para datos del Visualizador PTO (con ponderador incluido)

```bash
node scripts/migrate-inversion.mjs
```

### Para datos crudos de ejecución presupuestaria

```bash
node scripts/load-budget-2025.mjs
```

## Archivos

- `page.tsx` - Componente principal de la página
- `README.md` - Esta documentación

## Componentes utilizados

- `SectionHeader` - Encabezado de sección
- `KpiCard` - Tarjetas de KPI
- `ChartWithTable` - Gráficos con tabla de datos
- Recharts - Librería de gráficos

## Notas

- Los datos se cargan desde la tabla `indicadores` de Supabase
- Categoría: `inversion`
- Fuente: `Ministerio de Finanzas Córdoba`
- La página es responsive y funciona en móvil y desktop
