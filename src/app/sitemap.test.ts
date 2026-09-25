import { describe, expect, it } from "vitest";
import { getJobs } from "@/content/jobs";
import { getOpportunities } from "@/content/opportunities";
import { getProjects } from "@/content/projects";
import { getServices } from "@/content/services";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("lists every service, project, job, and opportunity page", async () => {
    const urls = new Set((await sitemap()).map((entry) => new URL(entry.url).pathname));
    const expected = [
      ...(await getServices()).map((s) => `/services/${s.slug}`),
      ...(await getProjects()).map((p) => `/projects/${p.slug}`),
      ...(await getJobs()).map((j) => `/careers/${j.slug}`),
      ...(await getOpportunities()).map((o) => `/subcontractors/opportunities/${o.slug}`),
      "/",
      "/contact",
    ];
    for (const path of expected) expect(urls.has(path), path).toBe(true);
  });

  it("has no duplicate URLs and no thank-you pages", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.some((u) => u.includes("/thanks"))).toBe(false);
  });
});
