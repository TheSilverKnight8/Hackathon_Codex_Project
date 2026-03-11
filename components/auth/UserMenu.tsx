"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export function UserMenu() {
  const router = useRouter();
  const { user, signOut, isLoading } = useAuth();

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="user-menu">
      {user.avatarUrl ? <img src={user.avatarUrl} alt={`${user.name} avatar`} className="avatar" /> : null}
      <div>
        <p>{user.name}</p>
        <p>{user.email}</p>
      </div>
      <button
        type="button"
        onClick={async () => {
          await signOut();
          router.push("/");
        }}
      >
        Sign out
      </button>
    </div>
  );
}
