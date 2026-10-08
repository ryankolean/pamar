import Image from "next/image";
import type { ReactNode } from "react";
import { inDelay } from "@/lib/motion";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
};

/**
 * Title band at the top of interior pages: the live site's excavator photo under a deep teal
 * overlay, behind white text (docs/brand/brand-style-guide.html, section 5). The overlay keeps
 * white text above 8:1 even over the photo's brightest pixels.
 */
export function PageHero({ eyebrow, title, intro, children }: PageHeroProps) {
  return (
    <section className="kenburns-bg on-dark relative isolate overflow-hidden bg-teal-950 text-white">
      <Image
        src="/images/site/excavator-dark.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-teal-900/85" />
      <div className="container-page py-16 sm:py-20">
        {eyebrow && (
          <p className="hero-in mb-3 font-display text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">
            {eyebrow}
          </p>
        )}
        <h1
          className="hero-in max-w-4xl text-4xl font-bold uppercase text-white sm:text-5xl"
          style={inDelay(80)}
        >
          {title}
        </h1>
        {intro && (
          <p className="hero-in mt-5 max-w-2xl text-lg text-teal-50" style={inDelay(160)}>
            {intro}
          </p>
        )}
        {children && (
          <div className="hero-in mt-8 flex flex-wrap gap-4" style={inDelay(240)}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
