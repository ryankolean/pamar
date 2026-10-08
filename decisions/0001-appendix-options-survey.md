# Appendix to 0001: full options survey

Supporting material for [0001-production-platform.md](./0001-production-platform.md). Everything
here was checked on 2026-10-08. Prices and quotas move; re-check before relying on a row.

## How to read this

Most options die on one of five filters, not on price. Running the filters first is what keeps the
list short:

1. **Does the licence permit a client project?** Several free tiers are personal-use only. This is
   a contract question, not a quota question, and it cannot be engineered around.
2. **Can it server-render?** The careers funnel, the bid board and the staff admin all need a
   server. Static hosting is out by definition.
3. **What is the request body cap?** `src/lib/forms/files.ts` allows a 5 MB resume and a 15 MB bid
   document. A host capping bodies below 5 MB forces presigned direct-to-storage uploads before
   launch.
4. **Is it always on?** Anything that pauses on inactivity or cold-starts for 30 seconds fails a
   careers page that may sit idle for a week between applicants.
5. **Is it appropriate for PII?** Resumes and applications are personal data. Anything with a
   publicly readable default is disqualified regardless of price.

## 1. Hosting

| Option                                 | Cost                  | Commercial on free? | Body cap     | Always on            | Verdict                                                                                                                                                                                                  |
| -------------------------------------- | --------------------- | ------------------- | ------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cloudflare Workers Paid** (OpenNext) | $5/mo                 | n/a, paid           | 100 MB       | Yes                  | **Recommended.** Only line item in the stack. Same account as D1, R2, Turnstile and DNS.                                                                                                                 |
| Cloudflare Workers Free                | $0                    | Yes                 | 100 MB       | Yes                  | **Out.** 10 ms CPU per request. Server-rendered React does not fit, so SSR is a paid feature here.                                                                                                       |
| **Google Cloud Run**                   | $0 within Always Free | Yes                 | 32 MiB       | Cold start from zero | **Best $0 option.** 2M requests, 180k vCPU-seconds, 360k GB-seconds a month, never expires. Handles the 15 MB bid document. Needs a billing account on file, so a traffic spike bills rather than stops. |
| Netlify Free                           | $0                    | **Yes, explicitly** | ~6 MB        | Yes                  | Viable $0. 300 credits a month, 15 per production deploy, so about twenty deploys before bandwidth counts at 20 credits per GB. Forces the upload rework.                                                |
| Vercel Hobby                           | $0                    | **No**              | 4.5 MB       | Yes                  | **Out on licence.** Fair use covers the contractor who built the site, not only the owner.                                                                                                               |
| Vercel Pro                             | $20/seat/mo           | n/a, paid           | 4.5 MB       | Yes                  | Works, costs 4x, and still forces the upload rework. Best preview-deployment experience of any option.                                                                                                   |
| Render Free                            | $0                    | Yes                 | —            | **No**               | **Out.** Spins down after 15 minutes idle, 30 to 60 second cold start. A client careers page cannot open like that.                                                                                      |
| Render Starter                         | $7/mo                 | n/a, paid           | —            | Yes                  | Fine, slightly more than Workers for less.                                                                                                                                                               |
| Railway                                | ~$5/mo via Hobby cap  | Trial needs a card  | —            | Yes                  | Best developer experience of the container hosts. Per-second billing with a $5 spend cap.                                                                                                                |
| Fly.io                                 | $5 to $10/mo          | Trial needs a card  | —            | Yes                  | Cheapest at scale thanks to $0.02/GB egress. More operations surface than this project needs.                                                                                                            |
| VPS + Coolify or Dokploy               | €5 to €14/mo          | n/a, paid           | Yours to set | Yes                  | Cheapest at volume and no quota cliffs, but Summit becomes responsible for patching, backups and uptime on a client's production box. Wrong trade for one small site.                                    |
| GitHub Pages                           | $0                    | Yes                 | n/a          | Yes                  | Already the preview host. Static only: no 301s, no headers, no server actions. Not a production candidate.                                                                                               |

**The $0 shortlist is Cloud Run and Netlify Free.** Cloud Run is the stronger of the two: no deploy
budget, a 32 MiB body cap that clears the bid document, and an Always Free tier that does not
expire. Its costs are container cold starts on an idle service and a billing account that absorbs
overage instead of refusing it.

## 2. Database

