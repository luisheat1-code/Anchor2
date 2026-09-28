import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAnchor } from "@/lib/anchor/store";
import type { SavedQuiz, StudyCard } from "@/lib/anchor/types";
import { SharedQuiz } from "@/components/anchor/shared-quiz";
import { cn } from "@/lib/cn";

export function Practice() {
  const [mode, setMode] = useState<"notes" | "class">("notes");
  const heading = mode === "class" ? "A quiz for the class." : "Your questions, your answers.";
  const lede =
    mode === "class"
      ? "Write it, share the code, and wait until everyone who joined has finished."
      : "Save a quiz by name, then take it again whenever you want.";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10">
      <p className="text-xs font-medium tracking-widest text-copper uppercase">Practice</p>
      <h1 className="mt-2 font-display text-4xl">{heading}</h1>
      <p className="mt-3 max-w-xl text-muted">{lede}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <ModeButton on={mode === "notes"} label="Your notes" onClick={() => setMode("notes")} />
        <ModeButton on={mode === "class"} label="Class quiz" onClick={() => setMode("class")} />
      </div>
      {mode === "notes" ? <Notes /> : <SharedQuiz />}
    </main>
  );
}

function ModeButton({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn("h-11 rounded-md px-4 text-sm", on ? "bg-pine text-cream" : "bg-cream text-ink shadow-card")}>
      {label}
    </button>
  );
}

