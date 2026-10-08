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

Four coherent bundles, rather than mixing a vendor per row.

### A. Cloudflare Workers (recommended)

Workers Paid via the OpenNext adapter, D1 for the database, R2 for private files, Payload for the
CMS, staff sign-in and the applicant records, Resend for email, Turnstile for spam. Everything but
the $5 Workers plan sits on a free tier.

- The framework's hosting rule already defaults to Cloudflare (`docs/STACK_DECISION.md`), and
  Turnstile is wired in this repo, so the Cloudflare account exists either way.
- One account covers DNS, headers, redirects, Turnstile, D1 and R2.
- The 100 MB body limit means today's upload code ships unchanged.
- Cheapest of the four. With D1 and the R2 free tier, the Workers Paid plan is the only line item.
- Payload ships an official `with-cloudflare-d1` template, so this is a supported path rather than
  an improvisation.
- **Risk:** `@payloadcms/db-d1-sqlite` is still marked beta. If it bites, swap to Neon Postgres on
  the mature adapter and add $5 to $15 a month. Nothing else in the record changes.

### B. Vercel

Vercel Pro, Neon Postgres, Vercel Blob, Payload, Resend, Turnstile.

- The least friction path for Next: no adapter, no runtime gaps, preview deployments per PR.
- Prior art: Booking Base runs Vercel plus Neon.
- Costs six to nine times option A, and the 4.5 MB cap forces the upload rework before launch.
- Worth revisiting only if we end up wanting Vercel's preview deployments badly enough to pay for
  them. The D1 risk in option A is answered by moving to Neon, not by moving host.

### C. Supabase-centric

Supabase for Postgres, storage and auth, with a custom staff admin instead of a CMS. Host on
either of the above.

- One vendor for three concerns, and prior art in EstateSync.
- Rejected as the default because the admin, the posting review workflow and the applicant
  dashboard all become custom build work. Those are three of the four blocked tickets. A CMS that
  ships drafts, publish states, role-based access and list views covers them with configuration.

### D. Everything on free tiers

Netlify Free for hosting, Neon Free for Postgres, R2's free tier for files, Payload, Resend Free,
Turnstile. Genuine total: $0 a month.

This was worth checking properly, because most of the stack is already free at Pamar's scale. The
result is that only two layers are in question, and only one of them is close.

| Layer                | Free option             | Verdict                                                                                                                                                                                      |
| -------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hosting              | Vercel Hobby            | **Disqualified.** Hobby prohibits commercial use, and the fair-use wording covers the contractor who built the site, not just the owner. A client site cannot sit on it.                     |
| Hosting              | Cloudflare Workers Free | **Disqualified for this app.** 10 ms of CPU per request. A server-rendered React page does not render in 10 ms, so SSR on Cloudflare is a paid-plan feature.                                 |
| Hosting              | Netlify Free            | **Viable.** Commercial use is explicitly allowed and Next SSR is supported. Costs below.                                                                                                     |
| Hosting              | GitHub Pages            | Already the preview host. Static only: no 301s, no response headers, no server actions. Not a production option, which is what started this ticket.                                          |
| Database             | Supabase Free           | **Disqualified.** Free projects pause after one week with no API requests. A careers page that returns 500 because nobody applied for eight days is not shippable.                           |
| Database             | Neon Free               | **Viable with a cliff.** 0.5 GB and 100 CU-hours per project per month, compute scales to zero after 5 minutes idle. Passing the CU-hour quota disables compute for the rest of the month.   |
| Database             | Cloudflare D1           | **Viable.** 5 GB, 5M rows read and 100k written per day, no pausing. Since September 2026 queries past the daily cap fail outright rather than being absorbed. Only reachable from a Worker. |
| Private file storage | Cloudflare R2 free tier | **Sufficient for years.** 10 GB stored, 1M Class A operations, free egress. Resumes and bid PDFs will not approach it.                                                                       |
| Email                | Resend Free             | **Sufficient.** 3,000 a month, 100 a day, 3 custom domains. Form notifications are nowhere near that.                                                                                        |
| Staff sign-in        | Payload auth            | Free at every tier. Self-hosted, no per-seat cost.                                                                                                                                           |
| CMS and admin        | Payload                 | Open source and self-hosted. Free at every tier.                                                                                                                                             |
| Spam protection      | Turnstile               | Free at this scale.                                                                                                                                                                          |

