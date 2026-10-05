/**
 * Constantes del Censo 2022 compartidas entre el Server Component de /poblacion
 * y su Client Component.
 *
 * IMPORTANTE: esto vive en un módulo normal (no en un archivo `'use client'`)
 * a propósito. Un valor exportado desde un módulo `'use client'` y importado por
 * un Server Component llega como referencia de cliente (no como el valor real),
 * así que la comparación `region === PROVINCIA_CENSO` siempre daría false y el
 * agregado provincial se contaría como si fuera un departamento más.
 */

/** Región del agregado provincial en la tabla (distinto de los departamentos). */
export const PROVINCIA_CENSO = 'Córdoba';

/** Categoría de `indicadores` donde se cargó el censo. */
export const CATEGORIA_CENSO = 'demografia';

/** Fuente exacta: hay que filtrar por esto porque la categoría `demografia`
 *  ya tenía filas viejas de otra fuente. */
export const FUENTE_CENSO = 'Censo 2022 — INDEC';

/** Período (año del censo). */
export const PERIODO_CENSO = 2022;
