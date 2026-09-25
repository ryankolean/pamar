import type { Metadata } from "next";
import { OpportunityList } from "@/components/subcontractors/opportunity-list";
import { ButtonLink } from "@/components/ui/button";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHero } from "@/components/ui/page-hero";
import { getOpportunities } from "@/content/opportunities";
import { trades } from "@/content/trades";
import {
  filterOpportunities,
  opportunityStatuses,
  parseOpportunityFilters,
  sortOpportunities,
} from "@/lib/opportunities";

export const metadata: Metadata = {
  title: "Bid Opportunities",
  description:
    "Open subcontract and supply packages on projects Pamar Enterprises has been awarded.",
};

export default async function OpportunitiesPage(props: PageProps<"/subcontractors/opportunities">) {
  const [all, searchParams] = await Promise.all([getOpportunities(), props.searchParams]);
  const now = new Date();
  const filters = parseOpportunityFilters(searchParams);
  const results = sortOpportunities(filterOpportunities(all, filters, now), now);

  return (
    <>
      <PageHero
        eyebrow="Subcontractors"
        title="Bid opportunities"
        intro="Subcontract and supply packages on projects we’ve been awarded. Open packages are listed first, soonest due date on top."
      >
        <ButtonLink href="/subcontractors/register">Register your company</ButtonLink>
      </PageHero>
      <section className="bg-ink-50 py-12 sm:py-16">
        <div className="container-page space-y-8">
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
              No packages match those filters. Register your company to hear about new
              opportunities.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
