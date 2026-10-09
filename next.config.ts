import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
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
    // D1 proof: each route that imports the Payload config spins up its own wrangler
    // platform proxy, and parallel page-data collection makes them contend on the same
    // local D1 file (SQLITE_BUSY). Serialising the build is the workaround under test.
    cpus: 1,
    workerThreads: false,
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
  // Packages with workerd-specific code, per the OpenNext Cloudflare guidance.
  // drizzle-kit is required dynamically by Payload's drizzle adapters for migrations;
  // Turbopack rewrites the specifier and esbuild then cannot resolve it, so keep it external.
  serverExternalPackages: ["jose", "pg-cloudflare", "drizzle-kit"],
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
