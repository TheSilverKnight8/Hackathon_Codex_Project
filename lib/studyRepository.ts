import { assignments, courses, studyMaterials, studyPortals } from "@/data/mockData";
import { getClassroomAccessToken } from "@/lib/auth/tokenStore";
import { getSessionClassroomData, saveSessionClassroomData } from "@/lib/services/classroomCache";
import {
  clearSessionSelectedFiles,
  getSelectedFiles,
  removeSelectedFile,
  saveSelectedFiles
} from "@/lib/services/selectedFilesStore";
import { fetchClassroomCourses, fetchCourseAssignments } from "@/lib/services/googleClassroomService";
import {
  clearSessionExtractions,
  listExtractions,
  removeExtraction,
  upsertExtraction
} from "@/lib/services/fileExtractionStore";
import {
  clearSessionPortalGeneration,
  getPortalGenerationRecord,
  setPortalGenerationRecord
} from "@/lib/services/portalGenerationStore";
import {
  Assignment,
  Course,
  ExtractedFileContent,
  PortalGenerationRecord,
  StudyMaterial,
  StudyPortal
} from "@/types/study";

type CoursesWithAssignments = Course & { assignments: Assignment[] };

type CourseLoadResult = {
  source: "mock" | "classroom";
  courses: CoursesWithAssignments[];
  message?: string;
};

type PortalViewResult = {
  portal: StudyPortal;
  source: "generated" | "fallback";
  generationStatus: PortalGenerationRecord["status"];
  message?: string;
};

function getMockCoursesWithAssignments(): CoursesWithAssignments[] {
  return courses.map((course) => ({
    ...course,
    assignments: assignments.filter((assignment) => assignment.courseId === course.id)
  }));
}

function createGeneratedMaterials(assignment: Assignment): StudyMaterial[] {
  return [
    {
      id: `gm_${assignment.id}_1`,
      assignmentId: assignment.id,
      name: `${assignment.title} - Class Notes`,
      kind: "doc",
      sourceType: "google_drive_mock",
      dateSelected: new Date().toISOString()
    },
    {
      id: `gm_${assignment.id}_2`,
      assignmentId: assignment.id,
      name: `${assignment.title} - Reference Slides`,
      kind: "slides",
      sourceType: "google_drive_mock",
      dateSelected: new Date().toISOString()
    }
  ];
}

function createGeneratedPortal(assignment: Assignment): StudyPortal {
  return {
    id: `gp_${assignment.id}`,
    assignmentId: assignment.id,
    summary: `This study portal was generated from assignment metadata for ${assignment.title}.`,
    keyConcepts: ["Assignment requirements", "Due date planning", "Evidence collection"],
    actionPlan: [
      "Review assignment instructions and rubric details.",
      "List needed resources and draft key points.",
      "Create a completion timeline before the due date."
    ],
    studyChecklist: [
      "Understand the assignment objective.",
      "Prepare source material and notes.",
      "Draft and revise before submission."
    ],
    researchTopics: ["Context behind this course topic", "Examples of high-quality submissions"],
    sourcesUsed: [],
    generatedAt: new Date().toISOString(),
    usedFallback: true
  };
}

