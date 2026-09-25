/**
 * Frequently asked questions, written as direct answers so search engines and AI assistants
 * (Google AI Overviews, ChatGPT, Perplexity) can quote them. PLACEHOLDER wording: confirm
 * details with Pamar (SUMMIT-228).
 */
export type Faq = { question: string; answer: string };

export const serviceFaqs: Record<string, Faq[]> = {
  "underground-utilities": [
    {
      question: "What underground utility work does Pamar Enterprises handle?",
      answer:
        "Sanitary and storm sewer, water main installation and replacement, manholes and structures, and service connections, along with the excavation, trench shoring, and dewatering that go with them.",
    },
    {
      question: "Can utility work happen while roads and businesses stay open?",
      answer:
        "Yes. Work is staged with maintenance of traffic so residents, businesses, and emergency vehicles keep access throughout construction.",
    },
    {
      question: "Does Pamar work for municipalities or private developers?",
      answer:
        "Both. Public projects are built to owner and engineer specifications, and private developments get complete site utility packages.",
    },
  ],
  "excavation-earthwork": [
    {
      question: "What is mass excavation?",
      answer:
        "Moving large volumes of soil to reach design grades for a site, road, or structure, usually balancing cut and fill on site to limit hauling.",
    },
    {
      question: "How are poor soils handled?",
      answer:
        "Unsuitable soils are either undercut and replaced or stabilized in place. The right approach depends on the geotechnical report, budget, and schedule.",
    },
  ],
  "site-development": [
    {
      question: "What does a site development package include?",
      answer:
        "Typically clearing, erosion control, site utilities, grading, detention basins, and preparation of building pads and pavement areas.",
    },
    {
      question: "Why hire one contractor for the whole site package?",
      answer:
        "One accountable team sequences utilities, grading, and paving preparation together, which cuts handoffs and schedule gaps between trades.",
    },
  ],
  "roadway-infrastructure": [
    {
      question: "Do roads stay open during reconstruction?",
      answer:
        "Wherever possible. Lane-by-lane phasing with flaggers and traffic control keeps local traffic, deliveries, and school routes moving.",
    },
    {
      question: "What kinds of owners are roadway projects built for?",
      answer:
        "Municipal, county, and state agencies, including the documentation and inspection requirements that come with public work.",
    },
  ],
  demolition: [
    {
      question: "What happens to materials from a demolition?",
      answer:
        "Concrete, asphalt, and metals are separated and recycled wherever possible, and the remaining debris is disposed of responsibly.",
    },
    {
      question: "Can neighboring businesses stay open during demolition?",
      answer: "Yes. Dust, noise, and access controls are planned before work starts.",
    },
  ],
  "emergency-response": [
    {
      question: "What counts as an infrastructure emergency?",
      answer:
        "Water main breaks, sewer collapses, sinkholes, and washouts that threaten service, property, or public safety.",
    },
    {
      question: "How do I reach Pamar about an emergency repair?",
      answer:
        "Call the main office line. The team coordinates crews, bypass pumping, and repairs to make the site safe and restore service.",
    },
  ],
};

export const careersFaqs: Faq[] = [
  {
    question: "How do I apply for a job at Pamar Enterprises?",
    answer:
      "Choose an opening on the careers page and complete the online application. It works on any phone, takes a few minutes, and lets you attach a resume.",
  },
  {
    question: "Do I need construction experience to apply?",
    answer:
      "Not for every role. Positions like General Laborer are open to people starting out; each job page lists its requirements.",
  },
  {
    question: "What if I don't see an opening that fits?",
    answer:
      "Send a general application. HR keeps it on file and reaches out when a matching position opens.",
  },
];

export const subcontractorFaqs: Faq[] = [
  {
    question: "How do subcontractors get on Pamar's bidder list?",
    answer:
      "Register your company online with your trades, service area, certifications, and insurance. Estimating uses that information to invite you to matching packages.",
  },
  {
    question: "Where are Pamar's subcontract bid opportunities posted?",
    answer:
      "On the bid opportunities board, with scope, trades, bid due date, pre-bid meeting details, and documents. Packages close automatically at their due time.",
  },
  {
    question: "Does Pamar work with DBE, MBE, and WBE firms?",
    answer:
      "Yes. Include your certifications when you register so estimating can reach out on projects with participation goals.",
  },
];

export async function getServiceFaqs(slug: string): Promise<Faq[]> {
  return serviceFaqs[slug] ?? [];
}
