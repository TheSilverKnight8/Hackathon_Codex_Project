export type Course = {
  id: string;
  title: string;
  teacherName: string;
  term: string;
};

export type AssignmentStatus = "upcoming" | "in_progress" | "due_soon";

export type Assignment = {
  id: string;
  courseId: string;
  title: string;
  instructions: string;
  dueDate: string;
  estimatedMinutes: number;
  status: AssignmentStatus;
};

export type StudyMaterial = {
  id: string;
  assignmentId: string;
  name: string;
  sourceType: "google_drive_picker" | "google_drive_mock";
  dateSelected: string;
  mimeType?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  kind?: "doc" | "slides" | "pdf" | "sheet";
};

export type ExtractionStatus = "not_extracted" | "extracting" | "extracted" | "failed";

export type ExtractedFileContent = {
  assignmentId: string;
  fileId: string;
  fileName: string;
  extractionStatus: ExtractionStatus;
  extractedText: string;
  extractedAt?: string;
  errorMessage?: string;
};

export type StudyPortal = {
  id: string;
  assignmentId: string;
  summary: string;
  keyConcepts: string[];
  actionPlan: string[];
  studyChecklist: string[];
  researchTopics: string[];
};
