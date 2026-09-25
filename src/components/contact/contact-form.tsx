"use client";

import { TrackEvent } from "@/components/analytics/track-event";
import {
  FormMessage,
  FormSuccess,
  Honeypot,
  SelectField,
  SubmitButton,
  TextArea,
  TextField,
  Turnstile,
  useFormAction,
} from "@/components/forms/fields";
import { submitContact } from "@/lib/forms/actions";
import { contactTopics } from "@/lib/submissions/contact-topics";

export function ContactForm({
  defaultTopic,
  preview = false,
}: {
  defaultTopic?: string;
  preview?: boolean;
}) {
  const { state, formAction, formKey } = useFormAction(submitContact);

  if (state.status === "success") {
    return (
      <FormSuccess title="Message sent" preview={preview}>
        <TrackEvent name="contact_submitted" />
        <p>{state.message}</p>
      </FormSuccess>
    );
  }

  return (
    <form key={formKey} action={formAction} noValidate className="relative space-y-6">
      <FormMessage state={state} />
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField state={state} name="name" label="Name" required autoComplete="name" />
        <TextField state={state} name="company" label="Company" autoComplete="organization" />
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
          autoComplete="tel"
          inputMode="tel"
        />
      </div>
      <SelectField
        state={state}
        name="topic"
        label="Topic"
        required
        options={contactTopics}
        defaultValue={defaultTopic}
      />
      <TextArea state={state} name="message" label="Message" required rows={6} />
      <Honeypot />
      <Turnstile />
      <SubmitButton pendingLabel="Sending…">Send message</SubmitButton>
    </form>
  );
}
