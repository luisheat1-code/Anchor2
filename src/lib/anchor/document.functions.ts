import { createServerFn } from "@tanstack/react-start";

function asFile(data: unknown) {
  if (!data || typeof data !== "object") throw new Error("Bad request");
  const row = data as { name?: unknown; base64?: unknown };
  const name = typeof row.name === "string" ? row.name.slice(0, 180) : "syllabus";
  const base64 = typeof row.base64 === "string" ? row.base64.replace(/\s/g, "") : "";
  if (base64.length < 16) throw new Error("Empty file");
  if (base64.length > 8_000_000) throw new Error("File is too large");
  return { name, base64 };
}

export const readDocument = createServerFn({ method: "POST" })
  .validator(asFile)
  .handler(async ({ data }) => {
    const { textFromUpload } = await import("./documents.server");
    return textFromUpload(data.name, data.base64);
  });
