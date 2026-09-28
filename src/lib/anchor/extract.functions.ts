import { createServerFn } from "@tanstack/react-start";
import type { Draft, Kind } from "./types";

type Input = { text?: string; image?: string };

function asInput(data: unknown): Input {
  if (!data || typeof data !== "object") throw new Error("Bad request");
  const row = data as Input;
  const text = typeof row.text === "string" ? row.text.trim().slice(0, 12000) : "";
  const image = typeof row.image === "string" ? row.image.slice(0, 4_000_000) : "";
  if (!text && !image) throw new Error("Paste a syllabus or add a screenshot");
  if (image && !image.startsWith("data:image/")) throw new Error("Screenshot must be an image");
  return { text, image };
}

function parseJson(raw: string) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON");
  return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
}

function kindOf(value: string): Kind {
  if (/exam|midterm|final/i.test(value)) return "exam";
  if (/quiz/i.test(value)) return "quiz";
  if (/read/i.test(value)) return "reading";
  return "assignment";
}

function daysOf(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((day) => Number(day)).filter((day) => day >= 0 && day <= 6);
  }
  const text = String(value ?? "");
  if (/MWF/i.test(text)) return [1, 3, 5];
  if (/TTh|TuTh|TR/i.test(text)) return [2, 4];
  if (/\bMW\b/i.test(text)) return [1, 3];
  return [];
}

export const extractSyllabus = createServerFn({ method: "POST" })
  .validator(asInput)
  .handler(async ({ data }): Promise<{ ok: true; draft: Draft } | { ok: false; error: string }> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "AI is not available" };

    const prompt = `Extract a college syllabus into JSON only.
Keys:
{"code":"","title":"","instructor":"","officeHours":"","attendance":"","latePolicy":"","absencePenalty": number or null,
 "meetings":[{"days":[1,3,5],"start":"09:00","end":"09:50","place":""}],
 "grading":[{"name":"","weight":20}],
 "items":[{"title":"","kind":"assignment|exam|quiz|reading","due":"YYYY-MM-DD"}]}
Days are 0 Sunday through 6 Saturday. If the year is missing, use 2026. Do not invent assignments that are not in the source.
${data.text ? `\nSyllabus:\n${data.text}` : ""}`;

    const userContent = data.image
      ? [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: data.image } },
        ]
      : prompt;

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.1,
        max_tokens: 900,
        messages: [
          { role: "system", content: "You extract syllabus facts. JSON only. Never add deadlines that are not written." },
          { role: "user", content: userContent },
        ],
      }),
    });
    if (!res.ok) return { ok: false, error: `Could not read the syllabus (${res.status})` };

    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    try {
      const json = parseJson(body.choices?.[0]?.message?.content ?? "");
      const code = String(json.code || "COURSE").slice(0, 16);
      const title = String(json.title || "Untitled course").slice(0, 80);
      const id = `c-${Date.now()}`;
      const meetings = Array.isArray(json.meetings) ? json.meetings : [];
      const grading = Array.isArray(json.grading) ? json.grading : [];
      const items = Array.isArray(json.items) ? json.items : [];
      const draft: Draft = {
        source: "grok",
        course: {
          id,
          code,
          title,
          instructor: String(json.instructor ?? "").slice(0, 80),
          officeHours: String(json.officeHours ?? "").slice(0, 120),
          attendance: String(json.attendance ?? "").slice(0, 200),
          latePolicy: String(json.latePolicy ?? "").slice(0, 200),
          absencePenalty: typeof json.absencePenalty === "number" ? json.absencePenalty : null,
          meetings: meetings.slice(0, 4).map((row, index) => {
            const meeting = row as { days?: unknown; start?: unknown; end?: unknown; place?: unknown };
            return {
              id: `${id}-m${index}`,
              days: daysOf(meeting.days),
              start: String(meeting.start ?? "09:00").slice(0, 5),
              end: String(meeting.end ?? "09:50").slice(0, 5),
              place: String(meeting.place ?? "").slice(0, 60),
            };
          }).filter((meeting) => meeting.days.length > 0),
          grading: grading.slice(0, 8).map((row, index) => {
            const part = row as { name?: unknown; weight?: unknown };
            return {
              id: `${id}-g${index}`,
              name: String(part.name ?? "Work").slice(0, 40),
              weight: Math.max(0, Math.min(100, Number(part.weight) || 0)),
              score: null,
            };
          }),
        },
        items: items.slice(0, 30).map((row, index) => {
          const item = row as { title?: unknown; kind?: unknown; due?: unknown };
          const due = String(item.due ?? "");
          return {
            id: `${id}-w${index}`,
            courseId: id,
            title: String(item.title ?? "Untitled").slice(0, 80),
            kind: kindOf(String(item.kind ?? item.title ?? "")),
            due: /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : "2026-10-01",
          };
        }).filter((item) => item.title.length > 1),
      };
      return { ok: true, draft };
    } catch {
      return { ok: false, error: "The syllabus reply could not be read" };
    }
  });
