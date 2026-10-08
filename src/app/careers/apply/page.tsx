import type { Metadata } from "next";
import { Suspense } from "react";
import { ApplyContent } from "@/components/careers/apply-content";
import { EmploymentNotices } from "@/components/careers/employment-notices";
import { getJobs } from "@/content/jobs";
import { acceptAttribute, uploadLimits } from "@/lib/forms/files";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Apply",
  description: `Apply for a position at ${site.name}.`,
};

export default async function ApplyPage() {
  const jobs = await getJobs();

  return (
    <>
      {/* ?job=<slug> is read on the client so the page stays static. */}
      <Suspense fallback={null}>
        <ApplyContent
          jobs={jobs.map(({ slug, title, summary }) => ({ slug, title, summary }))}
          resume={{
            accept: acceptAttribute(uploadLimits.resume.kinds),
            maxMb: uploadLimits.resume.maxBytes / 1024 / 1024,
          }}
        />
      </Suspense>
      {/* Outside the Suspense boundary so the notices are in the static HTML. */}
      <EmploymentNotices />
    </>
  );
}
