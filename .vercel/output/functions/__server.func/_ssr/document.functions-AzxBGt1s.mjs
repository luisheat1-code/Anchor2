import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/document.functions-AzxBGt1s.js
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
var readDocument_createServerFn_handler = createServerRpc({
	id: "37071d12b5321cb08b321a0dd837ac226e5a4871ba4827ad4b8fd94628981292",
	name: "readDocument",
	filename: "src/lib/anchor/document.functions.ts"
}, (opts) => readDocument.__executeServer(opts));
var readDocument = createServerFn({ method: "POST" }).validator(asFile).handler(readDocument_createServerFn_handler, async ({ data }) => {
	const { textFromUpload } = await import("./documents.server-BzRGVVEo.mjs");
	return textFromUpload(data.name, data.base64);
});
//#endregion
export { readDocument_createServerFn_handler };
