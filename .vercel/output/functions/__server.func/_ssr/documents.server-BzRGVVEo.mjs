import { n as unzipSync, t as strFromU8 } from "../_libs/fflate.mjs";
import { n as getDocumentProxy, t as extractText } from "../_libs/unpdf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/documents.server-BzRGVVEo.js
async function textFromUpload(name, base64) {
	const lower = name.toLowerCase();
	const bytes = decodeBase64(base64);
	if (!bytes) return {
		ok: false,
		error: "Could not read that file."
	};
	try {
		if (lower.endsWith(".pdf")) return finish(await pdfText(bytes), "pdf");
		if (lower.endsWith(".docx")) return finish(docxText(bytes), "docx");
		return {
			ok: false,
			error: "Upload a PDF or a Word .docx file."
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "";
		if (/password/i.test(message)) return {
			ok: false,
			error: "That PDF is locked. Paste the text instead."
		};
		if (lower.endsWith(".docx")) return {
			ok: false,
			error: "Could not open that Word file. Save it as .docx and try again."
		};
		return {
			ok: false,
			error: "Could not open that PDF. Paste the text, or upload a screenshot of the page."
		};
	}
}
function finish(text, kind) {
	const clean = text.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
	if (clean.length < 20) return {
		ok: false,
		error: kind === "pdf" ? "No selectable text in that PDF. If it is a scan, upload a screenshot instead." : "That Word file did not contain enough text."
	};
	return {
		ok: true,
		text: clean.slice(0, 2e4)
	};
}
async function pdfText(bytes) {
	const pdf = await getDocumentProxy(bytes);
	const { text } = await extractText(pdf, { mergePages: true });
	return text;
}
function docxText(bytes) {
	const files = unzipSync(bytes);
	const key = Object.keys(files).find((name) => /(^|\/)word\/document\.xml$/.test(name));
	if (!key) throw new Error("no document");
	return decodeXml(strFromU8(files[key]).replace(/<w:tab\b[^>]*\/>/g, " ").replace(/<w:br\b[^>]*\/>/g, "\n").replace(/<\/w:p>/g, "\n").replace(/<[^>]+>/g, ""));
}
function decodeXml(value) {
	return value.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16))).replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number(num))).replace(/</g, "<").replace(/>/g, ">").replace(/"/g, "\"").replace(/'/g, "'").replace(/&/g, "&");
}
function decodeBase64(value) {
	try {
		const clean = value.replace(/\s/g, "");
		if (!clean) return null;
		return Uint8Array.from(Buffer.from(clean, "base64"));
	} catch {
		return null;
	}
}
//#endregion
export { textFromUpload };
