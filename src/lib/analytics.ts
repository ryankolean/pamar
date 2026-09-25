/**
 * Google Analytics 4. Everything here is a no-op unless NEXT_PUBLIC_GA_ID is set.
 * Conversion events (mark these as key events in GA4):
 *   contact_submitted, application_submitted, subcontractor_registered,
 *   intent_to_bid_submitted, bid_submitted
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export type AnalyticsEvent =
  | "contact_submitted"
  | "application_submitted"
  | "subcontractor_registered"
  | "intent_to_bid_submitted"
  | "bid_submitted";

type Gtag = (command: "event", name: string, params?: Record<string, unknown>) => void;

export function trackEvent(name: AnalyticsEvent, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  gtag?.("event", name, params);
}
