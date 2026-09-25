import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { isPreviewMode } from "@/lib/site-mode";

/** Prerendered in the static export (see next.config.ts). */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  if (isPreviewMode()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/careers/apply/thanks", "/subcontractors/register/thanks"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
