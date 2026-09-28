import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Route$2 } from "./router-DNr-VpGd.mjs";
import { t as Button } from "./use-current-user-Cd-djnd_.mjs";
import { a as courseOf, i as clockLabel, p as standing, s as formatDay, u as neededFor } from "./logic-D6zdnu3-.mjs";
import { a as useAnchor, n as Shell } from "./shell-CIofXlOa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/course._courseId-Bvvg3Nb5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DAY = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat"
];
function CourseBoard({ course }) {
	const items = useAnchor((s) => s.items.filter((item) => item.courseId === course.id));
	const toggleDone = useAnchor((s) => s.toggleDone);
	const updateItem = useAnchor((s) => s.updateItem);
	const removeItem = useAnchor((s) => s.removeItem);
	const setScore = useAnchor((s) => s.setScore);
	const setMissed = useAnchor((s) => s.setMissed);
	const live = useAnchor((s) => s.courses.find((row) => row.id === course.id)) ?? course;
	const [title, setTitle] = (0, import_react.useState)("");
	const [due, setDue] = (0, import_react.useState)("2026-10-20");
	const [kind, setKind] = (0, import_react.useState)("assignment");
	const grade = standing(live.grading);
	const need = neededFor(live.grading, 90);
	const absenceHit = live.absencePenalty != null ? Math.round(live.missed * live.absencePenalty * 10) / 10 : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "text-sm text-muted hover:text-ink",
				children: "Schedule"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs font-medium tracking-widest text-copper uppercase",
				children: live.code
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: live.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: [live.instructor, live.officeHours].filter(Boolean).join(" · ") || "No office hours on the syllabus."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-lg bg-cream p-4 shadow-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl",
						children: "Meets"
					}),
					live.meetings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "No class time was found."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-1 text-sm",
						children: live.meetings.map((meeting) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							meeting.days.map((day) => DAY[day]).join(", "),
							" · ",
							clockLabel(meeting.start),
							"–",
							clockLabel(meeting.end),
							meeting.place ? ` · ${meeting.place}` : ""
						] }, meeting.id))
					}),
					live.attendance ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm",
						children: live.attendance
					}) : null,
					live.latePolicy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: live.latePolicy
					}) : null,
					live.absencePenalty != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-4 flex flex-wrap items-center gap-3 text-sm",
						children: [
							"Classes missed",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								min: 0,
								max: 40,
								value: live.missed,
								onChange: (event) => setMissed(live.id, Number(event.target.value) || 0),
								className: "h-11 w-20 rounded-md border border-line bg-paper px-2 tabular-nums"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted",
								children: [
									"Costs about ",
									absenceHit,
									"% if the rule is applied straight."
								]
							})
						]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-lg bg-cream p-4 shadow-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl",
							children: "Grade"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-3xl tabular-nums",
							children: grade.current == null ? "—" : grade.current
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: need == null ? "Every weighted piece has a score." : `About ${need}% on the remaining ${grade.remain}% gets you to a 90.`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-2",
						children: live.grading.map((part) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "grid grid-cols-[minmax(0,1fr)_72px_88px] items-center gap-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [part.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted",
									children: [
										" · ",
										part.weight,
										"%"
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-right text-muted",
									children: "score"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: 0,
									max: 100,
									"aria-label": `${part.name} score`,
									value: part.score ?? "",
									placeholder: "—",
									onChange: (event) => {
										const value = event.target.value;
										setScore(live.id, part.id, value === "" ? null : Number(value));
									},
									className: "h-11 rounded-md border border-line bg-paper px-2 tabular-nums"
								})
							]
						}, part.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl",
						children: "Work"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 divide-y divide-line border-t border-line",
						children: items.slice().sort((a, b) => a.due.localeCompare(b.due)).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-wrap items-center gap-2 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": item.done,
									"aria-label": item.done ? `Reopen ${item.title}` : `Mark ${item.title} done`,
									onClick: () => toggleDone(item.id),
									className: `size-11 shrink-0 rounded-md border border-line ${item.done ? "bg-pine" : "bg-cream"}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: item.title,
									"aria-label": "Title",
									onChange: (event) => updateItem(item.id, { title: event.target.value }),
									className: `h-11 min-w-0 flex-1 rounded-md border border-line bg-cream px-3 text-sm ${item.done ? "text-muted line-through" : ""}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									value: item.due,
									"aria-label": "Due",
									onChange: (event) => updateItem(item.id, { due: event.target.value }),
									className: "h-11 rounded-md border border-line bg-cream px-2 text-sm"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "h-11 px-2 text-sm text-muted",
									onClick: () => removeItem(item.id),
									children: "Remove"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "sr-only",
									children: formatDay(item.due)
								})
							]
						}, item.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 flex flex-wrap gap-2",
						onSubmit: (event) => {
							event.preventDefault();
							if (title.trim().length < 2) return;
							const id = `w-${Date.now()}`;
							useAnchor.setState((state) => ({ items: [...state.items, {
								id,
								courseId: live.id,
								title: title.trim(),
								kind,
								due,
								done: false
							}] }));
							setTitle("");
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: title,
								onChange: (event) => setTitle(event.target.value),
								placeholder: "Add an assignment",
								"aria-label": "New assignment",
								className: "h-11 min-w-48 flex-1 rounded-md border border-line bg-cream px-3 text-sm"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: kind,
								"aria-label": "Kind",
								onChange: (event) => setKind(event.target.value),
								className: "h-11 rounded-md border border-line bg-cream px-2 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "assignment",
										children: "Assignment"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "exam",
										children: "Exam"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "quiz",
										children: "Quiz"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "reading",
										children: "Reading"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								value: due,
								"aria-label": "New due date",
								onChange: (event) => setDue(event.target.value),
								className: "h-11 rounded-md border border-line bg-cream px-2 text-sm"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								variant: "quiet",
								children: "Add"
							})
						]
					})
				]
			})
		]
	});
}
function CoursePage() {
	const { courseId } = Route$2.useParams();
	const courses = useAnchor((s) => s.courses);
	const course = courseOf(courses, courseId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: course ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CourseBoard, { course }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "mx-auto max-w-xl px-4 py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl",
			children: "That course is not on the schedule."
		})
	}) });
}
//#endregion
export { CoursePage as component };
