# Applicant submissions: security, retention and the tooling around them

**Working document, not a decision.** Material for the open thinking on job postings and
submission storage. Feeds SUMMIT-261 (applicant data privacy and compliance) and SUMMIT-257
(applicant review and tracking). Written 2026-10-09.

Nothing here depends on where the job postings end up living. The data obligations are the same
whether postings are authored in a CMS, in a hosted ATS, or by hand.

## Start from what is stored today

Worth being blunt about the baseline, because it sets the bar low enough to clear easily.

Right now `recordSubmission` in `src/lib/submissions/store.ts` is a no-op and resumes are
delivered as **email attachments**. In production that means every applicant's resume lives in
one or more staff mailboxes, indefinitely, with no retention policy, no access control beyond
whoever is on the distribution, no audit trail, and no way to delete on request. It is also the
arrangement most small contractors actually run.

So the question is not "is a database secure enough". Almost anything deliberate is an
improvement. The question is which deliberate thing is worth the tooling it needs.

## Classify the data before choosing storage

Three tiers, and they do not want the same treatment:

| Tier                             | What                                                                     | Why it matters                                                                                                                                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sensitive personal**           | Resumes, names, home addresses, phone numbers, work history              | Identifiable personal data. Breach notification obligations attach to it.                                                                                                                                              |
| **Protected, if ever collected** | Voluntary EEO self-identification: race, sex, veteran status, disability | Must be kept **separate from the application** and out of the hands of people making hiring decisions. If Pamar ever collects it, it is a separate store with separate access, not a column on the applications table. |
| **Business documents**           | Subcontractor COI, W-9, bid documents                                    | Commercially sensitive, not personal. Lower bar, but still not public.                                                                                                                                                 |

The careers pages already carry EEO notices from SUMMIT-267. Notices are not the same as
collecting self-identification data, and the site does not collect it today. **If Pamar wants
self-ID collection later, that is its own design conversation**, because the separation rule
changes the schema rather than just the access rules.

## Retention: the number that drives the design

- **EEOC, under Title VII: one year minimum** from the date of the personnel action, for every
  employer. This applies to Pamar regardless of anything else, and it applies to **unselected**
  applicants too, not just hires.
- **OFCCP, for covered federal contractors: historically two years** (one year for contractors
  under 150 employees or without direct federal contracts at or above $150,000). Note that in
  July 2025 the Department of Labor proposed rescinding the 41 CFR Part 60-1 regulations
  containing this, and as of 2026 it remains on the books while the rulemaking runs, with OFCCP
  not enforcing it. **Do not design to the rescission.** The one-year EEOC floor is unaffected.

**Open question for Pamar:** does their public works put them under OFCCP? Municipal water and
road contracts are often federally funded, which is not automatically the same as a direct
federal contract, and the thresholds matter. This is a question for their counsel or HR, not for
us to assume either way. Design for two years and it is safe under both readings.

Retention has a second edge: keeping resumes **longer** than needed is its own liability. A
retention policy means automatic deletion, not just automatic keeping.

## Requirements, independent of vendor

These hold whichever storage wins:

1. **Never publicly addressable.** Private bucket, no public read, no guessable URLs. Downloads
   go through a signed URL with a short expiry, minted per request for an authenticated staff
   user.
2. **Encrypted in transit and at rest.** Table stakes with every managed provider; verify rather
   than assume.
3. **Least privilege by role.** Not every Pamar staff member needs to open resumes. The roles
   already sketched in the adapter proof (admin, hiring manager, editor) are the starting point.
4. **An audit trail on access.** Who viewed or downloaded which resume, and when. This is the
   requirement most often skipped and the one that matters if there is ever a dispute.
5. **Automatic deletion on a schedule**, with a documented policy and a legal-hold exception.
6. **Upload validation.** `src/lib/forms/files.ts` already checks size, extension and magic bytes.
   Add virus scanning before a staff member can download, because a resume inbox is a
   well-understood malware vector.
7. **A deletion path for the applicant.** Michigan has no general consumer privacy act today, so
   this is not strictly compelled, but it is cheap to honour and expensive to retrofit.
8. **A named processor agreement** with whoever holds the data, and knowledge of what region it
   sits in.

## Storage options, compared on security rather than price

| Option                              | Security properties                                                                                                                                          | Tooling you still have to build                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **R2, private bucket, signed URLs** | Encrypted at rest, no public access, signed URLs with expiry, same account as the host. No egress cost, so audit logging downloads is not a billing concern. | Audit log, retention job, virus scanning, access review.                                                                      |
| S3 with the same pattern            | Equivalent, plus mature object-level logging and lifecycle rules that handle retention natively.                                                             | Less: lifecycle policies and CloudTrail cover retention and audit. Costs a second vendor and egress.                          |
| Supabase Storage                    | Row-level security is genuinely good here. Carries the free-tier pause problem and a second vendor.                                                          | Similar to R2.                                                                                                                |
| **Email only (status quo)**         | None of the above. No access control, no retention, no audit, no deletion.                                                                                   | None, which is the point and the problem.                                                                                     |
| Hosted ATS                          | The vendor owns encryption, retention tooling, audit and the DPA, which is real value.                                                                       | Almost none. But free tiers cap at one open job, and paid starts near $189/month, and the posting data leaves Pamar's domain. |

The honest summary: **R2 plus a private bucket and signed URLs meets the requirements, and the
real cost is the four tooling items, not the storage.** S3's lifecycle rules and object logging
would hand us two of those four for free, which is the strongest argument anyone has made for
AWS in this project. Worth weighing if the audit requirement turns out to be firm.

## The tooling, named

This is the part that is easy to underestimate. Payload gives the first two almost free; the rest
is work:

| Need                                            | Payload gives         | Build                                                                                         |
| ----------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------- |
| Applicant list, filters, status pipeline, notes | Yes, by configuration | —                                                                                             |
| Role-based access to collections and fields     | Yes                   | Role matrix for Pamar's actual org                                                            |
| Signed download of a resume                     | No                    | A route that checks the session, mints a short-lived R2 URL, and logs the access              |
| Audit log of views and downloads                | No                    | A collection plus hooks. Append-only, not editable from the admin                             |
| Retention and automatic deletion                | No                    | A scheduled job: purge applications and their objects past the policy, with a legal-hold flag |
| Export for reporting                            | Partly                | CSV export, with self-ID data excluded if it ever exists                                      |
| Virus scanning                                  | No                    | Scan on upload, quarantine on failure                                                         |
| Breach response                                 | No                    | A written plan: who is called, in what order                                                  |

Rough shape: the first two are configuration, the middle four are each a day or two, and virus
scanning depends on the service chosen. That is the real content of SUMMIT-257 and SUMMIT-261,
and it is worth sizing before committing to a posting approach, because **a hosted ATS buys
most of this table and that is what its price is actually for.**

## Questions worth resolving before the posting decision

1. Does Pamar fall under OFCCP? Changes retention from one year to two and raises the
   recordkeeping bar.
2. Will they ever collect EEO self-identification? Changes the schema, not just the policy.
3. How many people at Pamar should be able to open a resume? If the answer is two, role design is
   trivial; if it is "whoever is hiring that week", it needs thought.
4. Is an audit trail a requirement or a nice-to-have? It is the single biggest swing factor
   between building this and buying it.
5. What happens to applications for a job that closed? Auto-archive, auto-delete, or keep for the
   retention window and then purge.

Question 4 is the one I would answer first. If the audit trail is firm, the gap between building
in Payload and buying an ATS narrows considerably.
