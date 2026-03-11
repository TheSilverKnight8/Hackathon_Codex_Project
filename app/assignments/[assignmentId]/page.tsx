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

  const course = studyRepository.getCourseById(assignment.courseId, session?.sessionId);
  const selectedFiles = studyRepository.getSelectedFilesForAssignment(assignment.id, session?.sessionId);
  const fallbackMaterials = selectedFiles.length === 0 ? studyRepository.getMaterialsForAssignment(assignment.id, session?.sessionId) : [];

  return (
    <PageShell title="Assignment Detail">
      <section className="card">
        <h2>{assignment.title}</h2>
        <p>
          Course: {course?.title} · Due: {assignment.dueDate} · Est. {assignment.estimatedMinutes} minutes
        </p>
        <p>{assignment.instructions}</p>
      </section>

      <DriveFilePickerPanel assignmentId={assignment.id} initialSelectedFiles={selectedFiles} />
      {fallbackMaterials.length > 0 ? <MaterialPickerMock materials={fallbackMaterials} /> : null}

      <Link className="button" href={`/portal/${assignment.id}`}>
        Generate Study Portal (Mock)
      </Link>
    </PageShell>
  );
}
