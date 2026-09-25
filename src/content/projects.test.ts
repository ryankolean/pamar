import { describe, expect, it } from "vitest";
import { getProjectBySlug, getProjects, getRelatedProjects } from "./projects";
import { getServices } from "./services";

describe("projects content", () => {
  it("has unique, URL-safe slugs", async () => {
    const slugs = (await getProjects()).map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("only references services that exist", async () => {
    const serviceSlugs = new Set((await getServices()).map((s) => s.slug));
    for (const project of await getProjects()) {
      expect(project.services.length).toBeGreaterThan(0);
      for (const slug of project.services) expect(serviceSlugs.has(slug)).toBe(true);
    }
  });

  it("gives every project at least one image with alt text", async () => {
    for (const project of await getProjects()) {
      expect(project.images.length).toBeGreaterThan(0);
      for (const image of project.images) expect(image.alt.length).toBeGreaterThan(0);
    }
  });

  it("excludes the project itself from related projects", async () => {
    const project = (await getProjectBySlug("cso-3-5-phase-ii-control-123688"))!;
    const related = await getRelatedProjects(project);
    expect(related.map((p) => p.slug)).not.toContain(project.slug);
  });
});
