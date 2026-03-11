import { NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/auth/session";
import { clearClassroomAccessToken } from "@/lib/auth/tokenStore";
import { clearSessionClassroomData } from "@/lib/services/classroomCache";
import { studyRepository } from "@/lib/studyRepository";

export async function POST() {
  const session = await getSession();

  if (session) {
    clearClassroomAccessToken(session.sessionId);
    clearSessionClassroomData(session.sessionId);
    studyRepository.clearSessionSelectedFiles(session.sessionId);
  }

  await clearSession();
  return NextResponse.json({ ok: true });
}
