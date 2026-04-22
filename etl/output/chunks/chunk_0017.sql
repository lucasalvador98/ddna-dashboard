-- Chunk 0017: INSERTs 851 to 900 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('324469d3-7d97-5c98-acd7-2087ac823cfd', 'Inversion social en infancia', 'inversion', 93995688.2, 'Md', '2024', '625 - Agencia Córdoba Cultura S.E.', '{"programa": "625 - Agencia Cultura", "jurisdiccion": "625 - Agencia C\u00f3rdoba Cultura S.E.", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('324469d3-7d97-5c98-acd7-2087ac823cfd', 'Inversion social en infancia', 'inversion', 1581600.587, 'Md', '2024', '625 - Agencia Córdoba Cultura S.E.', '{"programa": "626 - Cultura - Recursos Afectados", "jurisdiccion": "625 - Agencia C\u00f3rdoba Cultura S.E.", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('324469d3-7d97-5c98-acd7-2087ac823cfd', 'Inversion social en infancia', 'inversion', 55008.39417, 'Md', '2024', '625 - Agencia Córdoba Cultura S.E.', '{"programa": "628 - Cultura I.N.C.A.A.", "jurisdiccion": "625 - Agencia C\u00f3rdoba Cultura S.E.", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('324469d3-7d97-5c98-acd7-2087ac823cfd', 'Inversion social en infancia', 'inversion', 4754829.61, 'Md', '2024', '625 - Agencia Córdoba Cultura S.E.', '{"programa": "629 - Programa De Articulaci\u00f3n Y Apoyo A La Producci\u00f3n Y Realizaci\u00f3n Art\u00edstico Cultural", "jurisdiccion": "625 - Agencia C\u00f3rdoba Cultura S.E.", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('324469d3-7d97-5c98-acd7-2087ac823cfd', 'Inversion social en infancia', 'inversion', 1332538.319, 'Md', '2024', '625 - Agencia Córdoba Cultura S.E.', '{"programa": "630 - Programa De Apoyo, Promoci\u00f3n Y Difusi\u00f3n De La Reflexi\u00f3n E Investigaci\u00f3n Cultural", "jurisdiccion": "625 - Agencia C\u00f3rdoba Cultura S.E.", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('76b44126-0da2-57d7-b077-ec46a46d18d4', 'Inversion social en infancia', 'inversion', 507619.0, 'Md', '2024', '640 - Agencia De Promoción De Empleo Y Formación P', '{"programa": "641 - Convenios Con El Estado Nacional Y Otros Organismos Para Formaci\u00f3n Profesional Y Desarrollo Re", "jurisdiccion": "640 - Agencia De Promoci\u00f3n De Empleo Y Formaci\u00f3n Profesional", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('76b44126-0da2-57d7-b077-ec46a46d18d4', 'Inversion social en infancia', 'inversion', 238662028.0, 'Md', '2024', '640 - Agencia De Promoción De Empleo Y Formación P', '{"programa": "647 - Programas De Empleo Y Becas Acad\u00e9micas", "jurisdiccion": "640 - Agencia De Promoci\u00f3n De Empleo Y Formaci\u00f3n Profesional", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('73e9e654-7df5-5cb2-a575-18c3f680f274', 'Inversion social en infancia', 'inversion', 3321518.88, 'Md', '2024', '705 - Caja De Jubilaciones, Pensiones Y Retiros De', '{"programa": "891 - Fondo De Financiamiento De Actividades Recreativas Y Sociales - Ley 9884", "jurisdiccion": "705 - Caja De Jubilaciones, Pensiones Y Retiros De C\u00f3rdoba", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('7af68d9c-2635-55de-9dcb-1b31b7be7d4a', 'Inversion social en infancia', 'inversion', 864905093.6, 'Md', '2024', '710 - Administración Provincial Del Seguro De Salu', '{"programa": "000 - Prestaciones a la seguridad social", "jurisdiccion": "710 - Administraci\u00f3n Provincial Del Seguro De Salud", "categoria": "Obras sociales"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('7b544ca0-4f04-5b82-b886-3caade35c851', 'Inversion social en infancia', 'inversion', 7448604.0, 'Md', '2024', '866 - Universidad Provincial De Córdoba', '{"programa": "913 - Educaci\u00f3n Con Nivel Grado", "jurisdiccion": "866 - Universidad Provincial De C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('7b544ca0-4f04-5b82-b886-3caade35c851', 'Inversion social en infancia', 'inversion', 155562.0, 'Md', '2024', '866 - Universidad Provincial De Córdoba', '{"programa": "914 - Formaci\u00f3n Y Capacitaci\u00f3n", "jurisdiccion": "866 - Universidad Provincial De C\u00f3rdoba", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('7b544ca0-4f04-5b82-b886-3caade35c851', 'Inversion social en infancia', 'inversion', 16868.18831, 'Md', '2024', '866 - Universidad Provincial De Córdoba', '{"programa": "919 - Promoci\u00f3n Y Desarrollo De La Investigaci\u00f3n", "jurisdiccion": "866 - Universidad Provincial De C\u00f3rdoba", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('7b544ca0-4f04-5b82-b886-3caade35c851', 'Inversion social en infancia', 'inversion', 177768.6722, 'Md', '2024', '866 - Universidad Provincial De Córdoba', '{"programa": "920 - Teatro Presidente Peron", "jurisdiccion": "866 - Universidad Provincial De C\u00f3rdoba", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 8415697.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "960 - (C.E.) Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes - Cuenta Especial Ley 8665", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 46777.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "961 - (C.E.) Mesas De Trabajo - Cuenta Especial Ley 8665", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 134604.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "962 - (C.E.) Capacitaciones - Cuenta Especial Ley 8665", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 413426.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "963 - (C.E.) Difusi\u00f3n - Cuenta Especial Ley 8665", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1ab71c9e-91f4-51ac-84c7-e18e4d136060', 'Inversion social en infancia', 'inversion', 398047.6161, 'Md', '2024', '110 - Ministerio De Gobierno Y Seguridad', '{"programa": "104 - Relaci\u00f3n Y Apoyo Con O.N.G. Y Municipios", "jurisdiccion": "110 - Ministerio De Gobierno Y Seguridad", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d73d8e8a-ac16-5990-8e0d-8245dd008f28', 'Inversion social en infancia', 'inversion', 10779721.74, 'Md', '2024', '120 - Ministerio De Gestión Pública', '{"programa": "108 - Ayuda Directa A La Comunidad", "jurisdiccion": "120 - Ministerio De Gesti\u00f3n P\u00fablica", "categoria": "Emergencia"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d73d8e8a-ac16-5990-8e0d-8245dd008f28', 'Inversion social en infancia', 'inversion', 27441697.43, 'Md', '2024', '120 - Ministerio De Gestión Pública', '{"programa": "201 - (C.E.) Fondo De Emergencia Por Inundaciones Ley N\u00ba10267", "jurisdiccion": "120 - Ministerio De Gesti\u00f3n P\u00fablica", "categoria": "Emergencia"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d73d8e8a-ac16-5990-8e0d-8245dd008f28', 'Inversion social en infancia', 'inversion', 49757407.78, 'Md', '2024', '120 - Ministerio De Gestión Pública', '{"programa": "212 - Programas Sociales Financiados Con Recursos Nacionales - Paicor", "jurisdiccion": "120 - Ministerio De Gesti\u00f3n P\u00fablica", "categoria": "Comedores escolares y copa de leche"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('d73d8e8a-ac16-5990-8e0d-8245dd008f28', 'Inversion social en infancia', 'inversion', 1672477366.0, 'Md', '2024', '120 - Ministerio De Gestión Pública', '{"programa": "213 - (P.A.I.Cor.) Programa Asistencia Integral C\u00f3rdoba", "jurisdiccion": "120 - Ministerio De Gesti\u00f3n P\u00fablica", "categoria": "Comedores escolares y copa de leche"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 93431459.1, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "350 - Ministerio De Educaci\u00f3n", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 6398856344.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "352 - Fondo Para El Financiamiento Del Sistema Educativo De La Provincia De Cordoba - Ley N\u00ba 9870", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 29933822.96, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "353 - Infraestructura Escuelas", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 2729938393.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "354 - Educaci\u00f3n Inicial Y Primaria", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 2203041041.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "356 - Educaci\u00f3n Secundaria", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 408101818.3, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "358 - Reg\u00edmenes Especiales", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 28052263.03, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "361 - (D.I.P.E.) Institutos Privados De Ense\u00f1anza", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 1255352851.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "362 - Aportes Educaci\u00f3n Inicial Y Primaria Privada", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 3167876370.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "363 - Aportes Educaci\u00f3n Secundaria, Especial Y Superior Privada", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 66096054.24, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "364 - Programaci\u00f3n, Apoyo Interdisciplinario Y Calidad De La Educaci\u00f3n", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 1995615848.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "365 - Educaci\u00f3n T\u00e9cnica Y Formaci\u00f3n Profesional", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 76359262.43, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "367 - Plan De Apoyo A Educaci\u00f3n Inicial, Primaria Y Modalidades", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 63671985.08, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "368 - Mejora Continua De La Calidad De La Educaci\u00f3n T\u00e9cnico Profesional (Inet)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 427150.0886, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "369 - Proyecto De Mejoramiento De La Educaci\u00f3n Rural (Promer)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 3881005.67, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "370 - Programa De Apoyo A La Pol\u00edtica De Mejoramiento De Equidad Educativa (Promedu)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 5438492.37, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "371 - Programa Provincial De Formaci\u00f3n Docente (Infod)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 15052987.5, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "372 - Finalizaci\u00f3n De Estudios Para J\u00f3venes Y Adultos (Fines)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 25968645.88, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "376 - Programa Para La Construcci\u00f3n De Aulas Nuevas En Establecimientos Educativos", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 132444629.5, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "378 - Programa De Reparaci\u00f3n Y Construcci\u00f3n De Escuelas 2Da Etapa-Fondo Federal Solidario Ley N\u00ba 961", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 104211717.5, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "379 - Inclusion Y Terminalidad De La Educacion Secundaria (14 A 17)", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 33343759.65, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "382 - Plan De Mejora Institucional", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('cd86bb18-00bd-53a3-8bb6-b07cf20af607', 'Inversion social en infancia', 'inversion', 8706898.697, 'Md', '2024', '140 - Ministerio De Justicia Y Derechos Humanos', '{"programa": "404 - Asistencia A La V\u00edctima Del Delito Y Violencia Familiar", "jurisdiccion": "140 - Ministerio De Justicia Y Derechos Humanos", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 140797448.5, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "450 - Actividades Centrales Del Ministerio De Salud", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 50025735.22, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "453 - (C.E.) Incluir Salud Programa Federal", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 442602.0385, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "454 - (C.E.) Recurso Solidario Para Ablaci\u00f3n E Implantes - Cuenta Especial- Ley Provincial N\u00ba 9146", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Ablaci\u00f3n e implantes"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 482112.295, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "455 - (C.E.)Programa De Lucha Contra El Vih-Sida E Its-Ley 9161", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Sida y enfermedades de transmisi\u00f3n sexual"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 144676216.2, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "456 - Actividades Comunes De La Secretar\u00eda De Servicios Asistenciales", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 916141885.3, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "457 - Centros Asistenciales De Capital", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

