/**
 * Global site configuration.
 * Contact details are PLACEHOLDERS until confirmed with the client (SUMMIT-228).
 */
export const site = {
  name: "Pamar Enterprises",
  shortName: "Pamar",
  tagline: "Building the infrastructure our communities run on.",
  description:
    "Pamar Enterprises is a construction contractor delivering infrastructure projects safely, on schedule, and built to last.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contact: {
    phone: "(000) 000-0000",
    email: "info@pamarenterprises.com",
  },
} as const;

export type NavItem = { label: string; href: string };

/** Primary navigation. Each feature adds its own entry as its routes land. */
export const mainNav: NavItem[] = [{ label: "Services", href: "/services" }];

/** Header call to action. */
export const headerCta: NavItem | null = null;
