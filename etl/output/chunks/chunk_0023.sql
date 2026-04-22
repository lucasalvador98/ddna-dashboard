-- Chunk 0023: INSERTs 1151 to 1200 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 1842797.679, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "455 - (C.E.)Programa De Lucha Contra El Vih-Sida E Its-Ley 9161", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Sida y enfermedades de transmisi\u00f3n sexual"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 372020637.5, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "456 - Actividades Comunes De La Secretar\u00eda De Servicios Asistenciales", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 1229989041.0, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "457 - Centros Asistenciales De Capital", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 940060945.2, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "458 - Centros Asistenciales Del Interior", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 235227829.5, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "461 - Centros Asistenciales De Salud Mental", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 96110907.39, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "462 - (C.E) Programa Sumar - Ex-Plan Nacer Resolucion N\u00ba 00425/05", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Materno-infantil"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 18403177.64, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "463 - (C.E) Programas Nacionales Varios", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Materno-infantil"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 34585260.8, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "467 - Actividades Comunes De La Secretar\u00eda De Prevenci\u00f3n Y Promoci\u00f3n De La Salud", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Prevenci\u00f3n de enfermedades y riesgos espec\u00edficos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 20789125.61, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "468 - Asistencia Sanitaria", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 46073877.39, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "470 - Desarrollo De Infraestructura Y Equipamiento Hospitalario", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 3510341.416, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "471 - Integraci\u00f3n Sanitaria", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 420581.3792, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "475 - Promoci\u00f3n, Prevenci\u00f3n Y Atenci\u00f3n En Zonas Rurales", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Prevenci\u00f3n de enfermedades y riesgos espec\u00edficos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 58265068.81, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "477 - Programa De Obras Ministerio De Salud- Fondo Federal Solidario- Ley 9610-", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 1141926.958, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "658 - Protecci\u00f3n Integral De Personas Con Discapacidad", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 21783076.12, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "681 - Asistencia Y Prevenci\u00f3n De La Adicci\u00f3n", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 9189754.808, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "688 - Programa De Servicios A Las Personas Con Discapacidad (Prosad)", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 2012894.81, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "690 - (Ce) Contenci\u00f3n Y Protecci\u00f3n De V\u00edctimas Del Narcotr\u00e1fico. Cuenta Especial Ley 10.067", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('668b90dd-2b8f-5d4a-9708-d75bed5700a8', 'Inversion social en infancia', 'inversion', 30952298.45, 'Md', '2024', '150 - Ministerio De Vivienda, Arquitectura Y Obras', '{"programa": "502 - Vivienda", "jurisdiccion": "150 - Ministerio De Vivienda, Arquitectura Y Obras Viales", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('668b90dd-2b8f-5d4a-9708-d75bed5700a8', 'Inversion social en infancia', 'inversion', 197573470.7, 'Md', '2024', '150 - Ministerio De Vivienda, Arquitectura Y Obras', '{"programa": "503 - Viviendas, Infraestructura Y Equipamiento Comunitario", "jurisdiccion": "150 - Ministerio De Vivienda, Arquitectura Y Obras Viales", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('668b90dd-2b8f-5d4a-9708-d75bed5700a8', 'Inversion social en infancia', 'inversion', 51477097.01, 'Md', '2024', '150 - Ministerio De Vivienda, Arquitectura Y Obras', '{"programa": "506 - Arquitectura", "jurisdiccion": "150 - Ministerio De Vivienda, Arquitectura Y Obras Viales", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('668b90dd-2b8f-5d4a-9708-d75bed5700a8', 'Inversion social en infancia', 'inversion', 6860574.47, 'Md', '2024', '150 - Ministerio De Vivienda, Arquitectura Y Obras', '{"programa": "516 - Reparaciones De Establecimientos Educacionales - C\u00f3rdoba", "jurisdiccion": "150 - Ministerio De Vivienda, Arquitectura Y Obras Viales", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('668b90dd-2b8f-5d4a-9708-d75bed5700a8', 'Inversion social en infancia', 'inversion', 660040.6252, 'Md', '2024', '150 - Ministerio De Vivienda, Arquitectura Y Obras', '{"programa": "517 - Escrituraci\u00f3n De Viviendas", "jurisdiccion": "150 - Ministerio De Vivienda, Arquitectura Y Obras Viales", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('668b90dd-2b8f-5d4a-9708-d75bed5700a8', 'Inversion social en infancia', 'inversion', 417663782.7, 'Md', '2024', '150 - Ministerio De Vivienda, Arquitectura Y Obras', '{"programa": "524 - Mejoramiento De Viviendas", "jurisdiccion": "150 - Ministerio De Vivienda, Arquitectura Y Obras Viales", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('668b90dd-2b8f-5d4a-9708-d75bed5700a8', 'Inversion social en infancia', 'inversion', 27657573.23, 'Md', '2024', '150 - Ministerio De Vivienda, Arquitectura Y Obras', '{"programa": "525 - Cr\u00e9dito Tu Casa - Diferencial De Inter\u00e9s", "jurisdiccion": "150 - Ministerio De Vivienda, Arquitectura Y Obras Viales", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4690ec5e-e922-5674-a80d-91caa47a5e6f', 'Inversion social en infancia', 'inversion', 8633274.217, 'Md', '2024', '155 - Ministerio De Agua, Ambiente Y Servicios Púb', '{"programa": "560 - (C.E) Fondo Para La Gestion De Residuos S\u00f3lidos Urbanos Ley N\u00b0 9088", "jurisdiccion": "155 - Ministerio De Agua, Ambiente Y Servicios P\u00fablicos", "categoria": "Otros Servicios Urbanos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4690ec5e-e922-5674-a80d-91caa47a5e6f', 'Inversion social en infancia', 'inversion', 328584127.5, 'Md', '2024', '155 - Ministerio De Agua, Ambiente Y Servicios Púb', '{"programa": "602 - Boleto Educativo Gratuito (B.E.G) - Ley 10031", "jurisdiccion": "155 - Ministerio De Agua, Ambiente Y Servicios P\u00fablicos", "categoria": "Transporte escolar"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4690ec5e-e922-5674-a80d-91caa47a5e6f', 'Inversion social en infancia', 'inversion', 13445280.83, 'Md', '2024', '155 - Ministerio De Agua, Ambiente Y Servicios Púb', '{"programa": "603 - Boleto Obrero Social (B.O.S.) - Decreto N\u00b0 272/2015", "jurisdiccion": "155 - Ministerio De Agua, Ambiente Y Servicios P\u00fablicos", "categoria": "Transferencias de ingresos a las familias"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4690ec5e-e922-5674-a80d-91caa47a5e6f', 'Inversion social en infancia', 'inversion', 7574775.923, 'Md', '2024', '155 - Ministerio De Agua, Ambiente Y Servicios Púb', '{"programa": "610 - Boleto Social Cordobes (Bsc)- Decreto N\u00b0 779/2017", "jurisdiccion": "155 - Ministerio De Agua, Ambiente Y Servicios P\u00fablicos", "categoria": "Transferencias de ingresos a las familias"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 73821795.93, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "652 - (C.E.) Desarrollo Social - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 2656627.093, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "661 - Tarifa Solidaria", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Transferencias de ingresos a las familias"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 577690.1832, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "662 - H\u00e1bitat", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 1789818.677, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "663 - Consejo Politicas Sociales", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 99718.04323, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "664 - Regularizaci\u00f3n Dominial", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 17873053.59, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "668 - (C.E.) Turismo Social - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 807125.0887, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "669 - (C.E) Erradicaci\u00f3n Del Chagas - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Prevenci\u00f3n de enfermedades y riesgos espec\u00edficos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 13455243.91, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "670 - (C.E.) Complemento Nutricional Para Grupos Vulnerables- Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "PEA"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 4388095.355, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "682 - Programas Sociales Financiados Con Recursos Nacionales", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "PEA"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 172042828.2, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "683 - Tarjeta Social - Programa Alimentario Provincial", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "PEA"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 199837145.2, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "691 - Asistencia A La Familia", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3bd1957c-ae78-5ef8-b337-2aadb81f6ae2', 'Inversion social en infancia', 'inversion', 784171808.7, 'Md', '2024', '170 - Gastos Generales De La Administración', '{"programa": "717 - Financiamiento Municipios Y Comunas", "jurisdiccion": "170 - Gastos Generales De La Administraci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('eb0abd4f-2e73-5bb3-b0c6-e9d189375816', 'Inversion social en infancia', 'inversion', 581587.4, 'Md', '2024', '200 - Poder Legislativo', '{"programa": "901 - Programa De Apoyo A Los Sistemas Educativos", "jurisdiccion": "200 - Poder Legislativo", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('eb0abd4f-2e73-5bb3-b0c6-e9d189375816', 'Inversion social en infancia', 'inversion', 705703.9016, 'Md', '2024', '200 - Poder Legislativo', '{"programa": "911 - Programa De Est\u00edmulo A Las Ediciones Literarias Cordobesas Y De Fomento A La Lectura", "jurisdiccion": "200 - Poder Legislativo", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1f6af3aa-632b-55bb-b22a-4c9f42ceafac', 'Inversion social en infancia', 'inversion', 2766182.194, 'Md', '2024', '605 - Agencia Córdoba De Inversión Y Financiamient', '{"programa": "851 - Proderi - Programa De Desarrollo Social Incluyente", "jurisdiccion": "605 - Agencia C\u00f3rdoba De Inversi\u00f3n Y Financiamiento S.E.M.", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1f6af3aa-632b-55bb-b22a-4c9f42ceafac', 'Inversion social en infancia', 'inversion', 27077.91509, 'Md', '2024', '605 - Agencia Córdoba De Inversión Y Financiamient', '{"programa": "982 - Pmv-Vd - Programa De Mejoramiento De Viviendas - Vida Digna", "jurisdiccion": "605 - Agencia C\u00f3rdoba De Inversi\u00f3n Y Financiamiento S.E.M.", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1f6af3aa-632b-55bb-b22a-4c9f42ceafac', 'Inversion social en infancia', 'inversion', 249448231.9, 'Md', '2024', '605 - Agencia Córdoba De Inversión Y Financiamient', '{"programa": "990 - Rehabilitaci\u00f3n Integral Canal Los Molinos - C\u00f3rdoba", "jurisdiccion": "605 - Agencia C\u00f3rdoba De Inversi\u00f3n Y Financiamiento S.E.M.", "categoria": "Agua potable y alcantarillado"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 1071611.188, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "856 - Proyectos Especiales Deportivos", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 12222536.34, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "857 - Deporte Social Y Comunitario", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 2514414.994, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "858 - Fortalecimiento De Los Centros De Desarrollo Deportivo", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 13275074.57, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "860 - Apoyo Y Acompa\u00f1amiento Al Deporte Olimpico Y Federado", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 352397.6475, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "861 - Cordoba Te Incluye", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

