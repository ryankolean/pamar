/**
 * Job postings.
 *
 * PLACEHOLDER postings that show the layout. HR replaces these with real openings, and
 * the CMS (SUMMIT-237) will eventually manage them. Accessors are async so the source can change.
 */
export const departments = [
  "Field Operations",
  "Equipment & Trucking",
  "Project Management",
  "Estimating",
  "Office & Administration",
] as const;

export const employmentTypes = ["Full-time", "Seasonal", "Part-time", "Internship"] as const;

export type Department = (typeof departments)[number];
export type EmploymentType = (typeof employmentTypes)[number];

export type Job = {
  slug: string;
  title: string;
  department: Department;
  location: string;
  employmentType: EmploymentType;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  preferred?: string[];
  pay?: string;
  /** ISO date (YYYY-MM-DD). */
  postedAt: string;
};

const jobs: Job[] = [
  {
    slug: "heavy-equipment-operator",
    title: "Heavy Equipment Operator",
    department: "Equipment & Trucking",
    location: "Field – regional job sites",
    employmentType: "Full-time",
    summary:
      "Operate excavators, dozers, and loaders on underground utility and site development projects.",
    responsibilities: [
      "Operate excavators, dozers, loaders, and other heavy equipment safely and productively",
      "Perform daily equipment inspections and basic maintenance",
      "Work closely with pipe crews and foremen to meet grade and schedule",
      "Follow trench safety and site safety procedures",
    ],
    requirements: [
      "2+ years of heavy equipment operating experience",
      "Valid driver’s license and reliable transportation",
      "Ability to work outdoors in all weather conditions",
    ],
    preferred: ["GPS machine control experience", "CDL Class A", "OSHA 10"],
    pay: "Competitive hourly pay based on experience",
    postedAt: "2026-09-15",
  },
  {
    slug: "pipe-layer",
    title: "Pipe Layer",
    department: "Field Operations",
    location: "Field – regional job sites",
    employmentType: "Full-time",
    summary:
      "Install sanitary, storm, and water main pipe to line and grade as part of an underground crew.",
    responsibilities: [
      "Set pipe, structures, and fittings to line and grade",
      "Install and remove trench boxes and shoring",
      "Make service connections and tap water mains",
      "Keep the work area clean, organized, and safe",
    ],
    requirements: [
      "1+ year of underground utility experience",
      "Able to read grade stakes and use a laser",
      "Able to lift 50+ lbs and work in trenches",
    ],
    preferred: ["OSHA 10", "Competent-person training"],
    postedAt: "2026-09-10",
  },
  {
    slug: "general-laborer-seasonal",
    title: "General Laborer",
    department: "Field Operations",
    location: "Field – regional job sites",
    employmentType: "Seasonal",
    summary:
      "Support field crews with site prep, restoration, traffic control, and material handling.",
    responsibilities: [
      "Assist pipe and grading crews",
      "Set up and maintain traffic control devices",
      "Perform restoration, including topsoil, seed, and sod",
      "Handle materials and keep the site clean",
    ],
    requirements: ["Reliable, safety-minded, and willing to learn", "Able to lift 50+ lbs"],
    preferred: ["Flagger certification"],
    pay: "Hourly, with overtime available",
    postedAt: "2026-09-01",
  },
  {
    slug: "foreman-underground-utilities",
    title: "Foreman – Underground Utilities",
    department: "Field Operations",
    location: "Field – regional job sites",
    employmentType: "Full-time",
    summary: "Lead an underground utility crew to deliver safe, high-quality work on schedule.",
    responsibilities: [
      "Plan and direct daily crew activities",
      "Lead daily safety briefings and enforce safety requirements",
      "Coordinate with project managers, inspectors, and owners",
      "Track production, materials, and time",
    ],
    requirements: [
      "5+ years of underground utility experience, 2+ as a foreman or lead",
      "Competent-person trench safety training",
      "Strong communication and leadership skills",
    ],
    preferred: ["OSHA 30", "CDL Class A"],
    postedAt: "2026-08-28",
  },
  {
    slug: "project-manager",
    title: "Project Manager",
    department: "Project Management",
    location: "Main office",
    employmentType: "Full-time",
    summary: "Manage heavy civil projects from contract award through closeout.",
    responsibilities: [
      "Own project schedule, budget, and documentation",
      "Manage subcontractors, suppliers, and change orders",
      "Serve as the primary contact for owners and engineers",
      "Prepare pay applications and progress reports",
    ],
    requirements: [
      "3+ years managing heavy civil or utility projects",
      "Degree in construction management, civil engineering, or equivalent experience",
      "Proficiency with scheduling and estimating software",
    ],
    postedAt: "2026-08-20",
  },
  {
    slug: "estimator",
    title: "Estimator",
    department: "Estimating",
    location: "Main office",
    employmentType: "Full-time",
    summary: "Prepare accurate, competitive bids for public and private heavy civil work.",
    responsibilities: [
      "Complete quantity takeoffs from plans and specifications",
      "Solicit and evaluate subcontractor and supplier quotes",
      "Build bid estimates and attend bid openings",
    ],
    requirements: ["2+ years of heavy civil estimating experience", "Strong attention to detail"],
    postedAt: "2026-08-12",
  },
  {
    slug: "construction-management-intern",
    title: "Construction Management Intern",
    department: "Project Management",
    location: "Main office and job sites",
    employmentType: "Internship",
    summary: "Summer internship supporting project managers and field teams.",
    responsibilities: [
      "Support project documentation and submittals",
      "Assist with quantity tracking and daily reports",
      "Spend time in the field with foremen and crews",
    ],
    requirements: [
      "Currently pursuing a degree in construction management, civil engineering, or a related field",
    ],
    postedAt: "2026-08-05",
  },
];

export async function getJobs(): Promise<Job[]> {
  // Newest first.
  return [...jobs].sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

export async function getJobBySlug(slug: string): Promise<Job | undefined> {
  return jobs.find((job) => job.slug === slug);
}
