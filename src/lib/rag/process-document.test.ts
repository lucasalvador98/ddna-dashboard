import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockChunkText,
  mockGenerateEmbeddingsBatch,
  mockExtractTextFromPDF,
  mockExtractTextFromDOCX,
  mockExtractTextFromXLSX,
} = vi.hoisted(() => ({
  mockChunkText: vi.fn(),
  mockGenerateEmbeddingsBatch: vi.fn(),
  mockExtractTextFromPDF: vi.fn(),
  mockExtractTextFromDOCX: vi.fn(),
  mockExtractTextFromXLSX: vi.fn(),
}));

vi.mock('./chunker', () => ({ chunkText: mockChunkText }));
vi.mock('./embedder', () => ({ generateEmbeddingsBatch: mockGenerateEmbeddingsBatch }));
vi.mock('./extractors/pdf', () => ({ extractTextFromPDF: mockExtractTextFromPDF }));
vi.mock('./extractors/docx', () => ({ extractTextFromDOCX: mockExtractTextFromDOCX }));
vi.mock('./extractors/xlsx', () => ({ extractTextFromXLSX: mockExtractTextFromXLSX }));

const FILE_ID = 'file-1';

const FILE_ROW = {
  id: FILE_ID,
  nombre_archivo: 'informe.pdf',
  tipo_documento: 'pdf',
  url_storage:
    'https://test.supabase.co/storage/v1/object/public/ddna-repositorio/informes/1-informe.pdf',
  processed: false,
  categoria: 'salud',
};

const CHUNKS = [
  {
    index: 0,
    content: 'primer fragmento',
    metadata: { startChar: 0, endChar: 16, tokenEstimate: 3 },
  },
  {
    index: 1,
    content: 'segundo fragmento',
    metadata: { startChar: 16, endChar: 33, tokenEstimate: 3 },
  },
];

interface Captured {
  insertedRows: Array<Record<string, unknown>>;
  updates: Array<Record<string, unknown>>;
}

function createSupabaseMock(captured: Captured) {
  return {
    from(table: string) {
      if (table === 'repositorio') {
        return {
          select: () => ({
            eq: () => ({ single: async () => ({ data: FILE_ROW, error: null }) }),
          }),
          update: (values: Record<string, unknown>) => ({
            eq: async () => {
              captured.updates.push(values);
              return { error: null };
            },
          }),
        };
      }
      return {
        insert: async (rows: Array<Record<string, unknown>>) => {
          captured.insertedRows.push(...rows);
          return { error: null };
        },
      };
    },
    storage: {
      from: () => ({
        download: async () => ({
          data: { arrayBuffer: async () => new ArrayBuffer(8) },
          error: null,
        }),
      }),
    },
  };
}

type ProcessDocument = typeof import('./process-document').processDocument;
type SupabaseParam = Parameters<ProcessDocument>[0];

async function loadProcessDocument(embeddingKey = ''): Promise<ProcessDocument> {
  // ai-config reads the key at module load, so each policy needs a fresh module.
  vi.stubEnv('OPENAI_EMBEDDING_API_KEY', embeddingKey);
  vi.stubEnv('OPENAI_API_KEY', '');
  vi.resetModules();
  return (await import('./process-document')).processDocument;
}

describe('processDocument embedding policy', () => {
  let captured: Captured;

  beforeEach(() => {
    captured = { insertedRows: [], updates: [] };
    mockChunkText.mockReset().mockReturnValue(CHUNKS);
    mockGenerateEmbeddingsBatch.mockReset();
    mockExtractTextFromPDF.mockReset().mockResolvedValue({
      text: 'texto extraido suficientemente largo',
      pages: 1,
      metadata: { pageCount: 1 },
    });
    mockExtractTextFromDOCX.mockReset();
    mockExtractTextFromXLSX.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not mark the document processed when an embedding is null and the key is configured', async () => {
    const processDocument = await loadProcessDocument('sk-test-key');
    mockGenerateEmbeddingsBatch.mockResolvedValue([[0.1, 0.2], null]);

    const result = await processDocument(
      createSupabaseMock(captured) as unknown as SupabaseParam,
      FILE_ID
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Embedding generation incomplete');
    expect(captured.insertedRows).toHaveLength(0);
    expect(captured.updates).toHaveLength(0);
  });

  it('stores chunks without embeddings and marks processed when no key is configured', async () => {
    const processDocument = await loadProcessDocument();

    const result = await processDocument(
      createSupabaseMock(captured) as unknown as SupabaseParam,
      FILE_ID
    );

    expect(result.success).toBe(true);
    expect(mockGenerateEmbeddingsBatch).not.toHaveBeenCalled();
    expect(captured.insertedRows).toHaveLength(2);
    expect(captured.insertedRows.every(row => row.embedding === null)).toBe(true);
    expect(captured.updates).toHaveLength(1);
    expect(captured.updates[0].processed).toBe(true);
  });
});
