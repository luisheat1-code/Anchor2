import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, d as useRouterState, v as Link, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-DmeW4669.mjs";
import { i as signOut } from "./client-CVqXY6bk.mjs";
import { a as hasGateSessionMarker } from "./server-BYpgsxuU.mjs";
import { a as Check, i as GraduationCap, o as CalendarDays, r as ListChecks, s as BadgeCheck } from "../_libs/lucide-react.mjs";
import { i as useCurrentUserState, n as cn, r as useCurrentUser, t as Button } from "./use-current-user-Cd-djnd_.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shell-CIofXlOa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var initial = {
	plan: "preview",
	courses: [],
	items: [],
	cards: [],
	quizzes: [],
	gpaRows: [],
	priorCredits: 0,
	priorGpa: null,
	trialStart: null,
	reminderEmail: "",
	added: 0
};
var useAnchor = create()(persist((set) => ({
	...initial,
	setPlan: (plan) => set({ plan }),
	startTrial: () => set((state) => state.trialStart ? state : { trialStart: Date.now() }),
	subscribe: (plan) => set({ plan }),
	addBundle: (course, items) => set((state) => ({
		added: state.added + 1,
		courses: [course, ...state.courses.filter((row) => row.id !== course.id)],
		items: [...items, ...state.items.filter((row) => row.courseId !== course.id)]
	})),
	toggleDone: (id) => set((state) => ({ items: state.items.map((item) => item.id === id ? {
		...item,
		done: !item.done
	} : item) })),
	updateItem: (id, patch) => set((state) => ({ items: state.items.map((item) => item.id === id ? {
		...item,
		...patch
	} : item) })),
	removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
	addCard: (card) => set((state) => ({ cards: [card, ...state.cards ?? []] })),
	updateCard: (id, patch) => set((state) => ({ cards: (state.cards ?? []).map((card) => card.id === id ? {
		...card,
		...patch
	} : card) })),
	removeCard: (id) => set((state) => ({ cards: (state.cards ?? []).filter((card) => card.id !== id) })),
	saveQuiz: (quiz) => set((state) => ({ quizzes: [quiz, ...(state.quizzes ?? []).filter((row) => row.id !== quiz.id)] })),
	removeQuiz: (id) => set((state) => ({ quizzes: (state.quizzes ?? []).filter((row) => row.id !== id) })),
	addGpaRow: (row) => set((state) => ({ gpaRows: [...state.gpaRows ?? [], row] })),
	addGpaRows: (rows) => set((state) => ({ gpaRows: [...state.gpaRows ?? [], ...rows] })),
	updateGpaRow: (id, patch) => set((state) => ({ gpaRows: (state.gpaRows ?? []).map((row) => row.id === id ? {
		...row,
		...patch
	} : row) })),
	removeGpaRow: (id) => set((state) => ({ gpaRows: (state.gpaRows ?? []).filter((row) => row.id !== id) })),
	setPrior: (credits, gpa) => set({
		priorCredits: credits,
		priorGpa: gpa
	}),
	setScore: (courseId, partId, score) => set((state) => ({ courses: state.courses.map((course) => course.id !== courseId ? course : {
		...course,
		grading: course.grading.map((part) => part.id === partId ? {
			...part,
			score
		} : part)
	}) })),
	setMissed: (courseId, missed) => set((state) => ({ courses: state.courses.map((course) => course.id === courseId ? {
		...course,
		missed
	} : course) })),
	setReminderEmail: (email) => set({ reminderEmail: email }),
	reset: () => set((state) => ({
		...initial,
		trialStart: state.trialStart,
		reminderEmail: state.reminderEmail
	}))
}), {
	name: "anchor-schedule-v2",
	skipHydration: true,
	merge: (persisted, current) => {
		const saved = persisted ?? {};
		return {
			...current,
			...saved,
			cards: saved.cards ?? [],
			quizzes: saved.quizzes ?? [],
			gpaRows: saved.gpaRows ?? [],
			priorCredits: saved.priorCredits ?? 0,
			priorGpa: saved.priorGpa ?? null,
			trialStart: saved.trialStart ?? null,
			reminderEmail: saved.reminderEmail ?? ""
		};
	}
}));
var TRIAL_MS = 6048e5;
function trialDaysLeft(start, now = Date.now()) {
	if (start == null) return 7;
	const left = start + TRIAL_MS - now;
	if (left <= 0) return 0;
	return Math.ceil(left / 864e5);
}
function hasAccess(plan, trialStart, now = Date.now()) {
	if (plan === "year" || plan === "degree") return true;
	if (trialStart == null) return true;
	return now < trialStart + TRIAL_MS;
}
function canAdd(plan, trialStart) {
	return hasAccess(plan, trialStart);
}
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-pine text-sm text-cream",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "max-w-32 truncate text-sm",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "h-11 px-2 text-sm text-muted disabled:opacity-60",
				children: signingOut ? "Signing out…" : "Log out"
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
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
var startCheckout = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(asPlan).handler(createSsrRpc("5afdab5168debfc89fb915c3ca2b09175fd138c9e1aa141bf4bb57e335baf696"));
var confirmCheckout = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(asSession).handler(createSsrRpc("f2ace18ac782af0b3fad58654a2a27adde702786b6c2b969f7814838281b8ad2"));
var TIERS = [{
	id: "degree",
	name: "Monthly",
	price: "$10",
	detail: "Each month, after the free week.",
	points: [
		"Unlimited syllabi",
		"Saved quizzes and class quizzes",
		"GPA and what-if scores",
		"Calendar file for Google, Apple, or Outlook"
	]
}, {
	id: "year",
	name: "Year",
	price: "$90",
	detail: "Each year. Same access as monthly.",
	points: [
		"Unlimited syllabi",
		"Saved quizzes and class quizzes",
		"GPA and what-if scores",
		"Calendar file for Google, Apple, or Outlook"
	]
}];
function useStripeCheckout() {
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	async function start(plan) {
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
	return {
		busy,
		error,
		start
	};
}
function Paywall() {
	const { busy, error, start } = useStripeCheckout();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-xl px-4 py-10 md:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-copper uppercase",
				children: "Trial over"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl",
				children: "Seven days are up."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted",
				children: "The schedule stays on this device. Pay on Stripe to keep adding classes, practice, and the GPA math."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 space-y-3",
				children: TIERS.map((tier) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-lg bg-cream p-5 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-2xl",
								children: tier.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-3xl",
								children: tier.price
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: tier.detail
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4 w-full",
							type: "button",
							disabled: busy != null,
							onClick: () => void start(tier.id),
							children: busy === tier.id ? "Opening Stripe…" : "Subscribe"
						})
					]
				}, tier.id))
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/plan",
				search: { checkout: "" },
				className: "mt-4 inline-flex h-11 items-center text-sm text-copper",
				children: "Compare plans"
			})
		]
	});
}
function Plans({ checkout = "" }) {
	const plan = useAnchor((s) => s.plan);
	const trialStart = useAnchor((s) => s.trialStart);
	const subscribe = useAnchor((s) => s.subscribe);
	const days = trialDaysLeft(trialStart);
	const onTrial = plan === "preview" && days > 0;
	const { busy, error, start } = useStripeCheckout();
	const [confirmError, setConfirmError] = (0, import_react.useState)("");
	const [confirming, setConfirming] = (0, import_react.useState)(Boolean(checkout));
	(0, import_react.useEffect)(() => {
		if (!checkout) return;
		let cancel = false;
		confirmCheckout({ data: { sessionId: checkout } }).then((result) => {
			if (cancel) return;
			if (result.ok) subscribe(result.plan);
			else setConfirmError(result.error);
		}).catch(() => {
			if (!cancel) setConfirmError("Stripe has not confirmed that payment.");
		}).finally(() => {
			if (!cancel) setConfirming(false);
		});
		return () => {
			cancel = true;
		};
	}, [checkout, subscribe]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-copper uppercase",
				children: "Subscription"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl",
				children: "Seven days free."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-muted",
				children: confirming ? "Checking the payment with Stripe." : onTrial ? days === 1 ? "Last day of the trial. Then pay on Stripe." : `${days} days left. Then pay on Stripe.` : plan === "preview" ? "The free week is over." : "You're subscribed."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-8 grid gap-4 md:grid-cols-2",
				children: TIERS.map((tier) => {
					const on = plan === tier.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: cn("flex flex-col rounded-lg bg-cream p-5 shadow-card", on && "ring-2 ring-copper"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: tier.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-4xl",
								children: tier.price
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: tier.detail
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-4 flex-1 space-y-2 text-sm",
								children: tier.points.map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										className: "mt-0.5 size-4 shrink-0 text-copper",
										"aria-hidden": true
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: point })]
								}, point))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-5 w-full",
								variant: on ? "pine" : "primary",
								type: "button",
								disabled: on || busy != null,
								onClick: () => void start(tier.id),
								children: on ? "Current plan" : busy === tier.id ? "Opening Stripe…" : "Subscribe"
							})
						]
					}, tier.id);
				})
			}),
			error || confirmError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: error || confirmError
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 max-w-xl text-sm text-muted",
				children: "The free week does not ask for a card. Subscribe opens Stripe Checkout."
			})
		]
	});
}
var links = [
	{
		to: "/",
		label: "Schedule",
		icon: CalendarDays,
		match: (path) => path === "/" || path.startsWith("/course")
	},
	{
		to: "/practice",
		label: "Practice",
		icon: ListChecks,
		match: (path) => path.startsWith("/practice")
	},
	{
		to: "/grades",
		label: "Grades",
		icon: GraduationCap,
		match: (path) => path.startsWith("/grades")
	},
	{
		to: "/plan",
		label: "Plan",
		icon: BadgeCheck,
		match: (path) => path.startsWith("/plan")
	}
];
function Shell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { user, isPending } = useCurrentUserState();
	const plan = useAnchor((s) => s.plan);
	const trialStart = useAnchor((s) => s.trialStart);
	const days = trialDaysLeft(trialStart);
	const locked = !hasAccess(plan, trialStart);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		let cancel = false;
		(async () => {
			await useAnchor.persist.rehydrate();
			if (!cancel && !useAnchor.getState().trialStart) useAnchor.getState().startTrial();
		})();
		return () => {
			cancel = true;
		};
	}, [user]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-paper",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-3xl",
			children: "Anchor"
		})
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: "/login",
		search: { mode: "login" }
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-paper text-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "md:grid md:grid-cols-[232px_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "hidden md:sticky md:top-0 md:flex md:h-screen md:flex-col md:justify-between bg-pine px-4 py-6 text-cream",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "block px-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-3xl leading-none",
						children: "Anchor"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-cream/70",
						children: "Semester schedule"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "mt-8 flex flex-col gap-1",
					"aria-label": "Primary",
					children: links.map((item) => {
						const on = item.match(pathname);
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors", on ? "bg-pine-soft text-cream" : "text-cream/75 hover:bg-pine-soft/80"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-4",
								"aria-hidden": true
							}), item.label]
						}, item.to);
					})
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/plan",
					search: { checkout: "" },
					className: "rounded-md px-3 py-3 text-sm text-cream/80 transition-colors hover:bg-pine-soft",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-xs tracking-wide uppercase text-cream/50",
						children: "Plan"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-cream",
						children: planLabel(plan, days, locked)
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 pb-24 md:pb-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-14 items-center justify-end gap-2 px-4 md:px-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountSlot, {})
					}),
					plan === "preview" && trialStart != null && days > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-4 mb-2 flex flex-wrap items-center justify-between gap-2 rounded-md bg-cream px-4 py-2 text-sm md:mx-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: days === 1 ? "Last day of the free trial." : `${days} days left in the free trial.` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/plan",
							search: { checkout: "" },
							className: "inline-flex h-11 items-center text-copper",
							children: "See plans"
						})]
					}) : null,
					locked && pathname !== "/plan" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paywall, {}) : children
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-cream md:hidden",
			"aria-label": "Primary",
			children: links.map((item) => {
				const on = item.match(pathname);
				const Icon = item.icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: item.to,
					className: cn("flex h-16 flex-col items-center justify-center gap-1 text-xs transition-colors", on ? "text-copper" : "text-muted"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: "size-4",
						"aria-hidden": true
					}), item.label]
				}, item.to);
			})
		})]
	});
}
function planLabel(plan, days, locked) {
	if (plan === "year") return "Year";
	if (plan === "degree") return "Monthly";
	if (locked) return "Trial ended";
	return days === 1 ? "1 day left" : `${days} days left`;
}
function AccountSlot() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-11 w-28 animate-pulse rounded-md bg-cream",
		"aria-hidden": true
	});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/login",
		search: { mode: "login" },
		className: "inline-flex h-11 items-center px-3 text-sm",
		children: "Log in"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/login",
		search: { mode: "create" },
		className: "inline-flex h-11 items-center rounded-md bg-copper px-3 text-sm text-cream",
		children: "Create account"
	})] });
}
//#endregion
export { useAnchor as a, createSsrRpc as i, Shell as n, canAdd as r, Plans as t };
