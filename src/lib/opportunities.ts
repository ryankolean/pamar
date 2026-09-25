import type { Opportunity } from "@/content/opportunities";
import type { Trade } from "@/content/trades";
import { trades } from "@/content/trades";
import { pickParam, type SearchParams } from "@/lib/search-params";
import { site } from "@/lib/site";

export const opportunityStatuses = ["Open", "Closed", "Awarded"] as const;
export type OpportunityStatus = (typeof opportunityStatuses)[number];

/** Status is derived, so a package closes on its own when the due date passes. */
export function opportunityStatus(
  opportunity: Opportunity,
  now: Date = new Date(),
): OpportunityStatus {
  if (opportunity.awarded) return "Awarded";
  return now.getTime() < Date.parse(opportunity.bidDueAt) ? "Open" : "Closed";
}

export function isAcceptingSubmissions(opportunity: Opportunity, now: Date = new Date()): boolean {
  return opportunityStatus(opportunity, now) === "Open";
}

const DAY = 24 * 60 * 60 * 1000;

/** Short relative label for an open package, e.g. "Due in 5 days". */
export function dueLabel(opportunity: Opportunity, now: Date = new Date()): string | null {
  if (opportunityStatus(opportunity, now) !== "Open") return null;
  const ms = Date.parse(opportunity.bidDueAt) - now.getTime();
  if (ms < DAY) return "Due within 24 hours";
  const days = Math.floor(ms / DAY);
  return `Due in ${days} day${days === 1 ? "" : "s"}`;
}

/** Open packages first (soonest due), then closed/awarded (most recent first). */
export function sortOpportunities(list: Opportunity[], now: Date = new Date()): Opportunity[] {
  return [...list].sort((a, b) => {
    const aOpen = opportunityStatus(a, now) === "Open";
    const bOpen = opportunityStatus(b, now) === "Open";
    if (aOpen !== bOpen) return aOpen ? -1 : 1;
    const diff = Date.parse(a.bidDueAt) - Date.parse(b.bidDueAt);
    return aOpen ? diff : -diff;
  });
}

export type OpportunityFilters = { trade?: Trade; status?: OpportunityStatus };

export function parseOpportunityFilters(params: SearchParams): OpportunityFilters {
  const filters: OpportunityFilters = {};
  const trade = pickParam(params, "trade", trades);
  if (trade) filters.trade = trade;
  const status = pickParam(params, "status", opportunityStatuses);
  if (status) filters.status = status;
  return filters;
}

export function filterOpportunities(
  list: Opportunity[],
  filters: OpportunityFilters,
  now: Date = new Date(),
): Opportunity[] {
  return list.filter(
    (o) =>
      (!filters.trade || o.trades.includes(filters.trade)) &&
      (!filters.status || opportunityStatus(o, now) === filters.status),
  );
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: site.timeZone,
  timeZoneName: "short",
});

/** Format an ISO timestamp in the company's time zone, e.g. "Fri, Oct 16, 2026, 2:00 PM EDT". */
export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}
