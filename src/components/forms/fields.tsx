"use client";

import Script from "next/script";
import { type ReactNode, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { buttonClasses } from "@/components/ui/button";
import { type FormState, initialFormState } from "@/lib/forms/form-state";
import { HONEYPOT_FIELD } from "@/lib/forms/spam";
import { cn } from "@/lib/cn";

type FormAction = (state: FormState, formData: FormData) => Promise<FormState>;

/**
 * useActionState plus a render key. React resets uncontrolled fields after every form
 * action, so the form is keyed per submission: it remounts with the echoed-back values
 * as defaults and nothing the user typed is lost on a validation error.
 */
export function useFormAction(action: FormAction) {
  const [{ state, key }, formAction, pending] = useActionState(
    async (prev: { state: FormState; key: number }, formData: FormData) => ({
      state: await action(prev.state, formData),
      key: prev.key + 1,
    }),
    { state: initialFormState, key: 0 },
  );
  return { state, formAction, pending, formKey: key };
}

const inputClasses =
  "w-full rounded-sm border border-ink-200 bg-white px-3 py-2.5 text-ink-900 placeholder:text-ink-400 aria-[invalid=true]:border-red-600";

function errorsFor(state: FormState, name: string) {
  return state.fieldErrors?.[name];
}

function valueFor(state: FormState, name: string): string | undefined {
  const value = state.values?.[name];
  return Array.isArray(value) ? value[0] : value;
}

function valuesFor(state: FormState, name: string): string[] {
  const value = state.values?.[name];
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

type FieldShellProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  errors?: string[];
  children: ReactNode;
  className?: string;
};

function FieldShell({ id, label, required, hint, errors, children, className }: FieldShellProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink-800">
        {label}
        {required ? (
          <span className="text-red-700"> *</span>
        ) : (
          <span className="font-normal text-ink-500"> (optional)</span>
        )}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-ink-500">
          {hint}
        </p>
      )}
      <FieldErrors id={id} errors={errors} />
    </div>
  );
}

export function FieldErrors({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={`${id}-error`} className="text-sm font-medium text-red-700">
      {errors[0]}
    </p>
  );
}

function describedBy(id: string, hint?: string, errors?: string[]) {
  return (
    [hint && `${id}-hint`, errors?.length && `${id}-error`].filter(Boolean).join(" ") || undefined
  );
}

type TextFieldProps = {
  state: FormState;
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "url";
  required?: boolean;
  hint?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric" | "decimal";
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number | "any";
  className?: string;
};

export function TextField({
  state,
  name,
  label,
  type = "text",
  required,
  hint,
  className,
  ...rest
}: TextFieldProps) {
  const id = `field-${name}`;
  const errors = errorsFor(state, name);
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      hint={hint}
      errors={errors}
      className={className}
    >
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        defaultValue={valueFor(state, name)}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy(id, hint, errors)}
        className={inputClasses}
        {...rest}
      />
    </FieldShell>
  );
}

type TextAreaProps = {
  state: FormState;
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  rows?: number;
  className?: string;
};

export function TextArea({
  state,
  name,
  label,
  required,
  hint,
  rows = 5,
  className,
}: TextAreaProps) {
  const id = `field-${name}`;
  const errors = errorsFor(state, name);
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      hint={hint}
      errors={errors}
      className={className}
    >
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        defaultValue={valueFor(state, name)}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy(id, hint, errors)}
        className={inputClasses}
      />
    </FieldShell>
  );
}

type SelectFieldProps = {
  state: FormState;
  name: string;
  label: string;
  options: readonly string[] | { value: string; label: string }[];
  required?: boolean;
  hint?: string;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
};