function Notes() {
  const quizzes = useAnchor((s) => s.quizzes) ?? [];
  const saveQuiz = useAnchor((s) => s.saveQuiz);
  const removeQuiz = useAnchor((s) => s.removeQuiz);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [drill, setDrill] = useState<{ name: string; cards: StudyCard[] } | null>(null);

  const ready = question.trim().length > 0 && answer.trim().length > 0;

  function addQuestion() {
    if (!editor || !ready) return;
    if (editingQuestion) {
      setEditor({
        ...editor,
        questions: editor.questions.map((row) =>
          row.id === editingQuestion ? { ...row, question: question.trim(), answer: answer.trim() } : row,
        ),
      });
      setEditingQuestion(null);
    } else {
      setEditor({
        ...editor,
        questions: [...editor.questions, { id: newId("n"), question: question.trim(), answer: answer.trim() }],
      });
    }
    setQuestion("");
    setAnswer("");
  }

  function storeQuiz() {
    if (!editor || editor.name.trim().length < 2 || editor.questions.length === 0) return;
    saveQuiz({
      id: editor.id ?? newId("q"),
      name: editor.name.trim(),
      questions: editor.questions,
    });
    setEditor(null);
    setQuestion("");
    setAnswer("");
    setEditingQuestion(null);
  }

  if (drill) {
    return <Drill name={drill.name} cards={drill.cards} onClose={() => setDrill(null)} />;
  }

  if (editor) {
    return (
      <section className="mt-6">
        <label className="block text-sm" htmlFor="quiz-name">
          Quiz name
        </label>
        <input
          id="quiz-name"
          value={editor.name}
          onChange={(event) => setEditor({ ...editor, name: event.target.value })}
          className="mt-2 h-11 w-full rounded-md border border-line bg-paper px-3"
          placeholder="Chapter 3"
        />
        <form
          className="mt-4 rounded-lg bg-cream p-5 shadow-card"
          onSubmit={(event) => {
            event.preventDefault();
            addQuestion();
          }}
        >
          <label className="block text-sm" htmlFor="note-question">
            Question
          </label>
          <textarea
            id="note-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={2}
            className="mt-2 w-full rounded-md border border-line bg-paper px-3 py-3"
            placeholder="What is a free variable?"
          />
          <label className="mt-4 block text-sm" htmlFor="note-answer">
            Answer
          </label>
          <textarea
            id="note-answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-md border border-line bg-paper px-3 py-3"
            placeholder="A variable you can choose freely in the solution."
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="submit" disabled={!ready}>
              {editingQuestion ? "Save changes" : "Add question"}
            </Button>
            {editingQuestion ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditingQuestion(null);
                  setQuestion("");
                  setAnswer("");
                }}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
        {editor.questions.length > 0 ? (
          <ul className="mt-4 divide-y divide-line border-t border-line">
            {editor.questions.map((row) => {
              const open = openId === row.id;
              return (
                <li key={row.id} className="py-4">
                  <p className="font-display text-xl">{row.question}</p>
                  {open ? <p className="mt-2 max-w-xl text-sm">{row.answer}</p> : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" className="h-11 text-sm text-copper" onClick={() => setOpenId(open ? null : row.id)}>
                      {open ? "Hide answer" : "Show answer"}
                    </button>
                    <button
                      type="button"
                      className="h-11 text-sm text-muted"
                      onClick={() => {
                        setEditingQuestion(row.id);
                        setQuestion(row.question);
                        setAnswer(row.answer);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="h-11 text-sm text-muted"
                      onClick={() => setEditor({ ...editor, questions: editor.questions.filter((item) => item.id !== row.id) })}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">No questions yet.</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" disabled={editor.name.trim().length < 2 || editor.questions.length === 0} onClick={storeQuiz}>
            Save quiz
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setEditor(null);
              setQuestion("");
              setAnswer("");
              setEditingQuestion(null);
            }}
          >
            Back
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6">
      <Button type="button" onClick={() => setEditor({ id: null, name: "", questions: [] })}>
        New quiz
      </Button>
      {quizzes.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No quizzes yet. Name one, add the questions, then save it.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line border-t border-line">
          {quizzes.map((quiz) => (
            <li key={quiz.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-display text-2xl">{quiz.name}</p>
                <p className="text-sm text-muted">
                  {quiz.questions.length} {quiz.questions.length === 1 ? "question" : "questions"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() =>
                    setDrill({
                      name: quiz.name,
                      cards: quiz.questions.map((row) => ({ ...row, courseId: "" })),
                    })
                  }
                >
                  Take quiz
                </Button>
                <Button
                  type="button"
                  variant="quiet"
                  onClick={() => {
                    setEditor({ id: quiz.id, name: quiz.name, questions: quiz.questions.map((row) => ({ ...row })) });
                    setOpenId(null);
                  }}
                >
                  Edit
                </Button>
                <Button type="button" variant="ghost" onClick={() => removeQuiz(quiz.id)}>
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

type Editor = { id: string | null; name: string; questions: SavedQuiz["questions"] };

function Drill({ name, cards, onClose }: { name: string; cards: StudyCard[]; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const [known, setKnown] = useState(0);
  const [done, setDone] = useState(false);
  const card = cards[index];

  function mark(got: boolean) {
    const nextKnown = known + (got ? 1 : 0);
    if (index + 1 >= cards.length) {
      setKnown(nextKnown);
      setDone(true);
      return;
    }
    setKnown(nextKnown);
    setIndex((value) => value + 1);
    setShown(false);
  }

  function again() {
    setIndex(0);
    setShown(false);
    setKnown(0);
    setDone(false);
  }

  if (!card && !done) return null;

  if (done) {
    return (
      <section className="mt-6 rounded-lg bg-cream p-6 shadow-card">
        <p className="text-xs tracking-wide text-muted uppercase">{name}</p>
        <p className="mt-2 font-display text-5xl tabular-nums">
          {known} of {cards.length}
        </p>
        <p className="mt-2 text-muted">{known === cards.length ? "You had every answer." : "Look again at the ones you missed."}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" onClick={again}>
            Take it again
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Back to notes
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-lg bg-cream p-5 shadow-card">
      <p className="text-xs tracking-wide text-muted uppercase">
        {name} · {index + 1} of {cards.length}
      </p>
      <h2 className="mt-2 font-display text-3xl">{card.question}</h2>
      {shown ? <p className="mt-4 max-w-xl text-sm">{card.answer}</p> : null}
      <div className="mt-5 flex flex-wrap gap-2">
        {shown ? (
          <>
            <Button type="button" onClick={() => mark(true)}>
              Knew it
            </Button>
            <Button type="button" variant="quiet" onClick={() => mark(false)}>
              Missed it
            </Button>
          </>
        ) : (
          <Button type="button" onClick={() => setShown(true)}>
            Show answer
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={onClose}>
          Stop
        </Button>
      </div>
    </section>
  );
}

