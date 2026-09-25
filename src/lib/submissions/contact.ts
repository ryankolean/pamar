import { z } from "zod";
import { formatFields, recipients } from "@/lib/email";
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
import { contactTopics } from "./contact-topics";

export const contactSchema = z.object({
  name: requiredText("Name", 120),
  email: emailField,
  phone: phoneField(false),
  company: optionalText(160),
  topic: z.enum(contactTopics, { error: "Choose a topic." }),
  message: requiredText("Message", 5000),
});

export type ContactSubmission = z.infer<typeof contactSchema>;

const SUCCESS = "Thanks for reaching out. Our team will get back to you shortly.";

export async function handleContactSubmission(
  formData: FormData,
  deps: SubmissionDeps = defaultDeps,
): Promise<FormState> {
  const blocked = await spamGate(formData, deps, SUCCESS);
  if (blocked) return blocked;

  const parsed = contactSchema.safeParse({
    name: text(formData, "name"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    company: text(formData, "company"),
    topic: text(formData, "topic"),
    message: text(formData, "message"),
  });
  if (!parsed.success) return invalidState(parsed.error, formData);

  const data = parsed.data;
  try {
    await deps.sendEmail({
      to: recipients.contact,
      replyTo: data.email,
      subject: `Website contact: ${data.topic} from ${data.name}`,
      text: formatFields([
        ["Name", data.name],
        ["Email", data.email],
        ["Phone", data.phone],
        ["Company", data.company],
        ["Topic", data.topic],
        ["Message", data.message],
      ]),
    });
  } catch (error) {
    console.error("Contact submission failed", error);
    return { status: "error", message: GENERIC_ERROR, values: textValues(formData) };
  }

  return { status: "success", message: SUCCESS };
}
