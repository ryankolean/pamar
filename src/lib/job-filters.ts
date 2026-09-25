import {
  departments,
  employmentTypes,
  type Department,
  type EmploymentType,
  type Job,
} from "@/content/jobs";
import { pickParam, type SearchParams } from "@/lib/search-params";

export type JobFilters = {
  department?: Department;
  location?: string;
  type?: EmploymentType;
};

export function jobLocations(jobs: Job[]): string[] {
  return [...new Set(jobs.map((job) => job.location))].sort();
}

export function parseJobFilters(params: SearchParams, locations: string[]): JobFilters {
  const filters: JobFilters = {};
  const department = pickParam(params, "department", departments);
  if (department) filters.department = department;
  const location = pickParam(params, "location", locations);
  if (location) filters.location = location;
  const type = pickParam(params, "type", employmentTypes);
  if (type) filters.type = type;
  return filters;
}

export function filterJobs(jobs: Job[], filters: JobFilters): Job[] {
  return jobs.filter(
    (job) =>
      (!filters.department || job.department === filters.department) &&
      (!filters.location || job.location === filters.location) &&
      (!filters.type || job.employmentType === filters.type),
  );
}

export function hasActiveJobFilters(filters: JobFilters): boolean {
  return Boolean(filters.department || filters.location || filters.type);
}
