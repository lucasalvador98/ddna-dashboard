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