| Option                    | Free tier                                           | Always on            | Verdict                                                                                                                                                                                                             |
| ------------------------- | --------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cloudflare D1**         | 5 GB, 5M rows read/day, 100k written/day            | Yes                  | **Recommended, tied with Turso.** Same account as the host. Past the daily cap, queries fail outright as of September 2026. Reachable only from a Worker. Payload's adapter is marked beta.                         |
| **Turso** (libSQL)        | 5 GB, 500M rows read/mo, 10M written/mo, 100 DBs    | Yes                  | **Recommended, tied with D1.** Far more generous, speaks HTTP so it is not host-locked, and rides Payload's more established SQLite adapter. Against it: a smaller company than Cloudflare, so more free-tier risk. |
| Neon                      | 0.5 GB, 100 CU-hours/mo, scales to zero after 5 min | Yes, until the quota | Solid Postgres with the mature Payload adapter. The free plan disables compute for the rest of the month past 100 CU-hours, which takes the site down over a quota. Launch plan is $5 to $15.                       |
| Prisma Postgres           | 200k operations/mo, 500 MB, no card                 | Yes                  | Real free Postgres, but 200k operations is tight once an admin is doing list views.                                                                                                                                 |
| Supabase                  | 500 MB, 1 GB files, 50k MAU                         | **No**               | **Out.** Free projects pause after one week without API requests.                                                                                                                                                   |
| PlanetScale               | **None**                                            | Yes                  | **Out.** No free tier since April 2024. Cheapest is $5/mo.                                                                                                                                                          |
| Xata                      | **None**                                            | Yes                  | **Out.** The 15 GB free tier was retired; now usage-billed with no free plan.                                                                                                                                       |
| Railway / Render Postgres | Bundled with the host's plan                        | Yes                  | Only sensible if the app is already hosted there.                                                                                                                                                                   |
| Postgres on the VPS       | $0 beyond the box                                   | Yes                  | Cheapest and most durable, and makes backups Summit's job.                                                                                                                                                          |

## 3. Private file storage

| Option            | Free tier                        | Egress                        | Verdict                                                                                                             |
| ----------------- | -------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Cloudflare R2** | 10 GB, 1M Class A ops, permanent | **Free**                      | **Recommended.** $0.015/GB-month after the free tier, and free egress means serving resumes never generates a bill. |
| Backblaze B2      | 10 GB permanent                  | $0.01/GB, free via Cloudflare | Cheapest storage at $6.95/TB. A second vendor for no gain here.                                                     |
| AWS S3            | 5 GB for 12 months only          | $0.09/GB                      | Most expensive on both axes. Only if something else forces AWS.                                                     |
| Supabase Storage  | 1 GB                             | Capped                        | Carries the project-pause problem with it.                                                                          |
| Vercel Blob       | Usage-billed                     | Billed                        | Only makes sense on Vercel.                                                                                         |

Whatever the host, resumes must live in a private bucket behind signed URLs with a short expiry.
No public bucket, ever, for applicant files.

## 4. CMS and staff admin

| Option              | Licence     | Cost                        | Verdict                                                                                                                                                                                                |
| ------------------- | ----------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Payload**         | MIT         | $0 self-hosted              | **Recommended.** Runs inside this Next app, drafts and publish states, role-based access, list views. Covers SUMMIT-237, 259 and most of 257 by configuration. Official Cloudflare D1 template exists. |
| Strapi              | MIT         | $0 self-hosted              | Mature and genuinely free, but a separate app to deploy and a REST or GraphQL hop from the site.                                                                                                       |
| Directus            | **BSL 1.1** | $0 under $5M revenue        | Good product, but the licence restricts offering it as a managed service to clients. Summit's framework reuses this stack across clients, so this needs a lawyer's read before it becomes a default.   |
| Keystatic / TinaCMS | MIT         | $0                          | Git-backed editing. Fine for marketing copy, wrong for applications, which need a database and access control.                                                                                         |
| Sanity              | Hosted      | Free tier exists            | **Out for this project.** The free tier has no private datasets: content is publicly readable by API key. Unusable for applicant data.                                                                 |
| Contentful          | Hosted      | Free: 1 space, 5 users      | Two-environment ceiling, and paid starts around $300/mo.                                                                                                                                               |
| Storyblok           | Hosted      | Free: 1 user, 10k API calls | Too restrictive to run a staff workflow.                                                                                                                                                               |
| Custom admin        | n/a         | Build time                  | What option C implied. Three of the four blocked tickets become bespoke code. Most expensive thing on this page, measured in Ryan's hours.                                                             |

## 5. The applicant tracking system: buy or build

