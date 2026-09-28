import { createServerFn } from "@tanstack/react-start";

export type PracticeQuestion = {
  prompt: string;
  choices: string[];
  answer: number;
  why: string;
};

type Input = { code: string; title: string; focus: string; topics: string };

function asInput(data: unknown): Input {
  if (!data || typeof data !== "object") throw new Error("Bad request");
  const row = data as Partial<Input>;
  const title = typeof row.title === "string" ? row.title.trim().slice(0, 160) : "";
  if (title.length < 2) throw new Error("Pick a course first");
  return {
    code: typeof row.code === "string" ? row.code.trim().slice(0, 24) : "",
    title,
    focus: typeof row.focus === "string" ? row.focus.trim().slice(0, 500) : "course review",
    topics: typeof row.topics === "string" ? row.topics.trim().slice(0, 300) : "",
  };
}

function parseJson(raw: string) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON");
  return JSON.parse(raw.slice(start, end + 1)) as { questions?: unknown };
}

function questionsFrom(raw: string): PracticeQuestion[] {
  const parsed = parseJson(raw);
  if (!Array.isArray(parsed.questions)) return [];
  const out: PracticeQuestion[] = [];
  for (const row of parsed.questions) {
    if (!row || typeof row !== "object") continue;
    const item = row as { prompt?: unknown; choices?: unknown; answer?: unknown; why?: unknown };
    const prompt = typeof item.prompt === "string" ? item.prompt.trim() : "";
    const choices = Array.isArray(item.choices) ? item.choices.map((choice) => String(choice).trim()).filter(Boolean) : [];
    const answer = Number(item.answer);
    const why = typeof item.why === "string" ? item.why.trim() : "";
    if (prompt.length < 8 || choices.length !== 4 || !Number.isInteger(answer) || answer < 0 || answer > 3 || why.length < 8) continue;
    out.push({ prompt: prompt.slice(0, 400), choices: choices.map((choice) => choice.slice(0, 180)), answer, why: why.slice(0, 320) });
    if (out.length === 5) break;
  }
  return out;
}

export const makePractice = createServerFn({ method: "POST" })
  .validator(asInput)
  .handler(async ({ data }): Promise<{ ok: true; questions: PracticeQuestion[] } | { ok: false; error: string }> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "Practice questions are not available right now." };

    const prompt = `Write 5 college practice questions for ${data.code} ${data.title}.
The student is preparing for: ${data.focus || "a quiz or exam"}.
${data.topics ? `Syllabus grade categories, for context only: ${data.topics}. Do not ask about the percentages.` : ""}
JSON only:
{"questions":[{"prompt":"","choices":["","","",""],"answer":0,"why":"one sentence"}]}
Rules: answer is the index of the correct choice. Questions test the subject, not the syllabus rules. One clearly correct choice. No "all of the above". why explains the idea, not "the answer is B".`;

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.4,
        max_tokens: 1400,
        messages: [
          { role: "system", content: "You write fair college practice questions. JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) return { ok: false, error: `Could not write questions (${res.status}).` };

    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    try {
      const questions = questionsFrom(body.choices?.[0]?.message?.content ?? "");
      if (questions.length < 3) return { ok: false, error: "The set came back incomplete. Try again." };
      return { ok: true, questions };
    } catch {
      return { ok: false, error: "Could not read the practice set. Try again." };
    }
  });
