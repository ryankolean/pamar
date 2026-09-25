import { describe, expect, it } from "vitest";
import { getUpload, toAttachment, validateUpload } from "./files";

const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31];
const DOCX = [0x50, 0x4b, 0x03, 0x04, 0x14, 0x00];

function file(name: string, bytes: number[], size?: number) {
  const body = new Uint8Array(size ?? bytes.length);
  body.set(bytes);
  return new File([body], name);
}

const rules = { maxBytes: 1024, kinds: ["pdf", "docx"] as const, required: true, label: "Resume" };

describe("validateUpload", () => {
  it("accepts matching extension and signature", async () => {
    expect(await validateUpload(file("cv.pdf", PDF), rules)).toBeNull();
    expect(await validateUpload(file("CV.DOCX", DOCX), rules)).toBeNull();
  });

  it("requires a file when required", async () => {
    expect(await validateUpload(undefined, rules)).toBe("Resume is required.");
    expect(await validateUpload(undefined, { ...rules, required: false })).toBeNull();
  });

  it("rejects oversized files", async () => {
    expect(await validateUpload(file("cv.pdf", PDF, 2048), rules)).toMatch(/or smaller/);
  });

  it("rejects disallowed extensions", async () => {
    expect(await validateUpload(file("cv.exe", PDF), rules)).toMatch(/PDF, DOCX/);
    expect(await validateUpload(file("cv", PDF), rules)).toMatch(/PDF, DOCX/);
  });

  it("rejects content that doesn't match the extension", async () => {
    expect(await validateUpload(file("cv.pdf", DOCX), rules)).toMatch(/valid PDF/);
    expect(await validateUpload(file("cv.pdf", [0x4d, 0x5a]), rules)).toMatch(/valid PDF/);
  });
});

describe("getUpload", () => {
  it("ignores the empty file browsers send when nothing is chosen", () => {
    const data = new FormData();
    data.set("resume", new File([], ""));
    expect(getUpload(data, "resume")).toBeUndefined();
    data.set("resume", file("cv.pdf", PDF));
    expect(getUpload(data, "resume")?.name).toBe("cv.pdf");
  });
});

describe("toAttachment", () => {
  it("sanitizes the filename and keeps the bytes", async () => {
    const attachment = await toAttachment(file("../My Résumé (final).pdf", PDF), "Pat_Smith");
    expect(attachment.filename).toBe("Pat_Smith-My_Resume_final_.pdf");
    expect([...attachment.content]).toEqual(PDF);
  });
});
