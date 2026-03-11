import { NextRequest, NextResponse } from "next/server";
import { verifyGoogleIdToken } from "@/lib/auth/googleAuth";
import { setSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { credential?: string };

    if (!body.credential) {
      return NextResponse.json({ error: "Missing Google credential." }, { status: 400 });
    }

    const user = await verifyGoogleIdToken(body.credential);

    if (!user) {
      return NextResponse.json({ error: "Invalid Google credential." }, { status: 401 });
    }

    await setSession(user);

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}
