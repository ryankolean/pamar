import type { Trade } from "./trades";

/**
 * Subcontract bid opportunities on contracts Pamar has won.
 *
 * PLACEHOLDER sample packages that show the layout. Estimating will post real packages through
 * the CMS (SUMMIT-237). Accessors are async so the source can change.
 */
export type OpportunityDocument = {
  name: string;
  /** Download URL. Omit when documents are available on request only. */
  url?: string;
};

export type Opportunity = {
  slug: string;
  projectName: string;
  owner: string;
  location: string;
  trades: Trade[];
  summary: string;
  description: string[];
  /** ISO timestamp with offset, e.g. 2026-10-15T14:00:00-04:00 */
  bidDueAt: string;
  preBid?: { at: string; location: string; mandatory: boolean };
  /** Set once the package has been awarded; otherwise status comes from the due date. */
  awarded?: boolean;
  /** e.g. "DBE participation goal: 10%" */
  participationGoal?: string;
  documents: OpportunityDocument[];
  contact: { name: string; email: string; phone?: string };
};

const estimating = { name: "Estimating Department", email: "estimating@pamarenterprises.com" };

const opportunities: Opportunity[] = [
  {
    slug: "downtown-streetscape-restoration",
    projectName: "Downtown Streetscape – Phase 2",
    owner: "Municipal client",
    location: "Downtown district",
    trades: ["Concrete Flatwork & Curb", "Landscaping & Restoration", "Pavement Markings"],
    summary: "Sidewalk, curb, and restoration packages following underground utility replacement.",
    description: [
      "Pamar is the prime contractor for Phase 2 of the downtown streetscape project. We are requesting quotes for surface restoration after the underground work is complete.",
      "Work is phased block by block so businesses stay accessible. Night work may be required at intersections.",
    ],
    bidDueAt: "2026-10-16T14:00:00-04:00",
    preBid: { at: "2026-10-06T10:00:00-04:00", location: "Project field office", mandatory: false },
    participationGoal: "DBE participation goal: 10%",
    documents: [
      { name: "Plans – restoration sheets" },
      { name: "Specifications – Division 32" },
      { name: "Bid form" },
    ],
    contact: estimating,
  },
  {
    slug: "interceptor-rehab-dewatering",
    projectName: "Interceptor Rehabilitation",
    owner: "Regional sewer authority",
    location: "Regional interceptor corridor",
    trades: ["Dewatering", "Traffic Control"],
    summary:
      "Dewatering design/installation and maintenance of traffic for deep sewer rehabilitation.",
    description: [
      "We are seeking a qualified dewatering subcontractor for a well-point or deep-well system at multiple access shafts, along with traffic control for lane closures along the corridor.",
    ],
    bidDueAt: "2026-10-09T12:00:00-04:00",
    preBid: { at: "2026-10-01T09:00:00-04:00", location: "Owner’s offices", mandatory: true },
    documents: [{ name: "Geotechnical report" }, { name: "Traffic control plan" }],
    contact: estimating,
  },
  {
    slug: "industrial-park-paving",
    projectName: "Industrial Park – Site Paving",
    owner: "Private developer",
    location: "Industrial corridor",
    trades: ["Asphalt Paving", "Pavement Markings", "Fencing & Guardrail"],
    summary: "Truck court and parking lot paving, striping, and perimeter fencing.",
    description: [
      "Paving of truck courts, drive aisles, and employee parking following Pamar’s site package.",
    ],
    bidDueAt: "2026-10-30T14:00:00-04:00",
    documents: [{ name: "Site plan" }, { name: "Paving details" }],
    contact: estimating,
  },
  {
    slug: "water-main-program-trucking",
    projectName: "Water Main Replacement Program – Year 3",
    owner: "Municipal water utility",
    location: "Residential neighborhoods",
    trades: ["Trucking & Hauling", "Materials Supply"],
    summary: "Spoils hauling and aggregate supply for the third year of a water main program.",
    description: ["Hauling of excavated spoils and supply of bedding and backfill aggregates."],
    bidDueAt: "2026-09-10T14:00:00-04:00",
    documents: [{ name: "Quantity sheet" }],
    contact: estimating,
  },
  {
    slug: "county-road-surveying",
    projectName: "County Road Reconstruction",
    owner: "County road agency",
    location: "County road",
    trades: ["Surveying & Layout"],
    summary: "Construction staking and as-built survey.",
    description: ["Construction layout and final as-built survey for a two-mile reconstruction."],
    bidDueAt: "2026-08-20T14:00:00-04:00",
    awarded: true,
    documents: [],
    contact: estimating,
  },
];

export async function getOpportunities(): Promise<Opportunity[]> {
  return opportunities;
}

export async function getOpportunityBySlug(slug: string): Promise<Opportunity | undefined> {
  return opportunities.find((o) => o.slug === slug);
}
