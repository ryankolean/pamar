import { JsonLd } from "@/components/seo/json-ld";
import type { Faq } from "@/content/faqs";
import { faqJsonLd } from "@/lib/seo";

/** Accessible question-and-answer list, with matching FAQPage structured data. */
export function FaqList({ faqs, title = "Common questions" }: { faqs: Faq[]; title?: string }) {
  if (faqs.length === 0) return null;
  return (
    <div className="max-w-4xl">
      <JsonLd data={faqJsonLd(faqs)} />
      <h2 className="text-2xl font-bold uppercase">{title}</h2>
      <div className="mt-6 divide-y divide-ink-100 border-y border-ink-100">
        {faqs.map((faq) => (
          <details key={faq.question} className="group py-5">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
              <span>{faq.question}</span>
              <span
                aria-hidden="true"
                className="font-display text-3xl leading-none text-brand-700 transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 max-w-3xl text-ink-700">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
