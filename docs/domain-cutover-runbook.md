# pamarenterprises.com: transfer and cutover runbook

Moving the domain to Porkbun under Pamar's control, then pointing it at the new site. Written
2026-10-09 against the DNS as it stands (see "What the DNS says" in
[decisions/0001-production-platform.md](../decisions/0001-production-platform.md)).

**The biggest risk here is not the website. It is Pamar's email.** Their mail runs through
Proofpoint to what look like on-premises servers. A DNS move that drops or mistypes an MX or SPF
record takes down a construction company's email, and nobody notices a missing web redirect the
way they notice that. Every step below is ordered around not doing that.

## Sequence, and the trap in it

ICANN locks a domain from transferring for 60 days after a **change of registrant**, as well as
for 60 days after a transfer. The record recommends moving the registrant from an individual to
Pamar Enterprises. Done in the wrong order, that blocks the Porkbun transfer for two months.

**Transfer first, correct the registrant second.** Do not let anyone "tidy up" the WHOIS contact
at Bluehost on the way out.

1. Confirm who holds the Bluehost login, and that Pamar authorises the transfer.
2. Inventory the current zone (below). Do this before touching anything.
3. Lower TTLs at Bluehost, while the zone is still live there.
4. Unlock the domain at Bluehost, disable WHOIS privacy if on, get the EPP/auth code.
5. Start the transfer into Porkbun. Expect 5 to 7 business days.
6. Recreate the full zone at Porkbun **before** the nameservers change hands.
7. Verify mail still flows. Only then touch the website records.
8. Cut the website over.
9. Correct the registrant to Pamar Enterprises, after the transfer has settled.

## 1. Inventory first

Capture the live zone before anything changes, and keep the output in the repo or the intake
folder. Current state for reference:

| Record      | Value                                                                                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| Registrar   | Bluehost                                                                                                         |
| Nameservers | `ns1.hostmonster.com`, `ns2.hostmonster.com`                                                                     |
| A (apex)    | `199.16.172.151` (Pressable)                                                                                     |
| MX          | `0 mxa-0095a102.gslb.pphosted.com`, `10 mxb-0095a102.gslb.pphosted.com` (Proofpoint)                             |
| SPF         | `v=spf1 ip4:173.167.13.49 ip4:65.183.171.35 include:_spf.psm.knowbe4.com include:spf-0095a102.pphosted.com -all` |
| Other TXT   | KnowBe4 site verification                                                                                        |
| DMARC       | none                                                                                                             |

```bash
for t in SOA NS A AAAA MX TXT CAA; do echo "== $t"; dig +noall +answer $t pamarenterprises.com; done
for h in www mail autodiscover remote vpn ftp webmail portal _dmarc; do
  dig +noall +answer A "$h.pamarenterprises.com"; dig +noall +answer CNAME "$h.pamarenterprises.com"
done
```

Run the subdomain sweep wider than feels necessary. A construction company is likely to have a
host or two pointed at an office: a VPN endpoint, a camera system, a project portal. Those do not
appear in a web inventory and they break silently. **Ask Pamar and their IT support what else
resolves under this domain before assuming the sweep is complete.**

## 2. Lower TTLs early

At Bluehost, while it still serves the zone, drop TTLs to 300 seconds on everything you intend to
change. Do this at least 24 hours before the cutover so the old TTLs have expired everywhere. This
is what makes a rollback fast instead of a day-long wait.

## 3. Transfer to Porkbun

At Bluehost: unlock the domain, turn off WHOIS privacy if it is on, and request the EPP/auth code.
It usually arrives by email to the registrant address, which is a person's address, not a Pamar
group alias. Make sure someone is watching that inbox.

At Porkbun: start the transfer with the auth code. Approve the confirmation email. Transfers run
5 to 7 business days, though they often complete sooner once the losing registrar approves.

The domain keeps resolving from HostMonster throughout. A registrar transfer does not move DNS by
itself, which is the property that makes this safe.

## 4. Rebuild the zone at Porkbun before switching nameservers