export function SelectField({
  state,
  name,
  label,
  options,
  required,
  hint,
  placeholder = "Select…",
  defaultValue,
  className,
}: SelectFieldProps) {
  const id = `field-${name}`;
  const errors = errorsFor(state, name);
  const normalized = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      hint={hint}
      errors={errors}
      className={className}
    >
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={valueFor(state, name) ?? defaultValue ?? ""}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy(id, hint, errors)}
        className={cn(inputClasses, "h-11")}
      >
        <option value="" disabled={required}>
          {placeholder}
        </option>
        {normalized.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

type CheckboxGroupProps = {
  state: FormState;
  name: string;
  legend: string;
  options: readonly string[];
  required?: boolean;
  hint?: string;
  defaultValues?: string[];
  columns?: 1 | 2 | 3;
  className?: string;
};

export function CheckboxGroup({
  state,
  name,
  legend,
  options,
  required,
  hint,
  defaultValues = [],
  columns = 2,
  className,
}: CheckboxGroupProps) {
  const id = `field-${name}`;
  const errors = errorsFor(state, name);
  const checked = state.values ? valuesFor(state, name) : defaultValues;
  return (
    <fieldset
      className={cn("flex flex-col gap-2", className)}
      aria-describedby={describedBy(id, hint, errors)}
      aria-invalid={errors?.length ? true : undefined}
    >
      <legend className="mb-1.5 text-sm font-semibold text-ink-800">
        {legend}
        {required ? (
          <span className="text-red-700"> *</span>
        ) : (
          <span className="font-normal text-ink-500"> (optional)</span>
        )}
      </legend>
      {hint && (
        <p id={`${id}-hint`} className="-mt-1 text-xs text-ink-500">
          {hint}
        </p>
      )}
      <div
        className={cn(
          "grid gap-x-6 gap-y-2",
          columns === 2 && "sm:grid-cols-2",
          columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {options.map((option) => (
          <label key={option} className="flex items-start gap-2.5 text-ink-800">
            <input
              type="checkbox"
              name={name}
              value={option}
              defaultChecked={checked.includes(option)}
              className="mt-1 h-4 w-4 accent-brand-600"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      <FieldErrors id={id} errors={errors} />
    </fieldset>
  );
}

type FileFieldProps = {
  state: FormState;
  name: string;
  label: string;
  accept: string;
  required?: boolean;
  hint?: string;
  className?: string;
};

export function FileField({
  state,
  name,
  label,
  accept,
  required,
  hint,
  className,
}: FileFieldProps) {
  const id = `field-${name}`;
  const errors = errorsFor(state, name);
  // Browsers can't restore a chosen file after a round trip, so remind the user to re-attach it.
  const fullHint =
    state.status === "error"
      ? [hint, "Please attach your file again."].filter(Boolean).join(" ")
      : hint;
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      hint={fullHint}
      errors={errors}
      className={className}
    >
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        required={required}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy(id, fullHint, errors)}
        className="block w-full text-sm text-ink-700 file:mr-4 file:rounded-sm file:border-0 file:bg-ink-100 file:px-4 file:py-2.5 file:font-semibold file:text-ink-900 hover:file:bg-ink-200"
      />
    </FieldShell>
  );
}

type ConsentCheckboxProps = {
  state: FormState;
  name: string;
  children: ReactNode;
};

/** Single required checkbox (e.g. "I certify…"). Submits "yes" when checked. */
export function ConsentCheckbox({ state, name, children }: ConsentCheckboxProps) {
  const id = `field-${name}`;
  const errors = errorsFor(state, name);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-start gap-2.5 text-ink-800">
        <input
          id={id}
          type="checkbox"
          name={name}
          value="yes"
          required
          defaultChecked={valueFor(state, name) === "yes"}
          aria-invalid={errors?.length ? true : undefined}
          aria-describedby={errors?.length ? `${id}-error` : undefined}
          className="mt-1 h-4 w-4 accent-brand-600"
        />
        <span>{children}</span>
      </label>
      <FieldErrors id={id} errors={errors} />
    </div>
  );
}

/** Off-screen field that humans never fill in. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

/** Cloudflare Turnstile widget, rendered only when a site key is configured. */
export function Turnstile() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <div className="cf-turnstile" data-sitekey={siteKey} />
    </>
  );
}

export function SubmitButton({
  children,
  pendingLabel,
}: {
  children: ReactNode;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={buttonClasses("primary", "w-full sm:w-auto")}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

/** Form-level status banner. */
export function FormMessage({ state }: { state: FormState }) {
  if (state.status !== "error" || !state.message) return null;
  return (
    <div
      role="alert"
      className="border-l-4 border-red-600 bg-red-50 p-4 text-sm font-medium text-red-800"
    >
      {state.message}
    </div>
  );
}

export function FormSuccess({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div role="status" className="border-l-4 border-brand-500 bg-brand-50 p-8">
      <h2 className="text-2xl font-bold uppercase">{title}</h2>
      <div className="mt-3 text-ink-700">{children}</div>
    </div>
  );
}
