import crypto from "node:crypto";
import { cookies } from "next/headers";
import { AuthSession, SignedInUser } from "@/types/auth";

const SESSION_COOKIE_NAME = "ai_study_portal_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  user: SignedInUser;
  expiresAt: number;
};

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;

  if (!secret) {
    throw new Error("AUTH_SESSION_SECRET is required");
  }

  return secret;
}

function signValue(value: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function encodeSession(payload: SessionPayload) {
  const payloadJson = JSON.stringify(payload);
  const base64Payload = Buffer.from(payloadJson).toString("base64url");
  const signature = signValue(base64Payload);
  return `${base64Payload}.${signature}`;
}

function decodeSession(rawValue: string): SessionPayload | null {
  const [base64Payload, signature] = rawValue.split(".");

  if (!base64Payload || !signature) {
    return null;
  }

  const expectedSignature = signValue(base64Payload);
  if (signature.length != expectedSignature.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const payloadText = Buffer.from(base64Payload, "base64url").toString("utf8");
    const payload = JSON.parse(payloadText) as SessionPayload;

    if (!payload.user?.id || !payload.user?.email || !payload.expiresAt) {
      return null;
    }

    if (Date.now() >= payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = cookies();
  const rawSession = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawSession) {
    return null;
  }

  const payload = decodeSession(rawSession);

  if (!payload) {
    return null;
  }

  return {
    user: payload.user,
    expiresAt: payload.expiresAt
  };
}

export async function setSession(user: SignedInUser) {
  const cookieStore = cookies();
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const value = encodeSession({ user, expiresAt });

  cookieStore.set(SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS
  });
}

export async function clearSession() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
