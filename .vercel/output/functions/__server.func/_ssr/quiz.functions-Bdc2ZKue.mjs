import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-DmeW4669.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/quiz.functions-Bdc2ZKue.js
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
function makeCode() {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	return [...crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(6))].map((byte) => alphabet[byte % 32]).join("");
}
function newId() {
	return crypto.randomUUID();
}
var createSharedQuiz_createServerFn_handler = createServerRpc({
	id: "340d6f896bb14423db670e6c5975dbe7bacad34b81ed39ce30da29ea8296743d",
	name: "createSharedQuiz",
	filename: "src/lib/anchor/quiz.functions.ts"
}, (opts) => createSharedQuiz.__executeServer(opts));
var createSharedQuiz = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(asCreate).handler(createSharedQuiz_createServerFn_handler, async ({ data, context }) => {
	try {
		const { getSql } = await import("./db-CRt8RCjc.mjs").then((n) => n.t).then((n) => n.t);
		const sql = await getSql();
		const quizId = newId();
		let code = makeCode();
		for (let attempt = 0; attempt < 5; attempt += 1) {
			if ((await sql`select code from shared_quiz where code = ${code} limit 1`).length === 0) break;
			code = makeCode();
		}
		await sql`insert into shared_quiz (id, code, title, owner_id) values (${quizId}, ${code}, ${data.title}, ${context.userId})`;
		const name = await memberName(sql, context.userId);
		await sql`insert into shared_quiz_member (quiz_id, user_id, name) values (${quizId}, ${context.userId}, ${name})`;
		for (let index = 0; index < data.questions.length; index += 1) {
			const question = data.questions[index];
			await sql`insert into shared_quiz_question (id, quiz_id, position, prompt, choices, answer) values (${newId()}, ${quizId}, ${index}, ${question.prompt}, ${JSON.stringify(question.choices)}, ${question.answer})`;
		}
		return {
			ok: true,
			code
		};
	} catch {
		return {
			ok: false,
			error: "Could not save that quiz."
		};
	}
});
var joinSharedQuiz_createServerFn_handler = createServerRpc({
	id: "15429173f0ddca312706057340611370739fb3100563e11eaf213ac28800edae",
	name: "joinSharedQuiz",
	filename: "src/lib/anchor/quiz.functions.ts"
}, (opts) => joinSharedQuiz.__executeServer(opts));
var joinSharedQuiz = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(asCode).handler(joinSharedQuiz_createServerFn_handler, async ({ data, context }) => {
	try {
		const { getSql } = await import("./db-CRt8RCjc.mjs").then((n) => n.t).then((n) => n.t);
		const sql = await getSql();
		const quiz = (await sql`select id, title from shared_quiz where code = ${data} limit 1`)[0];
		if (!quiz) return {
			ok: false,
			error: "No quiz uses that code."
		};
		const name = await memberName(sql, context.userId);
		const existing = await sql`select score, submitted_at from shared_quiz_member where quiz_id = ${quiz.id} and user_id = ${context.userId} limit 1`;
		if (existing.length === 0) await sql`insert into shared_quiz_member (quiz_id, user_id, name) values (${quiz.id}, ${context.userId}, ${name})`;
		const questions = await loadPublic(sql, quiz.id);
		const row = existing[0];
		return {
			ok: true,
			code: data,
			title: quiz.title,
			questions,
			submitted: Boolean(row?.submitted_at),
			score: row?.score ?? null
		};
	} catch {
		return {
			ok: false,
			error: "Could not join that quiz."
		};
	}
});
var submitSharedQuiz_createServerFn_handler = createServerRpc({
	id: "2401e71abebc957e380658633f998839a463badce4553e92956e210c9f01412e",
	name: "submitSharedQuiz",
	filename: "src/lib/anchor/quiz.functions.ts"
}, (opts) => submitSharedQuiz.__executeServer(opts));
var submitSharedQuiz = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(asSubmit).handler(submitSharedQuiz_createServerFn_handler, async ({ data, context }) => {
	try {
		const { getSql } = await import("./db-CRt8RCjc.mjs").then((n) => n.t).then((n) => n.t);
		const sql = await getSql();
		const quiz = (await sql`select id from shared_quiz where code = ${data.code} limit 1`)[0];
		if (!quiz) return {
			ok: false,
			error: "That quiz is gone."
		};
		const member = await sql`select submitted_at, score from shared_quiz_member where quiz_id = ${quiz.id} and user_id = ${context.userId} limit 1`;
		if (member.length === 0) return {
			ok: false,
			error: "Join the quiz first."
		};
		const answers = await sql`select answer from shared_quiz_question where quiz_id = ${quiz.id} order by position`;
		if (data.picks.length !== answers.length) return {
			ok: false,
			error: "Finish every question."
		};
		if (member[0]?.submitted_at) return {
			ok: true,
			score: Number(member[0].score ?? 0),
			total: answers.length
		};
		const score = answers.reduce((sum, row, index) => sum + (Number(row.answer) === data.picks[index] ? 1 : 0), 0);
		await sql`update shared_quiz_member set score = ${score}, submitted_at = current_timestamp where quiz_id = ${quiz.id} and user_id = ${context.userId} and submitted_at is null`;
		return {
			ok: true,
			score,
			total: answers.length
		};
	} catch {
		return {
			ok: false,
			error: "Could not turn that in."
		};
	}
});
var sharedQuizState_createServerFn_handler = createServerRpc({
	id: "5fba1febdb225bf200d338c07430932ef0afe70322b712ab1d809c334a55c63d",
	name: "sharedQuizState",
	filename: "src/lib/anchor/quiz.functions.ts"
}, (opts) => sharedQuizState.__executeServer(opts));
var sharedQuizState = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(asCode).handler(sharedQuizState_createServerFn_handler, async ({ data, context }) => {
	try {
		const { getSql } = await import("./db-CRt8RCjc.mjs").then((n) => n.t).then((n) => n.t);
		const sql = await getSql();
		const quiz = (await sql`select id, title from shared_quiz where code = ${data} limit 1`)[0];
		if (!quiz) return {
			ok: false,
			error: "That quiz is gone."
		};
		if ((await sql`select user_id from shared_quiz_member where quiz_id = ${quiz.id} and user_id = ${context.userId} limit 1`).length === 0) return {
			ok: false,
			error: "Join the quiz first."
		};
		const members = await sql`select user_id, name, score, submitted_at from shared_quiz_member where quiz_id = ${quiz.id} order by name`;
		const totals = await sql`select count(*) as count from shared_quiz_question where quiz_id = ${quiz.id}`;
		const you = members.find((member) => member.user_id === context.userId);
		const pending = members.filter((member) => !member.submitted_at).map((member) => member.name);
		const alone = members.length < 2;
		const waiting = !alone && pending.length > 0;
		const scores = waiting ? null : members.filter((member) => member.submitted_at).map((member) => ({
			name: member.name,
			score: Number(member.score ?? 0),
			you: member.user_id === context.userId
		})).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
		return {
			ok: true,
			title: quiz.title,
			total: Number(totals[0]?.count ?? 0),
			yours: you?.submitted_at ? Number(you.score ?? 0) : null,
			waiting,
			alone,
			pending: waiting ? pending : [],
			scores
		};
	} catch {
		return {
			ok: false,
			error: "Could not load the scores."
		};
	}
});
async function memberName(sql, userId) {
	const name = (await sql`select "name" as name from "user" where "id" = ${userId} limit 1`)[0]?.name?.trim();
	return name && name.length > 0 ? name.slice(0, 48) : "Classmate";
}
async function loadPublic(sql, quizId) {
	return (await sql`select id, prompt, choices from shared_quiz_question where quiz_id = ${quizId} order by position`).map((row) => ({
		id: row.id,
		prompt: row.prompt,
		choices: parseChoices(row.choices)
	}));
}
function parseChoices(raw) {
	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.map((choice) => String(choice));
	} catch {
		return [];
	}
}
//#endregion
export { createSharedQuiz_createServerFn_handler, joinSharedQuiz_createServerFn_handler, sharedQuizState_createServerFn_handler, submitSharedQuiz_createServerFn_handler };
