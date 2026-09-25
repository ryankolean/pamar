/**
 * 301 redirects from the legacy pamarenterprises.com URLs to the new site, from the URL
 * inventory in docs/brand/source/summary.json. Pages whose paths carry over unchanged
 * (/about, /safety, /services, /projects, /careers, /contact) need no entry.
 */
export type LegacyRedirect = { source: string; destination: string };

export const legacyRedirects: LegacyRedirect[] = [
  // Project pages lived at the site root; the slugs are kept.
  {
    source: "/cso-3-5-phase-ii-control-123688",
    destination: "/projects/cso-3-5-phase-ii-control-123688",
  },
  {
    source: "/water-main-replacement-using-pipeburst",
    destination: "/projects/water-main-replacement-using-pipeburst",
  },
  { source: "/2017-water-main-replacement", destination: "/projects/2017-water-main-replacement" },
  {
    source: "/section-24-area-3-southfield",
    destination: "/projects/section-24-area-3-southfield",
  },
  { source: "/brown-road-widening", destination: "/projects/brown-road-widening" },
  { source: "/worth-township-contract-4", destination: "/projects/worth-township-contract-4" },
  // News and the HTML sitemap are not carried over.
  { source: "/news", destination: "/" },
  { source: "/news/:slug", destination: "/" },
  { source: "/sitemap", destination: "/" },
  { source: "/essential", destination: "/contact" },
];

/** Problems that would break or loop redirects; checked in tests. */
export function redirectProblems(redirects: LegacyRedirect[]): string[] {
  const problems: string[] = [];
  const sources = new Set<string>();
  for (const { source, destination } of redirects) {
    if (!source.startsWith("/")) problems.push(`Source must start with "/": ${source}`);
    if (!destination.startsWith("/") && !/^https?:\/\//.test(destination)) {
      problems.push(`Destination must be a path or absolute URL: ${destination}`);
    }
    if (source === destination) problems.push(`Redirects to itself: ${source}`);
    if (sources.has(source)) problems.push(`Duplicate source: ${source}`);
    sources.add(source);
  }
  for (const { source, destination } of redirects) {
    if (source !== destination && sources.has(destination))
      problems.push(`Redirect chain: ${source} -> ${destination}`);
  }
  return problems;
}
