-- Chunk 0128: INSERTs 6401 to 6450 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 11343456.35, 'Md', '2024', 'Córdoba', '{"programa": "310 - PLANIFICACI\u00d3N Y DESPLIEGUE DE POL\u00cdTICAS PARA LA PROMOCI\u00d3N DE LA ECONOM\u00cdA DEL CONOCIMIENTO Y NU", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 16949992.25, 'Md', '2024', 'Córdoba', '{"programa": "311 - VINCULACI\u00d3N TECNOL\u00d3GICA PRODUCTIVA", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 13690378.35, 'Md', '2024', 'Córdoba', '{"programa": "313 - DIVULGACI\u00d3N DE LA CIENCIA Y LA TECNOLOG\u00cdA", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 26598449.37, 'Md', '2024', 'Córdoba', '{"programa": "316 - PROMOCI\u00d3N CIENT\u00cdFICA", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 32857139000.0, 'Md', '2024', 'Córdoba', '{"programa": "350 - MINISTERIO DE EDUCACI\u00d3N", "jurisdiccion": "C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 549519456000.0, 'Md', '2024', 'Córdoba', '{"programa": "352 - FONDO PARA EL FINANCIAMIENTO DEL SISTEMA EDUCATIVO DE LA PROVINCIA DE CORDOBA - LEY N\u00ba 9870", "jurisdiccion": "C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 4077000000.0, 'Md', '2024', 'Córdoba', '{"programa": "353 - INFRAESTRUCTURA ESCUELAS", "jurisdiccion": "C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 5507164000.0, 'Md', '2024', 'Córdoba', '{"programa": "355 - Programa Avanzado De Nivel Secundario En Educaci\u00f3n En Tecnolog\u00edas De La Informaci\u00f3n Y La Comun", "jurisdiccion": "C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 157591157000.0, 'Md', '2024', 'Córdoba', '{"programa": "356 - EDUCACI\u00d3N SECUNDARIA", "jurisdiccion": "C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 43054955000.0, 'Md', '2024', 'Córdoba', '{"programa": "358 - REG\u00cdMENES ESPECIALES", "jurisdiccion": "C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 3462864000.0, 'Md', '2024', 'Córdoba', '{"programa": "361 - (D.I.P.E.) INSTITUTOS PRIVADOS DE ENSE\u00d1ANZA", "jurisdiccion": "C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 106983583000.0, 'Md', '2024', 'Córdoba', '{"programa": "362 - APORTES EDUCACI\u00d3N INICIAL Y PRIMARIA PRIVADA", "jurisdiccion": "C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 233484742000.0, 'Md', '2024', 'Córdoba', '{"programa": "363 - APORTES EDUCACI\u00d3N SECUNDARIA, ESPECIAL Y SUPERIOR PRIVADA", "jurisdiccion": "C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 8383529000.0, 'Md', '2024', 'Córdoba', '{"programa": "364 - PROGRAMACI\u00d3N, APOYO INTERDISCIPLINARIO Y CALIDAD DE LA EDUCACI\u00d3N", "jurisdiccion": "C\u00f3rdoba", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 159421169000.0, 'Md', '2024', 'Córdoba', '{"programa": "365 - EDUCACI\u00d3N T\u00c9CNICA Y FORMACI\u00d3N PROFESIONAL", "jurisdiccion": "C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 1010900000.0, 'Md', '2024', 'Córdoba', '{"programa": "367 - PLAN DE APOYO A EDUCACI\u00d3N INICIAL, PRIMARIA Y MODALIDADES", "jurisdiccion": "C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 3380618000.0, 'Md', '2024', 'Córdoba', '{"programa": "368 - MEJORA CONTINUA DE LA CALIDAD DE LA EDUCACI\u00d3N T\u00c9CNICO PROFESIONAL (INET)", "jurisdiccion": "C\u00f3rdoba", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 169635000.0, 'Md', '2024', 'Córdoba', '{"programa": "371 - PROGRAMA PROVINCIAL DE FORMACI\u00d3N DOCENTE (INFOD)", "jurisdiccion": "C\u00f3rdoba", "categoria": "Calidad educativa, gesti\u00f3n curricular y capacitaci"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 67386403000.0, 'Md', '2024', 'Córdoba', '{"programa": "378 - Programa De Reparaci\u00f3n, Ampliaci\u00f3n Y Construcci\u00f3n De Escuelas", "jurisdiccion": "C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 11866020000.0, 'Md', '2024', 'Córdoba', '{"programa": "379 - Inclusi\u00f3n Y Terminalidad De La Educaci\u00f3n Secundaria (14 A 17)", "jurisdiccion": "C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 93776510000.0, 'Md', '2024', 'Córdoba', '{"programa": "383 - EDUCACI\u00d3N INICIAL", "jurisdiccion": "C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 218175148000.0, 'Md', '2024', 'Córdoba', '{"programa": "384 - EDUCACI\u00d3N PRIMARIA", "jurisdiccion": "C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 23264000.0, 'Md', '2024', 'Córdoba', '{"programa": "385 - Conectar Igualdad", "jurisdiccion": "C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 721800000.0, 'Md', '2024', 'Córdoba', '{"programa": "386 - Mejoramiento De La Calidad Educativa", "jurisdiccion": "C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 5489974000.0, 'Md', '2024', 'Córdoba', '{"programa": "425 - PROMOCI\u00d3N Y DEFENSA DE LOS DERECHOS HUMANOS, IGUALDAD DE OPORTUNIDADES Y LUCHA CONTRA LA DISCR", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 224579000.0, 'Md', '2024', 'Córdoba', '{"programa": "427 - (C.E.) Promoci\u00f3n Y Protecci\u00f3n De Ni\u00f1os, Ni\u00f1as Y Adolescentes - Cuenta Especial Ley 10.326", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 1737000.0, 'Md', '2024', 'Córdoba', '{"programa": "428 - CONVENIOS CON EL GOBIERNO NACIONAL", "jurisdiccion": "C\u00f3rdoba", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 19102371059.0, 'Md', '2024', 'Córdoba', '{"programa": "450 - ACTIVIDADES CENTRALES DEL MINISTERIO DE SALUD", "jurisdiccion": "C\u00f3rdoba", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 4610063982.0, 'Md', '2024', 'Córdoba', '{"programa": "453 - Incluir Salud Programa Federal", "jurisdiccion": "C\u00f3rdoba", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 950270724.7, 'Md', '2024', 'Córdoba', '{"programa": "454 - (C.E.) RECURSO SOLIDARIO PARA ABLACI\u00d3N E IMPLANTES - CUENTA ESPECIAL- LEY PROVINCIAL N\u00ba 9146", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ablaci\u00f3n e implantes"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 429836939.6, 'Md', '2024', 'Córdoba', '{"programa": "455 - Programa De Lucha Contra El Vih-Sida E Its- Ley 9161", "jurisdiccion": "C\u00f3rdoba", "categoria": "Sida y enfermedades de transmisi\u00f3n sexual"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 29279371257.0, 'Md', '2024', 'Córdoba', '{"programa": "456 - Actividades Comunes De La Secretar\u00eda De Salud", "jurisdiccion": "C\u00f3rdoba", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 103944561721.0, 'Md', '2024', 'Córdoba', '{"programa": "457 - CENTROS ASISTENCIALES DE CAPITAL", "jurisdiccion": "C\u00f3rdoba", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 82165194930.0, 'Md', '2024', 'Córdoba', '{"programa": "458 - CENTROS ASISTENCIALES DEL INTERIOR", "jurisdiccion": "C\u00f3rdoba", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 20129127047.0, 'Md', '2024', 'Córdoba', '{"programa": "461 - CENTROS ASISTENCIALES DE SALUD MENTAL", "jurisdiccion": "C\u00f3rdoba", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 8250000.0, 'Md', '2024', 'Córdoba', '{"programa": "462 - Programa Sumar - Ex-Plan Nacer -Resolucion N\u00ba 00425/05", "jurisdiccion": "C\u00f3rdoba", "categoria": "Materno-infantil"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 79636539.73, 'Md', '2024', 'Córdoba', '{"programa": "463 - Programas Nacionales Varios", "jurisdiccion": "C\u00f3rdoba", "categoria": "Materno-infantil"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 10480248251.0, 'Md', '2024', 'Córdoba', '{"programa": "467 - ACTIVIDADES COMUNES DE LA SECRETAR\u00cdA DE PREVENCI\u00d3N Y PROMOCI\u00d3N DE LA SALUD", "jurisdiccion": "C\u00f3rdoba", "categoria": "Prevenci\u00f3n de enfermedades y riesgos espec\u00edficos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 972182693.5, 'Md', '2024', 'Córdoba', '{"programa": "468 - ASISTENCIA SANITARIA", "jurisdiccion": "C\u00f3rdoba", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 7046286515.0, 'Md', '2024', 'Córdoba', '{"programa": "470 - DESARROLLO DE INFRAESTRUCTURA Y EQUIPAMIENTO HOSPITALARIO", "jurisdiccion": "C\u00f3rdoba", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 3497892.824, 'Md', '2024', 'Córdoba', '{"programa": "471 - INTEGRACI\u00d3N SANITARIA", "jurisdiccion": "C\u00f3rdoba", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 1309764234.0, 'Md', '2024', 'Córdoba', '{"programa": "502 - Vivienda - Actividades Comunes", "jurisdiccion": "C\u00f3rdoba", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 750343299.9, 'Md', '2024', 'Córdoba', '{"programa": "503 - Viviendas, Infraestructura, Equipamiento Comunitario Y Regularizaci\u00f3n Dominial", "jurisdiccion": "C\u00f3rdoba", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 148200301.4, 'Md', '2024', 'Córdoba', '{"programa": "517 - ESCRITURACI\u00d3N DE VIVIENDAS", "jurisdiccion": "C\u00f3rdoba", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 3777623650.0, 'Md', '2024', 'Córdoba', '{"programa": "518 - PLAN LOTENGO", "jurisdiccion": "C\u00f3rdoba", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 25033834.7, 'Md', '2024', 'Córdoba', '{"programa": "525 - CR\u00c9DITO TU CASA - DIFERENCIAL DE INTER\u00c9S", "jurisdiccion": "C\u00f3rdoba", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 18799627.56, 'Md', '2024', 'Córdoba', '{"programa": "560 - (C.E) Fondo Para La Gesti\u00f3n De Residuos S\u00f3lidos Urbanos Ley N\u00b0 9088 - Cuenta Especial", "jurisdiccion": "C\u00f3rdoba", "categoria": "Otros Servicios Urbanos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 45225059214.0, 'Md', '2024', 'Córdoba', '{"programa": "602 - BOLETO EDUCATIVO GRATUITO (B.E.G) - LEY 10031", "jurisdiccion": "C\u00f3rdoba", "categoria": "Transporte escolar"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 1510874594.0, 'Md', '2024', 'Córdoba', '{"programa": "603 - BOLETO OBRERO SOCIAL (B.O.S.) - DECRETO N\u00b0 272/2015", "jurisdiccion": "C\u00f3rdoba", "categoria": "Transferencias de ingresos a las familias"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 167165107.5, 'Md', '2024', 'Córdoba', '{"programa": "604 - Boleto Interurbano Para El Personal De Salud (Bis) - Decreto 748/2023", "jurisdiccion": "C\u00f3rdoba", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

