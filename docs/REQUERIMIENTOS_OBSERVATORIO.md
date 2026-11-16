# Requerimientos — Observatorio DDNA

Documento vivo. Reúne los pedidos del usuario para el tablero, con la evidencia
que respalda cada uno y el criterio con el que se da por cerrado.

**Formato de cada requerimiento**

| Campo | Contenido |
|---|---|
| `Pedido` | Lo que pidió el usuario, sin reinterpretar |
| `Evidencia` | Dato medido, con archivo:línea o medición en navegador |
| `Causa` | Por qué pasa (cuando se conoce) |
| `Tiene que` | Comportamiento esperado, observable |
| `Se verifica` | Cómo se comprueba que está hecho |
| `Fuera` | Lo que explícitamente NO incluye |

Un requerimiento no se marca cerrado hasta observar su verificación. Este
documento dice **qué**; el cómo se implementa vive en `odd/tasks/<feature>.md`.

---

## Estado al 2026-10-14

| Req | Estado | Verificación observada |
|---|---|---|
| R1 sidebar | **implementado y verificado** | Antes: `mainClientHeight == scrollHeight` (10749px) y el documento scrolleaba, aside de 10749px. Después: `mainScrollHeight (10749) > clientHeight (597)`, aside 597px dentro de pantalla, `window.scrollY` en 0, 10/10 links de nav visibles, header fijo. Medido en dev y contrastado con producción. |
| R2 pobreza | **implementado y verificado** | `pastillasEjeVisibles: false` en `/pobreza`; las pestañas reales (`Ingresos (INDEC)`, `Multidimensional (UCA)`) intactas; `grep FilterBar` en `src/` vacío; componente borrado. |
| R3 seguridad | **implementado y verificado** | La tasa quedó en su propio chart: su línea ocupa el 59% del alto del gráfico (188px de 320) — antes era plana en cero. Volúmenes en chart aparte con 3 series. `connectNulls` eliminado. |
| R4 RAG | **trabajo definido, sin implementar** | Definido el 2026-10-14: *híbrido con prioridad clara* (indicadores → documentos → web, siempre citando fuente). Conjunto dorado en `scripts/audit-rag-goldenset.mjs`: indicadores **5/5** con valores reales. La medición documental quedó **invalidada** por un defecto del script (join mal formado), no por el agente. Los arreglos de código —recorte de 800 chars, 4 rondas de tools, unidades mezcladas, nombres inconsistentes— **no están hechos**. |

Pendiente de commit (no commiteado: el usuario no lo pidió). Cambios en el
working tree: `src/components/app-shell.tsx`, `src/app/pobreza/page.tsx`,
`src/app/seguridad/page.tsx`, `src/app/seguridad/seguridad-charts.tsx`,
`src/app/seguridad/page.test.tsx`, borrado de `src/components/filter-bar.tsx`.

---

## R1 — Sidebar fija al navegar

**Pedido**: "que la sidebar quede fija mientras se navega"

**Evidencia** — medido en producción (`https://ddna.com.ar/observatorio/salud`,
viewport 1536px, 2026-10-14):

```
mainOverflowY:        auto
mainScrollHeight:     10749
mainClientHeight:     10749   ← igual: main NO puede scrollear
bodyOverflowY:        visible ← el documento scrollea
asideHeight:          10749.3px  ← la sidebar se estira a todo el contenido
```

**Causa**: `src/app/layout.tsx` pone `body` con `min-h-screen flex flex-col` y
`src/components/app-shell.tsx` arma la fila con `flex flex-1 min-h-0`. Como
`min-height` no es una altura fija, la fila crece con el contenido: `main`
nunca se recorta, no se convierte en scroller, y termina scrolleando el
`<body>` con la sidebar de 10.749px dentro.

**Tiene que**: al bajar por una pantalla larga, la sidebar sigue visible; el
único scroller es el área de contenido. El header puede quedar fijo o
desplazarse, decisión de implementación.

**Se verifica** (en navegador, después del cambio):
1. `window.scrollTo(0, 800)` en `/salud`.
2. `window.scrollY` sigue en `0` (el documento no scrollea).
3. El `<aside>` conserva `getBoundingClientRect().top` igual al inicial.
4. `#main-content` pasa a tener `scrollHeight > clientHeight`.

**Fuera**: rediseño de la sidebar, el menú mobile, el colapsado, agrupar
secciones nuevas.

---

## R2 — Sacar los botones superiores de Pobreza

**Pedido**: "Se quieten los botones superiores en el apartado de pobreza"

**Evidencia**: `src/app/pobreza/page.tsx:394` renderiza `<FilterBar />`
(pastillas *Todos los ejes / Pobreza / Salud / …*). Dos hechos medidos:

