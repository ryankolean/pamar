"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Reveals `[data-reveal]` elements as they scroll into view by adding `is-visible` (styles in
 * globals.css). Mounted once in the root layout; rescans after every navigation and filter
 * change because the App Router swaps the page's DOM. Without JavaScript, or with reduced
 * motion, everything simply shows.
 */
export function RevealObserver() {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)");
    if (elements.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname, search]);

  return null;
}
