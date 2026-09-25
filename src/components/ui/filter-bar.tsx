"use client";

import Form from "next/form";
import Link from "next/link";
import { useRef } from "react";
import { buttonClasses } from "./button";

export type FilterField = {
  name: string;
  label: string;
  /** Label for the empty "no filter" option. */
  allLabel: string;
  options: { value: string; label: string }[];
  value?: string;
};

type FilterBarProps = {
  /** Route the GET form submits to, e.g. "/projects". */
  action: string;
  fields: FilterField[];
  resultCount: number;
  resultNoun: { one: string; other: string };
  showClear: boolean;
};

/**
 * URL-driven filter controls. A plain GET form (works without JavaScript) that
 * re-submits automatically when a selection changes.
 */
export function FilterBar({ action, fields, resultCount, resultNoun, showClear }: FilterBarProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Form
      // Remount when the URL-driven values change so the uncontrolled selects reflect them
      // (e.g. after "Clear" or back/forward navigation).
      key={fields.map((field) => field.value ?? "").join("|")}
      ref={formRef}
      action={action}
      scroll={false}
      replace
      className="flex flex-col gap-4 border border-ink-100 bg-white p-5 md:flex-row md:items-end"
    >
      {fields.map((field) => (
        <label key={field.name} className="flex flex-1 flex-col gap-1.5">
          <span className="font-display text-xs font-semibold uppercase tracking-widest text-ink-600">
            {field.label}
          </span>
          <select
            name={field.name}
            defaultValue={field.value ?? ""}
            onChange={() => formRef.current?.requestSubmit()}
            className="h-11 rounded-sm border border-ink-200 bg-white px-3 text-ink-900"
          >
            <option value="">{field.allLabel}</option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}
      <div className="flex items-center gap-4">
        <button type="submit" className={buttonClasses("dark", "h-11 py-0")}>
          Apply
        </button>
        {showClear && (
          <Link
            href={action}
            scroll={false}
            className="text-sm font-semibold text-ink-600 underline"
          >
            Clear
          </Link>
        )}
      </div>
      <p aria-live="polite" className="text-sm text-ink-600 md:ml-auto md:self-end md:pb-3">
        {resultCount} {resultCount === 1 ? resultNoun.one : resultNoun.other}
      </p>
    </Form>
  );
}
