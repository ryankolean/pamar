"use client";

import { ProjectGrid } from "@/components/projects/project-card";
import { FilterBar } from "@/components/ui/filter-bar";
import { useSearchParamsRecord } from "@/components/ui/use-search-params-record";
import { type Project, markets } from "@/content/projects";
import {
  filterProjects,
  hasActiveFilters,
  parseProjectFilters,
  projectYears,
} from "@/lib/project-filters";

type ProjectListingProps = {
  projects: Project[];
  services: { slug: string; name: string }[];
};

/** URL-filtered project grid (?service=, ?market=, ?year=). */
export function ProjectListing({ projects, services }: ProjectListingProps) {
  const searchParams = useSearchParamsRecord();
  const years = projectYears(projects);
  const filters = parseProjectFilters(searchParams, {
    services: services.map((s) => s.slug),
    years,
  });
  const results = filterProjects(projects, filters);

  return (
    <>
      <FilterBar
        action="/projects"
        resultCount={results.length}
        resultNoun={{ one: "project", other: "projects" }}
        showClear={hasActiveFilters(filters)}
        fields={[
          {
            name: "service",
            label: "Service",
            allLabel: "All services",
            value: filters.service,
            options: services.map((s) => ({ value: s.slug, label: s.name })),
          },
          {
            name: "market",
            label: "Market",
            allLabel: "All markets",
            value: filters.market,
            options: markets.map((m) => ({ value: m, label: m })),
          },
          {
            name: "year",
            label: "Year completed",
            allLabel: "Any year",
            value: filters.year?.toString(),
            options: years.map((y) => ({ value: String(y), label: String(y) })),
          },
        ]}
      />
      {results.length > 0 ? (
        <ProjectGrid projects={results} />
      ) : (
        <p className="border border-dashed border-ink-300 bg-white p-10 text-center text-ink-600">
          No projects match those filters. Try clearing one or more filters.
        </p>
      )}
    </>
  );
}
