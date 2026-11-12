# 0001: Production platform

- **Jira:** [SUMMIT-260](https://ryan-kolean.atlassian.net/browse/SUMMIT-260)
- **Status:** Proposed. The adapter proof is done; still needs Ryan's approval and two
  answers from Pamar (marked below).
- **Date:** 2026-10-08, adapter proof 2026-10-09
- **Blocks:** SUMMIT-236, SUMMIT-237, SUMMIT-257, SUMMIT-259
- **Full options survey:** [0001-appendix-options-survey.md](./0001-appendix-options-survey.md),
  covering every host, database, storage, CMS, ATS, email and auth option considered
- **Adapter proof:** branch `claude/db-adapter-proof`, see its `PROOF.md`. Both adapters
  work; Turso is the easier one; the measured worker bundle is 19.2 MiB uncompressed

## Standing constraint: fully managed, no servers to administer

Summit does not run machines. Every component here has to be a managed or serverless service that
someone else patches, backs up and keeps alive. That rules out a VPS with Coolify or Dokploy, and
self-hosted Postgres on a box, regardless of what they cost. It is a standing rule, not a judgment
call for this project, so the options below are scored against it rather than re-arguing it.

The recommendation already satisfies it: Workers, Turso, R2, Resend and Turnstile are all managed.
Nothing in it is a server Summit keeps running.

One wording trap, because it reads the wrong way: Payload, Strapi and Better Auth get called
"self-hosted" in their own docs. That means self-operated as opposed to a vendor SaaS, not a
machine to administer. Payload is a library that runs inside this Next app on Workers. Adopting it
adds no server.

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

Workers Paid via the OpenNext adapter, Turso for the database, R2 for private files, Payload for
the CMS, staff sign-in and the applicant records, Resend for email, Turnstile for spam. Everything
but the $5 Workers plan sits on a free tier.

- The framework's hosting rule already defaults to Cloudflare (`docs/STACK_DECISION.md`), and
  Turnstile is wired in this repo, so the Cloudflare account exists either way.
- One account covers DNS, headers, redirects, Turnstile and R2.
- The 100 MB body limit means today's upload code ships unchanged.
- Cheapest of the four. With Turso and the R2 free tier, the Workers Paid plan is the only line
  item.
- **Proven, not assumed.** The adapter proof on `claude/db-adapter-proof` built this stack,
  migrated the real schema, and drove a draft-to-publish-to-application workflow against both D1
  on workerd and libSQL on Node, with identical results. The measured worker bundle is 19.2 MiB
  uncompressed against a 64 MiB limit.
- **Known cost:** adopting Payload ends the GitHub Pages static preview, because Payload's API
  routes are incompatible with `output: "export"`. The preview moves to a Cloudflare preview
  environment. See the proof's `PROOF.md` for the full prerequisite list, including the Next pin
  at 16.3.8 and the move to a webpack build.

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

Google Cloud Run's Always Free tier for hosting, Turso Free for the database, R2's free tier for
files, Payload, Resend Free, Turnstile. Genuine total: $0 a month.

This was worth checking properly, because most of the stack is already free at Pamar's scale. The
result is that only two layers are in question, and only one of them is close.

| Layer                | Free option             | Verdict                                                                                                                                                                                                                                                                |
| -------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hosting              | Vercel Hobby            | **Disqualified.** Hobby prohibits commercial use, and the fair-use wording covers the contractor who built the site, not just the owner. A client site cannot sit on it.                                                                                               |
| Hosting              | Cloudflare Workers Free | **Disqualified for this app.** 10 ms of CPU per request. A server-rendered React page does not render in 10 ms, so SSR on Cloudflare is a paid-plan feature.                                                                                                           |
| Hosting              | Google Cloud Run        | **Viable, and the best of them.** Always Free covers 2M requests, 180k vCPU-seconds and 360k GB-seconds a month and does not expire. 32 MiB request cap clears the bid document. Cold starts from zero, and a billing account absorbs overage rather than refusing it. |
| Hosting              | Netlify Free            | **Viable.** Commercial use is explicitly allowed and Next SSR is supported. Costs below.                                                                                                                                                                               |
| Hosting              | Render Free             | **Disqualified.** Spins down after 15 minutes idle with a 30 to 60 second cold start. A client careers page cannot open like that.                                                                                                                                     |
| Hosting              | GitHub Pages            | Already the preview host. Static only: no 301s, no response headers, no server actions. Not a production option, which is what started this ticket.                                                                                                                    |
| Database             | Supabase Free           | **Disqualified.** Free projects pause after one week with no API requests. A careers page that returns 500 because nobody applied for eight days is not shippable.                                                                                                     |
| Database             | Neon Free               | **Viable with a cliff.** 0.5 GB and 100 CU-hours per project per month, compute scales to zero after 5 minutes idle. Passing the CU-hour quota disables compute for the rest of the month.                                                                             |
| Database             | Cloudflare D1           | **Viable.** 5 GB, 5M rows read and 100k written per day, no pausing. Since September 2026 queries past the daily cap fail outright rather than being absorbed. Only reachable from a Worker.                                                                           |
| Database             | Turso                   | **Viable, and more generous.** 5 GB, 500M rows read and 10M written a month, speaks HTTP so it is not host-locked, and rides Payload's more established SQLite adapter rather than the beta D1 one.                                                                    |
| Database             | PlanetScale, Xata       | **Gone.** Both retired their free tiers, in April 2024 and 2025. Listed because they are still widely recommended in older posts.                                                                                                                                      |
| Private file storage | Cloudflare R2 free tier | **Sufficient for years.** 10 GB stored, 1M Class A operations, free egress. Resumes and bid PDFs will not approach it.                                                                                                                                                 |
| Email                | Resend Free             | **Sufficient.** 3,000 a month, 100 a day, 3 custom domains. Form notifications are nowhere near that.                                                                                                                                                                  |
| Staff sign-in        | Payload auth            | Free at every tier. Runs inside the app, no per-seat cost and no server to administer.                                                                                                                                                                                 |
| CMS and admin        | Payload                 | Open source, and runs inside the app rather than on a box of ours. Free at every tier.                                                                                                                                                                                 |
| Spam protection      | Turnstile               | Free at this scale.                                                                                                                                                                                                                                                    |

So the $0 bundle is real: **Cloud Run plus Turso**, with R2, Resend and Turnstile free alongside.
Cloud Run is the better of the two free hosts because it has no deploy budget and its 32 MiB
request cap clears the 15 MB bid document, where Netlify's roughly 6 MB cap would force the
presigned upload rework before launch. Its two costs:

1. **Cold starts.** Cloud Run scales to zero, so the first request after an idle period pays
   container start-up. Acceptable on a careers page, noticeable.
2. **A billing account is on file.** The Always Free tier does not refuse work past the quota, it
   bills for it. The failure mode is a surprise invoice rather than an outage, which is the better
   of the two but still a surprise.

And the free database options each carry a cliff: Neon Free disables compute for the rest of the
month past 100 CU-hours, and D1 fails queries past its daily cap. Turso's quota is generous enough
that it is unlikely to bind, which is why it is the pick for this column.

The judgment: free is the right call on Summit's own projects, where an outage costs an apology.
This system holds employment applications and personal data for a paying client, and Summit is the
one who gets the phone call when a quota trips or a vendor retires a tier. Heroku, PlanetScale and
Xata all cut free plans out from under production users between 2022 and 2025, PlanetScale with
about a month's notice. Five dollars a month removes that whole class of problem.

What the free research did change is the recommendation's cost: swapping Neon for D1 or Turso and
leaning on the R2, Resend and Turnstile free tiers takes option A from about $15 a month to **$5**,
which is the Workers Paid plan and nothing else. The gap between free and recommended is now one
plan fee.

## Decisions

Every row in the SUMMIT-260 table, with its reason.

| Concern              | Decision                                                | Reason                                                                                                                                                                                                                                                                                                                                                         |
| -------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hosting              | Cloudflare Workers Paid via OpenNext                    | Framework default, one account with Turnstile, D1, R2 and DNS, 100 MB request bodies, lowest cost. The $5 plan is required because Workers Free allows 10 ms CPU per request and SSR does not fit in it.                                                                                                                                                       |
| Database             | **Turso**, settled by the proof                         | Both adapters work and behave identically, so this came down to friction. D1 has no connection string: it needs top-level await and wrangler's proxy to resolve a binding, and it forces a serialised build because parallel page-data collection deadlocks on the local D1 file. Turso is a URL and a token with none of that. Fallback is Neon at $5 to $15. |
| Private file storage | Cloudflare R2, signed URLs with a short expiry          | Same account as the host, no egress charges, and resumes must never be publicly addressable.                                                                                                                                                                                                                                                                   |
| Staff sign-in        | Payload's built-in auth, email and password, with roles | No extra vendor or per-seat cost. Revisit only if Pamar wants single sign-on (open question 1).                                                                                                                                                                                                                                                                |
| CMS and admin        | Payload, in the same Next app on the same database      | Gives SUMMIT-237 (content), SUMMIT-259 (draft, review, publish) and most of SUMMIT-257 (applicant list views) from one choice. Runs inside the app, so it adds no server to administer and no per-seat fee. Payload supports Next 16.3.3+; this repo is on 16.3.6.                                                                                             |
| Applicant tracking   | Build in the Payload admin                              | Free ATS plans cap at one open job (Zoho Recruit, BreezyHR) and paid ones start near $189 a month, 38x this stack. Applications become a Payload collection with status, notes and an owner. Keeping postings on Pamar's own domain also feeds Google for Jobs, which is free and crawls `JobPosting` JSON-LD from the site itself.                            |
| Email                | Keep Resend, add SPF and DKIM on pamarenterprises.com   | Already wired in `src/lib/email`. Deliverability of application notifications depends on the DNS records, which Pamar has to add (open question 2).                                                                                                                                                                                                            |
| Spam protection      | Turnstile, keys added at launch                         | Already wired in `src/lib/forms/spam.ts`.                                                                                                                                                                                                                                                                                                                      |

## Monthly running cost

Prices checked 2026-10-08. Sources at the bottom.

| Service            | Plan      | Expected | Notes                                                                                                                                                                                                        |
| ------------------ | --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Cloudflare Workers | Paid      | $5       | The only line item. Flat, and covers this site's request volume many times over. Required because Workers Free caps CPU at 10 ms per request, which SSR exceeds.                                             |
| Turso              | Free tier | $0       | 5 GB, 500M rows read and 10M written a month. A contractor's job postings, applications and bid packages will not approach it. Chosen over D1 by the adapter proof: same behaviour, far less build friction. |
| Cloudflare R2      | Free tier | $0       | 10 GB stored, 1M Class A operations, free egress. Standard storage is $0.015 per GB-month after that, so even passing it costs cents.                                                                        |
| Resend             | Free      | $0       | 3,000 a month and 100 a day. Form notifications are far below that; the daily cap is the one to watch if a bid deadline ever fans out.                                                                       |
| Turnstile          | Free      | $0       |                                                                                                                                                                                                              |
| **Total**          |           | **$5**   | Rising to $10 to $20 only if Turso is later swapped for Neon.                                                                                                                                                |

For comparison: a genuinely free build (option D) is $0, and option B on Vercel is $30 to $45,
because Vercel Pro is $20 per developer seat per month and commercial projects cannot stay on
Hobby.

At $5 a month this is noise against the retainer, so it should ride the retainer rather than be
billed to Pamar, which also keeps the accounts in Summit's control. Noted for SUMMIT-263.

## Accounts to create, and who owns them

Accounts go in Pamar's name wherever the account holds Pamar's data or DNS, so nothing is hostage
to Summit's billing. Summit holds the accounts that are purely build infrastructure.

| Account                                  | Owner                                           | Why                                                                                                     |
| ---------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Cloudflare (DNS, Workers, R2, Turnstile) | Pamar, Summit added as a member                 | It holds the domain and the applicant files. Pamar must be able to revoke our access and keep the site. |
| Turso                                    | Pamar, Summit as a member                       | Holds applicant and subcontractor data. Neon instead, if it is ever swapped in.                         |
| Resend                                   | Pamar                                           | Sends as their domain, and the DKIM records are theirs.                                                 |
| GitHub repo                              | Summit, transferred on handoff per the contract | Build infrastructure until handoff (SUMMIT-241).                                                        |
| Google Analytics 4                       | Pamar                                           | Already their property.                                                                                 |

## Before this is final

1. ~~**Database adapter proof, half a day.**~~ **Done, 2026-10-09.** Both adapters work and behave
   identically; Turso wins on friction. Branch `claude/db-adapter-proof`, with findings in its
   `PROOF.md`. It also retired the bundle-size question with a measurement (19.2 MiB uncompressed,
   4.3 MiB gzipped) and surfaced six prerequisites that apply to Payload regardless of adapter,
   the two largest being that the package becomes ESM and that the GitHub Pages static preview
   has to move to Cloudflare.
2. **Largely answered by DNS, worth one confirmation from Virgil.** There is no Microsoft 365 or
   Google Workspace signal on the domain (see "What the DNS says" below), so Payload's own auth
   stays the plan. Proofpoint masks the mailbox provider, so confirm rather than assume. If Pamar
   turns out to be on M365, the staff auth row changes to Better Auth with that provider. (Better
   Auth, not Auth.js: the Auth.js team joined Better Auth in late 2025.)
3. ~~**Who controls DNS?**~~ **Answered, with a correction.** The zone is at Bluehost and
   HostMonster, not at the website vendor. See "What the DNS says" below. What remains is a
   people question, not a technical one: get Pamar to confirm who holds the Bluehost login.
4. **Ryan's call:** $5 a month on the retainer, or the $0 build in option D with its outage modes.

The earlier draft of this record carried a fifth item, a proof that Payload's admin fits inside a
Worker. Cloudflare removed the 3 MiB free and 10 MiB paid compressed bundle caps in September 2026
and now checks only an uncompressed 64 MiB limit, on every plan. The concern no longer applies.

## What the DNS says

Looked up 2026-10-09. Ryan's understanding was that webascender.com handles the domain. The
website, probably; the DNS, no. Worth separating, because the cutover depends on getting the
distinction right.

| Record                | Value                                                                                                     | What it means                                                                                                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Registrar             | Bluehost Inc.                                                                                             | Not the website vendor. Whoever holds this login controls the cutover.                                                                                                         |
| Nameservers           | `ns1`/`ns2.hostmonster.com`                                                                               | HostMonster, same parent as Bluehost (Newfold). Authoritative DNS lives here.                                                                                                  |
| Registrant            | an individual's name, no organisation                                                                     | A person, not Pamar Enterprises. See the risk below.                                                                                                                           |
| Created / expires     | 2001-06-13 / 2027-06-13                                                                                   | A 25-year-old domain. All of Pamar's search equity is in it.                                                                                                                   |
| A record              | `199.16.172.151` (Pressable)                                                                              | Managed WordPress hosting. Consistent with an agency-built site, and with the WPBakery and "Simple Job Board" assets already captured in `docs/brand/source/`.                 |
| MX                    | `mxa`/`mxb-0095a102.gslb.pphosted.com`                                                                    | Proofpoint Essentials, a filtering gateway in front of the real mail server.                                                                                                   |
| SPF                   | `ip4:173.167.13.49 ip4:65.183.171.35 include:_spf.psm.knowbe4.com include:spf-0095a102.pphosted.com -all` | Comcast and 123.Net (a Michigan ISP) addresses, which look like on-premises mail rather than a cloud tenant. KnowBe4 means somebody runs security awareness training for them. |
| DMARC                 | **none**                                                                                                  | No `_dmarc` record exists.                                                                                                                                                     |
| M365 / Google markers | **none found**                                                                                            | No `autodiscover`, `msoid`, `enterpriseregistration`, `selector1`/`selector2._domainkey`, or `google._domainkey`.                                                              |

Three things follow.

**The website vendor and the DNS holder are probably different parties.** Pressable hosting fits a
WordPress agency; the zone sits at Bluehost and HostMonster. So "ask Web Ascender" may not be the
route to an SPF record. The question for Pamar is narrower and more useful: _who has the Bluehost
login?_ It could be Pamar, the web vendor, or whoever set up Proofpoint and KnowBe4.

**Staff single sign-on is probably not on the table, which is the answer the record wanted.** No
M365 or Google Workspace markers, and mail egresses from what look like on-premises servers on two
Michigan ISPs. Payload's own auth stays the right call. This is strong evidence rather than proof,
because Proofpoint sits in front and hides the backend, so it is still worth one question to
Virgil before the admin is built.

**Adding Resend needs an SPF edit, and DMARC is missing.** SPF ends in `-all`, so mail from an
unlisted sender is told to fail. Resend has to be added to that record or every application
notification is rejected. While the zone is open, Pamar should also get a `_dmarc` policy: they
have strict SPF and no DMARC today, which is the combination that gets legitimate mail quarantined
and leaves the domain spoofable. That is a small, concrete win Summit can hand them early.

### Two risks to raise, not to solve here

- **The domain is registered to a person, not to Pamar Enterprises.** On a domain created in 2001
  that carries all of their search equity, that is a continuity problem independent of this
  project. Worth raising under SUMMIT-263 and the handoff in SUMMIT-241: the registrant should be
  the company, with Pamar holding the registrar account.
- **The cutover depends on cooperation from the incumbent.** If the existing site is Web Ascender's
  work, Summit is replacing a live vendor, and that vendor may be in the path of DNS or hosting
  changes. Sequence it so nothing depends on their goodwill at the last minute: get the Bluehost
  credentials confirmed, lower the TTL well before cutover, and keep the preview on Summit
  infrastructure until the switch.

## Consequences

- `STATIC_EXPORT` stays as it is. The GitHub Pages preview remains the client review link until
  cutover, and the production build drops the flag, which turns `legacyRedirects` back on.
- `recordSubmission` in `src/lib/submissions/store.ts` becomes a Payload write. The handlers and
  every page stay as they are, because dependencies are already injected.
- File uploads move to presigned R2 URLs as a scheduled improvement rather than a launch blocker.
- **Deploys and migrations run in GitHub Actions, not from a laptop.** The repo already deploys
  on a schedule through `deploy.yml`, so this follows the existing pattern: CI runs the OpenNext
  build, applies `payload migrate`, then deploys the worker. Nothing requires a local
  `wrangler deploy`, and no state lives on anyone's machine. This is also a quiet point in Turso's
  favour: a URL and a token are two CI secrets, whereas D1 migrations from CI need wrangler auth
  and remote bindings.
- Moving DNS to Cloudflare means a nameserver change at Bluehost, away from HostMonster. That is
  the gating step for headers, redirects and the cutover, and it needs whoever holds the Bluehost
  account. Lower the TTL first, and do not schedule it last.
- Two migration tickets fall out of the proof and belong under SUMMIT-262: flip the package to
  ESM and pin Next to 16.3.8 with a webpack build, and move the client preview off GitHub Pages
  onto a Cloudflare preview environment, since Payload's API routes cannot coexist with
  `output: "export"`.
- The four blocked tickets can be written against a known platform: SUMMIT-237 (Payload collections
  and the admin), SUMMIT-259 (draft and publish on the jobs collection), SUMMIT-257 (applications
  collection with status and notes), SUMMIT-236 (a second auth scope for subcontractors plus signed
  document routes).
- A new ticket belongs under SUMMIT-259: `JobPosting` JSON-LD on the job pages, plus those pages in
  the sitemap, so postings appear in Google for Jobs. It is free, there is no paid placement, and
  it only works because the postings live on Pamar's own domain.

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
