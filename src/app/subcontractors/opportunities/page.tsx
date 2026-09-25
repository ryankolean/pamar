import type { Metadata } from "next";
import { Suspense } from "react";
import { OpportunityListing } from "@/components/subcontractors/opportunity-listing";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { getOpportunities } from "@/content/opportunities";

export const metadata: Metadata = {
  title: "Bid Opportunities",
  description:
    "Open subcontract and supply packages on projects Pamar Enterprises has been awarded.",
  // Filtered views (?service=…) share one canonical URL.
  alternates: { canonical: "/subcontractors/opportunities" },
};

export default async function OpportunitiesPage() {
  const opportunities = await getOpportunities();
  const now = new Date();

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
          <Suspense fallback={null}>
            <OpportunityListing opportunities={opportunities} now={now} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
