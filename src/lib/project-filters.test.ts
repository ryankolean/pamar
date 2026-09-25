import { describe, expect, it } from "vitest";
import type { Project } from "@/content/projects";
import {
  filterProjects,
  hasActiveFilters,
  parseProjectFilters,
  projectYears,
} from "./project-filters";

function project(overrides: Partial<Project>): Project {
  return {
    slug: "p",
    title: "P",
    summary: "",
    services: [],
    market: "Municipal",
    location: "",
    year: 2024,
    owner: "",
    scope: [],
    challenge: "",
    result: "",
    images: [],
    ...overrides,
  };
}

const allowed = { services: ["underground-utilities", "demolition"], years: [2024, 2023] };

describe("parseProjectFilters", () => {
  it("accepts known values", () => {
    expect(
      parseProjectFilters({ service: "demolition", market: "Commercial", year: "2023" }, allowed),
    ).toEqual({ service: "demolition", market: "Commercial", year: 2023 });
  });

  it("drops unknown or malformed values", () => {
    expect(
      parseProjectFilters({ service: "nope", market: "Space", year: "20x4" }, allowed),
    ).toEqual({});
    expect(parseProjectFilters({ year: "1999" }, allowed)).toEqual({});
  });

  it("uses the first value when a param repeats", () => {
    expect(
      parseProjectFilters({ service: ["demolition", "underground-utilities"] }, allowed),
    ).toEqual({
      service: "demolition",
    });
  });
});

describe("filterProjects", () => {
  const projects = [
    project({ slug: "a", services: ["underground-utilities"], market: "Municipal", year: 2024 }),
    project({ slug: "b", services: ["demolition"], market: "Commercial", year: 2023 }),
    project({
      slug: "c",
      services: ["underground-utilities", "demolition"],
      market: "Commercial",
      year: 2024,
    }),
  ];
  const slugs = (list: Project[]) => list.map((p) => p.slug);

  it("returns everything with no filters", () => {
    expect(slugs(filterProjects(projects, {}))).toEqual(["a", "b", "c"]);
  });

  it("combines filters with AND", () => {
    expect(slugs(filterProjects(projects, { service: "demolition" }))).toEqual(["b", "c"]);
    expect(slugs(filterProjects(projects, { service: "demolition", year: 2024 }))).toEqual(["c"]);
    expect(slugs(filterProjects(projects, { market: "Municipal", service: "demolition" }))).toEqual(
      [],
    );
  });
});

describe("helpers", () => {
  it("detects active filters", () => {
    expect(hasActiveFilters({})).toBe(false);
    expect(hasActiveFilters({ year: 2024 })).toBe(true);
  });

  it("lists distinct years newest first, skipping projects without one", () => {
    expect(
      projectYears([
        project({ year: 2021 }),
        project({ year: 2024 }),
        project({ year: 2021 }),
        project({ year: undefined }),
      ]),
    ).toEqual([2024, 2021]);
  });
});