Recreate every record from the inventory in Porkbun's DNS, verify it by querying Porkbun's
nameservers directly, and only then change the nameservers at the registrar.

```bash
# Replace with the nameservers Porkbun assigns.
dig @curitiba.ns.porkbun.com pamarenterprises.com MX +short
dig @curitiba.ns.porkbun.com pamarenterprises.com TXT +short
```

Mail records to carry across exactly, with no edits in this step:

- both Proofpoint MX hosts, with priorities 0 and 10
- the SPF record, character for character
- the KnowBe4 verification TXT
- any DKIM selector the sweep found

Change SPF only **after** the move is verified, and only to add Resend's include. Changing it
during the move means a mail failure has two possible causes.

## 5. Verify mail before touching the website

After the nameserver change propagates, confirm mail still works before anything else:

- send a message in and out of a Pamar mailbox
- `dig MX pamarenterprises.com` returns both Proofpoint hosts
- SPF resolves and still ends in `-all`
- check with Pamar that nothing in their office lost connectivity

**Rollback:** point the nameservers back at HostMonster. With 300-second TTLs this recovers in
minutes, which is the whole reason for step 2.

## 6. Then cut the website over

Only once mail is confirmed. The web records are the easy part and the reversible part.

### If the target is Cloudflare Workers

Move the zone to Cloudflare rather than Porkbun's DNS, or keep DNS at Porkbun and point at the
Worker. Either way the redirects and security headers in
[decisions/0001-production-platform.md](../decisions/0001-production-platform.md) work, and
`legacyRedirects` in `src/lib/redirects.ts` is served as real 301s.

### If the target is GitHub Pages

Apex domains need **either** the four GitHub A records **or** an ALIAS, never both: extra records
on the apex prevent HTTPS certificate generation.

```
A    @    185.199.108.153
A    @    185.199.109.153
A    @    185.199.110.153
A    @    185.199.111.153
CNAME www  <org>.github.io
```

Porkbun supports ALIAS at the apex, which is the tidier option. Set the custom domain in the
repository's Pages settings, wait for the certificate, then enable Enforce HTTPS.

**Read the section below before choosing this path.** It costs the redirects and rules out the
applicant tracking system.

## What GitHub Pages cannot do for this site

Flagging rather than deciding, because it conflicts with the scope the epic already carries.

1. **No 301 redirects.** `src/lib/redirects.ts` holds eleven legacy redirects, six of them project
   pages that currently live at the root of a domain registered in 2001. On GitHub Pages those
   URLs return 404 instead of redirecting, and whatever ranking they hold is discarded. This is
   the single most expensive consequence, and it is invisible until traffic drops.
2. **No response headers.** No HSTS, no CSP, no `X-Content-Type-Options`.
3. **No server.** No applicant tracking (SUMMIT-257), no staff admin or CMS (SUMMIT-237), no job
   posting review and publish workflow (SUMMIT-259), no subcontractor accounts or protected
   document downloads (SUMMIT-236). Forms are stubs: under `STATIC_EXPORT=1` the server actions
   are swapped for client-side stand-ins that accept input and drop it.
4. **No private file storage.** Resumes and bid documents have nowhere to go.

Points 1 and 2 are exactly why SUMMIT-260 exists. Point 3 is most of the remaining epic.

Cloudflare Workers serves the same static pages for $5 a month, keeps the 301s and the headers,
and is where the dynamic work lands later. Going to Pages first means doing the DNS cutover twice
and losing the legacy URLs in between.

## After the dust settles

- Correct the registrant to Pamar Enterprises, with Pamar holding the Porkbun account and Summit
  added as a user. This is the step that starts a fresh 60-day transfer lock, which is harmless
  once the domain is already where it belongs.
- Add Resend's include to SPF and publish DKIM.
- Publish a DMARC record. There is none today, which with a strict SPF is the combination that
  quarantines legitimate mail and leaves the domain spoofable. Start at `p=none` with a reporting
  address, read the reports, then tighten.
- Restore TTLs to something normal (3600).
- Confirm the old host can be decommissioned, and keep it running until everyone agrees.
