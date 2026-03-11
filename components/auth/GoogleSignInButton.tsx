"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { GOOGLE_CLASSROOM_SCOPE_STRING } from "@/lib/auth/googleScopes";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme: "outline" | "filled_blue"; size: "large" | "medium" }
          ) => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; expires_in?: number; error?: string }) => void;
          }) => { requestAccessToken: (options?: { prompt?: "consent" | "none" }) => void };
        };
      };
    };
  }
}

const SCRIPT_ID = "google-identity-services";

export function GoogleSignInButton() {
  const router = useRouter();
  const { user, refreshSession, isLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user || isLoading) {
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setErrorMessage("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
      return;
    }

    function requestClassroomAccessToken() {
      return new Promise<{ accessToken: string; expiresIn: number } | null>((resolve) => {
        const google = window.google;

        if (!google) {
          resolve(null);
          return;
        }

        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: GOOGLE_CLASSROOM_SCOPE_STRING,
          callback: (response) => {
            if (response.error || !response.access_token || !response.expires_in) {
              resolve(null);
              return;
            }

            resolve({
              accessToken: response.access_token,
              expiresIn: response.expires_in
            });
          }
        });

        tokenClient.requestAccessToken({ prompt: "consent" });
      });
    }

    function renderGoogleButton() {
      const google = window.google;
      const container = buttonContainerRef.current;

      if (!google || !container) {
        return;
      }

      container.innerHTML = "";
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          if (!credential) {
            setErrorMessage("Google sign-in did not return a credential.");
            return;
          }

          const classroomToken = await requestClassroomAccessToken();
          const response = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              credential,
              classroomAccessToken: classroomToken?.accessToken,
              classroomAccessTokenExpiresIn: classroomToken?.expiresIn
            })
          });

          if (!response.ok) {
            setErrorMessage("Google sign-in failed. Please try again.");
            return;
          }

          await refreshSession();
          router.push("/dashboard");
        }
      });
      google.accounts.id.renderButton(container, { theme: "outline", size: "large" });
    }

    if (window.google) {
      renderGoogleButton();
      return;
    }

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", renderGoogleButton);
      return () => existingScript.removeEventListener("load", renderGoogleButton);
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [user, isLoading, refreshSession, router]);

  if (user) {
    return null;
  }

  return (
    <div>
      <div ref={buttonContainerRef} />
      {errorMessage ? <p>{errorMessage}</p> : null}
    </div>
  );
}
