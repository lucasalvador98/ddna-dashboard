-- Chunk 0026: INSERTs 1301 to 1350 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4690ec5e-e922-5674-a80d-91caa47a5e6f', 'Inversion social en infancia', 'inversion', 20254050.66, 'Md', '2024', '155 - Ministerio De Agua, Ambiente Y Servicios Púb', '{"programa": "610 - Boleto Social Cordobes (Bsc)- Decreto N\u00b0 779/2017", "jurisdiccion": "155 - Ministerio De Agua, Ambiente Y Servicios P\u00fablicos", "categoria": "Transferencias de ingresos a las familias"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 86905232.26, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "652 - (C.E.) Desarrollo Social - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 143488522.7, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "661 - Tarifa Solidaria", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Transferencias de ingresos a las familias"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 21630248.72, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "662 - H\u00e1bitat", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 2802465.19, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "663 - Consejo Politicas Sociales", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 159614.3119, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "664 - Regularizaci\u00f3n Dominial", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 23065245.02, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "668 - (C.E.) Turismo Social - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 1056060.053, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "669 - (C.E) Erradicaci\u00f3n Del Chagas - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Prevenci\u00f3n de enfermedades y riesgos espec\u00edficos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 18289507.0, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "670 - (C.E.) Complemento Nutricional Para Grupos Vulnerables- Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "PEA"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 84511329.42, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "674 - Vida Digna", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 38784792.51, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "682 - Programas Sociales Financiados Con Recursos Nacionales", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "PEA"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 293676992.8, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "683 - Tarjeta Social - Programa Alimentario Provincial", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "PEA"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 248988166.4, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "691 - Asistencia A La Familia", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3bd1957c-ae78-5ef8-b337-2aadb81f6ae2', 'Inversion social en infancia', 'inversion', 840403670.5, 'Md', '2024', '170 - Gastos Generales De La Administración', '{"programa": "717 - Financiamiento Municipios Y Comunas", "jurisdiccion": "170 - Gastos Generales De La Administraci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('eb0abd4f-2e73-5bb3-b0c6-e9d189375816', 'Inversion social en infancia', 'inversion', 433325.0957, 'Md', '2024', '200 - Poder Legislativo', '{"programa": "901 - Programa De Apoyo A Los Sistemas Educativos", "jurisdiccion": "200 - Poder Legislativo", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('eb0abd4f-2e73-5bb3-b0c6-e9d189375816', 'Inversion social en infancia', 'inversion', 1017625.842, 'Md', '2024', '200 - Poder Legislativo', '{"programa": "911 - Programa De Est\u00edmulo A Las Ediciones Literarias Cordobesas Y De Fomento A La Lectura", "jurisdiccion": "200 - Poder Legislativo", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1f6af3aa-632b-55bb-b22a-4c9f42ceafac', 'Inversion social en infancia', 'inversion', 251833.2959, 'Md', '2024', '605 - Agencia Córdoba De Inversión Y Financiamient', '{"programa": "851 - Proderi - Programa De Desarrollo Social Incluyente", "jurisdiccion": "605 - Agencia C\u00f3rdoba De Inversi\u00f3n Y Financiamiento S.E.M.", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1f6af3aa-632b-55bb-b22a-4c9f42ceafac', 'Inversion social en infancia', 'inversion', 12555091.23, 'Md', '2024', '605 - Agencia Córdoba De Inversión Y Financiamient', '{"programa": "984 - Promeba Iv - Programa De Mejoramiento De Barrios Iv", "jurisdiccion": "605 - Agencia C\u00f3rdoba De Inversi\u00f3n Y Financiamiento S.E.M.", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1f6af3aa-632b-55bb-b22a-4c9f42ceafac', 'Inversion social en infancia', 'inversion', 175031764.6, 'Md', '2024', '605 - Agencia Córdoba De Inversión Y Financiamient', '{"programa": "990 - Rehabilitaci\u00f3n Integral Canal Los Molinos - C\u00f3rdoba", "jurisdiccion": "605 - Agencia C\u00f3rdoba De Inversi\u00f3n Y Financiamiento S.E.M.", "categoria": "Agua potable y alcantarillado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 881450.9919, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "856 - Proyectos Especiales Deportivos", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 8712334.111, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "857 - Deporte Social Y Comunitario", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 2496601.494, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "858 - Fortalecimiento De Los Centros De Desarrollo Deportivo", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 6961077.215, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "860 - Apoyo Y Acompa\u00f1amiento Al Deporte Olimpico Y Federado", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 324375.4319, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "861 - Cordoba Te Incluye", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 1686840.049, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "862 - Nos Vemos En El Club", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 18053357.79, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "863 - Infraestructura Deportiva Provincial", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 1250018.189, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "865 - Centro De Alto Rendimiento Deportivo", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 68221318.5, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "991 - Funcionamiento Operativo Y Mejora Continua De La Agencia C\u00f3rdoba Deportes Sem", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('53359866-5efc-5ec4-9ad0-2aaf08c25064', 'Inversion social en infancia', 'inversion', 71633533.02, 'Md', '2024', '620 - Agencia Córdoba Joven', '{"programa": "620 - Promoci\u00f3n De La Juventud", "jurisdiccion": "620 - Agencia C\u00f3rdoba Joven", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('324469d3-7d97-5c98-acd7-2087ac823cfd', 'Inversion social en infancia', 'inversion', 437532000.1, 'Md', '2024', '625 - Agencia Córdoba Cultura S.E.', '{"programa": "625 - Agencia Cultura", "jurisdiccion": "625 - Agencia C\u00f3rdoba Cultura S.E.", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('324469d3-7d97-5c98-acd7-2087ac823cfd', 'Inversion social en infancia', 'inversion', 2592575.724, 'Md', '2024', '625 - Agencia Córdoba Cultura S.E.', '{"programa": "626 - Cultura - Recursos Afectados", "jurisdiccion": "625 - Agencia C\u00f3rdoba Cultura S.E.", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('324469d3-7d97-5c98-acd7-2087ac823cfd', 'Inversion social en infancia', 'inversion', 353220.7267, 'Md', '2024', '625 - Agencia Córdoba Cultura S.E.', '{"programa": "628 - Cultura I.N.C.A.A.", "jurisdiccion": "625 - Agencia C\u00f3rdoba Cultura S.E.", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('324469d3-7d97-5c98-acd7-2087ac823cfd', 'Inversion social en infancia', 'inversion', 17414136.81, 'Md', '2024', '625 - Agencia Córdoba Cultura S.E.', '{"programa": "629 - Programa De Articulaci\u00f3n Y Apoyo A La Producci\u00f3n Y Realizaci\u00f3n Art\u00edstico Cultural", "jurisdiccion": "625 - Agencia C\u00f3rdoba Cultura S.E.", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('324469d3-7d97-5c98-acd7-2087ac823cfd', 'Inversion social en infancia', 'inversion', 647432.5438, 'Md', '2024', '625 - Agencia Córdoba Cultura S.E.', '{"programa": "630 - Programa De Apoyo, Promoci\u00f3n Y Difusi\u00f3n De La Reflexi\u00f3n E Investigaci\u00f3n Cultural", "jurisdiccion": "625 - Agencia C\u00f3rdoba Cultura S.E.", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('73e9e654-7df5-5cb2-a575-18c3f680f274', 'Inversion social en infancia', 'inversion', 12945763.47, 'Md', '2024', '705 - Caja De Jubilaciones, Pensiones Y Retiros De', '{"programa": "891 - Fondo De Financiamiento De Actividades Recreativas Y Sociales - Ley 9884", "jurisdiccion": "705 - Caja De Jubilaciones, Pensiones Y Retiros De C\u00f3rdoba", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('7af68d9c-2635-55de-9dcb-1b31b7be7d4a', 'Inversion social en infancia', 'inversion', 3158616234.0, 'Md', '2024', '710 - Administración Provincial Del Seguro De Salu', '{"programa": "000 - Prestaciones a la seguridad social", "jurisdiccion": "710 - Administraci\u00f3n Provincial Del Seguro De Salud", "categoria": "Obras sociales"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('7b544ca0-4f04-5b82-b886-3caade35c851', 'Inversion social en infancia', 'inversion', 853774.3973, 'Md', '2024', '866 - Universidad Provincial De Córdoba', '{"programa": "920 - Polo Cultural Y Recreativo", "jurisdiccion": "866 - Universidad Provincial De C\u00f3rdoba", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 30394434.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "960 - (C.E.) Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes - Cuenta Especial Ley 8665", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 1621129.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "961 - (C.E.) Mesas De Trabajo - Cuenta Especial Ley 8665", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 771888.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "962 - (C.E.) Capacitaciones - Cuenta Especial Ley 8665", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 2308519.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "963 - (C.E.) Difusi\u00f3n - Cuenta Especial Ley 8665", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 21083.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "964 - (C.E.) Acciones Intersectoriales- Cuenta Especial Ley 8665- ", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 61000.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "965 - (C.E.) Monitoreo De Derechos- Cuenta Especial Ley 8665- ", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 936558.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "966 - Sistema Integral De Monitoreo De Los Derechos De Nin\u0303as, Nin\u0303os Y Adolescentes ", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b8d59b9-35cb-598f-977b-c88dd724f8e3', 'Inversion social en infancia', 'inversion', 20850299.0, 'Md', '2024', '101 - Dependencia Inmediata Del Poder Ejecutivo', '{"programa": "012 - Funcionamiento Del Consejo Provincial De Las Mujeres - Actividades Centrales", "jurisdiccion": "101 - Dependencia Inmediata Del Poder Ejecutivo", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b8d59b9-35cb-598f-977b-c88dd724f8e3', 'Inversion social en infancia', 'inversion', 13599.0, 'Md', '2024', '101 - Dependencia Inmediata Del Poder Ejecutivo', '{"programa": "014 - Programa De Empoderamiento Territorial De Las Mujeres", "jurisdiccion": "101 - Dependencia Inmediata Del Poder Ejecutivo", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b8d59b9-35cb-598f-977b-c88dd724f8e3', 'Inversion social en infancia', 'inversion', 58795.8484, 'Md', '2024', '101 - Dependencia Inmediata Del Poder Ejecutivo', '{"programa": "015 - Programa De Capacitaci\u00f3n Y Promoci\u00f3n Social", "jurisdiccion": "101 - Dependencia Inmediata Del Poder Ejecutivo", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a611750b-c76d-593b-9a88-d81d6d86b091', 'Inversion social en infancia', 'inversion', 861972.2833, 'Md', '2024', '105 - Secretaría De Equidad Y Promoción Del Empleo', '{"programa": "645 - DESARROLLO REGIONAL DEL NOROESTE", "jurisdiccion": "105 - Secretar\u00eda De Equidad Y Promoci\u00f3n Del Empleo", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a611750b-c76d-593b-9a88-d81d6d86b091', 'Inversion social en infancia', 'inversion', 505659533.3, 'Md', '2024', '105 - Secretaría De Equidad Y Promoción Del Empleo', '{"programa": "647 - Programas De Empleo Y Becas Acad\u00e9micas", "jurisdiccion": "105 - Secretar\u00eda De Equidad Y Promoci\u00f3n Del Empleo", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a611750b-c76d-593b-9a88-d81d6d86b091', 'Inversion social en infancia', 'inversion', 367222503.0, 'Md', '2024', '105 - Secretaría De Equidad Y Promoción Del Empleo', '{"programa": "649 - Salas Cunas", "jurisdiccion": "105 - Secretar\u00eda De Equidad Y Promoci\u00f3n Del Empleo", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

