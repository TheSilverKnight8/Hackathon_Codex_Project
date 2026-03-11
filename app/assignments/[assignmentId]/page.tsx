import Link from "next/link";
import { notFound } from "next/navigation";
import { MaterialPickerMock } from "@/components/MaterialPickerMock";
import { PageShell } from "@/components/PageShell";
import { studyRepository } from "@/lib/studyRepository";

type AssignmentDetailPageProps = {
  params: { assignmentId: string };
};

export default function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  const assignment = studyRepository.getAssignmentById(params.assignmentId);

  if (!assignment) {
    notFound();
  }

  const selectedAssignment = assignment;
  const course = studyRepository.getCourseById(selectedAssignment.courseId);
  const materials = studyRepository.getMaterialsForAssignment(selectedAssignment.id);

  return (
    <PageShell title="Assignment Detail">
      <section className="card">
        <h2>{selectedAssignment.title}</h2>
        <p>
          Course: {course?.title} · Due: {selectedAssignment.dueDate} · Est. {selectedAssignment.estimatedMinutes} minutes
        </p>
        <p>{selectedAssignment.instructions}</p>
      </section>
      <MaterialPickerMock materials={materials} />
      <Link className="button" href={`/portal/${selectedAssignment.id}`}>
        Generate Study Portal (Mock)
      </Link>
    </PageShell>
  );
}