| Option               | Cost                         | Verdict                                                                                                                                                  |
| -------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Build in Payload** | $0 on top of the stack       | **Recommended.** Applications become a collection with status, notes and an owner. Keeps postings on Pamar's own domain, which matters for the next row. |
| Zoho Recruit Free    | $0                           | 1 active job slot, 256 MB, no resume parsing. Pamar hires several trades at once.                                                                        |
| BreezyHR Free        | $0                           | 1 active position. Same problem.                                                                                                                         |
| BreezyHR paid        | from $189/mo                 | 38x the infrastructure cost of the whole site.                                                                                                           |
| Workable             | from $189/mo, Standard ~$299 | Same.                                                                                                                                                    |

**Google for Jobs is the argument that settles this.** It is free, has no paid placement, and works
by crawling `JobPosting` JSON-LD on _your own_ job pages. Hosting postings on pamarenterprises.com
puts Pamar directly into Google's job results. Pushing postings into a hosted ATS puts the schema
on the vendor's domain instead. The site already does structured data work in `src/lib/seo.ts`, so
this is a small addition with outsized reach, and it is worth a ticket of its own under SUMMIT-259.

Indeed's XML feed is a separate channel, free in dollars but gated behind partner approval since 2022. Worth asking about later; not a launch dependency.

## 6. Notification email

| Option     | Free tier                    | Verdict                                                                                                                         |
| ---------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Resend** | 3,000/mo, 100/day, 3 domains | **Recommended, already wired** in `src/lib/email`. The daily cap is the one to watch if a bid deadline ever fans out to a list. |
| Brevo      | 300/day, 9,000/mo, no expiry | The better free tier on daily volume. Worth a swap only if Resend's 100/day becomes real.                                       |
| Amazon SES | 3,000/mo for 12 months only  | $0.10 per 1,000 after. Cheapest at volume, most setup.                                                                          |
| Postmark   | 100/mo for developers        | Best deliverability reputation, $15/mo to actually use.                                                                         |
| ZeptoMail  | None                         | $2.50 per 10,000. Cheap, no free tier.                                                                                          |

SPF and DKIM on pamarenterprises.com matter more than the vendor choice. An application
notification that lands in spam is the same as no application.

## 7. Staff sign-in

| Option           | Cost                            | Verdict                                                                                                                                                                                                                     |
| ---------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Payload auth** | $0                              | **Recommended.** Already there if Payload is the CMS. Email, password and roles, no extra vendor.                                                                                                                           |
| Better Auth      | $0, self-hosted                 | **The fallback if Pamar wants single sign-on.** Note: the Auth.js team joined Better Auth in late 2025, and new projects are pointed at Better Auth. The main record's earlier reference to Auth.js is updated accordingly. |
| Clerk            | Free to 50,000 MAU, then $25/mo | Generous, but a hosted dependency and another account for a handful of staff logins.                                                                                                                                        |
| Supabase Auth    | Free to 50k MAU                 | Drags the paused-project problem along.                                                                                                                                                                                     |
| WorkOS           | Free SSO up to a user count     | Only worth it if Pamar turns out to be an enterprise Microsoft 365 shop and wants SAML.                                                                                                                                     |

## 8. Spam protection

Turnstile is free at this scale and already wired in `src/lib/forms/spam.ts`. hCaptcha and Altcha
are equivalent alternatives with no reason to switch. The honeypot already in the code stays either
way.

## 9. The three assembled bundles

|                            | **$0 bundle**                                                    | **$5 bundle (recommended)** | **$30 to $45 bundle**       |
| -------------------------- | ---------------------------------------------------------------- | --------------------------- | --------------------------- |
| Host                       | Cloud Run Always Free                                            | Cloudflare Workers Paid     | Vercel Pro                  |
| Database                   | Turso Free                                                       | D1 or Turso, free tier      | Neon Launch                 |
| Files                      | R2 free tier                                                     | R2 free tier                | Vercel Blob                 |
| CMS, admin, ATS            | Payload                                                          | Payload                     | Payload                     |
| Auth                       | Payload auth                                                     | Payload auth                | Payload auth                |
| Email                      | Resend Free                                                      | Resend Free                 | Resend Free                 |
| Spam                       | Turnstile                                                        | Turnstile                   | Turnstile                   |
| **Monthly**                | **$0**                                                           | **$5**                      | **$30 to $45**              |
| Upload rework needed first | No, 32 MiB cap                                                   | No, 100 MB cap              | **Yes**, 4.5 MB cap         |
| Main risk                  | Cold starts, and a billing account that absorbs overage silently | D1 adapter is beta          | Cost, and the upload rework |

