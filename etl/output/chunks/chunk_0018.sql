-- Chunk 0018: INSERTs 901 to 950 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 664946057.8, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "458 - Centros Asistenciales Del Interior", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 162509386.2, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "461 - Centros Asistenciales De Salud Mental", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 56663170.0, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "462 - (C.E) Programa Sumar - Ex-Plan Nacer Resolucion N\u00ba 00425/05", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Materno-infantil"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 24567122.01, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "463 - (C.E) Programas Nacionales Varios", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Materno-infantil"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 38051656.05, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "467 - Actividades Comunes De La Secretar\u00eda De Prevenci\u00f3n Y Promoci\u00f3n De La Salud", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Prevenci\u00f3n de enfermedades y riesgos espec\u00edficos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 19189457.49, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "468 - Asistencia Sanitaria", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 15429709.0, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "470 - Desarrollo De Infraestructura Y Equipamiento Hospitalario", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 1793962.611, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "471 - Integraci\u00f3n Sanitaria", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 76823.61992, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "475 - Promoci\u00f3n, Prevenci\u00f3n Y Atenci\u00f3n En Zonas Rurales", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Prevenci\u00f3n de enfermedades y riesgos espec\u00edficos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4a81ed2c-ae08-58e7-838a-3c129b13d665', 'Inversion social en infancia', 'inversion', 18287072.58, 'Md', '2024', '150 - Ministerio De Infraestructura', '{"programa": "502 - Vivienda", "jurisdiccion": "150 - Ministerio De Infraestructura", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4a81ed2c-ae08-58e7-838a-3c129b13d665', 'Inversion social en infancia', 'inversion', 128918739.4, 'Md', '2024', '150 - Ministerio De Infraestructura', '{"programa": "503 - Viviendas, Infraestructura Y Equipamiento Comunitario", "jurisdiccion": "150 - Ministerio De Infraestructura", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4a81ed2c-ae08-58e7-838a-3c129b13d665', 'Inversion social en infancia', 'inversion', 170444472.4, 'Md', '2024', '150 - Ministerio De Infraestructura', '{"programa": "506 - Arquitectura", "jurisdiccion": "150 - Ministerio De Infraestructura", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4a81ed2c-ae08-58e7-838a-3c129b13d665', 'Inversion social en infancia', 'inversion', 57727808.49, 'Md', '2024', '150 - Ministerio De Infraestructura', '{"programa": "516 - Reparaciones De Establecimientos Educacionales - C\u00f3rdoba", "jurisdiccion": "150 - Ministerio De Infraestructura", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4a81ed2c-ae08-58e7-838a-3c129b13d665', 'Inversion social en infancia', 'inversion', 348346.5926, 'Md', '2024', '150 - Ministerio De Infraestructura', '{"programa": "517 - Escrituraci\u00f3n De Viviendas", "jurisdiccion": "150 - Ministerio De Infraestructura", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4a81ed2c-ae08-58e7-838a-3c129b13d665', 'Inversion social en infancia', 'inversion', 572446.6642, 'Md', '2024', '150 - Ministerio De Infraestructura', '{"programa": "523 - Vida Digna \"Plan Provincial De Infraestructura Vial B\u00e1sica\"", "jurisdiccion": "150 - Ministerio De Infraestructura", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4a81ed2c-ae08-58e7-838a-3c129b13d665', 'Inversion social en infancia', 'inversion', 546045.3424, 'Md', '2024', '150 - Ministerio De Infraestructura', '{"programa": "524 - Mejoramiento De Viviendas", "jurisdiccion": "150 - Ministerio De Infraestructura", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4a81ed2c-ae08-58e7-838a-3c129b13d665', 'Inversion social en infancia', 'inversion', 64059746.41, 'Md', '2024', '150 - Ministerio De Infraestructura', '{"programa": "525 - Cr\u00e9dito Tu Casa - Diferencial De Inter\u00e9s", "jurisdiccion": "150 - Ministerio De Infraestructura", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4690ec5e-e922-5674-a80d-91caa47a5e6f', 'Inversion social en infancia', 'inversion', 1661483.044, 'Md', '2024', '155 - Ministerio De Agua, Ambiente Y Servicios Púb', '{"programa": "560 - (C.E) Fondo Para La Gestion De Residuos S\u00f3lidos Urbanos Ley N\u00b0 9088", "jurisdiccion": "155 - Ministerio De Agua, Ambiente Y Servicios P\u00fablicos", "categoria": "Otros Servicios Urbanos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4690ec5e-e922-5674-a80d-91caa47a5e6f', 'Inversion social en infancia', 'inversion', 217866608.0, 'Md', '2024', '155 - Ministerio De Agua, Ambiente Y Servicios Púb', '{"programa": "602 - Boleto Educativo Gratuito (B.E.G) - Ley 10031", "jurisdiccion": "155 - Ministerio De Agua, Ambiente Y Servicios P\u00fablicos", "categoria": "Transporte escolar"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4690ec5e-e922-5674-a80d-91caa47a5e6f', 'Inversion social en infancia', 'inversion', 21457533.51, 'Md', '2024', '155 - Ministerio De Agua, Ambiente Y Servicios Púb', '{"programa": "603 - Boleto Obrero Social (B.O.S.) - Decreto N\u00b0 272/2015", "jurisdiccion": "155 - Ministerio De Agua, Ambiente Y Servicios P\u00fablicos", "categoria": "Transferencias de ingresos a las familias"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 44978232.75, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "652 - (C.E.) Desarrollo Social - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 692639.5408, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "656 - Banco De La Gente", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 771370.04, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "658 - Protecci\u00f3n Integral De Personas Con Discapacidad", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 31908697.21, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "660 - Asistencia A La Familia", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 2002209.363, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "661 - Tarifa Solidaria", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Transferencias de ingresos a las familias"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 77492.77102, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "664 - Regularizaci\u00f3n Dominial", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 556412.5464, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "665 - Emergencias Naturales", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Emergencia"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 7145071.338, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "666 - C\u00f3rdoba Con Ellas", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 7449479.264, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "668 - (C.E.) Turismo Social - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 161180.297, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "669 - (C.E) Erradicaci\u00f3n Del Chagas - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Prevenci\u00f3n de enfermedades y riesgos espec\u00edficos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 15941696.9, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "670 - (C.E.) Complemento Nutricional Para Grupos Vulnerables- Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "PEA"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 7871970.84, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "671 - (C.E.) Pol\u00edticas De Asistencia A Ni\u00f1os Y Adolescentes - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 26685274.18, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "672 - (C.E.) El Ni\u00f1o Y El Adolescente En Conflicto Con La Ley Penal - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 451392186.7, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "673 - Ni\u00f1ez, Adolescencia Y Familia - Actividades Comunes", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 1506377.5, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "675 - (C.E.) Fortalecimiento Familiar Y Comunitario - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 15156250.0, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "676 - (C.E.) Organismos De Gesti\u00f3n Asistida (Ogas) - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 302245.8855, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "681 - Asistencia Y Prevenci\u00f3n De La Adicci\u00f3n", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 2042199.345, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "683 - Tarjeta Social - Programa Alimentario Provincial", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "PEA"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 2021052.47, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "684 - (C.E.) Fondo Para La Prevenci\u00f3n De La Violencia Familiar - Cuenta Especial Ley 9505", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Violencia familiar"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 8609601.668, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "685 - Prevenci\u00f3n, Detecci\u00f3n Temprana, Atencion Y Erradicaci\u00f3n De La Violencia Familiar", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Violencia familiar"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 9148061.524, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "688 - Programa De Servicios A Las Personas Con Discapacidad (Prosad)", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3bd1957c-ae78-5ef8-b337-2aadb81f6ae2', 'Inversion social en infancia', 'inversion', 276108092.9, 'Md', '2024', '170 - Gastos Generales De La Administración', '{"programa": "717 - Financiamiento Municipios Y Comunas", "jurisdiccion": "170 - Gastos Generales De La Administraci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e3d3e2a9-2ddf-5453-bc5b-921e3a3e37dd', 'Inversion social en infancia', 'inversion', 7493607.937, 'Md', '2024', '185 - Ministerio De Industria, Comercio, Minería Y', '{"programa": "300 - Ciencia Y Tecnolog\u00eda", "jurisdiccion": "185 - Ministerio De Industria, Comercio, Miner\u00eda Y Desarrollo Cient\u00edfico Y Tecnol\u00f3gico", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e3d3e2a9-2ddf-5453-bc5b-921e3a3e37dd', 'Inversion social en infancia', 'inversion', 198073.8485, 'Md', '2024', '185 - Ministerio De Industria, Comercio, Minería Y', '{"programa": "313 - Divulgaci\u00f3n Y Ense\u00f1anza De La Ciencia Y La Tecnolog\u00eda", "jurisdiccion": "185 - Ministerio De Industria, Comercio, Miner\u00eda Y Desarrollo Cient\u00edfico Y Tecnol\u00f3gico", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e3d3e2a9-2ddf-5453-bc5b-921e3a3e37dd', 'Inversion social en infancia', 'inversion', 736615.4291, 'Md', '2024', '185 - Ministerio De Industria, Comercio, Minería Y', '{"programa": "316 - Promoci\u00f3n Cient\u00edfica Y Ense\u00f1anza De Las Ciencias", "jurisdiccion": "185 - Ministerio De Industria, Comercio, Miner\u00eda Y Desarrollo Cient\u00edfico Y Tecnol\u00f3gico", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('eb0abd4f-2e73-5bb3-b0c6-e9d189375816', 'Inversion social en infancia', 'inversion', 14383933.98, 'Md', '2024', '200 - Poder Legislativo', '{"programa": "904 - Aportes Al Consejo Provincial De La Mujer", "jurisdiccion": "200 - Poder Legislativo", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('eb0abd4f-2e73-5bb3-b0c6-e9d189375816', 'Inversion social en infancia', 'inversion', 184261.1453, 'Md', '2024', '200 - Poder Legislativo', '{"programa": "911 - Programa De Est\u00edmulo A Las Ediciones Literarias Cordobesas Y De Fomento A La Lectura", "jurisdiccion": "200 - Poder Legislativo", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1f6af3aa-632b-55bb-b22a-4c9f42ceafac', 'Inversion social en infancia', 'inversion', 93508.64502, 'Md', '2024', '605 - Agencia Córdoba De Inversión Y Financiamient', '{"programa": "851 - Programa De Desarrollo De Areas Rurales", "jurisdiccion": "605 - Agencia C\u00f3rdoba De Inversi\u00f3n Y Financiamiento S.E.M.", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1f6af3aa-632b-55bb-b22a-4c9f42ceafac', 'Inversion social en infancia', 'inversion', 2140571.668, 'Md', '2024', '605 - Agencia Córdoba De Inversión Y Financiamient', '{"programa": "982 - Pmv-Vd - Programa De Mejoramiento De Viviendas - Vida Digna", "jurisdiccion": "605 - Agencia C\u00f3rdoba De Inversi\u00f3n Y Financiamiento S.E.M.", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1f6af3aa-632b-55bb-b22a-4c9f42ceafac', 'Inversion social en infancia', 'inversion', 49986363.71, 'Md', '2024', '605 - Agencia Córdoba De Inversión Y Financiamient', '{"programa": "990 - Rehabilitaci\u00f3n Integral Canal Los Molinos - C\u00f3rdoba", "jurisdiccion": "605 - Agencia C\u00f3rdoba De Inversi\u00f3n Y Financiamiento S.E.M.", "categoria": "Agua potable y alcantarillado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