So the $0 bundle is real, and it is Netlify Free plus Neon Free. Its three costs:

1. **Netlify's Free plan runs on 300 credits a month**, and a production deploy costs 15 of them.
   That is roughly twenty deploys a month before bandwidth is counted at 20 credits per GB. During
   build-out we will deploy more than twenty times in a week.
2. **Neon Free has a hard stop.** Exceed 100 CU-hours and compute is disabled until the month
   turns over. The failure mode is the client's careers page going down, mid-hiring, because of a
   quota rather than a bug. Nobody is paged for it except Ryan.
3. **Netlify functions cap request payloads at about 6 MB**, so the presigned direct-upload rework
   is required before launch here too, exactly as on Vercel.

The judgment: free is the right call on Summit's own projects, where an outage costs an apology.
This system holds employment applications and personal data for a paying client, and Summit is the
one who gets the phone call when a quota trips. Five dollars a month removes an entire class of
outage from a client's production system. That is the cheapest risk reduction in this project.

What the free research did change is the recommendation's cost: swapping Neon for D1 and leaning on
the R2, Resend and Turnstile free tiers takes option A from about $15 a month to **$5**, which is
the Workers Paid plan and nothing else. The gap between free and recommended is now one plan fee.

## Decisions

Every row in the SUMMIT-260 table, with its reason.

| Concern              | Decision                                                | Reason                                                                                                                                                                                                              |
| -------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hosting              | Cloudflare Workers Paid via OpenNext                    | Framework default, one account with Turnstile, D1, R2 and DNS, 100 MB request bodies, lowest cost. The $5 plan is required because Workers Free allows 10 ms CPU per request and SSR does not fit in it.            |
| Database             | Cloudflare D1, with Neon Postgres as the fallback       | Free tier covers this workload with no pausing and no CU-hour cliff, and it sits in the same account as the host. The adapter is beta, so if it bites, move to Neon on the mature Postgres adapter for $5 to $15.   |
| Private file storage | Cloudflare R2, signed URLs with a short expiry          | Same account as the host, no egress charges, and resumes must never be publicly addressable.                                                                                                                        |
| Staff sign-in        | Payload's built-in auth, email and password, with roles | No extra vendor or per-seat cost. Revisit only if Pamar wants single sign-on (open question 1).                                                                                                                     |
| CMS and admin        | Payload, in the same Next app on the same database      | Gives SUMMIT-237 (content), SUMMIT-259 (draft, review, publish) and most of SUMMIT-257 (applicant list views) from one choice. Self-hosted, no per-seat fee. Payload supports Next 16.3.3+; this repo is on 16.3.6. |
| Applicant tracking   | Build in the Payload admin                              | A regional contractor's hiring volume does not justify an ATS seat license, which alone would cost more than this entire stack. Applications become a Payload collection with status, notes and an owner.           |
| Email                | Keep Resend, add SPF and DKIM on pamarenterprises.com   | Already wired in `src/lib/email`. Deliverability of application notifications depends on the DNS records, which Pamar has to add (open question 2).                                                                 |
| Spam protection      | Turnstile, keys added at launch                         | Already wired in `src/lib/forms/spam.ts`.                                                                                                                                                                           |

## Monthly running cost

Prices checked 2026-10-08. Sources at the bottom.

| Service            | Plan      | Expected | Notes                                                                                                                                                                                  |
| ------------------ | --------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cloudflare Workers | Paid      | $5       | The only line item. Flat, and covers this site's request volume many times over. Required because Workers Free caps CPU at 10 ms per request, which SSR exceeds.                       |
| Cloudflare D1      | Free tier | $0       | 5 GB, 5M rows read and 100k written per day. A contractor's job postings, applications and bid packages will not approach it. Paid Workers raises the ceiling further if it ever does. |
| Cloudflare R2      | Free tier | $0       | 10 GB stored, 1M Class A operations, free egress. Standard storage is $0.015 per GB-month after that, so even passing it costs cents.                                                  |
| Resend             | Free      | $0       | 3,000 a month and 100 a day. Form notifications are far below that; the daily cap is the one to watch if a bid deadline ever fans out.                                                 |
| Turnstile          | Free      | $0       |                                                                                                                                                                                        |
| **Total**          |           | **$5**   | Rising to $10 to $20 only if the D1 adapter forces a move to Neon.                                                                                                                     |

