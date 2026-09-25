"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { ButtonLink } from "@/components/ui/button";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { inDelay } from "@/lib/motion";
import { headerCta, mainNav } from "@/lib/site";
import { Logo } from "./logo";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function subscribeScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

/** True once the page has scrolled past the hero's top edge; the header compacts. */
function useScrolled() {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 80,
    () => false,
  );
}

const navLink =
  "relative py-2 font-display text-sm font-semibold uppercase tracking-wider transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:bg-brand-500 after:transition-transform after:duration-300 after:content-['']";

export function SiteHeader() {
  const pathname = usePathname();
  const [openFor, setOpenFor] = useState<string | null>(null);
  // The mobile menu closes itself whenever the route changes.
  const open = openFor === pathname;
  const scrolled = useScrolled();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur transition-shadow duration-300",
        scrolled && "shadow-md",
      )}
    >
      <div
        className={cn(
          "container-page flex items-center justify-between gap-6 transition-[height] duration-300",
          scrolled ? "h-16" : "h-20",
        )}
      >
        <div
          className={cn("origin-left transition-transform duration-300", scrolled && "scale-90")}
        >
          <Logo />
        </div>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={cn(
                    navLink,
                    isActive(pathname, item.href)
                      ? "text-ink-950 after:scale-x-100"
                      : "text-ink-600 after:scale-x-0 hover:text-ink-950 hover:after:scale-x-100",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          {headerCta && (
            // Wrapper controls visibility: ButtonLink's own inline-flex would override "hidden".
            <div className="hidden sm:block">
              <ButtonLink href={headerCta.href}>{headerCta.label}</ButtonLink>
            </div>
          )}
          {mainNav.length > 0 && (
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-sm text-2xl text-ink-950 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpenFor(open ? null : pathname)}
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          )}
        </div>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="animate-[menu-in_0.25s_ease-out] border-t border-ink-100 bg-white lg:hidden"
        >
          <ul className="container-page flex flex-col py-4">
            {mainNav.map((item, index) => (
              <li key={item.href} className="hero-in" style={inDelay(index * 40)}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className="block border-b border-ink-100 py-4 font-display text-lg font-semibold uppercase tracking-wider text-ink-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {headerCta && (
              <li className="pt-4 sm:hidden">
                <ButtonLink href={headerCta.href} className="w-full">
                  {headerCta.label}
                </ButtonLink>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
