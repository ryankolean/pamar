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

## Chosen services

Proposed in [decisions/0001-production-platform.md](../decisions/0001-production-platform.md)
(SUMMIT-260), pending Ryan's approval. Until that record is accepted, treat this table as the
intended target rather than settled fact.

| Attachment point                    | Service                                                        |
| ----------------------------------- | -------------------------------------------------------------- |
| Hosting                             | Cloudflare Workers, via the OpenNext adapter                   |
| Content accessors in `src/content/` | Payload collections on Postgres                                |
| `recordSubmission`                  | Payload collections (applications, registrations, bids)        |
| File uploads                        | Cloudflare R2, private bucket, signed URLs with a short expiry |
| Database                            | Cloudflare D1, with Neon Postgres as the fallback              |
| Staff sign-in                       | Payload auth with roles, unless Pamar wants single sign-on     |
| Notification email                  | Resend, with SPF and DKIM on pamarenterprises.com              |
| Spam protection                     | Turnstile, keys added at launch                                |

Vercel functions cap request bodies at 4.5 MB, which is below this site's 5 MB resume limit, so
hosting there requires presigned direct uploads before launch. Cloudflare Workers allow 100 MB,
which is why today's server action upload path survives the move.

Everything above runs on a free tier except the host: Workers Free caps CPU at 10 ms per request,
which server-rendered React exceeds, so the $5 Workers Paid plan is the whole running cost.

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
