import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn, t as Button } from "./use-current-user-Cd-djnd_.mjs";
import { a as useAnchor, n as Shell } from "./shell-CIofXlOa.mjs";
import { t as SharedQuiz } from "./shared-quiz-D_oVJAWq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/practice-CEhpR3ol.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Practice() {
	const [mode, setMode] = (0, import_react.useState)("notes");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-copper uppercase",
				children: "Practice"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl",
				children: mode === "class" ? "A quiz for the class." : "Your questions, your answers."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-muted",
				children: mode === "class" ? "Write it, share the code, and wait until everyone who joined has finished." : "Save a quiz by name, then take it again whenever you want."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeButton, {
					on: mode === "notes",
					label: "Your notes",
					onClick: () => setMode("notes")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeButton, {
					on: mode === "class",
					label: "Class quiz",
					onClick: () => setMode("class")
				})]
			}),
			mode === "notes" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notes, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SharedQuiz, {})
		]
	});
}
function ModeButton({ on, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("h-11 rounded-md px-4 text-sm", on ? "bg-pine text-cream" : "bg-cream text-ink shadow-card"),
		children: label
	});
}
function Notes() {
	const quizzes = useAnchor((s) => s.quizzes) ?? [];
	const saveQuiz = useAnchor((s) => s.saveQuiz);
	const removeQuiz = useAnchor((s) => s.removeQuiz);
	const [editor, setEditor] = (0, import_react.useState)(null);
	const [question, setQuestion] = (0, import_react.useState)("");
	const [answer, setAnswer] = (0, import_react.useState)("");
	const [editingQuestion, setEditingQuestion] = (0, import_react.useState)(null);
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const [drill, setDrill] = (0, import_react.useState)(null);
	const ready = question.trim().length > 0 && answer.trim().length > 0;
	function addQuestion() {
		if (!editor || !ready) return;
		if (editingQuestion) {
			setEditor({
				...editor,
				questions: editor.questions.map((row) => row.id === editingQuestion ? {
					...row,
					question: question.trim(),
					answer: answer.trim()
				} : row)
			});
			setEditingQuestion(null);
		} else setEditor({
			...editor,
			questions: [...editor.questions, {
				id: newId("n"),
				question: question.trim(),
				answer: answer.trim()
			}]
		});
		setQuestion("");
		setAnswer("");
	}
	function storeQuiz() {
		if (!editor || editor.name.trim().length < 2 || editor.questions.length === 0) return;
		saveQuiz({
			id: editor.id ?? newId("q"),
			name: editor.name.trim(),
			questions: editor.questions
		});
		setEditor(null);
		setQuestion("");
		setAnswer("");
		setEditingQuestion(null);
	}
	if (drill) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drill, {
		name: drill.name,
		cards: drill.cards,
		onClose: () => setDrill(null)
	});
	if (editor) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "block text-sm",
				htmlFor: "quiz-name",
				children: "Quiz name"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id: "quiz-name",
				value: editor.name,
				onChange: (event) => setEditor({
					...editor,
					name: event.target.value
				}),
				className: "mt-2 h-11 w-full rounded-md border border-line bg-paper px-3",
				placeholder: "Chapter 3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 rounded-lg bg-cream p-5 shadow-card",
				onSubmit: (event) => {
					event.preventDefault();
					addQuestion();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-sm",
						htmlFor: "note-question",
						children: "Question"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						id: "note-question",
						value: question,
						onChange: (event) => setQuestion(event.target.value),
						rows: 2,
						className: "mt-2 w-full rounded-md border border-line bg-paper px-3 py-3",
						placeholder: "What is a free variable?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mt-4 block text-sm",
						htmlFor: "note-answer",
						children: "Answer"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						id: "note-answer",
						value: answer,
						onChange: (event) => setAnswer(event.target.value),
						rows: 3,
						className: "mt-2 w-full rounded-md border border-line bg-paper px-3 py-3",
						placeholder: "A variable you can choose freely in the solution."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: !ready,
							children: editingQuestion ? "Save changes" : "Add question"
						}), editingQuestion ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							onClick: () => {
								setEditingQuestion(null);
								setQuestion("");
								setAnswer("");
							},
							children: "Cancel"
						}) : null]
					})
				]
			}),
			editor.questions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 divide-y divide-line border-t border-line",
				children: editor.questions.map((row) => {
					const open = openId === row.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "py-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xl",
								children: row.question
							}),
							open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 max-w-xl text-sm",
								children: row.answer
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "h-11 text-sm text-copper",
										onClick: () => setOpenId(open ? null : row.id),
										children: open ? "Hide answer" : "Show answer"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "h-11 text-sm text-muted",
										onClick: () => {
											setEditingQuestion(row.id);
											setQuestion(row.question);
											setAnswer(row.answer);
										},
										children: "Edit"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "h-11 text-sm text-muted",
										onClick: () => setEditor({
											...editor,
											questions: editor.questions.filter((item) => item.id !== row.id)
										}),
										children: "Remove"
									})
								]
							})
						]
					}, row.id);
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: "No questions yet."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					disabled: editor.name.trim().length < 2 || editor.questions.length === 0,
					onClick: storeQuiz,
					children: "Save quiz"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					onClick: () => {
						setEditor(null);
						setQuestion("");
						setAnswer("");
						setEditingQuestion(null);
					},
					children: "Back"
				})]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			onClick: () => setEditor({
				id: null,
				name: "",
				questions: []
			}),
			children: "New quiz"
		}), quizzes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 text-sm text-muted",
			children: "No quizzes yet. Name one, add the questions, then save it."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-6 divide-y divide-line border-t border-line",
			children: quizzes.map((quiz) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex flex-wrap items-center justify-between gap-3 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl",
					children: quiz.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						quiz.questions.length,
						" ",
						quiz.questions.length === 1 ? "question" : "questions"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							onClick: () => setDrill({
								name: quiz.name,
								cards: quiz.questions.map((row) => ({
									...row,
									courseId: ""
								}))
							}),
							children: "Take quiz"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "quiet",
							onClick: () => {
								setEditor({
									id: quiz.id,
									name: quiz.name,
									questions: quiz.questions.map((row) => ({ ...row }))
								});
								setOpenId(null);
							},
							children: "Edit"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							onClick: () => removeQuiz(quiz.id),
							children: "Remove"
						})
					]
				})]
			}, quiz.id))
		})]
	});
}
function newId(prefix) {
	return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
function Drill({ name, cards, onClose }) {
	const [index, setIndex] = (0, import_react.useState)(0);
	const [shown, setShown] = (0, import_react.useState)(false);
	const [known, setKnown] = (0, import_react.useState)(0);
	const [done, setDone] = (0, import_react.useState)(false);
	const card = cards[index];
	function mark(got) {
		const nextKnown = known + (got ? 1 : 0);
		if (index + 1 >= cards.length) {
			setKnown(nextKnown);
			setDone(true);
			return;
		}
		setKnown(nextKnown);
		setIndex((value) => value + 1);
		setShown(false);
	}
	function again() {
		setIndex(0);
		setShown(false);
		setKnown(0);
		setDone(false);
	}
	if (!card && !done) return null;
	if (done) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6 rounded-lg bg-cream p-6 shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-wide text-muted uppercase",
				children: name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 font-display text-5xl tabular-nums",
				children: [
					known,
					" of ",
					cards.length
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted",
				children: known === cards.length ? "You had every answer." : "Look again at the ones you missed."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: again,
					children: "Take it again"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					onClick: onClose,
					children: "Back to notes"
				})]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6 rounded-lg bg-cream p-5 shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs tracking-wide text-muted uppercase",
				children: [
					name,
					" · ",
					index + 1,
					" of ",
					cards.length
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-display text-3xl",
				children: card.question
			}),
			shown ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-xl text-sm",
				children: card.answer
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap gap-2",
				children: [shown ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: () => mark(true),
					children: "Knew it"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "quiet",
					onClick: () => mark(false),
					children: "Missed it"
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: () => setShown(true),
					children: "Show answer"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					onClick: onClose,
					children: "Stop"
				})]
			})
		]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Practice, {}) });
//#endregion
export { SplitComponent as component };