For comparison: a genuinely free build (option D) is $0, and option B on Vercel is $30 to $45,
because Vercel Pro is $20 per developer seat per month and commercial projects cannot stay on
Hobby.

At $5 a month this is noise against the retainer, so it should ride the retainer rather than be
billed to Pamar, which also keeps the accounts in Summit's control. Noted for SUMMIT-263.

## Accounts to create, and who owns them

Accounts go in Pamar's name wherever the account holds Pamar's data or DNS, so nothing is hostage
to Summit's billing. Summit holds the accounts that are purely build infrastructure.

| Account                                      | Owner                                           | Why                                                                                                                   |
| -------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Cloudflare (DNS, Workers, D1, R2, Turnstile) | Pamar, Summit added as a member                 | It holds the domain, the database and the applicant files. Pamar must be able to revoke our access and keep the site. |
| Neon, only if D1 is dropped                  | Pamar, Summit as a member                       | Would hold applicant and subcontractor data.                                                                          |
| Resend                                       | Pamar                                           | Sends as their domain, and the DKIM records are theirs.                                                               |
| GitHub repo                                  | Summit, transferred on handoff per the contract | Build infrastructure until handoff (SUMMIT-241).                                                                      |
| Google Analytics 4                           | Pamar                                           | Already their property.                                                                                               |

## Before this is final

1. **D1 adapter proof, half a day.** Stand up Payload on `@payloadcms/db-d1-sqlite` from the
   official `with-cloudflare-d1` template, build with OpenNext, and confirm the admin loads and the
   collections migrate. The adapter is beta, so this is the one piece worth proving before the
   blocked tickets are written against it. If it fails, switch the database row to Neon and add $5
   to $15 a month. Nothing else in this record changes.
2. **Open question for Pamar (via Virgil):** does Pamar use Microsoft 365 or Google Workspace? If
   so, staff single sign-on is worth more than it costs, and the staff auth row changes to Auth.js
   with that provider. Ask before building the admin.
3. **Open question for Pamar:** who controls DNS for pamarenterprises.com today? SPF and DKIM for
   Resend, and the eventual cutover, both go through whoever that is.
4. **Ryan's call:** $5 a month on the retainer, or the $0 build in option D with its outage modes.

The earlier draft of this record carried a fifth item, a proof that Payload's admin fits inside a
Worker. Cloudflare removed the 3 MiB free and 10 MiB paid compressed bundle caps in September 2026
and now checks only an uncompressed 64 MiB limit, on every plan. The concern no longer applies.

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

Checked 2026-10-08.

- [Vercel function limits](https://vercel.com/docs/functions/limitations), for the 4.5 MB body cap
- [Vercel pricing](https://vercel.com/pricing), for Pro at $20 per seat and the Hobby commercial ban
- [Cloudflare Workers platform limits](https://developers.cloudflare.com/workers/platform/limits),
  for 10 ms CPU on Free
- [Worker size limit raised to 64 MiB](https://developers.cloudflare.com/changelog/post/2026-09-04-increased-worker-size-limit/),
  which retired the bundle-size concern
- [Cloudflare D1 limits](https://developers.cloudflare.com/d1/platform/limits/)
- [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare)
- [Payload Next.js 16 support](https://github.com/payloadcms/payload/pull/14456)
- [Payload D1 adapter and template](https://github.com/payloadcms/payload/tree/main/templates/with-cloudflare-d1)
- [Payload SQLite docs](https://payloadcms.com/docs/database/sqlite), where the D1 adapter is marked beta
- [Neon free plan quotas](https://neon.com/docs/introduction/plans)
- [Supabase pricing](https://supabase.com/pricing), for the one-week pause on free projects
- [Netlify Free plan](https://www.netlify.com/blog/introducing-netlify-free-plan/), which permits
  commercial use
- [Netlify Next.js support](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/)
- [Resend pricing](https://resend.com/pricing)
