/**
 * Project portfolio.
 *
 * PLACEHOLDER content: these are sample entries that show the layout. Replace them with
 * Pamar's real project list, details, and photography (SUMMIT-228). Accessors are async
 * so this module can be swapped for a CMS query (SUMMIT-237).
 */
export const markets = [
  "Municipal",
  "Commercial",
  "Industrial",
  "Residential Development",
  "Transportation",
] as const;

export type Market = (typeof markets)[number];

export type ProjectImage = {
  /** Path under /public or a remote URL allowed in next.config. Omit to render a placeholder. */
  src?: string;
  alt: string;
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  /** Service slugs from src/content/services.ts. */
  services: string[];
  market: Market;
  location: string;
  /** Year of completion. */
  year: number;
  owner: string;
  valueRange?: string;
  duration?: string;
  scope: string[];
  challenge: string;
  result: string;
  featured?: boolean;
  images: ProjectImage[];
};

const projects: Project[] = [
  {
    slug: "downtown-sewer-separation",
    title: "Downtown Sewer Separation",
    summary: "Separated combined sewers beneath an active downtown corridor to reduce overflows.",
    services: ["underground-utilities", "roadway-infrastructure"],
    market: "Municipal",
    location: "Downtown district",
    year: 2024,
    owner: "Municipal client",
    valueRange: "$5M–$10M",
    duration: "14 months",
    scope: [
      "New storm sewer from 12 to 48 inches",
      "Sanitary lateral reconnections",
      "Full-depth road restoration",
      "Staged maintenance of traffic",
    ],
    challenge:
      "Work ran beneath a busy commercial corridor with businesses open throughout construction and shallow, undocumented utilities.",
    result:
      "Phased the work block by block to keep every storefront accessible, and finished the underground work ahead of the paving window.",
    featured: true,
    images: [{ alt: "Crew setting storm pipe in a downtown trench" }, { alt: "Restored roadway" }],
  },
  {
    slug: "water-main-replacement-program",
    title: "Water Main Replacement Program",
    summary: "Replaced aging cast-iron water main across several residential neighborhoods.",
    services: ["underground-utilities"],
    market: "Municipal",
    location: "Residential neighborhoods",
    year: 2023,
    owner: "Municipal water utility",
    valueRange: "$1M–$5M",
    duration: "8 months",
    scope: [
      "8-inch and 12-inch ductile iron water main",
      "Hydrant and valve replacement",
      "Service transfers",
      "Lawn and driveway restoration",
    ],
    challenge:
      "Homes needed to keep water service throughout, with only short, pre-announced shutoffs.",
    result: "Used temporary bypass services so residents had only brief, scheduled interruptions.",
    featured: true,
    images: [{ alt: "Water main installation" }],
  },
  {
    slug: "industrial-park-site-development",
    title: "Industrial Park Site Development",
    summary: "Mass grading and site utilities for a new multi-building industrial park.",
    services: ["site-development", "excavation-earthwork", "underground-utilities"],
    market: "Industrial",
    location: "Industrial corridor",
    year: 2022,
    owner: "Private developer",
    valueRange: "$10M+",
    duration: "18 months",
    scope: [
      "Mass grading and cut-and-fill balancing",
      "Storm detention basins",
      "Sanitary, storm, and water site utilities",
      "Building pads and truck court preparation",
    ],
    challenge: "Poor soils across much of the site threatened the grading schedule.",
    result:
      "Stabilized the soils in place instead of hauling them off, which saved truck traffic and kept the building pads on schedule.",
    featured: true,
    images: [{ alt: "Aerial view of graded industrial site" }, { alt: "Detention basin" }],
  },
  {
    slug: "county-road-reconstruction",
    title: "County Road Reconstruction",
    summary: "Full reconstruction of a two-mile county road with new drainage and culverts.",
    services: ["roadway-infrastructure", "excavation-earthwork"],
    market: "Transportation",
    location: "County road",
    year: 2021,
    owner: "County road agency",
    valueRange: "$5M–$10M",
    duration: "6 months",
    scope: ["Pavement removal and subgrade repair", "Culvert replacement", "Ditching and drainage"],
    challenge: "The road had to stay open to local traffic and school buses.",
    result: "Worked one lane at a time with flaggers and completed before the school year.",
    images: [{ alt: "Road reconstruction" }],
  },
  {
    slug: "retail-center-redevelopment",
    title: "Retail Center Redevelopment",
    summary: "Demolition and site prep to redevelop an aging retail center.",
    services: ["demolition", "site-development"],
    market: "Commercial",
    location: "Suburban retail corridor",
    year: 2023,
    owner: "Commercial developer",
    valueRange: "$1M–$5M",
    duration: "5 months",
    scope: ["Building and pavement demolition", "Concrete recycling", "Site utility relocation"],
    challenge: "Neighboring tenants stayed open during demolition.",
    result: "Controlled dust, noise, and access so neighboring businesses stayed open throughout.",
    images: [{ alt: "Demolition of retail building" }],
  },
  {
    slug: "subdivision-utilities",
    title: "Subdivision Utilities & Grading",
    summary: "Utilities and grading for a new residential subdivision.",
    services: ["underground-utilities", "site-development"],
    market: "Residential Development",
    location: "New subdivision",
    year: 2025,
    owner: "Residential builder",
    valueRange: "$1M–$5M",
    duration: "7 months",
    scope: ["Sanitary, storm, and water mains", "Mass and finish grading", "Road base preparation"],
    challenge: "The builder needed lots ready in phases to match home sales.",
    result: "Delivered lots phase by phase so home construction could start early.",
    images: [{ alt: "Subdivision utilities" }],
  },
  {
    slug: "emergency-interceptor-repair",
    title: "Emergency Interceptor Repair",
    summary: "Rapid repair of a collapsed sanitary interceptor to restore service.",
    services: ["emergency-response", "underground-utilities"],
    market: "Municipal",
    location: "Regional interceptor",
    year: 2022,
    owner: "Regional sewer authority",
    duration: "3 weeks",
    scope: ["Bypass pumping", "Deep excavation with shoring", "Pipe and manhole replacement"],
    challenge: "A deep sewer collapse put service and nearby property at risk.",
    result: "Mobilized crews quickly, set up bypass pumping, and restored full service.",
    images: [{ alt: "Emergency bypass pumping setup" }],
  },
];

export async function getProjects(): Promise<Project[]> {
  // Newest first.
  return [...projects].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  return projects.find((project) => project.slug === slug);
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  return (await getProjects()).filter((project) => project.featured).slice(0, limit);
}

export async function getProjectsForService(serviceSlug: string, limit = 3): Promise<Project[]> {
  return (await getProjects())
    .filter((project) => project.services.includes(serviceSlug))
    .slice(0, limit);
}

/** Other projects that share a service with the given one. */
export async function getRelatedProjects(project: Project, limit = 3): Promise<Project[]> {
  return (await getProjects())
    .filter((p) => p.slug !== project.slug && p.services.some((s) => project.services.includes(s)))
    .slice(0, limit);
}
