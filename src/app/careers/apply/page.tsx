import type { Metadata } from "next";
import { ApplicationForm } from "@/components/careers/application-form";
import { PageHero } from "@/components/ui/page-hero";
import { getJobs } from "@/content/jobs";
import { acceptAttribute, uploadLimits } from "@/lib/forms/files";
import { firstParam } from "@/lib/search-params";
import { site, telHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Apply",
  description: `Apply for a position at ${site.name}.`,
};

export default async function ApplyPage(props: PageProps<"/careers/apply">) {
  const [jobs, searchParams] = await Promise.all([getJobs(), props.searchParams]);
  const requested = firstParam(searchParams.job);
  const job = jobs.find((j) => j.slug === requested);

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title={job ? `Apply: ${job.title}` : "Apply to join our team"}
        intro={
          job
            ? job.summary
            : "Tell us a little about yourself. It only takes a few minutes, and you can apply right from your phone."
        }
      />
      <section className="py-12 sm:py-16">
        <div className="container-page grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div className="max-w-2xl">
            <ApplicationForm
              positions={jobs.map((j) => ({ value: j.slug, label: j.title }))}
              defaultPosition={job?.slug}
              resume={{
                accept: acceptAttribute(uploadLimits.resume.kinds),
                maxMb: uploadLimits.resume.maxBytes / 1024 / 1024,
              }}
            />
          </div>
          <aside className="h-fit space-y-4 border-l-4 border-brand-500 bg-ink-50 p-8">
            <h2 className="text-lg font-bold uppercase">What happens next</h2>
            <ol className="list-decimal space-y-2 pl-5 text-ink-700">
              <li>You’ll get an email confirming we received your application.</li>
              <li>Our HR team reviews every application.</li>
              <li>If there’s a fit, we’ll call you to set up an interview.</li>
            </ol>
            <p className="pt-2 text-sm text-ink-600">
              Questions? Call{" "}
              <a href={telHref(site.contact.phone)} className="font-semibold underline">
                {site.contact.phone}
              </a>
              .
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
