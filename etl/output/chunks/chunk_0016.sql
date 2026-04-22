-- Chunk 0016: INSERTs 801 to 850 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4a81ed2c-ae08-58e7-838a-3c129b13d665', 'Inversion social en infancia', 'inversion', 47693013.92, 'Md', '2024', '150 - Ministerio De Infraestructura', '{"programa": "516 - Reparaciones De Establecimientos Educacionales - C\u00f3rdoba", "jurisdiccion": "150 - Ministerio De Infraestructura", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4a81ed2c-ae08-58e7-838a-3c129b13d665', 'Inversion social en infancia', 'inversion', 194225.3052, 'Md', '2024', '150 - Ministerio De Infraestructura', '{"programa": "517 - Escrituraci\u00f3n De Viviendas", "jurisdiccion": "150 - Ministerio De Infraestructura", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4a81ed2c-ae08-58e7-838a-3c129b13d665', 'Inversion social en infancia', 'inversion', 1152291.82, 'Md', '2024', '150 - Ministerio De Infraestructura', '{"programa": "520 - Reparaci\u00f3n Escuelas Ii Etapa - Fondo Federal Solidario Ley N\u00b0 9610", "jurisdiccion": "150 - Ministerio De Infraestructura", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4a81ed2c-ae08-58e7-838a-3c129b13d665', 'Inversion social en infancia', 'inversion', 916178.477, 'Md', '2024', '150 - Ministerio De Infraestructura', '{"programa": "523 - Vida Digna \"Plan Provincial De Infraestructura Vial B\u00e1sica\"", "jurisdiccion": "150 - Ministerio De Infraestructura", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4a81ed2c-ae08-58e7-838a-3c129b13d665', 'Inversion social en infancia', 'inversion', 1108494.526, 'Md', '2024', '150 - Ministerio De Infraestructura', '{"programa": "524 - Mejoramiento De Viviendas", "jurisdiccion": "150 - Ministerio De Infraestructura", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4a81ed2c-ae08-58e7-838a-3c129b13d665', 'Inversion social en infancia', 'inversion', 64314215.11, 'Md', '2024', '150 - Ministerio De Infraestructura', '{"programa": "525 - Cr\u00e9dito Tu Casa - Diferencial De Inter\u00e9s", "jurisdiccion": "150 - Ministerio De Infraestructura", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4690ec5e-e922-5674-a80d-91caa47a5e6f', 'Inversion social en infancia', 'inversion', 3729045.414, 'Md', '2024', '155 - Ministerio De Agua, Ambiente Y Servicios Púb', '{"programa": "560 - (C.E) Fondo Para La Gestion De Residuos S\u00f3lidos Urbanos Ley N\u00b0 9088", "jurisdiccion": "155 - Ministerio De Agua, Ambiente Y Servicios P\u00fablicos", "categoria": "Otros Servicios Urbanos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4690ec5e-e922-5674-a80d-91caa47a5e6f', 'Inversion social en infancia', 'inversion', 134.054195, 'Md', '2024', '155 - Ministerio De Agua, Ambiente Y Servicios Púb', '{"programa": "564 - Efectuar El Control Y Seguimiento De Los Residuos Peligrosos En La Provincia De C\u00f3rdoba", "jurisdiccion": "155 - Ministerio De Agua, Ambiente Y Servicios P\u00fablicos", "categoria": "Otros Servicios Urbanos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4690ec5e-e922-5674-a80d-91caa47a5e6f', 'Inversion social en infancia', 'inversion', 142424585.5, 'Md', '2024', '155 - Ministerio De Agua, Ambiente Y Servicios Púb', '{"programa": "602 - Boleto Educativo Gratuito (B.E.G) - Ley 10031", "jurisdiccion": "155 - Ministerio De Agua, Ambiente Y Servicios P\u00fablicos", "categoria": "Transporte escolar"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('fedf7cfd-8869-5020-ba01-daa141934de1', 'Inversion social en infancia', 'inversion', 36551412.0, 'Md', '2024', '155 - Ministerio De Desarrollo Social', '{"programa": "660 - Asistencia A La Familia", "jurisdiccion": "155 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 37463427.0, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "652 - (C.E.) Desarrollo Social - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 759341.4409, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "656 - Banco De La Gente", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 588080.8586, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "658 - Protecci\u00f3n Integral De Personas Con Discapacidad", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 27117761.0, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "660 - Asistencia A La Familia", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 2501949.345, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "661 - Tarifa Solidaria", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Transferencias de ingresos a las familias"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 35.74778533, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "662 - H\u00e1bitat", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 167902.5461, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "664 - Regularizaci\u00f3n Dominial", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 480940.0424, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "665 - Emergencias Naturales", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Emergencia"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 6254733.58, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "666 - C\u00f3rdoba Con Ellas", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 6421421.599, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "668 - (C.E.) Turismo Social - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 489186.2045, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "669 - (C.E) Erradicaci\u00f3n Del Chagas - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Prevenci\u00f3n de enfermedades y riesgos espec\u00edficos"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 10782188.25, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "670 - (C.E.) Complemento Nutricional Para Grupos Vulnerables- Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "PEA"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 6570649.045, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "671 - (C.E.) Pol\u00edticas De Asistencia A Ni\u00f1os Y Adolescentes - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 25248660.62, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "672 - (C.E.) El Ni\u00f1o Y El Adolescente En Conflicto Con La Ley Penal - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 324307831.4, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "673 - Ni\u00f1ez, Adolescencia Y Familia - Actividades Comunes", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 1202697.22, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "675 - (C.E.) Fortalecimiento Familiar Y Comunitario - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 14810470.0, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "676 - (C.E.) Organismos De Gesti\u00f3n Asistida (Ogas) - Cuenta Especial Ley 8665", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n de grupos vulnerables"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 1354400.762, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "681 - Asistencia Y Prevenci\u00f3n De La Adicci\u00f3n", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 2002921.014, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "683 - Tarjeta Social - Programa Alimentario Provincial", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "PEA"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 1504112.338, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "684 - (C.E.) Fondo Para La Prevenci\u00f3n De La Violencia Familiar - Cuenta Especial Ley 9505", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Violencia familiar"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 5830990.362, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "685 - Prevenci\u00f3n, Detecci\u00f3n Temprana, Atencion Y Erradicaci\u00f3n De La Violencia Familiar", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Violencia familiar"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b96c7e8-b6fa-5eed-b2a7-9ca84838f028', 'Inversion social en infancia', 'inversion', 3399772.253, 'Md', '2024', '165 - Ministerio De Desarrollo Social', '{"programa": "688 - Programa De Servicios A Las Personas Con Discapacidad (Prosad)", "jurisdiccion": "165 - Ministerio De Desarrollo Social", "categoria": "Atenci\u00f3n ambulatoria e internaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3bd1957c-ae78-5ef8-b337-2aadb81f6ae2', 'Inversion social en infancia', 'inversion', 171290640.3, 'Md', '2024', '170 - Gastos Generales De La Administración', '{"programa": "717 - Financiamiento Municipios Y Comunas", "jurisdiccion": "170 - Gastos Generales De La Administraci\u00f3n", "categoria": "Educaci\u00f3n b\u00e1sica (inicial, elemental y media)"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e3d3e2a9-2ddf-5453-bc5b-921e3a3e37dd', 'Inversion social en infancia', 'inversion', 5846550.589, 'Md', '2024', '185 - Ministerio De Industria, Comercio, Minería Y', '{"programa": "300 - Ciencia Y Tecnolog\u00eda", "jurisdiccion": "185 - Ministerio De Industria, Comercio, Miner\u00eda Y Desarrollo Cient\u00edfico Y Tecnol\u00f3gico", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e3d3e2a9-2ddf-5453-bc5b-921e3a3e37dd', 'Inversion social en infancia', 'inversion', 99549.8092, 'Md', '2024', '185 - Ministerio De Industria, Comercio, Minería Y', '{"programa": "313 - Divulgaci\u00f3n Y Ense\u00f1anza De La Ciencia Y La Tecnolog\u00eda", "jurisdiccion": "185 - Ministerio De Industria, Comercio, Miner\u00eda Y Desarrollo Cient\u00edfico Y Tecnol\u00f3gico", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e3d3e2a9-2ddf-5453-bc5b-921e3a3e37dd', 'Inversion social en infancia', 'inversion', 1685901.537, 'Md', '2024', '185 - Ministerio De Industria, Comercio, Minería Y', '{"programa": "316 - Promoci\u00f3n Cient\u00edfica Y Ense\u00f1anza De Las Ciencias", "jurisdiccion": "185 - Ministerio De Industria, Comercio, Miner\u00eda Y Desarrollo Cient\u00edfico Y Tecnol\u00f3gico", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e3d3e2a9-2ddf-5453-bc5b-921e3a3e37dd', 'Inversion social en infancia', 'inversion', 284357.9331, 'Md', '2024', '185 - Ministerio De Industria, Comercio, Minería Y', '{"programa": "318 - Ciencia Y Tecnolog\u00eda - Recursos Afectados", "jurisdiccion": "185 - Ministerio De Industria, Comercio, Miner\u00eda Y Desarrollo Cient\u00edfico Y Tecnol\u00f3gico", "categoria": "Ciencia y t\u00e9cnica"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('eb0abd4f-2e73-5bb3-b0c6-e9d189375816', 'Inversion social en infancia', 'inversion', 10988489.75, 'Md', '2024', '200 - Poder Legislativo', '{"programa": "904 - Aportes Al Consejo Provincial De La Mujer", "jurisdiccion": "200 - Poder Legislativo", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1f6af3aa-632b-55bb-b22a-4c9f42ceafac', 'Inversion social en infancia', 'inversion', 1157776.035, 'Md', '2024', '605 - Agencia Córdoba De Inversión Y Financiamient', '{"programa": "851 - Programa De Desarrollo De Areas Rurales", "jurisdiccion": "605 - Agencia C\u00f3rdoba De Inversi\u00f3n Y Financiamiento S.E.M.", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('1f6af3aa-632b-55bb-b22a-4c9f42ceafac', 'Inversion social en infancia', 'inversion', 989179.3512, 'Md', '2024', '605 - Agencia Córdoba De Inversión Y Financiamient', '{"programa": "982 - Pmv-Vd - Programa De Mejoramiento De Viviendas - Vida Digna", "jurisdiccion": "605 - Agencia C\u00f3rdoba De Inversi\u00f3n Y Financiamiento S.E.M.", "categoria": "Vivienda"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 563203.0811, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "856 - Proyectos Especiales Deportivos", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 2014831.274, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "857 - Deporte Social Y Comunitario", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 647874.6896, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "858 - Fortalecimiento De Los Centros De Desarrollo Deportivo", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 2497671.248, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "860 - Apoyo Y Acompa\u00f1amiento Al Deporte Olimpico Y Federado", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 111870.311, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "861 - Cordoba Te Incluye", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 113201.3202, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "862 - Nos Vemos En El Club", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 1800960.318, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "863 - Infraestructura Deportiva Provincial", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 252861.6617, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "865 - Centro De Alto Rendimiento Deportivo", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f82bf19d-dda4-5901-a202-e07261b3f4fc', 'Inversion social en infancia', 'inversion', 21046101.69, 'Md', '2024', '615 - Agencia Córdoba Deportes - S.E.M.', '{"programa": "991 - Funcionamiento Operativo Y Mejora Continua De La Agencia C\u00f3rdoba Deportes Sem", "jurisdiccion": "615 - Agencia C\u00f3rdoba Deportes - S.E.M.", "categoria": "Deporte y recreaci\u00f3n"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('53359866-5efc-5ec4-9ad0-2aaf08c25064', 'Inversion social en infancia', 'inversion', 22804007.0, 'Md', '2024', '620 - Agencia Córdoba Joven', '{"programa": "620 - Promoci\u00f3n De La Juventud", "jurisdiccion": "620 - Agencia C\u00f3rdoba Joven", "categoria": "Ni\u00f1os en riesgo"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

