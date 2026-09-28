import { createFileRoute } from "@tanstack/react-router";
import { CourseBoard } from "@/components/anchor/course-board";
import { Shell } from "@/components/anchor/shell";
import { courseOf } from "@/lib/anchor/logic";
import { useAnchor } from "@/lib/anchor/store";

export const Route = createFileRoute("/course/$courseId")({
  component: CoursePage,
});

function CoursePage() {
  const { courseId } = Route.useParams();
  const courses = useAnchor((s) => s.courses);
  const course = courseOf(courses, courseId);

  return (
    <Shell>
      {course ? (
        <CourseBoard course={course} />
      ) : (
        <main className="mx-auto max-w-xl px-4 py-16">
          <h1 className="font-display text-3xl">That course is not on the schedule.</h1>
        </main>
      )}
    </Shell>
  );
}
