-- Chunk 0005: INSERTs 251 to 300 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('fec7d396-ab7f-5a15-ac38-b644d8fb40d7', 'Matrícula sector estatal - General', 'educacion', 8860.0, 'hab', '2024', 'Río Segundo', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('54243dcd-6674-596e-aa5a-db346109c345', 'Personal docente - General', 'educacion', 835.0, 'hab', '2024', 'Río Segundo', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('6e306f14-e8d1-5771-a75b-c99b35d9d629', 'Unidades educativas - General', 'educacion', 9.0, 'casos', '2024', 'Río Segundo', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4f61d5f6-720c-5205-b9d3-54ff1654f15a', 'Matrícula sector privado - General', 'educacion', 1877.0, 'hab', '2024', 'Río Segundo', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('54243dcd-6674-596e-aa5a-db346109c345', 'Personal docente - General', 'educacion', 132.0, 'hab', '2024', 'Río Segundo', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Privado "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b044286-7818-5da8-a27a-9ad042cab555', 'Unidades educativas - General', 'educacion', 53.0, 'casos', '2024', 'San Alberto', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a5a59369-0a63-510e-864c-00984d2d7379', 'Matrícula - General', 'educacion', 4004.0, 'hab', '2024', 'San Alberto', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a743e5e3-af6c-5903-9818-0fe29c81231b', 'Personal docente - General', 'educacion', 428.0, 'hab', '2024', 'San Alberto', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b044286-7818-5da8-a27a-9ad042cab555', 'Unidades educativas - General', 'educacion', 51.0, 'casos', '2024', 'San Alberto', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a99862cc-034d-5551-b237-eebd6be29f2b', 'Matrícula sector estatal - General', 'educacion', 3468.0, 'hab', '2024', 'San Alberto', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a743e5e3-af6c-5903-9818-0fe29c81231b', 'Personal docente - General', 'educacion', 393.0, 'hab', '2024', 'San Alberto', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b044286-7818-5da8-a27a-9ad042cab555', 'Unidades educativas - General', 'educacion', 2.0, 'casos', '2024', 'San Alberto', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c47fccea-ff3f-5b3d-bca3-6a2e3376b6ec', 'Matrícula sector privado - General', 'educacion', 536.0, 'hab', '2024', 'San Alberto', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a743e5e3-af6c-5903-9818-0fe29c81231b', 'Personal docente - General', 'educacion', 35.0, 'hab', '2024', 'San Alberto', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Privado "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ad918062-f00e-5efc-ba64-b07c84ff83cf', 'Unidades educativas - General', 'educacion', 52.0, 'casos', '2024', 'San Javier', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('03946f09-5cbb-5255-a0b6-4ea04a786d6c', 'Matrícula - General', 'educacion', 6819.0, 'hab', '2024', 'San Javier', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ff21406a-4651-58be-bcbf-1a8c6ffed12a', 'Personal docente - General', 'educacion', 712.0, 'hab', '2024', 'San Javier', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ad918062-f00e-5efc-ba64-b07c84ff83cf', 'Unidades educativas - General', 'educacion', 48.0, 'casos', '2024', 'San Javier', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f81c764f-a0ed-561f-b7c4-4874e7d9be82', 'Matrícula sector estatal - General', 'educacion', 5695.0, 'hab', '2024', 'San Javier', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ff21406a-4651-58be-bcbf-1a8c6ffed12a', 'Personal docente - General', 'educacion', 620.0, 'hab', '2024', 'San Javier', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ad918062-f00e-5efc-ba64-b07c84ff83cf', 'Unidades educativas - General', 'educacion', 4.0, 'casos', '2024', 'San Javier', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c71e4842-dc86-585d-a3b9-4ca0d3e28228', 'Matrícula sector privado - General', 'educacion', 1124.0, 'hab', '2024', 'San Javier', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ff21406a-4651-58be-bcbf-1a8c6ffed12a', 'Personal docente - General', 'educacion', 92.0, 'hab', '2024', 'San Javier', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Privado "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4cfbeb1c-7ac9-5fa7-8a4e-06e115f1de5f', 'Unidades educativas - General', 'educacion', 171.0, 'casos', '2024', 'San Justo', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a4f50769-481e-56cd-9d03-48e07cefd78c', 'Matrícula - General', 'educacion', 21495.0, 'hab', '2024', 'San Justo', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('bdae2993-bf84-51d6-a414-ff57ac228ee6', 'Personal docente - General', 'educacion', 2095.0, 'hab', '2024', 'San Justo', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4cfbeb1c-7ac9-5fa7-8a4e-06e115f1de5f', 'Unidades educativas - General', 'educacion', 152.0, 'casos', '2024', 'San Justo', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e19fa49e-d776-58ca-8f5d-ffa54fd62b36', 'Matrícula sector estatal - General', 'educacion', 17348.0, 'hab', '2024', 'San Justo', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('bdae2993-bf84-51d6-a414-ff57ac228ee6', 'Personal docente - General', 'educacion', 1776.0, 'hab', '2024', 'San Justo', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4cfbeb1c-7ac9-5fa7-8a4e-06e115f1de5f', 'Unidades educativas - General', 'educacion', 19.0, 'casos', '2024', 'San Justo', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('54280424-5bad-5f8d-81a8-9beafefb82ac', 'Matrícula sector privado - General', 'educacion', 4147.0, 'hab', '2024', 'San Justo', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('bdae2993-bf84-51d6-a414-ff57ac228ee6', 'Personal docente - General', 'educacion', 319.0, 'hab', '2024', 'San Justo', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Privado "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('fba19fb2-2690-5d11-a752-d90d51bfbe91', 'Unidades educativas - General', 'educacion', 67.0, 'casos', '2024', 'Santa María', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1fe91467-f681-5957-a0fc-0f519924fd59', 'Matrícula - General', 'educacion', 12936.0, 'hab', '2024', 'Santa María', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('dbb4ee39-b568-59d2-aa81-3b89701597db', 'Personal docente - General', 'educacion', 1048.0, 'hab', '2024', 'Santa María', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('fba19fb2-2690-5d11-a752-d90d51bfbe91', 'Unidades educativas - General', 'educacion', 56.0, 'casos', '2024', 'Santa María', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('862cba8f-5a6f-5d8b-baf6-f977d736191a', 'Matrícula sector estatal - General', 'educacion', 9715.0, 'hab', '2024', 'Santa María', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('dbb4ee39-b568-59d2-aa81-3b89701597db', 'Personal docente - General', 'educacion', 810.0, 'hab', '2024', 'Santa María', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('fba19fb2-2690-5d11-a752-d90d51bfbe91', 'Unidades educativas - General', 'educacion', 11.0, 'casos', '2024', 'Santa María', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('6e8e23df-153f-5064-8c94-d468e6c88c3e', 'Matrícula sector privado - General', 'educacion', 3221.0, 'hab', '2024', 'Santa María', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('dbb4ee39-b568-59d2-aa81-3b89701597db', 'Personal docente - General', 'educacion', 238.0, 'hab', '2024', 'Santa María', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Privado "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8390d97e-2c83-5440-bc13-4d33fe07729d', 'Unidades educativas - General', 'educacion', 12.0, 'casos', '2024', 'Sobremonte', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c028f87c-47da-506c-a402-57b879226908', 'Matrícula - General', 'educacion', 384.0, 'hab', '2024', 'Sobremonte', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3f32216a-50b4-558e-81ec-49227fab4b09', 'Personal docente - General', 'educacion', 60.0, 'hab', '2024', 'Sobremonte', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8390d97e-2c83-5440-bc13-4d33fe07729d', 'Unidades educativas - General', 'educacion', 12.0, 'casos', '2024', 'Sobremonte', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f0cd2ece-d999-5104-8014-4004c5f850ef', 'Matrícula sector estatal - General', 'educacion', 384.0, 'hab', '2024', 'Sobremonte', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3f32216a-50b4-558e-81ec-49227fab4b09', 'Personal docente - General', 'educacion', 60.0, 'hab', '2024', 'Sobremonte', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8390d97e-2c83-5440-bc13-4d33fe07729d', 'Unidades educativas - General', 'educacion', 0.0, 'casos', '2024', 'Sobremonte', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b0712f23-6474-5720-85a0-5e1b65cc9620', 'Unidades educativas - General', 'educacion', 68.0, 'casos', '2024', 'Tercero Arriba', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('767e7da3-6ef4-56aa-805f-da112447b9b1', 'Matrícula - General', 'educacion', 11043.0, 'hab', '2024', 'Tercero Arriba', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

