import { assignments, courses, studyMaterials, studyPortals } from "@/data/mockData";

export const studyRepository = {
  getCoursesWithAssignments() {
    return courses.map((course) => ({
      ...course,
      assignments: assignments.filter((assignment) => assignment.courseId === course.id)
    }));
  },

  getAssignmentById(assignmentId: string) {
    return assignments.find((assignment) => assignment.id === assignmentId) ?? null;
  },

  getCourseById(courseId: string) {
    return courses.find((course) => course.id === courseId) ?? null;
  },

  getMaterialsForAssignment(assignmentId: string) {
    return studyMaterials.filter((material) => material.assignmentId === assignmentId);
  },

  getStudyPortalForAssignment(assignmentId: string) {
    return studyPortals.find((portal) => portal.assignmentId === assignmentId) ?? null;
  }
};
