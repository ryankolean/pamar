import { serializeJsonLd } from "@/lib/seo";

/** Inline structured data. See https://nextjs.org/docs/app/guides/json-ld */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
