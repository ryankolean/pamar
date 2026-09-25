/**
 * Leadership and founders, compiled from public sources on 2026-09-25 because the live site
 * lists no people. Each entry notes where it was verified; the client should confirm titles
 * and spellings before launch, and supply headshots (initials render until then).
 *
 * Sources:
 * - Michigan corporate filings (officer of record), via corporationwiki.com and dnb.com:
 *   Rinaldo G. Acciavatti, President.
 * - Wayne County Commission agenda, 2025-07-02 (Merriman Sanitary Sewer award): Pamar contact
 *   Rinaldo G. Acciavatti.
 * - MITA board of directors notices (2013 magazine, 2019-12-10 ballot): Rinaldo Acciavatti,
 *   Pamar Enterprises, Inc., Director at Large.
 * - ABC Southeastern Michigan magazine, 2023 issue 1: "Pamar Vice President Brian Olesky"
 *   accepted the chapter's 40-year membership award. LinkedIn: Brian M. Olesky, Vice President.
 * - Michigan Governor's office press release, 2013-04-19 (appointment to the Board of
 *   Professional Engineers): Daniel Acciavatti, chief financial officer of Pamar Enterprises
 *   Inc. since 2009, former state representative (32nd District, 2003-2008), B.S.E. University
 *   of Michigan.
 * - ZoomInfo directory (single source, unverified elsewhere): Steve Brown, Vice President.
 * - Pasquale R. Acciavatti obituary (Young Colonial Chapel, February 2024) and MITA in
 *   memoriam: founded P&M Contracting in 1968 with his wife Mary Ann, Pamar Enterprises in
 *   1972; AUC president 1994; MITA honorary member 2011; survived by children including
 *   Rinaldo G. and Danny.
 */

export type Leader = {
  name: string;
  role: string;
  /** One or two sourced facts; no marketing copy. */
  bio?: string;
  /** Path under /public when the client supplies a headshot. */
  photo?: string;
  /** How well the public record supports this entry. */
  confidence: "verified" | "single-source";
};

export const leadership: Leader[] = [
  {
    name: "Rinaldo G. Acciavatti",
    role: "President",
    bio: "Second-generation owner. Served on the Michigan Infrastructure & Transportation Association board of directors.",
    confidence: "verified",
  },
  {
    name: "Brian M. Olesky",
    role: "Vice President",
    bio: "Estimating and project management background in heavy civil work; B.S., Michigan Technological University.",
    confidence: "verified",
  },
  {
    name: "Daniel J. Acciavatti",
    role: "Chief Financial Officer",
    bio: "With Pamar since 2009. Former Michigan State Representative (2003 to 2008) and a University of Michigan engineering graduate.",
    confidence: "verified",
  },
  // Steve Brown, Vice President, appears only in the ZoomInfo directory. Add him back once
  // Pamar confirms: { name: "Steve Brown", role: "Vice President", confidence: "single-source" }.
];

export const founders = {
  names: "Pasquale “Pat” and Mary Ann Acciavatti",
  story:
    "Pat and Mary Ann Acciavatti started P&M Contracting Company in 1968, cleaning up construction sites and doing grading, seeding, fencing, and pavement patching. In 1972 the company was incorporated as Pamar Enterprises, Inc. and moved into every area of construction site work. Pat led the Associated Underground Contractors as president in 1994 and was named an honorary member of the Michigan Infrastructure & Transportation Association in 2011. He passed away in February 2024; the company he and Mary Ann built stays in the family.",
};

/** Initials for the avatar shown until a headshot is supplied. */
export function initials(name: string): string {
  return name
    .replace(/[“”"]/g, "")
    .split(/\s+/)
    .filter((part) => /^[A-Z]/.test(part) && !/\.$/.test(part))
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}
