import { useState } from "react";
import { Button } from "@/components/ui/button";
import { extractSyllabus } from "@/lib/anchor/extract.functions";
import { readDocument } from "@/lib/anchor/document.functions";
import { applyDraft, parseSyllabus } from "@/lib/anchor/logic";
import { SAMPLE_SYLLABUS } from "@/lib/anchor/seed";
import { canAdd, useAnchor } from "@/lib/anchor/store";
import type { Draft } from "@/lib/anchor/types";
import { Link } from "@tanstack/react-router";

export function AddSyllabus({ onClose }: { onClose: () => void }) {
  const plan = useAnchor((s) => s.plan);
  const trialStart = useAnchor((s) => s.trialStart);
  const addBundle = useAnchor((s) => s.addBundle);
  const open = canAdd(plan, trialStart);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);

  async function read(source: string, image?: string) {
    setBusy(true);
    setNote("");
    const local = source.trim().length > 12 ? parseSyllabus(source) : null;
    if (local && (local.items.length > 0 || local.course.meetings.length > 0)) {
      setDraft(local);
      setBusy(false);
    }
    const shouldAsk = Boolean(image) || source.trim().length > 40;
    if (!shouldAsk) {
      setBusy(false);
      if (!local) setNote("Paste the syllabus text, then extract.");
      return;
    }
    try {
      const remote = await withTimeout(extractSyllabus({ data: { text: source, image } }), 12000);
      if (remote.ok && (remote.draft.items.length || remote.draft.course.meetings.length)) {
        setDraft(remote.draft);
        setNote("");
      } else if (!local) {
        setNote(remote.ok ? "Nothing dated was found. Add a line with a due date." : remote.error);
      }
    } catch {
      if (!local) setNote("Could not read that. Paste the syllabus text instead.");
    } finally {
      setBusy(false);
    }
  }

  async function onFile(file: File) {
    const name = file.name.toLowerCase();
    if (file.type.startsWith("image/")) {
      const image = await fileToDataUrl(file);
      await read("", image);
      return;
    }
    if (name.endsWith(".doc") && !name.endsWith(".docx")) {
      setNote("Older .doc files are not supported. Save it as .docx or PDF.");
      return;
    }
    if (name.endsWith(".pdf") || name.endsWith(".docx") || file.type === "application/pdf") {
      if (file.size > 6_000_000) {
        setNote("That file is over 6 MB. Paste the syllabus, or upload a shorter PDF.");
        return;
      }
      setBusy(true);
      setNote("");
      try {
        const result = await readDocument({ data: { name: file.name, base64: await fileToBase64(file) } });
        if (!result.ok) {
          setNote(result.error);
          setBusy(false);
          return;
        }
        setText(result.text);
        await read(result.text);
      } catch {
        setNote("Could not open that file. Paste the syllabus text instead.");
        setBusy(false);
      }
      return;
    }
    await read(await file.text());
  }

  if (!open) {
    return (
      <section className="mt-4 rounded-lg bg-cream p-5 shadow-card">
        <h2 className="font-display text-2xl">The free trial is over.</h2>
        <p className="mt-2 text-sm text-muted">Subscribe to add another syllabus.</p>
        <Button asChild className="mt-4">
          <Link to="/plan" search={{ checkout: "" }}>See plans</Link>
        </Button>
      </section>
    );
  }

  if (draft) {
    return (
      <Review
        draft={draft}
        busy={busy}
        onChange={setDraft}
        onCancel={() => setDraft(null)}
        onSave={() => {
          const bundle = applyDraft(draft, draft.source);
          addBundle(bundle.course, bundle.items);
          onClose();
        }}
      />
    );
  }

  return (
    <form
      className="mt-4 rounded-lg bg-cream p-4 shadow-card"
      onSubmit={(event) => {
        event.preventDefault();
        void read(text);
      }}
    >
      <label className="block text-sm" htmlFor="syllabus">
        Paste the syllabus
      </label>
      <textarea
        id="syllabus"
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={7}
        className="mt-2 w-full rounded-md border border-line bg-paper px-3 py-3"
        placeholder="Paste text, or upload a PDF or Word file."
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Reading…" : "Extract schedule"}
        </Button>
        <Button type="button" variant="quiet" disabled={busy} onClick={() => void read(SAMPLE_SYLLABUS)}>
          Try a sample
        </Button>
        <label className="relative inline-flex h-11 cursor-pointer items-center rounded-md bg-cream px-3 text-sm text-ink shadow-card">
          Upload PDF, Word, or screenshot
          <input
            type="file"
            accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,image/png,image/jpeg,image/webp"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void onFile(file);
              event.target.value = "";
            }}
          />
        </label>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
      {note ? <p className="mt-2 text-sm text-muted">{note}</p> : null}
    </form>
  );
}

function Review({
  draft,
  busy,
  onChange,
  onCancel,
  onSave,
}: {
  draft: Draft;
  busy: boolean;
  onChange: (draft: Draft) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <section className="mt-4 rounded-lg bg-cream p-4 shadow-card">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">
        {draft.source === "grok" ? "Read by Grok" : "Read on this device"} · review before adding
      </p>
      <h2 className="mt-1 font-display text-2xl">
        {draft.course.code} {draft.course.title}
      </h2>
      <p className="mt-1 text-sm text-muted">
        {[draft.course.instructor, draft.course.officeHours].filter(Boolean).join(" · ") || "No instructor line found."}
      </p>
      <ul className="mt-4 divide-y divide-line border-t border-line">
        {draft.items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center gap-2 py-2">
            <input
              value={item.title}
              aria-label="Assignment title"
              onChange={(event) =>
                onChange({
                  ...draft,
                  items: draft.items.map((row) => (row.id === item.id ? { ...row, title: event.target.value } : row)),
                })
              }
              className="h-11 min-w-0 flex-1 rounded-md border border-line bg-paper px-3 text-sm"
            />
            <input
              type="date"
              value={item.due}
              aria-label="Due date"
              onChange={(event) =>
                onChange({
                  ...draft,
                  items: draft.items.map((row) => (row.id === item.id ? { ...row, due: event.target.value } : row)),
                })
              }
              className="h-11 rounded-md border border-line bg-paper px-2 text-sm"
            />
            <button
              type="button"
              className="h-11 px-2 text-sm text-muted"
              onClick={() => onChange({ ...draft, items: draft.items.filter((row) => row.id !== item.id) })}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      {draft.items.length === 0 ? <p className="mt-3 text-sm text-muted">No dated assignments found. You can still add the course and type them in.</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" disabled={busy} onClick={onSave}>
          Add to semester
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Back
        </Button>
      </div>
    </section>
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result ?? "");
      const comma = url.indexOf(",");
      resolve(comma >= 0 ? url.slice(comma + 1) : url);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
