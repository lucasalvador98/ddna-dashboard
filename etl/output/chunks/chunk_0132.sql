-- Chunk 0132: INSERTs 6601 to 6650 of 6681
INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f5cd659f-d9f2-57d3-bf8b-057c12d8da0f', 'Mortalidad infantil', 'salud', 6.48619673009, '‰', '2013', 'Córdoba', '{"serie": "TMNEO Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f5cd659f-d9f2-57d3-bf8b-057c12d8da0f', 'Mortalidad infantil', 'salud', 3.16269096756, '‰', '2013', 'Córdoba', '{"serie": "TMPOS cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f4b7ddc9-6f7b-5086-9fb5-228373cdbafe', 'Mortalidad infantil', 'salud', 10.55582153171, '‰', '2014', 'Córdoba', '{"serie": "TMI", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f4b7ddc9-6f7b-5086-9fb5-228373cdbafe', 'Mortalidad infantil', 'salud', 3.7322460914, '‰', '2014', 'Córdoba', '{"serie": "RMM", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f4b7ddc9-6f7b-5086-9fb5-228373cdbafe', 'Mortalidad infantil', 'salud', 7.17620834684, '‰', '2014', 'Córdoba', '{"serie": "TMNEO", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f4b7ddc9-6f7b-5086-9fb5-228373cdbafe', 'Mortalidad infantil', 'salud', 3.37961318486, '‰', '2014', 'Córdoba', '{"serie": "TMPOS", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f4b7ddc9-6f7b-5086-9fb5-228373cdbafe', 'Mortalidad infantil', 'salud', 8.92887283529, '‰', '2014', 'Córdoba', '{"serie": "TMI Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f4b7ddc9-6f7b-5086-9fb5-228373cdbafe', 'Mortalidad infantil', 'salud', 3.2069675589, '‰', '2014', 'Córdoba', '{"serie": "RMM Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f4b7ddc9-6f7b-5086-9fb5-228373cdbafe', 'Mortalidad infantil', 'salud', 6.0426020322, '‰', '2014', 'Córdoba', '{"serie": "TMNEO Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('f4b7ddc9-6f7b-5086-9fb5-228373cdbafe', 'Mortalidad infantil', 'salud', 2.88627080309, '‰', '2014', 'Córdoba', '{"serie": "TMPOS cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4de25a2b-9ce7-5af4-bdd8-b996cb4d4558', 'Mortalidad infantil', 'salud', 9.66832891797, '‰', '2015', 'Córdoba', '{"serie": "TMI", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4de25a2b-9ce7-5af4-bdd8-b996cb4d4558', 'Mortalidad infantil', 'salud', 3.8699288348, '‰', '2015', 'Córdoba', '{"serie": "RMM", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4de25a2b-9ce7-5af4-bdd8-b996cb4d4558', 'Mortalidad infantil', 'salud', 6.56978858241, '‰', '2015', 'Córdoba', '{"serie": "TMNEO", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4de25a2b-9ce7-5af4-bdd8-b996cb4d4558', 'Mortalidad infantil', 'salud', 3.09854033556, '‰', '2015', 'Córdoba', '{"serie": "TMPOS", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4de25a2b-9ce7-5af4-bdd8-b996cb4d4558', 'Mortalidad infantil', 'salud', 8.41900338126, '‰', '2015', 'Córdoba', '{"serie": "TMI Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4de25a2b-9ce7-5af4-bdd8-b996cb4d4558', 'Mortalidad infantil', 'salud', 2.9031046142, '‰', '2015', 'Córdoba', '{"serie": "RMM Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4de25a2b-9ce7-5af4-bdd8-b996cb4d4558', 'Mortalidad infantil', 'salud', 6.04528843198, '‰', '2015', 'Córdoba', '{"serie": "TMNEO Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4de25a2b-9ce7-5af4-bdd8-b996cb4d4558', 'Mortalidad infantil', 'salud', 2.37371494928, '‰', '2015', 'Córdoba', '{"serie": "TMPOS cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4d90dcc4-9faa-581e-a9a6-baa9a5fd2d1e', 'Mortalidad infantil', 'salud', 9.74266347084, '‰', '2016', 'Córdoba', '{"serie": "TMI", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4d90dcc4-9faa-581e-a9a6-baa9a5fd2d1e', 'Mortalidad infantil', 'salud', 3.3652228258, '‰', '2016', 'Córdoba', '{"serie": "RMM", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4d90dcc4-9faa-581e-a9a6-baa9a5fd2d1e', 'Mortalidad infantil', 'salud', 6.47771054963, '‰', '2016', 'Córdoba', '{"serie": "TMNEO", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4d90dcc4-9faa-581e-a9a6-baa9a5fd2d1e', 'Mortalidad infantil', 'salud', 3.26495292121, '‰', '2016', 'Córdoba', '{"serie": "TMPOS", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4d90dcc4-9faa-581e-a9a6-baa9a5fd2d1e', 'Mortalidad infantil', 'salud', 8.92667375132, '‰', '2016', 'Córdoba', '{"serie": "TMI Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4d90dcc4-9faa-581e-a9a6-baa9a5fd2d1e', 'Mortalidad infantil', 'salud', 2.8338646829, '‰', '2016', 'Córdoba', '{"serie": "RMM Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4d90dcc4-9faa-581e-a9a6-baa9a5fd2d1e', 'Mortalidad infantil', 'salud', 6.19907899397, '‰', '2016', 'Córdoba', '{"serie": "TMNEO Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('4d90dcc4-9faa-581e-a9a6-baa9a5fd2d1e', 'Mortalidad infantil', 'salud', 2.72759475735, '‰', '2016', 'Córdoba', '{"serie": "TMPOS cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3ad2f4bc-5ed9-5de6-9f15-a0bf01531c9a', 'Mortalidad infantil', 'salud', 9.33709333829, '‰', '2017', 'Córdoba', '{"serie": "TMI", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3ad2f4bc-5ed9-5de6-9f15-a0bf01531c9a', 'Mortalidad infantil', 'salud', 2.8668382038, '‰', '2017', 'Córdoba', '{"serie": "RMM", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3ad2f4bc-5ed9-5de6-9f15-a0bf01531c9a', 'Mortalidad infantil', 'salud', 6.4574820929, '‰', '2017', 'Córdoba', '{"serie": "TMNEO", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3ad2f4bc-5ed9-5de6-9f15-a0bf01531c9a', 'Mortalidad infantil', 'salud', 2.87961124538, '‰', '2017', 'Córdoba', '{"serie": "TMPOS", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3ad2f4bc-5ed9-5de6-9f15-a0bf01531c9a', 'Mortalidad infantil', 'salud', 9.25114955112, '‰', '2017', 'Córdoba', '{"serie": "TMI Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3ad2f4bc-5ed9-5de6-9f15-a0bf01531c9a', 'Mortalidad infantil', 'salud', 2.9194949273, '‰', '2017', 'Córdoba', '{"serie": "RMM Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3ad2f4bc-5ed9-5de6-9f15-a0bf01531c9a', 'Mortalidad infantil', 'salud', 6.47762937011, '‰', '2017', 'Córdoba', '{"serie": "TMNEO Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('3ad2f4bc-5ed9-5de6-9f15-a0bf01531c9a', 'Mortalidad infantil', 'salud', 2.773520181, '‰', '2017', 'Córdoba', '{"serie": "TMPOS cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('30125917-b7f9-501c-97a2-269f178d3cdf', 'Mortalidad infantil', 'salud', 8.82412160013, '‰', '2018', 'Córdoba', '{"serie": "TMI", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('30125917-b7f9-501c-97a2-269f178d3cdf', 'Mortalidad infantil', 'salud', 3.7496680741, '‰', '2018', 'Córdoba', '{"serie": "RMM", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('30125917-b7f9-501c-97a2-269f178d3cdf', 'Mortalidad infantil', 'salud', 6.01260005194, '‰', '2018', 'Córdoba', '{"serie": "TMNEO", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('30125917-b7f9-501c-97a2-269f178d3cdf', 'Mortalidad infantil', 'salud', 2.81152154818, '‰', '2018', 'Córdoba', '{"serie": "TMPOS", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('30125917-b7f9-501c-97a2-269f178d3cdf', 'Mortalidad infantil', 'salud', 7.41100263211, '‰', '2018', 'Córdoba', '{"serie": "TMI Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('30125917-b7f9-501c-97a2-269f178d3cdf', 'Mortalidad infantil', 'salud', 3.3601523269, '‰', '2018', 'Córdoba', '{"serie": "RMM Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('30125917-b7f9-501c-97a2-269f178d3cdf', 'Mortalidad infantil', 'salud', 4.92822341279, '‰', '2018', 'Córdoba', '{"serie": "TMNEO Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('30125917-b7f9-501c-97a2-269f178d3cdf', 'Mortalidad infantil', 'salud', 2.48277921932, '‰', '2018', 'Córdoba', '{"serie": "TMPOS cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('95833089-85fd-5e85-911c-9120a8ee43b6', 'Mortalidad infantil', 'salud', 9.185518698, '‰', '2019', 'Córdoba', '{"serie": "TMI", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('95833089-85fd-5e85-911c-9120a8ee43b6', 'Mortalidad infantil', 'salud', 3.0058790517, '‰', '2019', 'Córdoba', '{"serie": "RMM", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('95833089-85fd-5e85-911c-9120a8ee43b6', 'Mortalidad infantil', 'salud', 6.2435945197, '‰', '2019', 'Córdoba', '{"serie": "TMNEO", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('95833089-85fd-5e85-911c-9120a8ee43b6', 'Mortalidad infantil', 'salud', 2.94192417829, '‰', '2019', 'Córdoba', '{"serie": "TMPOS", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('95833089-85fd-5e85-911c-9120a8ee43b6', 'Mortalidad infantil', 'salud', 7.50063814329, '‰', '2019', 'Córdoba', '{"serie": "TMI Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('95833089-85fd-5e85-911c-9120a8ee43b6', 'Mortalidad infantil', 'salud', 1.9635178385, '‰', '2019', 'Córdoba', '{"serie": "RMM Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('95833089-85fd-5e85-911c-9120a8ee43b6', 'Mortalidad infantil', 'salud', 5.39967405603, '‰', '2019', 'Córdoba', '{"serie": "TMNEO Cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;


INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
VALUES ('95833089-85fd-5e85-911c-9120a8ee43b6', 'Mortalidad infantil', 'salud', 2.10096408725, '‰', '2019', 'Córdoba', '{"serie": "TMPOS cba", "fuente": "Mortalidad infantil Nacion-Provincia.xlsx", "hoja": "Sheet1"}'::jsonb, 'etl')
ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;

