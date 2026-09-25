import Link from "next/link";
import { mainNav, site } from "@/lib/site";
import { Logo } from "./logo";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink-950 text-ink-300">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div className="space-y-4">
          <Logo inverse />
          <p className="max-w-xs text-sm">{site.tagline}</p>
        </div>

        {mainNav.length > 0 && (
          <nav aria-label="Footer">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">
              Explore
            </h2>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">
            Contact
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href={`tel:${site.contact.phone.replace(/[^\d+]/g, "")}`}
                className="hover:text-white"
              >
                {site.contact.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.contact.email}`} className="hover:text-white">
                {site.contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-800">
        <p className="container-page py-6 text-xs text-ink-400">
          © {year} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
