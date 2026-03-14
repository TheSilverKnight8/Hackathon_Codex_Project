"use client";

import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/components/auth/AuthProvider";

export function LandingCta() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Checking sign-in status...</p>;
  }

  if (user) {
    return (
      <Link className="button" href="/dashboard">
        Continue to Dashboard
      </Link>
    );
  }

  return <GoogleSignInButton />;
}
