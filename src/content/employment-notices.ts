import { site } from "@/lib/site";

/**
 * Equal Employment Opportunity statement and federal employee rights notices shown on the
 * careers pages (SUMMIT-267).
 *
 * The statement is pending client approval (SUMMIT-261). "An Equal Opportunity Employer" is
 * what Pamar already publishes on its live site; the non-discrimination sentence is standard
 * wording that Pamar's HR or counsel should confirm before launch.
 */
export const eeoStatement = {
  title: "An Equal Opportunity Employer",
  body: [
    `${site.name} is an Equal Opportunity Employer.`,
    "All qualified applicants receive consideration for employment without regard to race, color, religion, sex (including pregnancy, sexual orientation, and gender identity), national origin, age, disability, genetic information, veteran status, or any other status protected by law.",
  ],
};

export type EmploymentNotice = {
  /** Link text, named after the official notice. */
  title: string;
  /** Agency that publishes the notice. */
  agency: string;
  /** Official agency page for the notice, which links the PDF in English, Spanish, and more. */
  href: string;
};

/**
 * Official federal notices. Each URL was rendered and checked on 2026-10-08 (title and PDF
 * content match the notice). Link to the agency pages, not the PDFs, because the PDF paths
 * change when a poster is revised.
 *
 * E-Verify and "Right to Work" notices are intentionally left out: Pamar has not confirmed
 * that it participates in E-Verify. Add them only once it does.
 */
export const employmentNotices: EmploymentNotice[] = [
  {
    title: "Know Your Rights: Workplace Discrimination is Illegal",
    agency: "U.S. Equal Employment Opportunity Commission",
    href: "https://www.eeoc.gov/poster",
  },
  {
    title: "Employee Rights Under the Family and Medical Leave Act",
    agency: "U.S. Department of Labor",
    href: "https://www.dol.gov/agencies/whd/posters/fmla",
  },
  {
    title: "Employee Rights Under the Employee Polygraph Protection Act",
    agency: "U.S. Department of Labor",
    href: "https://www.dol.gov/agencies/whd/posters/employee-polygraph-protection-act",
  },
];
