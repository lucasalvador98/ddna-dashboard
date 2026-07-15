#!/usr/bin/env node
/**
 * load-deis-2024.mjs
 * Carga datos de mortalidad infantil DEIS 2023-2024 extraídos del PDF
 * "Estadísticas Vitales - Argentina Año 2024" (publicado enero 2026).
 *
 * Fuente: DEIS - https://www.argentina.gob.ar/salud/deis
 * PDF: Estadísticas Vitales 2024 (Cuadros 32, 42, 44)
 *
 * Uso: node scripts/load-deis-2024.mjs
 * Requiere: SUPABASE_SERVICE_ROLE_KEY en .env.local
 */

import { supabase } from './config.mjs';

const DATA = [
  // ── Nacional 2024 ──
  {
    indicador_nombre: 'Mortalidad infantil (TMNEO)',
    categoria: 'salud',
    valor: 6.0,
    unidad: '‰',
    periodo: 2024,
    region: 'Nacional',
    desglose: { serie: 'TMNEO', fuente: 'DEIS Estadísticas Vitales 2024 - Cuadro 32' },
    fuente: 'DEIS / Estadísticas Vitales 2024',
    activo: true,
  },
  {
    indicador_nombre: 'Mortalidad infantil (TMPOS)',
    categoria: 'salud',
    valor: 2.5,
    unidad: '‰',
    periodo: 2024,
    region: 'Nacional',
    desglose: { serie: 'TMPOS', fuente: 'DEIS Estadísticas Vitales 2024 - Cuadro 32' },
    fuente: 'DEIS / Estadísticas Vitales 2024',
    activo: true,
  },
  {
    indicador_nombre: 'Mortalidad infantil (RMM)',
    categoria: 'salud',
    valor: 4.4,
    unidad: '‰',
    periodo: 2024,
    region: 'Nacional',
    desglose: { serie: 'RMM', fuente: 'DEIS Estadísticas Vitales 2024 - Cuadro 42' },
    fuente: 'DEIS / Estadísticas Vitales 2024',
    activo: true,
  },
  // ── Córdoba 2024 ──
  {
    indicador_nombre: 'Mortalidad infantil (TMNEO Cba)',
    categoria: 'salud',
    valor: 4.7,
    unidad: '‰',
    periodo: 2024,
    region: 'Córdoba',
    desglose: { serie: 'TMNEO Cba', fuente: 'DEIS Estadísticas Vitales 2024 - Cuadro 32' },
    fuente: 'DEIS / Estadísticas Vitales 2024',
    activo: true,
  },
  {
    indicador_nombre: 'Mortalidad infantil (TMPOS cba)',
    categoria: 'salud',
    valor: 2.1,
    unidad: '‰',
    periodo: 2024,
    region: 'Córdoba',
    desglose: { serie: 'TMPOS cba', fuente: 'DEIS Estadísticas Vitales 2024 - Cuadro 32' },
    fuente: 'DEIS / Estadísticas Vitales 2024',
    activo: true,
  },
  {
    indicador_nombre: 'Mortalidad infantil (RMM Cba)',
    categoria: 'salud',
    valor: 3.8,
    unidad: '‰',
    periodo: 2024,
    region: 'Córdoba',
    desglose: { serie: 'RMM Cba', fuente: 'DEIS Estadísticas Vitales 2024 - Cuadro 42' },
    fuente: 'DEIS / Estadísticas Vitales 2024',
    activo: true,
  },
  // ── Córdoba 2023 (RMM faltante) ──
  {
    indicador_nombre: 'Mortalidad infantil (RMM Cba)',
    categoria: 'salud',
    valor: 4.5,
    unidad: '‰',
    periodo: 2023,
    region: 'Córdoba',
    desglose: { serie: 'RMM Cba', fuente: 'DEIS Estadísticas Vitales 2024 - Cuadro 44' },
    fuente: 'DEIS / Estadísticas Vitales 2024',
    activo: true,
  },
  {
    indicador_nombre: 'Mortalidad infantil (RMM)',
    categoria: 'salud',
    valor: 3.2,
    unidad: '‰',
    periodo: 2023,
    region: 'Nacional',
    desglose: { serie: 'RMM', fuente: 'DEIS Estadísticas Vitales 2024 - Cuadro 44' },
    fuente: 'DEIS / Estadísticas Vitales 2024',
    activo: true,
  },
  // ── Córdoba 2023 TMNEO/TMPOS (from 2023 PDF - not available yet)
  // Will be extracted from the 2023 PDF in a future run
];

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  CARGA DEIS 2023-2024');
  console.log('═══════════════════════════════════════════\n');

  let inserted = 0;
  let updated = 0;

  for (const row of DATA) {
    // Check if already exists
    const { data: existing } = await supabase
      .from('indicadores')
      .select('id')
      .eq('indicador_nombre', row.indicador_nombre)
      .eq('periodo', row.periodo)
      .eq('region', row.region)
      .maybeSingle();

    if (existing) {
      // Update
      const { error } = await supabase
        .from('indicadores')
        .update({ valor: row.valor, fuente: row.fuente, desglose: row.desglose, activo: true })
        .eq('id', existing.id);

      if (error) {
        console.error(`  ❌ Error actualizando ${row.indicador_nombre} (${row.periodo}): ${error.message}`);
      } else {
        console.log(`  🔄 Actualizado: ${row.indicador_nombre} ${row.periodo} = ${row.valor}`);
        updated++;
      }
    } else {
      // Insert
      const { error } = await supabase.from('indicadores').insert(row);

      if (error) {
        console.error(`  ❌ Error insertando ${row.indicador_nombre} (${row.periodo}): ${error.message}`);
      } else {
        console.log(`  ✅ Insertado: ${row.indicador_nombre} ${row.periodo} = ${row.valor}`);
        inserted++;
      }
    }
  }

  console.log('\n═══════════════════════════════════════════');
  console.log(`  Insertados: ${inserted} | Actualizados: ${updated}`);
  console.log('═══════════════════════════════════════════');
}

main().catch(console.error);
