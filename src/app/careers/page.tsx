import type { Metadata } from "next";
import { Suspense } from "react";
import { JobListing } from "@/components/careers/job-listing";
import { ButtonLink } from "@/components/ui/button";
import { FaqList } from "@/components/ui/faq-list";
import { PageHero } from "@/components/ui/page-hero";
import { ProjectPhoto } from "@/components/projects/project-photo";
import { SectionHeading } from "@/components/ui/section-heading";
import { careersFaqs } from "@/content/faqs";
import { getJobs } from "@/content/jobs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Careers",
  description: `Join the ${site.name} team. See open positions for operators, laborers, foremen, project managers, and more.`,
  // Filtered views (?service=…) share one canonical URL.
  alternates: { canonical: "/careers" },
};

// PLACEHOLDER benefits until confirmed by HR (SUMMIT-228).
const benefits = [
  {
    title: "Competitive pay",
    body: "Wages that reflect your skills and experience, with overtime opportunities.",
  },
  {
    title: "Health coverage",
    body: "Medical, dental, and vision coverage for you and your family.",
  },
  { title: "Retirement", body: "A retirement plan to help you build for the future." },
  { title: "Paid time off", body: "Holidays and paid time off to recharge." },
  {
    title: "Training & growth",
    body: "Safety training, certifications, and a path to lead your own crew.",
  },
  {
    title: "Modern equipment",
    body: "Well-maintained equipment that helps you do your best work.",
  },
];

export default async function CareersPage() {
  const jobs = await getJobs();

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Build your career with us"
        intro="We’re always looking for hard-working, safety-minded people who take pride in building things that last."
      >
        <ButtonLink href="#openings">View open positions</ButtonLink>
        <ButtonLink href="/careers/apply" variant="outline-light">
          Apply now
        </ButtonLink>
      </PageHero>

      <section className="py-16 sm:py-20">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-5 text-lg text-ink-700">
            <SectionHeading eyebrow="Life at Pamar" title="A crew that has your back" />
            <p>
              Describe the culture here: long-tenured crews, promoting from within, family-owned
              values, and the kinds of projects new hires get to work on.
            </p>
            <p>
              Whether you’re just starting out or bringing years of experience, you’ll find
              training, good equipment, and people who want to see you succeed.
            </p>
          </div>
          <ProjectPhoto
            image={{ src: "/images/site/crew-on-site.jpg", alt: "Pamar crews on a job site" }}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-[4/3] w-full"
          />
        </div>
      </section>

      <section className="bg-ink-950 py-16 sm:py-20" aria-labelledby="benefits-heading">
        <div className="container-page">
          <SectionHeading id="benefits-heading" eyebrow="Why Pamar" title="Benefits" inverse />
          <ul className="mt-12 grid gap-px bg-ink-800 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <li key={benefit.title} className="bg-ink-950 p-8">
                <span aria-hidden="true" className="mb-4 block h-1 w-10 bg-brand-500" />
                <h3 className="text-xl font-bold uppercase text-white">{benefit.title}</h3>
                <p className="mt-2 text-ink-300">{benefit.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="openings"
        className="scroll-mt-24 bg-ink-50 py-16 sm:py-20"
        aria-labelledby="openings-heading"
      >
        <div className="container-page space-y-8">
          <SectionHeading id="openings-heading" eyebrow="Now hiring" title="Open positions" />
          <Suspense fallback={null}>
            <JobListing jobs={jobs} />
          </Suspense>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <FaqList faqs={careersFaqs} title="Applying at Pamar" />
        </div>
      </section>

      <section className="bg-brand-500 py-14">
        <div className="container-page flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-3xl font-bold uppercase text-ink-950">
              Don’t see your role?
            </p>
            <p className="mt-2 text-ink-900">
              Send a general application and we’ll reach out when a position opens up that fits.
            </p>
          </div>
          <ButtonLink href="/careers/apply" variant="dark">
            General application
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
