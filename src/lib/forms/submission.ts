import { z } from "zod";
import { sendEmail, type SendEmail } from "@/lib/email";
import { type FormState, textValues } from "./form-state";
import { isHoneypotFilled, verifyTurnstile } from "./spam";

/** Side effects a submission handler needs; injectable for tests. */
export type SubmissionDeps = {
  sendEmail: SendEmail;
  verifyHuman: (formData: FormData) => Promise<boolean>;
};

export const defaultDeps: SubmissionDeps = {
  sendEmail,
  verifyHuman: (formData) => verifyTurnstile(formData),
};

export const GENERIC_ERROR =
  "Something went wrong sending your submission. Please try again, or contact us by phone or email.";

/**
 * Shared spam gate. Returns a FormState to short-circuit with, or null to continue.
 * Honeypot hits get a fake success so bots learn nothing.
 */
export async function spamGate(
  formData: FormData,
  deps: SubmissionDeps,
  successMessage: string,
): Promise<FormState | null> {
  if (isHoneypotFilled(formData)) return { status: "success", message: successMessage };
  if (!(await deps.verifyHuman(formData))) {
    return {
      status: "error",
      message: "We couldn’t verify that you’re human. Please try again.",
      values: textValues(formData),
    };
  }
  return null;
}

export function invalidState(error: z.ZodError, formData: FormData): FormState {
  return {
    status: "error",
    message: "Please correct the highlighted fields.",
    fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[]>,
    values: textValues(formData),
  };
}

/** Read a text field; missing fields become undefined so zod optional() applies. */
export function text(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" ? value : undefined;
}

// Reusable field schemas.
export const requiredText = (label: string, max = 200) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

export const optionalText = (max = 200) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer.`)
    .optional()
    .transform((v) => (v ? v : undefined));

export const emailField = z
  .string({ error: "Email is required." })
  .trim()
  .pipe(z.email("Enter a valid email address."));

export const phoneField = (required: boolean) => {
  const phone = z
    .string()
    .trim()
    .regex(/^[0-9()+.\-\s]{7,20}$/, "Enter a valid phone number.");
  return required
    ? z.string({ error: "Phone is required." }).trim().min(1, "Phone is required.").pipe(phone)
    : z
        .string()
        .trim()
        .optional()
        .transform((v) => (v ? v : undefined))
        .pipe(phone.optional());
};
