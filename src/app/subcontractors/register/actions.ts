"use server";

import { redirect } from "next/navigation";
import type { FormState } from "@/lib/forms/form-state";
import { handleRegistrationSubmission } from "@/lib/submissions/registration";

export async function submitRegistration(_prev: FormState, formData: FormData): Promise<FormState> {
  const state = await handleRegistrationSubmission(formData);
  if (state.status === "success") redirect("/subcontractors/register/thanks");
  return state;
}
