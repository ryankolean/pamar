import { eeoStatement, employmentNotices } from "@/content/employment-notices";

/**
 * EEO statement and links to federal employee rights notices, shown near the bottom of every
 * careers page. Copy lives in src/content/employment-notices.ts and is pending client approval
 * (SUMMIT-261).
 *
 * Links open in a new tab so an applicant on /careers/apply does not lose a half-filled form.
 */
export function EmploymentNotices() {
  return (
    <section
      aria-labelledby="employment-notices-heading"
      className="border-t border-ink-100 py-12 sm:py-14"
    >
      <div className="container-page grid gap-8 text-sm text-ink-600 md:grid-cols-2 md:gap-12">
        <div className="space-y-3">
          <h2
            id="employment-notices-heading"
            className="text-base font-bold uppercase text-ink-900"
          >
            {eeoStatement.title}
          </h2>
          {eeoStatement.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="space-y-3">
          <h3 className="text-base font-bold uppercase text-ink-900">Employee rights</h3>
          <p>Federal notices for applicants and employees:</p>
          <ul className="space-y-2">
            {employmentNotices.map((notice) => (
              <li key={notice.href}>
                <a
                  href={notice.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-ink-800 underline hover:text-ink-950"
                >
                  {notice.title}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <span className="block text-ink-500">{notice.agency}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
