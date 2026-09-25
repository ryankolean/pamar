import { describe, expect, it, vi } from "vitest";
import type { EmailMessage } from "@/lib/email";
import type { SubmissionDeps } from "@/lib/forms/submission";
import { handleRegistrationSubmission } from "./registration";

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);

function form(entries: Record<string, string | string[]>, files: Record<string, File> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    for (const v of Array.isArray(value) ? value : [value]) data.append(key, v);
  }
  for (const [key, file] of Object.entries(files)) data.set(key, file);
  return data;
}

const valid = {
  companyName: "Acme Paving LLC",
  contactName: "Jordan Lee",
  email: "jordan@acme.example",
  phone: "(555) 987-6543",
  street: "1 Industrial Dr",
  city: "Townsville",
  state: "MI",
  zip: "48000",
  trades: ["Asphalt Paving", "Pavement Markings"],
  serviceArea: "Tri-county area",
  yearsInBusiness: "12",
  certifications: ["WBE"],
  bonding: "$250K–$1M",
  insured: "yes",
};

function setup(overrides: Partial<SubmissionDeps> = {}) {
  const sent: EmailMessage[] = [];
  const deps: SubmissionDeps = {
    sendEmail: vi.fn(async (m: EmailMessage) => {
      sent.push(m);
    }),
    verifyHuman: vi.fn(async () => true),
    ...overrides,
  };
  return { sent, deps };
}

describe("handleRegistrationSubmission", () => {
  it("notifies estimating with documents and confirms to the registrant", async () => {
    const { sent, deps } = setup();
    const state = await handleRegistrationSubmission(
      form(valid, { coi: new File([PDF], "coi.pdf"), w9: new File([PDF], "w9.pdf") }),
      deps,
    );
    expect(state.status).toBe("success");
    expect(sent).toHaveLength(2);
    const [estimating, confirmation] = sent;
    expect(estimating.subject).toBe("Subcontractor registration: Acme Paving LLC");
    expect(estimating.text).toContain("Asphalt Paving, Pavement Markings");
    expect(estimating.text).toContain("Townsville, MI 48000");
    expect(estimating.attachments?.map((a) => a.filename)).toEqual([
      "Acme_Paving_LLC-COI-coi.pdf",
      "Acme_Paving_LLC-W9-w9.pdf",
    ]);
    expect(confirmation.to).toBe("jordan@acme.example");
  });

  it("works without optional documents", async () => {
    const { sent, deps } = setup();
    expect((await handleRegistrationSubmission(form(valid), deps)).status).toBe("success");
    expect(sent[0].attachments).toEqual([]);
    expect(sent[0].text).toContain("None uploaded");
  });

  it("requires at least one trade, a valid email and ZIP, and insurance confirmation", async () => {
    const { deps } = setup();
    const state = await handleRegistrationSubmission(
      form({ ...valid, trades: [], email: "nope", zip: "ABCDE", insured: "" }),
      deps,
    );
    expect(state.status).toBe("error");
    expect(Object.keys(state.fieldErrors ?? {}).sort()).toEqual([
      "email",
      "insured",
      "trades",
      "zip",
    ]);
    expect(state.values?.companyName).toBe("Acme Paving LLC");
  });

  it("rejects unknown trades and non-numeric years", async () => {
    const { deps } = setup();
    const state = await handleRegistrationSubmission(
      form({ ...valid, trades: ["Rocket Science"], yearsInBusiness: "a dozen" }),
      deps,
    );
    expect(state.fieldErrors?.trades).toBeDefined();
    expect(state.fieldErrors?.yearsInBusiness).toBeDefined();
  });

  it("validates document uploads even when the rest of the form is valid", async () => {
    const { sent, deps } = setup();
    const state = await handleRegistrationSubmission(
      form(valid, { coi: new File([new Uint8Array([0x50, 0x4b, 0x03, 0x04])], "coi.docx") }),
      deps,
    );
    expect(state.status).toBe("error");
    expect(state.fieldErrors?.coi?.[0]).toMatch(/PDF/);
    expect(sent).toHaveLength(0);
  });

  it("fails visibly if estimating can't be notified", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { deps } = setup({
      sendEmail: vi.fn(async () => {
        throw new Error("down");
      }),
    });
    expect((await handleRegistrationSubmission(form(valid), deps)).status).toBe("error");
  });
});
