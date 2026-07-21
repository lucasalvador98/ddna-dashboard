/**
 * Chunker - Split text into overlapping chunks
 * Strategy: paragraph → sentence → character-based splitting
 */

export interface Chunk {
  index: number;
  content: string;
  metadata: {
    startChar: number;
    endChar: number;
    tokenEstimate: number;
  };
}

export interface ChunkerOptions {
  chunkSize?: number;      // Target chunk size in characters (default: 2000)
  overlap?: number;        // Overlap between chunks (default: 200)
  minChunkSize?: number;   // Minimum chunk size (default: 100)
}

const DEFAULT_OPTIONS: Required<ChunkerOptions> = {
  chunkSize: 2000,
  overlap: 200,
  minChunkSize: 100,
};

/**
 * Split text into chunks with overlap
 */
export function chunkText(text: string, options?: ChunkerOptions): Chunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const chunks: Chunk[] = [];

  if (!text || text.trim().length === 0) {
    return chunks;
  }

  // Normalize whitespace
  const normalized = text.replace(/\s+/g, " ").trim();

  // Try paragraph-based splitting first
  const paragraphs = splitByParagraphs(normalized);

  let chunkIndex = 0;
  let currentChunk = "";
  let currentStart = 0;

  for (const paragraph of paragraphs) {
    // If single paragraph exceeds chunk size, split it further
    if (paragraph.length > opts.chunkSize) {
      // If we have accumulated content, save it first
      if (currentChunk.length > 0) {
        chunks.push(createChunk(chunkIndex++, currentChunk.trim(), currentStart, currentStart + currentChunk.length));
        currentChunk = "";
      }

      // Split large paragraph
      const subChunks = splitLargeText(paragraph, opts.chunkSize, opts.overlap);
      for (const subChunk of subChunks) {
        chunks.push(createChunk(chunkIndex++, subChunk.content, subChunk.start, subChunk.end));
      }
    } else {
      // Check if adding this paragraph would exceed chunk size
      if (currentChunk.length + paragraph.length + 1 > opts.chunkSize && currentChunk.length >= opts.minChunkSize) {
        // Save current chunk
        chunks.push(createChunk(chunkIndex++, currentChunk.trim(), currentStart, currentStart + currentChunk.length));
        
        // Start new chunk with overlap
        const overlapText = getOverlap(currentChunk, opts.overlap);
        currentChunk = overlapText + paragraph;
        currentStart = currentStart + currentChunk.length - overlapText.length;
      } else {
        // Add to current chunk
        if (currentChunk.length > 0) {
          currentChunk += " " + paragraph;
        } else {
          currentChunk = paragraph;
          currentStart = currentStart + currentChunk.length - paragraph.length;
        }
      }
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim().length >= opts.minChunkSize) {
    chunks.push(createChunk(chunkIndex, currentChunk.trim(), currentStart, currentStart + currentChunk.length));
  }

  return chunks;
}

/**
 * Split text by paragraphs
 */
function splitByParagraphs(text: string): string[] {
  // Split by double newline or single newline followed by empty lines
  const paragraphs = text.split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  if (paragraphs.length === 0) {
    return [text];
  }

  return paragraphs;
}

/**
 * Split large text into smaller chunks
 */
function splitLargeText(text: string, chunkSize: number, overlap: number): { content: string; start: number; end: number }[] {
  const chunks: { content: string; start: number; end: number }[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const content = text.slice(start, end);
    
    chunks.push({ content, start, end });
    
    // Move start with overlap
    start += chunkSize - overlap;
    if (start >= text.length) break;
    
    index++;
  }

  return chunks;
}

/**
 * Get overlap text from the end of a chunk
 */
function getOverlap(text: string, overlapSize: number): string {
  if (text.length <= overlapSize) {
    return text;
  }

  // Try to break at sentence boundary
  const overlap = text.slice(text.length - overlapSize);
  const sentenceMatch = overlap.match(/[.!?]\s+(.+)$/);
  
  if (sentenceMatch) {
    return sentenceMatch[1];
  }

  return overlap;
}

/**
 * Create a chunk object
 */
function createChunk(index: number, content: string, start: number, end: number): Chunk {
  return {
    index,
    content,
    metadata: {
      startChar: start,
      endChar: end,
      tokenEstimate: Math.ceil(content.split(/\s+/).length * 1.3), // Rough estimate
    },
  };
}

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokens(text: string): number {
  // ~1.3 tokens per word for English/Spanish
  return Math.ceil(text.split(/\s+/).filter(w => w.length > 0).length * 1.3);
}
