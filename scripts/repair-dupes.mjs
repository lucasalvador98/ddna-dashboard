#!/usr/bin/env node
/**
 * Repair duplicate rows introduced by a non-idempotent ETL run.
 *
 * Scope: ONLY the categories that were damaged (empleo, canastas, pobreza).
 * For each natural key (indicador_nombre, periodo, region, fuente) it keeps the
 * row with the lowest `id` (the original) and removes the rest.
 *
 * Dry-run by default; pass --apply to write.
 * Handles PostgREST's 1000-row page cap via explicit pagination.
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env.local') });

const CATEGORIES = ['empleo', 'canastas', 'pobreza'];
const APPLY = process.argv.includes('--apply');
const PAGE = 1000;

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function scanCategory(cat) {
  const groups = new Map();
  let offset = 0;
  let total = 0;
  while (true) {
    const { data, error } = await db
      .from('indicadores')
      .select('id, indicador_nombre, periodo, region, fuente')
      .eq('categoria', cat)
      .range(offset, offset + PAGE - 1);
    if (error) throw new Error(`${cat} scan: ${error.message}`);
    if (!data.length) break;
    for (const r of data) {
      total++;
      const key = [r.indicador_nombre, r.periodo, r.region, r.fuente].join('|');
      const cur = groups.get(key);
      if (!cur || r.id < cur) groups.set(key, r.id);
    }
    if (data.length < PAGE) break;
    offset += PAGE;
  }
  const dupCount = total - groups.size; // rows beyond one-per-key
  return { cat, total, uniqueKeys: groups.size, dupCount };
}

async function deleteIds(cat, ids) {
  let deleted = 0;
  const BATCH = 500;
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    const { error } = await db.from('indicadores').delete().eq('categoria', cat).in('id', chunk);
    if (error) throw new Error(`${cat} delete: ${error.message}`);
    deleted += chunk.length;
  }
  return deleted;
}

async function collectDupIds(cat) {
  const seen = new Set();
  const toDelete = [];
  let offset = 0;
  while (true) {
    const { data, error } = await db
      .from('indicadores')
      .select('id, indicador_nombre, periodo, region, fuente')
      .eq('categoria', cat)
      .order('id', { ascending: true })
      .range(offset, offset + PAGE - 1);
    if (error) throw new Error(`${cat} collect: ${error.message}`);
    if (!data.length) break;
    for (const r of data) {
      const key = [r.indicador_nombre, r.periodo, r.region, r.fuente].join('|');
      if (seen.has(key)) toDelete.push(r.id);
      else seen.add(key);
    }
    if (data.length < PAGE) break;
    offset += PAGE;
  }
  return toDelete;
}

console.log('=== Diagnóstico de duplicados (solo categorías dañadas) ===');
for (const cat of CATEGORIES) {
  const s = await scanCategory(cat);
  console.log(`  ${cat.padEnd(10)} total=${s.total}  únicas=${s.uniqueKeys}  a_eliminar=${s.dupCount}`);
}

if (!APPLY) {
  console.log('\n🏜️  DRY-RUN: nada se eliminó. Pasá --apply para limpiar.');
  process.exit(0);
}

console.log('\n🧹 Eliminando duplicados (conservando el id más bajo por clave)...');
for (const cat of CATEGORIES) {
  const ids = await collectDupIds(cat);
  if (!ids.length) { console.log(`  ${cat}: sin duplicados`); continue; }
  const del = await deleteIds(cat, ids);
  console.log(`  ${cat}: eliminados ${del}`);
}

console.log('\n=== Verificación final ===');
for (const cat of CATEGORIES) {
  const s = await scanCategory(cat);
  console.log(`  ${cat.padEnd(10)} total=${s.total}  únicas=${s.uniqueKeys}  restantes=${s.dupCount}`);
}