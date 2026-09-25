import { markets, type Market, type Project } from "@/content/projects";

export type ProjectFilters = {
  service?: string;
  market?: Market;
  year?: number;
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Read filters from URL search params. Unknown or malformed values are dropped,
 * so a stale or hand-edited URL never produces an error page.
 */
export function parseProjectFilters(
  params: SearchParams,
  allowed: { services: string[]; years: number[] },
): ProjectFilters {
  const filters: ProjectFilters = {};

  const service = first(params.service);
  if (service && allowed.services.includes(service)) filters.service = service;

  const market = first(params.market);
  if (market && (markets as readonly string[]).includes(market)) filters.market = market as Market;

  const year = Number(first(params.year));
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
