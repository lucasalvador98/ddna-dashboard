# Guía de integración — Sub-pestaña "Pruebas PISA 2025" (Educación)

> **Estado**: datos YA cargados en la base (104 filas, verificado) y **pestaña PISA implementada y cableada** (`src/app/educacion/educacion-charts.tsx` renderiza `<PisaTab>`; la página consulta `%PISA%`).
> **Objetivo de esta guía**: que puedas construir la sub-pestaña sin volver a investigar nada.

---

## 1. Dónde están los datos (ya en la DB, no hay que cargar nada)

- **Tabla**: `indicadores`
- **Filtro exacto** (esto es lo que devuelve los 104 registros):
  ```
  categoria = 'educacion'
  periodo  = 2025
  fuente   LIKE '%PISA%'
  ```
- **Regiones disponibles** (3, para contrastar):
  | region | filas | qué es |
  |---|---|---|
  | `Nacional` | 52 | Argentina país |
  | `Córdoba` | 14 | Córdoba (Región Adjudicada, muestra propia) |
  | `OCDE promedio` | 38 | Promedio de la OCDE (contraste internacional) |

> Las filas de `Córdoba` llevan `fuente = 'OECD / PISA 2025 + Córdoba (Región Adjudicada)'`.
> Filtrá por `region`, no por la `fuente`, para el contraste.

### Cómo consultar (ejemplo con el cliente del proyecto)
```ts
const { data } = await supabase
  .from('indicadores')
  .select('indicador_nombre, valor, unidad, region, periodo, fuente')
  .eq('categoria', 'educacion')
  .eq('periodo', 2025)
  .like('fuente', '%PISA%');
// -> agrupar por indicador_nombre, y por region para el contraste
```

---

## 2. Los 4 puntajes promedio (el dato estrella) — por región

Unidades: **puntos** (escala PISA centrada en 500; el rango observado va de 0 a ~1000). Son las filas `... - Puntaje promedio`.

| Indicador | Córdoba | Nacional | OCDE |
|---|---:|---:|---|
| `PISA 2025 Ciencia - Puntaje promedio` | **434** | 393 | (no en dataset) |
| `PISA 2025 Lectura - Puntaje promedio` | **417** | 389 | — |
| `PISA 2025 Matemática - Puntaje promedio` | **393** | 367 | — |
| `PISA 2025 ... Digital - Puntaje promedio` | **441** | 403 | — |

> **No hay puntaje promedio OCDE** en el dataset (el country note solo da el % de proficientes para OCDE, y los promedios en la Figura 3 que no son texto). Si querés el promedio OCDE de puntajes, hay que sacarlo de la Figura 3 o del SDMX — no está cargado.

### Diferencia vs. nacional (ya calculada y en la DB)
Filas `... - Diferencia vs. nacional (puntos)`, region `Córdoba`:
Ciencia **+41**, Lectura **+28**, Matemática **+26**, Digital **+38**.
→ **Córdoba supera al nacional en las 4 áreas.** Buen titular para la Defensoría.

---

## 3. Proficiency (% con Nivel 2 o más) — por región

Unidades: **%**. Indicadores tipo `... - Nivel 2+ (%)`.

| Indicador | Córdoba | Nacional | OCDE promedio |
|---|---:|---:|---:|
| Ciencia | **59%** | 41% | 74% |
| Lectura | **54%** | 40% | 69% |
| Matemática | **36%** | 24% | 65% |
| Digital | **56%** | (no) | (no) |
| Ciencia ambiental | — | 43% | 74% |

---

## 4. Contexto (Argentina Nacional, valor duro) — lo más útil para el tablero

Estos son indicadores de **contexto** (solo `Nacional`, no por área) que dan color al móduloEducación:

