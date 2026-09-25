/**
 * Project portfolio.
 *
 * Pamar's project list as published on www.pamarenterprises.com (docs/brand/source/copy.md),
 * with the live site's URL slugs. The live site gives no completion years, contract values,
 * durations, or per-project photos, so those fields are left empty rather than invented and the
 * photos are Pamar's general job site photography. Accessors are async
 * so this module can be swapped for a CMS query (SUMMIT-237).
 */
import type { Scene } from "@/components/ui/scene-art";

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
  /** Illustration shown until a photo is supplied; picked from the alt text when omitted. */
  scene?: Scene;
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  /** Service slugs from src/content/services.ts. */
  services: string[];
  market: Market;
  location: string;
  /** Year of completion, when known. */
  year?: number;
  owner: string;
  engineer?: string;
  /** Contract name when it differs from the title. */
  jobName?: string;
  valueRange?: string;
  duration?: string;
  scope: string[];
  challenge?: string;
  result?: string;
  featured?: boolean;
  images: ProjectImage[];
};

const projects: Project[] = [
  {
    slug: "cso-3-5-phase-ii-control-123688",
    title: "CSO #3 & #5, Phase II, Control #123688",
    summary:
      "Installation of sanitary sewer, 2,500 LF of 8″ through 24″, and over 10,000 LF of 12″ through 42″ C76-IV RCP storm sewer.",
    services: ["underground-utilities"],
    market: "Municipal",
    location: "Dearborn, MI",
    owner: "City of Dearborn",
    engineer: "City of Dearborn",
    scope: [
      "2,500 LF of sanitary sewer, 8″ through 24″",
      "Over 10,000 LF of 12″ through 42″ C76-IV RCP storm sewer",
    ],
    featured: true,
    images: [
      {
        src: "/images/site/sewer-shaft-pipe.jpg",
        alt: "Concrete sewer pipe set inside a lined shaft",
      },
      {
        src: "/images/site/crew-setting-pipe.jpg",
        alt: "Pamar crew setting pipe in an open trench",
      },
    ],
  },
  {
    slug: "water-main-replacement-using-pipeburst",
    title: "Water Main Replacement and Road Resurfacing",
    jobName: "Water Main Replacement and HMA Road Resurfacing",
    summary:
      "Pipe bursting 27,000 LF of 6″ and 8″ diameter pipe up to 10″ diameter HDPE SDR pipe, with milling and resurfacing of over 5 miles of residential roads.",
    services: ["underground-utilities", "roadway-infrastructure"],
    market: "Municipal",
    location: "Rochester Hills, MI",
    owner: "City of Rochester Hills",
    engineer: "City of Rochester Hills",
    scope: [
      "Pipe bursting 27,000 LF of 6″ and 8″ pipe, upsized to 10″ HDPE SDR pipe",
      "Milling and HMA resurfacing of over 5 miles of residential roads",
    ],
    featured: true,
    images: [
      {
        src: "/images/site/crew-at-trench.jpg",
        alt: "Pamar crew and excavator at an open water main trench",
      },
      {
        src: "/images/site/excavators-grading.jpg",
        alt: "Pamar excavators working along a residential road",
      },
    ],
  },
  {
    slug: "2017-water-main-replacement",
    title: "2017 Water Main Replacement",
    summary:
      "Over 6,000 LF of 8″ water main installation using trenchless technologies, with concrete pavement replacement in a densely populated Fraser subdivision.",
    services: ["underground-utilities", "roadway-infrastructure"],
    market: "Municipal",
    location: "Fraser, MI",
    year: 2017,
    owner: "City of Fraser",
    engineer: "Anderson, Eckstein & Westrick, Inc.",
    scope: [
      "Over 6,000 LF of 8″ water main installed with trenchless technologies",
      "Concrete pavement replacement within a densely populated subdivision",
    ],
    featured: true,
    images: [
      {
        src: "/images/site/excavator-loading-truck.jpg",
        alt: "Pamar excavator loading a haul truck beside a residential street",
      },
    ],
  },
  {
    slug: "section-24-area-3-southfield",
    title: "Section 24 Area 3, Southfield",
    jobName: "Section 24 Area 3",
    summary:
      "Pump station with wet well, 4,200 LF of water main, 4,200 LF of sanitary sewer (10″ to 30″), and concrete pavement replacement in Southfield neighborhoods, including partial reconstruction of 10 Mile Road.",
    services: ["underground-utilities", "roadway-infrastructure"],
    market: "Municipal",
    location: "Southfield, MI",
    owner: "City of Southfield",
    engineer: "Hubbell, Roth & Clark, Inc.",
    scope: [
      "Pump station installation with wet well",
      "4,200 LF of water main",
      "4,200 LF of sanitary sewer, 10″ to 30″ diameter, open cut trench method",
      "Concrete pavement replacement in residential neighborhoods",
      "Partial reconstruction of 10 Mile Road, a major thoroughfare",
    ],
    images: [
      { src: "/images/site/tunnel-work.jpg", alt: "Pamar crew working inside a lined shaft" },
      { src: "/images/site/mass-grading.jpg", alt: "Pamar excavators grading a work site" },
    ],
  },
  {
    slug: "brown-road-widening",
    title: "Brown Road Widening",
    summary:
      "Over a mile of road widening with water main relocation and abandonment, gas main removal and abandonment, and traffic signal modernization.",
    services: ["roadway-infrastructure", "underground-utilities"],
    market: "Municipal",
    location: "Orion Township, MI",
    owner: "Charter Township of Orion",
    engineer: "OHM Advisors, Inc.",
    scope: [
      "1+ miles of road widening",
      "Water main relocation and abandonment",
      "Gas main removal and abandonment",
      "Traffic signal modernization",
    ],
    images: [
      {
        src: "/images/site/excavators-grading.jpg",
        alt: "Pamar excavators grading along a roadway",
      },
    ],
  },
  {
    slug: "worth-township-contract-4",
    title: "Worth Township Contract #4 Sanitary Installation",
    jobName: "Contract #4",
    summary: "Sanitary sewer installation for Worth Township under Contract #4.",
    services: ["underground-utilities"],
    market: "Municipal",
    location: "Worth Township, MI",
    owner: "Worth Township",
    engineer: "Prein & Newhof",
    scope: ["Sanitary sewer installation"],
    images: [
      {
        src: "/images/site/wet-ground-excavation.jpg",
        alt: "Pamar excavators working in wet ground",
      },
    ],
  },
];

export async function getProjects(): Promise<Project[]> {
  // Site order (as published), which the client can reorder here.
  return [...projects];
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
