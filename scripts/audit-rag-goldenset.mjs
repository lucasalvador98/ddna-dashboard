/**
 * Conjunto dorado + medición del agente RAG (read-only, sin LLM).
 *
 * Mide la capa de recuperación, que es donde está la enfermedad:
 *   - ¿El agente recupera el contenido correcto para cada pregunta?
 *   - ¿Cuánto de lo recuperado ve realmente el modelo, con el recorte
 *     actual de 800 caracteres por fragmento?
 *
 * No llama al LLM: determina si el dato esperado está o no en el contexto
 * que se le pasaría al modelo. Eso es objetivo, repetible y barato.
 *
 * Uso: node scripts/audit-rag-goldenset.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── Conjunto dorado ────────────────────────────────────────────────────────
// Cada caso: pregunta realista, el dato que debería aparecer, y de qué fuente
// sale. `tipo` decide cómo se mide.
const GOLDEN = [
  // --- Indicadores: el material fuerte -------------------------------------
  {
    id: 'ind-1',
    tipo: 'indicador',
    pregunta: '¿Cuántos niños, niñas y adolescentes hay en Córdoba según el Censo 2022?',
    indicador: 'Población — NNyA (0 a 17)',
    esperado: { contiene: '977486', nota: 'NNyA sobre 3.812.064 total (25,6%)' },
  },
  {
    id: 'ind-2',
    tipo: 'indicador',
    pregunta: '¿A cuánto llegó la tasa de pobreza en Córdoba?',
    indicador: 'Pobreza monetaria (personas)',
    esperado: { cualquierValor: true, nota: 'Serie EPH-INDEC' },
  },
  {
    id: 'ind-3',
    tipo: 'indicador',
    pregunta: '¿Cuántos nacimientos hubo en Córdoba en 2024?',
    indicador: 'Nacimientos',
    esperado: { cualquierValor: true, nota: 'DEIS 2024' },
  },
  {
    id: 'ind-4',
    tipo: 'indicador',
    pregunta: '¿Cuál es la tasa de fecundidad adolescente en Córdoba?',
    indicador: 'Tasa fecundidad adolescente',
    esperado: { cualquierValor: true, nota: 'DEIS 2013-2024' },
  },
  {
    id: 'ind-5',
    tipo: 'indicador',
    pregunta: '¿Qué cobertura de vacunación tuvo la BCG en Córdoba?',
    indicador: 'BCG',
    esperado: { cualquierValor: true, nota: 'CNV 2024-2025' },
  },
  // --- Documentos: la parte frágil ------------------------------------------
  {
    id: 'doc-1',
    tipo: 'documento',
    pregunta: '¿Qué dice el informe sobre la inversión social en infancia en Córdoba para el presupuesto 2024?',
    archivo: 'Inversion_Social_Infancias-y-Adolescencias_Cordoba',
    esperado: { contiene: 'inversión', nota: 'Debe citar el informe de inversión' },
  },
  {
    id: 'doc-2',
    tipo: 'documento',
    pregunta: '¿Qué resultados tuvo la encuesta de consumos en adolescentes?',
    archivo: 'ConsumosAdolescentes',
    esperado: { cualquierValor: true, nota: 'Informe de consumos' },
  },
  {
    id: 'doc-3',
    tipo: 'documento',
    pregunta: '¿Qué mostró la encuesta de bienestar subjetivo a NNyA?',
    archivo: 'Miremos-nuestras-emociones',
    esperado: { cualquierValor: true, nota: 'Encuesta de bienestar subjetivo' },
  },
  {
    id: 'doc-4',
    tipo: 'documento',
    pregunta: '¿Cómo percibieron los adultos a NNyA durante la pandemia?',
    archivo: 'Encuesta_Covid-19_Percepciones',
    esperado: { cualquierValor: true, nota: 'Encuesta covid' },
  },
  {
    id: 'doc-5',
    tipo: 'documento',
    pregunta: '¿Qué dice el análisis situacional?',
    archivo: 'Analisis-situacional',
    esperado: { cualquierValor: true, nota: 'Análisis situacional' },
  },
];

// ─── Búsqueda documental ────────────────────────────────────────────────────
// Camino de texto (FTS + ILIKE), que es uno de los dos del híbrido del agente.
// No usa embedding: mide si los términos de la pregunta alcanzan para llegar al
// documento correcto, y cuánto del texto recuperado sobrevive al recorte.
async function searchDocs(pregunta) {
  const keywords = pregunta
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter(w => w.length > 3);

  const sel =
    'repo_file_id, chunk_index, content, metadata, repositorio!inner(nombre_archivo, categoria)';

  // Réplica EXACTA del FTS del agente (src/app/api/repositorio/chat/route.ts:356-366):
  // columna search_vector (tsvector), sintaxis websearch, términos con OR, config español.
  const { data: fts, error: ftsErr } = await supabase
    .from('doc_chunks')
    .select(sel)
    .textSearch('search_vector', keywords.join(' OR '), { config: 'spanish', type: 'websearch' })
    .limit(20);

  let rows = [];
  let via = '';
  if (!ftsErr && fts?.length) {
    rows = fts;
    via = 'FTS';
  } else if (ftsErr) {
    console.error('  [FTS error]', ftsErr.message.slice(0, 140));
  }

  if (rows.length === 0) {
    // Fallback ILIKE, igual que hace el agente cuando FTS no rinde.
    const { data: ilike, error: ilikeErr } = await supabase
      .from('doc_chunks')
      .select(sel)
      .ilike('content', `%${keywords[0] || consultaSegura(pregunta)}%`)
      .limit(20);
    if (!ilikeErr) rows = ilike || [];
    via = 'ILIKE';
  }

  const scored = rows.map(c => {
    const text = (c.content || '').toLowerCase();
    const hits = keywords.filter(k => text.includes(k)).length;
    const file = c.repositorio?.nombre_archivo || c.nombre_archivo || '';
    return { ...c, nombre_archivo: file, ftsRank: keywords.length ? hits / keywords.length : 0 };
  });
  return scored.sort((a, b) => b.ftsRank - a.ftsRank).slice(0, 20);
}

function consultaSegura(s) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).find(w => w.length > 3) || 'informe';
}

// ─── Búsqueda de indicadores: réplica de getIndicatorTimeSeries ──────────────
async function searchIndicators(nombre) {
  const { data, error } = await supabase
    .from('indicadores')
    .select('indicador_nombre, valor, periodo, unidad, region')
    .ilike('indicador_nombre', `%${nombre}%`)
    .order('periodo', { ascending: false })
    .limit(25);
  if (error) throw new Error('indicadores: ' + error.message);
  return data || [];
}

// ─── Búsqueda de indicadores: réplica de getIndicatorTimeSeries ──────────────
async function searchIndicadores(nombre) {
  const { data, error } = await supabase
    .from('indicadores')
    .select('indicador_nombre, valor, periodo, unidad, region')
    .ilike('indicador_nombre', `%${nombre}%`)
    .order('periodo', { ascending: false })
    .limit(25);
  if (error) throw new Error('indicadores: ' + error.message);
  return data || [];
}

// ─── Medición ───────────────────────────────────────────────────────────────
const CHARS_VISTOS = 800; // recorte actual de buildContext

const resultados = [];
for (const g of GOLDEN) {
  if (g.tipo === 'indicador') {
    const filas = await searchIndicadores(g.indicador);
    const valores = filas.map(f => `${f.valor}`);
    const ok =
      g.esperado.cualquierValor
        ? filas.length > 0
        : g.esperado.contiene
          ? valores.some(v => v.includes(g.esperado.contiene))
          : false;
    resultados.push({
      id: g.id,
      tipo: 'indicador',
      pregunta: g.pregunta,
      encontrado: ok,
      detalle: ok
        ? `${filas.length} filas; ej. "${filas[0]?.indicador_nombre}" = ${filas[0]?.valor} ${filas[0]?.unidad || ''} (${filas[0]?.periodo})`
        : `sin resultados para "${g.indicador}"`,
    });
  } else {
    const chunks = await searchDocs(g.pregunta);
    const archivoOK = chunks.some(c =>
      (c.nombre_archivo || '').toLowerCase().includes(g.archivo.toLowerCase())
    );
    const totalChars = chunks.reduce((s, c) => s + (c.content || '').length, 0);
    const vistos = chunks.reduce(
      (s, c) => s + Math.min((c.content || '').length, CHARS_VISTOS),
      0
    );
    const recortados = chunks.filter(c => (c.content || '').length > CHARS_VISTOS).length;
    resultados.push({
      id: g.id,
      tipo: 'documento',
      pregunta: g.pregunta,
      encontrado: archivoOK,
      detalle: archivoOK
        ? `archivo en top-${chunks.length}; ${vistos}/${totalChars} chars visibles (${((vistos / Math.max(totalChars, 1)) * 100).toFixed(0)}%); ${recortados}/${chunks.length} fragmentos recortados`
        : `archivo NO recuperado entre ${chunks.length} fragmentos`,
    });
  }
}

// ─── Reporte ────────────────────────────────────────────────────────────────
console.log('\n════ CONJUNTO DORADO — estado de la recuperación ════\n');
let okCount = 0;
for (const r of resultados) {
  const mark = r.encontrado ? '✅' : '❌';
  if (r.encontrado) okCount++;
  console.log(`${mark} [${r.tipo}] ${r.id}: ${r.pregunta}`);
  console.log(`      ${r.detalle}\n`);
}

const docs = resultados.filter(r => r.tipo === 'documento');
const docsOk = docs.filter(r => r.encontrado).length;
console.log('─'.repeat(64));
console.log(
  `Indicadores: ${resultados.filter(r => r.tipo === 'indicador' && r.encontrado).length}/${resultados.filter(r => r.tipo === 'indicador').length}`
);
console.log(`Documentos:  ${docsOk}/${docs.length}`);
console.log(
  `TOTAL: ${okCount}/${resultados.length} (${((okCount / resultados.length) * 100).toFixed(0)}%)`
);
if (docs.length) {
  const pcts = docs
    .filter(r => r.detalle.includes('chars visibles'))
    .map(r => parseInt(r.detalle.match(/\((\d+)%\)/)?.[1] || '0', 10));
  if (pcts.length) {
    const prom = pcts.reduce((a, b) => a + b, 0) / pcts.length;
    console.log(
      `\nDel contexto documental recuperado, el modelo ve en promedio el ${prom.toFixed(0)}% de los caracteres.`
    );
  }
}
console.log(
  '\nNota: medido sin embedding (piso). Con embedding activo la recuperación\nmejora, pero el recorte de 800 chars por fragmento no cambia.\n'
);
