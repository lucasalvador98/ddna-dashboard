# Auditoría Crítica — ¿Qué estamos mostrando y qué falta para no ser oficialistas?

> Fecha: 2026-09-07 — Revisión con mirada de ciencias sociales
> Objetivo: Para cada pantalla, responder: ¿con lo que hay hoy puedo entender la situación o solo veo gráficos oficialistas?

## Resumen ejecutivo
- **Pobreza:** Es la única con **duelo dialéctico** (INDEC vs UCA). Permite crítica. Bien.
- **Salud, Educación, Seguridad, Inversión:** Solo dato oficial (DEIS, Anuario, Presupuesto). Sin contrapeso. Riesgo de ser oficialista si se muestra sin contexto.
- **Demografía, Consumo, DEIS, Salud adolescente:** Datos viejos (2022) y poco volumen. No alcanzan para diagnosticar 2026.
- **Todas las pantallas:** Mucha tarjeta suelta, sin hilo que las interrelacione. El usuario no ve el cruce.

## Por pantalla

### Pobreza (P0) — Bien, pero con hilo flojo
- **Qué hay:** INDEC (pobreza/indigencia 2016-2024) + UCA (multidimensional 2004-2024). Última carga 2024, stale 81d.
- **¿Oficialista?** No, porque el duelo INDEC vs UCA desenmascara. Es el modelo a replicar.
- **Qué falta:** El hilo hoy son dos pestañas separadas (`Ingresos` vs `Multidimensional`) que no se hablan. Propuesta: **duelo en la misma línea de tiempo** (dos líneas, mismo X) y una fila por indicador con `Ver el juego →` (piloto ya en `pobreza/pobreza-pilot.tsx`).
- **Recomendación:** Mantener todo, pero ordenar como **dato → click → gráfico** y no como pared de 8 gráficos.

### Salud (P1) — Oficialista si va solo
- **Qué hay:** DEIS (mortalidad infantil, 244 rows, última 2024) + vacunación. Última carga 2026-06-12 (stale).
- **¿Oficialista?** Sí, si se muestra solo DEIS. No hay barómetro independiente para salud en Córdoba.
- **¿Con qué se cruza?** Con `pobreza` (UCA) e `inversión` (presupuesto salud). Un pibe con mala salud + hacinamiento + sin obra social es el mismo perfil que pobreza multidimensional.
- **Recomendación:** Mostrar DEIS tal cual, pero con banner crítico: “Dato oficial 2024. Para lectura crítica, cruzá con `Pobreza` y `Inversión`”. No ocultar, pero sincerar el vacío.

### Educación (P1) — El más flojo para diagnosticar
- **Qué hay:** Anuario 2024, Aprender, Tasa neta, Abandono. Última carga 2024 pero **stale 136d** (28/04), sin 2025. 1055 rows pero sin contexto.
- **¿Oficialista?** Sí, 100% Ministerio/Anuario. No hay UCA para educación.
- **¿Alcanza para decir cómo está la educación?** No. Ves escolarización y abandono, pero no ves **condiciones** (hacinamiento, trabajo infantil, conectividad) que están en `pobreza`.
- **Recomendación:** Mantener, pero fusionar en una **fila por indicador con desglose** y link cruzado: “Ver este dato a la luz de `Pobreza` y `Salud`”. Y programar ETL mensual para no quedar en 2022.

### Inversión, Seguridad, Empleo, Canastas (P0-P1)
- **Inversión:** 725 rows, 2025, stale 89d. Bien, pero con ponderadores DNPPE/UNICEF que hay que auditar (ver `METODOLOGIA_AUDIT.md`). No es oficialista si se muestra la metodología.
- **Seguridad, Empleo, Canastas:** Similar a salud/educación — dato oficial (INDEC/EPH) sin contrapeso, pero se puede cruzar con `pobreza`.

### Demografía, Consumo, DEIS, Salud adolescente (P2 — poco volumen)
- **Qué hay:** 361, 3, 36, 32 rows respectivamente, último 2022, desactualizadas 132d. No alcanzan para 2026.
- **Recomendación:** Ocultar o fusionar en un “Histórico” colapsado, no como tarjetas principales. O reactivar ETL si hay fuente.

## Principio general (para no ser oficialistas sin inventar datos)
> **No ocultar el dato oficial, pero nunca mostrarlo solo.** Cada pantalla con dato oficial lleva un `Contexto crítico` chiquito: “Dato oficial 2024 (fuente). Para una lectura no estática, cruzar con X e Y. Ver metodología.” Y el técnico tiene el `Descargar CSV crudo` para hacer su propio cruce y “darle luz a la oscuridad”.

## Próximo paso
- Taller de 45 min para priorizar: ¿qué 5 tarjetas de `educación` y `salud` te hacen más ruido? Definimos qué va junto, qué se fusiona y qué se oculta, y lo reflejamos en el piloto `dato → click → gráfico`.
