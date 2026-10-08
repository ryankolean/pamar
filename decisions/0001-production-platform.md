# 0001: Production platform

- **Jira:** [SUMMIT-260](https://ryan-kolean.atlassian.net/browse/SUMMIT-260)
- **Status:** Proposed. Needs Ryan's approval, plus two answers from Pamar (marked below).
- **Date:** 2026-10-08
- **Blocks:** SUMMIT-236, SUMMIT-237, SUMMIT-257, SUMMIT-259

## Context

The site is feature complete as a frontend. Content comes from typed modules in `src/content/`,
form handlers in `src/lib/submissions/` validate input and then call two injectable dependencies:
`recordSubmission` (a no-op today) and `sendEmail` (Resend). `docs/BACKEND.md` lists every
attachment point.

The preview runs as a static export on GitHub Pages (`STATIC_EXPORT=1`). That mode cannot do what
the rest of the epic needs: private storage of applications and resumes, staff sign-in, a posting
review and publish workflow, 301 redirects from the legacy URLs, or security headers. Server
actions are swapped for client-side stand-ins under static export, so every form is a stub.

So the question is not whether to run a server. It is which one, and what it costs per month.

### The constraint that drives the host choice

`src/lib/forms/files.ts` sets the upload limits the forms already enforce:

| Upload                        | Limit     |
| ----------------------------- | --------- |
| Resume (job application)      | 5 MB      |
| Certificate of insurance, W-9 | 5 MB each |
| Bid document                  | 15 MB     |

`next.config.ts` raises the server action body limit to 16 MB to match.

Vercel functions reject any request body over **4.5 MB** with a 413. That is below the resume
limit, not just the bid document limit, so on Vercel every file form has to be rebuilt to upload
straight to object storage with a presigned URL before the form posts. Cloudflare Workers allow
**100 MB** on the Free and Pro plans, so the code as written keeps working.

Direct-to-storage upload is the better architecture either way, and we should get there. The point
is that on Vercel it is required before launch, and on Cloudflare it is an improvement we can
schedule.

## Options

Three coherent bundles, rather than mixing a vendor per row.

### A. Cloudflare Workers (recommended)

Workers via the OpenNext adapter, Neon Postgres, R2 for private files, Payload for the CMS, staff
sign-in and the applicant records, Resend for email, Turnstile for spam.

- The framework's hosting rule already defaults to Cloudflare (`docs/STACK_DECISION.md`), and
  Turnstile is wired in this repo, so the Cloudflare account exists either way.
- One account covers DNS, headers, redirects, Turnstile and R2.
- The 100 MB body limit means today's upload code ships unchanged.
- Cheapest of the three.
- **Risk:** a Worker bundle is capped at 10 MiB on the paid plan, and Payload's admin UI is a large
  app. This needs a timeboxed proof before we commit (see "Before this is final").

### B. Vercel

Vercel Pro, Neon Postgres, Vercel Blob, Payload, Resend, Turnstile.

- The least friction path for Next: no adapter, no runtime gaps, preview deployments per PR.
- Prior art: Booking Base runs Vercel plus Neon.
- Costs about four times option A, and the 4.5 MB cap forces the upload rework before launch.
- The sensible fallback if the Workers proof in option A fails.

### C. Supabase-centric

Supabase for Postgres, storage and auth, with a custom staff admin instead of a CMS. Host on
either of the above.

- One vendor for three concerns, and prior art in EstateSync.
- Rejected as the default because the admin, the posting review workflow and the applicant
  dashboard all become custom build work. Those are three of the four blocked tickets. A CMS that
  ships drafts, publish states, role-based access and list views covers them with configuration.

## Decisions

Every row in the SUMMIT-260 table, with its reason.

| Concern              | Decision                                                | Reason                                                                                                                                                                                                              |
| -------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hosting              | Cloudflare Workers via OpenNext                         | Framework default, one account with Turnstile and DNS, 100 MB request bodies, lowest cost. Fallback to Vercel if the bundle proof fails.                                                                            |
| Database             | Neon Postgres                                           | Serverless Postgres that scales to zero, works over HTTP from Workers, no monthly minimum. Payload's Postgres adapter is the mature one.                                                                            |
| Private file storage | Cloudflare R2, signed URLs with a short expiry          | Same account as the host, no egress charges, and resumes must never be publicly addressable.                                                                                                                        |
| Staff sign-in        | Payload's built-in auth, email and password, with roles | No extra vendor or per-seat cost. Revisit only if Pamar wants single sign-on (open question 1).                                                                                                                     |
| CMS and admin        | Payload, in the same Next app on the same Postgres      | Gives SUMMIT-237 (content), SUMMIT-259 (draft, review, publish) and most of SUMMIT-257 (applicant list views) from one choice. Self-hosted, no per-seat fee. Payload supports Next 16.3.3+; this repo is on 16.3.6. |
| Applicant tracking   | Build in the Payload admin                              | A regional contractor's hiring volume does not justify an ATS seat license, which alone would cost more than this entire stack. Applications become a Payload collection with status, notes and an owner.           |
| Email                | Keep Resend, add SPF and DKIM on pamarenterprises.com   | Already wired in `src/lib/email`. Deliverability of application notifications depends on the DNS records, which Pamar has to add (open question 2).                                                                 |
| Spam protection      | Turnstile, keys added at launch                         | Already wired in `src/lib/forms/spam.ts`.                                                                                                                                                                           |

## Monthly running cost

Prices checked 2026-10-08. Sources at the bottom.

| Service            | Plan           | Expected       | Notes                                                                                                                                                               |
| ------------------ | -------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cloudflare Workers | Paid           | $5             | Flat, covers the request volume of a site this size many times over.                                                                                                |
| Cloudflare R2      | Pay as you go  | $0 to $1       | Free tier is 10 GB stored and 1M Class A operations. Standard storage is $0.015 per GB-month, egress free. Resumes and bid documents will take years to pass 10 GB. |
| Neon Postgres      | Launch         | $5 to $15      | $0.106 per CU-hour, $0.35 per GB-month, no minimum. Scales to zero between staff sessions.                                                                          |
| Resend             | Free, then Pro | $0 to $20      | Free covers 3,000 emails a month. Pamar will not pass that on form notifications alone.                                                                             |
| Turnstile          | Free           | $0             |                                                                                                                                                                     |
| **Total**          |                | **$10 to $21** | Call it $15 a month typical, $25 worst case.                                                                                                                        |

For comparison, option B runs $30 to $45 a month, because Vercel Pro is $20 per developer seat per
month and commercial projects cannot stay on Hobby.

This is small enough to roll into the maintenance retainer rather than bill Pamar separately, which
also keeps the accounts in Summit's control. Noted for SUMMIT-263.

## Accounts to create, and who owns them

Accounts go in Pamar's name wherever the account holds Pamar's data or DNS, so nothing is hostage
to Summit's billing. Summit holds the accounts that are purely build infrastructure.

| Account                                  | Owner                                           | Why                                                                                                     |
| ---------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Cloudflare (DNS, Workers, R2, Turnstile) | Pamar, Summit added as a member                 | It holds the domain and the applicant files. Pamar must be able to revoke our access and keep the site. |
| Neon                                     | Pamar, Summit as a member                       | Holds applicant and subcontractor data.                                                                 |
| Resend                                   | Pamar                                           | Sends as their domain, and the DKIM records are theirs.                                                 |
| GitHub repo                              | Summit, transferred on handoff per the contract | Build infrastructure until handoff (SUMMIT-241).                                                        |
| Google Analytics 4                       | Pamar                                           | Already their property.                                                                                 |

## Before this is final

1. **Workers bundle proof, half a day.** Stand up Payload plus the Postgres adapter on a scratch
   branch, build with OpenNext, and confirm the Worker is under 10 MiB and the admin loads. If it
   is not, switch to option B and rerun the cost table. Nothing else in this record changes.
2. **Open question for Pamar (via Virgil):** does Pamar use Microsoft 365 or Google Workspace? If
   so, staff single sign-on is worth more than it costs, and the staff auth row changes to Auth.js
   with that provider. Ask before building the admin.
3. **Open question for Pamar:** who controls DNS for pamarenterprises.com today? SPF and DKIM for
   Resend, and the eventual cutover, both go through whoever that is.
4. **Ryan's call:** whether the $15 a month rides the maintenance retainer or is billed to Pamar.

## Consequences

- `STATIC_EXPORT` stays as it is. The GitHub Pages preview remains the client review link until
  cutover, and the production build drops the flag, which turns `legacyRedirects` back on.
- `recordSubmission` in `src/lib/submissions/store.ts` becomes a Payload write. The handlers and
  every page stay as they are, because dependencies are already injected.
- File uploads move to presigned R2 URLs as a scheduled improvement rather than a launch blocker.
- The four blocked tickets can be written against a known platform: SUMMIT-237 (Payload collections
  and the admin), SUMMIT-259 (draft and publish on the jobs collection), SUMMIT-257 (applications
  collection with status and notes), SUMMIT-236 (a second auth scope for subcontractors plus signed
  document routes).

## Sources

- [Vercel function limits](https://vercel.com/docs/functions/limitations)
- [Cloudflare Workers platform limits](https://developers.cloudflare.com/workers/platform/limits)
- [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare)
- [Payload Next.js 16 support](https://github.com/payloadcms/payload/pull/14456)
- [Neon pricing](https://neon.com/pricing)
- [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- [Vercel pricing](https://vercel.com/pricing)
