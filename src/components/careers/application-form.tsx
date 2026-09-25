"use client";

import { submitApplication } from "@/app/careers/apply/actions";
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
import {
  certifications,
  experienceLevels,
  GENERAL_POSITION,
} from "@/lib/submissions/application-options";

type ApplicationFormProps = {
  positions: { value: string; label: string }[];
  defaultPosition?: string;
  /** Upload rules, passed from the server so client and server agree. */
  resume: { accept: string; maxMb: number };
};

export function ApplicationForm({ positions, defaultPosition, resume }: ApplicationFormProps) {
  const { state, formAction, formKey } = useFormAction(submitApplication);

  return (
    <form key={formKey} action={formAction} noValidate className="relative space-y-8">
      <FormMessage state={state} />

      <SelectField
        state={state}
        name="position"
        label="Position"
        required
        options={[...positions, { value: GENERAL_POSITION, label: "General application / other" }]}
        defaultValue={defaultPosition}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          state={state}
          name="name"
          label="Full name"
          required
          autoComplete="name"
          className="sm:col-span-2"
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

      <SelectField
        state={state}
        name="experience"
        label="Years of relevant experience"
        required
        options={experienceLevels}
      />

      <CheckboxGroup
        state={state}
        name="certifications"
        legend="Certifications & licenses"
        hint="Check any you currently hold."
        options={certifications}
      />

      <FileField
        state={state}
        name="resume"
        label="Resume"
        required
        accept={resume.accept}
        maxBytes={resume.maxMb * 1024 * 1024}
        hint={`PDF or Word document, up to ${resume.maxMb} MB.`}
      />

      <TextArea
        state={state}
        name="message"
        label="Anything else we should know?"
        hint="Availability, equipment you run, or the kind of work you’re looking for."
        rows={4}
      />

      <ConsentCheckbox state={state} name="consent">
        I confirm the information in this application is accurate and complete.
      </ConsentCheckbox>

      <Honeypot />
      <Turnstile />
      <SubmitButton pendingLabel="Submitting…">Submit application</SubmitButton>
    </form>
  );
}
