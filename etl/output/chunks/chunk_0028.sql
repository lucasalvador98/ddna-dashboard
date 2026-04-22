-- Chunk 0028: INSERTs 1401 to 1450 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 49746885.13, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "463 - (C.E) Programas Nacionales Varios", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Materno-infantil"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 44686121.76, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "467 - Actividades Comunes De La Secretar\u00eda De Prevenci\u00f3n Y Promoci\u00f3n De La Salud", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Prevenci\u00f3n de enfermedades y riesgos espec\u00edficos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 53604915.87, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "468 - Asistencia Sanitaria", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 234299889.5, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "470 - Desarrollo De Infraestructura Y Equipamiento Hospitalario", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 4166560.078, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "471 - Integraci\u00f3n Sanitaria", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 2345969.02, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "658 - Protecci\u00f3n Integral De Personas Con Discapacidad", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 109629904.0, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "681 - Asistencia Y Prevenci\u00f3n De La Adicci\u00f3n", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 16476619.96, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "688 - Programa De Servicios A Las Personas Con Discapacidad (Prosad)", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 1908538.0, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "690 - (Ce) Contenci\u00f3n Y Protecci\u00f3n De V\u00edctimas Del Narcotr\u00e1fico. Cuenta Especial Ley 10.067", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5d09a3cd-d490-5237-80be-d8111270216e', 'Inversion social en infancia', 'inversion', 46784596.95, 'Md', '2024', '150 - Ministerio De Obras Públicas Y Financiamient', '{"programa": "502 - Vivienda", "jurisdiccion": "150 - Ministerio De Obras P\u00fablicas Y Financiamiento", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5d09a3cd-d490-5237-80be-d8111270216e', 'Inversion social en infancia', 'inversion', 29410278.46, 'Md', '2024', '150 - Ministerio De Obras Públicas Y Financiamient', '{"programa": "503 - Viviendas, Infraestructura Y Equipamiento Comunitario", "jurisdiccion": "150 - Ministerio De Obras P\u00fablicas Y Financiamiento", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5d09a3cd-d490-5237-80be-d8111270216e', 'Inversion social en infancia', 'inversion', 510687580.0, 'Md', '2024', '150 - Ministerio De Obras Públicas Y Financiamient', '{"programa": "506 - Arquitectura", "jurisdiccion": "150 - Ministerio De Obras P\u00fablicas Y Financiamiento", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5d09a3cd-d490-5237-80be-d8111270216e', 'Inversion social en infancia', 'inversion', 1699752.001, 'Md', '2024', '150 - Ministerio De Obras Públicas Y Financiamient', '{"programa": "517 - Escrituraci\u00f3n De Viviendas", "jurisdiccion": "150 - Ministerio De Obras P\u00fablicas Y Financiamiento", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5d09a3cd-d490-5237-80be-d8111270216e', 'Inversion social en infancia', 'inversion', 96696801.6, 'Md', '2024', '150 - Ministerio De Obras Públicas Y Financiamient', '{"programa": "518 - PLAN LOTENGO", "jurisdiccion": "150 - Ministerio De Obras P\u00fablicas Y Financiamiento", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5d09a3cd-d490-5237-80be-d8111270216e', 'Inversion social en infancia', 'inversion', 236057.932, 'Md', '2024', '150 - Ministerio De Obras Públicas Y Financiamient', '{"programa": "519 - Programa Vivienda Semilla", "jurisdiccion": "150 - Ministerio De Obras P\u00fablicas Y Financiamiento", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5d09a3cd-d490-5237-80be-d8111270216e', 'Inversion social en infancia', 'inversion', 10822356.92, 'Md', '2024', '150 - Ministerio De Obras Públicas Y Financiamient', '{"programa": "524 - Mejoramiento De Viviendas", "jurisdiccion": "150 - Ministerio De Obras P\u00fablicas Y Financiamiento", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5d09a3cd-d490-5237-80be-d8111270216e', 'Inversion social en infancia', 'inversion', 26978049.37, 'Md', '2024', '150 - Ministerio De Obras Públicas Y Financiamient', '{"programa": "525 - Cr\u00e9dito Tu Casa - Diferencial De Inter\u00e9s", "jurisdiccion": "150 - Ministerio De Obras P\u00fablicas Y Financiamiento", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b4f7a151-dd3c-5a85-9ab3-53bdbd3e2174', 'Inversion social en infancia', 'inversion', 4734507.155, 'Md', '2024', '155 - Ministerio De Servicios Públicos', '{"programa": "560 - (C.E) Fondo Para La Gestion De Residuos S\u00f3lidos Urbanos Ley N\u00b0 9088", "jurisdiccion": "155 - Ministerio De Servicios P\u00fablicos", "categoria": "Otros Servicios Urbanos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b4f7a151-dd3c-5a85-9ab3-53bdbd3e2174', 'Inversion social en infancia', 'inversion', 679933247.1, 'Md', '2024', '155 - Ministerio De Servicios Públicos', '{"programa": "602 - Boleto Educativo Gratuito (B.E.G) - Ley 10031", "jurisdiccion": "155 - Ministerio De Servicios P\u00fablicos", "categoria": "Transporte escolar"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b4f7a151-dd3c-5a85-9ab3-53bdbd3e2174', 'Inversion social en infancia', 'inversion', 33174700.04, 'Md', '2024', '155 - Ministerio De Servicios Públicos', '{"programa": "603 - Boleto Obrero Social (B.O.S.) - Decreto N\u00b0 272/2015", "jurisdiccion": "155 - Ministerio De Servicios P\u00fablicos", "categoria": "Transferencias de ingresos a las familias"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b4f7a151-dd3c-5a85-9ab3-53bdbd3e2174', 'Inversion social en infancia', 'inversion', 37848577.5, 'Md', '2024', '155 - Ministerio De Servicios Públicos', '{"programa": "610 - Boleto Social Cordobes (Bsc)- Decreto N\u00b0 779/2017", "jurisdiccion": "155 - Ministerio De Servicios P\u00fablicos", "categoria": "Transferencias de ingresos a las familias"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b4f7a151-dd3c-5a85-9ab3-53bdbd3e2174', 'Inversion social en infancia', 'inversion', 908985946.7, 'Md', '2024', '155 - Ministerio De Servicios Públicos', '{"programa": "611 - ASISTENCIA AL TRANSPORTE P\u00daBLICO", "jurisdiccion": "155 - Ministerio De Servicios P\u00fablicos", "categoria": "Emergencia"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 162821305.5, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "652 - (C.E.) Desarrollo Social - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 35009639.49, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "660 - Vida Digna - Recursos Afectados ", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 520528643.8, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "661 - Tarifa Solidaria", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Transferencias de ingresos a las familias"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 100860509.7, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "662 - H\u00e1bitat", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 5479916.279, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "663 - Consejo Politicas Sociales", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 27180789.13, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "668 - (C.E.) Turismo Social - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 78504841.05, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "670 - (C.E.) Complemento Nutricional Para Grupos Vulnerables- Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "PEA"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 99854656.11, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "682 - Programas Sociales Financiados Con Recursos Nacionales", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "PEA"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 607949918.8, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "683 - Tarjeta Social - Programa Alimentario Provincial", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "PEA"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 110490569.0, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "691 - Asistencia A La Familia", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3bd1957c-ae78-5ef8-b337-2aadb81f6ae2', 'Inversion social en infancia', 'inversion', 1245170976.0, 'Md', '2024', '170 - Gastos Generales De La Administración', '{"programa": "717 - Financiamiento Municipios Y Comunas", "jurisdiccion": "170 - Gastos Generales De La Administraci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('eb0abd4f-2e73-5bb3-b0c6-e9d189375816', 'Inversion social en infancia', 'inversion', 318291.8039, 'Md', '2024', '200 - Poder Legislativo', '{"programa": "901 - Programa De Apoyo A Los Sistemas Educativos", "jurisdiccion": "200 - Poder Legislativo", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('eb0abd4f-2e73-5bb3-b0c6-e9d189375816', 'Inversion social en infancia', 'inversion', 1318161.263, 'Md', '2024', '200 - Poder Legislativo', '{"programa": "911 - Programa De Est\u00edmulo A Las Ediciones Literarias Cordobesas Y De Fomento A La Lectura", "jurisdiccion": "200 - Poder Legislativo", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 409221.3509, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "856 - Proyectos Especiales Deportivos", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 6325642.791, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "857 - Deporte Social Y Comunitario", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 3060472.777, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "858 - Fortalecimiento De Los Centros De Desarrollo Deportivo", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 10758930.66, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "860 - Apoyo Y Acompa\u00f1amiento Al Deporte Olimpico Y Federado", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 187089.9895, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "861 - Cordoba Te Incluye", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 547664.7774, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "862 - Nos Vemos En El Club", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 1882992.634, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "863 - Infraestructura Deportiva Provincial", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 1274872.756, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "865 - Centro De Alto Rendimiento Deportivo", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 83100224.75, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "991 - Funcionamiento Operativo Y Mejora Continua De La Agencia C\u00f3rdoba Deportes Sem", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('53359866-5efc-5ec4-9ad0-2aaf08c25064', 'Inversion social en infancia', 'inversion', 118489297.0, 'Md', '2024', '620 - Agencia Córdoba Joven', '{"programa": "620 - Promoci\u00f3n De La Juventud", "jurisdiccion": "620 - Agencia C\u00f3rdoba Joven", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('324469d3-7d97-5c98-acd7-2087ac823cfd', 'Inversion social en infancia', 'inversion', 495193914.9, 'Md', '2024', '625 - Agencia Córdoba Cultura S.E.', '{"programa": "625 - Agencia Cultura", "jurisdiccion": "625 - Agencia C\u00f3rdoba Cultura S.E.", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('324469d3-7d97-5c98-acd7-2087ac823cfd', 'Inversion social en infancia', 'inversion', 2867312.384, 'Md', '2024', '625 - Agencia Córdoba Cultura S.E.', '{"programa": "626 - Cultura - Recursos Afectados", "jurisdiccion": "625 - Agencia C\u00f3rdoba Cultura S.E.", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('324469d3-7d97-5c98-acd7-2087ac823cfd', 'Inversion social en infancia', 'inversion', 17527175.62, 'Md', '2024', '625 - Agencia Córdoba Cultura S.E.', '{"programa": "629 - Programa De Articulaci\u00f3n Y Apoyo A La Producci\u00f3n Y Realizaci\u00f3n Art\u00edstico Cultural", "jurisdiccion": "625 - Agencia C\u00f3rdoba Cultura S.E.", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('324469d3-7d97-5c98-acd7-2087ac823cfd', 'Inversion social en infancia', 'inversion', 636346.8057, 'Md', '2024', '625 - Agencia Córdoba Cultura S.E.', '{"programa": "630 - Programa De Apoyo, Promoci\u00f3n Y Difusi\u00f3n De La Reflexi\u00f3n E Investigaci\u00f3n Cultural", "jurisdiccion": "625 - Agencia C\u00f3rdoba Cultura S.E.", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('73e9e654-7df5-5cb2-a575-18c3f680f274', 'Inversion social en infancia', 'inversion', 16684430.69, 'Md', '2024', '705 - Caja De Jubilaciones, Pensiones Y Retiros De', '{"programa": "891 - Fondo De Financiamiento De Actividades Recreativas Y Sociales - Ley 9884", "jurisdiccion": "705 - Caja De Jubilaciones, Pensiones Y Retiros De C\u00f3rdoba", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

