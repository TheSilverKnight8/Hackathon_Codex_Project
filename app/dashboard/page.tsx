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

  const dashboardData = await studyRepository.getCoursesWithAssignments(session.sessionId);

  return (
    <PageShell title="Dashboard" actions={<UserMenu />}>
      <p>
        Signed in as: {session.user.name} ({session.user.email})
      </p>

      {dashboardData.message ? (
        <section className="card">
          <p>{dashboardData.message}</p>
        </section>
      ) : null}

      {dashboardData.courses.length === 0 ? (
        <section className="card">
          <h2>No courses available</h2>
          <p>We could not find active courses for this account yet.</p>
        </section>
      ) : (
        dashboardData.courses.map((course) => (
          <CourseSection key={course.id} course={course} assignments={course.assignments} />
        ))
      )}
    </PageShell>
  );
}
