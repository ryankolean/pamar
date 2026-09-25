import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { ProjectPhoto } from "@/components/projects/project-photo";
import { CountUp } from "@/components/ui/count-up";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { SectionHeading } from "@/components/ui/section-heading";
import { revealDelay } from "@/lib/motion";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `The history, values, and leadership of ${site.name}.`,
};

// PLACEHOLDER copy and leadership until provided by the client (SUMMIT-228).
const values = [
  {
    title: "Safety",
    body: "Nothing we build is worth an injury. Safety comes first on every site, every day.",
  },
  {
    title: "Integrity",
    body: "We do what we say, stand behind our work, and treat partners fairly.",
  },
  { title: "Craftsmanship", body: "We take pride in work that is built right and built to last." },
  { title: "Teamwork", body: "Owners, engineers, crews, and subcontractors succeed together." },
];

// From the live site: "active since 1976", "over 120 employees", "soon be celebrating 50 years".
const stats = [
  { label: "Heavy civil work since", value: 1976, count: false },
  { label: "Team members", value: 120, suffix: "+", count: true },
  { label: "Years in business in 2026", value: 50, count: true },
];

const leadership = [
  { name: "Leader name", role: "President" },
  { name: "Leader name", role: "Vice President, Operations" },
  { name: "Leader name", role: "Chief Estimator" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About us" title={`About ${site.name}`} intro={site.description} />

      <section className="py-16 sm:py-20">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-5 text-lg text-ink-700">
            <SectionHeading eyebrow="Our story" title="Built on hard work" />
            <p>
              Company history goes here: when and where Pamar was founded, how it grew, and the
              kinds of work it’s known for today.
            </p>
            <p>
              A second paragraph can cover the markets and region served, the size of the team, and
              what makes Pamar different to work with.
            </p>
          </div>
          <ProjectPhoto
            image={{
              src: "/images/site/crew-setting-pipe.jpg",
              alt: "Pamar crew setting pipe in an open trench",
            }}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-[4/3] w-full"
          />
        </div>
      </section>

      <section className="bg-teal-700 py-12 text-white" aria-label="Pamar by the numbers">
        <dl className="container-page grid gap-8 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <div key={stat.label} data-reveal style={revealDelay(index, 100)}>
              <dt className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-teal-100">
                {stat.label}
              </dt>
              <dd className="mt-2 font-display text-5xl font-bold text-white">
                {stat.count ? (
                  <CountUp value={stat.value} suffix={stat.suffix} />
                ) : (
                  <span>{stat.value}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-ink-50 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="What we stand for" title="Our values" />
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <li
                key={value.title}
                data-reveal
                style={revealDelay(index)}
                className="border-t-4 border-brand-500 bg-white p-6"
              >
                <h3 className="text-xl font-bold uppercase">{value.title}</h3>
                <p className="mt-2 text-ink-600">{value.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Leadership" title="Our team" />
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {leadership.map((person, index) => (
              <li key={person.role} data-reveal style={revealDelay(index)}>
                <PlaceholderImage
                  label={`${person.role} headshot`}
                  className="aspect-square w-full"
                />
                <h3 className="mt-4 text-xl font-bold uppercase">{person.name}</h3>
                <p className="text-ink-600">{person.role}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-brand-500 py-14">
        <div className="container-page flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <p className="font-display text-3xl font-bold uppercase text-ink-950">
            Have a project in mind?
          </p>
          <ButtonLink href="/contact" variant="dark">
            Contact us
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
