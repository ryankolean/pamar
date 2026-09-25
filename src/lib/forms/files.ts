import type { EmailAttachment } from "@/lib/email";

export type FileKind = "pdf" | "doc" | "docx";

const MB = 1024 * 1024;

export const uploadLimits = {
  resume: { maxBytes: 5 * MB, kinds: ["pdf", "doc", "docx"] as FileKind[] },
  /** Certificate of insurance and W-9 on subcontractor registration (each). */
  companyDocument: { maxBytes: 5 * MB, kinds: ["pdf"] as FileKind[] },
  /** Bid document attached to a bid submission. */
  bidDocument: { maxBytes: 15 * MB, kinds: ["pdf"] as FileKind[] },
} as const;

/** File signatures ("magic bytes") so a renamed executable can't pass as a PDF. */
const signatures: Record<FileKind, number[]> = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  docx: [0x50, 0x4b, 0x03, 0x04], // ZIP container
  doc: [0xd0, 0xcf, 0x11, 0xe0], // OLE compound file
};

const extensionKinds: Record<string, FileKind> = { pdf: "pdf", doc: "doc", docx: "docx" };

export function acceptAttribute(kinds: readonly FileKind[]): string {
  return kinds.map((kind) => `.${kind}`).join(",");
}

function describeKinds(kinds: readonly FileKind[]) {
  return kinds.map((k) => k.toUpperCase()).join(", ");
}

/** Present if the user actually chose a file (browsers send an empty File otherwise). */
export function getUpload(formData: FormData, name: string): File | undefined {
  const value = formData.get(name);
  return value instanceof File && value.size > 0 ? value : undefined;
}

/** Validate an upload's size, extension, and content signature. Returns an error message or null. */
export async function validateUpload(
  file: File | undefined,
  rules: { maxBytes: number; kinds: readonly FileKind[]; required: boolean; label: string },
): Promise<string | null> {
  if (!file) return rules.required ? `${rules.label} is required.` : null;

  if (file.size > rules.maxBytes) {
    return `${rules.label} must be ${Math.floor(rules.maxBytes / MB)} MB or smaller.`;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const kind = extensionKinds[extension];
  if (!kind || !rules.kinds.includes(kind)) {
    return `${rules.label} must be a ${describeKinds(rules.kinds)} file.`;
  }

  const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  if (!signatures[kind].every((byte, i) => header[i] === byte)) {
    return `${rules.label} doesn’t look like a valid ${kind.toUpperCase()} file.`;
  }

  return null;
}

/** Make an uploaded file safe to attach: keep a clean filename, read the bytes. */
export async function toAttachment(file: File, prefix?: string): Promise<EmailAttachment> {
  const base = (file.name.split(/[\\/]/).pop() ?? "upload")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(-100);
  return {
    filename: prefix ? `${prefix}-${base}` : base,
    content: Buffer.from(await file.arrayBuffer()),
  };
}
