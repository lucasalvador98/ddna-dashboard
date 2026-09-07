#!/usr/bin/env node
/**
 * audit-tarjetas.mjs — Inventario de tarjetas y cruce con DB
 * Genera docs/AUDITORIA_TARJETAS.md
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: resolve('.env.local') });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  config({ path: resolve('.env.production') });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('SUPABASE env missing');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

function findPages(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) findPages(full, acc);
    else if (entry.name === 'page.tsx' || entry.name.endsWith('-client.tsx')) {
      const content = readFileSync(full, 'utf8');
      // Heuristic: find categoria strings
      const cats = [...content.matchAll(/categoria:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
      const indicadores = [...content.matchAll(/indicador_nombre:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
      acc.push({ file: full.replace(process.cwd() + '\\', '').replace(process.cwd() + '/', ''), cats: [...new Set(cats)], indicadores: [...new Set(indicadores)] });
    }
  }
  return acc;
}

async function getDbStats() {
  const { data, error } = await supabase.from('indicadores').select('categoria, periodo, ultima_actualizacion');
  if (error) throw error;
  const byCat = new Map();
  for (const r of data) {
    const prev = byCat.get(r.categoria) || { maxPeriodo: 0, maxActualizacion: '' };
    if (r.periodo > prev.maxPeriodo) prev.maxPeriodo = r.periodo;
    if (r.ultima_actualizacion > prev.maxActualizacion) prev.maxActualizacion = r.ultima_actualizacion;
    byCat.set(r.categoria, prev);
  }
  return byCat;
}

function classify(categoria, stats) {
  const s = stats.get(categoria);
  if (!s) return { estado: 'sin datos', ultimo: '-', actualizacion: '-' };
  const days = s.maxActualizacion ? Math.floor((Date.now() - new Date(s.maxActualizacion).getTime()) / (1000 * 60 * 60 * 24)) : 999;
  let estado = 'actualizada';
  if (days > 90) estado = 'desactualizada';
  else if (days > 45) estado = 'stale';
  return { estado, ultimo: s.maxPeriodo, actualizacion: s.maxActualizacion?.slice(0, 10) || '-', days };
}

async function main() {
  const pages = findPages(resolve('src/app'));
  const stats = await getDbStats();

  let md = `# Auditoría de Tarjetas — ${new Date().toISOString().slice(0, 10)}\n\n`;
  md += `> Inventario de ${pages.length} pantallas, cruce con DB (21149 rows) y FUENTES.md\n\n`;
  md += `| Pantalla | Archivo | Categorías | Indicadores | Último periodo | Última carga | Estado | Recomendación |\n`;
  md += `|---|---|---|---|---|---|---|---|\n`;

  for (const p of pages) {
    const pantalla = p.file.split('src\\app\\')[1]?.split('\\')[0] || p.file;
    const cats = p.cats.length ? p.cats.join(', ') : '-';
    const inds = p.indicadores.length ? p.indicadores.slice(0, 2).join(', ') + (p.indicadores.length > 2 ? '...' : '') : '-';
    // For simplicity, classify by first categoria
    const firstCat = p.cats[0];
    const cls = firstCat ? classify(firstCat, stats) : { estado: '-', ultimo: '-', actualizacion: '-' };
    let rec = '-';
    if (cls.estado === 'desactualizada') rec = 'Actualizar fuente o ocultar';
    else if (cls.estado === 'stale') rec = 'Revisar, programar ETL';
    else if (cls.estado === 'sin datos') rec = 'Verificar query';
    else rec = 'Mantener';

    md += `| ${pantalla} | \`${p.file}\` | ${cats} | ${inds} | ${cls.ultimo} | ${cls.actualizacion} | ${cls.estado} | ${rec} |\n`;
  }

  md += `\n## Por categoría (DB)\n\n`;
  md += `| Categoría | Último periodo | Última carga | Días desde | Estado |\n`;
  md += `|---|---|---|---|---|\n`;
  for (const [cat, s] of [...stats.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const c = classify(cat, stats);
    md += `| ${cat} | ${c.ultimo} | ${c.actualizacion} | ${c.days ?? '-'} | ${c.estado} |\n`;
  }

  md += `\n## Priorización sugerida\n\n`;
  md += `- **P0 (mostrar siempre):** pobreza, salud, educación, inversión, empleo — datos con impacto directo para vecino/periodista\n`;
  md += `- **P1 (drill-down):** demografía, anuario_educación, aprender, seguridad, senaf\n`;
  md += `- **P2 (ocultar/fusionar):** consumo (3 rows), deis (36 rows), salud_adolescente (32) — poco volumen o redundante\n`;

  const out = resolve('docs/AUDITORIA_TARJETAS.md');
  const { writeFileSync } = await import('fs');
  writeFileSync(out, md);
  console.log(`✅ Generado ${out} con ${pages.length} pantallas`);
  console.log(md.slice(0, 2000));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
