-- Chunk 0000: INSERTs 1 to 50 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e07d4ee9-5659-5328-bb71-e01334fd04ab', 'Escolarización por edad', 'educacion', 0, 'hab', 'N/A', 'Córdoba', '{}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET indicador_nombre = EXCLUDED.indicador_nombre;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('9ecb2fb6-3eef-5fad-92c7-192ac1dc445b', 'Tasa de asistencia educativa', 'educacion', 0, '%', 'N/A', 'Córdoba', '{}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET indicador_nombre = EXCLUDED.indicador_nombre;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('6c6c60e2-e2bc-5d1d-b3f7-9afe68ada48d', 'Unidades educativas - General', 'educacion', 0, 'casos', 'N/A', 'Córdoba', '{}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET indicador_nombre = EXCLUDED.indicador_nombre;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('92543efd-57dd-5001-b08f-44f7c8e14866', 'Matrícula - General', 'educacion', 0, 'hab', 'N/A', 'Córdoba', '{}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET indicador_nombre = EXCLUDED.indicador_nombre;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a5c66c3e-63d5-5935-87aa-848b8f8e4c08', 'Personal docente - General', 'educacion', 0, 'hab', 'N/A', 'Córdoba', '{}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET indicador_nombre = EXCLUDED.indicador_nombre;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('6e7fc641-c9e9-524a-9bf4-f31a9020b824', 'Matrícula sector estatal - General', 'educacion', 0, 'hab', 'N/A', 'Córdoba', '{}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET indicador_nombre = EXCLUDED.indicador_nombre;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('58b81ca9-d0d7-5325-a32b-c618736e9f94', 'Matrícula sector privado - General', 'educacion', 0, 'hab', 'N/A', 'Córdoba', '{}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET indicador_nombre = EXCLUDED.indicador_nombre;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('262af1dc-c566-5c10-87fd-4a716be997a7', 'Inversion social en infancia', 'inversion', 0, 'Md', 'N/A', 'Córdoba', '{}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET indicador_nombre = EXCLUDED.indicador_nombre;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a9478591-3ff2-5de2-9f31-4aa153d62ab6', 'Pobreza infantil', 'pobreza', 0, '%', 'N/A', 'Córdoba', '{}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET indicador_nombre = EXCLUDED.indicador_nombre;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f6b28d8d-8f66-5a51-bbe2-0c3b3d8ab268', 'Indigencia infantil', 'pobreza', 0, '%', 'N/A', 'Córdoba', '{}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET indicador_nombre = EXCLUDED.indicador_nombre;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('203fe0e0-e6ca-5a7f-a5d9-6eab4842eceb', 'Mortalidad infantil', 'salud', 0, '‰', 'N/A', 'Córdoba', '{}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET indicador_nombre = EXCLUDED.indicador_nombre;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8115074a-a6cc-5f2f-a21f-44ac18a97ae4', 'Casos de Civil', 'seguridad', 0, 'casos', 'N/A', 'Córdoba', '{}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET indicador_nombre = EXCLUDED.indicador_nombre;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f9ed711c-6920-57d1-885a-d88dd7926f11', 'Casos de Familia', 'seguridad', 0, 'casos', 'N/A', 'Córdoba', '{}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET indicador_nombre = EXCLUDED.indicador_nombre;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5fa5acf1-1178-546d-84df-8662224752f0', 'Casos de Fiscalías', 'seguridad', 0, 'casos', 'N/A', 'Córdoba', '{}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET indicador_nombre = EXCLUDED.indicador_nombre;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5f239f74-ffb9-5654-970f-3f97fa6903f2', 'Casos de Niñez', 'seguridad', 0, 'casos', 'N/A', 'Córdoba', '{}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET indicador_nombre = EXCLUDED.indicador_nombre;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b3e825a9-7daa-5025-a82a-1d677441bc5d', 'Casos de Penal Juvenil', 'seguridad', 0, 'casos', 'N/A', 'Córdoba', '{}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET indicador_nombre = EXCLUDED.indicador_nombre;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('6759721a-d09a-5515-813f-2e535155b60e', 'Casos de Violencia Familiar', 'seguridad', 0, 'casos', 'N/A', 'Córdoba', '{}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET indicador_nombre = EXCLUDED.indicador_nombre;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4e15a7bb-b2e9-549c-ab44-5378f80b187a', 'Total casos sistema de justicia', 'seguridad', 0, 'casos', 'N/A', 'Córdoba', '{}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET indicador_nombre = EXCLUDED.indicador_nombre;


-- ============================================================
-- DATOS: DEMOGRAFIA (0 registros)
-- ============================================================

-- ============================================================
-- DATOS: EDUCACION (312 registros)
-- ============================================================

INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 40413.0, 'hab', '2022', 'Córdoba', '{"edad": 0, "metrica": "poblacion_total", "descripcion": "Poblaci\u00f3n en viviendas particulares", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 3608.0, 'hab', '2022', 'Córdoba', '{"edad": 0, "metrica": "asiste", "descripcion": "Poblaci\u00f3n que asiste", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 1916.0, 'hab', '2022', 'Córdoba', '{"edad": 0, "metrica": "no_asiste_asistio", "descripcion": "Poblaci\u00f3n que no asiste pero asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 34889.0, 'hab', '2022', 'Córdoba', '{"edad": 0, "metrica": "nunca_asistio", "descripcion": "Poblaci\u00f3n que nunca asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 41806.0, 'hab', '2022', 'Córdoba', '{"edad": 1, "metrica": "poblacion_total", "descripcion": "Poblaci\u00f3n en viviendas particulares", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 8964.0, 'hab', '2022', 'Córdoba', '{"edad": 1, "metrica": "asiste", "descripcion": "Poblaci\u00f3n que asiste", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 1724.0, 'hab', '2022', 'Córdoba', '{"edad": 1, "metrica": "no_asiste_asistio", "descripcion": "Poblaci\u00f3n que no asiste pero asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 31118.0, 'hab', '2022', 'Córdoba', '{"edad": 1, "metrica": "nunca_asistio", "descripcion": "Poblaci\u00f3n que nunca asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 46848.0, 'hab', '2022', 'Córdoba', '{"edad": 2, "metrica": "poblacion_total", "descripcion": "Poblaci\u00f3n en viviendas particulares", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 19281.0, 'hab', '2022', 'Córdoba', '{"edad": 2, "metrica": "asiste", "descripcion": "Poblaci\u00f3n que asiste", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 2200.0, 'hab', '2022', 'Córdoba', '{"edad": 2, "metrica": "no_asiste_asistio", "descripcion": "Poblaci\u00f3n que no asiste pero asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 25367.0, 'hab', '2022', 'Córdoba', '{"edad": 2, "metrica": "nunca_asistio", "descripcion": "Poblaci\u00f3n que nunca asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 51158.0, 'hab', '2022', 'Córdoba', '{"edad": 3, "metrica": "poblacion_total", "descripcion": "Poblaci\u00f3n en viviendas particulares", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 37867.0, 'hab', '2022', 'Córdoba', '{"edad": 3, "metrica": "asiste", "descripcion": "Poblaci\u00f3n que asiste", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 1658.0, 'hab', '2022', 'Córdoba', '{"edad": 3, "metrica": "no_asiste_asistio", "descripcion": "Poblaci\u00f3n que no asiste pero asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 11633.0, 'hab', '2022', 'Córdoba', '{"edad": 3, "metrica": "nunca_asistio", "descripcion": "Poblaci\u00f3n que nunca asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 53212.0, 'hab', '2022', 'Córdoba', '{"edad": 4, "metrica": "poblacion_total", "descripcion": "Poblaci\u00f3n en viviendas particulares", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 51563.0, 'hab', '2022', 'Córdoba', '{"edad": 4, "metrica": "asiste", "descripcion": "Poblaci\u00f3n que asiste", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 709.0, 'hab', '2022', 'Córdoba', '{"edad": 4, "metrica": "no_asiste_asistio", "descripcion": "Poblaci\u00f3n que no asiste pero asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 940.0, 'hab', '2022', 'Córdoba', '{"edad": 4, "metrica": "nunca_asistio", "descripcion": "Poblaci\u00f3n que nunca asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 55238.0, 'hab', '2022', 'Córdoba', '{"edad": 5, "metrica": "poblacion_total", "descripcion": "Poblaci\u00f3n en viviendas particulares", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 54262.0, 'hab', '2022', 'Córdoba', '{"edad": 5, "metrica": "asiste", "descripcion": "Poblaci\u00f3n que asiste", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 593.0, 'hab', '2022', 'Córdoba', '{"edad": 5, "metrica": "no_asiste_asistio", "descripcion": "Poblaci\u00f3n que no asiste pero asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 383.0, 'hab', '2022', 'Córdoba', '{"edad": 5, "metrica": "nunca_asistio", "descripcion": "Poblaci\u00f3n que nunca asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 56250.0, 'hab', '2022', 'Córdoba', '{"edad": 6, "metrica": "poblacion_total", "descripcion": "Poblaci\u00f3n en viviendas particulares", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 55420.0, 'hab', '2022', 'Córdoba', '{"edad": 6, "metrica": "asiste", "descripcion": "Poblaci\u00f3n que asiste", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 530.0, 'hab', '2022', 'Córdoba', '{"edad": 6, "metrica": "no_asiste_asistio", "descripcion": "Poblaci\u00f3n que no asiste pero asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 300.0, 'hab', '2022', 'Córdoba', '{"edad": 6, "metrica": "nunca_asistio", "descripcion": "Poblaci\u00f3n que nunca asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 59122.0, 'hab', '2022', 'Córdoba', '{"edad": 7, "metrica": "poblacion_total", "descripcion": "Poblaci\u00f3n en viviendas particulares", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 58129.0, 'hab', '2022', 'Córdoba', '{"edad": 7, "metrica": "asiste", "descripcion": "Poblaci\u00f3n que asiste", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 662.0, 'hab', '2022', 'Córdoba', '{"edad": 7, "metrica": "no_asiste_asistio", "descripcion": "Poblaci\u00f3n que no asiste pero asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3141f357-74e6-5b8f-bc29-8e3062f8981b', 'Escolarización por edad', 'educacion', 331.0, 'hab', '2022', 'Córdoba', '{"edad": 7, "metrica": "nunca_asistio", "descripcion": "Poblaci\u00f3n que nunca asisti\u00f3", "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

