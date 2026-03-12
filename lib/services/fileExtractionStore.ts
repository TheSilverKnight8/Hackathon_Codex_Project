import { ExtractedFileContent } from "@/types/study";

type AssignmentExtractionMap = Map<string, Map<string, ExtractedFileContent>>;

const extractionStoreBySession = new Map<string, AssignmentExtractionMap>();

function getAssignmentMap(sessionId: string) {
  let assignmentMap = extractionStoreBySession.get(sessionId);

  if (!assignmentMap) {
    assignmentMap = new Map();
    extractionStoreBySession.set(sessionId, assignmentMap);
  }

  return assignmentMap;
}

function getFileMap(sessionId: string, assignmentId: string) {
  const assignmentMap = getAssignmentMap(sessionId);
  let fileMap = assignmentMap.get(assignmentId);

  if (!fileMap) {
    fileMap = new Map();
    assignmentMap.set(assignmentId, fileMap);
  }

  return fileMap;
}

export function listExtractions(sessionId: string, assignmentId: string) {
  const assignmentMap = extractionStoreBySession.get(sessionId);
  const fileMap = assignmentMap?.get(assignmentId);
  return fileMap ? Array.from(fileMap.values()) : [];
}

export function upsertExtraction(sessionId: string, assignmentId: string, extraction: ExtractedFileContent) {
  const fileMap = getFileMap(sessionId, assignmentId);
  fileMap.set(extraction.fileId, extraction);
}

export function removeExtraction(sessionId: string, assignmentId: string, fileId: string) {
  const assignmentMap = extractionStoreBySession.get(sessionId);
  const fileMap = assignmentMap?.get(assignmentId);
  fileMap?.delete(fileId);
}

export function clearSessionExtractions(sessionId: string) {
  extractionStoreBySession.delete(sessionId);
}
