-- Chunk 0006: INSERTs 301 to 350 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('9c1e172b-18dd-5599-852c-700e7bb6b941', 'Personal docente - General', 'educacion', 1084.0, 'hab', '2024', 'Tercero Arriba', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b0712f23-6474-5720-85a0-5e1b65cc9620', 'Unidades educativas - General', 'educacion', 58.0, 'casos', '2024', 'Tercero Arriba', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5255f330-1f41-5acc-b685-42d5e15b2c4f', 'Matrícula sector estatal - General', 'educacion', 8686.0, 'hab', '2024', 'Tercero Arriba', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('9c1e172b-18dd-5599-852c-700e7bb6b941', 'Personal docente - General', 'educacion', 887.0, 'hab', '2024', 'Tercero Arriba', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b0712f23-6474-5720-85a0-5e1b65cc9620', 'Unidades educativas - General', 'educacion', 10.0, 'casos', '2024', 'Tercero Arriba', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c1ea7c70-b765-571b-ae88-bf7c542f5340', 'Matrícula sector privado - General', 'educacion', 2357.0, 'hab', '2024', 'Tercero Arriba', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('9c1e172b-18dd-5599-852c-700e7bb6b941', 'Personal docente - General', 'educacion', 197.0, 'hab', '2024', 'Tercero Arriba', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Privado "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c606853c-f2b8-58b9-8211-762cbe457915', 'Unidades educativas - General', 'educacion', 33.0, 'casos', '2024', 'Totoral', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4c7ebe9b-bac6-5d23-b172-bb03450f78f4', 'Matrícula - General', 'educacion', 2002.0, 'hab', '2024', 'Totoral', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('9e95ddaa-d87f-5127-829a-573b4d7343cd', 'Personal docente - General', 'educacion', 255.0, 'hab', '2024', 'Totoral', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c606853c-f2b8-58b9-8211-762cbe457915', 'Unidades educativas - General', 'educacion', 33.0, 'casos', '2024', 'Totoral', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f0217fc5-22fc-5623-826a-eb3302321449', 'Matrícula sector estatal - General', 'educacion', 2002.0, 'hab', '2024', 'Totoral', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('9e95ddaa-d87f-5127-829a-573b4d7343cd', 'Personal docente - General', 'educacion', 255.0, 'hab', '2024', 'Totoral', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c606853c-f2b8-58b9-8211-762cbe457915', 'Unidades educativas - General', 'educacion', 0.0, 'casos', '2024', 'Totoral', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5ddab811-6490-5448-ab1b-7663d43f82c1', 'Unidades educativas - General', 'educacion', 41.0, 'casos', '2024', 'Tulumba', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ff0370ea-3bf8-5be6-8c77-17320bd7a3eb', 'Matrícula - General', 'educacion', 1139.0, 'hab', '2024', 'Tulumba', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c731cc57-40f6-5acc-990a-1b6872d42c4b', 'Personal docente - General', 'educacion', 224.0, 'hab', '2024', 'Tulumba', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5ddab811-6490-5448-ab1b-7663d43f82c1', 'Unidades educativas - General', 'educacion', 41.0, 'casos', '2024', 'Tulumba', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('2bf8a2aa-7f52-5e73-b337-4385d4f3bd47', 'Matrícula sector estatal - General', 'educacion', 1139.0, 'hab', '2024', 'Tulumba', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c731cc57-40f6-5acc-990a-1b6872d42c4b', 'Personal docente - General', 'educacion', 224.0, 'hab', '2024', 'Tulumba', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5ddab811-6490-5448-ab1b-7663d43f82c1', 'Unidades educativas - General', 'educacion', 0.0, 'casos', '2024', 'Tulumba', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('161ef14a-e0bc-5618-8fb4-7e56cf06b185', 'Unidades educativas - General', 'educacion', 98.0, 'casos', '2024', 'Unión', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('799d23f7-be91-5c23-9396-792d092def87', 'Matrícula - General', 'educacion', 10213.0, 'hab', '2024', 'Unión', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('61842cba-b0c5-54d5-8230-06731d404aa6', 'Personal docente - General', 'educacion', 1081.0, 'hab', '2024', 'Unión', '{"nivel_educativo": "General", "sector": "total", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Total"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('161ef14a-e0bc-5618-8fb4-7e56cf06b185', 'Unidades educativas - General', 'educacion', 87.0, 'casos', '2024', 'Unión', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativasEstatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('db236fc4-011d-5482-b275-73f62e027ab6', 'Matrícula sector estatal - General', 'educacion', 7792.0, 'hab', '2024', 'Unión', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Estatal"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('61842cba-b0c5-54d5-8230-06731d404aa6', 'Personal docente - General', 'educacion', 909.0, 'hab', '2024', 'Unión', '{"nivel_educativo": "General", "sector": "estatal", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Estatal "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('161ef14a-e0bc-5618-8fb4-7e56cf06b185', 'Unidades educativas - General', 'educacion', 11.0, 'casos', '2024', 'Unión', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Unidades educativas Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('2054d252-7b60-58ba-a824-5d56d8e1a1c7', 'Matrícula sector privado - General', 'educacion', 2421.0, 'hab', '2024', 'Unión', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Alumnos Privado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('61842cba-b0c5-54d5-8230-06731d404aa6', 'Personal docente - General', 'educacion', 172.0, 'hab', '2024', 'Unión', '{"nivel_educativo": "General", "sector": "privado", "fuente": "Operativo Aprender", "archivo": "Educacion Provincia.xlsx", "hoja": "Sheet1", "campo_original": "Personal docente Privado "}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


-- ============================================================
-- DATOS: INVERSION (6164 registros)
-- ============================================================

INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b8d59b9-35cb-598f-977b-c88dd724f8e3', 'Inversion social en infancia', 'inversion', 9289886.922, 'Md', '2024', '101 - Dependencia Inmediata Del Poder Ejecutivo', '{"programa": "108 - Ayuda Directa A La Comunidad", "jurisdiccion": "101 - Dependencia Inmediata Del Poder Ejecutivo", "categoria": "Emergencia"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b1cd56ac-ced8-5629-bc22-1f0107ca8bd0', 'Inversion social en infancia', 'inversion', 32040463.08, 'Md', '2024', '103 - Secretaría De Cultura', '{"programa": "30 - Secretar\u00eda De Cultura", "jurisdiccion": "103 - Secretar\u00eda De Cultura", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b1cd56ac-ced8-5629-bc22-1f0107ca8bd0', 'Inversion social en infancia', 'inversion', 761044.3672, 'Md', '2024', '103 - Secretaría De Cultura', '{"programa": "31 - Cultura - Recursos Afectados", "jurisdiccion": "103 - Secretar\u00eda De Cultura", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('893fb0dd-0baf-5ca5-b6cd-1940001b6e80', 'Inversion social en infancia', 'inversion', 1263617.951, 'Md', '2024', '104 - Secretaría De Ambiente', '{"programa": "41 - Ambiente", "jurisdiccion": "104 - Secretar\u00eda De Ambiente", "categoria": "Agua potable y alcantarillado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('893fb0dd-0baf-5ca5-b6cd-1940001b6e80', 'Inversion social en infancia', 'inversion', 3238805.708, 'Md', '2024', '104 - Secretaría De Ambiente', '{"programa": "560 - (C.E) Fondo Para La Gestion De Residuos S\u00f3lidos Urbanos Ley N\u00b0 9088", "jurisdiccion": "104 - Secretar\u00eda De Ambiente", "categoria": "Otros Servicios Urbanos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3f622548-e7aa-55d7-b1db-e9416bc1ea80', 'Inversion social en infancia', 'inversion', 20019553.0, 'Md', '2024', '105 - Secretaría De La Mujer, Niñez, Adolescencia ', '{"programa": "671 - (C.E.) Pol\u00edticas De Asistencia A Ni\u00f1os Y Adolescentes - Cuenta Especial Ley 8665", "jurisdiccion": "105 - Secretar\u00eda De La Mujer, Ni\u00f1ez, Adolescencia Y Familia", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3f622548-e7aa-55d7-b1db-e9416bc1ea80', 'Inversion social en infancia', 'inversion', 8611276.0, 'Md', '2024', '105 - Secretaría De La Mujer, Niñez, Adolescencia ', '{"programa": "672 - (C.E.) El Ni\u00f1o Y El Adolescente En Conflicto Con La Ley Penal - Cuenta Especial Ley 8665", "jurisdiccion": "105 - Secretar\u00eda De La Mujer, Ni\u00f1ez, Adolescencia Y Familia", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3f622548-e7aa-55d7-b1db-e9416bc1ea80', 'Inversion social en infancia', 'inversion', 113563841.0, 'Md', '2024', '105 - Secretaría De La Mujer, Niñez, Adolescencia ', '{"programa": "673 - Ni\u00f1ez, Adolescencia Y Familia - Actividades Comunes", "jurisdiccion": "105 - Secretar\u00eda De La Mujer, Ni\u00f1ez, Adolescencia Y Familia", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3f622548-e7aa-55d7-b1db-e9416bc1ea80', 'Inversion social en infancia', 'inversion', 3846000.0, 'Md', '2024', '105 - Secretaría De La Mujer, Niñez, Adolescencia ', '{"programa": "676 - (C.E.) Organismos De Gesti\u00f3n Asistida (Ogas) - Cuenta Especial Ley 8665", "jurisdiccion": "105 - Secretar\u00eda De La Mujer, Ni\u00f1ez, Adolescencia Y Familia", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3caf5e9e-147b-59ef-b592-c6462580e68e', 'Inversion social en infancia', 'inversion', 219901.1275, 'Md', '2024', '110 - Ministerio De Gobierno', '{"programa": "116 - Relaci\u00f3n Y Apoyo Con O.N.G. Y Municipios", "jurisdiccion": "110 - Ministerio De Gobierno", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3caf5e9e-147b-59ef-b592-c6462580e68e', 'Inversion social en infancia', 'inversion', 357600.2073, 'Md', '2024', '110 - Ministerio De Gobierno', '{"programa": "135 - Obras De Infraestructura Social Ba\u0301sica En La Ciudad De Co\u0301rdoba ", "jurisdiccion": "110 - Ministerio De Gobierno", "categoria": "Agua potable y alcantarillado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3caf5e9e-147b-59ef-b592-c6462580e68e', 'Inversion social en infancia', 'inversion', 2248291.0, 'Md', '2024', '110 - Ministerio De Gobierno', '{"programa": "681 - Asistencia Y Prevenci\u00f3n De La Adicci\u00f3n", "jurisdiccion": "110 - Ministerio De Gobierno", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('62936626-08dd-5a1c-beb2-cca53a5b68e4', 'Inversion social en infancia', 'inversion', 20394.0, 'Md', '2024', '120 - Ministerio De Industria, Comercio Y Trabajo', '{"programa": "220 - Erradicaci\u00f3n Progresiva Del Trabajo Infantil", "jurisdiccion": "120 - Ministerio De Industria, Comercio Y Trabajo", "categoria": "Trabajo infantil"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8d8a14d2-294d-53d7-9b50-35f9780b81d4', 'Inversion social en infancia', 'inversion', 5326045.042, 'Md', '2024', '130 - Ministerio De Ciencia Y Tecnología', '{"programa": "300 - Ciencia Y Tecnolog\u00eda", "jurisdiccion": "130 - Ministerio De Ciencia Y Tecnolog\u00eda", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8d8a14d2-294d-53d7-9b50-35f9780b81d4', 'Inversion social en infancia', 'inversion', 106441.0891, 'Md', '2024', '130 - Ministerio De Ciencia Y Tecnología', '{"programa": "313 - Divulgaci\u00f3n Y Ense\u00f1anza De La Ciencia Y La Tecnolog\u00eda", "jurisdiccion": "130 - Ministerio De Ciencia Y Tecnolog\u00eda", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 137007463.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "350 - Ministerio De Educaci\u00f3n", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 780014046.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "352 - Fondo Para El Financiamiento Del Sistema Educativo De La Provincia De Cordoba - Ley N\u00ba 9870", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 5592277.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "353 - Infraestructura Escuelas", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 1181457813.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "354 - Educaci\u00f3n Inicial Y Primaria", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 427571424.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "356 - Educaci\u00f3n Secundaria", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

