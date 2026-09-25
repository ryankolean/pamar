/**
 * 301 redirects from the legacy pamarenterprises.com URLs to the new site.
 *
 * Fill this in from the URL inventory gathered in discovery (SUMMIT-228) so search rankings
 * and bookmarks carry over. Example:
 *   { source: "/our-work.html", destination: "/projects" },
 */
export type LegacyRedirect = { source: string; destination: string };

export const legacyRedirects: LegacyRedirect[] = [];

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
