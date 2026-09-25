"use server";

import type { FormState } from "@/lib/forms/form-state";
import { handleContactSubmission } from "@/lib/submissions/contact";

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  return handleContactSubmission(formData);
}
