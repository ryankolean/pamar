import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { getServiceBySlug, getServices } from "@/content/services";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getServices()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/services/[slug]">): Promise<Metadata> {
  const service = await getServiceBySlug((await props.params).slug);
  if (!service) return {};
  return { title: service.name, description: service.summary };
}

export default async function ServicePage(props: PageProps<"/services/[slug]">) {
  const service = await getServiceBySlug((await props.params).slug);
  if (!service) notFound();

  return (
    <>
      <PageHero eyebrow="Services" title={service.name} intro={service.summary} />

      <section className="py-16 sm:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-5 text-lg text-ink-700">
            {service.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <PlaceholderImage label={service.name} className="aspect-[4/3] w-full" />
        </div>
      </section>

      <section className="bg-ink-50 py-16 sm:py-20">
        <div className="container-page grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold uppercase">Capabilities</h2>
            <ul className="mt-6 space-y-3">
              {service.capabilities.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 bg-brand-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold uppercase">Equipment</h2>
            <ul className="mt-6 space-y-3">
              {service.equipment.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 bg-ink-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-2xl font-bold uppercase text-ink-950">
            Explore our other capabilities
          </p>
          <ButtonLink href="/services" variant="outline">
            All services
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
