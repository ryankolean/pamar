import { describe, expect, it } from "vitest";
import { getOpportunities } from "./opportunities";
import { trades } from "./trades";

describe("opportunities content", () => {
  it("has unique, URL-safe slugs", async () => {
    const slugs = (await getOpportunities()).map((o) => o.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("uses timestamps with explicit offsets and known trades", async () => {
    for (const o of await getOpportunities()) {
      expect(o.bidDueAt).toMatch(/[+-]\d{2}:\d{2}$|Z$/);
      if (o.preBid) expect(o.preBid.at).toMatch(/[+-]\d{2}:\d{2}$|Z$/);
      expect(o.trades.length).toBeGreaterThan(0);
      for (const t of o.trades) expect(trades).toContain(t);
    }
  });
});
