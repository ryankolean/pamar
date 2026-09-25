import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { getJobBySlug, getJobs } from "@/content/jobs";
import { formatDate } from "@/lib/dates";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getJobs()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/careers/[slug]">): Promise<Metadata> {
  const job = await getJobBySlug((await props.params).slug);
  if (!job) return {};
  return { title: `${job.title} – Careers`, description: job.summary };
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 bg-brand-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function JobPage(props: PageProps<"/careers/[slug]">) {
  const job = await getJobBySlug((await props.params).slug);
  if (!job) notFound();

  const applyHref = `/careers/apply?job=${job.slug}`;
  const facts = [
    { label: "Department", value: job.department },
    { label: "Location", value: job.location },
    { label: "Type", value: job.employmentType },
    { label: "Pay", value: job.pay },
    { label: "Posted", value: formatDate(job.postedAt) },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value));

  return (
    <>
      <PageHero
        eyebrow={`${job.department} · ${job.employmentType}`}
        title={job.title}
        intro={job.summary}
      >
        <ButtonLink href={applyHref}>Apply for this position</ButtonLink>
      </PageHero>

      <section className="py-16 sm:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-12 text-ink-800">
            <div>
              <h2 className="text-2xl font-bold uppercase">What you’ll do</h2>
              <Bullets items={job.responsibilities} />
            </div>
            <div>
              <h2 className="text-2xl font-bold uppercase">What you’ll need</h2>
              <Bullets items={job.requirements} />
            </div>
            {job.preferred && job.preferred.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold uppercase">Nice to have</h2>
                <Bullets items={job.preferred} />
              </div>
            )}
            <Link
              href="/careers#openings"
              className="inline-block font-semibold text-ink-700 underline"
            >
              ← All open positions
            </Link>
          </div>

          <aside className="h-fit space-y-6 bg-ink-950 p-8 text-white lg:sticky lg:top-28">
            <h2 className="text-lg font-bold uppercase text-white">Position details</h2>
            <dl className="space-y-4">
              {facts.map((fact) => (
                <div key={fact.label} className="border-b border-ink-800 pb-4">
                  <dt className="font-display text-xs uppercase tracking-widest text-ink-400">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-lg">{fact.value}</dd>
                </div>
              ))}
            </dl>
            <ButtonLink href={applyHref} className="w-full">
              Apply now
            </ButtonLink>
          </aside>
        </div>
      </section>
    </>
  );
}
