import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { Job } from "@/content/jobs";
import { formatDate } from "@/lib/dates";
import { revealDelay } from "@/lib/motion";

export function JobList({ jobs }: { jobs: Job[] }) {
  return (
    <ul className="divide-y divide-ink-100 border border-ink-100 bg-white">
      {jobs.map((job, index) => (
        <li key={job.slug} data-reveal style={revealDelay(index)} className="group relative">
          <div className="flex flex-col gap-3 p-6 transition-colors group-hover:bg-ink-50 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold uppercase">
                <Link href={`/careers/${job.slug}`} className="after:absolute after:inset-0">
                  {job.title}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-ink-600">
                {job.department} · {job.location}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="rounded-sm bg-brand-100 px-2.5 py-1 font-semibold text-brand-900">
                {job.employmentType}
              </span>
              <span className="text-ink-500">
                Posted <time dateTime={job.postedAt}>{formatDate(job.postedAt)}</time>
              </span>
              <ArrowRightIcon
                aria-hidden="true"
                className="hidden text-xl text-ink-400 group-hover:text-brand-700 sm:block"
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
