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
  kind: "doc" | "slides" | "pdf" | "sheet";
  source: "google_drive";
  selectedByUser: boolean;
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
