"use server";

import { redirect } from "next/navigation";
import type { FormState } from "@/lib/forms/form-state";
import { handleApplicationSubmission } from "@/lib/submissions/application";

export async function submitApplication(_prev: FormState, formData: FormData): Promise<FormState> {
  const state = await handleApplicationSubmission(formData);
  if (state.status === "success") redirect("/careers/apply/thanks");
  return state;
}