1. `grep -rn "eje=" src/` → **cerco resultados**: ningún `Link` construye
   `?eje=`, ninguna otra pantalla lee el parámetro.
2. El único lector de `eje` es `src/components/filter-bar.tsx:19`, o sea el
   componente se lee a sí mismo.

O sea: las pastillas reescriben la URL y **no filtran nada**. La pantalla
además tiene sus propias pestañas reales (`src/app/pobreza/pobreza-charts.tsx:123`,
`useState<TabId>`), que sí cambian el contenido y se quedan.

**Tiene que**: en `/pobreza` no hay pastilla de ejes arriba. Quedan las
pestañas de contenido (Ingresos / Multidimensional / …). El componente
`src/components/filter-bar.tsx` queda sin uso → se borra junto con el cambio.

**Se verifica**: `/pobreza` no muestra la barra de ejes; las pestañas siguen
cambiando de sección; `npm run build` y los tests de `/pobreza` pasan; grep de
`FilterBar` en `src/` devuelve vacío.

**Fuera**: tocar las pestañas de contenido, ni el `FilterBar` de otras
pantallas (no existe: solo lo usaba pobreza).

---

## R3 — Revisar el gráfico de Evolución de Delitos (Seguridad)

**Pedido**: "Revisar el grafico de evolucion de delitos en Seguridad"

**Evidencia** — lectura de `src/app/seguridad/page.tsx:106-121` +
`seguridad-charts.tsx:124-175`, y magnitudes reales de la base
(`scripts/audit-seguridad.mjs`, 129 filas en `categoria=seguridad`):

| Serie | mín | máx | unidad | periodo |
|---|---|---|---|---|
| Robos y tentativa de robo | 42.771 | 67.288 | hechos | 2000–2021 |
| Contravenciones | 0 | 21.471 | casos | 1999–2023 |
| Tentativas de hurto | 0 | 1.295 | hechos | 1999–2024 |
| Tasa de tentativas de hurto | 0 | 41,67 | tasa x100K | 1999–2024 |

**Causa**: las cuatro series se dibujan en un mismo `LineChart` con un solo
`YAxis domain={[0, 'auto']}`. El eje sube hasta 67.288, así que la **tasa**
(máx. 41,67) queda una línea plana pegada al cero: es ilegible. Entre las
series absolutas hay 52x de diferencia (1.295 vs 67.288), así que "Tentativas
de hurto" también queda achatada. Segundo defecto: cada serie termina en un
año distinto y el chart usa `connectNulls`, que tiende una línea continua
sobre huecos donde no hay dato.

**Tiene que**: cada serie se lee. La tasa (la única normalizada por
población, y por eso la que permite comparar entre años) va en su propio
gráfico. Los huecos de una serie no se rellenan con línea. Queda una nota en
pantalla que diga qué es cada unidad.

**Se verifica**: en `/seguridad`, la línea de la tasa tiene pendiente visible
(no plana en cero); el rango del eje de cada gráfico es coherente con su
unidad; donde una serie no tiene dato, no hay segmento dibujado; el test de
`seguridad/page.test.tsx` sigue en verde.

**Fuera**: cambiar los datos cargados, corregir el atraso de "Contravenciones"
(termina en 2023) y "Robos" (2021) — eso es carga de fuente, no el gráfico.
Queda anotado como deuda.

---

## R4 — El agente RAG: encontrarle la vuelta

**Pedido**: "el agente RAG esta bastante desorientado en la informacion que
trae, siento que no le podemos encontrar la vuelta para la utilidad del mismo"

**Evidencia** — `src/app/api/repositorio/chat/route.ts`:

- Presupuesto de trabajo: `MAX_TOOL_ROUNDS = 4`, `MAX_TOOL_CALLS = 8`,
  `MAX_TOKENS = 2000`, `MAX_CONTEXT_CHARS = 20000`.
- El `SYSTEM_PROMPT` impone un workflow obligatorio de 6 pasos que **empieza
  siempre** con `listAvailableIndicators()` → `getCategoryOverview()` →
  `getLatestIndicatorValue()`/`getIndicatorTimeSeries()`, y recién después
  busca en documentos (`search_knowledge_base`) y al final en la web.
- 9 herramientas en total (5 de indicadores, 2 de documentos, 2 de web).

**Causa — CONFIRMADA con mediciones** (`scripts/audit-rag.mjs`, 2026-10-14):

1. **El 100% de los fragmentos llegan recortados.** Hay 13.654 fragmentos
   indexados de 13 archivos, todos de ~2.000 caracteres (p50 = 2.000). Pero
   `buildContext()` los corta a **800 caracteres** antes de pasarlos al modelo:
   **13.646 de 13.654 (100%)**. El agente lee frases cortadas a mitad. Se pagó
   por indexar 2.000 caracteres y se descarta el 60% de cada uno.
