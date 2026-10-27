import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { mapUrl, site, telHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.legalName} collects, uses, shares, and retains the information you send through this website.`,
};

/**
 * DRAFT (SUMMIT-261). The retention periods and the privacy contact below need Pamar's and
 * counsel's confirmation before this page is published; see docs/legal/data-handling.md.
 */
const EFFECTIVE_DATE = "October 27, 2026";

const office = site.offices[0];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title="Privacy policy"
        intro="What we collect when you contact us, apply for a job, or register as a subcontractor — and what we do with it."
      />

      <section className="py-16 sm:py-20">
        <div className="container-page max-w-3xl space-y-10 text-ink-700">
          <p className="text-sm uppercase tracking-widest text-ink-500">
            Effective {EFFECTIVE_DATE}
          </p>

          <div className="space-y-4">
            <p>
              {site.legalName} operates this website. This policy covers the information you send us
              through it. It does not cover information you give us on a job site, in a contract, or
              during employment.
            </p>
            <p>
              We collect information for one reason: to answer you, review your application, or
              evaluate your firm for work. We do not sell your information, and we do not use it for
              advertising.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold uppercase text-ink-950">
              What we collect
            </h2>
            <p>Only what our forms ask for, plus basic usage data.</p>

            <h3 className="pt-2 font-semibold text-ink-950">Contact form</h3>
            <p>
              Your name, email address, phone number, company, the topic you choose, and your
              message.
            </p>

            <h3 className="pt-2 font-semibold text-ink-950">Job applications</h3>
            <p>
              The position you apply for, your name, email address, phone number, years of
              experience, the certifications and licenses you check, anything you add in the message
              field, and your resume. Whatever is in the resume you upload is part of your
              application.
            </p>

            <h3 className="pt-2 font-semibold text-ink-950">Subcontractor registration</h3>
            <p>
              Your company name and address, contact name and title, email address, phone number,
              company website, the trades you perform, your service area, years in business, the
              business certifications you check, your bonding capacity, your confirmation of
              insurance, any notes you add, and the certificate of insurance and W-9 you upload. A
              W-9 contains a taxpayer identification number, which may be a Social Security number.
            </p>

            <h3 className="pt-2 font-semibold text-ink-950">Bids and intents to bid</h3>
            <p>
              Your company name, contact name, email address, phone number, the trades you are
              pricing, your bid amount, any notes, and the bid document you upload.
            </p>

            <h3 className="pt-2 font-semibold text-ink-950">Usage data</h3>
            <p>
              When Google Analytics is enabled on this site, it records pages viewed, approximate
              location from your IP address, device and browser type, and whether a form was
              submitted. It does not receive what you typed into a form. Our anti-spam check
              receives your IP address and browser signals so it can tell people from bots.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold uppercase text-ink-950">
              How we use it
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>To reply to your question or request.</li>
              <li>To review your application, interview you, and make a hiring decision.</li>
              <li>
                To evaluate your firm for prequalification, send bid invitations, and award and
                administer subcontracts.
              </li>
              <li>To verify insurance and tax information we are required to collect.</li>
              <li>To keep the forms working and block automated submissions.</li>
              <li>
                To meet recordkeeping obligations that apply to us as a contractor on public work.
              </li>
            </ul>
            <p>
              We send you a confirmation email when you apply for a job. We do not add you to a
              marketing list.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold uppercase text-ink-950">
              Who else sees it
            </h2>
            <p>
              Inside {site.shortName}, only the staff who need it: our office and HR staff for
              applications, and our estimating staff for subcontractor and bid information.
            </p>
            <p>Outside {site.shortName}, we use these services to run the site:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Resend</strong> delivers the email that carries your submission to us,
                including any file you attached.
              </li>
              <li>
                <strong>Cloudflare Turnstile</strong> checks that a submission came from a person.
              </li>
              <li>
                <strong>Google Analytics</strong> measures how the site is used, when it is enabled.
              </li>
            </ul>
            <p>
              We may also share information when a public owner, auditor, or law requires it — for
              example, certified payroll and DBE reporting on publicly funded projects — or with our
              attorneys, accountants, and insurers when they need it to advise us.
            </p>
            <p>
              Fonts and images on this site are served from our own domain, so viewing a page does
              not report you to a third-party content network.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold uppercase text-ink-950">
              How long we keep it
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Applications and resumes:</strong> two years from the date you apply. If we
                hire you, your application becomes part of your personnel record and follows our
                employment record schedule instead.
              </li>
              <li>
                <strong>Contact messages:</strong> two years.
              </li>
              <li>
                <strong>Subcontractor registrations, certificates of insurance, and W-9s:</strong>{" "}
                for as long as your firm is an active or prospective subcontractor, and then at
                least four years after our last payment to you, because tax and contract records
                require it.
              </li>
              <li>
                <strong>Bids and intents to bid:</strong> with the project record, for seven years
                after the project closes.
              </li>
            </ul>
            <p>
              We keep information longer when a claim, audit, or legal hold requires it. We do not
              copy analytics data out of Google Analytics or join it to anything you sent us through
              a form.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold uppercase text-ink-950">
              How we protect it
            </h2>
            <p>
              The site is served over HTTPS. Uploads are limited by size and file type and are
              checked before we accept them. Submissions go to internal {site.shortName} mailboxes,
              and access to those mailboxes is limited to the staff who need it. No system is
              perfect; if you need to send something especially sensitive, call us instead of using
              a form.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold uppercase text-ink-950">
              Cookies and your choices
            </h2>
            <p>
              Google Analytics sets cookies in your browser to count visits. You can block or delete
              cookies in your browser settings, or install Google&rsquo;s Analytics opt-out
              extension. Blocking them does not affect the forms.
            </p>
            <p>
              You can ask us what information we hold about you, ask us to correct it, or ask us to
              delete it. We will do what the law allows, but we cannot delete records we are
              required to keep. Applicants should know that asking us to delete an application
              withdraws it from consideration.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold uppercase text-ink-950">Children</h2>
            <p>
              This site is for people doing business with us and for job seekers. We do not
              knowingly collect information from anyone under 16.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold uppercase text-ink-950">Changes</h2>
            <p>
              If we change this policy, we will change the effective date at the top of this page.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold uppercase text-ink-950">Contact us</h2>
            <p>
              To ask about this policy or about information we hold, reach us by phone, by mail, or
              through our contact form.
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  className="font-semibold text-brand-700 hover:underline"
                  href={telHref(office.phone)}
                >
                  {office.phone}
                </a>
              </li>
              <li>
                <a
                  className="font-semibold text-brand-700 hover:underline"
                  href={mapUrl(office.address)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {site.legalName}, {office.address.join(", ")}
                </a>
              </li>
              <li>
                <Link className="font-semibold text-brand-700 hover:underline" href="/contact">
                  Contact form
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
