import { redirect } from "next/navigation";
import { UserMenu } from "@/components/auth/UserMenu";
import { CourseSection } from "@/components/CourseSection";
import { PageShell } from "@/components/PageShell";
import { getSession } from "@/lib/auth/session";
import { studyRepository } from "@/lib/studyRepository";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/?signin=required");
  }

  const authenticatedSession = session;
  const courses = studyRepository.getCoursesWithAssignments();

  return (
    <PageShell title="Dashboard" actions={<UserMenu />}>
      <p>
        Signed in as: {authenticatedSession.user.name} ({authenticatedSession.user.email})
      </p>
      {courses.map((course) => (
        <CourseSection key={course.id} course={course} assignments={course.assignments} />
      ))}
    </PageShell>
  );
}
