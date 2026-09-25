/**
 * Service lines / capabilities.
 *
 * PLACEHOLDER content: the real service list comes from client discovery (SUMMIT-228).
 * Accessors are async so this module can be swapped for a CMS query (SUMMIT-237)
 * without touching the pages.
 */
export type Service = {
  slug: string;
  name: string;
  /** One-sentence summary for cards and meta descriptions. */
  summary: string;
  /** Body paragraphs for the detail page. */
  description: string[];
  capabilities: string[];
  equipment: string[];
  /** Photo for the detail page. Omit to render a placeholder. */
  image?: { src: string; alt: string };
};

const services: Service[] = [
  {
    slug: "underground-utilities",
    image: {
      src: "/images/site/sewer-shaft-pipe.jpg",
      alt: "Concrete sewer pipe being set inside a lined shaft",
    },
    name: "Underground Utilities",
    summary: "Sanitary sewer, storm sewer, and water main installation, replacement, and repair.",
    description: [
      "Our underground utility crews install and rehabilitate the pipe networks communities depend on, from new subdivisions to deep interceptor sewers under busy corridors.",
      "We coordinate closely with owners, engineers, and inspectors to keep services running and traffic moving while work is underway.",
    ],
    capabilities: [
      "Sanitary and storm sewer installation",
      "Water main installation and replacement",
      "Manholes, structures, and service connections",
      "Deep excavation and trench safety systems",
      "Bypass pumping and dewatering",
    ],
    equipment: ["Hydraulic excavators", "Trench boxes and shoring", "Pumps and dewatering systems"],
  },
  {
    slug: "excavation-earthwork",
    image: {
      src: "/images/site/mass-grading.jpg",
      alt: "Two Pamar excavators mass grading a site",
    },
    name: "Excavation & Earthwork",
    summary: "Mass excavation, grading, and soil management for projects of every size.",
    description: [
      "From mass cut-and-fill to precise finish grading, we move earth efficiently and to spec.",
      "We plan haul routes, soil balance, and erosion control up front so the site is ready for the next trade on schedule.",
    ],
    capabilities: [
      "Mass excavation and grading",
      "Cut and fill balancing",
      "Soil stabilization and undercutting",
      "Soil erosion and sedimentation control",
    ],
    equipment: ["Dozers", "Excavators", "Articulated haul trucks", "GPS machine control"],
  },
  {
    slug: "site-development",
    image: {
      src: "/images/site/excavator-loading-truck.jpg",
      alt: "Pamar excavator loading a haul truck on a development site",
    },
    name: "Site Development",
    summary: "Complete site packages that take raw land to a building-ready pad.",
    description: [
      "We self-perform the full site package (clearing, utilities, grading, and paving prep) to give owners one accountable partner.",
    ],
    capabilities: [
      "Clearing and grubbing",
      "Site utilities",
      "Detention and retention basins",
      "Building pads and parking lot prep",
    ],
    equipment: ["Excavators", "Dozers", "Compaction equipment"],
  },
  {
    slug: "roadway-infrastructure",
    image: {
      src: "/images/site/excavators-grading.jpg",
      alt: "Pamar excavators grading along a roadway",
    },
    name: "Roadway & Infrastructure",
    summary: "Road reconstruction, culverts, and public infrastructure improvements.",
    description: [
      "We deliver public works projects for municipal, county, and state owners, meeting their specifications and documentation requirements.",
    ],
    capabilities: [
      "Road reconstruction and widening",
      "Culvert and bridge-approach work",
      "Curb, gutter, and drainage",
      "Maintenance of traffic",
    ],
    equipment: ["Excavators", "Graders", "Rollers", "Traffic control devices"],
  },
  {
    slug: "demolition",
    image: {
      src: "/images/site/wet-ground-excavation.jpg",
      alt: "Pamar excavators working in wet ground",
    },
    name: "Demolition",
    summary: "Safe, efficient structure and pavement removal with responsible disposal.",
    description: [
      "Our demolition work clears the way for new construction, with material recycling wherever possible.",
    ],
    capabilities: [
      "Structure demolition",
      "Pavement and foundation removal",
      "Material recycling and disposal",
    ],
    equipment: ["Excavators with demolition attachments", "Loaders", "Haul trucks"],
  },
  {
    slug: "emergency-response",
    image: {
      src: "/images/site/crew-at-trench.jpg",
      alt: "Pamar crew and excavator at an open utility trench",
    },
    name: "Emergency Response & Repair",
    summary: "Rapid-response crews for water main breaks, sewer collapses, and urgent repairs.",
    description: [
      "When infrastructure fails, we mobilize crews and equipment quickly to restore service and make the site safe.",
    ],
    capabilities: [
      "Water main break repair",
      "Sewer collapse repair",
      "Sinkhole and washout repair",
    ],
    equipment: ["On-call crews", "Excavators", "Pumps", "Shoring"],
  },
];

export async function getServices(): Promise<Service[]> {
  return services;
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  return services.find((service) => service.slug === slug);
}
