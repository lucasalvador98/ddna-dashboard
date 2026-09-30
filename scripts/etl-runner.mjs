/**
 * ETL Runner — fetch → validate → upsert con logs estructurados
 *
 * Uso:
 *   node scripts/etl-runner.mjs --categoria=canastas
 *   node scripts/etl-runner.mjs --dry-run
 *
 * Cada script de categoría exporta `fetchRows(): Promise<RawIndicadorRow[]>`
 * y el runner se encarga de validar, hacer upsert y reportar.
 */

import { supabase } from './config.mjs';

// Inline fetchWithRetry (no depende de src/lib para que funcione con node puro)
export async function fetchWithRetry(url, options = {}, fetchOptions = {}) {
  const retries = options.retries ?? 3;
  const backoff = options.backoffMs ?? [1000, 2000, 4000];
  const timeoutMs = options.timeoutMs ?? 10000;
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...fetchOptions, signal: controller.signal, redirect: 'follow' });
      clearTimeout(timeout);
      if (res.ok) return res;
      const retryable = res.status >= 500 || res.status === 429;
      if (!retryable || attempt === retries) throw new Error(`HTTP ${res.status} for ${url}`);
      lastError = new Error(`HTTP ${res.status} for ${url}`);
    } catch (err) {
      clearTimeout(timeout);
      lastError = err instanceof Error ? err : new Error(String(err));
      if (lastError.name === 'AbortError') lastError = new Error(`Timeout ${timeoutMs}ms for ${url}`);
      const m = lastError.message.match(/^HTTP (\d+)/);
      if (m) {
        const code = Number(m[1]);
        const retryable = code >= 500 || code === 429;
        if (!retryable) break;
      }
      if (attempt === retries) break;
    }
    const delay = backoff[attempt] ?? backoff[backoff.length - 1];
    await new Promise((r) => setTimeout(r, delay));
  }
  throw lastError ?? new Error(`fetchWithRetry failed for ${url}`);
}

// Inline validate (sin zod, para que el runner sea puro JS)
const UNIT_RANGES = {
  '%': { min: 0, max: 100 },
  '‰': { min: 0, max: 50 },
  'pesos': { min: 0, max: Number.MAX_SAFE_INTEGER },
  índice: { min: 0, max: 10000 },
  'miles de personas': { min: 0, max: 50000 },
  coeficiente: { min: 0, max: 10 },
};

export function validateRows(rows) {
  const valid = [];
  const warnings = [];
  const now = new Date().toISOString();
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const valorNum = typeof r.valor === 'string' ? Number(r.valor) : r.valor;
    const periodoNum = typeof r.periodo === 'string' ? Number(r.periodo) : r.periodo;
    if (r.valor === null || r.valor === undefined || r.valor === '') {
      warnings.push(`[${i}] ${r.indicador_nombre}: valor vacío, descartado`);
      continue;
    }
    if (typeof valorNum !== 'number' || Number.isNaN(valorNum) || !Number.isFinite(valorNum)) {
      warnings.push(`[${i}] ${r.indicador_nombre}: valor no numérico (${r.valor}), descartado`);
      continue;
    }
    if (!r.indicador_nombre || !r.categoria || !r.fuente || !r.region || !r.unidad) {
      warnings.push(`[${i}] ${r.indicador_nombre}: campos requeridos faltantes`);
      continue;
    }
    if (typeof periodoNum !== 'number' || periodoNum < 2000 || periodoNum > 2026) {
      warnings.push(`[${i}] ${r.indicador_nombre}: periodo inválido ${r.periodo}`);
      continue;
    }
    const range = UNIT_RANGES[r.unidad];
    if (range && (valorNum < range.min || valorNum > range.max)) {
      warnings.push(`[${i}] ${r.indicador_nombre}: valor ${valorNum} fuera de rango [${range.min},${range.max}] para "${r.unidad}"`);
      continue;
    }
    valid.push({
      indicador_nombre: r.indicador_nombre,
      categoria: r.categoria,
      valor: Number(valorNum.toFixed(2)),
      unidad: r.unidad,
      periodo: periodoNum,
      region: r.region,
      desglose: r.desglose ? JSON.stringify(r.desglose) : null,
      fuente: r.fuente,
      ultima_actualizacion: now,
      activo: true,
    });
  }
  return { valid, warnings };
}

