/** Options shared by the application form (client) and its server-side validation. */
export const experienceLevels = [
  "Less than 1 year",
  "1–2 years",
  "3–5 years",
  "6–10 years",
  "More than 10 years",
] as const;

export const certifications = [
  "CDL Class A",
  "CDL Class B",
  "OSHA 10",
  "OSHA 30",
  "Competent Person – Excavation",
  "Flagger",
  "First Aid / CPR",
  "Crane Operator (NCCCO)",
] as const;

/** Position value used for a general (not job-specific) application. */
export const GENERAL_POSITION = "general";
