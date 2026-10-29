# Applicant and subcontractor data handling (SUMMIT-261)

Companion to the drafted privacy policy at `src/app/privacy/page.tsx`. The policy is the public
copy; this file is the internal record of what the site actually does, what retention periods we
propose and why, and what still needs a decision.

Nothing here is published. The policy page is a **draft** until Pamar and counsel confirm the
retention periods and the privacy contact.

## What the site actually collects today

Read from the code, not from assumption. Every form validates server-side, calls
`recordSubmission` (a no-op today, `src/lib/submissions/store.ts`), then emails the result.

| Form                                   | Fields                                                                                                                                                                                             | Uploads                                           | Goes to                        |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------ |
| `/contact`                             | name, email, phone, company, topic, message                                                                                                                                                        | none                                              | `CONTACT_TO_EMAIL`             |
| `/careers/apply`                       | position, name, email, phone, experience, certifications, message, accuracy confirmation                                                                                                           | resume (PDF/DOC/DOCX, ≤5 MB, required)            | `HR_TO_EMAIL` + applicant copy |
| `/subcontractors/register`             | company name, contact name, title, email, phone, website, street/city/state/ZIP, trades, service area, years in business, business certifications, bonding capacity, insurance confirmation, notes | COI (PDF, ≤5 MB), W-9 (PDF, ≤5 MB), both optional | `ESTIMATING_TO_EMAIL`          |
| `/subcontractors/opportunities/<slug>` | submission type, company name, contact name, email, phone, trades priced, bid amount, notes                                                                                                        | bid document (PDF, ≤15 MB)                        | `ESTIMATING_TO_EMAIL`          |

Processors in the code path:

- **Resend** (`src/lib/email/index.ts`) — carries every submission, including attachments.
- **Cloudflare Turnstile** (`src/lib/forms/spam.ts`) — sees IP and browser signals when
  `TURNSTILE_SECRET_KEY` / `NEXT_PUBLIC_TURNSTILE_SITE_KEY` are set.
- **Google Analytics 4** (`src/lib/analytics.ts`) — only when `NEXT_PUBLIC_GA_ID` is set. Events
  are conversion flags (`application_submitted` and friends); no form field values are sent.
- Fonts are self-hosted via Fontsource, so no font CDN sees visitors.
- `mapUrl()` builds an outbound Google Maps link. Nothing is requested from Google until a visitor
  clicks it.

Two facts worth keeping in view: a **W-9 carries a taxpayer identification number, often a Social
Security number**, and today it reaches Pamar as an email attachment with no storage layer and no
access log. SUMMIT-236 (object storage, signed URLs) and SUMMIT-237 (submission store) are where
that gets fixed; the policy as drafted does not promise more than email delivery actually provides.

## Proposed retention schedule

Proposed, not confirmed. Rationale given so counsel can agree or correct.

| Record                                | Proposed                                                        | Why                                                                                                                                                                                                                                                    |
| ------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Applications and resumes (not hired)  | 2 years from application date                                   | 29 CFR 1602.14 requires 1 year for Title VII/ADA. 41 CFR 60-1.12 requires 2 years for covered federal contractors (1 year if under 150 employees and no contract ≥ $150k). Pamar's MDOT and federal-aid work makes the 2-year figure the safe default. |
| Applications of hired candidates      | Follows the employment record schedule                          | Becomes a personnel record; out of scope for a website policy.                                                                                                                                                                                         |
| Contact messages                      | 2 years                                                         | Business correspondence; no statutory floor. Matches the application period so one mailbox rule covers both.                                                                                                                                           |
| Subcontractor registrations, COI, W-9 | Active or prospective status, then ≥ 4 years after last payment | IRS requires employment/payee records 4 years after the tax is due or paid; COI must be retrievable for the claim tail.                                                                                                                                |
| Bids and intents to bid               | 7 years after project close, with the project record            | Matches typical construction contract and audit retention; aligns bid files with the job file.                                                                                                                                                         |
| Google Analytics usage data           | Google's property-level retention setting                       | We keep no copy. **The GA4 retention setting itself still needs to be chosen — see open questions.**                                                                                                                                                   |

