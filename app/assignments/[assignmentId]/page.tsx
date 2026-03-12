import Link from "next/link";
import { notFound } from "next/navigation";
import { MaterialPickerMock } from "@/components/MaterialPickerMock";
import { DriveFilePickerPanel } from "@/components/drive/DriveFilePickerPanel";
import { PageShell } from "@/components/PageShell";
import { getSession } from "@/lib/auth/session";
import { studyRepository } from "@/lib/studyRepository";

type AssignmentDetailPageProps = {
  params: { assignmentId: string };
};

export default async function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  const session = await getSession();
  const assignment = studyRepository.getAssignmentById(params.assignmentId, session?.sessionId);

  if (!assignment) {
    notFound();
  }

  const selectedAssignment = assignment;
  const course = studyRepository.getCourseById(selectedAssignment.courseId, session?.sessionId);
  const selectedFiles = studyRepository.getSelectedFilesForAssignment(selectedAssignment.id, session?.sessionId);
  const extractions = studyRepository.getExtractionsForAssignment(selectedAssignment.id, session?.sessionId);
  const fallbackMaterials =
    selectedFiles.length === 0 ? studyRepository.getMaterialsForAssignment(selectedAssignment.id, session?.sessionId) : [];

  return (
    <PageShell title="Assignment Detail">
      <section className="card">
        <h2>{selectedAssignment.title}</h2>
        <p>
          Course: {course?.title} · Due: {selectedAssignment.dueDate} · Est. {selectedAssignment.estimatedMinutes} minutes
        </p>
        <p>{selectedAssignment.instructions}</p>
      </section>

      <DriveFilePickerPanel
        assignmentId={selectedAssignment.id}
        initialSelectedFiles={selectedFiles}
        initialExtractions={extractions}
      />
      {fallbackMaterials.length > 0 ? <MaterialPickerMock materials={fallbackMaterials} /> : null}

      <Link className="button" href={`/portal/${selectedAssignment.id}`}>
        Generate Study Portal (Mock)
      </Link>
    </PageShell>
  );
}
