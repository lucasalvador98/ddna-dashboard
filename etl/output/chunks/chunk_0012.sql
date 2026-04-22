-- Chunk 0012: INSERTs 601 to 650 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 7244072.495, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "671 - (C.E.) Pol\u00edticas De Asistencia A Ni\u00f1os Y Adolescentes - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 11611593.38, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "672 - (C.E.) El Ni\u00f1o Y El Adolescente En Conflicto Con La Ley Penal - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 187791057.5, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "673 - Ni\u00f1ez, Adolescencia Y Familia - Actividades Comunes", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 10560.0, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "675 - (C.E.) Fortalecimiento Familiar Y Comunitario - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 12633558.0, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "676 - (C.E.) Organismos De Gesti\u00f3n Asistida (Ogas) - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 107899.4282, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "678 - Programas Financiados Con Recursos Nacionales", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 4180.8, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "681 - Asistencia Y Prevenci\u00f3n De La Adicci\u00f3n", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 2630941.715, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "683 - Tarjeta Social - Programa Alimentario Provincial", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "PEA"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 2421748.803, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "684 - (C.E.) Fondo Para La Prevenci\u00f3n De La Violencia Familiar - Cuenta Especial Ley 9505", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Violencia familiar"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 431196.3795, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "685 - Prevenci\u00f3n, Detecci\u00f3n Temprana, Atencion Y Erradicaci\u00f3n De La Violencia Familiar", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Violencia familiar"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3bd1957c-ae78-5ef8-b337-2aadb81f6ae2', 'Inversion social en infancia', 'inversion', 88600000.0, 'Md', '2024', '170 - Gastos Generales De La Administración', '{"programa": "717 - Financiamiento Municipios Y Comunas", "jurisdiccion": "170 - Gastos Generales De La Administraci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('eb0abd4f-2e73-5bb3-b0c6-e9d189375816', 'Inversion social en infancia', 'inversion', 6695243.27, 'Md', '2024', '200 - Poder Legislativo', '{"programa": "904 - Aportes Al Consejo Provincial De La Mujer", "jurisdiccion": "200 - Poder Legislativo", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1f6af3aa-632b-55bb-b22a-4c9f42ceafac', 'Inversion social en infancia', 'inversion', 265255.1046, 'Md', '2024', '605 - Agencia Córdoba De Inversión Y Financiamient', '{"programa": "834 - Promeba Ii - Programa De Mejoramiento De Barrios Etapa Ii", "jurisdiccion": "605 - Agencia C\u00f3rdoba De Inversi\u00f3n Y Financiamiento S.E.M.", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1f6af3aa-632b-55bb-b22a-4c9f42ceafac', 'Inversion social en infancia', 'inversion', 356206.5273, 'Md', '2024', '605 - Agencia Córdoba De Inversión Y Financiamient', '{"programa": "840 - Pdspc - Programa De Desarrollo Social De La Provincia De C\u00f3rdoba", "jurisdiccion": "605 - Agencia C\u00f3rdoba De Inversi\u00f3n Y Financiamiento S.E.M.", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1f6af3aa-632b-55bb-b22a-4c9f42ceafac', 'Inversion social en infancia', 'inversion', 460914.069, 'Md', '2024', '605 - Agencia Córdoba De Inversión Y Financiamient', '{"programa": "851 - Programa De Desarrollo De Areas Rurales", "jurisdiccion": "605 - Agencia C\u00f3rdoba De Inversi\u00f3n Y Financiamiento S.E.M.", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1f6af3aa-632b-55bb-b22a-4c9f42ceafac', 'Inversion social en infancia', 'inversion', 2660736.354, 'Md', '2024', '605 - Agencia Córdoba De Inversión Y Financiamient', '{"programa": "982 - Pmv-Vd - Programa De Mejoramiento De Viviendas - Vida Digna", "jurisdiccion": "605 - Agencia C\u00f3rdoba De Inversi\u00f3n Y Financiamiento S.E.M.", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 36273.94195, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "856 - Proyectos Especiales Deportivos", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 1906326.527, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "857 - Deporte Social Y Comunitario", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 531061.9284, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "858 - Fortalecimiento De Los Centros De Desarrollo Deportivo", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 1359853.322, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "860 - Apoyo Y Acompa\u00f1amiento Al Deporte Olimpico Y Federado", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 51732.74395, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "861 - Cordoba Te Incluye", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 12185.95826, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "862 - Nos Vemos En El Club", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 873283.5454, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "863 - Infraestructura Deportiva Provincial", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 25124.39944, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "864 - Deporte Saludable Entre Todos", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 380022.1548, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "865 - Centro De Alto Rendimiento Deportivo", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 11172554.17, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "991 - Funcionamiento Operativo Y Mejora Continua De La Agencia C\u00f3rdoba Deportes Sem", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('53359866-5efc-5ec4-9ad0-2aaf08c25064', 'Inversion social en infancia', 'inversion', 1316804.0, 'Md', '2024', '620 - Agencia Córdoba Joven', '{"programa": "620 - Promoci\u00f3n De La Juventud", "jurisdiccion": "620 - Agencia C\u00f3rdoba Joven", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('324469d3-7d97-5c98-acd7-2087ac823cfd', 'Inversion social en infancia', 'inversion', 50559570.68, 'Md', '2024', '625 - Agencia Córdoba Cultura S.E.', '{"programa": "625 - Agencia Cultura", "jurisdiccion": "625 - Agencia C\u00f3rdoba Cultura S.E.", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('324469d3-7d97-5c98-acd7-2087ac823cfd', 'Inversion social en infancia', 'inversion', 1287465.988, 'Md', '2024', '625 - Agencia Córdoba Cultura S.E.', '{"programa": "626 - Cultura - Recursos Afectados", "jurisdiccion": "625 - Agencia C\u00f3rdoba Cultura S.E.", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('324469d3-7d97-5c98-acd7-2087ac823cfd', 'Inversion social en infancia', 'inversion', 2390691.254, 'Md', '2024', '625 - Agencia Córdoba Cultura S.E.', '{"programa": "629 - Programa De Articulaci\u00f3n Y Apoyo A La Producci\u00f3n Y Realizaci\u00f3n Art\u00edstico Cultural", "jurisdiccion": "625 - Agencia C\u00f3rdoba Cultura S.E.", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('324469d3-7d97-5c98-acd7-2087ac823cfd', 'Inversion social en infancia', 'inversion', 109300.734, 'Md', '2024', '625 - Agencia Córdoba Cultura S.E.', '{"programa": "630 - Programa De Apoyo, Promoci\u00f3n Y Difusi\u00f3n De La Reflexi\u00f3n E Investigaci\u00f3n Cultural", "jurisdiccion": "625 - Agencia C\u00f3rdoba Cultura S.E.", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('76b44126-0da2-57d7-b077-ec46a46d18d4', 'Inversion social en infancia', 'inversion', 130900.0, 'Md', '2024', '640 - Agencia De Promoción De Empleo Y Formación P', '{"programa": "641 - Convenios Con El Estado Nacional Y Otros Organismos Para Formaci\u00f3n Profesional Y Desarrollo Re", "jurisdiccion": "640 - Agencia De Promoci\u00f3n De Empleo Y Formaci\u00f3n Profesional", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('7af68d9c-2635-55de-9dcb-1b31b7be7d4a', 'Inversion social en infancia', 'inversion', 493517916.2, 'Md', '2024', '710 - Administración Provincial Del Seguro De Salu', '{"programa": "000 - Prestaciones a la seguridad social", "jurisdiccion": "710 - Administraci\u00f3n Provincial Del Seguro De Salud", "categoria": "Obras sociales"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 4941928.684, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "960 - (C.E.) Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes - Cuenta Especial Ley 8665", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 42198.475, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "961 - (C.E.) Mesas De Trabajo - Cuenta Especial Ley 8665", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 34999.89, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "962 - (C.E.) Capacitaciones - Cuenta Especial Ley 8665", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4b0ca5d5-83c4-553f-a027-758f87c59935', 'Inversion social en infancia', 'inversion', 335386.0, 'Md', '2024', 'Defensoría De Los Derechos De Niñas, Niños Y Adole', '{"programa": "963 - (C.E.) Difusi\u00f3n - Cuenta Especial Ley 8665", "jurisdiccion": "Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('16e2fff6-9bc0-54cc-87c9-e140ea411393', 'Inversion social en infancia', 'inversion', 38243.96, 'Md', '2024', '(en blanco)', '{"programa": "506 - Arquitectura", "jurisdiccion": "(en blanco)", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('16e2fff6-9bc0-54cc-87c9-e140ea411393', 'Inversion social en infancia', 'inversion', 4315929.69, 'Md', '2024', '(en blanco)', '{"programa": "506 - Arquitectura", "jurisdiccion": "(en blanco)", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('16e2fff6-9bc0-54cc-87c9-e140ea411393', 'Inversion social en infancia', 'inversion', 620939.7682, 'Md', '2024', '(en blanco)', '{"programa": "840 - Pdspc - Programa De Desarrollo Social De La Provincia De C\u00f3rdoba", "jurisdiccion": "(en blanco)", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('16e2fff6-9bc0-54cc-87c9-e140ea411393', 'Inversion social en infancia', 'inversion', 2332106.041, 'Md', '2024', '(en blanco)', '{"programa": "840 - Pdspc - Programa De Desarrollo Social De La Provincia De C\u00f3rdoba", "jurisdiccion": "(en blanco)", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('aab7b67a-5753-594c-8168-b809c6b3abc9', 'Inversion social en infancia', 'inversion', 490278.7717, 'Md', '2024', '110 - Jefatura De Gabinete', '{"programa": "104 - Relaci\u00f3n Y Apoyo Con O.N.G. Y Municipios", "jurisdiccion": "110 - Jefatura De Gabinete", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('aab7b67a-5753-594c-8168-b809c6b3abc9', 'Inversion social en infancia', 'inversion', 12877991.11, 'Md', '2024', '110 - Jefatura De Gabinete', '{"programa": "108 - Ayuda Directa A La Comunidad", "jurisdiccion": "110 - Jefatura De Gabinete", "categoria": "Emergencia"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02779f5e-1b7c-5c98-94c4-dab6141686b7', 'Inversion social en infancia', 'inversion', 36764588.0, 'Md', '2024', '120 - Ministerio De Administración Y Gestión Públi', '{"programa": "212 - Programas Sociales Financiados Con Recursos Nacionales - Paicor", "jurisdiccion": "120 - Ministerio De Administraci\u00f3n Y Gesti\u00f3n P\u00fablica", "categoria": "Comedores escolares y copa de leche"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02779f5e-1b7c-5c98-94c4-dab6141686b7', 'Inversion social en infancia', 'inversion', 786422394.0, 'Md', '2024', '120 - Ministerio De Administración Y Gestión Públi', '{"programa": "213 - (P.A.I.Cor.) Programa Asistencia Integral C\u00f3rdoba", "jurisdiccion": "120 - Ministerio De Administraci\u00f3n Y Gesti\u00f3n P\u00fablica", "categoria": "Comedores escolares y copa de leche"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8d8a14d2-294d-53d7-9b50-35f9780b81d4', 'Inversion social en infancia', 'inversion', 4559149.946, 'Md', '2024', '130 - Ministerio De Ciencia Y Tecnología', '{"programa": "300 - Ciencia Y Tecnolog\u00eda", "jurisdiccion": "130 - Ministerio De Ciencia Y Tecnolog\u00eda", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8d8a14d2-294d-53d7-9b50-35f9780b81d4', 'Inversion social en infancia', 'inversion', 167556.9189, 'Md', '2024', '130 - Ministerio De Ciencia Y Tecnología', '{"programa": "313 - Divulgaci\u00f3n Y Ense\u00f1anza De La Ciencia Y La Tecnolog\u00eda", "jurisdiccion": "130 - Ministerio De Ciencia Y Tecnolog\u00eda", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8d8a14d2-294d-53d7-9b50-35f9780b81d4', 'Inversion social en infancia', 'inversion', 1672985.768, 'Md', '2024', '130 - Ministerio De Ciencia Y Tecnología', '{"programa": "316 - Promoci\u00f3n Cient\u00edfica Y Ense\u00f1anza De Las Ciencias", "jurisdiccion": "130 - Ministerio De Ciencia Y Tecnolog\u00eda", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8d8a14d2-294d-53d7-9b50-35f9780b81d4', 'Inversion social en infancia', 'inversion', 32657.75521, 'Md', '2024', '130 - Ministerio De Ciencia Y Tecnología', '{"programa": "318 - Ciencia Y Tecnolog\u00eda - Recursos Afectados", "jurisdiccion": "130 - Ministerio De Ciencia Y Tecnolog\u00eda", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c6f69723-230a-560a-8166-0945157ba77b', 'Inversion social en infancia', 'inversion', 259826559.0, 'Md', '2024', '135 - Ministerio De Educación', '{"programa": "350 - Ministerio De Educaci\u00f3n", "jurisdiccion": "135 - Ministerio De Educaci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

