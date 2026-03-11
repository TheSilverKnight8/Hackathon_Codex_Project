import Link from "next/link";
import { ReactNode } from "react";

type PageShellProps = {
  title: string;
  children: ReactNode;
};

export function PageShell({ title, children }: PageShellProps) {
  return (
    <main className="container">
      <header className="header">
        <h1>{title}</h1>
        <nav>
          <Link href="/">Landing</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </header>
      {children}
    </main>
  );
}
