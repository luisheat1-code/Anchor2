import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-CVqXY6bk.mjs";
import { t as GROK_PROVIDERS } from "./server-BYpgsxuU.mjs";
import { a as Route$5 } from "./router-DNr-VpGd.mjs";
import { i as useCurrentUserState, t as Button } from "./use-current-user-Cd-djnd_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-BovnYb1U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const { user, isPending } = useCurrentUserState();
	const { mode } = Route$5.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-paper px-4 py-10 text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "block text-center font-display text-3xl",
				children: "Anchor"
			}), isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-8 h-80 animate-pulse rounded-lg bg-cream" }) : user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 rounded-lg bg-cream p-6 shadow-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl",
						children: "You're in."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: user.displayName ?? user.primaryEmail
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "mt-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							children: "Back to the schedule"
						})
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountForm, { initialMode: mode })]
		})
	});
}
function AccountForm({ initialMode }) {
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)(initialMode);
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const creating = mode === "create";
	async function submit(event) {
		event.preventDefault();
		setError("");
		if (password.length < 8) {
			setError("Use at least 8 characters.");
			return;
		}
		setBusy(true);
		try {
			const result = creating ? await authClient.signUp.email({
				email: email.trim(),
				password,
				name: name.trim() || email.trim()
			}) : await authClient.signIn.email({
				email: email.trim(),
				password
			});
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6 rounded-lg bg-cream p-6 text-center shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: creating ? "Create account" : "Log in"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "An account starts the 7-day trial. The semester stays on this device."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 flex justify-center gap-3",
				children: GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": `Continue with ${provider.label}`,
					className: "flex size-14 items-center justify-center rounded-md bg-paper shadow-card hover:-translate-y-0.5",
					onClick: () => void signIn(provider.providerId, { callbackURL: "/" }),
					children: provider.idp === "google" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleMark, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XMark, {})
				}, provider.providerId))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 text-xs tracking-wide text-muted uppercase",
				children: "Or use email"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 space-y-3 text-left",
				onSubmit: (event) => void submit(event),
				children: [
					creating ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm",
						children: ["Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: name,
							onChange: (event) => setName(event.target.value),
							autoComplete: "name",
							className: "mt-1 h-11 w-full rounded-md border border-line bg-paper px-3"
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm",
						children: ["Email", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "email",
							required: true,
							value: email,
							onChange: (event) => setEmail(event.target.value),
							autoComplete: "email",
							className: "mt-1 h-11 w-full rounded-md border border-line bg-paper px-3"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm",
						children: ["Password", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "password",
							required: true,
							value: password,
							onChange: (event) => setPassword(event.target.value),
							autoComplete: creating ? "new-password" : "current-password",
							className: "mt-1 h-11 w-full rounded-md border border-line bg-paper px-3"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						disabled: busy,
						children: busy ? "One moment…" : creating ? "Create account" : "Log in"
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-sm text-muted",
						children: error
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-4 h-11 text-sm text-copper",
				onClick: () => {
					setMode(creating ? "login" : "create");
					setError("");
				},
				children: creating ? "Already have an account?" : "Create account"
			})
		]
	});
}
function GoogleMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 48 48",
		className: "size-6",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#FFC107",
				d: "M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#FF3D00",
				d: "M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#4CAF50",
				d: "M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.1 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#1976D2",
				d: "M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.6 7.1l6.3 5.3C37.4 38.3 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"
			})
		]
	});
}
function XMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: "size-5",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"
		})
	});
}
function friendly(message, creating) {
	const text = message.toLowerCase();
	if (text.includes("exist") || text.includes("already")) return "That email already has an account. Log in instead.";
	if (text.includes("invalid") || text.includes("credential") || text.includes("password")) return creating ? "Check the email and use at least 8 characters." : "That email and password do not match.";
	return message || (creating ? "Could not create that account." : "Could not log in.");
}
//#endregion
export { LoginPage as component };
