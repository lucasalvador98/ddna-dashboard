# Fuentes de Datos — DDNA Dashboard

> **Última actualización**: 15 de Abril 2026

Este documento lista todas las fuentes de datos utilizadas por el tablero de monitoreo de la DDNA.

---

##Leyenda

- **tipo**: `api` = automático via HTTP, `manual` = carga vía admin
- **frecuencia**: frecuencia de actualización esperada
- **ultima_actualizacion**: fecha de último loads a Supabase (auto-generado por auditoría)
- **estado**: ✅ = datos en Supabase, ⏳ = pendiente, ❌ = no disponible

---

## 1. SALUD

| fuente | tipo | archivo | frecuencia | ultima_actualizacion | estado |
|--------|------|---------|----------|-------------|---------------------|-------|
| Mortalidad infantil (DEIS) | manual | deis/Mortalidad infantil Nacion-Provincia.xlsx | anual | 2026-04-15 | ✅ |
| Cobertura vacunal (DEIS) | manual | deis/datosDeis-2024-07-26 (3).xlsx | anual | - | ⏳ |
| Nacimientos por edad madre | manual | deis/Edad_Madre 2022.xlsx | anual | - | ⏳ |
| Cobertura salud (Censo) | manual | censo-2022/Cobertura_Salud-Censo.xlsx | ad-hoc | - | ⏳ |

---

## 2. EDUCACIÓN

| fuente | tipo | archivo | frecuencia | ultima_actualizacion | estado |
|--------|------|---------|----------|-------------|---------------------|-------|
| Escolarización por nivel | manual | censo-2022/Educacion por nivel.xlsx | ad-hoc | - | ⏳ |
| Escolarización por edad | manual | censo-2022/Educacion por edades.xlsx | ad-hoc | - | ⏳ |
| Resultados Aprender | manual | aprender/Educacion Provincia.xlsx | anual | - | ⏳ |

---

## 3. POBREZA

| fuente | tipo | archivo | frecuencia | ultima_actualizacion | estado |
|--------|------|---------|----------|-------------|---------------------|-------|
| Pobreza e indigencia (INDEC) | manual | pobreza/cuadros_informe_pobreza_09_24 (1).xls | semestral | - | ⏳ |
| Encuesta consumo (ENCOPRAC) | manual | pobreza/cuadros_encoprac_2022.xlsx | anual | - | ⏳ |
| Consumo jóvenes (ENCOPRAC) | manual | pobreza/Encoprac 16 a 24 años.xlsx | anual | - | ⏳ |

---

## 4. SEGURIDAD

| fuente | tipo | archivo | frecuencia | ultima_actualizacion | estado |
|--------|------|---------|----------|-------------|---------------------|-------|
| Denuncias/Delitos (MP Córdoba) | manual | justicia/Justicia_cba_2022.xlsx | anual | - | ⏳ |
| Violencia doméstica (PDF) | manual | justicia/INFORME SEGUNDO TRIMESTRE 2024 oficina de violencia domestica!!.pdf | trimestral | - | ❌ |

---

## 5. DEMOGRAFÍA

| fuente | tipo | archivo | frecuencia | ultima_actualizacion | estado |
|--------|------|---------|----------|-------------|---------------------|-------|
| Población censal (CNPV 2022) | manual | censo-2022/censo poblacion.xlsx | ad-hoc | - | ⏳ |

---

## 6. INVERSIÓN

| fuente | tipo | archivo | frecuencia | ultima_actualizacion | estado |
|--------|------|---------|----------|-------------|---------------------|-------|
| Presupuesto infancia | - | - | anual | - | ❌ |

*(No hay archivos disponibles aún — requiere input manual)*

---

## Fuentes NO procesables (PDF)

Los siguientes archivos están en formato PDF y no pueden procesarse automáticamente:

- `aprender/Estadisticas-educativas-Anuario-2023.pdf`
- `consumo/consumo_2022.pdf`
- `justicia/INFORME SEGUNDO TRIMESTRE 2024...pdf`

Para estos, la transferencia debe hacerse manualmente.

---

## Formato para cargas manuales

Los archivos subidos vía admin deben seguir este formato:

### CSV
```csv
periodo,region,valor,desglose
2024,Córdoba,12.5,{}
```

### Excel
Debe tener columnas: `periodo`, `region`, `valor`. La columna `desglose` es opcional (JSON).

---

## Próximos pasos

- [ ] Configurar pipeline automático para DEIS API (salud)
- [ ] Completar cargas pendientes de 2024
- [ ] Agregar fuente de presupuesto de inversión