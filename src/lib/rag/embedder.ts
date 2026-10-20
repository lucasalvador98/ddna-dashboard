/**
 * Embedder - Generate embeddings using an OpenAI-compatible API
 *
 * Model and endpoint are configurable via OPENAI_EMBEDDING_MODEL /
 * OPENAI_BASE_URL. Default: text-embedding-3-small (1536 dimensions).
 * Changing the model requires re-embedding every stored chunk.
 */

import {
  EMBEDDING_MODEL,
  EMBEDDING_TIMEOUT_MS,
  embeddingsUrl,
  OPENAI_API_KEY,
} from '@/lib/ai-config';

export interface EmbeddingResult {
  embedding: number[];
  tokens: number;
}

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch(embeddingsUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text.replace(/\n/g, " "), // Normalize whitespace
    }),
    signal: AbortSignal.timeout(EMBEDDING_TIMEOUT_MS),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts (batch)
 * OpenAI supports up to 2048 inputs per request
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const BATCH_SIZE = 100; // OpenAI recommends smaller batches
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE).map((t) => t.replace(/\n/g, " "));

    const response = await fetch(embeddingsUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: batch,
      }),
      signal: AbortSignal.timeout(EMBEDDING_TIMEOUT_MS),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json() as { data: Array<{ embedding: number[] }> };
    const embeddings = data.data.map((item) => item.embedding);
    allEmbeddings.push(...embeddings);
  }

  return allEmbeddings;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