2. **Lee una fracción mínima de cada documento.** 13 archivos → 13.654
   fragmentos = ~1.050 por documento. La búsqueda devuelve 20
   (`match_threshold: 0.5`, `match_count: 30`, híbrido vector 0,6 / texto 0,4):
   el agente ve ~1,9% de un informe y tiene que explicarlo.
3. El preámbulo obligatorio de indicadores se come 3 de las 4 rondas de tools
   antes de tocar un documento.
4. Hereda el defecto de R3: puede devolver "tentativas de hurto: 41,67" como si
   fueran hechos, porque la base mezcla unidades en la misma categoría.
5. `ai_usage_logs` **no guarda la pregunta** — solo tokens y costo. No hay
   historial de consultas reales, así que no se puede ni reconstruir casos.

**Dónde el material SÍ es sólido**: 38.614 filas de indicadores en 15
categorías (pobreza 16.071, salud 13.002, demografia 3.375…). Datos
estructurados con valor, periodo, región y fuente. Ahí el agente puede ser
bueno.

**Causa raíz — CORREGIDA el 2026-10-14** (`scripts/audit-rag-goldenset.mjs`,
conteo paginado y desindexado):

Mi primera lectura fue "dos planillas secuestran el índice". Era incompleta y
en parte falsa. Lo que quedó firme:

1. **El xlsx de Medios se desindexó.** Sus 3.647 fragmentos (26,7%) eran la
   vieja base de monitoreo de medios y no servían para el agente. Quedan
   10.007 fragmentos. Ejecutado con
   `node scripts/desindexar-archivo.mjs "Medios Base de datos" --apply`.
2. **El de ANDRES se queda**: es análisis de presupuesto, 430.631 palabras
   reales. No es basura — es el único contenido con texto aprovechable.
3. **La causa real es contenido corrupto, no volumen.** `ConsumosAdolescentes`
   son bytes del PDF sin descomprimir (`0 0 0 0 ... /Subtype /Type1 /Name /F8`):
   cero palabras reales. `Analisis-situacional` tiene 34 de 815 chunks igual de
   crudos. Mi heurística de detección (marcadores `%PDF-`/`FlateDecode` al
   inicio) subestimó el daño: reportó 3% cuando el archivo está roto entero.
4. El `p50` de 2.000 chars en todos los archivos no significa nada: así se
   trozaron, pero trocear basura sigue dando basura.

**Conclusión**: el agente no está "desorientado" — **lee un índice donde parte
del contenido no es texto**. Antes de tocar el prompt hay que reindexar los
PDF desde los originales.

**Qué NO está medido**: el camino vectorial (RPC `search_doc_chunks` con
embedding, que sí rankea por similitud). Solo se midió la mitad FTS.

**El bloqueo real**: no existe ningún conjunto de preguntas con respuesta
esperada, así que "desorientado" no se puede medir ni demostrar arreglado.
Cualquier cambio al prompt o al presupuesto sería a ciegas.

**Tiene que** — en este orden, y sin saltear el primero:
1. **Definir el trabajo del agente** en una frase verificable. Mientras no
   esté definido, no se toca el prompt.
2. Un **conjunto dorado**: 15–25 preguntas reales de la DDNA, cada una con la
   respuesta correcta esperada y la fuente de donde sale.
3. Medir el estado actual contra ese conjunto (cuántas acierta, en qué falla:
   herramienta equivocada / no encuentra / inventa / trunca).
4. Recién ahí, los arreglos de código — que pasan a ser verificables contra
   el conjunto.

**Se verifica**: el conjunto dorado existe versionado; hay una medición
antes/después por pregunta; ninguna respuesta del agente citada como dato
aparece sin fuente.

**Fuera**: cambiar de modelo, agregar embeddings nuevos, tocar el ETL.

---

## Orden sugerido y riesgos

| Orden | Requerimiento | Riesgo | Por qué en ese lugar |
|---|---|---|---|
| 1 | R1 sidebar | bajo | Verificado en producción, cambio de layout acotado |
| 2 | R2 pobreza | bajo | Control muerto comprobado, borrado neto |
| 3 | R3 seguridad | medio | Toca datos que se muestran; mezcla de unidades |
| 4 | R4 RAG | alto | Necesita decisión de producto antes de código |

**Riesgo cruzado**: R3 y R4 comparten raíz — la base mezcla unidades dentro de
una misma categoría. Si se arregla el gráfico separando la tasa, el agente
sigue expuesto al mismo problema hasta que la respuesta del agente deje de
tratar los indicadores como comparables entre sí.
