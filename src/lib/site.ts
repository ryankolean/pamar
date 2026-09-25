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
  offices: [
    {
      name: "Main Office",
      address: ["Street address", "City, ST 00000"],
      phone: "(000) 000-0000",
      hours: "Monday–Friday, 7:00 a.m.–4:30 p.m.",
    },
  ],
} as const;

/** Google Maps search link for a postal address. */
export function mapUrl(addressLines: readonly string[]): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLines.join(", "))}`;
}

/** Normalize a display phone number into a tel: href. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export type NavItem = { label: string; href: string };

/** Primary navigation. Each feature adds its own entry as its routes land. */
export const mainNav: NavItem[] = [
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Safety", href: "/safety" },
];

/** Header call to action. */
export const headerCta: NavItem | null = { label: "Contact Us", href: "/contact" };
