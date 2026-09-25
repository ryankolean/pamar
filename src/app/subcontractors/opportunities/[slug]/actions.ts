"use server";

import type { FormState } from "@/lib/forms/form-state";
import { handleBidSubmission } from "@/lib/submissions/bid";

export async function submitBid(_prev: FormState, formData: FormData): Promise<FormState> {
  return handleBidSubmission(formData);
}
