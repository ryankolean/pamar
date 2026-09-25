/**
 * Site mode. Set SITE_MODE=preview for review deployments (e.g. the build shared with the
 * client before launch): shows a preview banner, blocks search engines, and form submissions
 * are accepted but not delivered anywhere.
 */
export function isPreviewMode(): boolean {
  return process.env.SITE_MODE === "preview";
}
