import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-DmeW4669.mjs";
import { n as cn, t as Button } from "./use-current-user-Cd-djnd_.mjs";
import { i as createSsrRpc } from "./shell-CIofXlOa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shared-quiz-D_oVJAWq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function asCreate(data) {
	if (!data || typeof data !== "object") throw new Error("Bad request");
	const row = data;
	const title = typeof row.title === "string" ? row.title.trim().slice(0, 80) : "";
	if (title.length < 2) throw new Error("Name the quiz");
	if (!Array.isArray(row.questions) || row.questions.length < 1 || row.questions.length > 20) throw new Error("Add at least one question");
	const questions = [];
	for (const item of row.questions) {
		if (!item || typeof item !== "object") throw new Error("Check the questions");
		const q = item;
		const prompt = typeof q.prompt === "string" ? q.prompt.trim().slice(0, 400) : "";
		const choices = Array.isArray(q.choices) ? q.choices.map((choice) => String(choice).trim().slice(0, 180)) : [];
		const answer = Number(q.answer);
		if (prompt.length < 2 || choices.length !== 4 || choices.some((choice) => choice.length < 1)) throw new Error("Each question needs a prompt and four choices");
		if (!Number.isInteger(answer) || answer < 0 || answer > 3) throw new Error("Mark the correct choice");
		questions.push({
			prompt,
			choices,
			answer
		});
	}
	return {
		title,
		questions
	};
}
function asCode(data) {
	if (!data || typeof data !== "object") throw new Error("Bad request");
	const code = data.code;
	if (typeof code !== "string" || !/^[A-Z0-9]{6}$/.test(code.trim().toUpperCase())) throw new Error("Enter the 6-character code");
	return code.trim().toUpperCase();
}
function asSubmit(data) {
	if (!data || typeof data !== "object") throw new Error("Bad request");
	const row = data;
	const code = asCode({ code: row.code });
	if (!Array.isArray(row.picks) || row.picks.length > 20) throw new Error("Finish the quiz first");
	const picks = row.picks.map((pick) => Number(pick));
	if (picks.some((pick) => !Number.isInteger(pick) || pick < 0 || pick > 3)) throw new Error("Finish the quiz first");
	return {
		code,
		picks
	};
}
var createSharedQuiz = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(asCreate).handler(createSsrRpc("340d6f896bb14423db670e6c5975dbe7bacad34b81ed39ce30da29ea8296743d"));
var joinSharedQuiz = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(asCode).handler(createSsrRpc("15429173f0ddca312706057340611370739fb3100563e11eaf213ac28800edae"));
var submitSharedQuiz = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(asSubmit).handler(createSsrRpc("2401e71abebc957e380658633f998839a463badce4553e92956e210c9f01412e"));
var sharedQuizState = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(asCode).handler(createSsrRpc("5fba1febdb225bf200d338c07430932ef0afe70322b712ab1d809c334a55c63d"));
var emptyQuestion = () => ({
	prompt: "",
	choices: [
		"",
		"",
		"",
		""
	],
	answer: null
});
function SharedQuiz({ initialCode = "" }) {
	const [phase, setPhase] = (0, import_react.useState)(initialCode ? "ask" : "home");
	const [title, setTitle] = (0, import_react.useState)("");
	const [drafts, setDrafts] = (0, import_react.useState)([emptyQuestion()]);
	const [code, setCode] = (0, import_react.useState)(initialCode.toUpperCase());
	const [joinCode, setJoinCode] = (0, import_react.useState)("");
	const [questions, setQuestions] = (0, import_react.useState)([]);
	const [index, setIndex] = (0, import_react.useState)(0);
	const [picks, setPicks] = (0, import_react.useState)([]);
	const [picked, setPicked] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [yours, setYours] = (0, import_react.useState)(null);
	const [waiting, setWaiting] = (0, import_react.useState)(false);
	const [alone, setAlone] = (0, import_react.useState)(false);
	const [pending, setPending] = (0, import_react.useState)([]);
	const [scores, setScores] = (0, import_react.useState)(null);
	const [total, setTotal] = (0, import_react.useState)(0);
	const [quizTitle, setQuizTitle] = (0, import_react.useState)("");
	const ticket = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		if (!initialCode) return;
		enter(initialCode);
	}, [initialCode]);
	(0, import_react.useEffect)(() => {
		if (phase !== "results" || !code) return;
		const timer = setInterval(() => void refresh(code), 4e3);
		return () => clearInterval(timer);
	}, [phase, code]);
	async function enter(raw) {
		const next = raw.trim().toUpperCase();
		setBusy(true);
		setError("");
		try {
			const result = await joinSharedQuiz({ data: { code: next } });
			if (!result.ok) {
				setError(result.error);
				setPhase("home");
				return;
			}
			setCode(result.code);
			setQuizTitle(result.title);
			setQuestions(result.questions);
			setTotal(result.questions.length);
			if (result.submitted) {
				setYours(result.score);
				setPhase("results");
				await refresh(result.code);
				return;
			}
			setIndex(0);
			setPicks([]);
			setPicked(null);
			setPhase("ask");
		} catch {
			setError("Log in, then use the code.");
			setPhase("home");
		} finally {
			setBusy(false);
		}
	}
	async function refresh(nextCode) {
		const mine = ++ticket.current;
		try {
			const result = await sharedQuizState({ data: { code: nextCode } });
			if (mine !== ticket.current || !result.ok) return;
			setQuizTitle(result.title);
			setTotal(result.total);
			setYours(result.yours);
			setWaiting(result.waiting);
			setAlone(result.alone);
			setPending(result.pending);
			setScores(result.scores);
		} catch {}
	}
	async function create() {
		if (drafts.some((question) => question.prompt.trim().length < 2 || question.choices.some((choice) => choice.trim().length < 1) || question.answer == null)) {
			setError("Each question needs a prompt, four choices, and a correct one.");
			return;
		}
		setBusy(true);
		setError("");
		try {
			const result = await createSharedQuiz({ data: {
				title: title.trim(),
				questions: drafts.map((question) => ({
					prompt: question.prompt.trim(),
					choices: question.choices.map((choice) => choice.trim()),
					answer: question.answer ?? 0
				}))
			} });
			if (!result.ok) {
				setError(result.error);
				return;
			}
			setCode(result.code);
			setQuizTitle(title.trim());
			setPhase("share");
		} catch {
			setError("Log in, then create the quiz.");
		} finally {
			setBusy(false);
		}
	}
	function choose(choice) {
		if (picked != null) return;
		setPicked(choice);
	}
	async function next() {
		if (picked == null) return;
		const nextPicks = [...picks, picked];
		if (index + 1 < questions.length) {
			setPicks(nextPicks);
			setIndex((value) => value + 1);
			setPicked(null);
			return;
		}
		setBusy(true);
		setError("");
		try {
			const result = await submitSharedQuiz({ data: {
				code,
				picks: nextPicks
			} });
			if (!result.ok) {
				setError(result.error);
				return;
			}
			setYours(result.score);
			setTotal(result.total);
			setPhase("results");
			await refresh(code);
		} catch {
			setError("Could not turn that in.");
		} finally {
			setBusy(false);
		}
	}
	if (phase === "edit") {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "block text-sm",
					htmlFor: "quiz-title",
					children: "Quiz name"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "quiz-title",
					value: title,
					onChange: (event) => setTitle(event.target.value),
					className: "mt-2 h-11 w-full rounded-md border border-line bg-paper px-3",
					placeholder: "Chapter 3 check"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 space-y-4",
					children: drafts.map((question, questionIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-lg bg-cream p-4 shadow-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block text-sm",
								htmlFor: `prompt-${questionIndex}`,
								children: ["Question ", questionIndex + 1]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								id: `prompt-${questionIndex}`,
								value: question.prompt,
								rows: 2,
								onChange: (event) => updateDraft(questionIndex, { prompt: event.target.value }),
								className: "mt-2 w-full rounded-md border border-line bg-paper px-3 py-3"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 space-y-2",
								children: question.choices.map((choice, choiceIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: choice,
									"aria-label": `Choice ${choiceIndex + 1}`,
									onChange: (event) => {
										const choices = question.choices.slice();
										choices[choiceIndex] = event.target.value;
										updateDraft(questionIndex, { choices });
									},
									className: "h-11 w-full rounded-md border border-line bg-paper px-3",
									placeholder: `Choice ${String.fromCharCode(65 + choiceIndex)}`
								}, choiceIndex))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs tracking-wide text-muted uppercase",
								children: "Correct choice"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex flex-wrap gap-2",
								children: [question.choices.map((_, choiceIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => updateDraft(questionIndex, { answer: choiceIndex }),
									className: cn("h-11 rounded-md px-3 text-sm", question.answer === choiceIndex ? "bg-pine text-cream" : "bg-paper shadow-card"),
									children: String.fromCharCode(65 + choiceIndex)
								}, choiceIndex)), drafts.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "h-11 px-2 text-sm text-muted",
									onClick: () => setDrafts((rows) => rows.filter((_, i) => i !== questionIndex)),
									children: "Remove"
								}) : null]
							})
						]
					}, questionIndex))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "quiet",
							onClick: () => setDrafts((rows) => [...rows, emptyQuestion()]),
							children: "Add question"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							disabled: busy || title.trim().length < 2,
							onClick: () => void create(),
							children: busy ? "Saving…" : "Create and share"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							onClick: () => setPhase("home"),
							children: "Back"
						})
					]
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: error
				}) : null
			]
		});
		function updateDraft(questionIndex, patch) {
			setDrafts((rows) => rows.map((row, index) => index === questionIndex ? {
				...row,
				...patch
			} : row));
		}
	}
	if (phase === "share") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6 rounded-lg bg-cream p-6 shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-wide text-muted uppercase",
				children: quizTitle
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-display text-5xl tracking-wide",
				children: code
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Classmates join with this code. Scores stay hidden until everyone who joined is done."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: () => void enter(code),
					disabled: busy,
					children: busy ? "Joining…" : "Take it too"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "quiet",
					onClick: () => void navigator.clipboard?.writeText(code).catch(() => void 0),
					children: "Copy code"
				})]
			})
		]
	});
	if (phase === "ask") {
		const question = questions[index];
		if (!question) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 text-sm text-muted",
			children: busy ? "Opening the quiz…" : error || "That quiz has no questions."
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 rounded-lg bg-cream p-5 shadow-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs tracking-wide text-muted uppercase",
					children: [
						quizTitle,
						" · ",
						index + 1,
						" of ",
						questions.length
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-2xl",
					children: question.prompt
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 space-y-2",
					children: question.choices.map((choice, choiceIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => choose(choiceIndex),
						className: cn("min-h-11 w-full rounded-md px-3 py-3 text-left text-sm", picked == null && "bg-paper shadow-card", picked === choiceIndex && "bg-pine text-cream", picked != null && picked !== choiceIndex && "bg-paper text-muted"),
						children: choice
					}) }, `${question.id}-${choiceIndex}`))
				}),
				picked != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					className: "mt-4",
					disabled: busy,
					onClick: () => void next(),
					children: busy ? "Turning in…" : index + 1 === questions.length ? "Turn in" : "Next"
				}) : null,
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: error
				}) : null
			]
		});
	}
	if (phase === "results") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6 rounded-lg bg-cream p-6 shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-wide text-muted uppercase",
				children: quizTitle
			}),
			waiting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-3xl",
					children: "Not everyone is done."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted",
					children: "Waiting for the others. Scores show up when the last person turns it in."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 space-y-2 text-sm",
					children: pending.map((name, nameIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [name, " is still taking it."] }, `${name}-${nameIndex}`))
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-3xl",
					children: alone ? "You are the only one so far." : "Everyone is done."
				}),
				alone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted",
					children: "When classmates join with the code, this waits for them too."
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 divide-y divide-line border-t border-line",
					children: (scores ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-baseline justify-between gap-3 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: row.you ? "text-copper" : void 0,
							children: row.you ? `${row.name} (you)` : row.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-display text-2xl tabular-nums",
							children: [
								row.score,
								" of ",
								total
							]
						})]
					}, row.name))
				})
			] }),
			yours != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-sm text-muted",
				children: [
					"You scored ",
					yours,
					" of ",
					total,
					"."
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-sm text-muted",
				children: ["Code ", code]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6 grid gap-4 md:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "rounded-lg bg-cream p-5 shadow-card",
			onSubmit: (event) => {
				event.preventDefault();
				enter(joinCode);
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Join with a code"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: joinCode,
					onChange: (event) => setJoinCode(event.target.value.toUpperCase()),
					"aria-label": "Quiz code",
					maxLength: 6,
					className: "mt-3 h-11 w-full rounded-md border border-line bg-paper px-3 tracking-widest",
					placeholder: "AB12CD"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "mt-3",
					disabled: busy || joinCode.trim().length < 6,
					children: busy ? "Joining…" : "Join"
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: error
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-lg bg-cream p-5 shadow-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Write one"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Four choices each. Share the code. Scores wait until every person who joined is finished."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					className: "mt-4",
					onClick: () => {
						setError("");
						setPhase("edit");
					},
					children: "Create a quiz"
				})
			]
		})]
	});
}
//#endregion
export { SharedQuiz as t };