The gap between the first two columns is five dollars a month and a class of failure.

## 10. Why free tiers are a different risk on a client's system

This is the part that does not show up in a pricing table. Free tiers are acquisition spending, and
they get cut when a vendor turns toward profitability:

- **Heroku** ended its free plan in November 2022.
- **PlanetScale** retired its Hobby tier in April 2024 with roughly one month of notice. Thousands
  of production databases migrated on a deadline they did not choose.
- **Xata** retired its 15 GB free tier and rebuilt as a usage-billed product in 2025.

Each of those was survivable on a side project and expensive on a client's production system. The
same logic applies to quota cliffs: Neon disabling compute mid-month and D1 failing queries past a
daily cap are both correct behavior by the vendor and an outage to Pamar.

Summit is the one who gets the call. That is the whole argument for the $5 column, and it is not an
argument against free tiers generally. On Summit's own projects, free is right.

## 11. What this survey changed in the main record

- **Cloud Run replaces Netlify** as the $0 recommendation if the free route is taken: no deploy
  budget, a 32 MiB body cap that clears the 15 MB bid document, and a tier that does not expire.
- **Turso joins D1** as a co-recommendation for the database. More generous, portable across hosts,
  and on Payload's more established SQLite adapter. The proof in open item 1 should try both
  adapters and keep whichever is cleaner. Cost is $0 either way.
- **Better Auth replaces Auth.js** as the named single-sign-on fallback.
- **Google for Jobs** is added as a reason to keep postings on Pamar's own domain, and should
  become a ticket under SUMMIT-259.
- **Sanity and Directus are ruled out** for specific reasons worth recording: Sanity's free tier has
  no private datasets, and Directus ships under BSL, which restricts managed-service use across
  clients.

## Sources

Hosting: [Vercel limits](https://vercel.com/docs/functions/limitations),
[Vercel pricing](https://vercel.com/pricing),
[Workers limits](https://developers.cloudflare.com/workers/platform/limits),
[Cloud Run pricing](https://cloud.google.com/run/pricing),
[Netlify Free plan](https://www.netlify.com/blog/introducing-netlify-free-plan/),
[Render free tier](https://justinmckelvey.com/blog/is-render-free),
[Railway, Render and Fly compared](https://techsy.io/en/blog/railway-vs-render-vs-fly-io),
[self-hosted PaaS costs](https://www.buildmvpfast.com/blog/coolify-vs-vercel-hosting-cost-comparison-self-hosted-2026).

Databases: [D1 limits](https://developers.cloudflare.com/d1/platform/limits/),
[Turso pricing](https://comparedge.com/tools/turso/pricing),
[Neon free quotas](https://github.com/neondatabase/website/blob/main/content/faqs/free-plan-limits-and-quotas.md),
[Supabase pricing](https://supabase.com/pricing),
[PlanetScale and Xata free tier retirements](https://layerbase.com/blog/planetscale-free-tier-alternatives).

Storage: [R2 pricing](https://developers.cloudflare.com/r2/pricing/),
[object storage compared](https://cloudzat.com/object-storage/).

CMS: [Payload, Strapi and Directus licensing](https://trybuildpilot.com/665-payload-vs-strapi-vs-directus-2026),
[hosted CMS free tiers](https://nayankyada.com/blog/headless-cms-pricing-comparison-2026-sanity-vs-contentful-vs-payload-vs-strapi),
[Payload D1 template](https://github.com/payloadcms/payload/tree/main/templates/with-cloudflare-d1).

ATS and distribution: [Zoho Recruit pricing](https://costbench.com/software/ats/zoho-recruit/),
[ATS pricing guide](https://www.selectsoftwarereviews.com/blog/recruitment-software-pricing),
[Google for Jobs structured data](https://reqcore.com/blog/google-for-jobs-structured-data),
[Indeed XML feeds](https://clarity-hire.com/blog/indeed-google-jobs-xml-feed-explained).

Email and auth: [transactional email compared](https://www.sequenzy.com/blog/best-transactional-email-services),
[Resend pricing](https://resend.com/pricing),
[Better Auth, Clerk and Auth.js compared](https://makerkit.dev/blog/tutorials/better-auth-vs-clerk).

Free tier durability: [the free tier graveyard, 2022 to 2026](https://dev.to/karthiii13/the-free-tier-graveyard-every-dev-free-tier-that-died-2022-2026-367a).
