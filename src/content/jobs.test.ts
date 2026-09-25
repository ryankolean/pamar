import { describe, expect, it } from "vitest";
import { getJobBySlug, getJobs } from "./jobs";

describe("jobs content", () => {
  it("has unique, URL-safe slugs", async () => {
    const slugs = (await getJobs()).map((j) => j.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("uses valid ISO posted dates and lists newest first", async () => {
    const jobs = await getJobs();
    for (const job of jobs) {
      expect(job.postedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(job.postedAt))).toBe(false);
    }
    const dates = jobs.map((j) => j.postedAt);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("gives every job responsibilities and requirements", async () => {
    for (const job of await getJobs()) {
      expect(job.responsibilities.length).toBeGreaterThan(0);
      expect(job.requirements.length).toBeGreaterThan(0);
    }
  });

  it("looks jobs up by slug", async () => {
    expect((await getJobBySlug("pipe-layer"))?.title).toBe("Pipe Layer");
    expect(await getJobBySlug("nope")).toBeUndefined();
  });
});
