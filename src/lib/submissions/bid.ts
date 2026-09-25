import { z } from "zod";
import { getOpportunityBySlug, type Opportunity } from "@/content/opportunities";
import { formatFields, recipients } from "@/lib/email";
import { getUpload, toAttachment, uploadLimits, validateUpload } from "@/lib/forms/files";
import { type FormState, textValues } from "@/lib/forms/form-state";
import {
  defaultDeps,
  emailField,
  GENERIC_ERROR,
  invalidState,
  optionalText,
  phoneField,
  requiredText,
  spamGate,
  type SubmissionDeps,
  text,
} from "@/lib/forms/submission";
import { formatDateTime, isAcceptingSubmissions } from "@/lib/opportunities";
import { site } from "@/lib/site";

export type BidDeps = SubmissionDeps & {
  now: () => Date;
  getOpportunity: (slug: string) => Promise<Opportunity | undefined>;
};

const defaultBidDeps: BidDeps = {
  ...defaultDeps,
  now: () => new Date(),
  getOpportunity: getOpportunityBySlug,
};

/** Parse a user-entered dollar amount like "$1,250,000.50" into a number. */
export function parseAmount(input: string): number | null {
  const cleaned = input
    .trim()
    .replace(/^\$\s*/, "")
    .replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return value > 0 ? value : null;
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function bidSchema(opportunity: Opportunity) {
  return z
    .object({
      submissionType: z.enum(["intent", "bid"], { error: "Choose intent to bid or submit bid." }),
      companyName: requiredText("Company name", 160),
      contactName: requiredText("Contact name", 120),
      email: emailField,
      phone: phoneField(true),
      trades: z
        .array(z.enum(opportunity.trades as [string, ...string[]]))
        .min(1, "Choose at least one trade you’re pricing."),
      bidAmount: z.string().trim().optional(),
      notes: optionalText(3000),
    })
    .superRefine((data, ctx) => {
      if (data.submissionType !== "bid") return;
      if (!data.bidAmount) {
        ctx.addIssue({ code: "custom", path: ["bidAmount"], message: "Bid amount is required." });
      } else if (parseAmount(data.bidAmount) === null) {
        ctx.addIssue({
          code: "custom",
          path: ["bidAmount"],
          message: "Enter a dollar amount, e.g. 125,000.",
        });
      }
    });
}

const CLOSED_MESSAGE =
  "This package is no longer accepting submissions. The bid due date has passed.";

export async function handleBidSubmission(
  formData: FormData,
  deps: BidDeps = defaultBidDeps,
): Promise<FormState> {
  const opportunity = await deps.getOpportunity(text(formData, "opportunity") ?? "");
  if (!opportunity) {
    return { status: "error", message: "We couldn’t find that bid package." };
  }

  const blocked = await spamGate(formData, deps, "Thanks! Your submission was received.");
  if (blocked) return blocked;

  // Enforced on the server: a stale page can't submit after the deadline.
  if (!isAcceptingSubmissions(opportunity, deps.now())) {
    return { status: "error", message: CLOSED_MESSAGE, values: textValues(formData) };
  }

  const parsed = bidSchema(opportunity).safeParse({
    submissionType: text(formData, "submissionType"),
    companyName: text(formData, "companyName"),
    contactName: text(formData, "contactName"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    trades: formData.getAll("trades").filter((v) => typeof v === "string"),
    bidAmount: text(formData, "bidAmount"),
    notes: text(formData, "notes"),
  });

  const isBid = parsed.success
    ? parsed.data.submissionType === "bid"
    : text(formData, "submissionType") === "bid";
  const document = getUpload(formData, "bidDocument");
  const documentError = await validateUpload(document, {
    ...uploadLimits.bidDocument,
    required: isBid,
    label: "Bid document",
  });

  if (!parsed.success || documentError) {
    const state: FormState = parsed.success
      ? {
          status: "error",
          message: "Please correct the highlighted fields.",
          values: textValues(formData),
        }
      : invalidState(parsed.error, formData);
    if (documentError) state.fieldErrors = { ...state.fieldErrors, bidDocument: [documentError] };
    return state;
  }

  const data = parsed.data;
  const amount = isBid ? parseAmount(data.bidAmount ?? "") : null;
  const kind = isBid ? "Bid" : "Intent to bid";
  const attachments = document
    ? [await toAttachment(document, `${data.companyName.replace(/\s+/g, "_")}-Bid`)]
    : [];

  try {
    await deps.sendEmail({
      to: recipients.estimating,
      replyTo: data.email,
      subject: `${kind}: ${opportunity.projectName} – ${data.companyName}`,
      text: formatFields([
        ["Submission", kind],
        [
          "Package",
          `${opportunity.projectName} (${site.url}/subcontractors/opportunities/${opportunity.slug})`,
        ],
        ["Bids due", formatDateTime(opportunity.bidDueAt)],
        ["Company", data.companyName],
        ["Contact", data.contactName],
        ["Email", data.email],
        ["Phone", data.phone],
        ["Trades", data.trades.join(", ")],
        ["Bid amount", amount !== null ? usd.format(amount) : undefined],
        ["Notes", data.notes],
      ]),
      attachments,
    });
  } catch (error) {
    console.error("Bid submission failed", error);
    return { status: "error", message: GENERIC_ERROR, values: textValues(formData) };
  }

  const successMessage = isBid
    ? `Your bid for ${opportunity.projectName} was received. We’ve emailed you a confirmation.`
    : `Thanks! We’ve noted your intent to bid on ${opportunity.projectName}. Remember to submit your price before ${formatDateTime(opportunity.bidDueAt)}.`;

  try {
    await deps.sendEmail({
      to: data.email,
      subject: `${kind} received: ${opportunity.projectName}`,
      text: [
        `Hi ${data.contactName},`,
        successMessage,
        `Questions? Contact ${opportunity.contact.name} at ${opportunity.contact.email}.`,
        `— ${site.name} Estimating`,
      ].join("\n\n"),
    });
  } catch (error) {
    console.error("Bid confirmation email failed", error);
  }

  return { status: "success", message: successMessage };
}
