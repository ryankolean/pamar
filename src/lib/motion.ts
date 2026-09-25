import type { CSSProperties } from "react";

/**
 * Motion helpers (see the motion rules in src/app/globals.css). Elements marked `data-reveal`
 * rise in when scrolled into view; `hero-in` elements rise in on page load. Both read a delay
 * from a CSS variable so lists can stagger.
 */

/** Stagger for the n-th item in a revealed list, 60 ms apart, capped so long lists don't lag. */
export function revealDelay(index: number, step = 60, max = 480): CSSProperties {
  return { "--reveal-delay": `${Math.min(index * step, max)}ms` } as CSSProperties;
}

/** Delay for a `hero-in` element. */
export function inDelay(ms: number): CSSProperties {
  return { "--in-delay": `${ms}ms` } as CSSProperties;
}
