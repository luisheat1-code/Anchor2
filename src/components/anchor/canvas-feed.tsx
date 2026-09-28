import { useState } from "react";
import { Button } from "@/components/ui/button";
import { importCanvasFeed } from "@/lib/anchor/canvas.functions";
import { useAnchor } from "@/lib/anchor/store";

export function CanvasFeed() {
  const mergeFeed = useAnchor((s) => s.mergeFeed);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNote("");
    try {
      const result = await importCanvasFeed({ data: { url } });
      if (!result.ok) {
        setNote(result.error);
        return;
      }
      mergeFeed(result.groups);
      setUrl("");
      setNote(
        result.count === 1 ? "1 Canvas assignment is on the schedule." : `${result.count} Canvas assignments are on the schedule.`,
      );
    } catch {
      setNote("Could not read that link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 rounded-lg bg-cream p-5 shadow-card md:p-6">
      <p className="text-xs font-medium tracking-widest text-copper uppercase">Canvas</p>
      <h2 className="mt-2 font-display text-2xl">Bring the assignments Canvas already has.</h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        In Canvas, open Calendar, then Calendar feed. Paste that private link. Anchor adds what is coming up. The link is not saved.
      </p>
      <form className="mt-4 flex flex-wrap gap-2" onSubmit={(event) => void submit(event)}>
        <label className="sr-only" htmlFor="canvas-feed">
          Canvas calendar feed
        </label>
        <input
          id="canvas-feed"
          type="url"
          required
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://school.instructure.com/feeds/calendars/…"
          className="h-11 min-w-0 flex-1 rounded-md border border-line bg-paper px-3 text-sm"
        />
        <Button type="submit" disabled={busy}>
          {busy ? "Reading…" : "Add from Canvas"}
        </Button>
      </form>
      {note ? <p className="mt-3 text-sm text-muted">{note}</p> : null}
    </section>
  );
}
