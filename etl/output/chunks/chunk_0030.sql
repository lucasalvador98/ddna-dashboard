-- Chunk 0030: INSERTs 1501 to 1550 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('cd86bb18-00bd-53a3-8bb6-b07cf20af607', 'Inversion social en infancia', 'inversion', 3168809.0, 'Md', '2024', '140 - Ministerio De Justicia Y Derechos Humanos', '{"programa": "428 - Convenios Con El Gobierno Nacional", "jurisdiccion": "140 - Ministerio De Justicia Y Derechos Humanos", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('cd86bb18-00bd-53a3-8bb6-b07cf20af607', 'Inversion social en infancia', 'inversion', 126905514.0, 'Md', '2024', '140 - Ministerio De Justicia Y Derechos Humanos', '{"programa": "671 - (C.E.) Pol\u00edticas De Asistencia A Ni\u00f1os Y Adolescentes - Cuenta Especial Ley 8665", "jurisdiccion": "140 - Ministerio De Justicia Y Derechos Humanos", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('cd86bb18-00bd-53a3-8bb6-b07cf20af607', 'Inversion social en infancia', 'inversion', 37781205.0, 'Md', '2024', '140 - Ministerio De Justicia Y Derechos Humanos', '{"programa": "672 - (C.E.) El Ni\u00f1o Y El Adolescente En Conflicto Con La Ley Penal - Cuenta Especial Ley 8665", "jurisdiccion": "140 - Ministerio De Justicia Y Derechos Humanos", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('cd86bb18-00bd-53a3-8bb6-b07cf20af607', 'Inversion social en infancia', 'inversion', 1574556563.0, 'Md', '2024', '140 - Ministerio De Justicia Y Derechos Humanos', '{"programa": "673 - Ni\u00f1ez, Adolescencia Y Familia - Actividades Comunes", "jurisdiccion": "140 - Ministerio De Justicia Y Derechos Humanos", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('cd86bb18-00bd-53a3-8bb6-b07cf20af607', 'Inversion social en infancia', 'inversion', 59380000.0, 'Md', '2024', '140 - Ministerio De Justicia Y Derechos Humanos', '{"programa": "676 - (C.E.) Organismos De Gesti\u00f3n Asistida (Ogas) - Cuenta Especial Ley 8665", "jurisdiccion": "140 - Ministerio De Justicia Y Derechos Humanos", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('cd86bb18-00bd-53a3-8bb6-b07cf20af607', 'Inversion social en infancia', 'inversion', 1377348.0, 'Md', '2024', '140 - Ministerio De Justicia Y Derechos Humanos', '{"programa": "684 - (C.E.) Fondo Para La Prevenci\u00f3n De La Violencia Familiar - Cuenta Especial Ley 9505", "jurisdiccion": "140 - Ministerio De Justicia Y Derechos Humanos", "categoria": "Violencia familiar"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 606121448.5, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "450 - Actividades Centrales Del Ministerio De Salud", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 343932748.9, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "453 - (C.E.) Incluir Salud Programa Federal", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 5785581.887, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "454 - (C.E.) Recurso Solidario Para Ablaci\u00f3n E Implantes - Cuenta Especial- Ley Provincial N\u00ba 9146", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Ablaci\u00f3n e implantes"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 7380790.947, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "455 - (C.E.)Programa De Lucha Contra El Vih-Sida E Its-Ley 9161", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Sida y enfermedades de transmisi\u00f3n sexual"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 845003935.6, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "456 - Actividades Comunes De La Secretar\u00eda De Servicios Asistenciales", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 3173560200.0, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "457 - Centros Asistenciales De Capital", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 2430741210.0, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "458 - Centros Asistenciales Del Interior", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 506447154.2, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "461 - Centros Asistenciales De Salud Mental", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 545742926.0, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "462 - (C.E) Programa Sumar - Ex-Plan Nacer Resolucion N\u00ba 00425/05", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Materno-infantil"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 36603939.66, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "463 - (C.E) Programas Nacionales Varios", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Materno-infantil"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 75626057.98, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "467 - Actividades Comunes De La Secretar\u00eda De Prevenci\u00f3n Y Promoci\u00f3n De La Salud", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Prevenci\u00f3n de enfermedades y riesgos espec\u00edficos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 53227749.38, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "468 - Asistencia Sanitaria", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 80537282.14, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "470 - Desarrollo De Infraestructura Y Equipamiento Hospitalario", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 4824233.77, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "471 - Integraci\u00f3n Sanitaria", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 1607593066.0, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "472 - Fondo Para Atenci\u00f3n Del Estado De Alerta,\nPrevenci\u00f3n Y Acci\u00f3n Sanitaria Por Enfermedades\nEpid\u00e9", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Prevenci\u00f3n de enfermedades y riesgos espec\u00edficos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 3252483.496, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "658 - Protecci\u00f3n Integral De Personas Con Discapacidad", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 118001443.0, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "681 - Asistencia Y Prevenci\u00f3n De La Adicci\u00f3n", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 21211041.9, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "688 - Programa De Servicios A Las Personas Con Discapacidad (Prosad)", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('02abd481-b2ce-5755-a844-c9383cd0da58', 'Inversion social en infancia', 'inversion', 3488000.0, 'Md', '2024', '145 - Ministerio De Salud', '{"programa": "690 - (Ce) Contenci\u00f3n Y Protecci\u00f3n De V\u00edctimas Del Narcotr\u00e1fico. Cuenta Especial Ley 10.067", "jurisdiccion": "145 - Ministerio De Salud", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5d09a3cd-d490-5237-80be-d8111270216e', 'Inversion social en infancia', 'inversion', 49233520.03, 'Md', '2024', '150 - Ministerio De Obras Públicas Y Financiamient', '{"programa": "502 - Vivienda", "jurisdiccion": "150 - Ministerio De Obras P\u00fablicas Y Financiamiento", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5d09a3cd-d490-5237-80be-d8111270216e', 'Inversion social en infancia', 'inversion', 14957607.45, 'Md', '2024', '150 - Ministerio De Obras Públicas Y Financiamient', '{"programa": "503 - Viviendas, Infraestructura Y Equipamiento Comunitario", "jurisdiccion": "150 - Ministerio De Obras P\u00fablicas Y Financiamiento", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5d09a3cd-d490-5237-80be-d8111270216e', 'Inversion social en infancia', 'inversion', 459438342.0, 'Md', '2024', '150 - Ministerio De Obras Públicas Y Financiamient', '{"programa": "506 - Arquitectura", "jurisdiccion": "150 - Ministerio De Obras P\u00fablicas Y Financiamiento", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5d09a3cd-d490-5237-80be-d8111270216e', 'Inversion social en infancia', 'inversion', 663410.069, 'Md', '2024', '150 - Ministerio De Obras Públicas Y Financiamient', '{"programa": "517 - Escrituraci\u00f3n De Viviendas", "jurisdiccion": "150 - Ministerio De Obras P\u00fablicas Y Financiamiento", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5d09a3cd-d490-5237-80be-d8111270216e', 'Inversion social en infancia', 'inversion', 31924346.41, 'Md', '2024', '150 - Ministerio De Obras Públicas Y Financiamient', '{"programa": "518 - PLAN LOTENGO", "jurisdiccion": "150 - Ministerio De Obras P\u00fablicas Y Financiamiento", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5d09a3cd-d490-5237-80be-d8111270216e', 'Inversion social en infancia', 'inversion', 26654013.6, 'Md', '2024', '150 - Ministerio De Obras Públicas Y Financiamient', '{"programa": "525 - Cr\u00e9dito Tu Casa - Diferencial De Inter\u00e9s", "jurisdiccion": "150 - Ministerio De Obras P\u00fablicas Y Financiamiento", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b4f7a151-dd3c-5a85-9ab3-53bdbd3e2174', 'Inversion social en infancia', 'inversion', 1447535564.0, 'Md', '2024', '155 - Ministerio De Servicios Públicos', '{"programa": "611 - ASISTENCIA AL TRANSPORTE P\u00daBLICO", "jurisdiccion": "155 - Ministerio De Servicios P\u00fablicos", "categoria": "Emergencia"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 144121517.7, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "652 - (C.E.) Desarrollo Social - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 610798315.2, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "661 - Tarifa Solidaria", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Transferencias de ingresos a las familias"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 9136967.263, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "662 - H\u00e1bitat", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 1298704.596, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "663 - Consejo Politicas Sociales", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 16481826.38, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "668 - (C.E.) Turismo Social - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 30485980.6, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "670 - (C.E.) Complemento Nutricional Para Grupos Vulnerables- Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "PEA"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 55789829.8, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "682 - Programas Sociales Financiados Con Recursos Nacionales", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "PEA"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 731666681.7, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "683 - Tarjeta Social - Programa Alimentario Provincial", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "PEA"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3bd1957c-ae78-5ef8-b337-2aadb81f6ae2', 'Inversion social en infancia', 'inversion', 2259165929.0, 'Md', '2024', '170 - Gastos Generales De La Administración', '{"programa": "717 - Financiamiento Municipios Y Comunas", "jurisdiccion": "170 - Gastos Generales De La Administraci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('eb0abd4f-2e73-5bb3-b0c6-e9d189375816', 'Inversion social en infancia', 'inversion', 123697.6677, 'Md', '2024', '200 - Poder Legislativo', '{"programa": "901 - Programa De Apoyo A Los Sistemas Educativos", "jurisdiccion": "200 - Poder Legislativo", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('eb0abd4f-2e73-5bb3-b0c6-e9d189375816', 'Inversion social en infancia', 'inversion', 11660.57566, 'Md', '2024', '200 - Poder Legislativo', '{"programa": "911 - Programa De Est\u00edmulo A Las Ediciones Literarias Cordobesas Y De Fomento A La Lectura", "jurisdiccion": "200 - Poder Legislativo", "categoria": "Cultura"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ea69dc00-2f3a-59f4-9eb2-66009a7e1dfb', 'Inversion social en infancia', 'inversion', 52216130.0, 'Md', '2024', '450 - Defensoría De Los Derechos De Niñas, Niños Y', '{"programa": "960 - (C.E.) Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes - Cuenta Especial Ley 8665", "jurisdiccion": "450 - Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ea69dc00-2f3a-59f4-9eb2-66009a7e1dfb', 'Inversion social en infancia', 'inversion', 438050.0, 'Md', '2024', '450 - Defensoría De Los Derechos De Niñas, Niños Y', '{"programa": "961 - (C.E.) Mesas De Trabajo - Cuenta Especial Ley 8665", "jurisdiccion": "450 - Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ea69dc00-2f3a-59f4-9eb2-66009a7e1dfb', 'Inversion social en infancia', 'inversion', 934700.0, 'Md', '2024', '450 - Defensoría De Los Derechos De Niñas, Niños Y', '{"programa": "962 - (C.E.) Capacitaciones - Cuenta Especial Ley 8665", "jurisdiccion": "450 - Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ea69dc00-2f3a-59f4-9eb2-66009a7e1dfb', 'Inversion social en infancia', 'inversion', 4379409.0, 'Md', '2024', '450 - Defensoría De Los Derechos De Niñas, Niños Y', '{"programa": "963 - (C.E.) Difusi\u00f3n - Cuenta Especial Ley 8665", "jurisdiccion": "450 - Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ea69dc00-2f3a-59f4-9eb2-66009a7e1dfb', 'Inversion social en infancia', 'inversion', 10600.0, 'Md', '2024', '450 - Defensoría De Los Derechos De Niñas, Niños Y', '{"programa": "964 - (C.E.) Acciones Intersectoriales- Cuenta Especial Ley 8665- ", "jurisdiccion": "450 - Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ea69dc00-2f3a-59f4-9eb2-66009a7e1dfb', 'Inversion social en infancia', 'inversion', 28000.0, 'Md', '2024', '450 - Defensoría De Los Derechos De Niñas, Niños Y', '{"programa": "965 - (C.E.) Monitoreo De Derechos- Cuenta Especial Ley 8665- ", "jurisdiccion": "450 - Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ea69dc00-2f3a-59f4-9eb2-66009a7e1dfb', 'Inversion social en infancia', 'inversion', 5311592.0, 'Md', '2024', '450 - Defensoría De Los Derechos De Niñas, Niños Y', '{"programa": "966 - Sistema Integral De Monitoreo De Los Derechos De Nin\u0303as, Nin\u0303os Y Adolescentes ", "jurisdiccion": "450 - Defensor\u00eda De Los Derechos De Ni\u00f1as, Ni\u00f1os Y Adolescentes", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

