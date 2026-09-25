import type { MetadataRoute } from "next";
import { getJobs } from "@/content/jobs";
import { getOpportunities } from "@/content/opportunities";
import { getProjects } from "@/content/projects";
import { getServices } from "@/content/services";
import { absoluteUrl } from "@/lib/seo";

const staticPaths = [
  "/",
  "/services",
  "/projects",
  "/about",
  "/safety",
  "/careers",
  "/careers/apply",
  "/subcontractors",
  "/subcontractors/opportunities",
  "/subcontractors/register",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, jobs, opportunities] = await Promise.all([
    getServices(),
    getProjects(),
    getJobs(),
    getOpportunities(),
  ]);

  return [
    ...staticPaths.map((path) => ({ url: absoluteUrl(path) })),
    ...services.map((s) => ({ url: absoluteUrl(`/services/${s.slug}`) })),
    ...projects.map((p) => ({ url: absoluteUrl(`/projects/${p.slug}`) })),
    ...jobs.map((j) => ({ url: absoluteUrl(`/careers/${j.slug}`), lastModified: j.postedAt })),
    ...opportunities.map((o) => ({ url: absoluteUrl(`/subcontractors/opportunities/${o.slug}`) })),
  ];
}
