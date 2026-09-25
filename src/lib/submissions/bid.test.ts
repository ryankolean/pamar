import { describe, expect, it, vi } from "vitest";
import type { Opportunity } from "@/content/opportunities";
import type { EmailMessage } from "@/lib/email";
import { type BidDeps, handleBidSubmission, parseAmount } from "./bid";

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);

const opportunity: Opportunity = {
  slug: "streetscape",
  projectName: "Downtown Streetscape",
  owner: "City",
  location: "Downtown",
  trades: ["Concrete Flatwork & Curb", "Pavement Markings"],
  summary: "",
  description: [],
  bidDueAt: "2026-10-16T14:00:00-04:00",
  documents: [],
  contact: { name: "Estimating", email: "estimating@example.com" },
};

function form(entries: Record<string, string | string[]>, document?: File) {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    for (const v of Array.isArray(value) ? value : [value]) data.append(key, v);
  }
  if (document) data.set("bidDocument", document);
  return data;
}

const base = {
  opportunity: "streetscape",
  companyName: "Curb Co",
  contactName: "Sam Rivera",
  email: "sam@curb.example",
  phone: "555-222-3333",
  trades: ["Concrete Flatwork & Curb"],
};

function setup(overrides: Partial<BidDeps> = {}) {
  const sent: EmailMessage[] = [];
  const deps: BidDeps = {
    sendEmail: vi.fn(async (m: EmailMessage) => {
      sent.push(m);
    }),
    verifyHuman: vi.fn(async () => true),
    now: () => new Date("2026-10-01T12:00:00-04:00"),
    getOpportunity: async (slug) => (slug === opportunity.slug ? opportunity : undefined),
    ...overrides,
  };
  return { sent, deps };
}

describe("parseAmount", () => {
  it("accepts common dollar formats", () => {
    expect(parseAmount("125000")).toBe(125000);
    expect(parseAmount("$1,250,000.50")).toBe(1250000.5);
    expect(parseAmount(" $ 99.9 ")).toBe(99.9);
  });

  it("rejects zero, negatives, and junk", () => {
    for (const bad of ["0", "-5", "abc", "1.234", "", "$"]) expect(parseAmount(bad)).toBeNull();
  });
});

describe("handleBidSubmission", () => {
  it("accepts an intent to bid without amount or document", async () => {
    const { sent, deps } = setup();
    const state = await handleBidSubmission(form({ ...base, submissionType: "intent" }), deps);
    expect(state.status).toBe("success");
    expect(sent[0].subject).toBe("Intent to bid: Downtown Streetscape – Curb Co");
    expect(sent[0].text).not.toContain("Bid amount");
    expect(sent[1].to).toBe("sam@curb.example");
  });

  it("requires an amount and document for a bid", async () => {
    const { sent, deps } = setup();
    const state = await handleBidSubmission(form({ ...base, submissionType: "bid" }), deps);
    expect(state.status).toBe("error");
    expect(state.fieldErrors?.bidAmount).toEqual(["Bid amount is required."]);
    expect(state.fieldErrors?.bidDocument).toEqual(["Bid document is required."]);
    expect(sent).toHaveLength(0);
  });

  it("sends a complete bid with the formatted amount and attachment", async () => {
    const { sent, deps } = setup();
    const state = await handleBidSubmission(
      form({ ...base, submissionType: "bid", bidAmount: "$125,000" }, new File([PDF], "bid.pdf")),
      deps,
    );
    expect(state.status).toBe("success");
    expect(sent[0].subject).toBe("Bid: Downtown Streetscape – Curb Co");
    expect(sent[0].text).toContain("$125,000.00");
    expect(sent[0].attachments?.[0].filename).toBe("Curb_Co-Bid-bid.pdf");
  });

  it("rejects submissions once the due date has passed", async () => {
    const { sent, deps } = setup({ now: () => new Date("2026-10-16T14:00:00-04:00") });
    const state = await handleBidSubmission(form({ ...base, submissionType: "intent" }), deps);
    expect(state.status).toBe("error");
    expect(state.message).toMatch(/no longer accepting/);
    expect(sent).toHaveLength(0);
  });

  it("rejects awarded packages even before the due date", async () => {
    const { deps } = setup({ getOpportunity: async () => ({ ...opportunity, awarded: true }) });
    const state = await handleBidSubmission(form({ ...base, submissionType: "intent" }), deps);
    expect(state.message).toMatch(/no longer accepting/);
  });

  it("only allows trades that belong to the package", async () => {
    const { deps } = setup();
    const state = await handleBidSubmission(
      form({ ...base, submissionType: "intent", trades: ["Dewatering"] }),
      deps,
    );
    expect(state.fieldErrors?.trades).toBeDefined();
  });

  it("rejects unknown packages", async () => {
    const { deps } = setup();
    const state = await handleBidSubmission(
      form({ ...base, opportunity: "nope", submissionType: "intent" }),
      deps,
    );
    expect(state.status).toBe("error");
    expect(state.message).toMatch(/couldn’t find/);
  });
});
