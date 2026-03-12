import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { PortalGenerationPanel } from "@/components/portal/PortalGenerationPanel";
import { getSession } from "@/lib/auth/session";
import { studyRepository } from "@/lib/studyRepository";

type StudyPortalPageProps = {
  params: { assignmentId: string };
};

export default async function StudyPortalPage({ params }: StudyPortalPageProps) {
  const session = await getSession();
  const assignment = studyRepository.getAssignmentById(params.assignmentId, session?.sessionId);

  if (!assignment) {
    notFound();
  }

  const selectedAssignment = assignment;
  const portalView = studyRepository.getPortalViewForAssignment(params.assignmentId, session?.sessionId);

  if (!portalView) {
    notFound();
  }

  const selectedPortalView = portalView;

  return (
    <PageShell title="Study Portal">
      <section className="card">
        <h2>{selectedAssignment.title}</h2>
        <p>Generate a structured portal from assignment metadata and extracted file text.</p>
      </section>
      <PortalGenerationPanel
        assignmentId={selectedAssignment.id}
        initialPortal={selectedPortalView.portal}
        initialSource={selectedPortalView.source}
        initialStatus={selectedPortalView.generationStatus}
        initialMessage={selectedPortalView.message}
      />
    </PageShell>
  );
}
