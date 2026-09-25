import { getJobs } from "@/content/jobs";
import { getOpportunities } from "@/content/opportunities";
import { getServices } from "@/content/services";
import { opportunityStatus } from "@/lib/opportunities";
import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

/**
 * /llms.txt: a plain-language map of the site for AI assistants and answer engines
 * (see https://llmstxt.org). Generated from the same content as the pages, so it stays current.
 */
export async function GET() {
  const [services, jobs, opportunities] = await Promise.all([
    getServices(),
    getJobs(),
    getOpportunities(),
  ]);
  const openPackages = opportunities.filter((o) => opportunityStatus(o) === "Open").length;

  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "## Services",
    ...services.map((s) => `- [${s.name}](${absoluteUrl(`/services/${s.slug}`)}): ${s.summary}`),
    "",
    "## Key pages",
    `- [Projects](${absoluteUrl("/projects")}): Completed projects, filterable by service, market, and year.`,
    `- [Careers](${absoluteUrl("/careers")}): ${jobs.length} open positions and an online application.`,
    `- [Subcontractor bid opportunities](${absoluteUrl("/subcontractors/opportunities")}): ${openPackages} open subcontract packages with due dates and scopes.`,
    `- [Subcontractor registration](${absoluteUrl("/subcontractors/register")}): Join the bidder list.`,
    `- [Safety](${absoluteUrl("/safety")}): Safety programs and culture.`,
    `- [Contact](${absoluteUrl("/contact")}): Office details and contact form.`,
    "",
    "## Contact",
    `- Phone: ${site.contact.phone}`,
    `- Email: ${site.contact.email}`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
