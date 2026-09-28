import { createHash } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type { Kind } from "./types";

type FeedItem = { id: string; title: string; kind: Kind; due: string };
type FeedGroup = { code: string; title: string; items: FeedItem[] };

function asUrl(data: unknown) {
  if (!data || typeof data !== "object") throw new Error("Bad request");
  const url = (data as { url?: unknown }).url;
  if (typeof url !== "string") throw new Error("Paste the Canvas calendar link");
  return assertFeedUrl(url.trim());
}

function assertFeedUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Paste the full Canvas link, starting with https");
  }
  if (url.protocol !== "https:") throw new Error("The feed link has to start with https");
  if (url.username || url.password) throw new Error("That link is not a calendar feed");
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host === "metadata.google.internal" ||
    /^(127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host)
  ) {
    throw new Error("That link is not a Canvas feed");
  }
  if (!/(feed|calendar|\.ics)/i.test(`${url.pathname}${url.search}`)) {
    throw new Error("In Canvas, open Calendar, then Calendar feed, and paste that link");
  }
  return url;
}

async function readFeed(start: URL) {
  let current = start;
  for (let hop = 0; hop < 3; hop += 1) {
    assertFeedUrl(current.toString());
    const res = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(12000),
      headers: { Accept: "text/calendar, text/plain, */*", "User-Agent": "Anchor" },
    });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) throw new Error("Canvas did not return a calendar");
      current = new URL(location, current);
      continue;
    }
    if (!res.ok) throw new Error("Canvas did not return that feed. Copy the link again.");
    const text = await res.text();
    if (text.length > 1_500_000) throw new Error("That feed is too large");
    if (!text.includes("BEGIN:VCALENDAR")) throw new Error("That link is not a calendar feed");
    return text;
  }
  throw new Error("That link redirected too many times");
}

function kindOf(title: string): Kind {
  if (/exam|midterm|final/i.test(title)) return "exam";
  if (/quiz/i.test(title)) return "quiz";
  if (/read/i.test(title)) return "reading";
  return "assignment";
}

function dueDate(raw: string) {
  const value = raw.trim();
  const dateOnly = value.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (dateOnly) return `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}`;
  const stamp = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
  if (!stamp) return null;
  let year = Number(stamp[1]);
  let month = Number(stamp[2]);
  let day = Number(stamp[3]);
  const hour = Number(stamp[4]);
  if (value.endsWith("Z") && hour < 6) {
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() - 1);
    year = date.getUTCFullYear();
    month = date.getUTCMonth() + 1;
    day = date.getUTCDate();
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function field(block: string, name: string) {
  const match = block.match(new RegExp(`^${name}(?:;[^:\\n]*)?:(.*)$`, "im"));
  return (match?.[1] ?? "").replace(/\\n/gi, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").trim();
}

function labelFrom(summary: string) {
  const bracket = summary.match(/^(.*?)\s*\[([^\]]{2,48})\]\s*$/);
  if (bracket?.[1] && bracket[2]) return { title: bracket[1].trim(), code: bracket[2].trim() };
  const dash = summary.match(/^(.*?)\s+[-–]\s+([A-Z]{2,5}\s?\d{2,4}[A-Z]?)\s*$/);
  if (dash?.[1] && dash[2]) return { title: dash[1].trim(), code: dash[2].replace(/\s+/g, " ") };
  return { title: summary, code: "Canvas" };
}

function parseFeed(text: string): FeedGroup[] {
  const unfolded = text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
  const blocks = unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? [];
  const today = new Date();
  const min = new Date(today);
  min.setDate(min.getDate() - 21);
  const max = new Date(today);
  max.setDate(max.getDate() + 200);
  const minIso = iso(min);
  const maxIso = iso(max);
  const groups = new Map<string, FeedGroup>();
  for (const block of blocks.slice(0, 400)) {
    const summary = field(block, "SUMMARY").slice(0, 160);
    const due = dueDate(field(block, "DTSTART"));
    if (!summary || !due || due < minIso || due > maxIso) continue;
    const uid = field(block, "UID") || `${summary}-${due}`;
    const labeled = labelFrom(summary);
    const code = labeled.code.slice(0, 24) || "Canvas";
    const key = code.toLowerCase();
    const group = groups.get(key) ?? { code, title: code === "Canvas" ? "From Canvas" : code, items: [] };
    group.items.push({
      id: `cv-${createHash("sha1").update(uid).digest("hex").slice(0, 16)}`,
      title: labeled.title || summary,
      kind: kindOf(labeled.title || summary),
      due,
    });
    groups.set(key, group);
  }
  return [...groups.values()]
    .map((group) => ({ ...group, items: group.items.slice(0, 80) }))
    .filter((group) => group.items.length > 0)
    .slice(0, 12);
}

function iso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export const importCanvasFeed = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(asUrl)
  .handler(async ({ data }): Promise<{ ok: true; groups: FeedGroup[]; count: number } | { ok: false; error: string }> => {
    try {
      const groups = parseFeed(await readFeed(data));
      const count = groups.reduce((sum, group) => sum + group.items.length, 0);
      if (count === 0) return { ok: false, error: "That feed has no upcoming assignments." };
      return { ok: true, groups, count };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Could not read that Canvas feed." };
    }
  });
