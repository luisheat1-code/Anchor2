import { Link, Navigate, useRouterState } from "@tanstack/react-router";
import { BadgeCheck, CalendarDays, ListChecks } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/cn";
import { hasAccess, trialDaysLeft, useAnchor } from "@/lib/anchor/store";
import { Paywall } from "@/components/anchor/plans";

const links = [
  { to: "/", label: "Schedule", icon: CalendarDays, match: (path: string) => path === "/" || path.startsWith("/course") },
  { to: "/practice", label: "Practice", icon: ListChecks, match: (path: string) => path.startsWith("/practice") },
  { to: "/plan", label: "Plan", icon: BadgeCheck, match: (path: string) => path.startsWith("/plan") },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isPending } = useCurrentUserState();
  const plan = useAnchor((s) => s.plan);
  const trialStart = useAnchor((s) => s.trialStart);
  const days = trialDaysLeft(trialStart);
  const locked = !hasAccess(plan, trialStart);

  useEffect(() => {
    if (!user) return;
    let cancel = false;
    void (async () => {
      await useAnchor.persist.rehydrate();
      if (!cancel && !useAnchor.getState().trialStart) useAnchor.getState().startTrial();
    })();
    return () => {
      cancel = true;
    };
  }, [user]);

  if (isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper">
        <p className="font-display text-3xl">Anchor</p>
      </main>
    );
  }

  if (!user) return <Navigate to="/login" search={{ mode: "login" }} />;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="md:grid md:grid-cols-[232px_minmax(0,1fr)]">
        <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:flex-col md:justify-between bg-pine px-4 py-6 text-cream">
          <div>
            <Link to="/" className="block px-2">
              <span className="font-display text-3xl leading-none">Anchor</span>
              <p className="mt-1 text-sm text-cream/70">Semester schedule</p>
            </Link>
            <nav className="mt-8 flex flex-col gap-1" aria-label="Primary">
              {links.map((item) => {
                const on = item.match(pathname);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                      on ? "bg-pine-soft text-cream" : "text-cream/75 hover:bg-pine-soft/80",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <Link to="/plan" search={{ checkout: "" }} className="rounded-md px-3 py-3 text-sm text-cream/80 transition-colors hover:bg-pine-soft">
            <span className="block text-xs tracking-wide uppercase text-cream/50">Plan</span>
            <span className="font-medium text-cream">{planLabel(plan, days, locked)}</span>
          </Link>
        </aside>
        <div className="min-w-0 pb-24 md:pb-10">
          <div className="flex h-14 items-center justify-end gap-2 px-4 md:px-8">
            <AccountSlot />
          </div>
          {plan === "preview" && trialStart != null && days > 0 ? (
            <div className="mx-4 mb-2 flex flex-wrap items-center justify-between gap-2 rounded-md bg-cream px-4 py-2 text-sm md:mx-8">
              <p>{days === 1 ? "Last day of the free trial." : `${days} days left in the free trial.`}</p>
              <Link to="/plan" search={{ checkout: "" }} className="inline-flex h-11 items-center text-copper">
                See plans
              </Link>
            </div>
          ) : null}
          {locked && pathname !== "/plan" ? <Paywall /> : children}
        </div>
      </div>
      <nav
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-line bg-cream md:hidden"
        aria-label="Primary"
      >
        {links.map((item) => {
          const on = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 text-xs transition-colors",
                on ? "text-copper" : "text-muted",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function planLabel(plan: "preview" | "year" | "degree", days: number, locked: boolean) {
  if (plan === "year") return "Year";
  if (plan === "degree") return "Monthly";
  if (locked) return "Trial ended";
  return days === 1 ? "1 day left" : `${days} days left`;
}

function AccountSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <div className="h-11 w-28 animate-pulse rounded-md bg-cream" aria-hidden />;
  if (user) return <UserButton />;
  return (
    <>
      <Link to="/login" search={{ mode: "login" }} className="inline-flex h-11 items-center px-3 text-sm">
        Log in
      </Link>
      <Link
        to="/login"
        search={{ mode: "create" }}
        className="inline-flex h-11 items-center rounded-md bg-copper px-3 text-sm text-cream"
      >
        Create account
      </Link>
    </>
  );
}
