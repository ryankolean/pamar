import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { PageHero } from "@/components/ui/page-hero";
import { mapUrl, site, telHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${site.name} about a project, careers, or subcontracting.`,
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let’s talk about your project"
        intro="Send us a message and the right person on our team will get back to you."
      />
      <section className="py-16 sm:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="mb-8 text-2xl font-bold uppercase">Send a message</h2>
            <ContactForm />
          </div>
          <aside className="space-y-8">
            {site.offices.map((office) => (
              <div key={office.name} className="bg-ink-950 p-8 text-white">
                <h2 className="text-lg font-bold uppercase text-white">{office.name}</h2>
                <address className="mt-4 not-italic text-ink-200">
                  {office.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <p className="mt-4 text-ink-200">{office.hours}</p>
                <ul className="mt-6 space-y-2">
                  <li>
                    <a
                      href={telHref(office.phone)}
                      className="font-semibold text-brand-400 hover:underline"
                    >
                      {office.phone}
                    </a>
                  </li>
                  <li>
                    <a
                      href={mapUrl(office.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand-400 hover:underline"
                    >
                      Get directions<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                </ul>
              </div>
            ))}
            <div className="border border-ink-100 p-8">
              <h2 className="text-lg font-bold uppercase">Email</h2>
              <a
                href={`mailto:${site.contact.email}`}
                className="mt-3 block font-semibold text-ink-900 underline"
              >
                {site.contact.email}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
