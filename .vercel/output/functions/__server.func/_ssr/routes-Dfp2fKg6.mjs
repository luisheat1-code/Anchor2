import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-DmeW4669.mjs";
import { n as Plus } from "../_libs/lucide-react.mjs";
import { i as useCurrentUserState, n as cn, t as Button } from "./use-current-user-Cd-djnd_.mjs";
import { _ as weekDates, d as parseSyllabus, g as todayISO, h as toIcs, i as clockLabel, n as addDays, r as applyDraft, s as formatDay, v as weekday } from "./logic-D6zdnu3-.mjs";
import { a as useAnchor, i as createSsrRpc, n as Shell, r as canAdd } from "./shell-CIofXlOa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Dfp2fKg6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function asInput(data) {
	if (!data || typeof data !== "object") throw new Error("Bad request");
	const row = data;
	const text = typeof row.text === "string" ? row.text.trim().slice(0, 12e3) : "";
	const image = typeof row.image === "string" ? row.image.slice(0, 4e6) : "";
	if (!text && !image) throw new Error("Paste a syllabus or add a screenshot");
	if (image && !image.startsWith("data:image/")) throw new Error("Screenshot must be an image");
	return {
		text,
		image
	};
}
var extractSyllabus = createServerFn({ method: "POST" }).validator(asInput).handler(createSsrRpc("8761d0accf0a95fb1a702a9d920033eb7a88df546baff172be2fa54d8924a4eb"));
function asFile(data) {
	if (!data || typeof data !== "object") throw new Error("Bad request");
	const row = data;
	const name = typeof row.name === "string" ? row.name.slice(0, 180) : "syllabus";
	const base64 = typeof row.base64 === "string" ? row.base64.replace(/\s/g, "") : "";
	if (base64.length < 16) throw new Error("Empty file");
	if (base64.length > 8e6) throw new Error("File is too large");
	return {
		name,
		base64
	};
}
var readDocument = createServerFn({ method: "POST" }).validator(asFile).handler(createSsrRpc("37071d12b5321cb08b321a0dd837ac226e5a4871ba4827ad4b8fd94628981292"));
var SAMPLE_SYLLABUS = `MATH 210 Linear Algebra
Instructor: Dr. Iyer
Office hours: Wed 2:00–3:00pm, Pierce 214
Meetings: MWF 9:00–9:50, Pierce 110
Attendance: each unexcused absence lowers participation by 2%.
Late work: 10% off per day, not accepted after 3 days.

Grading:
Homework 20%
Quizzes 15%
Midterm 30%
Final 35%

Homework 1 due Sep 29, 2026
Quiz 1 due Oct 2, 2026
Midterm exam Oct 14, 2026
Problem set 2 due Oct 16, 2026
Final exam Dec 11, 2026
`;
function AddSyllabus({ onClose }) {
	const plan = useAnchor((s) => s.plan);
	const trialStart = useAnchor((s) => s.trialStart);
	const addBundle = useAnchor((s) => s.addBundle);
	const open = canAdd(plan, trialStart);
	const [text, setText] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)("");
	const [draft, setDraft] = (0, import_react.useState)(null);
	async function read(source, image) {
		setBusy(true);
		setNote("");
		const local = source.trim().length > 12 ? parseSyllabus(source) : null;
		if (local && (local.items.length > 0 || local.course.meetings.length > 0)) {
			setDraft(local);
			setBusy(false);
		}
		if (!(Boolean(image) || source.trim().length > 40)) {
			setBusy(false);
			if (!local) setNote("Paste the syllabus text, then extract.");
			return;
		}
		try {
			const remote = await withTimeout(extractSyllabus({ data: {
				text: source,
				image
			} }), 12e3);
			if (remote.ok && (remote.draft.items.length || remote.draft.course.meetings.length)) {
				setDraft(remote.draft);
				setNote("");
			} else if (!local) setNote(remote.ok ? "Nothing dated was found. Add a line with a due date." : remote.error);
		} catch {
			if (!local) setNote("Could not read that. Paste the syllabus text instead.");
		} finally {
			setBusy(false);
		}
	}
	async function onFile(file) {
		const name = file.name.toLowerCase();
		if (file.type.startsWith("image/")) {
			await read("", await fileToDataUrl(file));
			return;
		}
		if (name.endsWith(".doc") && !name.endsWith(".docx")) {
			setNote("Older .doc files are not supported. Save it as .docx or PDF.");
			return;
		}
		if (name.endsWith(".pdf") || name.endsWith(".docx") || file.type === "application/pdf") {
			if (file.size > 6e6) {
				setNote("That file is over 6 MB. Paste the syllabus, or upload a shorter PDF.");
				return;
			}
			setBusy(true);
			setNote("");
			try {
				const result = await readDocument({ data: {
					name: file.name,
					base64: await fileToBase64(file)
				} });
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
	if (!open) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-4 rounded-lg bg-cream p-5 shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "The free trial is over."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Subscribe to add another syllabus."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/plan",
					search: { checkout: "" },
					children: "See plans"
				})
			})
		]
	});
	if (draft) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Review, {
		draft,
		busy,
		onChange: setDraft,
		onCancel: () => setDraft(null),
		onSave: () => {
			const bundle = applyDraft(draft, draft.source);
			addBundle(bundle.course, bundle.items);
			onClose();
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-4 rounded-lg bg-cream p-4 shadow-card",
		onSubmit: (event) => {
			event.preventDefault();
			read(text);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "block text-sm",
				htmlFor: "syllabus",
				children: "Paste the syllabus"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				id: "syllabus",
				value: text,
				onChange: (event) => setText(event.target.value),
				rows: 7,
				className: "mt-2 w-full rounded-md border border-line bg-paper px-3 py-3",
				placeholder: "Paste text, or upload a PDF or Word file."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy,
						children: busy ? "Reading…" : "Extract schedule"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "quiet",
						disabled: busy,
						onClick: () => void read(SAMPLE_SYLLABUS),
						children: "Try a sample"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "relative inline-flex h-11 cursor-pointer items-center rounded-md bg-cream px-3 text-sm text-ink shadow-card",
						children: ["Upload PDF, Word, or screenshot", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							accept: ".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,image/png,image/jpeg,image/webp",
							className: "absolute inset-0 cursor-pointer opacity-0",
							onChange: (event) => {
								const file = event.target.files?.[0];
								if (file) onFile(file);
								event.target.value = "";
							}
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: onClose,
						children: "Cancel"
					})
				]
			}),
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: note
			}) : null
		]
	});
}
function Review({ draft, busy, onChange, onCancel, onSave }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-4 rounded-lg bg-cream p-4 shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs font-medium tracking-wide text-muted uppercase",
				children: [draft.source === "grok" ? "Read by Grok" : "Read on this device", " · review before adding"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "mt-1 font-display text-2xl",
				children: [
					draft.course.code,
					" ",
					draft.course.title
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: [draft.course.instructor, draft.course.officeHours].filter(Boolean).join(" · ") || "No instructor line found."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 divide-y divide-line border-t border-line",
				children: draft.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center gap-2 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: item.title,
							"aria-label": "Assignment title",
							onChange: (event) => onChange({
								...draft,
								items: draft.items.map((row) => row.id === item.id ? {
									...row,
									title: event.target.value
								} : row)
							}),
							className: "h-11 min-w-0 flex-1 rounded-md border border-line bg-paper px-3 text-sm"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							value: item.due,
							"aria-label": "Due date",
							onChange: (event) => onChange({
								...draft,
								items: draft.items.map((row) => row.id === item.id ? {
									...row,
									due: event.target.value
								} : row)
							}),
							className: "h-11 rounded-md border border-line bg-paper px-2 text-sm"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "h-11 px-2 text-sm text-muted",
							onClick: () => onChange({
								...draft,
								items: draft.items.filter((row) => row.id !== item.id)
							}),
							children: "Remove"
						})
					]
				}, item.id))
			}),
			draft.items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "No dated assignments found. You can still add the course and type them in."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					disabled: busy,
					onClick: onSave,
					children: "Add to semester"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					onClick: onCancel,
					children: "Back"
				})]
			})
		]
	});
}
function withTimeout(promise, ms) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(/* @__PURE__ */ new Error("timeout")), ms);
		promise.then((value) => {
			clearTimeout(timer);
			resolve(value);
		}, (error) => {
			clearTimeout(timer);
			reject(error);
		});
	});
}
function fileToBase64(file) {
	return new Promise((resolve, reject) => {
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
function fileToDataUrl(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result ?? ""));
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});
}
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
var sendDueReminder = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(asReminder).handler(createSsrRpc("c126f76808c67d9ecbda73947d3ba6cec985c281ee239f03621b96636e80965f"));
function ReminderCard({ courses, items, today }) {
	const saved = useAnchor((s) => s.reminderEmail);
	const setReminderEmail = useAnchor((s) => s.setReminderEmail);
	const { user } = useCurrentUserState();
	const [email, setEmail] = (0, import_react.useState)(saved || user?.primaryEmail || "");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (saved) setEmail(saved);
		else if (user?.primaryEmail) setEmail((current) => current || user.primaryEmail || "");
	}, [saved, user?.primaryEmail]);
	async function send() {
		const address = email.trim();
		setReminderEmail(address);
		setBusy(true);
		setNote("");
		const tomorrow = addDays(today, 1);
		const open = items.filter((item) => !item.done);
		try {
			const result = await sendDueReminder({ data: {
				email: address,
				tomorrow,
				lines: open.map((item) => ({
					title: item.title,
					course: courses.find((course) => course.id === item.courseId)?.code ?? "",
					due: item.due,
					kind: item.kind
				}))
			} });
			setNote(result.ok ? `Sent to ${address}.` : result.error);
		} catch {
			setNote("Could not send that email.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-8 rounded-lg bg-cream p-6 shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Email the night before."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-md text-sm text-muted",
				children: "One note for whatever is due tomorrow. With the Resend test address, mail only arrives at the inbox on your Resend account."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 flex flex-wrap gap-2",
				onSubmit: (event) => {
					event.preventDefault();
					send();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "sr-only",
						htmlFor: "reminder-email",
						children: "Email address"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "reminder-email",
						type: "email",
						required: true,
						value: email,
						onChange: (event) => setEmail(event.target.value),
						placeholder: "you@school.edu",
						className: "h-11 min-w-0 flex-1 rounded-md border border-line bg-paper px-3 text-sm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy,
						children: busy ? "Sending…" : "Send what's due"
					})
				]
			}),
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: note
			}) : null
		]
	});
}
function Schedule() {
	const courses = useAnchor((s) => s.courses);
	const items = useAnchor((s) => s.items);
	const toggleDone = useAnchor((s) => s.toggleDone);
	const [adding, setAdding] = (0, import_react.useState)(false);
	const today = todayISO();
	const upcoming = items.filter((item) => !item.done && item.due >= today).sort((a, b) => a.due.localeCompare(b.due));
	const overdue = items.filter((item) => !item.done && item.due < today);
	const week = weekDates(today);
	const dueThisWeek = items.filter((item) => !item.done && item.due >= week[0] && item.due <= week[6]).length;
	function download() {
		const blob = new Blob([toIcs(courses, items)], { type: "text/calendar" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "anchor-semester.ics";
		link.click();
		URL.revokeObjectURL(url);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-copper uppercase",
				children: "This semester"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl md:text-5xl",
					children: "Syllabus to schedule."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					onClick: () => setAdding(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
						className: "size-4",
						"aria-hidden": true
					}), "Add syllabus"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-muted",
				children: "Paste a syllabus. Anchor pulls assignments, class times, office hours, and grading weights onto one schedule."
			}),
			adding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-3 md:items-center",
				onClick: () => setAdding(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "add-syllabus-title",
					className: "max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-lg bg-paper p-4 shadow-card md:p-6",
					onClick: (event) => event.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "add-syllabus-title",
						className: "font-display text-2xl",
						children: "Add a syllabus"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddSyllabus, { onClose: () => setAdding(false) })]
				})
			}) : null,
			courses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 rounded-lg bg-cream p-6 shadow-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl",
						children: "Nothing on the schedule yet."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-md text-muted",
						children: "Upload a PDF or Word syllabus, or paste it. Classes, due dates, and grades stay off this page until then."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						className: "mt-5",
						onClick: () => setAdding(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
							className: "size-4",
							"aria-hidden": true
						}), "Add syllabus"]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-8 grid grid-cols-3 gap-3 border-y border-line py-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Courses",
							value: String(courses.length)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Due this week",
							value: String(dueThisWeek)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Overdue",
							value: String(overdue.length)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-6 hidden md:block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Week"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid grid-cols-7 gap-2",
						children: week.map((iso) => {
							const day = weekday(iso);
							const classes = courses.flatMap((course) => course.meetings.filter((meeting) => meeting.days.includes(day)).map((meeting) => ({
								course,
								meeting
							})));
							const due = items.filter((item) => item.due === iso && !item.done);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("min-h-36 rounded-lg bg-cream p-2 shadow-card", iso === today && "ring-2 ring-copper"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: formatDay(iso)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									className: "mt-2 space-y-1",
									children: [classes.map(({ course, meeting }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/course/$courseId",
										params: { courseId: course.id },
										className: "block rounded-md bg-pine px-1.5 py-1 text-xs text-cream",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate",
											children: course.code
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-cream/70",
											children: clockLabel(meeting.start)
										})]
									}) }, meeting.id)), due.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/course/$courseId",
										params: { courseId: item.courseId },
										className: "block truncate rounded-md border border-line bg-paper px-1.5 py-1 text-xs text-ink",
										children: item.title
									}) }, item.id))]
								})]
							}, iso);
						})
					})]
				}),
				overdue.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl",
						children: "Overdue"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemList, {
						items: overdue,
						courses,
						today,
						onToggle: toggleDone
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Coming up"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: download,
							className: "h-11 text-sm text-copper",
							children: "Download .ics"
						})]
					}), upcoming.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "Nothing dated ahead. Add a syllabus or mark overdue work done."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemList, {
						items: upcoming.slice(0, 8),
						courses,
						today,
						onToggle: toggleDone
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Courses"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 divide-y divide-line border-t border-line",
						children: courses.map((course) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/course/$courseId",
							params: { courseId: course.id },
							className: "flex items-center justify-between gap-3 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs tracking-wide text-muted uppercase",
										children: course.code
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate font-display text-xl",
										children: course.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm text-muted",
										children: course.meetings[0] ? `${course.meetings[0].place || "Class"} · ${clockLabel(course.meetings[0].start)}` : course.instructor || "No meeting time yet"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm text-copper",
								children: "Open"
							})]
						}) }, course.id))
					})]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReminderCard, {
				courses,
				items,
				today
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-xs text-muted",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "font-display text-3xl tabular-nums",
		children: value
	})] });
}
function ItemList({ items, courses, today, onToggle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-2 divide-y divide-line border-t border-line",
		children: items.map((item) => {
			const course = courses.find((row) => row.id === item.courseId);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center gap-3 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": `Mark ${item.title} done`,
						onClick: () => onToggle(item.id),
						className: "size-11 shrink-0 rounded-md border border-line bg-cream"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/course/$courseId",
						params: { courseId: item.courseId },
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate",
							children: item.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								course?.code,
								" · ",
								item.kind,
								item.due < today ? " · overdue" : ""
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "shrink-0 text-sm tabular-nums text-muted",
						children: formatDay(item.due)
					})
				]
			}, item.id);
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Schedule, {}) });
//#endregion
export { SplitComponent as component };
