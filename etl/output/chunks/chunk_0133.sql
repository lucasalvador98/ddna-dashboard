-- Chunk 0133: INSERTs 6651 to 6681 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('359dbe6e-7818-598f-9476-8aed7c47546d', 'Mortalidad infantil', 'salud', 8.44741880258, '‰', '2020', 'Córdoba', '{"serie": "TMI", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('359dbe6e-7818-598f-9476-8aed7c47546d', 'Mortalidad infantil', 'salud', 4.144016771, '‰', '2020', 'Córdoba', '{"serie": "RMM", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('359dbe6e-7818-598f-9476-8aed7c47546d', 'Mortalidad infantil', 'salud', 6.19352370808, '‰', '2020', 'Córdoba', '{"serie": "TMNEO", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('359dbe6e-7818-598f-9476-8aed7c47546d', 'Mortalidad infantil', 'salud', 2.25389509449, '‰', '2020', 'Córdoba', '{"serie": "TMPOS", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('359dbe6e-7818-598f-9476-8aed7c47546d', 'Mortalidad infantil', 'salud', 7.05781545954, '‰', '2020', 'Córdoba', '{"serie": "TMI Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('359dbe6e-7818-598f-9476-8aed7c47546d', 'Mortalidad infantil', 'salud', 3.382339677, '‰', '2020', 'Córdoba', '{"serie": "RMM Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('359dbe6e-7818-598f-9476-8aed7c47546d', 'Mortalidad infantil', 'salud', 5.18625417155, '‰', '2020', 'Córdoba', '{"serie": "TMNEO Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('359dbe6e-7818-598f-9476-8aed7c47546d', 'Mortalidad infantil', 'salud', 1.87156128799, '‰', '2020', 'Córdoba', '{"serie": "TMPOS cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('536d5480-e7eb-5536-8e1e-3e6c6e277234', 'Mortalidad infantil', 'salud', 7.99933559081, '‰', '2021', 'Córdoba', '{"serie": "TMI", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('536d5480-e7eb-5536-8e1e-3e6c6e277234', 'Mortalidad infantil', 'salud', 7.4179775535, '‰', '2021', 'Córdoba', '{"serie": "RMM", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('536d5480-e7eb-5536-8e1e-3e6c6e277234', 'Mortalidad infantil', 'salud', 5.7173165419, '‰', '2021', 'Córdoba', '{"serie": "TMNEO", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('536d5480-e7eb-5536-8e1e-3e6c6e277234', 'Mortalidad infantil', 'salud', 2.28201904891, '‰', '2021', 'Córdoba', '{"serie": "TMPOS", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('536d5480-e7eb-5536-8e1e-3e6c6e277234', 'Mortalidad infantil', 'salud', 6.63511401979, '‰', '2021', 'Córdoba', '{"serie": "TMI Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('536d5480-e7eb-5536-8e1e-3e6c6e277234', 'Mortalidad infantil', 'salud', 6.3407232953, '‰', '2021', 'Córdoba', '{"serie": "RMM Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('536d5480-e7eb-5536-8e1e-3e6c6e277234', 'Mortalidad infantil', 'salud', 4.37056998573, '‰', '2021', 'Córdoba', '{"serie": "TMNEO Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('536d5480-e7eb-5536-8e1e-3e6c6e277234', 'Mortalidad infantil', 'salud', 2.26454403405, '‰', '2021', 'Córdoba', '{"serie": "TMPOS cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('6c5a8740-ec31-5833-bad3-1653178d7e06', 'Mortalidad infantil', 'salud', 8.40307291614, '‰', '2022', 'Córdoba', '{"serie": "TMI", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('6c5a8740-ec31-5833-bad3-1653178d7e06', 'Mortalidad infantil', 'salud', 3.4322979234, '‰', '2022', 'Córdoba', '{"serie": "RMM", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('6c5a8740-ec31-5833-bad3-1653178d7e06', 'Mortalidad infantil', 'salud', 5.78241250164, '‰', '2022', 'Córdoba', '{"serie": "TMNEO", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('6c5a8740-ec31-5833-bad3-1653178d7e06', 'Mortalidad infantil', 'salud', 2.6206604145, '‰', '2022', 'Córdoba', '{"serie": "TMPOS", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('6c5a8740-ec31-5833-bad3-1653178d7e06', 'Mortalidad infantil', 'salud', 7.47811868808, '‰', '2022', 'Córdoba', '{"serie": "TMI Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('6c5a8740-ec31-5833-bad3-1653178d7e06', 'Mortalidad infantil', 'salud', 3.3663556795, '‰', '2022', 'Córdoba', '{"serie": "RMM Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('6c5a8740-ec31-5833-bad3-1653178d7e06', 'Mortalidad infantil', 'salud', 5.19380590554, '‰', '2022', 'Córdoba', '{"serie": "TMNEO Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('6c5a8740-ec31-5833-bad3-1653178d7e06', 'Mortalidad infantil', 'salud', 2.28431278253, '‰', '2022', 'Córdoba', '{"serie": "TMPOS cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


-- ============================================================
-- DATOS: SEGURIDAD (7 registros)
-- ============================================================

INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a4c954d1-5b79-55b4-a9f3-f53de9cf85af', 'Casos de Civil', 'seguridad', 21.0, 'casos', '2022', 'Córdoba', '{"materia": "Civil", "tipo": "civil", "fuente": "Justicia_cba_2022.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('128f948b-f0f8-5fb5-bf4c-62bfc4b4cf7b', 'Casos de Familia', 'seguridad', 5089.0, 'casos', '2022', 'Córdoba', '{"materia": "Familia", "tipo": "familia", "fuente": "Justicia_cba_2022.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('6b56a20e-4db0-5b0e-8bed-89ee8c662265', 'Casos de Fiscalías', 'seguridad', 2058.0, 'casos', '2022', 'Córdoba', '{"materia": "Fiscal\u00edas", "tipo": "fiscalias", "fuente": "Justicia_cba_2022.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('23fe67b2-d411-5cb5-8677-825d9b47ac18', 'Casos de Niñez', 'seguridad', 207.0, 'casos', '2022', 'Córdoba', '{"materia": "Ni\u00f1ez", "tipo": "ninez", "fuente": "Justicia_cba_2022.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b0a1990b-51a4-5609-8b7e-795ae25c2e1d', 'Casos de Penal Juvenil', 'seguridad', 1098.0, 'casos', '2022', 'Córdoba', '{"materia": "Penal Juvenil", "tipo": "penal_juvenil", "fuente": "Justicia_cba_2022.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('fd4eeda3-deb9-5c1f-8c15-4d1eeefec82b', 'Casos de Violencia Familiar', 'seguridad', 55993.0, 'casos', '2022', 'Córdoba', '{"materia": "Violencia Familiar", "tipo": "violencia_familiar", "fuente": "Justicia_cba_2022.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('168862c9-3b03-59d4-8f98-5ef86d56900f', 'Total casos sistema de justicia', 'seguridad', 64466.0, 'casos', '2022', 'Córdoba', '{"tipo": "total", "fuente": "Justicia_cba_2022.xlsx", "hoja": "Sheet1", "materias_incluidas": ["Violencia Familiar", "Fiscal\u00edas", "Civil", "Familia", "Ni\u00f1ez", "Penal Juvenil"]}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;