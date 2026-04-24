-- Chunk 0131: INSERTs 6551 to 6600 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('545a5479-c332-5729-a7d5-84fa832b8732', 'Mortalidad infantil', 'salud', 12.74947649315, '‰', '2007', 'Córdoba', '{"serie": "TMI Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('545a5479-c332-5729-a7d5-84fa832b8732', 'Mortalidad infantil', 'salud', 1.4824972666, '‰', '2007', 'Córdoba', '{"serie": "RMM Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('545a5479-c332-5729-a7d5-84fa832b8732', 'Mortalidad infantil', 'salud', 8.56142171487, '‰', '2007', 'Córdoba', '{"serie": "TMNEO Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('545a5479-c332-5729-a7d5-84fa832b8732', 'Mortalidad infantil', 'salud', 4.18805477827, '‰', '2007', 'Córdoba', '{"serie": "TMPOS cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3976652a-2844-5097-86ef-c4f4e1c5ef52', 'Mortalidad infantil', 'salud', 12.51373147924, '‰', '2008', 'Córdoba', '{"serie": "TMI", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3976652a-2844-5097-86ef-c4f4e1c5ef52', 'Mortalidad infantil', 'salud', 3.9653832757, '‰', '2008', 'Córdoba', '{"serie": "RMM", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3976652a-2844-5097-86ef-c4f4e1c5ef52', 'Mortalidad infantil', 'salud', 8.30051174878, '‰', '2008', 'Córdoba', '{"serie": "TMNEO", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3976652a-2844-5097-86ef-c4f4e1c5ef52', 'Mortalidad infantil', 'salud', 4.21321973046, '‰', '2008', 'Córdoba', '{"serie": "TMPOS", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3976652a-2844-5097-86ef-c4f4e1c5ef52', 'Mortalidad infantil', 'salud', 12.12267318719, '‰', '2008', 'Córdoba', '{"serie": "TMI Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3976652a-2844-5097-86ef-c4f4e1c5ef52', 'Mortalidad infantil', 'salud', 3.4439412463, '‰', '2008', 'Córdoba', '{"serie": "RMM Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3976652a-2844-5097-86ef-c4f4e1c5ef52', 'Mortalidad infantil', 'salud', 8.52375458474, '‰', '2008', 'Córdoba', '{"serie": "TMNEO Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3976652a-2844-5097-86ef-c4f4e1c5ef52', 'Mortalidad infantil', 'salud', 3.59891860244, '‰', '2008', 'Córdoba', '{"serie": "TMPOS cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('188ae2d0-07a9-5610-ba34-9c2630145755', 'Mortalidad infantil', 'salud', 12.1099745618, '‰', '2009', 'Córdoba', '{"serie": "TMI", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('188ae2d0-07a9-5610-ba34-9c2630145755', 'Mortalidad infantil', 'salud', 5.5008747732, '‰', '2009', 'Córdoba', '{"serie": "RMM", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('188ae2d0-07a9-5610-ba34-9c2630145755', 'Mortalidad infantil', 'salud', 7.99102686573, '‰', '2009', 'Córdoba', '{"serie": "TMNEO", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('188ae2d0-07a9-5610-ba34-9c2630145755', 'Mortalidad infantil', 'salud', 4.11894769607, '‰', '2009', 'Córdoba', '{"serie": "TMPOS", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('188ae2d0-07a9-5610-ba34-9c2630145755', 'Mortalidad infantil', 'salud', 10.70057172113, '‰', '2009', 'Córdoba', '{"serie": "TMI Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('188ae2d0-07a9-5610-ba34-9c2630145755', 'Mortalidad infantil', 'salud', 7.1678470859, '‰', '2009', 'Córdoba', '{"serie": "RMM Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('188ae2d0-07a9-5610-ba34-9c2630145755', 'Mortalidad infantil', 'salud', 7.38970901954, '‰', '2009', 'Córdoba', '{"serie": "TMNEO Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('188ae2d0-07a9-5610-ba34-9c2630145755', 'Mortalidad infantil', 'salud', 3.31086270159, '‰', '2009', 'Córdoba', '{"serie": "TMPOS cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e7bf185f-2be3-53a7-8f02-9ec1ee10470e', 'Mortalidad infantil', 'salud', 11.85041577622, '‰', '2010', 'Córdoba', '{"serie": "TMI", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e7bf185f-2be3-53a7-8f02-9ec1ee10470e', 'Mortalidad infantil', 'salud', 4.3772878271, '‰', '2010', 'Córdoba', '{"serie": "RMM", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e7bf185f-2be3-53a7-8f02-9ec1ee10470e', 'Mortalidad infantil', 'salud', 7.85795899367, '‰', '2010', 'Córdoba', '{"serie": "TMNEO", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e7bf185f-2be3-53a7-8f02-9ec1ee10470e', 'Mortalidad infantil', 'salud', 3.99245678254, '‰', '2010', 'Córdoba', '{"serie": "TMPOS", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e7bf185f-2be3-53a7-8f02-9ec1ee10470e', 'Mortalidad infantil', 'salud', 11.08643662453, '‰', '2010', 'Córdoba', '{"serie": "TMI Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e7bf185f-2be3-53a7-8f02-9ec1ee10470e', 'Mortalidad infantil', 'salud', 4.7830543218, '‰', '2010', 'Córdoba', '{"serie": "RMM Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e7bf185f-2be3-53a7-8f02-9ec1ee10470e', 'Mortalidad infantil', 'salud', 7.36248718824, '‰', '2010', 'Córdoba', '{"serie": "TMNEO Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('e7bf185f-2be3-53a7-8f02-9ec1ee10470e', 'Mortalidad infantil', 'salud', 3.72394943628, '‰', '2010', 'Córdoba', '{"serie": "TMPOS cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a67231c3-7891-53d5-a8f3-b71431d06506', 'Mortalidad infantil', 'salud', 11.71175211927, '‰', '2011', 'Córdoba', '{"serie": "TMI", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a67231c3-7891-53d5-a8f3-b71431d06506', 'Mortalidad infantil', 'salud', 3.9839481189, '‰', '2011', 'Córdoba', '{"serie": "RMM", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a67231c3-7891-53d5-a8f3-b71431d06506', 'Mortalidad infantil', 'salud', 7.58665087158, '‰', '2011', 'Córdoba', '{"serie": "TMNEO", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a67231c3-7891-53d5-a8f3-b71431d06506', 'Mortalidad infantil', 'salud', 4.12510124768, '‰', '2011', 'Córdoba', '{"serie": "TMPOS", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a67231c3-7891-53d5-a8f3-b71431d06506', 'Mortalidad infantil', 'salud', 10.76718342233, '‰', '2011', 'Córdoba', '{"serie": "TMI Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a67231c3-7891-53d5-a8f3-b71431d06506', 'Mortalidad infantil', 'salud', 1.9011078273, '‰', '2011', 'Córdoba', '{"serie": "RMM Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a67231c3-7891-53d5-a8f3-b71431d06506', 'Mortalidad infantil', 'salud', 7.17236134874, '‰', '2011', 'Córdoba', '{"serie": "TMNEO Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('a67231c3-7891-53d5-a8f3-b71431d06506', 'Mortalidad infantil', 'salud', 3.59482207359, '‰', '2011', 'Córdoba', '{"serie": "TMPOS cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b0f3e653-536c-5aa8-b539-4ba872388956', 'Mortalidad infantil', 'salud', 11.14289506689, '‰', '2012', 'Córdoba', '{"serie": "TMI", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b0f3e653-536c-5aa8-b539-4ba872388956', 'Mortalidad infantil', 'salud', 3.4944292296, '‰', '2012', 'Córdoba', '{"serie": "RMM", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b0f3e653-536c-5aa8-b539-4ba872388956', 'Mortalidad infantil', 'salud', 7.50489626421, '‰', '2012', 'Córdoba', '{"serie": "TMNEO", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b0f3e653-536c-5aa8-b539-4ba872388956', 'Mortalidad infantil', 'salud', 3.63799880268, '‰', '2012', 'Córdoba', '{"serie": "TMPOS", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b0f3e653-536c-5aa8-b539-4ba872388956', 'Mortalidad infantil', 'salud', 9.65461451885, '‰', '2012', 'Córdoba', '{"serie": "TMI Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b0f3e653-536c-5aa8-b539-4ba872388956', 'Mortalidad infantil', 'salud', 1.5827236916, '‰', '2012', 'Córdoba', '{"serie": "RMM Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b0f3e653-536c-5aa8-b539-4ba872388956', 'Mortalidad infantil', 'salud', 6.27813731007, '‰', '2012', 'Córdoba', '{"serie": "TMNEO Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('b0f3e653-536c-5aa8-b539-4ba872388956', 'Mortalidad infantil', 'salud', 3.37647720877, '‰', '2012', 'Córdoba', '{"serie": "TMPOS cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f5cd659f-d9f2-57d3-bf8b-057c12d8da0f', 'Mortalidad infantil', 'salud', 10.83218593088, '‰', '2013', 'Córdoba', '{"serie": "TMI", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f5cd659f-d9f2-57d3-bf8b-057c12d8da0f', 'Mortalidad infantil', 'salud', 3.2467403389, '‰', '2013', 'Córdoba', '{"serie": "RMM", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f5cd659f-d9f2-57d3-bf8b-057c12d8da0f', 'Mortalidad infantil', 'salud', 7.38401517089, '‰', '2013', 'Córdoba', '{"serie": "TMNEO", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f5cd659f-d9f2-57d3-bf8b-057c12d8da0f', 'Mortalidad infantil', 'salud', 3.44817075998, '‰', '2013', 'Córdoba', '{"serie": "TMPOS", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f5cd659f-d9f2-57d3-bf8b-057c12d8da0f', 'Mortalidad infantil', 'salud', 9.64888769766, '‰', '2013', 'Córdoba', '{"serie": "TMI Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f5cd659f-d9f2-57d3-bf8b-057c12d8da0f', 'Mortalidad infantil', 'salud', 2.3228803716, '‰', '2013', 'Córdoba', '{"serie": "RMM Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

