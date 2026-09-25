import Link from "next/link";
import type { Opportunity } from "@/content/opportunities";
import { dueLabel, formatDateTime, opportunityStatus } from "@/lib/opportunities";
import { revealDelay } from "@/lib/motion";
import { StatusBadge } from "./status-badge";

export function OpportunityList({
  opportunities,
  now,
}: {
  opportunities: Opportunity[];
  now: Date;
}) {
  return (
    <ul className="space-y-4">
      {opportunities.map((opportunity, index) => {
        const status = opportunityStatus(opportunity, now);
        const due = dueLabel(opportunity, now);
        return (
          <li
            key={opportunity.slug}
            data-reveal
            style={revealDelay(index)}
            className="group relative border border-ink-100 bg-white p-6 transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={status} />
                  {due && <span className="text-sm font-semibold text-brand-800">{due}</span>}
                </div>
                <h3 className="text-xl font-bold uppercase">
                  <Link
                    href={`/subcontractors/opportunities/${opportunity.slug}`}
                    className="after:absolute after:inset-0"
                  >
                    {opportunity.projectName}
                  </Link>
                </h3>
                <p className="text-ink-600">{opportunity.summary}</p>
                <ul className="flex flex-wrap gap-2 pt-1" aria-label="Trades">
                  {opportunity.trades.map((trade) => (
                    <li
                      key={trade}
                      className="border border-ink-200 px-2.5 py-0.5 text-xs font-medium text-ink-700"
                    >
                      {trade}
                    </li>
                  ))}
                </ul>
              </div>
              <dl className="shrink-0 text-sm md:text-right">
                <dt className="font-display text-xs uppercase tracking-widest text-ink-500">
                  Bids due
                </dt>
                <dd className="mt-1 font-semibold text-ink-900">
                  <time dateTime={opportunity.bidDueAt}>
                    {formatDateTime(opportunity.bidDueAt)}
                  </time>
                </dd>
                <dt className="mt-3 font-display text-xs uppercase tracking-widest text-ink-500">
                  Owner
                </dt>
                <dd className="mt-1 text-ink-700">{opportunity.owner}</dd>
              </dl>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
