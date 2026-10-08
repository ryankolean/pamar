import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { inDelay } from "@/lib/motion";
import { site } from "@/lib/site";

/**
 * The homepage hero photo. A placeholder from the live site until client photography arrives
 * (SUMMIT-258): swap `src` and `alt` here, then adjust `position` so the subject stays clear of
 * the text side. `position` is a CSS object-position, applied at every breakpoint.
 */
export const HOME_HERO_IMAGE = {
  src: "/images/site/crew-setting-pipe.jpg",
  alt: "Pamar crew in hard hats setting concrete pipe in an open roadside trench",
  position: "70% 40%",
} as const;

type HomeHeroProps = {
  /**
   * Optional background loop (drone footage, for example). It plays muted over the photo, which
   * stays as its poster and as the only layer without JavaScript or under reduced motion.
   */
  video?: { src: string; type?: string };
};

/**
 * Full-bleed photo hero for the homepage: the jobsite photo covers the band edge to edge under a
 * teal overlay that is darkest behind the text (docs/brand/brand-style-guide.html, section 5).
 */
export function HomeHero({ video }: HomeHeroProps) {
  const position = { objectPosition: HOME_HERO_IMAGE.position };

  return (
    <section className="kenburns-bg on-dark relative isolate overflow-hidden bg-teal-950 text-white">
      <Image
        src={HOME_HERO_IMAGE.src}
        alt={HOME_HERO_IMAGE.alt}
        fill
        preload
        sizes="100vw"
        className="-z-20 object-cover"
        style={position}
      />
      {video && (
        <video
          aria-hidden="true"
          autoPlay
          muted
          loop
          playsInline
          poster={HOME_HERO_IMAGE.src}
          className="absolute inset-0 -z-20 hidden size-full object-cover motion-safe:[.js_&]:block"
          style={position}
        >
          <source
            src={video.src}
            type={video.type ?? "video/mp4"}
            media="(prefers-reduced-motion: no-preference)"
          />
        </video>
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-teal-950/95 via-teal-950/75 to-teal-950/70 lg:bg-linear-to-r lg:from-teal-950/95 lg:via-teal-950/80 lg:via-50% lg:to-teal-950/25"
      />
      <div className="container-page flex min-h-[70svh] flex-col justify-center py-16 sm:py-20 lg:min-h-[80svh] lg:py-28">
        <div className="flex max-w-3xl flex-col">
          <p className="hero-in mb-4 font-display text-sm font-semibold uppercase tracking-[0.25em] text-brand-400">
            {site.name}
          </p>
          <h1
            className="hero-in text-5xl font-bold uppercase leading-[1.05] text-white sm:text-6xl xl:text-7xl"
            style={inDelay(80)}
          >
            {site.tagline}
          </h1>
          <p
            className="hero-in mt-6 max-w-2xl text-lg text-teal-50 sm:text-xl"
            style={inDelay(160)}
          >
            {site.description}
          </p>
          <div className="hero-in mt-10 flex flex-wrap gap-4" style={inDelay(240)}>
            <ButtonLink href="/projects">View Our Work</ButtonLink>
            <ButtonLink href="/careers" variant="outline-light">
              Join Our Team
            </ButtonLink>
          </div>
          <Link
            href="/subcontractors"
            className="hero-in group mt-6 inline-flex items-center gap-2 self-start font-display text-sm font-semibold uppercase tracking-wider text-teal-100 hover:text-white"
            style={inDelay(320)}
          >
            Subcontract Opportunities{" "}
            <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2 bg-brand-500" />
    </section>
  );
}
