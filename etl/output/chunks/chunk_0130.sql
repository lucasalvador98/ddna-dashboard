-- Chunk 0130: INSERTs 6501 to 6550 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('cbc8ece4-d964-5edd-82f3-6976a4f2c477', 'Pobreza infantil', 'pobreza', 27.7, '%', '2022', 'Córdoba', '{"tipo": "Pobreza Hogares", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ae6f075d-2ea3-594b-a2c7-8e9f02b405fd', 'Pobreza infantil', 'pobreza', 29.6, '%', '2023', 'Córdoba', '{"tipo": "Pobreza Hogares", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('56116df6-2e6d-54e1-a4a6-59c90574ce26', 'Pobreza infantil', 'pobreza', 42.5, '%', '2024', 'Córdoba', '{"tipo": "Pobreza Hogares", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('85395d6f-4f28-538a-b547-341fa67eaeba', 'Pobreza infantil', 'pobreza', 30.3, '%', '2016', 'Córdoba', '{"tipo": "Pobreza Personas", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('c2120aa6-227f-56d2-b0af-dc016f9d0f89', 'Pobreza infantil', 'pobreza', 28.6, '%', '2017', 'Córdoba', '{"tipo": "Pobreza Personas", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('5b0a6293-2aff-591b-b34e-3e273332320d', 'Pobreza infantil', 'pobreza', 27.3, '%', '2018', 'Córdoba', '{"tipo": "Pobreza Personas", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('571554e9-a77d-5eba-8955-9cbaf7911b51', 'Pobreza infantil', 'pobreza', 35.4, '%', '2019', 'Córdoba', '{"tipo": "Pobreza Personas", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b8cd27a4-125a-5004-b289-066ea521d3ca', 'Pobreza infantil', 'pobreza', 40.9, '%', '2020', 'Córdoba', '{"tipo": "Pobreza Personas", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a49bbd95-a7e4-50b2-89d8-79806128f9fe', 'Pobreza infantil', 'pobreza', 40.6, '%', '2021', 'Córdoba', '{"tipo": "Pobreza Personas", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('cbc8ece4-d964-5edd-82f3-6976a4f2c477', 'Pobreza infantil', 'pobreza', 36.5, '%', '2022', 'Córdoba', '{"tipo": "Pobreza Personas", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('ae6f075d-2ea3-594b-a2c7-8e9f02b405fd', 'Pobreza infantil', 'pobreza', 40.1, '%', '2023', 'Córdoba', '{"tipo": "Pobreza Personas", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('56116df6-2e6d-54e1-a4a6-59c90574ce26', 'Pobreza infantil', 'pobreza', 52.9, '%', '2024', 'Córdoba', '{"tipo": "Pobreza Personas", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e5189139-6d10-5c0b-b695-a68f63a5b26c', 'Indigencia infantil', 'pobreza', 4.5, '%', '2016', 'Córdoba', '{"tipo": "Indigencia Hogares", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('03863eab-43a3-5173-98c0-4bf6122d2ec0', 'Indigencia infantil', 'pobreza', 4.5, '%', '2017', 'Córdoba', '{"tipo": "Indigencia Hogares", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('01f1356e-042c-5a91-ad9b-1407909d0c09', 'Indigencia infantil', 'pobreza', 3.8, '%', '2018', 'Córdoba', '{"tipo": "Indigencia Hogares", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('607babbe-9c37-55ee-9826-d1f48aeb90a3', 'Indigencia infantil', 'pobreza', 5.5, '%', '2019', 'Córdoba', '{"tipo": "Indigencia Hogares", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('84553040-d06d-537a-9192-479afbbe469d', 'Indigencia infantil', 'pobreza', 8.1, '%', '2020', 'Córdoba', '{"tipo": "Indigencia Hogares", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3648fab7-8d3a-5fd7-bff7-44fec014f85a', 'Indigencia infantil', 'pobreza', 8.2, '%', '2021', 'Córdoba', '{"tipo": "Indigencia Hogares", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8d13f448-e79f-527b-ac5b-b085f0ab02cb', 'Indigencia infantil', 'pobreza', 6.8, '%', '2022', 'Córdoba', '{"tipo": "Indigencia Hogares", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('248cf0a3-626e-536e-9cd5-d80b215dc78d', 'Indigencia infantil', 'pobreza', 6.8, '%', '2023', 'Córdoba', '{"tipo": "Indigencia Hogares", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('6e50805a-743a-5a1b-9022-f8455ab6f8fc', 'Indigencia infantil', 'pobreza', 13.6, '%', '2024', 'Córdoba', '{"tipo": "Indigencia Hogares", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e5189139-6d10-5c0b-b695-a68f63a5b26c', 'Indigencia infantil', 'pobreza', 6.1, '%', '2016', 'Córdoba', '{"tipo": "Indigencia Personas", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('03863eab-43a3-5173-98c0-4bf6122d2ec0', 'Indigencia infantil', 'pobreza', 6.2, '%', '2017', 'Córdoba', '{"tipo": "Indigencia Personas", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('01f1356e-042c-5a91-ad9b-1407909d0c09', 'Indigencia infantil', 'pobreza', 4.9, '%', '2018', 'Córdoba', '{"tipo": "Indigencia Personas", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('607babbe-9c37-55ee-9826-d1f48aeb90a3', 'Indigencia infantil', 'pobreza', 7.7, '%', '2019', 'Córdoba', '{"tipo": "Indigencia Personas", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('84553040-d06d-537a-9192-479afbbe469d', 'Indigencia infantil', 'pobreza', 10.5, '%', '2020', 'Córdoba', '{"tipo": "Indigencia Personas", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3648fab7-8d3a-5fd7-bff7-44fec014f85a', 'Indigencia infantil', 'pobreza', 10.7, '%', '2021', 'Córdoba', '{"tipo": "Indigencia Personas", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('8d13f448-e79f-527b-ac5b-b085f0ab02cb', 'Indigencia infantil', 'pobreza', 8.8, '%', '2022', 'Córdoba', '{"tipo": "Indigencia Personas", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('248cf0a3-626e-536e-9cd5-d80b215dc78d', 'Indigencia infantil', 'pobreza', 9.3, '%', '2023', 'Córdoba', '{"tipo": "Indigencia Personas", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('6e50805a-743a-5a1b-9022-f8455ab6f8fc', 'Indigencia infantil', 'pobreza', 18.1, '%', '2024', 'Córdoba', '{"tipo": "Indigencia Personas", "fuente": "cuadros_informe_pobreza_09_24 (1).xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


-- ============================================================
-- DATOS: SALUD (144 registros)
-- ============================================================

INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a4180efb-1f8c-52e6-9709-0fd1b616abe4', 'Mortalidad infantil', 'salud', 13.34840358316, '‰', '2005', 'Córdoba', '{"serie": "TMI", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a4180efb-1f8c-52e6-9709-0fd1b616abe4', 'Mortalidad infantil', 'salud', 3.9173289152, '‰', '2005', 'Córdoba', '{"serie": "RMM", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a4180efb-1f8c-52e6-9709-0fd1b616abe4', 'Mortalidad infantil', 'salud', 8.85540984527, '‰', '2005', 'Córdoba', '{"serie": "TMNEO", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a4180efb-1f8c-52e6-9709-0fd1b616abe4', 'Mortalidad infantil', 'salud', 4.49299373788, '‰', '2005', 'Córdoba', '{"serie": "TMPOS", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a4180efb-1f8c-52e6-9709-0fd1b616abe4', 'Mortalidad infantil', 'salud', 11.9111781826, '‰', '2005', 'Córdoba', '{"serie": "TMI Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a4180efb-1f8c-52e6-9709-0fd1b616abe4', 'Mortalidad infantil', 'salud', 2.5151809133, '‰', '2005', 'Córdoba', '{"serie": "RMM Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a4180efb-1f8c-52e6-9709-0fd1b616abe4', 'Mortalidad infantil', 'salud', 8.33602817002, '‰', '2005', 'Córdoba', '{"serie": "TMNEO Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a4180efb-1f8c-52e6-9709-0fd1b616abe4', 'Mortalidad infantil', 'salud', 3.57515001257, '‰', '2005', 'Córdoba', '{"serie": "TMPOS cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b936f6a4-4fc1-58dc-a86b-108b00dc3304', 'Mortalidad infantil', 'salud', 12.90255883041, '‰', '2006', 'Córdoba', '{"serie": "TMI", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b936f6a4-4fc1-58dc-a86b-108b00dc3304', 'Mortalidad infantil', 'salud', 4.7813844764, '‰', '2006', 'Córdoba', '{"serie": "RMM", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b936f6a4-4fc1-58dc-a86b-108b00dc3304', 'Mortalidad infantil', 'salud', 8.47582959892, '‰', '2006', 'Córdoba', '{"serie": "TMNEO", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b936f6a4-4fc1-58dc-a86b-108b00dc3304', 'Mortalidad infantil', 'salud', 4.42672923148, '‰', '2006', 'Córdoba', '{"serie": "TMPOS", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b936f6a4-4fc1-58dc-a86b-108b00dc3304', 'Mortalidad infantil', 'salud', 11.56357198185, '‰', '2006', 'Córdoba', '{"serie": "TMI Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b936f6a4-4fc1-58dc-a86b-108b00dc3304', 'Mortalidad infantil', 'salud', 2.7664047803, '‰', '2006', 'Córdoba', '{"serie": "RMM Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b936f6a4-4fc1-58dc-a86b-108b00dc3304', 'Mortalidad infantil', 'salud', 7.93036037032, '‰', '2006', 'Córdoba', '{"serie": "TMNEO Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b936f6a4-4fc1-58dc-a86b-108b00dc3304', 'Mortalidad infantil', 'salud', 3.63321161152, '‰', '2006', 'Córdoba', '{"serie": "TMPOS cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('545a5479-c332-5729-a7d5-84fa832b8732', 'Mortalidad infantil', 'salud', 13.2706994372, '‰', '2007', 'Córdoba', '{"serie": "TMI", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('545a5479-c332-5729-a7d5-84fa832b8732', 'Mortalidad infantil', 'salud', 4.3664882019, '‰', '2007', 'Córdoba', '{"serie": "RMM", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('545a5479-c332-5729-a7d5-84fa832b8732', 'Mortalidad infantil', 'salud', 8.51037112295, '‰', '2007', 'Córdoba', '{"serie": "TMNEO", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('545a5479-c332-5729-a7d5-84fa832b8732', 'Mortalidad infantil', 'salud', 4.76032831425, '‰', '2007', 'Córdoba', '{"serie": "TMPOS", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

