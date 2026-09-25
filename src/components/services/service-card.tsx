import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { Service } from "@/content/services";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group relative flex h-full flex-col border border-ink-100 bg-white p-8 transition-shadow hover:shadow-lg">
      <span aria-hidden="true" className="mb-6 block h-1 w-12 bg-brand-500" />
      <h3 className="text-2xl font-bold uppercase">
        <Link href={`/services/${service.slug}`} className="after:absolute after:inset-0">
          {service.name}
        </Link>
      </h3>
      <p className="mt-3 flex-1 text-ink-600">{service.summary}</p>
      <span
        aria-hidden="true"
        className="mt-6 inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-ink-950 group-hover:text-brand-700"
      >
        Learn more <ArrowRightIcon />
      </span>
    </article>
  );
}
