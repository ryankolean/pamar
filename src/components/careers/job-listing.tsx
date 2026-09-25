"use client";

import { JobList } from "@/components/careers/job-list";
import { FilterBar } from "@/components/ui/filter-bar";
import { useSearchParamsRecord } from "@/components/ui/use-search-params-record";
import { type Job, departments, employmentTypes } from "@/content/jobs";
import { filterJobs, hasActiveJobFilters, jobLocations, parseJobFilters } from "@/lib/job-filters";

/** URL-filtered job list (?department=, ?location=, ?type=). */
export function JobListing({ jobs }: { jobs: Job[] }) {
  const searchParams = useSearchParamsRecord();
  const locations = jobLocations(jobs);
  const filters = parseJobFilters(searchParams, locations);
  const results = filterJobs(jobs, filters);

  return (
    <>
      <FilterBar
        action="/careers"
        resultCount={results.length}
        resultNoun={{ one: "opening", other: "openings" }}
        showClear={hasActiveJobFilters(filters)}
        fields={[
          {
            name: "department",
            label: "Department",
            allLabel: "All departments",
            value: filters.department,
            options: departments.map((d) => ({ value: d, label: d })),
          },
          {
            name: "location",
            label: "Location",
            allLabel: "All locations",
            value: filters.location,
            options: locations.map((l) => ({ value: l, label: l })),
          },
          {
            name: "type",
            label: "Type",
            allLabel: "All types",
            value: filters.type,
            options: employmentTypes.map((t) => ({ value: t, label: t })),
          },
        ]}
      />
      {results.length > 0 ? (
        <JobList jobs={results} />
      ) : (
        <p className="border border-dashed border-ink-300 bg-white p-10 text-center text-ink-600">
          No openings match those filters right now. Try clearing a filter, or send us a general
          application below.
        </p>
      )}
    </>
  );
}
