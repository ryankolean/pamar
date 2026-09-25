import type { Metadata } from "next";
import { ProjectGrid } from "@/components/projects/project-card";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHero } from "@/components/ui/page-hero";
import { markets, getProjects } from "@/content/projects";
import { getServices } from "@/content/services";
import {
  filterProjects,
  hasActiveFilters,
  parseProjectFilters,
  projectYears,
} from "@/lib/project-filters";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Completed projects by Pamar Enterprises across municipal, commercial, and industrial work.",
};

export default async function ProjectsPage(props: PageProps<"/projects">) {
  const [projects, services, searchParams] = await Promise.all([
    getProjects(),
    getServices(),
    props.searchParams,
  ]);
  const years = projectYears(projects);
  const filters = parseProjectFilters(searchParams, {
    services: services.map((s) => s.slug),
    years,
  });
  const results = filterProjects(projects, filters);

  return (
    <>
      <PageHero
        eyebrow="Our Work"
        title="Projects"
        intro="A look at the infrastructure we’ve built for public and private owners."
      />
      <section className="bg-ink-50 py-12 sm:py-16">
        <div className="container-page space-y-10">
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
        </div>
      </section>
    </>
  );
}
