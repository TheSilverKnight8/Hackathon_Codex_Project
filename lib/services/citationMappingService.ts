import { CitationSourceChunk, PortalCitation, PortalItemCitation, StudyPortalCitations } from "@/types/study";
import { buildCitationChunks } from "@/lib/services/textChunkingService";

type SourceText = {
  fileId: string;
  fileName: string;
  text: string;
};

function tokenize(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
}

export function scoreChunkForItem(item: string, chunk: CitationSourceChunk) {
  const itemTokens = Array.from(new Set(tokenize(item)));
  if (itemTokens.length === 0) {
    return 0;
  }

  const chunkLower = chunk.chunkText.toLowerCase();
  const phrase = item.toLowerCase().trim();
  if (phrase.length > 0 && chunkLower.includes(phrase)) {
    return 1000 + phrase.length;
  }

  let overlap = 0;
  itemTokens.forEach((token) => {
    if (chunkLower.includes(token)) {
      overlap += 1;
    }
  });

  if (overlap === 0) {
    return 0;
  }

  const coverage = overlap / itemTokens.length;
  return coverage * 100 + overlap;
}

function findBestCitation(item: string, chunks: CitationSourceChunk[]): PortalCitation[] {
  let best:
    | {
        chunk: CitationSourceChunk;
        score: number;
      }
    | undefined;

  chunks.forEach((chunk) => {
    const score = scoreChunkForItem(item, chunk);
    if (score <= 0) {
      return;
    }

    if (!best || score > best.score) {
      best = { chunk, score };
    }
  });

  if (!best) {
    return [];
  }

  return [
    {
      fileId: best.chunk.fileId,
      fileName: best.chunk.fileName,
      supportingSnippet: best.chunk.chunkText,
      startOffset: best.chunk.startOffset,
      endOffset: best.chunk.endOffset
    }
  ];
}

function mapItems(items: string[], chunks: CitationSourceChunk[]): PortalItemCitation[] {
  return items.map((item) => ({
    item,
    citations: findBestCitation(item, chunks)
  }));
}

export function mapPortalCitations(params: {
  keyConcepts: string[];
  actionPlan: string[];
  studyChecklist: string[];
  researchTopics: string[];
  sources: SourceText[];
}): StudyPortalCitations {
  const chunks = buildCitationChunks(params.sources);

  return {
    keyConcepts: mapItems(params.keyConcepts, chunks),
    actionPlan: mapItems(params.actionPlan, chunks),
    studyChecklist: mapItems(params.studyChecklist, chunks),
    researchTopics: mapItems(params.researchTopics, chunks)
  };
}
