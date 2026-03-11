import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function LandingPage() {
  return (
    <PageShell title="AI Study Portal">
      <section className="card">
        <h2>Turn one assignment into a focused study workspace</h2>
        <p>
          This MVP demonstrates the future Google flow using realistic mock data: choose an assignment,
          select Drive materials, and open a structured study portal.
        </p>
        <p className="inline-actions">
          <Link className="button" href="/dashboard">
            Continue as Demo Student
          </Link>
        </p>
      </section>
    </PageShell>
  );
}
