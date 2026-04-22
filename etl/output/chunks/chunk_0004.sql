-- Chunk 0004: INSERTs 201 to 250 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('321898d1-4734-5892-ad78-ec7e5c2f2a41', 'Matrícula sector estatal - General', 'educacion', 366.0, 'hab', '2024', 'Pocho', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('57a47be7-6246-505a-993f-db4537e2c865', 'Personal docente - General', 'educacion', 106.0, 'hab', '2024', 'Pocho', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1e75651d-b7b2-5ec0-9717-9fcb6683cf2b', 'Unidades educativas - General', 'educacion', 0.0, 'casos', '2024', 'Pocho', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8cecfe73-b0be-5b07-99a5-f05ca5e5e886', 'Unidades educativas - General', 'educacion', 33.0, 'casos', '2024', 'Pte. Roque Sáenz Peña', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('81b077d3-4868-5c9e-b635-169696dc50ee', 'Matrícula - General', 'educacion', 3514.0, 'hab', '2024', 'Pte. Roque Sáenz Peña', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a6c9f796-eccf-5618-8bfc-a543061c3dc5', 'Personal docente - General', 'educacion', 341.0, 'hab', '2024', 'Pte. Roque Sáenz Peña', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8cecfe73-b0be-5b07-99a5-f05ca5e5e886', 'Unidades educativas - General', 'educacion', 31.0, 'casos', '2024', 'Pte. Roque Sáenz Peña', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('170441f5-a387-5572-bf6c-344bbeecf964', 'Matrícula sector estatal - General', 'educacion', 3182.0, 'hab', '2024', 'Pte. Roque Sáenz Peña', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a6c9f796-eccf-5618-8bfc-a543061c3dc5', 'Personal docente - General', 'educacion', 311.0, 'hab', '2024', 'Pte. Roque Sáenz Peña', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8cecfe73-b0be-5b07-99a5-f05ca5e5e886', 'Unidades educativas - General', 'educacion', 2.0, 'casos', '2024', 'Pte. Roque Sáenz Peña', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f0f02d2c-95ea-553b-95a8-e3f06acaf1da', 'Matrícula sector privado - General', 'educacion', 332.0, 'hab', '2024', 'Pte. Roque Sáenz Peña', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a6c9f796-eccf-5618-8bfc-a543061c3dc5', 'Personal docente - General', 'educacion', 30.0, 'hab', '2024', 'Pte. Roque Sáenz Peña', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Privado "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('7e890458-38f8-5c8f-98b7-1c061dbb227d', 'Unidades educativas - General', 'educacion', 79.0, 'casos', '2024', 'Punilla', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('57880404-aa53-5fa7-b984-06c5f9cade75', 'Matrícula - General', 'educacion', 20389.0, 'hab', '2024', 'Punilla', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a0c47ec0-7f8e-5f27-a3ae-75ac754dae44', 'Personal docente - General', 'educacion', 1520.0, 'hab', '2024', 'Punilla', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('7e890458-38f8-5c8f-98b7-1c061dbb227d', 'Unidades educativas - General', 'educacion', 57.0, 'casos', '2024', 'Punilla', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ff4682b9-5c8d-58b9-8e15-32d424f40086', 'Matrícula sector estatal - General', 'educacion', 14551.0, 'hab', '2024', 'Punilla', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a0c47ec0-7f8e-5f27-a3ae-75ac754dae44', 'Personal docente - General', 'educacion', 1087.0, 'hab', '2024', 'Punilla', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('7e890458-38f8-5c8f-98b7-1c061dbb227d', 'Unidades educativas - General', 'educacion', 22.0, 'casos', '2024', 'Punilla', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e8b448b8-5add-57ee-8c13-dad24bb7ee2e', 'Matrícula sector privado - General', 'educacion', 5838.0, 'hab', '2024', 'Punilla', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a0c47ec0-7f8e-5f27-a3ae-75ac754dae44', 'Personal docente - General', 'educacion', 433.0, 'hab', '2024', 'Punilla', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Privado "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8eb29ab2-081e-5d08-a807-848a715c292e', 'Unidades educativas - General', 'educacion', 155.0, 'casos', '2024', 'Río Cuarto', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('96b16573-8752-51e4-a885-ffad3ac50ecc', 'Matrícula - General', 'educacion', 25965.0, 'hab', '2024', 'Río Cuarto', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b02f109-3d01-5bed-a010-7a2566197284', 'Personal docente - General', 'educacion', 2176.0, 'hab', '2024', 'Río Cuarto', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8eb29ab2-081e-5d08-a807-848a715c292e', 'Unidades educativas - General', 'educacion', 127.0, 'casos', '2024', 'Río Cuarto', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('adf134d4-0888-5d3f-9e09-cc2601188031', 'Matrícula sector estatal - General', 'educacion', 18625.0, 'hab', '2024', 'Río Cuarto', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b02f109-3d01-5bed-a010-7a2566197284', 'Personal docente - General', 'educacion', 1557.0, 'hab', '2024', 'Río Cuarto', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8eb29ab2-081e-5d08-a807-848a715c292e', 'Unidades educativas - General', 'educacion', 28.0, 'casos', '2024', 'Río Cuarto', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('7436f001-1642-5245-b434-8b98e2ca9320', 'Matrícula sector privado - General', 'educacion', 7340.0, 'hab', '2024', 'Río Cuarto', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b02f109-3d01-5bed-a010-7a2566197284', 'Personal docente - General', 'educacion', 619.0, 'hab', '2024', 'Río Cuarto', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Privado "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('9ec7a6b2-7ed6-5eed-b56b-e3f86fbeb5ad', 'Unidades educativas - General', 'educacion', 73.0, 'casos', '2024', 'Río Primero', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ac93ddbe-f9bd-5895-bcd3-a4755b9709a4', 'Matrícula - General', 'educacion', 5445.0, 'hab', '2024', 'Río Primero', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('7f77214c-70fb-50da-abcc-b1e6d23791ed', 'Personal docente - General', 'educacion', 579.0, 'hab', '2024', 'Río Primero', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('9ec7a6b2-7ed6-5eed-b56b-e3f86fbeb5ad', 'Unidades educativas - General', 'educacion', 69.0, 'casos', '2024', 'Río Primero', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('45fcf1ed-0692-55f7-9421-e42348153865', 'Matrícula sector estatal - General', 'educacion', 4543.0, 'hab', '2024', 'Río Primero', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('7f77214c-70fb-50da-abcc-b1e6d23791ed', 'Personal docente - General', 'educacion', 500.0, 'hab', '2024', 'Río Primero', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('9ec7a6b2-7ed6-5eed-b56b-e3f86fbeb5ad', 'Unidades educativas - General', 'educacion', 4.0, 'casos', '2024', 'Río Primero', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('98ad321a-48d3-53db-89f9-a7c51eb50221', 'Matrícula sector privado - General', 'educacion', 902.0, 'hab', '2024', 'Río Primero', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('7f77214c-70fb-50da-abcc-b1e6d23791ed', 'Personal docente - General', 'educacion', 79.0, 'hab', '2024', 'Río Primero', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Privado "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('bf946056-0a4e-528c-8d1b-5cace0375d75', 'Unidades educativas - General', 'educacion', 37.0, 'casos', '2024', 'Río Seco', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1f0ee300-e000-51bf-966b-364efa538e94', 'Matrícula - General', 'educacion', 1526.0, 'hab', '2024', 'Río Seco', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4a59f026-d3aa-5c2c-95c5-901d57f9bceb', 'Personal docente - General', 'educacion', 229.0, 'hab', '2024', 'Río Seco', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('bf946056-0a4e-528c-8d1b-5cace0375d75', 'Unidades educativas - General', 'educacion', 37.0, 'casos', '2024', 'Río Seco', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('907dfe01-eb15-583e-a999-cada500e5075', 'Matrícula sector estatal - General', 'educacion', 1526.0, 'hab', '2024', 'Río Seco', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4a59f026-d3aa-5c2c-95c5-901d57f9bceb', 'Personal docente - General', 'educacion', 229.0, 'hab', '2024', 'Río Seco', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('bf946056-0a4e-528c-8d1b-5cace0375d75', 'Unidades educativas - General', 'educacion', 0.0, 'casos', '2024', 'Río Seco', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('6e306f14-e8d1-5771-a75b-c99b35d9d629', 'Unidades educativas - General', 'educacion', 73.0, 'casos', '2024', 'Río Segundo', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e9c60fa1-ab51-5f8e-a79c-1a3d66a83c2a', 'Matrícula - General', 'educacion', 10737.0, 'hab', '2024', 'Río Segundo', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('54243dcd-6674-596e-aa5a-db346109c345', 'Personal docente - General', 'educacion', 967.0, 'hab', '2024', 'Río Segundo', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('6e306f14-e8d1-5771-a75b-c99b35d9d629', 'Unidades educativas - General', 'educacion', 64.0, 'casos', '2024', 'Río Segundo', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

