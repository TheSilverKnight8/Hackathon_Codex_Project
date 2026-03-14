import { Assignment, Course } from "@/types/study";

type SessionClassroomData = {
  courses: Course[];
  assignments: Assignment[];
};

const classroomDataBySession = new Map<string, SessionClassroomData>();

export function saveSessionClassroomData(sessionId: string, data: SessionClassroomData) {
  classroomDataBySession.set(sessionId, data);
}

export function getSessionClassroomData(sessionId: string) {
  return classroomDataBySession.get(sessionId) ?? null;
}

export function clearSessionClassroomData(sessionId: string) {
  classroomDataBySession.delete(sessionId);
}
