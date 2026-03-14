import { StudyMaterial } from "@/types/study";

type AssignmentSelectedFiles = Map<string, StudyMaterial[]>;

const selectedFilesBySession = new Map<string, AssignmentSelectedFiles>();

function getAssignmentMap(sessionId: string) {
  let assignmentMap = selectedFilesBySession.get(sessionId);

  if (!assignmentMap) {
    assignmentMap = new Map<string, StudyMaterial[]>();
    selectedFilesBySession.set(sessionId, assignmentMap);
  }

  return assignmentMap;
}

export function getSelectedFiles(sessionId: string, assignmentId: string) {
  const assignmentMap = selectedFilesBySession.get(sessionId);
  return assignmentMap?.get(assignmentId) ?? [];
}

export function saveSelectedFiles(sessionId: string, assignmentId: string, files: StudyMaterial[]) {
  const assignmentMap = getAssignmentMap(sessionId);
  const existing = assignmentMap.get(assignmentId) ?? [];
  const nextById = new Map(existing.map((file) => [file.id, file]));

  files.forEach((file) => {
    nextById.set(file.id, file);
  });

  assignmentMap.set(assignmentId, Array.from(nextById.values()));
}

export function removeSelectedFile(sessionId: string, assignmentId: string, fileId: string) {
  const assignmentMap = selectedFilesBySession.get(sessionId);

  if (!assignmentMap) {
    return;
  }

  const current = assignmentMap.get(assignmentId) ?? [];
  assignmentMap.set(
    assignmentId,
    current.filter((file) => file.id !== fileId)
  );
}

export function clearSessionSelectedFiles(sessionId: string) {
  selectedFilesBySession.delete(sessionId);
}