**Participación**: estudiantes evaluados (11.093), escuelas (412), cobertura de 15 años (87%).
**Brecha socioeconómica (ciencia)**: puntaje 2º cuartil (379), brecha avanzados-vs-desventajados (82 vs 85 OCDE), resiliencia (14% de los más pobres en el cuarto superior).
**Actitudes**: mentalidad de crecimiento (59% vs 69 OCDE), curiosidad (59%), "escuela es pérdida de tiempo" (18% vs 24, **mejoró** 6.2 pp desde 2022).
**Ausentismo**: faltó un día (20%), faltó clase (20%), **llega tarde (66% vs 50 OCDE)**.
**Convivencia**: víctimas de bullying (20%), ciberbullying (4% → 46 puntos menos en ciencia).
**Digital**: distraídos por dispositivos (55% vs 28 OCDE), uso de IA chatbots (52%).

> Estos son los que más interestingly separsers para un tablero de Defensoría: absentismo, bullying, brechas socioeconómicas.

---

## 5. Metadata (columna `desglose`)

Cada fila trae `desglose = { ciclo, seccion, clave }` para agrupar programáticamente. Ej.:
`{ ciclo: 'PISA 2025', seccion: 'niveles_proficiencia_pct', clave: 'ciencia_nivel2_mas' }`.

---

## 6. Qué NO está cargado (para que no lo busques)

- **Promedios OCDE en puntos** (solo hay el % proficientes OCDE). Requiere Figura 3 / SDMX.
- **CABA y Mendoza** (las otras dos Regiones Adjudicadas) — no hay datos públicos desagregados, solo Córdoba se reporta con números completos.
- **Nivel municipal / localidad** — no existe; PISA no llega a ese granularidad. Lo más fino es la región adjudicada = provincia.
- **Comparativos PISA 2018/2022** (omitidos a propósito: son de otro período, no 2025).

---

## 6.b Aclaración metodológica: Región Adjudicada

> Texto que se muestra en el tablero, sección "Cómo leer estos resultados".

Las Pruebas PISA 2025 **no cuentan con un desglose oficial de puntajes para todas las
provincias**: la evaluación internacional mide al país en su conjunto. Solo tres
jurisdicciones ampliaron su muestra de manera voluntaria para obtener resultados
representativos propios: **Ciudad de Buenos Aires (CABA), Córdoba y Mendoza**.

Córdoba participó como **Región Adjudicada**: la OCDE evalúa y reconoce formalmente esa
muestra como un sistema educativo participante propio, sujeto a sus estándares de calidad,
de modo que sus resultados son comparables internacionalmente por sí mismos.

**Por qué la comparación no es estrictamente equivalente (manzana con manzana):**

- El resultado **nacional** surge de una **muestra representativa de todo el país**.
- El resultado de **Córdoba** surge de una **muestra provincial propia**.
- Por lo tanto, **parte de la diferencia observada puede reflejar esa diferencia de
  metodología y de composición de la muestra**, además de diferencias reales de desempeño.

Esto es clave para interpretar la disparidad entre Córdoba y el promedio nacional: no es una
comparación entre dos mediciones idénticas, sino entre una muestra provincial adjudicada y una
muestra nacional.

## 7. Reconstruir / recargar (si hiciera falta)

```bash
# el dataset es la fuente de verdad:
scripts/data/pisa-2025-argentina.json   (provenance en _meta)

# ETL (idempotente, dry-run por defecto):
node scripts/load-pisa-2025.mjs            # dry-run
node scripts/load-pisa-2025.mjs --apply    # escribe
```

> **Ojo (bug ya corregido, documentado)**: la idempotencia depende del pre-check del script. La tabla `indicadores` no tiene índice único sobre la clave natural, así que si alguien borra el pre-check y re-corre, duplica. Para blindarlo de raíz hace falta una migración con `UNIQUE (indicador_nombre, periodo, region, fuente)`.

---

## 8. Fuentes / provenance (para citar en la UI)

- **Country note (OECD)**: Argentina PISA 2025, Volume I, DOI `10.1787/e2019444-en`, release 8 sept 2026. `fuente` en DB = `OECD / PISA 2025`.
- **Desglose por jurisdicción (Córdoba)**: reporte oficial argentino, difundido a través de notas de prensa (ElDoce 2026-09-09, Infobae 2026-09-08). `fuente` en DB = `+ Córdoba (Región Adjudicada)`.

---

*Generado 2026-09-28. Datos cargados y verificados; pestaña PISA implementada y cableada.*
