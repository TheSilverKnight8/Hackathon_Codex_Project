import { Assignment, Course, ExtractedFileContent, PortalSourceUsed, StudyPortal } from "@/types/study";

type NormalizedSource = {
  fileId: string;
  fileName: string;
  text: string;
};

const MAX_CHARS_PER_FILE = 3500;

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function normalizeExtractionInputs(extractions: ExtractedFileContent[]) {
  return extractions
    .filter((item) => item.extractionStatus === "extracted" && item.extractedText.trim().length > 0)
    .map((item) => {
      const cleaned = normalizeText(item.extractedText).slice(0, MAX_CHARS_PER_FILE);
      return {
        fileId: item.fileId,
        fileName: item.fileName,
        text: cleaned
      } satisfies NormalizedSource;
    })
    .filter((item) => item.text.length > 0);
}

function buildKeyConcepts(assignment: Assignment, normalizedSources: NormalizedSource[]) {
  const seedTerms = [assignment.title, ...normalizedSources.map((source) => source.fileName)];
  return seedTerms
    .flatMap((term) => term.split(/[^A-Za-z0-9]+/))
    .map((token) => token.trim())
    .filter((token) => token.length > 4)
    .slice(0, 6);
}

function buildSourcesUsed(normalizedSources: NormalizedSource[]): PortalSourceUsed[] {
  return normalizedSources.map((source) => ({
    fileId: source.fileId,
    fileName: source.fileName,
    charsUsed: source.text.length
  }));
}

export function generateStudyPortal(params: {
  assignment: Assignment;
  course: Course | null;
  extractions: ExtractedFileContent[];
}): { portal: StudyPortal | null; usedFallback: boolean; message?: string } {
  const normalizedSources = normalizeExtractionInputs(params.extractions);

  if (normalizedSources.length === 0) {
    return {
      portal: null,
      usedFallback: true,
      message: "No extracted text is available yet. Generate extraction first."
    };
  }

  const combinedExcerpt = normalizedSources.map((source) => source.text).join(" ").slice(0, 1200);
  const keyConcepts = buildKeyConcepts(params.assignment, normalizedSources);
  const dueDateText = params.assignment.dueDate || "No due date set";

  const portal: StudyPortal = {
    id: `generated_${params.assignment.id}`,
    assignmentId: params.assignment.id,
    summary:
      `This portal was generated from extracted assignment files for ${params.assignment.title}. ` +
      `Course: ${params.course?.title ?? "Unknown course"}. Due: ${dueDateText}. ` +
      combinedExcerpt.slice(0, 320),
    keyConcepts: keyConcepts.length > 0 ? keyConcepts : ["Main objective", "Supporting evidence", "Final deliverable"],
    actionPlan: [
      "Review extracted notes and highlight the core requirements.",
      "Map each requirement to evidence from selected files.",
      "Draft a response outline and check alignment with instructions."
    ],
    studyChecklist: [
      "I can explain the assignment goal in one sentence.",
      "I identified at least three supporting points from the extracted files.",
      "I prepared a final review pass before submitting."
    ],
    researchTopics: [
      `${params.assignment.title} background context`,
      `${params.course?.title ?? "Course topic"} example analyses`
    ],
    sourcesUsed: buildSourcesUsed(normalizedSources),
    generatedAt: new Date().toISOString(),
    usedFallback: false
  };

  return {
    portal,
    usedFallback: false
  };
}
