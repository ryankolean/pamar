import Link from "next/link";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

/** Text wordmark. PLACEHOLDER until the client's logo files arrive (SUMMIT-228). */
export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3"
      aria-label={`${site.name} home`}
    >
      <span aria-hidden="true" className="block h-8 w-2 bg-brand-500" />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-2xl font-bold uppercase tracking-wide",
            inverse ? "text-white" : "text-ink-950",
          )}
        >
          Pamar
        </span>
        <span
          className={cn(
            "font-display text-[0.65rem] uppercase tracking-[0.35em]",
            inverse ? "text-ink-300" : "text-ink-500",
          )}
        >
          Enterprises
        </span>
      </span>
    </Link>
  );
}
