# Canastas Básicas INDEC - Guía de Conexión y Cálculo

> **Para otros proyectos**: Guía completa para obtener datos de canastas básicas del INDEC y calcular costo por hogar usando adultos equivalentes.

---

## 1. API de Series de Tiempo (datos.gob.ar)

### Base URL

```
https://apis.datos.gob.ar/series/api/series/
```

### IDs de las Series

| Serie                            | ID                        | Descripción                           |
| -------------------------------- | ------------------------- | ------------------------------------- |
| CBA (Canasta Básica Alimentaria) | `150.1_CSTA_BATAL_0_D_20` | Adulto equivalente, Gran Buenos Aires |
| CBT (Canasta Básica Total)       | `150.1_CSTA_BTTAL_0_D_20` | Adulto equivalente, Gran Buenos Aires |

### Ejemplo de Consulta

```javascript
// CBA - Canasta Básica Alimentaria
const CBA_URL =
  'https://apis.datos.gob.ar/series/api/series/?ids=150.1_CSTA_BATAL_0_D_20&format=json&sort=desc';

// CBT - Canasta Básica Total
const CBT_URL =
  'https://apis.datos.gob.ar/series/api/series/?ids=150.1_CSTA_BTTAL_0_D_20&format=json&sort=desc';

// Ambas juntas
const AMBAS_URL =
  'https://apis.datos.gob.ar/series/api/series/?ids=150.1_CSTA_BATAL_0_D_20,150.1_CSTA_BTTAL_0_D_20&format=json&sort=desc';
```

### Formato de Respuesta

```json
{
  "data": [
    ["2025-11-01", 183289.46],  // [fecha, valor en pesos]
    ["2025-10-01", 176150.29],
    ...
  ],
  "meta": {
    "title": "Canasta básica alimentaria...",
    "units": ["pesos"]
  }
}
```

### Parámetros Útiles

| Parámetro  | Ejemplo                   | Descripción                              |
| ---------- | ------------------------- | ---------------------------------------- |
| `ids`      | `150.1_CSTA_BATAL_0_D_20` | ID de la serie                           |
| `format`   | `json`                    | Formato de respuesta                     |
| `sort`     | `desc`                    | Orden descendente (más reciente primero) |
| `collapse` | `month`                   | Colapsar por período                     |
| `limit`    | `12`                      | Limitar resultados                       |

### Regiones Disponibles

Para CBA por regiones, usar el dataset:

```
https://datos.gob.ar/dataset/sspm-canasta-basica-alimentaria-regiones-pais
```

---

## 2. Tabla de Adultos Equivalentes (INDEC)

### Unidad de Referencia

El **adulto equivalente** es un varón de 30 a 60 años con actividad moderada. Su requerimiento energético es de **2.750 kcal/día**.

### Tabla de Equivalencias

| Edad           | Mujeres | Varones |
| -------------- | ------- | ------- |
| Menor de 1 año | 0,35    | 0,35    |
| 1 año          | 0,37    | 0,37    |
| 2 años         | 0,46    | 0,46    |
| 3 años         | 0,51    | 0,51    |
| 4 años         | 0,55    | 0,55    |
| 5 años         | 0,60    | 0,60    |
| 6 años         | 0,64    | 0,64    |
| 7 años         | 0,66    | 0,66    |
| 8 años         | 0,68    | 0,68    |
| 9 años         | 0,69    | 0,69    |
| 10 años        | 0,70    | 0,79    |
| 11 años        | 0,72    | 0,82    |
| 12 años        | 0,74    | 0,85    |
| 13 años        | 0,76    | 0,90    |
| 14 años        | 0,76    | 0,96    |
| 15 años        | 0,77    | 1,00    |
| 16 años        | 0,77    | 1,03    |
| 17 años        | 0,77    | 1,04    |
| 18 a 29 años   | 0,76    | 1,02    |
| 30 a 45 años   | 0,77    | 1,00    |
| 46 a 60 años   | 0,76    | 1,00    |
| 61 a 75 años   | 0,67    | 0,83    |
| Más de 75 años | 0,63    | 0,74    |

