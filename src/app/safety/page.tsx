import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { ProjectPhoto } from "@/components/projects/project-photo";
import { SectionHeading } from "@/components/ui/section-heading";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Safety",
  description: `How ${site.name} keeps every crew member, partner, and member of the public safe.`,
};

// PLACEHOLDER program list and stats until confirmed by the client (SUMMIT-228).
const programs = [
  {
    title: "Daily toolbox talks",
    body: "Every shift starts with a crew briefing on the day’s hazards and controls.",
  },
  {
    title: "Excavation & trench safety",
    body: "Competent-person oversight, protective systems, and daily inspections on every excavation.",
  },
  {
    title: "Training & certification",
    body: "Ongoing OSHA training, equipment certification, and first aid/CPR for field staff.",
  },
  {
    title: "Stop-work authority",
    body: "Anyone on a Pamar site can stop work if something looks unsafe. No questions asked.",
  },
  {
    title: "Incident reporting & review",
    body: "Near misses are reported and reviewed so lessons reach every crew.",
  },
  {
    title: "Public protection",
    body: "Traffic control, site security, and clear communication with the communities we work in.",
  },
];

export default function SafetyPage() {
  return (
    <>
      <PageHero
        eyebrow="Safety"
        title="Everyone goes home safe"
        intro="Safety isn’t a program we run. It’s how we plan, build, and measure every project."
      />

      <section className="py-16 sm:py-20">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <ProjectPhoto
            image={{
              src: "/images/site/crew-at-trench.jpg",
              alt: "Pamar crew in hard hats and safety shirts at an open trench",
            }}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-[4/3] w-full"
          />
          <div className="space-y-5 text-lg text-ink-700">
            <SectionHeading eyebrow="Our commitment" title="Safety first, every shift" />
            <p>
              Summarize Pamar’s safety philosophy here: leadership involvement, accountability, and
              how safety performance is tracked and shared with crews.
            </p>
            <p>
              This is also the place for safety awards, association memberships, and headline
              statistics (e.g. EMR or hours worked without a lost-time incident) once confirmed.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ink-950 py-16 text-white sm:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Programs" title="How we keep crews safe" inverse />
          <ul className="mt-12 grid gap-px bg-ink-800 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <li key={program.title} className="bg-ink-950 p-8">
                <span aria-hidden="true" className="mb-4 block h-1 w-10 bg-brand-500" />
                <h3 className="text-xl font-bold uppercase text-white">{program.title}</h3>
                <p className="mt-2 text-ink-300">{program.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-14">
        <div className="container-page flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <p className="font-display text-3xl font-bold uppercase text-ink-950">
            Questions about our safety program?
          </p>
          <ButtonLink href="/contact" variant="dark">
            Contact us
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
