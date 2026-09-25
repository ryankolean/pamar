import { isPreviewMode } from "@/lib/site-mode";

const summitUrl = "https://summitsoftwaresolutions.dev";

/**
 * Preview header shown on review deployments only (SITE_MODE=preview): tells the client who
 * built the preview and that content and forms are not live.
 */
export function PreviewBanner() {
  if (!isPreviewMode()) return null;
  return (
    <div role="note" className="bg-ink-950 text-white">
      <div className="container-page flex flex-col gap-1 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
        <p className="font-semibold">
          <span className="text-brand-400">Website preview</span> prepared by{" "}
          <a
            href={summitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-brand-400 underline-offset-2 hover:text-brand-400"
          >
            Summit Software Solutions
          </a>{" "}
          for Pamar Enterprises
        </p>
        <p className="text-ink-300">Sample content, not yet live. Forms don’t send anything.</p>
      </div>
    </div>
  );
}
