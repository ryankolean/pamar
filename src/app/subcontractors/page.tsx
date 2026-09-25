import type { Metadata } from "next";
import { connection } from "next/server";
import { OpportunityList } from "@/components/subcontractors/opportunity-list";
import { ButtonLink } from "@/components/ui/button";
import { FaqList } from "@/components/ui/faq-list";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { subcontractorFaqs } from "@/content/faqs";
import { getOpportunities } from "@/content/opportunities";
import { opportunityStatus, sortOpportunities } from "@/lib/opportunities";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Subcontractors",
  description: `Subcontracting and supplier opportunities on ${site.name} projects. Register and bid on open packages.`,
};

const steps = [
  {
    title: "Register your company",
    body: "Tell us about your trades, service area, certifications, and insurance so we can match you with opportunities.",
  },
  {
    title: "Review open packages",
    body: "Browse subcontract and supply packages on contracts we’ve won, with scopes, key dates, and documents.",
  },
  {
    title: "Submit your interest or bid",
    body: "Let us know you intend to bid, or send your bid before the due date. Our estimating team will follow up.",
  },
];

export default async function SubcontractorsPage() {
  await connection(); // Open/closed status depends on the current time.
  const now = new Date();
  const open = sortOpportunities(
    (await getOpportunities()).filter((o) => opportunityStatus(o, now) === "Open"),
    now,
  ).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow="Subcontractors & suppliers"
        title="Build with Pamar"
        intro="We rely on qualified subcontractors and suppliers to deliver our projects. See what we’re bidding and join our bidder list."
      >
        <ButtonLink href="/subcontractors/opportunities">View open opportunities</ButtonLink>
        <ButtonLink href="/subcontractors/register" variant="outline-light">
          Register your company
        </ButtonLink>
      </PageHero>

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="How it works" title="Three steps to bid" />
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="border-t-4 border-brand-500 bg-ink-50 p-8">
                <span className="font-display text-4xl font-bold text-brand-700">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-xl font-bold uppercase">{step.title}</h3>
                <p className="mt-2 text-ink-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-ink-50 py-16 sm:py-20" aria-labelledby="open-heading">
        <div className="container-page">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading id="open-heading" eyebrow="Now bidding" title="Open opportunities" />
            <ButtonLink
              href="/subcontractors/opportunities"
              variant="outline"
              className="self-start sm:self-auto"
            >
              All opportunities
            </ButtonLink>
          </div>
          {open.length > 0 ? (
            <OpportunityList opportunities={open} now={now} />
          ) : (
            <p className="border border-dashed border-ink-300 bg-white p-10 text-center text-ink-600">
              There are no open packages right now. Register to hear about new opportunities first.
            </p>
          )}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-page grid gap-12 md:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Requirements" title="What we look for" />
            <ul className="mt-8 space-y-3 text-ink-700">
              {[
                "Current certificate of insurance meeting project requirements",
                "Bonding capacity appropriate to the package (when required)",
                "A strong safety record and written safety program",
                "Experience with similar scope and owners",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 bg-brand-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-ink-950 p-8 text-white">
            <h2 className="text-2xl font-bold uppercase text-white">DBE / MBE / WBE firms</h2>
            <p className="mt-4 text-ink-200">
              We actively seek certified disadvantaged, minority-, women-, and veteran-owned
              businesses on our public projects. Include your certifications when you register so we
              can reach out when a package fits.
            </p>
            <ButtonLink href="/subcontractors/register" className="mt-6">
              Register your company
            </ButtonLink>
          </div>
        </div>
      </section>
      <section className="bg-ink-50 py-16 sm:py-20">
        <div className="container-page">
          <FaqList faqs={subcontractorFaqs} title="Subcontractor questions" />
        </div>
      </section>
    </>
  );
}
