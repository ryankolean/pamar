import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { ProjectGrid } from "@/components/projects/project-card";
import { ServiceCard } from "@/components/services/service-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getFeaturedProjects } from "@/content/projects";
import { getServices } from "@/content/services";
import { site } from "@/lib/site";

const pathways = [
  {
    eyebrow: "Our Work",
    title: "See what we build",
    body: "Browse completed projects across our capabilities, from first excavation to final restoration.",
    href: "/projects",
    cta: "View Our Work",
  },
  {
    eyebrow: "Careers",
    title: "Build your career here",
    body: "We hire operators, laborers, foremen, and project managers who take pride in doing the job right.",
    href: "/careers",
    cta: "Join Our Team",
  },
  {
    eyebrow: "Subcontractors",
    title: "Bid on our projects",
    body: "See open subcontracting packages on contracts we’ve won and submit your interest or bid.",
    href: "/subcontractors",
    cta: "Subcontract Opportunities",
  },
] as const;

const principles = [
  {
    title: "Safety first",
    body: "Every crew goes home safe. It’s the standard every project is measured against.",
  },
  {
    title: "Built to last",
    body: "Quality work that owners, engineers, and communities can rely on for decades.",
  },
  {
    title: "On schedule",
    body: "Experienced crews and careful planning keep projects moving.",
  },
] as const;

export default async function HomePage() {
  const [services, featured] = await Promise.all([getServices(), getFeaturedProjects()]);

  return (
    <>
      <section className="bg-hatch relative isolate overflow-hidden bg-ink-950 text-white">
        <div className="container-page flex min-h-[70vh] flex-col justify-center py-24">
          <p className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.25em] text-brand-400">
            {site.name}
          </p>
          <h1 className="max-w-4xl text-5xl font-bold uppercase leading-[1.05] text-white sm:text-6xl lg:text-7xl">
            {site.tagline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink-200 sm:text-xl">{site.description}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <ButtonLink href="/projects">View Our Work</ButtonLink>
            <ButtonLink href="/careers" variant="outline-light">
              Join Our Team
            </ButtonLink>
          </div>
          <Link
            href="/subcontractors"
            className="mt-6 inline-flex items-center gap-2 self-start font-display text-sm font-semibold uppercase tracking-wider text-ink-200 hover:text-white"
          >
            Subcontract Opportunities <ArrowRightIcon />
          </Link>
        </div>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2 bg-brand-500" />
      </section>

      <section className="py-20" aria-labelledby="pathways-heading">
        <div className="container-page">
          <h2 id="pathways-heading" className="sr-only">
            Where would you like to start?
          </h2>
          <ul className="grid gap-6 md:grid-cols-3">
            {pathways.map((item) => (
              <li
                key={item.href}
                className="group relative flex flex-col border border-ink-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-lg"
              >
                <span aria-hidden="true" className="mb-6 block h-1 w-12 bg-brand-500" />
                <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
                  {item.eyebrow}
                </p>
                <h3 className="mt-2 text-2xl font-bold uppercase">{item.title}</h3>
                <p className="mt-3 flex-1 text-ink-600">{item.body}</p>
                <Link
                  href={item.href}
                  className="mt-6 inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-ink-950 after:absolute after:inset-0 group-hover:text-brand-700"
                >
                  {item.cta} <ArrowRightIcon />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20" aria-labelledby="capabilities-heading">
        <div className="container-page">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              id="capabilities-heading"
              eyebrow="Capabilities"
              title="What we build"
              intro="Self-performed heavy civil work, from the first cut to final restoration."
            />
            <ButtonLink href="/services" variant="outline" className="self-start md:self-auto">
              All services
            </ButtonLink>
          </div>
          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <li key={service.slug}>
                <ServiceCard service={service} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="bg-ink-950 py-20" aria-labelledby="featured-heading">
          <div className="container-page">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeading
                id="featured-heading"
                eyebrow="Featured work"
                title="Recent projects"
                inverse
              />
              <ButtonLink
                href="/projects"
                variant="outline-light"
                className="self-start md:self-auto"
              >
                View all projects
              </ButtonLink>
            </div>
            <div className="mt-12">
              <ProjectGrid projects={featured} />
            </div>
          </div>
        </section>
      )}

      <section className="bg-ink-50 py-20">
        <div className="container-page">
          <SectionHeading eyebrow="How we work" title="Safety. Quality. Schedule." />
          <ul className="mt-12 grid gap-10 md:grid-cols-3">
            {principles.map((item) => (
              <li key={item.title} className="border-l-4 border-brand-500 pl-6">
                <h3 className="text-xl font-bold uppercase">{item.title}</h3>
                <p className="mt-2 text-ink-600">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
