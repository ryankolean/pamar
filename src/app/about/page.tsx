import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { ProjectPhoto } from "@/components/projects/project-photo";
import { CountUp } from "@/components/ui/count-up";
import { SectionHeading } from "@/components/ui/section-heading";
import { founders, initials, leadership } from "@/content/leadership";
import { revealDelay } from "@/lib/motion";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `The history, values, and leadership of ${site.name}.`,
};

// PLACEHOLDER values copy until confirmed by the client (SUMMIT-228).
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

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About us" title={`About ${site.name}`} intro={site.description} />

      <section className="py-16 sm:py-20">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-5 text-lg text-ink-700">
            <SectionHeading eyebrow="Our story" title="Family owned since 1968" />
            <p>
              Pamar Enterprises is a family-owned business approaching 50 years in operation. Over
              those years we have built a reputation for taking on tough infrastructure projects and
              for responding quickly to utility maintenance and emergencies.
            </p>
            <p>
              Today Pamar is known for deep experience across heavy civil construction: underground
              utilities, road construction, bridge work, and site preparation. A team of more than
              120 people handles estimating, budgeting, design, development, and complete execution
              for MDOT, local municipalities, businesses, and private developers.
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
          <SectionHeading
            eyebrow="Leadership"
            title="Our team"
            intro="The second generation of the Acciavatti family leads Pamar today, alongside a management team with decades in heavy civil construction."
          />
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {leadership.map((person, index) => (
              <li key={person.name} data-reveal style={revealDelay(index)}>
                {person.photo ? (
                  <ProjectPhoto
                    image={{ src: person.photo, alt: `${person.name}, ${person.role}` }}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="aspect-square w-full"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex aspect-square w-full items-center justify-center bg-teal-700 font-display text-5xl font-bold text-white"
                  >
                    {initials(person.name)}
                  </div>
                )}
                <h3 className="mt-4 text-xl font-bold uppercase">{person.name}</h3>
                <p className="font-semibold text-teal-700">{person.role}</p>
                {person.bio && <p className="mt-2 text-sm text-ink-600">{person.bio}</p>}
              </li>
            ))}
          </ul>

          <div
            data-reveal
            className="mt-16 grid gap-8 border-t-4 border-brand-500 bg-ink-50 p-8 lg:grid-cols-[1fr_2fr]"
          >
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
                Our founders
              </p>
              <h3 className="mt-2 text-2xl font-bold uppercase">{founders.names}</h3>
            </div>
            <p className="text-ink-700">{founders.story}</p>
          </div>
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
