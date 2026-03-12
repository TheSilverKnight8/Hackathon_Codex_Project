import { PortalCitation, PortalItemCitation, StudyPortalCitations } from "@/types/study";

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
    .filter((token) => token.length >= 4);
}

function buildSnippet(text: string, index: number) {
  const start = Math.max(index - 90, 0);
  const end = Math.min(index + 140, text.length);
  return {
    snippet: text.slice(start, end).trim(),
    startOffset: start,
    endOffset: end
  };
}

function findBestCitation(item: string, sources: SourceText[]): PortalCitation[] {
  const itemLower = item.toLowerCase().trim();
  const itemTokens = Array.from(new Set(tokenize(item)));

  let bestMatch:
    | {
        source: SourceText;
        index: number;
        score: number;
      }
    | undefined;

  sources.forEach((source) => {
    const sourceLower = source.text.toLowerCase();

    const phraseIndex = sourceLower.indexOf(itemLower);
    if (phraseIndex >= 0) {
      const score = 1000 + itemLower.length;
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { source, index: phraseIndex, score };
      }
      return;
    }

    let overlap = 0;
    let firstIndex = -1;

    itemTokens.forEach((token) => {
      const idx = sourceLower.indexOf(token);
      if (idx >= 0) {
        overlap += 1;
        if (firstIndex < 0 || idx < firstIndex) {
          firstIndex = idx;
        }
      }
    });

    if (overlap === 0 || firstIndex < 0) {
      return;
    }

    const score = overlap * 100 - firstIndex;

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { source, index: firstIndex, score };
    }
  });

  if (!bestMatch) {
    return [];
  }

  const span = buildSnippet(bestMatch.source.text, bestMatch.index);

  return [
    {
      fileId: bestMatch.source.fileId,
      fileName: bestMatch.source.fileName,
      supportingSnippet: span.snippet,
      startOffset: span.startOffset,
      endOffset: span.endOffset
    }
  ];
}

function mapItems(items: string[], sources: SourceText[]): PortalItemCitation[] {
  return items.map((item) => ({
    item,
    citations: findBestCitation(item, sources)
  }));
}

export function mapPortalCitations(params: {
  keyConcepts: string[];
  actionPlan: string[];
  studyChecklist: string[];
  researchTopics: string[];
  sources: SourceText[];
}): StudyPortalCitations {
  return {
    keyConcepts: mapItems(params.keyConcepts, params.sources),
    actionPlan: mapItems(params.actionPlan, params.sources),
    studyChecklist: mapItems(params.studyChecklist, params.sources),
    researchTopics: mapItems(params.researchTopics, params.sources)
  };
}
