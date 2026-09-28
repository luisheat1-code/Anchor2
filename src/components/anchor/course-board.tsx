import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { clockLabel, formatDay } from "@/lib/anchor/logic";
import { useAnchor } from "@/lib/anchor/store";
import type { Course, Kind } from "@/lib/anchor/types";

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CourseBoard({ course }: { course: Course }) {
  const items = useAnchor((s) => s.items.filter((item) => item.courseId === course.id));
  const toggleDone = useAnchor((s) => s.toggleDone);
  const updateItem = useAnchor((s) => s.updateItem);
  const removeItem = useAnchor((s) => s.removeItem);
  const setMissed = useAnchor((s) => s.setMissed);
  const live = useAnchor((s) => s.courses.find((row) => row.id === course.id)) ?? course;
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("2026-10-20");
  const [kind, setKind] = useState<Kind>("assignment");
  const absenceHit =
    live.absencePenalty != null ? Math.round(live.missed * live.absencePenalty * 10) / 10 : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8">
      <Link to="/" className="text-sm text-muted hover:text-ink">
        Schedule
      </Link>
      <p className="mt-3 text-xs font-medium tracking-widest text-copper uppercase">{live.code}</p>
      <h1 className="font-display text-4xl">{live.title}</h1>
      <p className="mt-2 text-sm text-muted">
        {[live.instructor, live.officeHours].filter(Boolean).join(" · ") || "No office hours on the syllabus."}
      </p>

      <section className="mt-6 rounded-lg bg-cream p-4 shadow-card">
        <h2 className="font-display text-xl">Meets</h2>
        {live.meetings.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No class time was found.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {live.meetings.map((meeting) => (
              <li key={meeting.id}>
                {meeting.days.map((day) => DAY[day]).join(", ")} · {clockLabel(meeting.start)}–{clockLabel(meeting.end)}
                {meeting.place ? ` · ${meeting.place}` : ""}
              </li>
            ))}
          </ul>
        )}
        {live.attendance ? <p className="mt-3 text-sm">{live.attendance}</p> : null}
        {live.latePolicy ? <p className="mt-1 text-sm text-muted">{live.latePolicy}</p> : null}
        {live.absencePenalty != null ? (
          <label className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            Classes missed
            <input
              type="number"
              min={0}
              max={40}
              value={live.missed}
              onChange={(event) => setMissed(live.id, Number(event.target.value) || 0)}
              className="h-11 w-20 rounded-md border border-line bg-paper px-2 tabular-nums"
            />
            <span className="text-muted">Costs about {absenceHit}% if the rule is applied straight.</span>
          </label>
        ) : null}
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl">Work</h2>
        <ul className="mt-2 divide-y divide-line border-t border-line">
          {items
            .slice()
            .sort((a, b) => a.due.localeCompare(b.due))
            .map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-2 py-3">
                <button
                  type="button"
                  aria-pressed={item.done}
                  aria-label={item.done ? `Reopen ${item.title}` : `Mark ${item.title} done`}
                  onClick={() => toggleDone(item.id)}
                  className={`size-11 shrink-0 rounded-md border border-line ${item.done ? "bg-pine" : "bg-cream"}`}
                />
                <input
                  value={item.title}
                  aria-label="Title"
                  onChange={(event) => updateItem(item.id, { title: event.target.value })}
                  className={`h-11 min-w-0 flex-1 rounded-md border border-line bg-cream px-3 text-sm ${item.done ? "text-muted line-through" : ""}`}
                />
                <input
                  type="date"
                  value={item.due}
                  aria-label="Due"
                  onChange={(event) => updateItem(item.id, { due: event.target.value })}
                  className="h-11 rounded-md border border-line bg-cream px-2 text-sm"
                />
                <button type="button" className="h-11 px-2 text-sm text-muted" onClick={() => removeItem(item.id)}>
                  Remove
                </button>
                <span className="sr-only">{formatDay(item.due)}</span>
              </li>
            ))}
        </ul>
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (title.trim().length < 2) return;
            const id = `w-${Date.now()}`;
            useAnchor.setState((state) => ({
              items: [...state.items, { id, courseId: live.id, title: title.trim(), kind, due, done: false }],
            }));
            setTitle("");
          }}
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add an assignment"
            aria-label="New assignment"
            className="h-11 min-w-48 flex-1 rounded-md border border-line bg-cream px-3 text-sm"
          />
          <select
            value={kind}
            aria-label="Kind"
            onChange={(event) => setKind(event.target.value as Kind)}
            className="h-11 rounded-md border border-line bg-cream px-2 text-sm"
          >
            <option value="assignment">Assignment</option>
            <option value="exam">Exam</option>
            <option value="quiz">Quiz</option>
            <option value="reading">Reading</option>
          </select>
          <input
            type="date"
            value={due}
            aria-label="New due date"
            onChange={(event) => setDue(event.target.value)}
            className="h-11 rounded-md border border-line bg-cream px-2 text-sm"
          />
          <Button type="submit" variant="quiet">
            Add
          </Button>
        </form>
      </section>
    </main>
  );
}