/**
 * Upsert transaccional — usa onConflict si existe índice único,
 * si falla por falta de índice hace fallback a insert (con warning).
 * Nunca hace delete previo.
 */
export async function upsertRows(rows) {
  if (rows.length === 0) return { inserted: 0, error: null };

  // Intento con onConflict (requiere índice único en DB)
  const { error, count } = await supabase
    .from('indicadores')
    .upsert(rows, { onConflict: 'indicador_nombre,periodo,region,fuente', count: 'exact' });

  if (!error) {
    return { inserted: count ?? rows.length, error: null };
  }

  // Fallback si no hay índice único: insert-if-missing (pre-check por clave natural
  // completa), NO re-insertar a ciegas (eso duplicaba filas en la DB self-hosted).
  if (
    error.message?.includes('onConflict') ||
    error.code === '42P10' ||
    error.code === 'PGRST204'
  ) {
    console.warn('  ⚠️  Índice único no encontrado, usando insert-if-missing (sin re-insert de filas existentes)');
    try {
      const res = await insertIfMissing(rows, { apply: true });
      if (res.error) return { inserted: res.inserted, error: res.error };
      return { inserted: res.inserted, error: null };
    } catch (err) {
      return { inserted: 0, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  return { inserted: 0, error };
}

/**
 * Datos de desglose (JSONB): puede llegar como objeto o como string JSON
 * (PostgREST suele devolverlo como objeto, pero defensivamente se parsea).
 */
function desgloseKeyParts(desglose) {
  let d = desglose;
  if (typeof d === 'string') {
    try {
      d = JSON.parse(d);
    } catch {
      d = null;
    }
  }
  if (!d || typeof d !== 'object') return { mes: '', fuenteApi: '' };
  return { mes: d.mes ?? '', fuenteApi: d.fuente_api ?? d.fuenteApi ?? '' };
}

/**
 * Clave natural completa para idempotencia:
 * indicador_nombre|periodo|region|fuente|mes|fuente_api.
 * mes/fuente_api salen de desglose; series anuales tienen mes=null → ''.
 * El mismo indicador_nombre puede tener MUCHAS filas por año (varios meses
 * y/o varias series: desglose.mes y desglose.fuente_api difieren), por eso
 * la clave incluye esos dos componentes.
 */
export function buildNaturalKey(row) {
  const { mes, fuenteApi } = desgloseKeyParts(row.desglose);
  return [row.indicador_nombre, row.periodo, row.region, row.fuente, mes, fuenteApi].join('|');
}

/**
 * Claves naturales de filas existentes en un scope
 * (categoria + periodo + region + fuente), paginadas con .range().
 * PostgREST corta en 1000 por request y la tabla tiene ~22k filas,
 * por eso NUNCA se consulta sin range().
 */
export async function fetchExistingKeys({ categoria, periodo, region, fuente, page = 1000 } = {}) {
  const keys = new Set();
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from('indicadores')
      .select('indicador_nombre, periodo, region, fuente, desglose')
      .eq('categoria', categoria)
      .eq('periodo', periodo)
      .eq('region', region)
      .eq('fuente', fuente)
      .range(offset, offset + page - 1);
    if (error) throw new Error(`pre-check (${categoria}/${periodo}/${region}/${fuente}): ${error.message}`);
    if (!data || data.length === 0) break;
    for (const row of data) keys.add(buildNaturalKey(row));
    if (data.length < page) break;
    offset += page;
  }
  return keys;
}

/**
 * Separa filas nuevas entre ya existentes (por clave natural completa) y faltantes.
 */
export function filterMissing(rows, existingKeys) {
  const missing = [];
  const existing = [];
  for (const row of rows) {
    if (existingKeys.has(buildNaturalKey(row))) existing.push(row);
    else missing.push(row);
  }
  return { missing, existing };
}

/**
 * Insert-if-missing: por cada scope (categoria, periodo, region, fuente) hace
 * pre-check de lo ya existente, filtra por clave natural completa e inserta
 * solo lo faltante en lotes de como mucho `batchSize` (cap seguro por request).
 * Con apply=false NO escribe: devuelve el plan (missing/existing) para dry-run.
 */
export async function insertIfMissing(rows, { apply = true, batchSize = 500 } = {}) {
  if (rows.length === 0) return { missing: [], existing: 0, inserted: 0, error: null };

  // Agrupar por scope de pre-check para consultar una sola vez por scope.
  const byScope = new Map();
  for (const row of rows) {
    const scope = JSON.stringify([row.categoria, row.periodo, row.region, row.fuente]);
    if (!byScope.has(scope)) byScope.set(scope, []);
    byScope.get(scope).push(row);
  }

  const result = { missing: [], existing: 0, inserted: 0, error: null };
  for (const [scope, scopeRows] of byScope) {
    const [categoria, periodo, region, fuente] = JSON.parse(scope);
    const existingKeys = await fetchExistingKeys({ categoria, periodo, region, fuente });
    const { missing, existing } = filterMissing(scopeRows, existingKeys);
    result.existing += existing.length;
    result.missing.push(...missing);
  }

  if (!apply) return result;

  for (let i = 0; i < result.missing.length; i += batchSize) {
    const batch = result.missing.slice(i, i + batchSize);
    const { error } = await supabase.from('indicadores').insert(batch);
    if (error) return { ...result, inserted: result.inserted, error };
    result.inserted += batch.length;
  }
  return result;
}

export async function runEtl({ categoria, fetcher, dryRun = false }) {
  const start = Date.now();
  console.log('═══════════════════════════════════════════════════');
  console.log(`  ETL: ${categoria} ${dryRun ? '(dry-run)' : ''}`);
  console.log('═══════════════════════════════════════════════════');

  let rawRows;
  try {
    rawRows = await fetcher();
  } catch (err) {
    console.error(`❌ Fetch failed for ${categoria}: ${err.message}`);
    return { success: false, inserted: 0, warnings: [err.message] };
  }

  console.log(`📥 Fetched ${rawRows.length} raw rows`);

  const { valid, warnings } = validateRows(rawRows);
  if (warnings.length > 0) {
    warnings.forEach((w) => console.warn(`  ⚠️  ${w}`));
  }
  console.log(`✅ Validados ${valid.length}/${rawRows.length} rows, ${warnings.length} warnings`);

  if (dryRun) {
    console.log('🏜️  Dry-run, no se inserta');
    return { success: true, inserted: 0, warnings, valid };
  }

  if (valid.length === 0) {
    console.log('⚠️  Nada para insertar');
    return { success: true, inserted: 0, warnings };
  }

  const { inserted, error } = await upsertRows(valid);
  if (error) {
    console.error(`❌ Upsert failed: ${error.message}`);
    return { success: false, inserted, warnings, error };
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`✅ Upsert ${inserted} rows en ${elapsed}s`);
  console.log('═══════════════════════════════════════════════════');
  return { success: true, inserted, warnings };
}

// CLI
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('etl-runner.mjs')) {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, '').split('=');
      return [k, v ?? true];
    })
  );

  if (!args.categoria) {
    console.log('Uso: node scripts/etl-runner.mjs --categoria=canastas [--dry-run]');
    process.exit(1);
  }

  // Placeholder: los scripts de categoría deben exportar fetcher y ser importados aquí
  console.log(`Runner invocado para ${args.categoria} (dryRun=${!!args['dry-run']})`);
  console.log('Nota: integrar fetcher específico de cada categoría en este runner');
}
