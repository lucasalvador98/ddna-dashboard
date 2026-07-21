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