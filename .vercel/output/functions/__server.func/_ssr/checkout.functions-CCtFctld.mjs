import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-DmeW4669.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/checkout.functions-CCtFctld.js
function asPlan(data) {
	if (!data || typeof data !== "object") throw new Error("Bad request");
	const plan = data.plan;
	if (plan !== "year" && plan !== "degree") throw new Error("Pick a plan");
	return plan;
}
function asSession(data) {
	if (!data || typeof data !== "object") throw new Error("Bad request");
	const sessionId = data.sessionId;
	if (typeof sessionId !== "string" || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) throw new Error("Bad checkout");
	return sessionId;
}
function originOf(request) {
	const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
	const proto = request.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
	if (!host) throw new Error("Missing host");
	return `${proto}://${host}`;
}
var startCheckout_createServerFn_handler = createServerRpc({
	id: "5afdab5168debfc89fb915c3ca2b09175fd138c9e1aa141bf4bb57e335baf696",
	name: "startCheckout",
	filename: "src/lib/anchor/checkout.functions.ts"
}, (opts) => startCheckout.__executeServer(opts));
var startCheckout = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(asPlan).handler(startCheckout_createServerFn_handler, async ({ data }) => {
	const key = process.env.STRIPE_SECRET_KEY?.trim();
	if (!key) return {
		ok: false,
		error: "Stripe is not connected yet."
	};
	const { getRequest } = await import("./ssr.mjs").then((n) => n.s).then((n) => n.t);
	const request = getRequest();
	if (!request) return {
		ok: false,
		error: "Could not open Stripe."
	};
	const origin = originOf(request);
	const year = data === "year";
	const price = process.env[year ? "STRIPE_PRICE_YEAR" : "STRIPE_PRICE_DEGREE"]?.trim();
	const fields = {
		mode: "subscription",
		cancel_url: `${origin}/plan`,
		"metadata[plan]": data,
		"line_items[0][quantity]": "1"
	};
	if (price) fields["line_items[0][price]"] = price;
	else {
		fields["line_items[0][price_data][currency]"] = "usd";
		fields["line_items[0][price_data][unit_amount]"] = year ? "9000" : "1000";
		fields["line_items[0][price_data][product_data][name]"] = year ? "Anchor Year" : "Anchor Monthly";
		fields["line_items[0][price_data][product_data][tax_code]"] = "txcd_10103000";
		fields["line_items[0][price_data][recurring][interval]"] = year ? "year" : "month";
	}
	const body = `${new URLSearchParams(fields).toString()}&success_url=${encodeURIComponent(`${origin}/plan?checkout=`)}{CHECKOUT_SESSION_ID}`;
	const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${key}`,
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body
	});
	const json = await res.json();
	if (!res.ok || !json.url) return {
		ok: false,
		error: json.error?.message || "Could not open Stripe."
	};
	return {
		ok: true,
		url: json.url
	};
});
var confirmCheckout_createServerFn_handler = createServerRpc({
	id: "f2ace18ac782af0b3fad58654a2a27adde702786b6c2b969f7814838281b8ad2",
	name: "confirmCheckout",
	filename: "src/lib/anchor/checkout.functions.ts"
}, (opts) => confirmCheckout.__executeServer(opts));
var confirmCheckout = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(asSession).handler(confirmCheckout_createServerFn_handler, async ({ data }) => {
	const key = process.env.STRIPE_SECRET_KEY?.trim();
	if (!key) return {
		ok: false,
		error: "Stripe is not connected yet."
	};
	const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${data}`, { headers: { Authorization: `Bearer ${key}` } });
	const json = await res.json();
	const plan = json.metadata?.plan;
	if (!res.ok || json.status !== "complete" || json.payment_status !== "paid" || plan !== "year" && plan !== "degree") return {
		ok: false,
		error: "Stripe has not confirmed that payment."
	};
	return {
		ok: true,
		plan
	};
});
//#endregion
export { confirmCheckout_createServerFn_handler, startCheckout_createServerFn_handler };
