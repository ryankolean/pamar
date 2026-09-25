import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectGrid } from "@/components/projects/project-card";
import { ProjectPhoto } from "@/components/projects/project-photo";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { getProjectBySlug, getProjects, getRelatedProjects } from "@/content/projects";
import { getServices } from "@/content/services";
import { breadcrumbJsonLd } from "@/lib/seo";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProjects()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const project = await getProjectBySlug((await props.params).slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage(props: PageProps<"/projects/[slug]">) {
  const project = await getProjectBySlug((await props.params).slug);
  if (!project) notFound();

  const [services, related] = await Promise.all([getServices(), getRelatedProjects(project)]);
  const projectServices = services.filter((s) => project.services.includes(s.slug));

  const facts = [
    { label: "Job name", value: project.jobName },
    { label: "Owner", value: project.owner },
    { label: "Engineer", value: project.engineer },
    { label: "Location", value: project.location },
    { label: "Market", value: project.market },
    { label: "Completed", value: project.year?.toString() },
    { label: "Contract value", value: project.valueRange },
    { label: "Duration", value: project.duration },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value));

  const [heroImage, ...gallery] = project.images;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Projects", path: "/projects" },
          { name: project.title, path: `/projects/${project.slug}` },
        ])}
      />
      <PageHero
        eyebrow={
          project.year !== undefined ? `${project.market} · ${project.year}` : project.market
        }
        title={project.title}
        intro={project.summary}
      />

      <section className="py-16 sm:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-12">
            <ProjectPhoto
              image={heroImage}
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="aspect-[16/10] w-full"
              priority
            />

            <div>
              <h2 className="text-2xl font-bold uppercase">Scope of work</h2>
              <ul className="mt-6 space-y-3">
                {project.scope.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 bg-brand-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {(project.challenge || project.result) && (
              <div className="grid gap-8 md:grid-cols-2">
                {project.challenge && (
                  <div className="border-l-4 border-ink-300 pl-6">
                    <h2 className="text-xl font-bold uppercase">The challenge</h2>
                    <p className="mt-3 text-ink-700">{project.challenge}</p>
                  </div>
                )}
                {project.result && (
                  <div className="border-l-4 border-brand-500 pl-6">
                    <h2 className="text-xl font-bold uppercase">The result</h2>
                    <p className="mt-3 text-ink-700">{project.result}</p>
                  </div>
                )}
              </div>
            )}

            {gallery.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold uppercase">Gallery</h2>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {gallery.map((image) => (
                    <li key={image.alt}>
                      <ProjectPhoto
                        image={image}
                        sizes="(min-width: 640px) 30vw, 100vw"
                        className="aspect-[4/3] w-full"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="h-fit space-y-8 bg-ink-950 p-8 text-white lg:sticky lg:top-28">
            <h2 className="text-lg font-bold uppercase text-white">Project facts</h2>
            <dl className="space-y-4">
              {facts.map((fact) => (
                <div key={fact.label} className="border-b border-ink-800 pb-4">
                  <dt className="font-display text-xs uppercase tracking-widest text-ink-400">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-lg">{fact.value}</dd>
                </div>
              ))}
              <div>
                <dt className="font-display text-xs uppercase tracking-widest text-ink-400">
                  Services
                </dt>
                <dd className="mt-2">
                  <ul className="flex flex-wrap gap-2">
                    {projectServices.map((service) => (
                      <li key={service.slug}>
                        <Link
                          href={`/services/${service.slug}`}
                          className="inline-block border border-ink-700 px-3 py-1 text-sm hover:border-brand-500 hover:text-brand-400"
                        >
                          {service.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-ink-50 py-16 sm:py-20">
          <div className="container-page">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-3xl font-bold uppercase">Related projects</h2>
              <ButtonLink href="/projects" variant="outline" className="self-start">
                All projects
              </ButtonLink>
            </div>
            <ProjectGrid projects={related} />
          </div>
        </section>
      )}
    </>
  );
}
