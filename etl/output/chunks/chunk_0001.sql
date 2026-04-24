-- Chunk 0001: INSERTs 51 to 100 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 57455.0, 'hab', '2022', 'Córdoba', '{"edad": 8, "metrica": "poblacion_total", "descripcion": "Poblaci\u00f3n en viviendas particulares", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 56416.0, 'hab', '2022', 'Córdoba', '{"edad": 8, "metrica": "asiste", "descripcion": "Poblaci\u00f3n que asiste", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 733.0, 'hab', '2022', 'Córdoba', '{"edad": 8, "metrica": "no_asiste_asistio", "descripcion": "Poblaci\u00f3n que no asiste pero asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 306.0, 'hab', '2022', 'Córdoba', '{"edad": 8, "metrica": "nunca_asistio", "descripcion": "Poblaci\u00f3n que nunca asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 57286.0, 'hab', '2022', 'Córdoba', '{"edad": 9, "metrica": "poblacion_total", "descripcion": "Poblaci\u00f3n en viviendas particulares", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 56234.0, 'hab', '2022', 'Córdoba', '{"edad": 9, "metrica": "asiste", "descripcion": "Poblaci\u00f3n que asiste", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 771.0, 'hab', '2022', 'Córdoba', '{"edad": 9, "metrica": "no_asiste_asistio", "descripcion": "Poblaci\u00f3n que no asiste pero asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 281.0, 'hab', '2022', 'Córdoba', '{"edad": 9, "metrica": "nunca_asistio", "descripcion": "Poblaci\u00f3n que nunca asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 56087.0, 'hab', '2022', 'Córdoba', '{"edad": 10, "metrica": "poblacion_total", "descripcion": "Poblaci\u00f3n en viviendas particulares", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 55081.0, 'hab', '2022', 'Córdoba', '{"edad": 10, "metrica": "asiste", "descripcion": "Poblaci\u00f3n que asiste", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 759.0, 'hab', '2022', 'Córdoba', '{"edad": 10, "metrica": "no_asiste_asistio", "descripcion": "Poblaci\u00f3n que no asiste pero asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 247.0, 'hab', '2022', 'Córdoba', '{"edad": 10, "metrica": "nunca_asistio", "descripcion": "Poblaci\u00f3n que nunca asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 57976.0, 'hab', '2022', 'Córdoba', '{"edad": 11, "metrica": "poblacion_total", "descripcion": "Poblaci\u00f3n en viviendas particulares", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 56842.0, 'hab', '2022', 'Córdoba', '{"edad": 11, "metrica": "asiste", "descripcion": "Poblaci\u00f3n que asiste", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 809.0, 'hab', '2022', 'Córdoba', '{"edad": 11, "metrica": "no_asiste_asistio", "descripcion": "Poblaci\u00f3n que no asiste pero asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 325.0, 'hab', '2022', 'Córdoba', '{"edad": 11, "metrica": "nunca_asistio", "descripcion": "Poblaci\u00f3n que nunca asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 58483.0, 'hab', '2022', 'Córdoba', '{"edad": 12, "metrica": "poblacion_total", "descripcion": "Poblaci\u00f3n en viviendas particulares", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 57021.0, 'hab', '2022', 'Córdoba', '{"edad": 12, "metrica": "asiste", "descripcion": "Poblaci\u00f3n que asiste", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 1224.0, 'hab', '2022', 'Córdoba', '{"edad": 12, "metrica": "no_asiste_asistio", "descripcion": "Poblaci\u00f3n que no asiste pero asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 238.0, 'hab', '2022', 'Córdoba', '{"edad": 12, "metrica": "nunca_asistio", "descripcion": "Poblaci\u00f3n que nunca asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 58587.0, 'hab', '2022', 'Córdoba', '{"edad": 13, "metrica": "poblacion_total", "descripcion": "Poblaci\u00f3n en viviendas particulares", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 56781.0, 'hab', '2022', 'Córdoba', '{"edad": 13, "metrica": "asiste", "descripcion": "Poblaci\u00f3n que asiste", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 1633.0, 'hab', '2022', 'Córdoba', '{"edad": 13, "metrica": "no_asiste_asistio", "descripcion": "Poblaci\u00f3n que no asiste pero asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 173.0, 'hab', '2022', 'Córdoba', '{"edad": 13, "metrica": "nunca_asistio", "descripcion": "Poblaci\u00f3n que nunca asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 56689.0, 'hab', '2022', 'Córdoba', '{"edad": 14, "metrica": "poblacion_total", "descripcion": "Poblaci\u00f3n en viviendas particulares", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 54347.0, 'hab', '2022', 'Córdoba', '{"edad": 14, "metrica": "asiste", "descripcion": "Poblaci\u00f3n que asiste", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 2145.0, 'hab', '2022', 'Córdoba', '{"edad": 14, "metrica": "no_asiste_asistio", "descripcion": "Poblaci\u00f3n que no asiste pero asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 197.0, 'hab', '2022', 'Córdoba', '{"edad": 14, "metrica": "nunca_asistio", "descripcion": "Poblaci\u00f3n que nunca asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 55916.0, 'hab', '2022', 'Córdoba', '{"edad": 15, "metrica": "poblacion_total", "descripcion": "Poblaci\u00f3n en viviendas particulares", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 52578.0, 'hab', '2022', 'Córdoba', '{"edad": 15, "metrica": "asiste", "descripcion": "Poblaci\u00f3n que asiste", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 3132.0, 'hab', '2022', 'Córdoba', '{"edad": 15, "metrica": "no_asiste_asistio", "descripcion": "Poblaci\u00f3n que no asiste pero asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 206.0, 'hab', '2022', 'Córdoba', '{"edad": 15, "metrica": "nunca_asistio", "descripcion": "Poblaci\u00f3n que nunca asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 56262.0, 'hab', '2022', 'Córdoba', '{"edad": 16, "metrica": "poblacion_total", "descripcion": "Poblaci\u00f3n en viviendas particulares", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 51486.0, 'hab', '2022', 'Córdoba', '{"edad": 16, "metrica": "asiste", "descripcion": "Poblaci\u00f3n que asiste", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 4593.0, 'hab', '2022', 'Córdoba', '{"edad": 16, "metrica": "no_asiste_asistio", "descripcion": "Poblaci\u00f3n que no asiste pero asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 183.0, 'hab', '2022', 'Córdoba', '{"edad": 16, "metrica": "nunca_asistio", "descripcion": "Poblaci\u00f3n que nunca asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 58698.0, 'hab', '2022', 'Córdoba', '{"edad": 17, "metrica": "poblacion_total", "descripcion": "Poblaci\u00f3n en viviendas particulares", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 50470.0, 'hab', '2022', 'Córdoba', '{"edad": 17, "metrica": "asiste", "descripcion": "Poblaci\u00f3n que asiste", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 7936.0, 'hab', '2022', 'Córdoba', '{"edad": 17, "metrica": "no_asiste_asistio", "descripcion": "Poblaci\u00f3n que no asiste pero asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 292.0, 'hab', '2022', 'Córdoba', '{"edad": 17, "metrica": "nunca_asistio", "descripcion": "Poblaci\u00f3n que nunca asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('64417205-6b42-55c8-92b1-89100d7b08aa', 'Tasa de asistencia educativa', 'educacion', 8.93, '%', '2022', 'Córdoba', '{"edad": 0, "asistentes": 3608, "poblacion_total": 40413, "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('64417205-6b42-55c8-92b1-89100d7b08aa', 'Tasa de asistencia educativa', 'educacion', 21.44, '%', '2022', 'Córdoba', '{"edad": 1, "asistentes": 8964, "poblacion_total": 41806, "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('64417205-6b42-55c8-92b1-89100d7b08aa', 'Tasa de asistencia educativa', 'educacion', 41.16, '%', '2022', 'Córdoba', '{"edad": 2, "asistentes": 19281, "poblacion_total": 46848, "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('64417205-6b42-55c8-92b1-89100d7b08aa', 'Tasa de asistencia educativa', 'educacion', 74.02, '%', '2022', 'Córdoba', '{"edad": 3, "asistentes": 37867, "poblacion_total": 51158, "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('64417205-6b42-55c8-92b1-89100d7b08aa', 'Tasa de asistencia educativa', 'educacion', 96.9, '%', '2022', 'Córdoba', '{"edad": 4, "asistentes": 51563, "poblacion_total": 53212, "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('64417205-6b42-55c8-92b1-89100d7b08aa', 'Tasa de asistencia educativa', 'educacion', 98.23, '%', '2022', 'Córdoba', '{"edad": 5, "asistentes": 54262, "poblacion_total": 55238, "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('64417205-6b42-55c8-92b1-89100d7b08aa', 'Tasa de asistencia educativa', 'educacion', 98.52, '%', '2022', 'Córdoba', '{"edad": 6, "asistentes": 55420, "poblacion_total": 56250, "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('64417205-6b42-55c8-92b1-89100d7b08aa', 'Tasa de asistencia educativa', 'educacion', 98.32, '%', '2022', 'Córdoba', '{"edad": 7, "asistentes": 58129, "poblacion_total": 59122, "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('64417205-6b42-55c8-92b1-89100d7b08aa', 'Tasa de asistencia educativa', 'educacion', 98.19, '%', '2022', 'Córdoba', '{"edad": 8, "asistentes": 56416, "poblacion_total": 57455, "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('64417205-6b42-55c8-92b1-89100d7b08aa', 'Tasa de asistencia educativa', 'educacion', 98.16, '%', '2022', 'Córdoba', '{"edad": 9, "asistentes": 56234, "poblacion_total": 57286, "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

