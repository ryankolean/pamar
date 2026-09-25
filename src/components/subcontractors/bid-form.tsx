"use client";

import { useState } from "react";
import { TrackEvent } from "@/components/analytics/track-event";
import { submitBid } from "@/app/subcontractors/opportunities/[slug]/actions";
import {
  CheckboxGroup,
  FileField,
  FormMessage,
  FormSuccess,
  Honeypot,
  RadioCards,
  SubmitButton,
  TextArea,
  TextField,
  Turnstile,
  useFormAction,
} from "@/components/forms/fields";
import type { FormState } from "@/lib/forms/form-state";
import { submissionTypes } from "@/lib/submissions/bid-options";

type BidFormProps = {
  preview?: boolean;
  opportunitySlug: string;
  trades: string[];
  document: { accept: string; maxMb: number };
};

function BidFields({
  state,
  trades,
  document,
}: { state: FormState } & Omit<BidFormProps, "opportunitySlug">) {
  const initialType =
    typeof state.values?.submissionType === "string" ? state.values.submissionType : "intent";
  const [type, setType] = useState(initialType);
  const isBid = type === "bid";

  return (
    <>
      <RadioCards
        state={state}
        name="submissionType"
        legend="What are you submitting?"
        options={submissionTypes}
        value={type}
        onChange={setType}
      />
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          state={state}
          name="companyName"
          label="Company name"
          required
          autoComplete="organization"
        />
        <TextField
          state={state}
          name="contactName"
          label="Contact name"
          required
          autoComplete="name"
        />
        <TextField
          state={state}
          name="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
        />
        <TextField
          state={state}
          name="phone"
          label="Phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
        />
      </div>
      <CheckboxGroup
        state={state}
        name="trades"
        legend="Trades you’re pricing"
        required
        options={trades}
        defaultValues={trades.length === 1 ? trades : []}
      />
      {isBid && (
        <div className="grid gap-6 border-l-4 border-brand-500 bg-white p-6 sm:grid-cols-2">
          <TextField
            state={state}
            name="bidAmount"
            label="Bid amount (USD)"
            required
            inputMode="decimal"
            placeholder="125,000"
            hint="Total for the trades selected above."
          />
          <FileField
            state={state}
            name="bidDocument"
            label="Bid document"
            required
            accept={document.accept}
            maxBytes={document.maxMb * 1024 * 1024}
            hint={`PDF with scope, inclusions, and exclusions. Up to ${document.maxMb} MB.`}
          />
        </div>
      )}
      <TextArea state={state} name="notes" label="Notes or questions" rows={4} />
    </>
  );
}

export function BidForm({ opportunitySlug, trades, document, preview = false }: BidFormProps) {
  const { state, formAction, formKey } = useFormAction(submitBid);

  if (state.status === "success") {
    return (
      <FormSuccess title="Submission received" preview={preview}>
        <TrackEvent
          name={
            state.values?.submissionType === "bid" ? "bid_submitted" : "intent_to_bid_submitted"
          }
          params={{ package: opportunitySlug }}
        />
        <p>{state.message}</p>
      </FormSuccess>
    );
  }

  return (
    <form key={formKey} action={formAction} noValidate className="relative space-y-6">
      <FormMessage state={state} />
      <input type="hidden" name="opportunity" value={opportunitySlug} />
      <BidFields state={state} trades={trades} document={document} />
      <Honeypot />
      <Turnstile />
      <SubmitButton pendingLabel="Submitting…">Send submission</SubmitButton>
    </form>
  );
}
