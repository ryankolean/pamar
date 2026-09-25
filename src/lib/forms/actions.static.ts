/**
 * Client-side stand-ins for the form actions, used only by the static preview build
 * (see ./actions.ts). There is no server to receive the submission, so every form reports
 * success; the pages already show the preview note that nothing was sent.
 */
import type { FormState } from "@/lib/forms/form-state";

async function accepted(message: string): Promise<FormState> {
  return { status: "success", message };
}

export async function submitContact(): Promise<FormState> {
  return accepted("Thanks for reaching out. We'll get back to you shortly.");
}

export async function submitApplication(): Promise<FormState> {
  return accepted("Thanks for applying. Our team will review your application.");
}

export async function submitRegistration(): Promise<FormState> {
  return accepted("Thanks for registering. We'll be in touch about upcoming opportunities.");
}

export async function submitBid(): Promise<FormState> {
  return accepted("Thanks. Your submission was received by our estimating team.");
}
