import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { JsonLd } from "@/components/seo/json-ld";
import { BidForm } from "@/components/subcontractors/bid-form";
import { StatusBadge } from "@/components/subcontractors/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { getOpportunities, getOpportunityBySlug } from "@/content/opportunities";
import { acceptAttribute, uploadLimits } from "@/lib/forms/files";
import { dueLabel, formatDateTime, opportunityStatus } from "@/lib/opportunities";
import { breadcrumbJsonLd } from "@/lib/seo";
import { isPreviewMode } from "@/lib/site-mode";
import { telHref } from "@/lib/site";

export async function generateStaticParams() {
  return (await getOpportunities()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/subcontractors/opportunities/[slug]">,
): Promise<Metadata> {
  const opportunity = await getOpportunityBySlug((await props.params).slug);
  if (!opportunity) return {};
  return {
    title: `${opportunity.projectName} – Bid Opportunity`,
    description: opportunity.summary,
  };
}

export default async function OpportunityPage(
  props: PageProps<"/subcontractors/opportunities/[slug]">,
) {
  const opportunity = await getOpportunityBySlug((await props.params).slug);
  if (!opportunity) notFound();

  // Status depends on the current time, so render per request. The static preview build
  // (STATIC_EXPORT=1, see next.config.ts) has no server and uses the build time instead.
  if (process.env.STATIC_EXPORT !== "1") await connection();
  const now = new Date();
  const status = opportunityStatus(opportunity, now);
  const due = dueLabel(opportunity, now);
  const mailSubject = encodeURIComponent(`Bid inquiry: ${opportunity.projectName}`);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Subcontractors", path: "/subcontractors" },
          { name: "Opportunities", path: "/subcontractors/opportunities" },
          {
            name: opportunity.projectName,
            path: `/subcontractors/opportunities/${opportunity.slug}`,
          },
        ])}
      />
      <section className="bg-hatch bg-ink-950 text-white">
        <div className="container-page py-16 sm:py-20">
          <Link
            href="/subcontractors/opportunities"
            className="font-display text-sm font-semibold uppercase tracking-widest text-ink-300 hover:text-white"
          >
            ← All opportunities
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StatusBadge status={status} />
            {due && <span className="text-sm font-semibold text-brand-400">{due}</span>}
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold uppercase text-white sm:text-5xl">
            {opportunity.projectName}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-200">{opportunity.summary}</p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-12">
            <div className="space-y-4 text-lg text-ink-700">
              <h2 className="text-2xl font-bold uppercase text-ink-950">Scope</h2>
              {opportunity.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div>
              <h2 className="text-2xl font-bold uppercase">Trades requested</h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {opportunity.trades.map((trade) => (
                  <li
                    key={trade}
                    className="border border-ink-200 bg-ink-50 px-3 py-1.5 font-medium text-ink-800"
                  >
                    {trade}
                  </li>
                ))}
              </ul>
              {opportunity.participationGoal && (
                <p className="mt-5 border-l-4 border-brand-500 bg-brand-50 p-4 font-semibold text-ink-900">
                  {opportunity.participationGoal}
                </p>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold uppercase">Bid documents</h2>
              {opportunity.documents.length > 0 ? (
                <ul className="mt-5 divide-y divide-ink-100 border border-ink-100">
                  {opportunity.documents.map((doc) => (
                    <li key={doc.name} className="flex items-center justify-between gap-4 p-4">
                      <span className="font-medium text-ink-900">{doc.name}</span>
                      {doc.url ? (
                        <a href={doc.url} className="text-sm font-semibold text-ink-900 underline">
                          Download
                        </a>
                      ) : (
                        <span className="text-sm text-ink-500">Available on request</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-ink-600">No documents posted for this package.</p>
              )}
            </div>

            <div id="submit" className="scroll-mt-28 border-t-4 border-brand-500 bg-ink-50 p-8">
              {status === "Open" ? (
                <>
                  <h2 className="text-2xl font-bold uppercase">Submit your interest or bid</h2>
                  <p className="mb-8 mt-3 text-ink-700">
                    Let us know you intend to bid, or send your price and bid document before{" "}
                    {formatDateTime(opportunity.bidDueAt)}. Need documents or have questions? Email{" "}
                    <a
                      href={`mailto:${opportunity.contact.email}?subject=${mailSubject}`}
                      className="font-semibold underline"
                    >
                      {opportunity.contact.email}
                    </a>
                    .
                  </p>
                  <BidForm
                    preview={isPreviewMode()}
                    opportunitySlug={opportunity.slug}
                    trades={opportunity.trades}
                    document={{
                      accept: acceptAttribute(uploadLimits.bidDocument.kinds),
                      maxMb: uploadLimits.bidDocument.maxBytes / 1024 / 1024,
                    }}
                  />
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold uppercase">
                    This package is {status.toLowerCase()}
                  </h2>
                  <p className="mt-3 text-ink-700">
                    We’re no longer accepting submissions for this package. Register your company to
                    hear about new opportunities.
                  </p>
                  <ButtonLink href="/subcontractors/register" variant="dark" className="mt-6">
                    Register your company
                  </ButtonLink>
                </>
              )}
            </div>
          </div>

          <aside className="h-fit space-y-6 bg-ink-950 p-8 text-white lg:sticky lg:top-28">
            <h2 className="text-lg font-bold uppercase text-white">Key details</h2>
            <dl className="space-y-4">
              <div className="border-b border-ink-800 pb-4">
                <dt className="font-display text-xs uppercase tracking-widest text-ink-400">
                  Bids due
                </dt>
                <dd className="mt-1 text-lg">
                  <time dateTime={opportunity.bidDueAt}>
                    {formatDateTime(opportunity.bidDueAt)}
                  </time>
                </dd>
              </div>
              {opportunity.preBid && (
                <div className="border-b border-ink-800 pb-4">
                  <dt className="font-display text-xs uppercase tracking-widest text-ink-400">
                    Pre-bid meeting{opportunity.preBid.mandatory ? " (mandatory)" : ""}
                  </dt>
                  <dd className="mt-1 text-lg">
                    <time dateTime={opportunity.preBid.at}>
                      {formatDateTime(opportunity.preBid.at)}
                    </time>
                    <span className="block text-base text-ink-300">
                      {opportunity.preBid.location}
                    </span>
                  </dd>
                </div>
              )}
              <div className="border-b border-ink-800 pb-4">
                <dt className="font-display text-xs uppercase tracking-widest text-ink-400">
                  Owner
                </dt>
                <dd className="mt-1 text-lg">{opportunity.owner}</dd>
              </div>
              <div className="border-b border-ink-800 pb-4">
                <dt className="font-display text-xs uppercase tracking-widest text-ink-400">
                  Location
                </dt>
                <dd className="mt-1 text-lg">{opportunity.location}</dd>
              </div>
              <div>
                <dt className="font-display text-xs uppercase tracking-widest text-ink-400">
                  Contact
                </dt>
                <dd className="mt-1 space-y-1">
                  <span className="block text-lg">{opportunity.contact.name}</span>
                  <a
                    href={`mailto:${opportunity.contact.email}`}
                    className="block text-brand-400 hover:underline"
                  >
                    {opportunity.contact.email}
                  </a>
                  {opportunity.contact.phone && (
                    <a
                      href={telHref(opportunity.contact.phone)}
                      className="block text-brand-400 hover:underline"
                    >
                      {opportunity.contact.phone}
                    </a>
                  )}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </>
  );
}
