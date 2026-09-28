import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddSyllabus } from "@/components/anchor/add-syllabus";
import { CanvasFeed } from "@/components/anchor/canvas-feed";
import { publishCalendar } from "@/lib/anchor/calendar.functions";
import { clockLabel, formatDay, todayISO, toIcs, weekDates, weekday } from "@/lib/anchor/logic";
import { useAnchor } from "@/lib/anchor/store";
import { cn } from "@/lib/cn";

export function Schedule() {
  const courses = useAnchor((s) => s.courses);
  const items = useAnchor((s) => s.items);
  const toggleDone = useAnchor((s) => s.toggleDone);
  const [adding, setAdding] = useState(false);
  const [calendarNote, setCalendarNote] = useState("");
  const [publishing, setPublishing] = useState(false);
  const today = todayISO();
  const upcoming = items
    .filter((item) => !item.done && item.due >= today)
    .sort((a, b) => a.due.localeCompare(b.due));
  const overdue = items.filter((item) => !item.done && item.due < today);
  const week = weekDates(today);
  const dueThisWeek = items.filter((item) => !item.done && item.due >= week[0] && item.due <= week[6]).length;

  async function addToGoogle() {
    setPublishing(true);
    setCalendarNote("");
    try {
      const result = await publishCalendar({ data: { courses, items } });
      if (!result.ok) {
        setCalendarNote(result.error);
        return;
      }
      window.open(result.googleUrl, "_blank", "noopener,noreferrer");
      setCalendarNote("Google should ask to add the Anchor calendar. Click again after the syllabus changes.");
    } catch {
      setCalendarNote("Could not open Google Calendar.");
    } finally {
      setPublishing(false);
    }
  }

  function download() {
    const blob = new Blob([toIcs(courses, items)], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "anchor-semester.ics";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
      <p className="text-xs font-medium tracking-widest text-copper uppercase">This semester</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-4xl md:text-5xl">Syllabus to schedule.</h1>
        <Button type="button" onClick={() => setAdding(true)}>
          <Plus className="size-4" aria-hidden />
          Add syllabus
        </Button>
      </div>
      <p className="mt-3 max-w-xl text-muted">
        Paste a syllabus. Anchor pulls assignments, class times, office hours, and grading weights onto one schedule.
      </p>
      {adding ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-3 md:items-center"
          onClick={() => setAdding(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-syllabus-title"
            className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-lg bg-paper p-4 shadow-card md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="add-syllabus-title" className="font-display text-2xl">
              Add a syllabus
            </h2>
            <AddSyllabus onClose={() => setAdding(false)} />
          </div>
        </div>
      ) : null}
      {courses.length === 0 ? (
        <section className="mt-8 rounded-lg bg-cream p-6 shadow-card">
          <h2 className="font-display text-3xl">Nothing on the schedule yet.</h2>
          <p className="mt-2 max-w-md text-muted">
            Upload a PDF or Word syllabus, or paste it. Classes and due dates stay off this page until then.
          </p>
          <Button type="button" className="mt-5" onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden />
            Add syllabus
          </Button>
        </section>
      ) : (
        <>
      <dl className="mt-8 grid grid-cols-3 gap-3 border-y border-line py-4">
        <Stat label="Courses" value={String(courses.length)} />
        <Stat label="Due this week" value={String(dueThisWeek)} />
        <Stat label="Overdue" value={String(overdue.length)} />
      </dl>
      <section className="mt-6 hidden md:block">
        <h2 className="font-display text-2xl">Week</h2>
        <div className="mt-3 grid grid-cols-7 gap-2">
          {week.map((iso) => {
            const day = weekday(iso);
            const classes = courses.flatMap((course) =>
              course.meetings
                .filter((meeting) => meeting.days.includes(day))
                .map((meeting) => ({ course, meeting })),
            );
            const due = items.filter((item) => item.due === iso && !item.done);
            return (
              <div key={iso} className={cn("min-h-36 rounded-lg bg-cream p-2 shadow-card", iso === today && "ring-2 ring-copper")}>
                <p className="text-xs text-muted">{formatDay(iso)}</p>
                <ul className="mt-2 space-y-1">
                  {classes.map(({ course, meeting }) => (
                    <li key={meeting.id}>
                      <Link
                        to="/course/$courseId"
                        params={{ courseId: course.id }}
                        className="block rounded-md bg-pine px-1.5 py-1 text-xs text-cream"
                      >
                        <span className="block truncate">{course.code}</span>
                        <span className="text-cream/70">{clockLabel(meeting.start)}</span>
                      </Link>
                    </li>
                  ))}
                  {due.map((item) => (
                    <li key={item.id}>
                      <Link
                        to="/course/$courseId"
                        params={{ courseId: item.courseId }}
                        className="block truncate rounded-md border border-line bg-paper px-1.5 py-1 text-xs text-ink"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {overdue.length ? (
        <section className="mt-6">
          <h2 className="font-display text-xl">Overdue</h2>
          <ItemList items={overdue} courses={courses} today={today} onToggle={toggleDone} />
        </section>
      ) : null}

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl">Coming up</h2>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button type="button" onClick={() => void addToGoogle()} disabled={publishing} className="h-11 text-sm text-copper">
              {publishing ? "Opening…" : "Add to Google Calendar"}
            </button>
            <button type="button" onClick={download} className="h-11 text-sm text-muted">
              Download .ics
            </button>
          </div>
        </div>
        {calendarNote ? <p className="mt-2 text-sm text-muted">{calendarNote}</p> : null}
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nothing dated ahead. Add a syllabus or mark overdue work done.</p>
        ) : (
          <ItemList items={upcoming.slice(0, 8)} courses={courses} today={today} onToggle={toggleDone} />
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl">Courses</h2>
        <ul className="mt-2 divide-y divide-line border-t border-line">
          {courses.map((course) => (
            <li key={course.id}>
              <Link to="/course/$courseId" params={{ courseId: course.id }} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-xs tracking-wide text-muted uppercase">{course.code}</p>
                  <p className="truncate font-display text-xl">{course.title}</p>
                  <p className="truncate text-sm text-muted">
                    {course.meetings[0]
                      ? `${course.meetings[0].place || "Class"} · ${clockLabel(course.meetings[0].start)}`
                      : course.instructor || "No meeting time yet"}
                  </p>
                </div>
                <span className="text-sm text-copper">Open</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
        </>
      )}
      <CanvasFeed />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-display text-3xl tabular-nums">{value}</dd>
    </div>
  );
}

function ItemList({
  items,
  courses,
  today,
  onToggle,
}: {
  items: { id: string; courseId: string; title: string; due: string; kind: string }[];
  courses: { id: string; code: string }[];
  today: string;
  onToggle: (id: string) => void;
}) {
  return (
    <ul className="mt-2 divide-y divide-line border-t border-line">
      {items.map((item) => {
        const course = courses.find((row) => row.id === item.courseId);
        return (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <button
              type="button"
              aria-label={`Mark ${item.title} done`}
              onClick={() => onToggle(item.id)}
              className="size-11 shrink-0 rounded-md border border-line bg-cream"
            />
            <Link to="/course/$courseId" params={{ courseId: item.courseId }} className="min-w-0 flex-1">
              <p className="truncate">{item.title}</p>
              <p className="text-sm text-muted">
                {course?.code} · {item.kind}
                {item.due < today ? " · overdue" : ""}
              </p>
            </Link>
            <p className="shrink-0 text-sm tabular-nums text-muted">{formatDay(item.due)}</p>
          </li>
        );
      })}
    </ul>
  );
}
