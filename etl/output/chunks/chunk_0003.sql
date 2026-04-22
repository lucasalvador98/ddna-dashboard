-- Chunk 0003: INSERTs 151 to 200 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('bf7b0001-b3ad-5172-9c4c-828022db417a', 'Unidades educativas - General', 'educacion', 1.0, 'casos', '2024', 'General Roca', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('9c5e43fd-7a79-5314-a743-80d434fadccc', 'Matrícula sector privado - General', 'educacion', 165.0, 'hab', '2024', 'General Roca', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('9023a98d-91b3-5e93-a20a-3ca156a5f79d', 'Personal docente - General', 'educacion', 11.0, 'hab', '2024', 'General Roca', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Privado "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1aa591b2-a21c-550e-a930-9918f711a85f', 'Unidades educativas - General', 'educacion', 80.0, 'casos', '2024', 'General San Martín', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('9dfddf0a-dbb4-573e-bc9c-5fe789d99802', 'Matrícula - General', 'educacion', 15071.0, 'hab', '2024', 'General San Martín', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51b91dee-cb4f-5f9d-b9ca-985a251455ec', 'Personal docente - General', 'educacion', 1265.0, 'hab', '2024', 'General San Martín', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1aa591b2-a21c-550e-a930-9918f711a85f', 'Unidades educativas - General', 'educacion', 71.0, 'casos', '2024', 'General San Martín', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('decd9253-e0f5-5c9f-ae26-3978fc07bd84', 'Matrícula sector estatal - General', 'educacion', 10306.0, 'hab', '2024', 'General San Martín', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51b91dee-cb4f-5f9d-b9ca-985a251455ec', 'Personal docente - General', 'educacion', 912.0, 'hab', '2024', 'General San Martín', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1aa591b2-a21c-550e-a930-9918f711a85f', 'Unidades educativas - General', 'educacion', 9.0, 'casos', '2024', 'General San Martín', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d8e66e5f-e168-53b2-b6c6-ea8efb92739d', 'Matrícula sector privado - General', 'educacion', 4765.0, 'hab', '2024', 'General San Martín', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51b91dee-cb4f-5f9d-b9ca-985a251455ec', 'Personal docente - General', 'educacion', 353.0, 'hab', '2024', 'General San Martín', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Privado "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b9021401-93f4-5257-9361-7332eb9548e4', 'Unidades educativas - General', 'educacion', 42.0, 'casos', '2024', 'Ischilín', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('632ca84e-1417-58dc-b438-204dd4fe454e', 'Matrícula - General', 'educacion', 3528.0, 'hab', '2024', 'Ischilín', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('fba8d455-cb32-5f31-95f8-4196fd9a8a1a', 'Personal docente - General', 'educacion', 430.0, 'hab', '2024', 'Ischilín', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b9021401-93f4-5257-9361-7332eb9548e4', 'Unidades educativas - General', 'educacion', 41.0, 'casos', '2024', 'Ischilín', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('477d1b65-4293-50ff-9beb-1cd25527545c', 'Matrícula sector estatal - General', 'educacion', 3316.0, 'hab', '2024', 'Ischilín', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('fba8d455-cb32-5f31-95f8-4196fd9a8a1a', 'Personal docente - General', 'educacion', 410.0, 'hab', '2024', 'Ischilín', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b9021401-93f4-5257-9361-7332eb9548e4', 'Unidades educativas - General', 'educacion', 1.0, 'casos', '2024', 'Ischilín', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('da1bb6fc-3379-5338-932c-3919ffeeb5e5', 'Matrícula sector privado - General', 'educacion', 212.0, 'hab', '2024', 'Ischilín', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('fba8d455-cb32-5f31-95f8-4196fd9a8a1a', 'Personal docente - General', 'educacion', 20.0, 'hab', '2024', 'Ischilín', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Privado "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b1d04613-fe46-5427-9d92-1fd3d2c5ae3c', 'Unidades educativas - General', 'educacion', 52.0, 'casos', '2024', 'Juárez Celman', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d34c6f9e-74c4-5a55-b2cb-1b91f3f56ecd', 'Matrícula - General', 'educacion', 6412.0, 'hab', '2024', 'Juárez Celman', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('16a35b14-d5af-5689-bb86-3369a368f833', 'Personal docente - General', 'educacion', 555.0, 'hab', '2024', 'Juárez Celman', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b1d04613-fe46-5427-9d92-1fd3d2c5ae3c', 'Unidades educativas - General', 'educacion', 49.0, 'casos', '2024', 'Juárez Celman', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('67092b49-7ae5-518a-a001-3ad3c523cb89', 'Matrícula sector estatal - General', 'educacion', 5510.0, 'hab', '2024', 'Juárez Celman', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('16a35b14-d5af-5689-bb86-3369a368f833', 'Personal docente - General', 'educacion', 485.0, 'hab', '2024', 'Juárez Celman', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b1d04613-fe46-5427-9d92-1fd3d2c5ae3c', 'Unidades educativas - General', 'educacion', 3.0, 'casos', '2024', 'Juárez Celman', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b618cbfc-4635-5c85-abd7-4627356f2a78', 'Matrícula sector privado - General', 'educacion', 902.0, 'hab', '2024', 'Juárez Celman', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('16a35b14-d5af-5689-bb86-3369a368f833', 'Personal docente - General', 'educacion', 70.0, 'hab', '2024', 'Juárez Celman', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Privado "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f432fa45-5be3-558e-bb69-5505b5551c66', 'Unidades educativas - General', 'educacion', 81.0, 'casos', '2024', 'Marcos Juárez', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('334d88a2-7e69-5a80-8aa4-e9202e0f4d25', 'Matrícula - General', 'educacion', 9188.0, 'hab', '2024', 'Marcos Juárez', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d092b5bd-708c-57be-a277-9fdfaf30b5a0', 'Personal docente - General', 'educacion', 908.0, 'hab', '2024', 'Marcos Juárez', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f432fa45-5be3-558e-bb69-5505b5551c66', 'Unidades educativas - General', 'educacion', 69.0, 'casos', '2024', 'Marcos Juárez', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('55746c12-1a4e-577d-aae4-db49bf7d8afa', 'Matrícula sector estatal - General', 'educacion', 7222.0, 'hab', '2024', 'Marcos Juárez', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d092b5bd-708c-57be-a277-9fdfaf30b5a0', 'Personal docente - General', 'educacion', 753.0, 'hab', '2024', 'Marcos Juárez', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f432fa45-5be3-558e-bb69-5505b5551c66', 'Unidades educativas - General', 'educacion', 12.0, 'casos', '2024', 'Marcos Juárez', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e0e459df-7061-5379-9f89-074bdbde9b05', 'Matrícula sector privado - General', 'educacion', 1966.0, 'hab', '2024', 'Marcos Juárez', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d092b5bd-708c-57be-a277-9fdfaf30b5a0', 'Personal docente - General', 'educacion', 155.0, 'hab', '2024', 'Marcos Juárez', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Privado "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d98c4e17-94b4-5f80-ba11-82659aa5318e', 'Unidades educativas - General', 'educacion', 22.0, 'casos', '2024', 'Minas', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('2f91c2fd-d9be-53e4-ad47-f6540dd5102f', 'Matrícula - General', 'educacion', 383.0, 'hab', '2024', 'Minas', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('97577660-c98d-512a-898c-640b1e44914a', 'Personal docente - General', 'educacion', 96.0, 'hab', '2024', 'Minas', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d98c4e17-94b4-5f80-ba11-82659aa5318e', 'Unidades educativas - General', 'educacion', 22.0, 'casos', '2024', 'Minas', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ab0713f7-6919-5274-8eea-77678b0c8d58', 'Matrícula sector estatal - General', 'educacion', 383.0, 'hab', '2024', 'Minas', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('97577660-c98d-512a-898c-640b1e44914a', 'Personal docente - General', 'educacion', 96.0, 'hab', '2024', 'Minas', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d98c4e17-94b4-5f80-ba11-82659aa5318e', 'Unidades educativas - General', 'educacion', 0.0, 'casos', '2024', 'Minas', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1e75651d-b7b2-5ec0-9717-9fcb6683cf2b', 'Unidades educativas - General', 'educacion', 28.0, 'casos', '2024', 'Pocho', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e78015da-f100-5650-8ecd-6c79cd953efe', 'Matrícula - General', 'educacion', 366.0, 'hab', '2024', 'Pocho', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('57a47be7-6246-505a-993f-db4537e2c865', 'Personal docente - General', 'educacion', 106.0, 'hab', '2024', 'Pocho', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1e75651d-b7b2-5ec0-9717-9fcb6683cf2b', 'Unidades educativas - General', 'educacion', 28.0, 'casos', '2024', 'Pocho', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

