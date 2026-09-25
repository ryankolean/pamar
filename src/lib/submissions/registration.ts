import { z } from "zod";
import { trades } from "@/content/trades";
import { formatFields, recipients, type EmailAttachment } from "@/lib/email";
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
import { site } from "@/lib/site";
import { bondingCapacities, businessCertifications } from "./registration-options";

export const registrationSchema = z.object({
  companyName: requiredText("Company name", 160),
  contactName: requiredText("Contact name", 120),
  contactTitle: optionalText(120),
  email: emailField,
  phone: phoneField(true),
  companyWebsite: optionalText(200),
  street: requiredText("Street address", 200),
  city: requiredText("City", 100),
  state: requiredText("State", 30),
  zip: z
    .string({ error: "ZIP code is required." })
    .trim()
    .regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code."),
  trades: z.array(z.enum(trades)).min(1, "Choose at least one trade."),
  serviceArea: requiredText("Service area", 300),
  yearsInBusiness: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(
      z
        .string()
        .regex(/^\d{1,3}$/, "Enter whole years.")
        .transform(Number)
        .optional(),
    ),
  certifications: z.array(z.enum(businessCertifications)).default([]),
  bonding: z.enum(bondingCapacities, { error: "Choose your bonding capacity." }),
  insured: z.literal("yes", {
    error: "Please confirm you carry general liability and workers’ compensation insurance.",
  }),
  notes: optionalText(3000),
});

export type Registration = z.infer<typeof registrationSchema>;

const SUCCESS = "Thanks for registering! Our estimating team will review your information.";

const documentFields = [
  { name: "coi", label: "Certificate of insurance", prefix: "COI" },
  { name: "w9", label: "W-9", prefix: "W9" },
] as const;

export async function handleRegistrationSubmission(
  formData: FormData,
  deps: SubmissionDeps = defaultDeps,
): Promise<FormState> {
  const blocked = await spamGate(formData, deps, SUCCESS);
  if (blocked) return blocked;

  const parsed = registrationSchema.safeParse({
    companyName: text(formData, "companyName"),
    contactName: text(formData, "contactName"),
    contactTitle: text(formData, "contactTitle"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    companyWebsite: text(formData, "companyWebsite"),
    street: text(formData, "street"),
    city: text(formData, "city"),
    state: text(formData, "state"),
    zip: text(formData, "zip"),
    trades: formData.getAll("trades").filter((v) => typeof v === "string"),
    serviceArea: text(formData, "serviceArea"),
    yearsInBusiness: text(formData, "yearsInBusiness"),
    certifications: formData.getAll("certifications").filter((v) => typeof v === "string"),
    bonding: text(formData, "bonding"),
    insured: text(formData, "insured"),
    notes: text(formData, "notes"),
  });

  const uploads = await Promise.all(
    documentFields.map(async (field) => {
      const file = getUpload(formData, field.name);
      const error = await validateUpload(file, {
        ...uploadLimits.companyDocument,
        required: false,
        label: field.label,
      });
      return { ...field, file, error };
    }),
  );
  const uploadErrors = Object.fromEntries(
    uploads.filter((u) => u.error).map((u) => [u.name, [u.error as string]]),
  );

  if (!parsed.success || Object.keys(uploadErrors).length > 0) {
    const state: FormState = parsed.success
      ? {
          status: "error",
          message: "Please correct the highlighted fields.",
          values: textValues(formData),
        }
      : invalidState(parsed.error, formData);
    state.fieldErrors = { ...state.fieldErrors, ...uploadErrors };
    return state;
  }

  const data = parsed.data;
  const companySlug = data.companyName.replace(/\s+/g, "_");
  const attachments: EmailAttachment[] = await Promise.all(
    uploads
      .filter((u) => u.file)
      .map((u) => toAttachment(u.file as File, `${companySlug}-${u.prefix}`)),
  );

  try {
    await deps.record?.({ type: "registration", data, attachments, submittedAt: new Date() });
    await deps.sendEmail({
      to: recipients.estimating,
      replyTo: data.email,
      subject: `Subcontractor registration: ${data.companyName}`,
      text: formatFields([
        ["Company", data.companyName],
        ["Contact", [data.contactName, data.contactTitle].filter(Boolean).join(", ")],
        ["Email", data.email],
        ["Phone", data.phone],
        ["Website", data.companyWebsite],
        ["Address", `${data.street}\n${data.city}, ${data.state} ${data.zip}`],
        ["Trades", data.trades.join(", ")],
        ["Service area", data.serviceArea],
        ["Years in business", data.yearsInBusiness?.toString()],
        ["Certifications", data.certifications.join(", ") || "None listed"],
        ["Bonding capacity", data.bonding],
        ["Insurance", "Confirmed general liability and workers’ compensation"],
        [
          "Documents",
          attachments.length ? attachments.map((a) => a.filename).join(", ") : "None uploaded",
        ],
        ["Notes", data.notes],
      ]),
      attachments,
    });
  } catch (error) {
    console.error("Subcontractor registration failed", error);
    return { status: "error", message: GENERIC_ERROR, values: textValues(formData) };
  }

  try {
    await deps.sendEmail({
      to: data.email,
      subject: `Registration received – ${site.name}`,
      text: [
        `Hi ${data.contactName},`,
        `Thanks for registering ${data.companyName} as a subcontractor with ${site.name}. Our estimating team will review your information and reach out about opportunities that match your trades.`,
        `You can see current bid packages anytime at ${site.url}/subcontractors/opportunities.`,
        `— ${site.name} Estimating`,
      ].join("\n\n"),
    });
  } catch (error) {
    console.error("Registration confirmation email failed", error);
  }

  return { status: "success", message: SUCCESS };
}
