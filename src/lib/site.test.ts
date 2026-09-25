import { describe, expect, it } from "vitest";
import { headerCta, mainNav } from "./site";

describe("navigation config", () => {
  it("uses unique, root-relative hrefs", () => {
    const hrefs = [...mainNav, ...(headerCta ? [headerCta] : [])].map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const href of hrefs) expect(href.startsWith("/")).toBe(true);
  });
});

describe("link helpers", () => {
  it("builds tel: hrefs from display numbers", async () => {
    const { telHref } = await import("./site");
    expect(telHref("(555) 123-4567")).toBe("tel:5551234567");
    expect(telHref("+1 555.123.4567")).toBe("tel:+15551234567");
  });

  it("builds map search links", async () => {
    const { mapUrl } = await import("./site");
    expect(mapUrl(["1 Main St", "Town, ST 00000"])).toBe(
      "https://www.google.com/maps/search/?api=1&query=1%20Main%20St%2C%20Town%2C%20ST%2000000",
    );
  });
});
