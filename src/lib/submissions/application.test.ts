import { describe, expect, it, vi } from "vitest";
import type { EmailMessage } from "@/lib/email";
import { HONEYPOT_FIELD } from "@/lib/forms/spam";
import type { SubmissionDeps } from "@/lib/forms/submission";
import { handleApplicationSubmission } from "./application";

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);

function form(
  entries: Record<string, string | string[]>,
  resume: File | null = new File([PDF], "cv.pdf"),
) {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    for (const v of Array.isArray(value) ? value : [value]) data.append(key, v);
  }
  if (resume) data.set("resume", resume);
  return data;
}

const valid = {
  position: "pipe-layer",
  name: "Pat Smith",
  email: "pat@example.com",
  phone: "555-123-4567",
  experience: "3–5 years",
  certifications: ["OSHA 10", "CDL Class A"],
  consent: "yes",
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

describe("handleApplicationSubmission", () => {
  it("emails HR with the resume attached and confirms to the applicant", async () => {
    const { sent, deps } = setup();
    const state = await handleApplicationSubmission(form(valid), deps);
    expect(state.status).toBe("success");
    expect(sent).toHaveLength(2);

    const [hr, confirmation] = sent;
    expect(hr.subject).toBe("Application: Pipe Layer – Pat Smith");
    expect(hr.replyTo).toBe("pat@example.com");
    expect(hr.text).toContain("OSHA 10, CDL Class A");
    expect(hr.attachments?.[0].filename).toBe("Pat_Smith-cv.pdf");
    expect(confirmation.to).toBe("pat@example.com");
    expect(confirmation.text).toContain("the Pipe Layer position");
  });

  it("supports general applications", async () => {
    const { sent, deps } = setup();
    const state = await handleApplicationSubmission(form({ ...valid, position: "general" }), deps);
    expect(state.status).toBe("success");
    expect(sent[0].subject).toContain("General application");
    expect(sent[1].text).toContain("for a position");
  });

  it("requires a resume and reports it with other field errors", async () => {
    const { sent, deps } = setup();
    const state = await handleApplicationSubmission(form({ ...valid, email: "bad" }, null), deps);
    expect(state.status).toBe("error");
    expect(state.fieldErrors?.resume).toEqual(["Resume is required."]);
    expect(state.fieldErrors?.email).toBeDefined();
    expect(state.values?.name).toBe("Pat Smith");
    expect(sent).toHaveLength(0);
  });

  it("rejects a resume whose content isn't what its extension claims", async () => {
    const { deps } = setup();
    const fake = new File([new Uint8Array([0x4d, 0x5a, 0x90, 0x00])], "cv.pdf");
    const state = await handleApplicationSubmission(form(valid, fake), deps);
    expect(state.fieldErrors?.resume?.[0]).toMatch(/valid PDF/);
  });

  it("rejects unknown positions and requires consent", async () => {
    const { deps } = setup();
    const unknown = await handleApplicationSubmission(
      form({ ...valid, position: "astronaut" }),
      deps,
    );
    expect(unknown.fieldErrors?.position).toEqual(["Choose a position."]);

    const noConsent = await handleApplicationSubmission(form({ ...valid, consent: "" }), deps);
    expect(noConsent.fieldErrors?.consent).toBeDefined();
  });

  it("rejects certifications that aren't on the list", async () => {
    const { deps } = setup();
    const state = await handleApplicationSubmission(
      form({ ...valid, certifications: ["Wizard"] }),
      deps,
    );
    expect(state.fieldErrors?.certifications).toBeDefined();
  });

  it("still succeeds if only the applicant confirmation fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    let calls = 0;
    const { deps } = setup({
      sendEmail: vi.fn(async () => {
        if (++calls === 2) throw new Error("bounce");
      }),
    });
    expect((await handleApplicationSubmission(form(valid), deps)).status).toBe("success");
  });

  it("fails visibly if HR can't be notified", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { deps } = setup({
      sendEmail: vi.fn(async () => {
        throw new Error("down");
      }),
    });
    const state = await handleApplicationSubmission(form(valid), deps);
    expect(state.status).toBe("error");
    expect(state.values?.email).toBe("pat@example.com");
  });

  it("drops honeypot submissions silently", async () => {
    const { sent, deps } = setup();
    const state = await handleApplicationSubmission(
      form({ ...valid, [HONEYPOT_FIELD]: "x" }),
      deps,
    );
    expect(state.status).toBe("success");
    expect(sent).toHaveLength(0);
  });
});
