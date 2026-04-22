-- Chunk 0015: INSERTs 751 to 800 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 119361.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "961 - (C.E.) Mesas De Trabajo - Cuenta Especial Ley 8665", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 42490.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "962 - (C.E.) Capacitaciones - Cuenta Especial Ley 8665", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 480297.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "963 - (C.E.) Difusi\u00f3n - Cuenta Especial Ley 8665", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f5f64d7a-562b-5c00-afa5-88eee72dc436', 'Inversion social en infancia', 'inversion', 9685737.0, 'Md', '2024', '150 - Ministerio De Obras Y Servicios Públicos', '{"programa": "506 - Arquitectura", "jurisdiccion": "150 - Ministerio De Obras Y Servicios P\u00fablicos", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('16e2fff6-9bc0-54cc-87c9-e140ea411393', 'Inversion social en infancia', 'inversion', 1673104.771, 'Md', '2024', '(en blanco)', '{"programa": "840 - Pdspc - Programa De Desarrollo Social De La Provincia De C\u00f3rdoba", "jurisdiccion": "(en blanco)", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1ab71c9e-91f4-51ac-84c7-e18e4d136060', 'Inversion social en infancia', 'inversion', 287769.6719, 'Md', '2024', '110 - Ministerio De Gobierno Y Seguridad', '{"programa": "104 - Relaci\u00f3n Y Apoyo Con O.N.G. Y Municipios", "jurisdiccion": "110 - Ministerio De Gobierno Y Seguridad", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1ab71c9e-91f4-51ac-84c7-e18e4d136060', 'Inversion social en infancia', 'inversion', 6887960.596, 'Md', '2024', '110 - Ministerio De Gobierno Y Seguridad', '{"programa": "70 - Prevenci\u00f3n, Detecci\u00f3n Y Erradicaci\u00f3n De La Violencia Familiar, De G\u00e9nero Y Trata De Personas.", "jurisdiccion": "110 - Ministerio De Gobierno Y Seguridad", "categoria": "Violencia familiar"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d73d8e8a-ac16-5990-8e0d-8245dd008f28', 'Inversion social en infancia', 'inversion', 8778065.826, 'Md', '2024', '120 - Ministerio De Gestión Pública', '{"programa": "108 - Ayuda Directa A La Comunidad", "jurisdiccion": "120 - Ministerio De Gesti\u00f3n P\u00fablica", "categoria": "Emergencia"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d73d8e8a-ac16-5990-8e0d-8245dd008f28', 'Inversion social en infancia', 'inversion', 46302615.15, 'Md', '2024', '120 - Ministerio De Gestión Pública', '{"programa": "212 - Programas Sociales Financiados Con Recursos Nacionales - Paicor", "jurisdiccion": "120 - Ministerio De Gesti\u00f3n P\u00fablica", "categoria": "Comedores escolares y copa de leche"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d73d8e8a-ac16-5990-8e0d-8245dd008f28', 'Inversion social en infancia', 'inversion', 1085238446.0, 'Md', '2024', '120 - Ministerio De Gestión Pública', '{"programa": "213 - (P.A.I.Cor.) Programa Asistencia Integral C\u00f3rdoba", "jurisdiccion": "120 - Ministerio De Gesti\u00f3n P\u00fablica", "categoria": "Comedores escolares y copa de leche"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 350555116.2, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "350 - Ministerio De Educaci\u00f3n", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 2817286805.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "352 - Fondo Para El Financiamiento Del Sistema Educativo De La Provincia De Cordoba - Ley N\u00ba 9870", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 37176159.9, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "353 - Infraestructura Escuelas", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 2166460790.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "354 - Educaci\u00f3n Inicial Y Primaria", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 2056510489.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "356 - Educaci\u00f3n Secundaria", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 389786377.7, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "358 - Reg\u00edmenes Especiales", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 23791819.84, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "361 - (D.I.P.E.) Institutos Privados De Ense\u00f1anza", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 921053823.3, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "362 - Aportes Educaci\u00f3n Inicial Y Primaria Privada", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 2379714823.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "363 - Aportes Educaci\u00f3n Secundaria, Especial Y Superior Privada", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 55875883.03, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "364 - Programaci\u00f3n, Apoyo Interdisciplinario Y Calidad De La Educaci\u00f3n", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 1751275799.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "365 - Educaci\u00f3n T\u00e9cnica Y Formaci\u00f3n Profesional", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 70195516.64, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "367 - Plan De Apoyo A Educaci\u00f3n Inicial, Primaria Y Modalidades", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 34568922.27, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "368 - Mejora Continua De La Calidad De La Educaci\u00f3n T\u00e9cnico Profesional (Inet)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 967433.23, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "369 - Proyecto De Mejoramiento De La Educaci\u00f3n Rural (Promer)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 25568475.57, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "370 - Programa De Apoyo A La Pol\u00edtica De Mejoramiento De Equidad Educativa (Promedu)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 4554326.976, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "371 - Programa Provincial De Formaci\u00f3n Docente (Infod)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 11122377.34, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "372 - Finalizaci\u00f3n De Estudios Para J\u00f3venes Y Adultos (Fines)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 15615077.96, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "376 - Programa Para La Construcci\u00f3n De Aulas Nuevas En Establecimientos Educativos", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 93148669.63, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "378 - Programa De Reparaci\u00f3n Y Construcci\u00f3n De Escuelas 2Da Etapa-Fondo Federal Solidario Ley N\u00ba 961", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 68971856.91, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "379 - Inclusion Y Terminalidad De La Educacion Secundaria (14 A 17)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 99011.26961, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "381 - Reparaciones Edilicias I.P.E.M. Nro 190 \" Dr Pedro Carande Carro\"", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('cd86bb18-00bd-53a3-8bb6-b07cf20af607', 'Inversion social en infancia', 'inversion', 6340674.605, 'Md', '2024', '140 - Ministerio De Justicia Y Derechos Humanos', '{"programa": "404 - Asistencia A La V\u00edctima Del Delito Y Violencia Familiar", "jurisdiccion": "140 - Ministerio De Justicia Y Derechos Humanos", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 97981629.93, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "450 - Actividades Centrales Del Ministerio De Salud", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 38339104.24, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "453 - (C.E.) Incluir Salud Programa Federal", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 442953.7662, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "454 - (C.E.) Recurso Solidario Para Ablaci\u00f3n E Implantes - Cuenta Especial- Ley Provincial N\u00ba 9146", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Ablaci\u00f3n e implantes"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 196040.4645, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "455 - (C.E.)Programa De Lucha Contra El Vih-Sida E Its-Ley 9161", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Sida y enfermedades de transmisi\u00f3n sexual"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 70822113.54, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "456 - Actividades Comunes De La Secretar\u00eda De Servicios Asistenciales", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 571702122.9, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "457 - Centros Asistenciales De Capital", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 412102258.4, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "458 - Centros Asistenciales Del Interior", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 95081212.45, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "461 - Centros Asistenciales De Salud Mental", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 20681136.66, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "462 - (C.E) Programa Sumar - Ex-Plan Nacer Resolucion N\u00ba 00425/05", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Materno-infantil"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 17379179.96, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "463 - (C.E) Programas Nacionales Varios", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Materno-infantil"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 21003873.15, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "467 - Actividades Comunes De La Secretar\u00eda De Prevenci\u00f3n Y Promoci\u00f3n De La Salud", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Prevenci\u00f3n de enfermedades y riesgos espec\u00edficos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 10753622.31, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "468 - Asistencia Sanitaria", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 9602246.959, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "470 - Desarrollo De Infraestructura Y Equipamiento Hospitalario", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 1619163.518, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "471 - Integraci\u00f3n Sanitaria", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4a81ed2c-ae08-58e7-838a-3c129b13d665', 'Inversion social en infancia', 'inversion', 12740026.9, 'Md', '2024', '150 - Ministerio De Infraestructura', '{"programa": "502 - Vivienda", "jurisdiccion": "150 - Ministerio De Infraestructura", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4a81ed2c-ae08-58e7-838a-3c129b13d665', 'Inversion social en infancia', 'inversion', 80428055.04, 'Md', '2024', '150 - Ministerio De Infraestructura', '{"programa": "503 - Viviendas, Infraestructura Y Equipamiento Comunitario", "jurisdiccion": "150 - Ministerio De Infraestructura", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4a81ed2c-ae08-58e7-838a-3c129b13d665', 'Inversion social en infancia', 'inversion', 19018108.62, 'Md', '2024', '150 - Ministerio De Infraestructura', '{"programa": "506 - Arquitectura", "jurisdiccion": "150 - Ministerio De Infraestructura", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4a81ed2c-ae08-58e7-838a-3c129b13d665', 'Inversion social en infancia', 'inversion', 124301099.7, 'Md', '2024', '150 - Ministerio De Infraestructura', '{"programa": "506 - Arquitectura", "jurisdiccion": "150 - Ministerio De Infraestructura", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

