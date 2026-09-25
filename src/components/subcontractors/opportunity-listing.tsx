"use client";

import { useSyncExternalStore } from "react";
import { OpportunityList } from "@/components/subcontractors/opportunity-list";
import { FilterBar } from "@/components/ui/filter-bar";
import { useSearchParamsRecord } from "@/components/ui/use-search-params-record";
import type { Opportunity } from "@/content/opportunities";
import { trades } from "@/content/trades";
import {
  filterOpportunities,
  opportunityStatuses,
  parseOpportunityFilters,
  sortOpportunities,
} from "@/lib/opportunities";

type OpportunityListingProps = {
  opportunities: Opportunity[];
  /** Reference time for open/closed status as rendered on the server (build time when static). */
  now: Date;
};

const loadedAt = new Date();
const subscribeNever = () => () => {};

/** URL-filtered bid package list (?trade=, ?status=). */
export function OpportunityListing({ opportunities, now: initialNow }: OpportunityListingProps) {
  const searchParams = useSearchParamsRecord();
  // Hydrate with the server's clock, then switch to the visitor's so status stays current.
  const now = useSyncExternalStore(
    subscribeNever,
    () => loadedAt,
    () => initialNow,
  );
  const filters = parseOpportunityFilters(searchParams);
  const results = sortOpportunities(filterOpportunities(opportunities, filters, now), now);

  return (
    <>
      <FilterBar
        action="/subcontractors/opportunities"
        resultCount={results.length}
        resultNoun={{ one: "package", other: "packages" }}
        showClear={Boolean(filters.trade || filters.status)}
        fields={[
          {
            name: "trade",
            label: "Trade",
            allLabel: "All trades",
            value: filters.trade,
            options: trades.map((t) => ({ value: t, label: t })),
          },
          {
            name: "status",
            label: "Status",
            allLabel: "Any status",
            value: filters.status,
            options: opportunityStatuses.map((s) => ({ value: s, label: s })),
          },
        ]}
      />
      {results.length > 0 ? (
        <OpportunityList opportunities={results} now={now} />
      ) : (
        <p className="border border-dashed border-ink-300 bg-white p-10 text-center text-ink-600">
          No packages match those filters. Register your company to hear about new opportunities.
        </p>
      )}
    </>
  );
}
