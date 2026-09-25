import { describe, expect, it } from "vitest";
import { headerCta, mainNav } from "./site";

describe("navigation config", () => {
  it("uses unique, root-relative hrefs", () => {
    const hrefs = [...mainNav, ...(headerCta ? [headerCta] : [])].map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const href of hrefs) expect(href.startsWith("/")).toBe(true);
  });
});
