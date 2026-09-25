import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

/**
 * Pamar's registered logo (docs/brand/brand-style-guide.html, section 2). public/brand/pamar-logo.png
 * is the supplied master (docs/brand/logo/) with its white background made transparent and the
 * margins trimmed; the untouched master stays alongside it. The artwork is only approved on white,
 * so on dark backgrounds it sits in a white panel rather than being reversed.
 */
export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center", inverse && "bg-white px-3 py-2")}
      aria-label={`${site.name} home`}
    >
      <Image
        src="/brand/pamar-logo.png"
        alt=""
        width={643}
        height={204}
        priority={!inverse}
        className="h-12 w-auto sm:h-14"
      />
    </Link>
  );
}
