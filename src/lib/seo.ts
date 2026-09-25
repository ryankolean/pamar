import type { Job } from "@/content/jobs";
import { site } from "@/lib/site";

/** Absolute URL for a site path. */
export function absoluteUrl(path: string): string {
  return new URL(path, site.url).toString();
}

const primaryOffice = site.offices[0];

/** Company structured data (schema.org GeneralContractor), rendered site-wide. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    name: site.name,
    description: site.description,
    url: site.url,
    logo: absoluteUrl("/icon.svg"),
    email: site.contact.email,
    telephone: site.contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: primaryOffice.address[0],
      addressLocality: primaryOffice.address[1],
      addressCountry: "US",
    },
  };
}

const employmentTypeMap: Record<Job["employmentType"], string> = {
  "Full-time": "FULL_TIME",
  "Part-time": "PART_TIME",
  Seasonal: "TEMPORARY",
  Internship: "INTERN",
};

function htmlList(items: string[]) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** schema.org JobPosting for Google for Jobs. */
export function jobPostingJsonLd(job: Job) {
  const description = [
    `<p>${escapeHtml(job.summary)}</p>`,
    `<h3>Responsibilities</h3>${htmlList(job.responsibilities)}`,
    `<h3>Requirements</h3>${htmlList(job.requirements)}`,
    job.preferred?.length ? `<h3>Preferred</h3>${htmlList(job.preferred)}` : "",
  ].join("");

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description,
    datePosted: job.postedAt,
    employmentType: employmentTypeMap[job.employmentType],
    hiringOrganization: { "@type": "Organization", name: site.name, sameAs: site.url },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: primaryOffice.address[0],
        addressLocality: primaryOffice.address[1],
        addressCountry: "US",
      },
    },
    directApply: true,
    url: absoluteUrl(`/careers/${job.slug}`),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Serialize JSON-LD safely for inline <script> tags. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
