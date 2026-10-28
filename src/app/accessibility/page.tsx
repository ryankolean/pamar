import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { mapUrl, site, telHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accessibility",
  description: `How ${site.legalName} works to keep this website usable for everyone, and how to tell us when something does not work.`,
};

/**
 * DRAFT (SUMMIT-261). Two things need Pamar's confirmation before this page is published: the
 * promise to take an application or a bid by phone or mail, and who answers accessibility
 * reports. See docs/legal/data-handling.md.
 */
const EFFECTIVE_DATE = "October 28, 2026";

const office = site.offices[0];

export default function AccessibilityPage() {
  return (
    <>
      <PageHero
        eyebrow="Accessibility"
        title="Accessibility statement"
        intro="Our work is public infrastructure. This website should be usable by the public, including people who use assistive technology."
      />

      <section className="py-16 sm:py-20">
        <div className="container-page max-w-3xl space-y-10 text-ink-700">
          <p className="text-sm uppercase tracking-widest text-ink-500">
            Effective {EFFECTIVE_DATE}
          </p>

          <div className="space-y-4">
            <p>
              {site.legalName} aims to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at
              Level AA on this website. That is the standard public agencies hold their own sites
              to, and we hold ours to it as well.
            </p>
            <p>
              No one should have to fight this site to reach us, apply for a job, or price a bid. If
              you do, tell us and we will fix it or find another way to get you what you need.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold uppercase text-ink-950">
              What we have built in
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Pages are built from real headings, lists, and landmarks, so a screen reader can
                move through them in order.
              </li>
              <li>
                Every form field has a visible label. Required fields say so, hints sit with the
                field they explain, and errors are tied to the field that caused them instead of
                being announced only by color.
              </li>
              <li>Forms, menus, filters, and links work from the keyboard alone.</li>
              <li>Keyboard focus is visible wherever you land.</li>
              <li>
                Images that carry meaning have text alternatives. Decorative photographs are hidden
                from screen readers instead of being described.
              </li>
              <li>
                Motion on the site respects your system setting. If you ask your device to reduce
                motion, the animations stop.
              </li>
              <li>
                Text reflows when you zoom to 200 percent or widen your browser&rsquo;s default font
                size.
              </li>
              <li>The page language is declared, so screen readers use the right pronunciation.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold uppercase text-ink-950">
              Where we know we fall short
            </h2>
            <p>We would rather name the gaps than claim we have none. As of the date above:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                No independent audit has been done yet. What is written above is our own review, not
                a third party&rsquo;s.
              </li>
              <li>
                There is no &ldquo;skip to content&rdquo; link at the top of the page, so a keyboard
                user tabs through the navigation on every page.
              </li>
              <li>
                Bid documents, plan sets, and addenda are files we receive from owners and
                engineers. They are usually scanned PDFs, and we cannot promise they are tagged for
                screen readers. Call us and we will read one to you or give you the information
                another way.
              </li>
              <li>
                The application form and the bid form need JavaScript. If yours is turned off, use
                the phone number below.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold uppercase text-ink-950">
              Another way in
            </h2>
            <p>
              If a page or a form stops you, you do not have to solve it on your own. Call us and we
              will take your application, your registration, or your bid over the phone or by mail,
              and we will help you fill in whatever the form was asking for. You will not be at a
              disadvantage for not using the website.
            </p>
            <p>
              If you need something on this site in another format &mdash; large print, plain text,
              or read aloud &mdash; ask and we will send it.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold uppercase text-ink-950">
              Tell us what is broken
            </h2>
            <p>
              Reach us by phone, by mail, or through the contact form. It helps if you can tell us
              the page, what you were trying to do, and what device or assistive technology you were
              using &mdash; but report it either way.
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
            <p>
              Information you send us through the contact form is handled as described in our{" "}
              <Link className="font-semibold text-brand-700 hover:underline" href="/privacy">
                privacy policy
              </Link>
              .
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold uppercase text-ink-950">
              How we keep this current
            </h2>
            <p>
              We check accessibility when we change the site, not once a year. When we fix something
              named on this page, we take it off the list and change the effective date at the top.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
