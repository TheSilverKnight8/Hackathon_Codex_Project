import { CitationSourceChunk } from "@/types/study";

type SourceText = {
  fileId: string;
  fileName: string;
  text: string;
};

const MIN_CHUNK_SIZE = 400;
const TARGET_CHUNK_SIZE = 600;
const MAX_CHUNK_SIZE = 800;

function normalizeWhitespace(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function splitIntoSegments(text: string) {
  const segments = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((segment) => normalizeWhitespace(segment))
    .filter((segment) => segment.length > 0);

  if (segments.length > 0) {
    return segments;
  }

  const normalized = normalizeWhitespace(text);
  if (!normalized) {
    return [];
  }

  const fallback: string[] = [];
  for (let cursor = 0; cursor < normalized.length; cursor += TARGET_CHUNK_SIZE) {
    fallback.push(normalized.slice(cursor, cursor + TARGET_CHUNK_SIZE));
  }
  return fallback;
}

export function buildCitationChunks(sources: SourceText[]): CitationSourceChunk[] {
  const chunks: CitationSourceChunk[] = [];

  sources.forEach((source) => {
    const normalizedText = normalizeWhitespace(source.text);
    if (!normalizedText) {
      return;
    }

    const segments = splitIntoSegments(normalizedText);
    let chunkStart = 0;
    let chunkBuffer = "";

    const pushChunk = (chunkText: string) => {
      const trimmed = chunkText.trim();
      if (!trimmed) {
        return;
      }

      const startOffset = normalizedText.indexOf(trimmed, chunkStart);
      const start = startOffset >= 0 ? startOffset : chunkStart;
      const end = Math.min(start + trimmed.length, normalizedText.length);

      chunks.push({
        fileId: source.fileId,
        fileName: source.fileName,
        chunkText: trimmed,
        startOffset: start,
        endOffset: end
      });

      chunkStart = end;
    };

    segments.forEach((segment) => {
      const candidate = chunkBuffer ? `${chunkBuffer} ${segment}` : segment;

      if (candidate.length <= TARGET_CHUNK_SIZE) {
        chunkBuffer = candidate;
        return;
      }

      if (chunkBuffer.length >= MIN_CHUNK_SIZE) {
        pushChunk(chunkBuffer);
        chunkBuffer = segment;
        return;
      }

      if (candidate.length <= MAX_CHUNK_SIZE) {
        chunkBuffer = candidate;
        return;
      }

      if (chunkBuffer.length > 0) {
        pushChunk(chunkBuffer);
      }

      if (segment.length <= MAX_CHUNK_SIZE) {
        chunkBuffer = segment;
        return;
      }

      for (let cursor = 0; cursor < segment.length; cursor += TARGET_CHUNK_SIZE) {
        const piece = segment.slice(cursor, cursor + TARGET_CHUNK_SIZE);
        if (piece.length >= MIN_CHUNK_SIZE || cursor + TARGET_CHUNK_SIZE >= segment.length) {
          pushChunk(piece);
        } else {
          chunkBuffer = piece;
        }
      }
    });

    if (chunkBuffer.length > 0) {
      pushChunk(chunkBuffer);
    }
  });

  return chunks;
}
