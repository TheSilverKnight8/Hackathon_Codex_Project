import { LandingCta } from "@/components/auth/LandingCta";
import { PageShell } from "@/components/PageShell";

type LandingPageProps = {
  searchParams: { signin?: string };
};

export default function LandingPage({ searchParams }: LandingPageProps) {
  return (
    <PageShell title="AI Study Portal">
      <section className="card">
        <h2>Turn one assignment into a focused study workspace</h2>
        <p>
          Sign in with Google to connect your school context, choose an assignment, select relevant study files,
          and build a structured study portal.
        </p>
        {searchParams.signin === "required" ? (
          <p className="notice">Please sign in before opening the dashboard.</p>
        ) : null}
        <p className="inline-actions">
          <LandingCta />
        </p>
      </section>
    </PageShell>
  );
}
