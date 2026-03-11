import "@/styles/globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "AI Study Portal",
  description: "Mock MVP for assignment-to-study-portal workflow"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
