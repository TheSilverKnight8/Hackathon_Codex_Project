import "@/styles/globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { getSession } from "@/lib/auth/session";

export const metadata = {
  title: "AI Study Portal",
  description: "Mock MVP for assignment-to-study-portal workflow"
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  return (
    <html lang="en">
      <body>
        <AuthProvider initialUser={session?.user ?? null}>{children}</AuthProvider>
      </body>
    </html>
  );
}
