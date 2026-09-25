import { describe, expect, it, vi } from "vitest";
import type { EmailMessage } from "@/lib/email";
import { HONEYPOT_FIELD } from "@/lib/forms/spam";
import type { SubmissionDeps } from "@/lib/forms/submission";
import { handleContactSubmission } from "./contact";

function form(entries: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
}

const valid = {
  name: "Pat Smith",
  email: "pat@example.com",
  phone: "(555) 123-4567",
  topic: "General inquiry",
  message: "Hello there",
};

function deps(overrides: Partial<SubmissionDeps> = {}) {
  const sent: EmailMessage[] = [];
  return {
    sent,
    deps: {
      sendEmail: vi.fn(async (m: EmailMessage) => {
        sent.push(m);
      }),
      verifyHuman: vi.fn(async () => true),
      ...overrides,
    } satisfies SubmissionDeps,
  };
}

describe("handleContactSubmission", () => {
  it("emails a valid submission with reply-to set", async () => {
    const { deps: d, sent } = deps();
    const state = await handleContactSubmission(form(valid), d);
    expect(state.status).toBe("success");
    expect(sent).toHaveLength(1);
    expect(sent[0].replyTo).toBe("pat@example.com");
    expect(sent[0].subject).toContain("Pat Smith");
    expect(sent[0].text).toContain("Hello there");
  });

  it("returns field errors and keeps values for invalid input", async () => {
    const { deps: d, sent } = deps();
    const state = await handleContactSubmission(
      form({ ...valid, email: "not-an-email", topic: "Nope", message: "" }),
      d,
    );
    expect(state.status).toBe("error");
    expect(Object.keys(state.fieldErrors ?? {}).sort()).toEqual(["email", "message", "topic"]);
    expect(state.values?.name).toBe("Pat Smith");
    expect(sent).toHaveLength(0);
  });

  it("accepts a missing optional phone but rejects a malformed one", async () => {
    const { deps: d } = deps();
    expect((await handleContactSubmission(form({ ...valid, phone: "" }), d)).status).toBe(
      "success",
    );
    const bad = await handleContactSubmission(form({ ...valid, phone: "call me" }), d);
    expect(bad.fieldErrors?.phone).toBeDefined();
  });

  it("silently accepts honeypot submissions without sending", async () => {
    const { deps: d, sent } = deps();
    const state = await handleContactSubmission(form({ ...valid, [HONEYPOT_FIELD]: "x" }), d);
    expect(state.status).toBe("success");
    expect(sent).toHaveLength(0);
  });

  it("rejects failed human verification", async () => {
    const { deps: d, sent } = deps({ verifyHuman: vi.fn(async () => false) });
    const state = await handleContactSubmission(form(valid), d);
    expect(state.status).toBe("error");
    expect(sent).toHaveLength(0);
  });

  it("reports a friendly error when email delivery fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { deps: d } = deps({
      sendEmail: vi.fn(async () => {
        throw new Error("provider down");
      }),
    });
    const state = await handleContactSubmission(form(valid), d);
    expect(state.status).toBe("error");
    expect(state.message).toMatch(/something went wrong/i);
    expect(state.values?.email).toBe("pat@example.com");
  });
});
