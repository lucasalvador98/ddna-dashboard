-- Chunk 0029: INSERTs 1451 to 1500 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('7af68d9c-2635-55de-9dcb-1b31b7be7d4a', 'Inversion social en infancia', 'inversion', 4248993541.0, 'Md', '2024', '710 - Administración Provincial Del Seguro De Salu', '{"programa": "000 - Prestaciones a la seguridad social", "jurisdiccion": "710 - Administraci\u00f3n Provincial Del Seguro De Salud", "categoria": "Obras sociales"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('7b544ca0-4f04-5b82-b886-3caade35c851', 'Inversion social en infancia', 'inversion', 1053767.233, 'Md', '2024', '866 - Universidad Provincial De Córdoba', '{"programa": "920 - Polo Cultural Y Recreativo", "jurisdiccion": "866 - Universidad Provincial De C\u00f3rdoba", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 45171916.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "960 - (C.E.) Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes - Cuenta Especial Ley 8665", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 2063318.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "961 - (C.E.) Mesas De Trabajo - Cuenta Especial Ley 8665", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 876929.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "962 - (C.E.) Capacitaciones - Cuenta Especial Ley 8665", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 3562337.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "963 - (C.E.) Difusi\u00f3n - Cuenta Especial Ley 8665", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 58532.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "964 - (C.E.) Acciones Intersectoriales- Cuenta Especial Ley 8665- ", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 145000.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "965 - (C.E.) Monitoreo De Derechos- Cuenta Especial Ley 8665- ", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 3363825.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "966 - Sistema Integral De Monitoreo De Los Derechos De Nin\u0303as, Nin\u0303os Y Adolescentes ", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d9f0dc17-5114-57ac-a3ed-f66a5c2d6699', 'Inversion social en infancia', 'inversion', 46928408.92, 'Md', '2024', '103 - Ministerio de Coordinación', '{"programa": "602 - Boleto Educativo Gratuito (B.E.G) - Ley 10031", "jurisdiccion": "103 - Ministerio de Coordinaci\u00f3n", "categoria": "Transporte escolar"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d9f0dc17-5114-57ac-a3ed-f66a5c2d6699', 'Inversion social en infancia', 'inversion', 15393911.03, 'Md', '2024', '103 - Ministerio de Coordinación', '{"programa": "603 - Boleto Obrero Social (B.O.S.) - Decreto N\u00b0 272/2015", "jurisdiccion": "103 - Ministerio de Coordinaci\u00f3n", "categoria": "Transferencias de ingresos a las familias"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d9f0dc17-5114-57ac-a3ed-f66a5c2d6699', 'Inversion social en infancia', 'inversion', 12744851.55, 'Md', '2024', '103 - Ministerio de Coordinación', '{"programa": "610 - Boleto Social Cordobes (Bsc)- Decreto N\u00b0 779/2017", "jurisdiccion": "103 - Ministerio de Coordinaci\u00f3n", "categoria": "Transferencias de ingresos a las familias"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a611750b-c76d-593b-9a88-d81d6d86b091', 'Inversion social en infancia', 'inversion', 124966636.8, 'Md', '2024', '105 - Secretaría De Equidad Y Promoción Del Empleo', '{"programa": "647 - Programas De Empleo Y Becas Acad\u00e9micas", "jurisdiccion": "105 - Secretar\u00eda De Equidad Y Promoci\u00f3n Del Empleo", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a611750b-c76d-593b-9a88-d81d6d86b091', 'Inversion social en infancia', 'inversion', 430173399.0, 'Md', '2024', '105 - Secretaría De Equidad Y Promoción Del Empleo', '{"programa": "649 - Salas Cunas", "jurisdiccion": "105 - Secretar\u00eda De Equidad Y Promoci\u00f3n Del Empleo", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a611750b-c76d-593b-9a88-d81d6d86b091', 'Inversion social en infancia', 'inversion', 3887674.461, 'Md', '2024', '105 - Secretaría De Equidad Y Promoción Del Empleo', '{"programa": "656 - Banco De La Gente", "jurisdiccion": "105 - Secretar\u00eda De Equidad Y Promoci\u00f3n Del Empleo", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a611750b-c76d-593b-9a88-d81d6d86b091', 'Inversion social en infancia', 'inversion', 153285234.0, 'Md', '2024', '105 - Secretaría De Equidad Y Promoción Del Empleo', '{"programa": "666 - C\u00f3rdoba Con Ellas", "jurisdiccion": "105 - Secretar\u00eda De Equidad Y Promoci\u00f3n Del Empleo", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d63eaf87-a58f-5c26-83ee-9861b1b19b97', 'Inversion social en infancia', 'inversion', 9168827.0, 'Md', '2024', '107 - Ministerio de la Mujer', '{"programa": "012 - Funcionamiento Del Consejo Provincial De Las Mujeres - Actividades Centrales", "jurisdiccion": "107 - Ministerio de la Mujer", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d63eaf87-a58f-5c26-83ee-9861b1b19b97', 'Inversion social en infancia', 'inversion', 9793.961767, 'Md', '2024', '107 - Ministerio de la Mujer', '{"programa": "015 - Programa De Capacitaci\u00f3n Y Promoci\u00f3n Social", "jurisdiccion": "107 - Ministerio de la Mujer", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d63eaf87-a58f-5c26-83ee-9861b1b19b97', 'Inversion social en infancia', 'inversion', 480684106.0, 'Md', '2024', '107 - Ministerio de la Mujer', '{"programa": "70 - Prevenci\u00f3n, Detecci\u00f3n Y Erradicaci\u00f3n De La Violencia Familiar, De G\u00e9nero Y Trata De Personas.", "jurisdiccion": "107 - Ministerio de la Mujer", "categoria": "Violencia familiar"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('091f7a26-19d5-59c5-8467-b47a71c8df6c', 'Inversion social en infancia', 'inversion', 47719188.14, 'Md', '2024', '120 - Secretaría General De La Gobernación', '{"programa": "108 - Ayuda Directa A La Comunidad", "jurisdiccion": "120 - Secretar\u00eda General De La Gobernaci\u00f3n", "categoria": "Emergencia"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('091f7a26-19d5-59c5-8467-b47a71c8df6c', 'Inversion social en infancia', 'inversion', 179311510.8, 'Md', '2024', '120 - Secretaría General De La Gobernación', '{"programa": "208 - Fondo Permanente Para La Atenci\u00f3n De Situaciones De Desastres", "jurisdiccion": "120 - Secretar\u00eda General De La Gobernaci\u00f3n", "categoria": "Emergencia"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('091f7a26-19d5-59c5-8467-b47a71c8df6c', 'Inversion social en infancia', 'inversion', 5796653097.0, 'Md', '2024', '120 - Secretaría General De La Gobernación', '{"programa": "213 - (P.A.I.Cor.) Programa Asistencia Integral C\u00f3rdoba", "jurisdiccion": "120 - Secretar\u00eda General De La Gobernaci\u00f3n", "categoria": "Comedores escolares y copa de leche"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8d8a14d2-294d-53d7-9b50-35f9780b81d4', 'Inversion social en infancia', 'inversion', 30653204.84, 'Md', '2024', '130 - Ministerio De Ciencia Y Tecnología', '{"programa": "300 - Ciencia Y Tecnolog\u00eda", "jurisdiccion": "130 - Ministerio De Ciencia Y Tecnolog\u00eda", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8d8a14d2-294d-53d7-9b50-35f9780b81d4', 'Inversion social en infancia', 'inversion', 583024.0628, 'Md', '2024', '130 - Ministerio De Ciencia Y Tecnología', '{"programa": "310 - Planificaci\u00f3n Y Pol\u00edticas Cient\u00edfico -Tecnol\u00f3gicas", "jurisdiccion": "130 - Ministerio De Ciencia Y Tecnolog\u00eda", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8d8a14d2-294d-53d7-9b50-35f9780b81d4', 'Inversion social en infancia', 'inversion', 280063.4385, 'Md', '2024', '130 - Ministerio De Ciencia Y Tecnología', '{"programa": "311 - Gesti\u00f3n Territorial De Ciencia Y Tecnolog\u00eda", "jurisdiccion": "130 - Ministerio De Ciencia Y Tecnolog\u00eda", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8d8a14d2-294d-53d7-9b50-35f9780b81d4', 'Inversion social en infancia', 'inversion', 871356.3537, 'Md', '2024', '130 - Ministerio De Ciencia Y Tecnología', '{"programa": "313 - Divulgaci\u00f3n Y Ense\u00f1anza De La Ciencia Y La Tecnolog\u00eda", "jurisdiccion": "130 - Ministerio De Ciencia Y Tecnolog\u00eda", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8d8a14d2-294d-53d7-9b50-35f9780b81d4', 'Inversion social en infancia', 'inversion', 899572.9589, 'Md', '2024', '130 - Ministerio De Ciencia Y Tecnología', '{"programa": "316 - Promoci\u00f3n Cient\u00edfica Y Ense\u00f1anza De Las Ciencias", "jurisdiccion": "130 - Ministerio De Ciencia Y Tecnolog\u00eda", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 313820423.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "350 - Ministerio De Educaci\u00f3n", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 15827450198.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "352 - Fondo Para El Financiamiento Del Sistema Educativo De La Provincia De Cordoba - Ley N\u00ba 9870", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 61152148.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "353 - Infraestructura Escuelas", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 188319955.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "355 - Programa Avanzado De Nivel Secundario En Educacion En Tecnolog\u00edas De La Informaci\u00f3n Y La Comun", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 8566826840.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "356 - Educaci\u00f3n Secundaria", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 1530295635.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "358 - Reg\u00edmenes Especiales", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 105005618.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "361 - (D.I.P.E.) Institutos Privados De Ense\u00f1anza", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 4836702797.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "362 - Aportes Educaci\u00f3n Inicial Y Primaria Privada", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 11741203969.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "363 - Aportes Educaci\u00f3n Secundaria, Especial Y Superior Privada", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 207917673.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "364 - Programaci\u00f3n, Apoyo Interdisciplinario Y Calidad De La Educaci\u00f3n", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 7700262870.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "365 - Educaci\u00f3n T\u00e9cnica Y Formaci\u00f3n Profesional", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 27898669.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "367 - Plan De Apoyo A Educaci\u00f3n Inicial, Primaria Y Modalidades", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 58571151.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "368 - Mejora Continua De La Calidad De La Educaci\u00f3n T\u00e9cnico Profesional (Inet)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 29515450.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "369 - Proyecto De Mejoramiento De La Educaci\u00f3n Rural (Promer)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 10231838.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "371 - Programa Provincial De Formaci\u00f3n Docente (Infod)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 5666100.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "372 - Finalizaci\u00f3n De Estudios Para J\u00f3venes Y Adultos (Fines)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 68262746.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "376 - Programa Para La Construcci\u00f3n De Aulas Nuevas En Establecimientos Educativos", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 244262088.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "378 - Programa De Reparaci\u00f3n Y Construcci\u00f3n De Escuelas 2Da Etapa-Fondo Federal Solidario Ley N\u00ba 961", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 511585382.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "379 - Inclusion Y Terminalidad De La Educacion Secundaria (14 A 17)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 2296350.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "382 - Plan De Mejora Institucional", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 4577261254.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "383 - Educaci\u00f3n Inicial", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 15880920248.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "384 - Educaci\u00f3n Primaria", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('cd86bb18-00bd-53a3-8bb6-b07cf20af607', 'Inversion social en infancia', 'inversion', 2400000.0, 'Md', '2024', '140 - Ministerio De Justicia Y Derechos Humanos', '{"programa": "427 - Promoci\u00f3n Y Protecci\u00f3n De Ni\u00f1os, Ni\u00f1as Y Adolecentes - Ley 10.326", "jurisdiccion": "140 - Ministerio De Justicia Y Derechos Humanos", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

