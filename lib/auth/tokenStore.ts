type TokenRecord = {
  accessToken: string;
  expiresAt: number;
};

const classroomTokenStore = new Map<string, TokenRecord>();
const driveTokenStore = new Map<string, TokenRecord>();

function saveToken(store: Map<string, TokenRecord>, sessionId: string, accessToken: string, expiresInSeconds: number) {
  store.set(sessionId, {
    accessToken,
    expiresAt: Date.now() + Math.max(expiresInSeconds, 60) * 1000
  });
}

function getToken(store: Map<string, TokenRecord>, sessionId: string) {
  const record = store.get(sessionId);

  if (!record) {
    return null;
  }

  if (Date.now() >= record.expiresAt) {
    store.delete(sessionId);
    return null;
  }

  return record.accessToken;
}

export function saveClassroomAccessToken(sessionId: string, accessToken: string, expiresInSeconds: number) {
  saveToken(classroomTokenStore, sessionId, accessToken, expiresInSeconds);
}

export function getClassroomAccessToken(sessionId: string) {
  return getToken(classroomTokenStore, sessionId);
}

export function clearClassroomAccessToken(sessionId: string) {
  classroomTokenStore.delete(sessionId);
}

export function saveDriveAccessToken(sessionId: string, accessToken: string, expiresInSeconds: number) {
  saveToken(driveTokenStore, sessionId, accessToken, expiresInSeconds);
}

export function getDriveAccessToken(sessionId: string) {
  return getToken(driveTokenStore, sessionId);
}

export function clearDriveAccessToken(sessionId: string) {
  driveTokenStore.delete(sessionId);
}
