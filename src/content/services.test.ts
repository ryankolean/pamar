import { describe, expect, it } from "vitest";
import { getServiceBySlug, getServices } from "./services";

describe("services content", () => {
  it("has unique, URL-safe slugs", async () => {
    const slugs = (await getServices()).map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("gives every service a summary and at least one capability", async () => {
    for (const service of await getServices()) {
      expect(service.summary.length).toBeGreaterThan(0);
      expect(service.capabilities.length).toBeGreaterThan(0);
    }
  });

  it("looks services up by slug", async () => {
    expect((await getServiceBySlug("underground-utilities"))?.name).toBe("Underground Utilities");
    expect(await getServiceBySlug("does-not-exist")).toBeUndefined();
  });
});
