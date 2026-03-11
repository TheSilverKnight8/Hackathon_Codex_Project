import { CourseSection } from "@/components/CourseSection";
import { PageShell } from "@/components/PageShell";
import { studyRepository } from "@/lib/studyRepository";

export default function DashboardPage() {
  const courses = studyRepository.getCoursesWithAssignments();

  return (
    <PageShell title="Dashboard">
      <p>Signed in as: demo.student@school.edu (mock)</p>
      {courses.map((course) => (
        <CourseSection key={course.id} course={course} assignments={course.assignments} />
      ))}
    </PageShell>
  );
}
