import type { Metadata } from "next";
import { TrackEvent } from "@/components/analytics/track-event";
import { PreviewSubmissionNote } from "@/components/forms/fields";
import { ButtonLink } from "@/components/ui/button";
import { isPreviewMode } from "@/lib/site-mode";

export const metadata: Metadata = {
  title: "Registration received",
  robots: { index: false },
};

export default function RegistrationThanksPage() {
  return (
    <section className="container-page flex flex-col items-start gap-6 py-24">
      <TrackEvent name="subcontractor_registered" />
      <span aria-hidden="true" className="block h-1 w-16 bg-brand-500" />
      <h1 className="text-4xl font-bold uppercase sm:text-5xl">Registration received</h1>
      <p className="max-w-2xl text-lg text-ink-700">
        Thanks for registering! We’ve emailed you a confirmation. Our estimating team will review
        your information and reach out about packages that match your trades.
      </p>
      {isPreviewMode() && (
        <div className="max-w-2xl">
          <PreviewSubmissionNote />
        </div>
      )}
      <ButtonLink href="/subcontractors/opportunities" variant="dark">
        View open opportunities
      </ButtonLink>
    </section>
  );
}
