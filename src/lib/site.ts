/**
 * Global site configuration.
 * Contact details come from the live site (docs/brand/source/copy.md); items marked PLACEHOLDER
 * are still unconfirmed with the client.
 */
export const site = {
  name: "Pamar Enterprises",
  /** Registered name, for the copyright line, structured data, and bid documents. */
  legalName: "Pamar Enterprises, Inc.",
  shortName: "Pamar",
  tagline: "Precision. Strength. Experts.",
  description:
    "Pamar Enterprises, Inc. is a family-owned heavy civil and underground utility contractor in New Haven, Michigan, working with MDOT, municipalities, and private developers since 1976.",
  /**
   * Public origin for canonical URLs, the sitemap, and links in emails. Set NEXT_PUBLIC_SITE_URL
   * per environment; production builds fall back to the live domain rather than localhost.
   */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === "production"
      ? "https://www.pamarenterprises.com"
      : "http://localhost:3000"),
  /** Time zone for bid due dates and meeting times. */
  timeZone: "America/Detroit",
  contact: {
    phone: "(586) 749-8593",
    /** PLACEHOLDER: the live site publishes no email address, only a contact form. */
    email: "info@pamarenterprises.com",
  },
  offices: [
    {
      name: "Main Office",
      address: ["31604 Pamar Court", "New Haven, MI 48048"],
      phone: "(586) 749-8593",
      /** PLACEHOLDER: hours are not published on the live site. */
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
  { label: "Careers", href: "/careers" },
  { label: "Subcontractors", href: "/subcontractors" },
];

/** Header call to action. */
export const headerCta: NavItem | null = { label: "Contact Us", href: "/contact" };
