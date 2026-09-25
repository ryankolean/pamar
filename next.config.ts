import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Form uploads (resumes) are sent through Server Actions; the default limit is 1 MB.
      // Keep this just above the largest per-form upload limit in src/lib/forms/files.ts.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
