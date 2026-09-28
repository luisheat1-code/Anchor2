import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

type PaidPlan = "year" | "degree";

function asPlan(data: unknown): PaidPlan {
  if (!data || typeof data !== "object") throw new Error("Bad request");
  const plan = (data as { plan?: unknown }).plan;
  if (plan !== "year" && plan !== "degree") throw new Error("Pick a plan");
  return plan;
}

function asSession(data: unknown): string {
  if (!data || typeof data !== "object") throw new Error("Bad request");
  const sessionId = (data as { sessionId?: unknown }).sessionId;
  if (typeof sessionId !== "string" || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) throw new Error("Bad checkout");
  return sessionId;
}

function originOf(request: Request) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const forwarded = request.headers.get("x-forwarded-proto");
  const proto = forwarded ?? (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  if (!host) throw new Error("Missing host");
  return `${proto}://${host}`;
}

export const startCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(asPlan)
  .handler(async ({ data }): Promise<{ ok: true; url: string } | { ok: false; error: string }> => {
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    if (!key) return { ok: false, error: "Stripe is not connected yet." };
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    if (!request) return { ok: false, error: "Could not open Stripe." };
    const origin = originOf(request);
    const year = data === "year";
    const price = process.env[year ? "STRIPE_PRICE_YEAR" : "STRIPE_PRICE_DEGREE"]?.trim();
    const fields: Record<string, string> = {
      mode: "subscription",
      cancel_url: `${origin}/plan`,
      "metadata[plan]": data,
      "line_items[0][quantity]": "1",
    };
    if (price) {
      fields["line_items[0][price]"] = price;
    } else {
      fields["line_items[0][price_data][currency]"] = "usd";
      fields["line_items[0][price_data][unit_amount]"] = year ? "9000" : "1000";
      fields["line_items[0][price_data][product_data][name]"] = year ? "Anchor Year" : "Anchor Monthly";
      fields["line_items[0][price_data][product_data][tax_code]"] = "txcd_10103000";
      fields["line_items[0][price_data][recurring][interval]"] = year ? "year" : "month";
    }
    const body = `${new URLSearchParams(fields).toString()}&success_url=${encodeURIComponent(`${origin}/plan?checkout=`)}{CHECKOUT_SESSION_ID}`;
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const json = (await res.json()) as { url?: string; error?: { message?: string } };
    if (!res.ok || !json.url) return { ok: false, error: json.error?.message || "Could not open Stripe." };
    return { ok: true, url: json.url };
  });

export const confirmCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(asSession)
  .handler(async ({ data }): Promise<{ ok: true; plan: PaidPlan } | { ok: false; error: string }> => {
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    if (!key) return { ok: false, error: "Stripe is not connected yet." };
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${data}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const json = (await res.json()) as { status?: string; payment_status?: string; metadata?: { plan?: string } };
    const plan = json.metadata?.plan;
    if (!res.ok || json.status !== "complete" || json.payment_status !== "paid" || (plan !== "year" && plan !== "degree")) {
      return { ok: false, error: "Stripe has not confirmed that payment." };
    }
    return { ok: true, plan };
  });
