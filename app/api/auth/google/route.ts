import { NextRequest, NextResponse } from "next/server";
import { verifyGoogleIdToken } from "@/lib/auth/googleAuth";
import { setSession } from "@/lib/auth/session";
import { saveClassroomAccessToken } from "@/lib/auth/tokenStore";

type GoogleAuthRequestBody = {
  credential?: string;
  classroomAccessToken?: string;
  classroomAccessTokenExpiresIn?: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GoogleAuthRequestBody;

    if (!body.credential) {
      return NextResponse.json({ error: "Missing Google credential." }, { status: 400 });
    }

    const user = await verifyGoogleIdToken(body.credential);

    if (!user) {
      return NextResponse.json({ error: "Invalid Google credential." }, { status: 401 });
    }

    const sessionId = await setSession(user);

    if (body.classroomAccessToken && body.classroomAccessTokenExpiresIn) {
      saveClassroomAccessToken(sessionId, body.classroomAccessToken, body.classroomAccessTokenExpiresIn);
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}
