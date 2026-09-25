"use client";

import type { ReactNode } from "react";
import { submitRegistration } from "@/app/subcontractors/register/actions";
import {
  CheckboxGroup,
  ConsentCheckbox,
  FileField,
  FormMessage,
  Honeypot,
  SelectField,
  SubmitButton,
  TextArea,
  TextField,
  Turnstile,
  useFormAction,
} from "@/components/forms/fields";
import { bondingCapacities, businessCertifications } from "@/lib/submissions/registration-options";

type RegistrationFormProps = {
  trades: readonly string[];
  documents: { accept: string; maxMb: number };
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-6 border-t border-ink-100 pt-8">
      <legend className="float-left mb-2 w-full font-display text-xl font-bold uppercase text-ink-950">
        {title}
      </legend>
      <div className="clear-both space-y-6">{children}</div>
    </fieldset>
  );
}

export function RegistrationForm({ trades, documents }: RegistrationFormProps) {
  const { state, formAction, formKey } = useFormAction(submitRegistration);
  const docHint = `PDF, up to ${documents.maxMb} MB.`;

  return (
    <form key={formKey} action={formAction} noValidate className="relative space-y-10">
      <FormMessage state={state} />

      <Section title="Company">
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            state={state}
            name="companyName"
            label="Company name"
            required
            autoComplete="organization"
            className="sm:col-span-2"
          />
          <TextField
            state={state}
            name="street"
            label="Street address"
            required
            autoComplete="street-address"
            className="sm:col-span-2"
          />
          <TextField
            state={state}
            name="city"
            label="City"
            required
            autoComplete="address-level2"
          />
          <div className="grid grid-cols-2 gap-4">
            <TextField
              state={state}
              name="state"
              label="State"
              required
              autoComplete="address-level1"
            />
            <TextField
              state={state}
              name="zip"
              label="ZIP"
              required
              autoComplete="postal-code"
              inputMode="numeric"
            />
          </div>
          <TextField state={state} name="companyWebsite" label="Website" autoComplete="url" />
          <TextField
            state={state}
            name="yearsInBusiness"
            label="Years in business"
            type="number"
            min={0}
            max={200}
            inputMode="numeric"
          />
        </div>
      </Section>

      <Section title="Primary contact">
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField state={state} name="contactName" label="Name" required autoComplete="name" />
          <TextField
            state={state}
            name="contactTitle"
            label="Title"
            autoComplete="organization-title"
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
      </Section>

      <Section title="Capabilities">
        <CheckboxGroup
          state={state}
          name="trades"
          legend="Trades"
          required
          hint="Choose every trade you’d like to be invited to bid on."
          options={trades}
          columns={3}
        />
        <TextField
          state={state}
          name="serviceArea"
          label="Service area"
          required
          hint="Counties, cities, or regions you work in."
        />
        <CheckboxGroup
          state={state}
          name="certifications"
          legend="Business certifications"
          hint="Check any current certifications."
          options={businessCertifications}
          columns={3}
        />
      </Section>

      <Section title="Insurance & bonding">
        <SelectField
          state={state}
          name="bonding"
          label="Bonding capacity (single project)"
          required
          options={bondingCapacities}
        />
        <ConsentCheckbox state={state} name="insured">
          We carry general liability and workers’ compensation insurance.
        </ConsentCheckbox>
        <div className="grid gap-6 sm:grid-cols-2">
          <FileField
            state={state}
            name="coi"
            label="Certificate of insurance"
            accept={documents.accept}
            maxBytes={documents.maxMb * 1024 * 1024}
            hint={docHint}
          />
          <FileField
            state={state}
            name="w9"
            label="W-9"
            accept={documents.accept}
            maxBytes={documents.maxMb * 1024 * 1024}
            hint={docHint}
          />
        </div>
      </Section>

      <Section title="Anything else?">
        <TextArea
          state={state}
          name="notes"
          label="Notes"
          hint="Equipment, crew size, recent similar projects, or references."
          rows={4}
        />
      </Section>

      <Honeypot />
      <Turnstile />
      <SubmitButton pendingLabel="Submitting…">Submit registration</SubmitButton>
    </form>
  );
}
