import { SignedInUser } from "@/types/auth";

type GoogleTokenInfo = {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
  aud?: string;
  exp?: string;
  email_verified?: "true" | "false";
};

function getGoogleClientId() {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is required");
  }

  return clientId;
}

export async function verifyGoogleIdToken(idToken: string): Promise<SignedInUser | null> {
  const clientId = getGoogleClientId();
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return null;
  }

  const tokenInfo = (await response.json()) as GoogleTokenInfo;

  if (tokenInfo.aud !== clientId || tokenInfo.email_verified !== "true") {
    return null;
  }

  if (!tokenInfo.sub || !tokenInfo.email || !tokenInfo.name) {
    return null;
  }

  return {
    id: tokenInfo.sub,
    name: tokenInfo.name,
    email: tokenInfo.email,
    avatarUrl: tokenInfo.picture
  };
}
