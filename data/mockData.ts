import { Assignment, Course, StudyMaterial, StudyPortal } from "@/types/study";

export const courses: Course[] = [
  { id: "c1", title: "AP Biology", teacherName: "Ms. Rivera", term: "Spring 2026" },
  { id: "c2", title: "US History", teacherName: "Mr. Patel", term: "Spring 2026" }
];

export const assignments: Assignment[] = [
  {
    id: "a1",
    courseId: "c1",
    title: "Cellular Respiration Lab Reflection",
    instructions:
      "Write a 2-page reflection connecting lab observations to aerobic and anaerobic respiration pathways.",
    dueDate: "2026-03-19",
    estimatedMinutes: 90,
    status: "due_soon"
  },
  {
    id: "a2",
    courseId: "c2",
    title: "Progressive Era Primary Source Analysis",
    instructions:
      "Compare two primary sources from the Progressive Era and explain how each reflects social reform goals.",
    dueDate: "2026-03-24",
    estimatedMinutes: 70,
    status: "in_progress"
  }
];

export const studyMaterials: StudyMaterial[] = [
  {
    id: "m1",
    assignmentId: "a1",
    name: "Lab Notes - Yeast Respiration",
    kind: "doc",
    source: "google_drive",
    selectedByUser: false
  },
  {
    id: "m2",
    assignmentId: "a1",
    name: "Chapter 7 Metabolism Slides",
    kind: "slides",
    source: "google_drive",
    selectedByUser: false
  },
  {
    id: "m3",
    assignmentId: "a1",
    name: "Cell Energy Review Sheet",
    kind: "sheet",
    source: "google_drive",
    selectedByUser: false
  },
  {
    id: "m4",
    assignmentId: "a2",
    name: "Muckraker Articles Packet",
    kind: "pdf",
    source: "google_drive",
    selectedByUser: false
  },
  {
    id: "m5",
    assignmentId: "a2",
    name: "Lecture Notes - Urban Reform",
    kind: "doc",
    source: "google_drive",
    selectedByUser: false
  }
];

export const studyPortals: StudyPortal[] = [
  {
    id: "p1",
    assignmentId: "a1",
    summary:
      "Your reflection should explain how glucose breakdown differs when oxygen is present versus absent, and tie it to your yeast observations.",
    keyConcepts: ["Glycolysis", "Electron transport chain", "Fermentation", "ATP yield"],
    actionPlan: [
      "Review lab data and identify 2 clear findings.",
      "Map findings to aerobic vs anaerobic pathways.",
      "Draft reflection paragraphs with claim-evidence-reasoning."
    ],
    studyChecklist: [
      "Define aerobic respiration in your own words.",
      "Explain why ATP output changes without oxygen.",
      "Connect one lab result to fermentation."
    ],
    researchTopics: [
      "How athletes train around lactic acid buildup",
      "Industrial uses of yeast fermentation"
    ]
  },
  {
    id: "p2",
    assignmentId: "a2",
    summary:
      "Focus your analysis on how each source frames government responsibility in social reform during industrialization.",
    keyConcepts: ["Muckraking journalism", "Regulation", "Labor reform", "Civic activism"],
    actionPlan: [
      "Choose one source focused on labor and one on public health.",
      "Annotate author perspective and audience.",
      "Write a comparison paragraph around reform strategy."
    ],
    studyChecklist: [
      "Cite evidence from both sources.",
      "Explain at least one historical context detail.",
      "Conclude with a claim about reform impact."
    ],
    researchTopics: ["Ida Tarbell and corporate accountability", "How city sanitation laws evolved"]
  }
];
