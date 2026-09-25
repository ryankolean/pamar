import type { Metadata } from "next";
import Link from "next/link";
import { RegistrationForm } from "@/components/subcontractors/registration-form";
import { PageHero } from "@/components/ui/page-hero";
import { trades } from "@/content/trades";
import { acceptAttribute, uploadLimits } from "@/lib/forms/files";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Subcontractor Registration",
  description: `Register your company to bid on ${site.name} projects.`,
};

export default function RegisterPage() {
  return (
    <>
      <PageHero
        eyebrow="Subcontractors"
        title="Register your company"
        intro="Join our bidder list. We’ll use your trades and service area to invite you to packages that fit."
      />
      <section className="py-12 sm:py-16">
        <div className="container-page grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div className="max-w-3xl">
            <RegistrationForm
              trades={trades}
              documents={{
                accept: acceptAttribute(uploadLimits.companyDocument.kinds),
                maxMb: uploadLimits.companyDocument.maxBytes / 1024 / 1024,
              }}
            />
          </div>
          <aside className="h-fit space-y-4 border-l-4 border-brand-500 bg-ink-50 p-8 lg:sticky lg:top-28">
            <h2 className="text-lg font-bold uppercase">Why register?</h2>
            <ul className="list-disc space-y-2 pl-5 text-ink-700">
              <li>Get invited to bid on packages that match your trades.</li>
              <li>Help us meet DBE / MBE / WBE participation goals on public work.</li>
              <li>Speed up prequalification when you’re selected.</li>
            </ul>
            <p className="pt-2 text-sm text-ink-600">
              Looking for current packages?{" "}
              <Link href="/subcontractors/opportunities" className="font-semibold underline">
                View open opportunities
              </Link>
              .
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
