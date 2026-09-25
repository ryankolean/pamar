/**
 * next/image loader for the static export (next.config.ts, STATIC_EXPORT=1). There is no image
 * optimizer on GitHub Pages, so images are served as-is from the repository sub-path.
 */
export default function imageLoader({ src }: { src: string }): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return src.startsWith("/") ? `${basePath}${src}` : src;
}
