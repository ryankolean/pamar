import type { NextConfig } from "next";
import { legacyRedirects } from "./src/lib/redirects";

/**
 * STATIC_EXPORT=1 builds the static preview for GitHub Pages (.github/workflows/pages.yml):
 * plain HTML under a repository sub-path, no image optimization, no redirects, no proxy.
 */
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(staticExport
    ? {
        output: "export" as const,
        basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
        trailingSlash: true,
        images: { loader: "custom" as const, loaderFile: "./src/lib/image-loader.ts" },
        // Server Actions cannot ship in a static export; the forms get client-side stand-ins.
        turbopack: { resolveAlias: { "@/lib/forms/actions": "./src/lib/forms/actions.static.ts" } },
      }
    : {}),
  experimental: {
    serverActions: {
      // Form uploads (resumes, COI/W-9, bid documents) are sent through Server Actions; the
      // default limit is 1 MB. Keep this just above the largest per-form upload limit in
      // src/lib/forms/files.ts.
      bodySizeLimit: "16mb",
    },
  },
  ...(staticExport
    ? {}
    : {
        async redirects() {
          return legacyRedirects.map((redirect) => ({ ...redirect, permanent: true }));
        },
      }),
};

export default nextConfig;
