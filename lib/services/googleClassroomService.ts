import { Assignment, Course } from "@/types/study";

type GoogleCourse = {
  id?: string;
  name?: string;
  section?: string;
  ownerId?: string;
};

type GoogleCoursework = {
  id?: string;
  title?: string;
  description?: string;
  dueDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  dueTime?: {
    hours?: number;
    minutes?: number;
  };
  updateTime?: string;
};

type GoogleCoursesResponse = {
  courses?: GoogleCourse[];
};

type GoogleCourseworkResponse = {
  courseWork?: GoogleCoursework[];
};

function mapDueDate(coursework: GoogleCoursework) {
  if (coursework.dueDate?.year && coursework.dueDate.month && coursework.dueDate.day) {
    const month = String(coursework.dueDate.month).padStart(2, "0");
    const day = String(coursework.dueDate.day).padStart(2, "0");
    return `${coursework.dueDate.year}-${month}-${day}`;
  }

  if (coursework.updateTime) {
    return coursework.updateTime.slice(0, 10);
  }

  return "TBD";
}

function mapStatus(dueDate: string): Assignment["status"] {
  if (dueDate === "TBD") {
    return "upcoming";
  }

  const dueTime = new Date(`${dueDate}T23:59:59Z`).getTime();
  const daysUntilDue = Math.ceil((dueTime - Date.now()) / (1000 * 60 * 60 * 24));

  if (daysUntilDue <= 3) {
    return "due_soon";
  }

  if (daysUntilDue <= 10) {
    return "in_progress";
  }

  return "upcoming";
}

async function googleGet<T>(url: string, accessToken: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Google Classroom request failed (${response.status}).`);
  }

  return (await response.json()) as T;
}

export async function fetchClassroomCourses(accessToken: string): Promise<Course[]> {
  const data = await googleGet<GoogleCoursesResponse>(
    "https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&pageSize=50",
    accessToken
  );

  return (data.courses ?? [])
    .filter((course) => course.id && course.name)
    .map((course) => ({
      id: `gc_${course.id}`,
      title: course.name!,
      teacherName: course.ownerId ? `Teacher ${course.ownerId.slice(0, 6)}` : "Google Classroom Teacher",
      term: course.section || "Active Class"
    }));
}

export async function fetchCourseAssignments(accessToken: string, courseId: string): Promise<Assignment[]> {
  const googleCourseId = courseId.replace("gc_", "");
  const data = await googleGet<GoogleCourseworkResponse>(
    `https://classroom.googleapis.com/v1/courses/${googleCourseId}/courseWork?pageSize=50&orderBy=dueDate%20desc`,
    accessToken
  );

  return (data.courseWork ?? [])
    .filter((item) => item.id && item.title)
    .map((item) => {
      const dueDate = mapDueDate(item);

      return {
        id: `gca_${googleCourseId}_${item.id}`,
        courseId,
        title: item.title!,
        instructions: item.description || "No instructions provided in Google Classroom.",
        dueDate,
        estimatedMinutes: 60,
        status: mapStatus(dueDate)
      };
    });
}
