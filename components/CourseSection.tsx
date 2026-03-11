import Link from "next/link";
import { Assignment, Course } from "@/types/study";

type CourseSectionProps = {
  course: Course;
  assignments: Assignment[];
};

export function CourseSection({ course, assignments }: CourseSectionProps) {
  return (
    <section className="card">
      <h2>{course.title}</h2>
      <p>
        {course.teacherName} · {course.term}
      </p>
      <ul className="list">
        {assignments.map((assignment) => (
          <li key={assignment.id}>
            <div>
              <strong>{assignment.title}</strong>
              <p>Due: {assignment.dueDate}</p>
            </div>
            <Link href={`/assignments/${assignment.id}`}>Open</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
