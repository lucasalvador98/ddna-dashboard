-- Chunk 0022: INSERTs 1101 to 1150 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b8d59b9-35cb-598f-977b-c88dd724f8e3', 'Inversion social en infancia', 'inversion', 32158.72996, 'Md', '2024', '101 - Dependencia Inmediata Del Poder Ejecutivo', '{"programa": "016 - Programa De Informaci\u00f3n, Investigaci\u00f3n Y An\u00e1lisis \"Laboratorio De Pol\u00edticas P\u00fablicas\"", "jurisdiccion": "101 - Dependencia Inmediata Del Poder Ejecutivo", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b8d59b9-35cb-598f-977b-c88dd724f8e3', 'Inversion social en infancia', 'inversion', 39459.48, 'Md', '2024', '101 - Dependencia Inmediata Del Poder Ejecutivo', '{"programa": "017 - Programa De Comunicaci\u00f3n, Difusi\u00f3n Y Promoci\u00f3n De Las Mujeres", "jurisdiccion": "101 - Dependencia Inmediata Del Poder Ejecutivo", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b8d59b9-35cb-598f-977b-c88dd724f8e3', 'Inversion social en infancia', 'inversion', 6772.25, 'Md', '2024', '101 - Dependencia Inmediata Del Poder Ejecutivo', '{"programa": "018 - Foro Provincial De Planificaci\u00f3n De Pol\u00edticas De G\u00e9nero", "jurisdiccion": "101 - Dependencia Inmediata Del Poder Ejecutivo", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a611750b-c76d-593b-9a88-d81d6d86b091', 'Inversion social en infancia', 'inversion', 438435322.0, 'Md', '2024', '105 - Secretaría De Equidad Y Promoción Del Empleo', '{"programa": "647 - Programas De Empleo Y Becas Acad\u00e9micas", "jurisdiccion": "105 - Secretar\u00eda De Equidad Y Promoci\u00f3n Del Empleo", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a611750b-c76d-593b-9a88-d81d6d86b091', 'Inversion social en infancia', 'inversion', 165234136.6, 'Md', '2024', '105 - Secretaría De Equidad Y Promoción Del Empleo', '{"programa": "649 - Salas Cunas", "jurisdiccion": "105 - Secretar\u00eda De Equidad Y Promoci\u00f3n Del Empleo", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a611750b-c76d-593b-9a88-d81d6d86b091', 'Inversion social en infancia', 'inversion', 7834368.919, 'Md', '2024', '105 - Secretaría De Equidad Y Promoción Del Empleo', '{"programa": "656 - Banco De La Gente", "jurisdiccion": "105 - Secretar\u00eda De Equidad Y Promoci\u00f3n Del Empleo", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a611750b-c76d-593b-9a88-d81d6d86b091', 'Inversion social en infancia', 'inversion', 91428721.73, 'Md', '2024', '105 - Secretaría De Equidad Y Promoción Del Empleo', '{"programa": "666 - C\u00f3rdoba Con Ellas", "jurisdiccion": "105 - Secretar\u00eda De Equidad Y Promoci\u00f3n Del Empleo", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('091f7a26-19d5-59c5-8467-b47a71c8df6c', 'Inversion social en infancia', 'inversion', 8483538.528, 'Md', '2024', '120 - Secretaría General De La Gobernación', '{"programa": "108 - Ayuda Directa A La Comunidad", "jurisdiccion": "120 - Secretar\u00eda General De La Gobernaci\u00f3n", "categoria": "Emergencia"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('091f7a26-19d5-59c5-8467-b47a71c8df6c', 'Inversion social en infancia', 'inversion', 1944002.656, 'Md', '2024', '120 - Secretaría General De La Gobernación', '{"programa": "201 - (C.E.) Fondo De Emergencia Por Inundaciones Ley N\u00ba10267", "jurisdiccion": "120 - Secretar\u00eda General De La Gobernaci\u00f3n", "categoria": "Emergencia"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('091f7a26-19d5-59c5-8467-b47a71c8df6c', 'Inversion social en infancia', 'inversion', 155607910.8, 'Md', '2024', '120 - Secretaría General De La Gobernación', '{"programa": "208 - Fondo Permanente Para La Atenci\u00f3n De Situaciones De Desastres", "jurisdiccion": "120 - Secretar\u00eda General De La Gobernaci\u00f3n", "categoria": "Emergencia"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('091f7a26-19d5-59c5-8467-b47a71c8df6c', 'Inversion social en infancia', 'inversion', 37004247.89, 'Md', '2024', '120 - Secretaría General De La Gobernación', '{"programa": "212 - Programas Sociales Financiados Con Recursos Nacionales - Paicor", "jurisdiccion": "120 - Secretar\u00eda General De La Gobernaci\u00f3n", "categoria": "Comedores escolares y copa de leche"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('091f7a26-19d5-59c5-8467-b47a71c8df6c', 'Inversion social en infancia', 'inversion', 2126569643.0, 'Md', '2024', '120 - Secretaría General De La Gobernación', '{"programa": "213 - (P.A.I.Cor.) Programa Asistencia Integral C\u00f3rdoba", "jurisdiccion": "120 - Secretar\u00eda General De La Gobernaci\u00f3n", "categoria": "Comedores escolares y copa de leche"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8d8a14d2-294d-53d7-9b50-35f9780b81d4', 'Inversion social en infancia', 'inversion', 12727889.79, 'Md', '2024', '130 - Ministerio De Ciencia Y Tecnología', '{"programa": "300 - Ciencia Y Tecnolog\u00eda", "jurisdiccion": "130 - Ministerio De Ciencia Y Tecnolog\u00eda", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8d8a14d2-294d-53d7-9b50-35f9780b81d4', 'Inversion social en infancia', 'inversion', 192323.1437, 'Md', '2024', '130 - Ministerio De Ciencia Y Tecnología', '{"programa": "310 - Planificaci\u00f3n Y Pol\u00edticas Cient\u00edfico -Tecnol\u00f3gicas", "jurisdiccion": "130 - Ministerio De Ciencia Y Tecnolog\u00eda", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8d8a14d2-294d-53d7-9b50-35f9780b81d4', 'Inversion social en infancia', 'inversion', 208724.0553, 'Md', '2024', '130 - Ministerio De Ciencia Y Tecnología', '{"programa": "311 - Gesti\u00f3n Territorial De Ciencia Y Tecnolog\u00eda", "jurisdiccion": "130 - Ministerio De Ciencia Y Tecnolog\u00eda", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8d8a14d2-294d-53d7-9b50-35f9780b81d4', 'Inversion social en infancia', 'inversion', 3162810.598, 'Md', '2024', '130 - Ministerio De Ciencia Y Tecnología', '{"programa": "313 - Divulgaci\u00f3n Y Ense\u00f1anza De La Ciencia Y La Tecnolog\u00eda", "jurisdiccion": "130 - Ministerio De Ciencia Y Tecnolog\u00eda", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8d8a14d2-294d-53d7-9b50-35f9780b81d4', 'Inversion social en infancia', 'inversion', 3745278.155, 'Md', '2024', '130 - Ministerio De Ciencia Y Tecnología', '{"programa": "316 - Promoci\u00f3n Cient\u00edfica Y Ense\u00f1anza De Las Ciencias", "jurisdiccion": "130 - Ministerio De Ciencia Y Tecnolog\u00eda", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 219919089.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "350 - Ministerio De Educaci\u00f3n", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 8068550056.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "352 - Fondo Para El Financiamiento Del Sistema Educativo De La Provincia De Cordoba - Ley N\u00ba 9870", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 37089982.84, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "353 - Infraestructura Escuelas", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 4464565696.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "356 - Educaci\u00f3n Secundaria", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 807587033.2, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "358 - Reg\u00edmenes Especiales", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 47813414.81, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "361 - (D.I.P.E.) Institutos Privados De Ense\u00f1anza", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 2108170341.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "362 - Aportes Educaci\u00f3n Inicial Y Primaria Privada", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 5179356863.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "363 - Aportes Educaci\u00f3n Secundaria, Especial Y Superior Privada", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 91448978.02, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "364 - Programaci\u00f3n, Apoyo Interdisciplinario Y Calidad De La Educaci\u00f3n", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 4264973729.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "365 - Educaci\u00f3n T\u00e9cnica Y Formaci\u00f3n Profesional", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 207205042.4, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "367 - Plan De Apoyo A Educaci\u00f3n Inicial, Primaria Y Modalidades", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 82628812.52, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "368 - Mejora Continua De La Calidad De La Educaci\u00f3n T\u00e9cnico Profesional (Inet)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 10263171.88, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "369 - Proyecto De Mejoramiento De La Educaci\u00f3n Rural (Promer)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 17847865.03, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "371 - Programa Provincial De Formaci\u00f3n Docente (Infod)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 12730980.61, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "372 - Finalizaci\u00f3n De Estudios Para J\u00f3venes Y Adultos (Fines)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 220454231.9, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "376 - Programa Para La Construcci\u00f3n De Aulas Nuevas En Establecimientos Educativos", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 183045544.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "378 - Programa De Reparaci\u00f3n Y Construcci\u00f3n De Escuelas 2Da Etapa-Fondo Federal Solidario Ley N\u00ba 961", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 200878814.4, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "379 - Inclusion Y Terminalidad De La Educacion Secundaria (14 A 17)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 9505314.41, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "382 - Plan De Mejora Institucional", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 1497689615.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "383 - Educaci\u00f3n Inicial", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 3793495465.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "384 - Educaci\u00f3n Primaria", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('cd86bb18-00bd-53a3-8bb6-b07cf20af607', 'Inversion social en infancia', 'inversion', 12468208.31, 'Md', '2024', '140 - Ministerio De Justicia Y Derechos Humanos', '{"programa": "404 - Asistencia A La V\u00edctima Del Delito Y Violencia Familiar", "jurisdiccion": "140 - Ministerio De Justicia Y Derechos Humanos", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('cd86bb18-00bd-53a3-8bb6-b07cf20af607', 'Inversion social en infancia', 'inversion', 386550.0, 'Md', '2024', '140 - Ministerio De Justicia Y Derechos Humanos', '{"programa": "427 - Promoci\u00f3n Y Protecci\u00f3n De Ni\u00f1os, Ni\u00f1as Y Adolecentes - Ley 10.326", "jurisdiccion": "140 - Ministerio De Justicia Y Derechos Humanos", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('cd86bb18-00bd-53a3-8bb6-b07cf20af607', 'Inversion social en infancia', 'inversion', 25866734.02, 'Md', '2024', '140 - Ministerio De Justicia Y Derechos Humanos', '{"programa": "671 - (C.E.) Pol\u00edticas De Asistencia A Ni\u00f1os Y Adolescentes - Cuenta Especial Ley 8665", "jurisdiccion": "140 - Ministerio De Justicia Y Derechos Humanos", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('cd86bb18-00bd-53a3-8bb6-b07cf20af607', 'Inversion social en infancia', 'inversion', 22075450.68, 'Md', '2024', '140 - Ministerio De Justicia Y Derechos Humanos', '{"programa": "672 - (C.E.) El Ni\u00f1o Y El Adolescente En Conflicto Con La Ley Penal - Cuenta Especial Ley 8665", "jurisdiccion": "140 - Ministerio De Justicia Y Derechos Humanos", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('cd86bb18-00bd-53a3-8bb6-b07cf20af607', 'Inversion social en infancia', 'inversion', 699548674.5, 'Md', '2024', '140 - Ministerio De Justicia Y Derechos Humanos', '{"programa": "673 - Ni\u00f1ez, Adolescencia Y Familia - Actividades Comunes", "jurisdiccion": "140 - Ministerio De Justicia Y Derechos Humanos", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('cd86bb18-00bd-53a3-8bb6-b07cf20af607', 'Inversion social en infancia', 'inversion', 4328782.878, 'Md', '2024', '140 - Ministerio De Justicia Y Derechos Humanos', '{"programa": "675 - (C.E.) Fortalecimiento Familiar Y Comunitario - Cuenta Especial Ley 8665", "jurisdiccion": "140 - Ministerio De Justicia Y Derechos Humanos", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('cd86bb18-00bd-53a3-8bb6-b07cf20af607', 'Inversion social en infancia', 'inversion', 32160340.0, 'Md', '2024', '140 - Ministerio De Justicia Y Derechos Humanos', '{"programa": "676 - (C.E.) Organismos De Gesti\u00f3n Asistida (Ogas) - Cuenta Especial Ley 8665", "jurisdiccion": "140 - Ministerio De Justicia Y Derechos Humanos", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('cd86bb18-00bd-53a3-8bb6-b07cf20af607', 'Inversion social en infancia', 'inversion', 720981.8597, 'Md', '2024', '140 - Ministerio De Justicia Y Derechos Humanos', '{"programa": "684 - (C.E.) Fondo Para La Prevenci\u00f3n De La Violencia Familiar - Cuenta Especial Ley 9505", "jurisdiccion": "140 - Ministerio De Justicia Y Derechos Humanos", "categoria": "Violencia familiar"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('cd86bb18-00bd-53a3-8bb6-b07cf20af607', 'Inversion social en infancia', 'inversion', 141002412.9, 'Md', '2024', '140 - Ministerio De Justicia Y Derechos Humanos', '{"programa": "70 - Prevenci\u00f3n, Detecci\u00f3n Y Erradicaci\u00f3n De La Violencia Familiar, De G\u00e9nero Y Trata De Personas.", "jurisdiccion": "140 - Ministerio De Justicia Y Derechos Humanos", "categoria": "Violencia familiar"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 237225343.8, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "450 - Actividades Centrales Del Ministerio De Salud", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 91541441.53, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "453 - (C.E.) Incluir Salud Programa Federal", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 1333724.745, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "454 - (C.E.) Recurso Solidario Para Ablaci\u00f3n E Implantes - Cuenta Especial- Ley Provincial N\u00ba 9146", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Ablaci\u00f3n e implantes"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

