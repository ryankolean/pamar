/**
 * Form submission actions, in one place so the static preview build can swap them out:
 * next.config.ts aliases this module to ./actions.static.ts when STATIC_EXPORT=1, because
 * Server Actions cannot be part of a static export. Keep the two files' exports in sync.
 */
export { submitContact } from "@/app/contact/actions";
export { submitApplication } from "@/app/careers/apply/actions";
export { submitRegistration } from "@/app/subcontractors/register/actions";
export { submitBid } from "@/app/subcontractors/opportunities/[slug]/actions";
