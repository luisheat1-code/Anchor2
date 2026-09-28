import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { confirmCheckout, startCheckout } from "@/lib/anchor/checkout.functions";
import { trialDaysLeft, useAnchor } from "@/lib/anchor/store";
import type { Plan } from "@/lib/anchor/types";
import { cn } from "@/lib/cn";

const TIERS: { id: Exclude<Plan, "preview">; name: string; price: string; detail: string; points: string[] }[] = [
  {
    id: "degree",
    name: "Monthly",
    price: "$10",
    detail: "Each month, after the free week.",
    points: ["Unlimited syllabi", "Saved quizzes and class quizzes", "Canvas dates on the schedule", "Calendar file for Google, Apple, or Outlook"],
  },
  {
    id: "year",
    name: "Year",
    price: "$90",
    detail: "Each year. Same access as monthly.",
    points: ["Unlimited syllabi", "Saved quizzes and class quizzes", "Canvas dates on the schedule", "Calendar file for Google, Apple, or Outlook"],
  },
];

function useStripeCheckout() {
  const [busy, setBusy] = useState<Exclude<Plan, "preview"> | null>(null);
  const [error, setError] = useState("");

  async function start(plan: Exclude<Plan, "preview">) {
    setBusy(plan);
    setError("");
    try {
      const result = await startCheckout({ data: { plan } });
      if (!result.ok) {
        setError(result.error);
        setBusy(null);
        return;
      }
      window.location.assign(result.url);
    } catch {
      setError("Log in, then try Stripe again.");
      setBusy(null);
    }
  }

  return { busy, error, start };
}

export function Paywall() {
  const { busy, error, start } = useStripeCheckout();

  return (
    <main className="mx-auto max-w-xl px-4 py-10 md:px-8">
      <p className="text-xs font-medium tracking-widest text-copper uppercase">Trial over</p>
      <h1 className="mt-2 font-display text-4xl">Seven days are up.</h1>
      <p className="mt-3 text-muted">The schedule stays on this device. Pay on Stripe to keep adding classes and practice.</p>
      <ul className="mt-6 space-y-3">
        {TIERS.map((tier) => (
          <li key={tier.id} className="rounded-lg bg-cream p-5 shadow-card">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-display text-2xl">{tier.name}</p>
              <p className="font-display text-3xl">{tier.price}</p>
            </div>
            <p className="mt-1 text-sm text-muted">{tier.detail}</p>
            <Button className="mt-4 w-full" type="button" disabled={busy != null} onClick={() => void start(tier.id)}>
              {busy === tier.id ? "Opening Stripe…" : "Subscribe"}
            </Button>
          </li>
        ))}
      </ul>
      {error ? <p className="mt-4 text-sm text-muted">{error}</p> : null}
      <Link to="/plan" search={{ checkout: "" }} className="mt-4 inline-flex h-11 items-center text-sm text-copper">
        Compare plans
      </Link>
    </main>
  );
}

export function Plans({ checkout = "" }: { checkout?: string }) {
  const plan = useAnchor((s) => s.plan);
  const trialStart = useAnchor((s) => s.trialStart);
  const subscribe = useAnchor((s) => s.subscribe);
  const days = trialDaysLeft(trialStart);
  const onTrial = plan === "preview" && days > 0;
  const { busy, error, start } = useStripeCheckout();
  const [confirmError, setConfirmError] = useState("");
  const [confirming, setConfirming] = useState(Boolean(checkout));

  useEffect(() => {
    if (!checkout) return;
    let cancel = false;
    void confirmCheckout({ data: { sessionId: checkout } })
      .then((result) => {
        if (cancel) return;
        if (result.ok) subscribe(result.plan);
        else setConfirmError(result.error);
      })
      .catch(() => {
        if (!cancel) setConfirmError("Stripe has not confirmed that payment.");
      })
      .finally(() => {
        if (!cancel) setConfirming(false);
      });
    return () => {
      cancel = true;
    };
  }, [checkout, subscribe]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10">
      <p className="text-xs font-medium tracking-widest text-copper uppercase">Subscription</p>
      <h1 className="mt-2 font-display text-4xl">Seven days free.</h1>
      <p className="mt-3 max-w-xl text-muted">
        {confirming
          ? "Checking the payment with Stripe."
          : onTrial
            ? days === 1
              ? "Last day of the trial. Then pay on Stripe."
              : `${days} days left. Then pay on Stripe.`
            : plan === "preview"
              ? "The free week is over."
              : "You're subscribed."}
      </p>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {TIERS.map((tier) => {
          const on = plan === tier.id;
          return (
            <li key={tier.id} className={cn("flex flex-col rounded-lg bg-cream p-5 shadow-card", on && "ring-2 ring-copper")}>
              <p className="text-sm text-muted">{tier.name}</p>
              <p className="mt-2 font-display text-4xl">{tier.price}</p>
              <p className="mt-1 text-sm text-muted">{tier.detail}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {tier.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-copper" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-5 w-full" variant={on ? "pine" : "primary"} type="button" disabled={on || busy != null} onClick={() => void start(tier.id)}>
                {on ? "Current plan" : busy === tier.id ? "Opening Stripe…" : "Subscribe"}
              </Button>
            </li>
          );
        })}
      </ul>
      {error || confirmError ? <p className="mt-4 text-sm text-muted">{error || confirmError}</p> : null}
      <p className="mt-6 max-w-xl text-sm text-muted">The free week does not ask for a card. Subscribe opens Stripe Checkout.</p>
    </main>
  );
}
