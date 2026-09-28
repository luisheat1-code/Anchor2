import type { Course, Draft, GpaRow, GradePart, Kind, Meeting, WorkItem } from "./types";

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

export function todayISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function weekday(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).getDay();
}

export function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + days);
  return todayISO(date);
}

export function startOfWeek(iso: string) {
  const day = weekday(iso);
  const delta = day === 0 ? -6 : 1 - day;
  return addDays(iso, delta);
}

export function weekDates(iso: string) {
  const start = startOfWeek(iso);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function courseOf(courses: Course[], id: string) {
  return courses.find((course) => course.id === id);
}

export function standing(parts: GradePart[]) {
  const graded = parts.filter((part) => part.score != null && part.weight > 0);
  const weight = graded.reduce((sum, part) => sum + part.weight, 0);
  const earned = graded.reduce((sum, part) => sum + ((part.score ?? 0) / 100) * part.weight, 0);
  const current = weight === 0 ? null : Math.round((earned / weight) * 1000) / 10;
  const remain = Math.max(0, 100 - parts.reduce((sum, part) => sum + (part.score != null ? part.weight : 0), 0));
  return { current, earned, remain };
}

export function neededFor(parts: GradePart[], target: number) {
  const { earned, remain } = standing(parts);
  if (remain <= 0) return null;
  return Math.round(((target - earned) / remain) * 1000) / 10;
}

export const GRADE_POINTS: Record<string, number> = {
  "A+": 4,
  A: 4,
  "A-": 3.7,
  "B+": 3.3,
  B: 3,
  "B-": 2.7,
  "C+": 2.3,
  C: 2,
  "C-": 1.7,
  "D+": 1.3,
  D: 1,
  "D-": 0.7,
  F: 0,
};

export const LETTERS = Object.keys(GRADE_POINTS);

export function termQuality(rows: Pick<GpaRow, "credits" | "grade">[]) {
  let points = 0;
  let credits = 0;
  for (const row of rows) {
    const value = GRADE_POINTS[row.grade];
    const hours = Number(row.credits);
    if (value == null || !Number.isFinite(hours) || hours <= 0) continue;
    points += value * hours;
    credits += hours;
  }
  return { points, credits, gpa: credits === 0 ? null : round2(points / credits) };
}

export function cumulativeGpa(term: { points: number; credits: number }, priorGpa: number | null, priorCredits: number) {
  if (priorGpa == null || !Number.isFinite(priorGpa) || priorCredits <= 0) return null;
  const credits = term.credits + priorCredits;
  if (credits <= 0) return null;
  return round2((term.points + priorGpa * priorCredits) / credits);
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

const LETTER_CUTS: [number, string][] = [
  [93, "A"],
  [90, "A-"],
  [87, "B+"],
  [83, "B"],
  [80, "B-"],
  [77, "C+"],
  [73, "C"],
  [70, "C-"],
  [67, "D+"],
  [63, "D"],
  [60, "D-"],
  [0, "F"],
];

export function letterFromPercent(percent: number) {
  return LETTER_CUTS.find(([cut]) => percent >= cut)?.[1] ?? "F";
}

export function percentWith(parts: GradePart[], partId: string, score: number) {
  let earned = 0;
  let weight = 0;
  for (const part of parts) {
    const value = part.id === partId ? score : part.score;
    if (value == null || part.weight <= 0) continue;
    earned += (value / 100) * part.weight;
    weight += part.weight;
  }
  if (weight <= 0) return null;
  return Math.round((earned / weight) * 1000) / 10;
}

export function gpaReplacing(rows: Pick<GpaRow, "name" | "credits" | "grade">[], code: string, letter: string, credits = 3) {
  const key = code.trim().toLowerCase();
  let found = false;
  const next = rows.map((row) => {
    const name = row.name.trim().toLowerCase();
    if (!found && (name === key || name.startsWith(`${key} `))) {
      found = true;
      return { ...row, grade: letter };
    }
    return row;
  });
  if (!found) next.push({ name: code, credits, grade: letter });
  return termQuality(next).gpa;
}

export function parseSyllabus(raw: string): Draft {
  const text = raw.replace(/\r/g, "").trim();
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const titleLine = lines.find((line) => !/^(instructor|office|meeting|class|attendance|late|grading|homework|quiz|exam)/i.test(line)) ?? "Untitled course";
  const codeMatch = titleLine.match(/\b([A-Z]{2,5}\s?-?\s?\d{2,3}[A-Z]?)\b/);
  const code = codeMatch?.[1]?.replace(/\s+/g, " ") ?? "COURSE";
  const title = titleLine.replace(code, "").replace(/^[\s:—-]+/, "").trim() || titleLine;
  const instructor = field(lines, /instructor|professor|taught by/i).replace(/^(instructor|professor)\s*[:—-]?\s*/i, "");
  const officeHours = field(lines, /office hours?/i).replace(/^office hours?\s*[:—-]?\s*/i, "");
  const attendance = field(lines, /attendance/i);
  const latePolicy = field(lines, /late work|late policy|late /i);
  const penalty = attendance.match(/(\d+(?:\.\d+)?)\s*%/);
  const meetings = meetingsFrom(text);
  const grading = gradingFrom(lines);
  const items = itemsFrom(lines);
  const id = `c-${slug(code)}-${slug(title)}`;
  return {
    source: "parser",
    course: {
      id,
      code,
      title,
      instructor,
      officeHours,
      attendance,
      latePolicy,
      absencePenalty: penalty ? Number(penalty[1]) : null,
      meetings: meetings.map((meeting, index) => ({ ...meeting, id: `${id}-m${index}` })),
      grading: grading.map((part, index) => ({ ...part, id: `${id}-g${index}` })),
    },
    items: items.map((item, index) => ({ ...item, id: `${id}-w${index}`, courseId: id })),
  };
}

function field(lines: string[], pattern: RegExp) {
  return lines.find((line) => pattern.test(line)) ?? "";
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 18) || "x";
}

function meetingsFrom(text: string): Omit<Meeting, "id">[] {
  const line = text.split("\n").find((row) => /meetings?|class (?:time|meets)|meets/i.test(row)) ?? "";
  const days = daysIn(line || text);
  const times = [...(line || text).matchAll(/(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?\s*[–-]\s*(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?/gi)];
  if (!days.length || !times.length) return [];
  const hit = times[0];
  const start = clock(hit[1], hit[2], hit[3]);
  const end = clock(hit[4], hit[5], hit[6] || hit[3]);
  const place = (line.match(/,\s*([^,]+)$/)?.[1] ?? "").replace(/meetings?\s*[:—-]?\s*/i, "").trim();
  return [{ days, start, end, place: /pierce|hall|lab|memorial|room/i.test(place) ? place : place }];
}

function daysIn(line: string) {
  const compact = line.toUpperCase();
  if (/\bMWF\b/.test(compact)) return [1, 3, 5];
  if (/\bTTH\b|\bTR\b|\bTUTH\b/.test(compact)) return [2, 4];
  if (/\bMW\b/.test(compact)) return [1, 3];
  const names: Record<string, number> = {
    monday: 1, mon: 1, tuesday: 2, tue: 2, tues: 2, wednesday: 3, wed: 3,
    thursday: 4, thu: 4, thur: 4, thurs: 4, friday: 5, fri: 5, saturday: 6, sat: 6, sunday: 0, sun: 0,
  };
  const found = [...line.toLowerCase().matchAll(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tues|tue|wed|thurs|thur|thu|fri|sat|sun)\b/g)];
  const days = [...new Set(found.map((hit) => names[hit[1]]).filter((n) => n != null))];
  return days;
}

function clock(hourRaw: string, minRaw?: string, ampm?: string) {
  let hour = Number(hourRaw);
  const min = minRaw ? Number(minRaw) : 0;
  const mark = (ampm ?? "").toLowerCase();
  if (mark.startsWith("p") && hour < 12) hour += 12;
  if (mark.startsWith("a") && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function gradingFrom(lines: string[]): Omit<GradePart, "id">[] {
  const parts: Omit<GradePart, "id">[] = [];
  for (const line of lines) {
    const match = line.match(/^([A-Za-z][^%\d]{1,40}?)\s*[:—-]?\s*(\d{1,3})\s*%/);
    if (!match) continue;
    const name = match[1].trim();
    if (/attendance|absence|late|due|office|meeting/i.test(name)) continue;
    parts.push({ name, weight: Number(match[2]), score: null });
  }
  return parts.slice(0, 8);
}

function itemsFrom(lines: string[]): Omit<WorkItem, "id" | "done" | "courseId">[] {
  const items: Omit<WorkItem, "id" | "done" | "courseId">[] = [];
  for (const line of lines) {
    const due = dateIn(line);
    if (!due) continue;
    if (/office hours|attendance|meetings?|class meets/i.test(line)) continue;
    const title = line
      .replace(/\b(due|on|by)\b/gi, " ")
      .replace(/(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s*\d{4})?/gi, " ")
      .replace(/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g, " ")
      .replace(/[:—-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (title.length < 3) continue;
    items.push({ title, kind: kindOf(title), due });
  }
  return items.slice(0, 24);
}

function kindOf(title: string): Kind {
  if (/final|midterm|exam/i.test(title)) return "exam";
  if (/quiz/i.test(title)) return "quiz";
  if (/read/i.test(title)) return "reading";
  return "assignment";
}

export function dateIn(line: string, fallbackYear = 2026) {
  const named = line.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?/i);
  if (named) {
    const month = MONTHS[named[1].slice(0, 3).toLowerCase()];
    const year = named[3] ? Number(named[3]) : fallbackYear;
    return iso(year, month, Number(named[2]));
  }
  const numeric = line.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (!numeric) return null;
  let year = numeric[3] ? Number(numeric[3]) : fallbackYear;
  if (year < 100) year += 2000;
  return iso(year, Number(numeric[1]), Number(numeric[2]));
}

function iso(year: number, month: number, day: number) {
  if (!month || !day || month > 12 || day > 31) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseTranscript(raw: string): { name: string; credits: number; grade: string }[] {
  const seen = new Set<string>();
  const rows: { name: string; credits: number; grade: string }[] = [];
  for (const line of raw.replace(/\r/g, "").split("\n")) {
    const row = transcriptLine(line);
    if (!row) continue;
    const key = row.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(row);
  }
  return rows.slice(0, 40);
}

function transcriptLine(line: string) {
  const match = line.trim().match(/^[\s|]*([A-Za-z]{2,5})\s?-?\s?(\d{2,4}[A-Za-z]?)\b(.*)$/);
  if (!match) return null;
  const name = `${match[1].toUpperCase()} ${match[2].toUpperCase()}`;
  const rest = match[3] ?? "";
  const letter = rest.match(/\b(A\+|A-|A|B\+|B-|B|C\+|C-|C|D\+|D-|D|F)\b/i);
  const credits = [...rest.matchAll(/\b(\d(?:\.\d)?)\b/g)].map((hit) => Number(hit[1])).find((n) => n > 0 && n <= 8);
  return { name, credits: credits ?? 3, grade: letter ? normalizeLetter(letter[1]) : "" };
}

export function normalizeLetter(raw: string) {
  const text = raw.trim().toUpperCase().replace("−", "-").replace("–", "-");
  return text in GRADE_POINTS ? text : "";
}

export function partForItem(parts: GradePart[], kind: string, title: string) {
  const titled = parts.find((part) => part.weight > 0 && title.toLowerCase().includes(part.name.toLowerCase()) && part.name.length > 2);
  if (titled) return titled;
  const pattern =
    kind === "exam" ? /exam|midterm|final|test/i : kind === "quiz" ? /quiz/i : kind === "reading" ? /read/i : /homework|assignment|problem|project|paper|lab/i;
  return parts.find((part) => part.weight > 0 && pattern.test(part.name)) ?? null;
}

export function meanScore(values: number[]) {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function applyDraft(draft: Draft, source: Draft["source"]): { course: Course; items: WorkItem[] } {
  return {
    course: { ...draft.course, missed: 0 },
    items: draft.items.map((item) => ({ ...item, done: false, score: item.score ?? null })),
    ...(source ? {} : {}),
  };
}

export function toIcs(courses: Course[], items: WorkItem[], from = todayISO()) {
  const dues = items.map((item) => item.due).filter((due) => /^\d{4}-\d{2}-\d{2}$/.test(due)).sort();
  const until = (dues.at(-1) ? addDays(dues.at(-1) as string, 14) : addDays(from, 120)).replace(/-/g, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Anchor//Semester//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Anchor",
  ];
  for (const item of items) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.due)) continue;
    const course = courseOf(courses, item.courseId);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${ics(item.id)}@anchor`,
      `DTSTART;VALUE=DATE:${item.due.replace(/-/g, "")}`,
      `DTEND;VALUE=DATE:${addDays(item.due, 1).replace(/-/g, "")}`,
      `SUMMARY:${ics(course ? `${course.code}: ${item.title}` : item.title)}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }
  for (const course of courses) {
    for (const meeting of course.meetings) {
      if (!meeting.days.length || !/^\d{2}:\d{2}$/.test(meeting.start) || !/^\d{2}:\d{2}$/.test(meeting.end)) continue;
      const start = nextWeekday(from, meeting.days);
      lines.push(
        "BEGIN:VEVENT",
        `UID:${ics(meeting.id)}@anchor`,
        `DTSTART:${start.replace(/-/g, "")}T${meeting.start.replace(":", "")}00`,
        `DTEND:${start.replace(/-/g, "")}T${meeting.end.replace(":", "")}00`,
        `RRULE:FREQ=WEEKLY;BYDAY=${meeting.days.map(dayCode).join(",")};UNTIL=${until}T000000Z`,
        `SUMMARY:${ics(`${course.code} ${course.title}`)}`,
        meeting.place ? `LOCATION:${ics(meeting.place)}` : "LOCATION:Campus",
        "END:VEVENT",
      );
    }
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function nextWeekday(from: string, days: number[]) {
  for (let offset = 0; offset < 7; offset += 1) {
    const iso = addDays(from, offset);
    if (days.includes(weekday(iso))) return iso;
  }
  return from;
}

function dayCode(day: number) {
  return ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][day] ?? "MO";
}

function ics(value: string) {
  return value.replace(/[,;\\]/g, " ").slice(0, 120);
}

export function clockLabel(value: string) {
  const [h, m] = value.split(":").map(Number);
  const mark = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")}${mark}`;
}
