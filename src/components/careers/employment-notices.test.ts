import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { eeoStatement, employmentNotices } from "@/content/employment-notices";
import { EmploymentNotices } from "./employment-notices";

describe("EmploymentNotices", () => {
  const html = renderToStaticMarkup(createElement(EmploymentNotices));

  it("renders the EEO statement", () => {
    expect(html).toContain("An Equal Opportunity Employer");
    expect(html).toContain("Pamar Enterprises is an Equal Opportunity Employer.");
    for (const paragraph of eeoStatement.body) expect(html).toContain(paragraph);
  });

  it("links every federal notice to its official agency page", () => {
    expect(employmentNotices.map((n) => n.href)).toEqual([
      "https://www.eeoc.gov/poster",
      "https://www.dol.gov/agencies/whd/posters/fmla",
      "https://www.dol.gov/agencies/whd/posters/employee-polygraph-protection-act",
    ]);
    for (const notice of employmentNotices) {
      expect(html).toContain(`href="${notice.href}"`);
      expect(html).toContain(notice.title);
    }
  });

  it("opens notices in a new tab safely", () => {
    const anchors = html.match(/<a [^>]*>/g) ?? [];
    expect(anchors).toHaveLength(employmentNotices.length);
    for (const anchor of anchors) {
      expect(anchor).toContain('target="_blank"');
      expect(anchor).toContain('rel="noopener noreferrer"');
    }
  });

  it("does not include E-Verify notices", () => {
    expect(html).not.toMatch(/e-verify|right to work/i);
  });
});
