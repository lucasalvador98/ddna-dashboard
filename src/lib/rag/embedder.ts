/**
 * Embedder - Generate embeddings using OpenAI API
 * 
 * Uses text-embedding-3-small (1536 dimensions)
 * Cost: $0.02 per 1M tokens (very economical)
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const EMBEDDING_MODEL = "text-embedding-3-small";

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

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text.replace(/\n/g, " "), // Normalize whitespace
    }),
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

    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: batch,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const embeddings = data.data.map((item: any) => item.embedding);
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
