import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container">
      <h1>Page not found</h1>
      <p>The requested item does not exist in mock data.</p>
      <Link href="/dashboard">Back to dashboard</Link>
    </main>
  );
}
