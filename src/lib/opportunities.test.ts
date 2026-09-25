import { describe, expect, it } from "vitest";
import type { Opportunity } from "@/content/opportunities";
import {
  dueLabel,
  filterOpportunities,
  formatDateTime,
  isAcceptingSubmissions,
  opportunityStatus,
  parseOpportunityFilters,
  sortOpportunities,
} from "./opportunities";

function opp(overrides: Partial<Opportunity>): Opportunity {
  return {
    slug: "o",
    projectName: "O",
    owner: "",
    location: "",
    trades: ["Traffic Control"],
    summary: "",
    description: [],
    bidDueAt: "2026-10-01T14:00:00-04:00",
    documents: [],
    contact: { name: "", email: "" },
    ...overrides,
  };
}

const now = new Date("2026-09-25T12:00:00-04:00");

describe("opportunityStatus", () => {
  it("is Open before the due time and Closed at or after it", () => {
    expect(opportunityStatus(opp({}), now)).toBe("Open");
    expect(opportunityStatus(opp({ bidDueAt: "2026-09-25T12:00:00-04:00" }), now)).toBe("Closed");
    expect(opportunityStatus(opp({ bidDueAt: "2026-09-01T14:00:00-04:00" }), now)).toBe("Closed");
  });

  it("reports Awarded regardless of date", () => {
    expect(opportunityStatus(opp({ awarded: true }), now)).toBe("Awarded");
    expect(isAcceptingSubmissions(opp({ awarded: true }), now)).toBe(false);
  });

  it("respects the offset in the due timestamp", () => {
    // 11:59 ET is 15:59 UTC: still open one minute before a noon ET deadline.
    const due = opp({ bidDueAt: "2026-09-25T12:00:00-04:00" });
    expect(opportunityStatus(due, new Date("2026-09-25T15:59:00Z"))).toBe("Open");
    expect(opportunityStatus(due, new Date("2026-09-25T16:00:00Z"))).toBe("Closed");
  });
});

describe("dueLabel", () => {
  it("counts whole days remaining", () => {
    expect(dueLabel(opp({ bidDueAt: "2026-09-30T14:00:00-04:00" }), now)).toBe("Due in 5 days");
    expect(dueLabel(opp({ bidDueAt: "2026-09-26T13:00:00-04:00" }), now)).toBe("Due in 1 day");
    expect(dueLabel(opp({ bidDueAt: "2026-09-25T18:00:00-04:00" }), now)).toBe(
      "Due within 24 hours",
    );
    expect(dueLabel(opp({ bidDueAt: "2026-09-01T18:00:00-04:00" }), now)).toBeNull();
  });
});

describe("sortOpportunities", () => {
  it("lists open packages soonest-first, then closed most-recent-first", () => {
    const list = [
      opp({ slug: "closed-old", bidDueAt: "2026-08-01T12:00:00-04:00" }),
      opp({ slug: "open-late", bidDueAt: "2026-11-01T12:00:00-04:00" }),
      opp({ slug: "closed-recent", bidDueAt: "2026-09-20T12:00:00-04:00" }),
      opp({ slug: "open-soon", bidDueAt: "2026-10-01T12:00:00-04:00" }),
    ];
    expect(sortOpportunities(list, now).map((o) => o.slug)).toEqual([
      "open-soon",
      "open-late",
      "closed-recent",
      "closed-old",
    ]);
  });
});

describe("filters", () => {
  it("parses only known trades and statuses", () => {
    expect(parseOpportunityFilters({ trade: "Dewatering", status: "Open" })).toEqual({
      trade: "Dewatering",
      status: "Open",
    });
    expect(parseOpportunityFilters({ trade: "Magic", status: "Pending" })).toEqual({});
  });

  it("filters by trade and derived status", () => {
    const list = [
      opp({ slug: "a", trades: ["Dewatering"] }),
      opp({ slug: "b", trades: ["Dewatering"], bidDueAt: "2026-09-01T12:00:00-04:00" }),
      opp({ slug: "c", trades: ["Traffic Control"] }),
    ];
    const slugs = (l: Opportunity[]) => l.map((o) => o.slug);
    expect(slugs(filterOpportunities(list, { trade: "Dewatering" }, now))).toEqual(["a", "b"]);
    expect(slugs(filterOpportunities(list, { trade: "Dewatering", status: "Open" }, now))).toEqual([
      "a",
    ]);
    expect(slugs(filterOpportunities(list, { status: "Closed" }, now))).toEqual(["b"]);
  });
});

describe("formatDateTime", () => {
  it("formats in the company time zone", () => {
    expect(formatDateTime("2026-10-16T18:00:00Z")).toBe("Fri, Oct 16, 2026, 2:00 PM EDT");
    expect(formatDateTime("2026-12-01T19:00:00Z")).toBe("Tue, Dec 1, 2026, 2:00 PM EST");
  });
});
