import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { PortalPreview } from "@/components/PortalPreview";
import { getSession } from "@/lib/auth/session";
import { studyRepository } from "@/lib/studyRepository";

type StudyPortalPageProps = {
  params: { assignmentId: string };
};

export default async function StudyPortalPage({ params }: StudyPortalPageProps) {
  const session = await getSession();
  const assignment = studyRepository.getAssignmentById(params.assignmentId, session?.sessionId);
  const portal = studyRepository.getStudyPortalForAssignment(params.assignmentId, session?.sessionId);

  if (!assignment || !portal) {
    notFound();
  }

  return (
    <PageShell title="Study Portal">
      <section className="card">
        <h2>{assignment.title}</h2>
        <p>Generated from your selected assignment files (mock).</p>
      </section>
      <PortalPreview portal={portal} />
    </PageShell>
  );
}
