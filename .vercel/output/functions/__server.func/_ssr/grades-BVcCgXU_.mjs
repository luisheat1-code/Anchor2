import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn, t as Button } from "./use-current-user-Cd-djnd_.mjs";
import { c as gpaReplacing, f as percentWith, l as letterFromPercent, m as termQuality, o as cumulativeGpa, p as standing, t as LETTERS, u as neededFor } from "./logic-D6zdnu3-.mjs";
import { a as useAnchor, n as Shell } from "./shell-CIofXlOa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/grades-BVcCgXU_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Grades() {
	const courses = useAnchor((s) => s.courses);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-copper uppercase",
				children: "Grades"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl",
				children: "Semester GPA."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-muted",
				children: "Letter grade and credits for each class. Add what is already on your record if you want the cumulative number."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GpaCalculator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatIf, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-12 font-display text-2xl",
				children: "Inside each class"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Weighted the way the syllabus says. The note is what is left to reach a 90."
			}),
			courses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: "Nothing here until you add a syllabus."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 divide-y divide-line border-t border-line",
				children: courses.map((course) => {
					const grade = standing(course.grading);
					const need = neededFor(course.grading, 90);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-4 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs tracking-wide text-muted uppercase",
									children: course.code
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-display text-2xl",
									children: course.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted",
									children: [grade.current == null ? "No scores yet" : `Running ${grade.current}`, need == null ? "" : ` · need ${need}% on what is left`]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/course/$courseId",
							params: { courseId: course.id },
							className: "h-11 shrink-0 text-sm text-copper",
							children: "Edit"
						})]
					}, course.id);
				})
			})
		]
	});
}
function GpaCalculator() {
	const courses = useAnchor((s) => s.courses);
	const rows = useAnchor((s) => s.gpaRows) ?? [];
	const priorCredits = useAnchor((s) => s.priorCredits) ?? 0;
	const priorGpa = useAnchor((s) => s.priorGpa) ?? null;
	const addGpaRow = useAnchor((s) => s.addGpaRow);
	const addGpaRows = useAnchor((s) => s.addGpaRows);
	const updateGpaRow = useAnchor((s) => s.updateGpaRow);
	const removeGpaRow = useAnchor((s) => s.removeGpaRow);
	const setPrior = useAnchor((s) => s.setPrior);
	const term = termQuality(rows);
	const overall = cumulativeGpa(term, priorGpa, priorCredits);
	function addBlank(name = "") {
		addGpaRow({
			id: newId(),
			name,
			credits: 3,
			grade: ""
		});
	}
	function fromSchedule() {
		const taken = new Set(rows.map((row) => row.name.trim().toLowerCase()));
		const next = courses.filter((course) => !taken.has(course.code.toLowerCase())).map((course) => ({
			id: newId(),
			name: course.code,
			credits: 3,
			grade: ""
		}));
		if (next.length) addGpaRows(next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-2 gap-3 border-y border-line py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-xs text-muted",
						children: "Semester"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-display text-5xl tabular-nums",
						children: show(term.gpa)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: term.credits ? `${trimCredits(term.credits)} credits` : "No graded credits yet"
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-xs text-muted",
						children: "Cumulative"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-display text-5xl tabular-nums",
						children: show(overall)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: overall == null ? "Add your record below" : "With what you already have"
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg bg-cream p-4 shadow-card md:p-5",
				children: [
					rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Add a class, then pick the letter grade."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-3",
						children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: row.name,
									"aria-label": "Course",
									onChange: (event) => updateGpaRow(row.id, { name: event.target.value.slice(0, 48) }),
									placeholder: "Course",
									className: "h-11 min-w-0 flex-1 basis-full rounded-md border border-line bg-paper px-3 text-sm md:basis-0"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									inputMode: "decimal",
									min: 0,
									max: 8,
									step: .5,
									value: row.credits,
									"aria-label": "Credits",
									onChange: (event) => updateGpaRow(row.id, { credits: hours(event.target.value) }),
									className: "h-11 w-20 rounded-md border border-line bg-paper px-3 text-sm tabular-nums"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: row.grade,
									"aria-label": "Letter grade",
									onChange: (event) => updateGpaRow(row.id, { grade: event.target.value }),
									className: "h-11 rounded-md border border-line bg-paper px-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Grade"
									}), LETTERS.map((letter) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: letter,
										children: letter
									}, letter))]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "h-11 px-2 text-sm text-muted",
									onClick: () => removeGpaRow(row.id),
									children: "Remove"
								})
							]
						}, row.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							onClick: () => addBlank(),
							children: "Add a class"
						}), courses.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "quiet",
							onClick: fromSchedule,
							children: "Use schedule"
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 grid gap-3 border-t border-line pt-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-sm",
							children: ["Credits already earned", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								inputMode: "decimal",
								min: 0,
								max: 200,
								step: .5,
								value: priorCredits || "",
								onChange: (event) => setPrior(hours(event.target.value), priorGpa),
								className: "mt-2 h-11 w-full rounded-md border border-line bg-paper px-3 tabular-nums"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-sm",
							children: ["GPA already earned", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								inputMode: "decimal",
								min: 0,
								max: 4,
								step: .01,
								value: priorGpa ?? "",
								onChange: (event) => setPrior(priorCredits, points(event.target.value)),
								className: "mt-2 h-11 w-full rounded-md border border-line bg-paper px-3 tabular-nums"
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "4.0 scale. A and A+ are 4.0. A− is 3.7."
			})
		]
	});
}
function show(value) {
	return value == null ? "—" : value.toFixed(2);
}
function hours(value) {
	if (value.trim() === "") return 0;
	const number = Number(value);
	if (!Number.isFinite(number)) return 0;
	return Math.min(200, Math.max(0, number));
}
function points(value) {
	if (value.trim() === "") return null;
	const number = Number(value);
	if (!Number.isFinite(number)) return null;
	return Math.min(4, Math.max(0, number));
}
function trimCredits(value) {
	return Number.isInteger(value) ? String(value) : String(value);
}
function newId() {
	return `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
function WhatIf() {
	const courses = useAnchor((s) => s.courses);
	const rows = useAnchor((s) => s.gpaRows) ?? [];
	const weighted = courses.filter((course) => course.grading.some((part) => part.weight > 0));
	const [courseId, setCourseId] = (0, import_react.useState)("");
	const [partId, setPartId] = (0, import_react.useState)("");
	const course = weighted.find((item) => item.id === courseId) ?? weighted[0];
	const part = course?.grading.find((item) => item.id === partId && item.weight > 0) ?? course?.grading.find((item) => item.score == null && item.weight > 0) ?? course?.grading.find((item) => item.weight > 0);
	if (!course || !part) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl",
			children: "If you get…"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-xl text-sm text-muted",
			children: "Add a syllabus with grading weights. Then one score shows the letter and the semester GPA."
		})]
	});
	const now = termQuality(rows).gpa;
	const outcomes = [
		100,
		90,
		80,
		70,
		60
	].map((score) => {
		const percent = percentWith(course.grading, part.id, score);
		const letter = percent == null ? null : letterFromPercent(percent);
		const gpa = letter ? gpaReplacing(rows, course.code, letter) : null;
		return {
			score,
			percent,
			letter,
			gpa,
			shift: shift(gpa, now)
		};
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "If you get…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 max-w-xl text-sm text-muted",
				children: [
					part.name,
					" is ",
					part.weight,
					"% of ",
					course.code,
					". Blank scores stay blank. Other classes stay as you entered them."
				]
			}),
			weighted.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: weighted.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setCourseId(item.id);
						setPartId("");
					},
					className: cn("h-11 rounded-md px-3 text-sm", item.id === course.id ? "bg-pine text-cream" : "bg-cream text-ink shadow-card"),
					children: item.code
				}, item.id))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: course.grading.filter((item) => item.weight > 0).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setPartId(item.id),
					className: cn("h-11 max-w-full truncate rounded-md px-3 text-sm", item.id === part.id ? "bg-pine text-cream" : "bg-cream text-ink shadow-card"),
					children: item.name
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 border-t border-line",
				children: outcomes.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-4 border-b border-line py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display text-2xl tabular-nums",
							children: [row.score, "%"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: row.percent == null ? "Not enough weight" : `Class ${row.percent}% · ${row.letter}`
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl tabular-nums",
							children: show(row.gpa)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: row.shift ?? "semester"
						})]
					})]
				}, row.score))
			})
		]
	});
}
function shift(next, current) {
	if (next == null || current == null) return null;
	const delta = Math.round((next - current) * 100) / 100;
	if (delta === 0) return "same";
	return `${delta > 0 ? "+" : "−"}${Math.abs(delta).toFixed(2)}`;
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grades, {}) });
//#endregion
export { SplitComponent as component };
