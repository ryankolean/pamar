/** Result returned by every form server action, consumed by useActionState. */
export type FormState = {
  status: "idle" | "error" | "success";
  /** Form-level message (success confirmation or a general error). */
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  /** Submitted text values, echoed back so the form keeps them after an error. */
  values?: Record<string, string | string[]>;
};

export const initialFormState: FormState = { status: "idle" };

/** Collect text values from FormData (files and internal fields excluded). */
export function textValues(formData: FormData): Record<string, string | string[]> {
  const values: Record<string, string | string[]> = {};
  for (const key of new Set(formData.keys())) {
    if (key.startsWith("$ACTION") || key === "cf-turnstile-response") continue;
    const entries = formData.getAll(key).filter((v): v is string => typeof v === "string");
    if (entries.length === 0) continue;
    values[key] = entries.length === 1 ? entries[0] : entries;
  }
  return values;
}
