import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Route$1 } from "./router-DNr-VpGd.mjs";
import { n as Shell } from "./shell-CIofXlOa.mjs";
import { t as SharedQuiz } from "./shared-quiz-D_oVJAWq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/q._code-CHbTHT3N.js
var import_jsx_runtime = require_jsx_runtime();
function QuizLink() {
	const { code } = Route$1.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-copper uppercase",
				children: "Class quiz"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl",
				children: "Join the quiz."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SharedQuiz, { initialCode: code })
		]
	}) });
}
//#endregion
export { QuizLink as component };
