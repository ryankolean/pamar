/** Options shared by the bid submission form (client) and its validation. */
export const submissionTypes = [
  {
    value: "intent",
    label: "Intent to bid",
    description: "Let us know you plan to submit a price.",
  },
  { value: "bid", label: "Submit bid", description: "Send your price and bid document now." },
] as const;

export type SubmissionType = (typeof submissionTypes)[number]["value"];
