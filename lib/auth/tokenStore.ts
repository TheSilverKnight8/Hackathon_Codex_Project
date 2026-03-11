type TokenRecord = {
  accessToken: string;
  expiresAt: number;
};

const classroomTokenStore = new Map<string, TokenRecord>();

export function saveClassroomAccessToken(sessionId: string, accessToken: string, expiresInSeconds: number) {
  classroomTokenStore.set(sessionId, {
    accessToken,
    expiresAt: Date.now() + Math.max(expiresInSeconds, 60) * 1000
  });
}

export function getClassroomAccessToken(sessionId: string) {
  const record = classroomTokenStore.get(sessionId);

  if (!record) {
    return null;
  }

  if (Date.now() >= record.expiresAt) {
    classroomTokenStore.delete(sessionId);
    return null;
  }

  return record.accessToken;
}

export function clearClassroomAccessToken(sessionId: string) {
  classroomTokenStore.delete(sessionId);
}
