import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
};

/** Dark title band used at the top of interior pages. */
export function PageHero({ eyebrow, title, intro, children }: PageHeroProps) {
  return (
    <section className="bg-hatch bg-ink-950 text-white">
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
