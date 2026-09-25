import { describe, expect, it } from "vitest";
import { formatDate } from "./dates";

describe("formatDate", () => {
  it("formats date-only strings without shifting the day", () => {
    expect(formatDate("2026-09-01")).toBe("Sep 1, 2026");
    expect(formatDate("2026-12-31")).toBe("Dec 31, 2026");
  });
});
