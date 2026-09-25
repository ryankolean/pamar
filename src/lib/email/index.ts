import { site } from "@/lib/site";

export type EmailAttachment = { filename: string; content: Buffer };

export type EmailMessage = {
  to: string | string[];
  subject: string;
  text: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
};

export type SendEmail = (message: EmailMessage) => Promise<void>;

/** Notification recipients, configurable per team. Fall back to the main inbox. */
export const recipients = {
  get contact() {
    return process.env.CONTACT_TO_EMAIL ?? site.contact.email;
  },
  get hr() {
    return process.env.HR_TO_EMAIL ?? site.contact.email;
  },
  get estimating() {
    return process.env.ESTIMATING_TO_EMAIL ?? site.contact.email;
  },
};

async function sendWithResend(apiKey: string, message: EmailMessage) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? `${site.name} <no-reply@pamarenterprises.com>`,
      to: message.to,
      subject: message.subject,
      text: message.text,
      reply_to: message.replyTo,
      attachments: message.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content.toString("base64"),
      })),
    }),
  });
  if (!response.ok) {
    throw new Error(`Email provider responded ${response.status}: ${await response.text()}`);
  }
}

/**
 * Send a transactional email.
 *
 * With RESEND_API_KEY set, mail goes through Resend. Without it, development logs the
 * message to the console, while production throws so a missing configuration surfaces
 * as a visible form error instead of silently dropping submissions.
 */
export const sendEmail: SendEmail = async (message) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) return sendWithResend(apiKey, message);

  if (process.env.NODE_ENV === "production") {
    throw new Error("Email is not configured: set RESEND_API_KEY.");
  }

  console.info("[email:dev] Not sent (RESEND_API_KEY unset)", {
    to: message.to,
    subject: message.subject,
    replyTo: message.replyTo,
    attachments: message.attachments?.map((a) => `${a.filename} (${a.content.byteLength} bytes)`),
    text: message.text,
  });
};

/** Render labeled fields as a plain-text email body. */
export function formatFields(fields: Array<[label: string, value: string | undefined]>): string {
  return fields
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([label, value]) => `${label}:\n${value}`)
    .join("\n\n");
}
