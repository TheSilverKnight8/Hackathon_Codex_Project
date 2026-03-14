import { PortalGenerationRecord } from "@/types/study";

type SessionPortalMap = Map<string, PortalGenerationRecord>;

const portalStoreBySession = new Map<string, SessionPortalMap>();

function getSessionMap(sessionId: string) {
  let sessionMap = portalStoreBySession.get(sessionId);

  if (!sessionMap) {
    sessionMap = new Map();
    portalStoreBySession.set(sessionId, sessionMap);
  }

  return sessionMap;
}

export function getPortalGenerationRecord(sessionId: string, assignmentId: string) {
  const sessionMap = portalStoreBySession.get(sessionId);
  return sessionMap?.get(assignmentId) ?? null;
}

export function setPortalGenerationRecord(sessionId: string, assignmentId: string, record: PortalGenerationRecord) {
  const sessionMap = getSessionMap(sessionId);
  sessionMap.set(assignmentId, record);
}

export function clearSessionPortalGeneration(sessionId: string) {
  portalStoreBySession.delete(sessionId);
}
