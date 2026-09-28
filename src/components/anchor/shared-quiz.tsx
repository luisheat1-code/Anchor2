import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { createSharedQuiz, joinSharedQuiz, sharedQuizState, submitSharedQuiz, type ScoreRow } from "@/lib/anchor/quiz.functions";
import { cn } from "@/lib/cn";

type PublicQuestion = { id: string; prompt: string; choices: string[] };
type Draft = { prompt: string; choices: string[]; answer: number | null };

const emptyQuestion = (): Draft => ({ prompt: "", choices: ["", "", "", ""], answer: null });

export function SharedQuiz({ initialCode = "" }: { initialCode?: string }) {
  const [phase, setPhase] = useState<"home" | "edit" | "share" | "ask" | "results">(initialCode ? "ask" : "home");
  const [title, setTitle] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([emptyQuestion()]);
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [joinCode, setJoinCode] = useState("");
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [yours, setYours] = useState<number | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [alone, setAlone] = useState(false);
  const [pending, setPending] = useState<string[]>([]);
  const [scores, setScores] = useState<ScoreRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [quizTitle, setQuizTitle] = useState("");
  const ticket = useRef(0);

  useEffect(() => {
    if (!initialCode) return;
    void enter(initialCode);
    // Join once from the shared link.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  useEffect(() => {
    if (phase !== "results" || !code) return;
    const timer = setInterval(() => void refresh(code), 4000);
    return () => clearInterval(timer);
  }, [phase, code]);

  async function enter(raw: string) {
    const next = raw.trim().toUpperCase();
    setBusy(true);
    setError("");
    try {
      const result = await joinSharedQuiz({ data: { code: next } });
      if (!result.ok) {
        setError(result.error);
        setPhase("home");
        return;
      }
      setCode(result.code);
      setQuizTitle(result.title);
      setQuestions(result.questions);
      setTotal(result.questions.length);
      if (result.submitted) {
        setYours(result.score);
        setPhase("results");
        await refresh(result.code);
        return;
      }
      setIndex(0);
      setPicks([]);
      setPicked(null);
      setPhase("ask");
    } catch {
      setError("Log in, then use the code.");
      setPhase("home");
    } finally {
      setBusy(false);
    }
  }

  async function refresh(nextCode: string) {
    const mine = ++ticket.current;
    try {
      const result = await sharedQuizState({ data: { code: nextCode } });
      if (mine !== ticket.current || !result.ok) return;
      setQuizTitle(result.title);
      setTotal(result.total);
      setYours(result.yours);
      setWaiting(result.waiting);
      setAlone(result.alone);
      setPending(result.pending);
      setScores(result.scores);
    } catch {
      /* keep the last scores */
    }
  }

  async function create() {
    if (drafts.some((question) => question.prompt.trim().length < 2 || question.choices.some((choice) => choice.trim().length < 1) || question.answer == null)) {
      setError("Each question needs a prompt, four choices, and a correct one.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await createSharedQuiz({
        data: {
          title: title.trim(),
          questions: drafts.map((question) => ({
            prompt: question.prompt.trim(),
            choices: question.choices.map((choice) => choice.trim()),
            answer: question.answer ?? 0,
          })),
        },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCode(result.code);
      setQuizTitle(title.trim());
      setPhase("share");
    } catch {
      setError("Log in, then create the quiz.");
    } finally {
      setBusy(false);
    }
  }

  function choose(choice: number) {
    if (picked != null) return;
    setPicked(choice);
  }

  async function next() {
    if (picked == null) return;
    const nextPicks = [...picks, picked];
    if (index + 1 < questions.length) {
      setPicks(nextPicks);
      setIndex((value) => value + 1);
      setPicked(null);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await submitSharedQuiz({ data: { code, picks: nextPicks } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setYours(result.score);
      setTotal(result.total);
      setPhase("results");
      await refresh(code);
    } catch {
      setError("Could not turn that in.");
    } finally {
      setBusy(false);
    }
  }

  if (phase === "edit") {
    return (
      <section className="mt-6">
        <label className="block text-sm" htmlFor="quiz-title">
          Quiz name
        </label>
        <input
          id="quiz-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3"
          placeholder="Chapter 3 check"
        />
        <ul className="mt-4 space-y-4">
          {drafts.map((question, questionIndex) => (
            <li key={questionIndex} className="rounded-lg bg-cream p-4 shadow-card">
              <label className="block text-sm" htmlFor={`prompt-${questionIndex}`}>
                Question {questionIndex + 1}
              </label>
              <textarea
                id={`prompt-${questionIndex}`}
                value={question.prompt}
                rows={2}
                onChange={(event) => updateDraft(questionIndex, { prompt: event.target.value })}
                className="mt-2 w-full rounded-md border border-line bg-paper px-3 py-3"
              />
              <div className="mt-3 space-y-2">
                {question.choices.map((choice, choiceIndex) => (
                  <input
                    key={choiceIndex}
                    value={choice}
                    aria-label={`Choice ${choiceIndex + 1}`}
                    onChange={(event) => {
                      const choices = question.choices.slice();
                      choices[choiceIndex] = event.target.value;
                      updateDraft(questionIndex, { choices });
                    }}
                    className="h-11 w-full rounded-md border border-line bg-paper px-3"
                    placeholder={`Choice ${String.fromCharCode(65 + choiceIndex)}`}
                  />
                ))}
              </div>
              <p className="mt-3 text-xs tracking-wide text-muted uppercase">Correct choice</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {question.choices.map((_, choiceIndex) => (
                  <button
                    key={choiceIndex}
                    type="button"
                    onClick={() => updateDraft(questionIndex, { answer: choiceIndex })}
                    className={cn("h-11 rounded-md px-3 text-sm", question.answer === choiceIndex ? "bg-pine text-cream" : "bg-paper shadow-card")}
                  >
                    {String.fromCharCode(65 + choiceIndex)}
                  </button>
                ))}
                {drafts.length > 1 ? (
                  <button type="button" className="h-11 px-2 text-sm text-muted" onClick={() => setDrafts((rows) => rows.filter((_, i) => i !== questionIndex))}>
                    Remove
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="quiet" onClick={() => setDrafts((rows) => [...rows, emptyQuestion()])}>
            Add question
          </Button>
          <Button type="button" disabled={busy || title.trim().length < 2} onClick={() => void create()}>
            {busy ? "Saving…" : "Create and share"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setPhase("home")}>
            Back
          </Button>
        </div>
        {error ? <p className="mt-3 text-sm text-muted">{error}</p> : null}
      </section>
    );

    function updateDraft(questionIndex: number, patch: Partial<Draft>) {
      setDrafts((rows) => rows.map((row, index) => (index === questionIndex ? { ...row, ...patch } : row)));
    }
  }

  if (phase === "share") {
    return (
      <section className="mt-6 rounded-lg bg-cream p-6 shadow-card">
        <p className="text-xs tracking-wide text-muted uppercase">{quizTitle}</p>
        <p className="mt-2 font-display text-5xl tracking-wide">{code}</p>
        <p className="mt-2 text-sm text-muted">Classmates join with this code. Scores stay hidden until everyone who joined is done.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" onClick={() => void enter(code)} disabled={busy}>
            {busy ? "Joining…" : "Take it too"}
          </Button>
          <Button
            type="button"
            variant="quiet"
            onClick={() => void navigator.clipboard?.writeText(code).catch(() => undefined)}
          >
            Copy code
          </Button>
        </div>
      </section>
    );
  }

  if (phase === "ask") {
    const question = questions[index];
    if (!question) {
      return <p className="mt-6 text-sm text-muted">{busy ? "Opening the quiz…" : error || "That quiz has no questions."}</p>;
    }
    return (
      <section className="mt-6 rounded-lg bg-cream p-5 shadow-card">
        <p className="text-xs tracking-wide text-muted uppercase">
          {quizTitle} · {index + 1} of {questions.length}
        </p>
        <h2 className="mt-2 font-display text-2xl">{question.prompt}</h2>
        <ul className="mt-4 space-y-2">
          {question.choices.map((choice, choiceIndex) => (
            <li key={`${question.id}-${choiceIndex}`}>
              <button
                type="button"
                onClick={() => choose(choiceIndex)}
                className={cn(
                  "min-h-11 w-full rounded-md px-3 py-3 text-left text-sm",
                  picked == null && "bg-paper shadow-card",
                  picked === choiceIndex && "bg-pine text-cream",
                  picked != null && picked !== choiceIndex && "bg-paper text-muted",
                )}
              >
                {choice}
              </button>
            </li>
          ))}
        </ul>
        {picked != null ? (
          <Button type="button" className="mt-4" disabled={busy} onClick={() => void next()}>
            {busy ? "Turning in…" : index + 1 === questions.length ? "Turn in" : "Next"}
          </Button>
        ) : null}
        {error ? <p className="mt-3 text-sm text-muted">{error}</p> : null}
      </section>
    );
  }

  if (phase === "results") {
    return (
      <section className="mt-6 rounded-lg bg-cream p-6 shadow-card">
        <p className="text-xs tracking-wide text-muted uppercase">{quizTitle}</p>
        {waiting ? (
          <>
            <h2 className="mt-2 font-display text-3xl">Not everyone is done.</h2>
            <p className="mt-2 text-muted">Waiting for the others. Scores show up when the last person turns it in.</p>
            <ul className="mt-4 space-y-2 text-sm">
              {pending.map((name, nameIndex) => (
                <li key={`${name}-${nameIndex}`}>{name} is still taking it.</li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <h2 className="mt-2 font-display text-3xl">{alone ? "You are the only one so far." : "Everyone is done."}</h2>
            {alone ? <p className="mt-2 text-muted">When classmates join with the code, this waits for them too.</p> : null}
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {(scores ?? []).map((row) => (
                <li key={row.name} className="flex items-baseline justify-between gap-3 py-3">
                  <span className={row.you ? "text-copper" : undefined}>{row.you ? `${row.name} (you)` : row.name}</span>
                  <span className="font-display text-2xl tabular-nums">
                    {row.score} of {total}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
        {yours != null ? (
          <p className="mt-4 text-sm text-muted">
            You scored {yours} of {total}.
          </p>
        ) : null}
        <p className="mt-4 text-sm text-muted">Code {code}</p>
      </section>
    );
  }

  return (
    <section className="mt-6 grid gap-4 md:grid-cols-2">
      <form
        className="rounded-lg bg-cream p-5 shadow-card"
        onSubmit={(event) => {
          event.preventDefault();
          void enter(joinCode);
        }}
      >
        <h2 className="font-display text-2xl">Join with a code</h2>
        <input
          value={joinCode}
          onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
          aria-label="Quiz code"
          maxLength={6}
          className="mt-3 h-11 w-full rounded-md border border-line bg-paper px-3 tracking-widest"
          placeholder="AB12CD"
        />
        <Button type="submit" className="mt-3" disabled={busy || joinCode.trim().length < 6}>
          {busy ? "Joining…" : "Join"}
        </Button>
        {error ? <p className="mt-3 text-sm text-muted">{error}</p> : null}
      </form>
      <div className="rounded-lg bg-cream p-5 shadow-card">
        <h2 className="font-display text-2xl">Write one</h2>
        <p className="mt-2 text-sm text-muted">Four choices each. Share the code. Scores wait until every person who joined is finished.</p>
        <Button type="button" className="mt-4" onClick={() => { setError(""); setPhase("edit"); }}>
          Create a quiz
        </Button>
      </div>
    </section>
  );
}