export const studyRepository = {
  async getCoursesWithAssignments(sessionId: string): Promise<CourseLoadResult> {
    const preferredSource = process.env.STUDY_DATA_SOURCE ?? "auto";

    if (preferredSource === "mock") {
      return {
        source: "mock",
        courses: getMockCoursesWithAssignments(),
        message: "Using mock study data (STUDY_DATA_SOURCE=mock)."
      };
    }

    const classroomToken = getClassroomAccessToken(sessionId);

    if (!classroomToken) {
      return {
        source: "mock",
        courses: getMockCoursesWithAssignments(),
        message: "Google Classroom token unavailable. Showing mock data."
      };
    }

    try {
      const classroomCourses = await fetchClassroomCourses(classroomToken);

      if (classroomCourses.length === 0) {
        saveSessionClassroomData(sessionId, { courses: [], assignments: [] });
        return {
          source: "classroom",
          courses: [],
          message: "No active Google Classroom courses were found for this account."
        };
      }

      const assignmentGroups = await Promise.all(
        classroomCourses.map(async (course) => ({
          assignments: await fetchCourseAssignments(classroomToken, course.id)
        }))
      );

      const classroomAssignments = assignmentGroups.flatMap((group) => group.assignments);
      const mappedCourses = classroomCourses.map((course) => ({
        ...course,
        assignments: classroomAssignments.filter((assignment) => assignment.courseId === course.id)
      }));

      saveSessionClassroomData(sessionId, {
        courses: classroomCourses,
        assignments: classroomAssignments
      });

      return {
        source: "classroom",
        courses: mappedCourses
      };
    } catch {
      return {
        source: "mock",
        courses: getMockCoursesWithAssignments(),
        message: "Google Classroom is unavailable right now. Showing mock data instead."
      };
    }
  },

  getAssignmentById(assignmentId: string, sessionId?: string) {
    const mockAssignment = assignments.find((assignment) => assignment.id === assignmentId);

    if (mockAssignment) {
      return mockAssignment;
    }

    if (!sessionId) {
      return null;
    }

    const classroomData = getSessionClassroomData(sessionId);
    return classroomData?.assignments.find((assignment) => assignment.id === assignmentId) ?? null;
  },

  getCourseById(courseId: string, sessionId?: string) {
    const mockCourse = courses.find((course) => course.id === courseId);

    if (mockCourse) {
      return mockCourse;
    }

    if (!sessionId) {
      return null;
    }

    const classroomData = getSessionClassroomData(sessionId);
    return classroomData?.courses.find((course) => course.id === courseId) ?? null;
  },

  getSelectedFilesForAssignment(assignmentId: string, sessionId?: string) {
    if (!sessionId) {
      return [];
    }

    return getSelectedFiles(sessionId, assignmentId);
  },

  saveSelectedFilesForAssignment(assignmentId: string, files: StudyMaterial[], sessionId?: string) {
    if (!sessionId) {
      return [];
    }

    saveSelectedFiles(sessionId, assignmentId, files);
    return getSelectedFiles(sessionId, assignmentId);
  },

  removeSelectedFileForAssignment(assignmentId: string, fileId: string, sessionId?: string) {
    if (!sessionId) {
      return [];
    }

    removeSelectedFile(sessionId, assignmentId, fileId);
    removeExtraction(sessionId, assignmentId, fileId);
    return getSelectedFiles(sessionId, assignmentId);
  },

  getExtractionsForAssignment(assignmentId: string, sessionId?: string) {
    if (!sessionId) {
      return [];
    }

    return listExtractions(sessionId, assignmentId);
  },

  upsertExtractionsForAssignment(assignmentId: string, extractions: ExtractedFileContent[], sessionId?: string) {
    if (!sessionId) {
      return [];
    }

    extractions.forEach((extraction) => {
      upsertExtraction(sessionId, assignmentId, extraction);
    });

    return listExtractions(sessionId, assignmentId);
  },

  getPortalGenerationRecordForAssignment(assignmentId: string, sessionId?: string) {
    if (!sessionId) {
      return null;
    }

    return getPortalGenerationRecord(sessionId, assignmentId);
  },

  setPortalGenerationRecordForAssignment(assignmentId: string, record: PortalGenerationRecord, sessionId?: string) {
    if (!sessionId) {
      return null;
    }

    setPortalGenerationRecord(sessionId, assignmentId, record);
    return getPortalGenerationRecord(sessionId, assignmentId);
  },

  getPortalViewForAssignment(assignmentId: string, sessionId?: string): PortalViewResult | null {
    const assignment = this.getAssignmentById(assignmentId, sessionId);

    if (!assignment) {
      return null;
    }

    const generatedRecord = this.getPortalGenerationRecordForAssignment(assignmentId, sessionId);

    if (generatedRecord?.portal && (generatedRecord.status === "generated" || generatedRecord.status === "fallback")) {
      return {
        portal: generatedRecord.portal,
        source: generatedRecord.status === "generated" ? "generated" : "fallback",
        generationStatus: generatedRecord.status,
        message: generatedRecord.errorMessage
      };
    }

    const mockPortal = studyPortals.find((portal) => portal.assignmentId === assignmentId) ?? createGeneratedPortal(assignment);

    return {
      portal: mockPortal,
      source: "fallback",
      generationStatus: generatedRecord?.status ?? "not_generated",
      message: generatedRecord?.errorMessage
    };
  },

  clearSessionSelectedFiles(sessionId: string) {
    clearSessionSelectedFiles(sessionId);
    clearSessionExtractions(sessionId);
    clearSessionPortalGeneration(sessionId);
  },

  getMaterialsForAssignment(assignmentId: string, sessionId?: string) {
    const selectedFiles = this.getSelectedFilesForAssignment(assignmentId, sessionId);

    if (selectedFiles.length > 0) {
      return selectedFiles;
    }

    const mockMaterials = studyMaterials.filter((material) => material.assignmentId === assignmentId);

    if (mockMaterials.length > 0) {
      return mockMaterials;
    }

    const assignment = this.getAssignmentById(assignmentId, sessionId);

    if (!assignment) {
      return [];
    }

    return createGeneratedMaterials(assignment);
  },

  getStudyPortalForAssignment(assignmentId: string, sessionId?: string) {
    return this.getPortalViewForAssignment(assignmentId, sessionId)?.portal ?? null;
  }
};
