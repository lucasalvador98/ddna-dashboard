-- Chunk 0129: INSERTs 6451 to 6500 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 466494158.0, 'Md', '2024', 'Córdoba', '{"programa": "610 - Boleto Social Cordobes (Bsc)- Decreto N\u00b0 779/2017 Y N\u00b0 411/2021", "jurisdiccion": "C\u00f3rdoba", "categoria": "Transferencias de ingresos a las familias"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 159409200.9, 'Md', '2024', 'Córdoba', '{"programa": "611 - ASISTENCIA AL TRANSPORTE P\u00daBLICO", "jurisdiccion": "C\u00f3rdoba", "categoria": "Emergencia"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 15005345714.0, 'Md', '2024', 'Córdoba', '{"programa": "643 - PROGRAMA DE FORTALECIMIENTO HABITACIONAL", "jurisdiccion": "C\u00f3rdoba", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 52153822.3, 'Md', '2024', 'Córdoba', '{"programa": "645 - DESARROLLO REGIONAL DEL NOROESTE", "jurisdiccion": "C\u00f3rdoba", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 13492040000.0, 'Md', '2024', 'Córdoba', '{"programa": "649 - SALAS CUNAS", "jurisdiccion": "C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 4574810564.0, 'Md', '2024', 'Córdoba', '{"programa": "652 - (C.E.) DESARROLLO SOCIAL - CUENTA ESPECIAL LEY 8665", "jurisdiccion": "C\u00f3rdoba", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 8174923892.0, 'Md', '2024', 'Córdoba', '{"programa": "656 - BANCO DE LA GENTE", "jurisdiccion": "C\u00f3rdoba", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 37023737.68, 'Md', '2024', 'Córdoba', '{"programa": "658 - PROTECCI\u00d3N INTEGRAL DE PERSONAS CON DISCAPACIDAD", "jurisdiccion": "C\u00f3rdoba", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 5581986848.0, 'Md', '2024', 'Córdoba', '{"programa": "661 - TARIFA SOLIDARIA", "jurisdiccion": "C\u00f3rdoba", "categoria": "Transferencias de ingresos a las familias"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 1286220956.0, 'Md', '2024', 'Córdoba', '{"programa": "662 - H\u00c1BITAT SOCIAL", "jurisdiccion": "C\u00f3rdoba", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 118861951.0, 'Md', '2024', 'Córdoba', '{"programa": "663 - Consejo Pol\u00edticas Sociales", "jurisdiccion": "C\u00f3rdoba", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 801087665.1, 'Md', '2024', 'Córdoba', '{"programa": "668 - (C.E.) TURISMO SOCIAL - CUENTA ESPECIAL LEY 8665", "jurisdiccion": "C\u00f3rdoba", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 6106602000.0, 'Md', '2024', 'Córdoba', '{"programa": "671 - (C.E.) POL\u00cdTICAS DE ASISTENCIA A NI\u00d1OS Y ADOLESCENTES - CUENTA ESPECIAL LEY 8665", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 37013313000.0, 'Md', '2024', 'Córdoba', '{"programa": "673 - NI\u00d1EZ, ADOLESCENCIA Y FAMILIA - ACTIVIDADES COMUNES", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 604098000.0, 'Md', '2024', 'Córdoba', '{"programa": "676 - (C.E.) Organismos De Gesti\u00f3n Asociada (Oga) - Cuenta Especial Ley 8665", "jurisdiccion": "C\u00f3rdoba", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 3432982000.0, 'Md', '2024', 'Córdoba', '{"programa": "681 - ASISTENCIA Y PREVENCI\u00d3N DE LA ADICCI\u00d3N", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 21258228958.0, 'Md', '2024', 'Córdoba', '{"programa": "683 - PROGRAMA ALIMENTARIO PROVINCIAL", "jurisdiccion": "C\u00f3rdoba", "categoria": "PEA"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 318020969.9, 'Md', '2024', 'Córdoba', '{"programa": "688 - PROGRAMA DE SERVICIOS A LAS PERSONAS CON DISCAPACIDAD (PROSAD)", "jurisdiccion": "C\u00f3rdoba", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 61500000.0, 'Md', '2024', 'Córdoba', '{"programa": "690 - (Ce) Contenci\u00f3n Y Protecci\u00f3n De V\u00edctimas Del Narcotr\u00e1fico - Cuenta Especial Ley 10.067", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 6306542000.0, 'Md', '2024', 'Córdoba', '{"programa": "71 - Mujer - Actividades Comunes", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 50592864000.0, 'Md', '2024', 'Córdoba', '{"programa": "717 - FINANCIAMIENTO MUNICIPIOS Y COMUNAS", "jurisdiccion": "C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 1694000000.0, 'Md', '2024', 'Córdoba', '{"programa": "719 - Conexi\u00f3n A Internet Estudiantil Gratuito", "jurisdiccion": "C\u00f3rdoba", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 1448082690.0, 'Md', '2024', 'Córdoba', '{"programa": "765 - Fondo Financiamiento Ambiental - Plan Provincial Para La Gestion Integral De Residuos - Ley 10", "jurisdiccion": "C\u00f3rdoba", "categoria": "Otros Servicios Urbanos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 209136827420.0, 'Md', '2024', 'Córdoba', '{"programa": "820 - Programa Prestacional Y Administrativo", "jurisdiccion": "C\u00f3rdoba", "categoria": "Obras sociales"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 23019132.55, 'Md', '2024', 'Córdoba', '{"programa": "856 - Proyectos Especiales Deportivos", "jurisdiccion": "C\u00f3rdoba", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 233530995.5, 'Md', '2024', 'Córdoba', '{"programa": "857 - Deporte Social Y Comunitario", "jurisdiccion": "C\u00f3rdoba", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 145525071.1, 'Md', '2024', 'Córdoba', '{"programa": "860 - Apoyo Y Acompa\u00f1amiento Al Deporte Olimpico Y Federado", "jurisdiccion": "C\u00f3rdoba", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 264339040.6, 'Md', '2024', 'Córdoba', '{"programa": "891 - Fondo De Financiamiento De Actividades Recreativas Y Sociales - Ley 9884", "jurisdiccion": "C\u00f3rdoba", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 25086510.06, 'Md', '2024', 'Córdoba', '{"programa": "901 - PROGRAMA DE APOYO A LOS SISTEMAS EDUCATIVOS", "jurisdiccion": "C\u00f3rdoba", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 16945037.63, 'Md', '2024', 'Córdoba', '{"programa": "911 - PROGRAMA DE EST\u00cdMULO A LAS EDICIONES LITERARIAS CORDOBESAS Y DE FOMENTO A LA LECTURA", "jurisdiccion": "C\u00f3rdoba", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 33011804.9, 'Md', '2024', 'Córdoba', '{"programa": "920 - Polo Cultural Y Recreativo- Recursos Afectados-", "jurisdiccion": "C\u00f3rdoba", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 1669761000.0, 'Md', '2024', 'Córdoba', '{"programa": "960 - (C.E.) DEFENSOR\u00cdA DE LOS DERECHOS DE NI\u00d1AS, NI\u00d1OS Y ADOLESCENTES - CUENTA ESPECIAL LEY 8665", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 72093000.0, 'Md', '2024', 'Córdoba', '{"programa": "961 - (C.E.) ESPACIOS PARTICIPATIVOS DE NI\u00d1OS, NI\u00d1AS Y ADOLESCENTES- CUENTA ESPECIAL LEY 8665", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 31799000.0, 'Md', '2024', 'Córdoba', '{"programa": "962 - (C.E.) CAPACITACIONES - CUENTA ESPECIAL LEY 8665", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 74180000.0, 'Md', '2024', 'Córdoba', '{"programa": "963 - (C.E.) DIFUSI\u00d3N - CUENTA ESPECIAL LEY 8665", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 15457000.0, 'Md', '2024', 'Córdoba', '{"programa": "964 - (C.E.) ACCIONES INTERSECTORIALES- CUENTA ESPECIAL LEY 8665-", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 11710000.0, 'Md', '2024', 'Córdoba', '{"programa": "965 - (C.E.) MONITOREO DE DERECHOS- CUENTA ESPECIAL LEY 8665-", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 60259000.0, 'Md', '2024', 'Córdoba', '{"programa": "966 - SISTEMA INTEGRAL DE MONITOREO DE LOS DERECHOS DE NI\u00d1AS, NI\u00d1OS Y ADOLESCENTES", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 2618053036.0, 'Md', '2024', 'Córdoba', '{"programa": "991 - Funcionamiento Operativo Y Mejora Continua De La Agencia C\u00f3rdoba Deportes Sem", "jurisdiccion": "C\u00f3rdoba", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 1303845.557, 'Md', '2024', 'Córdoba', '{"programa": "994 - Apoyo Al Deporte Comunitario Con Financiamiento Nacional", "jurisdiccion": "C\u00f3rdoba", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 216103795.8, 'Md', '2024', 'Córdoba', '{"programa": "998 - Deporte Con Energ\u00eda - Recursos Afectados", "jurisdiccion": "C\u00f3rdoba", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 521168452.4, 'Md', '2024', 'Córdoba', '{"programa": "473 PROGRAMA DE PROTECCI\u00d3N DE LA EMBARAZADA Y SU BEBE", "jurisdiccion": "C\u00f3rdoba", "categoria": "Materno-infantil"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 391153667.2, 'Md', '2024', 'Córdoba', '{"programa": "675 COORDINACI\u00d3N Y FORTALECIMIENTO FAMILIAR-ACTIVIDADES COMUNES", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('51be60c2-aef6-5543-8e9f-23d1faa25123', 'Inversion social en infancia', 'inversion', 164567735.5, 'Md', '2024', 'Córdoba', '{"programa": "678 (C.E.) DESARROLLO COMUNITARIO Y FORTALECIMIENTO FAMILIAR - CUENTA ESPECIAL LEY 8665", "jurisdiccion": "C\u00f3rdoba", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


-- ============================================================
-- DATOS: POBREZA (36 registros)
-- ============================================================

INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('85395d6f-4f28-538a-b547-341fa67eaeba', 'Pobreza infantil', 'pobreza', 21.5, '%', '2016', 'Córdoba', '{"tipo": "Pobreza Hogares", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c2120aa6-227f-56d2-b0af-dc016f9d0f89', 'Pobreza infantil', 'pobreza', 20.4, '%', '2017', 'Córdoba', '{"tipo": "Pobreza Hogares", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b0a6293-2aff-591b-b34e-3e273332320d', 'Pobreza infantil', 'pobreza', 19.6, '%', '2018', 'Córdoba', '{"tipo": "Pobreza Hogares", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('571554e9-a77d-5eba-8955-9cbaf7911b51', 'Pobreza infantil', 'pobreza', 25.4, '%', '2019', 'Córdoba', '{"tipo": "Pobreza Hogares", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b8cd27a4-125a-5004-b289-066ea521d3ca', 'Pobreza infantil', 'pobreza', 30.4, '%', '2020', 'Córdoba', '{"tipo": "Pobreza Hogares", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a49bbd95-a7e4-50b2-89d8-79806128f9fe', 'Pobreza infantil', 'pobreza', 31.2, '%', '2021', 'Córdoba', '{"tipo": "Pobreza Hogares", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

