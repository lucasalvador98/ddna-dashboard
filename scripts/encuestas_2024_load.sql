-- Encuestas 2024 - Datos cargados desde Excel de respuestas
-- Fecha: 2024, Encuesta a adultos y jovenes de Cordoba

INSERT INTO fuentes_datos (nombre, categoria, tipo, descripcion, fuente_oficial, frecuencia, estado)
VALUES ('Encuesta Bienestar 2024', 'encuestas_2024', 'manual',
  'Encuesta a adultos y jovenes sobre bienestar, alimentacion, vinculos y salud emocional',
  'Defensoria de los Derechos de NNyA de Cordoba', 'ad-hoc', 'cargado');

ALTER TABLE indicadores DROP CONSTRAINT IF EXISTS indicadores_categoria_check;
ALTER TABLE indicadores ADD CONSTRAINT indicadores_categoria_check
  CHECK (categoria = ANY (ARRAY[
    'salud', 'educacion', 'pobreza', 'seguridad', 'inversion',
    'demografia', 'anuario_educacion', 'aprender', 'consumo', 'deis',
    'salud_adolescente', 'encuestas_2024'
  ]));

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Hacinamiento - No', 'encuestas_2024', 76.8, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "No", "total_respondentes": 1756}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Hacinamiento - Sí', 'encuestas_2024', 23.2, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "S\u00ed", "total_respondentes": 1756}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Hogar come 4 comidas - Sí', 'encuestas_2024', 67.5, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "S\u00ed", "total_respondentes": 1756}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Hogar come 4 comidas - Casi siempre', 'encuestas_2024', 13.6, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Casi siempre", "total_respondentes": 1756}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Hogar come 4 comidas - Algunas veces', 'encuestas_2024', 13.6, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Algunas veces", "total_respondentes": 1756}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Hogar come 4 comidas - No', 'encuestas_2024', 5.0, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "No", "total_respondentes": 1756}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Hogar come 4 comidas - Nunca', 'encuestas_2024', 0.3, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Nunca", "total_respondentes": 1756}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Situacion laboral - Trabajador/a independiente', 'encuestas_2024', 28.6, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Trabajador/a independiente", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Situacion laboral - Empleado/a tiempo completo', 'encuestas_2024', 27.4, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Empleado/a tiempo completo", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Situacion laboral - Empleado/a medio tiempo', 'encuestas_2024', 19.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Empleado/a medio tiempo", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Situacion laboral - Desempleado/a', 'encuestas_2024', 15.6, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Desempleado/a", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Situacion laboral - Ama de casa', 'encuestas_2024', 2.6, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Ama de casa", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Situacion laboral - Jubilada', 'encuestas_2024', 0.7, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Jubilada", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Situacion laboral - Monotributista', 'encuestas_2024', 0.6, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Monotributista", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Situacion laboral - Jubilado', 'encuestas_2024', 0.4, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Jubilado", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Situacion laboral - Empleado público', 'encuestas_2024', 0.3, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Empleado p\u00fablico", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Situacion laboral - Pensionada', 'encuestas_2024', 0.3, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Pensionada", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ayuda alimentaria - No recibimos', 'encuestas_2024', 62.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "No recibimos", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ayuda alimentaria - Comedor escolar', 'encuestas_2024', 17.5, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Comedor escolar", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ayuda alimentaria - Tarjeta alimentar', 'encuestas_2024', 9.9, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Tarjeta alimentar", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ayuda alimentaria - Comedor escolar, Tarjeta alimentar', 'encuestas_2024', 5.3, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Comedor escolar, Tarjeta alimentar", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ayuda alimentaria - Comedor extra escolar', 'encuestas_2024', 1.9, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Comedor extra escolar", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ayuda alimentaria - Cajas/Bolsones de comida', 'encuestas_2024', 1.5, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Cajas/Bolsones de comida", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ayuda alimentaria - Comedor escolar, Cajas/Bolsones de comida', 'encuestas_2024', 0.6, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Comedor escolar, Cajas/Bolsones de comida", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ayuda alimentaria - Comedor escolar, Tarjeta alimentar, Cajas/Bolsones de comida', 'encuestas_2024', 0.4, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Comedor escolar, Tarjeta alimentar, Cajas/Bolsones de comida", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ayuda alimentaria - Tarjeta alimentar, Cajas/Bolsones de comida', 'encuestas_2024', 0.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Tarjeta alimentar, Cajas/Bolsones de comida", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ayuda alimentaria - Comedor extra escolar, Cajas/Bolsones de comida', 'encuestas_2024', 0.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Comedor extra escolar, Cajas/Bolsones de comida", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ayuda alimentaria - Comedor escolar, No recibimos', 'encuestas_2024', 0.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Comedor escolar, No recibimos", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ayuda alimentaria - Comedor escolar, Comedor extra escolar', 'encuestas_2024', 0.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Comedor escolar, Comedor extra escolar", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ayuda alimentaria - Comedor escolar, Comedor extra escolar, Tarjeta alimentar', 'encuestas_2024', 0.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Comedor escolar, Comedor extra escolar, Tarjeta alimentar", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Frecuencia afecto a hijos - Todos los días', 'encuestas_2024', 87.5, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Todos los d\u00edas", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Frecuencia afecto a hijos - Algunas veces a la semana', 'encuestas_2024', 9.2, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Algunas veces a la semana", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Frecuencia afecto a hijos - Raramente', 'encuestas_2024', 1.5, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Raramente", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Frecuencia afecto a hijos - Algunas veces al mes', 'encuestas_2024', 1.3, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Algunas veces al mes", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Frecuencia afecto a hijos - Nunca', 'encuestas_2024', 0.6, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Nunca", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Tiempo recreativo con hijos - Varias veces a la semana', 'encuestas_2024', 42.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Varias veces a la semana", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Tiempo recreativo con hijos - Más de 1 hora al día', 'encuestas_2024', 22.6, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "M\u00e1s de 1 hora al d\u00eda", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Tiempo recreativo con hijos - 30 minutos a 1 hora al día', 'encuestas_2024', 12.5, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "30 minutos a 1 hora al d\u00eda", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Tiempo recreativo con hijos - Una vez a la semana', 'encuestas_2024', 11.6, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Una vez a la semana", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Tiempo recreativo con hijos - Raramente', 'encuestas_2024', 9.7, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Raramente", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Tiempo recreativo con hijos - Nunca', 'encuestas_2024', 1.5, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Nunca", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Quien prepara comida - Mamá', 'encuestas_2024', 78.8, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Mam\u00e1", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Quien prepara comida - Papá', 'encuestas_2024', 11.3, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Pap\u00e1", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Quien prepara comida - Otro miembro de la familia mayor a 18 años', 'encuestas_2024', 6.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Otro miembro de la familia mayor a 18 a\u00f1os", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Quien prepara comida - Nadie la prepara', 'encuestas_2024', 1.9, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Nadie la prepara", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Quien prepara comida - Cuidadora no familiar', 'encuestas_2024', 1.5, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Cuidadora no familiar", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Quien prepara comida - Otro miembro de la familia menor a 18 años', 'encuestas_2024', 0.3, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Otro miembro de la familia menor a 18 a\u00f1os", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Lectura de cuentos - Sí, de vez en cuando', 'encuestas_2024', 28.7, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "S\u00ed, de vez en cuando", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Lectura de cuentos - Nunca', 'encuestas_2024', 25.8, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Nunca", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Lectura de cuentos - Raramente', 'encuestas_2024', 21.0, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Raramente", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Lectura de cuentos - Sí, algunas noches', 'encuestas_2024', 17.8, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "S\u00ed, algunas noches", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Lectura de cuentos - Sí, todas las noches', 'encuestas_2024', 6.7, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "S\u00ed, todas las noches", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ultimo abrazo a hijos - Hoy', 'encuestas_2024', 77.2, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Hoy", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ultimo abrazo a hijos - En los últimos 3 días', 'encuestas_2024', 16.2, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "En los \u00faltimos 3 d\u00edas", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ultimo abrazo a hijos - No recuerdo', 'encuestas_2024', 2.9, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "No recuerdo", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ultimo abrazo a hijos - En la última semana', 'encuestas_2024', 2.8, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "En la \u00faltima semana", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ultimo abrazo a hijos - Hace más de una semana', 'encuestas_2024', 1.0, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Hace m\u00e1s de una semana", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Quien cuida hijos enfermos - Mamá', 'encuestas_2024', 89.3, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Mam\u00e1", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Quien cuida hijos enfermos - Papá', 'encuestas_2024', 5.0, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Pap\u00e1", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Quien cuida hijos enfermos - Otro miembro de la familia mayor a 18 años', 'encuestas_2024', 4.9, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Otro miembro de la familia mayor a 18 a\u00f1os", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Quien cuida hijos enfermos - Niñera', 'encuestas_2024', 0.7, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Ni\u00f1era", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Quien cuida hijos enfermos - Otro miembro de la familia menor a 18 años', 'encuestas_2024', 0.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "adultos", "respuesta": "Otro miembro de la familia menor a 18 a\u00f1os", "total_respondentes": 718}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Grado escolar - Quinto de secundaria', 'encuestas_2024', 25.0, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Quinto de secundaria", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Grado escolar - Cuarto de secundaria', 'encuestas_2024', 19.7, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Cuarto de secundaria", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Grado escolar - Tercero de secundaria', 'encuestas_2024', 19.2, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Tercero de secundaria", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Grado escolar - Primero de secundaria', 'encuestas_2024', 14.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Primero de secundaria", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Grado escolar - Segundo de secundaria', 'encuestas_2024', 10.8, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Segundo de secundaria", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Grado escolar - Sexto de secundaria', 'encuestas_2024', 9.5, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Sexto de secundaria", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Grado escolar - Voy a la primaria', 'encuestas_2024', 1.3, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Voy a la primaria", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Grado escolar - No voy a la escuela', 'encuestas_2024', 0.4, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "No voy a la escuela", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Con quien vives - Con mi mamá y mi papá', 'encuestas_2024', 61.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Con mi mam\u00e1 y mi pap\u00e1", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Con quien vives - Sólo con mi mamá', 'encuestas_2024', 22.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "S\u00f3lo con mi mam\u00e1", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Con quien vives - Con otros familiares', 'encuestas_2024', 7.2, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Con otros familiares", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Con quien vives - otros', 'encuestas_2024', 6.3, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "otros", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Con quien vives - Sólo con mi papá', 'encuestas_2024', 3.4, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "S\u00f3lo con mi pap\u00e1", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Feliz en casa - Sí, siempre', 'encuestas_2024', 41.8, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "S\u00ed, siempre", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Feliz en casa - Sí, la mayor parte del tiempo', 'encuestas_2024', 34.6, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "S\u00ed, la mayor parte del tiempo", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Feliz en casa - A veces', 'encuestas_2024', 19.3, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "A veces", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Feliz en casa - Raramente', 'encuestas_2024', 3.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Raramente", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Feliz en casa - No', 'encuestas_2024', 1.3, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "No", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Adultos muestran carino - Todos los días', 'encuestas_2024', 64.3, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Todos los d\u00edas", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Adultos muestran carino - Algunas veces a la semana', 'encuestas_2024', 22.2, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Algunas veces a la semana", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Adultos muestran carino - Raramente', 'encuestas_2024', 7.8, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Raramente", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Adultos muestran carino - Algunas veces al mes', 'encuestas_2024', 4.3, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Algunas veces al mes", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Adultos muestran carino - Nunca', 'encuestas_2024', 1.4, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Nunca", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Tiempo recreativo propio - Varias veces a la semana', 'encuestas_2024', 33.7, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Varias veces a la semana", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Tiempo recreativo propio - Más de 1 hora al día', 'encuestas_2024', 30.5, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "M\u00e1s de 1 hora al d\u00eda", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Tiempo recreativo propio - Raramente', 'encuestas_2024', 13.8, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Raramente", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Tiempo recreativo propio - Una vez a la semana', 'encuestas_2024', 8.3, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Una vez a la semana", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Tiempo recreativo propio - 30 minutos a 1 hora al día', 'encuestas_2024', 7.4, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "30 minutos a 1 hora al d\u00eda", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Tiempo recreativo propio - Nunca', 'encuestas_2024', 6.3, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Nunca", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Tiempo solo en casa - Nunca estoy solo', 'encuestas_2024', 36.8, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Nunca estoy solo", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Tiempo solo en casa - 1-2 horas al día', 'encuestas_2024', 30.3, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "1-2 horas al d\u00eda", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Tiempo solo en casa - 3-4 horas al día', 'encuestas_2024', 18.0, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "3-4 horas al d\u00eda", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Tiempo solo en casa - Más de 4 horas al día', 'encuestas_2024', 12.7, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "M\u00e1s de 4 horas al d\u00eda", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Tiempo solo en casa - Todo el dia', 'encuestas_2024', 2.2, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Todo el dia", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Comparte comidas en familia - Todos los dias', 'encuestas_2024', 73.9, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Todos los dias", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Comparte comidas en familia - 2 a 4 veces a la semana', 'encuestas_2024', 16.6, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "2 a 4 veces a la semana", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Comparte comidas en familia - 1 vez a la semana', 'encuestas_2024', 6.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "1 vez a la semana", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Comparte comidas en familia - Nunca', 'encuestas_2024', 3.5, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Nunca", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Dificultad para ir a la escuela - No tengo dificultades para ir a la escuela', 'encuestas_2024', 76.2, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "No tengo dificultades para ir a la escuela", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Dificultad para ir a la escuela - Sí, por razones de: Gran distancia entre mi casa y la escuela', 'encuestas_2024', 14.6, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "S\u00ed, por razones de: Gran distancia entre mi casa y la escuela", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Dificultad para ir a la escuela - Sí, por razones de seguridad en mi vecindario', 'encuestas_2024', 4.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "S\u00ed, por razones de seguridad en mi vecindario", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Dificultad para ir a la escuela - Sí, por razones de: Falta de acceso al transporte público', 'encuestas_2024', 3.5, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "S\u00ed, por razones de: Falta de acceso al transporte p\u00fablico", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Dificultad para ir a la escuela - Sí, por razones de: violencia No tengo dificultades para ir a la escuela', 'encuestas_2024', 1.5, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "S\u00ed, por razones de: violencia No tengo dificultades para ir a la escuela", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ultimo abrazo recibido - Hoy', 'encuestas_2024', 42.6, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Hoy", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ultimo abrazo recibido - En los últimos 3 días', 'encuestas_2024', 23.7, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "En los \u00faltimos 3 d\u00edas", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ultimo abrazo recibido - No recuerdo', 'encuestas_2024', 20.5, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "No recuerdo", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ultimo abrazo recibido - En la última semana', 'encuestas_2024', 7.5, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "En la \u00faltima semana", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ultimo abrazo recibido - Hace más de una semana', 'encuestas_2024', 5.7, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Hace m\u00e1s de una semana", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Estado emocional - Tranquilo/a', 'encuestas_2024', 43.7, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Tranquilo/a", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Estado emocional - Feliz', 'encuestas_2024', 30.4, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Feliz", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Estado emocional - Ansioso/a', 'encuestas_2024', 10.9, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Ansioso/a", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Estado emocional - Apático', 'encuestas_2024', 4.9, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Ap\u00e1tico", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Estado emocional - Triste', 'encuestas_2024', 3.9, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Triste", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Estado emocional - Angustiado', 'encuestas_2024', 3.2, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Angustiado", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Estado emocional - Enojado/a', 'encuestas_2024', 3.0, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Enojado/a", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Estres por estudios - Algunas veces a la semana', 'encuestas_2024', 40.8, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Algunas veces a la semana", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Estres por estudios - Todos los días', 'encuestas_2024', 33.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Todos los d\u00edas", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Estres por estudios - Raramente', 'encuestas_2024', 11.7, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Raramente", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Estres por estudios - Algunas veces al mes', 'encuestas_2024', 10.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Algunas veces al mes", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Estres por estudios - Nunca', 'encuestas_2024', 4.2, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Nunca", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ha visto consumo en pares - Sí frecuentemente', 'encuestas_2024', 46.2, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "S\u00ed frecuentemente", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ha visto consumo en pares - Sí algunas veces', 'encuestas_2024', 36.7, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "S\u00ed algunas veces", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ha visto consumo en pares - Raramente', 'encuestas_2024', 8.7, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Raramente", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Ha visto consumo en pares - Nunca', 'encuestas_2024', 8.4, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Nunca", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Opinion sobre consumo - Es preocupante', 'encuestas_2024', 52.5, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Es preocupante", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Opinion sobre consumo - No estoy seguro/a', 'encuestas_2024', 17.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "No estoy seguro/a", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Opinion sobre consumo - No me importa', 'encuestas_2024', 17.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "No me importa", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Opinion sobre consumo - Es algo normal', 'encuestas_2024', 13.3, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Es algo normal", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Presion para consumir - Nunca', 'encuestas_2024', 76.9, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Nunca", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Presion para consumir - Raramente', 'encuestas_2024', 14.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Raramente", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Presion para consumir - Sí, algunas veces', 'encuestas_2024', 6.6, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "S\u00ed, algunas veces", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Presion para consumir - Sí, frecuentemente', 'encuestas_2024', 2.4, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "S\u00ed, frecuentemente", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Escuela como contencion - A veces', 'encuestas_2024', 36.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "A veces", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Escuela como contencion - Sí, la mayor parte del tiempo', 'encuestas_2024', 25.7, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "S\u00ed, la mayor parte del tiempo", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Escuela como contencion - No', 'encuestas_2024', 15.7, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "No", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Escuela como contencion - Sí, siempre', 'encuestas_2024', 14.0, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "S\u00ed, siempre", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Escuela como contencion - Raramente', 'encuestas_2024', 8.5, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Raramente", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Estado de animo general - Bueno', 'encuestas_2024', 34.5, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Bueno", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Estado de animo general - Regular', 'encuestas_2024', 32.4, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Regular", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Estado de animo general - Muy bueno', 'encuestas_2024', 28.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Muy bueno", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Estado de animo general - Malo', 'encuestas_2024', 3.7, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Malo", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Estado de animo general - Muy malo', 'encuestas_2024', 1.3, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Muy malo", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Tiene amigos de confianza - Sí', 'encuestas_2024', 87.8, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "S\u00ed", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Tiene amigos de confianza - No', 'encuestas_2024', 12.2, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "No", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);

INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Contencion en amigos - Sí, siempre', 'encuestas_2024', 49.2, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "S\u00ed, siempre", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Contencion en amigos - Aveces', 'encuestas_2024', 37.0, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Aveces", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Contencion en amigos - No lo suficiente', 'encuestas_2024', 8.9, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "No lo suficiente", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Contencion en amigos - Nunca', 'encuestas_2024', 2.8, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "Nunca", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
INSERT INTO indicadores (indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente, activo)
VALUES ('Encuesta 2024 - Contencion en amigos - No tengo amigos', 'encuestas_2024', 2.1, '%', 2024, 'Cordoba',
  '{"tipo_encuesta": "jovenes", "respuesta": "No tengo amigos", "total_respondentes": 1038}'::jsonb,
  'Encuesta Bienestar 2024 - DDNA', true);
