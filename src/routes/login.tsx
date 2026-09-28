import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { GROK_PROVIDERS, authClient, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { mode: "login" | "create" } => ({
    mode: search.mode === "create" ? "create" : "login",
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const { mode } = Route.useSearch();
  const [tab, setTab] = useState<Tab>(mode === "create" || mode === "login" ? "enter" : "product");
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header
        className={cn(
          "sticky top-0 z-20 border-b border-white/10 bg-pine text-cream transition-transform duration-200",
          compact ? "pointer-events-none -translate-y-full" : "translate-y-0",
        )}
        aria-hidden={compact}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <button type="button" className="font-display text-2xl" onClick={() => setTab("product")}>
            Anchor
          </button>
          {user ? (
            <Button asChild variant="primary" size="sm">
              <Link to="/">Open schedule</Link>
            </Button>
          ) : (
            <Button type="button" variant="primary" size="sm" onClick={() => setTab("enter")}>
              Start free week
            </Button>
          )}
        </div>
        <nav
          className={cn("grid transition-[grid-template-rows] duration-200", compact ? "grid-rows-[0fr]" : "grid-rows-[1fr]")}
          aria-label="Site"
          aria-hidden={compact}
        >
          <div className="overflow-hidden">
            <div className={cn("mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 md:px-8", compact ? "pb-0" : "pb-3")}>
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  tabIndex={compact ? -1 : 0}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "h-10 shrink-0 rounded-md px-3 text-sm",
                    tab === item.id ? "bg-cream text-ink" : "text-cream/80 hover:bg-pine-soft",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </header>
      {isPending ? (
        <main className="mx-auto max-w-6xl px-4 py-16 md:px-8">
          <div className="h-80 animate-pulse rounded-lg bg-cream" />
        </main>
      ) : tab === "enter" ? (
        <Enter user={user} initialMode={mode} />
      ) : tab === "students" ? (
        <Students onStart={() => setTab("enter")} />
      ) : tab === "help" ? (
        <Helps onStart={() => setTab("enter")} />
      ) : tab === "story" ? (
        <Story onStart={() => setTab("enter")} />
      ) : (
        <Product onStart={() => setTab("enter")} signedIn={Boolean(user)} />
      )}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted md:px-8">
          <p>Anchor. Built for the semester you are actually in.</p>
          <p>7 days free, then $10 a month or $90 a year.</p>
        </div>
      </footer>
    </div>
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: "product", label: "The product" },
  { id: "students", label: "Who it's for" },
  { id: "help", label: "How it helps" },
  { id: "story", label: "The story" },
  { id: "enter", label: "Log in" },
];

type Tab = "product" | "students" | "help" | "story" | "enter";

function Product({ onStart, signedIn }: { onStart: () => void; signedIn: boolean }) {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_0.8fr] md:px-8 md:py-16">
        <div>
          <p className="text-xs font-medium tracking-widest text-copper uppercase">College, without the scavenger hunt</p>
          <h1 className="mt-3 font-display text-5xl leading-tight md:text-6xl">The syllabus, the week, and the exam. One place.</h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Anchor reads the syllabus, keeps every due date, and makes you practice before the test you are worried about. Not another notes app. The semester, held still.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={onStart}>
              {signedIn ? "You already have an account" : "Start the free week"}
            </Button>
            <p className="self-center text-sm text-muted">No card for seven days.</p>
          </div>
        </div>
        <ol className="space-y-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-lg bg-cream p-5 shadow-card">
              <p className="text-xs tracking-widest text-copper uppercase">0{index + 1}</p>
              <h2 className="mt-1 font-display text-2xl">{step.title}</h2>
              <p className="mt-1 text-sm text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="border-y border-line bg-cream">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3 md:px-8">
          {PILLARS.map((item) => (
            <div key={item.title}>
              <h2 className="font-display text-2xl">{item.title}</h2>
              <p className="mt-2 text-sm text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

const STEPS = [
  { title: "Drop in the syllabus", body: "PDF, Word, a photo, or a paste. Classes, due dates, and grading weights come out. You fix anything that looks guessed." },
  { title: "See the week", body: "Meetings and deadlines on one page. Send the same dates to Google Calendar, or pull what Canvas already scheduled." },
  { title: "Practice the exam", body: "When the date is close, Anchor drills the class from the notes you saved." },
];

const PILLARS = [
  { title: "A schedule you can trust", body: "The home page is this week. Not a chart. Not a streak. What is due, and when you meet." },
  { title: "A week you can see", body: "Class times and due dates sit on one board. Send them to Google Calendar, or pull what Canvas already scheduled." },
  { title: "Practice with a stake", body: "A quiz app that does not know your exam date is a toy. Practice sits next to the class it belongs to." },
];

function Students({ onStart }: { onStart: () => void }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
      <p className="text-xs font-medium tracking-widest text-copper uppercase">Who it's for</p>
      <h1 className="mt-3 max-w-3xl font-display text-5xl">Undergraduates who can do the work, once they can see it.</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Five classes. A job. A commute. A group chat that is not a calendar. Anchor is for the student whose syllabus is a PDF they meant to read.
      </p>
      <ul className="mt-8 grid gap-3 md:grid-cols-2">
        {PEOPLE.map((item) => (
          <li key={item.title} className="rounded-lg bg-cream p-5 shadow-card">
            <h2 className="font-display text-2xl">{item.title}</h2>
            <p className="mt-2 text-sm text-muted">{item.body}</p>
          </li>
        ))}
      </ul>
      <Button type="button" className="mt-8" onClick={onStart}>
        Make an account
      </Button>
    </main>
  );
}

const PEOPLE = [
  { title: "The first-year with four PDFs", body: "Each professor hides the dates in a different place. Anchor puts them on one week before the second week of class." },
  { title: "The junior with a shift after lab", body: "You do not need a planner that wants a morning routine. You need to know that the lab report and the midterm are twelve hours apart." },
  { title: "The student who studies the wrong chapter", body: "Practice is tied to the class on the schedule, so the hour you have is spent on the exam that is actually coming." },
  { title: "Anyone who studies the night before", body: "Practice sits next to the class on the schedule, so the hour you have goes to the exam that is actually coming." },
];

function Helps({ onStart }: { onStart: () => void }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
      <p className="text-xs font-medium tracking-widest text-copper uppercase">How it helps</p>
      <h1 className="mt-3 max-w-3xl font-display text-5xl">Less hunting. A harder question at the right time.</h1>
      <ol className="mt-8 divide-y divide-line border-y border-line">
        {HELPS.map((item, index) => (
          <li key={item.title} className="grid gap-2 py-5 md:grid-cols-[8rem_1fr] md:gap-8">
            <p className="font-display text-3xl text-copper">0{index + 1}</p>
            <div>
              <h2 className="font-display text-2xl">{item.title}</h2>
              <p className="mt-1 max-w-2xl text-muted">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <Button type="button" className="mt-8" onClick={onStart}>
        Try it on this semester
      </Button>
    </main>
  );
}

const HELPS = [
  { title: "The week is visible", body: "Upload a syllabus or paste the Canvas calendar feed. Class times and due dates land on one schedule, and can go to Google Calendar." },
  { title: "The week stays in front of you", body: "Upload a syllabus or paste the Canvas calendar feed. Class times and due dates land on one schedule, and can go to Google Calendar." },
  { title: "The exam gets a rehearsal", body: "Practice is for the class you are in, before the date on the schedule. Not a deck you forgot you made in September." },
  { title: "The account is the trial", body: "Seven days free. Then $10 a month or $90 for the year. The semester you already entered stays on this device." },
];

function Story({ onStart }: { onStart: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
      <p className="text-xs font-medium tracking-widest text-copper uppercase">Why it exists</p>
      <h1 className="mt-3 font-display text-5xl">A student got tired of being the system.</h1>
      <div className="mt-6 space-y-4 text-lg text-muted">
        <p>
          It was a Tuesday. Organic chemistry at nine, a paper at noon, a calculus midterm he had not started, because the dates lived in three syllabi, a group chat, and a screenshot from August.
        </p>
        <p>
          He was not bad at school. He was bad at holding a semester in his head. The quiz app did not know what was due. The calendar did not know the final was worth thirty percent. Nothing asked, the night before, whether he could actually do the problem.
        </p>
        <p>
          So he built Anchor. One place that reads the syllabus, keeps the week, and makes you practice for the exam you are afraid of. Not because organization is a personality. Because the work is hard enough without losing the date.
        </p>
      </div>
      <Button type="button" className="mt-8" onClick={onStart}>
        Start the free week
      </Button>
    </main>
  );
}

function Enter({ user, initialMode }: { user: { displayName: string | null; primaryEmail: string | null } | null; initialMode: "login" | "create" }) {
  return (
    <main className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-12 md:grid-cols-2 md:px-8 md:py-16">
      <div>
        <p className="text-xs font-medium tracking-widest text-copper uppercase">Your semester</p>
        <h1 className="mt-3 font-display text-5xl">Come in. The week is waiting.</h1>
        <p className="mt-4 text-muted">
          An account starts the seven-day trial. Syllabi, Canvas dates, and practice stay on this device.
        </p>
      </div>
      {user ? (
        <section className="rounded-lg bg-cream p-6 shadow-card">
          <h2 className="font-display text-3xl">You're in.</h2>
          <p className="mt-2 text-sm text-muted">{user.displayName ?? user.primaryEmail}</p>
          <Button asChild className="mt-5">
            <Link to="/">Back to the schedule</Link>
          </Button>
        </section>
      ) : (
        <AccountForm initialMode={initialMode} />
      )}
    </main>
  );
}

function AccountForm({ initialMode }: { initialMode: "login" | "create" }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const creating = mode === "create";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      const result = creating
        ? await authClient.signUp.email({ email: email.trim(), password, name: name.trim() || email.trim() })
        : await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) {
        setError(friendly(result.error.message ?? "", creating));
        return;
      }
      await navigate({ to: "/" });
    } catch {
      setError(creating ? "Could not create that account." : "Could not log in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg bg-cream p-6 text-center shadow-card">
      <h1 className="font-display text-4xl">{creating ? "Create account" : "Log in"}</h1>
      <p className="mt-2 text-sm text-muted">An account starts the 7-day trial. The semester stays on this device.</p>
      <div className="mt-5 flex justify-center gap-3">
        {GROK_PROVIDERS.map((provider) => (
          <button
            key={provider.providerId}
            type="button"
            aria-label={`Continue with ${provider.label}`}
            className="flex size-14 items-center justify-center rounded-md bg-paper shadow-card hover:-translate-y-0.5"
            onClick={() => void signIn(provider.providerId, { callbackURL: "/" })}
          >
            {provider.idp === "google" ? <GoogleMark /> : <XMark />}
          </button>
        ))}
      </div>
      <p className="mt-5 text-xs tracking-wide text-muted uppercase">Or use email</p>
      <form className="mt-4 space-y-3 text-left" onSubmit={(event) => void submit(event)}>
        {creating ? (
          <label className="block text-sm">
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className="mt-1 h-11 w-full rounded-md border border-line bg-paper px-3"
            />
          </label>
        ) : null}
        <label className="block text-sm">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className="mt-1 h-11 w-full rounded-md border border-line bg-paper px-3"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={creating ? "new-password" : "current-password"}
            className="mt-1 h-11 w-full rounded-md border border-line bg-paper px-3"
          />
        </label>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "One moment…" : creating ? "Create account" : "Log in"}
        </Button>
        {error ? <p className="text-center text-sm text-muted">{error}</p> : null}
      </form>
      <button
        type="button"
        className="mt-4 h-11 text-sm text-copper"
        onClick={() => {
          setMode(creating ? "login" : "create");
          setError("");
        }}
      >
        {creating ? "Already have an account?" : "Create account"}
      </button>
    </section>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-6" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.1 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.6 7.1l6.3 5.3C37.4 38.3 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function friendly(message: string, creating: boolean) {
  const text = message.toLowerCase();
  if (text.includes("exist") || text.includes("already")) return "That email already has an account. Log in instead.";
  if (text.includes("invalid") || text.includes("credential") || text.includes("password")) {
    return creating ? "Check the email and use at least 8 characters." : "That email and password do not match.";
  }
  return message || (creating ? "Could not create that account." : "Could not log in.");
}