Deletion is not automated anywhere today; these periods describe mailbox and file practice until
SUMMIT-237 lands a store that can enforce them.

A second document reaches the same two-year figure from the same two regulations:
`docs/applicant-data-security.md` (on branch `claude/platform-decision`, written 2026-10-09). The
numbers agree, so there is no conflict to resolve — but the two files should not both grow into
retention records. That one is the storage-and-tooling analysis; this one is what the published
policy rests on. One thing it adds that belongs here: the Department of Labor proposed rescinding
the 41 CFR Part 60-1 regulations in July 2025, and as of 2026 they remain on the books unenforced
while the rulemaking runs. That does not move the number — the 29 CFR 1602.14 one-year EEOC floor
is untouched and two years is safe under either reading — so the table stands as written. Counsel
should be told the rulemaking is open rather than discover it later.

## Consent approach

Employment and procurement use is consent-by-notice, not opt-in. What landed:

- `PrivacyNote` (`src/components/forms/fields.tsx`) sits above the submit button on all four
  forms and links to `/privacy`. Wording is per-form so the sentence names what is being sent.
- The application form keeps its existing required checkbox, which confirms accuracy — not
  privacy consent. Those are different claims and should stay separate.
- Footer links to `/privacy` site-wide; `/privacy` is in the sitemap.

Deliberately **not** done, because each is a product decision rather than copy:

- A second required "I consent to the processing of my data" checkbox. Only worth adding if Pamar
  wants a recorded consent artifact per submission; it needs a schema field and a stored record to
  mean anything (SUMMIT-237).
- A cookie banner or GA4 consent mode. No US rule compels one here. If Pamar wants it, it is a
  dev card: load GA4 behind consent and default `analytics_storage` to denied.

## Security headers — specification for the dev card

Not implemented in this branch: `next.config.ts` headers are code, and this card ran as a content
routine. The values below are derived from the third parties the code actually loads, so the spec
can be applied as-is.

```ts
// next.config.ts — add alongside redirects(); skipped in the STATIC_EXPORT build.
const csp = [
  "default-src 'self'",
  // 'unsafe-inline' is required by the inline ga4-init script in src/components/analytics/
  // google-analytics.tsx and the js-detection script in layout.tsx. Dropping it means moving
  // both behind a nonce.
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://www.googletagmanager.com",
  "font-src 'self'",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com",
  "frame-src https://challenges.cloudflare.com",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

async headers() {
  return [
    {
      source: "/:path*",
      headers: [
        { key: "Content-Security-Policy", value: csp },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
        },
      ],
    },
  ];
}
```

Three constraints on whoever implements it:

1. `headers()` does nothing in the `STATIC_EXPORT=1` GitHub Pages preview. On static hosting the
   headers have to come from the host. The production platform is no longer open-ended:
   `decisions/0001-production-platform.md` (on branch `claude/platform-decision`, SUMMIT-260)
   recommends Cloudflare Workers via the OpenNext adapter, which runs Next as a server — so the
   `next.config.ts` block above applies as written, with no host-level rule needed. That decision
   is **Proposed**, not approved: it still waits on Ryan and on two answers from Pamar. If it is
   approved, this spec is the whole job; if production ends up static, the same values have to be
   restated as host rules instead.
2. Add `preload` to HSTS only after every subdomain of pamarenterprises.com serves HTTPS.
   Preloading is hard to reverse.
3. Verify with the real GA4 and Turnstile keys enabled, not just locally with both unset — the CSP
   only gets exercised when those scripts actually load.

## Open questions for Ryan and Pamar

1. **Privacy contact.** `site.contact.email` (`info@pamarenterprises.com`) is still marked
   PLACEHOLDER. The drafted policy therefore routes requests to the published phone number, the
   office address, and the contact form. Confirm an address and the policy can name it.
2. **Retention periods.** Does counsel accept the table above, in particular 2 years for
   applications and 7 years for bid files?
3. **OFCCP coverage.** Is Pamar a covered federal contractor, and does it have 150+ employees?
   That decides whether the application floor is 1 or 2 years.
4. **CCPA/CPRA.** Does Pamar meet any California threshold (revenue, or personal information on
   100k+ consumers)? If yes the policy needs a rights section and a "do not sell" statement. The
   draft asserts no sale of data but claims no California-specific rights.
