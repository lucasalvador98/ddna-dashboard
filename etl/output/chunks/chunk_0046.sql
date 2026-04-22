-- Chunk 0046: INSERTs 2301 to 2350 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 6285056495.0, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "683 - Programa Alimentario Provincial", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "PEA"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 3983715.101, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "663 - Consejo Pol\u00edticas Sociales", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 802559.5706, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "663 - Consejo Pol\u00edticas Sociales", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3bd1957c-ae78-5ef8-b337-2aadb81f6ae2', 'Inversion social en infancia', 'inversion', 12373536010.0, 'Md', '2024', '170 - Gastos Generales De La Administración', '{"programa": "717 - Financiamiento Municipios Y Comunas", "jurisdiccion": "170 - Gastos Generales De La Administraci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3bd1957c-ae78-5ef8-b337-2aadb81f6ae2', 'Inversion social en infancia', 'inversion', 8692284.29, 'Md', '2024', '170 - Gastos Generales De La Administración', '{"programa": "719 - Conexi\u00f3n A Internet Estudiantil Gratuito", "jurisdiccion": "170 - Gastos Generales De La Administraci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3bd1957c-ae78-5ef8-b337-2aadb81f6ae2', 'Inversion social en infancia', 'inversion', 555404250.0, 'Md', '2024', '170 - Gastos Generales De La Administración', '{"programa": "719 - Conexi\u00f3n A Internet Estudiantil Gratuito", "jurisdiccion": "170 - Gastos Generales De La Administraci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('eb0abd4f-2e73-5bb3-b0c6-e9d189375816', 'Inversion social en infancia', 'inversion', 26751.98569, 'Md', '2024', '200 - Poder Legislativo', '{"programa": "901 - Programa De Apoyo A Los Sistemas Educativos", "jurisdiccion": "200 - Poder Legislativo", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('eb0abd4f-2e73-5bb3-b0c6-e9d189375816', 'Inversion social en infancia', 'inversion', 4930301.52, 'Md', '2024', '200 - Poder Legislativo', '{"programa": "911 - Programa De Est\u00edmulo A Las Ediciones Literarias Cordobesas Y De Fomento A La Lectura", "jurisdiccion": "200 - Poder Legislativo", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('eb0abd4f-2e73-5bb3-b0c6-e9d189375816', 'Inversion social en infancia', 'inversion', 42803.1771, 'Md', '2024', '200 - Poder Legislativo', '{"programa": "911 - Programa De Est\u00edmulo A Las Ediciones Literarias Cordobesas Y De Fomento A La Lectura", "jurisdiccion": "200 - Poder Legislativo", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ea69dc00-2f3a-59f4-9eb2-66009a7e1dfb', 'Inversion social en infancia', 'inversion', 350163024.3, 'Md', '2024', '450 - Defensoría De Los Derechos De Niñas, Niños Y', '{"programa": "960 - (C.E.) Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes - Cuenta Especial Ley 8665", "jurisdiccion": "450 - Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ea69dc00-2f3a-59f4-9eb2-66009a7e1dfb', 'Inversion social en infancia', 'inversion', 11699291.41, 'Md', '2024', '450 - Defensoría De Los Derechos De Niñas, Niños Y', '{"programa": "960 - (C.E.) Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes - Cuenta Especial Ley 8665", "jurisdiccion": "450 - Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ea69dc00-2f3a-59f4-9eb2-66009a7e1dfb', 'Inversion social en infancia', 'inversion', 47877097.8, 'Md', '2024', '450 - Defensoría De Los Derechos De Niñas, Niños Y', '{"programa": "960 - (C.E.) Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes - Cuenta Especial Ley 8665", "jurisdiccion": "450 - Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ea69dc00-2f3a-59f4-9eb2-66009a7e1dfb', 'Inversion social en infancia', 'inversion', 15374280.04, 'Md', '2024', '450 - Defensoría De Los Derechos De Niñas, Niños Y', '{"programa": "960 - (C.E.) Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes - Cuenta Especial Ley 8665", "jurisdiccion": "450 - Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ea69dc00-2f3a-59f4-9eb2-66009a7e1dfb', 'Inversion social en infancia', 'inversion', 194235.2384, 'Md', '2024', '450 - Defensoría De Los Derechos De Niñas, Niños Y', '{"programa": "961 - (C.E.) Espacios Participativos De Ni\u00f1os, Ni\u00f1as Y Adolescentes- Cuenta Especial Ley 8665", "jurisdiccion": "450 - Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ea69dc00-2f3a-59f4-9eb2-66009a7e1dfb', 'Inversion social en infancia', 'inversion', 15984965.0, 'Md', '2024', '450 - Defensoría De Los Derechos De Niñas, Niños Y', '{"programa": "961 - (C.E.) Espacios Participativos De Ni\u00f1os, Ni\u00f1as Y Adolescentes- Cuenta Especial Ley 8665", "jurisdiccion": "450 - Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ea69dc00-2f3a-59f4-9eb2-66009a7e1dfb', 'Inversion social en infancia', 'inversion', 7426600.0, 'Md', '2024', '450 - Defensoría De Los Derechos De Niñas, Niños Y', '{"programa": "962 - (C.E.) Capacitaciones - Cuenta Especial Ley 8665", "jurisdiccion": "450 - Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ea69dc00-2f3a-59f4-9eb2-66009a7e1dfb', 'Inversion social en infancia', 'inversion', 2193642.6, 'Md', '2024', '450 - Defensoría De Los Derechos De Niñas, Niños Y', '{"programa": "963 - (C.E.) Difusi\u00f3n - Cuenta Especial Ley 8665", "jurisdiccion": "450 - Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ea69dc00-2f3a-59f4-9eb2-66009a7e1dfb', 'Inversion social en infancia', 'inversion', 20908887.21, 'Md', '2024', '450 - Defensoría De Los Derechos De Niñas, Niños Y', '{"programa": "963 - (C.E.) Difusi\u00f3n - Cuenta Especial Ley 8665", "jurisdiccion": "450 - Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ea69dc00-2f3a-59f4-9eb2-66009a7e1dfb', 'Inversion social en infancia', 'inversion', 403391.3221, 'Md', '2024', '450 - Defensoría De Los Derechos De Niñas, Niños Y', '{"programa": "964 - (C.E.) Acciones Intersectoriales- Cuenta Especial Ley 8665-", "jurisdiccion": "450 - Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ea69dc00-2f3a-59f4-9eb2-66009a7e1dfb', 'Inversion social en infancia', 'inversion', 3211142.02, 'Md', '2024', '450 - Defensoría De Los Derechos De Niñas, Niños Y', '{"programa": "964 - (C.E.) Acciones Intersectoriales- Cuenta Especial Ley 8665-", "jurisdiccion": "450 - Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ea69dc00-2f3a-59f4-9eb2-66009a7e1dfb', 'Inversion social en infancia', 'inversion', 3223523.0, 'Md', '2024', '450 - Defensoría De Los Derechos De Niñas, Niños Y', '{"programa": "965 - (C.E.) Monitoreo De Derechos- Cuenta Especial Ley 8665-", "jurisdiccion": "450 - Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ea69dc00-2f3a-59f4-9eb2-66009a7e1dfb', 'Inversion social en infancia', 'inversion', 27870581.0, 'Md', '2024', '450 - Defensoría De Los Derechos De Niñas, Niños Y', '{"programa": "966 - Sistema Integral De Monitoreo De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "jurisdiccion": "450 - Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1f6af3aa-632b-55bb-b22a-4c9f42ceafac', 'Inversion social en infancia', 'inversion', 786015259.7, 'Md', '2024', '605 - Agencia Córdoba De Inversión Y Financiamient', '{"programa": "849 - Programa Del Desarrollo Interior Y Apoyo Social", "jurisdiccion": "605 - Agencia C\u00f3rdoba De Inversi\u00f3n Y Financiamiento S.E.M.", "categoria": "Otros Servicios Urbanos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1f6af3aa-632b-55bb-b22a-4c9f42ceafac', 'Inversion social en infancia', 'inversion', 7312806323.0, 'Md', '2024', '605 - Agencia Córdoba De Inversión Y Financiamient', '{"programa": "849 - Programa Del Desarrollo Interior Y Apoyo Social", "jurisdiccion": "605 - Agencia C\u00f3rdoba De Inversi\u00f3n Y Financiamiento S.E.M.", "categoria": "Otros Servicios Urbanos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 81757.13939, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "856 - Proyectos Especiales Deportivos", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 4638271.317, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "856 - Proyectos Especiales Deportivos", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 39680570.82, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "857 - Deporte Social Y Comunitario", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 13539058.3, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "857 - Deporte Social Y Comunitario", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 25986494.74, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "857 - Deporte Social Y Comunitario", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 2955664.621, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "860 - Apoyo Y Acompa\u00f1amiento Al Deporte Olimpico Y Federado", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 324704.6911, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "860 - Apoyo Y Acompa\u00f1amiento Al Deporte Olimpico Y Federado", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 24612286.16, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "860 - Apoyo Y Acompa\u00f1amiento Al Deporte Olimpico Y Federado", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 48956133.81, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "860 - Apoyo Y Acompa\u00f1amiento Al Deporte Olimpico Y Federado", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 457393756.4, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "991 - Funcionamiento Operativo Y Mejora Continua De La Agencia C\u00f3rdoba Deportes Sem", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 37866125.31, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "991 - Funcionamiento Operativo Y Mejora Continua De La Agencia C\u00f3rdoba Deportes Sem", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 166123726.9, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "991 - Funcionamiento Operativo Y Mejora Continua De La Agencia C\u00f3rdoba Deportes Sem", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 2527644.84, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "991 - Funcionamiento Operativo Y Mejora Continua De La Agencia C\u00f3rdoba Deportes Sem", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 4523755.828, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "991 - Funcionamiento Operativo Y Mejora Continua De La Agencia C\u00f3rdoba Deportes Sem", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 8363625.819, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "998 - Deporte Con Energ\u00eda - Recursos Afectados", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 53069867.89, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "998 - Deporte Con Energ\u00eda - Recursos Afectados", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 267519.8569, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "998 - Deporte Con Energ\u00eda - Recursos Afectados", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 1288933.251, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "998 - Deporte Con Energ\u00eda - Recursos Afectados", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 2306569.448, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "994 - Apoyo Al Deporte Comunitario Con Financiamiento Nacional", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 27860253.59, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "994 - Apoyo Al Deporte Comunitario Con Financiamiento Nacional", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('53359866-5efc-5ec4-9ad0-2aaf08c25064', 'Inversion social en infancia', 'inversion', 384593075.9, 'Md', '2024', '620 - Agencia Córdoba Joven', '{"programa": "620 - Promoci\u00f3n De La Juventud", "jurisdiccion": "620 - Agencia C\u00f3rdoba Joven", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('53359866-5efc-5ec4-9ad0-2aaf08c25064', 'Inversion social en infancia', 'inversion', 85617777.33, 'Md', '2024', '620 - Agencia Córdoba Joven', '{"programa": "620 - Promoci\u00f3n De La Juventud", "jurisdiccion": "620 - Agencia C\u00f3rdoba Joven", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('53359866-5efc-5ec4-9ad0-2aaf08c25064', 'Inversion social en infancia', 'inversion', 113054347.6, 'Md', '2024', '620 - Agencia Córdoba Joven', '{"programa": "620 - Promoci\u00f3n De La Juventud", "jurisdiccion": "620 - Agencia C\u00f3rdoba Joven", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('53359866-5efc-5ec4-9ad0-2aaf08c25064', 'Inversion social en infancia', 'inversion', 67982899.68, 'Md', '2024', '620 - Agencia Córdoba Joven', '{"programa": "620 - Promoci\u00f3n De La Juventud", "jurisdiccion": "620 - Agencia C\u00f3rdoba Joven", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('324469d3-7d97-5c98-acd7-2087ac823cfd', 'Inversion social en infancia', 'inversion', 1902838627.0, 'Md', '2024', '625 - Agencia Córdoba Cultura S.E.', '{"programa": "625 - Agencia Cultura", "jurisdiccion": "625 - Agencia C\u00f3rdoba Cultura S.E.", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('324469d3-7d97-5c98-acd7-2087ac823cfd', 'Inversion social en infancia', 'inversion', 17645386.65, 'Md', '2024', '625 - Agencia Córdoba Cultura S.E.', '{"programa": "625 - Agencia Cultura", "jurisdiccion": "625 - Agencia C\u00f3rdoba Cultura S.E.", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

