import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getProjects, type Project } from "@/content/projects";
import { ProjectCard } from "./project-card";

const escape = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

const render = (project: Project) => renderToStaticMarkup(createElement(ProjectCard, { project }));

describe("ProjectCard", () => {
  it("shows the location and owner of every project", async () => {
    for (const project of await getProjects()) {
      const html = render(project);
      expect(html).toContain(`<dd class="min-w-0 break-words">${escape(project.location)}</dd>`);
      expect(html).toContain(`<dd class="min-w-0 break-words">${escape(project.owner)}</dd>`);
    }
  });

  it("labels the facts for screen readers", async () => {
    const [project] = await getProjects();
    const html = render(project);
    expect(html).toContain(">Location</span>");
    expect(html).toContain(">Owner</span>");
  });
});
