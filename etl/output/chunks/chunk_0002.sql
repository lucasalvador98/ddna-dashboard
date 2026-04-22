-- Chunk 0002: INSERTs 101 to 150 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('64417205-6b42-55c8-92b1-89100d7b08aa', 'Tasa de asistencia educativa', 'educacion', 98.21, '%', '2022', 'Córdoba', '{"edad": 10, "asistentes": 55081, "poblacion_total": 56087, "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('64417205-6b42-55c8-92b1-89100d7b08aa', 'Tasa de asistencia educativa', 'educacion', 98.04, '%', '2022', 'Córdoba', '{"edad": 11, "asistentes": 56842, "poblacion_total": 57976, "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('64417205-6b42-55c8-92b1-89100d7b08aa', 'Tasa de asistencia educativa', 'educacion', 97.5, '%', '2022', 'Córdoba', '{"edad": 12, "asistentes": 57021, "poblacion_total": 58483, "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('64417205-6b42-55c8-92b1-89100d7b08aa', 'Tasa de asistencia educativa', 'educacion', 96.92, '%', '2022', 'Córdoba', '{"edad": 13, "asistentes": 56781, "poblacion_total": 58587, "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('64417205-6b42-55c8-92b1-89100d7b08aa', 'Tasa de asistencia educativa', 'educacion', 95.87, '%', '2022', 'Córdoba', '{"edad": 14, "asistentes": 54347, "poblacion_total": 56689, "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('64417205-6b42-55c8-92b1-89100d7b08aa', 'Tasa de asistencia educativa', 'educacion', 94.03, '%', '2022', 'Córdoba', '{"edad": 15, "asistentes": 52578, "poblacion_total": 55916, "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('64417205-6b42-55c8-92b1-89100d7b08aa', 'Tasa de asistencia educativa', 'educacion', 91.51, '%', '2022', 'Córdoba', '{"edad": 16, "asistentes": 51486, "poblacion_total": 56262, "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('64417205-6b42-55c8-92b1-89100d7b08aa', 'Tasa de asistencia educativa', 'educacion', 85.98, '%', '2022', 'Córdoba', '{"edad": 17, "asistentes": 50470, "poblacion_total": 58698, "fuente": "Censo Nacional 2022", "archivo": "Educacion por edades.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('720bbdde-dd07-5a56-bd3a-93b85b567408', 'Unidades educativas - General', 'educacion', 67.0, 'casos', '2024', 'Calamuchita', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('db8fb9f8-e02e-540a-b2d2-9b88d905638f', 'Matrícula - General', 'educacion', 7211.0, 'hab', '2024', 'Calamuchita', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('fa2f014d-b3f3-5035-a140-9b53a3743851', 'Personal docente - General', 'educacion', 627.0, 'hab', '2024', 'Calamuchita', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('720bbdde-dd07-5a56-bd3a-93b85b567408', 'Unidades educativas - General', 'educacion', 59.0, 'casos', '2024', 'Calamuchita', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a94887f5-42c8-5fdf-857a-7950c34351fd', 'Matrícula sector estatal - General', 'educacion', 5834.0, 'hab', '2024', 'Calamuchita', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('fa2f014d-b3f3-5035-a140-9b53a3743851', 'Personal docente - General', 'educacion', 505.0, 'hab', '2024', 'Calamuchita', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('720bbdde-dd07-5a56-bd3a-93b85b567408', 'Unidades educativas - General', 'educacion', 8.0, 'casos', '2024', 'Calamuchita', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('997851f7-e1a7-57dc-bfd1-d53d1728f9e7', 'Matrícula sector privado - General', 'educacion', 1377.0, 'hab', '2024', 'Calamuchita', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('fa2f014d-b3f3-5035-a140-9b53a3743851', 'Personal docente - General', 'educacion', 122.0, 'hab', '2024', 'Calamuchita', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Privado "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b5693912-e951-594b-b0d8-4405e571aa05', 'Unidades educativas - General', 'educacion', 410.0, 'casos', '2024', 'Capital', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4697934f-4562-5b5e-b8b9-d653183bdc30', 'Matrícula - General', 'educacion', 136544.0, 'hab', '2024', 'Capital', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a9d21835-aad3-5a5d-b3f0-0623dd0abf5c', 'Personal docente - General', 'educacion', 11475.0, 'hab', '2024', 'Capital', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b5693912-e951-594b-b0d8-4405e571aa05', 'Unidades educativas - General', 'educacion', 275.0, 'casos', '2024', 'Capital', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('94d8136d-87b3-5ea8-98e8-66bd9e71a6f2', 'Matrícula sector estatal - General', 'educacion', 86906.0, 'hab', '2024', 'Capital', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a9d21835-aad3-5a5d-b3f0-0623dd0abf5c', 'Personal docente - General', 'educacion', 7400.0, 'hab', '2024', 'Capital', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b5693912-e951-594b-b0d8-4405e571aa05', 'Unidades educativas - General', 'educacion', 135.0, 'casos', '2024', 'Capital', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('205f17fa-5f31-5c16-a456-0ad113ed43bb', 'Matrícula sector privado - General', 'educacion', 49638.0, 'hab', '2024', 'Capital', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a9d21835-aad3-5a5d-b3f0-0623dd0abf5c', 'Personal docente - General', 'educacion', 4075.0, 'hab', '2024', 'Capital', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Privado "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('561624e5-3be7-537f-8104-a7a235d4c21b', 'Unidades educativas - General', 'educacion', 100.0, 'casos', '2024', 'Colón', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('66cf3054-43a0-5423-bb4c-af30fe503f94', 'Matrícula - General', 'educacion', 28291.0, 'hab', '2024', 'Colón', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('efb2d041-df64-5f7d-aab9-c896b4bbca59', 'Personal docente - General', 'educacion', 2149.0, 'hab', '2024', 'Colón', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('561624e5-3be7-537f-8104-a7a235d4c21b', 'Unidades educativas - General', 'educacion', 77.0, 'casos', '2024', 'Colón', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ad67dcdf-3b94-58ae-85ed-fd382ffd71a6', 'Matrícula sector estatal - General', 'educacion', 20471.0, 'hab', '2024', 'Colón', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('efb2d041-df64-5f7d-aab9-c896b4bbca59', 'Personal docente - General', 'educacion', 1527.0, 'hab', '2024', 'Colón', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('561624e5-3be7-537f-8104-a7a235d4c21b', 'Unidades educativas - General', 'educacion', 23.0, 'casos', '2024', 'Colón', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e450c9ad-29a0-5613-adeb-74ebf6610e1b', 'Matrícula sector privado - General', 'educacion', 7820.0, 'hab', '2024', 'Colón', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('efb2d041-df64-5f7d-aab9-c896b4bbca59', 'Personal docente - General', 'educacion', 622.0, 'hab', '2024', 'Colón', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Privado "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('300a72ff-f265-51f5-992d-fbd5a46f8ca3', 'Unidades educativas - General', 'educacion', 84.0, 'casos', '2024', 'Cruz del Eje', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e0889c90-8547-5b1c-b6da-37e2d8a5325b', 'Matrícula - General', 'educacion', 6483.0, 'hab', '2024', 'Cruz del Eje', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('515f5a48-256b-5558-babd-c7f4abc7b196', 'Personal docente - General', 'educacion', 704.0, 'hab', '2024', 'Cruz del Eje', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('300a72ff-f265-51f5-992d-fbd5a46f8ca3', 'Unidades educativas - General', 'educacion', 80.0, 'casos', '2024', 'Cruz del Eje', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('76796a2e-b035-5b89-a248-166a1fafcbe6', 'Matrícula sector estatal - General', 'educacion', 5213.0, 'hab', '2024', 'Cruz del Eje', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('515f5a48-256b-5558-babd-c7f4abc7b196', 'Personal docente - General', 'educacion', 602.0, 'hab', '2024', 'Cruz del Eje', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('300a72ff-f265-51f5-992d-fbd5a46f8ca3', 'Unidades educativas - General', 'educacion', 4.0, 'casos', '2024', 'Cruz del Eje', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e1f490af-0804-5094-9ed9-3423ee2bd890', 'Matrícula sector privado - General', 'educacion', 1270.0, 'hab', '2024', 'Cruz del Eje', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('515f5a48-256b-5558-babd-c7f4abc7b196', 'Personal docente - General', 'educacion', 102.0, 'hab', '2024', 'Cruz del Eje', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Privado "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('bf7b0001-b3ad-5172-9c4c-828022db417a', 'Unidades educativas - General', 'educacion', 31.0, 'casos', '2024', 'General Roca', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('828b03bb-7846-56d2-823a-3dd4b0ac6493', 'Matrícula - General', 'educacion', 3272.0, 'hab', '2024', 'General Roca', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('9023a98d-91b3-5e93-a20a-3ca156a5f79d', 'Personal docente - General', 'educacion', 306.0, 'hab', '2024', 'General Roca', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('bf7b0001-b3ad-5172-9c4c-828022db417a', 'Unidades educativas - General', 'educacion', 30.0, 'casos', '2024', 'General Roca', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b3dbbf18-7e96-5305-a01a-83cab5a1680a', 'Matrícula sector estatal - General', 'educacion', 3107.0, 'hab', '2024', 'General Roca', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('9023a98d-91b3-5e93-a20a-3ca156a5f79d', 'Personal docente - General', 'educacion', 295.0, 'hab', '2024', 'General Roca', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

