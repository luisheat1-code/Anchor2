import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-DmeW4669.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/remind.functions-BWhKQkrk.js
function asReminder(data) {
	if (!data || typeof data !== "object") throw new Error("Bad request");
	const row = data;
	const email = typeof row.email === "string" ? row.email.trim().slice(0, 180) : "";
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a real email address");
	const tomorrow = typeof row.tomorrow === "string" && /^\d{4}-\d{2}-\d{2}$/.test(row.tomorrow) ? row.tomorrow : "";
	if (!tomorrow) throw new Error("Missing date");
	return {
		email,
		tomorrow,
		lines: Array.isArray(row.lines) ? row.lines.slice(0, 30).map(asLine).filter((line) => line != null) : []
	};
}
function asLine(value) {
	if (!value || typeof value !== "object") return null;
	const row = value;
	const title = typeof row.title === "string" ? row.title.trim().slice(0, 180) : "";
	const due = typeof row.due === "string" && /^\d{4}-\d{2}-\d{2}$/.test(row.due) ? row.due : "";
	if (!title || !due) return null;
	return {
		title,
		course: typeof row.course === "string" ? row.course.trim().slice(0, 40) : "",
		due,
		kind: typeof row.kind === "string" ? row.kind.slice(0, 20) : "assignment"
	};
}
function escapeHtml(value) {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;");
}
function dayLabel(iso) {
	const [year, month, day] = iso.split("-").map(Number);
	return new Date(year, (month ?? 1) - 1, day ?? 1).toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric"
	});
}
function messageFor(tomorrow, lines) {
	const due = lines.filter((line) => line.due === tomorrow);
	const showing = due.length > 0 ? due : lines.slice(0, 8);
	const subject = due.length > 0 ? due.length === 1 ? `Due tomorrow: ${due[0].title}` : `Due tomorrow: ${due.length} things` : showing.length > 0 ? "Nothing due tomorrow" : "Your schedule is clear";
	const intro = due.length > 0 ? "This is due tomorrow." : showing.length > 0 ? "Nothing is due tomorrow. Here is what is next." : "Nothing unfinished is on the schedule.";
	const items = showing.map((line) => `<li style="margin:0 0 12px;font-family:Georgia,serif;font-size:18px;">${escapeHtml(line.title)}<br><span style="font-family:sans-serif;font-size:13px;color:#5c564c;">${escapeHtml([
		line.course,
		line.kind,
		dayLabel(line.due)
	].filter(Boolean).join(" · "))}</span></li>`).join("");
	return {
		subject,
		html: `<div style="background:#F4EFE6;padding:28px;color:#1A1814;">
    <p style="margin:0;font-family:sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#C45C26;">Anchor</p>
    <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-weight:normal;font-size:32px;">${escapeHtml(subject)}</h1>
    <p style="font-family:sans-serif;font-size:15px;line-height:1.5;">${escapeHtml(intro)}</p>
    ${items ? `<ul style="padding-left:18px;">${items}</ul>` : ""}
    <p style="font-family:sans-serif;font-size:13px;color:#5c564c;">Mark work done in Anchor and it drops off the next note.</p>
  </div>`
	};
}
var sendDueReminder_createServerFn_handler = createServerRpc({
	id: "c126f76808c67d9ecbda73947d3ba6cec985c281ee239f03621b96636e80965f",
	name: "sendDueReminder",
	filename: "src/lib/anchor/remind.functions.ts"
}, (opts) => sendDueReminder.__executeServer(opts));
var sendDueReminder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(asReminder).handler(sendDueReminder_createServerFn_handler, async ({ data }) => {
	const key = process.env.RESEND_API_KEY?.trim();
	if (!key) return {
		ok: false,
		error: "Email is not connected."
	};
	const from = process.env.RESEND_FROM?.trim() || "onboarding@resend.dev";
	const { subject, html } = messageFor(data.tomorrow, data.lines);
	const { Resend } = await import("../_libs/resend+standardwebhooks.mjs").then((n) => n.t);
	const sent = await new Resend(key).emails.send({
		from,
		to: data.email,
		subject,
		html
	});
	if (sent.error) return {
		ok: false,
		error: sent.error.message
	};
	return { ok: true };
});
//#endregion
export { sendDueReminder_createServerFn_handler };
