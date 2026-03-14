import Link from "next/link";
import { ReactNode } from "react";

type PageShellProps = {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function PageShell({ title, children, actions }: PageShellProps) {
  return (
    <main className="container">
      <header className="header">
        <h1>{title}</h1>
        <nav>
          <Link href="/">Landing</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
        {actions}
      </header>
      {children}
    </main>
  );
}
