import { isPreviewMode } from "@/lib/site-mode";

/** Slim notice shown on preview deployments only (SITE_MODE=preview). */
export function PreviewBanner() {
  if (!isPreviewMode()) return null;
  return (
    <div role="note" className="bg-brand-500 text-ink-950">
      <p className="container-page py-2 text-center text-xs font-semibold sm:text-sm">
        Preview site for review · Sample content, not yet live · Forms don’t send anything
      </p>
    </div>
  );
}
