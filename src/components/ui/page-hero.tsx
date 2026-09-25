import Image from "next/image";
import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
};

/**
 * Title band at the top of interior pages: the live site's excavator photo, darkened, behind
 * white text (docs/brand/brand-style-guide.html, section 5).
 */
export function PageHero({ eyebrow, title, intro, children }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-ink-950 text-white">
      <Image
        src="/images/site/excavator-dark.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink-950/70" />
      <div className="container-page py-16 sm:py-20">
        {eyebrow && (
          <p className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-4xl text-4xl font-bold uppercase text-white sm:text-5xl">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-lg text-ink-200">{intro}</p>}
        {children && <div className="mt-8 flex flex-wrap gap-4">{children}</div>}
      </div>
    </section>
  );
}
