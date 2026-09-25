"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { headerCta, mainNav } from "@/lib/site";
import { Logo } from "./logo";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [openFor, setOpenFor] = useState<string | null>(null);
  // The mobile menu closes itself whenever the route changes.
  const open = openFor === pathname;

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
      <div className="container-page flex h-20 items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={cn(
                    "border-b-2 py-2 font-display text-sm font-semibold uppercase tracking-wider transition-colors",
                    isActive(pathname, item.href)
                      ? "border-brand-500 text-ink-950"
                      : "border-transparent text-ink-600 hover:text-ink-950",
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
            <ButtonLink href={headerCta.href} className="hidden sm:inline-flex">
              {headerCta.label}
            </ButtonLink>
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
          className="border-t border-ink-100 bg-white lg:hidden"
        >
          <ul className="container-page flex flex-col py-4">
            {mainNav.map((item) => (
              <li key={item.href}>
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
