import { strFromU8, unzipSync } from "fflate";
import { extractText, getDocumentProxy } from "unpdf";

export async function textFromUpload(
  name: string,
  base64: string,
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const lower = name.toLowerCase();
  const bytes = decodeBase64(base64);
  if (!bytes) return { ok: false, error: "Could not read that file." };

  try {
    if (lower.endsWith(".pdf")) return finish(await pdfText(bytes), "pdf");
    if (lower.endsWith(".docx")) return finish(docxText(bytes), "docx");
    return { ok: false, error: "Upload a PDF or a Word .docx file." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/password/i.test(message)) return { ok: false, error: "That PDF is locked. Paste the text instead." };
    if (lower.endsWith(".docx")) return { ok: false, error: "Could not open that Word file. Save it as .docx and try again." };
    return { ok: false, error: "Could not open that PDF. Paste the text, or upload a screenshot of the page." };
  }
}

function finish(text: string, kind: "pdf" | "docx"): { ok: true; text: string } | { ok: false; error: string } {
  const clean = text.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (clean.length < 20) {
    return {
      ok: false,
      error:
        kind === "pdf"
          ? "No selectable text in that PDF. If it is a scan, upload a screenshot instead."
          : "That Word file did not contain enough text.",
    };
  }
  return { ok: true, text: clean.slice(0, 20000) };
}

async function pdfText(bytes: Uint8Array) {
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}

function docxText(bytes: Uint8Array) {
  const files = unzipSync(bytes);
  const key = Object.keys(files).find((name) => /(^|\/)word\/document\.xml$/.test(name));
  if (!key) throw new Error("no document");
  const xml = strFromU8(files[key])
    .replace(/<w:tab\b[^>]*\/>/g, " ")
    .replace(/<w:br\b[^>]*\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "");
  return decodeXml(xml);
}

function decodeXml(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num: string) => String.fromCodePoint(Number(num)))
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/&/g, "&");
}

function decodeBase64(value: string) {
  try {
    const clean = value.replace(/\s/g, "");
    if (!clean) return null;
    return Uint8Array.from(Buffer.from(clean, "base64"));
  } catch {
    return null;
  }
}
