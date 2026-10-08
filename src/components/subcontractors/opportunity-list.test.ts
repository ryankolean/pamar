import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Opportunity } from "@/content/opportunities";
import { OpportunityList } from "./opportunity-list";

const opportunity: Opportunity = {
  slug: "streetscape",
  projectName: "Downtown Streetscape",
  owner: "City",
  location: "Downtown",
  trades: ["Pavement Markings"],
  summary: "",
  description: [],
  bidDueAt: "2026-10-16T14:00:00-04:00",
  documents: [],
  contact: { name: "Estimating", email: "estimating@example.com" },
};

const now = new Date("2026-10-01T12:00:00-04:00");

function render(overrides: Partial<Opportunity>) {
  return renderToStaticMarkup(
    createElement(OpportunityList, { opportunities: [{ ...opportunity, ...overrides }], now }),
  );
}

describe("OpportunityList", () => {
  it("shows the bid ID and owner job number when set", () => {
    const html = render({ bidId: "PE-26-101", ownerJobNumber: "CITY-2026-014" });
    expect(html).toMatch(/<dt[^>]*>Bid ID<\/dt><dd[^>]*>PE-26-101<\/dd>/);
    expect(html).toMatch(/<dt[^>]*>Owner job #<\/dt><dd[^>]*>CITY-2026-014<\/dd>/);
  });

  it("renders no reference labels when neither is set", () => {
    const html = render({});
    expect(html).not.toContain("Bid ID");
    expect(html).not.toContain("Owner job #");
  });
});