**Fuente**: INDEC - [Nota metodológica CBA/CBT](https://www.indec.gob.ar/ftp/cuadros/sociedad/preguntas_frecuentes_cba_cbt.pdf)

---

## 3. Código de Ejemplo

### JavaScript/Node.js

```javascript
// adulto-equivalente.mjs

/**
 * Tabla de adultos equivalentes INDEC
 * Sexo: 1 = varón, 2 = mujer
 */
const EQUIVALENCIAS = [
  { edadMin: 0, edadMax: 0, mujeres: 0.35, varones: 0.35 },
  { edadMin: 1, edadMax: 1, mujeres: 0.37, varones: 0.37 },
  { edadMin: 2, edadMax: 2, mujeres: 0.46, varones: 0.46 },
  { edadMin: 3, edadMax: 3, mujeres: 0.51, varones: 0.51 },
  { edadMin: 4, edadMax: 4, mujeres: 0.55, varones: 0.55 },
  { edadMin: 5, edadMax: 5, mujeres: 0.6, varones: 0.6 },
  { edadMin: 6, edadMax: 6, mujeres: 0.64, varones: 0.64 },
  { edadMin: 7, edadMax: 7, mujeres: 0.66, varones: 0.66 },
  { edadMin: 8, edadMax: 8, mujeres: 0.68, varones: 0.68 },
  { edadMin: 9, edadMax: 9, mujeres: 0.69, varones: 0.69 },
  { edadMin: 10, edadMax: 10, mujeres: 0.7, varones: 0.79 },
  { edadMin: 11, edadMax: 11, mujeres: 0.72, varones: 0.82 },
  { edadMin: 12, edadMax: 12, mujeres: 0.74, varones: 0.85 },
  { edadMin: 13, edadMax: 13, mujeres: 0.76, varones: 0.9 },
  { edadMin: 14, edadMax: 14, mujeres: 0.76, varones: 0.96 },
  { edadMin: 15, edadMax: 15, mujeres: 0.77, varones: 1.0 },
  { edadMin: 16, edadMax: 16, mujeres: 0.77, varones: 1.03 },
  { edadMin: 17, edadMax: 17, mujeres: 0.77, varones: 1.04 },
  { edadMin: 18, edadMax: 29, mujeres: 0.76, varones: 1.02 },
  { edadMin: 30, edadMax: 45, mujeres: 0.77, varones: 1.0 },
  { edadMin: 46, edadMax: 60, mujeres: 0.76, varones: 1.0 },
  { edadMin: 61, edadMax: 75, mujeres: 0.67, varones: 0.83 },
  { edadMin: 76, edadMax: 120, mujeres: 0.63, varones: 0.74 },
];

/**
 * Obtener unidades de adulto equivalente por sexo y edad
 * @param {number} sexo - 1 para varón, 2 para mujer
 * @param {number} edad - Edad en años
 * @returns {number} Unidades de adulto equivalente
 */
function getAdultoEquivalente(sexo, edad) {
  const sexoKey = sexo === 1 ? 'varones' : 'mujeres';
  const rango = EQUIVALENCIAS.find(r => edad >= r.edadMin && edad <= r.edadMax);
  return rango ? rango[sexoKey] : 1.0; // Default 1.0 si no encuentra
}

/**
 * Calcular total de adultos equivalentes de un hogar
 * @param {Array<{sexo: number, edad: number}>} miembros - Miembros del hogar
 * @returns {number} Total de adultos equivalentes
 */
function calcularAdultosEquivalentesHogar(miembros) {
  return miembros.reduce((total, m) => total + getAdultoEquivalente(m.sexo, m.edad), 0);
}

/**
 * Calcular CBA o CBT para un hogar
 * @param {number} valorCanasta - Valor de la canasta por adulto equivalente
 * @param {number} totalAE - Total de adultos equivalentes del hogar
 * @returns {number} Valor de la canasta para el hogar
 */
function calcularCanastaHogar(valorCanasta, totalAE) {
  return valorCanasta * totalAE;
}

export {
  getAdultoEquivalente,
  calcularAdultosEquivalentesHogar,
  calcularCanastaHogar,
  EQUIVALENCIAS,
};
```

### Ejemplo de Uso

```javascript
import { calcularAdultosEquivalentesHogar, calcularCanastaHogar } from './adulto-equivalente.mjs';

// Ejemplo 1: Hogar tipo INDEC (4 integrantes)
const hogarTipo = [
  { sexo: 1, edad: 35 }, // Varón 35 años = 1.00
  { sexo: 2, edad: 31 }, // Mujer 31 años = 0.77
  { sexo: 1, edad: 6 }, // Hijo 6 años = 0.64
  { sexo: 2, edad: 8 }, // Hija 8 años = 0.68
];

const totalAE = calcularAdultosEquivalentesHogar(hogarTipo);
console.log(`Total AE: ${totalAE}`); // 3.09

// Ejemplo 2: Calcular CBA para este hogar (Noviembre 2025)
const CBA_adulto_equivalente = 183289.46; // Desde API INDEC
const CBA_hogar = calcularCanastaHogar(CBA_adulto_equivalente, totalAE);
console.log(`CBA hogar: $${CBA_hogar.toLocaleString('es-AR')}`);
// CBA hogar: $566.364,43

// Ejemplo 3: Calcular CBT para este hogar
const CBT_adulto_equivalente = 450892.07;
const CBT_hogar = calcularCanastaHogar(CBT_adulto_equivalente, totalAE);
console.log(`CBT hogar: $${CBT_hogar.toLocaleString('es-AR')}`);
// CBT hogar: $1.393.256,40
```

---

## 4. Obtener Datos Actualizados

### Script para Descargar y Guardar

```javascript
// fetch-canastas.mjs
import { writeFileSync } from 'fs';

const BASE_URL = 'https://apis.datos.gob.ar/series/api/series/';
const SERIES = {
  CBA: '150.1_CSTA_BATAL_0_D_20',
  CBT: '150.1_CSTA_BTTAL_0_D_20',
};

async function fetchCanasta(id) {
  const url = `${BASE_URL}?ids=${id}&format=json&sort=desc&limit=12`;
  const res = await fetch(url);
  const json = await res.json();
  return json.data || [];
}

async function main() {
  console.log('📊 Obteniendo canastas del INDEC...\n');

  const [cba, cbt] = await Promise.all([fetchCanasta(SERIES.CBA), fetchCanasta(SERIES.CBT)]);

  const resultado = {
    ultima_actualizacion: new Date().toISOString(),
    cba: cba.map(([fecha, valor]) => ({ fecha, valor })),
    cbt: cbt.map(([fecha, valor]) => ({ fecha, valor })),
  };

  writeFileSync('canastas-indec.json', JSON.stringify(resultado, null, 2));
  console.log('✅ Guardado en canastas-indec.json');
  console.log(`\nCBA más reciente: $${cba[0][1].toLocaleString('es-AR')}`);
  console.log(`CBT más reciente: $${cbt[0][1].toLocaleString('es-AR')}`);
}

main().catch(console.error);
```

---

## 5. Fórmulas Clave

### CBA (Canasta Básica Alimentaria)

- Cubre alimentos mínimos para un varón adulto (2.750 kcal)
- Línea de **indigencia**: hogares con ingresos < CBA

### CBT (Canasta Básica Total)

- CBA + bienes y servicios no alimentarios
- Se calcula con el **Coeficiente de Engel**: `CBT = CBA / Coeficiente de Engel`
- Línea de **pobreza**: hogares con ingresos < CBT

### Coeficiente de Engel (noviembre 2025)

```
Inversa del CdE = 2.46 (aproximado)
CBT = CBA × 2.46
```

---

## 6. Referencias

- **Portal datos.gob.ar**: https://datos.gob.ar
- **Dataset CBA/CBT**: https://datos.gob.ar/dataset/sspm-valores-canasta-basica-alimentos-canasta-basica-total
- **API Series de Tiempo**: https://datos.gob.ar/apis
- **INDEC - CBA**: https://www.indec.gob.ar/indec/web/Nivel4-Tema-4-43-149
- **INDEC - CBT**: https://www.indec.gob.ar/indec/web/Nivel3-Tema-4-43
- **Nota metodológica**: https://www.indec.gob.ar/ftp/cuadros/sociedad/preguntas_frecuentes_cba_cbt.pdf
- **Paquete R `eph`**: https://docs.ropensci.org/eph/reference/adulto_equivalente.html

---

**Última actualización**: Junio 2026
**Fuente**: INDEC, Dirección Nacional de Estadísticas de Precios
