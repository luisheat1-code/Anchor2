import { createServerFn } from "@tanstack/react-start";
import { randomBytes } from "node:crypto";
import { authMiddleware } from "@/lib/auth/middleware";
import { toIcs } from "@/lib/anchor/logic";
import type { Course, Meeting, WorkItem } from "@/lib/anchor/types";

function asText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function asSchedule(data: unknown): { courses: Course[]; items: WorkItem[] } {
  if (!data || typeof data !== "object") throw new Error("Bad request");
  const row = data as { courses?: unknown; items?: unknown };
  const courses = Array.isArray(row.courses) ? row.courses.slice(0, 30).map(asCourse).filter((course): course is Course => course != null) : [];
  const items = Array.isArray(row.items) ? row.items.slice(0, 300).map(asItem).filter((item): item is WorkItem => item != null) : [];
  if (courses.length === 0 && items.length === 0) throw new Error("Add a syllabus first");
  return { courses, items };
}

function asCourse(value: unknown): Course | null {
  if (!value || typeof value !== "object") return null;
  const row = value as { id?: unknown; code?: unknown; title?: unknown; meetings?: unknown };
  const id = asText(row.id, 80);
  const code = asText(row.code, 24);
  if (!id || !code) return null;
  const meetings = Array.isArray(row.meetings) ? row.meetings.slice(0, 8).map(asMeeting).filter((meeting): meeting is Meeting => meeting != null) : [];
  return {
    id,
    code,
    title: asText(row.title, 120),
    instructor: "",
    officeHours: "",
    attendance: "",
    latePolicy: "",
    absencePenalty: null,
    meetings,
    grading: [],
    missed: 0,
  };
}

function asMeeting(value: unknown): Meeting | null {
  if (!value || typeof value !== "object") return null;
  const row = value as { id?: unknown; days?: unknown; start?: unknown; end?: unknown; place?: unknown };
  const id = asText(row.id, 80);
  const days = Array.isArray(row.days) ? row.days.map((day) => Number(day)).filter((day) => day >= 0 && day <= 6) : [];
  const start = asText(row.start, 5);
  const end = asText(row.end, 5);
  if (!id || days.length === 0) return null;
  return { id, days, start, end, place: asText(row.place, 80) };
}

function asItem(value: unknown): WorkItem | null {
  if (!value || typeof value !== "object") return null;
  const row = value as { id?: unknown; courseId?: unknown; title?: unknown; due?: unknown };
  const id = asText(row.id, 80);
  const due = asText(row.due, 10);
  const title = asText(row.title, 160);
  if (!id || !title || !/^\d{4}-\d{2}-\d{2}$/.test(due)) return null;
  return { id, courseId: asText(row.courseId, 80), title, kind: "assignment", due, done: false, score: null };
}

function originOf(request: Request) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const forwarded = request.headers.get("x-forwarded-proto");
  const proto = forwarded ?? (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  if (!host) throw new Error("Missing host");
  return `${proto}://${host}`;
}

export const publishCalendar = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(asSchedule)
  .handler(async ({ data, context }): Promise<{ ok: true; googleUrl: string } | { ok: false; error: string }> => {
    const body = toIcs(data.courses, data.items);
    if (body.length > 200_000) return { ok: false, error: "That schedule is too large for one calendar." };
    const { getSql } = await import("@/lib/db");
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    if (!request) return { ok: false, error: "Could not open Google Calendar." };
    const sql = await getSql();
    const token = randomBytes(16).toString("hex");
    const rows = await sql<{ token: string }>`
      insert into calendar_feed (token, user_id, body)
      values (${token}, ${context.userId}, ${body})
      on conflict (user_id) do update set body = excluded.body, updated_at = current_timestamp
      returning token
    `;
    const saved = rows[0]?.token;
    if (!saved) return { ok: false, error: "Could not save the calendar." };
    const feed = `${originOf(request)}/api/calendar/${saved}`;
    return { ok: true, googleUrl: `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(feed)}` };
  });
