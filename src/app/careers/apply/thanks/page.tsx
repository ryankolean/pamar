import type { Metadata } from "next";
import { TrackEvent } from "@/components/analytics/track-event";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Application received",
  robots: { index: false },
};

export default function ApplicationThanksPage() {
  return (
    <section className="container-page flex flex-col items-start gap-6 py-24">
      <TrackEvent name="application_submitted" />
      <span aria-hidden="true" className="block h-1 w-16 bg-brand-500" />
      <h1 className="text-4xl font-bold uppercase sm:text-5xl">Application received</h1>
      <p className="max-w-2xl text-lg text-ink-700">
        Thanks for applying! We’ve sent a confirmation to your email. Our HR team reviews every
        application and will reach out if there’s a fit.
      </p>
      <div className="flex flex-wrap gap-4">
        <ButtonLink href="/careers#openings" variant="dark">
          See other openings
        </ButtonLink>
        <ButtonLink href="/projects" variant="outline">
          Explore our work
        </ButtonLink>
      </div>
    </section>
  );
}
