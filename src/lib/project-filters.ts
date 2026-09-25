import { markets, type Market, type Project } from "@/content/projects";
import { firstParam, pickParam, type SearchParams } from "@/lib/search-params";

export type ProjectFilters = {
  service?: string;
  market?: Market;
  year?: number;
};

/**
 * Read filters from URL search params. Unknown or malformed values are dropped,
 * so a stale or hand-edited URL never produces an error page.
 */
export function parseProjectFilters(
  params: SearchParams,
  allowed: { services: string[]; years: number[] },
): ProjectFilters {
  const filters: ProjectFilters = {};

  const service = pickParam(params, "service", allowed.services);
  if (service) filters.service = service;

  const market = pickParam(params, "market", markets);
  if (market) filters.market = market;

  const year = Number(firstParam(params.year));
  if (Number.isInteger(year) && allowed.years.includes(year)) filters.year = year;

  return filters;
}

export function filterProjects(projects: Project[], filters: ProjectFilters): Project[] {
  return projects.filter(
    (project) =>
      (!filters.service || project.services.includes(filters.service)) &&
      (!filters.market || project.market === filters.market) &&
      (!filters.year || project.year === filters.year),
  );
}

export function hasActiveFilters(filters: ProjectFilters): boolean {
  return Boolean(filters.service || filters.market || filters.year);
}

/** Distinct completion years, newest first. */
export function projectYears(projects: Project[]): number[] {
  return [...new Set(projects.map((p) => p.year))].sort((a, b) => b - a);
}
