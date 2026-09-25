import { describe, expect, it } from "vitest";
import type { Job } from "@/content/jobs";
import { filterJobs, hasActiveJobFilters, jobLocations, parseJobFilters } from "./job-filters";

function job(overrides: Partial<Job>): Job {
  return {
    slug: "j",
    title: "J",
    department: "Field Operations",
    location: "Field",
    employmentType: "Full-time",
    summary: "",
    responsibilities: [],
    requirements: [],
    postedAt: "2026-01-01",
    ...overrides,
  };
}

const jobs = [
  job({
    slug: "a",
    department: "Field Operations",
    location: "Field",
    employmentType: "Full-time",
  }),
  job({ slug: "b", department: "Field Operations", location: "Field", employmentType: "Seasonal" }),
  job({
    slug: "c",
    department: "Estimating",
    location: "Main office",
    employmentType: "Full-time",
  }),
];
const slugs = (list: Job[]) => list.map((j) => j.slug);

describe("job filters", () => {
  it("lists distinct locations alphabetically", () => {
    expect(jobLocations(jobs)).toEqual(["Field", "Main office"]);
  });

  it("parses only allowed values", () => {
    expect(
      parseJobFilters({ department: "Estimating", location: "Main office", type: "Seasonal" }, [
        "Main office",
      ]),
    ).toEqual({ department: "Estimating", location: "Main office", type: "Seasonal" });
    expect(
      parseJobFilters({ department: "Space", location: "Mars", type: "Forever" }, ["Field"]),
    ).toEqual({});
  });

  it("combines filters with AND", () => {
    expect(slugs(filterJobs(jobs, {}))).toEqual(["a", "b", "c"]);
    expect(slugs(filterJobs(jobs, { type: "Full-time" }))).toEqual(["a", "c"]);
    expect(slugs(filterJobs(jobs, { type: "Full-time", location: "Field" }))).toEqual(["a"]);
    expect(slugs(filterJobs(jobs, { department: "Estimating", type: "Seasonal" }))).toEqual([]);
  });

  it("detects active filters", () => {
    expect(hasActiveJobFilters({})).toBe(false);
    expect(hasActiveJobFilters({ location: "Field" })).toBe(true);
  });
});