5. **GA4 retention setting.** 2 months or 14 months, and is GA4 live at launch at all
   (`NEXT_PUBLIC_GA_ID`)?
6. **Resend retention.** Confirm how long Resend keeps message content and attachments, and
   whether a DPA is on file. Resumes and W-9s pass through it.
7. **Production host.** Proposed as Cloudflare Workers in
   `decisions/0001-production-platform.md` (branch `claude/platform-decision`), awaiting Ryan's
   approval. Needed before the security headers can be applied, and the policy's HTTPS statement
   depends on it.
8. **Effective date.** The draft says October 27, 2026. Set it to the publication date.

## Accessibility statement (`src/app/accessibility/page.tsx`)

The card asks for an accessibility statement alongside the privacy policy, with both linked from
every page. The statement is drafted and linked; this is the record behind it.

Claims in the draft, and what each one rests on:

| Claim                                   | Basis in the code                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------------ |
| Headings, lists, landmarks              | `src/app/layout.tsx` renders `<main id="main">`; sections use `aria-labelledby`      |
| Labels, hints and errors tied to fields | `src/components/forms/fields.tsx` — `htmlFor`, `aria-invalid`, `describedBy()`       |
| Visible focus                           | `:focus-visible` rule in `src/app/globals.css`                                       |
| Decorative images hidden                | `PageHero` photo is `alt=""` with an `aria-hidden` overlay                           |
| Motion respects the system setting      | `prefers-reduced-motion` in `globals.css` plus `reveal-observer.tsx`, `count-up.tsx` |
| Page language declared                  | `<html lang="en">` in `src/app/layout.tsx`                                           |

Gaps the draft names on the page rather than hiding:

1. No independent audit. Everything above is our own reading of the code.
2. No skip-to-content link. `<main id="main">` already exists, so this is a few lines in
   `site-header.tsx` plus a `.sr-only`/`:focus` style — a dev card, not a copy change.
3. Owner- and engineer-supplied PDFs (plan sets, addenda, bid documents) are usually scans and are
   almost certainly untagged. We do not control them, so the statement offers a phone alternative.
4. `/careers/apply` and the bid form need JavaScript.

Two claims need Pamar's confirmation before this page goes live, because they commit staff to
something:

- **The phone and mail alternative.** The draft says Pamar will take an application, a
  registration, or a bid by phone or mail and help the caller complete it. Standard practice for a
  public-agency contractor, but it is a commitment, not a description of code.
- **Who answers.** Reports route to the published phone number, the office address, and the
  contact form, for the same reason the privacy policy does — `site.contact.email` is still
  PLACEHOLDER. Confirm whether accessibility reports should reach a named person.

Also unresolved: the statement's effective date reads October 28, 2026 and should be set to the
publication date, and WCAG 2.1 AA is asserted as a target, not as verified conformance. A real
audit (axe or Lighthouse in CI, plus a keyboard and screen-reader pass) is a separate card; the
repo has no accessibility test today.

## Breakpoint verification

Both drafted pages were checked in a real browser on 2026-10-29, which the two earlier passes
recorded as not done. Headless Chromium against `next dev` on port 3011, viewports 375, 768 and
1280, on `/privacy`, `/accessibility`, `/careers/apply` and `/about` — the last as a page neither
this card nor its branch touches, so the footer change is shown to reach pages outside the diff.

All twelve route and width combinations: HTTP 200, no horizontal overflow
(`documentElement.scrollWidth === clientWidth` at every width), both footer links present,
`<html lang="en">` and `<main id="main">` present, no console or page errors.

One console error appeared on the first load of `/careers/apply` at 375 and did not reproduce: a
React hydration mismatch over `style="caret-color: transparent"` on every input. `caret-color`
appears nowhere in `src/` and nowhere in the served HTML, and three repeat runs found zero inputs
carrying it. It was injected into the DOM by the automation environment on first launch, not by
the site. Recorded here because a future run may see it again and should not go hunting.

Not covered: no screen-reader or keyboard pass, and no axe or Lighthouse run. WCAG 2.1 AA stays a
stated target, not verified conformance.
