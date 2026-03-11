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

  const course = studyRepository.getCourseById(assignment.courseId);
  const materials = studyRepository.getMaterialsForAssignment(assignment.id);

  return (
    <PageShell title="Assignment Detail">
      <section className="card">
        <h2>{assignment.title}</h2>
        <p>
          Course: {course?.title} · Due: {assignment.dueDate} · Est. {assignment.estimatedMinutes} minutes
        </p>
        <p>{assignment.instructions}</p>
      </section>
      <MaterialPickerMock materials={materials} />
      <Link className="button" href={`/portal/${assignment.id}`}>
        Generate Study Portal (Mock)
      </Link>
    </PageShell>
  );
}
