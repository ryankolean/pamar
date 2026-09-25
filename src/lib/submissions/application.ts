import { z } from "zod";
import { getJobBySlug } from "@/content/jobs";
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
import { site } from "@/lib/site";
import { certifications, experienceLevels, GENERAL_POSITION } from "./application-options";

export const applicationSchema = z.object({
  position: requiredText("Position", 120),
  name: requiredText("Name", 120),
  email: emailField,
  phone: phoneField(true),
  experience: z.enum(experienceLevels, { error: "Choose your years of experience." }),
  certifications: z.array(z.enum(certifications)).default([]),
  message: optionalText(3000),
  consent: z.literal("yes", { error: "Please confirm your information is accurate." }),
});

export type Application = z.infer<typeof applicationSchema>;

const SUCCESS = "Thanks for applying! Our HR team will review your application and be in touch.";

/** Resolve the position the applicant chose into a display title (or null if unknown). */
async function positionTitle(position: string): Promise<string | null> {
  if (position === GENERAL_POSITION) return "General application";
  return (await getJobBySlug(position))?.title ?? null;
}

export async function handleApplicationSubmission(
  formData: FormData,
  deps: SubmissionDeps = defaultDeps,
): Promise<FormState> {
  const blocked = await spamGate(formData, deps, SUCCESS);
  if (blocked) return blocked;

  const parsed = applicationSchema.safeParse({
    position: text(formData, "position"),
    name: text(formData, "name"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    experience: text(formData, "experience"),
    certifications: formData.getAll("certifications").filter((v) => typeof v === "string"),
    message: text(formData, "message"),
    consent: text(formData, "consent"),
  });

  const resume = getUpload(formData, "resume");
  const resumeError = await validateUpload(resume, {
    ...uploadLimits.resume,
    required: true,
    label: "Resume",
  });
  const title = parsed.success ? await positionTitle(parsed.data.position) : null;

  if (!parsed.success || resumeError || !title) {
    const state: FormState = parsed.success
      ? {
          status: "error",
          message: "Please correct the highlighted fields.",
          fieldErrors: {},
          values: textValues(formData),
        }
      : invalidState(parsed.error, formData);
    if (resumeError) state.fieldErrors = { ...state.fieldErrors, resume: [resumeError] };
    if (parsed.success && !title) {
      state.fieldErrors = { ...state.fieldErrors, position: ["Choose a position."] };
    }
    return state;
  }

  const data = parsed.data;
  try {
    await deps.sendEmail({
      to: recipients.hr,
      replyTo: data.email,
      subject: `Application: ${title} – ${data.name}`,
      text: formatFields([
        ["Position", title],
        ["Name", data.name],
        ["Email", data.email],
        ["Phone", data.phone],
        ["Experience", data.experience],
        ["Certifications", data.certifications.join(", ") || "None listed"],
        ["Message", data.message],
      ]),
      attachments: [await toAttachment(resume!, data.name.replace(/\s+/g, "_"))],
    });
  } catch (error) {
    console.error("Application submission failed", error);
    return { status: "error", message: GENERIC_ERROR, values: textValues(formData) };
  }

  // The confirmation to the applicant is best-effort: HR already has the application.
  try {
    await deps.sendEmail({
      to: data.email,
      subject: `We received your application – ${site.name}`,
      text: [
        `Hi ${data.name},`,
        `Thanks for applying for ${title === "General application" ? "a position" : `the ${title} position`} at ${site.name}. Our HR team will review your application and contact you if there’s a fit.`,
        `If you have questions in the meantime, call us at ${site.contact.phone}.`,
        `— The ${site.name} team`,
      ].join("\n\n"),
    });
  } catch (error) {
    console.error("Applicant confirmation email failed", error);
  }

  return { status: "success", message: SUCCESS };
}
