# Backend Integration Points

The frontend is complete and runs without a backend: content comes from typed modules and form
submissions are validated on the server, then emailed (or, in preview mode, accepted and
dropped). This document lists every place the backend attaches, so that work can land without
touching pages or components.

| Concern                                              | Attach here                                                                                                                         | Today                                 | Planned (Jira)                                         |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------ |
| Services content                                     | `src/content/services.ts` → `getServices`, `getServiceBySlug`                                                                       | Typed sample data                     | CMS query (SUMMIT-237)                                 |
| Projects content                                     | `src/content/projects.ts` → `getProjects`, `getProjectBySlug`, `getFeaturedProjects`, `getProjectsForService`, `getRelatedProjects` | Typed sample data                     | CMS query (SUMMIT-237)                                 |
| Job postings                                         | `src/content/jobs.ts` → `getJobs`, `getJobBySlug`                                                                                   | Typed sample data                     | CMS / ATS (SUMMIT-237)                                 |
| Bid opportunities                                    | `src/content/opportunities.ts` → `getOpportunities`, `getOpportunityBySlug`                                                         | Typed sample data                     | CMS (SUMMIT-237)                                       |
| Storing submissions                                  | `src/lib/submissions/store.ts` → `recordSubmission`                                                                                 | No-op                                 | Database + staff inbox, CSV export (SUMMIT-237)        |
| Notification email                                   | `src/lib/email/index.ts` → `sendEmail`                                                                                              | Resend when `RESEND_API_KEY` is set   | Keep, or swap provider                                 |
| File uploads                                         | `src/lib/forms/files.ts` → `toAttachment`; `SubmissionRecord.attachments`                                                           | Attached to emails                    | Upload to object storage with signed URLs (SUMMIT-236) |
| Spam protection                                      | `src/lib/forms/spam.ts`                                                                                                             | Honeypot; Turnstile when keys are set | Add keys at launch                                     |
| Subcontractor accounts, restricted documents, alerts | New: auth provider + `src/proxy.ts` route checks; `OpportunityDocument.url` → signed download route                                 | Not built                             | SUMMIT-236                                             |
| Analytics                                            | `src/lib/analytics.ts` → `trackEvent`; `NEXT_PUBLIC_GA_ID`                                                                          | GA4 when ID is set                    | Mark key events in GA4                                 |

## Rules for attaching a backend

- **Content accessors are already `async`.** Replace the function bodies with CMS or database
  queries and keep the return types (`Service`, `Project`, `Job`, `Opportunity`). Pages don't change.
- **Submission handlers stay as they are.** Each handler in `src/lib/submissions/` validates the
  form, then calls `deps.record` (persist) and `deps.sendEmail` (notify). Implement
  `recordSubmission`; its `SubmissionRecord` already carries the validated fields and the files.
- **Dependencies are injectable.** Handlers take a `SubmissionDeps` object, so new storage can be
  unit-tested with fakes, the same way the existing tests do.
- **Photos:** set `images[].src` on projects (and add images to `public/images/…` or a CMS image
  host allowed in `next.config.ts`). Components already render real images when `src` is present.

## Site modes

| Variable            | Effect                                                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `SITE_MODE=preview` | Preview banner, `noindex` and `robots.txt` disallow-all, emails suppressed, forms show "Preview site: nothing was sent" |
| `PREVIEW_PASSWORD`  | Password prompt on every page (HTTP Basic auth, any username)                                                           |
| unset (production)  | Normal behavior; email requires `RESEND_API_KEY` or forms show an error                                                 |
